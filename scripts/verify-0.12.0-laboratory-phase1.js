const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { chromium } = require("playwright");

const root = path.resolve(__dirname, "..");
const userscriptPath = path.join(root, "src", "SwarmSim-Strategy-Autobuyer.user.js");
const definitionsPath = path.join(root, "docs", "test-data", "0.11.7-scenarios", "scenario-definitions.json");
const evidenceDir = path.join(root, "docs", "live-logs");
const testDataDir = path.join(root, "docs", "test-data", "0.12.0-laboratory");
const evidenceJsonPath = path.join(evidenceDir, "browser-test-0.12.0-laboratory-phase1.json");
const evidenceMdPath = path.join(evidenceDir, "browser-test-0.12.0-laboratory-phase1.md");
const exampleResultJsonPath = path.join(testDataDir, "example-result.json");
const exampleResultCsvPath = path.join(testDataDir, "example-result.csv");
const exampleResultMdPath = path.join(testDataDir, "example-result.md");

function ensureParentDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function stableClone(value) {
  return JSON.parse(JSON.stringify(value));
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

function sha256(text) {
  return `sha256:${crypto.createHash("sha256").update(String(text), "utf8").digest("hex")}`;
}

function readUserscript() {
  return fs.readFileSync(userscriptPath, "utf8");
}

function passFail(value) {
  return value ? "PASS" : "FAIL";
}

function decimalString(value) {
  return value === null || value === undefined ? null : String(value);
}

function makeFixtureSnapshot(baseSnapshot, overrides = {}) {
  const snapshot = stableClone(baseSnapshot);
  if (overrides.energyAmount !== undefined) snapshot.resources.energy.amount = String(overrides.energyAmount);
  if (overrides.energyPerSecond !== undefined) snapshot.resources.energy.perSecond = String(overrides.energyPerSecond);
  if (overrides.larvaeAmount !== undefined) snapshot.resources.larvae.amount = String(overrides.larvaeAmount);
  if (overrides.larvaePerSecond !== undefined) snapshot.resources.larvae.perSecond = String(overrides.larvaePerSecond);
  if (overrides.cocoonsAmount !== undefined) snapshot.resources.cocoons.amount = String(overrides.cocoonsAmount);
  if (overrides.cocoonsPerSecond !== undefined) snapshot.resources.cocoons.perSecond = String(overrides.cocoonsPerSecond);
  if (overrides.territoryAmount !== undefined) snapshot.resources.territory.amount = String(overrides.territoryAmount);
  if (overrides.territoryPerSecond !== undefined) snapshot.resources.territory.perSecond = String(overrides.territoryPerSecond);
  if (overrides.cloneAvailable !== undefined) snapshot.abilities.cloneLarvae.available = !!overrides.cloneAvailable;
  if (overrides.cloneEnergyCost !== undefined) snapshot.abilities.cloneLarvae.energyCost = String(overrides.cloneEnergyCost);
  if (overrides.cloneOutput !== undefined) snapshot.abilities.cloneLarvae.formulaInputs.sourceVerifiedOutput = String(overrides.cloneOutput);
  if (overrides.clonePreview !== undefined) snapshot.abilities.cloneLarvae.runtimePreviewOutput = overrides.clonePreview === null ? null : String(overrides.clonePreview);
  if (overrides.mirrorAvailable !== undefined) snapshot.abilities.houseOfMirrors.available = !!overrides.mirrorAvailable;
  if (overrides.mirrorEnergyCost !== undefined) snapshot.abilities.houseOfMirrors.energyCost = String(overrides.mirrorEnergyCost);
  if (overrides.mirrorPreview !== undefined) snapshot.abilities.houseOfMirrors.runtimePreviewTerritoryPerSecondAfter = overrides.mirrorPreview === null ? null : String(overrides.mirrorPreview);
  if (overrides.reserveRequired !== undefined) snapshot.safety.requiredReserve = String(overrides.reserveRequired);
  if (overrides.nextCost !== undefined) snapshot.expansion.nextCost = String(overrides.nextCost);
  if (overrides.hoMCounts) {
    for (const row of snapshot.army.houseOfMirrorsAffectedUnits) {
      if (Object.prototype.hasOwnProperty.call(overrides.hoMCounts, row.unitId)) {
        row.count = String(overrides.hoMCounts[row.unitId]);
      }
    }
  }
  if (overrides.hoMUnchangedTerritory !== undefined) snapshot.army.unaffectedTerritoryPerSecond = String(overrides.hoMUnchangedTerritory);
  snapshot.snapshotHash = sha256(stableJson({ snapshotId: snapshot.snapshotId, source: snapshot.source, resources: snapshot.resources, army: snapshot.army, expansion: snapshot.expansion, abilities: snapshot.abilities, safety: snapshot.safety, context: snapshot.context, formulaProvenance: snapshot.formulaProvenance }));
  return snapshot;
}

function collectRunMap(result) {
  const map = new Map();
  for (const run of result?.runs || []) {
    map.set(`${run.actionId}-${run.horizonSeconds}`, run);
  }
  return map;
}

function validateExperiment(result) {
  const errors = [];
  if (!result || typeof result !== "object") errors.push("missing result");
  if (result.schemaVersion !== "swarmsim-lab.result.v1") errors.push("unexpected result schemaVersion");
  if (result.kind !== "deterministic-simulation") errors.push("unexpected result kind");
  if (!Array.isArray(result.runs) || result.runs.length !== 6) errors.push("expected exactly six runs");
  const runMap = collectRunMap(result);
  for (const key of ["WAIT-60", "WAIT-300", "CLONE_LARVAE-60", "CLONE_LARVAE-300", "HOUSE_OF_MIRRORS-60", "HOUSE_OF_MIRRORS-300"]) {
    if (!runMap.has(key)) errors.push(`missing run ${key}`);
  }
  const wait60 = runMap.get("WAIT-60");
  const wait300 = runMap.get("WAIT-300");
  const clone60 = runMap.get("CLONE_LARVAE-60");
  const clone300 = runMap.get("CLONE_LARVAE-300");
  const hom60 = runMap.get("HOUSE_OF_MIRRORS-60");
  const hom300 = runMap.get("HOUSE_OF_MIRRORS-300");
  if (!wait60 || !wait300 || !clone60 || !clone300 || !hom60 || !hom300) return errors;
  if (wait60.metrics?.meatPerSecondAfter !== wait300.metrics?.meatPerSecondAfter) errors.push("WAIT meat/sec should be branch-invariant across horizons");
  if (clone60.metrics?.meatPerSecondAfter !== clone300.metrics?.meatPerSecondAfter) errors.push("Clone Larvae meat/sec should be branch-invariant across horizons");
  if (hom60.metrics?.meatPerSecondAfter !== hom300.metrics?.meatPerSecondAfter) errors.push("House of Mirrors meat/sec should be branch-invariant across horizons");
  if (clone60.comparisonVsWait?.energyAbsoluteDelta === null) errors.push("Clone comparison vs WAIT missing");
  if (hom60.comparisonVsWait?.territoryPerSecondPctDelta === null) errors.push("HoM comparison vs WAIT missing pct delta");
  return errors;
}

function writeText(filePath, text) {
  ensureParentDir(filePath);
  fs.writeFileSync(filePath, `${text}\n`);
}

async function main() {
  ensureParentDir(evidenceJsonPath);
  ensureParentDir(exampleResultJsonPath);
  const userscript = readUserscript();
  const definitions = JSON.parse(fs.readFileSync(definitionsPath, "utf8"));
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1365, height: 900 },
    locale: "en-US",
    timezoneId: "UTC",
    serviceWorkers: "block",
  });
  const page = await context.newPage();
  const consoleRows = [];
  page.on("console", (msg) => {
    const text = msg.text();
    if (/KBC|SwarmBot|Laboratory|error|warning/i.test(text)) consoleRows.push({ type: msg.type(), text });
  });

  await page.goto("https://www.swarmsim.com/#/tab/territory", { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.evaluate(() => {
    localStorage.clear();
    localStorage.setItem("kbcSwarmBotScenarioHarnessEnabled_v1", "true");
    localStorage.setItem("kbcSwarmBotLaboratoryEnabled_v1", "true");
  });
  await page.addScriptTag({ content: userscript });
  await page.waitForFunction(() => !!window.kbcSwarmBot?.laboratory, { timeout: 60000 });

  const result = await page.evaluate(async ({ definitions }) => {
    const bot = window.kbcSwarmBot;
    const game = window.angular.element(document.body).injector().get("game");
    function makeFixtureSnapshot(baseSnapshot, overrides = {}) {
      const snapshot = JSON.parse(JSON.stringify(baseSnapshot));
      if (overrides.energyAmount !== undefined) snapshot.resources.energy.amount = String(overrides.energyAmount);
      if (overrides.energyPerSecond !== undefined) snapshot.resources.energy.perSecond = String(overrides.energyPerSecond);
      if (overrides.larvaeAmount !== undefined) snapshot.resources.larvae.amount = String(overrides.larvaeAmount);
      if (overrides.larvaePerSecond !== undefined) snapshot.resources.larvae.perSecond = String(overrides.larvaePerSecond);
      if (overrides.cocoonsAmount !== undefined) snapshot.resources.cocoons.amount = String(overrides.cocoonsAmount);
      if (overrides.cocoonsPerSecond !== undefined) snapshot.resources.cocoons.perSecond = String(overrides.cocoonsPerSecond);
      if (overrides.territoryAmount !== undefined) snapshot.resources.territory.amount = String(overrides.territoryAmount);
      if (overrides.territoryPerSecond !== undefined) snapshot.resources.territory.perSecond = String(overrides.territoryPerSecond);
      if (overrides.cloneAvailable !== undefined) snapshot.abilities.cloneLarvae.available = !!overrides.cloneAvailable;
      if (overrides.cloneOutput !== undefined) snapshot.abilities.cloneLarvae.formulaInputs.sourceVerifiedOutput = String(overrides.cloneOutput);
      if (overrides.clonePreview !== undefined) snapshot.abilities.cloneLarvae.runtimePreviewOutput = overrides.clonePreview === null ? null : String(overrides.clonePreview);
      if (overrides.mirrorAvailable !== undefined) snapshot.abilities.houseOfMirrors.available = !!overrides.mirrorAvailable;
      if (overrides.mirrorPreview !== undefined) snapshot.abilities.houseOfMirrors.runtimePreviewTerritoryPerSecondAfter = overrides.mirrorPreview === null ? null : String(overrides.mirrorPreview);
      if (overrides.reserveRequired !== undefined) snapshot.safety.requiredReserve = String(overrides.reserveRequired);
      if (overrides.nextCost !== undefined) snapshot.expansion.nextCost = String(overrides.nextCost);
      if (overrides.hoMCounts) {
        for (const row of snapshot.army.houseOfMirrorsAffectedUnits) {
          if (Object.prototype.hasOwnProperty.call(overrides.hoMCounts, row.unitId)) {
            row.count = String(overrides.hoMCounts[row.unitId]);
          }
        }
      }
      if (overrides.hoMUnchangedTerritory !== undefined) snapshot.army.unaffectedTerritoryPerSecond = String(overrides.hoMUnchangedTerritory);
      return snapshot;
    }
    const snapshotOptions = {
      snapshotId: "LAB-001",
      scenario: {
        id: "LAB-001",
        description: "0.12.0 Laboratory Phase 1 browser verification",
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
      },
    };

    const before = {
      energy: String(game.unit("energy")?.count?.() || "0"),
      larva: String(game.unit("larva")?.count?.() || "0"),
      cocoon: String(game.unit("cocoon")?.count?.() || "0"),
      territory: String(game.unit("territory")?.count?.() || "0"),
      runHistoryLength: bot.getRunHistory().length,
      hasLaboratory: !!bot.laboratory,
      gateScenario: localStorage.getItem("kbcSwarmBotScenarioHarnessEnabled_v1"),
      gateLaboratory: localStorage.getItem("kbcSwarmBotLaboratoryEnabled_v1"),
    };

    const snapshotA = (await bot.laboratory.captureSnapshot(snapshotOptions)).snapshot;
    const snapshotB = (await bot.laboratory.captureSnapshot(snapshotOptions)).snapshot;
    const snapshotC = (await bot.laboratory.captureSnapshot({
      ...snapshotOptions,
      snapshotId: "LAB-002",
      scenario: { ...snapshotOptions.scenario, id: "LAB-002", overrides: { ...snapshotOptions.scenario.overrides, resourceCounts: { ...snapshotOptions.scenario.overrides.resourceCounts, energy: 500001 } } },
    })).snapshot;

    const runResult = await bot.laboratory.runPhase1Experiment(snapshotA, { experimentId: "LAB-001" });
    const jsonText = bot.laboratory.exportResultJson(runResult);
    const csvText = bot.laboratory.exportResultCsv(runResult);
    const mdText = bot.laboratory.exportResultMarkdown(runResult);
    const jsonRoundTrip = JSON.parse(jsonText);

    const snapshotAClone = JSON.parse(JSON.stringify(snapshotA));
    snapshotAClone.resources.energy.amount = "13000";
    snapshotAClone.snapshotHash = null;
    const safetyViolationRun = await bot.laboratory.runPhase1Experiment(snapshotAClone, { experimentId: "LAB-SAFETY" });

    const invalidActionRun = await bot.laboratory.runPhase1Experiment(snapshotA, {
      experimentId: "LAB-INVALID",
      actions: [{ schemaVersion: "swarmsim-lab.action.v1", actionId: "NOT_ALLOWED", requestedAtSeconds: "0", castCount: 1 }],
      horizonsSeconds: ["60"],
    });

    const waitRun60 = runResult.runs.find((run) => run.actionId === "WAIT" && run.horizonSeconds === "60");
    const waitRun300 = runResult.runs.find((run) => run.actionId === "WAIT" && run.horizonSeconds === "300");
    const cloneRun60 = runResult.runs.find((run) => run.actionId === "CLONE_LARVAE" && run.horizonSeconds === "60");
    const cloneRun300 = runResult.runs.find((run) => run.actionId === "CLONE_LARVAE" && run.horizonSeconds === "300");
    const homRun60 = runResult.runs.find((run) => run.actionId === "HOUSE_OF_MIRRORS" && run.horizonSeconds === "60");
    const homRun300 = runResult.runs.find((run) => run.actionId === "HOUSE_OF_MIRRORS" && run.horizonSeconds === "300");

    const fixtureSnapshots = {
      cloneBankLimited: makeFixtureSnapshot(snapshotA, {
        cloneOutput: snapshotA.abilities.cloneLarvae.formulaInputs.combinedBank,
        clonePreview: snapshotA.abilities.cloneLarvae.formulaInputs.combinedBank,
      }),
      cloneCapLimited: makeFixtureSnapshot(snapshotA, {
        cloneOutput: "12345678900",
        clonePreview: "12345678900",
      }),
      hoMRelevantArmy: makeFixtureSnapshot(snapshotA, {
        hoMCounts: {
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
        hoMUnchangedTerritory: "0",
      }),
      safetyViolation: makeFixtureSnapshot(snapshotA, {
        energyAmount: 13000,
        reserveRequired: 375,
      }),
      invalidAbility: makeFixtureSnapshot(snapshotA, {
        cloneAvailable: false,
      }),
    };

    const fixtureResults = {
      cloneBankLimited: await bot.laboratory.runPhase1Experiment(fixtureSnapshots.cloneBankLimited, { experimentId: "FIXTURE-A" }),
      cloneCapLimited: await bot.laboratory.runPhase1Experiment(fixtureSnapshots.cloneCapLimited, { experimentId: "FIXTURE-B" }),
      hoMRelevantArmy: await bot.laboratory.runPhase1Experiment(fixtureSnapshots.hoMRelevantArmy, { experimentId: "FIXTURE-C" }),
      safetyViolation: await bot.laboratory.runPhase1Experiment(fixtureSnapshots.safetyViolation, { experimentId: "FIXTURE-D" }),
      invalidAbility: await bot.laboratory.runPhase1Experiment(fixtureSnapshots.invalidAbility, { experimentId: "FIXTURE-E" }),
    };

    const after = {
      energy: String(game.unit("energy")?.count?.() || "0"),
      larva: String(game.unit("larva")?.count?.() || "0"),
      cocoon: String(game.unit("cocoon")?.count?.() || "0"),
      territory: String(game.unit("territory")?.count?.() || "0"),
      runHistoryLength: bot.getRunHistory().length,
      hasLaboratory: !!bot.laboratory,
    };

    const validation = bot.laboratory.validateSnapshot(snapshotA);
    const experimentValidation = JSON.parse(jsonText).runs.length === 6;
    return {
      before,
      after,
      snapshotA,
      snapshotB,
      snapshotC,
      snapshotValidation: validation,
      runResult,
      resultHash: `sha256:${await crypto.subtle.digest("SHA-256", new TextEncoder().encode(JSON.stringify(runResult))).then((hash) => Array.from(new Uint8Array(hash)).map((byte) => byte.toString(16).padStart(2, "0")).join(""))}`,
      jsonText,
      csvText,
      mdText,
      jsonRoundTrip,
      safetyViolationRun,
      invalidAbilityRun: invalidActionRun,
      fixtureResults,
      runtimeDefaults: {
        autoCastAbilities: bot.config.autoCastAbilities,
        autoAscend: bot.config.autoAscend,
        energySupportBrokerAllowAutoCast: bot.config.energySupportBrokerAllowAutoCast,
      },
      regression: bot.scenarioHarness.run({ scenarios: definitions.scenarios }),
      experimentValidation,
      meta: {
        scriptVersion: bot.scriptVersion,
        autobuyerVersion: bot.autobuyerVersion,
        scenarioReportVersion: bot.scenarioReportVersion,
      },
      compareWait60To300Independent: waitRun60?.metrics?.meatPerSecondAfter === waitRun300?.metrics?.meatPerSecondAfter,
      runCount: runResult.runs.length,
      runMap: {
        wait60: waitRun60,
        wait300: waitRun300,
        clone60: cloneRun60,
        clone300: cloneRun300,
        hom60: homRun60,
        hom300: homRun300,
      },
      exportRoundTrips: {
        jsonValid: JSON.stringify(jsonRoundTrip).length > 0,
        csvHasHeader: csvText.startsWith("snapshot_id,snapshot_hash,experiment_id"),
        markdownHasNoGlobalRecommendation: !/best overall|recommended action|optimal strategy/i.test(mdText),
      },
      nonMutation: {
        resourcesUnchanged: before.energy === after.energy && before.larva === after.larva && before.cocoon === after.cocoon && before.territory === after.territory,
        runHistoryUnchanged: before.runHistoryLength === after.runHistoryLength,
      },
      hashes: {
        snapshotA: snapshotA.snapshotHash,
        snapshotB: snapshotB.snapshotHash,
        snapshotC: snapshotC.snapshotHash,
        experiment: runResult.experimentHash,
      },
    };
  }, { definitions });

  await context.close();
  await browser.close();

  const errors = validateExperiment(result.runResult);
  if (!result.snapshotValidation?.ok) errors.push(...(result.snapshotValidation?.errors || []).map((message) => `snapshot: ${message}`));
  if (!result.runCount || result.runCount !== 6) errors.push(`expected six runs, got ${result.runCount}`);
  if (!result.compareWait60To300Independent) errors.push("WAIT 60/300 appears dependent");
  if (!result.exportRoundTrips.jsonValid) errors.push("JSON export did not round-trip");
  if (!result.exportRoundTrips.csvHasHeader) errors.push("CSV export missing header");
  if (!result.exportRoundTrips.markdownHasNoGlobalRecommendation) errors.push("Markdown export includes global recommendation language");
  if (!result.nonMutation.resourcesUnchanged) errors.push("live resources changed");
  if (!result.nonMutation.runHistoryUnchanged) errors.push("run history changed");
  if (!result.runtimeDefaults || result.runtimeDefaults.autoCastAbilities !== false || result.runtimeDefaults.autoAscend !== false || result.runtimeDefaults.energySupportBrokerAllowAutoCast !== false) {
    errors.push("safety defaults changed");
  }

  const verdict = errors.length ? "0.12.0 LABORATORY PHASE 1 REQUIRES PATCH" : "0.12.0 LABORATORY PHASE 1 VERIFIED";
  const evidence = {
    verdict,
    branch: "main",
    mainSha: process.env.GIT_COMMIT || null,
    scriptHash: sha256(readUserscript()),
    snapshotHash: result.snapshotA.snapshotHash,
    experimentHash: result.runResult.experimentHash,
    meta: result.meta,
    hashes: result.hashes,
    before: result.before,
    after: result.after,
    runCount: result.runCount,
    runResult: result.runResult,
    runMap: result.runMap,
    fixtureResults: result.fixtureResults,
    snapshotValidation: result.snapshotValidation,
    nonMutation: result.nonMutation,
    runtimeDefaults: result.runtimeDefaults,
    regression: result.regression,
    exportRoundTrips: result.exportRoundTrips,
    errors,
    warnings: [
      ...(result.snapshotA.formulaProvenance?.warnings || []),
      ...(result.runResult.warnings || []),
    ],
    commands: [
      "npm run build",
      "npm run verify",
    ],
  };

  ensureParentDir(evidenceJsonPath);
  ensureParentDir(exampleResultJsonPath);
  writeText(evidenceJsonPath, JSON.stringify(evidence, null, 2));
  writeText(evidenceMdPath, [
    "# SwarmSim Laboratory Phase 1 Browser Verification",
    "",
    `- Verdict: \`${verdict}\``,
    `- Snapshot hash: \`${evidence.snapshotHash}\``,
    `- Experiment hash: \`${evidence.experimentHash}\``,
    `- Main SHA: \`${evidence.mainSha || "unknown"}\``,
    `- Script hash: \`${evidence.scriptHash}\``,
    `- Runs: ${result.runCount}`,
    "",
    "## Non-Mutation",
    "",
    `- Resources unchanged: ${passFail(result.nonMutation.resourcesUnchanged)}`,
    `- Run history unchanged: ${passFail(result.nonMutation.runHistoryUnchanged)}`,
    "",
    "## Regression",
    "",
    `- Scenarios: ${result.regression?.scenarios?.length || 0}`,
    `- Cycles: ${result.regression?.scenarios?.reduce((sum, row) => sum + (row.cycles?.length || 0), 0) || 0}`,
    `- Invariants: ${result.regression?.scenarios?.flatMap((row) => row.cycles || []).flatMap((cycle) => cycle.invariants || []).length || 0}`,
    `- Failed invariants: ${result.regression?.scenarios?.flatMap((row) => row.cycles || []).flatMap((cycle) => cycle.invariants || []).filter((row) => !row.pass).length || 0}`,
    "",
    "## Warnings",
    "",
    ...(evidence.warnings.length ? evidence.warnings.map((warning) => `- ${warning}`) : ["- none"]),
    "",
  ].join("\n"));
  writeText(exampleResultJsonPath, JSON.stringify(result.runResult, null, 2));
  writeText(exampleResultCsvPath, result.csvText);
  writeText(exampleResultMdPath, result.mdText);

  console.log(JSON.stringify({
    verdict,
    errors,
    evidenceJsonPath,
    evidenceMdPath,
    exampleResultJsonPath,
    exampleResultCsvPath,
    exampleResultMdPath,
    hashes: evidence.hashes,
    runCount: result.runCount,
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

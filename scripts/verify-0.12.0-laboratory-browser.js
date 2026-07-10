const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const { chromium } = require("playwright");

const root = path.resolve(__dirname, "..");
const implementationCommit = "366617602f1e25087378d630490cb96df8b25f71";
const branch = "feature/0.12.0-laboratory-snapshot-foundation";
const evidenceDir = path.join(root, "docs", "live-logs");
const testDataDir = path.join(root, "docs", "test-data", "0.12.0-laboratory");
const jsonPath = path.join(evidenceDir, "browser-test-0.12.0-laboratory-snapshot.json");
const mdPath = path.join(evidenceDir, "browser-test-0.12.0-laboratory-snapshot.md");
const examplePath = path.join(testDataDir, "example-snapshot.json");

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

async function main() {
  fs.mkdirSync(evidenceDir, { recursive: true });
  fs.mkdirSync(testDataDir, { recursive: true });

  const userscript = gitShow("src/SwarmSim-Strategy-Autobuyer.user.js");
  const definitions = JSON.parse(gitShow("docs/test-data/0.11.7-scenarios/scenario-definitions.json"));

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

  fs.writeFileSync(jsonPath, `${JSON.stringify(result, null, 2)}\n`);
  fs.writeFileSync(examplePath, `${JSON.stringify(result.snapshotA, null, 2)}\n`);

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
  fs.writeFileSync(mdPath, md);

  console.log(JSON.stringify({
    verdict: result.verdict,
    hashA: result.hashA,
    hashB: result.hashB,
    hashC: result.hashC,
    regression: result.regression,
    jsonPath,
    mdPath,
    examplePath,
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

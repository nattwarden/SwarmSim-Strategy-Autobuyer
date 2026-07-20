const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { getBrowser } = require("./lib/browser-harness");

const root = path.resolve(__dirname, "..");
const userscriptPath = path.join(root, "src", "SwarmSim-Strategy-Autobuyer.user.js");
const definitionsPath = path.join(root, "docs", "test-data", "0.11.7-scenarios", "scenario-definitions.json");

const evidenceDir = path.join(root, "docs", "live-logs");
const testDataDir = path.join(root, "docs", "test-data", "0.12.3-laboratory");

const evidenceJsonPath = path.join(evidenceDir, "browser-test-0.12.3-laboratory-effective-count.json");
const evidenceMdPath = path.join(evidenceDir, "browser-test-0.12.3-laboratory-effective-count.md");
const exampleLiveResultJsonPath = path.join(testDataDir, "example-live-result.json");
const exampleLiveResultCsvPath = path.join(testDataDir, "example-live-result.csv");
const exampleLiveResultMdPath = path.join(testDataDir, "example-live-result.md");
const exampleCopySummaryPath = path.join(testDataDir, "example-copy-summary.txt");
const diagnosticsPath = path.join(testDataDir, "effective-count-diagnostics.json");
const args = new Set(process.argv.slice(2));
const writeEvidence = args.has("--write-evidence");

for (const arg of args) {
  if (!["--check", "--write-evidence"].includes(arg)) {
    throw new Error(`Unknown argument: ${arg}`);
  }
}
if (args.has("--check") && writeEvidence) {
  throw new Error("Choose either --check or --write-evidence, not both.");
}

const HOM_IDS = ["swarmling", "stinger", "spider", "mosquito", "locust", "roach", "giantspider", "centipede", "wasp", "devourer", "goon"];

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

function assertCondition(errors, condition, message) {
  if (!condition) errors.push(message);
}

function countCsvRows(csvText) {
  return String(csvText || "")
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0)
    .slice(1)
    .length;
}

function summarizeRegression(report) {
  const scenarios = Array.isArray(report?.scenarios) ? report.scenarios : [];
  let cycleCount = 0;
  let invariantCount = 0;
  let failedInvariantCount = 0;
  let setupErrorCount = 0;

  for (const scenarioRow of scenarios) {
    if (scenarioRow?.setupError) setupErrorCount += 1;
    const cycles = Array.isArray(scenarioRow?.cycles) ? scenarioRow.cycles : [];
    cycleCount += cycles.length;
    for (const cycleRow of cycles) {
      const invariants = Array.isArray(cycleRow?.invariants) ? cycleRow.invariants : [];
      invariantCount += invariants.length;
      for (const invariant of invariants) {
        if (!invariant?.pass) failedInvariantCount += 1;
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
  };
}

async function launchLabPage(browser) {
  const context = await browser.newContext({
    viewport: { width: 1365, height: 900 },
    locale: "en-US",
    timezoneId: "UTC",
    serviceWorkers: "block",
  });
  await context.grantPermissions(["clipboard-read", "clipboard-write"], { origin: "https://www.swarmsim.com" });
  const page = await context.newPage();
  await page.goto("https://www.swarmsim.com/#/tab/territory", { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.evaluate(() => {
    localStorage.clear();
    localStorage.setItem("kbcSwarmBotLaboratoryEnabled_v1", "true");
    localStorage.setItem("kbcSwarmBotLaboratoryLiveEnabled_v1", "true");
    localStorage.setItem("kbcSwarmBotScenarioHarnessEnabled_v1", "true");
  });
  await page.addScriptTag({ content: readUserscript() });
  await page.waitForFunction(() => !!window.kbcSwarmBot?.laboratory, { timeout: 60000 });
  return { context, page };
}

async function closePage(handle) {
  if (!handle) return;
  try { await handle.page.close(); } catch {}
  try { await handle.context.close(); } catch {}
}

async function getLiveState(page) {
  return page.evaluate(() => {
    const game = window.angular.element(document.body).injector().get("game");
    const bot = window.kbcSwarmBot;
    return {
      runHistoryLength: bot.getRunHistory().length,
      energy: String(game.unit("energy")?.count?.() || "0"),
      larva: String(game.unit("larva")?.count?.() || "0"),
      territory: String(game.unit("territory")?.count?.() || "0"),
    };
  });
}

async function applyFixture(page, fixture) {
  return page.evaluate((fixtureState) => {
      const HOM_UNIT_IDS = ["swarmling", "stinger", "spider", "mosquito", "locust", "roach", "giantspider", "centipede", "wasp", "devourer", "goon"];
    const game = window.angular.element(document.body).injector().get("game");
    const bot = window.kbcSwarmBot;
    const DecimalCtor = window.Decimal;

    const normalize = (value) => String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
    const makeDecimal = (value) => new DecimalCtor(value);
    const originalUnit = typeof game.unit === "function" ? game.unit.bind(game) : null;
    const originalUnitList = typeof game.unitlist === "function" ? game.unitlist.bind(game) : null;
    const patch = (obj, key, value) => {
      if (!obj) return;
      Object.defineProperty(obj, key, { configurable: true, writable: true, value });
    };

    const configuredCounts = Object.entries(fixtureState.unitCounts || {}).reduce((acc, [key, value]) => {
      acc[normalize(key)] = value;
      return acc;
    }, {});
    const configuredRates = Object.entries(fixtureState.passiveRates || {}).reduce((acc, [key, value]) => {
      acc[normalize(key)] = value;
      return acc;
    }, {});

    const startMs = Date.now();

    const keysForUnit = (unit) => {
      const name = normalize(unit?.name || "");
      const display = normalize(unit?.displayName || unit?.plural || unit?.name || "");
      const suffix = normalize(unit?.suffix || "");
      const keys = new Set();
      if (name) keys.add(name);
      if (display) keys.add(display);
      if (name && suffix) keys.add(`${name} ${suffix}`);
      if (display && suffix) keys.add(`${display} ${suffix}`);
      if (name === "spider") keys.add("arachnomorph");
      if (name === "mosquito") keys.add("culicimorph");
      return Array.from(keys);
    };

    const resolveUnit = (name) => {
      const key = normalize(name);
      if (!key) return null;
      const list = originalUnitList ? originalUnitList() : [];
      return list.find((unit) => keysForUnit(unit).includes(key)) || (originalUnit ? originalUnit(name) : null) || null;
    };

    const applyToUnit = (unit, requestedName) => {
      if (!unit) return null;
      const keys = [normalize(requestedName), ...keysForUnit(unit)].filter(Boolean);
      const countKey = keys.find((key) => Object.prototype.hasOwnProperty.call(configuredCounts, key));
      const rateKey = keys.find((key) => Object.prototype.hasOwnProperty.call(configuredRates, key));
      if (!countKey && !rateKey) return unit;

      const base = countKey ? makeDecimal(configuredCounts[countKey]) : makeDecimal(unit.count?.() || 0);
      const rate = rateKey
        ? makeDecimal(configuredRates[rateKey])
        : (countKey ? makeDecimal(0) : makeDecimal(typeof unit.velocity === "function" ? unit.velocity() : 0));

      patch(unit, "count", () => {
        if (rate.eq(0)) return base;
        const elapsedSeconds = new DecimalCtor(Date.now() - startMs).dividedBy(1000);
        return base.plus(rate.times(elapsedSeconds));
      });
      patch(unit, "isVisible", () => true);

      if (normalize(unit?.name || "") === "energy") {
        const capValue = fixtureState.energyCap || "1e30";
        patch(unit, "capValue", () => makeDecimal(capValue));
      }
      return unit;
    };

    patch(game, "unit", (name) => applyToUnit(resolveUnit(name), name));
    patch(game, "unitlist", () => (originalUnitList ? originalUnitList() : []).map((unit) => applyToUnit(unit, unit?.name || "")));

    for (const [name, value] of Object.entries(fixtureState.upgradeCounts || {})) {
      const upgrade = game.upgrade(name);
      if (!upgrade) continue;
      patch(upgrade, "count", () => makeDecimal(value));
      patch(upgrade, "isVisible", () => true);
    }

    bot.config.autoCastAbilities = false;
    bot.config.autoAscend = false;
    bot.config.energySupportBrokerAllowAutoCast = false;
    bot.config.enabled = false;
    bot.config.autoBuySafeDecisions = false;
    bot.config.postNexusEnergyReserveSeconds = Number(fixtureState.postNexusEnergyReserveSeconds || 30);

    const verified = HOM_UNIT_IDS.map((name) => {
      const unit = game.unit(name);
      return {
        unitId: name,
        count: String(unit?.count?.() || "0"),
      };
    });

    return {
      ok: true,
      verified,
      verifiedPositiveAffectedUnitCount: verified.filter((row) => Number(row.count) > 0).length,
    };
  }, fixture);
}

async function captureLive(page, options = {}) {
  return page.evaluate(async (opts) => window.kbcSwarmBot.laboratory.captureLiveSnapshot(opts), options);
}

async function runLive(page, options = {}) {
  return page.evaluate(async (opts) => window.kbcSwarmBot.laboratory.runLivePhase1(opts), options);
}

async function captureAndRunLive(page, options = {}) {
  return page.evaluate(async (opts) => window.kbcSwarmBot.laboratory.captureAndRunLivePhase1(opts), options);
}

function runByAction(result, actionId, horizon) {
  return (result?.experiment?.runs || []).find((run) => run.actionId === actionId && String(run.horizonSeconds) === String(horizon)) || null;
}

async function decimalChecks(page, snapshot) {
  return page.evaluate((snap) => {
    const DecimalCtor = window.Decimal;
    const toDec = (value) => new DecimalCtor(value || 0);
    const affected = toDec(snap?.army?.affectedTerritoryPerSecondTotal);
    const unaffected = toDec(snap?.army?.unaffectedTerritoryPerSecond);
    const runtime = toDec(snap?.resources?.territory?.perSecond);
    const parity = affected.plus(unaffected).eq(runtime);
    return {
      parity,
      affectedPositive: affected.gt(0),
      affected: affected.toString(),
      unaffected: unaffected.toString(),
      runtime: runtime.toString(),
    };
  }, snapshot);
}

async function exportLive(page, result) {
  return page.evaluate(async (liveResult) => {
    const bot = window.kbcSwarmBot;
    const clone60 = (liveResult?.experiment?.runs || []).find((run) => run.actionId === "CLONE_LARVAE" && String(run.horizonSeconds) === "60");
    const hom60 = (liveResult?.experiment?.runs || []).find((run) => run.actionId === "HOUSE_OF_MIRRORS" && String(run.horizonSeconds) === "60");
    const copySummary = [
      "Script version: " + bot.scriptVersion,
      "Capture mode: " + (liveResult?.captureMode || "live-read-only"),
      "Snapshot validity: " + (liveResult?.snapshot?.validity?.status || "unknown"),
      "Clone Larvae legal/status: " + (clone60?.actionLegal ? "legal" : "illegal") + " / " + (clone60?.status || "unknown"),
      "House of Mirrors legal/status: " + (hom60?.actionLegal ? "legal" : "illegal") + " / " + (hom60?.status || "unknown"),
      "60s: " + (liveResult?.experiment?.runs?.filter((run) => String(run.horizonSeconds) === "60").map((run) => `${run.actionId}:${run.status}`).join(" | ") || ""),
      "300s: " + (liveResult?.experiment?.runs?.filter((run) => String(run.horizonSeconds) === "300").map((run) => `${run.actionId}:${run.status}`).join(" | ") || ""),
      "Snapshot hash: " + (liveResult?.snapshotHash || ""),
      "Experiment hash: " + (liveResult?.experimentHash || ""),
      "Non-mutation proof: " + JSON.stringify(liveResult?.liveStateVerification || {}, null, 2),
    ].join("\n");

    await navigator.clipboard.writeText(copySummary);

    return {
      jsonText: bot.laboratory.exportLiveResultJson(liveResult),
      csvText: bot.laboratory.exportLiveResultCsv(liveResult),
      markdownText: bot.laboratory.exportLiveResultMarkdown(liveResult),
      copySummary,
    };
  }, result);
}

async function runRegression(page, definitions, order) {
  return page.evaluate(({ scenarioDefs, orderMode }) => {
    const bot = window.kbcSwarmBot;
    bot.scenarioHarness.enable();
    const ordered = orderMode === "reverse" ? [...scenarioDefs].reverse() : scenarioDefs;
    return bot.scenarioHarness.run({ scenarios: ordered });
  }, { scenarioDefs: definitions.scenarios, orderMode: order });
}

async function main() {
  if (writeEvidence) {
    ensureParentDir(evidenceJsonPath);
    ensureParentDir(exampleLiveResultJsonPath);
  }

  const errors = [];
  const userscript = readUserscript();
  const definitions = JSON.parse(fs.readFileSync(definitionsPath, "utf8"));

  assertCondition(errors, !userscript.includes("buildMeaningfulLiveFixtureSnapshot"), "Verifier architecture still references post-capture synthetic army rewrite helper.");

  const browser = await getBrowser({ headless: true });
  const lab = await launchLabPage(browser);

  const highFixture = {
    postNexusEnergyReserveSeconds: 30,
    energyCap: "1e30",
    unitCounts: {
      energy: "20000",
      larva: "1e12",
      cocoon: "1000",
      territory: "1e12",
      nexus: "5",
      moth: "1200",
      swarmling: "101000000000000000000000000",
      stinger: "205000000000000000",
      spider: "65400000000000000",
      mosquito: "118000000000000",
      locust: "255000000000",
      roach: "25100000000",
      giantspider: "7160000000000",
      centipede: "844000000000",
      wasp: "633000000000",
      devourer: "4930000000000",
      goon: "716000000000",
    },
    passiveRates: {
      energy: "1.7605363984674329502",
    },
    upgradeCounts: {
      expansion: "1",
      hatchery: "1",
      clonelarvae: "1",
      clonearmy: "1",
      swarmwarp: "1",
      nexus2: "1",
      nexus3: "1",
      nexus4: "1",
      nexus5: "1",
    },
  };

  const lowFixture = {
    ...highFixture,
    unitCounts: {
      ...highFixture.unitCounts,
      energy: "1000",
    },
  };

  const before = await getLiveState(lab.page);
  const baselineLive = await captureAndRunLive(lab.page, { snapshotId: "LIVE-0.12.3-BASELINE", experimentId: "LIVE-0.12.3-BASELINE-P1" });
  const fixturePatch = await applyFixture(lab.page, highFixture);
  const highCapture = await captureLive(lab.page, { snapshotId: "LIVE-0.12.3-HIGH" });
  const highRun = await runLive(lab.page, { snapshot: highCapture.snapshot, experimentId: "LIVE-0.12.3-HIGH-P1" });
  const after = await getLiveState(lab.page);

  const highSnapshot = highCapture.snapshot;
  const highResult = highRun.result;
  const rows = highSnapshot?.army?.houseOfMirrorsAffectedUnits || [];
  const unitIds = rows.map((row) => row.unitId);
  const uniqueIds = Array.from(new Set(unitIds));
  const positiveCountRows = rows.filter((row) => Number(row.count || 0) > 0);
  const parity = await decimalChecks(lab.page, highSnapshot);

  assertCondition(errors, highCapture?.ok === true, "captureLiveSnapshot failed for high-energy fixture.");
  assertCondition(errors, highRun?.ok === true, "runLivePhase1 failed for high-energy fixture.");
  assertCondition(errors, Array.isArray(rows) && rows.length === 11, `Expected exactly eleven canonical HoM rows, got ${rows.length}.`);
  assertCondition(errors, uniqueIds.length === 11, "HoM row set contains duplicate or missing unit ids.");
  assertCondition(errors, HOM_IDS.every((id) => uniqueIds.includes(id)), "HoM row set is not canonical eleven base ids.");
  assertCondition(errors, unitIds.every((id) => !String(id).startsWith("unit ")), "Fixture contains deprecated unit-prefixed ids.");
  assertCondition(errors, !unitIds.includes("territory"), "territory must never appear as HoM-affected row.");
  assertCondition(errors, positiveCountRows.length >= 3, "Expected at least three positive captured affected counts.");
  assertCondition(errors, parity.affectedPositive === true, "Affected territory/sec must be positive.");
  assertCondition(errors, parity.parity === true, "Affected/unaffected territory split does not match runtime total.");
  assertCondition(errors, Array.isArray(highSnapshot?.army?.effectiveCountDiagnostics), "effectiveCountDiagnostics missing from snapshot.");
  assertCondition(errors, (highSnapshot?.army?.effectiveCountDiagnostics || []).every((item) => item.countSource !== "ambiguous-zero-rejected"), "Capture contains ambiguous-zero resolver output in positive fixture.");

  const wait60 = runByAction(highResult, "WAIT", 60);
  const hom60 = runByAction(highResult, "HOUSE_OF_MIRRORS", 60);
  const wait300 = runByAction(highResult, "WAIT", 300);
  const hom300 = runByAction(highResult, "HOUSE_OF_MIRRORS", 300);

  assertCondition(errors, !!wait60 && !!hom60 && !!wait300 && !!hom300, "Missing WAIT/HoM runs for both horizons.");
  assertCondition(errors, hom60?.actionLegal === true && hom60?.actionApplied === true, "House of Mirrors should be legal and applied in high-energy fixture.");
  assertCondition(errors, hom300?.actionLegal === true && hom300?.actionApplied === true, "House of Mirrors should be legal and applied at 300s.");
  assertCondition(errors, String(hom60?.comparisonVsWait?.energyAbsoluteDelta || "") === "-2500", "HoM energy delta vs WAIT must be exactly -2500.");
  assertCondition(errors, String(hom300?.comparisonVsWait?.energyAbsoluteDelta || "") === "-2500", "HoM 300s energy delta vs WAIT must be exactly -2500.");
  assertCondition(errors, Number(hom60?.comparisonVsWait?.territoryPerSecondAbsoluteDelta || 0) > 0, "Legal HoM must produce positive 60s territory/sec delta.");
  assertCondition(errors, String(hom60?.comparisonVsWait?.territoryPerSecondAbsoluteDelta || "") === String(hom300?.comparisonVsWait?.territoryPerSecondAbsoluteDelta || ""), "HoM territory/sec delta must match across 60s and 300s.");
  assertCondition(errors, String(hom60?.comparisonVsWait?.territoryPerSecondAbsoluteDelta || "") === String(highSnapshot?.army?.affectedTerritoryPerSecondTotal || ""), "For integer fixture counts, HoM delta must equal affected production before action.");
  assertCondition(errors, String(highSnapshot?.abilities?.houseOfMirrors?.energyCost || "") === "2500", "House of Mirrors energy cost must be exactly 2500.");
  assertCondition(errors, highSnapshot?.abilities?.houseOfMirrors?.available === true, "House of Mirrors should be available in high-energy fixture.");
  assertCondition(errors, highSnapshot?.abilities?.houseOfMirrors?.unavailableReason === null, "Legal HoM must not retain stale unavailable reason text.");
  assertCondition(errors, highSnapshot?.abilities?.houseOfMirrors?.unavailableReasonCode === null || highSnapshot?.abilities?.houseOfMirrors?.unavailableReasonCode === "NONE", "Legal HoM reason code must be null/NONE.");
  assertCondition(errors, highSnapshot?.abilities?.cloneLarvae?.available === true, "Clone Larvae should be available in high-energy fixture.");
  assertCondition(errors, highSnapshot?.abilities?.cloneLarvae?.unavailableReason === null, "Legal Clone Larvae must not retain stale unavailable reason text.");
  assertCondition(errors, highSnapshot?.abilities?.cloneLarvae?.unavailableReasonCode === null || highSnapshot?.abilities?.cloneLarvae?.unavailableReasonCode === "NONE", "Legal Clone Larvae reason code must be null/NONE.");

  const fixturePatchLow = await applyFixture(lab.page, lowFixture);
  const lowCaptureAndRun = await captureAndRunLive(lab.page, { snapshotId: "LIVE-0.12.3-LOW", experimentId: "LIVE-0.12.3-LOW-P1" });
  const lowSnapshot = lowCaptureAndRun?.snapshot || null;
  const lowResult = lowCaptureAndRun?.result || null;
  const lowClone60 = runByAction(lowResult, "CLONE_LARVAE", 60);
  const lowHom60 = runByAction(lowResult, "HOUSE_OF_MIRRORS", 60);

  assertCondition(errors, lowCaptureAndRun?.ok === true, "captureAndRunLivePhase1 failed for low-energy fixture.");
  assertCondition(errors, lowClone60?.status === "invalid-action", "Low-energy Clone Larvae must be invalid-action.");
  assertCondition(errors, lowHom60?.status === "invalid-action", "Low-energy HoM must be invalid-action.");
  assertCondition(errors, lowClone60?.immediate?.invalidReasonCode === "INSUFFICIENT_ENERGY", "Clone low-energy reason code must be INSUFFICIENT_ENERGY.");
  assertCondition(errors, lowHom60?.immediate?.invalidReasonCode === "INSUFFICIENT_ENERGY", "HoM low-energy reason code must be INSUFFICIENT_ENERGY.");
  assertCondition(errors, String(lowClone60?.immediate?.invalidReason || "").includes("cost 12000"), "Clone low-energy reason text must include cost 12000.");
  assertCondition(errors, String(lowHom60?.immediate?.invalidReason || "").includes("cost 2500"), "HoM low-energy reason text must include cost 2500.");
  assertCondition(errors, String(lowSnapshot?.abilities?.cloneLarvae?.unavailableReasonCode || "") === "INSUFFICIENT_ENERGY", "Snapshot Clone reason code must propagate as INSUFFICIENT_ENERGY.");
  assertCondition(errors, String(lowSnapshot?.abilities?.houseOfMirrors?.unavailableReasonCode || "") === "INSUFFICIENT_ENERGY", "Snapshot HoM reason code must propagate as INSUFFICIENT_ENERGY.");

  const lowExports = await exportLive(lab.page, lowResult);
  assertCondition(errors, !/UNKNOWN/i.test(lowExports.markdownText), "Blocked ability exports still contain UNKNOWN reason fallback.");
  assertCondition(errors, /INSUFFICIENT_ENERGY/i.test(lowExports.markdownText), "Blocked ability exports must include INSUFFICIENT_ENERGY reason.");
  assertCondition(errors, /INSUFFICIENT_ENERGY/i.test(lowExports.csvText), "CSV export must include INSUFFICIENT_ENERGY reason.");

  const highRun2 = await runLive(lab.page, { snapshot: highCapture.snapshot, experimentId: "LIVE-0.12.3-HIGH-P1" });
  const changedFixture = {
    ...highFixture,
    unitCounts: {
      ...highFixture.unitCounts,
      energy: "20001",
    },
  };
  await applyFixture(lab.page, changedFixture);
  const changedCapture = await captureLive(lab.page, { snapshotId: "LIVE-0.12.3-HIGH-CHANGED" });

  assertCondition(errors, String(highRun.result?.experimentHash || "") === String(highRun2.result?.experimentHash || ""), "Experiment hash should be stable for identical inputs.");

  const stability = await lab.page.evaluate(async () => {
    const bot = window.kbcSwarmBot;
    const baseOptions = {
      snapshotId: "HASH-STABLE",
      scenario: {
        id: "HASH-STABLE",
        source: "deterministic-scenario",
        overrides: {
          resourceCounts: {
            energy: 25000,
            larva: 1000000,
            cocoon: 100,
            territory: 100000,
            nexus: 5,
          },
          resourceVelocities: {
            energy: 0,
            larva: 0,
            cocoon: 0,
            territory: 0,
          },
          unitCounts: {
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
        },
      },
    };

    const a = (await bot.laboratory.captureSnapshot(baseOptions)).snapshot;
    const b = (await bot.laboratory.captureSnapshot(baseOptions)).snapshot;
    const runA = await bot.laboratory.runPhase1Experiment(a, { experimentId: "HASH-STABLE-P1" });
    const runB = await bot.laboratory.runPhase1Experiment(a, { experimentId: "HASH-STABLE-P1" });
    const c = (await bot.laboratory.captureSnapshot({
      ...baseOptions,
      scenario: {
        ...baseOptions.scenario,
        id: "HASH-CHANGED",
        overrides: {
          ...baseOptions.scenario.overrides,
          resourceCounts: {
            ...baseOptions.scenario.overrides.resourceCounts,
            energy: 25001,
          },
        },
      },
      snapshotId: "HASH-CHANGED",
    })).snapshot;

    return {
      snapshotA: a?.snapshotHash || null,
      snapshotB: b?.snapshotHash || null,
      snapshotC: c?.snapshotHash || null,
      experimentA: runA?.experimentHash || null,
      experimentB: runB?.experimentHash || null,
    };
  });

  assertCondition(errors, String(stability.snapshotA || "") === String(stability.snapshotB || ""), "Snapshot hash should be stable for identical inputs.");
  assertCondition(errors, String(stability.experimentA || "") === String(stability.experimentB || ""), "Experiment hash should be stable for identical inputs.");
  assertCondition(errors, String(stability.snapshotC || "") !== String(stability.snapshotA || ""), "Snapshot hash must change for meaningful input change.");

  const normalRegression = await runRegression(lab.page, definitions, "normal");
  const reverseRegression = await runRegression(lab.page, definitions, "reverse");
  const normalSummary = summarizeRegression(normalRegression.report || normalRegression);
  const reverseSummary = summarizeRegression(reverseRegression.report || reverseRegression);

  assertCondition(errors, normalSummary.scenarioCount === 14, `Normal regression expected 14 scenarios, got ${normalSummary.scenarioCount}.`);
  assertCondition(errors, normalSummary.cycleCount === 16, `Normal regression expected 16 cycles, got ${normalSummary.cycleCount}.`);
  assertCondition(errors, normalSummary.invariantCount === 38, `Normal regression expected 38 invariants, got ${normalSummary.invariantCount}.`);
  assertCondition(errors, normalSummary.failedInvariantCount === 0, `Normal regression failures: ${normalSummary.failedInvariantCount}.`);
  assertCondition(errors, normalSummary.setupErrorCount === 0, `Normal regression setup errors: ${normalSummary.setupErrorCount}.`);
  assertCondition(errors, normalSummary.runtimeErrorCount === 0, `Normal regression runtime errors: ${normalSummary.runtimeErrorCount}.`);

  assertCondition(errors, reverseSummary.scenarioCount === 14, `Reverse regression expected 14 scenarios, got ${reverseSummary.scenarioCount}.`);
  assertCondition(errors, reverseSummary.cycleCount === 16, `Reverse regression expected 16 cycles, got ${reverseSummary.cycleCount}.`);
  assertCondition(errors, reverseSummary.invariantCount === 38, `Reverse regression expected 38 invariants, got ${reverseSummary.invariantCount}.`);
  assertCondition(errors, reverseSummary.failedInvariantCount === 0, `Reverse regression failures: ${reverseSummary.failedInvariantCount}.`);
  assertCondition(errors, reverseSummary.setupErrorCount === 0, `Reverse regression setup errors: ${reverseSummary.setupErrorCount}.`);
  assertCondition(errors, reverseSummary.runtimeErrorCount === 0, `Reverse regression runtime errors: ${reverseSummary.runtimeErrorCount}.`);

  const safetyDefaults = await lab.page.evaluate(() => ({
    autoCastAbilities: window.kbcSwarmBot.config.autoCastAbilities,
    autoAscend: window.kbcSwarmBot.config.autoAscend,
    energySupportBrokerAllowAutoCast: window.kbcSwarmBot.config.energySupportBrokerAllowAutoCast,
  }));

  assertCondition(errors, safetyDefaults.autoCastAbilities === false, "autoCastAbilities default changed.");
  assertCondition(errors, safetyDefaults.autoAscend === false, "autoAscend default changed.");
  assertCondition(errors, safetyDefaults.energySupportBrokerAllowAutoCast === false, "energySupportBrokerAllowAutoCast default changed.");
  assertCondition(errors, baselineLive?.result?.liveStateVerification?.unchanged === true, "Non-mutation proof must be true for unpatched live read-only capture.");
  assertCondition(errors, before.runHistoryLength === after.runHistoryLength, "runHistory mutated during live capture/run.");
  assertCondition(errors, fixturePatch?.verifiedPositiveAffectedUnitCount >= 3, "Fixture setup did not verify positive affected counts.");
  assertCondition(errors, fixturePatchLow?.verifiedPositiveAffectedUnitCount >= 3, "Low-energy fixture setup did not verify positive affected counts.");

  const highExports = await exportLive(lab.page, highResult);

  if (writeEvidence) {
    writeText(exampleLiveResultJsonPath, highExports.jsonText);
    writeText(exampleLiveResultCsvPath, highExports.csvText);
    writeText(exampleLiveResultMdPath, highExports.markdownText);
    writeText(exampleCopySummaryPath, highExports.copySummary);
    writeText(diagnosticsPath, JSON.stringify({
      snapshotId: highSnapshot?.snapshotId || null,
      snapshotHash: highSnapshot?.snapshotHash || null,
      houseOfMirrorsResolution: highSnapshot?.army?.houseOfMirrorsResolution || null,
      effectiveCountDiagnostics: highSnapshot?.army?.effectiveCountDiagnostics || [],
    }, null, 2));
  }

  const verdict = errors.length
    ? "0.12.3 LABORATORY LIVE EFFECTIVE COUNT REQUIRES PATCH"
    : "0.12.3 LABORATORY LIVE EFFECTIVE COUNT VERIFIED";

  const evidence = {
    verdict,
    exactCommit: process.env.GIT_COMMIT || null,
    userscriptHash: sha256(userscript),
    fixturePatch,
    high: {
      capture: highCapture,
      run: highRun,
      parity,
      positiveCountRows: positiveCountRows.length,
    },
    low: {
      fixturePatchLow,
      captureAndRun: lowCaptureAndRun,
      lowClone60,
      lowHom60,
    },
    exports: {
      highJsonRows: Array.isArray(highResult?.experiment?.runs) ? highResult.experiment.runs.length : 0,
      highCsvRows: countCsvRows(highExports.csvText),
      lowCsvRows: countCsvRows(lowExports.csvText),
      highMarkdownHas60: /## 60 seconds/i.test(highExports.markdownText),
      highMarkdownHas300: /## 300 seconds/i.test(highExports.markdownText),
      lowHasInsufficientEnergy: /INSUFFICIENT_ENERGY/i.test(lowExports.markdownText),
    },
    hashes: {
      snapshotHigh: highCapture?.snapshot?.snapshotHash || null,
      snapshotChanged: changedCapture?.snapshot?.snapshotHash || null,
      experimentHigh: highRun?.result?.experimentHash || null,
      experimentHigh2: highRun2?.result?.experimentHash || null,
      stability,
    },
    safetyDefaults,
    regression: {
      normal: normalSummary,
      reverse: reverseSummary,
    },
    nonMutation: {
      before,
      after,
      baselineLiveStateVerification: baselineLive?.result?.liveStateVerification || null,
      highLiveStateVerification: highResult?.liveStateVerification || null,
    },
    errors,
  };

  if (writeEvidence) {
    writeText(evidenceJsonPath, JSON.stringify(evidence, null, 2));
    writeText(evidenceMdPath, [
    "# SwarmSim Strategy Autobuyer 0.12.3 Laboratory Effective Count Verification",
    "",
    `- Verdict: ${verdict}`,
    `- Commit: ${evidence.exactCommit || "unknown"}`,
    `- Userscript hash: ${evidence.userscriptHash}`,
    `- Snapshot hash: ${evidence.hashes.snapshotHigh || ""}`,
    `- Experiment hash: ${evidence.hashes.experimentHigh || ""}`,
    "",
    "## Core gates",
    `- Canonical HoM rows: ${rows.length}`,
    `- Positive HoM rows: ${positiveCountRows.length}`,
    `- Affected total positive: ${parity.affectedPositive}`,
    `- Affected/unaffected parity: ${parity.parity}`,
    `- HoM delta at 60s: ${hom60?.comparisonVsWait?.territoryPerSecondAbsoluteDelta || ""}`,
    `- HoM delta at 300s: ${hom300?.comparisonVsWait?.territoryPerSecondAbsoluteDelta || ""}`,
    "",
    "## Regression",
    `- Normal: ${normalSummary.scenarioCount} scenarios / ${normalSummary.cycleCount} cycles / ${normalSummary.invariantCount} invariants / ${normalSummary.failedInvariantCount} failures / ${normalSummary.setupErrorCount} setup errors / ${normalSummary.runtimeErrorCount} runtime errors`,
    `- Reverse: ${reverseSummary.scenarioCount} scenarios / ${reverseSummary.cycleCount} cycles / ${reverseSummary.invariantCount} invariants / ${reverseSummary.failedInvariantCount} failures / ${reverseSummary.setupErrorCount} setup errors / ${reverseSummary.runtimeErrorCount} runtime errors`,
    "",
    "## Safety defaults",
    `- autoCastAbilities: ${safetyDefaults.autoCastAbilities}`,
    `- autoAscend: ${safetyDefaults.autoAscend}`,
    `- energySupportBrokerAllowAutoCast: ${safetyDefaults.energySupportBrokerAllowAutoCast}`,
    "",
    "## Errors",
    ...(errors.length ? errors.map((row) => `- ${row}`) : ["- none"]),
    "",
    ].join("\n"));
  }

  await closePage(lab);
  await browser.close();

  if (errors.length) {
    console.error(errors.join("\n"));
    process.exit(1);
  }

  console.log(writeEvidence
    ? "0.12.3 LABORATORY LIVE EFFECTIVE COUNT VERIFIED; EVIDENCE WRITTEN"
    : "0.12.3 LABORATORY LIVE EFFECTIVE COUNT CHECK PASSED; NO EVIDENCE WRITTEN");
}

main().catch((error) => {
  console.error(error?.stack || error?.message || String(error));
  process.exit(1);
});

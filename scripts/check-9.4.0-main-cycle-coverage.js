#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const ROOT = path.resolve(__dirname, "..");
const USERSCRIPT_PATH = path.join(ROOT, "src", "SwarmSim-Strategy-Autobuyer.user.js");

const EXPECTED_PATHS = [
  { pathId: "LARVA_ENGINE_GUARD", sourceCall: "executeEngineGuardAction", m6Coverage: "PARTIAL" },
  { pathId: "CRITICAL_PRODUCTION_UPGRADES", sourceCall: "handleCriticalProductionUpgrades", m6Coverage: "NONE" },
  { pathId: "ENERGY_GUARD", sourceCall: "executeEnergyGuardAction", m6Coverage: "PARTIAL" },
  { pathId: "CLONE_RAMP", sourceCall: "executeCloneRampGuardAction", m6Coverage: "NONE" },
  { pathId: "CLONE_BUFFER", sourceCall: "executeCloneGuardAction", m6Coverage: "NONE" },
  { pathId: "CLONE_BUFFER_HARD_LOCK_RECOVERY", sourceCall: "executeCloneGuardAction", m6Coverage: "NONE" },
  { pathId: "MEAT_UNLOCK_PLANNER", sourceCall: "runUnlockPlanner", m6Coverage: "PARTIAL" },
  { pathId: "SMART_UPGRADES", sourceCall: "buySmartUpgrades", m6Coverage: "NONE" },
  { pathId: "SMART_UNITS", sourceCall: "buySmartUnits", m6Coverage: "PARTIAL" },
  { pathId: "FINAL_CLONE_PREP", sourceCall: "manageCloneCocoons", m6Coverage: "NONE" },
];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function countToken(source, token) {
  return source.split(token).length - 1;
}

function extractSmartRunOnce(source) {
  const startNeedle = "  function smartRunOnce() {";
  const start = source.indexOf(startNeedle);
  assert(start >= 0, "smartRunOnce source boundary missing");
  const end = source.indexOf("\n  function ", start + startNeedle.length);
  assert(end > start, "smartRunOnce end boundary missing");
  return source.slice(start, end);
}

function assertSourceCoverage(userscript) {
  const smartRunOnce = extractSmartRunOnce(userscript);
  assert(
    smartRunOnce.includes("const m6DecisionOwnsMainCycle = false;"),
    "M6 whole-cycle ownership must remain disabled"
  );

  const markerPattern = /\/\/ main-cycle-coverage: ([A-Z0-9_]+)/g;
  const markers = Array.from(smartRunOnce.matchAll(markerPattern));
  const markerIds = markers.map((match) => match[1]);
  const expectedIds = EXPECTED_PATHS.map((pathRow) => pathRow.pathId);
  assert(
    JSON.stringify(markerIds) === JSON.stringify(expectedIds),
    `smartRunOnce coverage markers drifted: expected ${expectedIds.join(",")}, got ${markerIds.join(",")}`
  );

  for (let index = 0; index < markers.length; index++) {
    const row = EXPECTED_PATHS[index];
    const segmentStart = markers[index].index;
    const segmentEnd = index + 1 < markers.length ? markers[index + 1].index : smartRunOnce.length;
    const segment = smartRunOnce.slice(segmentStart, segmentEnd);
    assert(
      segment.includes(`${row.sourceCall}(`),
      `${row.pathId} marker is not attached to ${row.sourceCall}`
    );
  }

  const expectedCallCounts = new Map();
  for (const row of EXPECTED_PATHS) {
    expectedCallCounts.set(row.sourceCall, (expectedCallCounts.get(row.sourceCall) || 0) + 1);
  }
  for (const [sourceCall, expectedCount] of expectedCallCounts.entries()) {
    const actualCount = countToken(smartRunOnce, `${sourceCall}(`);
    assert(
      actualCount === expectedCount,
      `${sourceCall} callsite count drifted: expected ${expectedCount}, got ${actualCount}`
    );
  }
}

async function main() {
  let userscript = fs.readFileSync(USERSCRIPT_PATH, "utf8").replace(/\r\n/g, "\n");
  const ledgerPathNeedle = 'pathId: "CRITICAL_PRODUCTION_UPGRADES"';
  const waitPreconditionNeedle = "const wholeCycleOwnershipEligible = uncoveredPaths.length === 0 && missingCycleEvidencePaths.length === 0;";

  if (process.argv.includes("--mutate-ledger-path")) {
    assert(userscript.includes(ledgerPathNeedle), "coverage-ledger mutation needle missing");
    userscript = userscript.replace(ledgerPathNeedle, 'pathId: "CRITICAL_PRODUCTION_UPGRADES_REMOVED"');
  }
  if (process.argv.includes("--mutate-wait-precondition")) {
    assert(userscript.includes(waitPreconditionNeedle), "WAIT-precondition mutation needle missing");
    userscript = userscript.replace(waitPreconditionNeedle, "const wholeCycleOwnershipEligible = true;");
  }

  assertSourceCoverage(userscript);

  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.goto("https://www.swarmsim.com/", { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.addScriptTag({ content: userscript });
    await page.waitForFunction(() => !!window.kbcSwarmBot?.strategicCoordinator?.mainCycleCoverage, { timeout: 60000 });

    const report = await page.evaluate(() => {
      const bot = window.kbcSwarmBot;
      const ledger = bot.strategicCoordinator.mainCycleCoverage();
      const coordinator = bot.strategicCoordinator.evaluate({
        snapshotId: "main-cycle-coverage",
        snapshotHash: "sha256:main-cycle-coverage",
        decisionCycleId: "main-cycle-coverage-cycle",
        activeMilestone: "construct Expansion",
        activeTarget: "Expansion",
        horizonId: "medium",
        horizonSeconds: 1800,
        selectedComparisonMetricId: "expansion-eta",
        selectedComparisonMetricUnit: "seconds",
        selectedComparisonBasis: "milestone-eta-seconds",
        purchaseProposalState: { proposals: [], evaluation: { evaluated: [] } },
      });
      return { ledger, embeddedLedger: coordinator.mainCycleCoverage };
    });

    const ledger = report.ledger;
    const expectedIds = EXPECTED_PATHS.map((row) => row.pathId);
    assert(ledger.schemaVersion === "main-cycle-coverage-ledger.v1", `unexpected ledger schema ${ledger.schemaVersion}`);
    assert(ledger.ownershipModel === "PARTIAL_M6_WITH_LEGACY_FALLBACK", `unexpected ownership model ${ledger.ownershipModel}`);
    assert(ledger.requiredPathCount === EXPECTED_PATHS.length, `expected ${EXPECTED_PATHS.length} required paths, got ${ledger.requiredPathCount}`);
    assert(ledger.completeM6PathCount === 0, `expected no completely M6-covered path, got ${ledger.completeM6PathCount}`);
    assert(ledger.retainedLegacyPathCount === EXPECTED_PATHS.length, `expected all paths retained by legacy, got ${ledger.retainedLegacyPathCount}`);
    assert(JSON.stringify(ledger.paths.map((row) => row.pathId)) === JSON.stringify(expectedIds), "runtime ledger path identity drifted from smartRunOnce markers");

    for (let index = 0; index < EXPECTED_PATHS.length; index++) {
      const expected = EXPECTED_PATHS[index];
      const actual = ledger.paths[index];
      assert(actual.sourceCall === expected.sourceCall, `${expected.pathId} source call mismatch: ${actual.sourceCall}`);
      assert(actual.currentOwner === "LEGACY_SMART", `${expected.pathId} lost its explicit legacy owner`);
      assert(actual.m6Coverage === expected.m6Coverage, `${expected.pathId} M6 coverage mismatch: ${actual.m6Coverage}`);
      assert(actual.cycleApplicabilityEvidence === "MISSING", `${expected.pathId} fabricated same-cycle applicability evidence`);
    }

    assert(ledger.waitPrecondition.status === "FAIL", `WAIT precondition must fail, got ${ledger.waitPrecondition.status}`);
    assert(ledger.waitPrecondition.wholeCycleOwnershipEligible === false, "WAIT must not own the whole cycle");
    assert(ledger.waitPrecondition.recommendationAuthority === "ADVISOR_ONLY", `unexpected WAIT authority ${ledger.waitPrecondition.recommendationAuthority}`);
    assert(JSON.stringify(ledger.waitPrecondition.uncoveredPathIds) === JSON.stringify(expectedIds), "WAIT uncovered-path inventory is incomplete");
    assert(JSON.stringify(ledger.waitPrecondition.missingCycleEvidencePathIds) === JSON.stringify(expectedIds), "WAIT missing-evidence inventory is incomplete");
    assert(JSON.stringify(report.embeddedLedger) === JSON.stringify(ledger), "coordinator result does not expose the canonical main-cycle ledger");

    console.log("9.4.0 MAIN-CYCLE COVERAGE LEDGER ACCEPTANCE PASSED");
    console.log(JSON.stringify({
      schemaVersion: ledger.schemaVersion,
      ownershipModel: ledger.ownershipModel,
      requiredPathCount: ledger.requiredPathCount,
      completeM6PathCount: ledger.completeM6PathCount,
      retainedLegacyPathCount: ledger.retainedLegacyPathCount,
      partialPaths: ledger.paths.filter((row) => row.m6Coverage === "PARTIAL").map((row) => row.pathId),
      uncoveredPathIds: ledger.waitPrecondition.uncoveredPathIds,
      missingCycleEvidencePathIds: ledger.waitPrecondition.missingCycleEvidencePathIds,
      waitPrecondition: ledger.waitPrecondition.status,
      wholeCycleOwnershipEligible: ledger.waitPrecondition.wholeCycleOwnershipEligible,
    }, null, 2));
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error?.stack || error);
  process.exitCode = 1;
});

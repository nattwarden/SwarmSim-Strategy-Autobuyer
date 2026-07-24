#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { getBrowser } = require("./lib/browser-harness");

const ROOT = path.resolve(__dirname, "..");
const USERSCRIPT_PATH = path.join(ROOT, "src", "SwarmSim-Strategy-Autobuyer.user.js");
const FIXTURE_PATH = path.join(ROOT, "docs", "test-data", "laboratory-lc1", "decision-snapshot-fixture.json");
// LD-05 in the LC runbook: an existing retained real player save used to prove
// read-only decision capture and non-mutation against a real economy, not only
// the deterministic LD-00 fixture. The hash is pinned as fixture provenance.
const REAL_SAVE_PATH = path.join(ROOT, "docs", "test-data", "player-saves", "manual-play-active-chain-pre-ascension-2026-07-18.txt");
const EXPECTED_REAL_SAVE_SHA256 = "c53f5394966e917d58957c767e3cd61d92c8850d79efb60630b7b5a5a860b95c";
const EVIDENCE_JSON_PATH = path.join(ROOT, "docs", "live-logs", "browser-test-lc1-decision-snapshot.json");
const EVIDENCE_MD_PATH = path.join(ROOT, "docs", "live-logs", "browser-test-lc1-decision-snapshot.md");
const EXAMPLE_SNAPSHOT_PATH = path.join(ROOT, "docs", "test-data", "laboratory-lc1", "example-decision-snapshot.json");
const args = new Set(process.argv.slice(2));
const writeEvidence = args.has("--write-evidence");

for (const arg of args) {
  if (!["--check", "--write-evidence"].includes(arg)) throw new Error(`Unknown argument: ${arg}`);
}
if (args.has("--check") && writeEvidence) throw new Error("Choose either --check or --write-evidence, not both.");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function writeText(filePath, text) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${text}\n`, "utf8");
}

async function main() {
  const userscript = fs.readFileSync(USERSCRIPT_PATH, "utf8");
  const fixture = JSON.parse(fs.readFileSync(FIXTURE_PATH, "utf8"));
  assert(fixture?.schemaVersion === "swarmsim-lab.lc1-fixture.v1", "unexpected LC-1 fixture schema");
  assert(Array.isArray(fixture?.army) && fixture.army.length >= 3, "LC-1 fixture must include Army roster rows");

  const realSaveBytes = fs.readFileSync(REAL_SAVE_PATH);
  const realSaveSha256 = crypto.createHash("sha256").update(realSaveBytes).digest("hex");
  assert(
    realSaveSha256 === EXPECTED_REAL_SAVE_SHA256,
    `LD-05 real save hash mismatch: expected ${EXPECTED_REAL_SAVE_SHA256}, got ${realSaveSha256}`
  );
  const realSave = realSaveBytes.toString("utf8").trim();
  for (const expected of [
    'const LABORATORY_DECISION_SNAPSHOT_SCHEMA_VERSION = "swarmsim-lab.decision-snapshot.v1"',
    'const LABORATORY_CANDIDATE_MANIFEST_SCHEMA_VERSION = "swarmsim-lab.candidate-manifest.v1"',
    "function buildLaboratoryVisibleArmyRoster(game)",
    "captureLiveDecisionSnapshot(options = {})",
    "validateDecisionSnapshot(snapshot)",
  ]) {
    assert(userscript.includes(expected), `missing LC-1 decision-capture surface: ${expected}`);
  }

  const browser = await getBrowser({ headless: true });
  try {
    const page = await browser.newPage();
    await page.goto("https://www.swarmsim.com/#/tab/territory", { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.evaluate(() => {
      localStorage.clear();
      localStorage.setItem("kbcSwarmBotLaboratoryEnabled_v1", "true");
      localStorage.setItem("kbcSwarmBotLaboratoryLiveEnabled_v1", "true");
      localStorage.setItem("kbcSwarmBotScenarioHarnessEnabled_v1", "true");
    });
    await page.addScriptTag({ content: userscript });
    await page.waitForFunction(() => !!window.kbcSwarmBot?.laboratory?.captureLiveDecisionSnapshot, { timeout: 60000 });

    const report = await page.evaluate(async (fixtureState) => {
      const bot = window.kbcSwarmBot;
      const game = window.angular.element(document.body).injector().get("game");
      const DecimalCtor = window.Decimal;
      for (const armyRow of fixtureState.army) {
        const unit = game.unit(armyRow.unitId);
        if (!unit) continue;
        Object.defineProperty(unit, "isVisible", { configurable: true, value: () => true });
        Object.defineProperty(unit, "count", { configurable: true, value: () => new DecimalCtor(armyRow.count) });
      }

      // One advisor-only cycle creates the normal runtime observability this
      // capture adapts. Capture itself must not create a second cycle or buy.
      bot.config.enabled = true;
      bot.config.autoBuySafeDecisions = false;
      bot.config.advisorOnly = true;
      bot.config.strategyInspector = true;
      bot.runOnce();
      const inspector = bot.getStrategyInspector();
      const historyBeforeLiveCapture = bot.getRunHistory().length;

      const live = await bot.laboratory.captureLiveDecisionSnapshot({
        decisionSnapshotId: "LC1-LIVE-READ-ONLY",
        captureTimestamp: "2026-07-23T00:00:00.000Z",
      });
      const historyAfterLiveCapture = bot.getRunHistory().length;
      const scenario = fixtureState.scenario;
      const deterministicOptions = {
        decisionSnapshotId: "LC1-DETERMINISTIC",
        snapshotId: "LC1-DETERMINISTIC-STATE",
        captureTimestamp: "2026-07-23T00:00:00.000Z",
        scenario,
      };
      const deterministicA = await bot.laboratory.captureDecisionSnapshot(deterministicOptions);
      const deterministicB = await bot.laboratory.captureDecisionSnapshot(deterministicOptions);
      const decision = live.decisionSnapshot;
      const firstRuntimeCandidate = inspector?.laneCandidates?.[0] || null;
      const firstManifestCandidate = decision?.candidateManifest?.candidates?.[0] || null;
      return {
        live,
        deterministicA,
        deterministicB,
        inspector: inspector ? {
          decision: inspector.decision,
          mainDecision: inspector.mainDecision,
          candidateCount: inspector.laneCandidates?.length || 0,
          firstRuntimeCandidate,
        } : null,
        firstManifestCandidate,
        historyBeforeLiveCapture,
        historyAfterLiveCapture,
        frozen: {
          snapshot: Object.isFrozen(decision),
          manifest: Object.isFrozen(decision?.candidateManifest),
          candidates: Object.isFrozen(decision?.candidateManifest?.candidates),
        },
      };
    }, fixture);

    const decision = report.live?.decisionSnapshot;
    assert(report.live?.ok === true, "live decision capture failed");
    assert(report.live?.validity?.ok === true, `decision snapshot validation failed: ${(report.live?.validity?.errors || []).join("; ")}`);
    assert(
      report.live?.liveStateVerification?.unchanged === true,
      `live decision capture changed the source state: ${JSON.stringify(report.live?.liveStateVerification || null)}`
    );
    assert(report.historyBeforeLiveCapture === report.historyAfterLiveCapture, "decision capture changed normal run history");
    assert(report.frozen.snapshot && report.frozen.manifest && report.frozen.candidates, "decision snapshot is not deeply immutable");
    assert(decision?.schemaVersion === "swarmsim-lab.decision-snapshot.v1", "unexpected decision snapshot schema");
    assert(decision?.candidateManifest?.schemaVersion === "swarmsim-lab.candidate-manifest.v1", "unexpected candidate manifest schema");
    assert(decision?.candidateManifest?.candidates?.length === report.inspector?.candidateCount, "candidate manifest drifted from Strategy Inspector candidates");
    assert(decision?.decision?.runtimeVerdict?.decision === report.inspector?.decision, "runtime verdict drifted from Strategy Inspector decision");
    assert(decision?.decision?.runtimeVerdict?.mainDecision === report.inspector?.mainDecision, "main verdict drifted from Strategy Inspector decision");
    assert(decision?.candidateManifest?.candidates?.[0]?.identity === report.inspector?.firstRuntimeCandidate?.candidate, "first candidate identity drifted from Strategy Inspector");
    assert(decision?.candidateManifest?.candidates?.[0]?.disposition === report.inspector?.firstRuntimeCandidate?.decision, "first candidate disposition drifted from Strategy Inspector");
    assert(
      decision?.candidateManifest?.candidates?.some((candidate) => candidate.requestedAmount?.status === "UNMODELED"),
      "a missing exact amount must remain explicitly UNMODELED"
    );
    assert(decision?.candidateManifest?.pathCoverage?.length === 11, "main-cycle coverage must expose every canonical path");
    assert(decision?.candidateManifest?.pathCoverage?.every((row) => ["OBSERVED", "UNMODELED"].includes(row.status)), "path coverage has an unrecognised status");
    assert(decision?.candidateManifest?.coverageGaps?.every((row) => row.candidateIdentity === "UNMODELED" || row.status === "UNMODELED"), "coverage gaps must be explicit");
    const rosterNames = new Set((decision?.army?.roster || []).map((row) => row.runtimeUnitName));
    assert(fixture.army.every((row) => rosterNames.has(row.unitId)), "visible Army roster omitted a fixture family");
    assert((decision?.army?.roster || []).some((row) => row.runtimeUnitName === "swarmling" && row.count === "0"), "visible Army roster omitted a zero-count family");
    assert(decision?.formulaProvenance?.formulaSetId === "swarmsim-runtime-formulas", "formula provenance was not preserved from the base snapshot");
    assert(report.deterministicA?.ok === true && report.deterministicB?.ok === true, "deterministic decision capture failed");
    assert(
      report.deterministicA?.decisionSnapshot?.decisionSnapshotHash === report.deterministicB?.decisionSnapshot?.decisionSnapshotHash,
      "identical deterministic decision captures must hash identically"
    );

    // LD-05 real-save leg. Runs in its own page so the LD-00 clean-start
    // assertions above stay valid; imports an existing retained player save and
    // proves the same read-only decision capture, non-mutation, immutability,
    // schema, roster, and formula-provenance invariants against a real economy.
    const realSavePage = await browser.newPage();
    await realSavePage.goto("https://www.swarmsim.com/#/tab/territory", { waitUntil: "domcontentloaded", timeout: 60000 });
    await realSavePage.evaluate(() => {
      localStorage.clear();
      localStorage.setItem("kbcSwarmBotLaboratoryEnabled_v1", "true");
      localStorage.setItem("kbcSwarmBotLaboratoryLiveEnabled_v1", "true");
      localStorage.setItem("kbcSwarmBotScenarioHarnessEnabled_v1", "true");
    });
    await realSavePage.addScriptTag({ content: userscript });
    await realSavePage.waitForFunction(() => !!window.kbcSwarmBot?.laboratory?.captureLiveDecisionSnapshot, { timeout: 60000 });

    const realSaveReport = await realSavePage.evaluate(async (saveString) => {
      const bot = window.kbcSwarmBot;
      const game = window.angular.element(document.body).injector().get("game");
      game.importSave(saveString);
      // Let the imported save settle through an Angular digest before capture.
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Advisor-only cycle for the normal observability this capture reads; the
      // capture itself must not create a second cycle or buy anything.
      bot.config.enabled = true;
      bot.config.autoBuySafeDecisions = false;
      bot.config.advisorOnly = true;
      bot.config.strategyInspector = true;
      bot.runOnce();
      const historyBeforeLiveCapture = bot.getRunHistory().length;

      const live = await bot.laboratory.captureLiveDecisionSnapshot({
        decisionSnapshotId: "LC1-REALSAVE-READ-ONLY",
        captureTimestamp: "2026-07-23T00:00:00.000Z",
      });
      const historyAfterLiveCapture = bot.getRunHistory().length;
      const decision = live?.decisionSnapshot;
      return {
        ok: live?.ok === true,
        validityOk: live?.validity?.ok === true,
        validityErrors: live?.validity?.errors || [],
        unchanged: live?.liveStateVerification?.unchanged === true,
        historyUnchanged: historyBeforeLiveCapture === historyAfterLiveCapture,
        frozen: {
          snapshot: Object.isFrozen(decision),
          manifest: Object.isFrozen(decision?.candidateManifest),
          candidates: Object.isFrozen(decision?.candidateManifest?.candidates),
        },
        schemaVersion: decision?.schemaVersion || null,
        manifestSchemaVersion: decision?.candidateManifest?.schemaVersion || null,
        formulaSetId: decision?.formulaProvenance?.formulaSetId || null,
        decisionSnapshotHash: decision?.decisionSnapshotHash || null,
        candidateCount: decision?.candidateManifest?.candidates?.length || 0,
        coveragePathCount: decision?.candidateManifest?.pathCoverage?.length || 0,
        visibleArmyFamilyCount: decision?.army?.visibleFamilyCount || 0,
        rosterCount: (decision?.army?.roster || []).length,
      };
    }, realSave);

    assert(realSaveReport.ok === true, "real-save (LD-05) decision capture failed");
    assert(
      realSaveReport.validityOk === true,
      `real-save decision snapshot validation failed: ${(realSaveReport.validityErrors || []).join("; ")}`
    );
    assert(realSaveReport.unchanged === true, "real-save decision capture changed the imported source state");
    assert(realSaveReport.historyUnchanged === true, "real-save decision capture changed normal run history");
    assert(
      realSaveReport.frozen.snapshot && realSaveReport.frozen.manifest && realSaveReport.frozen.candidates,
      "real-save decision snapshot is not deeply immutable"
    );
    assert(realSaveReport.schemaVersion === "swarmsim-lab.decision-snapshot.v1", "unexpected real-save decision snapshot schema");
    assert(realSaveReport.manifestSchemaVersion === "swarmsim-lab.candidate-manifest.v1", "unexpected real-save candidate manifest schema");
    assert(realSaveReport.formulaSetId === "swarmsim-runtime-formulas", "real-save formula provenance was not preserved from the base snapshot");
    assert(realSaveReport.rosterCount >= 1, "real-save visible Army roster is empty");

    const evidence = {
      verdict: "LABORATORY LC-1 DECISION SNAPSHOT VERIFIED",
      implementationCommit: process.env.GIT_COMMIT || null,
      fixture: {
        path: path.relative(ROOT, FIXTURE_PATH).replace(/\\/g, "/"),
        fixtureId: fixture.fixtureId,
        schemaVersion: fixture.schemaVersion,
      },
      live: {
        decisionSnapshotHash: decision?.decisionSnapshotHash || null,
        sourceStateUnchanged: report.live?.liveStateVerification?.unchanged === true,
        runHistoryUnchanged: report.historyBeforeLiveCapture === report.historyAfterLiveCapture,
        candidateCount: decision?.candidateManifest?.candidates?.length || 0,
        coveragePathCount: decision?.candidateManifest?.pathCoverage?.length || 0,
        coverageGapCount: decision?.coverageGaps?.length || 0,
        visibleArmyFamilyCount: decision?.army?.visibleFamilyCount || 0,
        zeroCountArmyFamilyCount: decision?.army?.zeroCountFamilyIds?.length || 0,
      },
      deterministic: {
        decisionSnapshotHash: report.deterministicA?.decisionSnapshot?.decisionSnapshotHash || null,
        hashStable: report.deterministicA?.decisionSnapshot?.decisionSnapshotHash === report.deterministicB?.decisionSnapshot?.decisionSnapshotHash,
      },
      realSave: {
        savePath: path.relative(ROOT, REAL_SAVE_PATH).replace(/\\/g, "/"),
        saveSha256: EXPECTED_REAL_SAVE_SHA256,
        decisionSnapshotHash: realSaveReport.decisionSnapshotHash,
        sourceStateUnchanged: realSaveReport.unchanged,
        runHistoryUnchanged: realSaveReport.historyUnchanged,
        candidateCount: realSaveReport.candidateCount,
        coveragePathCount: realSaveReport.coveragePathCount,
        visibleArmyFamilyCount: realSaveReport.visibleArmyFamilyCount,
      },
    };

    if (writeEvidence) {
      writeText(EXAMPLE_SNAPSHOT_PATH, JSON.stringify(report.deterministicA.decisionSnapshot, null, 2));
      writeText(EVIDENCE_JSON_PATH, JSON.stringify(evidence, null, 2));
      writeText(EVIDENCE_MD_PATH, [
        "# SwarmSim Laboratory LC-1 Decision Snapshot Verification",
        "",
        `- Verdict: ${evidence.verdict}`,
        `- Implementation commit: ${evidence.implementationCommit || "unknown"}`,
        `- Fixture: ${evidence.fixture.path} (${evidence.fixture.fixtureId})`,
        `- Live decision snapshot hash: ${evidence.live.decisionSnapshotHash || ""}`,
        `- Deterministic decision snapshot hash: ${evidence.deterministic.decisionSnapshotHash || ""}`,
        `- Live source state unchanged: ${evidence.live.sourceStateUnchanged}`,
        `- Run history unchanged: ${evidence.live.runHistoryUnchanged}`,
        `- Candidate rows: ${evidence.live.candidateCount}`,
        `- Main-cycle paths: ${evidence.live.coveragePathCount}`,
        `- Explicit coverage gaps: ${evidence.live.coverageGapCount}`,
        `- Visible Army families / zero-count: ${evidence.live.visibleArmyFamilyCount} / ${evidence.live.zeroCountArmyFamilyCount}`,
        `- Real save (LD-05): ${evidence.realSave.savePath} (sha256 ${evidence.realSave.saveSha256})`,
        `- Real-save decision snapshot hash: ${evidence.realSave.decisionSnapshotHash || ""}`,
        `- Real-save source state unchanged: ${evidence.realSave.sourceStateUnchanged}`,
        `- Real-save run history unchanged: ${evidence.realSave.runHistoryUnchanged}`,
        `- Real-save candidate rows / visible Army families: ${evidence.realSave.candidateCount} / ${evidence.realSave.visibleArmyFamilyCount}`,
        "",
      ].join("\n"));
    }

    console.log("LABORATORY LC-1 DECISION SNAPSHOT CHECK PASSED");
    console.log(JSON.stringify(evidence, null, 2));
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error?.stack || error?.message || String(error));
  process.exitCode = 1;
});

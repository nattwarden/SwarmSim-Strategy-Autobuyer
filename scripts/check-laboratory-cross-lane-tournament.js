#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { getBrowser } = require("./lib/browser-harness");

const ROOT = path.resolve(__dirname, "..");
const USERSCRIPT_PATH = path.join(ROOT, "src", "SwarmSim-Strategy-Autobuyer.user.js");
// LD-05: rich late-early multi-lane economy. LD-09: balanced natural Nexus 5.
const LD05_SAVE_PATH = path.join(ROOT, "docs", "test-data", "player-saves", "manual-play-active-chain-pre-ascension-2026-07-18.txt");
const EXPECTED_LD05_SHA256 = "c53f5394966e917d58957c767e3cd61d92c8850d79efb60630b7b5a5a860b95c";
const LD09_SAVE_PATH = path.join(ROOT, "docs", "test-data", "player-saves", "manual-play-natural-nexus5-2026-07-24.txt");
const EXPECTED_LD09_SHA256 = "3419b7846db89047312c4e5f70b041092228b1b39b8793f04800c37460cbec7f";
const EVIDENCE_JSON_PATH = path.join(ROOT, "docs", "live-logs", "browser-test-lc4-cross-lane-tournament.json");
const EVIDENCE_MD_PATH = path.join(ROOT, "docs", "live-logs", "browser-test-lc4-cross-lane-tournament.md");
const EXAMPLE_RESULT_PATH = path.join(ROOT, "docs", "test-data", "laboratory-lc4", "example-cross-lane-tournament.json");

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

function readPinnedSave(savePath, expectedSha) {
  const bytes = fs.readFileSync(savePath);
  const sha = crypto.createHash("sha256").update(bytes).digest("hex");
  assert(sha === expectedSha, `save hash mismatch for ${path.basename(savePath)}: expected ${expectedSha}, got ${sha}`);
  return bytes.toString("utf8").trim();
}

async function main() {
  const userscript = fs.readFileSync(USERSCRIPT_PATH, "utf8");
  for (const expected of [
    'const LABORATORY_CROSS_LANE_TOURNAMENT_SCHEMA_VERSION = "swarmsim-lab.cross-lane-tournament.v1"',
    "function laboratoryEnumerateLaneCandidates(game, sourceSave)",
    "function runLaboratoryCrossLaneTournament(options = {})",
    "runCrossLaneTournament(options = {})",
  ]) {
    assert(userscript.includes(expected), `missing LC-4 cross-lane surface: ${expected}`);
  }

  const ld05Save = readPinnedSave(LD05_SAVE_PATH, EXPECTED_LD05_SHA256);
  const ld09Save = readPinnedSave(LD09_SAVE_PATH, EXPECTED_LD09_SHA256);

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
    await page.waitForFunction(() => !!window.kbcSwarmBot?.laboratory?.runCrossLaneTournament, { timeout: 60000 });

    const report = await page.evaluate(async ([ld05, ld09]) => {
      const bot = window.kbcSwarmBot;
      const rich = await bot.laboratory.runCrossLaneTournament({
        experimentId: "LC4-LD05", captureTimestamp: "2026-07-23T00:00:00.000Z",
        phaseTarget: "larva-bridge-throughput", sourceSave: ld05,
      });
      const nexus5 = await bot.laboratory.runCrossLaneTournament({
        experimentId: "LC4-LD09", captureTimestamp: "2026-07-23T00:00:00.000Z",
        phaseTarget: "larva-bridge-throughput", sourceSave: ld09,
      });
      return { rich, nexus5 };
    }, [ld05Save, ld09Save]);

    // Primary source LD-05.
    const t = report.rich;
    assert(t?.ok === true, `LD-05 cross-lane tournament failed: ${t?.error || ""}`);
    assert(t.validity?.ok === true, `LD-05 cross-lane result invalid: ${(t.validity?.errors || []).join("; ")}`);
    const tour = t.tournament;
    assert(tour?.schemaVersion === "swarmsim-lab.cross-lane-tournament.v1", "unexpected cross-lane schema");
    assert(tour?.metricModel === "instantaneous-larva-rate-delta", "unexpected metric model");
    assert(typeof tour?.oracleIndependence === "string" && tour.oracleIndependence.length > 0, "missing oracle-independence statement");

    // No lane omission: several distinct lanes were enumerated from production.
    assert(Array.isArray(tour.lanesCovered) && tour.lanesCovered.length >= 3, `expected >= 3 lanes covered, got ${JSON.stringify(tour.lanesCovered)}`);
    // A HOLD baseline plus executed candidates across lanes.
    const holdEntry = (tour.candidates || []).find((c) => c.candidateId === "HOLD");
    assert(holdEntry, "cross-lane tournament missing HOLD baseline");
    assert(tour.executedCount >= 2, `expected >= 2 executed candidates, got ${tour.executedCount}`);
    // Executed candidates span more than one lane (true cross-lane comparison).
    const executedLanes = new Set((tour.candidates || []).filter((c) => c.executed).map((c) => c.lane));
    assert(executedLanes.size >= 2, `executed candidates span < 2 lanes: ${JSON.stringify([...executedLanes])}`);
    // Every enumerated candidate carries a metric and is never silently hidden.
    for (const c of (tour.candidates || [])) {
      assert(c.metric && typeof c.metric.larvaRateDelta === "string", `candidate ${c.candidateId} missing larva-rate metric`);
    }
    // Isolation: identical raw-state restore per candidate => no larva double-spend; source unchanged.
    assert(tour.siblingIsolation?.allRestoredIdenticalToSource === true, "a candidate restore diverged from source");
    assert(tour.siblingIsolation?.sharedLarvaeNotDoubleSpent === true, "shared larvae double-spend not excluded");
    assert(tour.siblingIsolation?.sourceRawStateUnchanged === true, "source raw state changed after the tournament");
    // Independent winner selected by the Laboratory metric; ordering-bias kept separate.
    assert(!!tour.laboratoryWinner, "no independent Laboratory winner selected");
    assert(tour.winnerAgreesWithProductionFirstBuy === true || tour.winnerAgreesWithProductionFirstBuy === false || tour.winnerAgreesWithProductionFirstBuy === null, "ordering comparison not resolved");
    // Territory-over-Meat crossover honestly left open.
    assert(tour.territoryOverMeatCrossover === "open", "Territory-over-Meat crossover should be honestly open in this slice");

    // Second source LD-09 (balanced natural Nexus 5): core invariants hold there too.
    const n = report.nexus5;
    assert(n?.ok === true, `LD-09 cross-lane tournament failed: ${n?.error || ""}`);
    assert(n.validity?.ok === true, `LD-09 cross-lane result invalid: ${(n.validity?.errors || []).join("; ")}`);
    assert(n.tournament?.siblingIsolation?.allRestoredIdenticalToSource === true, "LD-09 candidate restore diverged from source");
    assert(n.tournament?.siblingIsolation?.sourceRawStateUnchanged === true, "LD-09 source raw state changed");
    assert(!!n.tournament?.laboratoryWinner, "LD-09 has no independent winner");
    assert(Array.isArray(n.tournament?.lanesCovered) && n.tournament.lanesCovered.length >= 2, "LD-09 covered < 2 lanes");

    const evidence = {
      verdict: "LABORATORY LC-4 CROSS-LANE TOURNAMENT VERIFIED",
      implementationCommit: process.env.GIT_COMMIT || null,
      metricModel: tour.metricModel,
      timingModel: tour.timingModel,
      ld05: {
        save: { path: path.relative(ROOT, LD05_SAVE_PATH).replace(/\\/g, "/"), sha256: EXPECTED_LD05_SHA256 },
        lanesCovered: tour.lanesCovered,
        enumeratedCount: tour.enumeratedCount,
        executedCount: tour.executedCount,
        unresolvedCount: tour.unresolvedCount,
        sourceRawStateUnchanged: tour.siblingIsolation?.sourceRawStateUnchanged,
        allRestoredIdentical: tour.siblingIsolation?.allRestoredIdenticalToSource,
        laboratoryWinner: tour.laboratoryWinner,
        productionFirstBuy: tour.productionFirstBuy,
        winnerAgreesWithProductionFirstBuy: tour.winnerAgreesWithProductionFirstBuy,
        territoryOverMeatCrossover: tour.territoryOverMeatCrossover,
        executed: (tour.candidates || []).filter((c) => c.executed).map((c) => ({
          candidateId: c.candidateId, lane: c.lane, productionDecision: c.productionDecision,
          larvaRateDelta: c.metric.larvaRateDelta, territoryRateDelta: c.metric.territoryRateDelta, meatRateDelta: c.metric.meatRateDelta,
        })),
      },
      ld09: {
        save: { path: path.relative(ROOT, LD09_SAVE_PATH).replace(/\\/g, "/"), sha256: EXPECTED_LD09_SHA256 },
        lanesCovered: n.tournament?.lanesCovered,
        executedCount: n.tournament?.executedCount,
        laboratoryWinner: n.tournament?.laboratoryWinner,
        sourceRawStateUnchanged: n.tournament?.siblingIsolation?.sourceRawStateUnchanged,
      },
    };

    if (writeEvidence) {
      writeText(EXAMPLE_RESULT_PATH, JSON.stringify(tour, null, 2));
      writeText(EVIDENCE_JSON_PATH, JSON.stringify(evidence, null, 2));
      writeText(EVIDENCE_MD_PATH, [
        "# SwarmSim Laboratory LC-4 Cross-Lane Tournament Verification",
        "",
        `- Verdict: ${evidence.verdict}`,
        `- Implementation commit: ${evidence.implementationCommit || "unknown"}`,
        `- Metric model: ${evidence.metricModel}`,
        `- Timing model: ${evidence.timingModel}`,
        "",
        "## LD-05 (rich multi-lane)",
        `- Save: ${evidence.ld05.save.path} (sha256 ${evidence.ld05.save.sha256})`,
        `- Lanes covered (no omission): ${JSON.stringify(evidence.ld05.lanesCovered)}`,
        `- Enumerated / executed / unresolved: ${evidence.ld05.enumeratedCount} / ${evidence.ld05.executedCount} / ${evidence.ld05.unresolvedCount}`,
        `- All restores identical (no larva double-spend): ${evidence.ld05.allRestoredIdentical}`,
        `- Source raw state unchanged: ${evidence.ld05.sourceRawStateUnchanged}`,
        `- Laboratory winner: ${evidence.ld05.laboratoryWinner}`,
        `- Production first BUY: ${evidence.ld05.productionFirstBuy} (winner agrees: ${evidence.ld05.winnerAgreesWithProductionFirstBuy})`,
        `- Territory-over-Meat crossover: ${evidence.ld05.territoryOverMeatCrossover}`,
        "",
        "| Executed candidate | Lane | Prod decision | larva/s delta | territory/s delta | meat/s delta |",
        "|---|---|---|---|---|---|",
        ...evidence.ld05.executed.map((c) => `| ${c.candidateId} | ${c.lane} | ${c.productionDecision} | ${c.larvaRateDelta} | ${c.territoryRateDelta} | ${c.meatRateDelta} |`),
        "",
        "## LD-09 (balanced natural Nexus 5)",
        `- Lanes covered: ${JSON.stringify(evidence.ld09.lanesCovered)}; executed: ${evidence.ld09.executedCount}; winner: ${evidence.ld09.laboratoryWinner}; source unchanged: ${evidence.ld09.sourceRawStateUnchanged}`,
        "",
      ].join("\n"));
    }

    console.log("LABORATORY LC-4 CROSS-LANE TOURNAMENT CHECK PASSED");
    console.log(JSON.stringify(evidence, null, 2));
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error?.stack || error?.message || String(error));
  process.exitCode = 1;
});

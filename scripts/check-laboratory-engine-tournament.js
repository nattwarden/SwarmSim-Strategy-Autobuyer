#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { getBrowser } = require("./lib/browser-harness");

const ROOT = path.resolve(__dirname, "..");
const USERSCRIPT_PATH = path.join(ROOT, "src", "SwarmSim-Strategy-Autobuyer.user.js");
// LD-01 in the LC runbook: an early Engine/Territory-phase real save where the
// Hatchery and Expansion larva-engine upgrades are relevant.
const LD01_SAVE_PATH = path.join(ROOT, "docs", "test-data", "player-saves", "manual-play-early-pre-ascension-2026-07-18.txt");
const EXPECTED_LD01_SHA256 = "15d8b98302f833d4d8d2dc596def6fdb421d21e7fc2b955ba4462e58a01f22ff";
const EVIDENCE_JSON_PATH = path.join(ROOT, "docs", "live-logs", "browser-test-lc3-engine-tournament.json");
const EVIDENCE_MD_PATH = path.join(ROOT, "docs", "live-logs", "browser-test-lc3-engine-tournament.md");
const EXAMPLE_RESULT_PATH = path.join(ROOT, "docs", "test-data", "laboratory-lc3", "example-engine-tournament.json");

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
  for (const expected of [
    'const LABORATORY_ENGINE_TOURNAMENT_SCHEMA_VERSION = "swarmsim-lab.engine-tournament.v1"',
    "function runLaboratoryEngineTournament(options = {})",
    "function laboratoryObserveRuntimeEngineChoice(game, sourceSave)",
    "function laboratoryValidateEngineTournament(tournament)",
    "runEngineTournament(options = {})",
  ]) {
    assert(userscript.includes(expected), `missing LC-3 engine-tournament surface: ${expected}`);
  }

  const ld01Bytes = fs.readFileSync(LD01_SAVE_PATH);
  const ld01Sha256 = crypto.createHash("sha256").update(ld01Bytes).digest("hex");
  assert(ld01Sha256 === EXPECTED_LD01_SHA256, `LD-01 save hash mismatch: expected ${EXPECTED_LD01_SHA256}, got ${ld01Sha256}`);
  const ld01Save = ld01Bytes.toString("utf8").trim();

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
    await page.waitForFunction(() => !!window.kbcSwarmBot?.laboratory?.runEngineTournament, { timeout: 60000 });

    const report = await page.evaluate(async (saveString) => {
      const bot = window.kbcSwarmBot;
      const result = await bot.laboratory.runEngineTournament({
        experimentId: "LC3-LD01",
        captureTimestamp: "2026-07-23T00:00:00.000Z",
        phaseTarget: "larva-engine-throughput",
        sourceSave: saveString,
      });
      return { result };
    }, ld01Save);

    const t = report.result;
    assert(t?.ok === true, `engine tournament failed: ${t?.error || ""}`);
    assert(t.validity?.ok === true, `engine tournament invalid: ${(t.validity?.errors || []).join("; ")}`);
    const tour = t.tournament;
    assert(tour?.schemaVersion === "swarmsim-lab.engine-tournament.v1", "unexpected engine-tournament schema");
    assert(tour?.metricModel === "instantaneous-larva-rate-delta", "unexpected metric model");
    assert(typeof tour?.oracleIndependence === "string" && tour.oracleIndependence.length > 0, "missing oracle-independence statement");

    const byId = Object.fromEntries((tour.candidates || []).map((c) => [c.candidateId, c]));
    assert(byId.HOLD && byId.BUY_EXPANSION && byId.BUY_HATCHERY, "tournament missing HOLD/Expansion/Hatchery candidates");
    // Every candidate reports the independent larva-rate metric.
    for (const id of ["HOLD", "BUY_EXPANSION", "BUY_HATCHERY"]) {
      const c = byId[id];
      assert(c.metric && typeof c.metric.larvaRateBefore === "string" && typeof c.metric.larvaRateAfter === "string", `${id} missing larva-rate metric`);
    }
    // Sibling isolation: identical raw-state restore per candidate, source unchanged.
    assert(tour.siblingIsolation?.allRestoredIdenticalToSource === true, "a candidate restore diverged from source");
    assert(tour.siblingIsolation?.sourceRawStateUnchanged === true, "source raw state changed after the tournament");
    // An independent winner was selected by the Laboratory metric.
    assert(!!tour.laboratoryWinner, "no independent Laboratory winner selected");
    assert(["HOLD", "BUY_EXPANSION", "BUY_HATCHERY", "BUY_ACHIEVEMENT_LARVA"].includes(tour.laboratoryWinner), "winner is not a known candidate");
    // The production Engine choice was actually observed and mapped, so the
    // fixed-order-vs-Laboratory comparison is genuinely exercised.
    assert(tour.runtimeChoice?.status === "observed", `runtime Engine choice not observed: ${tour.runtimeChoice?.raw || ""}`);
    assert(["BUY_EXPANSION", "BUY_HATCHERY", "HOLD"].includes(tour.runtimeChoice.engineChoice), "runtime Engine choice not mapped to a candidate");
    // Agreement is a resolved boolean once both winner and runtime choice exist.
    assert(tour.winnerAgreesWithRuntime === true || tour.winnerAgreesWithRuntime === false, "winner/runtime agreement not resolved to a boolean");
    // Both Engine actions executed their bounded click (buyable in this economy).
    assert(byId.BUY_EXPANSION.command.executed === true, "Expansion click did not execute (not buyable in LD-01)");
    assert(byId.BUY_HATCHERY.command.executed === true, "Hatchery click did not execute (not buyable in LD-01)");

    const evidence = {
      verdict: "LABORATORY LC-3 ENGINE TOURNAMENT VERIFIED",
      implementationCommit: process.env.GIT_COMMIT || null,
      metricModel: tour.metricModel,
      timingModel: tour.timingModel,
      phaseTarget: tour.phaseTarget,
      ld01Save: { path: path.relative(ROOT, LD01_SAVE_PATH).replace(/\\/g, "/"), sha256: EXPECTED_LD01_SHA256 },
      sourceRawStateHash: tour.source?.rawStateHash || null,
      sourceRawStateUnchanged: tour.siblingIsolation?.sourceRawStateUnchanged,
      allRestoredIdentical: tour.siblingIsolation?.allRestoredIdenticalToSource,
      laboratoryWinner: tour.laboratoryWinner,
      winnerMarginPercent: tour.winnerMarginPercent,
      runtimeChoice: tour.runtimeChoice?.engineChoice || null,
      runtimeChoiceRaw: tour.runtimeChoice?.raw || null,
      winnerAgreesWithRuntime: tour.winnerAgreesWithRuntime,
      candidates: (tour.candidates || []).map((c) => ({
        candidateId: c.candidateId,
        executed: c.command?.executed ?? null,
        larvaRateBefore: c.metric?.larvaRateBefore,
        larvaRateAfter: c.metric?.larvaRateAfter,
        larvaGainPercent: c.metric?.larvaGainPercent,
        expansionEtaSeconds: c.metric?.expansionEtaSeconds,
        hatcheryEtaSeconds: c.metric?.hatcheryEtaSeconds,
      })),
    };

    if (writeEvidence) {
      writeText(EXAMPLE_RESULT_PATH, JSON.stringify(tour, null, 2));
      writeText(EVIDENCE_JSON_PATH, JSON.stringify(evidence, null, 2));
      writeText(EVIDENCE_MD_PATH, [
        "# SwarmSim Laboratory LC-3 Engine Tournament Verification",
        "",
        `- Verdict: ${evidence.verdict}`,
        `- Implementation commit: ${evidence.implementationCommit || "unknown"}`,
        `- Metric model: ${evidence.metricModel}`,
        `- Timing model: ${evidence.timingModel}`,
        `- Phase target: ${evidence.phaseTarget}`,
        `- Source save (LD-01): ${evidence.ld01Save.path} (sha256 ${evidence.ld01Save.sha256})`,
        `- Source raw-state unchanged after tournament: ${evidence.sourceRawStateUnchanged}`,
        `- All candidate restores identical to source: ${evidence.allRestoredIdentical}`,
        `- Laboratory independent winner: ${evidence.laboratoryWinner} (margin ${evidence.winnerMarginPercent}% )`,
        `- Runtime-observed Engine choice: ${evidence.runtimeChoice} (raw: ${evidence.runtimeChoiceRaw})`,
        `- Winner agrees with runtime: ${evidence.winnerAgreesWithRuntime}`,
        "",
        "| Candidate | Executed | larva/s before | larva/s after | larva gain % |",
        "|---|---|---|---|---|",
        ...evidence.candidates.map((c) => `| ${c.candidateId} | ${c.executed} | ${c.larvaRateBefore} | ${c.larvaRateAfter} | ${c.larvaGainPercent} |`),
        "",
      ].join("\n"));
    }

    console.log("LABORATORY LC-3 ENGINE TOURNAMENT CHECK PASSED");
    console.log(JSON.stringify(evidence, null, 2));
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error?.stack || error?.message || String(error));
  process.exitCode = 1;
});

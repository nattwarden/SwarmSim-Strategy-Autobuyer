#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { getBrowser } = require("./lib/browser-harness");

const ROOT = path.resolve(__dirname, "..");
const USERSCRIPT_PATH = path.join(ROOT, "src", "SwarmSim-Strategy-Autobuyer.user.js");
// LD-09: balanced natural Nexus 5 (energy ~72.6k, abilities castable). LD-07: a
// pre-Nexus-5 first-Nexus energy state, kept separate per the LC-6 contract.
const LD09_SAVE_PATH = path.join(ROOT, "docs", "test-data", "player-saves", "manual-play-natural-nexus5-2026-07-24.txt");
const EXPECTED_LD09_SHA256 = "3419b7846db89047312c4e5f70b041092228b1b39b8793f04800c37460cbec7f";
const LD07_SAVE_PATH = path.join(ROOT, "docs", "test-data", "player-saves", "manual-play-first-nexus-baseline-2026-07-21.txt");
const EXPECTED_LD07_SHA256 = "3f5138065ceaf84c83a28d5965a5b4e53113dea32686553ab00bdba6f321bd90";
const EVIDENCE_JSON_PATH = path.join(ROOT, "docs", "live-logs", "browser-test-lc6-energy-tournament.json");
const EVIDENCE_MD_PATH = path.join(ROOT, "docs", "live-logs", "browser-test-lc6-energy-tournament.md");
const EXAMPLE_RESULT_PATH = path.join(ROOT, "docs", "test-data", "laboratory-lc6", "example-energy-tournament.json");

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
    'const LABORATORY_ENERGY_TOURNAMENT_SCHEMA_VERSION = "swarmsim-lab.energy-tournament.v1"',
    "function laboratoryCaptureAutoCastAuthority()",
    "function runLaboratoryEnergyTournament(options = {})",
    "runEnergyTournament(options = {})",
  ]) {
    assert(userscript.includes(expected), `missing LC-6 energy-tournament surface: ${expected}`);
  }

  const ld09Save = readPinnedSave(LD09_SAVE_PATH, EXPECTED_LD09_SHA256);
  const ld07Save = readPinnedSave(LD07_SAVE_PATH, EXPECTED_LD07_SHA256);

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
    await page.waitForFunction(() => !!window.kbcSwarmBot?.laboratory?.runEnergyTournament, { timeout: 60000 });

    const report = await page.evaluate(async ([ld09, ld07]) => {
      const bot = window.kbcSwarmBot;
      const nexus5 = await bot.laboratory.runEnergyTournament({
        experimentId: "LC6-LD09", captureTimestamp: "2026-07-23T00:00:00.000Z",
        phaseTarget: "larva-throughput-at-nexus-energy", horizonsSeconds: [0, 3600], sourceSave: ld09,
      });
      const preNexus5 = await bot.laboratory.runEnergyTournament({
        experimentId: "LC6-LD07", captureTimestamp: "2026-07-23T00:00:00.000Z",
        phaseTarget: "larva-throughput-at-nexus-energy", horizonsSeconds: [0, 3600], sourceSave: ld07,
      });
      return { nexus5, preNexus5 };
    }, [ld09Save, ld07Save]);

    // Primary source LD-09 (Nexus 5).
    const t = report.nexus5;
    assert(t?.ok === true, `LD-09 energy tournament failed: ${t?.error || ""}`);
    assert(t.validity?.ok === true, `LD-09 energy result invalid: ${(t.validity?.errors || []).join("; ")}`);
    const tour = t.tournament;
    assert(tour?.schemaVersion === "swarmsim-lab.energy-tournament.v1", "unexpected energy-tournament schema");
    assert(typeof tour?.oracleIndependence === "string" && tour.oracleIndependence.length > 0, "missing oracle-independence statement");
    assert(JSON.stringify(tour?.horizonsSeconds) === JSON.stringify([0, 3600]), `unexpected horizons: ${JSON.stringify(tour?.horizonsSeconds)}`);

    const byId = Object.fromEntries((tour.candidates || []).map((c) => [c.candidateId, c]));
    assert(byId.HOLD, "missing HOLD baseline");

    // Multiple energy-domain candidates cast/bought in the Nexus-5 economy.
    const executed = (tour.candidates || []).filter((c) => c.executed);
    assert(executed.length >= 2, `expected >= 2 executed energy candidates, got ${executed.length}`);
    // Every executed cast/buy actually spent energy (proving a real cast).
    for (const c of executed) {
      assert(Number(c.energySpent) > 0, `${c.candidateId} executed but spent no energy (${c.energySpent})`);
    }
    // Every candidate reports energy and horizons, none hidden.
    for (const c of tour.candidates) {
      assert(typeof c.energySpent === "string", `${c.candidateId} missing energy spend`);
      assert(Array.isArray(c.horizons) && c.horizons.length === 2, `${c.candidateId} did not measure both horizons`);
    }

    // Isolation and independent winner.
    assert(tour.siblingIsolation?.allRestoredIdenticalToSource === true, "a candidate restore diverged from source");
    assert(tour.siblingIsolation?.sourceRawStateUnchanged === true, "source raw state changed after the tournament");
    assert(!!tour.laboratoryWinner, "no independent Laboratory winner selected");
    assert(tour.laboratoryWinner === "HOLD" || byId[tour.laboratoryWinner]?.executed === true, "winner did not execute");

    // Safety: advisor-only actions remain non-executable in production. Casting
    // abilities in disposable sandboxes never changed production auto-cast authority.
    assert(tour.advisorOnlyAuthority?.unchanged === true, "production auto-cast authority changed during the tournament");
    assert(tour.advisorOnlyAuthority.after.autoCastAbilities === false, "autoCastAbilities was flipped on");
    assert(tour.advisorOnlyAuthority.after.autoCastHouseOfMirrors === false, "autoCastHouseOfMirrors was flipped on");
    assert(tour.advisorOnlyAuthority.after.autoAscend === false, "autoAscend was flipped on");

    // Pre-Nexus-5 source (LD-07) kept separate: core invariants hold there too.
    const n = report.preNexus5;
    assert(n?.ok === true, `LD-07 energy tournament failed: ${n?.error || ""}`);
    assert(n.validity?.ok === true, `LD-07 energy result invalid: ${(n.validity?.errors || []).join("; ")}`);
    assert(n.tournament?.siblingIsolation?.sourceRawStateUnchanged === true, "LD-07 source raw state changed");
    assert(n.tournament?.advisorOnlyAuthority?.unchanged === true, "LD-07 auto-cast authority changed");
    assert(!!n.tournament?.laboratoryWinner, "LD-07 has no independent winner");

    const summarize = (tr) => ({
      lanesWinner: tr.laboratoryWinner,
      executedCount: (tr.candidates || []).filter((c) => c.executed).length,
      sourceRawStateUnchanged: tr.siblingIsolation?.sourceRawStateUnchanged,
      advisorAuthorityUnchanged: tr.advisorOnlyAuthority?.unchanged,
      candidates: (tr.candidates || []).map((c) => ({
        candidateId: c.candidateId,
        executed: c.executed,
        energySpent: c.energySpent,
        larvaByHorizon: (c.horizons || []).map((h) => `${h.horizonSeconds}s=${h.larva}`),
      })),
    });

    const evidence = {
      verdict: "LABORATORY LC-6 ENERGY TOURNAMENT VERIFIED",
      implementationCommit: process.env.GIT_COMMIT || null,
      metricModel: tour.metricModel,
      timingModel: tour.timingModel,
      horizonsSeconds: tour.horizonsSeconds,
      advisorOnlyAuthority: tour.advisorOnlyAuthority,
      ld09: { save: { path: path.relative(ROOT, LD09_SAVE_PATH).replace(/\\/g, "/"), sha256: EXPECTED_LD09_SHA256 }, ...summarize(tour) },
      ld07PreNexus5: { save: { path: path.relative(ROOT, LD07_SAVE_PATH).replace(/\\/g, "/"), sha256: EXPECTED_LD07_SHA256 }, ...summarize(n.tournament) },
    };

    if (writeEvidence) {
      writeText(EXAMPLE_RESULT_PATH, JSON.stringify(tour, null, 2));
      writeText(EVIDENCE_JSON_PATH, JSON.stringify(evidence, null, 2));
      writeText(EVIDENCE_MD_PATH, [
        "# SwarmSim Laboratory LC-6 Energy Tournament Verification",
        "",
        `- Verdict: ${evidence.verdict}`,
        `- Implementation commit: ${evidence.implementationCommit || "unknown"}`,
        `- Metric model: ${evidence.metricModel}; timing: ${evidence.timingModel}; horizons (s): ${JSON.stringify(evidence.horizonsSeconds)}`,
        `- Advisor-only authority unchanged (advisor-only actions non-executable in production): ${evidence.advisorOnlyAuthority.unchanged}`,
        `- Auto-cast after: ${JSON.stringify(evidence.advisorOnlyAuthority.after)}`,
        "",
        "## LD-09 (balanced natural Nexus 5)",
        `- Winner: ${evidence.ld09.lanesWinner}; executed: ${evidence.ld09.executedCount}; source unchanged: ${evidence.ld09.sourceRawStateUnchanged}`,
        "",
        "| Candidate | Executed | energy spent | larva by horizon |",
        "|---|---|---|---|",
        ...evidence.ld09.candidates.map((c) => `| ${c.candidateId} | ${c.executed} | ${c.energySpent} | ${c.larvaByHorizon.join(", ")} |`),
        "",
        "## LD-07 (pre-Nexus-5, kept separate)",
        `- Winner: ${evidence.ld07PreNexus5.lanesWinner}; executed: ${evidence.ld07PreNexus5.executedCount}; source unchanged: ${evidence.ld07PreNexus5.sourceRawStateUnchanged}; authority unchanged: ${evidence.ld07PreNexus5.advisorAuthorityUnchanged}`,
        "",
      ].join("\n"));
    }

    console.log("LABORATORY LC-6 ENERGY TOURNAMENT CHECK PASSED");
    console.log(JSON.stringify(evidence, null, 2));
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error?.stack || error?.message || String(error));
  process.exitCode = 1;
});

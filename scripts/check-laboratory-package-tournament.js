#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { getBrowser } = require("./lib/browser-harness");

const ROOT = path.resolve(__dirname, "..");
const USERSCRIPT_PATH = path.join(ROOT, "src", "SwarmSim-Strategy-Autobuyer.user.js");
// LD-02 in the LC runbook: the first-Nest-sacrifice scenario, where a
// build -> sacrifice -> rebuild package is meaningful.
const LD02_SAVE_PATH = path.join(ROOT, "docs", "test-data", "player-saves", "manual-play-first-nest-threshold-2026-07-18.txt");
const EXPECTED_LD02_SHA256 = "a86d8524e351fd3034ff4fe89e10644713a40f87a69e00ca55b19bf5d5076cbd";
const EVIDENCE_JSON_PATH = path.join(ROOT, "docs", "live-logs", "browser-test-lc5-package-tournament.json");
const EVIDENCE_MD_PATH = path.join(ROOT, "docs", "live-logs", "browser-test-lc5-package-tournament.md");
const EXAMPLE_RESULT_PATH = path.join(ROOT, "docs", "test-data", "laboratory-lc5", "example-package-tournament.json");

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
    'const LABORATORY_PACKAGE_TOURNAMENT_SCHEMA_VERSION = "swarmsim-lab.package-tournament.v1"',
    "function laboratoryRunPackageSteps(game, steps)",
    "function runLaboratoryPackageTournament(options = {})",
    "runPackageTournament(options = {})",
  ]) {
    assert(userscript.includes(expected), `missing LC-5 package-tournament surface: ${expected}`);
  }

  const bytes = fs.readFileSync(LD02_SAVE_PATH);
  const sha = crypto.createHash("sha256").update(bytes).digest("hex");
  assert(sha === EXPECTED_LD02_SHA256, `LD-02 save hash mismatch: expected ${EXPECTED_LD02_SHA256}, got ${sha}`);
  const ld02Save = bytes.toString("utf8").trim();

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
    await page.waitForFunction(() => !!window.kbcSwarmBot?.laboratory?.runPackageTournament, { timeout: 60000 });

    const report = await page.evaluate(async (saveString) => {
      const bot = window.kbcSwarmBot;
      const result = await bot.laboratory.runPackageTournament({
        experimentId: "LC5-LD02",
        captureTimestamp: "2026-07-23T00:00:00.000Z",
        phaseTarget: "larva-throughput-with-reconstruction",
        horizonsSeconds: [0, 300, 3600],
        sourceSave: saveString,
        packages: [
          { packageId: "engine-hatchery-expansion", steps: [
            { stepId: "build-hatchery", action: "build", kind: "upgrade", targetId: "hatchery", amount: "1" },
            { stepId: "build-expansion", action: "build", kind: "upgrade", targetId: "expansion", amount: "1" },
          ] },
          { packageId: "queen-nest-sacrifice-rebuild", steps: [
            { stepId: "build-queen", action: "build", kind: "unit", targetId: "queen", amount: "1" },
            { stepId: "sacrifice-nest", action: "sacrifice", kind: "unit", targetId: "nest", amount: "1" },
            { stepId: "rebuild-queen", action: "rebuild", kind: "unit", targetId: "queen", amount: "1" },
          ] },
          { packageId: "invalid-stop", steps: [
            { stepId: "build-nonexistent", action: "build", kind: "upgrade", targetId: "__no_such_upgrade__", amount: "1" },
          ] },
        ],
      });
      return { result };
    }, ld02Save);

    const t = report.result;
    assert(t?.ok === true, `package tournament failed: ${t?.error || ""}`);
    assert(t.validity?.ok === true, `package tournament invalid: ${(t.validity?.errors || []).join("; ")}`);
    const tour = t.tournament;
    assert(tour?.schemaVersion === "swarmsim-lab.package-tournament.v1", "unexpected package-tournament schema");
    assert(tour?.metricModel === "active-larva-rate-post-package", "unexpected metric model");
    // The passive horizons are honestly not claimed: live-site skipTime is a no-op.
    assert(typeof tour?.horizonModel === "string" && /skiptime/i.test(tour.horizonModel), "missing honest active-only horizon model");

    const byId = Object.fromEntries((tour.packages || []).map((p) => [p.packageId, p]));
    assert(byId.HOLD, "missing HOLD baseline");
    assert(byId["engine-hatchery-expansion"] && byId["queen-nest-sacrifice-rebuild"] && byId["invalid-stop"], "missing expected packages");

    // Every package reports the active larva-rate metric.
    for (const p of tour.packages) {
      assert(p.active && typeof p.active.larvaRate === "string", `${p.packageId} missing active larva-rate metric`);
    }

    // Multi-step declarative package completed all its bounded steps.
    const engine = byId["engine-hatchery-expansion"];
    assert(engine.stepCount === 2 && engine.completed === true, "engine package did not complete its two bounded steps");
    assert(engine.steps.every((s) => s.command.executed === true), "an engine package step did not execute");

    // build -> sacrifice -> rebuild ran as a declarative sequence.
    const sacrifice = byId["queen-nest-sacrifice-rebuild"];
    assert(sacrifice.stepCount === 3, "sacrifice package did not have 3 declared steps");
    assert(sacrifice.completed === true, `sacrifice package did not complete: invalidatedAt=${sacrifice.invalidatedAt} (${sacrifice.invalidationReason})`);

    // Stop-on-invalidation: the invalid package halted at its first step and
    // recorded why, without looping or improvising.
    const invalid = byId["invalid-stop"];
    assert(invalid.completed === false, "invalid package should not complete");
    assert(invalid.invalidatedAt === "build-nonexistent", `unexpected invalidation point: ${invalid.invalidatedAt}`);
    assert(invalid.invalidationReason === "target-unresolved", `unexpected invalidation reason: ${invalid.invalidationReason}`);

    // Isolation and independent winner.
    assert(tour.siblingIsolation?.allRestoredIdenticalToSource === true, "a package branch restore diverged from source");
    assert(tour.siblingIsolation?.sourceRawStateUnchanged === true, "source raw state changed after the tournament");
    assert(!!tour.laboratoryWinner, "no independent Laboratory winner selected");
    assert(tour.laboratoryWinner !== "invalid-stop", "an invalidated package must not win");

    const evidence = {
      verdict: "LABORATORY LC-5 PACKAGE TOURNAMENT VERIFIED",
      implementationCommit: process.env.GIT_COMMIT || null,
      metricModel: tour.metricModel,
      timingModel: tour.timingModel,
      horizonModel: tour.horizonModel,
      phaseTarget: tour.phaseTarget,
      requestedHorizonsSeconds: tour.requestedHorizonsSeconds,
      reserveMultiplier: tour.reserveMultiplier,
      ld02Save: { path: path.relative(ROOT, LD02_SAVE_PATH).replace(/\\/g, "/"), sha256: EXPECTED_LD02_SHA256 },
      sourceRawStateUnchanged: tour.siblingIsolation?.sourceRawStateUnchanged,
      allRestoredIdentical: tour.siblingIsolation?.allRestoredIdenticalToSource,
      laboratoryWinner: tour.laboratoryWinner,
      packages: (tour.packages || []).map((p) => ({
        packageId: p.packageId,
        stepCount: p.stepCount,
        completed: p.completed,
        invalidatedAt: p.invalidatedAt,
        invalidationReason: p.invalidationReason,
        activeLarvaRate: p.active?.larvaRate,
        activeLarva: p.active?.larva,
      })),
    };

    if (writeEvidence) {
      writeText(EXAMPLE_RESULT_PATH, JSON.stringify(tour, null, 2));
      writeText(EVIDENCE_JSON_PATH, JSON.stringify(evidence, null, 2));
      writeText(EVIDENCE_MD_PATH, [
        "# SwarmSim Laboratory LC-5 Package Tournament Verification",
        "",
        `- Verdict: ${evidence.verdict}`,
        `- Implementation commit: ${evidence.implementationCommit || "unknown"}`,
        `- Metric model: ${evidence.metricModel}`,
        `- Timing model: ${evidence.timingModel}`,
        `- Horizon model: ${evidence.horizonModel}`,
        `- Requested horizons (s): ${JSON.stringify(evidence.requestedHorizonsSeconds)}; reserve multiplier: ${evidence.reserveMultiplier}`,
        `- Source save (LD-02): ${evidence.ld02Save.path} (sha256 ${evidence.ld02Save.sha256})`,
        `- All branch restores identical / source unchanged: ${evidence.allRestoredIdentical} / ${evidence.sourceRawStateUnchanged}`,
        `- Laboratory winner (active larva rate): ${evidence.laboratoryWinner}`,
        "",
        "| Package | Steps | Completed | Invalidated at | active larva/s | active larva |",
        "|---|---|---|---|---|---|",
        ...evidence.packages.map((p) => `| ${p.packageId} | ${p.stepCount} | ${p.completed} | ${p.invalidatedAt || "-"} | ${p.activeLarvaRate} | ${p.activeLarva} |`),
        "",
      ].join("\n"));
    }

    console.log("LABORATORY LC-5 PACKAGE TOURNAMENT CHECK PASSED");
    console.log(JSON.stringify(evidence, null, 2));
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error?.stack || error?.message || String(error));
  process.exitCode = 1;
});

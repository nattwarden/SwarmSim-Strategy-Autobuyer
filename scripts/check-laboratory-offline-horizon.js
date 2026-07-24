#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { getBrowser } = require("./lib/browser-harness");

const ROOT = path.resolve(__dirname, "..");
const USERSCRIPT_PATH = path.join(ROOT, "src", "SwarmSim-Strategy-Autobuyer.user.js");
// LD-09: balanced natural Nexus 5 (has a real premutagen; natural timing must
// never be synthesized). Its offline return over elapsed horizons is measured.
const LD09_SAVE_PATH = path.join(ROOT, "docs", "test-data", "player-saves", "manual-play-natural-nexus5-2026-07-24.txt");
const EXPECTED_LD09_SHA256 = "3419b7846db89047312c4e5f70b041092228b1b39b8793f04800c37460cbec7f";
const EVIDENCE_JSON_PATH = path.join(ROOT, "docs", "live-logs", "browser-test-lc7-offline-horizon.json");
const EVIDENCE_MD_PATH = path.join(ROOT, "docs", "live-logs", "browser-test-lc7-offline-horizon.md");
const EXAMPLE_RESULT_PATH = path.join(ROOT, "docs", "test-data", "laboratory-lc7", "example-offline-horizon.json");

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
    'const LABORATORY_OFFLINE_HORIZON_SCHEMA_VERSION = "swarmsim-lab.offline-horizon.v1"',
    "function runLaboratoryOfflineHorizonExperiment(options = {})",
    "function laboratoryValidateOfflineHorizonExperiment(experiment)",
    "runOfflineHorizonExperiment(options = {})",
  ]) {
    assert(userscript.includes(expected), `missing LC-7 offline-horizon surface: ${expected}`);
  }

  const bytes = fs.readFileSync(LD09_SAVE_PATH);
  const sha = crypto.createHash("sha256").update(bytes).digest("hex");
  assert(sha === EXPECTED_LD09_SHA256, `LD-09 save hash mismatch: expected ${EXPECTED_LD09_SHA256}, got ${sha}`);
  const ld09Save = bytes.toString("utf8").trim();

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
    await page.waitForFunction(() => !!window.kbcSwarmBot?.laboratory?.runOfflineHorizonExperiment, { timeout: 60000 });

    const report = await page.evaluate(async (saveString) => {
      const bot = window.kbcSwarmBot;
      const result = await bot.laboratory.runOfflineHorizonExperiment({
        experimentId: "LC7-LD09",
        captureTimestamp: "2026-07-23T00:00:00.000Z",
        phaseTarget: "elapsed-offline-return",
        provenance: "natural",
        horizonsSeconds: [300, 3600, 86400, 604800],
        sampleCount: 3,
        sourceSave: saveString,
      });
      return { result };
    }, ld09Save);

    const t = report.result;
    assert(t?.ok === true, `offline horizon experiment failed: ${t?.error || ""}`);
    assert(t.validity?.ok === true, `offline horizon experiment invalid: ${(t.validity?.errors || []).join("; ")}`);
    const exp = t.experiment;
    assert(exp?.schemaVersion === "swarmsim-lab.offline-horizon.v1", "unexpected offline-horizon schema");
    assert(exp?.timingModel === "live-site-tick-reify-horizons", "unexpected timing model");
    assert(exp?.uncertaintyModel === "multi-sample-wall-clock-drift-band", "unexpected uncertainty model");

    // Natural/injected provenance is tagged and never synthesized/merged.
    assert(exp?.provenance === "natural", `expected natural provenance, got ${exp?.provenance}`);
    assert(exp?.naturalTimingSynthesized === false, "natural timing must never be synthesized");

    // Sampling: the requested number of samples, each covering all horizons.
    assert(exp?.sampleCount === 3, `expected 3 samples, got ${exp?.sampleCount}`);
    assert(Array.isArray(exp?.samples) && exp.samples.length === 3, "samples array should have 3 entries");

    // Per-horizon uncertainty band across samples for 5m/1h/1d/long-return.
    assert(Array.isArray(exp?.horizonStats) && exp.horizonStats.length === 4, `expected 4 horizon stats, got ${exp?.horizonStats?.length}`);
    const stats = Object.fromEntries(exp.horizonStats.map((h) => [h.horizonSeconds, h]));
    for (const s of [300, 3600, 86400, 604800]) {
      assert(stats[s], `missing horizon stat for ${s}s`);
      assert(stats[s].sampleCount === 3, `${s}s did not aggregate 3 samples`);
      assert(typeof stats[s].meanLarva === "string" && typeof stats[s].minLarva === "string" && typeof stats[s].maxLarva === "string", `${s}s missing uncertainty band`);
      assert(typeof stats[s].spreadPercent === "number", `${s}s missing spread`);
    }

    // Offline return grows with elapsed time (the tick+reify horizon works over
    // long horizons): 1h mean > 5m mean, and the long-return mean is not smaller.
    assert(Number(stats[3600].meanLarva) > Number(stats[300].meanLarva), "larva did not grow from 5m to 1h offline");
    assert(Number(stats[604800].meanLarva) >= Number(stats[300].meanLarva), "long-return mean fell below the 5m mean");

    // Isolation and no-production-execution safety.
    assert(exp?.siblingIsolation?.allRestoredIdenticalToSource === true, "a sample restore diverged from source");
    assert(exp?.siblingIsolation?.sourceRawStateUnchanged === true, "source raw state changed after the experiment");
    assert(exp?.advisorOnlyAuthority?.unchanged === true, "production auto-cast/Ascension authority changed");
    assert(exp?.advisorOnlyAuthority.after.autoAscend === false, "autoAscend was flipped on");
    assert(exp?.advisorOnlyAuthority.after.autoCastAbilities === false, "autoCastAbilities was flipped on");

    const evidence = {
      verdict: "LABORATORY LC-7 OFFLINE HORIZON EXPERIMENT VERIFIED",
      implementationCommit: process.env.GIT_COMMIT || null,
      timingModel: exp.timingModel,
      uncertaintyModel: exp.uncertaintyModel,
      provenance: exp.provenance,
      naturalTimingSynthesized: exp.naturalTimingSynthesized,
      sampleCount: exp.sampleCount,
      advisorOnlyAuthority: exp.advisorOnlyAuthority,
      ld09Save: { path: path.relative(ROOT, LD09_SAVE_PATH).replace(/\\/g, "/"), sha256: EXPECTED_LD09_SHA256 },
      sourceRawStateUnchanged: exp.siblingIsolation?.sourceRawStateUnchanged,
      allRestoredIdentical: exp.siblingIsolation?.allRestoredIdenticalToSource,
      horizonStats: exp.horizonStats,
    };

    if (writeEvidence) {
      writeText(EXAMPLE_RESULT_PATH, JSON.stringify(exp, null, 2));
      writeText(EVIDENCE_JSON_PATH, JSON.stringify(evidence, null, 2));
      writeText(EVIDENCE_MD_PATH, [
        "# SwarmSim Laboratory LC-7 Offline Horizon Experiment Verification",
        "",
        `- Verdict: ${evidence.verdict}`,
        `- Implementation commit: ${evidence.implementationCommit || "unknown"}`,
        `- Timing: ${evidence.timingModel}; uncertainty: ${evidence.uncertaintyModel}`,
        `- Provenance: ${evidence.provenance} (natural timing synthesized: ${evidence.naturalTimingSynthesized})`,
        `- Samples: ${evidence.sampleCount}; source raw state unchanged: ${evidence.sourceRawStateUnchanged}; restores identical: ${evidence.allRestoredIdentical}`,
        `- Advisor-only authority unchanged (no production Ascension/auto-cast): ${evidence.advisorOnlyAuthority.unchanged}`,
        `- Auto-cast/Ascension after: ${JSON.stringify(evidence.advisorOnlyAuthority.after)}`,
        "",
        "| Horizon | Samples | mean larva | min larva | max larva | spread % |",
        "|---|---|---|---|---|---|",
        ...evidence.horizonStats.map((h) => `| ${h.horizonSeconds}s | ${h.sampleCount} | ${h.meanLarva} | ${h.minLarva} | ${h.maxLarva} | ${h.spreadPercent} |`),
        "",
      ].join("\n"));
    }

    console.log("LABORATORY LC-7 OFFLINE HORIZON EXPERIMENT CHECK PASSED");
    console.log(JSON.stringify(evidence, null, 2));
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error?.stack || error?.message || String(error));
  process.exitCode = 1;
});

#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { getBrowser } = require("./lib/browser-harness");

const ROOT = path.resolve(__dirname, "..");
const USERSCRIPT_PATH = path.join(ROOT, "src", "SwarmSim-Strategy-Autobuyer.user.js");
// LD-09: balanced natural Nexus 5. Its natural premutagen accrues from the real
// game loop and is never synthesized; the first Ascension is executed in a
// disposable sandbox only.
const LD09_SAVE_PATH = path.join(ROOT, "docs", "test-data", "player-saves", "manual-play-natural-nexus5-2026-07-24.txt");
const EXPECTED_LD09_SHA256 = "3419b7846db89047312c4e5f70b041092228b1b39b8793f04800c37460cbec7f";
const EVIDENCE_JSON_PATH = path.join(ROOT, "docs", "live-logs", "browser-test-lc7-ascension.json");
const EVIDENCE_MD_PATH = path.join(ROOT, "docs", "live-logs", "browser-test-lc7-ascension.md");
const EXAMPLE_RESULT_PATH = path.join(ROOT, "docs", "test-data", "laboratory-lc7", "example-ascension.json");

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
    'const LABORATORY_ASCENSION_EXPERIMENT_SCHEMA_VERSION = "swarmsim-lab.ascension-experiment.v1"',
    "function laboratoryExecuteAscend(game)",
    "function runLaboratoryAscensionExperiment(options = {})",
    "runAscensionExperiment(options = {})",
  ]) {
    assert(userscript.includes(expected), `missing LC-7 ascension surface: ${expected}`);
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
    await page.waitForFunction(() => !!window.kbcSwarmBot?.laboratory?.runAscensionExperiment, { timeout: 60000 });

    const report = await page.evaluate(async (saveString) => {
      const bot = window.kbcSwarmBot;
      const result = await bot.laboratory.runAscensionExperiment({
        experimentId: "LC7-LD09-ASCENSION",
        captureTimestamp: "2026-07-23T00:00:00.000Z",
        provenance: "natural",
        settleMillis: 5000,
        recoveryHorizonsSeconds: [300, 3600],
        sourceSave: saveString,
      });
      return { result };
    }, ld09Save);

    const t = report.result;
    assert(t?.ok === true, `ascension experiment failed: ${t?.error || ""}`);
    assert(t.validity?.ok === true, `ascension experiment invalid: ${(t.validity?.errors || []).join("; ")}`);
    const exp = t.experiment;
    assert(exp?.schemaVersion === "swarmsim-lab.ascension-experiment.v1", "unexpected ascension schema");
    assert(exp?.provenance === "natural" && exp?.naturalTimingSynthesized === false, "natural provenance must not be synthesized");

    // Premutagen accrued naturally during the real settle (never injected).
    assert(Number(exp?.ascendNow?.settled?.premutagen) > 0, `premutagen did not accrue during settle (${exp?.ascendNow?.settled?.premutagen})`);

    // A real first Ascension executed in the sandbox: premutagen converted to
    // mutagen and the economy reset.
    const asc = exp?.ascendNow?.ascension;
    assert(asc?.ascended === true, `Ascension did not execute (status ${asc?.status})`);
    assert(asc?.economyReset === true, "Ascension did not reset the economy (nexus did not drop)");
    assert(Number(asc?.mutagenGained) > 0, `Ascension granted no mutagen (${asc?.mutagenGained})`);
    assert(Number(asc?.after?.nexus) < Number(asc?.before?.nexus), "nexus did not drop across the Ascension");

    // Post-reset recovery trajectory measured on the fresh economy.
    assert(Array.isArray(exp?.ascendNow?.postResetRecovery) && exp.ascendNow.postResetRecovery.length === 2, "post-reset recovery not measured over both horizons");
    // Hold-no-ascend branch retained the Nexus-5 economy and its premutagen.
    assert(exp?.holdNoAscend && Array.isArray(exp.holdNoAscend.horizons) && exp.holdNoAscend.horizons.length === 2, "hold-no-ascend branch missing horizons");
    // Cross-reset ranking is honestly deferred (no collapsed single score).
    assert(exp?.crossResetRankingDeferred === true, "cross-reset ranking should be deferred, not collapsed into one score");

    // Safety: the sandbox Ascension never touched production authority, and the
    // source save is unchanged after the sandbox reset.
    assert(exp?.advisorOnlyAuthority?.unchanged === true, "production Ascension/auto-cast authority changed");
    assert(exp?.advisorOnlyAuthority.after.autoAscend === false, "autoAscend was flipped on");
    assert(exp?.siblingIsolation?.sourceRawStateUnchanged === true, "source raw state changed after the sandbox Ascension");
    assert(exp?.siblingIsolation?.restoresIdenticalToSource === true, "a branch restore diverged from source");

    const evidence = {
      verdict: "LABORATORY LC-7 ASCENSION EXPERIMENT VERIFIED",
      implementationCommit: process.env.GIT_COMMIT || null,
      timingModel: exp.timingModel,
      provenance: exp.provenance,
      settleMillis: exp.settleMillis,
      advisorOnlyAuthority: exp.advisorOnlyAuthority,
      sourceRawStateUnchanged: exp.siblingIsolation?.sourceRawStateUnchanged,
      ld09Save: { path: path.relative(ROOT, LD09_SAVE_PATH).replace(/\\/g, "/"), sha256: EXPECTED_LD09_SHA256 },
      ascendNow: {
        settledPremutagen: exp.ascendNow.settled.premutagen,
        mutagenGained: exp.ascendNow.ascension.mutagenGained,
        economyReset: exp.ascendNow.ascension.economyReset,
        nexusBefore: exp.ascendNow.ascension.before.nexus,
        nexusAfter: exp.ascendNow.ascension.after.nexus,
        postResetRecovery: exp.ascendNow.postResetRecovery.map((h) => `${h.horizonSeconds}s=${h.larva}`),
      },
      holdNoAscend: {
        premutagenRetained: exp.holdNoAscend.settled.premutagen,
        larvaByHorizon: exp.holdNoAscend.horizons.map((h) => `${h.horizonSeconds}s=${h.larva}`),
      },
      crossResetRankingDeferred: exp.crossResetRankingDeferred,
    };

    if (writeEvidence) {
      writeText(EXAMPLE_RESULT_PATH, JSON.stringify(exp, null, 2));
      writeText(EVIDENCE_JSON_PATH, JSON.stringify(evidence, null, 2));
      writeText(EVIDENCE_MD_PATH, [
        "# SwarmSim Laboratory LC-7 First-Ascension Experiment Verification",
        "",
        `- Verdict: ${evidence.verdict}`,
        `- Implementation commit: ${evidence.implementationCommit || "unknown"}`,
        `- Timing: ${evidence.timingModel}; provenance: ${evidence.provenance}; settle: ${evidence.settleMillis}ms`,
        `- Source raw state unchanged after sandbox Ascension: ${evidence.sourceRawStateUnchanged}`,
        `- Production authority unchanged (autoAscend stays false): ${evidence.advisorOnlyAuthority.unchanged}; after: ${JSON.stringify(evidence.advisorOnlyAuthority.after)}`,
        "",
        "## Ascend now (sandbox first Ascension)",
        `- Settled premutagen: ${evidence.ascendNow.settledPremutagen}`,
        `- Mutagen gained: ${evidence.ascendNow.mutagenGained}`,
        `- Economy reset: ${evidence.ascendNow.economyReset} (nexus ${evidence.ascendNow.nexusBefore} -> ${evidence.ascendNow.nexusAfter})`,
        `- Post-reset larva recovery: ${evidence.ascendNow.postResetRecovery.join(", ")}`,
        "",
        "## Hold, no Ascension (Nexus-5 economy retained)",
        `- Premutagen retained: ${evidence.holdNoAscend.premutagenRetained}`,
        `- Larva by horizon: ${evidence.holdNoAscend.larvaByHorizon.join(", ")}`,
        `- Cross-reset ranking deferred (no collapsed score): ${evidence.crossResetRankingDeferred}`,
        "",
      ].join("\n"));
    }

    console.log("LABORATORY LC-7 ASCENSION EXPERIMENT CHECK PASSED");
    console.log(JSON.stringify(evidence, null, 2));
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error?.stack || error?.message || String(error));
  process.exitCode = 1;
});

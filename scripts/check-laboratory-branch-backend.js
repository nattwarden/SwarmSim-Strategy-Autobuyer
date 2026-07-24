#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { getBrowser } = require("./lib/browser-harness");

const ROOT = path.resolve(__dirname, "..");
const USERSCRIPT_PATH = path.join(ROOT, "src", "SwarmSim-Strategy-Autobuyer.user.js");
// LD-05 in the LC runbook: a hash-pinned retained real player save. Used here as
// a rich, multi-lane source economy where a bounded unit purchase can execute.
const REAL_SAVE_PATH = path.join(ROOT, "docs", "test-data", "player-saves", "manual-play-active-chain-pre-ascension-2026-07-18.txt");
const EXPECTED_REAL_SAVE_SHA256 = "c53f5394966e917d58957c767e3cd61d92c8850d79efb60630b7b5a5a860b95c";
const EVIDENCE_JSON_PATH = path.join(ROOT, "docs", "live-logs", "browser-test-lc2-branch-backend.json");
const EVIDENCE_MD_PATH = path.join(ROOT, "docs", "live-logs", "browser-test-lc2-branch-backend.md");
const EXAMPLE_RESULT_PATH = path.join(ROOT, "docs", "test-data", "laboratory-lc2", "example-branch-result.json");

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
    'const LABORATORY_BRANCH_RESULT_SCHEMA_VERSION = "swarmsim-lab.branch-result.v1"',
    "function laboratoryRestoreBranchSource(game, sourceSave)",
    "function laboratoryExecuteBranchCommand(game, command)",
    "function runLaboratoryDisposableBranchExperiment(options = {})",
    "runDisposableBranchExperiment(options = {})",
  ]) {
    assert(userscript.includes(expected), `missing LC-2 branch-backend surface: ${expected}`);
  }

  const realSaveBytes = fs.readFileSync(REAL_SAVE_PATH);
  const realSaveSha256 = crypto.createHash("sha256").update(realSaveBytes).digest("hex");
  assert(
    realSaveSha256 === EXPECTED_REAL_SAVE_SHA256,
    `LD-05 real save hash mismatch: expected ${EXPECTED_REAL_SAVE_SHA256}, got ${realSaveSha256}`
  );
  const realSave = realSaveBytes.toString("utf8").trim();

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
    await page.waitForFunction(() => !!window.kbcSwarmBot?.laboratory?.runDisposableBranchExperiment, { timeout: 60000 });

    const report = await page.evaluate(async (realSaveString) => {
      const bot = window.kbcSwarmBot;
      const game = window.angular.element(document.body).injector().get("game");
      bot.config.advisorOnly = true;
      bot.config.autoBuySafeDecisions = false;

      // LD-00 clean-start source captured from the fresh game before any import.
      // exportSave lives on the session in this build; fall back accordingly.
      const exportSave = typeof game.exportSave === "function"
        ? () => game.exportSave()
        : (game.session && typeof game.session.exportSave === "function" ? () => game.session.exportSave() : null);
      const hasExport = !!exportSave;
      let cleanSource = null;
      try { cleanSource = exportSave ? exportSave() : null; } catch (error) { cleanSource = null; }

      // Resolve a buyable UPGRADE in the rich LD-05 economy. Upgrades give a clean
      // four-value amount contract: unlike producer units they are not reified by
      // continuous production, so a bounded +1 buy yields delta exactly 1.
      game.importSave(realSaveString);
      await new Promise((resolve) => setTimeout(resolve, 1200));
      let buyableUpgradeId = null;
      for (const upgrade of (game.upgradelist?.() || [])) {
        try {
          if (upgrade?.isVisible?.() && upgrade?.isBuyable?.()) { buyableUpgradeId = upgrade.name; break; }
        } catch (error) { /* skip unresolved upgrade */ }
      }

      const richResult = await bot.laboratory.runDisposableBranchExperiment({
        experimentId: "LC2-RICH",
        captureTimestamp: "2026-07-23T00:00:00.000Z",
        sourceSave: realSaveString,
        branches: [
          { branchId: "sib-a", command: { kind: "upgrade", targetId: buyableUpgradeId, amount: "1" } },
          { branchId: "sib-b", command: { kind: "upgrade", targetId: buyableUpgradeId, amount: "1" } },
          { branchId: "illegal", command: { kind: "upgrade", targetId: "__no_such_upgrade__", amount: "1" } },
        ],
      });

      let cleanResult = null;
      if (cleanSource) {
        cleanResult = await bot.laboratory.runDisposableBranchExperiment({
          experimentId: "LC2-LD00",
          captureTimestamp: "2026-07-23T00:00:00.000Z",
          sourceSave: cleanSource,
          branches: [
            { branchId: "clean-a", command: { kind: "upgrade", targetId: buyableUpgradeId || "__none__", amount: "1" } },
            { branchId: "clean-b", command: { kind: "upgrade", targetId: buyableUpgradeId || "__none__", amount: "1" } },
          ],
        });
      }

      return { buyableUpgradeId, hasExport, richResult, cleanResult };
    }, realSave);

    const rich = report.richResult;
    assert(rich?.ok === true, `rich branch experiment failed: ${rich?.error || ""}`);
    assert(rich.validity?.ok === true, `rich branch result invalid: ${(rich.validity?.errors || []).join("; ")}`);
    assert(rich.branchResult?.schemaVersion === "swarmsim-lab.branch-result.v1", "unexpected branch-result schema");
    assert(rich.branchResult?.isolationModel === "sequential-single-instance", "unexpected isolation model");
    assert(rich.branchResult?.timingModel === "live-site-nonhermetic-raw-state", "unexpected timing model");

    const byId = Object.fromEntries((rich.branchResult?.branches || []).map((b) => [b.branchId, b]));
    const a = byId["sib-a"];
    const b = byId["sib-b"];
    const illegal = byId["illegal"];
    assert(a && b && illegal, "missing expected LC-2 branches");
    assert(!!report.buyableUpgradeId, "no buyable upgrade resolved in the LD-05 economy");

    // Identical restored raw-state fingerprint for every sibling.
    assert(a.restoredIdenticalToSource && b.restoredIdenticalToSource, "a sibling restore diverged from source");
    assert(a.restoredRawStateHash === b.restoredRawStateHash, "sibling restore hashes differ");
    // Executed bounded command with agreeing requested/command/confirmed/observed amounts.
    assert(a.command.executed && a.command.amountsAgree, "sib-a did not execute with agreeing four-value amounts");
    assert(b.command.executed && b.command.amountsAgree, "sib-b did not execute with agreeing four-value amounts");
    // The executed command mutated its own sandbox (target count changed by the amount).
    assert(a.sandboxMutated && b.sandboxMutated, "an executed branch did not mutate its own sandbox");
    // Failure on an illegal action: explicit rejection, no mutation.
    assert(illegal.command.executed === false && illegal.command.status === "target-unresolved", "illegal branch was not explicitly rejected");
    assert(illegal.sandboxMutated === false, "illegal branch reported a sandbox mutation");
    // Source non-mutation across all branches (raw pre-reification state).
    assert(rich.branchResult?.siblingIsolation?.sourceRawStateUnchanged === true, "source raw state changed after branches");
    assert(rich.branchResult?.siblingIsolation?.allRestoredIdenticalToSource === true, "not all siblings restored identically");

    // LD-00 clean-start source, when exportSave is available on this build.
    const clean = report.cleanResult;
    if (clean) {
      assert(clean.ok === true, `clean LD-00 branch experiment failed: ${clean?.error || ""}`);
      assert(clean.branchResult?.siblingIsolation?.allRestoredIdenticalToSource === true, "clean siblings were not identical to source");
      assert(clean.branchResult?.siblingIsolation?.sourceRawStateUnchanged === true, "clean LD-00 source raw state changed");
    }

    const evidence = {
      verdict: "LABORATORY LC-2 BRANCH BACKEND VERIFIED",
      implementationCommit: process.env.GIT_COMMIT || null,
      isolationModel: rich.branchResult?.isolationModel,
      timingModel: rich.branchResult?.timingModel,
      buyableUpgradeId: report.buyableUpgradeId,
      realSave: {
        path: path.relative(ROOT, REAL_SAVE_PATH).replace(/\\/g, "/"),
        sha256: EXPECTED_REAL_SAVE_SHA256,
      },
      rich: {
        sourceRawStateHash: rich.branchResult?.source?.rawStateHash || null,
        sourceRawStateUnchanged: rich.branchResult?.siblingIsolation?.sourceRawStateUnchanged,
        allRestoredIdentical: rich.branchResult?.siblingIsolation?.allRestoredIdenticalToSource,
        siblingRestoreHashesIdentical: a.restoredRawStateHash === b.restoredRawStateHash,
        sibA: {
          executed: a.command.executed,
          amountsAgree: a.command.amountsAgree,
          requested: a.command.requestedAmount,
          confirmed: a.command.confirmedAmount,
          observed: a.command.observedAmount,
          sandboxMutated: a.sandboxMutated,
        },
        illegalStatus: illegal.command.status,
      },
      cleanLd00: clean ? {
        available: true,
        allRestoredIdentical: clean.branchResult?.siblingIsolation?.allRestoredIdenticalToSource,
        sourceRawStateUnchanged: clean.branchResult?.siblingIsolation?.sourceRawStateUnchanged,
      } : { available: false, note: "game.exportSave unavailable on this build; LD-00 clean-start source skipped" },
    };

    if (writeEvidence) {
      writeText(EXAMPLE_RESULT_PATH, JSON.stringify(rich.branchResult, null, 2));
      writeText(EVIDENCE_JSON_PATH, JSON.stringify(evidence, null, 2));
      writeText(EVIDENCE_MD_PATH, [
        "# SwarmSim Laboratory LC-2 Disposable Branch Backend Verification",
        "",
        `- Verdict: ${evidence.verdict}`,
        `- Implementation commit: ${evidence.implementationCommit || "unknown"}`,
        `- Isolation model: ${evidence.isolationModel}`,
        `- Timing model: ${evidence.timingModel}`,
        `- Rich source save (LD-05): ${evidence.realSave.path} (sha256 ${evidence.realSave.sha256})`,
        `- Buyable upgrade resolved: ${evidence.buyableUpgradeId}`,
        `- Source raw-state hash: ${evidence.rich.sourceRawStateHash || ""}`,
        `- Source raw state unchanged after all branches: ${evidence.rich.sourceRawStateUnchanged}`,
        `- All siblings restored identically: ${evidence.rich.allRestoredIdentical}`,
        `- Sibling restore hashes identical: ${evidence.rich.siblingRestoreHashesIdentical}`,
        `- sib-a four-value amounts (requested/confirmed/observed): ${evidence.rich.sibA.requested} / ${evidence.rich.sibA.confirmed} / ${evidence.rich.sibA.observed} (agree: ${evidence.rich.sibA.amountsAgree}, sandbox mutated: ${evidence.rich.sibA.sandboxMutated})`,
        `- Illegal branch status: ${evidence.rich.illegalStatus}`,
        `- LD-00 clean-start source: ${evidence.cleanLd00.available ? `restored-identical=${evidence.cleanLd00.allRestoredIdentical}, source-unchanged=${evidence.cleanLd00.sourceRawStateUnchanged}` : evidence.cleanLd00.note}`,
        "",
      ].join("\n"));
    }

    console.log("LABORATORY LC-2 BRANCH BACKEND CHECK PASSED");
    console.log(JSON.stringify(evidence, null, 2));
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error?.stack || error?.message || String(error));
  process.exitCode = 1;
});

const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const root = path.resolve(__dirname, "..");
const userscript = fs.readFileSync(path.join(root, "src", "SwarmSim-Strategy-Autobuyer.user.js"), "utf8");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

// Builds a synthetic run-history array shaped like the bot's own runHistory
// entries: repeated main-HOLD cycles where a Meat-lane candidate is blocked
// by reserve + ability-disabled. blockedBySummary and the lane candidates'
// reason/blockers text are deliberately reworded/mismatched between variants
// so that only blockerCategories (the structured decision carrier) stays
// constant; blockedBySummary itself is left as it would render under the old
// regex-over-text approach, to prove the gate no longer reads it.
function buildHistory({ blockedBySummary, reasonText, blockerText, holdRuns }) {
  const history = [];
  for (let i = 0; i < holdRuns; i += 1) {
    history.push({
      mainActions: 0,
      blockedBySummary,
      laneCandidates: [
        {
          lane: "Meat",
          decision: "HOLD",
          candidate: "queen",
          reason: reasonText,
          blockers: [blockerText],
          blockerCategories: ["reserve", "ability-disabled", "eta-stall-signal"],
          raw: {},
        },
      ],
    });
  }
  return history;
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.goto("https://www.swarmsim.com/", { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.addScriptTag({ content: userscript });
    await page.waitForFunction(() => !!window.kbcSwarmBot?.stallBreakerDiagnostics, { timeout: 60000 });

    const report = await page.evaluate((histories) => {
      const api = window.kbcSwarmBot.stallBreakerDiagnostics;
      return {
        original: api.countReserveAbilityBlockedHolds(histories.original),
        reworded: api.countReserveAbilityBlockedHolds(histories.reworded),
        misleadingSummary: api.countReserveAbilityBlockedHolds(histories.misleadingSummary),
        etaOriginal: api.countEtaGroundedReserveAbilityBlockedHolds(histories.original),
        etaReworded: api.countEtaGroundedReserveAbilityBlockedHolds(histories.reworded),
      };
    }, {
      // "original"-style wording: what a reason string in this codebase
      // typically looks like today.
      original: buildHistory({
        blockedBySummary: "reserve, ability disabled",
        reasonText: "meat-chain reserve guard: 3.0x ratio required",
        blockerText: "ability auto-cast disabled",
        holdRuns: 3,
      }),
      // Harmless rewording: same meaning, completely different words/casing.
      // The old blockedBySummary/reason regex ("reserve", "ability disabled")
      // would not necessarily match this text; blockerCategories (set
      // explicitly here, as most real call sites already do) are unchanged.
      reworded: buildHistory({
        blockedBySummary: "reserve, ability disabled",
        reasonText: "Insufficient safety margin before the next safe chunk; auto-casting is currently switched off",
        blockerText: "casting toggle is off",
        holdRuns: 3,
      }),
      // Adversarial case: blockedBySummary itself is stale/misleading text
      // that would have made the OLD text-matching gate disagree with the
      // structured categories. The fix must ignore this string entirely.
      misleadingSummary: buildHistory({
        blockedBySummary: "none",
        reasonText: "Insufficient safety margin before the next safe chunk; auto-casting is currently switched off",
        blockerText: "casting toggle is off",
        holdRuns: 3,
      }),
    });

    assert(report.original === 3, `expected 3 consecutive reserve+ability-disabled holds for the original wording, got ${report.original}`);
    assert(
      report.reworded === report.original,
      `expected reworded reason/blocker text to produce the same hold count (${report.original}) but got ${report.reworded}`
    );
    assert(
      report.misleadingSummary === report.original,
      `expected the stall-breaker gate to ignore a stale/misleading blockedBySummary string and still count ${report.original} holds, got ${report.misleadingSummary}`
    );
    assert(
      report.etaOriginal === report.etaReworded && report.etaOriginal === 3,
      `expected the ETA-grounded hold count to also be reason-text independent (got original=${report.etaOriginal}, reworded=${report.etaReworded})`
    );

    console.log("BOOK00 F3 STRUCTURED STALL-BREAKER REGRESSION CHECK PASSED");
    console.log(JSON.stringify(report, null, 2));
  } catch (error) {
    console.error("BOOK00 F3 STRUCTURED STALL-BREAKER REGRESSION CHECK FAILED");
    console.error(error?.stack || error?.message || String(error));
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error?.stack || error?.message || String(error));
  process.exit(1);
});

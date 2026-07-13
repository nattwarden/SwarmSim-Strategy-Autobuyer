const { runMode } = require("./strategy-audit-testbed-core");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function hasReserveAbilityDisabledBlockers(cycle) {
  const blockers = String(cycle?.hardBlockers || "").toLowerCase();
  return blockers.includes("reserve") && blockers.includes("ability disabled");
}

function isAdvisorExecutionLeak(cycle) {
  const lane = String(cycle?.selectedLane || "");
  const decision = String(cycle?.selectedDecision || "").toUpperCase();
  if (!/ability|ascension|mutagen/i.test(lane)) return false;
  return decision === "BUY";
}

async function main() {
  const outcome = await runMode("live", [
    "--scenario", "book00-m8-false-wait",
    "--cycles", "5",
    "--browser-channel", "chrome",
    "--headed", "false",
    "--keep-open", "false",
    "--leave-open-on-failure", "false",
  ]);

  assert(outcome?.exitCode === 0, `strategy audit live failed with exit code ${outcome?.exitCode}`);

  const execution = Array.isArray(outcome.executions) ? outcome.executions[0] : null;
  const result = execution?.result;
  const cycles = Array.isArray(result?.cycles) ? result.cycles : [];

  assert(cycles.length >= 3, "M8 check requires at least 3 cycles");

  const blockerCycles = cycles.filter(hasReserveAbilityDisabledBlockers);
  assert(blockerCycles.length >= 3, "expected repeated reserve + ability disabled blocker cycles");

  const etaGroundedByCycle3 = cycles.find((cycle) =>
    Number(cycle?.cycleNumber) <= 3
    && Number(cycle?.etaGroundedReserveAbilityHoldRuns || 0) >= 2
  );
  assert(etaGroundedByCycle3, "expected ETA-grounded reserve+ability-disabled hold streak by cycle 3");

  const firstStallBreaker = cycles.find((cycle) =>
    cycle?.stallBreakerActive === true
    || /meat stall breaker/i.test(String(cycle?.meatFallbackReason || ""))
    || /meat stall breaker/i.test(String(cycle?.selectedReason || ""))
  );
  assert(firstStallBreaker, "expected stall-breaker activation in M8 focused scenario");
  assert(Number(firstStallBreaker.cycleNumber) <= 3, `stall-breaker activated too late (cycle ${firstStallBreaker.cycleNumber})`);

  const authorityLeaks = cycles.filter(isAdvisorExecutionLeak);
  assert(authorityLeaks.length === 0, "advisor-only domains must remain non-executable in M8");

  console.log(
    `[check-book00-m8-false-wait] pass: blocker cycles=${blockerCycles.length}, `
      + `eta-grounded-by-cycle3=${etaGroundedByCycle3.cycleNumber}, `
      + `stall-breaker-cycle=${firstStallBreaker.cycleNumber}`
  );
}

main().catch((error) => {
  console.error(error?.stack || error?.message || String(error));
  process.exit(1);
});

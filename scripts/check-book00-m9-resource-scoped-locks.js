const { runMode } = require("./strategy-audit-testbed-core");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function main() {
  const outcome = await runMode("live", [
    "--scenario", "book00-m9-resource-scoped-locks",
    "--cycles", "1",
    "--browser-channel", "chrome",
    "--headed", "false",
    "--keep-open", "false",
    "--leave-open-on-failure", "false",
  ]);

  assert(outcome?.exitCode === 0, `strategy audit live failed with exit code ${outcome?.exitCode}`);

  const execution = Array.isArray(outcome.executions) ? outcome.executions[0] : null;
  const cycle = execution?.result?.cycles?.[0];
  assert(cycle, "expected at least one cycle");

  const lanes = Array.isArray(cycle.laneProposals) ? cycle.laneProposals : [];
  const territoryLane = lanes.find((row) => row.lane === "Territory");
  const nonTerritoryBuyLanes = lanes.filter((row) =>
    row.lane !== "Territory" && row.decision === "BUY"
  );

  assert(territoryLane, "expected a Territory lane candidate");
  assert(territoryLane.decision === "HOLD", "expected Territory lane to be held during the Expansion save window");
  assert(
    (territoryLane.blockerCategories || []).includes("protected-resource"),
    "expected Territory HOLD to be blocked specifically as a protected resource"
  );

  assert(
    nonTerritoryBuyLanes.length > 0,
    "expected at least one non-Territory lane to remain BUY-eligible while Territory is protected"
  );

  const leakedAdvisorAuthority = lanes.some((row) =>
    /ability|ascension|mutagen/i.test(row.lane) && row.decision === "BUY"
  );
  assert(!leakedAdvisorAuthority, "advisor-only domains must remain non-executable during resource-scoped locks");

  console.log(
    `[check-book00-m9-resource-scoped-locks] pass: territory=${territoryLane.decision}, `
      + `non-territory-buy-lanes=${nonTerritoryBuyLanes.map((row) => row.lane).join(",")}`
  );
}

main().catch((error) => {
  console.error(error?.stack || error?.message || String(error));
  process.exit(1);
});

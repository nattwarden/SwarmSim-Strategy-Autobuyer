const { spawnSync } = require("child_process");
const { runScenarioMatrix } = require("./strategy-audit-testbed-core");

const DEFAULT_SCENARIOS = [
  "sa1-04-rank-bp-y80",
  "sa1-05-rank-bp-y120",
  "sa1-06-rank-bp-y120-meat-tight",
  "sa1-07-rank-bp-y160",
  "sa1-08-rank-bp-y160-meat-tight",
  "sa1-09-rank-bp-y160-meat-tight-fallback-tight",
  "sa1-10-rank-bp-y160-meat-tight-fallback-off",
];

function buildSweepScenarioIds(total = 150) {
  const count = Math.max(1, Number(total) || 150);
  return Array.from({ length: count }, (_, idx) => `sa1-sweep-${String(idx + 1).padStart(3, "0")}`);
}

function parseArgs(argv) {
  const map = new Map();
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith("--")) continue;
    const next = argv[i + 1];
    if (!next || next.startsWith("--")) {
      map.set(token, "true");
      continue;
    }
    map.set(token, next);
    i += 1;
  }
  return map;
}

function parseNumber(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function parseList(value) {
  return String(value || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function runScenario(scenarioId, cycles, repeatIndex, browserChannel) {
  const args = [
    "scripts/strategy-audit-testbed-live.js",
    "--scenario",
    scenarioId,
    "--cycles",
    String(cycles),
  ];
  if (browserChannel) {
    args.push("--browser-channel", String(browserChannel));
  }

  console.log(`\n[SA1 matrix] ${scenarioId} run ${repeatIndex}`);
  const result = spawnSync("node", args, { stdio: "inherit", shell: false });
  return result.status === 0;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const repeats = Math.max(1, parseNumber(args.get("--repeats"), 2));
  const cycles = Math.max(1, parseNumber(args.get("--cycles"), 5));
  const only = parseList(args.get("--only"));
  const isolated = args.get("--isolated") === "true";
  const sweep150 = args.get("--sweep150") === "true";
  const browserChannel = args.get("--browser-channel") || args.get("--channel") || null;

  const scenarios = only.length
    ? only
    : (sweep150 ? buildSweepScenarioIds(150) : DEFAULT_SCENARIOS);

  if (!isolated) {
    console.log(`[SA1 matrix] Reusing one Chrome window, context, and page for ${scenarios.length * repeats} sequential runs.`);
    const result = await runScenarioMatrix("live", { scenarios, repeats, cycles, browserChannel });
    if (result.exitCode !== 0) process.exit(1);
    console.log("\n[SA1 matrix] Completed successfully.");
    return;
  }

  let failures = 0;
  for (const scenario of scenarios) {
    for (let run = 1; run <= repeats; run += 1) {
      const ok = runScenario(scenario, cycles, run, browserChannel);
      if (!ok) {
        failures += 1;
        console.error(`[SA1 matrix] FAILED: ${scenario} run ${run}`);
      }
    }
  }

  if (failures > 0) {
    console.error(`\n[SA1 matrix] Completed with ${failures} failed run(s).`);
    process.exit(1);
  }

  console.log("\n[SA1 matrix] Completed successfully.");
}

main().catch((error) => {
  console.error(error?.stack || error?.message || String(error));
  process.exit(1);
});

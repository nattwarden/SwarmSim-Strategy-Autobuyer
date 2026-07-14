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

function parseSweepScenarioIndex(scenarioId) {
  const match = /^sa1-sweep-(\d{1,3})$/i.exec(String(scenarioId || "").trim());
  if (!match) return null;
  const index = Number(match[1]);
  return Number.isFinite(index) ? index : null;
}

function buildSweepRangeIds(minIndex, maxIndex) {
  const min = Math.max(1, Number(minIndex) || 1);
  const max = Math.max(min, Number(maxIndex) || min);
  return Array.from({ length: max - min + 1 }, (_, idx) => `sa1-sweep-${String(min + idx).padStart(3, "0")}`);
}

function buildStratifiedSweepScenarioIds(total = 150, sample = 50) {
  const universe = Math.max(1, Number(total) || 150);
  const requested = Math.max(1, Number(sample) || 50);
  if (requested >= universe) return buildSweepScenarioIds(universe);

  const ids = [];
  for (let i = 0; i < requested; i += 1) {
    const index = 1 + Math.floor((i * (universe - 1)) / Math.max(1, requested - 1));
    ids.push(`sa1-sweep-${String(index).padStart(3, "0")}`);
  }
  return Array.from(new Set(ids));
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
  const sweepSize = Math.max(0, parseNumber(args.get("--sweep-size"), 0));
  const sweepTotal = Math.max(1, parseNumber(args.get("--sweep-total"), 150));
  const sweepStrategy = String(args.get("--sweep-strategy") || "stratified").trim().toLowerCase();
  const sweepMinIndex = Math.max(1, parseNumber(args.get("--sweep-min-index"), 1));
  const sweepMaxIndex = Math.max(sweepMinIndex, parseNumber(args.get("--sweep-max-index"), sweepTotal));
  const browserChannel = args.get("--browser-channel") || args.get("--channel") || null;

  let scenarios = only.length ? only : DEFAULT_SCENARIOS;
  if (!only.length && sweep150) {
    scenarios = buildSweepScenarioIds(150);
  }
  if (!only.length && sweepSize > 0) {
    const rangedSweep = buildSweepRangeIds(sweepMinIndex, sweepMaxIndex);
    scenarios = sweepStrategy === "linear"
      ? rangedSweep.slice(0, sweepSize)
      : buildStratifiedSweepScenarioIds(rangedSweep.length, sweepSize)
        .map((id) => {
          const relativeIndex = parseSweepScenarioIndex(id);
          if (!Number.isFinite(relativeIndex)) return id;
          const absolute = sweepMinIndex + relativeIndex - 1;
          return `sa1-sweep-${String(absolute).padStart(3, "0")}`;
        });
  }

  const matrixMode = only.length
    ? "explicit"
    : (sweepSize > 0
      ? `sweep-${sweepStrategy}`
      : (sweep150 ? "sweep150" : "default"));
  console.log(`[SA1 matrix] mode=${matrixMode} scenarios=${scenarios.length} repeats=${repeats} cycles=${cycles}`);

  if (!isolated) {
    console.log(`[SA1 matrix] Reusing one Chrome window, context, and page for ${scenarios.length * repeats} sequential runs.`);
    const result = await runScenarioMatrix("live", { scenarios, repeats, cycles, browserChannel });
    if (result.exitCode !== 0) process.exit(1);
    if (sweepSize > 0) {
      const rows = Array.isArray(result.executions)
        ? result.executions.map((entry) => entry?.result).filter(Boolean)
        : [];
      const laneCounts = {};
      let nearest = null;
      const indexedRows = [];

      for (const row of rows) {
        const lane = String(row.selectedLane || "none");
        laneCounts[lane] = (laneCounts[lane] || 0) + 1;
        const scenario = String(row.scenario || "");
        const idx = parseSweepScenarioIndex(scenario);
        const winnerScore = Number.isFinite(Number(row?.selectedScore)) ? Number(row.selectedScore) : null;
        const territoryAlt = Array.isArray(row?.legalAlternatives)
          ? row.legalAlternatives.find((alt) => String(alt?.lane || "").toLowerCase() === "territory")
          : null;
        const territoryScore = Number.isFinite(Number(territoryAlt?.score)) ? Number(territoryAlt.score) : null;
        const margin = Number.isFinite(winnerScore) && Number.isFinite(territoryScore)
          ? Math.abs(winnerScore - territoryScore)
          : null;
        if (Number.isFinite(idx)) {
          indexedRows.push({ idx, lane, margin });
        }
        if (Number.isFinite(idx) && Number.isFinite(margin)) {
          if (!nearest || margin < nearest.margin) {
            nearest = { idx, margin };
          }
        }
      }

      const laneSummary = Object.entries(laneCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([lane, count]) => `${lane}:${count}`)
        .join(", ");
      if (laneSummary) console.log(`[SA1 matrix] lane summary -> ${laneSummary}`);

      indexedRows.sort((a, b) => a.idx - b.idx);
      const transitions = [];
      for (let i = 1; i < indexedRows.length; i += 1) {
        const prev = indexedRows[i - 1];
        const curr = indexedRows[i];
        if (prev.lane !== curr.lane) {
          transitions.push({
            fromIdx: prev.idx,
            toIdx: curr.idx,
            fromLane: prev.lane,
            toLane: curr.lane,
          });
        }
      }

      if (transitions.length) {
        const focus = transitions[0];
        const span = Math.max(2, focus.toIdx - focus.fromIdx);
        const nextMin = Math.max(1, focus.fromIdx - 1);
        const nextMax = Math.min(sweepTotal, focus.toIdx + 1);
        const sweepSizeHint = Math.max(12, Math.min(24, span + 8));
        console.log(`[SA1 matrix] breakpoint hint -> lane shift ${focus.fromLane} -> ${focus.toLane} between sa1-sweep-${String(focus.fromIdx).padStart(3, "0")} and sa1-sweep-${String(focus.toIdx).padStart(3, "0")}`);
        console.log(`[SA1 matrix] pinpoint suggestion -> node scripts/run-sa1-sweep-matrix.js --sweep-size ${sweepSizeHint} --sweep-total ${sweepTotal} --sweep-min-index ${nextMin} --sweep-max-index ${nextMax} --sweep-strategy stratified --repeats 1`);
      }

      if (nearest) {
        const window = 12;
        const nextMin = Math.max(1, nearest.idx - window);
        const nextMax = Math.min(sweepTotal, nearest.idx + window);
        console.log(`[SA1 matrix] calibration hint -> nearest competitive index sa1-sweep-${String(nearest.idx).padStart(3, "0")} (|margin|=${nearest.margin.toFixed(3)})`);
        console.log(`[SA1 matrix] next pass suggestion -> node scripts/run-sa1-sweep-matrix.js --sweep-size 12 --sweep-total ${sweepTotal} --sweep-min-index ${nextMin} --sweep-max-index ${nextMax} --sweep-strategy stratified --repeats 1`);
      }
    }
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

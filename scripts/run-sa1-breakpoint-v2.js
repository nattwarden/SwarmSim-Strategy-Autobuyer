const fs = require("fs");
const path = require("path");
const { runScenarioMatrix } = require("./strategy-audit-testbed-core");

const ROOT = path.resolve(__dirname, "..");
const AUDIT1_ROOT = path.join(ROOT, "docs", "test-data", "strategy-audit-1");

const COARSE_LADDER = [
  { y: 180, r: 2, p: 1200 },
  { y: 220, r: 3, p: 900 },
  { y: 260, r: 4, p: 900 },
  { y: 300, r: 4, p: 600 },
  { y: 340, r: 5, p: 600 },
  { y: 380, r: 6, p: 450 },
];

const WIDE_COARSE_LADDER = [
  { y: 800, r: 6, p: 450, u: 4 },
  { y: 1400, r: 8, p: 300, u: 6 },
  { y: 2200, r: 10, p: 240, u: 8 },
  { y: 3200, r: 12, p: 180, u: 10 },
  { y: 4500, r: 14, p: 150, u: 12 },
  { y: 6000, r: 16, p: 120, u: 14 },
];

function buildSweepScenarioIds(total = 150) {
  const count = Math.max(1, Number(total) || 150);
  return Array.from({ length: count }, (_, idx) => `sa1-sweep-${String(idx + 1).padStart(3, "0")}`);
}

function buildStratifiedSweepSample(totalUniverse = 150, sampleSize = 50) {
  const universe = Math.max(1, Number(totalUniverse) || 150);
  const sample = Math.max(1, Math.min(universe, Number(sampleSize) || 50));
  if (sample >= universe) return buildSweepScenarioIds(universe);
  const ids = [];
  for (let i = 0; i < sample; i += 1) {
    const index = 1 + Math.floor((i * (universe - 1)) / Math.max(1, sample - 1));
    ids.push(`sa1-sweep-${String(index).padStart(3, "0")}`);
  }
  return Array.from(new Set(ids));
}

function argMap(argv) {
  const map = new Map();
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!String(token).startsWith("--")) continue;
    const next = argv[i + 1];
    if (!next || String(next).startsWith("--")) {
      map.set(token, "true");
      continue;
    }
    map.set(token, next);
    i += 1;
  }
  return map;
}

function listSweepDirs() {
  if (!fs.existsSync(AUDIT1_ROOT)) return [];
  return fs.readdirSync(AUDIT1_ROOT)
    .filter((name) => /^sa1-sweep-\d{3}$/.test(name))
    .map((name) => path.join(AUDIT1_ROOT, name));
}

function parseSweepIndex(name) {
  const match = /sa1-sweep-(\d{3})/.exec(name);
  return match ? Number(match[1]) : null;
}

function loadLatestResultForScenarioDir(scenarioDir) {
  const liveDir = path.join(scenarioDir, "live");
  if (!fs.existsSync(liveDir)) return null;

  const runDirs = fs.readdirSync(liveDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort((a, b) => b.localeCompare(a));

  for (const runDirName of runDirs) {
    const runDir = path.join(liveDir, runDirName);
    const resultName = fs.readdirSync(runDir)
      .find((name) => name.endsWith("-result.json"));
    if (!resultName) continue;
    const fullPath = path.join(runDir, resultName);
    const payload = JSON.parse(fs.readFileSync(fullPath, "utf8"));
    return { payload, fullPath };
  }
  return null;
}

function findLaneScore(result, lane) {
  const laneRows = Array.isArray(result?.laneProposals) ? result.laneProposals : [];
  const row = laneRows.find((entry) => String(entry?.lane || "").toLowerCase() === String(lane || "").toLowerCase());
  return Number.isFinite(Number(row?.score)) ? Number(row.score) : null;
}

function toRow(result, artifactPath) {
  const winnerScore = findLaneScore(result, result?.selectedLane);
  const territoryScore = findLaneScore(result, "Territory");
  const scoreMargin = Number.isFinite(winnerScore) && Number.isFinite(territoryScore)
    ? (winnerScore - territoryScore)
    : null;

  return {
    scenario: result?.scenario,
    selectedLane: result?.selectedLane,
    selectedAction: result?.selectedAction,
    selectedDecision: result?.selectedDecision,
    legalAlternatives: result?.legalAlternatives || [],
    rejectedAlternatives: result?.rejectedAlternatives || [],
    winnerScore,
    territoryScore,
    scoreMargin,
    resetVerified: result?.resetVerified,
    stateLeakageDetected: result?.stateLeakageDetected,
    artifactPath: path.relative(ROOT, artifactPath).replace(/\\/g, "/"),
  };
}

function collectSweepRepresentatives() {
  const rows = [];
  for (const dir of listSweepDirs()) {
    const latest = loadLatestResultForScenarioDir(dir);
    if (!latest) continue;
    const scenarioName = path.basename(dir);
    const index = parseSweepIndex(scenarioName);
    if (!Number.isFinite(index)) continue;
    rows.push({ index, ...toRow(latest.payload, latest.fullPath) });
  }

  rows.sort((a, b) => a.index - b.index);

  const meatRows = rows.filter((row) => row.selectedLane === "Meat");
  const energyRows = rows.filter((row) => row.selectedLane === "Energy");
  const cloneRows = rows.filter((row) => row.selectedLane === "Clone Prep");
  const territoryCandidateRows = rows.filter((row) => Number.isFinite(row.scoreMargin));
  territoryCandidateRows.sort((a, b) => Math.abs(a.scoreMargin) - Math.abs(b.scoreMargin));

  return {
    allRows: rows,
    lastMeat: meatRows.length ? meatRows[meatRows.length - 1] : null,
    firstEnergy: energyRows.length ? energyRows[0] : null,
    firstClone: cloneRows.length ? cloneRows[0] : null,
    nearestTerritoryMargin: territoryCandidateRows.length ? territoryCandidateRows[0] : null,
  };
}

function buildV2ScenarioId(role, seedIndex, params) {
  const unlockTier = Math.max(1, Number(params.u) || 1);
  return `sa1-v2-${role}-s${String(seedIndex).padStart(3, "0")}-y${params.y}-r${params.r}-p${params.p}-u${unlockTier}`;
}

function pickCandidate(rows, predicate) {
  for (const row of rows) {
    if (predicate(row)) return row;
  }
  return null;
}

function buildFineLadder(from, to) {
  const yMin = Math.min(from.y, to.y);
  const yMax = Math.max(from.y, to.y);
  const yMid = Math.round((yMin + yMax) / 2);
  const yVals = [yMin, yMid, yMax, yMid + 20, yMid - 20]
    .filter((value) => Number.isFinite(value) && value > 0)
    .map((value) => Math.max(1, value));
  const uniqueY = Array.from(new Set(yVals)).sort((a, b) => a - b);

  const reserveVals = Array.from(new Set([from.r, to.r])).sort((a, b) => a - b);
  const paybackVals = Array.from(new Set([from.p, to.p])).sort((a, b) => a - b);
  const unlockVals = Array.from(new Set([Math.max(1, Number(from.u) || 1), Math.max(1, Number(to.u) || 1)])).sort((a, b) => a - b);

  const ladder = [];
  for (const y of uniqueY) {
    for (const r of reserveVals) {
      for (const p of paybackVals) {
        for (const u of unlockVals) {
          ladder.push({ y, r, p, u });
        }
      }
    }
  }
  return ladder;
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function nowSlug() {
  return new Date().toISOString().replace(/[:.]/g, "-");
}

function findLatestResultByScenario(scenarioId) {
  const scenarioDir = path.join(AUDIT1_ROOT, scenarioId);
  const latest = loadLatestResultForScenarioDir(scenarioDir);
  if (!latest) return null;
  return toRow(latest.payload, latest.fullPath);
}

async function executeScenarioBatch(scenarioIds, repeats, cycles) {
  const result = await runScenarioMatrix("live", { scenarios: scenarioIds, repeats, cycles });
  if (result.exitCode !== 0) {
    throw new Error(`Scenario matrix failed for ${scenarioIds.length} scenarios.`);
  }

  const rows = [];
  for (const scenarioId of scenarioIds) {
    const row = findLatestResultByScenario(scenarioId);
    if (row) rows.push(row);
  }
  return rows;
}

async function main() {
  const args = argMap(process.argv.slice(2));
  const wide = args.get("--wide") === "true";
  const autoBootstrapSweep = args.get("--auto-bootstrap-sweep") !== "false";
  const sweepCycles = Math.max(1, Number(args.get("--bootstrap-cycles") || 5));
  const bootstrapScenarioCount = Math.max(1, Number(args.get("--bootstrap-scenarios") || 12));
  const bootstrapUniverse = Math.max(1, Number(args.get("--bootstrap-universe") || 150));
  const ladder = wide ? WIDE_COARSE_LADDER : COARSE_LADDER;

  let reps = collectSweepRepresentatives();
  if (autoBootstrapSweep && (!reps.lastMeat || !reps.firstEnergy || !reps.firstClone || !reps.nearestTerritoryMargin)) {
    const bootstrapScenarios = buildStratifiedSweepSample(bootstrapUniverse, bootstrapScenarioCount);
    console.log(`SA1 v2: representative sweep states missing; auto-running stratified bootstrap (${bootstrapScenarios.length} scenarios from universe ${bootstrapUniverse}).`);
    const bootstrap = await runScenarioMatrix("live", {
      scenarios: bootstrapScenarios,
      repeats: 1,
      cycles: sweepCycles,
    });
    if (bootstrap.exitCode !== 0) {
      throw new Error("Bootstrap sweep failed while preparing SA1 v2 representatives.");
    }
    reps = collectSweepRepresentatives();
  }

  if (!reps.lastMeat || !reps.firstEnergy || !reps.firstClone || !reps.nearestTerritoryMargin) {
    throw new Error("Sweep representatives are incomplete. Run strategy:audit:matrix:sa1:sweep50 first or increase --bootstrap-scenarios.");
  }

  const seedPlan = [
    { role: "meat", label: "last-meat-regime", seed: reps.lastMeat.index },
    { role: "energy", label: "energy-regime", seed: reps.firstEnergy.index },
    { role: "clone", label: "clone-regime", seed: reps.firstClone.index },
    { role: "near", label: "nearest-territory-margin", seed: reps.nearestTerritoryMargin.index },
  ];

  if (wide) {
    const meatRows = reps.allRows.filter((row) => row.selectedLane === "Meat");
    const cloneRows = reps.allRows.filter((row) => row.selectedLane === "Clone Prep");
    const meatMid = meatRows.length ? meatRows[Math.floor(meatRows.length / 2)] : null;
    const cloneTail = cloneRows.length ? cloneRows[cloneRows.length - 1] : null;
    if (meatMid) seedPlan.push({ role: "meat", label: "mid-meat-regime", seed: meatMid.index });
    if (cloneTail) seedPlan.push({ role: "clone", label: "late-clone-regime", seed: cloneTail.index });
  }

  const coarsePlan = [];
  for (const entry of seedPlan) {
    const roleLadder = (entry.role === "meat" || entry.role === "near")
      ? ladder
      : [ladder[0], ladder[2], ladder[4]].filter(Boolean);
    for (const params of roleLadder) {
      coarsePlan.push({ ...entry, params, scenarioId: buildV2ScenarioId(entry.role, entry.seed, params) });
    }
  }

  const coarseRows = await executeScenarioBatch(coarsePlan.map((item) => item.scenarioId), 1, 5);

  const coarseByRole = new Map();
  for (const row of coarseRows) {
    const match = /^sa1-v2-(meat|energy|clone|near)-s\d{3}-y(\d+)-r(\d+)-p(\d+)-u(\d+)$/.exec(String(row.scenario || ""));
    if (!match) continue;
    const role = match[1];
    const y = Number(match[2]);
    const r = Number(match[3]);
    const p = Number(match[4]);
    const u = Number(match[5]);
    if (!coarseByRole.has(role)) coarseByRole.set(role, []);
    coarseByRole.get(role).push({ row, params: { y, r, p, u } });
  }

  for (const entries of coarseByRole.values()) {
    entries.sort((a, b) => a.params.y - b.params.y || a.params.r - b.params.r || a.params.p - b.params.p || a.params.u - b.params.u);
  }

  const flips = [];
  const finePlan = [];
  for (const role of ["meat", "near"]) {
    const entries = coarseByRole.get(role) || [];
    let previous = null;
    for (const current of entries) {
      if (previous && previous.row.selectedLane !== "Territory" && current.row.selectedLane === "Territory") {
        flips.push({ role, from: previous, to: current });
        const ladder = buildFineLadder(previous.params, current.params);
        const seed = seedPlan.find((entry) => entry.role === role)?.seed;
        for (const params of ladder) {
          finePlan.push({ role, seed, params, scenarioId: buildV2ScenarioId(role, seed, params) });
        }
        break;
      }
      previous = current;
    }
  }

  const uniqueFineIds = Array.from(new Set(finePlan.map((item) => item.scenarioId)));
  const fineRows = uniqueFineIds.length ? await executeScenarioBatch(uniqueFineIds, 2, 5) : [];

  const allRows = [...coarseRows, ...fineRows];
  const territoryRows = allRows.filter((row) => row.selectedLane === "Territory");
  const reproducibleTerritory = territoryRows.filter((row) => row.resetVerified === true && row.stateLeakageDetected === false);

  const nearest = pickCandidate(
    [...allRows].sort((a, b) => Math.abs((a.scoreMargin ?? Number.POSITIVE_INFINITY)) - Math.abs((b.scoreMargin ?? Number.POSITIVE_INFINITY))),
    (row) => Number.isFinite(row.scoreMargin)
  );

  const summary = {
    generatedAt: new Date().toISOString(),
    mode: wide ? "wide" : "narrow",
    seedPlan,
    coarseCount: coarseRows.length,
    fineCount: fineRows.length,
    flips,
    territoryWins: territoryRows.length,
    reproducibleTerritoryWins: reproducibleTerritory.length,
    nearestTerritoryMarginState: nearest || null,
    coarseRows,
    fineRows,
    guardrails: {
      resetVerifiedAll: allRows.every((row) => row.resetVerified === true),
      noLeakageAll: allRows.every((row) => row.stateLeakageDetected === false),
    },
  };

  const outDir = path.join(AUDIT1_ROOT, "sa1-v2-breakpoint", nowSlug());
  ensureDir(outDir);

  const jsonPath = path.join(outDir, "sa1-v2-summary.json");
  fs.writeFileSync(jsonPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");

  const lines = [];
  lines.push("# SA1 v2 Breakpoint Sweep Summary");
  lines.push("");
  lines.push(`Generated at: ${summary.generatedAt}`);
  lines.push("");
  lines.push("## Representative Seeds");
  for (const seed of seedPlan) {
    lines.push(`- ${seed.label}: sa1-sweep-${String(seed.seed).padStart(3, "0")}`);
  }
  lines.push("");
  lines.push("## Coarse/Fine Counts");
  lines.push(`- coarse states: ${summary.coarseCount}`);
  lines.push(`- fine states: ${summary.fineCount}`);
  lines.push(`- territory wins: ${summary.territoryWins}`);
  lines.push(`- reproducible territory wins: ${summary.reproducibleTerritoryWins}`);
  lines.push("");
  lines.push("## Guardrails");
  lines.push(`- resetVerified all: ${summary.guardrails.resetVerifiedAll}`);
  lines.push(`- stateLeakageDetected all false: ${summary.guardrails.noLeakageAll}`);
  lines.push("");
  if (summary.nearestTerritoryMarginState) {
    lines.push("## Nearest Territory Margin");
    lines.push(`- scenario: ${summary.nearestTerritoryMarginState.scenario}`);
    lines.push(`- selected lane: ${summary.nearestTerritoryMarginState.selectedLane}`);
    lines.push(`- selected action: ${summary.nearestTerritoryMarginState.selectedAction}`);
    lines.push(`- winner score: ${summary.nearestTerritoryMarginState.winnerScore}`);
    lines.push(`- territory score: ${summary.nearestTerritoryMarginState.territoryScore}`);
    lines.push(`- score margin (winner - territory): ${summary.nearestTerritoryMarginState.scoreMargin}`);
    lines.push(`- artifact: ${summary.nearestTerritoryMarginState.artifactPath}`);
  }

  const mdPath = path.join(outDir, "sa1-v2-summary.md");
  fs.writeFileSync(mdPath, `${lines.join("\n")}\n`, "utf8");

  console.log(`SA1 v2 summary written: ${path.relative(ROOT, mdPath).replace(/\\/g, "/")}`);
  console.log(`SA1 v2 JSON written: ${path.relative(ROOT, jsonPath).replace(/\\/g, "/")}`);
}

main().catch((error) => {
  console.error(error?.stack || error?.message || String(error));
  process.exit(1);
});

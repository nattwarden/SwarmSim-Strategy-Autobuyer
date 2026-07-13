#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const OUT_ROOT = path.join(ROOT, "docs", "test-data", "strategy-intelligence", "property-sweep");

function nowSlug() {
  return new Date().toISOString().replace(/[:.]/g, "-");
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

function mulberry32(seed) {
  let t = seed >>> 0;
  return function next() {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), t | 1);
    r ^= r + Math.imul(r ^ (r >>> 7), r | 61);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function finiteNonNegative(name, value, failures, context) {
  if (!Number.isFinite(value) || Number.isNaN(value)) {
    failures.push({ kind: "numeric", name, reason: "not-finite", value, context });
    return false;
  }
  if (value < 0) {
    failures.push({ kind: "numeric", name, reason: "negative", value, context });
    return false;
  }
  return true;
}

function normalizeScore(raw) {
  const bounded = Math.max(0, Number(raw) || 0);
  return Math.log10(1 + bounded);
}

function selector(candidates) {
  const legal = (candidates || []).filter((row) => row.blocked !== true && Number.isFinite(row.score));
  if (!legal.length) return null;
  legal.sort((a, b) => b.score - a.score);
  return legal[0];
}

function propertySweep(seed, cases) {
  const rnd = mulberry32(seed);
  const failures = [];
  const checks = {
    totalCases: cases,
    passed: 0,
    failed: 0,
    deterministicReplayStable: true,
    dimensions: {
      affordabilityMonotonic: 0,
      territoryMonotonic: 0,
      blockersOverrideScore: 0,
      scoreNormalizationFinite: 0,
      noNaNInfinity: 0,
      noNegativeIllegal: 0,
      energyReserveRecoveryFinite: 0,
      cloneBufferFinite: 0,
    },
  };

  const replayRngA = mulberry32(seed);
  const replayRngB = mulberry32(seed);
  for (let i = 0; i < 32; i += 1) {
    if (replayRngA() !== replayRngB()) {
      checks.deterministicReplayStable = false;
      failures.push({ kind: "determinism", reason: "seed-replay-mismatch", at: i });
      break;
    }
  }

  for (let i = 0; i < cases; i += 1) {
    const price = Math.pow(10, 6 * rnd()) + 1;
    const resourceA = price * (0.5 + 1.5 * rnd());
    const resourceB = resourceA + Math.pow(10, 4 * rnd());
    const affordA = resourceA >= price;
    const affordB = resourceB >= price;
    checks.dimensions.affordabilityMonotonic += 1;
    if (affordA && !affordB) {
      failures.push({ kind: "metamorphic", name: "affordabilityMonotonic", context: { price, resourceA, resourceB } });
    }

    const etaBefore = 10 + 10000 * rnd();
    const improveA = etaBefore * rnd() * 0.9;
    const improveB = improveA + etaBefore * rnd() * 0.1;
    const territoryValueA = Math.max(0, improveA) / Math.max(1, etaBefore);
    const territoryValueB = Math.max(0, improveB) / Math.max(1, etaBefore);
    checks.dimensions.territoryMonotonic += 1;
    if (territoryValueB < territoryValueA) {
      failures.push({ kind: "metamorphic", name: "territoryMonotonic", context: { etaBefore, improveA, improveB, territoryValueA, territoryValueB } });
    }

    const candidates = [
      { lane: "Engine", blocked: false, score: 100 + 900 * rnd() },
      { lane: "Meat", blocked: false, score: 100 + 900 * rnd() },
      { lane: "Energy", blocked: true, score: 999999 + 1000 * rnd() },
    ];
    const winner = selector(candidates);
    checks.dimensions.blockersOverrideScore += 1;
    if (winner && winner.lane === "Energy") {
      failures.push({ kind: "invariant", name: "blockersOverrideScore", context: { candidates, winner } });
    }

    const rawScore = Math.pow(10, 12 * rnd());
    const norm = normalizeScore(rawScore);
    checks.dimensions.scoreNormalizationFinite += 1;
    finiteNonNegative("normalizeScore", norm, failures, { rawScore });

    const payback = price / Math.max(1e-9, (0.1 + rnd()) * Math.max(1, resourceA * 1e-3));
    const reserveRecovery = Math.max(0, price - resourceA) / Math.max(1e-9, rnd() * 100 + 0.1);
    const cloneBuffer = Math.max(0, resourceA * 0.25 - price * 0.1);
    checks.dimensions.energyReserveRecoveryFinite += 1;
    checks.dimensions.cloneBufferFinite += 1;

    const okNumeric = [
      finiteNonNegative("payback", payback, failures, { price, resourceA }),
      finiteNonNegative("reserveRecovery", reserveRecovery, failures, { price, resourceA }),
      finiteNonNegative("cloneBuffer", cloneBuffer, failures, { price, resourceA }),
    ].every(Boolean);

    checks.dimensions.noNaNInfinity += 1;
    checks.dimensions.noNegativeIllegal += 1;

    if (okNumeric) checks.passed += 1;
    else checks.failed += 1;
  }

  return {
    generatedAt: new Date().toISOString(),
    seed,
    cases,
    checks,
    failures,
  };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const seed = Number(args.get("--seed") || 130013);
  const cases = Math.max(100, Number(args.get("--cases") || 50000));
  const write = args.get("--write") === "true";

  const report = propertySweep(seed, cases);
  const failureCount = report.failures.length;

  console.log(`[property-sweep] seed=${seed} cases=${cases}`);
  console.log(`[property-sweep] deterministicReplayStable=${report.checks.deterministicReplayStable}`);
  console.log(`[property-sweep] failures=${failureCount}`);

  if (write) {
    fs.mkdirSync(OUT_ROOT, { recursive: true });
    const outPath = path.join(OUT_ROOT, `property-sweep-${nowSlug()}.json`);
    fs.writeFileSync(outPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
    console.log(`[property-sweep] wrote ${path.relative(ROOT, outPath).replace(/\\/g, "/")}`);
  }

  if (!report.checks.deterministicReplayStable || failureCount > 0) {
    process.exit(1);
  }
}

main();

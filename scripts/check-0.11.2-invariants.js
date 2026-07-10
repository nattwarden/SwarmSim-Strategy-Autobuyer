#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const runtimePath = path.join(root, "dev-src", "runtime-sections", "runtime-main.js");

function fail(message) {
  throw new Error(message);
}

if (!fs.existsSync(runtimePath)) {
  fail(`Missing runtime file: ${runtimePath}`);
}

const source = fs.readFileSync(runtimePath, "utf8");

function requirePattern(pattern, message) {
  if (!pattern.test(source)) {
    fail(message);
  }
}

// Invariant A: HoM preferred-unit matching must include unit suffix to avoid stale "V" misses.
requirePattern(/function\s+unitMatchesArmyPrepLabel\s*\([\s\S]*?\$\{unit\?\.suffix\s*\|\|\s*""\}/, "Invariant A failed: unitMatchesArmyPrepLabel does not include unit suffix in matching text.");

// Invariant B: Mirror broker exposes live-state source + evaluation revision observability.
requirePattern(/energySupportMirrorArmyStateSource/, "Invariant B failed: mirror army-state source field missing.");
requirePattern(/energySupportMirrorEvaluationRevision/, "Invariant B failed: mirror evaluation revision field missing.");

// Invariant C: Scenario harness must be explicitly gated by localStorage opt-in key.
requirePattern(/SCENARIO_HARNESS_ENABLE_KEY/, "Invariant C failed: scenario harness enable key missing.");
requirePattern(/isScenarioHarnessEnabled\s*\(/, "Invariant C failed: scenario harness gate helper missing.");
requirePattern(/runDeterministicScenarioHarness\s*\(/, "Invariant C failed: deterministic scenario harness runner missing.");

// Invariant D: Scenario harness must be exposed via debug API (not normal UI controls).
requirePattern(/scenarioHarness\s*:\s*\{[\s\S]*?run\(options\s*=\s*\{\}\)/, "Invariant D failed: scenario harness API exposure missing or incomplete.");

console.log("0.11.2 targeted invariant checks passed.");

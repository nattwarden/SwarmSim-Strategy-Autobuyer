#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const runtimePath = path.join(root, "dev-src", "runtime-sections", "runtime-main.js");

function fail(message) {
  throw new Error(message);
}

if (!fs.existsSync(runtimePath)) fail(`Missing runtime file: ${runtimePath}`);
const source = fs.readFileSync(runtimePath, "utf8");

function requirePattern(pattern, message) {
  if (!pattern.test(source)) fail(message);
}

requirePattern(/const\s+SCRIPT_VERSION\s*=\s*"0\.11\.4"/, "Invariant failed: runtime script version must be 0.11.4.");
requirePattern(/const\s+SCENARIO_REPORT_VERSION\s*=\s*"0\.11\.4"/, "Invariant failed: scenario report version must be 0.11.4.");
requirePattern(/function\s+setScenarioTransitionState\s*\(/, "Invariant failed: transition state setter missing.");
requirePattern(/betweenCycleApplied:\s*cycleTransition\?\.betweenCycleApplied\s*\?\s*"yes"\s*:\s*"no"/, "Invariant failed: per-cycle between-cycle observability missing.");
requirePattern(/plannerTransitionMarker:\s*cycleTransition\?\.plannerTransitionMarker\s*\|\|\s*"none"/, "Invariant failed: transition marker observability missing.");
requirePattern(/parentStepCompletedForRefill:\s*cycleTransition\?\.parentStepCompletedForRefill\s*\?\s*"yes"\s*:\s*"no"/, "Invariant failed: parent-step transition observability missing.");

console.log("0.11.4 invariant checks passed.");

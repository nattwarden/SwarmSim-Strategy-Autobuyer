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

requirePattern(/SCENARIO_HARNESS_ENABLE_KEY/, "Invariant failed: scenario harness gate key missing.");
requirePattern(/energySupportMirrorActiveGate/, "Invariant failed: mirror active gate field missing.");
requirePattern(/energySupportCandidateRanking/, "Invariant failed: support candidate ranking field missing.");
requirePattern(/scenarioReportVersion:\s*SCENARIO_REPORT_VERSION/, "Invariant failed: scenario report version field missing.");
requirePattern(/getScenarioExpectedForCycle\(/, "Invariant failed: cycle expectation resolver missing.");

console.log("0.11.3 invariant checks passed.");

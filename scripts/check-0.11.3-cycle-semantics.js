#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const runtimePath = path.join(root, "dev-src", "runtime-sections", "runtime-main.js");
const defsPath = path.join(root, "docs", "test-data", "0.11.3-scenarios", "scenario-definitions.json");

function fail(message) {
  throw new Error(message);
}

if (!fs.existsSync(runtimePath)) fail(`Missing runtime file: ${runtimePath}`);
if (!fs.existsSync(defsPath)) fail(`Missing scenario definitions: ${defsPath}`);

const source = fs.readFileSync(runtimePath, "utf8");
const defs = JSON.parse(fs.readFileSync(defsPath, "utf8"));

function requirePattern(pattern, message) {
  if (!pattern.test(source)) fail(message);
}

requirePattern(/function\s+getScenarioExpectedForCycle\s*\(/, "P6 failed: cycle-specific expectation resolver missing.");
requirePattern(/evaluateScenarioExpectations\(decisionFields,\s*expectedForCycle\)/, "P6 failed: cycle-specific expectations are not used in harness evaluation.");
requirePattern(/parentStepDecision:\s*payload\.parentStepDecision/, "P10 failed: parent-step cycle decision mapping missing.");
requirePattern(/actionUnitRefillDecision:\s*payload\.actionUnitRefillDecision/, "P10 failed: parent-refill cycle decision mapping missing.");

const scenarios = Array.isArray(defs.scenarios) ? defs.scenarios : [];
const h2 = scenarios.find((s) => s.id === "H2");
const r8 = scenarios.find((s) => s.id === "R8");
if (!h2 || !h2.expectedByCycle) fail("P6 failed: H2 must use expectedByCycle for per-cycle assertions.");
if (!r8 || !r8.expectedByCycle) fail("P10 failed: R8 must use expectedByCycle for transition assertions.");

console.log("0.11.3 cycle semantics targeted checks passed.");

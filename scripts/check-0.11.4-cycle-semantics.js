#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const runtimePath = path.join(root, "dev-src", "runtime-sections", "runtime-main.js");
const defsPath = path.join(root, "docs", "test-data", "0.11.4-scenarios", "scenario-definitions.json");

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

requirePattern(/function\s+getScenarioExpectedForCycle\s*\(/, "Cycle semantics failed: cycle-specific expectation resolver missing.");
requirePattern(/evaluateScenarioExpectations\(decisionFields,\s*expectedForCycle\)/, "Cycle semantics failed: cycle expectations are not evaluated by cycle.");
requirePattern(/setScenarioContext\(\{\s*scenarioId,\s*source,\s*overrides:\s*scenarioOverrides,\s*preserveEvaluationRevision:\s*true,\s*preserveTransition:\s*true,?/m, "Cycle semantics failed: between-cycle context refresh must preserve revision/transition state.");
requirePattern(/scenarioHarnessContext\.cycleRevision\s*=\s*Number\(scenarioHarnessContext\.cycleRevision\s*\|\|\s*0\)\s*\+\s*1/, "Cycle semantics failed: cycle revision tracking missing.");

const scenarios = Array.isArray(defs.scenarios) ? defs.scenarios : [];
const r8 = scenarios.find((s) => s.id === "R8");
if (!r8) fail("Cycle semantics failed: R8 missing from 0.11.4 definitions.");
if (!Array.isArray(r8.betweenEvaluations) || !r8.betweenEvaluations.length) fail("Cycle semantics failed: R8 requires between-cycle transitions.");
if (!r8.expectedByCycle || !Array.isArray(r8.expectedByCycle["1"]) || !Array.isArray(r8.expectedByCycle["2"])) {
  fail("Cycle semantics failed: R8 must define cycle-specific expectations for cycle 1 and cycle 2.");
}

console.log("0.11.4 cycle semantics targeted checks passed.");

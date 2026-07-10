#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const runtimePath = path.join(root, "dev-src", "runtime-sections", "runtime-main.js");
const defsPath = path.join(root, "docs", "test-data", "0.11.5-scenarios", "scenario-definitions.json");

function fail(message) {
  throw new Error(message);
}

function requirePattern(source, pattern, message) {
  if (!pattern.test(source)) fail(message);
}

if (!fs.existsSync(runtimePath)) fail(`Missing runtime file: ${runtimePath}`);
if (!fs.existsSync(defsPath)) fail(`Missing scenario definitions: ${defsPath}`);

const source = fs.readFileSync(runtimePath, "utf8");
const defs = JSON.parse(fs.readFileSync(defsPath, "utf8"));
const scenarios = Array.isArray(defs.scenarios) ? defs.scenarios : [];
const r8 = scenarios.find((s) => s.id === "R8");
if (!r8) fail("F1-F6 failed: R8 scenario is missing.");

function hasCycleExpectation(cycle, field, predicate) {
  const rows = r8?.expectedByCycle?.[String(cycle)];
  if (!Array.isArray(rows)) return false;
  return rows.some((row) => row.field === field && predicate(row));
}

if (!hasCycleExpectation(1, "parentStepDecision", (row) => String(row.equals || "") === "BUY")) {
  fail("F1 failed: cycle 1 must require Parent Step BUY.");
}
if (!hasCycleExpectation(1, "actionUnitRefillDecision", (row) => String(row.notIncludes || "") === "BUY")) {
  fail("F1 failed: cycle 1 must keep Parent Refill from BUY.");
}
if (!hasCycleExpectation(2, "actionUnitRefillDecision", (row) => String(row.equals || "") === "BUY")) {
  fail("F2 failed: cycle 2 must require Parent Refill BUY.");
}
if (!hasCycleExpectation(2, "parentStepDecision", (row) => String(row.notIncludes || "") === "BUY")) {
  fail("F2/F3 failed: cycle 2 must prevent repeated Parent Step BUY.");
}
if (!hasCycleExpectation(2, "activePlannerAction", (row) => String(row.includes || "").includes("Parent Refill"))) {
  fail("F4 failed: cycle 2 must report Parent Refill as active planner action.");
}

requirePattern(
  source,
  /function\s+finalizeParentStepAfterRefillSelection\s*\(/,
  "F5 failed: parent-step finalization helper is missing."
);
requirePattern(
  source,
  /finalizeParentStepAfterRefillSelection\(actionLabel,\s*reason\)/,
  "F5 failed: refill BUY path does not finalize parent-step state."
);
requirePattern(
  source,
  /parentStepDecision:\s*strategyInspector\?\.parentStepDecision\s*\|\|\s*parentStepPlannerState\?\.decision\s*\|\|\s*"none"/,
  "F5 failed: export must be sourced from finalized runtime state, not report-only masking."
);

console.log("0.11.5 parent transition finalization checks passed (F1-F6).");

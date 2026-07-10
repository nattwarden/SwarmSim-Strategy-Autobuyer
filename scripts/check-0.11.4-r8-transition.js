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
const scenarios = Array.isArray(defs.scenarios) ? defs.scenarios : [];
const r8 = scenarios.find((s) => s.id === "R8");
if (!r8) fail("T0 failed: R8 scenario missing.");

function hasCycleExpectation(cycle, field, predicate) {
  const rows = r8?.expectedByCycle?.[String(cycle)];
  if (!Array.isArray(rows)) return false;
  return rows.some((row) => row.field === field && predicate(row));
}

if (!Array.isArray(r8.betweenEvaluations) || !r8.betweenEvaluations.length) fail("T1 failed: between-cycle block missing.");
const between = r8.betweenEvaluations[0] || {};
if (!between.applyOverrides || !Number.isFinite(Number(between.applyOverrides.remainingActions))) fail("T1 failed: between-cycle remainingActions override missing.");
if (!between.parentStepCompletedForRefill && !between.transition?.parentStepCompletedForRefill) fail("T1 failed: between-cycle parent-step transition marker missing.");

if (!hasCycleExpectation(1, "parentStepDecision", (row) => String(row.equals || "") === "BUY")) fail("T3 failed: cycle 1 must require Parent Step BUY.");
if (!hasCycleExpectation(2, "actionUnitRefillDecision", (row) => String(row.equals || "") === "BUY")) fail("T4/T5 failed: cycle 2 must require Parent Refill BUY (OBSERVE fails)." );
if (!hasCycleExpectation(2, "parentStepDecision", (row) => String(row.notIncludes || "") === "BUY")) fail("T6 failed: cycle 2 must fail when Parent Step repeats.");
if (!hasCycleExpectation(2, "actionUnitRefillReason", (row) => String(row.includes || "").includes("after parent-step"))) fail("T7 failed: cycle 2 must prove refill branch reason.");
if (!hasCycleExpectation(2, "plannerTransitionMarker", (row) => String(row.equals || "").length > 0)) fail("T2 failed: cycle 2 transition marker expectation missing.");

if (!/safe\(`Scenario .* units`, \(\) => buySmartUnits\(/.test(source)) fail("T8 failed: harness must run through production buySmartUnits path.");
if (/decisionFields\.actionUnitRefillDecision\s*=\s*"BUY"/.test(source)) fail("T8 failed: direct decision override detected.");
if (!/hydrateScenarioParentStepTransitionForRefill\(/.test(source)) fail("T8 failed: transition replay hook missing.");

console.log("0.11.4 R8 transition checks passed (T1-T8).");

#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const defsPath = path.join(root, "docs", "test-data", "0.11.4-scenarios", "scenario-definitions.json");

function fail(message) {
  throw new Error(message);
}

if (!fs.existsSync(defsPath)) fail(`Missing scenario definitions: ${defsPath}`);

const defs = JSON.parse(fs.readFileSync(defsPath, "utf8"));
const scenarios = Array.isArray(defs.scenarios) ? defs.scenarios : [];
const requiredIds = ["H1", "H2", "H3", "H4", "H5", "H6", "R1", "R2", "R3", "R4", "R5", "R6", "R7", "R8"];
const ids = new Set(scenarios.map((s) => String(s.id || "")));

for (const id of requiredIds) {
  if (!ids.has(id)) fail(`Missing required scenario: ${id}`);
}

for (const scenario of scenarios) {
  if (!scenario.id) fail("Scenario missing id");
  if (!scenario.description) fail(`Scenario ${scenario.id} missing description`);
  const hasSharedExpected = Array.isArray(scenario.expected) && scenario.expected.length > 0;
  const byCycle = scenario.expectedByCycle;
  const hasCycleExpected = !!byCycle && (
    (Array.isArray(byCycle) && byCycle.some((row) => Array.isArray(row?.expected) && row.expected.length > 0))
    || (typeof byCycle === "object" && !Array.isArray(byCycle) && Object.values(byCycle).some((row) => Array.isArray(row) && row.length > 0))
  );
  if (!hasSharedExpected && !hasCycleExpected) fail(`Scenario ${scenario.id} must declare expected or expectedByCycle invariants`);
}

console.log("0.11.4 deterministic scenario definition checks passed.");

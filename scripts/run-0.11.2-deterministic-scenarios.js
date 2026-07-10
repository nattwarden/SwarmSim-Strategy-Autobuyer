#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const inputPath = path.join(root, "docs", "test-data", "0.11.2-scenarios", "scenario-definitions.json");
const outputPath = path.join(root, "docs", "test-data", "0.11.2-scenarios", "scenario-results.json");
const summaryPath = path.join(root, "docs", "test-data", "0.11.2-scenarios", "scenario-summary.md");

function ensure(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function loadJson(filePath) {
  ensure(fs.existsSync(filePath), `Missing file: ${filePath}`);
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function countPassFail(report) {
  let pass = 0;
  let fail = 0;

  for (const scenario of report.scenarios || []) {
    for (const cycle of scenario.cycles || []) {
      for (const inv of cycle.invariants || []) {
        if (inv.pass) pass += 1;
        else fail += 1;
      }
    }
  }

  return { pass, fail, total: pass + fail };
}

function buildSummaryMarkdown(report) {
  const lines = [];
  const counts = countPassFail(report);

  lines.push("# 0.11.2 Deterministic Scenario Summary");
  lines.push("");
  lines.push(`- Run at: ${report.runAt || new Date().toISOString()}`);
  lines.push(`- Source: ${report.source || "deterministic-scenario"}`);
  lines.push(`- Script version: ${report.scriptVersion || "0.11.2"}`);
  lines.push(`- Invariants: ${counts.pass} pass / ${counts.fail} fail / ${counts.total} total`);
  lines.push("");

  for (const scenario of report.scenarios || []) {
    lines.push(`## ${scenario.scenarioId} - ${scenario.description || ""}`.trim());
    lines.push(`- Source: ${scenario.source || "deterministic-scenario"}`);

    for (const cycle of scenario.cycles || []) {
      const failures = (cycle.invariants || []).filter((inv) => !inv.pass);
      lines.push(`- Cycle ${cycle.cycle}: ${failures.length ? "FAIL" : "PASS"}`);
      if (failures.length) {
        for (const inv of failures) {
          lines.push(`  - ${inv.id || inv.field}: expected ${JSON.stringify(inv.expected)} got ${JSON.stringify(inv.actual)}`);
        }
      }
    }

    lines.push("");
  }

  return lines.join("\n");
}

function main() {
  const definitions = loadJson(inputPath);

  // This script prepares deterministic scenario data and emits a machine-readable report shell.
  // Execution must be performed in-browser through kbcSwarmBot.scenarioHarness.run(...), then
  // merged into this output structure.
  const report = {
    source: "deterministic-scenario",
    scriptVersion: String(definitions.version || "0.11.2"),
    runAt: new Date().toISOString(),
    note: "Populate scenarios[].cycles by running in browser console: kbcSwarmBot.scenarioHarness.enable(); kbcSwarmBot.scenarioHarness.run({ scenarios: <definitions.scenarios> })",
    scenarios: (definitions.scenarios || []).map((scenario) => ({
      scenarioId: scenario.id,
      description: scenario.description,
      source: scenario.source || "deterministic-scenario",
      inputOverrides: scenario.overrides || {},
      expected: scenario.expected || [],
      cycles: [],
    })),
  };

  fs.writeFileSync(outputPath, JSON.stringify(report, null, 2) + "\n", "utf8");
  fs.writeFileSync(summaryPath, buildSummaryMarkdown(report) + "\n", "utf8");

  console.log(`Wrote ${path.relative(root, outputPath)}`);
  console.log(`Wrote ${path.relative(root, summaryPath)}`);
}

main();

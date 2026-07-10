#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const inputPath = path.join(root, "docs", "test-data", "0.11.5-scenarios", "scenario-definitions.json");
const outputPath = path.join(root, "docs", "test-data", "0.11.5-scenarios", "scenario-results.json");
const summaryPath = path.join(root, "docs", "test-data", "0.11.5-scenarios", "scenario-summary.md");

function ensure(condition, message) {
  if (!condition) throw new Error(message);
}

function loadJson(filePath) {
  ensure(fs.existsSync(filePath), `Missing file: ${filePath}`);
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function buildSummaryMarkdown(report) {
  const lines = [];
  lines.push("# 0.11.5 Deterministic Scenario Summary");
  lines.push("");
  lines.push(`- Run at: ${report.runAt || "not-run"}`);
  lines.push(`- Source: ${report.source || "deterministic-scenario"}`);
  lines.push(`- Script version: ${report.scriptVersion || "0.11.5"}`);
  lines.push(`- Scenario report version: ${report.scenarioReportVersion || "0.11.5"}`);
  lines.push("- Invariants: not-run");
  lines.push("");
  lines.push("This is an empty template for the 0.11.5 browser run.");
  lines.push("Do not treat this file as executed evidence until scenario-results.json is replaced with real runtime output.");
  return lines.join("\n");
}

function main() {
  const definitions = loadJson(inputPath);
  const report = {
    source: "deterministic-scenario",
    scriptVersion: String(definitions.version || "0.11.5"),
    scenarioReportVersion: "0.11.5",
    runAt: null,
    autobuyerVersion: String(definitions.version || "0.11.4"),
    note: "NOT RUN YET. Populate by running in browser: kbcSwarmBot.scenarioHarness.enable(); kbcSwarmBot.scenarioHarness.run({ scenarios: <definitions.scenarios> }).",
    scenarios: [],
  };

  fs.writeFileSync(outputPath, JSON.stringify(report, null, 2) + "\n", "utf8");
  fs.writeFileSync(summaryPath, buildSummaryMarkdown(report) + "\n", "utf8");

  console.log(`Wrote ${path.relative(root, outputPath)}`);
  console.log(`Wrote ${path.relative(root, summaryPath)}`);
}

main();

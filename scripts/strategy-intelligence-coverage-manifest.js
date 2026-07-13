#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const AUDIT_ROOT = path.join(ROOT, "docs", "test-data", "strategy-audit-1");
const OUT_DIR = path.join(ROOT, "docs", "test-data", "strategy-intelligence");
const OUT_JSON = path.join(OUT_DIR, "coverage-manifest.json");
const OUT_MD = path.join(OUT_DIR, "coverage-manifest.md");
const LAB_JSON = path.join(ROOT, "docs", "live-logs", "browser-test-0.12.3-laboratory-effective-count.json");

const DIMENSIONS = [
  "cost-boundary",
  "roi-threshold",
  "eta-threshold",
  "lane-visibility-combinations",
  "engine-save-window",
  "clone-hard-lock",
  "energy-nexus-reserve",
  "territory-candidate-states",
  "meat-payback-strength",
  "near-equal-lane-scores",
  "multi-cycle-behavior",
  "resource-conflict",
  "starvation-target-churn",
];

function listResultFiles() {
  if (!fs.existsSync(AUDIT_ROOT)) return [];
  const files = [];
  const stack = [AUDIT_ROOT];
  while (stack.length) {
    const dir = stack.pop();
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) stack.push(full);
      else if (entry.isFile() && entry.name.endsWith("-result.json")) files.push(full);
    }
  }
  return files.sort();
}

function parseJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return null;
  }
}

function scenarioTags(scenario) {
  const id = String(scenario || "").toLowerCase();
  const tags = new Set(["multi-cycle-behavior", "resource-conflict"]);
  if (/sweep-\d+/.test(id)) {
    tags.add("cost-boundary");
    tags.add("roi-threshold");
    tags.add("eta-threshold");
    tags.add("near-equal-lane-scores");
    tags.add("meat-payback-strength");
    tags.add("territory-candidate-states");
  }
  if (/rank-bp|v2|sweep/.test(id)) {
    tags.add("territory-candidate-states");
    tags.add("meat-payback-strength");
    tags.add("starvation-target-churn");
  }
  if (/sa1-0[4-9]|sa1-10/.test(id)) {
    tags.add("lane-visibility-combinations");
    tags.add("energy-nexus-reserve");
  }
  return Array.from(tags);
}

function buildCoverage(files) {
  const rows = [];
  const dimSeen = new Map(DIMENSIONS.map((d) => [d, false]));
  const laneWinners = new Map();
  let resetAllTrue = true;
  let leakageAllFalse = true;

  for (const file of files) {
    const j = parseJson(file);
    if (!j) continue;
    const tags = scenarioTags(j.scenario);
    for (const t of tags) dimSeen.set(t, true);
    const lane = String(j.selectedLane || "none");
    laneWinners.set(lane, (laneWinners.get(lane) || 0) + 1);
    resetAllTrue = resetAllTrue && j.resetVerified === true;
    leakageAllFalse = leakageAllFalse && j.stateLeakageDetected === false;

    rows.push({
      scenario: j.scenario,
      runId: j.runId,
      selectedLane: lane,
      selectedDecision: j.selectedDecision,
      resetVerified: j.resetVerified,
      stateLeakageDetected: j.stateLeakageDetected,
      cycleCount: Array.isArray(j.cycles) ? j.cycles.length : 0,
      dimensions: tags,
      artifact: path.relative(ROOT, file).replace(/\\/g, "/"),
    });
  }

  const uncovered = DIMENSIONS.filter((d) => !dimSeen.get(d));

  let lab = null;
  if (fs.existsSync(LAB_JSON)) {
    const lj = parseJson(LAB_JSON);
    if (lj) {
      lab = {
        verdict: lj.verdict || null,
        scriptVersion: lj.high?.capture?.snapshot?.source?.scriptVersion || lj.scriptVersion || null,
        errors: Array.isArray(lj.errors) ? lj.errors.length : null,
      };
    }
  }

  return {
    generatedAt: new Date().toISOString(),
    source: {
      auditRoot: path.relative(ROOT, AUDIT_ROOT).replace(/\\/g, "/"),
      resultFileCount: rows.length,
    },
    summary: {
      resetAllTrue,
      leakageAllFalse,
      laneWinnerDistribution: Object.fromEntries(Array.from(laneWinners.entries()).sort((a, b) => b[1] - a[1])),
    },
    lab,
    dimensions: DIMENSIONS.map((d) => ({ name: d, covered: !uncovered.includes(d) })),
    uncoveredDimensions: uncovered,
    scenarios: rows,
  };
}

function writeOutputs(report) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(OUT_JSON, `${JSON.stringify(report, null, 2)}\n`, "utf8");

  const lines = [];
  lines.push("# Strategy Intelligence Coverage Manifest");
  lines.push("");
  lines.push(`Generated: ${report.generatedAt}`);
  lines.push(`Result files: ${report.source.resultFileCount}`);
  lines.push(`Reset all true: ${report.summary.resetAllTrue}`);
  lines.push(`Leakage all false: ${report.summary.leakageAllFalse}`);
  lines.push("");
  lines.push("## Lane Winner Distribution");
  for (const [lane, count] of Object.entries(report.summary.laneWinnerDistribution)) {
    lines.push(`- ${lane}: ${count}`);
  }
  lines.push("");
  lines.push("## Coverage by Dimension");
  for (const dim of report.dimensions) {
    lines.push(`- ${dim.name}: ${dim.covered ? "covered" : "uncovered"}`);
  }
  lines.push("");
  lines.push("## Uncovered");
  if (report.uncoveredDimensions.length) {
    for (const d of report.uncoveredDimensions) lines.push(`- ${d}`);
  } else {
    lines.push("- none");
  }
  lines.push("");
  lines.push("## Laboratory Surface");
  if (report.lab) {
    lines.push(`- verdict: ${report.lab.verdict}`);
    lines.push(`- scriptVersion: ${report.lab.scriptVersion}`);
    lines.push(`- errors: ${report.lab.errors}`);
  } else {
    lines.push("- laboratory evidence file not found");
  }

  fs.writeFileSync(OUT_MD, `${lines.join("\n")}\n`, "utf8");
}

function main() {
  const files = listResultFiles();
  const report = buildCoverage(files);
  writeOutputs(report);
  console.log(`coverage manifest written: ${path.relative(ROOT, OUT_JSON).replace(/\\/g, "/")}`);
  console.log(`coverage markdown written: ${path.relative(ROOT, OUT_MD).replace(/\\/g, "/")}`);
  console.log(`uncovered dimensions: ${report.uncoveredDimensions.length}`);
}

main();

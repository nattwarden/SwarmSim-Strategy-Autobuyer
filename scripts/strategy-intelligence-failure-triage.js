#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const AUDIT_ROOT = path.join(ROOT, "docs", "test-data", "strategy-audit-1");
const OUT_DIR = path.join(ROOT, "docs", "test-data", "strategy-intelligence");
const OUT_JSON = path.join(OUT_DIR, "failure-triage.json");
const OUT_MD = path.join(OUT_DIR, "failure-triage.md");

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

function inferScenarioFromPath(filePath) {
  const normalized = String(filePath || "").replace(/\\/g, "/");
  const marker = "/docs/test-data/strategy-audit-1/";
  const idx = normalized.indexOf(marker);
  if (idx < 0) return null;
  const rest = normalized.slice(idx + marker.length);
  const scenario = rest.split("/")[0];
  return scenario || null;
}

function classify(result) {
  if (!result) return "inconclusive";
  if (result.resetVerified !== true || result.stateLeakageDetected === true) return "harness limitation";
  const cycles = Array.isArray(result.cycles) ? result.cycles : [];
  const hasQuestionable = cycles.some((c) => String(c.assessmentLabel || "") === "QUESTIONABLE");
  if (hasQuestionable) return "observability defect";
  if (String(result.runnerVerdict || "") === "FAIL") return "testbed defect";
  return "expected behavior";
}

function reduceManifest(stateMutationManifest) {
  const rows = Array.isArray(stateMutationManifest) ? stateMutationManifest : [];
  const keep = rows.filter((r) => {
    const id = String(r?.id || "");
    return id.startsWith("config:") || id.includes("territory") || id.includes("energy") || id.includes("drone") || id.includes("queen");
  });
  return keep.slice(0, 12);
}

function main() {
  const files = listResultFiles();
  const triageRows = [];
  for (const file of files) {
    const result = parseJson(file);
    if (!result) continue;
    const cls = classify(result);
    const cycles = Array.isArray(result.cycles) ? result.cycles : [];
    const failing = cls !== "expected behavior";
    if (!failing) continue;

    const scenario = result.scenario || inferScenarioFromPath(file) || "unknown-scenario";
    const cycleCount = Math.max(1, cycles.length || 5);

    triageRows.push({
      scenario,
      runId: result.runId,
      classification: cls,
      resetVerified: result.resetVerified,
      stateLeakageDetected: result.stateLeakageDetected,
      selectedLane: result.selectedLane,
      selectedDecision: result.selectedDecision,
      selectedAction: result.selectedAction,
      cycleAssessments: cycles.map((c) => c.assessmentLabel),
      minimizedStateMutationManifest: reduceManifest(result.stateMutationManifest),
      replayCommand: `npm run strategy:audit:live -- --scenario ${scenario} --cycles ${cycleCount}`,
      artifact: path.relative(ROOT, file).replace(/\\/g, "/"),
    });
  }

  const report = {
    generatedAt: new Date().toISOString(),
    failingCaseCount: triageRows.length,
    failingCases: triageRows,
  };

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(OUT_JSON, `${JSON.stringify(report, null, 2)}\n`, "utf8");

  const lines = [];
  lines.push("# Strategy Intelligence Failure Triage");
  lines.push("");
  lines.push(`Generated: ${report.generatedAt}`);
  lines.push(`Failing cases: ${report.failingCaseCount}`);
  lines.push("");
  for (const row of triageRows) {
    lines.push(`## ${row.scenario} (${row.runId})`);
    lines.push(`- classification: ${row.classification}`);
    lines.push(`- selected: ${row.selectedLane} / ${row.selectedDecision} / ${row.selectedAction}`);
    lines.push(`- resetVerified: ${row.resetVerified}`);
    lines.push(`- stateLeakageDetected: ${row.stateLeakageDetected}`);
    lines.push(`- replay: ${row.replayCommand}`);
    lines.push(`- artifact: ${row.artifact}`);
    lines.push("");
  }
  if (!triageRows.length) {
    lines.push("No failing cases detected in available strategy-audit-1 artifacts.");
  }

  fs.writeFileSync(OUT_MD, `${lines.join("\n")}\n`, "utf8");
  console.log(`failure triage written: ${path.relative(ROOT, OUT_JSON).replace(/\\/g, "/")}`);
}

main();

#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const OUT_DIR = path.join(ROOT, "docs", "test-data", "strategy-intelligence", "runs");

function nowSlug() {
  return new Date().toISOString().replace(/[:.]/g, "-");
}

function parseArgs(argv) {
  const map = new Map();
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith("--")) continue;
    const next = argv[i + 1];
    if (!next || next.startsWith("--")) {
      map.set(token, "true");
      continue;
    }
    map.set(token, next);
    i += 1;
  }
  return map;
}

function runStep(step) {
  const startedAt = new Date().toISOString();
  const start = Date.now();
  const res = spawnSync(step.command, {
    cwd: ROOT,
    shell: true,
    encoding: "utf8",
    stdio: "pipe",
  });
  const endedAt = new Date().toISOString();
  return {
    name: step.name,
    classification: step.classification,
    command: step.command,
    expectedEvidencePaths: step.expectedEvidencePaths || [],
    startedAt,
    endedAt,
    durationMs: Date.now() - start,
    exitCode: typeof res.status === "number" ? res.status : 1,
    stdoutTail: String(res.stdout || "").split(/\r?\n/).slice(-30).join("\n"),
    stderrTail: String(res.stderr || "").split(/\r?\n/).slice(-30).join("\n"),
  };
}

function readJson(relPath) {
  const full = path.join(ROOT, relPath);
  if (!fs.existsSync(full)) return null;
  try {
    return JSON.parse(fs.readFileSync(full, "utf8"));
  } catch {
    return null;
  }
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const includeLabEvidence = args.get("--skip-lab-evidence") !== "true";
  const includeSweep = args.get("--include-sweep150") === "true";

  const steps = [
    { name: "build-check", classification: "PURE CHECK", command: "npm run build:check" },
    { name: "version-surfaces", classification: "PURE CHECK", command: "npm run check:0.14.1:versions" },
    { name: "lab-phase2a", classification: "PURE CHECK", command: "npm run check:laboratory:phase2a" },
    { name: "purchase-evaluator", classification: "PURE CHECK", command: "npm run check:purchase-evaluator" },
    {
      name: "lab-effective-count",
      classification: "EVIDENCE GENERATOR",
      command: "npm run check:0.12.3:laboratory",
      expectedEvidencePaths: [
        "docs/live-logs/browser-test-0.12.3-laboratory-effective-count.json",
        "docs/live-logs/browser-test-0.12.3-laboratory-effective-count.md",
        "docs/test-data/0.12.3-laboratory/"
      ],
      optional: !includeLabEvidence,
    },
    {
      name: "sa1-single",
      classification: "EVIDENCE GENERATOR",
      command: "npm run strategy:audit:matrix:sa1:single",
      expectedEvidencePaths: ["docs/test-data/strategy-audit-1/"],
    },
  ];

  if (includeSweep) {
    steps.push({
      name: "sa1-sweep150",
      classification: "EVIDENCE GENERATOR",
      command: "npm run strategy:audit:matrix:sa1:sweep150",
      expectedEvidencePaths: ["docs/test-data/strategy-audit-1/"],
    });
  }

  steps.push(
    {
      name: "sa1-v2",
      classification: "EVIDENCE GENERATOR",
      command: "npm run strategy:audit:matrix:sa1:v2",
      expectedEvidencePaths: ["docs/test-data/strategy-audit-1/"],
    },
    {
      name: "property-sweep",
      classification: "PURE CHECK",
      command: "node scripts/strategy-intelligence-property-sweep.js --seed 130013 --cases 50000",
    },
    {
      name: "coverage-manifest",
      classification: "EVIDENCE GENERATOR",
      command: "node scripts/strategy-intelligence-coverage-manifest.js",
      expectedEvidencePaths: ["docs/test-data/strategy-intelligence/coverage-manifest.json", "docs/test-data/strategy-intelligence/coverage-manifest.md"],
    },
    {
      name: "failure-triage",
      classification: "EVIDENCE GENERATOR",
      command: "node scripts/strategy-intelligence-failure-triage.js",
      expectedEvidencePaths: ["docs/test-data/strategy-intelligence/failure-triage.json", "docs/test-data/strategy-intelligence/failure-triage.md"],
    }
  );

  const stepResults = [];
  for (const step of steps) {
    if (step.optional) continue;
    const res = runStep(step);
    stepResults.push(res);
    console.log(`[automation] ${step.name} (${step.classification}) exit=${res.exitCode} durationMs=${res.durationMs}`);
    if (res.exitCode !== 0) break;
  }

  const coverage = readJson("docs/test-data/strategy-intelligence/coverage-manifest.json");
  const triage = readJson("docs/test-data/strategy-intelligence/failure-triage.json");

  const report = {
    generatedAt: new Date().toISOString(),
    implementationVersionTarget: "0.14.1",
    steps: stepResults,
    summary: {
      allPassed: stepResults.every((s) => s.exitCode === 0),
      failedStep: (stepResults.find((s) => s.exitCode !== 0) || null)?.name || null,
      coveredDimensions: coverage ? coverage.dimensions.filter((d) => d.covered).map((d) => d.name) : [],
      uncoveredDimensions: coverage ? coverage.uncoveredDimensions : [],
      failingCaseCount: triage ? triage.failingCaseCount : null,
    },
  };

  fs.mkdirSync(OUT_DIR, { recursive: true });
  const outJson = path.join(OUT_DIR, `strategy-intelligence-automation-${nowSlug()}.json`);
  const outMd = path.join(OUT_DIR, `strategy-intelligence-automation-${nowSlug()}.md`);
  fs.writeFileSync(outJson, `${JSON.stringify(report, null, 2)}\n`, "utf8");

  const lines = [];
  lines.push("# Strategy Intelligence Automation Run");
  lines.push("");
  lines.push(`Generated: ${report.generatedAt}`);
  lines.push(`Target version: ${report.implementationVersionTarget}`);
  lines.push(`All passed: ${report.summary.allPassed}`);
  lines.push(`Failed step: ${report.summary.failedStep || "none"}`);
  lines.push("");
  lines.push("## Steps");
  for (const s of stepResults) {
    lines.push(`- ${s.name} | ${s.classification} | exit=${s.exitCode} | durationMs=${s.durationMs}`);
    lines.push(`  command: ${s.command}`);
  }
  lines.push("");
  lines.push("## Coverage Gaps");
  if (report.summary.uncoveredDimensions.length) {
    for (const d of report.summary.uncoveredDimensions) lines.push(`- ${d}`);
  } else {
    lines.push("- none");
  }
  lines.push("");
  lines.push("## Failing Cases");
  lines.push(`- ${report.summary.failingCaseCount == null ? "unknown" : report.summary.failingCaseCount}`);

  fs.writeFileSync(outMd, `${lines.join("\n")}\n`, "utf8");

  console.log(`automation report written: ${path.relative(ROOT, outJson).replace(/\\/g, "/")}`);
  if (!report.summary.allPassed) process.exit(1);
}

main();

#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const runtimePath = path.join(root, "dev-src", "runtime-sections", "runtime-main.js");

function fail(message) {
  throw new Error(message);
}

if (!fs.existsSync(runtimePath)) fail(`Missing runtime file: ${runtimePath}`);
const source = fs.readFileSync(runtimePath, "utf8");

function requirePattern(pattern, message) {
  if (!pattern.test(source)) fail(message);
}

requirePattern(/mirrorGateOrder\s*=\s*\[/, "P1 failed: mirror gate-order array not found.");
requirePattern(/relevant-army[\s\S]*no relevant territory army exists/, "P1 failed: no-relevant-army gate/reason not wired.");
requirePattern(/mirrorTerritoryRateGainRatio/, "P2 failed: normalized territory gain ratio missing.");
requirePattern(/mirrorEtaGainRatio/, "P2 failed: normalized eta gain ratio missing.");
requirePattern(/mirrorMeaningful\s*=\s*Math\.max\(mirrorTerritoryRateGainRatio, mirrorEtaGainRatio\)\s*>=\s*minMeaningfulBenefit/, "P2 failed: meaningful gate does not use normalized threshold comparison.");
requirePattern(/supportCandidates\s*=\s*\[/, "P3-P5 failed: support candidate list missing.");
requirePattern(/rankCandidate\(/, "P3-P5 failed: deterministic candidate ranking function missing.");
requirePattern(/energySupportCandidateRanking/, "P3-P5 failed: candidate ranking observability missing.");
requirePattern(/energySupportBestUseSelectionReason/, "P3-P5 failed: selection reason observability missing.");

console.log("0.11.3 HoM arbitration targeted checks passed.");

#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const runtimePath = path.join(root, "dev-src", "runtime-sections", "runtime-main.js");

function fail(message) {
  throw new Error(message);
}

if (!fs.existsSync(runtimePath)) {
  fail(`Missing runtime file: ${runtimePath}`);
}

const source = fs.readFileSync(runtimePath, "utf8");

function requirePattern(pattern, message) {
  if (!pattern.test(source)) fail(message);
}

requirePattern(/function\s+unitMatchesArmyPrepLabel\s*\([\s\S]*?\$\{unit\?\.suffix\s*\|\|\s*""\}/, "HoM check failed: suffix-aware unit label matching not found.");
requirePattern(/mirrorArmyState\s*=\s*getHouseOfMirrorsArmyState\(game\)/, "HoM check failed: broker does not read shared current HoM army state.");
requirePattern(/missingMirrorUnits\s*=\s*mirrorArmyState\.missing\.slice\(\)/, "HoM check failed: missing preferred-unit list is not recomputed from current state.");
requirePattern(/energySupportMirrorReason\s*:\s*mirrorReason/, "HoM check failed: mirror reason field wiring missing.");
requirePattern(/energySupportMirrorReadinessState\s*:\s*mirrorReadinessState/, "HoM check failed: mirror readiness state field wiring missing.");

console.log("0.11.2 HoM readiness targeted checks passed.");

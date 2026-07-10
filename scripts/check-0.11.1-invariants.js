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
  if (!pattern.test(source)) {
    fail(message);
  }
}

// Invariant A: Expansion-save-window priority must demote Lepidoptera primary.
requirePattern(/function\s+isExpansionSaveWindowPriority\s*\(/, "Invariant A failed: expansion save-window priority helper missing.");
requirePattern(/if\s*\(expansionSaveWindowPriority\s*&&\s*lepiRole\s*===\s*"primary"\)/, "Invariant A failed: Lepidoptera primary is not gated by Expansion save-window priority.");

// Invariant B: Background Lepidoptera cannot drive momentum best-step/focus.
requirePattern(/if\s*\(energySupport\.energySupportLepidopteraRole\s*===\s*"background"\)/, "Invariant B failed: no background Lepidoptera consistency gate.");
requirePattern(/Background Lepidoptera cannot become momentum best-step\./, "Invariant B failed: background role does not explicitly demote momentum best-step.");

// Invariant C: Primary Lepidoptera maps to Beetle Magus speaker/advisor source.
requirePattern(/const\s+lepidopteraIsPrimary\s*=\s*energySupport\.energySupportLepidopteraRole\s*===\s*"primary"/, "Invariant C failed: Lepidoptera primary predicate missing.");
requirePattern(/primaryAdvisor\s*=\s*"Beetle Magus";/, "Invariant C failed: Lepidoptera primary does not map to Beetle Magus advisor.");
requirePattern(/resolveCouncilPrimarySpeaker\s*\(/, "Invariant C failed: centralized speaker resolver missing.");

// Invariant D: Mirror readiness/reason refresh must use current shared army-state scanner.
requirePattern(/function\s+getHouseOfMirrorsArmyState\s*\(/, "Invariant D failed: shared House of Mirrors army-state scanner missing.");
requirePattern(/const\s+mirrorArmyState\s*=\s*getHouseOfMirrorsArmyState\(game\);/, "Invariant D failed: broker/ability prep does not read shared mirror army-state.");
requirePattern(/energySupportMirrorReadinessState/, "Invariant D failed: mirror readiness state observability field missing.");

console.log("0.11.1 targeted invariant checks passed.");

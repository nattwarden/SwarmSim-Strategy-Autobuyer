#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const packagePath = path.join(root, "package.json");
const runtimePath = path.join(root, "dev-src", "runtime-sections", "runtime-main.js");
const canonicalPath = path.join(root, "src", "SwarmSim-Strategy-Autobuyer.user.js");
const scenarioResultsTemplatePath = path.join(root, "docs", "test-data", "0.11.5-scenarios", "scenario-results.json");

function fail(message) {
  throw new Error(message);
}

function requirePattern(source, pattern, message) {
  if (!pattern.test(source)) fail(message);
}

if (!fs.existsSync(packagePath)) fail(`Missing package.json: ${packagePath}`);
if (!fs.existsSync(runtimePath)) fail(`Missing runtime file: ${runtimePath}`);
if (!fs.existsSync(canonicalPath)) fail(`Missing canonical source: ${canonicalPath}`);

const pkg = JSON.parse(fs.readFileSync(packagePath, "utf8"));
const source = fs.readFileSync(runtimePath, "utf8");
const canonicalSource = fs.readFileSync(canonicalPath, "utf8");
const pkgVersion = String(pkg.version || "").trim();

if (pkgVersion !== "0.11.5") fail(`F7 failed: package version must be 0.11.5, got ${pkgVersion || "missing"}.`);

requirePattern(canonicalSource, /^\/\/\s*@version\s+0\.11\.5$/mu, "F7 failed: userscript metadata version must be 0.11.5.");
requirePattern(source, /const\s+AUTOBUYER_VERSION\s*=\s*"0\.11\.5"\s*;/, "F7 failed: canonical runtime version constant must be 0.11.5.");
requirePattern(source, /const\s+SCRIPT_VERSION\s*=\s*AUTOBUYER_VERSION\s*;/, "F7 failed: SCRIPT_VERSION must derive from canonical runtime version.");
requirePattern(source, /const\s+SCENARIO_REPORT_VERSION\s*=\s*AUTOBUYER_VERSION\s*;/, "F7 failed: scenario report version must derive from canonical runtime version.");
requirePattern(source, /scriptVersion:\s*SCRIPT_VERSION\s*,/, "F7 failed: export scriptVersion must come from canonical runtime version.");
requirePattern(source, /autobuyerVersion:\s*SCRIPT_VERSION\s*,/, "F7 failed: scenario report autobuyerVersion must come from canonical runtime version.");
requirePattern(source, /SwarmBot v\$\{SCRIPT_VERSION\}/, "F7 failed: badge source must use canonical runtime version.");

if (/scriptVersion\s*:\s*(null|undefined|""|'')/u.test(source)) {
  fail("F8 failed: scriptVersion surface contains null/undefined/empty assignment.");
}
if (/autobuyerVersion\s*:\s*(null|undefined|""|'')/u.test(source)) {
  fail("F8 failed: autobuyerVersion surface contains null/undefined/empty assignment.");
}

if (fs.existsSync(scenarioResultsTemplatePath)) {
  const template = JSON.parse(fs.readFileSync(scenarioResultsTemplatePath, "utf8"));
  const scriptVersion = String(template.scriptVersion || "").trim();
  const autobuyerVersion = String(template.autobuyerVersion || "").trim();
  if (!scriptVersion || scriptVersion !== "0.11.5") {
    fail(`F8 failed: scenario-results template scriptVersion must be 0.11.5, got ${scriptVersion || "missing"}.`);
  }
  if (!autobuyerVersion || autobuyerVersion !== "0.11.5") {
    fail(`F8 failed: scenario-results template autobuyerVersion must be 0.11.5, got ${autobuyerVersion || "missing"}.`);
  }
}

console.log("0.11.5 version surfaces checks passed (F7-F8).");

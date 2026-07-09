#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { spawnSync } = require("child_process");

const root = path.resolve(__dirname, "..");
const canonicalScript = path.join(root, "src", "SwarmSim-Strategy-Autobuyer.user.js");
const failures = [];

function rel(file) {
  return path.relative(root, file).replace(/\\/g, "/");
}

function fail(message) {
  failures.push(message);
}

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === ".git" || entry.name === "node_modules") continue;
      files.push(...walk(fullPath));
    } else if (entry.isFile()) {
      files.push(fullPath);
    }
  }
  return files;
}

function hashFile(file) {
  return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
}

if (!fs.existsSync(canonicalScript)) {
  fail(`Missing canonical script: ${rel(canonicalScript)}`);
} else {
  const syntax = spawnSync(process.execPath, ["--check", canonicalScript], {
    cwd: root,
    encoding: "utf8",
  });
  if (syntax.status !== 0) {
    fail(`node --check failed for ${rel(canonicalScript)}:\n${syntax.stderr || syntax.stdout}`);
  }

  const script = fs.readFileSync(canonicalScript, "utf8");
  const requiredDefaults = [
    ["autoCastAbilities", "false"],
    ["autoAscend", "false"],
    ["saveEnergyForNexus", "true"],
    ["energyPlanner", "true"],
    ["nexusTarget", "5"],
    ["cloneBufferPlanner", "true"],
    ["cloneBufferProtectLarvae", "true"],
    ["smartUnitBuyPercent", "0.25"],
    ["meatChainReserveMultiplier", "2"],
    ["meatChainMaxPaybackSeconds", "1800"],
  ];

  for (const [key, expected] of requiredDefaults) {
    const pattern = new RegExp(`${key}\\s*:\\s*${expected}\\b`);
    if (!pattern.test(script)) {
      fail(`Safe default not found as expected: ${key}: ${expected}`);
    }
  }

  if (/\bbuyMax(Unit|Upgrade)?\s*\(\s*\{[\s\S]{0,240}percent\s*:\s*1\b/.test(script)) {
    fail("Potential full-percent buyMax call found in canonical script.");
  }

  const allFiles = walk(root);
  for (const file of allFiles) {
    const relative = rel(file);
    if (/^AI-\d{4}-\d{2}-\d{2}-script-.*-indexed\.md$/.test(relative)) {
      fail(`Archived AI index snapshot should be summarized in docs/HISTORY.md, not kept at repo root: ${relative}`);
    }
    if (relative.startsWith("releases/")) {
      fail(`Duplicate release tree is not allowed; use docs/release-notes/ and docs/HISTORY.md: ${relative}`);
    }
  }

  const canonicalHash = hashFile(canonicalScript);
  const duplicateScripts = allFiles.filter((file) => {
    if (path.resolve(file) === path.resolve(canonicalScript)) return false;
    return file.endsWith(".user.js");
  });

  for (const file of duplicateScripts) {
    fail(`Duplicate .user.js outside src is not allowed: ${rel(file)}`);
  }

  for (const file of allFiles) {
    if (path.resolve(file) === path.resolve(canonicalScript)) continue;
    const ext = path.extname(file).toLowerCase();
    if (![".js", ".txt", ".md"].includes(ext)) continue;
    const content = fs.readFileSync(file);
    if (content.length === 0) continue;
    if (crypto.createHash("sha256").update(content).digest("hex") === canonicalHash) {
      fail(`Byte-identical script copy outside src is not allowed: ${rel(file)}`);
    }
    if (ext === ".txt" && content.includes(Buffer.from("// ==UserScript=="))) {
      fail(`.txt userscript mirror is not allowed: ${rel(file)}`);
    }
  }
}

if (!fs.existsSync(path.join(root, "docs", "SWARMSIM_GAME_MODEL.md"))) {
  fail("Missing active game model: docs/SWARMSIM_GAME_MODEL.md");
}

if (failures.length) {
  console.error("Repo guardrail validation failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Repo guardrail validation passed.");

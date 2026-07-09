#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const configPath = path.join(root, "scripts", "canonical-build.config.json");

function readConfig() {
  if (!fs.existsSync(configPath)) {
    throw new Error(`Missing build config: ${configPath}`);
  }

  const cfg = JSON.parse(fs.readFileSync(configPath, "utf8"));
  if (!cfg?.target || !Array.isArray(cfg?.parts)) {
    throw new Error("Invalid build config: expected target and parts.");
  }

  const runtimePart = cfg.parts.find((part) => String(part?.kind || "").trim() === "file");
  if (!runtimePart?.path) {
    throw new Error("Build config must include a runtime file part path.");
  }

  return {
    target: String(cfg.target),
    runtimePath: String(runtimePart.path),
  };
}

function extractRuntime(canonicalSource) {
  const metadataMatch = canonicalSource.match(/\/\/ ==UserScript==[\s\S]*?\/\/ ==\/UserScript==/u);
  if (!metadataMatch || typeof metadataMatch.index !== "number") {
    throw new Error("Userscript metadata block missing in canonical source.");
  }

  const runtimeRaw = canonicalSource.slice(metadataMatch.index + metadataMatch[0].length);
  const runtime = runtimeRaw.replace(/^(?:\r?\n)+/u, "").replace(/\s*$/u, "");
  if (!runtime) {
    throw new Error("Canonical runtime block is empty.");
  }
  return runtime + "\n";
}

function main() {
  const { target, runtimePath } = readConfig();
  const canonicalPath = path.join(root, target);
  const runtimeOutPath = path.join(root, runtimePath);

  if (!fs.existsSync(canonicalPath)) {
    throw new Error(`Missing canonical userscript: ${canonicalPath}`);
  }

  const canonicalSource = fs.readFileSync(canonicalPath, "utf8");
  const runtime = extractRuntime(canonicalSource);
  fs.writeFileSync(runtimeOutPath, runtime, "utf8");

  console.log(`Runtime extracted to ${runtimePath}`);
}

try {
  main();
} catch (error) {
  console.error(error.message || error);
  process.exit(1);
}

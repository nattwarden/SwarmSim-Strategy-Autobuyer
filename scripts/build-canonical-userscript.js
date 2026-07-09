#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const configPath = path.join(root, "scripts", "canonical-build.config.json");

function readBuildConfig() {
  if (!fs.existsSync(configPath)) {
    throw new Error(`Missing build config: ${configPath}`);
  }

  const raw = fs.readFileSync(configPath, "utf8");
  const config = JSON.parse(raw);
  if (!config?.target || !config?.source || !Array.isArray(config?.parts) || !config.parts.length) {
    throw new Error("Invalid canonical build config. Expected target, source and non-empty parts.");
  }
  return config;
}

function extractSections(source) {
  const metadataMatch = source.match(/\/\/ ==UserScript==[\s\S]*?\/\/ ==\/UserScript==/u);
  if (!metadataMatch || typeof metadataMatch.index !== "number") {
    throw new Error("Userscript metadata block missing in canonical source.");
  }

  const metadata = metadataMatch[0];
  const runtimeRaw = source.slice(metadataMatch.index + metadata.length);
  const runtime = runtimeRaw.replace(/^(?:\r?\n)+/u, "");

  if (!runtime.trim()) {
    throw new Error("Canonical source runtime block is empty.");
  }

  return { metadata, runtime };
}

function resolvePart(kind, sections) {
  if (kind === "metadata") return sections.metadata.replace(/(?:\r?\n)+$/u, "");
  if (kind === "runtime") return sections.runtime.replace(/(?:\r?\n)+$/u, "");
  throw new Error(`Unsupported build part kind: ${kind}`);
}

function buildCanonicalContent(source, config) {
  const eol = source.includes("\r\n") ? "\r\n" : "\n";
  const sections = extractSections(source);

  const built = config.parts
    .map((part) => resolvePart(part.kind, sections))
    .join(`${eol}${eol}`);

  return `${built}${eol}`;
}

function main() {
  const mode = process.argv.includes("--write") ? "write" : "check";
  const config = readBuildConfig();
  const canonicalPath = path.join(root, config.target);
  const sourcePath = path.join(root, config.source);

  if (!fs.existsSync(canonicalPath)) {
    throw new Error(`Missing canonical userscript: ${canonicalPath}`);
  }

  if (!fs.existsSync(sourcePath)) {
    throw new Error(`Missing source userscript: ${sourcePath}`);
  }

  const source = fs.readFileSync(sourcePath, "utf8");
  const currentCanonical = fs.readFileSync(canonicalPath, "utf8");
  const built = buildCanonicalContent(source, config);

  if (mode === "write") {
    if (currentCanonical !== built) {
      fs.writeFileSync(canonicalPath, built, "utf8");
      console.log("Canonical userscript rebuilt from configured parts.");
    } else {
      console.log("Canonical userscript already up to date.");
    }
    return;
  }

  if (currentCanonical !== built) {
    console.error("Build check failed: canonical userscript is out of sync with configured parts.");
    console.error("Run: node scripts/build-canonical-userscript.js --write");
    process.exit(1);
  }

  console.log("Build check passed: canonical userscript matches configured assembly parts.");
}

try {
  main();
} catch (error) {
  console.error(error.message || error);
  process.exit(1);
}

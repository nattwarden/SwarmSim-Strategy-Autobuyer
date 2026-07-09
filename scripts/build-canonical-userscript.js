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

function readTextFile(relPath) {
  const fullPath = path.join(root, relPath);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`Missing build source file: ${fullPath}`);
  }
  return fs.readFileSync(fullPath, "utf8");
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

function indentBlock(blockText, indent, eol) {
  const normalized = blockText.replace(/\r\n/g, "\n").replace(/\r/g, "\n").replace(/(?:\n)+$/u, "");
  if (!normalized) return "";
  return normalized.split("\n").map((line) => `${indent}${line}`).join(eol);
}

function syncNamedSection(content, section, eol) {
  const marker = String(section?.marker || "").trim();
  const sourcePath = String(section?.path || "").trim();
  if (!marker || !sourcePath) {
    throw new Error("Each build section must provide marker and path.");
  }

  const startToken = `// <build:section:${marker}:start>`;
  const endToken = `// <build:section:${marker}:end>`;

  const startIndex = content.indexOf(startToken);
  const endIndex = content.indexOf(endToken);
  if (startIndex < 0 || endIndex < 0 || endIndex <= startIndex) {
    throw new Error(`Missing or invalid marker section: ${marker}`);
  }

  const lineStart = content.lastIndexOf(eol, startIndex - 1);
  const startLineStart = lineStart >= 0 ? lineStart + eol.length : 0;
  const indent = content.slice(startLineStart, startIndex);

  const startLineEnd = content.indexOf(eol, startIndex);
  if (startLineEnd < 0) {
    throw new Error(`Malformed start marker line for section: ${marker}`);
  }

  const endLineStartRaw = content.lastIndexOf(eol, endIndex - 1);
  const endLineStart = endLineStartRaw >= 0 ? endLineStartRaw + eol.length : 0;
  const bodyStart = startLineEnd + eol.length;

  const sectionSource = readTextFile(sourcePath);
  const indented = indentBlock(sectionSource, indent, eol);
  const replacement = indented ? `${indented}${eol}` : "";

  return `${content.slice(0, bodyStart)}${replacement}${content.slice(endLineStart)}`;
}

function applyConfiguredSections(content, config, eol) {
  const sections = Array.isArray(config?.sections) ? config.sections : [];
  let synced = content;
  for (const section of sections) {
    synced = syncNamedSection(synced, section, eol);
  }
  return synced;
}

function buildCanonicalContent(config) {
  const defaultSource = readTextFile(config.source);
  const eol = defaultSource.includes("\r\n") ? "\r\n" : "\n";
  const sectionCache = new Map();

  function sectionsFor(relPath) {
    const key = relPath || config.source;
    if (!sectionCache.has(key)) {
      sectionCache.set(key, extractSections(readTextFile(key)));
    }
    return sectionCache.get(key);
  }

  function resolveConfiguredPart(part) {
    const kind = String(part?.kind || "").trim();
    if (!kind) {
      throw new Error("Build part is missing kind.");
    }

    if (kind === "file") {
      const relPath = String(part.path || "").trim();
      if (!relPath) throw new Error("Build part kind=file requires path.");
      return readTextFile(relPath).replace(/(?:\r?\n)+$/u, "");
    }

    const source = String(part?.source || config.source).trim();
    return resolvePart(kind, sectionsFor(source));
  }

  const built = config.parts
    .map((part) => resolveConfiguredPart(part))
    .join(`${eol}${eol}`);

  const withSections = applyConfiguredSections(`${built}${eol}`, config, eol);
  return withSections;
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

  const currentCanonical = fs.readFileSync(canonicalPath, "utf8");
  const built = buildCanonicalContent(config);

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

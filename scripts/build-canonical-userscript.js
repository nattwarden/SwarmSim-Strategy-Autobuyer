#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const canonicalPath = path.join(root, "src", "SwarmSim-Strategy-Autobuyer.user.js");

function readCanonical() {
  if (!fs.existsSync(canonicalPath)) {
    throw new Error(`Missing canonical userscript: ${canonicalPath}`);
  }
  return fs.readFileSync(canonicalPath, "utf8");
}

function buildCanonicalContent(source) {
  // Phase 4 bootstrap: keep runtime behavior unchanged while introducing a
  // stable build entrypoint. Future phases can replace this with module assembly.
  if (!source.includes("// ==UserScript==") || !source.includes("// ==/UserScript==")) {
    throw new Error("Userscript metadata block missing in canonical source.");
  }

  // Ensure a single trailing newline for deterministic checksums across tools.
  return source.replace(/\s*$/u, "") + "\n";
}

function main() {
  const mode = process.argv.includes("--write") ? "write" : "check";
  const source = readCanonical();
  const built = buildCanonicalContent(source);

  if (mode === "write") {
    if (source !== built) {
      fs.writeFileSync(canonicalPath, built, "utf8");
      console.log("Canonical userscript normalized by build step.");
    } else {
      console.log("Canonical userscript already up to date.");
    }
    return;
  }

  if (source !== built) {
    console.error("Build check failed: canonical userscript is not normalized.");
    console.error("Run: node scripts/build-canonical-userscript.js --write");
    process.exit(1);
  }

  console.log("Build check passed: canonical userscript is normalized.");
}

try {
  main();
} catch (error) {
  console.error(error.message || error);
  process.exit(1);
}

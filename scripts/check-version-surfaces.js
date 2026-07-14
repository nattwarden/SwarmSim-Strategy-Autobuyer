// Generic, version-agnostic replacement for the old per-version
// `check-X.Y.Z-version-surfaces.js` scripts. Reads the version from
// package.json (single source of truth) instead of hardcoding it, so a
// version bump never needs a new script, a new npm script entry, or new
// mandatory doc files just to keep `npm run verify` green.
//
// Doc updates (README, HISTORY.md, BOOK00_CURRENT_STATUS.md, release notes)
// are still good practice on a real release, but they are no longer gated
// by this check. Only the surfaces that actually affect running code are
// enforced here, plus one permanent regression guard.

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const userscriptPath = path.join(ROOT, "src", "SwarmSim-Strategy-Autobuyer.user.js");
const runtimePath = path.join(ROOT, "dev-src", "runtime-sections", "runtime-main.js");
const packageJsonPath = path.join(ROOT, "package.json");
const packageLockPath = path.join(ROOT, "package-lock.json");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function readText(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function main() {
  const packageJson = JSON.parse(readText(packageJsonPath));
  const packageLock = JSON.parse(readText(packageLockPath));
  const userscript = readText(userscriptPath);
  const runtime = readText(runtimePath);
  const version = packageJson.version;

  assert(/^\d+\.\d+\.\d+$/.test(version), `package.json version "${version}" must be a plain semver string`);

  assert(packageLock.version === version, `package-lock.json root version must match package.json (${version})`);
  assert(
    packageLock.packages?.[""]?.version === version,
    `package-lock.json package version must match package.json (${version})`
  );
  assert(userscript.includes(`// @version      ${version}`), `userscript metadata version must be ${version}`);
  assert(
    userscript.includes(`const AUTOBUYER_VERSION = "${version}";`),
    `userscript runtime version constant must be ${version}`
  );
  assert(
    runtime.includes(`const AUTOBUYER_VERSION = "${version}";`),
    `dev-src runtime version constant must be ${version}`
  );

  // Permanent regression guard (not version-specific): hardcoding this to
  // true previously disabled every proven legacy purchase path and shipped
  // a bot that could observe/advise but never buy anything (fixed in
  // 9.0.0). It must never regress, at any version.
  assert(
    runtime.includes("const m6DecisionOwnsMainCycle = false;"),
    "runtime must keep legacy per-lane execution as the acting purchaser (m6DecisionOwnsMainCycle must stay false)"
  );

  console.log(`VERSION SURFACES CHECK PASSED (${version})`);
}

main();

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

  // 9.4.0 Global Execution Ownership. Before 9.4.0 the acting purchaser was the legacy per-lane
  // walk and a hardcoded `m6DecisionOwnsMainCycle = false` kept the six-domain coordinator advisory
  // only (because only Territory populated a comparable metric, so flipping it left nothing to buy).
  // 9.4.0 made every lane comparable and the acting purchaser is now the authorized global winner of
  // a freshly re-evaluated six-domain coordinator (runGlobalOwnedMainActionStep), looped up to
  // smartMaxActionsPerRun with an honest WAIT when nothing is comparable. Permanent regression guard:
  // the ownership step and its authority gate must exist so the bot both (a) buys via authorized
  // winners and (b) never falls through to an unauthorized legacy purchase.
  assert(
    runtime.includes("function runGlobalOwnedMainActionStep(")
      && runtime.includes("wholeEconomyExecutionDecisionState.executionAuthority === true"),
    "runtime must keep 9.4.0 global execution ownership (runGlobalOwnedMainActionStep must authorize execution)"
  );
  assert(
    !runtime.includes("const m6DecisionOwnsMainCycle = false;"),
    "9.4.0 retired the legacy advisor-fallthrough gate; m6DecisionOwnsMainCycle=false must not return"
  );

  console.log(`VERSION SURFACES CHECK PASSED (${version})`);
}

main();

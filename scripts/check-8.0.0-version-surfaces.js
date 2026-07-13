const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const userscriptPath = path.join(ROOT, "src", "SwarmSim-Strategy-Autobuyer.user.js");
const runtimePath = path.join(ROOT, "dev-src", "runtime-sections", "runtime-main.js");
const packageJsonPath = path.join(ROOT, "package.json");
const packageLockPath = path.join(ROOT, "package-lock.json");
const readmePath = path.join(ROOT, "README.md");
const historyPath = path.join(ROOT, "docs", "process", "HISTORY.md");
const statusPath = path.join(ROOT, "docs", "strategy", "BOOK00_CURRENT_STATUS.md");
const releaseNotesPath = path.join(ROOT, "docs", "release-notes", "SwarmSim-Strategy-Autobuyer-8.0.0-release-notes.md");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function readText(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function main() {
  const userscript = readText(userscriptPath);
  const runtime = readText(runtimePath);
  const packageJson = JSON.parse(readText(packageJsonPath));
  const packageLock = JSON.parse(readText(packageLockPath));
  const readme = readText(readmePath);
  const history = readText(historyPath);
  const status = readText(statusPath);
  const releaseNotes = readText(releaseNotesPath);

  assert(packageJson.version === "8.0.0", "package.json version must be 8.0.0");
  assert(packageLock.version === "8.0.0", "package-lock.json root version must be 8.0.0");
  assert(packageLock.packages?.[""]?.version === "8.0.0", "package-lock.json package version must be 8.0.0");
  assert(userscript.includes("// @version      8.0.0"), "userscript metadata version must be 8.0.0");
  assert(userscript.includes('const AUTOBUYER_VERSION = "8.0.0";'), "userscript runtime version constant must be 8.0.0");
  assert(runtime.includes('const AUTOBUYER_VERSION = "8.0.0";'), "runtime version constant must be 8.0.0");
  assert(runtime.includes("function isMeatStallBreakerPatternReady()"), "runtime must expose M8 stall-breaker pattern gate");
  assert(runtime.includes("countConsecutiveEtaGroundedReserveAbilityBlockedMainHolds"), "runtime must expose ETA-grounded hold streak tracking");
  assert(packageJson.scripts?.["check:book00:m8:false-wait"], "package.json must include M8 checker script");
  assert(packageJson.scripts?.["check:8.0.0:versions"], "package.json must include 8.0.0 version checker script");
  assert(packageJson.scripts?.verify?.includes("check:8.0.0:versions"), "verify must include 8.0.0 version checker");
  assert(packageJson.scripts?.verify?.includes("check:book00:m8:false-wait"), "verify must include M8 checker");
  assert(readme.includes("Current script version in `src/`: **8.0.0**."), "README must mention 8.0.0");
  assert(history.includes("- 8.0.0:"), "HISTORY must mention 8.0.0");
  assert(status.includes("Current runtime version: `8.0.0`"), "BOOK-00 status must mention runtime version 8.0.0");
  assert(releaseNotes.includes("# SwarmSim Strategy Autobuyer 8.0.0"), "8.0.0 release notes must exist");
  assert(releaseNotes.includes("Milestone 8"), "8.0.0 release notes must mention Milestone 8");

  console.log("8.0.0 VERSION SURFACES CHECK PASSED");
}

main();

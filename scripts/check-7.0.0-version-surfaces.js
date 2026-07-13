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
const releaseNotesPath = path.join(ROOT, "docs", "release-notes", "SwarmSim-Strategy-Autobuyer-7.0.0-release-notes.md");

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

  assert(packageJson.version === "7.0.0", "package.json version must be 7.0.0");
  assert(packageLock.version === "7.0.0", "package-lock.json root version must be 7.0.0");
  assert(packageLock.packages?.[""]?.version === "7.0.0", "package-lock.json package version must be 7.0.0");
  assert(userscript.includes("// @version      7.0.0"), "userscript metadata version must be 7.0.0");
  assert(userscript.includes('const AUTOBUYER_VERSION = "7.0.0";'), "userscript runtime version constant must be 7.0.0");
  assert(runtime.includes('const AUTOBUYER_VERSION = "7.0.0";'), "runtime version constant must be 7.0.0");
  assert(runtime.includes('const STRATEGIC_OUTCOME_CALIBRATION_SCHEMA_VERSION = "strategic-outcome-calibration.v1"'), "runtime must expose M7 calibration schema");
  assert(runtime.includes("function buildStrategicOutcomeCalibration(input = {})"), "runtime must expose M7 calibration evaluator");
  assert(runtime.includes("function calibrateAbilityOutcome("), "runtime must expose calibrated ability adapter");
  assert(runtime.includes("function calibrateAscensionOutcome("), "runtime must expose calibrated ascension adapter");
  assert(runtime.includes("strategicCoordinator: {"), "userscript must expose strategicCoordinator API");
  assert(runtime.includes("calibration: {"), "strategicCoordinator API must expose calibration surface");
  assert(packageJson.scripts?.["check:book00:m7:calibrated-outcomes"], "package.json must include M7 checker script");
  assert(packageJson.scripts?.["check:7.0.0:versions"], "package.json must include 7.0.0 version checker script");
  assert(packageJson.scripts?.verify?.includes("check:7.0.0:versions"), "verify must include 7.0.0 version checker");
  assert(packageJson.scripts?.verify?.includes("check:book00:m7:calibrated-outcomes"), "verify must include M7 checker");
  assert(readme.includes("Current script version in `src/`: **7.0.0**."), "README must mention 7.0.0");
  assert(history.includes("- 7.0.0:"), "HISTORY must mention 7.0.0");
  assert(status.includes("Current runtime version: `7.0.0`"), "BOOK-00 status must mention runtime version 7.0.0");
  assert(releaseNotes.includes("# SwarmSim Strategy Autobuyer 7.0.0"), "7.0.0 release notes must exist");
  assert(releaseNotes.includes("strategic-outcome-calibration.v1"), "7.0.0 release notes must mention M7 calibration contract");

  console.log("7.0.0 VERSION SURFACES CHECK PASSED");
}

main();

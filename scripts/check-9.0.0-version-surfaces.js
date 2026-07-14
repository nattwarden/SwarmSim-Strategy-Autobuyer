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
const releaseNotesPath = path.join(ROOT, "docs", "release-notes", "SwarmSim-Strategy-Autobuyer-9.0.0-release-notes.md");

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

  assert(packageJson.version === "9.0.0", "package.json version must be 9.0.0");
  assert(packageLock.version === "9.0.0", "package-lock.json root version must be 9.0.0");
  assert(packageLock.packages?.[""]?.version === "9.0.0", "package-lock.json package version must be 9.0.0");
  assert(userscript.includes("// @version      9.0.0"), "userscript metadata version must be 9.0.0");
  assert(userscript.includes('const AUTOBUYER_VERSION = "9.0.0";'), "userscript runtime version constant must be 9.0.0");
  assert(runtime.includes('const AUTOBUYER_VERSION = "9.0.0";'), "runtime version constant must be 9.0.0");
  assert(runtime.includes("function isMeatStallBreakerPatternReady()"), "runtime must expose M8 stall-breaker pattern gate");
  assert(runtime.includes("countConsecutiveEtaGroundedReserveAbilityBlockedMainHolds"), "runtime must expose ETA-grounded hold streak tracking");
  assert(runtime.includes("const m6DecisionOwnsMainCycle = false;"), "runtime must keep legacy per-lane execution as the acting purchaser");
  assert(userscript.includes("smartUnitBuyPercent: 0.35"), "userscript must include higher Smart chunk default 0.35");
  assert(userscript.includes("meatChainReserveMultiplier: 1.25"), "userscript must include reduced Meat reserve multiplier 1.25");
  assert(userscript.includes("meatChainMaxPaybackSeconds: 3600"), "userscript must include wider Meat payback horizon 3600s");
  assert(userscript.includes("saveForHatcherySeconds: 180"), "userscript must include tighter Hatchery save window 180s");
  assert(userscript.includes("saveForExpansionSeconds: 600"), "userscript must include tighter Expansion save window 600s");
  assert(packageJson.scripts?.["check:book00:m8:false-wait"], "package.json must include M8 checker script");
  assert(packageJson.scripts?.["check:book00:m9:resource-locks"], "package.json must include M9 checker script");
  assert(packageJson.scripts?.["check:9.0.0:versions"], "package.json must include 9.0.0 version checker script");
  assert(packageJson.scripts?.verify?.includes("check:9.0.0:versions"), "verify must include 9.0.0 version checker");
  assert(packageJson.scripts?.verify?.includes("check:book00:m8:false-wait"), "verify must include M8 checker");
  assert(packageJson.scripts?.verify?.includes("check:book00:m9:resource-locks"), "verify must include M9 checker");
  assert(readme.includes("Current script version in `src/`: **9.0.0**."), "README must mention 9.0.0");
  assert(history.includes("- 9.0.0:"), "HISTORY must mention 9.0.0");
  assert(status.includes("Current runtime version: `9.0.0`"), "BOOK-00 status must mention runtime version 9.0.0");
  assert(releaseNotes.includes("# SwarmSim Strategy Autobuyer 9.0.0"), "9.0.0 release notes must exist");
  assert(releaseNotes.includes("Milestone 9"), "9.0.0 release notes must mention Milestone 9");

  console.log("9.0.0 VERSION SURFACES CHECK PASSED");
}

main();

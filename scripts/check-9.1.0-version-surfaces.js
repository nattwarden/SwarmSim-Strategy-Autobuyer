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
const releaseNotesPath = path.join(ROOT, "docs", "release-notes", "SwarmSim-Strategy-Autobuyer-9.1.0-release-notes.md");

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

  assert(packageJson.version === "9.1.0", "package.json version must be 9.1.0");
  assert(packageLock.version === "9.1.0", "package-lock.json root version must be 9.1.0");
  assert(packageLock.packages?.[""]?.version === "9.1.0", "package-lock.json package version must be 9.1.0");
  assert(userscript.includes("// @version      9.1.0"), "userscript metadata version must be 9.1.0");
  assert(userscript.includes('const AUTOBUYER_VERSION = "9.1.0";'), "userscript runtime version constant must be 9.1.0");
  assert(runtime.includes('const AUTOBUYER_VERSION = "9.1.0";'), "runtime version constant must be 9.1.0");
  assert(runtime.includes("const m6DecisionOwnsMainCycle = false;"), "runtime must keep legacy per-lane execution as the acting purchaser");
  assert(
    runtime.includes("projectedMilestoneProgressDelta: Number.isFinite(milestoneProgressDelta)"),
    "runtime must expose projectedMilestoneProgressDelta on the purchase shared outcome"
  );
  assert(
    runtime.includes('...(buyable ? { projectedMilestoneProgressDelta: 100 } : {})'),
    "Engine proposal loop must set a discrete completion-event progress delta when buyable"
  );
  assert(packageJson.scripts?.["check:book00:m6:six-domain"], "package.json must include M6 checker script");
  assert(packageJson.scripts?.["check:book00:m7:calibrated-outcomes"], "package.json must include M7 checker script");
  assert(packageJson.scripts?.["check:9.1.0:versions"], "package.json must include 9.1.0 version checker script");
  assert(packageJson.scripts?.verify?.includes("check:9.1.0:versions"), "verify must include 9.1.0 version checker");
  assert(packageJson.scripts?.verify?.includes("check:book00:m6:six-domain"), "verify must include M6 checker");
  assert(packageJson.scripts?.verify?.includes("check:book00:m7:calibrated-outcomes"), "verify must include M7 checker");
  assert(readme.includes("Current script version in `src/`: **9.1.0**."), "README must mention 9.1.0");
  assert(history.includes("- 9.1.0:"), "HISTORY must mention 9.1.0");
  assert(status.includes("Current runtime version: `9.1.0`"), "BOOK-00 status must mention runtime version 9.1.0");
  assert(releaseNotes.includes("# SwarmSim Strategy Autobuyer 9.1.0"), "9.1.0 release notes must exist");
  assert(releaseNotes.includes("M6 comparability gap closed"), "9.1.0 release notes must mention the M6 comparability gap fix");

  console.log("9.1.0 VERSION SURFACES CHECK PASSED");
}

main();

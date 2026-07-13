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
const releaseNotesPath = path.join(ROOT, "docs", "release-notes", "SwarmSim-Strategy-Autobuyer-6.0.0-release-notes.md");

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

  assert(packageJson.version === "6.0.0", "package.json version must be 6.0.0");
  assert(packageLock.version === "6.0.0", "package-lock.json root version must be 6.0.0");
  assert(packageLock.packages?.[""]?.version === "6.0.0", "package-lock.json package version must be 6.0.0");
  assert(userscript.includes('// @version      6.0.0'), "userscript metadata version must be 6.0.0");
  assert(userscript.includes('const AUTOBUYER_VERSION = "6.0.0";'), "userscript runtime version constant must be 6.0.0");
  assert(userscript.includes('const SIX_DOMAIN_STRATEGIC_COORDINATOR_SCHEMA_VERSION = "six-domain-strategic-coordinator.v1"'), "userscript must expose the M6 coordinator schema");
  assert(userscript.includes('strategicCoordinator: {'), "userscript must expose strategicCoordinator API");
  assert(userscript.includes('getCouncilUiState()'), "userscript must expose getCouncilUiState");
  assert(packageJson.scripts?.['check:book00:m6:six-domain'], "package.json must run the M6 checker");
  assert(packageJson.scripts?.['check:6.0.0:versions'], "package.json must run the 6.0.0 version checker");
  assert(runtime.includes('const AUTOBUYER_VERSION = "6.0.0";'), "runtime version constant must be 6.0.0");
  assert(runtime.includes('const SIX_DOMAIN_STRATEGIC_COORDINATOR_SCHEMA_VERSION = "six-domain-strategic-coordinator.v1"'), "runtime must expose M6 coordinator schema");
  assert(readme.includes('Current script version in `src/`: **6.0.0**.'), "README must mention 6.0.0");
  assert(history.includes('- 6.0.0:'), "HISTORY must mention 6.0.0");
  assert(status.includes('6.0.0 runtime slice is being implemented'), "BOOK-00 status must mention the M6 implementation slice");
  assert(releaseNotes.includes('# SwarmSim Strategy Autobuyer 6.0.0'), "6.0.0 release notes must exist");
  assert(releaseNotes.includes('six-domain strategic coordinator'), "6.0.0 release notes must mention the M6 capability");

  console.log('6.0.0 VERSION SURFACES CHECK PASSED');
}

main();

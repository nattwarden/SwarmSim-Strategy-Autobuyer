const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const VERSION = "5.0.1";

function read(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), "utf8");
}

const packageJson = JSON.parse(read("package.json"));
const packageLock = JSON.parse(read("package-lock.json"));
const runtime = read("dev-src/runtime-sections/runtime-main.js");
const userscript = read("src/SwarmSim-Strategy-Autobuyer.user.js");
const readme = read("README.md");
const history = read("docs/process/HISTORY.md");
const status = read("docs/strategy/BOOK00_CURRENT_STATUS.md");
const releaseNotes = read("docs/release-notes/SwarmSim-Strategy-Autobuyer-5.0.1-release-notes.md");

const checks = [
  [packageJson.version === VERSION, `package.json version must be ${VERSION}`],
  [packageLock.version === VERSION, `package-lock.json version must be ${VERSION}`],
  [packageLock.packages?.[""]?.version === VERSION, "package-lock root package version must match"],
  [runtime.includes(`const AUTOBUYER_VERSION = "${VERSION}";`), "runtime version must match"],
  [userscript.includes(`// @version      ${VERSION}`), "userscript metadata version must match"],
  [userscript.includes(`const AUTOBUYER_VERSION = "${VERSION}";`), "userscript runtime version must match"],
  [readme.includes(`Current script version in \`src/\`: **${VERSION}**.`), "README current version must match"],
  [history.includes(`- ${VERSION}:`), "history version entry must exist"],
  [status.includes("Milestone 5") && status.includes(VERSION), "status board must mention M5 and current version"],
  [releaseNotes.includes(`# SwarmSim Strategy Autobuyer ${VERSION}`), "release-note title must match"],
  [releaseNotes.includes("M5 live advisor hotfix"), "M5 hotfix capability must be documented"],
];

const failures = checks.filter(([ok]) => !ok).map(([, message]) => message);
if (failures.length) {
  console.error(`FAIL check-5.0.1-version-surfaces: ${failures.join("; ")}`);
  process.exit(1);
}

console.log("PASS check-5.0.1-version-surfaces");

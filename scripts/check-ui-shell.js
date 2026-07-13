const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const runtime = fs.readFileSync(path.join(ROOT, "dev-src/runtime-sections/runtime-main.js"), "utf8");
const userscript = fs.readFileSync(path.join(ROOT, "src/SwarmSim-Strategy-Autobuyer.user.js"), "utf8");

const required = [
  ['id="kbc-mode-advisor"', "Advisor mode control is missing"],
  ['id="kbc-mode-autobuyer"', "Autobuyer mode control is missing"],
  ['<details class="kbc-advanced-settings">', "advanced controls are not collapsed"],
  ['config.advisorOnly = advisorMode;', "Advisor authority mapping is missing"],
  ['config.autoBuySafeDecisions = !advisorMode;', "Autobuyer authority mapping is missing"],
  ['const COUNCIL_LAYOUT_STORAGE_KEY', "Council layout persistence is missing"],
  ['installWindowDragAndResize(strategyBar, COUNCIL_LAYOUT_STORAGE_KEY', "Council drag/resize is missing"],
  ['background: #263241;', "high-contrast button background is missing"],
];

const failures = required
  .filter(([token]) => !runtime.includes(token) || !userscript.includes(token))
  .map(([, message]) => message);

if (!runtime.includes("autoCastAbilities: false") || !runtime.includes("autoAscend: false")) {
  failures.push("hard safety defaults changed or are missing");
}

if (failures.length) {
  console.error(`FAIL check-ui-shell: ${failures.join("; ")}`);
  process.exit(1);
}

console.log("PASS check-ui-shell");

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const runtime = fs.readFileSync(path.join(ROOT, "dev-src/runtime-sections/runtime-main.js"), "utf8");
const userscript = fs.readFileSync(path.join(ROOT, "src/SwarmSim-Strategy-Autobuyer.user.js"), "utf8");
const stateFixtures = JSON.parse(fs.readFileSync(path.join(ROOT, "docs/ui/fixtures/council-ui-states.v1.json"), "utf8"));
const timelineFixtures = JSON.parse(fs.readFileSync(path.join(ROOT, "docs/ui/fixtures/council-timeline-events.v1.json"), "utf8"));

const required = [
  ['id="kbc-mode-advisor"', "Advisor mode control is missing"],
  ['id="kbc-mode-autobuyer"', "Autobuyer mode control is missing"],
  ['<details class="kbc-advanced-settings">', "advanced controls are not collapsed"],
  ['config.advisorOnly = advisorMode;', "Advisor authority mapping is missing"],
  ['config.autoBuySafeDecisions = !advisorMode;', "Autobuyer authority mapping is missing"],
  ['const COUNCIL_LAYOUT_STORAGE_KEY = "kbcSwarmBotCouncilPanelLayout_v2"', "fixed Council layout persistence is missing"],
  ['const COUNCIL_FIXED_WIDTH = 1180', "fixed Council width is missing"],
  ['const COUNCIL_FIXED_HEIGHT = 700', "fixed Council height is missing"],
  ['function applyCouncilWindowLayout()', "fixed Council layout application is missing"],
  ['installWindowDragAndResize(strategyBar, COUNCIL_LAYOUT_STORAGE_KEY', "Council drag/resize is missing"],
  ['resize: none;', "Council manual resize must be disabled"],
  ['background: #263241;', "high-contrast button background is missing"],
  ['function buildCouncilUiState(', "CouncilUiState adapter is missing"],
  ['schemaVersion: "council-ui-state.v1"', "CouncilUiState schema identity is missing"],
  ['data-kbc-surface="council"', "Council surface control is missing"],
  ['data-kbc-surface="matrix"', "Matrix surface control is missing"],
  ['class="kbc-council-stage"', "semantic Council stage is missing"],
  ['class="kbc-council-decision"', "central Council decision surface is missing"],
  ['class="kbc-council-lanes"', "Council lane surface is missing"],
  ['class="kbc-council-chronicle-preview"', "Chronicle preview region is missing"],
  ['aria-live="polite"', "Council decision live-region semantics are missing"],
  ['uiState.safety.nexusProtection', "global Council safety state is not rendered"],
  ['getCouncilUiState()', "CouncilUiState public read-only accessor is missing"],
  ['@media (max-width: 1100px)', "desktop Council breakpoint is missing"],
  ['@media (max-width: 700px)', "compact Council breakpoint is missing"],
  ['@media (prefers-reduced-motion: reduce)', "reduced-motion handling is missing"],
  ['const COUNCIL_ART_RESOURCES', "Council production art resource map is missing"],
  ['function councilArtStyle()', "Council production art fallback adapter is missing"],
  ['class="kbc-council-lane-art"', "Council lane artwork hook is missing"],
  ['var(--kbc-art-parchment)', "Council parchment artwork is missing"],
  ['var(--kbc-art-frame)', "Council ornate frame artwork is missing"],
  ['kbc-council-advisor-beetle-magus', "Council advisor artwork mapping is missing"],
];

const requiredMetadata = [
  '// @grant        GM_getResourceURL',
  '// @resource     kbcCouncilChamber',
  '// @resource     kbcCouncilFrame',
  '// @resource     kbcCouncilParchment',
  '// @resource     kbcCouncilLaneMeat',
  '// @resource     kbcCouncilAdvisorBroodArchitect',
];

const failures = required
  .filter(([token]) => !runtime.includes(token) || !userscript.includes(token))
  .map(([, message]) => message);

for (const token of requiredMetadata) {
  if (!userscript.includes(token)) failures.push(`userscript metadata is missing ${token}`);
}

if (!runtime.includes("autoCastAbilities: false") || !runtime.includes("autoAscend: false")) {
  failures.push("hard safety defaults changed or are missing");
}

if (stateFixtures.schemaVersion !== "council-ui-state-fixtures.v1" || stateFixtures.states.length !== 3) {
  failures.push("CouncilUiState fixtures are missing or have the wrong schema");
}

if (stateFixtures.states.some((state) => state.lanes.length !== 7)) {
  failures.push("every CouncilUiState fixture must contain seven lanes");
}

const events = timelineFixtures.events || [];
if (new Set(events.map((event) => event.eventId)).size !== events.length) {
  failures.push("Council timeline fixture event ids are not unique");
}

const completedChain = events
  .filter((event) => event.decisionId === "decision-1042")
  .map((event) => event.type)
  .join(">");
if (completedChain !== "recommendation>authority-allowed>purchase-attempted>purchase-completed") {
  failures.push("Council timeline fixture does not preserve the completed purchase chain");
}

if (failures.length) {
  console.error(`FAIL check-ui-shell: ${failures.join("; ")}`);
  process.exit(1);
}

console.log("PASS check-ui-shell");

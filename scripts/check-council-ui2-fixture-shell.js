const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const ROOT = path.resolve(__dirname, "..");
const runtime = fs.readFileSync(path.join(ROOT, "dev-src/runtime-sections/runtime-main.js"), "utf8");
const fixturePayload = JSON.parse(fs.readFileSync(path.join(ROOT, "docs/ui/fixtures/council-ui-states.v1.json"), "utf8"));

const cssMatch = runtime.match(/css\.textContent = `([\s\S]*?)`;\s*document\.body\.appendChild\(strategyBar\);/);
if (!cssMatch) {
  console.error("FAIL check-council-ui2-fixture-shell: production Council CSS block not found");
  process.exit(1);
}

const productionCss = cssMatch[1];
const states = fixturePayload.states || [];
const requiredStateIds = ["autobuyer-completed-purchase", "advisor-hold", "stale-unavailable"];
const failures = [];
const screenshotIndex = process.argv.indexOf("--screenshot");
const screenshotPath = screenshotIndex >= 0 ? process.argv[screenshotIndex + 1] : "";
const screenshotWidthIndex = process.argv.indexOf("--screenshot-width");
const screenshotWidth = screenshotWidthIndex >= 0 ? Number(process.argv[screenshotWidthIndex + 1]) : 1366;

const artFiles = {
  "--kbc-art-chamber": "council-chamber-v1.webp",
  "--kbc-art-frame": "council-ornate-frame-v1.webp",
  "--kbc-art-parchment": "council-parchment-v1.webp",
  "--kbc-art-lane-meat": "council-lane-meat-v1.webp",
  "--kbc-art-lane-engine": "council-lane-engine-v1.webp",
  "--kbc-art-lane-territory": "council-lane-territory-v1.webp",
  "--kbc-art-lane-energy": "council-lane-energy-v1.webp",
};

const artStyle = Object.entries(artFiles).map(([property, fileName]) => {
  const filePath = path.join(ROOT, "assets", "council", "runtime", fileName);
  if (!fs.existsSync(filePath)) {
    failures.push(`missing runtime art ${fileName}`);
    return "";
  }
  return `${property}:url("data:image/webp;base64,${fs.readFileSync(filePath).toString("base64")}")`;
}).filter(Boolean).join(";");

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function metricHtml(label, metric = {}) {
  return `
    <div class="kbc-council-metric" data-kbc-availability="${escapeHtml(metric.availability || "unavailable")}">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(metric.display || "—")}</strong>
    </div>
  `;
}

function summaryTile(label, value, warn = false) {
  return `
    <div class="kbc-council-summary-tile ${warn ? "kbc-council-summary-warn" : ""}">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(value || "none")}</strong>
    </div>
  `;
}

function laneHtml(lane) {
  const progress = Number.isFinite(Number(lane.progressPercent)) ? Number(lane.progressPercent) : null;
  return `
      <article class="kbc-council-lane kbc-council-lane-${escapeHtml(lane.id)}" data-kbc-decision="${escapeHtml(lane.decision)}">
      <span class="kbc-council-lane-art" aria-hidden="true"></span>
      <header>
        <div><span>${escapeHtml(lane.label)}</span><strong>${escapeHtml(lane.rate?.display || "—")}</strong></div>
        <span class="kbc-council-lane-decision">${escapeHtml(String(lane.decision || "observe").toUpperCase())}</span>
      </header>
      <p>${escapeHtml(lane.candidate || lane.nextMilestone || "No candidate emitted")}</p>
      <small>${escapeHtml(lane.reason || "No lane-specific reason this run.")}</small>
      ${progress === null
        ? `<div class="kbc-council-progress is-unavailable" aria-label="Progress unavailable"><span></span></div>`
        : `<div class="kbc-council-progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${progress}"><span style="width:${progress}%"></span></div>`}
    </article>
  `;
}

function actionText(state) {
  const selection = state.decision?.selection;
  if (selection) return `${selection.candidate}${selection.amount ? ` × ${selection.amount}` : ""}`;
  return state.strategy?.wholeEconomyWinner?.actionText || state.decision?.reason || "Decision unavailable";
}

function renderFixtureShell(state) {
  const economics = state.decision?.economics || {};
  const primaryLanes = ["meat", "engine", "territory", "energy"]
    .map((laneId) => (state.lanes || []).find((lane) => lane.id === laneId))
    .filter(Boolean);
  const authority = state.decision?.authority?.allowed ? "Authorized" : state.bot?.mode === "advisor" ? "Advisor only" : "Refused / fallback";
  const execution = state.decision?.execution?.status || "unknown";
  const blocker = state.decision?.blocker?.text || "none";
  return `
    <div class="kbc-strategy-bar">
      <div id="kbc-strategy-bar-cards">
        <div class="kbc-council-shell" style="${escapeHtml(artStyle)}" data-kbc-schema="${escapeHtml(state.schemaVersion || "council-ui-state.v1")}" data-kbc-freshness="${escapeHtml(state.source?.freshness || "unavailable")}">
          <nav class="kbc-council-surface-tabs" aria-label="Council view">
            <button type="button" data-kbc-surface="council" class="is-active" aria-pressed="true">Council Chamber</button>
            <button type="button" data-kbc-surface="matrix" aria-pressed="false">Matrix Diagnostics</button>
          </nav>
          <div class="kbc-council-hero">
            <div><span class="kbc-council-eyebrow">SwarmBot Council Chamber</span><strong>${escapeHtml(state.bot?.enabled ? "Running" : "Paused")} · ${escapeHtml(state.bot?.mode || "unknown")}</strong></div>
            <div class="kbc-council-hero-status"><span class="kbc-council-freshness">${escapeHtml(state.source?.freshness || "unavailable")}</span></div>
          </div>
          <div class="kbc-council-stage">
            <aside class="kbc-council-status-rail" aria-label="Current strategy status">
              <h2>Current status</h2>
              ${summaryTile("Phase", state.strategy?.phase?.label)}
              ${summaryTile("Strategic goal", state.strategy?.goal?.label)}
              ${summaryTile("Whole-economy winner", state.strategy?.wholeEconomyWinner?.domain)}
              ${summaryTile("Coordinator", authority, !state.decision?.authority?.allowed)}
              ${summaryTile("Execution", execution, execution !== "completed")}
              ${summaryTile("Safety", `${state.safety?.nexusProtection || "unknown"} · auto-cast ${state.safety?.autoCastAbilities ? "on" : "off"}`, !!state.safety?.autoCastAbilities)}
              ${summaryTile("Strongest blocker", blocker, blocker !== "none")}
            </aside>
            <main class="kbc-council-decision" aria-labelledby="fixture-decision-title" aria-live="polite">
              <span class="kbc-council-eyebrow">The Council has decided</span>
              <h2 id="fixture-decision-title">${escapeHtml(actionText(state))}</h2>
              <p>${escapeHtml(state.decision?.reason || "No reason available")}</p>
              <div class="kbc-council-metrics">
                ${metricHtml("Payback", economics.payback)}
                ${metricHtml("ETA", economics.eta)}
                ${metricHtml("Reserve after", economics.reserveAfter)}
                ${metricHtml("Reserve recovery", economics.reserveRecovery)}
              </div>
              <div class="kbc-council-execution-strip">
                <div><span>Authority</span><strong>${escapeHtml(authority)}</strong></div>
                <div><span>Bot is doing</span><strong>${escapeHtml(execution)}</strong></div>
                <div><span>Avoid</span><strong>${escapeHtml(blocker)}</strong></div>
              </div>
            </main>
            <aside class="kbc-council-chronicle-preview" aria-label="Recent signals">
              <header><div><span class="kbc-council-eyebrow">Recent signals</span><strong>Chronicle preview</strong></div></header>
              <p>Legacy sources · causal event links arrive in UI4.</p>
              <ol><li class="is-empty">Fixture shell intentionally has no reconstructed legacy events.</li></ol>
            </aside>
          </div>
          <section class="kbc-council-lanes" aria-label="Economic lanes">${primaryLanes.map(laneHtml).join("")}</section>
        </div>
      </div>
    </div>
  `;
}

function columnCount(value) {
  return String(value || "").trim().split(/\s+/).filter(Boolean).length;
}

async function main() {
  for (const id of requiredStateIds) {
    if (!states.some((state) => state.fixtureId === id)) failures.push(`missing state fixture ${id}`);
  }

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const cases = [
    { name: "desktop-100", width: 1366, height: 768, stageColumns: 3, laneColumns: 4 },
    { name: "desktop-125-effective", width: 1093, height: 768, stageColumns: 2, laneColumns: 2 },
    { name: "desktop-150-effective", width: 911, height: 768, stageColumns: 2, laneColumns: 2 },
    { name: "compact", width: 690, height: 900, stageColumns: 1, laneColumns: 1 },
  ];

  try {
    for (const state of states) {
      for (const testCase of cases) {
        await page.setViewportSize({ width: testCase.width, height: testCase.height });
        await page.setContent(`<!doctype html><html><head><meta charset="utf-8"><style>${productionCss}</style></head><body>${renderFixtureShell(state)}</body></html>`);
        const result = await page.evaluate(() => {
          const bar = document.querySelector(".kbc-strategy-bar");
          const shell = document.querySelector(".kbc-council-shell");
          const stage = document.querySelector(".kbc-council-stage");
          const lanes = document.querySelector(".kbc-council-lanes");
          const decision = document.querySelector(".kbc-council-decision");
          const decisionEyebrow = decision.querySelector(".kbc-council-eyebrow");
          const decisionExecution = decision.querySelector(".kbc-council-execution-strip");
          const decisionRect = decision.getBoundingClientRect();
          const eyebrowRect = decisionEyebrow.getBoundingClientRect();
          const executionRect = decisionExecution.getBoundingClientRect();
          return {
            hasMain: !!document.querySelector("main.kbc-council-decision"),
            asideCount: document.querySelectorAll(".kbc-council-stage > aside").length,
            laneCount: document.querySelectorAll(".kbc-council-lane").length,
            metricCount: document.querySelectorAll(".kbc-council-metric").length,
            surfaceButtonCount: document.querySelectorAll("[data-kbc-surface]").length,
            stageColumns: getComputedStyle(stage).gridTemplateColumns,
            laneColumns: getComputedStyle(lanes).gridTemplateColumns,
            shellOverflowX: shell.scrollWidth > shell.clientWidth + 2,
            barBeyondViewport: bar.getBoundingClientRect().right > document.documentElement.clientWidth + 2,
            barWidth: Math.round(bar.getBoundingClientRect().width),
            barHeight: Math.round(bar.getBoundingClientRect().height),
            barResize: getComputedStyle(bar).resize,
            decisionContentTopInset: Math.round(eyebrowRect.top - decisionRect.top),
            decisionContentBottomInset: Math.round(decisionRect.bottom - executionRect.bottom),
            frameArt: getComputedStyle(shell, "::after").backgroundImage,
            parchmentArt: getComputedStyle(document.querySelector(".kbc-council-decision")).backgroundImage,
            laneArt: getComputedStyle(document.querySelector(".kbc-council-lane-art")).backgroundImage,
          };
        });
        const prefix = `${state.fixtureId}/${testCase.name}`;
        if (!result.hasMain) failures.push(`${prefix}: central decision main missing`);
        if (result.asideCount !== 2) failures.push(`${prefix}: expected two supporting asides, got ${result.asideCount}`);
        if (result.laneCount !== 4) failures.push(`${prefix}: expected four primary lanes, got ${result.laneCount}`);
        if (result.metricCount !== 4) failures.push(`${prefix}: expected four decision metrics, got ${result.metricCount}`);
        if (result.surfaceButtonCount !== 2) failures.push(`${prefix}: Council/Matrix controls missing`);
        if (columnCount(result.stageColumns) !== testCase.stageColumns) failures.push(`${prefix}: expected ${testCase.stageColumns} stage columns, got ${result.stageColumns}`);
        if (columnCount(result.laneColumns) !== testCase.laneColumns) failures.push(`${prefix}: expected ${testCase.laneColumns} lane columns, got ${result.laneColumns}`);
        if (result.shellOverflowX) failures.push(`${prefix}: Council shell overflows horizontally`);
        if (result.barBeyondViewport) failures.push(`${prefix}: Council bar extends beyond viewport`);
        const expectedBarWidth = Math.min(1180, testCase.width - 24);
        const expectedBarHeight = Math.min(700, testCase.height - 24);
        if (Math.abs(result.barWidth - expectedBarWidth) > 2) failures.push(`${prefix}: expected fixed bar width ${expectedBarWidth}, got ${result.barWidth}`);
        if (Math.abs(result.barHeight - expectedBarHeight) > 2) failures.push(`${prefix}: expected fixed bar height ${expectedBarHeight}, got ${result.barHeight}`);
        if (result.barResize !== "none") failures.push(`${prefix}: manual Council resize remains enabled`);
        if (testCase.width <= 700 && result.decisionContentTopInset < 34) failures.push(`${prefix}: parchment decision text enters the top ornament (${result.decisionContentTopInset}px inset)`);
        if (testCase.width <= 700 && result.decisionContentBottomInset < 28) failures.push(`${prefix}: parchment decision text enters the bottom ornament (${result.decisionContentBottomInset}px inset)`);
        if (testCase.width > 1100 && !result.frameArt.includes("image/webp")) failures.push(`${prefix}: ornate frame art did not resolve`);
        if (testCase.width <= 1100 && result.frameArt.includes("image/webp")) failures.push(`${prefix}: responsive frame fallback did not activate`);
        if (!result.parchmentArt.includes("image/webp")) failures.push(`${prefix}: parchment art did not resolve`);
        if (!result.laneArt.includes("image/webp")) failures.push(`${prefix}: lane art did not resolve`);
      }
    }
    if (screenshotPath && states[0]) {
      await page.setViewportSize({ width: Number.isFinite(screenshotWidth) ? screenshotWidth : 1366, height: 1200 });
      await page.setContent(`<!doctype html><html><head><meta charset="utf-8"><style>${productionCss}</style></head><body>${renderFixtureShell(states[0])}</body></html>`);
      await page.locator(".kbc-council-shell").screenshot({ path: path.resolve(screenshotPath) });
    }
  } finally {
    await browser.close();
  }

  if (failures.length) {
    console.error(`FAIL check-council-ui2-fixture-shell:\n- ${failures.join("\n- ")}`);
    process.exit(1);
  }

  console.log(`PASS check-council-ui2-fixture-shell (${states.length} states × ${cases.length} viewport/zoom cases)`);
}

main().catch((error) => {
  console.error(`FAIL check-council-ui2-fixture-shell: ${error.stack || error.message || error}`);
  process.exit(1);
});

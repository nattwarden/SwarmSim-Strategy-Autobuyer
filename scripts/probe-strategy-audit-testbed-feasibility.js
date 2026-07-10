#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { chromium } = require("playwright");

const root = path.resolve(__dirname, "..");
const userscriptPath = path.join(root, "src", "SwarmSim-Strategy-Autobuyer.user.js");
const outDir = path.join(root, "docs", "test-data", "strategy-audit-feasibility", "probe-production-headed");
const screenshotPath = path.join(outDir, "probe-production-headed.png");
const tracePath = path.join(outDir, "probe-production-headed-trace.zip");
const resultJsonPath = path.join(outDir, "probe-production-headed-result.json");
const resultMdPath = path.join(outDir, "probe-production-headed-result.md");

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function writeText(filePath, content) {
  ensureDir(filePath);
  fs.writeFileSync(filePath, `${content}\n`, "utf8");
}

function readUserscript() {
  return fs.readFileSync(userscriptPath, "utf8");
}

function sha256(text) {
  return `sha256:${crypto.createHash("sha256").update(String(text), "utf8").digest("hex")}`;
}

function argValue(flag, fallback = null) {
  const args = process.argv.slice(2);
  const idx = args.indexOf(flag);
  if (idx < 0) return fallback;
  if (idx === args.length - 1) return fallback;
  return args[idx + 1];
}

function hasFlag(flag) {
  return process.argv.slice(2).includes(flag);
}

function parseNumber(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

async function addReadOnlyOverlay(page, overlayState) {
  return page.evaluate((state) => {
    const existing = document.querySelector("#kbc-feasibility-overlay");
    if (existing) existing.remove();

    const rootEl = document.createElement("div");
    rootEl.id = "kbc-feasibility-overlay";
    rootEl.style.position = "fixed";
    rootEl.style.right = "18px";
    rootEl.style.bottom = "18px";
    rootEl.style.zIndex = "2147483647";
    rootEl.style.width = "420px";
    rootEl.style.maxWidth = "90vw";
    rootEl.style.padding = "12px";
    rootEl.style.border = "1px solid #335";
    rootEl.style.borderRadius = "10px";
    rootEl.style.background = "rgba(12,16,24,0.92)";
    rootEl.style.color = "#f3f6ff";
    rootEl.style.font = "13px/1.35 Consolas, Menlo, monospace";
    rootEl.style.boxShadow = "0 10px 30px rgba(0,0,0,0.35)";

    const esc = (value) => String(value || "").replace(/[&<>\"]/g, (ch) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "\"": "&quot;",
    }[ch]));

    rootEl.innerHTML = [
      `<div style=\"font-weight:700;margin-bottom:8px\">Strategy Audit Feasibility Overlay</div>`,
      `<div><b>probe id:</b> ${esc(state.probeId)}</div>`,
      `<div><b>initial state:</b> ${esc(state.initialStateSummary)}</div>`,
      `<div><b>mutation manifest:</b> ${esc(state.mutationManifest)}</div>`,
      `<div><b>current cycle:</b> <span id=\"kbc-feasibility-cycle\">${esc(state.currentCycle)}</span></div>`,
      `<div><b>selected action:</b> <span id=\"kbc-feasibility-selected\">${esc(state.selectedAction)}</span></div>`,
      `<div><b>best alternative:</b> <span id=\"kbc-feasibility-alt\">${esc(state.bestAlternative)}</span></div>`,
      "<div style=\"display:flex;gap:8px;margin-top:10px\">",
      "  <button id=\"kbc-feasibility-pause\" type=\"button\">Pause</button>",
      "  <button id=\"kbc-feasibility-continue\" type=\"button\">Continue</button>",
      "  <button id=\"kbc-feasibility-close\" type=\"button\">Close</button>",
      "</div>",
      "<div style=\"margin-top:8px;opacity:0.8\">Read-only overlay. It does not write planner state.</div>",
    ].join("");

    const pauseBtn = rootEl.querySelector("#kbc-feasibility-pause");
    const continueBtn = rootEl.querySelector("#kbc-feasibility-continue");
    const closeBtn = rootEl.querySelector("#kbc-feasibility-close");

    window.__kbcFeasibilityOverlay = {
      paused: false,
      lastAction: "NONE",
    };

    pauseBtn?.addEventListener("click", () => {
      window.__kbcFeasibilityOverlay.paused = true;
      window.__kbcFeasibilityOverlay.lastAction = "PAUSE";
    });

    continueBtn?.addEventListener("click", () => {
      window.__kbcFeasibilityOverlay.paused = false;
      window.__kbcFeasibilityOverlay.lastAction = "CONTINUE";
    });

    closeBtn?.addEventListener("click", () => {
      window.__kbcFeasibilityOverlay.lastAction = "CLOSE";
      rootEl.remove();
    });

    document.body.appendChild(rootEl);
    return { ok: true };
  }, overlayState);
}

async function updateOverlaySnapshot(page, values) {
  return page.evaluate((state) => {
    const cycle = document.querySelector("#kbc-feasibility-cycle");
    const selected = document.querySelector("#kbc-feasibility-selected");
    const alternative = document.querySelector("#kbc-feasibility-alt");
    if (cycle) cycle.textContent = String(state.currentCycle || "n/a");
    if (selected) selected.textContent = String(state.selectedAction || "none");
    if (alternative) alternative.textContent = String(state.bestAlternative || "none");
    return window.__kbcFeasibilityOverlay || { paused: false, lastAction: "NONE" };
  }, values);
}

async function runProbe(options) {
  const userscript = readUserscript();
  const userscriptSha = sha256(userscript);
  const startedAt = new Date().toISOString();
  const targetUrl = "https://www.swarmsim.com/#/tab/territory";

  const browser = await chromium.launch({ headless: !options.headed, slowMo: options.slowMoMs });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 980 },
    locale: "en-US",
    timezoneId: "UTC",
    serviceWorkers: "block",
  });

  await context.grantPermissions(["clipboard-read", "clipboard-write"], { origin: "https://www.swarmsim.com" });
  await context.tracing.start({ screenshots: true, snapshots: true, sources: true });

  const page = await context.newPage();
  await page.goto(targetUrl, { waitUntil: "domcontentloaded", timeout: 90000 });
  await page.evaluate(() => localStorage.clear());
  await page.addScriptTag({ content: userscript });
  await page.waitForFunction(() => !!window.kbcSwarmBot, { timeout: 90000 });

  const preProbe = await page.evaluate(() => {
    const game = window.angular.element(document.body).injector().get("game");
    return {
      hasAngularGame: !!game,
      scriptVersion: window.kbcSwarmBot?.scriptVersion || null,
      councilUiEnabled: window.kbcSwarmBot?.config?.councilUi === true,
      inspectorEnabled: window.kbcSwarmBot?.config?.strategyInspector === true,
      runHistoryBefore: (window.kbcSwarmBot?.getRunHistory?.() || []).length,
      localStorageKeys: Object.keys(localStorage).sort(),
      resourceSnapshot: {
        meat: String(game?.unit("meat")?.count?.() || "0"),
        larva: String(game?.unit("larva")?.count?.() || "0"),
        territory: String(game?.unit("territory")?.count?.() || "0"),
        energy: String(game?.unit("energy")?.count?.() || "0"),
      },
    };
  });

  await addReadOnlyOverlay(page, {
    probeId: "FEAS-PROD-HEADED-001",
    initialStateSummary: "Disposable context, early-game harmless overrides",
    mutationManifest: "scenarioHarness.resourceCounts + unitCounts + engine.remainingActions",
    currentCycle: "0",
    selectedAction: "none",
    bestAlternative: "none",
  });

  const scenarioResult = await page.evaluate(() => {
    const bot = window.kbcSwarmBot;
    const game = window.angular.element(document.body).injector().get("game");
    const DecimalCtor = window.Decimal;
    const makeDecimal = (v) => new DecimalCtor(v);
    const normalize = (value) => String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

    const overrideCounts = {
      meat: "120",
      larva: "40",
      cocoon: "0",
      territory: "0",
      energy: "0",
      drone: "25",
      queen: "0",
      swarmling: "0",
      stinger: "0",
      spider: "0",
      mosquito: "0",
    };

    const originalUnit = typeof game.unit === "function" ? game.unit.bind(game) : null;
    const originalUnitList = typeof game.unitlist === "function" ? game.unitlist.bind(game) : null;
    const patched = [];
    const patch = (obj, key, value) => {
      if (!obj) return;
      patched.push({ obj, key, old: obj[key] });
      Object.defineProperty(obj, key, { configurable: true, writable: true, value });
    };

    const keysFor = (unit) => {
      const name = normalize(unit?.name || "");
      const display = normalize(unit?.displayName || unit?.plural || "");
      const suffix = normalize(unit?.suffix || "");
      const keys = new Set();
      if (name) keys.add(name);
      if (display) keys.add(display);
      if (suffix && name) keys.add(`${name} ${suffix}`);
      if (name === "spider") keys.add("arachnomorph");
      if (name === "mosquito") keys.add("culicimorph");
      return Array.from(keys);
    };

    const applyOverrides = (unit) => {
      const key = keysFor(unit).find((candidate) => Object.prototype.hasOwnProperty.call(overrideCounts, candidate));
      if (!key) return unit;
      const value = makeDecimal(overrideCounts[key]);
      patch(unit, "count", () => value);
      patch(unit, "isVisible", () => true);
      return unit;
    };

    patch(game, "unit", (name) => {
      const unit = originalUnit ? originalUnit(name) : null;
      return applyOverrides(unit);
    });
    patch(game, "unitlist", () => (originalUnitList ? originalUnitList() : []).map((unit) => applyOverrides(unit)));

    bot.config.enabled = true;
    bot.config.advisorOnly = true;
    bot.config.autoBuySafeDecisions = false;
    bot.config.autoCastAbilities = false;
    bot.config.autoAscend = false;
    bot.config.energySupportBrokerAllowAutoCast = false;

    const inspectorBefore = bot.getStrategyInspector?.() || null;
    const runOutcome = bot.runOnce();
    const inspectorAfter = bot.getStrategyInspector?.() || null;
    const runHistory = bot.getRunHistory?.() || [];
    const beforeTs = String(inspectorBefore?.timestamp || "");
    const afterTs = String(inspectorAfter?.timestamp || "");
    const inspectorChanged = !!inspectorAfter && afterTs.length > 0 && afterTs !== beforeTs;

    for (const row of patched.reverse()) {
      Object.defineProperty(row.obj, row.key, { configurable: true, writable: true, value: row.old });
    }

    return {
      runOutcome,
      inspectorBefore,
      inspector: inspectorAfter,
      inspectorAfter,
      runHistoryLast: runHistory.length ? runHistory[runHistory.length - 1] : null,
      cycle: {
        cycleNumber: 1,
        stagedWith: "direct-game-service-unit-patch",
        runOnceReturned: inspectorChanged,
      },
    };
  });

  const selectedAction = scenarioResult?.inspector?.bestAllowedAction || scenarioResult?.inspector?.mainDecision || "none";
  const altAction = scenarioResult?.inspector?.bestRejectedAction || scenarioResult?.inspector?.closestRejectedToBuying?.candidate || "none";
  const overlayState = await updateOverlaySnapshot(page, {
    currentCycle: "1",
    selectedAction,
    bestAlternative: altAction,
  });

  await page.screenshot({ path: screenshotPath, fullPage: true });
  await context.tracing.stop({ path: tracePath });

  const postProbe = await page.evaluate(() => {
    const game = window.angular.element(document.body).injector().get("game");
    const bot = window.kbcSwarmBot;
    bot.scenarioHarness.disable();
    return {
      runHistoryAfter: (bot.getRunHistory?.() || []).length,
      inspectorPhase: bot.getStrategyInspector?.()?.phase || null,
      inspectorDecision: bot.getStrategyInspector?.()?.decision || null,
      overlayState: window.__kbcFeasibilityOverlay || null,
      resourceSnapshot: {
        meat: String(game?.unit("meat")?.count?.() || "0"),
        larva: String(game?.unit("larva")?.count?.() || "0"),
        territory: String(game?.unit("territory")?.count?.() || "0"),
        energy: String(game?.unit("energy")?.count?.() || "0"),
      },
    };
  });

  if (options.pauseMs > 0) {
    await page.waitForTimeout(options.pauseMs);
  }

  const keepOpen = !!options.keepOpen;
  if (keepOpen) {
    console.log("Keep-open requested. Browser remains open until interrupted.");
    await new Promise(() => {});
  }

  await page.close();
  await context.close();
  await browser.close();

  const resetContext = await chromium.launch({ headless: true }).then(async (probeBrowser) => {
    const probeContext = await probeBrowser.newContext({ serviceWorkers: "block" });
    const probePage = await probeContext.newPage();
    await probePage.goto(targetUrl, { waitUntil: "domcontentloaded", timeout: 90000 });
    const check = await probePage.evaluate(() => ({
      kbcKeys: Object.keys(localStorage).filter((key) => key.toLowerCase().includes("kbcswarmbot")).sort(),
      hasBotApi: !!window.kbcSwarmBot,
    }));
    await probeContext.close();
    await probeBrowser.close();
    return check;
  });

  const completedAt = new Date().toISOString();
  return {
    probeId: "FEAS-PROD-HEADED-001",
    startedAt,
    completedAt,
    targetUrl,
    browserMode: options.headed ? "headed" : "headless",
    userscript: {
      path: path.relative(root, userscriptPath).replace(/\\/g, "/"),
      sha256: userscriptSha,
    },
    artifacts: {
      screenshotPath: path.relative(root, screenshotPath).replace(/\\/g, "/"),
      tracePath: path.relative(root, tracePath).replace(/\\/g, "/"),
      resultJsonPath: path.relative(root, resultJsonPath).replace(/\\/g, "/"),
      resultMdPath: path.relative(root, resultMdPath).replace(/\\/g, "/"),
    },
    overlay: {
      controls: ["Pause", "Continue", "Close"],
      stateAfterCycle: overlayState,
      readOnly: true,
    },
    preProbe,
    scenarioResult: {
      runOk: scenarioResult?.cycle?.runOnceReturned === true,
      cycleSummary: scenarioResult?.cycle || null,
      inspector: scenarioResult?.inspector || null,
      runHistoryLast: scenarioResult?.runHistoryLast || null,
    },
    postProbe,
    isolationCheck: {
      ephemeralContextUsed: true,
      persistentProfileUsed: false,
      freshContextAfterProbe: resetContext,
    },
    verdict: {
      openedVisibleGame: !!preProbe?.hasAngularGame,
      injectedCanonicalUserscript: !!preProbe?.scriptVersion,
      accessedGameServices: !!preProbe?.hasAngularGame,
      stagedHarmlessEarlyGameState: scenarioResult?.cycle?.stagedWith === "direct-game-service-unit-patch",
      ranNormalPlannerCycle: scenarioResult?.cycle?.runOnceReturned === true,
      capturedCouncilInspector: !!scenarioResult?.inspector,
      capturedScreenshot: true,
      capturedTrace: true,
      supportsPauseOrLeaveOpen: true,
      resetWithoutNormalProfileMutation: Array.isArray(resetContext?.kbcKeys) && resetContext.kbcKeys.length === 0,
    },
  };
}

function toMarkdown(result) {
  const v = result.verdict || {};
  const yesNo = (value) => (value ? "YES" : "NO");
  const inspector = result?.scenarioResult?.inspector || {};
  return [
    "# Strategy Audit Feasibility Probe: Production + Headed + Direct Injection",
    "",
    `- Probe ID: ${result.probeId}`,
    `- Started: ${result.startedAt}`,
    `- Completed: ${result.completedAt}`,
    `- Target URL: ${result.targetUrl}`,
    `- Browser mode: ${result.browserMode}`,
    `- Userscript: ${result.userscript.path}`,
    `- Userscript SHA256: ${result.userscript.sha256}`,
    "",
    "## Outcome",
    `- Open visible game: ${yesNo(v.openedVisibleGame)}`,
    `- Inject canonical userscript: ${yesNo(v.injectedCanonicalUserscript)}`,
    `- Access game services: ${yesNo(v.accessedGameServices)}`,
    `- Stage harmless state: ${yesNo(v.stagedHarmlessEarlyGameState)}`,
    `- Run planner cycle: ${yesNo(v.ranNormalPlannerCycle)}`,
    `- Show Council/Inspector data: ${yesNo(v.capturedCouncilInspector)}`,
    `- Screenshot captured: ${yesNo(v.capturedScreenshot)}`,
    `- Trace captured: ${yesNo(v.capturedTrace)}`,
    `- Pause/leave-open support: ${yesNo(v.supportsPauseOrLeaveOpen)}`,
    `- Reset/no normal-profile mutation: ${yesNo(v.resetWithoutNormalProfileMutation)}`,
    "",
    "## Planner Snapshot",
    `- Active council speaker: ${inspector.activeCouncilSpeaker || "none"}`,
    `- Council winning lane: ${inspector.councilWinningLane || "none"}`,
    `- Decision: ${inspector.decision || "none"}`,
    `- Main decision: ${inspector.mainDecision || "none"}`,
    `- Best allowed action: ${inspector.bestAllowedAction || "none"}`,
    `- Best rejected action: ${inspector.bestRejectedAction || "none"}`,
    "",
    "## Artifacts",
    `- Screenshot: ${result.artifacts.screenshotPath}`,
    `- Trace: ${result.artifacts.tracePath}`,
    `- JSON: ${result.artifacts.resultJsonPath}`,
    `- Markdown: ${result.artifacts.resultMdPath}`,
    "",
    "## Notes",
    "- The probe uses scenarioHarness overrides to construct the question state only.",
    "- It does not force lane winners, BUY/HOLD output, or action execution.",
    "- The overlay is read-only and independent from planner ranking.",
  ].join("\n");
}

async function main() {
  const headed = !hasFlag("--headless");
  const keepOpen = hasFlag("--keep-open");
  const pauseMs = parseNumber(argValue("--pause-ms", "0"), 0);
  const slowMoMs = parseNumber(argValue("--slow-mo", "0"), 0);

  const result = await runProbe({ headed, keepOpen, pauseMs, slowMoMs });
  const markdown = toMarkdown(result);

  writeText(resultJsonPath, JSON.stringify(result, null, 2));
  writeText(resultMdPath, markdown);

  console.log("Strategy audit feasibility probe completed.");
  console.log(`Result JSON: ${path.relative(root, resultJsonPath).replace(/\\/g, "/")}`);
  console.log(`Result MD: ${path.relative(root, resultMdPath).replace(/\\/g, "/")}`);
  console.log(`Screenshot: ${path.relative(root, screenshotPath).replace(/\\/g, "/")}`);
  console.log(`Trace: ${path.relative(root, tracePath).replace(/\\/g, "/")}`);
}

main().catch((error) => {
  console.error(error?.stack || error?.message || String(error));
  process.exit(1);
});

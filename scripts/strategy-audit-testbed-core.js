#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { EventEmitter } = require("events");
const { chromium } = require("playwright");

const ROOT = path.resolve(__dirname, "..");
const USERSCRIPT_PATH = path.join(ROOT, "src", "SwarmSim-Strategy-Autobuyer.user.js");
const BASE_URL = "https://www.swarmsim.com/#/tab/territory";
const ARTIFACT_ROOT = path.join(ROOT, "docs", "test-data", "strategy-audit-testbed");

const CANARY_STATE = {
  id: "TESTBED-CANARY-001",
  title: "Testbed contract canary",
  description: "Disposable early-game state that validates runner plumbing without encoding a strategy answer.",
  cycles: 2,
  unitCounts: {
    meat: "180",
    larva: "22",
    cocoon: "0",
    territory: "0",
    energy: "0",
    drone: "36",
    queen: "2",
    swarmling: "0",
    stinger: "0",
    spider: "0",
    mosquito: "0"
  },
  passiveRates: {
    meat: "0.12",
    larva: "0.02"
  },
  notes: [
    "No planner output is injected.",
    "Normal runOnce() decides lane/action.",
    "State transition must emerge from planner snapshots between cycles."
  ]
};

const REQUIRED_SCHEMA_FIELDS = [
  "auditId", "stateId", "stateRevision", "scriptVersion", "repositoryCommit", "scenarioHash", "initialStateHash", "cycleNumber", "capturedAt",
  "gameSourceKind", "gameSourceUrl", "gameSourceCommit", "gameBuildVersion", "browserKind", "browserVersion", "browserMode", "userscriptPath", "userscriptBlobSha", "userscriptContentSha256", "injectionMode", "profileKind", "networkMode",
  "stateSetupMethod", "stateMutationManifest", "stateMutationManifestHash", "preResetStateHash", "initialStateHash", "postScenarioStateHash", "resetMethod", "resetVerified", "stateLeakageDetected",
  "activePhase", "activeGoal", "activeTarget", "selectedLane", "selectedDecision", "selectedAction", "selectedUnit", "selectedAmount", "selectedReason", "hardBlockers", "softBlockers", "actionBudget",
  "legalAlternatives", "rejectedAlternatives", "bestLegalAlternative", "bestRejectedAlternative", "rejectionReasons", "laneProposals",
  "goalMetricName", "goalMetricBefore", "goalMetricAfter", "goalMetricDelta", "resourceBankBefore", "resourceBankAfter", "productionBefore", "productionAfter", "targetEtaBefore", "targetEtaAfter", "meaningfulProgress",
  "councilMatchesPlanner", "inspectorMatchesPlanner", "exportMatchesPlanner", "selectedActionActuallyExecuted", "stateTransitionMatchesReport",
  "headed", "screenshotPaths", "videoPath", "tracePath", "browserLeftOpenOnFailure"
];

function ensureDirFor(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function writeJson(filePath, value) {
  ensureDirFor(filePath);
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function writeText(filePath, text) {
  ensureDirFor(filePath);
  fs.writeFileSync(filePath, `${text}\n`, "utf8");
}

function toRel(filePath) {
  return path.relative(ROOT, filePath).replace(/\\/g, "/");
}

function sha256String(text) {
  return `sha256:${crypto.createHash("sha256").update(String(text), "utf8").digest("hex")}`;
}

function sha256Object(value) {
  return sha256String(stableStringify(value));
}

function stableSort(value) {
  if (Array.isArray(value)) return value.map(stableSort);
  if (!value || typeof value !== "object") return value;
  const out = {};
  for (const key of Object.keys(value).sort()) {
    out[key] = stableSort(value[key]);
  }
  return out;
}

function stableStringify(value) {
  return JSON.stringify(stableSort(value));
}

function nowIso() {
  return new Date().toISOString();
}

function argMap(argv) {
  const map = new Map();
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith("--")) continue;
    const next = argv[i + 1];
    if (!next || next.startsWith("--")) {
      map.set(token, "true");
      continue;
    }
    map.set(token, next);
    i += 1;
  }
  return map;
}

function parseBool(value, fallback = false) {
  if (value == null) return fallback;
  const normalized = String(value).trim().toLowerCase();
  if (["1", "true", "yes", "y", "on"].includes(normalized)) return true;
  if (["0", "false", "no", "n", "off"].includes(normalized)) return false;
  return fallback;
}

function parseNumber(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function utcSlug(iso) {
  return String(iso)
    .replace(/[:]/g, "")
    .replace(/[.]/g, "-")
    .replace(/Z$/, "Z")
    .replace(/[^0-9TZ-]/g, "");
}

class ControlBridge {
  constructor({ mode, autoControlTest, abortViaStop }) {
    this.mode = mode;
    this.paused = mode === "watch";
    this.stopRequested = false;
    this.nextRequested = false;
    this.events = [];
    this.emitter = new EventEmitter();
    this.autoControlTest = !!autoControlTest;
    this.abortViaStop = !!abortViaStop;
    this.cycleStartedAt = [];
    this.cycleCompleted = 0;
    this.startTs = Date.now();
    this.controlTest = {
      attempted: mode === "watch",
      pauseBlockedMs: null,
      nextRanExactlyOneCycleThenPaused: false,
      continueResumedAutomaticCycles: false,
      stopTriggeredPartialWrite: false,
      events: []
    };
  }

  onAction(action) {
    const name = String(action || "").trim().toUpperCase();
    if (!["PAUSE", "NEXT", "CONTINUE", "STOP"].includes(name)) {
      return { ok: false, reason: "unknown-action" };
    }
    if (name === "PAUSE") {
      this.paused = true;
      this.nextRequested = false;
    }
    if (name === "NEXT") {
      this.paused = true;
      this.nextRequested = true;
    }
    if (name === "CONTINUE") {
      this.paused = false;
      this.nextRequested = false;
    }
    if (name === "STOP") {
      this.stopRequested = true;
      this.nextRequested = false;
      this.paused = true;
    }
    const event = { action: name, at: nowIso(), elapsedMs: Date.now() - this.startTs };
    this.events.push(event);
    this.controlTest.events.push(event);
    this.emitter.emit("change");
    return { ok: true, state: this.snapshot() };
  }

  async waitForPermit(cycleNumber) {
    if (this.mode !== "watch") return { allow: true, reason: "non-watch-mode" };
    if (this.stopRequested) return { allow: false, reason: "stop-requested" };

    while (this.paused && !this.nextRequested && !this.stopRequested) {
      await new Promise((resolve) => {
        const done = () => {
          this.emitter.off("change", done);
          resolve();
        };
        this.emitter.on("change", done);
      });
    }

    if (this.stopRequested) return { allow: false, reason: "stop-requested" };

    this.cycleStartedAt.push({ cycleNumber, at: nowIso(), elapsedMs: Date.now() - this.startTs });
    if (cycleNumber === 1) {
      this.controlTest.pauseBlockedMs = Date.now() - this.startTs;
    }

    if (this.nextRequested) {
      this.nextRequested = false;
      this.paused = true;
      return { allow: true, reason: "single-step-next" };
    }
    return { allow: true, reason: "continue" };
  }

  completeCycle(cycleNumber) {
    this.cycleCompleted = cycleNumber;
    if (cycleNumber === 1 && this.paused === true) {
      this.controlTest.nextRanExactlyOneCycleThenPaused = true;
    }
    if (cycleNumber >= 2 && this.paused === false) {
      this.controlTest.continueResumedAutomaticCycles = true;
    }
  }

  markStopPartial() {
    this.controlTest.stopTriggeredPartialWrite = true;
  }

  snapshot() {
    return {
      mode: this.mode,
      paused: this.paused,
      stopRequested: this.stopRequested,
      nextRequested: this.nextRequested,
      cycleCompleted: this.cycleCompleted,
      events: this.events.slice()
    };
  }
}

async function installWatchOverlay(page, initial, controlBridge) {
  await page.exposeBinding("__kbcAuditControlBridge", async (_source, payload) => controlBridge.onAction(payload));
  await page.evaluate((state) => {
    const old = document.querySelector("#kbc-strategy-audit-overlay");
    if (old) old.remove();

    const esc = (value) => String(value == null ? "" : value).replace(/[&<>\"]/g, (ch) => {
      if (ch === "&") return "&amp;";
      if (ch === "<") return "&lt;";
      if (ch === ">") return "&gt;";
      return "&quot;";
    });

    const root = document.createElement("div");
    root.id = "kbc-strategy-audit-overlay";
    root.style.position = "fixed";
    root.style.right = "16px";
    root.style.bottom = "16px";
    root.style.zIndex = "2147483647";
    root.style.width = "480px";
    root.style.maxWidth = "92vw";
    root.style.maxHeight = "85vh";
    root.style.overflow = "auto";
    root.style.padding = "12px";
    root.style.border = "1px solid #2b3a5c";
    root.style.borderRadius = "10px";
    root.style.background = "rgba(9, 13, 22, 0.96)";
    root.style.color = "#eef4ff";
    root.style.font = "12px/1.35 Consolas, Menlo, monospace";
    root.style.boxShadow = "0 12px 34px rgba(0,0,0,0.40)";

    root.innerHTML = [
      `<div style=\"font-weight:700;margin-bottom:8px\">Strategy Audit Watch Overlay</div>`,
      `<div><b>scenario:</b> <span data-kbc=\"scenario\">${esc(state.scenarioLabel)}</span></div>`,
      `<div><b>userscript SHA:</b> <span data-kbc=\"userscript\">${esc(state.userscriptSha)}</span></div>`,
      `<div><b>cycle:</b> <span data-kbc=\"cycle\">${esc(state.cycle)}</span></div>`,
      `<div><b>initial summary:</b> <span data-kbc=\"initial\">${esc(state.initialSummary)}</span></div>`,
      `<div><b>manifest:</b> <span data-kbc=\"manifest\">${esc(state.manifestSummary)}</span></div>`,
      `<div><b>active goal:</b> <span data-kbc=\"goal\">${esc(state.activeGoal)}</span></div>`,
      `<div><b>selected lane:</b> <span data-kbc=\"lane\">${esc(state.selectedLane)}</span></div>`,
      `<div><b>selected action:</b> <span data-kbc=\"action\">${esc(state.selectedAction)}</span></div>`,
      `<div><b>best legal alt:</b> <span data-kbc=\"bestLegal\">${esc(state.bestLegalAlternative)}</span></div>`,
      `<div><b>best rejected alt:</b> <span data-kbc=\"bestRejected\">${esc(state.bestRejectedAlternative)}</span></div>`,
      `<div><b>hard blockers:</b> <span data-kbc=\"hardBlockers\">${esc(state.hardBlockers)}</span></div>`,
      `<div><b>goal metric before:</b> <span data-kbc=\"goalBefore\">${esc(state.goalMetricBefore)}</span></div>`,
      `<div><b>goal metric after:</b> <span data-kbc=\"goalAfter\">${esc(state.goalMetricAfter)}</span></div>`,
      `<div><b>reset/leakage:</b> <span data-kbc=\"resetLeak\">${esc(state.resetLeakageStatus)}</span></div>`,
      `<div><b>error:</b> <span data-kbc=\"error\">none</span></div>`,
      "<div style=\"display:flex;gap:8px;margin-top:10px;flex-wrap:wrap\">",
      "  <button type=\"button\" data-kbc-btn=\"pause\">Pause</button>",
      "  <button type=\"button\" data-kbc-btn=\"next\">Next</button>",
      "  <button type=\"button\" data-kbc-btn=\"continue\">Continue</button>",
      "  <button type=\"button\" data-kbc-btn=\"stop\">Stop</button>",
      "</div>",
      "<div style=\"margin-top:8px;opacity:0.83\">Read-only overlay; controls only gate cycle progression.</div>"
    ].join("");

    const emitAction = async (action) => {
      try {
        await window.__kbcAuditControlBridge(action);
      } catch {
        // no-op
      }
    };

    root.querySelector('[data-kbc-btn="pause"]').addEventListener("click", () => emitAction("PAUSE"));
    root.querySelector('[data-kbc-btn="next"]').addEventListener("click", () => emitAction("NEXT"));
    root.querySelector('[data-kbc-btn="continue"]').addEventListener("click", () => emitAction("CONTINUE"));
    root.querySelector('[data-kbc-btn="stop"]').addEventListener("click", () => emitAction("STOP"));

    document.body.appendChild(root);
  }, initial);
}

async function updateWatchOverlay(page, update) {
  return page.evaluate((state) => {
    const root = document.querySelector("#kbc-strategy-audit-overlay");
    if (!root) return { ok: false, reason: "overlay-missing" };
    const set = (name, value) => {
      const node = root.querySelector(`[data-kbc=\"${name}\"]`);
      if (node) node.textContent = String(value == null ? "" : value);
    };
    set("cycle", state.cycle);
    set("goal", state.activeGoal);
    set("lane", state.selectedLane);
    set("action", state.selectedAction);
    set("bestLegal", state.bestLegalAlternative);
    set("bestRejected", state.bestRejectedAlternative);
    set("hardBlockers", state.hardBlockers);
    set("goalBefore", state.goalMetricBefore);
    set("goalAfter", state.goalMetricAfter);
    set("resetLeak", state.resetLeakageStatus);
    set("error", state.error || "none");
    return { ok: true };
  }, update);
}

function nullReasonMap() {
  return {};
}

function setMaybe(resultObj, reasonMap, field, value, reasonIfNull) {
  if (value == null || value === "") {
    resultObj[field] = null;
    reasonMap[field] = reasonIfNull || "not-available-in-canary";
    return;
  }
  resultObj[field] = value;
}

function flattenAlternatives(entries) {
  if (!Array.isArray(entries)) return [];
  return entries.map((row) => ({
    lane: row?.name || row?.candidate?.lane || null,
    decision: row?.decision || row?.candidate?.decision || null,
    candidate: row?.title || row?.candidate?.candidate || null,
    reason: row?.reason || row?.candidate?.reason || null,
    blockers: Array.isArray(row?.candidate?.blockers) ? row.candidate.blockers : [],
    blockerCategories: Array.isArray(row?.candidate?.blockerCategories) ? row.candidate.blockerCategories : [],
    score: row?.candidate?.score ?? null
  }));
}

async function browserProvenance(browser) {
  const version = await browser.version();
  return {
    browserKind: "chromium",
    browserVersion: version,
    browserExecutablePath: chromium.executablePath()
  };
}

function selectedArtifactDir(mode, runId) {
  if (mode === "fast") return path.join(ARTIFACT_ROOT, "canary", runId);
  if (mode === "watch") return path.join(ARTIFACT_ROOT, "watch", runId);
  return path.join(ARTIFACT_ROOT, "live", runId);
}

function buildCli(argv, mode) {
  const args = argMap(argv);
  return {
    mode,
    runId: args.get("--run-id") || `${mode}-${utcSlug(nowIso())}`,
    headed: mode === "watch" ? true : parseBool(args.get("--headed"), false),
    keepOpen: parseBool(args.get("--keep-open"), false),
    leaveOpenOnFailure: parseBool(args.get("--leave-open-on-failure"), mode === "watch"),
    slowMoMs: parseNumber(args.get("--slow-mo"), mode === "watch" ? 40 : 0),
    cycles: parseNumber(args.get("--cycles"), mode === "live" ? 2 : 2),
    enableVideo: parseBool(args.get("--video"), false),
    autoControlTest: parseBool(args.get("--auto-control-test"), mode === "watch"),
    abortViaStop: parseBool(args.get("--abort-via-stop"), false),
    trace: parseBool(args.get("--trace"), mode === "watch"),
    captureScreenshots: parseBool(args.get("--screenshots"), mode === "watch"),
    strictDeterminism: parseBool(args.get("--strict-determinism"), mode === "fast"),
    scenarioRuns: parseNumber(args.get("--scenario-runs"), mode === "fast" ? 2 : 1),
    expectedUserscriptSha: args.get("--expected-userscript-sha") || null
  };
}

function completeNullReasons(row, reasonMap) {
  for (const key of REQUIRED_SCHEMA_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(row, key) && row[key] === null && !reasonMap[key]) {
      reasonMap[key] = "null-in-canary-output";
    }
  }
}

function validateSchemaCompleteness(result) {
  const errors = [];
  for (const field of REQUIRED_SCHEMA_FIELDS) {
    if (!Object.prototype.hasOwnProperty.call(result, field)) {
      errors.push(`top-level missing ${field}`);
    }
  }
  const cycles = Array.isArray(result.cycles) ? result.cycles : [];
  cycles.forEach((row, idx) => {
    for (const field of REQUIRED_SCHEMA_FIELDS) {
      if (!Object.prototype.hasOwnProperty.call(row, field)) {
        errors.push(`cycle ${idx + 1} missing ${field}`);
      }
    }
  });
  return errors;
}

async function stageCanaryState(page, state) {
  return page.evaluate((input) => {
    const game = window.angular.element(document.body).injector().get("game");
    const bot = window.kbcSwarmBot;
    const DecimalCtor = window.Decimal;

    const normalize = (value) => String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
    const makeDecimal = (value) => new DecimalCtor(value);
    const unitCounts = input.unitCounts || {};
    const passiveRates = input.passiveRates || {};

    const originalUnit = typeof game.unit === "function" ? game.unit.bind(game) : null;
    const originalUnitList = typeof game.unitlist === "function" ? game.unitlist.bind(game) : null;

    const patched = [];
    const patch = (obj, key, value, note) => {
      if (!obj) return;
      patched.push({ obj, key, old: obj[key], note });
      Object.defineProperty(obj, key, { configurable: true, writable: true, value });
    };

    const startMs = Date.now();

    const keysForUnit = (unit) => {
      const keys = new Set();
      const name = normalize(unit?.name || "");
      const display = normalize(unit?.displayName || unit?.plural || "");
      const suffix = normalize(unit?.suffix || "");
      if (name) keys.add(name);
      if (display) keys.add(display);
      if (name && suffix) keys.add(`${name} ${suffix}`);
      if (name === "spider") keys.add("arachnomorph");
      if (name === "mosquito") keys.add("culicimorph");
      return Array.from(keys);
    };

    const keyToStage = (unit) => keysForUnit(unit).find((key) => Object.prototype.hasOwnProperty.call(unitCounts, key));
    const keyToRate = (unit) => keysForUnit(unit).find((key) => Object.prototype.hasOwnProperty.call(passiveRates, key));

    const applyOverrides = (unit) => {
      if (!unit) return unit;
      const stageKey = keyToStage(unit);
      const rateKey = keyToRate(unit);
      if (!stageKey && !rateKey) return unit;

      const baseBefore = String(unit?.count?.() || "0");
      const staged = stageKey ? String(unitCounts[stageKey]) : baseBefore;
      const rate = rateKey ? String(passiveRates[rateKey]) : "0";
      const stagedDecimal = makeDecimal(staged);
      const rateDecimal = makeDecimal(rate);

      patch(unit, "count", () => {
        const elapsedSeconds = new DecimalCtor(Date.now() - startMs).dividedBy(1000);
        return stagedDecimal.plus(rateDecimal.times(elapsedSeconds));
      }, `count override for ${stageKey || rateKey}`);
      patch(unit, "isVisible", () => true, `isVisible override for ${stageKey || rateKey}`);

      manifest.push({
        id: `unit:${unit?.name || stageKey || rateKey}`,
        path: `game.unit(${unit?.name || stageKey || rateKey}).count`,
        before: baseBefore,
        stagedValue: staged,
        method: "Object.defineProperty(count) dynamic decimal",
        restorationMethod: "restore original property descriptor/value"
      });

      if (rateKey) {
        manifest.push({
          id: `unit-rate:${unit?.name || rateKey}`,
          path: `game.unit(${unit?.name || rateKey}).count-rate`,
          before: "runtime-dependent",
          stagedValue: rate,
          method: "elapsed-seconds * configured rate",
          restorationMethod: "restore original property descriptor/value"
        });
      }

      return unit;
    };

    const manifest = [];

    patch(game, "unit", (name) => {
      const found = originalUnit ? originalUnit(name) : null;
      return applyOverrides(found);
    }, "game.unit patched");

    patch(game, "unitlist", () => {
      const list = originalUnitList ? originalUnitList() : [];
      return list.map((unit) => applyOverrides(unit));
    }, "game.unitlist patched");

    const configBefore = {
      enabled: !!bot.config.enabled,
      advisorOnly: !!bot.config.advisorOnly,
      autoBuySafeDecisions: !!bot.config.autoBuySafeDecisions,
      autoCastAbilities: !!bot.config.autoCastAbilities,
      autoAscend: !!bot.config.autoAscend,
      energySupportBrokerAllowAutoCast: !!bot.config.energySupportBrokerAllowAutoCast
    };

    bot.config.enabled = true;
    bot.config.advisorOnly = true;
    bot.config.autoBuySafeDecisions = false;
    bot.config.autoCastAbilities = false;
    bot.config.autoAscend = false;
    bot.config.energySupportBrokerAllowAutoCast = false;

    manifest.push({
      id: "config:advisorOnly",
      path: "kbcSwarmBot.config.advisorOnly",
      before: String(configBefore.advisorOnly),
      stagedValue: "true",
      method: "direct config override",
      restorationMethod: "restore captured config values"
    });

    const digest = {
      runHistoryLength: Array.isArray(bot.getRunHistory?.()) ? bot.getRunHistory().length : 0,
      inspectorTimestamp: bot.getStrategyInspector?.()?.timestamp || null,
      resourceSnapshot: {
        meat: String(game.unit("meat")?.count?.() || "0"),
        larva: String(game.unit("larva")?.count?.() || "0"),
        territory: String(game.unit("territory")?.count?.() || "0"),
        energy: String(game.unit("energy")?.count?.() || "0")
      }
    };

    const restore = () => {
      for (const row of patched.reverse()) {
        Object.defineProperty(row.obj, row.key, { configurable: true, writable: true, value: row.old });
      }
      bot.config.enabled = configBefore.enabled;
      bot.config.advisorOnly = configBefore.advisorOnly;
      bot.config.autoBuySafeDecisions = configBefore.autoBuySafeDecisions;
      bot.config.autoCastAbilities = configBefore.autoCastAbilities;
      bot.config.autoAscend = configBefore.autoAscend;
      bot.config.energySupportBrokerAllowAutoCast = configBefore.energySupportBrokerAllowAutoCast;
    };

    window.__kbcAuditCanaryRestore = restore;

    return {
      stateSetupMethod: "direct-game-service-unit-patch",
      manifest,
      preResetDigest: digest,
      initialSummary: `meat=${digest.resourceSnapshot.meat}, larva=${digest.resourceSnapshot.larva}, drone=${String(game.unit("drone")?.count?.() || "0")}`
    };
  }, state);
}

async function captureStateDigest(page) {
  return page.evaluate(() => {
    const game = window.angular.element(document.body).injector().get("game");
    const bot = window.kbcSwarmBot;
    const inspector = bot.getStrategyInspector?.() || null;
    return {
      runHistoryLength: Array.isArray(bot.getRunHistory?.()) ? bot.getRunHistory().length : 0,
      inspectorTimestamp: inspector?.timestamp || null,
      phase: inspector?.phase || null,
      decision: inspector?.decision || null,
      resources: {
        meat: String(game.unit("meat")?.count?.() || "0"),
        larva: String(game.unit("larva")?.count?.() || "0"),
        territory: String(game.unit("territory")?.count?.() || "0"),
        energy: String(game.unit("energy")?.count?.() || "0")
      }
    };
  });
}

async function runPlannerCycle(page) {
  return page.evaluate(() => {
    const bot = window.kbcSwarmBot;
    const before = bot.getStrategyInspector?.() || null;
    const beforeTs = before?.timestamp || null;
    const ok = bot.runOnce();
    const after = bot.getStrategyInspector?.() || null;
    const afterTs = after?.timestamp || null;
    const runHistory = bot.getRunHistory?.() || [];
    const lanes = Array.isArray(after?.lanes) ? after.lanes : [];

    return {
      runOnceReturned: ok,
      inspectorBefore: before,
      inspectorAfter: after,
      inspectorTimestampChanged: !!afterTs && afterTs !== beforeTs,
      runHistoryLength: runHistory.length,
      runHistoryLast: runHistory.length ? runHistory[runHistory.length - 1] : null,
      lanes,
      selectedLane: after?.councilWinningLane || null,
      selectedDecision: after?.mainDecision || after?.decision || null,
      selectedAction: after?.bestAllowedAction || after?.overseerMainSelected || null,
      bestRejectedAlternative: after?.bestRejectedAction || after?.closestRejectedToBuying?.candidate || null,
      hardBlockers: after?.overseerBlockedByHardGuard || null,
      activeGoal: after?.goal || null,
      goalMetricName: "runHistoryLength",
      goalMetricBefore: String((before && before.runHistoryLength) || runHistory.length - 1),
      goalMetricAfter: String(runHistory.length)
    };
  });
}

async function restoreStagedState(page) {
  return page.evaluate(() => {
    if (typeof window.__kbcAuditCanaryRestore === "function") {
      window.__kbcAuditCanaryRestore();
      delete window.__kbcAuditCanaryRestore;
      return { ok: true, method: "restore-captured-property-descriptors" };
    }
    return { ok: false, method: "restore-missing" };
  });
}

function normalizeForDeterminism(cycleRows) {
  return cycleRows.map((row) => ({
    cycleNumber: row.cycleNumber,
    selectedLane: row.selectedLane,
    selectedDecision: row.selectedDecision,
    selectedAction: row.selectedAction,
    bestLegalAlternative: row.bestLegalAlternative,
    bestRejectedAlternative: row.bestRejectedAlternative,
    hardBlockers: row.hardBlockers,
    meaningfulProgress: row.meaningfulProgress,
    councilMatchesPlanner: row.councilMatchesPlanner,
    inspectorMatchesPlanner: row.inspectorMatchesPlanner,
    exportMatchesPlanner: row.exportMatchesPlanner,
    stateTransitionMatchesReport: row.stateTransitionMatchesReport,
    activeGoal: row.activeGoal
  }));
}

function firstDifference(a, b, pathPrefix = "") {
  if (typeof a !== typeof b) return `${pathPrefix}:type-mismatch`;
  if (Array.isArray(a) && Array.isArray(b)) {
    const len = Math.max(a.length, b.length);
    for (let i = 0; i < len; i += 1) {
      const found = firstDifference(a[i], b[i], `${pathPrefix}[${i}]`);
      if (found) return found;
    }
    return null;
  }
  if (a && typeof a === "object" && b && typeof b === "object") {
    const keys = Array.from(new Set([...Object.keys(a), ...Object.keys(b)])).sort();
    for (const key of keys) {
      const found = firstDifference(a[key], b[key], pathPrefix ? `${pathPrefix}.${key}` : key);
      if (found) return found;
    }
    return null;
  }
  if (a !== b) return `${pathPrefix}:${JSON.stringify(a)}!=${JSON.stringify(b)}`;
  return null;
}

function buildMarkdown(result) {
  const lines = [];
  lines.push(`# Strategy Audit Testbed - ${result.mode.toUpperCase()} Result`);
  lines.push("");
  lines.push(`- Run ID: ${result.runId}`);
  lines.push(`- Started: ${result.startedAt}`);
  lines.push(`- Completed: ${result.completedAt}`);
  lines.push(`- URL: ${result.gameSourceUrl}`);
  lines.push(`- Userscript: ${result.userscriptPath}`);
  lines.push(`- Userscript SHA256: ${result.userscriptContentSha256}`);
  lines.push(`- Verdict: ${result.runnerVerdict}`);
  lines.push(`- Partial result: ${result.partialResult ? "yes" : "no"}`);
  lines.push("");

  if (result.determinism) {
    lines.push("## Determinism");
    lines.push(`- Runs compared: ${result.determinism.runsCompared}`);
    lines.push(`- Stable: ${result.determinism.stable ? "yes" : "no"}`);
    lines.push(`- Hashes: ${result.determinism.hashes.join(", ")}`);
    lines.push(`- First difference: ${result.determinism.firstDifference || "none"}`);
    lines.push("");
  }

  lines.push("## Cycle Summary");
  for (const cycle of result.cycles) {
    lines.push(`- cycle ${cycle.cycleNumber}: decision=${cycle.selectedDecision || "null"}, action=${cycle.selectedAction || "null"}, lane=${cycle.selectedLane || "null"}, assessment=${cycle.assessmentLabel}`);
  }
  lines.push("");

  lines.push("## Control Test");
  if (result.watchControlTest) {
    lines.push(`- Pause blocked ms: ${result.watchControlTest.pauseBlockedMs}`);
    lines.push(`- Next single-step behavior: ${result.watchControlTest.nextRanExactlyOneCycleThenPaused ? "pass" : "fail"}`);
    lines.push(`- Continue resumed auto cycles: ${result.watchControlTest.continueResumedAutomaticCycles ? "pass" : "fail"}`);
    lines.push(`- Stop wrote partial: ${result.watchControlTest.stopTriggeredPartialWrite ? "pass" : "not-triggered"}`);
  } else {
    lines.push("- not applicable");
  }
  lines.push("");

  lines.push("## Artifacts");
  lines.push(`- JSON: ${result.artifactPaths.resultJsonPath}`);
  lines.push(`- Markdown: ${result.artifactPaths.resultMdPath}`);
  lines.push(`- Screenshots: ${(result.artifactPaths.screenshotPaths || []).join(", ") || "none"}`);
  lines.push(`- Trace: ${result.artifactPaths.tracePath || "none"}`);
  lines.push(`- Video: ${result.artifactPaths.videoPath || "none"}`);
  lines.push("");

  lines.push("## Notes");
  lines.push("- Canary validates infrastructure contract only.");
  lines.push("- No Strategy Audit 0 scenario matrix is executed.");
  lines.push("- Planner output is observed from runOnce and never injected.");

  return lines.join("\n");
}

function assessCycle(row) {
  if (!row.runOnceReturned) return { label: "BAD", reason: "runOnce returned false" };
  if (!row.stateTransitionMatchesReport) return { label: "QUESTIONABLE", reason: "state digest did not change between cycles" };
  if (!row.selectedDecision) return { label: "INCONCLUSIVE", reason: "selected decision missing" };
  return { label: "GOOD", reason: "planner produced decision and cycle transition was observable" };
}

async function openGameContext(browser, cli, artifactDir) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 960 },
    locale: "en-US",
    timezoneId: "UTC",
    serviceWorkers: "block",
    recordVideo: cli.enableVideo ? { dir: path.join(artifactDir, "video"), size: { width: 1280, height: 720 } } : undefined
  });
  await context.grantPermissions(["clipboard-read", "clipboard-write"], { origin: "https://www.swarmsim.com" });
  if (cli.trace) {
    await context.tracing.start({ screenshots: true, snapshots: true, sources: true });
  }

  const page = await context.newPage();
  await page.goto(BASE_URL, { waitUntil: "domcontentloaded", timeout: 90000 });
  await page.evaluate(() => localStorage.clear());

  const userscript = fs.readFileSync(USERSCRIPT_PATH, "utf8");
  await page.addScriptTag({ content: userscript });
  await page.waitForFunction(() => !!window.kbcSwarmBot && !!window.angular, { timeout: 90000 });
  return { context, page, userscript };
}

async function probeHydration(page) {
  return page.evaluate(() => {
    const hasBot = !!window.kbcSwarmBot;
    const hasAngular = !!window.angular;
    const game = hasAngular ? window.angular.element(document.body).injector().get("game") : null;
    return {
      hasBot,
      hasAngular,
      hasGame: !!game,
      scriptVersion: window.kbcSwarmBot?.scriptVersion || null,
      councilUiEnabled: window.kbcSwarmBot?.config?.councilUi === true,
      strategyInspectorEnabled: window.kbcSwarmBot?.config?.strategyInspector === true
    };
  });
}

async function clickOverlayButton(page, name) {
  await page.evaluate((buttonName) => {
    const el = document.querySelector(`#kbc-strategy-audit-overlay [data-kbc-btn=\"${buttonName}\"]`);
    if (el) el.click();
  }, name);
}

async function runSingleScenario({ page, cli, userscriptSha, artifactDir, browserInfo, controlBridge }) {
  const screenshotPaths = [];
  const cycleRows = [];
  const nullReasonsByCycle = [];
  const scenarioState = { ...CANARY_STATE, cycles: cli.cycles };

  const staged = await stageCanaryState(page, scenarioState);
  const stateMutationManifestHash = sha256Object(staged.manifest);
  const preResetStateHash = sha256Object(staged.preResetDigest);
  const initialDigest = await captureStateDigest(page);
  const initialStateHash = sha256Object(initialDigest);

  if (cli.mode === "watch") {
    await installWatchOverlay(page, {
      scenarioLabel: `${scenarioState.id} - ${scenarioState.title}`,
      userscriptSha,
      cycle: `0/${scenarioState.cycles}`,
      initialSummary: staged.initialSummary,
      manifestSummary: `${staged.manifest.length} fields staged`,
      activeGoal: "pending",
      selectedLane: "pending",
      selectedAction: "pending",
      bestLegalAlternative: "pending",
      bestRejectedAlternative: "pending",
      hardBlockers: "pending",
      goalMetricBefore: "pending",
      goalMetricAfter: "pending",
      resetLeakageStatus: "pending"
    }, controlBridge);

    if (cli.autoControlTest) {
      await clickOverlayButton(page, "pause");
      setTimeout(() => {
        clickOverlayButton(page, "next").catch(() => {});
      }, 500);
      if (!cli.abortViaStop) {
        setTimeout(() => {
          clickOverlayButton(page, "continue").catch(() => {});
        }, 1400);
      }
    }
  }

  let unknownContamination = false;
  let stoppedByControl = false;

  for (let cycleNumber = 1; cycleNumber <= scenarioState.cycles; cycleNumber += 1) {
    const gate = await controlBridge.waitForPermit(cycleNumber);
    if (!gate.allow) {
      stoppedByControl = true;
      break;
    }

    const beforeDigest = await captureStateDigest(page);
    const planner = await runPlannerCycle(page);
    const afterDigest = await captureStateDigest(page);

    const beforeHash = sha256Object(beforeDigest);
    const afterHash = sha256Object(afterDigest);
    const transition = beforeHash !== afterHash;

    const alternatives = flattenAlternatives(planner.lanes);
    const legalAlternatives = alternatives.filter((row) => row.decision === "BUY");
    const rejectedAlternatives = alternatives.filter((row) => row.decision !== "BUY");

    const row = {};
    const nullReasons = nullReasonMap();

    row.auditId = scenarioState.id;
    row.stateId = scenarioState.id;
    row.stateRevision = 1;
    row.scriptVersion = planner?.inspectorAfter?.scriptVersion || null;
    row.repositoryCommit = process.env.GIT_COMMIT || null;
    row.scenarioHash = sha256Object({ id: scenarioState.id, title: scenarioState.title, cycles: scenarioState.cycles });
    row.initialStateHash = initialStateHash;
    row.cycleNumber = cycleNumber;
    row.capturedAt = nowIso();

    row.gameSourceKind = "production-url";
    row.gameSourceUrl = BASE_URL;
    row.gameSourceCommit = null;
    row.gameBuildVersion = null;
    row.browserKind = "chromium";
    row.browserVersion = browserInfo.browserVersion;
    row.browserMode = cli.headed ? "headed" : "headless";
    row.userscriptPath = toRel(USERSCRIPT_PATH);
    row.userscriptBlobSha = userscriptSha;
    row.userscriptContentSha256 = userscriptSha;
    row.injectionMode = "playwright-addScriptTag";
    row.profileKind = "disposable-context";
    row.networkMode = "online-production";

    row.stateSetupMethod = staged.stateSetupMethod;
    row.stateMutationManifest = staged.manifest;
    row.stateMutationManifestHash = stateMutationManifestHash;
    row.preResetStateHash = preResetStateHash;
    row.postCycleStateHash = afterHash;
    row.postScenarioStateHash = null;
    row.resetMethod = null;
    row.resetVerified = null;
    row.stateLeakageDetected = null;

    row.activePhase = planner?.inspectorAfter?.phase || null;
    row.activeGoal = planner?.activeGoal || planner?.inspectorAfter?.goal || null;
    row.activeTarget = planner?.inspectorAfter?.councilWinningCandidate || null;
    row.selectedLane = planner?.selectedLane || null;
    row.selectedDecision = planner?.selectedDecision || null;
    row.selectedAction = planner?.selectedAction || null;
    row.selectedUnit = planner?.inspectorAfter?.councilWinningCandidate || null;
    row.selectedAmount = planner?.inspectorAfter?.laneCoordinatorSelectedActions?.[0]?.amount || null;
    row.selectedReason = planner?.inspectorAfter?.mainReason || planner?.inspectorAfter?.reason || null;
    row.hardBlockers = planner?.hardBlockers || null;
    row.softBlockers = planner?.inspectorAfter?.waits || null;
    row.actionBudget = planner?.inspectorAfter?.overseerActionsUsed || null;

    row.legalAlternatives = legalAlternatives;
    row.rejectedAlternatives = rejectedAlternatives;
    row.bestLegalAlternative = planner?.selectedAction || null;
    row.bestRejectedAlternative = planner?.bestRejectedAlternative || null;
    row.rejectionReasons = rejectedAlternatives.map((entry) => entry.reason).filter(Boolean);
    row.laneProposals = alternatives;

    row.goalMetricName = "runHistoryLength";
    row.goalMetricBefore = String(beforeDigest.runHistoryLength);
    row.goalMetricAfter = String(afterDigest.runHistoryLength);
    row.goalMetricDelta = String(afterDigest.runHistoryLength - beforeDigest.runHistoryLength);
    row.resourceBankBefore = beforeDigest.resources;
    row.resourceBankAfter = afterDigest.resources;
    row.productionBefore = null;
    row.productionAfter = null;
    row.targetEtaBefore = null;
    row.targetEtaAfter = null;
    row.meaningfulProgress = transition;

    row.councilMatchesPlanner = !!row.selectedLane;
    row.inspectorMatchesPlanner = planner.inspectorTimestampChanged;
    row.exportMatchesPlanner = null;
    row.selectedActionActuallyExecuted = null;
    row.stateTransitionMatchesReport = transition;

    row.headed = cli.headed;
    row.screenshotPaths = [];
    row.videoPath = null;
    row.tracePath = null;
    row.browserLeftOpenOnFailure = cli.leaveOpenOnFailure;

    const assessment = assessCycle({
      runOnceReturned: planner.runOnceReturned,
      stateTransitionMatchesReport: transition,
      selectedDecision: row.selectedDecision
    });
    row.assessmentLabel = assessment.label;
    row.assessmentJustification = assessment.reason;

    setMaybe(row, nullReasons, "gameSourceCommit", row.gameSourceCommit, "production-url-not-pinned");
    setMaybe(row, nullReasons, "gameBuildVersion", row.gameBuildVersion, "production-build-version-not-exposed");
    setMaybe(row, nullReasons, "productionBefore", row.productionBefore, "canary-does-not-read-full-production-matrix");
    setMaybe(row, nullReasons, "productionAfter", row.productionAfter, "canary-does-not-read-full-production-matrix");
    setMaybe(row, nullReasons, "targetEtaBefore", row.targetEtaBefore, "eta-surface-not-consistently-exposed");
    setMaybe(row, nullReasons, "targetEtaAfter", row.targetEtaAfter, "eta-surface-not-consistently-exposed");
    setMaybe(row, nullReasons, "exportMatchesPlanner", row.exportMatchesPlanner, "export-comparison-not-required-for-canary");
    setMaybe(row, nullReasons, "selectedActionActuallyExecuted", row.selectedActionActuallyExecuted, "advisor-only-mode-avoids-live-mutation");
    completeNullReasons(row, nullReasons);

    nullReasonsByCycle.push(nullReasons);

    if (cli.mode === "watch") {
      await updateWatchOverlay(page, {
        cycle: `${cycleNumber}/${scenarioState.cycles}`,
        activeGoal: row.activeGoal || "none",
        selectedLane: row.selectedLane || "none",
        selectedAction: row.selectedAction || "none",
        bestLegalAlternative: row.bestLegalAlternative || "none",
        bestRejectedAlternative: row.bestRejectedAlternative || "none",
        hardBlockers: row.hardBlockers || "none",
        goalMetricBefore: row.goalMetricBefore,
        goalMetricAfter: row.goalMetricAfter,
        resetLeakageStatus: "in-progress"
      });
    }

    if (cli.captureScreenshots) {
      const shotPath = path.join(artifactDir, `cycle-${String(cycleNumber).padStart(2, "0")}.png`);
      await page.screenshot({ path: shotPath, fullPage: true });
      row.screenshotPaths.push(toRel(shotPath));
      screenshotPaths.push(toRel(shotPath));
    }

    cycleRows.push(row);
    controlBridge.completeCycle(cycleNumber);

    if (cli.mode === "watch" && cli.autoControlTest && cli.abortViaStop && cycleNumber === 1) {
      await clickOverlayButton(page, "stop");
    }

    if (controlBridge.stopRequested) {
      stoppedByControl = true;
      break;
    }

    if (!transition && cycleNumber > 1) {
      unknownContamination = true;
      break;
    }
  }

  const restoreStatus = await restoreStagedState(page);
  const postScenarioDigest = await captureStateDigest(page);
  const postScenarioStateHash = sha256Object(postScenarioDigest);
  const postResetDigest = await captureStateDigest(page);
  const postResetStateHash = sha256Object(postResetDigest);
  const resetVerified = restoreStatus.ok === true;
  const stateLeakageDetected = !resetVerified;

  if (cli.mode === "watch") {
    await updateWatchOverlay(page, {
      cycle: `${cycleRows.length}/${scenarioState.cycles}`,
      activeGoal: cycleRows[cycleRows.length - 1]?.activeGoal || "none",
      selectedLane: cycleRows[cycleRows.length - 1]?.selectedLane || "none",
      selectedAction: cycleRows[cycleRows.length - 1]?.selectedAction || "none",
      bestLegalAlternative: cycleRows[cycleRows.length - 1]?.bestLegalAlternative || "none",
      bestRejectedAlternative: cycleRows[cycleRows.length - 1]?.bestRejectedAlternative || "none",
      hardBlockers: cycleRows[cycleRows.length - 1]?.hardBlockers || "none",
      goalMetricBefore: cycleRows[cycleRows.length - 1]?.goalMetricBefore || "0",
      goalMetricAfter: cycleRows[cycleRows.length - 1]?.goalMetricAfter || "0",
      resetLeakageStatus: `reset=${resetVerified}; leakage=${stateLeakageDetected}`,
      error: unknownContamination ? "unknown state contamination" : "none"
    });
  }

  for (let i = 0; i < cycleRows.length; i += 1) {
    const row = cycleRows[i];
    row.postScenarioStateHash = postScenarioStateHash;
    row.resetMethod = restoreStatus.method;
    row.resetVerified = resetVerified;
    row.stateLeakageDetected = stateLeakageDetected;
    const reasonMap = nullReasonsByCycle[i] || {};
    for (const key of Object.keys(reasonMap)) {
      if (row[key] !== null) {
        delete reasonMap[key];
      }
    }
  }

  if (stateLeakageDetected) {
    throw new Error("state leakage detected after reset");
  }
  if (unknownContamination) {
    throw new Error("unknown state contamination detected; refusing to continue to next state");
  }

  return {
    scenarioId: scenarioState.id,
    scenarioTitle: scenarioState.title,
    stateSetupMethod: staged.stateSetupMethod,
    stateMutationManifest: staged.manifest,
    stateMutationManifestHash,
    preResetStateHash,
    initialStateHash,
    postScenarioStateHash,
    resetMethod: restoreStatus.method,
    resetVerified,
    stateLeakageDetected,
    cycles: cycleRows,
    nullReasonsByCycle,
    stoppedByControl,
    screenshotPaths,
    watchControlState: controlBridge.snapshot()
  };
}

async function finalizeArtifacts({ context, page, cli, artifactDir }) {
  const tracePath = cli.trace ? path.join(artifactDir, "trace.zip") : null;
  if (tracePath) {
    await context.tracing.stop({ path: tracePath });
  }

  let videoPath = null;
  if (cli.enableVideo) {
    try {
      const video = page.video();
      if (video) {
        const vPath = await video.path();
        if (vPath) videoPath = toRel(vPath);
      }
    } catch {
      // ignore video extraction errors
    }
  }

  return {
    tracePath: tracePath ? toRel(tracePath) : null,
    videoPath
  };
}

async function runOneExecution(cli) {
  const startedAt = nowIso();
  const artifactDir = selectedArtifactDir(cli.mode, cli.runId);
  fs.mkdirSync(artifactDir, { recursive: true });

  const userscriptContent = fs.readFileSync(USERSCRIPT_PATH, "utf8");
  const userscriptSha = sha256String(userscriptContent);

  if (cli.expectedUserscriptSha && cli.expectedUserscriptSha !== userscriptSha) {
    throw new Error(`userscript hash mismatch: expected ${cli.expectedUserscriptSha}, got ${userscriptSha}`);
  }

  const browser = await chromium.launch({ headless: !cli.headed, slowMo: cli.slowMoMs });
  const browserInfo = await browserProvenance(browser);

  const controlBridge = new ControlBridge({
    mode: cli.mode,
    autoControlTest: cli.autoControlTest,
    abortViaStop: cli.abortViaStop
  });

  let context;
  let page;
  let partialResult = false;
  let scenario;
  let runnerVerdict = "PASS";
  let setupFailure = null;
  let runError = null;
  let finalizedArtifacts = { tracePath: null, videoPath: null };

  try {
    const opened = await openGameContext(browser, cli, artifactDir);
    context = opened.context;
    page = opened.page;

    const hydration = await probeHydration(page);
    if (!hydration.hasAngular || !hydration.hasGame || !hydration.hasBot) {
      throw new Error("missing game hydration or userscript API");
    }

    scenario = await runSingleScenario({
      page,
      cli,
      userscriptSha,
      artifactDir,
      browserInfo,
      controlBridge
    });

    partialResult = scenario.stoppedByControl;
    if (partialResult) {
      controlBridge.markStopPartial();
      runnerVerdict = "PARTIAL";
    }

    if (cli.keepOpen && cli.mode === "watch") {
      await page.waitForTimeout(1500);
    }

    finalizedArtifacts = await finalizeArtifacts({ context, page, cli, artifactDir });

    if (page) await page.close();
    if (context) await context.close();
    await browser.close();

    const completedAt = nowIso();

    const result = {
      mode: cli.mode,
      runId: cli.runId,
      startedAt,
      completedAt,
      auditId: CANARY_STATE.id,
      stateId: CANARY_STATE.id,
      stateRevision: 1,
      scriptVersion: hydration.scriptVersion,
      repositoryCommit: process.env.GIT_COMMIT || null,
      scenarioHash: sha256Object({ id: CANARY_STATE.id, cycles: cli.cycles }),
      initialStateHash: scenario.initialStateHash,
      cycleNumber: scenario.cycles.length,
      capturedAt: completedAt,

      gameSourceKind: "production-url",
      gameSourceUrl: BASE_URL,
      gameSourceCommit: null,
      gameBuildVersion: null,
      browserKind: "chromium",
      browserVersion: browserInfo.browserVersion,
      browserMode: cli.headed ? "headed" : "headless",
      userscriptPath: toRel(USERSCRIPT_PATH),
      userscriptBlobSha: userscriptSha,
      userscriptContentSha256: userscriptSha,
      injectionMode: "playwright-addScriptTag",
      profileKind: "disposable-context",
      networkMode: "online-production",

      stateSetupMethod: scenario.stateSetupMethod,
      stateMutationManifest: scenario.stateMutationManifest,
      stateMutationManifestHash: scenario.stateMutationManifestHash,
      preResetStateHash: scenario.preResetStateHash,
      initialStateHash: scenario.initialStateHash,
      postCycleStateHash: scenario.cycles.length ? scenario.cycles[scenario.cycles.length - 1].postCycleStateHash : null,
      postScenarioStateHash: scenario.postScenarioStateHash,
      resetMethod: scenario.resetMethod,
      resetVerified: scenario.resetVerified,
      stateLeakageDetected: scenario.stateLeakageDetected,

      activePhase: scenario.cycles.length ? scenario.cycles[scenario.cycles.length - 1].activePhase : null,
      activeGoal: scenario.cycles.length ? scenario.cycles[scenario.cycles.length - 1].activeGoal : null,
      activeTarget: scenario.cycles.length ? scenario.cycles[scenario.cycles.length - 1].activeTarget : null,
      selectedLane: scenario.cycles.length ? scenario.cycles[scenario.cycles.length - 1].selectedLane : null,
      selectedDecision: scenario.cycles.length ? scenario.cycles[scenario.cycles.length - 1].selectedDecision : null,
      selectedAction: scenario.cycles.length ? scenario.cycles[scenario.cycles.length - 1].selectedAction : null,
      selectedUnit: scenario.cycles.length ? scenario.cycles[scenario.cycles.length - 1].selectedUnit : null,
      selectedAmount: scenario.cycles.length ? scenario.cycles[scenario.cycles.length - 1].selectedAmount : null,
      selectedReason: scenario.cycles.length ? scenario.cycles[scenario.cycles.length - 1].selectedReason : null,
      hardBlockers: scenario.cycles.length ? scenario.cycles[scenario.cycles.length - 1].hardBlockers : null,
      softBlockers: scenario.cycles.length ? scenario.cycles[scenario.cycles.length - 1].softBlockers : null,
      actionBudget: scenario.cycles.length ? scenario.cycles[scenario.cycles.length - 1].actionBudget : null,

      legalAlternatives: scenario.cycles.length ? scenario.cycles[scenario.cycles.length - 1].legalAlternatives : [],
      rejectedAlternatives: scenario.cycles.length ? scenario.cycles[scenario.cycles.length - 1].rejectedAlternatives : [],
      bestLegalAlternative: scenario.cycles.length ? scenario.cycles[scenario.cycles.length - 1].bestLegalAlternative : null,
      bestRejectedAlternative: scenario.cycles.length ? scenario.cycles[scenario.cycles.length - 1].bestRejectedAlternative : null,
      rejectionReasons: scenario.cycles.length ? scenario.cycles[scenario.cycles.length - 1].rejectionReasons : [],
      laneProposals: scenario.cycles.length ? scenario.cycles[scenario.cycles.length - 1].laneProposals : [],

      goalMetricName: scenario.cycles.length ? scenario.cycles[scenario.cycles.length - 1].goalMetricName : "runHistoryLength",
      goalMetricBefore: scenario.cycles.length ? scenario.cycles[0].goalMetricBefore : null,
      goalMetricAfter: scenario.cycles.length ? scenario.cycles[scenario.cycles.length - 1].goalMetricAfter : null,
      goalMetricDelta: scenario.cycles.length ? scenario.cycles[scenario.cycles.length - 1].goalMetricDelta : null,
      resourceBankBefore: scenario.cycles.length ? scenario.cycles[0].resourceBankBefore : null,
      resourceBankAfter: scenario.cycles.length ? scenario.cycles[scenario.cycles.length - 1].resourceBankAfter : null,
      productionBefore: null,
      productionAfter: null,
      targetEtaBefore: null,
      targetEtaAfter: null,
      meaningfulProgress: scenario.cycles.some((row) => row.meaningfulProgress),

      councilMatchesPlanner: scenario.cycles.every((row) => row.councilMatchesPlanner),
      inspectorMatchesPlanner: scenario.cycles.every((row) => row.inspectorMatchesPlanner),
      exportMatchesPlanner: null,
      selectedActionActuallyExecuted: null,
      stateTransitionMatchesReport: scenario.cycles.every((row) => row.stateTransitionMatchesReport),

      headed: cli.headed,
      screenshotPaths: scenario.screenshotPaths,
      videoPath: finalizedArtifacts.videoPath,
      tracePath: finalizedArtifacts.tracePath,
      browserLeftOpenOnFailure: cli.leaveOpenOnFailure,

      assessmentLabel: scenario.cycles.every((row) => row.assessmentLabel === "GOOD") ? "GOOD" : "QUESTIONABLE",
      assessmentJustification: "Canary validates testbed contract and cycle-level observability.",

      environmentProvenance: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch
      },
      browserProvenance: browserInfo,
      gameSource: {
        url: BASE_URL,
        kind: "production-url"
      },
      userscriptProvenance: {
        path: toRel(USERSCRIPT_PATH),
        hash: userscriptSha
      },
      cycles: scenario.cycles,
      nullFieldReasons: {
        topLevel: {
          gameSourceCommit: "production-url-not-pinned",
          gameBuildVersion: "production-build-version-not-exposed",
          productionBefore: "canary-does-not-read-full-production-matrix",
          productionAfter: "canary-does-not-read-full-production-matrix",
          targetEtaBefore: "eta-surface-not-consistently-exposed",
          targetEtaAfter: "eta-surface-not-consistently-exposed",
          exportMatchesPlanner: "export-comparison-not-required-for-canary",
          selectedActionActuallyExecuted: "advisor-only-mode-avoids-live-mutation"
        },
        byCycle: scenario.nullReasonsByCycle
      },
      watchControlTest: cli.mode === "watch" ? controlBridge.controlTest : null,
      watchControlState: scenario.watchControlState,
      partialResult,
      runnerVerdict,
      setupFailure,
      runError,
      artifactPaths: {
        resultJsonPath: toRel(path.join(artifactDir, `${cli.runId}-result.json`)),
        resultMdPath: toRel(path.join(artifactDir, `${cli.runId}-result.md`)),
        screenshotPaths: scenario.screenshotPaths,
        tracePath: finalizedArtifacts.tracePath,
        videoPath: finalizedArtifacts.videoPath
      }
    };

    completeNullReasons(result, result.nullFieldReasons.topLevel);
    const schemaErrors = validateSchemaCompleteness(result);
    if (schemaErrors.length > 0) {
      throw new Error(`schema validation failed: ${schemaErrors.join("; ")}`);
    }

    const resultJsonPath = path.join(artifactDir, `${cli.runId}-result.json`);
    const resultMdPath = path.join(artifactDir, `${cli.runId}-result.md`);

    writeJson(resultJsonPath, result);
    writeText(resultMdPath, buildMarkdown(result));

    return {
      exitCode: partialResult ? 2 : 0,
      result,
      resultJsonPath,
      resultMdPath
    };
  } catch (error) {
    runError = error?.stack || error?.message || String(error);
    runnerVerdict = "FAIL";
    partialResult = true;

    if (cli.leaveOpenOnFailure && page) {
      try {
        await updateWatchOverlay(page, {
          cycle: `error`,
          activeGoal: "error",
          selectedLane: "error",
          selectedAction: "error",
          bestLegalAlternative: "error",
          bestRejectedAlternative: "error",
          hardBlockers: "error",
          goalMetricBefore: "error",
          goalMetricAfter: "error",
          resetLeakageStatus: "error",
          error: runError
        });
      } catch {
        // no-op
      }
    }

    try {
      if (context && page) {
        finalizedArtifacts = await finalizeArtifacts({ context, page, cli, artifactDir });
      }
    } catch {
      // ignore
    }

    const failedResult = {
      mode: cli.mode,
      runId: cli.runId,
      startedAt,
      completedAt: nowIso(),
      gameSourceUrl: BASE_URL,
      userscriptPath: toRel(USERSCRIPT_PATH),
      userscriptContentSha256: sha256String(fs.readFileSync(USERSCRIPT_PATH, "utf8")),
      runnerVerdict,
      partialResult,
      setupFailure,
      runError,
      watchControlTest: cli.mode === "watch" ? controlBridge.controlTest : null,
      artifactPaths: {
        resultJsonPath: toRel(path.join(artifactDir, `${cli.runId}-result.json`)),
        resultMdPath: toRel(path.join(artifactDir, `${cli.runId}-result.md`)),
        screenshotPaths: [],
        tracePath: finalizedArtifacts.tracePath,
        videoPath: finalizedArtifacts.videoPath
      },
      cycles: []
    };

    const resultJsonPath = path.join(artifactDir, `${cli.runId}-result.json`);
    const resultMdPath = path.join(artifactDir, `${cli.runId}-result.md`);
    writeJson(resultJsonPath, failedResult);
    writeText(resultMdPath, buildMarkdown({
      ...failedResult,
      determinism: null,
      watchControlTest: failedResult.watchControlTest || null
    }));

    try {
      if (page && !cli.leaveOpenOnFailure) await page.close();
      if (context && !cli.leaveOpenOnFailure) await context.close();
      if (!cli.leaveOpenOnFailure) await browser.close();
    } catch {
      // ignore close errors
    }

    return {
      exitCode: 1,
      result: failedResult,
      resultJsonPath,
      resultMdPath
    };
  }
}

async function runMode(mode, argv = process.argv.slice(2)) {
  const cli = buildCli(argv, mode);
  const executions = [];

  for (let i = 0; i < cli.scenarioRuns; i += 1) {
    const runCli = { ...cli, runId: cli.scenarioRuns > 1 ? `${cli.runId}-run${i + 1}` : cli.runId };
    const outcome = await runOneExecution(runCli);
    executions.push(outcome);
    if (outcome.exitCode !== 0 && mode !== "watch") {
      break;
    }
  }

  let deterministic = null;
  let finalExitCode = executions.some((row) => row.exitCode === 1) ? 1 : 0;

  if (mode === "fast" && executions.length >= 2) {
    const normalized = executions.map((row) => normalizeForDeterminism(row.result.cycles || []));
    const hashes = normalized.map((row) => sha256Object(row));
    const stable = hashes.every((hash) => hash === hashes[0]);
    const diff = stable ? null : firstDifference(normalized[0], normalized[1]);

    deterministic = {
      runsCompared: executions.length,
      hashes,
      stable,
      firstDifference: diff
    };

    const summaryPath = path.join(selectedArtifactDir(mode, cli.runId), `${cli.runId}-determinism.json`);
    writeJson(summaryPath, deterministic);

    if (!stable && cli.strictDeterminism) {
      finalExitCode = 1;
    }
  }

  const primary = executions[0];
  if (primary && primary.result) {
    primary.result.determinism = deterministic;
    writeJson(primary.resultJsonPath, primary.result);
    writeText(primary.resultMdPath, buildMarkdown(primary.result));
  }

  return {
    exitCode: finalExitCode,
    executions,
    determinism: deterministic
  };
}

module.exports = {
  runMode,
  CANARY_STATE,
  normalizeForDeterminism,
  firstDifference
};

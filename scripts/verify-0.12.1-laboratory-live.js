const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const root = path.resolve(__dirname, "..");
const userscriptPath = path.join(root, "src", "SwarmSim-Strategy-Autobuyer.user.js");
const evidenceDir = path.join(root, "docs", "live-logs");
const testDataDir = path.join(root, "docs", "test-data", "0.12.2-laboratory");
const evidenceJsonPath = path.join(evidenceDir, "browser-test-0.12.2-laboratory-live.json");
const evidenceMdPath = path.join(evidenceDir, "browser-test-0.12.2-laboratory-live.md");
const liveSnapshotJsonPath = path.join(testDataDir, "live-snapshot.json");
const liveSnapshotMdPath = path.join(testDataDir, "live-snapshot.md");

function ensureParentDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function writeText(filePath, text) {
  ensureParentDir(filePath);
  fs.writeFileSync(filePath, `${text}\n`);
}

function readUserscript() {
  return fs.readFileSync(userscriptPath, "utf8");
}

async function main() {
  ensureParentDir(evidenceJsonPath);
  ensureParentDir(liveSnapshotJsonPath);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1365, height: 900 },
    locale: "en-US",
    timezoneId: "UTC",
    serviceWorkers: "block",
  });
  const page = await context.newPage();
  const consoleRows = [];
  page.on("console", (msg) => {
    const text = msg.text();
    if (/KBC|SwarmBot|Laboratory|error|warning/i.test(text)) consoleRows.push({ type: msg.type(), text });
  });

  await page.goto("https://www.swarmsim.com/#/tab/territory", { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.evaluate(() => {
    localStorage.clear();
    localStorage.setItem("kbcSwarmBotLaboratoryEnabled_v1", "true");
    localStorage.setItem("kbcSwarmBotLaboratoryLiveEnabled_v1", "true");
  });
  await page.addScriptTag({ content: readUserscript() });
  await page.waitForFunction(() => !!window.kbcSwarmBot?.laboratory?.captureLiveSnapshot, { timeout: 60000 });

  const result = await page.evaluate(async () => {
    const bot = window.kbcSwarmBot;
    const game = window.angular.element(document.body).injector().get("game");
    const before = {
      runHistoryLength: bot.getRunHistory().length,
      energy: String(game.unit("energy")?.count?.() || "0"),
      larva: String(game.unit("larva")?.count?.() || "0"),
      territory: String(game.unit("territory")?.count?.() || "0"),
    };

    const capture = await bot.laboratory.captureLiveSnapshot({ snapshotId: "LIVE-001" });
    if (!capture?.ok) throw new Error(capture?.error || "Live capture failed");

    const after = {
      runHistoryLength: bot.getRunHistory().length,
      energy: String(game.unit("energy")?.count?.() || "0"),
      larva: String(game.unit("larva")?.count?.() || "0"),
      territory: String(game.unit("territory")?.count?.() || "0"),
    };

    return {
      before,
      after,
      snapshot: capture.snapshot,
      proof: capture.nonMutationProof,
      liveState: capture.liveState,
      liveMarkdown: bot.laboratory.exportLiveSnapshotMarkdown(capture.snapshot),
      liveJson: bot.laboratory.exportLiveSnapshotJson(capture.snapshot),
      panelState: {
        liveEnabled: bot.laboratory.isLiveEnabled(),
        labEnabled: bot.laboratory.isEnabled(),
      },
    };
  });

  const snapshotJson = JSON.parse(result.liveJson);
  const checks = [];
  checks.push({ name: "live gate enabled", ok: result.panelState.liveEnabled === true });
  checks.push({ name: "laboratory gate enabled", ok: result.panelState.labEnabled === true });
  checks.push({ name: "snapshot capture mode", ok: result.snapshot?.source?.captureMode === "live-read-only" });
  checks.push({ name: "non-mutation proof", ok: !!result.proof?.unchanged });
  checks.push({ name: "run history unchanged", ok: result.before.runHistoryLength === result.after.runHistoryLength });
  checks.push({ name: "energy unchanged", ok: result.before.energy === result.after.energy });
  checks.push({ name: "larva unchanged", ok: result.before.larva === result.after.larva });
  checks.push({ name: "territory unchanged", ok: result.before.territory === result.after.territory });
  checks.push({ name: "markdown includes proof", ok: result.liveMarkdown.includes("## Live proof") });
  checks.push({ name: "json round-trip", ok: snapshotJson.snapshotId === result.snapshot.snapshotId && snapshotJson.snapshotHash === result.snapshot.snapshotHash });

  const failures = checks.filter((check) => !check.ok).map((check) => check.name);
  const summary = {
    version: "0.12.2",
    checks,
    failures,
    before: result.before,
    after: result.after,
    proof: result.proof,
    snapshot: result.snapshot,
    liveState: result.liveState,
    consoleRows,
  };

  writeText(evidenceJsonPath, JSON.stringify(summary, null, 2));
  writeText(evidenceMdPath, [
    "# SwarmSim Laboratory Live Verification",
    "",
    `- Version: \`0.12.2\``,
    `- Failures: ${failures.length ? failures.join(", ") : "none"}`,
    `- Snapshot hash: \`${result.snapshot.snapshotHash}\``,
    `- Non-mutation proof: \`${String(result.proof?.unchanged)}\``,
    `- Run history delta: \`${result.after.runHistoryLength - result.before.runHistoryLength}\``,
  ].join("\n"));
  writeText(liveSnapshotJsonPath, result.liveJson);
  writeText(liveSnapshotMdPath, result.liveMarkdown);

  await browser.close();

  if (failures.length) {
    console.error(`Live verification failed: ${failures.join(", ")}`);
    process.exit(1);
  }

  console.log("0.12.2 laboratory live verification passed.");
}

main().catch((error) => {
  console.error(error?.stack || error?.message || String(error));
  process.exit(1);
});
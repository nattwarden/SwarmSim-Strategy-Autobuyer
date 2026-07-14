const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const ROOT = path.resolve(__dirname, "..");
const DEFAULT_SAVE_PATH = path.join(ROOT, "docs", "test-data", "strategy-audit-0", "default-user-save", "save.txt");

async function main() {
  if (!fs.existsSync(DEFAULT_SAVE_PATH)) {
    throw new Error(`Default user save not found: ${DEFAULT_SAVE_PATH}`);
  }

  const save = fs.readFileSync(DEFAULT_SAVE_PATH, "utf8").trim();
  if (!save.startsWith("MS4xLjE3|")) {
    throw new Error("Default save has unexpected format (missing MS4xLjE3| prefix).");
  }

  const browser = await chromium.launch({ headless: true, channel: "chrome" });
  const page = await browser.newPage();
  await page.goto("https://www.swarmsim.com/", { waitUntil: "domcontentloaded", timeout: 120000 });
  await page.waitForTimeout(7000);

  const result = await page.evaluate((saveString) => {
    const injector = window.angular?.element(document.body)?.injector?.();
    const game = injector?.get?.("game");
    if (!game || typeof game.importSave !== "function") {
      return { ok: false, error: "game.importSave unavailable" };
    }

    try {
      game.importSave(saveString);
    } catch (error) {
      return { ok: false, error: String(error?.stack || error?.message || error) };
    }

    const unitNames = ["meat", "larva", "territory", "energy", "drone", "queen", "nest", "hatchery", "expansion", "nexus", "moth"];
    const units = {};
    for (const name of unitNames) {
      try {
        units[name] = String(game.unit(name)?.count?.() || "0");
      } catch {
        units[name] = "error";
      }
    }

    return { ok: true, units };
  }, save);

  console.log(JSON.stringify(result, null, 2));
  await browser.close();

  if (!result.ok) process.exit(1);
}

main().catch((error) => {
  console.error(error?.stack || error?.message || String(error));
  process.exit(1);
});

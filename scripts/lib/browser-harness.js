"use strict";

/**
 * Shared verify-chain browser harness (RH-4).
 *
 * Every verify-chain check used to copy-paste the same four lines:
 *   const browser = await chromium.launch({ headless: true, ... });
 *   const page = await browser.newPage();
 *   await page.goto("https://www.swarmsim.com/...", { ... });
 *   await page.addScriptTag({ content: userscript });
 * and its own fs.readFileSync of the canonical userscript. This module
 * centralizes exactly that mechanical setup/teardown so each check keeps its
 * own goto URL, page setup, evaluate(), and assertions untouched.
 *
 * Instance reuse: when `npm run verify` is driving the chain,
 * scripts/lib/run-verify-with-shared-browser.js has already started one
 * `chromium.launchServer()` per distinct launch-option signature seen across
 * the migrated checks (currently "default" and "chrome"-channel) and
 * published each server's websocket endpoint via an env var. getBrowser()
 * connects to that already-running instance instead of paying a fresh
 * process launch. When a script is run standalone (the env var is unset,
 * e.g. `node scripts/check-foo.js` directly), it falls back to launching a
 * private local browser exactly like the old boilerplate did.
 *
 * Every migrated check keeps its own `try { ... } finally { await
 * browser.close(); } ` shape unchanged. That is safe in both cases:
 * Playwright defines `browser.close()` on a browser obtained via
 * `browserType.connect()` as "disconnect and clear contexts created by this
 * connection", NOT "kill the remote browser server" - so a shared instance
 * survives one migrated check finishing and is ready for the next one in the
 * same `npm run verify` run.
 */

const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const ROOT = path.resolve(__dirname, "..", "..");
const USERSCRIPT_PATH = path.join(ROOT, "src", "SwarmSim-Strategy-Autobuyer.user.js");

let cachedUserscript = null;

/**
 * Reads the canonical userscript once per process and caches it. Multiple
 * checks calling this within the same `npm run verify` chain each get their
 * own process (npm runs each `npm run check:*` as a separate `node`
 * invocation), so this only dedupes the read within a single check's own
 * process (e.g. helper functions calling it more than once); it never
 * shares userscript content across checks, so no check's assertions can be
 * affected by another check's read.
 */
function readUserscript() {
  if (cachedUserscript === null) {
    cachedUserscript = fs.readFileSync(USERSCRIPT_PATH, "utf8");
  }
  return cachedUserscript;
}

/**
 * Builds the env var name a shared browser server for the given launch
 * options would be published under. Only `channel` distinguishes the launch
 * signatures actually used by the verify-chain scripts today; any other
 * launch option is treated as "does not match a known shared signature" and
 * falls back to a private launch (see getBrowser below), which is always
 * correct, just not shared.
 */
function envKeyFor(launchOptions) {
  const channel = launchOptions && launchOptions.channel ? String(launchOptions.channel) : "default";
  return `SWARMSIM_VERIFY_BROWSER_WS_ENDPOINT_${channel.toUpperCase()}`;
}

/**
 * Returns a Chromium Browser instance for the given launch options.
 *
 * - If a shared server matching these launch options is running (see
 *   run-verify-with-shared-browser.js), connects to it.
 * - Otherwise launches a fresh local browser with exactly these options,
 *   matching the previous per-script behavior.
 *
 * The caller owns the returned Browser exactly like it owned the result of
 * `chromium.launch(...)` before migration: create pages/contexts from it,
 * and call `browser.close()` in a `finally` block when done.
 */
async function getBrowser(launchOptions = { headless: true }) {
  const endpoint = process.env[envKeyFor(launchOptions)];
  if (endpoint) {
    return chromium.connect(endpoint);
  }
  return chromium.launch(launchOptions);
}

module.exports = {
  readUserscript,
  getBrowser,
  USERSCRIPT_PATH,
  ROOT,
};

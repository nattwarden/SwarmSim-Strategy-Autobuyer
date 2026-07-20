#!/usr/bin/env node
"use strict";

/**
 * Entry point for `npm run verify` (RH-4).
 *
 * Starts one `chromium.launchServer()` per distinct browser launch-option
 * signature used by the migrated verify-chain checks, publishes each
 * server's websocket endpoint via an env var, then runs the actual verify
 * chain (renamed to the `verify:chain` npm script, its command list is
 * byte-identical to the pre-RH-4 `verify` script) as a child process that
 * inherits those env vars.
 *
 * Migrated checks (scripts/lib/browser-harness.js's getBrowser()) detect the
 * env var and connect to the already-running instance instead of launching
 * their own, so `npm run verify` pays for at most a couple of Chromium
 * process launches instead of one per migrated check. Checks that are not
 * migrated, or that use a browser launch-option signature this wrapper does
 * not recognize, are unaffected: they keep launching (and closing) their own
 * browser exactly as before.
 *
 * If a server fails to start (e.g. no Chromium installed in this
 * environment), that signature is simply skipped with a warning - every
 * check that would have used it falls back to its own private launch, so
 * `npm run verify` degrades to the pre-RH-4 behavior for that subset instead
 * of failing outright.
 */

const { chromium } = require("playwright");
const { spawn } = require("child_process");

// The exact set of launch-option signatures used by the migrated
// verify-chain scripts today (see scripts/lib/browser-harness.js
// envKeyFor()). Adding a new signature here is opt-in and additive: any
// check using an unlisted signature simply keeps launching its own browser.
const SIGNATURES = [
  { name: "default", options: { headless: true } },
  { name: "chrome", options: { headless: true, channel: "chrome" } },
];

async function startServers() {
  const servers = [];
  const env = {};
  for (const signature of SIGNATURES) {
    try {
      const server = await chromium.launchServer(signature.options);
      servers.push(server);
      env[`SWARMSIM_VERIFY_BROWSER_WS_ENDPOINT_${signature.name.toUpperCase()}`] = server.wsEndpoint();
    } catch (error) {
      console.warn(
        `[run-verify-with-shared-browser] could not start a shared browser server for `
          + `launch signature "${signature.name}": ${error?.message || error}. Checks needing `
          + `this signature will fall back to their own per-script browser launch.`
      );
    }
  }
  return { servers, env };
}

async function closeServers(servers) {
  await Promise.allSettled(servers.map((server) => server.close()));
}

async function runChain(env) {
  // shell: true is required on Windows: npm resolves to npm.cmd, and Node's
  // spawn() cannot exec a .cmd file directly (EINVAL) without going through
  // a shell. Passing the whole command as a single string (rather than a
  // command + args array) avoids Node's DEP0190 warning about unescaped
  // array args under shell:true; there is still no injection risk since the
  // command is a fixed, hardcoded literal with no interpolated input.
  const child = spawn("npm run verify:chain", {
    stdio: "inherit",
    env: { ...process.env, ...env },
    shell: true,
  });

  return new Promise((resolve) => {
    child.on("exit", (code, signal) => {
      if (code !== null) {
        resolve(code);
      } else {
        console.error(`[run-verify-with-shared-browser] verify:chain terminated by signal ${signal}`);
        resolve(1);
      }
    });
    child.on("error", (error) => {
      console.error(`[run-verify-with-shared-browser] failed to spawn verify:chain: ${error?.message || error}`);
      resolve(1);
    });
  });
}

async function main() {
  const { servers, env } = await startServers();
  let exitCode = 1;
  try {
    exitCode = await runChain(env);
  } finally {
    await closeServers(servers);
  }
  process.exit(exitCode);
}

main().catch((error) => {
  console.error(error?.stack || error?.message || String(error));
  process.exit(1);
});

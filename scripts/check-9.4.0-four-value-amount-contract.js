#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const ROOT = path.resolve(__dirname, "..");
const USERSCRIPT_PATH = path.join(ROOT, "src", "SwarmSim-Strategy-Autobuyer.user.js");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function main() {
  let userscript = fs.readFileSync(USERSCRIPT_PATH, "utf8").replace(/\r\n/g, "\n");
  if (process.env.KBC_MUTATE_AMOUNT_CONTRACT_EQUALITY === "1") {
    const needle = "const contractSatisfied = command === authorized;";
    assert(userscript.includes(needle), "amount equality mutation needle missing");
    userscript = userscript.replace(needle, "const contractSatisfied = true;");
  }
  if (process.env.KBC_MUTATE_AMOUNT_CONFIRMATION === "1") {
    const needle = "confirmedPurchasedAmount = contract.commandRequestedAmount;";
    assert(userscript.includes(needle), "amount confirmation mutation needle missing");
    userscript = userscript.replace(needle, "confirmedPurchasedAmount = observedTotalCountDelta;");
  }

  const browser = await chromium.launch({ headless: true, channel: "chrome" });
  try {
    const page = await browser.newPage();
    await page.goto("https://www.swarmsim.com/", { waitUntil: "domcontentloaded", timeout: 120000 });
    await page.addScriptTag({ content: userscript });
    await page.waitForFunction(() => !!window.kbcSwarmBot?.executionAmountContract, { timeout: 120000 });

    const report = await page.evaluate(() => {
      const api = window.kbcSwarmBot.executionAmountContract;
      const equal = api.build({ authorizedRequestedAmount: "50", commandRequestedAmount: "50" });
      const mismatch = api.build({ authorizedRequestedAmount: "50", commandRequestedAmount: "100" });
      const lowProductionUnit = api.finalize(equal, {
        commandSucceeded: true,
        observedTotalCountDelta: "52",
        costBefore: { meat: "1000", larva: "2000" },
        costAfter: { meat: "700", larva: "1600" },
        executionKind: "unit",
      });
      const highProductionUnit = api.finalize(equal, {
        commandSucceeded: true,
        observedTotalCountDelta: "5000",
        costBefore: { meat: "1000", larva: "2000" },
        costAfter: { meat: "700", larva: "1600" },
        executionKind: "unit",
      });
      const upgrade = api.finalize(api.build({ authorizedRequestedAmount: "1", commandRequestedAmount: "1" }), {
        commandSucceeded: true,
        observedTotalCountDelta: "1",
        costBefore: { larva: "1000" },
        costAfter: { larva: "900" },
        executionKind: "upgrade",
      });
      const unconfirmedUnit = api.finalize(equal, {
        commandSucceeded: true,
        observedTotalCountDelta: "50",
        costBefore: { meat: "1000" },
        costAfter: { meat: "1000" },
        executionKind: "unit",
      });
      return { equal, mismatch, lowProductionUnit, highProductionUnit, upgrade, unconfirmedUnit };
    });

    assert(report.equal.schemaVersion === "execution-amount-contract.v1", "amount contract schema missing");
    assert(report.equal.authorizedRequestedAmount === "50", "authorized requested amount changed");
    assert(report.equal.commandRequestedAmount === "50", "command requested amount changed");
    assert(report.equal.contractSatisfied === true && report.equal.violation === null, "equal amounts did not satisfy the contract");
    assert(report.mismatch.contractSatisfied === false && report.mismatch.violation === "AMOUNT_CONTRACT_VIOLATION", "command mismatch was not rejected");
    assert(report.lowProductionUnit.confirmedPurchasedAmount === "50" && report.lowProductionUnit.observedTotalCountDelta === "52", "low-production unit values collapsed together");
    assert(report.highProductionUnit.confirmedPurchasedAmount === "50" && report.highProductionUnit.observedTotalCountDelta === "5000", "high-production unit count delta was misreported as purchased amount");
    assert(report.highProductionUnit.confirmationBasis === "authorized-command+success+cost-consumption", "unit confirmation basis is not explicit");
    assert(report.upgrade.confirmedPurchasedAmount === "1" && report.upgrade.confirmationBasis === "discrete-upgrade-count-delta", "upgrade count delta was not used as discrete confirmation");
    assert(report.unconfirmedUnit.confirmedPurchasedAmount === "0" && report.unconfirmedUnit.confirmationBasis === "unconfirmed-no-cost-consumption", "unit without cost evidence was reported as confirmed");
    console.log(JSON.stringify({ status: "PASS", ...report }, null, 2));
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error?.stack || error?.message || String(error));
  process.exit(1);
});

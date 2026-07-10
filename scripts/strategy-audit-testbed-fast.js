#!/usr/bin/env node
"use strict";

const { runMode } = require("./strategy-audit-testbed-core");

runMode("fast", process.argv.slice(2))
  .then((result) => {
    console.log("strategy:audit:fast completed");
    if (result.determinism) {
      console.log(`determinism stable: ${result.determinism.stable}`);
      if (!result.determinism.stable) {
        console.log(`first difference: ${result.determinism.firstDifference}`);
      }
    }
    process.exit(result.exitCode);
  })
  .catch((error) => {
    console.error(error?.stack || error?.message || String(error));
    process.exit(1);
  });

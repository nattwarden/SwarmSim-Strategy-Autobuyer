#!/usr/bin/env node
"use strict";

const { runMode } = require("./strategy-audit-testbed-core");

runMode("live", process.argv.slice(2))
  .then((result) => {
    console.log("strategy:audit:live completed");
    process.exit(result.exitCode);
  })
  .catch((error) => {
    console.error(error?.stack || error?.message || String(error));
    process.exit(1);
  });

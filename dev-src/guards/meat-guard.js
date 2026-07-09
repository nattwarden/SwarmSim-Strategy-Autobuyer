"use strict";

const { createLaneProposal } = require("../contracts/lane-proposal");

/**
 * Meat guard proposal stub.
 * Adapter wiring to current userscript is intentionally deferred.
 */
function proposeMeatAction() {
  return createLaneProposal({
    lane: "Meat",
    decision: "OBSERVE",
    title: "Meat guard",
    reason: "Scaffold only; runtime adapter not wired yet.",
    priority: 70,
  });
}

module.exports = {
  proposeMeatAction,
};

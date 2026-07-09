"use strict";

const { createLaneProposal } = require("../contracts/lane-proposal");

/**
 * Territory/army guard proposal stub.
 * Intended home for anti-starvation candidate selection.
 */
function proposeTerritoryAction() {
  return createLaneProposal({
    lane: "Territory",
    decision: "OBSERVE",
    title: "Territory guard",
    reason: "Scaffold only; runtime adapter not wired yet.",
    priority: 60,
    urgency: 0,
  });
}

module.exports = {
  proposeTerritoryAction,
};

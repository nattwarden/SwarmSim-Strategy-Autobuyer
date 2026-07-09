"use strict";

const { createLaneProposal } = require("../contracts/lane-proposal");

/**
 * Larva/engine guard proposal stub.
 * Keeps room for Hatchery/Expansion/Clone buffer hard blocker logic.
 */
function proposeLarvaAction() {
  return createLaneProposal({
    lane: "Engine",
    decision: "OBSERVE",
    title: "Larva guard",
    reason: "Scaffold only; runtime adapter not wired yet.",
    priority: 90,
  });
}

module.exports = {
  proposeLarvaAction,
};

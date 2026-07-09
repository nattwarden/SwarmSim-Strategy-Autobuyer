"use strict";

const { createLaneProposal } = require("../contracts/lane-proposal");

/**
 * Pick proposals in priority order while respecting max actions.
 * Hard blocker checks belong in lane adapters when wiring starts.
 * @param {Array<import("../contracts/lane-proposal").LaneProposal>} proposals
 * @param {number} maxActionsPerRun
 * @returns {Array<import("../contracts/lane-proposal").LaneProposal>}
 */
function selectLaneActions(proposals, maxActionsPerRun) {
  const limit = Number.isFinite(maxActionsPerRun) && maxActionsPerRun > 0
    ? Math.floor(maxActionsPerRun)
    : 1;

  return (proposals || [])
    .map((p) => createLaneProposal(p || {}))
    .filter((p) => p.decision === "BUY" || p.decision === "SIDE")
    .filter((p) => !(p.blockers || []).length)
    .sort((a, b) => {
      if (b.priority !== a.priority) return b.priority - a.priority;
      return b.urgency - a.urgency;
    })
    .slice(0, limit);
}

module.exports = {
  selectLaneActions,
};

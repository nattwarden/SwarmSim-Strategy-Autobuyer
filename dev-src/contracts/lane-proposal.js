"use strict";

/**
 * Lane proposal contract used by guard modules and the overseer.
 * This is a schema helper, not runtime validation.
 */

/**
 * @typedef {Object} LaneProposal
 * @property {"Meat"|"Engine"|"Territory"|"Energy"|"Clone"|"Ability"} lane
 * @property {"BUY"|"HOLD"|"OBSERVE"|"SIDE"} decision
 * @property {string} [title]
 * @property {string} [reason]
 * @property {number} [priority]
 * @property {number} [urgency]
 * @property {boolean} [canRunAsSideAction]
 * @property {string[]} [blockers]
 * @property {Object} [meta]
 */

/**
 * Create a normalized lane proposal object with conservative defaults.
 * @param {Partial<LaneProposal>} partial
 * @returns {LaneProposal}
 */
function createLaneProposal(partial) {
  return {
    lane: partial.lane || "Meat",
    decision: partial.decision || "OBSERVE",
    title: partial.title || "",
    reason: partial.reason || "",
    priority: Number.isFinite(partial.priority) ? partial.priority : 0,
    urgency: Number.isFinite(partial.urgency) ? partial.urgency : 0,
    canRunAsSideAction: !!partial.canRunAsSideAction,
    blockers: Array.isArray(partial.blockers) ? partial.blockers.slice() : [],
    meta: partial.meta && typeof partial.meta === "object" ? partial.meta : {},
  };
}

module.exports = {
  createLaneProposal,
};

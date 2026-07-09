// Phase 3 extraction: dedicated proposal adapter boundary for territory/army lane.
function buildTerritoryGuardProposal({ game, engine, protectedResources }) {
  return buildTerritoryPrepProposal(game, engine, protectedResources);
}

// Phase 3 extraction: dedicated execution adapter boundary for meat lane.
function executeMeatGuardAction({ game, commands, protectedResources }) {
  return handleMeatGoalPlanner(game, commands, protectedResources);
}

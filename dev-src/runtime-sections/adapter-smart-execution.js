// Phase 3 extraction: dedicated execution adapter boundary for engine lane.
function executeEngineGuardAction({ game, commands, engine }) {
  return handleLarvaEnginePriority(game, commands, engine);
}

// Phase 3 extraction: dedicated execution adapter boundary for energy lane.
function executeEnergyGuardAction({ game, commands, protectedResources }) {
  return handleEnergyStrategy(game, commands, protectedResources);
}

// Phase 3 extraction: dedicated execution adapter boundary for clone lane.
function executeCloneGuardAction({ game, commands }) {
  return runCloneBufferPlanner(game, commands);
}

// Phase 2 extraction: territory/army lane execution is handled through a
// dedicated adapter boundary so coordinator flow can call one stable function.
function executeTerritoryGuardAction({
  trigger,
  game,
  engine,
  commands,
  protectedResources,
  boughtCount,
  maxUnitActions,
  markSelectedLane,
  syncCoordinatorHold,
}) {
  const state = territoryPrepPlannerState || buildTerritoryGuardProposal({ game, engine, protectedResources });
  const proposal = state?.proposal;
  const territoryAge = getLaneActionAge("Territory");
  const starvationCount = getTerritoryStarvationCount();
  const threshold = Math.max(1, Number(config.territoryStarvationRunThreshold || DEFAULT_CONFIG.territoryStarvationRunThreshold));
  const shouldForce = territoryAge >= threshold || starvationCount >= threshold;

  recordLaneCoordinatorState({
    territoryActionAge: territoryAge,
    territoryStarvationCount: starvationCount,
  });

  if (!proposal) {
    syncCoordinatorHold(state?.territoryPrepReason || "no territory proposal this run");
    return { executed: false, bought: 0 };
  }

  if (boughtCount >= maxUnitActions) {
    syncCoordinatorHold(`not selected by coordinator: ${state.territoryPrepCandidate} stayed pending because main action slots were full`);
    return { executed: false, bought: 0 };
  }

  if (trigger !== "post-meat" && !shouldForce) {
    syncCoordinatorHold(`not selected by coordinator: territory starvation age ${territoryAge}/${threshold}`);
    return { executed: false, bought: 0 };
  }

  recordAdvisor("BUY", getDisplayName(proposal.unit), proposal.reason);
  addLaneCandidate({
    lane: "Territory",
    decision: "BUY",
    candidate: getDisplayName(proposal.unit),
    reason: proposal.reason,
    score: proposal.score,
    wouldBuyAmount: formatSwarmNumber(proposal.num),
    etaBefore: territoryPrepPlannerState?.territoryPrepExpansionEtaBefore || "n/a",
    etaAfter: territoryPrepPlannerState?.territoryPrepExpansionEtaAfter || "n/a",
    target: proposal.armySeed ? "House of Mirrors prep" : "Expansion",
    resource: "territory",
    raw: proposal.raw || null,
  });

  if (config.advisorOnly || !config.autoBuySafeDecisions) {
    markSelectedLane("Territory", getDisplayName(proposal.unit), proposal.reason, formatSwarmNumber(proposal.num));
    return { executed: true, bought: 1 };
  }

  const bought = safe(`Territory prep ${getDisplayName(proposal.unit)}`, () =>
    buyUnitAmount(commands, proposal.unit, proposal.num, proposal.armySeed ? "Army Seed" : "Territory Prep")
  );

  if (bought) {
    markSelectedLane("Territory", getDisplayName(proposal.unit), proposal.reason, formatSwarmNumber(proposal.num));
    recordTerritoryPrepPlannerState({
      ...territoryPrepPlannerState,
      territoryPrepDecision: "BUY",
      territoryPrepReason: proposal.reason,
    });
    return { executed: true, bought: 1 };
  }

  syncCoordinatorHold(`territory prep buy failed: ${getDisplayName(proposal.unit)}`);
  return { executed: false, bought: 0 };
}

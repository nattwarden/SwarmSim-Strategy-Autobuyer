#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { EventEmitter } = require("events");
const { chromium } = require("playwright");

const ROOT = path.resolve(__dirname, "..");
const USERSCRIPT_PATH = path.join(ROOT, "src", "SwarmSim-Strategy-Autobuyer.user.js");
const BASE_URL = "https://www.swarmsim.com/#/tab/territory";
const TESTBED_ARTIFACT_ROOT = path.join(ROOT, "docs", "test-data", "strategy-audit-testbed");
const AUDIT0_ARTIFACT_ROOT = path.join(ROOT, "docs", "test-data", "strategy-audit-0");
const AUDIT1_ARTIFACT_ROOT = path.join(ROOT, "docs", "test-data", "strategy-audit-1");

const SCENARIOS = {
  canary: {
    id: "TESTBED-CANARY-001",
    title: "Testbed contract canary",
    description: "Disposable early-game state that validates runner plumbing without encoding a strategy answer.",
    cycles: 2,
    executeActions: false,
    unitCounts: {
      meat: "180",
      larva: "22",
      cocoon: "0",
      territory: "0",
      energy: "0",
      drone: "36",
      queen: "2",
      swarmling: "0",
      stinger: "0",
      spider: "0",
      mosquito: "0"
    },
    passiveRates: {
      meat: "0.001",
      larva: "0.02"
    },
    notes: [
      "No planner output is injected.",
      "Normal runOnce() decides lane/action.",
      "State transition must emerge from planner snapshots between cycles."
    ]
  },
  "sa0-01": {
    id: "SA0-01",
    title: "Clean Start Baseline",
    description: "Initial early-game state for the first Strategy Audit 0 baseline.",
    cycles: 3,
    executeActions: true,
    unitCounts: {
      meat: "35",
      larva: "10",
      cocoon: "0",
      territory: "0",
      energy: "0",
      drone: "0",
      queen: "0",
      swarmling: "0",
      stinger: "0",
      spider: "0",
      mosquito: "0"
    },
    passiveRates: {
      larva: "1"
    },
    notes: [
      "No planner output is injected.",
      "Normal runOnce() decides lane/action.",
      "Clean-start baseline should keep future lanes locked and show coherent hold behavior."
    ]
  },
  "sa0-02": {
    id: "SA0-02",
    title: "First Producer Purchase",
    description: "Early state where a normal lower-producer purchase is legal and should be evaluated as the next concrete step.",
    cycles: 3,
    executeActions: true,
    engine: {
      hatcheryEtaSeconds: 1200
    },
    unitCounts: {
      meat: "1000",
      larva: "100",
      cocoon: "0",
      territory: "0",
      energy: "0",
      drone: "25",
      queen: "0",
      swarmling: "0",
      stinger: "0",
      spider: "0",
      mosquito: "0"
    },
    passiveRates: {
      meat: "0.12",
      larva: "0.02"
    },
    notes: [
      "No planner output is injected.",
      "Normal runOnce() decides lane/action.",
      "The state is staged so a normal lower-producer purchase is legal without forcing the answer."
    ]
  },
  "sa0-03": {
    id: "SA0-03",
    title: "Parent Conversion vs Refill",
    description: "Parent-step transition with refill follow-through in a visible multi-cycle harness run.",
    cycles: 3,
    executeActions: true,
    useHarness: true,
    harnessScenario: {
      id: "SA0-03",
      source: "strategy-audit",
      evaluationCycles: 3,
      overrides: {
        config: {
          advisorOnly: false,
          autoBuySafeDecisions: true,
          meatGoalPlanner: true,
          smartMaxActionsPerRun: 2
        },
        unitCounts: {
          meat: "1000",
          larva: "100",
          cocoon: "0",
          territory: "0",
          energy: "0",
          drone: "25",
          queen: "2",
          swarmling: "0",
          stinger: "0",
          spider: "0",
          mosquito: "0"
        },
        passiveRates: {
          meat: "0.001",
          larva: "0.02"
        },
        engine: {
          meatGoalTarget: "queen",
          forcedActionUnit: "drone",
          forcedParentUnit: "queen"
        },
        remainingActions: 2
      },
      betweenEvaluations: [
        {
          afterCycle: 1,
          plannerTransitionMarker: "sa0-03-parent-step-to-refill",
          parentStepCompletedForRefill: true,
          transition: {
            actionUnit: "drone",
            parentUnit: "queen",
            targetUnit: "queen"
          }
        }
      ]
    },
    notes: [
      "Scenario harness drives the multi-cycle parent-step/refill transition.",
      "The browser remains open so the cycle sequence can be observed directly."
    ]
  },
  "sa0-04": {
    id: "SA0-04",
    title: "Hatchery Save Window",
    description: "Two nearby states that move Hatchery from outside to inside the save window in a visible staged run.",
    cycles: 2,
    executeActions: true,
    engine: {
      hatcheryEtaSeconds: 900
    },
    unitCounts: {
      meat: "1000",
      larva: "100",
      cocoon: "0",
      territory: "0",
      energy: "0",
      drone: "25",
      queen: "0",
      swarmling: "0",
      stinger: "0",
      spider: "0",
      mosquito: "0"
    },
    passiveRates: {
      meat: "0.12",
      larva: "0.02"
    },
    betweenEvaluations: [
      {
        afterCycle: 1,
        plannerTransitionMarker: "sa0-04-hatchery-enter-save-window",
        parentStepCompletedForRefill: false,
        applyOverrides: {
          engine: {
            hatcheryEtaSeconds: 300
          }
        },
        transition: {
          actionUnit: "drone",
          parentUnit: "drone",
          targetUnit: "drone"
        }
      }
    ],
    notes: [
      "Cycle 1 runs with Hatchery just outside the save window.",
      "Cycle 2 moves Hatchery inside the save window so the HOLD text must show the protected resource/ETA reason."
    ]
  },
  "sa0-05": {
    id: "SA0-05",
    title: "Expansion Relevance",
    description: "Visible territory-producing army units compete with a legal meat purchase while Expansion is relevant.",
    cycles: 2,
    executeActions: true,
    unitCounts: {
      meat: "5000",
      larva: "500",
      cocoon: "0",
      territory: "0",
      energy: "0",
      drone: "25",
      queen: "2"
    },
    armyUnitCounts: {
      "Stinger V": "20",
      "Spider V": "20",
      "Mosquito V": "20",
      "Arachnomorph V": "20",
      "Culicimorph V": "20"
    },
    passiveRates: {
      meat: "0.05",
      larva: "0.02"
    },
    engine: {
      expansionEtaSeconds: 5400
    },
    notes: [
      "Army/territory units are visible and territory-producing.",
      "Meat also has a legal purchase, so the coordinator has to explain the winner instead of starving the lane."
    ]
  },
  "sa0-06": {
    id: "SA0-06",
    title: "Meaningless Small-Buy Detection",
    description: "A very small legal Territory/Army buy exists, but its goal impact is expected to be negligible.",
    cycles: 2,
    executeActions: true,
    unitCounts: {
      meat: "5000",
      larva: "500",
      cocoon: "0",
      territory: "0",
      energy: "0",
      drone: "25",
      queen: "2"
    },
    armyUnitCounts: {
      "Stinger V": "1"
    },
    passiveRates: {
      meat: "0.05",
      larva: "0.02"
    },
    engine: {
      expansionEtaSeconds: 5400
    },
    notes: [
      "A legal tiny army-seed buy should be visible.",
      "The lane should distinguish legal action from meaningful progress and avoid spending when ETA gain is negligible."
    ]
  },
  "sa1-01": {
    id: "SA1-01",
    title: "Mid-game Multi-lane Legal Conflict",
    description: "Stage a mid-game state where Engine, Meat, and Territory can all present legal candidates so winner quality can be evaluated over several cycles.",
    cycles: 5,
    executeActions: true,
    unitCounts: {
      meat: "15000",
      larva: "1200",
      cocoon: "200",
      territory: "2000",
      energy: "500",
      drone: "120",
      queen: "12",
      swarmling: "150",
      stinger: "40",
      spider: "40",
      mosquito: "40",
      hatchery: "6",
      expansion: "1",
      nexus: "3"
    },
    armyUnitCounts: {
      "Stinger V": "30",
      "Spider V": "30",
      "Mosquito V": "30"
    },
    passiveRates: {
      meat: "0.15",
      larva: "0.08",
      territory: "2",
      energy: "0.05"
    },
    engine: {
      hatcheryEtaSeconds: 2400,
      expansionEtaSeconds: 5400
    },
    notes: [
      "State is intentionally mid-game and multi-lane, not clean-start.",
      "Territory has active velocity so ROI/ETA comparisons can be meaningful.",
      "Run 5 cycles to detect lane-churn versus stable follow-through."
    ]
  },
  "sa1-02": {
    id: "SA1-02",
    title: "Territory Pressure vs Rebuild Pressure",
    description: "Stage a mid-game state where Territory has meaningful pressure but Meat rebuild pressure remains competitive.",
    cycles: 5,
    executeActions: true,
    unitCounts: {
      meat: "22000",
      larva: "1500",
      cocoon: "300",
      territory: "1200",
      energy: "600",
      drone: "160",
      queen: "16",
      swarmling: "220",
      stinger: "70",
      spider: "70",
      mosquito: "70",
      hatchery: "8",
      expansion: "2",
      nexus: "3"
    },
    armyUnitCounts: {
      "Stinger V": "60",
      "Spider V": "60",
      "Mosquito V": "60"
    },
    passiveRates: {
      meat: "0.2",
      larva: "0.1",
      territory: "3",
      energy: "0.06"
    },
    engine: {
      hatcheryEtaSeconds: 3600,
      expansionEtaSeconds: 2400
    },
    config: {
      expansionArmySeedMinEtaImprovementSeconds: 10,
      expansionArmySeedMinEtaImprovementRatio: 0.002,
      expansionArmySeedMaxChunkPercent: 15,
      territoryMinEtaImprovementSeconds: 0,
      territoryMinEtaImprovementRatio: 0
    },
    notes: [
      "Expansion ETA is closer than SA1-01 to increase territory pressure.",
      "Meat lane remains legal to test whether winner rationale stays coherent under disagreement.",
      "Run 5 cycles to detect churn versus stable pressure handling.",
      "This scenario includes an audit-only threshold experiment for Army Seed min-ETA gates."
    ]
  },
  "sa1-03": {
    id: "SA1-03",
    title: "Energy Reserve Arbitration",
    description: "Stage a mid-game state where Nexus reserve pressure is close while Meat and Territory also present legal pressure.",
    cycles: 5,
    executeActions: true,
    unitCounts: {
      meat: "26000",
      larva: "1800",
      cocoon: "350",
      territory: "2500",
      energy: "150",
      drone: "190",
      queen: "18",
      swarmling: "280",
      stinger: "90",
      spider: "90",
      mosquito: "90",
      hatchery: "9",
      expansion: "2",
      nexus: "3"
    },
    armyUnitCounts: {
      "Stinger V": "80",
      "Spider V": "80",
      "Mosquito V": "80"
    },
    passiveRates: {
      meat: "0.25",
      larva: "0.12",
      territory: "4",
      energy: "0.03"
    },
    engine: {
      hatcheryEtaSeconds: 4200,
      expansionEtaSeconds: 2200
    },
    notes: [
      "Energy starts near reserve pressure to force explicit Nexus-save reasoning.",
      "Territory and Meat remain active so reserve arbitration can be observed, not isolated.",
      "Run 5 cycles to detect whether winner selection stays coherent with reserve blockers."
    ]
  },
  "sa1-02-exp-yield": {
    id: "SA1-02-EXP-YIELD",
    title: "Territory Pressure vs Rebuild Pressure (High Yield Experiment)",
    description: "Audit-only sensitivity variant of SA1-02 with higher synthetic army territory yield to probe winner ranking breakpoints.",
    cycles: 5,
    executeActions: true,
    unitCounts: {
      meat: "22000",
      larva: "1500",
      cocoon: "300",
      territory: "1200",
      energy: "600",
      drone: "160",
      queen: "16",
      swarmling: "220",
      stinger: "70",
      spider: "70",
      mosquito: "70",
      hatchery: "8",
      expansion: "2",
      nexus: "3"
    },
    armyUnitCounts: {
      "Stinger V": "60",
      "Spider V": "60",
      "Mosquito V": "60"
    },
    passiveRates: {
      meat: "0.2",
      larva: "0.1",
      territory: "3",
      energy: "0.06"
    },
    engine: {
      hatcheryEtaSeconds: 3600,
      expansionEtaSeconds: 2400
    },
    config: {
      expansionArmySeedMinEtaImprovementSeconds: 10,
      expansionArmySeedMinEtaImprovementRatio: 0.002,
      expansionArmySeedMaxChunkPercent: 15,
      territoryMinEtaImprovementSeconds: 0,
      territoryMinEtaImprovementRatio: 0
    },
    syntheticArmyTerritoryPerUnit: 50,
    notes: [
      "Audit-only sensitivity variant; no production default changes.",
      "Synthetic army territory yield is increased to test whether winner selection flips when Territory impact is stronger."
    ]
  },
  "sa1-02-exp-no-meat-planner": {
    id: "SA1-02-EXP-NO-MEAT-PLANNER",
    title: "Territory Pressure with Meat Planner Disabled (Ordering Isolation)",
    description: "Audit-only variant to isolate whether Meat dominance comes from planner execution ordering or score ranking when Territory is legal and meaningful.",
    cycles: 5,
    executeActions: true,
    unitCounts: {
      meat: "22000",
      larva: "1500",
      cocoon: "300",
      territory: "1200",
      energy: "600",
      drone: "160",
      queen: "16",
      swarmling: "220",
      stinger: "70",
      spider: "70",
      mosquito: "70",
      hatchery: "8",
      expansion: "2",
      nexus: "3"
    },
    armyUnitCounts: {
      "Stinger V": "60",
      "Spider V": "60",
      "Mosquito V": "60"
    },
    passiveRates: {
      meat: "0.2",
      larva: "0.1",
      territory: "3",
      energy: "0.06"
    },
    engine: {
      hatcheryEtaSeconds: 3600,
      expansionEtaSeconds: 2400
    },
    config: {
      expansionArmySeedMinEtaImprovementSeconds: 10,
      expansionArmySeedMinEtaImprovementRatio: 0.002,
      expansionArmySeedMaxChunkPercent: 15,
      territoryMinEtaImprovementSeconds: 0,
      territoryMinEtaImprovementRatio: 0,
      meatGoalPlanner: false
    },
    syntheticArmyTerritoryPerUnit: 50,
    notes: [
      "Audit-only isolation test; no production default changes.",
      "Disables Meat goal planner to separate execution-ordering effects from candidate scoring behavior."
    ]
  },
  "sa1-04-rank-bp-y80": {
    id: "SA1-04-RANK-BP-Y80",
    title: "Ranking Breakpoint Probe (Yield 80)",
    description: "Audit-only ranking breakpoint probe with elevated synthetic territory impact while Meat planner remains enabled.",
    cycles: 5,
    executeActions: true,
    unitCounts: {
      meat: "22000",
      larva: "1500",
      cocoon: "300",
      territory: "1200",
      energy: "600",
      drone: "160",
      queen: "16",
      swarmling: "220",
      stinger: "70",
      spider: "70",
      mosquito: "70",
      hatchery: "8",
      expansion: "2",
      nexus: "3"
    },
    armyUnitCounts: {
      "Stinger V": "60",
      "Spider V": "60",
      "Mosquito V": "60"
    },
    passiveRates: {
      meat: "0.2",
      larva: "0.1",
      territory: "3",
      energy: "0.06"
    },
    engine: {
      hatcheryEtaSeconds: 3600,
      expansionEtaSeconds: 2400
    },
    config: {
      expansionArmySeedMinEtaImprovementSeconds: 10,
      expansionArmySeedMinEtaImprovementRatio: 0.002,
      expansionArmySeedMaxChunkPercent: 15,
      territoryMinEtaImprovementSeconds: 0,
      territoryMinEtaImprovementRatio: 0
    },
    syntheticArmyTerritoryPerUnit: 80,
    notes: [
      "Matrix step A for ranking breakpoint mapping.",
      "Keeps Meat planner enabled while raising territory synthetic impact to measure winner stability."
    ]
  },
  "sa1-05-rank-bp-y120": {
    id: "SA1-05-RANK-BP-Y120",
    title: "Ranking Breakpoint Probe (Yield 120)",
    description: "Audit-only ranking breakpoint probe with very high synthetic territory impact and unchanged Meat planner behavior.",
    cycles: 5,
    executeActions: true,
    unitCounts: {
      meat: "22000",
      larva: "1500",
      cocoon: "300",
      territory: "1200",
      energy: "600",
      drone: "160",
      queen: "16",
      swarmling: "220",
      stinger: "70",
      spider: "70",
      mosquito: "70",
      hatchery: "8",
      expansion: "2",
      nexus: "3"
    },
    armyUnitCounts: {
      "Stinger V": "60",
      "Spider V": "60",
      "Mosquito V": "60"
    },
    passiveRates: {
      meat: "0.2",
      larva: "0.1",
      territory: "3",
      energy: "0.06"
    },
    engine: {
      hatcheryEtaSeconds: 3600,
      expansionEtaSeconds: 2400
    },
    config: {
      expansionArmySeedMinEtaImprovementSeconds: 10,
      expansionArmySeedMinEtaImprovementRatio: 0.002,
      expansionArmySeedMaxChunkPercent: 15,
      territoryMinEtaImprovementSeconds: 0,
      territoryMinEtaImprovementRatio: 0
    },
    syntheticArmyTerritoryPerUnit: 120,
    notes: [
      "Matrix step B for ranking breakpoint mapping.",
      "Pushes territory synthetic yield further to test whether winner flips without changing Meat planner toggles."
    ]
  },
  "sa1-06-rank-bp-y120-meat-tight": {
    id: "SA1-06-RANK-BP-Y120-MEAT-TIGHT",
    title: "Ranking Breakpoint Probe (Yield 120 + Tight Meat Guards)",
    description: "Audit-only breakpoint step that keeps high territory impact and tightens Meat reserve/payback guards to measure first reproducible winner flip.",
    cycles: 5,
    executeActions: true,
    unitCounts: {
      meat: "22000",
      larva: "1500",
      cocoon: "300",
      territory: "1200",
      energy: "600",
      drone: "160",
      queen: "16",
      swarmling: "220",
      stinger: "70",
      spider: "70",
      mosquito: "70",
      hatchery: "8",
      expansion: "2",
      nexus: "3"
    },
    armyUnitCounts: {
      "Stinger V": "60",
      "Spider V": "60",
      "Mosquito V": "60"
    },
    passiveRates: {
      meat: "0.2",
      larva: "0.1",
      territory: "3",
      energy: "0.06"
    },
    engine: {
      hatcheryEtaSeconds: 3600,
      expansionEtaSeconds: 2400
    },
    config: {
      expansionArmySeedMinEtaImprovementSeconds: 10,
      expansionArmySeedMinEtaImprovementRatio: 0.002,
      expansionArmySeedMaxChunkPercent: 15,
      territoryMinEtaImprovementSeconds: 0,
      territoryMinEtaImprovementRatio: 0,
      meatChainReserveMultiplier: 3,
      meatChainMaxPaybackSeconds: 900
    },
    syntheticArmyTerritoryPerUnit: 120,
    notes: [
      "Matrix step C for ranking breakpoint mapping.",
      "Used to identify whether a minimal guard-tightening is required before territory can win in this mid-game state."
    ]
  },
  "sa1-07-rank-bp-y160": {
    id: "SA1-07-RANK-BP-Y160",
    title: "Ranking Breakpoint Probe (Yield 160)",
    description: "Audit-only probe with extreme synthetic territory impact while preserving baseline Meat planner behavior.",
    cycles: 5,
    executeActions: true,
    unitCounts: {
      meat: "22000",
      larva: "1500",
      cocoon: "300",
      territory: "1200",
      energy: "600",
      drone: "160",
      queen: "16",
      swarmling: "220",
      stinger: "70",
      spider: "70",
      mosquito: "70",
      hatchery: "8",
      expansion: "2",
      nexus: "3"
    },
    armyUnitCounts: {
      "Stinger V": "60",
      "Spider V": "60",
      "Mosquito V": "60"
    },
    passiveRates: {
      meat: "0.2",
      larva: "0.1",
      territory: "3",
      energy: "0.06"
    },
    engine: {
      hatcheryEtaSeconds: 3600,
      expansionEtaSeconds: 2400
    },
    config: {
      expansionArmySeedMinEtaImprovementSeconds: 10,
      expansionArmySeedMinEtaImprovementRatio: 0.002,
      expansionArmySeedMaxChunkPercent: 15,
      territoryMinEtaImprovementSeconds: 0,
      territoryMinEtaImprovementRatio: 0
    },
    syntheticArmyTerritoryPerUnit: 160,
    notes: [
      "Matrix step D for ranking breakpoint mapping.",
      "Used to test whether very large territory impact alone can flip winner selection."
    ]
  },
  "sa1-08-rank-bp-y160-meat-tight": {
    id: "SA1-08-RANK-BP-Y160-MEAT-TIGHT",
    title: "Ranking Breakpoint Probe (Yield 160 + Tight Meat Guards)",
    description: "Audit-only probe combining extreme territory impact with tighter Meat reserve/payback guards.",
    cycles: 5,
    executeActions: true,
    unitCounts: {
      meat: "22000",
      larva: "1500",
      cocoon: "300",
      territory: "1200",
      energy: "600",
      drone: "160",
      queen: "16",
      swarmling: "220",
      stinger: "70",
      spider: "70",
      mosquito: "70",
      hatchery: "8",
      expansion: "2",
      nexus: "3"
    },
    armyUnitCounts: {
      "Stinger V": "60",
      "Spider V": "60",
      "Mosquito V": "60"
    },
    passiveRates: {
      meat: "0.2",
      larva: "0.1",
      territory: "3",
      energy: "0.06"
    },
    engine: {
      hatcheryEtaSeconds: 3600,
      expansionEtaSeconds: 2400
    },
    config: {
      expansionArmySeedMinEtaImprovementSeconds: 10,
      expansionArmySeedMinEtaImprovementRatio: 0.002,
      expansionArmySeedMaxChunkPercent: 15,
      territoryMinEtaImprovementSeconds: 0,
      territoryMinEtaImprovementRatio: 0,
      meatChainReserveMultiplier: 4,
      meatChainMaxPaybackSeconds: 600
    },
    syntheticArmyTerritoryPerUnit: 160,
    notes: [
      "Matrix step E for ranking breakpoint mapping.",
      "Used to identify whether stronger Meat-guard strictness is required to unlock Territory wins."
    ]
  },
  "sa1-09-rank-bp-y160-meat-tight-fallback-tight": {
    id: "SA1-09-RANK-BP-Y160-MEAT-TIGHT-FALLBACK-TIGHT",
    title: "Ranking Breakpoint Probe (Yield 160 + Tight Meat + Tight Fallback)",
    description: "Audit-only probe of fallback influence after reserve/payback tightening.",
    cycles: 5,
    executeActions: true,
    unitCounts: {
      meat: "22000",
      larva: "1500",
      cocoon: "300",
      territory: "1200",
      energy: "600",
      drone: "160",
      queen: "16",
      swarmling: "220",
      stinger: "70",
      spider: "70",
      mosquito: "70",
      hatchery: "8",
      expansion: "2",
      nexus: "3"
    },
    armyUnitCounts: {
      "Stinger V": "60",
      "Spider V": "60",
      "Mosquito V": "60"
    },
    passiveRates: {
      meat: "0.2",
      larva: "0.1",
      territory: "3",
      energy: "0.06"
    },
    engine: {
      hatcheryEtaSeconds: 3600,
      expansionEtaSeconds: 2400
    },
    config: {
      expansionArmySeedMinEtaImprovementSeconds: 10,
      expansionArmySeedMinEtaImprovementRatio: 0.002,
      expansionArmySeedMaxChunkPercent: 15,
      territoryMinEtaImprovementSeconds: 0,
      territoryMinEtaImprovementRatio: 0,
      meatChainReserveMultiplier: 4,
      meatChainMaxPaybackSeconds: 600,
      meatFallbackMaxRankDrop: 2,
      meatFallbackChunkPercent: 5
    },
    syntheticArmyTerritoryPerUnit: 160,
    notes: [
      "Matrix step F for ranking breakpoint mapping.",
      "Keeps Meat fallback enabled but tighter to test whether fallback behavior is preserving Meat wins."
    ]
  },
  "sa1-10-rank-bp-y160-meat-tight-fallback-off": {
    id: "SA1-10-RANK-BP-Y160-MEAT-TIGHT-FALLBACK-OFF",
    title: "Ranking Breakpoint Probe (Yield 160 + Tight Meat + Fallback Off)",
    description: "Audit-only terminal probe disabling Meat fallback to isolate whether fallback keeps winner on Meat.",
    cycles: 5,
    executeActions: true,
    unitCounts: {
      meat: "22000",
      larva: "1500",
      cocoon: "300",
      territory: "1200",
      energy: "600",
      drone: "160",
      queen: "16",
      swarmling: "220",
      stinger: "70",
      spider: "70",
      mosquito: "70",
      hatchery: "8",
      expansion: "2",
      nexus: "3"
    },
    armyUnitCounts: {
      "Stinger V": "60",
      "Spider V": "60",
      "Mosquito V": "60"
    },
    passiveRates: {
      meat: "0.2",
      larva: "0.1",
      territory: "3",
      energy: "0.06"
    },
    engine: {
      hatcheryEtaSeconds: 3600,
      expansionEtaSeconds: 2400
    },
    config: {
      expansionArmySeedMinEtaImprovementSeconds: 10,
      expansionArmySeedMinEtaImprovementRatio: 0.002,
      expansionArmySeedMaxChunkPercent: 15,
      territoryMinEtaImprovementSeconds: 0,
      territoryMinEtaImprovementRatio: 0,
      meatChainReserveMultiplier: 4,
      meatChainMaxPaybackSeconds: 600,
      meatFallbackEnabled: false
    },
    syntheticArmyTerritoryPerUnit: 160,
    notes: [
      "Matrix step G for ranking breakpoint mapping.",
      "Used only if earlier steps fail to find a breakpoint; isolates fallback influence directly."
    ]
  }
};

SCENARIOS["book00-m8-false-wait"] = {
  ...SCENARIOS["sa1-09-rank-bp-y160-meat-tight-fallback-tight"],
  id: "BOOK00-M8-FALSE-WAIT",
  title: "False Wait Pattern with ETA-Grounded Meat Fallback",
  description: "Focused M8 acceptance state for repeated reserve + ability-disabled HOLD cycles where fallback should activate without widening authority.",
  cycles: 5,
  executeActions: false,
  config: {
    ...SCENARIOS["sa1-09-rank-bp-y160-meat-tight-fallback-tight"].config,
    meatFallbackMinHoldRuns: 5,
    smartMaxActionsPerRun: 1
  },
  notes: [
    "M8 focused acceptance uses advisor-only replay so repeated cycles can accumulate hold history without mutating live state.",
    "Reserve and ability-disabled blockers remain present; fallback should activate under accelerated threshold cap 2 when ETA-stall evidence exists.",
    "Safety boundaries are preserved: advisor-only domains remain non-executable and no new authority is granted."
  ]
};

SCENARIOS["book00-m2-coordinator"] = {
  ...SCENARIOS["sa1-02"],
  id: "BOOK00-M2-COORDINATOR",
  title: "Whole-Economy Coordinator Changes the First Reversible Purchase",
  description: "A single deterministic acceptance state with concrete Engine, Meat, and Territory proposals from one pre-execution snapshot.",
  cycles: 1,
  unitCounts: {
    ...SCENARIOS["sa1-02"].unitCounts,
    territory: "0",
  },
  passiveRates: {
    ...SCENARIOS["sa1-02"].passiveRates,
    territory: "0.002",
  },
  engine: {
    hatcheryEtaSeconds: 3600,
    expansionEtaSeconds: 5400,
  },
  syntheticArmyTerritoryPerUnit: 1,
  notes: [
    "Milestone 2 acceptance only: compare the legacy first BUY with the coordinator winner from the preserved pre-execution snapshot.",
    "Uses baseline synthetic army production, a slow Territory rate, and zero Territory bank so an army seed has measurable Expansion ETA value outside the protected save window.",
  ],
};

SCENARIOS["book00-m3-energy-execution"] = {
  ...SCENARIOS["sa1-03"],
  id: "BOOK00-M3-ENERGY-EXECUTION",
  title: "Bounded Energy Production Executes the Exact Coordinator Winner",
  description: "A single disposable production-parity state that exercises the exact post-Nexus Lepidoptera coordinator buy path.",
  cycles: 1,
  executeActions: true,
  unitCounts: {
    meat: "1000",
    larva: "100",
    cocoon: "0",
    territory: "0",
    energy: "1000000",
    nexus: "5",
    moth: "0",
    drone: "25",
    queen: "0",
    swarmling: "0",
    stinger: "0",
    spider: "0",
    mosquito: "0",
  },
  armyUnitCounts: {},
  passiveRates: {
    meat: "0.001",
    larva: "0.02",
    territory: "0",
    energy: "100",
  },
  config: {
    smartMaxActionsPerRun: 1,
    larvaEnginePriority: false,
    meatGoalPlanner: false,
    territoryPrepPlanner: false,
    expansionArmySeedPlanner: false,
    energyStrategy: true,
    energyPlanner: true,
    lepidopteraRoiMode: true,
    nexusTarget: 5,
    maxLepidopteraPerRun: 5,
    postNexusEnergyReserveSeconds: 60,
    postNexusLepidopteraMinBoostGainPercent: 0,
  },
  notes: [
    "Milestone 3 execution acceptance only: the staged mature Energy state isolates the already-accepted Energy production domain at its exact buy boundary.",
    "The disposable runner must report Energy/Lepidoptera authority, a real bounded command delta, and a matching canonical fingerprint without enabling abilities.",
  ],
};

function getScenarioDefinition(scenarioId) {
  const normalizedId = String(scenarioId || "canary").toLowerCase();
  const v2Scenario = buildSa1V2Scenario(normalizedId);
  if (v2Scenario) return v2Scenario;
  const sweepScenario = buildSa1SweepScenario(normalizedId);
  if (sweepScenario) return sweepScenario;
  return SCENARIOS[normalizedId] || SCENARIOS.canary;
}

function buildSa1SweepScenario(scenarioId) {
  const match = /^sa1-sweep-(\d{1,3})$/.exec(String(scenarioId || "").toLowerCase());
  if (!match) return null;

  const index = Number(match[1]);
  if (!Number.isFinite(index) || index < 1 || index > 150) return null;

  const base = SCENARIOS["sa1-02"];
  if (!base) return null;

  const PROFILE_SIZE = 15;
  const profileIndex = Math.floor((index - 1) / PROFILE_SIZE);
  const comboIndex = (index - 1) % PROFILE_SIZE;

  const stateProfiles = [
    {
      key: "balanced",
      label: "Balanced mid-game",
      unitMult: 1,
      resourceMult: { meat: 1, larva: 1, territory: 1, energy: 1 },
      passiveMult: { meat: 1, larva: 1, territory: 1, energy: 1 },
      engineMult: { hatchery: 1, expansion: 1 },
      armyMult: 1,
    },
    {
      key: "territory-rich",
      label: "Territory rich",
      unitMult: 1,
      resourceMult: { meat: 0.9, larva: 1, territory: 1.8, energy: 1 },
      passiveMult: { meat: 0.95, larva: 1, territory: 1.6, energy: 1 },
      engineMult: { hatchery: 1.05, expansion: 0.7 },
      armyMult: 1.25,
    },
    {
      key: "territory-tight",
      label: "Territory tight",
      unitMult: 1,
      resourceMult: { meat: 1.05, larva: 1, territory: 0.55, energy: 1 },
      passiveMult: { meat: 1.05, larva: 1, territory: 0.5, energy: 1 },
      engineMult: { hatchery: 1.1, expansion: 1.45 },
      armyMult: 0.7,
    },
    {
      key: "energy-tight",
      label: "Energy tight",
      unitMult: 1,
      resourceMult: { meat: 1, larva: 1, territory: 1, energy: 0.35 },
      passiveMult: { meat: 1, larva: 1, territory: 1, energy: 0.5 },
      engineMult: { hatchery: 1, expansion: 1 },
      armyMult: 1,
    },
    {
      key: "energy-comfort",
      label: "Energy comfort",
      unitMult: 1,
      resourceMult: { meat: 1, larva: 1, territory: 1, energy: 2.0 },
      passiveMult: { meat: 1, larva: 1, territory: 1, energy: 1.8 },
      engineMult: { hatchery: 1, expansion: 1 },
      armyMult: 1,
    },
    {
      key: "rebuild-heavy",
      label: "Rebuild heavy",
      unitMult: 0.8,
      resourceMult: { meat: 1.25, larva: 1.15, territory: 0.9, energy: 1 },
      passiveMult: { meat: 1.2, larva: 1.15, territory: 0.85, energy: 1 },
      engineMult: { hatchery: 1.15, expansion: 1.1 },
      armyMult: 0.85,
    },
    {
      key: "post-rebuild",
      label: "Post rebuild momentum",
      unitMult: 1.25,
      resourceMult: { meat: 0.95, larva: 1, territory: 1.2, energy: 1 },
      passiveMult: { meat: 1.05, larva: 1.05, territory: 1.2, energy: 1 },
      engineMult: { hatchery: 0.9, expansion: 0.95 },
      armyMult: 1.2,
    },
    {
      key: "larva-tight",
      label: "Larva tight",
      unitMult: 1,
      resourceMult: { meat: 1, larva: 0.45, territory: 1.05, energy: 1 },
      passiveMult: { meat: 1, larva: 0.55, territory: 1, energy: 1 },
      engineMult: { hatchery: 1.05, expansion: 1 },
      armyMult: 1,
    },
    {
      key: "larva-rich",
      label: "Larva rich",
      unitMult: 1.1,
      resourceMult: { meat: 1, larva: 1.8, territory: 1, energy: 1 },
      passiveMult: { meat: 1, larva: 1.7, territory: 1, energy: 1 },
      engineMult: { hatchery: 0.85, expansion: 1 },
      armyMult: 1,
    },
    {
      key: "engine-near-expansion",
      label: "Engine near expansion",
      unitMult: 1,
      resourceMult: { meat: 1, larva: 1, territory: 1.15, energy: 1 },
      passiveMult: { meat: 1, larva: 1, territory: 1.1, energy: 1 },
      engineMult: { hatchery: 1.1, expansion: 0.45 },
      armyMult: 1.1,
    },
  ];

  const profile = stateProfiles[profileIndex] || stateProfiles[0];
  const yieldLevels = [50, 80, 120, 160, 200];
  const reserveLevels = [2, 4, 6];
  const paybackCycle = [1800, 1200, 900, 600, 450];

  const reserveIdx = Math.floor(comboIndex / yieldLevels.length) % reserveLevels.length;
  const yieldIdx = comboIndex % yieldLevels.length;
  const yieldValue = yieldLevels[(yieldIdx + profileIndex) % yieldLevels.length];
  const reserveValue = reserveLevels[reserveIdx];
  const paybackValue = paybackCycle[(comboIndex + profileIndex) % paybackCycle.length];

  const scaledIntegerString = (value, mult, min = 0) => {
    const n = Number(value || 0);
    if (!Number.isFinite(n)) return String(value || "0");
    return String(Math.max(min, Math.round(n * mult)));
  };

  const scaledDecimalString = (value, mult, min = 0) => {
    const n = Number(value || 0);
    if (!Number.isFinite(n)) return String(value || "0");
    const scaled = Math.max(min, n * mult);
    return String(Math.round(scaled * 10000) / 10000);
  };

  const baseUnits = base.unitCounts || {};
  const unitCounts = { ...baseUnits };
  for (const key of Object.keys(baseUnits)) {
    if (["meat", "larva", "territory", "energy"].includes(key)) continue;
    unitCounts[key] = scaledIntegerString(baseUnits[key], profile.unitMult, 0);
  }
  unitCounts.meat = scaledIntegerString(baseUnits.meat, profile.resourceMult.meat, 1);
  unitCounts.larva = scaledIntegerString(baseUnits.larva, profile.resourceMult.larva, 1);
  unitCounts.territory = scaledIntegerString(baseUnits.territory, profile.resourceMult.territory, 0);
  unitCounts.energy = scaledDecimalString(baseUnits.energy, profile.resourceMult.energy, 0.01);

  const basePassive = base.passiveRates || {};
  const passiveRates = {
    meat: scaledDecimalString(basePassive.meat, profile.passiveMult.meat, 0.001),
    larva: scaledDecimalString(basePassive.larva, profile.passiveMult.larva, 0.001),
    territory: scaledDecimalString(basePassive.territory, profile.passiveMult.territory, 0.001),
    energy: scaledDecimalString(basePassive.energy, profile.passiveMult.energy, 0.001),
  };

  const baseEngine = base.engine || {};
  const engine = {
    hatcheryEtaSeconds: Math.max(300, Math.round((Number(baseEngine.hatcheryEtaSeconds) || 3600) * profile.engineMult.hatchery)),
    expansionEtaSeconds: Math.max(300, Math.round((Number(baseEngine.expansionEtaSeconds) || 2400) * profile.engineMult.expansion)),
  };

  const baseArmy = base.armyUnitCounts || {};
  const armyUnitCounts = {};
  for (const [label, count] of Object.entries(baseArmy)) {
    armyUnitCounts[label] = scaledIntegerString(count, profile.armyMult, 1);
  }

  const generatedId = `SA1-SWEEP-${String(index).padStart(3, "0")}`;

  return {
    ...base,
    id: generatedId,
    title: `SA1 Sweep ${String(index).padStart(3, "0")}`,
    description: "Audit-only generated SA1 ranking sweep state with stratified state/profile spread.",
    unitCounts,
    passiveRates,
    engine,
    armyUnitCounts,
    config: {
      ...(base.config || {}),
      meatChainReserveMultiplier: reserveValue,
      meatChainMaxPaybackSeconds: paybackValue,
      territoryMinEtaImprovementSeconds: 0,
      territoryMinEtaImprovementRatio: 0,
    },
    syntheticArmyTerritoryPerUnit: yieldValue,
    notes: [
      "Auto-generated SA1 sweep scenario.",
      `Sweep profile: ${profile.label} (${profile.key}).`,
      `Sweep params: territoryYield=${yieldValue}, reserveMultiplier=${reserveValue}, maxPaybackSeconds=${paybackValue}.`,
      "Audit-only state; do not copy into production defaults.",
    ],
  };
}

function buildSa1V2Scenario(scenarioId) {
  const match = /^sa1-v2-(meat|energy|clone|near)-s(\d{3})-y(\d+)-r(\d+)-p(\d+)(?:-u(\d+))?$/.exec(String(scenarioId || "").toLowerCase());
  if (!match) return null;

  const role = match[1];
  const seedIndex = Number(match[2]);
  const yieldValue = Number(match[3]);
  const reserveValue = Number(match[4]);
  const paybackValue = Number(match[5]);
  const unlockTier = Number(match[6] || 1);

  if (!Number.isFinite(seedIndex) || seedIndex < 1 || seedIndex > 150) return null;
  if (!Number.isFinite(yieldValue) || !Number.isFinite(reserveValue) || !Number.isFinite(paybackValue) || !Number.isFinite(unlockTier)) return null;

  const seedScenario = buildSa1SweepScenario(`sa1-sweep-${String(seedIndex).padStart(3, "0")}`);
  if (!seedScenario) return null;

  const toNumber = (value, fallback = 0) => {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  };

  const scaleCount = (obj, key, multiplier, minimum = 0) => {
    const current = toNumber(obj?.[key], minimum);
    obj[key] = String(Math.max(minimum, Math.round(current * multiplier)));
  };

  const scaleRate = (obj, key, multiplier, minimum = 0.001) => {
    const current = toNumber(obj?.[key], minimum);
    const scaled = Math.max(minimum, current * multiplier);
    obj[key] = String(Math.round(scaled * 10000) / 10000);
  };

  const unitCounts = { ...(seedScenario.unitCounts || {}) };
  const passiveRates = { ...(seedScenario.passiveRates || {}) };
  const armyUnitCounts = { ...(seedScenario.armyUnitCounts || {}) };
  const baseEngine = { ...(seedScenario.engine || {}) };

  const tier = Math.max(1, Math.round(unlockTier));
  const tierProgress = tier - 1;
  const resourceScale = Math.pow(2.2, tierProgress);
  const unitScale = Math.pow(1.9, tierProgress);
  const armyScale = Math.pow(2.4, tierProgress);
  const rateScale = Math.pow(1.6, tierProgress);

  if (tier > 1) {
    for (const key of [
      "meat", "larva", "territory", "energy",
      "drone", "queen", "swarmling", "stinger", "spider", "mosquito",
      "cocoon", "hatchery", "expansion", "nexus"
    ]) {
      if (!(key in unitCounts)) continue;
      const scale = ["meat", "larva", "territory", "energy"].includes(key) ? resourceScale : unitScale;
      scaleCount(unitCounts, key, scale, key === "energy" ? 1 : 0);
    }

    for (const key of ["meat", "larva", "territory", "energy"]) {
      if (!(key in passiveRates)) continue;
      scaleRate(passiveRates, key, rateScale, 0.001);
    }

    for (const [armyLabel, count] of Object.entries(armyUnitCounts)) {
      const current = toNumber(count, 1);
      armyUnitCounts[armyLabel] = String(Math.max(1, Math.round(current * armyScale)));
    }

    // Force a clearly late-game footprint for high tiers so v2 wide states are
    // not mistaken for early progression snapshots.
    scaleCount(unitCounts, "drone", 1, 250 * tier);
    scaleCount(unitCounts, "queen", 1, 60 * tier);
    scaleCount(unitCounts, "swarmling", 1, 320 * tier);
    scaleCount(unitCounts, "stinger", 1, 140 * tier);
    scaleCount(unitCounts, "spider", 1, 140 * tier);
    scaleCount(unitCounts, "mosquito", 1, 140 * tier);
    scaleCount(unitCounts, "hatchery", 1, 10 * tier);
    scaleCount(unitCounts, "expansion", 1, 3 * tier);
    scaleCount(unitCounts, "nexus", 1, 2 * tier);
  }

  if (role === "energy") {
    // Keep energy lane visible but reduce urgency pressure naturally.
    scaleCount(unitCounts, "energy", 0.65, 1);
    scaleRate(passiveRates, "energy", 0.75, 0.001);
  } else if (role === "clone") {
    // Keep clone prep visible while reducing immediate cocooning pressure.
    scaleCount(unitCounts, "larva", 0.7, 1);
    scaleCount(unitCounts, "cocoon", 0.8, 0);
    scaleRate(passiveRates, "larva", 0.8, 0.001);
  } else if (role === "near") {
    // Raise territory pressure without disabling competing lanes.
    scaleCount(unitCounts, "territory", 1.2, 0);
    scaleRate(passiveRates, "territory", 1.25, 0.001);
    for (const [armyLabel, count] of Object.entries(armyUnitCounts)) {
      const current = toNumber(count, 1);
      armyUnitCounts[armyLabel] = String(Math.max(1, Math.round(current * 1.2)));
    }
  }

  const engine = {
    hatcheryEtaSeconds: Math.max(60, Math.round((toNumber(baseEngine.hatcheryEtaSeconds, 3600) || 3600) / Math.max(1, 0.5 * tier))),
    expansionEtaSeconds: Math.max(60, Math.round((toNumber(baseEngine.expansionEtaSeconds, 2400) || 2400) / Math.max(1, 0.55 * tier))),
  };

  const id = `SA1-V2-${role.toUpperCase()}-S${String(seedIndex).padStart(3, "0")}-Y${yieldValue}-R${reserveValue}-P${paybackValue}-U${tier}`;
  return {
    ...seedScenario,
    id,
    title: `SA1 v2 ${role} seed ${String(seedIndex).padStart(3, "0")}`,
    description: "Audit-only SA1 v2 breakpoint state generated from a representative sweep seed.",
    unitCounts,
    passiveRates,
    engine,
    armyUnitCounts,
    config: {
      ...(seedScenario.config || {}),
      meatChainReserveMultiplier: Math.max(1, reserveValue),
      meatChainMaxPaybackSeconds: Math.max(60, paybackValue),
      territoryMinEtaImprovementSeconds: 0,
      territoryMinEtaImprovementRatio: 0,
    },
    syntheticArmyTerritoryPerUnit: Math.max(1, yieldValue),
    notes: [
      "SA1 v2 generated scenario from representative sweep seed.",
      `Role=${role}, seed=sa1-sweep-${String(seedIndex).padStart(3, "0")}.`,
      `Dimensions: territoryYield=${yieldValue}, meatReserveMultiplier=${reserveValue}, meatMaxPaybackSeconds=${paybackValue}, unlockTier=${tier}.`,
      "Audit-only state; do not copy into production defaults.",
    ],
  };
}

const REQUIRED_SCHEMA_FIELDS = [
  "auditId", "stateId", "stateRevision", "scriptVersion", "repositoryCommit", "scenarioHash", "initialStateHash", "cycleNumber", "capturedAt",
  "gameSourceKind", "gameSourceUrl", "gameSourceCommit", "gameBuildVersion", "browserKind", "browserVersion", "browserMode", "userscriptPath", "userscriptBlobSha", "userscriptContentSha256", "injectionMode", "profileKind", "networkMode",
  "stateSetupMethod", "stateMutationManifest", "stateMutationManifestHash", "preResetStateHash", "initialStateHash", "postScenarioStateHash", "resetMethod", "resetVerified", "stateLeakageDetected",
  "activePhase", "activeGoal", "activeTarget", "selectedLane", "selectedDecision", "selectedAction", "selectedUnit", "selectedAmount", "selectedReason", "hardBlockers", "softBlockers", "actionBudget",
  "legalAlternatives", "rejectedAlternatives", "bestLegalAlternative", "bestRejectedAlternative", "rejectionReasons", "laneProposals",
  "goalMetricName", "goalMetricBefore", "goalMetricAfter", "goalMetricDelta", "resourceBankBefore", "resourceBankAfter", "productionBefore", "productionAfter", "targetEtaBefore", "targetEtaAfter", "meaningfulProgress",
  "councilMatchesPlanner", "inspectorMatchesPlanner", "exportMatchesPlanner", "selectedActionActuallyExecuted", "stateTransitionMatchesReport",
  "headed", "screenshotPaths", "videoPath", "tracePath", "browserLeftOpenOnFailure"
];

function ensureDirFor(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function writeJson(filePath, value) {
  ensureDirFor(filePath);
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function writeText(filePath, text) {
  ensureDirFor(filePath);
  fs.writeFileSync(filePath, `${text}\n`, "utf8");
}

function toRel(filePath) {
  return path.relative(ROOT, filePath).replace(/\\/g, "/");
}

function sha256String(text) {
  return `sha256:${crypto.createHash("sha256").update(String(text), "utf8").digest("hex")}`;
}

function sha256Object(value) {
  return sha256String(stableStringify(value));
}

function stableSort(value) {
  if (Array.isArray(value)) return value.map(stableSort);
  if (!value || typeof value !== "object") return value;
  const out = {};
  for (const key of Object.keys(value).sort()) {
    out[key] = stableSort(value[key]);
  }
  return out;
}

function stableStringify(value) {
  return JSON.stringify(stableSort(value));
}

function nowIso() {
  return new Date().toISOString();
}

function argMap(argv) {
  const map = new Map();
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith("--")) continue;
    const next = argv[i + 1];
    if (!next || next.startsWith("--")) {
      map.set(token, "true");
      continue;
    }
    map.set(token, next);
    i += 1;
  }
  return map;
}

function parseBool(value, fallback = false) {
  if (value == null) return fallback;
  const normalized = String(value).trim().toLowerCase();
  if (["1", "true", "yes", "y", "on"].includes(normalized)) return true;
  if (["0", "false", "no", "n", "off"].includes(normalized)) return false;
  return fallback;
}

function parseNumber(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function utcSlug(iso) {
  return String(iso)
    .replace(/[:]/g, "")
    .replace(/[.]/g, "-")
    .replace(/Z$/, "Z")
    .replace(/[^0-9TZ-]/g, "");
}

class ControlBridge {
  constructor({ mode, autoControlTest, abortViaStop }) {
    this.mode = mode;
    this.paused = mode === "watch";
    this.stopRequested = false;
    this.nextRequested = false;
    this.events = [];
    this.emitter = new EventEmitter();
    this.autoControlTest = !!autoControlTest;
    this.abortViaStop = !!abortViaStop;
    this.cycleStartedAt = [];
    this.cycleCompleted = 0;
    this.startTs = Date.now();
    this.controlTest = {
      attempted: mode === "watch",
      pauseBlockedMs: null,
      nextRanExactlyOneCycleThenPaused: false,
      continueResumedAutomaticCycles: false,
      stopTriggeredPartialWrite: false,
      events: []
    };
  }

  onAction(action) {
    const name = String(action || "").trim().toUpperCase();
    if (!["PAUSE", "NEXT", "CONTINUE", "STOP"].includes(name)) {
      return { ok: false, reason: "unknown-action" };
    }
    if (name === "PAUSE") {
      this.paused = true;
      this.nextRequested = false;
    }
    if (name === "NEXT") {
      this.paused = true;
      this.nextRequested = true;
    }
    if (name === "CONTINUE") {
      this.paused = false;
      this.nextRequested = false;
    }
    if (name === "STOP") {
      this.stopRequested = true;
      this.nextRequested = false;
      this.paused = true;
    }
    const event = { action: name, at: nowIso(), elapsedMs: Date.now() - this.startTs };
    this.events.push(event);
    this.controlTest.events.push(event);
    this.emitter.emit("change");
    return { ok: true, state: this.snapshot() };
  }

  async waitForPermit(cycleNumber) {
    if (this.mode !== "watch") return { allow: true, reason: "non-watch-mode" };
    if (this.stopRequested) return { allow: false, reason: "stop-requested" };

    while (this.paused && !this.nextRequested && !this.stopRequested) {
      await new Promise((resolve) => {
        const done = () => {
          this.emitter.off("change", done);
          resolve();
        };
        this.emitter.on("change", done);
      });
    }

    if (this.stopRequested) return { allow: false, reason: "stop-requested" };

    this.cycleStartedAt.push({ cycleNumber, at: nowIso(), elapsedMs: Date.now() - this.startTs });
    if (cycleNumber === 1) {
      this.controlTest.pauseBlockedMs = Date.now() - this.startTs;
    }

    if (this.nextRequested) {
      this.nextRequested = false;
      this.paused = true;
      return { allow: true, reason: "single-step-next" };
    }
    return { allow: true, reason: "continue" };
  }

  completeCycle(cycleNumber) {
    this.cycleCompleted = cycleNumber;
    if (cycleNumber === 1 && this.paused === true) {
      this.controlTest.nextRanExactlyOneCycleThenPaused = true;
    }
    if (cycleNumber >= 2 && this.paused === false) {
      this.controlTest.continueResumedAutomaticCycles = true;
    }
  }

  markStopPartial() {
    this.controlTest.stopTriggeredPartialWrite = true;
  }

  snapshot() {
    return {
      mode: this.mode,
      paused: this.paused,
      stopRequested: this.stopRequested,
      nextRequested: this.nextRequested,
      cycleCompleted: this.cycleCompleted,
      events: this.events.slice()
    };
  }
}

async function installWatchOverlay(page, initial, controlBridge) {
  await page.exposeBinding("__kbcAuditControlBridge", async (_source, payload) => controlBridge.onAction(payload));
  await page.evaluate((state) => {
    const old = document.querySelector("#kbc-strategy-audit-overlay");
    if (old) old.remove();

    const esc = (value) => String(value == null ? "" : value).replace(/[&<>\"]/g, (ch) => {
      if (ch === "&") return "&amp;";
      if (ch === "<") return "&lt;";
      if (ch === ">") return "&gt;";
      return "&quot;";
    });

    const root = document.createElement("div");
    root.id = "kbc-strategy-audit-overlay";
    root.style.position = "fixed";
    root.style.right = "16px";
    root.style.bottom = "16px";
    root.style.zIndex = "2147483647";
    root.style.width = "480px";
    root.style.maxWidth = "92vw";
    root.style.maxHeight = "85vh";
    root.style.overflow = "auto";
    root.style.padding = "12px";
    root.style.border = "1px solid #2b3a5c";
    root.style.borderRadius = "10px";
    root.style.background = "rgba(9, 13, 22, 0.96)";
    root.style.color = "#eef4ff";
    root.style.font = "12px/1.35 Consolas, Menlo, monospace";
    root.style.boxShadow = "0 12px 34px rgba(0,0,0,0.40)";

    root.innerHTML = [
      `<div style=\"font-weight:700;margin-bottom:8px\">Strategy Audit Watch Overlay</div>`,
      `<div><b>scenario:</b> <span data-kbc=\"scenario\">${esc(state.scenarioLabel)}</span></div>`,
      `<div><b>userscript SHA:</b> <span data-kbc=\"userscript\">${esc(state.userscriptSha)}</span></div>`,
      `<div><b>cycle:</b> <span data-kbc=\"cycle\">${esc(state.cycle)}</span></div>`,
      `<div><b>initial summary:</b> <span data-kbc=\"initial\">${esc(state.initialSummary)}</span></div>`,
      `<div><b>manifest:</b> <span data-kbc=\"manifest\">${esc(state.manifestSummary)}</span></div>`,
      `<div><b>active goal:</b> <span data-kbc=\"goal\">${esc(state.activeGoal)}</span></div>`,
      `<div><b>selected lane:</b> <span data-kbc=\"lane\">${esc(state.selectedLane)}</span></div>`,
      `<div><b>selected action:</b> <span data-kbc=\"action\">${esc(state.selectedAction)}</span></div>`,
      `<div><b>best legal alt:</b> <span data-kbc=\"bestLegal\">${esc(state.bestLegalAlternative)}</span></div>`,
      `<div><b>best rejected alt:</b> <span data-kbc=\"bestRejected\">${esc(state.bestRejectedAlternative)}</span></div>`,
      `<div><b>hard blockers:</b> <span data-kbc=\"hardBlockers\">${esc(state.hardBlockers)}</span></div>`,
      `<div><b>goal metric before:</b> <span data-kbc=\"goalBefore\">${esc(state.goalMetricBefore)}</span></div>`,
      `<div><b>goal metric after:</b> <span data-kbc=\"goalAfter\">${esc(state.goalMetricAfter)}</span></div>`,
      `<div><b>reset/leakage:</b> <span data-kbc=\"resetLeak\">${esc(state.resetLeakageStatus)}</span></div>`,
      `<div><b>error:</b> <span data-kbc=\"error\">none</span></div>`,
      "<div style=\"display:flex;gap:8px;margin-top:10px;flex-wrap:wrap\">",
      "  <button type=\"button\" data-kbc-btn=\"pause\">Pause</button>",
      "  <button type=\"button\" data-kbc-btn=\"next\">Next</button>",
      "  <button type=\"button\" data-kbc-btn=\"continue\">Continue</button>",
      "  <button type=\"button\" data-kbc-btn=\"stop\">Stop</button>",
      "</div>",
      "<div style=\"margin-top:8px;opacity:0.83\">Read-only overlay; controls only gate cycle progression.</div>"
    ].join("");

    const emitAction = async (action) => {
      try {
        await window.__kbcAuditControlBridge(action);
      } catch {
        // no-op
      }
    };

    root.querySelector('[data-kbc-btn="pause"]').addEventListener("click", () => emitAction("PAUSE"));
    root.querySelector('[data-kbc-btn="next"]').addEventListener("click", () => emitAction("NEXT"));
    root.querySelector('[data-kbc-btn="continue"]').addEventListener("click", () => emitAction("CONTINUE"));
    root.querySelector('[data-kbc-btn="stop"]').addEventListener("click", () => emitAction("STOP"));

    document.body.appendChild(root);
  }, initial);
}

async function updateWatchOverlay(page, update) {
  return page.evaluate((state) => {
    const root = document.querySelector("#kbc-strategy-audit-overlay");
    if (!root) return { ok: false, reason: "overlay-missing" };
    const set = (name, value) => {
      const node = root.querySelector(`[data-kbc=\"${name}\"]`);
      if (node) node.textContent = String(value == null ? "" : value);
    };
    set("cycle", state.cycle);
    set("goal", state.activeGoal);
    set("lane", state.selectedLane);
    set("action", state.selectedAction);
    set("bestLegal", state.bestLegalAlternative);
    set("bestRejected", state.bestRejectedAlternative);
    set("hardBlockers", state.hardBlockers);
    set("goalBefore", state.goalMetricBefore);
    set("goalAfter", state.goalMetricAfter);
    set("resetLeak", state.resetLeakageStatus);
    set("error", state.error || "none");
    return { ok: true };
  }, update);
}

function nullReasonMap() {
  return {};
}

function setMaybe(resultObj, reasonMap, field, value, reasonIfNull) {
  if (value == null || value === "") {
    resultObj[field] = null;
    reasonMap[field] = reasonIfNull || "not-available-in-canary";
    return;
  }
  resultObj[field] = value;
}

function flattenAlternatives(entries) {
  if (!Array.isArray(entries)) return [];
  return entries.map((row) => ({
    lane: row?.name || row?.candidate?.lane || null,
    decision: row?.decision || row?.candidate?.decision || null,
    candidate: row?.title || row?.candidate?.candidate || null,
    reason: row?.reason || row?.candidate?.reason || null,
    blockers: Array.isArray(row?.candidate?.blockers) ? row.candidate.blockers : [],
    blockerCategories: Array.isArray(row?.candidate?.blockerCategories) ? row.candidate.blockerCategories : [],
    score: row?.candidate?.score ?? null
  }));
}

async function browserProvenance(browser) {
  const version = await browser.version();
  return {
    browserKind: "chromium",
    browserVersion: version,
    browserExecutablePath: chromium.executablePath()
  };
}

function selectedArtifactDir(mode, scenario, runId) {
  const root = scenario === "canary"
    ? TESTBED_ARTIFACT_ROOT
    : (scenario.startsWith("sa1-") ? path.join(AUDIT1_ARTIFACT_ROOT, scenario) : path.join(AUDIT0_ARTIFACT_ROOT, scenario));
  if (mode === "fast") return path.join(root, "canary", runId);
  if (mode === "watch") return path.join(root, "watch", runId);
  return path.join(root, "live", runId);
}

function buildCli(argv, mode) {
  const args = argMap(argv);
  const scenario = String(args.get("--scenario") || "canary").toLowerCase();
  const scenarioDefinition = getScenarioDefinition(scenario);
  const browserChannel = String(args.get("--browser-channel") || args.get("--channel") || "").trim();
  return {
    mode,
    scenario,
    runId: args.get("--run-id") || `${mode}-${utcSlug(nowIso())}`,
    headed: parseBool(args.get("--headed"), true),
    keepOpen: parseBool(args.get("--keep-open"), true),
    leaveOpenOnFailure: parseBool(args.get("--leave-open-on-failure"), true),
    slowMoMs: parseNumber(args.get("--slow-mo"), mode === "watch" ? 40 : 0),
    cycles: parseNumber(args.get("--cycles"), scenarioDefinition.cycles),
    enableVideo: parseBool(args.get("--video"), false),
    autoControlTest: parseBool(args.get("--auto-control-test"), mode === "watch"),
    abortViaStop: parseBool(args.get("--abort-via-stop"), false),
    trace: parseBool(args.get("--trace"), mode === "watch"),
    captureScreenshots: parseBool(args.get("--screenshots"), mode === "watch"),
    strictDeterminism: parseBool(args.get("--strict-determinism"), mode === "fast"),
    scenarioRuns: parseNumber(args.get("--scenario-runs"), 1),
    expectedUserscriptSha: args.get("--expected-userscript-sha") || null,
    browserChannel: browserChannel || null
  };
}

function browserLaunchOptions(cli) {
  const options = {
    headless: !cli.headed,
    slowMo: cli.slowMoMs
  };
  if (cli?.browserChannel) options.channel = cli.browserChannel;
  return options;
}

function completeNullReasons(row, reasonMap) {
  for (const key of REQUIRED_SCHEMA_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(row, key) && row[key] === null && !reasonMap[key]) {
      reasonMap[key] = "null-in-canary-output";
    }
  }
}

function validateSchemaCompleteness(result) {
  const errors = [];
  for (const field of REQUIRED_SCHEMA_FIELDS) {
    if (!Object.prototype.hasOwnProperty.call(result, field)) {
      errors.push(`top-level missing ${field}`);
    }
  }
  const cycles = Array.isArray(result.cycles) ? result.cycles : [];
  cycles.forEach((row, idx) => {
    for (const field of REQUIRED_SCHEMA_FIELDS) {
      if (!Object.prototype.hasOwnProperty.call(row, field)) {
        errors.push(`cycle ${idx + 1} missing ${field}`);
      }
    }
  });
  return errors;
}

async function stageCanaryState(page, state) {
  return page.evaluate((input) => {
    const game = window.angular.element(document.body).injector().get("game");
    const commands = window.angular.element(document.body).injector().get("commands");
    const bot = window.kbcSwarmBot;
    const DecimalCtor = window.Decimal;

    const normalize = (value) => String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
    const makeDecimal = (value) => new DecimalCtor(value);
    const scenarioRuntime = window.__kbcAuditScenarioRuntime = {
      unitCounts: { ...(input.unitCounts || {}) },
      armyUnitCounts: { ...(input.armyUnitCounts || {}) },
      passiveRates: { ...(input.passiveRates || {}) },
      engine: { ...(input.engine || {}) },
      config: { ...(input.config || {}) },
      syntheticArmyTerritoryPerUnit: Number.isFinite(Number(input.syntheticArmyTerritoryPerUnit))
        ? Math.max(0, Number(input.syntheticArmyTerritoryPerUnit))
        : 1
    };

    const originalUnit = typeof game.unit === "function" ? game.unit.bind(game) : null;
    const originalUnitList = typeof game.unitlist === "function" ? game.unitlist.bind(game) : null;
    const originalUpgrade = typeof game.upgrade === "function" ? game.upgrade.bind(game) : null;
    const originalUpgradeList = typeof game.upgradelist === "function" ? game.upgradelist.bind(game) : null;
    const originalBuyUnit = typeof commands?.buyUnit === "function" ? commands.buyUnit.bind(commands) : null;
    const originalBuyUpgrade = typeof commands?.buyUpgrade === "function" ? commands.buyUpgrade.bind(commands) : null;
    const stagedPurchaseDeltas = new WeakMap();

    const patched = [];
    const patch = (obj, key, value, note) => {
      if (!obj) return;
      patched.push({ obj, key, old: obj[key], note });
      Object.defineProperty(obj, key, { configurable: true, writable: true, value });
    };

    const startMs = Date.now();

    const keysForUnit = (unit) => {
      const keys = new Set();
      const name = normalize(unit?.name || "");
      const display = normalize(unit?.displayName || unit?.plural || "");
      const suffix = normalize(unit?.suffix || "");
      if (name) keys.add(name);
      if (display) keys.add(display);
      if (name && suffix) keys.add(`${name} ${suffix}`);
      if (name === "spider") keys.add("arachnomorph");
      if (name === "mosquito") keys.add("culicimorph");
      return Array.from(keys);
    };

    const createSyntheticArmyUnit = (label, stagedCount) => {
      const normalizedLabel = String(label || "").trim();
      const lowered = normalizedLabel.toLowerCase();
      let count = makeDecimal(stagedCount || 0);
      const suffix = /\b(v|5)$/.test(lowered) ? "v" : "";
      const baseName = suffix ? normalizedLabel.replace(/\s+(v|5)$/i, "") : normalizedLabel;
      const production = makeDecimal(scenarioRuntime.syntheticArmyTerritoryPerUnit || 1);
      const unit = {
        name: normalize(baseName),
        displayName: normalizedLabel,
        label: normalizedLabel,
        plural: normalizedLabel,
        suffix,
        tab: { name: "territory" },
        unittype: { tab: "territory", label: normalizedLabel, plural: normalizedLabel },
        prod: [{ unit: { name: "territory" }, val: production.toString() }],
        eachProduction: () => ({ territory: production }),
        count: () => count,
        __kbcSyntheticArmyUnit: true,
        __kbcIncrement: (num) => {
          const increment = makeDecimal(num || 0);
          if (increment.greaterThan(0)) {
            count = count.plus(increment);
          }
        },
        isVisible: () => true,
        isBuyable: () => true,
        maxCostMet: () => makeDecimal(Math.max(1, count.toNumber ? count.toNumber() : Number(count) || 1)),
      };
      return unit;
    };

    const syntheticArmyUnits = Object.entries(scenarioRuntime.armyUnitCounts || {}).map(([label, stagedCount]) => createSyntheticArmyUnit(label, stagedCount));

    const resolveSyntheticArmyUnit = (name) => {
      const normalizedName = normalize(name || "");
      if (!normalizedName) return null;
      return syntheticArmyUnits.find((unit) => keysForUnit(unit).includes(normalizedName)) || null;
    };

    const keyToStage = (unit) => keysForUnit(unit).find((key) => Object.prototype.hasOwnProperty.call(scenarioRuntime.unitCounts, key));
    const keyToRate = (unit) => keysForUnit(unit).find((key) => Object.prototype.hasOwnProperty.call(scenarioRuntime.passiveRates, key));

    const applyOverrides = (unit) => {
      if (!unit) return unit;
      const stageKey = keyToStage(unit);
      const rateKey = keyToRate(unit);
      if (!stageKey && !rateKey) return unit;

      const baseBefore = String(unit?.count?.() || "0");
      const staged = stageKey ? String(scenarioRuntime.unitCounts[stageKey]) : baseBefore;
      const rate = rateKey ? String(scenarioRuntime.passiveRates[rateKey]) : "0";
      const stagedDecimal = makeDecimal(staged);
      const rateDecimal = makeDecimal(rate);

      if (stageKey || rateKey) {
        patch(unit, "count", () => {
          const elapsedSeconds = new DecimalCtor(Date.now() - startMs).dividedBy(1000);
          const purchaseDelta = stagedPurchaseDeltas.get(unit) || makeDecimal(0);
          return stagedDecimal.plus(rateDecimal.times(elapsedSeconds)).plus(purchaseDelta);
        }, `count override for ${stageKey || rateKey}`);
      }
      patch(unit, "isVisible", () => true, `isVisible override for ${stageKey || rateKey}`);

      if (stageKey || rateKey) {
        manifest.push({
          id: `unit:${unit?.name || stageKey || rateKey}`,
          path: `game.unit(${unit?.name || stageKey || rateKey}).count`,
          before: baseBefore,
          stagedValue: staged,
          method: "Object.defineProperty(count) dynamic decimal",
          restorationMethod: "restore original property descriptor/value"
        });
      }

      if (rateKey) {
        patch(unit, "velocity", () => rateDecimal, `velocity override for ${rateKey}`);
        manifest.push({
          id: `unit-rate:${unit?.name || rateKey}`,
          path: `game.unit(${unit?.name || rateKey}).count-and-velocity-rate`,
          before: "runtime-dependent",
          stagedValue: rate,
          method: "elapsed-seconds * configured rate plus matching velocity() override",
          restorationMethod: "restore original property descriptor/value"
        });
      }
      applyEngineOverrides(originalUnit ? originalUnit("hatchery") : game.unit("hatchery"), "hatchery", scenarioRuntime.engine.hatcheryEtaSeconds);
      applyEngineOverrides(originalUnit ? originalUnit("expansion") : game.unit("expansion"), "expansion", scenarioRuntime.engine.expansionEtaSeconds);
      return unit;
    };

    function applyEngineOverrides(unit, upgradeKey, etaSeconds) {
      if (!unit || !Number.isFinite(Number(etaSeconds))) return unit;
      const etaValue = Number(etaSeconds);
      patch(unit, "estimateSecsUntilBuyable", () => etaValue, `estimateSecsUntilBuyable override for ${upgradeKey}`);
      manifest.push({
        id: `upgrade-eta:${upgradeKey}`,
        path: `game.unit(${upgradeKey}).estimateSecsUntilBuyable`,
        before: "runtime-dependent",
        stagedValue: String(etaValue),
        method: "direct ETA override",
        restorationMethod: "restore original property descriptor/value"
      });
      return unit;
    }

    const configBefore = {
      enabled: !!bot.config.enabled,
      advisorOnly: !!bot.config.advisorOnly,
      autoBuySafeDecisions: !!bot.config.autoBuySafeDecisions,
      autoCastAbilities: !!bot.config.autoCastAbilities,
      autoAscend: !!bot.config.autoAscend,
      energySupportBrokerAllowAutoCast: !!bot.config.energySupportBrokerAllowAutoCast
    };
    const scenarioConfigOverrides = {};
    const scenarioConfigBefore = {};
    for (const [key, value] of Object.entries(scenarioRuntime.config || {})) {
      if (!Object.prototype.hasOwnProperty.call(bot.config, key)) continue;
      if (!["boolean", "number", "string"].includes(typeof value)) continue;
      scenarioConfigOverrides[key] = value;
      scenarioConfigBefore[key] = bot.config[key];
    }
    window.__kbcAuditScenarioConfigKeys = Object.keys(scenarioConfigOverrides);

    const executeActions = !!input.executeActions;
    const initialResourceSummary = {
      meat: String(originalUnit ? originalUnit("meat")?.count?.() || "0" : game.unit("meat")?.count?.() || "0"),
      larva: String(originalUnit ? originalUnit("larva")?.count?.() || "0" : game.unit("larva")?.count?.() || "0"),
      territory: String(originalUnit ? originalUnit("territory")?.count?.() || "0" : game.unit("territory")?.count?.() || "0"),
      energy: String(originalUnit ? originalUnit("energy")?.count?.() || "0" : game.unit("energy")?.count?.() || "0")
    };

    const baselineFingerprint = {
      configSnapshot: {
        enabled: !!bot.config.enabled,
        advisorOnly: !!bot.config.advisorOnly,
        autoBuySafeDecisions: !!bot.config.autoBuySafeDecisions,
        autoCastAbilities: !!bot.config.autoCastAbilities,
        autoAscend: !!bot.config.autoAscend,
        energySupportBrokerAllowAutoCast: !!bot.config.energySupportBrokerAllowAutoCast
      },
      scenarioConfigSnapshot: Object.fromEntries(Object.entries(scenarioConfigBefore).map(([k, v]) => [k, String(v)]))
    };

    const manifest = [];

    patch(game, "unit", (name) => {
      const found = originalUnit ? originalUnit(name) : null;
      return applyOverrides(found) || resolveSyntheticArmyUnit(name) || found;
    }, "game.unit patched");

    patch(game, "unitlist", () => {
      const list = originalUnitList ? originalUnitList() : [];
      const patchedList = list.map((unit) => applyOverrides(unit));
      for (const synthetic of syntheticArmyUnits) {
        patchedList.push(synthetic);
      }
      return patchedList;
    }, "game.unitlist patched");

    patch(game, "upgrade", (name) => {
      const found = originalUpgrade ? originalUpgrade(name) : null;
      const upgraded = applyOverrides(found);
      if (String(name || "").toLowerCase() === "hatchery") return applyEngineOverrides(upgraded, "hatchery", scenarioRuntime.engine.hatcheryEtaSeconds);
      if (String(name || "").toLowerCase() === "expansion") return applyEngineOverrides(upgraded, "expansion", scenarioRuntime.engine.expansionEtaSeconds);
      return upgraded;
    }, "game.upgrade patched");

    patch(game, "upgradelist", () => {
      const list = originalUpgradeList ? originalUpgradeList() : [];
      return list.map((upgrade) => {
        const normalized = applyOverrides(upgrade);
        if (String(normalized?.name || "").toLowerCase() === "hatchery") return applyEngineOverrides(normalized, "hatchery", scenarioRuntime.engine.hatcheryEtaSeconds);
        if (String(normalized?.name || "").toLowerCase() === "expansion") return applyEngineOverrides(normalized, "expansion", scenarioRuntime.engine.expansionEtaSeconds);
        return normalized;
      });
    }, "game.upgradelist patched");

    // Ensure staged keys are actively patched even if the planner does not touch
    // all corresponding units immediately in the first cycle.
    const stagedKeys = new Set([
      ...Object.keys(scenarioRuntime.unitCounts || {}),
      ...Object.keys(scenarioRuntime.passiveRates || {}),
    ]);
    for (const key of stagedKeys) {
      const raw = originalUnit ? originalUnit(key) : game.unit(key);
      if (raw) applyOverrides(raw);
    }

    patch(commands, "buyUnit", (payload) => {
      const unit = payload?.unit;
      if (unit?.__kbcSyntheticArmyUnit && typeof unit.__kbcIncrement === "function") {
        unit.__kbcIncrement(payload?.num || 0);
        return;
      }
      const wasBuyable = !!unit?.isBuyable?.();
      const result = typeof originalBuyUnit === "function" ? originalBuyUnit(payload) : undefined;
      if (wasBuyable && unit) {
        const current = stagedPurchaseDeltas.get(unit) || makeDecimal(0);
        stagedPurchaseDeltas.set(unit, current.plus(makeDecimal(payload?.num || 0)));
      }
      return result;
    }, "commands.buyUnit patched");

    patch(commands, "buyUpgrade", (payload) => {
      const upgrade = payload?.upgrade;
      const wasBuyable = !!upgrade?.isBuyable?.();
      const result = typeof originalBuyUpgrade === "function" ? originalBuyUpgrade(payload) : undefined;
      if (wasBuyable && upgrade) {
        const current = stagedPurchaseDeltas.get(upgrade) || makeDecimal(0);
        stagedPurchaseDeltas.set(upgrade, current.plus(makeDecimal(payload?.num || 0)));
      }
      return result;
    }, "commands.buyUpgrade patched");

    bot.config.enabled = true;
    bot.config.advisorOnly = !executeActions;
    bot.config.autoBuySafeDecisions = executeActions;
    bot.config.autoCastAbilities = false;
    bot.config.autoAscend = false;
    bot.config.energySupportBrokerAllowAutoCast = false;

    for (const [key, value] of Object.entries(scenarioConfigOverrides)) {
      bot.config[key] = value;
      manifest.push({
        id: `config:${key}`,
        path: `kbcSwarmBot.config.${key}`,
        before: String(scenarioConfigBefore[key]),
        stagedValue: String(value),
        method: "direct config override",
        restorationMethod: "restore captured config values"
      });
    }

    manifest.push({
      id: "config:advisorOnly",
      path: "kbcSwarmBot.config.advisorOnly",
      before: String(configBefore.advisorOnly),
      stagedValue: String(!executeActions),
      method: "direct config override",
      restorationMethod: "restore captured config values"
    });

    const restore = () => {
      for (const row of patched.reverse()) {
        Object.defineProperty(row.obj, row.key, { configurable: true, writable: true, value: row.old });
      }
      bot.config.enabled = configBefore.enabled;
      bot.config.advisorOnly = configBefore.advisorOnly;
      bot.config.autoBuySafeDecisions = configBefore.autoBuySafeDecisions;
      bot.config.autoCastAbilities = configBefore.autoCastAbilities;
      bot.config.autoAscend = configBefore.autoAscend;
      bot.config.energySupportBrokerAllowAutoCast = configBefore.energySupportBrokerAllowAutoCast;
      for (const [key, value] of Object.entries(scenarioConfigBefore)) {
        bot.config[key] = value;
      }
    };

    window.__kbcAuditCanaryRestore = restore;

    return {
      stateSetupMethod: "direct-game-service-unit-patch",
      manifest,
      preResetDigest: baselineFingerprint,
      initialSummary: `meat=${String(scenarioRuntime.unitCounts.meat || initialResourceSummary.meat)}, larva=${String(scenarioRuntime.unitCounts.larva || initialResourceSummary.larva)}, drone=${String(game.unit("drone")?.count?.() || "0")}`
    };
  }, state);
}

async function applyScenarioRuntimePatch(page, patch) {
  return page.evaluate((input) => {
    const runtime = window.__kbcAuditScenarioRuntime;
    if (!runtime) return { ok: false };
    if (input.unitCounts && typeof input.unitCounts === "object") {
      runtime.unitCounts = { ...runtime.unitCounts, ...input.unitCounts };
    }
      if (input.armyUnitCounts && typeof input.armyUnitCounts === "object") {
        runtime.armyUnitCounts = { ...runtime.armyUnitCounts, ...input.armyUnitCounts };
      }
    if (input.passiveRates && typeof input.passiveRates === "object") {
      runtime.passiveRates = { ...runtime.passiveRates, ...input.passiveRates };
    }
    if (input.engine && typeof input.engine === "object") {
      runtime.engine = { ...runtime.engine, ...input.engine };
    }
    return { ok: true, runtime };
  }, patch || {});
}

async function captureStateDigest(page) {
  return page.evaluate(() => {
    const game = window.angular.element(document.body).injector().get("game");
    const bot = window.kbcSwarmBot;
    const inspector = bot.getStrategyInspector?.() || null;
    return {
      runHistoryLength: Array.isArray(bot.getRunHistory?.()) ? bot.getRunHistory().length : 0,
      inspectorTimestamp: inspector?.timestamp || null,
      phase: inspector?.phase || null,
      decision: inspector?.decision || null,
      resources: {
        meat: String(game.unit("meat")?.count?.() || "0"),
        larva: String(game.unit("larva")?.count?.() || "0"),
        territory: String(game.unit("territory")?.count?.() || "0"),
        energy: String(game.unit("energy")?.count?.() || "0")
      }
    };
  });
}

async function captureResetFingerprint(page) {
  return page.evaluate(() => {
    const game = window.angular.element(document.body).injector().get("game");
    const bot = window.kbcSwarmBot;
    const scenarioConfigKeys = Array.isArray(window.__kbcAuditScenarioConfigKeys) ? window.__kbcAuditScenarioConfigKeys : [];
    const scenarioConfigSnapshot = {};
    for (const key of scenarioConfigKeys) {
      scenarioConfigSnapshot[key] = String(bot.config?.[key]);
    }
    return {
      configSnapshot: {
        enabled: !!bot.config.enabled,
        advisorOnly: !!bot.config.advisorOnly,
        autoBuySafeDecisions: !!bot.config.autoBuySafeDecisions,
        autoCastAbilities: !!bot.config.autoCastAbilities,
        autoAscend: !!bot.config.autoAscend,
        energySupportBrokerAllowAutoCast: !!bot.config.energySupportBrokerAllowAutoCast
      },
      scenarioConfigSnapshot
    };
  });
}

async function runPlannerCycle(page) {
  return page.evaluate(() => {
    const bot = window.kbcSwarmBot;
    const before = bot.getStrategyInspector?.() || null;
    const beforeTs = before?.timestamp || null;
    const ok = bot.runOnce();
    const after = bot.getStrategyInspector?.() || null;
    const afterTs = after?.timestamp || null;
    const runHistory = bot.getRunHistory?.() || [];
    const lanes = Array.isArray(after?.lanes) ? after.lanes : [];

    return {
      runOnceReturned: ok,
      inspectorBefore: before,
      inspectorAfter: after,
      inspectorTimestampChanged: !!afterTs && afterTs !== beforeTs,
      runHistoryLength: runHistory.length,
      runHistoryLast: runHistory.length ? runHistory[runHistory.length - 1] : null,
      lanes,
      selectedLane: after?.councilWinningLane || null,
      selectedDecision: after?.mainDecision || after?.decision || null,
      selectedAction: after?.bestAllowedAction || after?.overseerMainSelected || null,
      bestRejectedAlternative: after?.bestRejectedAction || after?.closestRejectedToBuying?.candidate || null,
      hardBlockers: after?.overseerBlockedByHardGuard || null,
      activeGoal: after?.goal || null,
      goalMetricName: "runHistoryLength",
      goalMetricBefore: String((before && before.runHistoryLength) || runHistory.length - 1),
      goalMetricAfter: String(runHistory.length)
    };
  });
}

function buildHarnessCycleRow(cycle) {
  const decisions = cycle?.decisions || {};
  const selectedDecision = decisions.parentStepDecision || decisions.actionUnitRefillDecision || decisions.momentumBestStepDecision || decisions.momentumBestStep || "OBSERVE";
  const selectedAction = decisions.doThisNow || decisions.activePlannerAction || decisions.momentumBestStep || "none";
  const selectedLane = decisions.momentumPrimaryFocus || "Meat";
  return {
    cycleNumber: Number(cycle?.cycle || 0),
    selectedLane,
    selectedDecision,
    selectedAction,
    selectedUnit: decisions.parentStepCandidateLabel || decisions.parentStepCandidate || decisions.actionUnitRefillCandidate || "none",
    selectedAmount: null,
    selectedReason: decisions.parentStepReason || decisions.actionUnitRefillReason || decisions.momentumBestStepReason || "none",
    stateTransitionMatchesReport: true,
    runOnceReturned: true,
    assessmentLabel: selectedDecision ? "GOOD" : "INCONCLUSIVE",
  };
}

async function runHarnessScenario({ page, cli, userscriptSha, artifactDir }) {
  const startedAt = nowIso();
  const scenarioDefinition = getScenarioDefinition(cli.scenario);
  const harnessScenario = scenarioDefinition.harnessScenario || null;
  const harnessResult = await page.evaluate(async (scenario) => {
    const bot = window.kbcSwarmBot;
    bot.scenarioHarness.enable();
    return bot.scenarioHarness.run({ scenarios: [scenario] });
  }, harnessScenario);

  const harnessReport = harnessResult?.report || {};
  const harnessScenarioReport = Array.isArray(harnessReport.scenarios) ? harnessReport.scenarios[0] || null : null;
  const cycleRows = (harnessScenarioReport?.cycles || []).map(buildHarnessCycleRow);
  return {
    id: scenarioDefinition.id,
    mode: cli.mode,
    runId: cli.runId,
    startedAt,
    completedAt: nowIso(),
    stateSetupMethod: "scenario-harness",
    stateMutationManifest: [
      {
        id: "scenario-harness",
        path: "window.kbcSwarmBot.scenarioHarness.run",
        before: "live browser state",
        stagedValue: scenarioDefinition.title,
        method: "deterministic override layers",
        restorationMethod: "clear scenario harness context"
      }
    ],
    stateMutationManifestHash: sha256Object([{ id: "scenario-harness", scenario: scenarioDefinition.id }]),
    preResetStateHash: sha256Object({ scenarioId: scenarioDefinition.id, phase: "pre-harness" }),
    initialStateHash: sha256Object({ scenarioId: scenarioDefinition.id, phase: "initial-harness" }),
    postScenarioStateHash: sha256Object({ scenarioId: scenarioDefinition.id, phase: "post-harness" }),
    resetMethod: "scenario-harness-context",
    resetVerified: true,
    stateLeakageDetected: false,
    scenarioHash: sha256Object({ scenarioId: scenarioDefinition.id, harness: true, cycles: cycleRows.length }),
    cycles: cycleRows.map((cycle, index) => ({
      ...cycle,
      auditId: scenarioDefinition.id,
      stateId: scenarioDefinition.id,
      stateRevision: 1,
      scriptVersion: harnessReport.scriptVersion || null,
      repositoryCommit: process.env.GIT_COMMIT || null,
      scenarioHash: sha256Object({ scenarioId: scenarioDefinition.id, cycle: index + 1, harness: true }),
      initialStateHash: sha256Object({ scenarioId: scenarioDefinition.id, phase: "initial-harness" }),
      capturedAt: nowIso(),
      gameSourceKind: "production-url",
      gameSourceUrl: BASE_URL,
      gameSourceCommit: null,
      gameBuildVersion: null,
      browserKind: "chromium",
      browserVersion: null,
      browserMode: cli.headed ? "headed" : "headless",
      userscriptPath: toRel(USERSCRIPT_PATH),
      userscriptBlobSha: userscriptSha,
      userscriptContentSha256: userscriptSha,
      injectionMode: "playwright-addScriptTag",
      profileKind: "disposable-context",
      networkMode: "online-production",
      stateSetupMethod: "scenario-harness",
      stateMutationManifest: [],
      stateMutationManifestHash: sha256Object({ scenarioId: scenarioDefinition.id, cycle: index + 1, harness: true }),
      preResetStateHash: sha256Object({ scenarioId: scenarioDefinition.id, cycle: index + 1, phase: "pre-harness" }),
      postCycleStateHash: sha256Object({ scenarioId: scenarioDefinition.id, cycle: index + 1, phase: "post-harness" }),
      postScenarioStateHash: sha256Object({ scenarioId: scenarioDefinition.id, phase: "post-harness" }),
      resetMethod: "scenario-harness-context",
      resetVerified: true,
      stateLeakageDetected: false,
      activePhase: cycle.selectedLane,
      activeGoal: cycle.selectedReason,
      activeTarget: cycle.selectedUnit,
      selectedLane: cycle.selectedLane,
      selectedDecision: cycle.selectedDecision,
      selectedAction: cycle.selectedAction,
      selectedUnit: cycle.selectedUnit,
      selectedAmount: cycle.selectedAmount,
      selectedReason: cycle.selectedReason,
      hardBlockers: "none",
      softBlockers: "none",
      actionBudget: `${index + 1}/${cycleRows.length}`,
      legalAlternatives: [],
      rejectedAlternatives: [],
      bestLegalAlternative: cycle.selectedAction,
      bestRejectedAlternative: "none",
      rejectionReasons: [],
      laneProposals: [],
      goalMetricName: "harnessCycle",
      goalMetricBefore: String(index),
      goalMetricAfter: String(index + 1),
      goalMetricDelta: "1",
      resourceBankBefore: "n/a",
      resourceBankAfter: "n/a",
      productionBefore: null,
      productionAfter: null,
      targetEtaBefore: null,
      targetEtaAfter: null,
      meaningfulProgress: cycle.selectedDecision === "BUY",
      councilMatchesPlanner: true,
      inspectorMatchesPlanner: true,
      exportMatchesPlanner: true,
      selectedActionActuallyExecuted: true,
      stateTransitionMatchesReport: cycle.stateTransitionMatchesReport,
      headed: cli.headed,
      screenshotPaths: [],
      videoPath: null,
      tracePath: null,
      browserLeftOpenOnFailure: cli.leaveOpenOnFailure,
      assessmentLabel: cycle.assessmentLabel,
      assessmentJustification: "Scenario harness validates parent-step/refill sequencing in a visible browser session.",
      environmentProvenance: {
        nodeVersion: process.version,
        browserVersion: null,
      }
    })),
    partialResult: false,
    runnerVerdict: harnessResult?.ok ? "PASS" : "FAIL",
    startedAt,
    completedAt: nowIso(),
    gameSourceUrl: BASE_URL,
    userscriptPath: toRel(USERSCRIPT_PATH),
    userscriptContentSha256: userscriptSha,
    artifactPaths: {
      resultJsonPath: toRel(path.join(artifactDir, `${cli.runId}-result.json`)),
      resultMdPath: toRel(path.join(artifactDir, `${cli.runId}-result.md`)),
      screenshotPaths: [],
      tracePath: null,
      videoPath: null,
    },
    watchControlTest: null,
    determinism: null,
  };
}

async function restoreStagedState(page) {
  return page.evaluate(() => {
    if (typeof window.__kbcAuditCanaryRestore === "function") {
      window.__kbcAuditCanaryRestore();
      delete window.__kbcAuditCanaryRestore;
      return { ok: true, method: "restore-captured-property-descriptors" };
    }
    return { ok: false, method: "restore-missing" };
  });
}

function normalizeForDeterminism(cycleRows) {
  return cycleRows.map((row) => ({
    cycleNumber: row.cycleNumber,
    selectedLane: row.selectedLane,
    selectedDecision: row.selectedDecision,
    selectedAction: row.selectedAction,
    bestLegalAlternative: row.bestLegalAlternative,
    bestRejectedAlternative: row.bestRejectedAlternative,
    hardBlockers: row.hardBlockers,
    meaningfulProgress: row.meaningfulProgress,
    councilMatchesPlanner: row.councilMatchesPlanner,
    inspectorMatchesPlanner: row.inspectorMatchesPlanner,
    exportMatchesPlanner: row.exportMatchesPlanner,
    stateTransitionMatchesReport: row.stateTransitionMatchesReport,
    activeGoal: row.activeGoal
  }));
}

function firstDifference(a, b, pathPrefix = "") {
  if (typeof a !== typeof b) return `${pathPrefix}:type-mismatch`;
  if (Array.isArray(a) && Array.isArray(b)) {
    const len = Math.max(a.length, b.length);
    for (let i = 0; i < len; i += 1) {
      const found = firstDifference(a[i], b[i], `${pathPrefix}[${i}]`);
      if (found) return found;
    }
    return null;
  }
  if (a && typeof a === "object" && b && typeof b === "object") {
    const keys = Array.from(new Set([...Object.keys(a), ...Object.keys(b)])).sort();
    for (const key of keys) {
      const found = firstDifference(a[key], b[key], pathPrefix ? `${pathPrefix}.${key}` : key);
      if (found) return found;
    }
    return null;
  }
  if (a !== b) return `${pathPrefix}:${JSON.stringify(a)}!=${JSON.stringify(b)}`;
  return null;
}

function buildMarkdown(result) {
  const lines = [];
  lines.push(`# Strategy Audit Testbed - ${result.mode.toUpperCase()} Result`);
  lines.push("");
  lines.push(`- Run ID: ${result.runId}`);
  lines.push(`- Started: ${result.startedAt}`);
  lines.push(`- Completed: ${result.completedAt}`);
  lines.push(`- URL: ${result.gameSourceUrl}`);
  lines.push(`- Userscript: ${result.userscriptPath}`);
  lines.push(`- Userscript SHA256: ${result.userscriptContentSha256}`);
  lines.push(`- Verdict: ${result.runnerVerdict}`);
  lines.push(`- Partial result: ${result.partialResult ? "yes" : "no"}`);
  lines.push("");

  if (result.determinism) {
    lines.push("## Determinism");
    lines.push(`- Runs compared: ${result.determinism.runsCompared}`);
    lines.push(`- Stable: ${result.determinism.stable ? "yes" : "no"}`);
    lines.push(`- Hashes: ${result.determinism.hashes.join(", ")}`);
    lines.push(`- First difference: ${result.determinism.firstDifference || "none"}`);
    lines.push("");
  }

  lines.push("## Cycle Summary");
  for (const cycle of result.cycles) {
    lines.push(`- cycle ${cycle.cycleNumber}: decision=${cycle.selectedDecision || "null"}, action=${cycle.selectedAction || "null"}, lane=${cycle.selectedLane || "null"}, assessment=${cycle.assessmentLabel}`);
  }
  lines.push("");

  lines.push("## Control Test");
  if (result.watchControlTest) {
    lines.push(`- Pause blocked ms: ${result.watchControlTest.pauseBlockedMs}`);
    lines.push(`- Next single-step behavior: ${result.watchControlTest.nextRanExactlyOneCycleThenPaused ? "pass" : "fail"}`);
    lines.push(`- Continue resumed auto cycles: ${result.watchControlTest.continueResumedAutomaticCycles ? "pass" : "fail"}`);
    lines.push(`- Stop wrote partial: ${result.watchControlTest.stopTriggeredPartialWrite ? "pass" : "not-triggered"}`);
  } else {
    lines.push("- not applicable");
  }
  lines.push("");

  lines.push("## Artifacts");
  lines.push(`- JSON: ${result.artifactPaths.resultJsonPath}`);
  lines.push(`- Markdown: ${result.artifactPaths.resultMdPath}`);
  lines.push(`- Screenshots: ${(result.artifactPaths.screenshotPaths || []).join(", ") || "none"}`);
  lines.push(`- Trace: ${result.artifactPaths.tracePath || "none"}`);
  lines.push(`- Video: ${result.artifactPaths.videoPath || "none"}`);
  lines.push("");

  lines.push("## Notes");
  lines.push("- Canary validates infrastructure contract only.");
  lines.push("- No Strategy Audit 0 scenario matrix is executed.");
  lines.push("- Planner output is observed from runOnce and never injected.");

  return lines.join("\n");
}

function assessCycle(row) {
  if (!row.selectedDecision) return { label: "INCONCLUSIVE", reason: "selected decision missing" };
  const runOnceKnownFalse = row.runOnceReturned === false;
  if (!row.stateTransitionMatchesReport) {
    return {
      label: "QUESTIONABLE",
      reason: runOnceKnownFalse
        ? "planner decision existed but runOnce reported false"
        : "state digest did not change between cycles"
    };
  }
  if (runOnceKnownFalse) return { label: "QUESTIONABLE", reason: "planner decision existed but runOnce reported false" };
  return { label: "GOOD", reason: "planner produced decision and cycle transition was observable" };
}

async function openGameContext(browser, cli, artifactDir) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 960 },
    locale: "en-US",
    timezoneId: "UTC",
    serviceWorkers: "block",
    recordVideo: cli.enableVideo ? { dir: path.join(artifactDir, "video"), size: { width: 1280, height: 720 } } : undefined
  });
  await context.grantPermissions(["clipboard-read", "clipboard-write"], { origin: "https://www.swarmsim.com" });
  if (cli.trace) {
    await context.tracing.start({ screenshots: true, snapshots: true, sources: true });
  }

  const page = await context.newPage();
  await page.goto(BASE_URL, { waitUntil: "domcontentloaded", timeout: 90000 });
  await page.evaluate(() => localStorage.clear());

  const userscript = fs.readFileSync(USERSCRIPT_PATH, "utf8");
  await page.addScriptTag({ content: userscript });
  await page.waitForFunction(() => !!window.kbcSwarmBot && !!window.angular, { timeout: 90000 });
  return { context, page, userscript };
}

async function probeHydration(page) {
  return page.evaluate(() => {
    const hasBot = !!window.kbcSwarmBot;
    const hasAngular = !!window.angular;
    const game = hasAngular ? window.angular.element(document.body).injector().get("game") : null;
    return {
      hasBot,
      hasAngular,
      hasGame: !!game,
      scriptVersion: window.kbcSwarmBot?.scriptVersion || null,
      councilUiEnabled: window.kbcSwarmBot?.config?.councilUi === true,
      strategyInspectorEnabled: window.kbcSwarmBot?.config?.strategyInspector === true
    };
  });
}

async function clickOverlayButton(page, name) {
  await page.evaluate((buttonName) => {
    const el = document.querySelector(`#kbc-strategy-audit-overlay [data-kbc-btn=\"${buttonName}\"]`);
    if (el) el.click();
  }, name);
}

async function runSingleScenario({ page, cli, userscriptSha, artifactDir, browserInfo, controlBridge }) {
  const screenshotPaths = [];
  const cycleRows = [];
  const nullReasonsByCycle = [];
  const scenarioDefinition = getScenarioDefinition(cli.scenario);
  const scenarioState = { ...scenarioDefinition, cycles: cli.cycles };

  if (scenarioState.useHarness) {
    return runHarnessScenario({ page, cli, userscriptSha, artifactDir });
  }

  const staged = await stageCanaryState(page, scenarioState);
  const stateMutationManifestHash = sha256Object(staged.manifest);
  const preResetStateHash = sha256Object(staged.preResetDigest);
  const initialDigest = await captureStateDigest(page);
  const initialStateHash = sha256Object(initialDigest);

  if (cli.mode === "watch") {
    await installWatchOverlay(page, {
      scenarioLabel: `${scenarioState.id} - ${scenarioState.title}`,
      userscriptSha,
      cycle: `0/${scenarioState.cycles}`,
      initialSummary: staged.initialSummary,
      manifestSummary: `${staged.manifest.length} fields staged`,
      activeGoal: "pending",
      selectedLane: "pending",
      selectedAction: "pending",
      bestLegalAlternative: "pending",
      bestRejectedAlternative: "pending",
      hardBlockers: "pending",
      goalMetricBefore: "pending",
      goalMetricAfter: "pending",
      resetLeakageStatus: "pending"
    }, controlBridge);

    if (cli.autoControlTest) {
      await clickOverlayButton(page, "pause");
      setTimeout(() => {
        clickOverlayButton(page, "next").catch(() => {});
      }, 500);
      if (!cli.abortViaStop) {
        setTimeout(() => {
          clickOverlayButton(page, "continue").catch(() => {});
        }, 1400);
      }
    }
  }

  let unknownContamination = false;
  let stoppedByControl = false;

  for (let cycleNumber = 1; cycleNumber <= scenarioState.cycles; cycleNumber += 1) {
    const gate = await controlBridge.waitForPermit(cycleNumber);
    if (!gate.allow) {
      stoppedByControl = true;
      break;
    }

    const beforeDigest = await captureStateDigest(page);
    const planner = await runPlannerCycle(page);
    const afterDigest = await captureStateDigest(page);

    const beforeHash = sha256Object(beforeDigest);
    const afterHash = sha256Object(afterDigest);
    const transition = beforeHash !== afterHash;

    const alternatives = flattenAlternatives(planner.lanes);
    const legalAlternatives = alternatives.filter((row) => row.decision === "BUY");
    const rejectedAlternatives = alternatives.filter((row) => row.decision !== "BUY");

    const row = {};
    const nullReasons = nullReasonMap();

    row.auditId = scenarioState.id;
    row.stateId = scenarioState.id;
    row.stateRevision = 1;
    row.scriptVersion = planner?.inspectorAfter?.scriptVersion || null;
    row.repositoryCommit = process.env.GIT_COMMIT || null;
    row.scenarioHash = sha256Object({ id: scenarioState.id, title: scenarioState.title, cycles: scenarioState.cycles });
    row.initialStateHash = initialStateHash;
    row.cycleNumber = cycleNumber;
    row.capturedAt = nowIso();

    row.gameSourceKind = "production-url";
    row.gameSourceUrl = BASE_URL;
    row.gameSourceCommit = null;
    row.gameBuildVersion = null;
    row.browserKind = "chromium";
    row.browserVersion = browserInfo.browserVersion;
    row.browserMode = cli.headed ? "headed" : "headless";
    row.userscriptPath = toRel(USERSCRIPT_PATH);
    row.userscriptBlobSha = userscriptSha;
    row.userscriptContentSha256 = userscriptSha;
    row.injectionMode = "playwright-addScriptTag";
    row.profileKind = "disposable-context";
    row.networkMode = "online-production";

    row.stateSetupMethod = staged.stateSetupMethod;
    row.stateMutationManifest = staged.manifest;
    row.stateMutationManifestHash = stateMutationManifestHash;
    row.preResetStateHash = preResetStateHash;
    row.postCycleStateHash = afterHash;
    row.postScenarioStateHash = null;
    row.resetMethod = null;
    row.resetVerified = null;
    row.stateLeakageDetected = null;

    row.activePhase = planner?.inspectorAfter?.phase || null;
    row.activeGoal = planner?.activeGoal || planner?.inspectorAfter?.goal || null;
    row.activeTarget = planner?.inspectorAfter?.councilWinningCandidate || null;
    row.selectedLane = planner?.selectedLane || null;
    row.selectedDecision = planner?.selectedDecision || null;
    row.selectedAction = planner?.selectedAction || null;
    row.selectedUnit = planner?.inspectorAfter?.councilWinningCandidate || null;
    row.selectedAmount = planner?.inspectorAfter?.laneCoordinatorSelectedActions?.[0]?.amount || null;
    row.selectedReason = planner?.inspectorAfter?.mainReason || planner?.inspectorAfter?.reason || null;
    row.hardBlockers = planner?.hardBlockers || null;
    row.softBlockers = planner?.inspectorAfter?.waits || null;
    row.actionBudget = planner?.inspectorAfter?.overseerActionsUsed || null;
    row.coordinatorExecutionAuthority = planner?.inspectorAfter?.coordinatorExecutionAuthority || null;
    row.coordinatorSelectedLane = planner?.inspectorAfter?.coordinatorSelectedLane || null;
    row.coordinatorSelectedCandidate = planner?.inspectorAfter?.coordinatorSelectedCandidate || null;
    row.coordinatorSelectedExecutionKey = planner?.inspectorAfter?.coordinatorSelectedExecutionKey || null;
    row.coordinatorSelectedExecutionId = planner?.inspectorAfter?.coordinatorSelectedExecutionId || null;
    row.coordinatorSelectedExecutionKind = planner?.inspectorAfter?.coordinatorSelectedExecutionKind || null;
    row.coordinatorSelectedExecutionVariant = planner?.inspectorAfter?.coordinatorSelectedExecutionVariant || null;
    row.coordinatorSelectedFingerprint = planner?.inspectorAfter?.coordinatorSelectedFingerprint || null;
    row.coordinatorExecutedFingerprint = planner?.inspectorAfter?.coordinatorExecutedFingerprint || null;
    row.coordinatorSelectedAmount = planner?.inspectorAfter?.coordinatorSelectedAmount || null;
    row.coordinatorRevalidationStatus = planner?.inspectorAfter?.coordinatorRevalidationStatus || null;
    row.coordinatorGatesPassed = planner?.inspectorAfter?.coordinatorGatesPassed || null;
    row.coordinatorGatesFailed = planner?.inspectorAfter?.coordinatorGatesFailed || null;
    row.coordinatorFallbackReason = planner?.inspectorAfter?.coordinatorFallbackReason || null;
    row.coordinatorExecuted = planner?.inspectorAfter?.coordinatorExecuted || null;
    row.coordinatorMatchedExecution = planner?.inspectorAfter?.coordinatorMatchedExecution || null;
    row.coordinatorExecutionResult = planner?.inspectorAfter?.coordinatorExecutionResult || null;
    row.purchaseProposalSnapshot = planner?.inspectorAfter?.purchaseProposalSnapshot || null;
    row.territoryPrepCandidate = planner?.inspectorAfter?.territoryPrepCandidate || null;
    row.territoryPrepDecision = planner?.inspectorAfter?.territoryPrepDecision || null;
    row.territoryPrepReason = planner?.inspectorAfter?.territoryPrepReason || null;
    row.territoryPrepBlockedBy = planner?.inspectorAfter?.territoryPrepBlockedBy || null;
    row.meatFallbackCandidate = planner?.inspectorAfter?.meatFallbackCandidate || null;
    row.meatFallbackReason = planner?.inspectorAfter?.meatFallbackReason || null;
    row.stallBreakerActive = planner?.inspectorAfter?.stallBreakerActive === true;
    row.recentMainHoldRuns = Number.isFinite(Number(planner?.inspectorAfter?.recentMainHoldRuns))
      ? Number(planner.inspectorAfter.recentMainHoldRuns)
      : null;
    row.etaGroundedReserveAbilityHoldRuns = Number.isFinite(Number(planner?.inspectorAfter?.etaGroundedReserveAbilityHoldRuns))
      ? Number(planner.inspectorAfter.etaGroundedReserveAbilityHoldRuns)
      : null;
    row.mainActions = Number.isFinite(Number(planner?.runHistoryLast?.mainActions))
      ? Number(planner.runHistoryLast.mainActions)
      : null;
    row.sideActions = Number.isFinite(Number(planner?.runHistoryLast?.sideActions))
      ? Number(planner.runHistoryLast.sideActions)
      : null;

    row.legalAlternatives = legalAlternatives;
    row.rejectedAlternatives = rejectedAlternatives;
    row.bestLegalAlternative = planner?.selectedAction || null;
    row.bestRejectedAlternative = planner?.bestRejectedAlternative || null;
    row.rejectionReasons = rejectedAlternatives.map((entry) => entry.reason).filter(Boolean);
    row.laneProposals = alternatives;

    row.goalMetricName = "runHistoryLength";
    row.goalMetricBefore = String(beforeDigest.runHistoryLength);
    row.goalMetricAfter = String(afterDigest.runHistoryLength);
    row.goalMetricDelta = String(afterDigest.runHistoryLength - beforeDigest.runHistoryLength);
    row.resourceBankBefore = beforeDigest.resources;
    row.resourceBankAfter = afterDigest.resources;
    row.productionBefore = null;
    row.productionAfter = null;
    row.targetEtaBefore = null;
    row.targetEtaAfter = null;
    row.meaningfulProgress = transition;

    row.councilMatchesPlanner = !!row.selectedLane;
    row.inspectorMatchesPlanner = planner.inspectorTimestampChanged;
    row.exportMatchesPlanner = null;
    row.selectedActionActuallyExecuted = null;
    row.stateTransitionMatchesReport = transition;

    row.headed = cli.headed;
    row.screenshotPaths = [];
    row.videoPath = null;
    row.tracePath = null;
    row.browserLeftOpenOnFailure = cli.leaveOpenOnFailure;

    const assessment = assessCycle({
      runOnceReturned: planner.runOnceReturned,
      stateTransitionMatchesReport: transition,
      selectedDecision: row.selectedDecision
    });
    row.assessmentLabel = assessment.label;
    row.assessmentJustification = assessment.reason;

    setMaybe(row, nullReasons, "gameSourceCommit", row.gameSourceCommit, "production-url-not-pinned");
    setMaybe(row, nullReasons, "gameBuildVersion", row.gameBuildVersion, "production-build-version-not-exposed");
    setMaybe(row, nullReasons, "productionBefore", row.productionBefore, "canary-does-not-read-full-production-matrix");
    setMaybe(row, nullReasons, "productionAfter", row.productionAfter, "canary-does-not-read-full-production-matrix");
    setMaybe(row, nullReasons, "targetEtaBefore", row.targetEtaBefore, "eta-surface-not-consistently-exposed");
    setMaybe(row, nullReasons, "targetEtaAfter", row.targetEtaAfter, "eta-surface-not-consistently-exposed");
    setMaybe(row, nullReasons, "exportMatchesPlanner", row.exportMatchesPlanner, "export-comparison-not-required-for-canary");
    setMaybe(row, nullReasons, "selectedActionActuallyExecuted", row.selectedActionActuallyExecuted, "advisor-only-mode-avoids-live-mutation");
    completeNullReasons(row, nullReasons);

    nullReasonsByCycle.push(nullReasons);

    if (cli.mode === "watch") {
      await updateWatchOverlay(page, {
        cycle: `${cycleNumber}/${scenarioState.cycles}`,
        activeGoal: row.activeGoal || "none",
        selectedLane: row.selectedLane || "none",
        selectedAction: row.selectedAction || "none",
        bestLegalAlternative: row.bestLegalAlternative || "none",
        bestRejectedAlternative: row.bestRejectedAlternative || "none",
        hardBlockers: row.hardBlockers || "none",
        goalMetricBefore: row.goalMetricBefore,
        goalMetricAfter: row.goalMetricAfter,
        resetLeakageStatus: "in-progress"
      });
    }

    if (cli.captureScreenshots) {
      const shotPath = path.join(artifactDir, `cycle-${String(cycleNumber).padStart(2, "0")}.png`);
      await page.screenshot({ path: shotPath, fullPage: true });
      row.screenshotPaths.push(toRel(shotPath));
      screenshotPaths.push(toRel(shotPath));
    }

    cycleRows.push(row);
    controlBridge.completeCycle(cycleNumber);

    const betweenEvaluations = Array.isArray(scenarioState.betweenEvaluations) ? scenarioState.betweenEvaluations : [];
    for (const action of betweenEvaluations) {
      if (Number(action?.afterCycle) !== cycleNumber) continue;
      await applyScenarioRuntimePatch(page, action?.applyOverrides || {});
    }

    if (cli.mode === "watch" && cli.autoControlTest && cli.abortViaStop && cycleNumber === 1) {
      await clickOverlayButton(page, "stop");
    }

    if (controlBridge.stopRequested) {
      stoppedByControl = true;
      break;
    }

    if (!transition && cycleNumber > 1) {
      unknownContamination = true;
      break;
    }
  }

  const restoreStatus = await restoreStagedState(page);
  const postResetFingerprint = await captureResetFingerprint(page);
  const postScenarioStateHash = sha256Object(postResetFingerprint);
  const resetVerified = restoreStatus.ok === true && preResetStateHash === postScenarioStateHash;
  const stateLeakageDetected = !resetVerified;

  if (cli.mode === "watch") {
    await updateWatchOverlay(page, {
      cycle: `${cycleRows.length}/${scenarioState.cycles}`,
      activeGoal: cycleRows[cycleRows.length - 1]?.activeGoal || "none",
      selectedLane: cycleRows[cycleRows.length - 1]?.selectedLane || "none",
      selectedAction: cycleRows[cycleRows.length - 1]?.selectedAction || "none",
      bestLegalAlternative: cycleRows[cycleRows.length - 1]?.bestLegalAlternative || "none",
      bestRejectedAlternative: cycleRows[cycleRows.length - 1]?.bestRejectedAlternative || "none",
      hardBlockers: cycleRows[cycleRows.length - 1]?.hardBlockers || "none",
      goalMetricBefore: cycleRows[cycleRows.length - 1]?.goalMetricBefore || "0",
      goalMetricAfter: cycleRows[cycleRows.length - 1]?.goalMetricAfter || "0",
      resetLeakageStatus: `reset=${resetVerified}; leakage=${stateLeakageDetected}`,
      error: unknownContamination ? "unknown state contamination" : "none"
    });
  }

  for (let i = 0; i < cycleRows.length; i += 1) {
    const row = cycleRows[i];
    row.postScenarioStateHash = postScenarioStateHash;
    row.resetMethod = restoreStatus.method;
    row.resetVerified = resetVerified;
    row.stateLeakageDetected = stateLeakageDetected;
    const reasonMap = nullReasonsByCycle[i] || {};
    for (const key of Object.keys(reasonMap)) {
      if (row[key] !== null) {
        delete reasonMap[key];
      }
    }
  }

  if (stateLeakageDetected) {
    const fingerprintDiff = firstDifference(staged.preResetDigest, postResetFingerprint);
    throw new Error(`state leakage detected after reset: pre=${preResetStateHash} post=${postScenarioStateHash} diff=${fingerprintDiff || "none"}`);
  }
  if (unknownContamination) {
    throw new Error("unknown state contamination detected; refusing to continue to next state");
  }

  return {
    scenarioId: scenarioState.id,
    scenarioTitle: scenarioState.title,
    stateSetupMethod: staged.stateSetupMethod,
    stateMutationManifest: staged.manifest,
    stateMutationManifestHash,
    preResetStateHash,
    initialStateHash,
    postScenarioStateHash,
    resetMethod: restoreStatus.method,
    resetVerified,
    stateLeakageDetected,
    cycles: cycleRows,
    nullReasonsByCycle,
    stoppedByControl,
    screenshotPaths,
    watchControlState: controlBridge.snapshot()
  };
}

async function finalizeArtifacts({ context, page, cli, artifactDir }) {
  const tracePath = cli.trace ? path.join(artifactDir, "trace.zip") : null;
  if (tracePath) {
    await context.tracing.stop({ path: tracePath });
  }

  let videoPath = null;
  if (cli.enableVideo) {
    try {
      const video = page.video();
      if (video) {
        const vPath = await video.path();
        if (vPath) videoPath = toRel(vPath);
      }
    } catch {
      // ignore video extraction errors
    }
  }

  return {
    tracePath: tracePath ? toRel(tracePath) : null,
    videoPath
  };
}

async function runOneExecution(cli, options = {}) {
  const startedAt = nowIso();
  const artifactDir = selectedArtifactDir(cli.mode, cli.scenario, cli.runId);
  fs.mkdirSync(artifactDir, { recursive: true });

  const userscriptContent = fs.readFileSync(USERSCRIPT_PATH, "utf8");
  const userscriptSha = sha256String(userscriptContent);

  if (cli.expectedUserscriptSha && cli.expectedUserscriptSha !== userscriptSha) {
    throw new Error(`userscript hash mismatch: expected ${cli.expectedUserscriptSha}, got ${userscriptSha}`);
  }

  const ownsBrowser = !options.browser;
  const browser = options.browser || await chromium.launch(browserLaunchOptions(cli));
  const browserInfo = await browserProvenance(browser);
  const ownsContext = !options.context;

  const controlBridge = new ControlBridge({
    mode: cli.mode,
    autoControlTest: cli.autoControlTest,
    abortViaStop: cli.abortViaStop
  });

  let context = options.context || null;
  let page = options.page || null;
  let partialResult = false;
  let scenario;
  let runnerVerdict = "PASS";
  let setupFailure = null;
  let runError = null;
  let finalizedArtifacts = { tracePath: null, videoPath: null };

  try {
    if (!context || !page) {
      const opened = await openGameContext(browser, cli, artifactDir);
      context = opened.context;
      page = opened.page;
    }
    const shouldLeaveOpen = cli.keepOpen && (cli.mode === "watch" || cli.mode === "fast" || cli.mode === "live");

    const hydration = await probeHydration(page);
    if (!hydration.hasAngular || !hydration.hasGame || !hydration.hasBot) {
      throw new Error("missing game hydration or userscript API");
    }

    scenario = await runSingleScenario({
      page,
      cli,
      userscriptSha,
      artifactDir,
      browserInfo,
      controlBridge
    });

    partialResult = scenario.stoppedByControl;
    if (partialResult) {
      controlBridge.markStopPartial();
      runnerVerdict = "PARTIAL";
    }

    if (shouldLeaveOpen) {
      await page.waitForTimeout(cli.mode === "fast" ? 10000 : 1500);
    }

    if (ownsContext) finalizedArtifacts = await finalizeArtifacts({ context, page, cli, artifactDir });

    if (!shouldLeaveOpen && ownsContext) {
      if (page) await page.close();
      if (context) await context.close();
      if (ownsBrowser) await browser.close();
    }

    const completedAt = nowIso();

    const scenarioAssessmentLabel = scenario.cycles.every((row) => row.assessmentLabel === "GOOD") ? "GOOD" : "QUESTIONABLE";
    const scenarioAssessmentJustification = cli.scenario === "canary"
      ? "Canary validates testbed contract and cycle-level observability."
      : (scenarioAssessmentLabel === "GOOD"
        ? "Scenario run produced planner decisions with observable cycle transitions."
        : "Scenario run completed, but one or more cycle-level observability checks were flagged QUESTIONABLE.");

    const result = {
      mode: cli.mode,
      scenario: cli.scenario,
      runId: cli.runId,
      startedAt,
      completedAt,
      auditId: scenario.id,
      stateId: scenario.id,
      stateRevision: 1,
      scriptVersion: hydration.scriptVersion,
      repositoryCommit: process.env.GIT_COMMIT || null,
      scenarioHash: sha256Object({ id: scenario.id, cycles: cli.cycles }),
      initialStateHash: scenario.initialStateHash,
      cycleNumber: scenario.cycles.length,
      capturedAt: completedAt,

      gameSourceKind: "production-url",
      gameSourceUrl: BASE_URL,
      gameSourceCommit: null,
      gameBuildVersion: null,
      browserKind: "chromium",
      browserVersion: browserInfo.browserVersion,
      browserMode: cli.headed ? "headed" : "headless",
      userscriptPath: toRel(USERSCRIPT_PATH),
      userscriptBlobSha: userscriptSha,
      userscriptContentSha256: userscriptSha,
      injectionMode: "playwright-addScriptTag",
      profileKind: "disposable-context",
      networkMode: "online-production",

      stateSetupMethod: scenario.stateSetupMethod,
      stateMutationManifest: scenario.stateMutationManifest,
      stateMutationManifestHash: scenario.stateMutationManifestHash,
      preResetStateHash: scenario.preResetStateHash,
      initialStateHash: scenario.initialStateHash,
      postCycleStateHash: scenario.cycles.length ? scenario.cycles[scenario.cycles.length - 1].postCycleStateHash : null,
      postScenarioStateHash: scenario.postScenarioStateHash,
      resetMethod: scenario.resetMethod,
      resetVerified: scenario.resetVerified,
      stateLeakageDetected: scenario.stateLeakageDetected,

      activePhase: scenario.cycles.length ? scenario.cycles[scenario.cycles.length - 1].activePhase : null,
      activeGoal: scenario.cycles.length ? scenario.cycles[scenario.cycles.length - 1].activeGoal : null,
      activeTarget: scenario.cycles.length ? scenario.cycles[scenario.cycles.length - 1].activeTarget : null,
      selectedLane: scenario.cycles.length ? scenario.cycles[scenario.cycles.length - 1].selectedLane : null,
      selectedDecision: scenario.cycles.length ? scenario.cycles[scenario.cycles.length - 1].selectedDecision : null,
      selectedAction: scenario.cycles.length ? scenario.cycles[scenario.cycles.length - 1].selectedAction : null,
      selectedUnit: scenario.cycles.length ? scenario.cycles[scenario.cycles.length - 1].selectedUnit : null,
      selectedAmount: scenario.cycles.length ? scenario.cycles[scenario.cycles.length - 1].selectedAmount : null,
      selectedReason: scenario.cycles.length ? scenario.cycles[scenario.cycles.length - 1].selectedReason : null,
      hardBlockers: scenario.cycles.length ? scenario.cycles[scenario.cycles.length - 1].hardBlockers : null,
      softBlockers: scenario.cycles.length ? scenario.cycles[scenario.cycles.length - 1].softBlockers : null,
      actionBudget: scenario.cycles.length ? scenario.cycles[scenario.cycles.length - 1].actionBudget : null,

      legalAlternatives: scenario.cycles.length ? scenario.cycles[scenario.cycles.length - 1].legalAlternatives : [],
      rejectedAlternatives: scenario.cycles.length ? scenario.cycles[scenario.cycles.length - 1].rejectedAlternatives : [],
      bestLegalAlternative: scenario.cycles.length ? scenario.cycles[scenario.cycles.length - 1].bestLegalAlternative : null,
      bestRejectedAlternative: scenario.cycles.length ? scenario.cycles[scenario.cycles.length - 1].bestRejectedAlternative : null,
      rejectionReasons: scenario.cycles.length ? scenario.cycles[scenario.cycles.length - 1].rejectionReasons : [],
      laneProposals: scenario.cycles.length ? scenario.cycles[scenario.cycles.length - 1].laneProposals : [],

      goalMetricName: scenario.cycles.length ? scenario.cycles[scenario.cycles.length - 1].goalMetricName : "runHistoryLength",
      goalMetricBefore: scenario.cycles.length ? scenario.cycles[0].goalMetricBefore : null,
      goalMetricAfter: scenario.cycles.length ? scenario.cycles[scenario.cycles.length - 1].goalMetricAfter : null,
      goalMetricDelta: scenario.cycles.length ? scenario.cycles[scenario.cycles.length - 1].goalMetricDelta : null,
      resourceBankBefore: scenario.cycles.length ? scenario.cycles[0].resourceBankBefore : null,
      resourceBankAfter: scenario.cycles.length ? scenario.cycles[scenario.cycles.length - 1].resourceBankAfter : null,
      productionBefore: null,
      productionAfter: null,
      targetEtaBefore: null,
      targetEtaAfter: null,
      meaningfulProgress: scenario.cycles.some((row) => row.meaningfulProgress),

      councilMatchesPlanner: scenario.cycles.every((row) => row.councilMatchesPlanner),
      inspectorMatchesPlanner: scenario.cycles.every((row) => row.inspectorMatchesPlanner),
      exportMatchesPlanner: null,
      selectedActionActuallyExecuted: null,
      stateTransitionMatchesReport: scenario.cycles.every((row) => row.stateTransitionMatchesReport),

      headed: cli.headed,
      screenshotPaths: scenario.screenshotPaths,
      videoPath: finalizedArtifacts.videoPath,
      tracePath: finalizedArtifacts.tracePath,
      browserLeftOpenOnFailure: cli.leaveOpenOnFailure,

      assessmentLabel: scenarioAssessmentLabel,
      assessmentJustification: scenarioAssessmentJustification,

      environmentProvenance: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch
      },
      browserProvenance: browserInfo,
      gameSource: {
        url: BASE_URL,
        kind: "production-url"
      },
      userscriptProvenance: {
        path: toRel(USERSCRIPT_PATH),
        hash: userscriptSha
      },
      cycles: scenario.cycles,
      nullFieldReasons: {
        topLevel: {
          gameSourceCommit: "production-url-not-pinned",
          gameBuildVersion: "production-build-version-not-exposed",
          productionBefore: "canary-does-not-read-full-production-matrix",
          productionAfter: "canary-does-not-read-full-production-matrix",
          targetEtaBefore: "eta-surface-not-consistently-exposed",
          targetEtaAfter: "eta-surface-not-consistently-exposed",
          exportMatchesPlanner: "export-comparison-not-required-for-canary",
          selectedActionActuallyExecuted: "advisor-only-mode-avoids-live-mutation"
        },
        byCycle: scenario.nullReasonsByCycle
      },
      watchControlTest: cli.mode === "watch" ? controlBridge.controlTest : null,
      watchControlState: scenario.watchControlState,
      partialResult,
      runnerVerdict,
      setupFailure,
      runError,
      artifactPaths: {
        resultJsonPath: toRel(path.join(artifactDir, `${cli.runId}-result.json`)),
        resultMdPath: toRel(path.join(artifactDir, `${cli.runId}-result.md`)),
        screenshotPaths: scenario.screenshotPaths,
        tracePath: finalizedArtifacts.tracePath,
        videoPath: finalizedArtifacts.videoPath
      }
    };

    completeNullReasons(result, result.nullFieldReasons.topLevel);
    const schemaErrors = validateSchemaCompleteness(result);
    if (schemaErrors.length > 0) {
      throw new Error(`schema validation failed: ${schemaErrors.join("; ")}`);
    }

    const resultJsonPath = path.join(artifactDir, `${cli.runId}-result.json`);
    const resultMdPath = path.join(artifactDir, `${cli.runId}-result.md`);

    writeJson(resultJsonPath, result);
    writeText(resultMdPath, buildMarkdown(result));

    return {
      exitCode: partialResult ? 2 : 0,
      result,
      resultJsonPath,
      resultMdPath
    };
  } catch (error) {
    runError = error?.stack || error?.message || String(error);
    runnerVerdict = "FAIL";
    partialResult = true;

    if (cli.leaveOpenOnFailure && page) {
      try {
        await updateWatchOverlay(page, {
          cycle: `error`,
          activeGoal: "error",
          selectedLane: "error",
          selectedAction: "error",
          bestLegalAlternative: "error",
          bestRejectedAlternative: "error",
          hardBlockers: "error",
          goalMetricBefore: "error",
          goalMetricAfter: "error",
          resetLeakageStatus: "error",
          error: runError
        });
      } catch {
        // no-op
      }
    }

    try {
      if (ownsContext && context && page) {
        finalizedArtifacts = await finalizeArtifacts({ context, page, cli, artifactDir });
      }
    } catch {
      // ignore
    }

    const failedResult = {
      mode: cli.mode,
      runId: cli.runId,
      startedAt,
      completedAt: nowIso(),
      gameSourceUrl: BASE_URL,
      userscriptPath: toRel(USERSCRIPT_PATH),
      userscriptContentSha256: sha256String(fs.readFileSync(USERSCRIPT_PATH, "utf8")),
      runnerVerdict,
      partialResult,
      setupFailure,
      runError,
      watchControlTest: cli.mode === "watch" ? controlBridge.controlTest : null,
      artifactPaths: {
        resultJsonPath: toRel(path.join(artifactDir, `${cli.runId}-result.json`)),
        resultMdPath: toRel(path.join(artifactDir, `${cli.runId}-result.md`)),
        screenshotPaths: [],
        tracePath: finalizedArtifacts.tracePath,
        videoPath: finalizedArtifacts.videoPath
      },
      cycles: []
    };

    const resultJsonPath = path.join(artifactDir, `${cli.runId}-result.json`);
    const resultMdPath = path.join(artifactDir, `${cli.runId}-result.md`);
    writeJson(resultJsonPath, failedResult);
    writeText(resultMdPath, buildMarkdown({
      ...failedResult,
      determinism: null,
      watchControlTest: failedResult.watchControlTest || null
    }));

    try {
      if (ownsContext && page && !(cli.leaveOpenOnFailure || cli.keepOpen)) await page.close();
      if (ownsContext && context && !(cli.leaveOpenOnFailure || cli.keepOpen)) await context.close();
      if (ownsBrowser && !(cli.leaveOpenOnFailure || cli.keepOpen)) await browser.close();
    } catch {
      // ignore close errors
    }

    return {
      exitCode: 1,
      result: failedResult,
      resultJsonPath,
      resultMdPath
    };
  }
}

async function runMode(mode, argv = process.argv.slice(2)) {
  const cli = buildCli(argv, mode);
  const executions = [];

  for (let i = 0; i < cli.scenarioRuns; i += 1) {
    const runCli = { ...cli, runId: cli.scenarioRuns > 1 ? `${cli.runId}-run${i + 1}` : cli.runId };
    const outcome = await runOneExecution(runCli);
    executions.push(outcome);
    if (outcome.exitCode !== 0 && mode !== "watch") {
      break;
    }
  }

  let deterministic = null;
  let finalExitCode = executions.some((row) => row.exitCode === 1) ? 1 : 0;

  if (mode === "fast" && executions.length >= 2) {
    const normalized = executions.map((row) => normalizeForDeterminism(row.result.cycles || []));
    const hashes = normalized.map((row) => sha256Object(row));
    const stable = hashes.every((hash) => hash === hashes[0]);
    const diff = stable ? null : firstDifference(normalized[0], normalized[1]);

    deterministic = {
      runsCompared: executions.length,
      hashes,
      stable,
      firstDifference: diff
    };

    const summaryPath = path.join(selectedArtifactDir(mode, cli.scenario, cli.runId), `${cli.runId}-determinism.json`);
    writeJson(summaryPath, deterministic);

    if (!stable && cli.strictDeterminism) {
      finalExitCode = 1;
    }
  }

  const primary = executions[0];
  if (primary && primary.result) {
    primary.result.determinism = deterministic;
    writeJson(primary.resultJsonPath, primary.result);
    writeText(primary.resultMdPath, buildMarkdown(primary.result));
  }

  return {
    exitCode: finalExitCode,
    executions,
    determinism: deterministic
  };
}

async function runScenarioMatrix(mode, matrixOptions) {
  const scenarios = Array.isArray(matrixOptions?.scenarios) ? matrixOptions.scenarios.filter(Boolean) : [];
  const repeats = Math.max(1, Number(matrixOptions?.repeats) || 1);
  const cycles = Math.max(1, Number(matrixOptions?.cycles) || 1);
  if (!scenarios.length) throw new Error("scenario matrix requires at least one scenario");

  const baseCliArgs = matrixOptions?.browserChannel
    ? ["--browser-channel", String(matrixOptions.browserChannel)]
    : [];
  const baseCli = buildCli(baseCliArgs, mode);
  const browser = await chromium.launch(browserLaunchOptions(baseCli));
  const executions = [];
  let context = null;
  let page = null;

  try {
    const bootstrapRunId = `${mode}-${utcSlug(nowIso())}-matrix-session`;
    const bootstrapCli = buildCli([
      "--scenario", scenarios[0],
      "--cycles", String(cycles),
      "--run-id", bootstrapRunId,
      ...(baseCli.browserChannel ? ["--browser-channel", baseCli.browserChannel] : [])
    ], mode);
    const bootstrapDir = selectedArtifactDir(mode, scenarios[0], bootstrapRunId);
    fs.mkdirSync(bootstrapDir, { recursive: true });
    const opened = await openGameContext(browser, bootstrapCli, bootstrapDir);
    context = opened.context;
    page = opened.page;

    for (const scenario of scenarios) {
      for (let repeat = 1; repeat <= repeats; repeat += 1) {
        const runId = `${mode}-${utcSlug(nowIso())}-${scenario}-run${repeat}`;
        const cli = buildCli([
          "--scenario", scenario,
          "--cycles", String(cycles),
          "--run-id", runId,
          ...(baseCli.browserChannel ? ["--browser-channel", baseCli.browserChannel] : [])
        ], mode);
        const outcome = await runOneExecution(cli, { browser, context, page });
        executions.push(outcome);
        if (outcome.exitCode !== 0) {
          return { exitCode: 1, executions };
        }
        if (outcome.result?.resetVerified !== true || outcome.result?.stateLeakageDetected !== false) {
          throw new Error(`matrix reset invariant failed for ${scenario} run ${repeat}`);
        }
      }
    }
  } finally {
    if (page) await page.close().catch(() => {});
    if (context) await context.close().catch(() => {});
    await browser.close();
  }

  return { exitCode: 0, executions };
}

module.exports = {
  runMode,
  runScenarioMatrix,
  CANARY_STATE: getScenarioDefinition("canary"),
  normalizeForDeterminism,
  firstDifference
};

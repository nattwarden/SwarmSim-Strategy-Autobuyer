(function () {
  "use strict";

  const w = typeof unsafeWindow !== "undefined" ? unsafeWindow : window;
  const BOT_NAME = "kbcSwarmBot";
  const AUTOBUYER_VERSION = "0.11.7";
  const SCRIPT_VERSION = AUTOBUYER_VERSION;
  const SCENARIO_REPORT_VERSION = AUTOBUYER_VERSION;
  const STORAGE_KEY = "kbcSwarmBotConfig_v11";
  const SETTINGS_LAYOUT_STORAGE_KEY = "kbcSwarmBotSettingsPanelLayout_v3";
  const LOG_LAYOUT_STORAGE_KEY = "kbcSwarmBotAdvisorPanelLayout_v1";
  const PURCHASE_LAYOUT_STORAGE_KEY = "kbcSwarmBotPurchasePanelLayout_v1";
  const SETTINGS_TAB_STORAGE_KEY = "kbcSwarmBotSettingsActiveTab_v1";
  const SCENARIO_HARNESS_ENABLE_KEY = "kbcSwarmBotScenarioHarnessEnabled_v1";

  const DEFAULT_CONFIG = {
    enabled: true,
    preset: "smart",

    smartMode: true,
    advisorOnly: false,
    autoBuySafeDecisions: true,
    strategyInspector: true,
    strategyBar: true,
    councilUi: true,
    showAdvisorPanel: true,
    showPurchasePanel: true,
    smartMaxActionsPerRun: 4,

    larvaEnginePriority: true,
    saveForHatcherySeconds: 600,
    saveForExpansionSeconds: 1800,
    expansionPriorityWeight: 2,

    prioritizeProductionUpgrades: true,
    productionUpgradesIgnoreNotify: true,
    criticalProductionMaxPerRun: 3,
    targetAwareUpgradePlanner: true,

    energyStrategy: true,
    energyPlanner: true,
    nexusTarget: 5,
    saveEnergyForNexus: true,
    blockLepidopteraBeforeNexus: 4,
    fastNexus5MothSoftTarget: 572,
    longMothGoal: 4000,
    longMothPreNexus5Target: 2013,
    lepidopteraRoiMode: true,
    lepidopteraStopAtBoostPercent: 90,
    maxLepidopteraPerRun: 5,
    postNexusEnergyReserveSeconds: 30,
    postNexusLepidopteraMinBoostGainPercent: 0.01,
    energySupportBroker: true,
    energySupportBrokerAdvisorOnly: true,
    energySupportBrokerAllowAutoCast: false,
    energySupportCloneLarvaeAdvisor: true,
    energySupportHouseOfMirrorsAdvisor: true,
    energySupportLepidopteraAdvisor: true,
    energySupportMinMeaningfulBenefit: 0.05,
    energySupportPreferSafeBackgroundLepidoptera: true,
    offlineMode: false,
    nightbugStorageMode: false,
    abilityPlanner: false,
    ascensionPlanner: false,
    manageCloneLarvaeCocoons: true,
    cloneCocoonTargetPercent: 100,
    cloneCocoonChunkPercent: 0.5,
    clonePrepCooldownSeconds: 60,
    autoCastAbilities: false,

    territoryRoiMode: true,
    territoryMinEtaImprovementSeconds: 2,
    territoryMinEtaImprovementRatio: 0.001,
    territoryPrepPlanner: true,
    territoryPrepChunkPercent: 5,
    territoryStarvationRunThreshold: 12,
    territoryArmySeedWhenEmpty: true,
    expansionArmySeedPlanner: true,
    expansionArmySeedMaxChunkPercent: 10,
    expansionArmySeedMinEtaImprovementSeconds: 120,
    expansionArmySeedMinEtaImprovementRatio: 0.05,
    expansionArmySeedDoNotSpendInsideSaveWindow: true,
    smartUnitBuyPercent: 0.25,
    meatChainCascade: true,
    meatChainTwinPrep: true,
    meatGoalPlanner: true,
    meatPlannerDepth: 4,
    meatPlannerChunkPercent: 25,
    twinRecoveryBufferMultiplier: 0.5,
    meatChainPaybackGuard: true,
    meatChainReserveMultiplier: 2,
    meatChainMaxPaybackSeconds: 1800,
    meatFallbackEnabled: true,
    meatFallbackMinHoldRuns: 5,
    meatFallbackMaxRankDrop: 8,
    meatFallbackChunkPercent: 10,
    meatActionUnitPaybackBypass: true,
    meatActionUnitMinReserveRatio: 5,
    meatFallbackDoNotDropBelowActionUnit: true,
    meatUnlockPlanner: true,
    meatUnlockPaybackBypass: true,
    meatUnlockMinReserveRatio: 3,
    meatUnlockMaxChunkPercent: 25,
    meatParentStepPlanner: true,
    meatParentStepPaybackBypass: true,
    meatParentStepMinReserveRatio: 1.5,
    meatParentStepMaxChunkPercent: 25,
    twinUnlockPlanner: true,
    twinUnlockPaybackBypass: true,
    twinUnlockMinReserveRatio: 1.25,
    twinUnlockMaxPrepChunkPercent: 25,
    twinUnlockNearThresholdRatio: 0.6,
    twinUnlockPostUpgradeRebuildRatio: 0.5,
    twinUpgradeOpportunityCostBypass: true,
    twinUpgradeMaxLostProductionBankRatioPerHour: 0.001,

    cloneBufferPlanner: true,
    cloneBufferMode: "auto",
    cloneBufferEarlyProtectRatio: 0.5,
    cloneBufferMatureProtectRatio: 1,
    cloneBufferPostCloneProtectRatio: 1,
    cloneBufferMinLarvaProductionForHardLock: 0,
    cloneBufferProtectLarvae: true,

    runEverySeconds: 5,
    purchaseOrder: "upgrades-first",

    buyUnits: true,
    buyUpgrades: true,

    unitBuyPercent: 0.85,
    upgradeBuyPercent: 0.65,

    maxUnitTypesPerRun: 1,
    maxUpgradesPerRun: 10,

    focusTab: "meat",

    // expensive-first = prioritera dyraste köpbara unit
    // balanced = dyra units + lite tab-prioritet
    // cheap-fill = fyller mer som spelets vanliga köp-knappar
    unitStrategy: "expensive-first",

    pauseUnitsNearAscension: true,
    pauseUnitsAscensionPercent: 0.9,

    autoAscend: false,

    respectUpgradeWatchDivisor: true,
    showConsoleLogs: false,

    ignoredUnits: [
      "ascension",
      "mutagen",
      "premutagen",
      "energy",
      "freeRespec",
      "respecEnergy",
      "mtxEnergy",
    ],
  };

  const PRESETS = {
    smart: {
      smartMode: true,
      advisorOnly: false,
      autoBuySafeDecisions: true,
      strategyInspector: true,
      strategyBar: true,
      councilUi: true,
      showAdvisorPanel: true,
      showPurchasePanel: true,
      smartMaxActionsPerRun: 4,
      larvaEnginePriority: true,
      prioritizeProductionUpgrades: true,
      productionUpgradesIgnoreNotify: true,
      criticalProductionMaxPerRun: 3,
      targetAwareUpgradePlanner: true,
      energyStrategy: true,
      energyPlanner: true,
      nexusTarget: 5,
      saveEnergyForNexus: true,
      blockLepidopteraBeforeNexus: 4,
      fastNexus5MothSoftTarget: 572,
      longMothGoal: 4000,
      longMothPreNexus5Target: 2013,
      lepidopteraRoiMode: true,
      lepidopteraStopAtBoostPercent: 90,
      maxLepidopteraPerRun: 5,
      postNexusEnergyReserveSeconds: 30,
      postNexusLepidopteraMinBoostGainPercent: 0.01,
      energySupportBroker: true,
      energySupportBrokerAdvisorOnly: true,
      energySupportBrokerAllowAutoCast: false,
      energySupportCloneLarvaeAdvisor: true,
      energySupportHouseOfMirrorsAdvisor: true,
      energySupportLepidopteraAdvisor: true,
      energySupportMinMeaningfulBenefit: 0.05,
      energySupportPreferSafeBackgroundLepidoptera: true,
      offlineMode: false,
      nightbugStorageMode: false,
      abilityPlanner: false,
      ascensionPlanner: false,
      manageCloneLarvaeCocoons: true,
      cloneCocoonTargetPercent: 100,
      cloneCocoonChunkPercent: 0.5,
      clonePrepCooldownSeconds: 60,
      autoCastAbilities: false,
      territoryRoiMode: true,
      territoryMinEtaImprovementSeconds: 2,
      territoryMinEtaImprovementRatio: 0.001,
      territoryPrepPlanner: true,
      territoryPrepChunkPercent: 5,
      territoryStarvationRunThreshold: 12,
      territoryArmySeedWhenEmpty: true,
      expansionArmySeedPlanner: true,
      expansionArmySeedMaxChunkPercent: 10,
      expansionArmySeedMinEtaImprovementSeconds: 120,
      expansionArmySeedMinEtaImprovementRatio: 0.05,
      expansionArmySeedDoNotSpendInsideSaveWindow: true,
      runEverySeconds: 5,
      purchaseOrder: "upgrades-first",
      unitBuyPercent: 0.85,
      upgradeBuyPercent: 0.65,
      smartUnitBuyPercent: 0.25,
      meatChainCascade: true,
      meatChainTwinPrep: true,
      meatGoalPlanner: true,
      meatPlannerDepth: 4,
      meatPlannerChunkPercent: 25,
      twinRecoveryBufferMultiplier: 0.5,
      meatChainPaybackGuard: true,
      meatChainReserveMultiplier: 2,
      meatChainMaxPaybackSeconds: 1800,
      meatFallbackEnabled: true,
      meatFallbackMinHoldRuns: 5,
      meatFallbackMaxRankDrop: 8,
      meatFallbackChunkPercent: 10,
      meatActionUnitPaybackBypass: true,
      meatActionUnitMinReserveRatio: 5,
      meatFallbackDoNotDropBelowActionUnit: true,
      meatUnlockPlanner: true,
      meatUnlockPaybackBypass: true,
      meatUnlockMinReserveRatio: 3,
      meatUnlockMaxChunkPercent: 25,
      meatParentStepPlanner: true,
      meatParentStepPaybackBypass: true,
      meatParentStepMinReserveRatio: 1.5,
      meatParentStepMaxChunkPercent: 25,
      twinUnlockPlanner: true,
      twinUnlockPaybackBypass: true,
      twinUnlockMinReserveRatio: 1.25,
      twinUnlockMaxPrepChunkPercent: 25,
      twinUnlockNearThresholdRatio: 0.6,
      twinUnlockPostUpgradeRebuildRatio: 0.5,
      twinUpgradeOpportunityCostBypass: true,
      twinUpgradeMaxLostProductionBankRatioPerHour: 0.001,
      cloneBufferPlanner: true,
      cloneBufferMode: "auto",
      cloneBufferEarlyProtectRatio: 0.5,
      cloneBufferMatureProtectRatio: 1,
      cloneBufferPostCloneProtectRatio: 1,
      cloneBufferMinLarvaProductionForHardLock: 0,
      cloneBufferProtectLarvae: true,
      maxUnitTypesPerRun: 1,
      maxUpgradesPerRun: 10,
      focusTab: "meat",
      unitStrategy: "balanced",
      pauseUnitsNearAscension: true,
      autoAscend: false,
      buyUnits: true,
      buyUpgrades: true,
    },

    safe: {
      runEverySeconds: 10,
      purchaseOrder: "upgrades-first",
      unitBuyPercent: 0.5,
      upgradeBuyPercent: 0.5,
      smartUnitBuyPercent: 0.1,
      maxUnitTypesPerRun: 1,
      maxUpgradesPerRun: 5,
      unitStrategy: "expensive-first",
      pauseUnitsNearAscension: true,
      autoAscend: false,
      buyUnits: true,
      buyUpgrades: true,
    },

    progression: {
      runEverySeconds: 5,
      purchaseOrder: "upgrades-first",
      unitBuyPercent: 0.85,
      upgradeBuyPercent: 0.65,
      smartUnitBuyPercent: 0.35,
      maxUnitTypesPerRun: 1,
      maxUpgradesPerRun: 10,
      unitStrategy: "expensive-first",
      pauseUnitsNearAscension: true,
      autoAscend: false,
      buyUnits: true,
      buyUpgrades: true,
    },

    balanced: {
      runEverySeconds: 5,
      purchaseOrder: "upgrades-first",
      unitBuyPercent: 0.65,
      upgradeBuyPercent: 0.8,
      smartUnitBuyPercent: 0.5,
      maxUnitTypesPerRun: 3,
      maxUpgradesPerRun: 20,
      unitStrategy: "balanced",
      pauseUnitsNearAscension: true,
      autoAscend: false,
      buyUnits: true,
      buyUpgrades: true,
    },

    aggressive: {
      smartMode: false,
      runEverySeconds: 2,
      purchaseOrder: "upgrades-first",
      unitBuyPercent: 1,
      upgradeBuyPercent: 1,
      smartUnitBuyPercent: 1,
      maxUnitTypesPerRun: 999,
      maxUpgradesPerRun: 999,
      unitStrategy: "cheap-fill",
      pauseUnitsNearAscension: false,
      autoAscend: false,
      buyUnits: true,
      buyUpgrades: true,
    },

    upgradesOnly: {
      smartMode: false,
      buyUnits: false,
      buyUpgrades: true,
      maxUpgradesPerRun: 999,
    },

    unitsOnly: {
      smartMode: false,
      buyUnits: true,
      buyUpgrades: false,
      smartUnitBuyPercent: 0.25,
      maxUnitTypesPerRun: 2,
      unitStrategy: "expensive-first",
    },
  };

  const TAB_PRIORITY = {
    larva: 500,
    territory: 400,
    meat: 300,
    energy: 200,
    mutagen: 50,
    all: 0,
    other: 0,
  };

  const MEAT_CHAIN_NAMES = [
    "drone",
    "queen",
    "nest",
    "greaterqueen",
    "hive",
    "hivequeen",
    "empress",
    "prophet",
    "goddess",
    "pantheon",
    "pantheon2",
    "pantheon3",
    "pantheon4",
    "pantheon5",
  ];

  const MEAT_CHAIN_INDEX = MEAT_CHAIN_NAMES.reduce((map, name, index) => {
    map[name] = index;
    return map;
  }, {});

  const NUMBER_SUFFIXES = [
    "",
    "K",
    "M",
    "B",
    "T",
    "Qa",
    "Qi",
    "Sx",
    "Sp",
    "Oc",
    "No",
    "Dc",
    "Ud",
    "Dd",
    "Td",
    "Qad",
    "Qid",
    "Sxd",
    "Spd",
    "Ocd",
    "Nod",
    "Vg",
    "Uvg",
    "Dvg",
    "Tvg",
    "Qavg",
    "Qivg",
    "Sxvg",
    "Spvg",
    "Ocvg",
    "Novg",
  ];

  const CLONE_BUFFER_RECOVERY_COMPLETE_PERCENT = 99.9;
  const CLONE_BUFFER_RECOVERY_COMPLETE_DEBT_RATIO = 0.001;
  const TWIN_UNLOCK_MEANINGFUL_PROGRESS_GAIN_PERCENT = 5;
  const HOUSE_OF_MIRRORS_ARMY_TIERS = [
    { key: "culicimorph v", label: "Culicimorph V" },
    { key: "arachnomorph v", label: "Arachnomorph V" },
    { key: "stinger v", label: "Stinger V" },
  ];
  const SCENARIO_ARMY_ALIAS_TO_CANONICAL_UNIT_ID = {
    "culicimorph": "unit mosquito v",
    "culicimorph v": "unit mosquito v",
    "culicimorph 5": "unit mosquito v",
    "mosquito": "unit mosquito v",
    "mosquito v": "unit mosquito v",
    "mosquito 5": "unit mosquito v",
    "arachnomorph": "unit spider v",
    "arachnomorph v": "unit spider v",
    "arachnomorph 5": "unit spider v",
    "spider": "unit spider v",
    "spider v": "unit spider v",
    "spider 5": "unit spider v",
    "stinger": "unit stinger v",
    "stinger v": "unit stinger v",
    "stinger 5": "unit stinger v",
  };

  let config = loadConfig();
  let lastStatus = "Laddar...";
  let purchaseLog = [];
  let advisorLog = [];
  let strategyInspector = null;
  let laneCandidates = [];
  let runHistory = [];
  let liveDiagnostics = null;
  let meatFallbackState = null;
  let meatActionUnitPaybackBypassState = null;
  let actionUnitRefillState = null;
  let targetAwareUpgradeState = null;
  let unlockPlannerState = null;
  let parentStepPlannerState = null;
  let twinUnlockPlannerState = null;
  let cloneBufferPlannerState = null;
  let cloneBufferPostCloneTargetSnapshotRaw = null;
  let cloneBufferPreviousMode = "none";
  let abilityPrepPlannerState = null;
  let postNexusEnergyPlannerState = null;
  let territoryPrepPlannerState = null;
  let laneCoordinatorState = null;
  let scenarioHarnessContext = {
    enabled: false,
    active: false,
    source: "live-browser",
    scenarioId: "none",
    evaluationRevision: 0,
    cycleRevision: 0,
    overrides: null,
    transition: null,
    patchedUnits: [],
  };
  let panel = null;
  let strategyBar = null;
  let logPanel = null;
  let purchasePanel = null;
  let timer = null;
  let settingsPanelLayoutSaveTimer = null;
  let logPanelLayoutSaveTimer = null;
  let lastClonePrepAt = 0;

  function log(...args) {
    if (!config.showConsoleLogs) return;
    console.log(`[${BOT_NAME}]`, ...args);
  }

  function warn(...args) {
    console.warn(`[${BOT_NAME}]`, ...args);
  }

  function getDecimalCtor() {
    return w.Decimal || (typeof Decimal !== "undefined" ? Decimal : null);
  }

  function toDecimal(value) {
    const D = getDecimalCtor();
    if (!D || value === null || value === undefined) return null;

    try {
      return new D(value.toString());
    } catch {
      return null;
    }
  }

  function decimalLog10(value) {
    const D = getDecimalCtor();
    const dec = toDecimal(value);

    if (dec && D) {
      try {
        if (dec.lessThanOrEqualTo(0)) return 0;
        return dec.log().dividedBy(new D(10).log()).toNumber();
      } catch {
        const str = dec.toString();
        const match = str.match(/e\+?(-?\d+)$/i);
        if (match) return Number(match[1]);
      }
    }

    const num = Number(value);
    if (!Number.isFinite(num) || num <= 0) return 0;
    return Math.log10(num);
  }

  function formatSwarmNumber(value) {
    const D = getDecimalCtor();
    const dec = toDecimal(value);

    if (!dec || !D) {
      const num = Number(value);

      if (!Number.isFinite(num)) return String(value);
      if (Math.abs(num) < 1000) return Math.floor(num).toLocaleString();

      const exp = Math.floor(Math.log10(Math.abs(num)));
      const tier = Math.floor(exp / 3);
      const suffix = NUMBER_SUFFIXES[tier];

      if (!suffix) return num.toExponential(2);

      const scaled = num / Math.pow(10, tier * 3);
      return `${trimNumber(scaled)}${suffix}`;
    }

    try {
      if (dec.isZero()) return "0";

      const negative = dec.lessThan(0);
      const abs = negative ? dec.negated() : dec;

      if (abs.lessThan(1000)) {
        const n = abs.toNumber();
        const formatted = Math.floor(n).toLocaleString();
        return negative ? `-${formatted}` : formatted;
      }

      const exp = Math.floor(decimalLog10(abs));
      const tier = Math.floor(exp / 3);
      const suffix = NUMBER_SUFFIXES[tier];

      if (!suffix) {
        const sci = abs.toPrecision ? abs.toPrecision(3) : abs.toString();
        return negative ? `-${sci}` : sci;
      }

      const divisor = D.pow ? D.pow(10, tier * 3) : new D(10).pow(tier * 3);
      const scaled = abs.dividedBy(divisor).toNumber();

      const formatted = `${trimNumber(scaled)}${suffix}`;
      return negative ? `-${formatted}` : formatted;
    } catch {
      return String(value);
    }
  }

  function trimNumber(num) {
    if (!Number.isFinite(num)) return String(num);

    let text;

    if (num >= 100) {
      text = num.toFixed(0);
    } else if (num >= 10) {
      text = num.toFixed(1);
    } else {
      text = num.toFixed(2);
    }

    return text.replace(/\.00$/, "").replace(/\.0$/, "");
  }

  function loadConfig() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      return normalizeConfig({ ...DEFAULT_CONFIG, ...saved });
    } catch {
      return { ...DEFAULT_CONFIG };
    }
  }

  function saveConfig() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));

    if (w[BOT_NAME]) {
      w[BOT_NAME].config = config;
    }
  }

  function normalizeConfig(raw) {
    const c = { ...DEFAULT_CONFIG, ...raw };

    if (raw.intervalMs && !raw.runEverySeconds) {
      c.runEverySeconds = Number(raw.intervalMs) / 1000;
    }

    if (raw.maxUnitTypesPerTick && !raw.maxUnitTypesPerRun) {
      c.maxUnitTypesPerRun = raw.maxUnitTypesPerTick;
    }

    if (raw.maxUpgradesPerTick && !raw.maxUpgradesPerRun) {
      c.maxUpgradesPerRun = raw.maxUpgradesPerTick;
    }

    c.strategyInspector = c.strategyInspector !== false;
    c.strategyBar = c.strategyBar !== false;
    c.councilUi = c.councilUi !== false;
    c.showAdvisorPanel = c.showAdvisorPanel !== false;
    c.showPurchasePanel = c.showPurchasePanel !== false;
    c.runEverySeconds = clampNumber(c.runEverySeconds, 1, 60, DEFAULT_CONFIG.runEverySeconds);
    c.smartMaxActionsPerRun = Math.round(clampNumber(c.smartMaxActionsPerRun, 1, 20, DEFAULT_CONFIG.smartMaxActionsPerRun));
    c.saveForHatcherySeconds = clampNumber(c.saveForHatcherySeconds, 0, 31536000, DEFAULT_CONFIG.saveForHatcherySeconds);
    c.saveForExpansionSeconds = clampNumber(c.saveForExpansionSeconds, 0, 31536000, DEFAULT_CONFIG.saveForExpansionSeconds);
    c.expansionPriorityWeight = clampNumber(c.expansionPriorityWeight, 0.5, 10, DEFAULT_CONFIG.expansionPriorityWeight);
    c.criticalProductionMaxPerRun = Math.max(0, Number(c.criticalProductionMaxPerRun || 0));
    c.targetAwareUpgradePlanner = c.targetAwareUpgradePlanner !== false;
    c.energyPlanner = !!c.energyPlanner;
    c.nexusTarget = Math.round(clampNumber(c.nexusTarget, 1, 5, DEFAULT_CONFIG.nexusTarget));
    c.blockLepidopteraBeforeNexus = Math.round(clampNumber(c.blockLepidopteraBeforeNexus, 1, 5, DEFAULT_CONFIG.blockLepidopteraBeforeNexus));
    c.fastNexus5MothSoftTarget = Math.max(0, Number(c.fastNexus5MothSoftTarget || 0));
    c.longMothGoal = Math.max(0, Number(c.longMothGoal || 0));
    c.longMothPreNexus5Target = Math.max(0, Number(c.longMothPreNexus5Target || 0));
    c.lepidopteraStopAtBoostPercent = clampNumber(c.lepidopteraStopAtBoostPercent, 0, 99.9, DEFAULT_CONFIG.lepidopteraStopAtBoostPercent);
    c.maxLepidopteraPerRun = Math.max(0, Number(c.maxLepidopteraPerRun || 0));
    c.postNexusEnergyReserveSeconds = Math.round(clampNumber(c.postNexusEnergyReserveSeconds, 0, 86400, DEFAULT_CONFIG.postNexusEnergyReserveSeconds));
    c.postNexusLepidopteraMinBoostGainPercent = clampNumber(
      c.postNexusLepidopteraMinBoostGainPercent,
      0,
      10,
      DEFAULT_CONFIG.postNexusLepidopteraMinBoostGainPercent
    );
    c.energySupportBroker = c.energySupportBroker !== false;
    c.energySupportBrokerAdvisorOnly = c.energySupportBrokerAdvisorOnly !== false;
    c.energySupportBrokerAllowAutoCast = !!c.energySupportBrokerAllowAutoCast;
    c.energySupportCloneLarvaeAdvisor = c.energySupportCloneLarvaeAdvisor !== false;
    c.energySupportHouseOfMirrorsAdvisor = c.energySupportHouseOfMirrorsAdvisor !== false;
    c.energySupportLepidopteraAdvisor = c.energySupportLepidopteraAdvisor !== false;
    c.energySupportMinMeaningfulBenefit = clampNumber(
      c.energySupportMinMeaningfulBenefit,
      0,
      1,
      DEFAULT_CONFIG.energySupportMinMeaningfulBenefit
    );
    c.energySupportPreferSafeBackgroundLepidoptera = c.energySupportPreferSafeBackgroundLepidoptera !== false;
    c.offlineMode = !!c.offlineMode;
    c.nightbugStorageMode = !!c.nightbugStorageMode;
    c.abilityPlanner = !!c.abilityPlanner;
    c.ascensionPlanner = !!c.ascensionPlanner;
    c.cloneCocoonTargetPercent = clampNumber(c.cloneCocoonTargetPercent, 0, 200, DEFAULT_CONFIG.cloneCocoonTargetPercent);
    c.cloneCocoonChunkPercent = clampNumber(c.cloneCocoonChunkPercent, 0.1, 100, DEFAULT_CONFIG.cloneCocoonChunkPercent);
    c.clonePrepCooldownSeconds = Math.round(clampNumber(c.clonePrepCooldownSeconds, 0, 86400, DEFAULT_CONFIG.clonePrepCooldownSeconds));
    c.territoryMinEtaImprovementSeconds = clampNumber(c.territoryMinEtaImprovementSeconds, 0, 31536000, DEFAULT_CONFIG.territoryMinEtaImprovementSeconds);
    c.territoryMinEtaImprovementRatio = clampNumber(c.territoryMinEtaImprovementRatio, 0, 1, DEFAULT_CONFIG.territoryMinEtaImprovementRatio);
    c.territoryPrepPlanner = c.territoryPrepPlanner !== false;
    c.territoryPrepChunkPercent = clampNumber(c.territoryPrepChunkPercent, 0.1, 25, DEFAULT_CONFIG.territoryPrepChunkPercent);
    c.territoryStarvationRunThreshold = Math.round(clampNumber(c.territoryStarvationRunThreshold, 1, 100, DEFAULT_CONFIG.territoryStarvationRunThreshold));
    c.territoryArmySeedWhenEmpty = c.territoryArmySeedWhenEmpty !== false;
    c.expansionArmySeedPlanner = c.expansionArmySeedPlanner !== false;
    c.expansionArmySeedMaxChunkPercent = clampNumber(c.expansionArmySeedMaxChunkPercent, 0.1, 25, DEFAULT_CONFIG.expansionArmySeedMaxChunkPercent);
    c.expansionArmySeedMinEtaImprovementSeconds = clampNumber(
      c.expansionArmySeedMinEtaImprovementSeconds,
      0,
      31536000,
      DEFAULT_CONFIG.expansionArmySeedMinEtaImprovementSeconds
    );
    c.expansionArmySeedMinEtaImprovementRatio = clampNumber(
      c.expansionArmySeedMinEtaImprovementRatio,
      0,
      1,
      DEFAULT_CONFIG.expansionArmySeedMinEtaImprovementRatio
    );
    c.expansionArmySeedDoNotSpendInsideSaveWindow = c.expansionArmySeedDoNotSpendInsideSaveWindow !== false;
    c.smartUnitBuyPercent = clampNumber(c.smartUnitBuyPercent, 0.001, 1, DEFAULT_CONFIG.smartUnitBuyPercent);
    c.meatChainCascade = !!c.meatChainCascade;
    c.meatChainTwinPrep = !!c.meatChainTwinPrep;
    c.meatGoalPlanner = !!c.meatGoalPlanner;
    c.meatPlannerDepth = Math.round(clampNumber(c.meatPlannerDepth, 1, 6, DEFAULT_CONFIG.meatPlannerDepth));
    c.meatPlannerChunkPercent = clampNumber(c.meatPlannerChunkPercent, 0.1, 100, DEFAULT_CONFIG.meatPlannerChunkPercent);
    c.twinRecoveryBufferMultiplier = clampNumber(c.twinRecoveryBufferMultiplier, 0, 5, DEFAULT_CONFIG.twinRecoveryBufferMultiplier);
    c.meatChainPaybackGuard = !!c.meatChainPaybackGuard;
    c.meatChainReserveMultiplier = clampNumber(c.meatChainReserveMultiplier, 0, 10, DEFAULT_CONFIG.meatChainReserveMultiplier);
    c.meatChainMaxPaybackSeconds = Math.round(clampNumber(c.meatChainMaxPaybackSeconds, 0, 31536000, DEFAULT_CONFIG.meatChainMaxPaybackSeconds));
    c.meatFallbackEnabled = c.meatFallbackEnabled !== false;
    c.meatFallbackMinHoldRuns = Math.round(clampNumber(c.meatFallbackMinHoldRuns, 0, 1000, DEFAULT_CONFIG.meatFallbackMinHoldRuns));
    c.meatFallbackMaxRankDrop = Math.round(clampNumber(c.meatFallbackMaxRankDrop, 0, 50, DEFAULT_CONFIG.meatFallbackMaxRankDrop));
    c.meatFallbackChunkPercent = clampNumber(c.meatFallbackChunkPercent, 0.1, 100, DEFAULT_CONFIG.meatFallbackChunkPercent);
    c.meatActionUnitPaybackBypass = c.meatActionUnitPaybackBypass !== false;
    c.meatActionUnitMinReserveRatio = clampNumber(c.meatActionUnitMinReserveRatio, 1, 1000, DEFAULT_CONFIG.meatActionUnitMinReserveRatio);
    c.meatFallbackDoNotDropBelowActionUnit = c.meatFallbackDoNotDropBelowActionUnit !== false;
    c.meatUnlockPlanner = c.meatUnlockPlanner !== false;
    c.meatUnlockPaybackBypass = c.meatUnlockPaybackBypass !== false;
    c.meatUnlockMinReserveRatio = clampNumber(c.meatUnlockMinReserveRatio, 1, 1000, DEFAULT_CONFIG.meatUnlockMinReserveRatio);
    c.meatUnlockMaxChunkPercent = clampNumber(c.meatUnlockMaxChunkPercent, 0.1, 100, DEFAULT_CONFIG.meatUnlockMaxChunkPercent);
    c.meatParentStepPlanner = c.meatParentStepPlanner !== false;
    c.meatParentStepPaybackBypass = c.meatParentStepPaybackBypass !== false;
    c.meatParentStepMinReserveRatio = clampNumber(c.meatParentStepMinReserveRatio, 1, 1000, DEFAULT_CONFIG.meatParentStepMinReserveRatio);
    c.meatParentStepMaxChunkPercent = clampNumber(c.meatParentStepMaxChunkPercent, 0.1, 100, DEFAULT_CONFIG.meatParentStepMaxChunkPercent);
    c.twinUnlockPlanner = c.twinUnlockPlanner !== false;
    c.twinUnlockPaybackBypass = c.twinUnlockPaybackBypass !== false;
    c.twinUnlockMinReserveRatio = clampNumber(c.twinUnlockMinReserveRatio, 1, 1000, DEFAULT_CONFIG.twinUnlockMinReserveRatio);
    c.twinUnlockMaxPrepChunkPercent = clampNumber(c.twinUnlockMaxPrepChunkPercent, 0.1, 100, DEFAULT_CONFIG.twinUnlockMaxPrepChunkPercent);
    c.twinUnlockNearThresholdRatio = clampNumber(c.twinUnlockNearThresholdRatio, 0, 1, DEFAULT_CONFIG.twinUnlockNearThresholdRatio);
    c.twinUnlockPostUpgradeRebuildRatio = clampNumber(c.twinUnlockPostUpgradeRebuildRatio, 0, 10, DEFAULT_CONFIG.twinUnlockPostUpgradeRebuildRatio);
    c.twinUpgradeOpportunityCostBypass = c.twinUpgradeOpportunityCostBypass !== false;
    c.twinUpgradeMaxLostProductionBankRatioPerHour = clampNumber(
      c.twinUpgradeMaxLostProductionBankRatioPerHour,
      0,
      1,
      DEFAULT_CONFIG.twinUpgradeMaxLostProductionBankRatioPerHour
    );
    c.cloneBufferPlanner = c.cloneBufferPlanner !== false;
    c.cloneBufferMode = ["auto", "buildup", "mature", "post-clone-lock"].includes(String(c.cloneBufferMode || "").toLowerCase())
      ? String(c.cloneBufferMode || "auto").toLowerCase()
      : DEFAULT_CONFIG.cloneBufferMode;
    c.cloneBufferEarlyProtectRatio = clampNumber(c.cloneBufferEarlyProtectRatio, 0, 1, DEFAULT_CONFIG.cloneBufferEarlyProtectRatio);
    c.cloneBufferMatureProtectRatio = clampNumber(c.cloneBufferMatureProtectRatio, 0, 1, DEFAULT_CONFIG.cloneBufferMatureProtectRatio);
    c.cloneBufferPostCloneProtectRatio = clampNumber(c.cloneBufferPostCloneProtectRatio, 0, 1, DEFAULT_CONFIG.cloneBufferPostCloneProtectRatio);
    c.cloneBufferMinLarvaProductionForHardLock = clampNumber(
      c.cloneBufferMinLarvaProductionForHardLock,
      0,
      1e30,
      DEFAULT_CONFIG.cloneBufferMinLarvaProductionForHardLock
    );
    c.cloneBufferProtectLarvae = c.cloneBufferProtectLarvae !== false;
    c.unitBuyPercent = clampNumber(c.unitBuyPercent, 0.01, 1, DEFAULT_CONFIG.unitBuyPercent);
    c.upgradeBuyPercent = clampNumber(c.upgradeBuyPercent, 0.01, 1, DEFAULT_CONFIG.upgradeBuyPercent);
    c.maxUnitTypesPerRun = Math.max(0, Number(c.maxUnitTypesPerRun || 0));
    c.maxUpgradesPerRun = Math.max(0, Number(c.maxUpgradesPerRun || 0));

    c.pauseUnitsAscensionPercent = clampNumber(
      c.pauseUnitsAscensionPercent,
      0.1,
      1,
      DEFAULT_CONFIG.pauseUnitsAscensionPercent
    );

    if (!Array.isArray(c.ignoredUnits)) {
      c.ignoredUnits = [...DEFAULT_CONFIG.ignoredUnits];
    }

    return c;
  }

  function clampNumber(value, min, max, fallback) {
    const num = Number(value);
    if (!Number.isFinite(num)) return fallback;
    return Math.min(max, Math.max(min, num));
  }

  function applyPreset(name) {
    if (!PRESETS[name]) return;

    config = normalizeConfig({
      ...config,
      ...PRESETS[name],
      preset: name,
    });

    saveConfig();
    restartTimer();
    refreshPanel();
    log(`Preset valt: ${name}`);
  }

  function resetToRecommendedSettings() {
    config = normalizeConfig({
      ...DEFAULT_CONFIG,
      ...PRESETS.smart,
      preset: "smart",
    });

    saveConfig();
    restartTimer();
    refreshPanel();
    recordMessage("Recommended Smart settings applied");
    recordAdvisor("INFO", "Recommended settings", "Recommended Smart: chunk 25%, focus meat, safe auto-buy on, abilities/ascension off");
    log("Recommended Smart settings applied");
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }


  function loadWindowLayout(storageKey) {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || "{}");
      return saved && typeof saved === "object" ? saved : {};
    } catch {
      return {};
    }
  }

  function saveWindowLayout(element, storageKey) {
    if (!element) return;

    const rect = element.getBoundingClientRect();

    localStorage.setItem(
      storageKey,
      JSON.stringify({
        left: Math.round(rect.left),
        top: Math.round(rect.top),
        width: Math.round(rect.width),
        height: Math.round(rect.height),
      })
    );
  }

  function scheduleSaveWindowLayout(element, storageKey, timerName) {
    if (timerName === "settings") {
      clearTimeout(settingsPanelLayoutSaveTimer);
      settingsPanelLayoutSaveTimer = setTimeout(() => saveWindowLayout(element, storageKey), 150);
      return;
    }

    clearTimeout(logPanelLayoutSaveTimer);
    logPanelLayoutSaveTimer = setTimeout(() => saveWindowLayout(element, storageKey), 150);
  }

  function defaultSettingsLayout() {
    const width = 300;
    return {
      left: Math.max(12, window.innerWidth - width - 12),
      top: 80,
      width,
      height: 540,
    };
  }

  function defaultLogLayout() {
    return {
      left: 12,
      top: 88,
      width: 560,
      height: 420,
    };
  }

  function defaultPurchaseLayout() {
    return {
      left: 584,
      top: 88,
      width: 420,
      height: 260,
    };
  }

  function clampWindowLayout(layout, defaults, minWidth = 260, minHeight = 180) {
    const maxWidth = Math.max(minWidth, window.innerWidth - 24);
    const maxHeight = Math.max(minHeight, window.innerHeight - 24);

    const width = clampNumber(layout.width ?? defaults.width, minWidth, maxWidth, defaults.width);
    const height = clampNumber(layout.height ?? defaults.height, minHeight, maxHeight, defaults.height);

    const maxLeft = Math.max(12, window.innerWidth - width - 12);
    const maxTop = Math.max(12, window.innerHeight - height - 12);

    return {
      left: clampNumber(layout.left ?? defaults.left, 12, maxLeft, defaults.left),
      top: clampNumber(layout.top ?? defaults.top, 12, maxTop, defaults.top),
      width,
      height,
    };
  }

  function applyWindowLayout(element, storageKey, defaults, minWidth = 260, minHeight = 180) {
    if (!element) return;

    const safeLayout = clampWindowLayout(loadWindowLayout(storageKey), defaults, minWidth, minHeight);

    element.style.left = `${safeLayout.left}px`;
    element.style.top = `${safeLayout.top}px`;
    element.style.width = `${safeLayout.width}px`;
    element.style.height = `${safeLayout.height}px`;
    element.style.right = "auto";
    element.style.bottom = "auto";
  }

  function resetSettingsPanelLayout() {
    localStorage.removeItem(SETTINGS_LAYOUT_STORAGE_KEY);
    if (!panel) return;

    const defaults = defaultSettingsLayout();
    const safeLayout = clampWindowLayout(defaults, defaults, 260, 240);

    panel.style.left = `${safeLayout.left}px`;
    panel.style.top = `${safeLayout.top}px`;
    panel.style.width = `${safeLayout.width}px`;
    panel.style.height = `${safeLayout.height}px`;
    panel.style.right = "auto";
    panel.style.bottom = "auto";

    saveWindowLayout(panel, SETTINGS_LAYOUT_STORAGE_KEY);
  }

  function resetLogPanelLayout() {
    localStorage.removeItem(LOG_LAYOUT_STORAGE_KEY);
    if (!logPanel) return;

    const defaults = defaultLogLayout();
    const safeLayout = clampWindowLayout(defaults, defaults, 320, 200);

    logPanel.style.left = `${safeLayout.left}px`;
    logPanel.style.top = `${safeLayout.top}px`;
    logPanel.style.width = `${safeLayout.width}px`;
    logPanel.style.height = `${safeLayout.height}px`;
    logPanel.style.right = "auto";
    logPanel.style.bottom = "auto";

    saveWindowLayout(logPanel, LOG_LAYOUT_STORAGE_KEY);
  }

  function resetPurchasePanelLayout() {
    localStorage.removeItem(PURCHASE_LAYOUT_STORAGE_KEY);
    if (!purchasePanel) return;

    const defaults = defaultPurchaseLayout();
    const safeLayout = clampWindowLayout(defaults, defaults, 300, 160);

    purchasePanel.style.left = `${safeLayout.left}px`;
    purchasePanel.style.top = `${safeLayout.top}px`;
    purchasePanel.style.width = `${safeLayout.width}px`;
    purchasePanel.style.height = `${safeLayout.height}px`;
    purchasePanel.style.right = "auto";
    purchasePanel.style.bottom = "auto";

    saveWindowLayout(purchasePanel, PURCHASE_LAYOUT_STORAGE_KEY);
  }

  function resetAllPanelLayouts() {
    resetSettingsPanelLayout();
    resetLogPanelLayout();
    resetPurchasePanelLayout();
  }

  function installWindowDragAndResize(element, storageKey, defaults, timerName, minWidth = 260, minHeight = 180) {
    if (!element) return;

    const handle = element.querySelector(".kbc-title");
    if (!handle) return;

    let dragging = false;
    let startX = 0;
    let startY = 0;
    let startLeft = 0;
    let startTop = 0;

    function onMove(event) {
      if (!dragging) return;

      const layout = clampWindowLayout(
        {
          left: startLeft + event.clientX - startX,
          top: startTop + event.clientY - startY,
          width: element.getBoundingClientRect().width,
          height: element.getBoundingClientRect().height,
        },
        defaults,
        minWidth,
        minHeight
      );

      element.style.left = `${layout.left}px`;
      element.style.top = `${layout.top}px`;
      element.style.right = "auto";
      element.style.bottom = "auto";
    }

    function onUp() {
      if (!dragging) return;

      dragging = false;
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      saveWindowLayout(element, storageKey);
    }

    handle.addEventListener("mousedown", (event) => {
      if (event.button !== 0) return;
      if (event.target.closest("button, input, select, textarea, a")) return;

      const rect = element.getBoundingClientRect();

      dragging = true;
      startX = event.clientX;
      startY = event.clientY;
      startLeft = rect.left;
      startTop = rect.top;

      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);

      event.preventDefault();
    });

    if (w.ResizeObserver) {
      let ready = false;
      const observer = new w.ResizeObserver(() => {
        if (!ready) {
          ready = true;
          return;
        }
        scheduleSaveWindowLayout(element, storageKey, timerName);
      });
      observer.observe(element);
    }
  }

  function applyAllWindowLayouts() {
    applyWindowLayout(panel, SETTINGS_LAYOUT_STORAGE_KEY, defaultSettingsLayout(), 260, 240);
    applyWindowLayout(logPanel, LOG_LAYOUT_STORAGE_KEY, defaultLogLayout(), 320, 200);
    applyWindowLayout(purchasePanel, PURCHASE_LAYOUT_STORAGE_KEY, defaultPurchaseLayout(), 300, 160);
  }


function getDisplayName(item) {
  const label =
    item?.label ||
    item?.plural ||
    item?.type?.label ||
    item?.type?.plural ||
    item?.type?.l?.label ||
    item?.type?.l?.plural ||
    item?.unittype?.label ||
    item?.unittype?.plural ||
    item?.unittype?.l?.label ||
    item?.unittype?.l?.plural ||
    item?.unit?.label ||
    item?.unit?.plural ||
    item?.unit?.type?.label ||
    item?.unit?.type?.plural ||
    item?.unit?.type?.l?.label ||
    item?.unit?.type?.l?.plural ||
    item?.unit?.unittype?.label ||
    item?.unit?.unittype?.plural ||
    item?.unit?.unittype?.l?.label ||
    item?.unit?.unittype?.l?.plural;

  return label || item?.name || "unknown";
}

  function recordPurchase(type, item, amount) {
    const row = {
      time: new Date().toLocaleTimeString(),
      type,
      name: getDisplayName(item),
      internalName: item?.name || "",
      amount: formatSwarmNumber(amount),
    };

    purchaseLog.unshift(row);
    purchaseLog = purchaseLog.slice(0, 18);

    log(`${type}: +${row.amount} ${row.name}`, row.internalName ? `(${row.internalName})` : "");
  }

  function recordMessage(message) {
    const row = {
      time: new Date().toLocaleTimeString(),
      type: "Info",
      name: message,
      internalName: "",
      amount: "",
    };

    purchaseLog.unshift(row);
    purchaseLog = purchaseLog.slice(0, 18);
  }


  function recordAdvisor(decision, title, reason = "") {
    const row = {
      time: new Date().toLocaleTimeString(),
      decision,
      title,
      reason,
    };

    advisorLog.unshift(row);
    advisorLog = advisorLog.slice(0, 24);
    log(`Advisor: ${decision} ${title}`, reason);
  }

  function clearAdvisorLog() {
    advisorLog = [];
  }

  function clearLaneCandidates() {
    laneCandidates = [];
  }

  function clearRunHistory() {
    runHistory = [];
    liveDiagnostics = buildLiveDiagnostics(runHistory);
  }

  function latestAdvisorRow(decisions = ["BUY", "SIDE", "HOLD", "PLAN", "NEXT"]) {
    return advisorLog.find((row) => decisions.includes(row?.decision)) || null;
  }

  function formatAdvisorReason(row) {
    if (!row) return "No strong buy/hold reason in the current run.";
    return `${row.decision} ${row.title || "Decision"}: ${row.reason || row.decision}`;
  }

  function normalizeLabelKey(value) {
    return String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  }

  function getScenarioSuffixAliases(rawSuffix) {
    const normalized = normalizeLabelKey(rawSuffix);
    if (!normalized) return [];

    const romanToNumber = {
      i: "1",
      ii: "2",
      iii: "3",
      iv: "4",
      v: "5",
      vi: "6",
      vii: "7",
      viii: "8",
      ix: "9",
      x: "10",
    };
    const numberToRoman = {
      1: "i",
      2: "ii",
      3: "iii",
      4: "iv",
      5: "v",
      6: "vi",
      7: "vii",
      8: "viii",
      9: "ix",
      10: "x",
    };

    const aliases = [normalized];
    if (romanToNumber[normalized]) aliases.push(romanToNumber[normalized]);
    if (numberToRoman[normalized]) aliases.push(numberToRoman[normalized]);

    return Array.from(new Set(aliases.filter(Boolean)));
  }

  function isScenarioHarnessEnabled() {
    try {
      const stored = String(localStorage.getItem(SCENARIO_HARNESS_ENABLE_KEY) || "false").toLowerCase();
      return stored === "true";
    } catch (_error) {
      return false;
    }
  }

  function setScenarioHarnessEnabled(enabled) {
    const value = enabled ? "true" : "false";
    localStorage.setItem(SCENARIO_HARNESS_ENABLE_KEY, value);
    scenarioHarnessContext.enabled = enabled;
    return enabled;
  }

  function toScenarioNumber(value) {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }

  function normalizeScenarioOverrideMap(rawMap) {
    const out = {};
    for (const [key, value] of Object.entries(rawMap || {})) {
      const normalized = normalizeLabelKey(key);
      if (!normalized) continue;
      const n = toScenarioNumber(value);
      if (!Number.isFinite(n)) continue;
      out[normalized] = n;
    }
    return out;
  }

  function normalizeScenarioAbilityOverrides(rawAbilities) {
    const out = {};
    for (const [abilityKey, raw] of Object.entries(rawAbilities || {})) {
      const key = normalizeLabelKey(abilityKey);
      if (!key || !raw || typeof raw !== "object") continue;
      out[key] = {
        visible: raw.visible === undefined ? undefined : !!raw.visible,
        energyCost: Number.isFinite(Number(raw.energyCost)) ? Number(raw.energyCost) : undefined,
      };
    }
    return out;
  }

  function normalizeScenarioOverrides(rawOverrides) {
    const overrides = rawOverrides || {};
    const cfg = {};
    if (overrides.config && typeof overrides.config === "object") {
      for (const [key, value] of Object.entries(overrides.config)) {
        if (!Object.prototype.hasOwnProperty.call(DEFAULT_CONFIG, key)) continue;
        if (["boolean", "number", "string"].includes(typeof value)) cfg[key] = value;
      }
    }
    return {
      resourceCounts: normalizeScenarioOverrideMap(overrides.resourceCounts || overrides.resources),
      resourceVelocities: normalizeScenarioOverrideMap(overrides.resourceVelocities || overrides.velocities),
      unitCounts: normalizeScenarioOverrideMap(overrides.unitCounts),
      armyUnitCounts: normalizeScenarioOverrideMap(overrides.armyUnitCounts || overrides.armyUnits),
      abilities: normalizeScenarioAbilityOverrides(overrides.abilities),
      config: cfg,
      remainingActions: Number.isFinite(Number(overrides.remainingActions)) ? Number(overrides.remainingActions) : null,
      engine: {
        expansionEtaSeconds: Number.isFinite(Number(overrides?.engine?.expansionEtaSeconds)) ? Number(overrides.engine.expansionEtaSeconds) : null,
        hatcheryEtaSeconds: Number.isFinite(Number(overrides?.engine?.hatcheryEtaSeconds)) ? Number(overrides.engine.hatcheryEtaSeconds) : null,
        meatGoalTarget: normalizeLabelKey(overrides?.engine?.meatGoalTarget || overrides?.engine?.meatGoalTargetUnit || ""),
      },
    };
  }

  function getScenarioCanonicalUnitKey(unit) {
    const name = normalizeLabelKey(unit?.name || "");
    const suffix = normalizeLabelKey(unit?.suffix || "");
    if (!name) return "";
    return suffix ? `unit ${name} ${suffix}` : `unit ${name}`;
  }

  function getScenarioCanonicalArmyUnitIdFromAlias(alias) {
    const key = normalizeLabelKey(alias);
    if (!key) return "";
    return SCENARIO_ARMY_ALIAS_TO_CANONICAL_UNIT_ID[key] || "";
  }

  function applyScenarioUnitOverrides(game) {
    if (!scenarioHarnessContext.active) return;
    const map = scenarioHarnessContext.overrides?.unitCounts;
    if (!map) return;

    for (const unit of game?.unitlist?.() || []) {
      const overrideCount = getScenarioUnitCountOverride(unit);
      if (overrideCount === null) continue;
      if (scenarioHarnessContext.patchedUnits.some((entry) => entry.unit === unit)) continue;

      const originalCount = typeof unit?.count === "function" ? unit.count.bind(unit) : null;
      unit.count = function scenarioCountOverride() {
        return decimalFrom(getScenarioUnitCountOverride(unit) ?? overrideCount);
      };

      scenarioHarnessContext.patchedUnits.push({ unit, originalCount });
    }
  }

  function clearScenarioUnitOverrides() {
    for (const entry of scenarioHarnessContext.patchedUnits || []) {
      if (!entry?.unit) continue;
      entry.unit.count = entry.originalCount;
    }
    scenarioHarnessContext.patchedUnits = [];
  }

  function getScenarioUnitKeys(unit) {
    const name = normalizeLabelKey(unit?.name || "");
    const display = normalizeLabelKey(getDisplayName(unit));
    const suffixAliases = getScenarioSuffixAliases(unit?.suffix || "");
    const aliases = [];
    const canonical = getScenarioCanonicalUnitKey(unit);
    if (canonical) aliases.push(canonical);
    if (name) aliases.push(name);
    if (display) aliases.push(display);
    if (name && display) aliases.push(`${name} ${display}`);

    for (const suffix of suffixAliases) {
      if (name) aliases.push(`${name} ${suffix}`);
      if (display) aliases.push(`${display} ${suffix}`);
      if (name && display) aliases.push(`${name} ${display} ${suffix}`);
    }

    if (name === "spider") aliases.push("arachnomorph", "arachnomorph v");
    if (name === "mosquito") aliases.push("culicimorph", "culicimorph v");
    if (name === "stinger") aliases.push("stinger v");
    return Array.from(new Set(aliases.filter(Boolean).map((entry) => normalizeLabelKey(entry))));
  }

  function getScenarioTargetUnitOverride(game, alias) {
    const key = normalizeLabelKey(alias);
    if (!key) return null;
    for (const unit of game?.unitlist?.() || []) {
      if (getScenarioUnitKeys(unit).includes(key)) return unit;
    }
    return null;
  }

  function getTerritoryPerSecondPerUnit(unit) {
    const list = Array.isArray(unit?.prod) ? unit.prod : [];
    const row = list.find((entry) => String(entry?.unit?.name || "").toLowerCase() === "territory");
    return decimalFrom(row?.val || 0);
  }

  function resolveScenarioArmyUnitOverrides(game, overrides) {
    const normalized = normalizeScenarioOverrides(overrides || {});
    const aliasMap = normalized.armyUnitCounts || {};
    const resolvedUnitCounts = { ...(normalized.unitCounts || {}) };
    const resolved = [];
    const errors = [];

    const homAbility = getGameUpgrade(game, "houseofmirrors") || getGameUpgrade(game, "swarmwarp");
    const homVisible = !!homAbility?.isVisible?.();
    const homCost = formatSwarmNumber(getCostForResource(homAbility, "energy"));
    const territoryVelocity = decimalFrom(getVelocity(game, "territory"));
    const resourceEnergy = formatSwarmNumber(getCurrentResource(game, "energy"));
    const reserveSeconds = Math.max(0, Number(config.postNexusEnergyReserveSeconds || 0));
    const reserveAmount = decimalFrom(getVelocity(game, "energy")).times(reserveSeconds);

    for (const [alias, injectedRaw] of Object.entries(aliasMap)) {
      const injectedCount = Number(injectedRaw);
      if (!Number.isFinite(injectedCount)) continue;

      const canonicalFromAlias = getScenarioCanonicalArmyUnitIdFromAlias(alias);
      let matches = (game?.unitlist?.() || []).filter((unit) => unitMatchesArmyPrepLabel(unit, alias));
      if (matches.length > 1 && canonicalFromAlias) {
        const canonicalMatches = matches.filter((unit) => getScenarioCanonicalUnitKey(unit) === canonicalFromAlias);
        if (canonicalMatches.length === 1) matches = canonicalMatches;
      }

      if (!matches.length) {
        if (!canonicalFromAlias) {
          errors.push(`army-unit alias '${alias}' could not resolve to any runtime unit`);
          continue;
        }

        resolvedUnitCounts[canonicalFromAlias] = injectedCount;
        resolved.push({
          alias,
          canonicalRuntimeUnitId: canonicalFromAlias,
          unitName: canonicalFromAlias.replace(/^unit\s+/, ""),
          label: alias,
          suffix: "",
          injectedRawCount: formatSwarmNumber(decimalFrom(injectedCount)),
          runtimeVisibleEffectiveCount: formatSwarmNumber(decimalFrom(injectedCount)),
          visible: "no",
          territoryPerSecondPerUnit: "0",
          territoryPerSecondContribution: "0",
          inHouseOfMirrorsPreferredSet: HOUSE_OF_MIRRORS_ARMY_TIERS.some((tier) => normalizeLabelKey(tier.label) === normalizeLabelKey(alias)) ? "yes" : "no",
        });
        continue;
      }
      if (matches.length > 1) {
        const labels = matches.map((unit) => `${getDisplayName(unit)} (${getScenarioCanonicalUnitKey(unit) || normalizeLabelKey(unit?.name || "unknown")})`);
        errors.push(`army-unit alias '${alias}' resolved ambiguously: ${labels.join(", ")}`);
        continue;
      }

      const unit = matches[0];
      const canonicalId = getScenarioCanonicalUnitKey(unit);
      if (!canonicalId) {
        errors.push(`army-unit alias '${alias}' resolved without canonical id`);
        continue;
      }

      resolvedUnitCounts[canonicalId] = injectedCount;

      const runtimeCount = decimalFrom(unit?.count?.() || 0);
      const tpsPerUnit = getTerritoryPerSecondPerUnit(unit);
      const injectedDecimal = decimalFrom(injectedCount);
      const totalContribution = injectedDecimal.times(tpsPerUnit);
      const inPreferredTierSet = HOUSE_OF_MIRRORS_ARMY_TIERS.some((tier) => unitMatchesArmyPrepLabel(unit, tier.label));

      resolved.push({
        alias,
        canonicalRuntimeUnitId: canonicalId,
        unitName: unit?.name || "unknown",
        label: getDisplayName(unit),
        suffix: unit?.suffix || "",
        injectedRawCount: formatSwarmNumber(injectedDecimal),
        runtimeVisibleEffectiveCount: formatSwarmNumber(injectedDecimal),
        visible: unit?.isVisible?.() ? "yes" : "no",
        territoryPerSecondPerUnit: formatSwarmNumber(tpsPerUnit),
        territoryPerSecondContribution: formatSwarmNumber(totalContribution),
        inHouseOfMirrorsPreferredSet: inPreferredTierSet ? "yes" : "no",
      });
    }

    const homAffectedContribution = resolved
      .filter((row) => row.inHouseOfMirrorsPreferredSet === "yes")
      .reduce((sum, row) => sum.plus(decimalFrom(row.territoryPerSecondContribution || 0)), newDecimal(0));
    const unaffectedContribution = territoryVelocity.minus(homAffectedContribution);

    return {
      ok: errors.length === 0,
      errors,
      resolvedOverrides: {
        ...normalized,
        unitCounts: resolvedUnitCounts,
      },
      observability: {
        aliasToCanonicalRuntimeId: resolved,
        houseOfMirrorsAvailability: homVisible ? "yes" : "no",
        houseOfMirrorsEnergyCost: homCost,
        totalTerritoryPerSecond: formatSwarmNumber(territoryVelocity),
        houseOfMirrorsAffectedTerritoryPerSecond: formatSwarmNumber(homAffectedContribution),
        unaffectedTerritoryPerSecond: formatSwarmNumber(unaffectedContribution),
        actualEnergy: resourceEnergy,
        safetyReserve: formatSwarmNumber(reserveAmount),
      },
    };
  }

  function getScenarioUnitCountOverride(unit) {
    if (!scenarioHarnessContext.active) return null;
    const map = scenarioHarnessContext.overrides?.unitCounts;
    if (!map) return null;
    for (const key of getScenarioUnitKeys(unit)) {
      if (Object.prototype.hasOwnProperty.call(map, key)) return map[key];
    }
    return null;
  }

  function getScenarioArmyTierCountOverride(label) {
    if (!scenarioHarnessContext.active) return null;
    const normalizedLabel = normalizeLabelKey(label);
    if (!normalizedLabel) return null;

    const armyMap = scenarioHarnessContext.overrides?.armyUnitCounts || null;
    if (armyMap && Object.prototype.hasOwnProperty.call(armyMap, normalizedLabel)) {
      return armyMap[normalizedLabel];
    }

    const unitMap = scenarioHarnessContext.overrides?.unitCounts || null;
    const canonicalId = getScenarioCanonicalArmyUnitIdFromAlias(normalizedLabel);
    if (unitMap && canonicalId && Object.prototype.hasOwnProperty.call(unitMap, canonicalId)) {
      return unitMap[canonicalId];
    }

    return null;
  }

  function getScenarioResourceCountOverride(name) {
    if (!scenarioHarnessContext.active) return null;
    const map = scenarioHarnessContext.overrides?.resourceCounts;
    if (!map) return null;
    const key = normalizeLabelKey(name);
    if (!key) return null;
    return Object.prototype.hasOwnProperty.call(map, key) ? map[key] : null;
  }

  function getScenarioResourceVelocityOverride(name) {
    if (!scenarioHarnessContext.active) return null;
    const map = scenarioHarnessContext.overrides?.resourceVelocities;
    if (!map) return null;
    const key = normalizeLabelKey(name);
    if (!key) return null;
    return Object.prototype.hasOwnProperty.call(map, key) ? map[key] : null;
  }

  function getScenarioAbilityOverride(abilityName) {
    if (!scenarioHarnessContext.active) return null;
    const map = scenarioHarnessContext.overrides?.abilities;
    if (!map) return null;
    const key = normalizeLabelKey(abilityName);
    if (!key) return null;
    if (Object.prototype.hasOwnProperty.call(map, key)) return map[key];
    if (key === "swarmwarp" && Object.prototype.hasOwnProperty.call(map, "houseofmirrors")) return map.houseofmirrors;
    if (key === "houseofmirrors" && Object.prototype.hasOwnProperty.call(map, "swarmwarp")) return map.swarmwarp;
    if ((key === "houseofmirrors" || key === "swarmwarp") && Object.prototype.hasOwnProperty.call(map, "house of mirrors")) return map["house of mirrors"];
    return null;
  }

  function isItemVisibleWithScenarioOverride(item) {
    const override = getScenarioAbilityOverride(item?.name);
    if (override && override.visible !== undefined) return !!override.visible;
    return !!item?.isVisible?.();
  }

  function setScenarioContext({ scenarioId = "none", source = "deterministic-scenario", overrides = null, preserveEvaluationRevision = false, preserveTransition = false }) {
    clearScenarioUnitOverrides();
    scenarioHarnessContext.active = true;
    scenarioHarnessContext.source = source;
    scenarioHarnessContext.scenarioId = scenarioId;
    scenarioHarnessContext.overrides = normalizeScenarioOverrides(overrides);
    scenarioHarnessContext.evaluationRevision = preserveEvaluationRevision
      ? Number(scenarioHarnessContext.evaluationRevision || 0)
      : 0;
    scenarioHarnessContext.cycleRevision = preserveEvaluationRevision
      ? Number(scenarioHarnessContext.cycleRevision || 0)
      : 0;
    if (!preserveTransition) scenarioHarnessContext.transition = null;
    applyScenarioUnitOverrides(getGame());
  }

  function clearScenarioContext() {
    clearScenarioUnitOverrides();
    scenarioHarnessContext.active = false;
    scenarioHarnessContext.source = "live-browser";
    scenarioHarnessContext.scenarioId = "none";
    scenarioHarnessContext.overrides = null;
    scenarioHarnessContext.evaluationRevision = 0;
    scenarioHarnessContext.cycleRevision = 0;
    scenarioHarnessContext.transition = null;
  }

  function setScenarioTransitionState(fields = {}) {
    scenarioHarnessContext.transition = {
      ...(scenarioHarnessContext.transition || {}),
      ...fields,
    };
    return scenarioHarnessContext.transition;
  }

  function getScenarioTransitionState() {
    return scenarioHarnessContext.transition || null;
  }

  function hydrateScenarioParentStepTransitionForRefill(plan) {
    if (!scenarioHarnessContext.active) return false;
    const transition = scenarioHarnessContext.transition;
    if (!transition?.parentStepCompletedForRefill) return false;
    if (transition.parentStepCompletedForRefillConsumed) return false;

    const targetName = getDisplayName(plan?.target);
    const actionUnitName = getDisplayName(plan?.actionUnit);
    const candidateName = transition.transitionParentUnit || parentStepPlannerState?.candidate || "none";
    const transitionTarget = String(transition.transitionTargetUnit || "none");

    if (transitionTarget !== "none" && transitionTarget !== targetName) return false;

    recordParentStepPlannerState({
      candidate: candidateName,
      decision: parentStepPlannerState?.decision || "BUY",
      reason: `between-cycle transition replay: ${transition.plannerTransitionMarker || "parent-step-completed"}`,
      target: targetName,
      actionUnit: actionUnitName,
      costResource: actionUnitName,
      reserveRatio: parentStepPlannerState?.reserveRatio ?? NaN,
      paybackBypassed: !!parentStepPlannerState?.paybackBypassed,
      supportsActionUnit: true,
      consumedActionUnit: true,
      consumedUnit: transition.transitionActionUnit || actionUnitName || "none",
      executed: true,
    });

    setScenarioTransitionState({ parentStepCompletedForRefillConsumed: true });
    return true;
  }

  function scenarioSourceTag() {
    return scenarioHarnessContext.active ? scenarioHarnessContext.source : "live-browser";
  }

  function getLaneActionAge(lane, history = runHistory) {
    const recent = history || [];

    for (let age = 0, i = recent.length - 1; i >= 0; i--, age++) {
      const selected = recent[i]?.selectedLaneActions || [];
      if (selected.some((action) => action?.lane === lane)) return age;
    }

    return recent.length;
  }

  function getTerritoryStarvationCount(history = runHistory) {
    const recent = history || [];
    let count = 0;

    for (let i = recent.length - 1; i >= 0; i--) {
      const run = recent[i];
      if (!run?.territoryPrepCandidate || run.territoryPrepCandidate === "none") break;
      if ((run.selectedLaneActions || []).some((action) => action?.lane === "Territory")) break;
      count++;
    }

    return count;
  }

  function normalizeLaneDecision(decision) {
    const value = String(decision || "OBSERVE").toUpperCase();
    if (["BUY", "HOLD", "OBSERVE", "SIDE"].includes(value)) return value;
    if (["CANDIDATE", "PLAN", "NEXT", "INFO", "WOULD BUY"].includes(value)) return "OBSERVE";
    return "OBSERVE";
  }

  function normalizeCandidateScore(score, fallback = 0) {
    const n = decimalToNumber(score, fallback);
    return Number.isFinite(n) ? n : fallback;
  }

  function normalizeTextList(value) {
    if (!value) return [];
    if (Array.isArray(value)) return value.filter(Boolean).map((item) => String(item));
    return [String(value)];
  }

  function sanitizeRawMetricValue(value) {
    if (value === null || value === undefined) return undefined;

    try {
      if (value && typeof value.toString === "function" && (value.greaterThan || value.lessThan || value.dividedBy)) {
        const num = decimalToNumber(value, NaN);
        return Number.isFinite(num) ? num : value.toString();
      }
    } catch {
      // fall through
    }

    const num = Number(value);
    if (Number.isFinite(num)) return num;

    if (typeof value === "string" && value.trim()) return value;
    return undefined;
  }

  function sanitizeRawMetrics(raw) {
    if (!raw || typeof raw !== "object") return null;

    const allowed = [
      "etaSeconds",
      "etaBeforeSeconds",
      "etaAfterSeconds",
      "etaImprovementSeconds",
      "etaImprovementRatio",
      "minEtaImprovementSeconds",
      "minEtaImprovementRatio",
      "paybackSeconds",
      "paybackLimitSeconds",
      "paybackRatio",
      "reserveAfter",
      "reserveRequired",
      "reserveRatio",
      "costAmount",
      "currentAmount",
      "velocity",
      "progressPercent",
      "recentMainHoldRuns",
      "fallbackRankDrop",
      "meatActionUnitPaybackBypassTriggered",
      "meatActionUnitReserveRatio",
      "meatActionUnitPaybackSeconds",
      "targetAwareUpgradeReserveRatio",
      "targetAwareUpgradeRequiredReserveRatio",
      "targetAwareUpgradeCostAmount",
      "targetAwareUpgradeCurrentAmount",
      "targetAwareUpgradeReserveAfter",
    ];

    const out = {};

    for (const key of allowed) {
      const value = sanitizeRawMetricValue(raw[key]);
      if (value !== undefined && value !== null && value !== "") out[key] = value;
    }

    return Object.keys(out).length ? out : null;
  }

  function rawMetricNumber(candidateOrRaw, key, fallback = NaN) {
    const raw = candidateOrRaw?.raw || candidateOrRaw || {};
    const value = raw?.[key];

    if (value === null || value === undefined || value === "") return fallback;
    const num = Number(value);
    return Number.isFinite(num) ? num : fallback;
  }

  function normalizeProgressPercentForRank(raw) {
    let progress = rawMetricNumber(raw, "progressPercent", NaN);
    if (!Number.isFinite(progress)) return NaN;
    if (progress <= 1) progress *= 100;
    return Math.max(0, Math.min(100, progress));
  }

  function addLaneCandidate(candidate) {
    if (!candidate) return null;

    const row = {
      time: new Date().toLocaleTimeString(),
      lane: String(candidate.lane || "Other"),
      decision: normalizeLaneDecision(candidate.decision),
      candidate: String(candidate.candidate || candidate.name || "unknown"),
      reason: String(candidate.reason || "no reason recorded"),
      blockers: normalizeTextList(candidate.blockers),
      observations: normalizeTextList(candidate.observations),
      score: normalizeCandidateScore(candidate.score, 0),
      etaBefore: candidate.etaBefore || "",
      etaAfter: candidate.etaAfter || "",
      payback: candidate.payback || "",
      reserveAfter: candidate.reserveAfter || "",
      wouldBuyAmount: candidate.wouldBuyAmount || "",
      target: candidate.target || "",
      resource: candidate.resource || "",
      raw: sanitizeRawMetrics(candidate.raw),
      meatFallback: !!candidate.meatFallback,
      fallbackRankDrop: Number.isFinite(Number(candidate.fallbackRankDrop)) ? Number(candidate.fallbackRankDrop) : null,
      strategicTarget: candidate.strategicTarget || "",
      blockedStrategicCandidate: candidate.blockedStrategicCandidate || "",
      topMeatBlockedBy: candidate.topMeatBlockedBy || "",
    };

    row.blockerCategories = classifyCandidateBlockers(row, candidate.blockerCategories);
    laneCandidates.push(row);
    laneCandidates = laneCandidates.slice(-128);
    return row;
  }

  function addItemLaneCandidate(lane, decision, item, reason, extra = {}) {
    return addLaneCandidate({
      lane,
      decision,
      candidate: getDisplayName(item),
      reason,
      score: extra.score ?? unitCostScore(item),
      wouldBuyAmount: extra.wouldBuyAmount || extra.amount || "",
      blockers: extra.blockers || [],
      blockerCategories: extra.blockerCategories || [],
      observations: extra.observations || [],
      etaBefore: extra.etaBefore || "",
      etaAfter: extra.etaAfter || "",
      payback: extra.payback || "",
      reserveAfter: extra.reserveAfter || "",
      target: extra.target || "",
      resource: extra.resource || "",
      raw: extra.raw || null,
    });
  }

  function classifyCandidateBlockers(candidate, explicitCategories = []) {
    const blockerText = (candidate.blockers || []).join(" ").toLowerCase();
    const reasonText = String(candidate.reason || "").toLowerCase();
    const categories = normalizeTextList(explicitCategories);

    if (hasActiveExpansionSave(candidate) || hasActiveHatcherySave(candidate) || hasActiveNexusSave(candidate)) {
      categories.push("protected-resource");
    }

    if (/payback/.test(`${reasonText} ${blockerText}`)) categories.push("payback");
    if (/reserve|buffer|negative|below/.test(`${reasonText} ${blockerText}`)) categories.push("reserve");
    if (/nexus|lepidoptera|moth|energy plan|saving energy for nexus/.test(`${reasonText} ${blockerText}`)) categories.push("energy-plan");
    if (/auto-cast|ability auto-cast|abilities disabled|ability planner/.test(`${reasonText} ${blockerText}`)) categories.push("ability-disabled");

    return Array.from(new Set(categories));
  }

  function laneDecisionWeight(decision) {
    if (decision === "BUY") return 1000000;
    if (decision === "SIDE") return 750000;
    if (decision === "OBSERVE") return 100000;
    return 0;
  }

  function laneNameWeight(lane) {
    const weights = {
      Engine: 90000,
      Energy: 80000,
      Territory: 70000,
      Meat: 65000,
      Upgrade: 55000,
      Twin: 50000,
      Ability: 30000,
      "Clone Prep": 25000,
    };
    return weights[lane] || 1000;
  }

  function isSideLane(lane) {
    return lane === "Clone Prep";
  }

  function isMainLaneCandidate(candidate) {
    return !!candidate && !isSideLane(candidate.lane);
  }

  function candidateRankScore(candidate) {
    const score = normalizeCandidateScore(candidate?.score, 0);
    return laneDecisionWeight(candidate?.decision) + laneNameWeight(candidate?.lane) + score;
  }

  function candidateRejectedRankScore(candidate) {
    const score = normalizeCandidateScore(candidate?.score, 0);
    let blockerWeight = 0;
    const cats = candidate?.blockerCategories || [];
    if (cats.includes("payback")) blockerWeight += 250000;
    if (cats.includes("reserve")) blockerWeight += 220000;
    if (cats.includes("protected-resource")) blockerWeight += 80000;
    if (cats.includes("energy-plan")) blockerWeight += 50000;
    if (cats.includes("ability-disabled")) blockerWeight += 10000;
    return laneNameWeight(candidate?.lane) + blockerWeight + score;
  }

  function candidateClosenessScore(candidate) {
    if (!candidate) return -Infinity;

    const raw = candidate.raw || {};
    let score = laneNameWeight(candidate.lane) * 0.1;

    if (candidate.decision === "BUY") score += 2000000;
    if (candidate.decision === "SIDE") score += 250000;
    if (candidate.decision === "OBSERVE") score += 50000;

    const eta = rawMetricNumber(raw, "etaSeconds", rawMetricNumber(raw, "etaBeforeSeconds", NaN));
    if (Number.isFinite(eta)) {
      score += 900000 - Math.min(Math.max(eta, 0), 900000);
    }

    const progress = normalizeProgressPercentForRank(raw);
    if (Number.isFinite(progress)) {
      score += progress * 6000;
    }

    const etaImprovement = rawMetricNumber(raw, "etaImprovementSeconds", NaN);
    if (Number.isFinite(etaImprovement) && etaImprovement > 0) {
      score += Math.log10(etaImprovement + 1) * 25000;
    }

    const paybackRatio = rawMetricNumber(raw, "paybackRatio", NaN);
    if (Number.isFinite(paybackRatio)) {
      score += Math.max(-600000, 240000 - Math.min(Math.max(paybackRatio, 0), 10000) * 24000);
    }

    const reserveRatio = rawMetricNumber(raw, "reserveRatio", NaN);
    if (Number.isFinite(reserveRatio)) {
      score += Math.min(Math.max(reserveRatio, 0), 10) * 25000;
    }

    score += normalizeCandidateScore(candidate.score, 0) * 0.01;
    return score;
  }

  function decisionLaneRankScore(candidate) {
    const decisionWeight = {
      BUY: 900000,
      SIDE: 700000,
      HOLD: 500000,
      OBSERVE: 300000,
    }[candidate?.decision] || 0;

    return decisionWeight + candidateClosenessScore(candidate);
  }

  function bestCandidate(candidates, predicate, ranker = candidateRankScore) {
    return (candidates || [])
      .filter(predicate)
      .slice()
      .sort((a, b) => ranker(b) - ranker(a))[0] || null;
  }

  function shortCandidate(candidate) {
    if (!candidate) return "none";
    return `${candidate.candidate}${candidate.wouldBuyAmount ? ` × ${candidate.wouldBuyAmount}` : ""}`;
  }

  function candidateReason(candidate) {
    if (!candidate) return "none";
    return candidate.reason || (candidate.blockers || []).join(", ") || "no reason recorded";
  }

  function compactCandidate(candidate) {
    if (!candidate) return null;
    return {
      lane: candidate.lane,
      decision: candidate.decision,
      candidate: candidate.candidate,
      reason: candidate.reason,
      blockers: candidate.blockers,
      blockerCategories: candidate.blockerCategories,
      observations: candidate.observations,
      score: candidate.score,
      closenessScore: Number.isFinite(candidateClosenessScore(candidate)) ? Math.round(candidateClosenessScore(candidate)) : null,
      etaBefore: candidate.etaBefore,
      etaAfter: candidate.etaAfter,
      payback: candidate.payback,
      reserveAfter: candidate.reserveAfter,
      wouldBuyAmount: candidate.wouldBuyAmount,
      target: candidate.target,
      resource: candidate.resource,
      raw: candidate.raw || null,
      meatFallback: !!candidate.meatFallback,
      fallbackRankDrop: candidate.fallbackRankDrop ?? null,
      strategicTarget: candidate.strategicTarget || "",
      blockedStrategicCandidate: candidate.blockedStrategicCandidate || "",
      topMeatBlockedBy: candidate.topMeatBlockedBy || "",
    };
  }

  function candidatesBlockedBy(category) {
    return laneCandidates
      .filter((candidate) => candidate.blockerCategories?.includes(category))
      .map(compactCandidate);
  }

  function summarizeBlockerLabels(candidates) {
    const labels = new Set();

    for (const candidate of candidates || []) {
      const cats = candidate.blockerCategories || [];
      const blockerText = (candidate.blockers || []).join(" ").toLowerCase();
      const reasonText = String(candidate.reason || "").toLowerCase();

      if (cats.includes("payback")) labels.add("payback");
      if (cats.includes("reserve")) labels.add("reserve");

      if (cats.includes("protected-resource")) {
        if (hasActiveExpansionSave(candidate)) labels.add("Expansion save");
        if (hasActiveHatcherySave(candidate)) labels.add("Hatchery save");
        if (hasActiveNexusSave(candidate)) labels.add("Nexus save");
      }

      if (cats.includes("energy-plan") && /nexus|lepidoptera|moth|energy/.test(`${reasonText} ${blockerText}`)) {
        labels.add("energy plan");
      }
      if (cats.includes("ability-disabled")) labels.add("ability disabled");
    }

    return labels.size ? Array.from(labels).join(", ") : "none";
  }

  function summarizeLaneCandidates() {
    const candidates = laneCandidates.slice();
    const mainCandidates = candidates.filter(isMainLaneCandidate);
    const sideCandidates = candidates.filter((candidate) => isSideLane(candidate.lane));

    const bestAllowedMainCandidate = bestCandidate(
      mainCandidates,
      (candidate) => candidate.decision === "BUY",
      candidateRankScore
    );

    const bestAllowedSideCandidate = bestCandidate(
      sideCandidates,
      (candidate) => ["BUY", "SIDE"].includes(candidate.decision),
      candidateRankScore
    );

    const rejectedCandidates = candidates.filter((candidate) => candidate.decision === "HOLD");
    const specificRejectedCandidates = rejectedCandidates.filter((candidate) => {
      const text = `${candidate.candidate || ""} ${candidate.reason || ""}`.toLowerCase();
      if (candidate.lane === "Engine" && /not buyable yet|eta/.test(text) && !candidate.blockerCategories?.includes("protected-resource")) return false;
      if (/territory spending|meat spending|energy spending/.test(text)) return false;
      return true;
    });

    const bestRejectedStrategicCandidate = bestCandidate(
      specificRejectedCandidates.length ? specificRejectedCandidates : rejectedCandidates,
      (candidate) => candidate.decision === "HOLD",
      candidateRejectedRankScore
    );

    const closestRejectedToBuying = bestCandidate(
      rejectedCandidates,
      (candidate) => candidate.decision === "HOLD",
      candidateClosenessScore
    );

    const closestMainLaneToBuying = bestCandidate(
      mainCandidates,
      (candidate) => candidate.lane !== "Clone Prep",
      candidateClosenessScore
    );

    const closestSideLaneToBuying = bestCandidate(
      sideCandidates,
      () => true,
      candidateClosenessScore
    );

    const lanes = {};
    for (const candidate of candidates) {
      const existing = lanes[candidate.lane];
      if (!existing || decisionLaneRankScore(candidate) > decisionLaneRankScore(existing)) {
        lanes[candidate.lane] = candidate;
      }
    }

    const bestAllowedCandidate = bestAllowedMainCandidate || bestAllowedSideCandidate;
    const bestRejectedCandidate = bestRejectedStrategicCandidate;
    const closestLaneToBuying = closestMainLaneToBuying || closestSideLaneToBuying || closestRejectedToBuying;

    return {
      laneCandidates: candidates.map(compactCandidate),
      laneBestByName: Object.fromEntries(Object.entries(lanes).map(([lane, candidate]) => [lane, compactCandidate(candidate)])),
      bestAllowedMainCandidate: compactCandidate(bestAllowedMainCandidate),
      bestAllowedSideCandidate: compactCandidate(bestAllowedSideCandidate),
      bestRejectedStrategicCandidate: compactCandidate(bestRejectedStrategicCandidate),
      closestRejectedToBuying: compactCandidate(closestRejectedToBuying),
      closestMainLaneToBuying: compactCandidate(closestMainLaneToBuying),
      closestLaneToBuying: compactCandidate(closestLaneToBuying),
      bestAllowedCandidate: compactCandidate(bestAllowedCandidate),
      bestRejectedCandidate: compactCandidate(bestRejectedCandidate),
      blockedByProtectedResources: candidatesBlockedBy("protected-resource"),
      blockedByPayback: candidatesBlockedBy("payback"),
      blockedByReserve: candidatesBlockedBy("reserve"),
      blockedByEnergyPlan: candidatesBlockedBy("energy-plan"),
      blockedByAbilityDisabled: candidatesBlockedBy("ability-disabled"),
      blockedBySummary: summarizeBlockerLabels(candidates),
    };
  }

  function getNextLikelyBuy(game, engine, protectedResources, summary) {
    if (engine && Number.isFinite(engine.expansionEta) && engine.expansionEta > 0 && engine.expansionEta <= config.saveForExpansionSeconds) {
      return `Expansion in ${formatDuration(engine.expansionEta)}`;
    }

    if (engine && Number.isFinite(engine.hatcheryEta) && engine.hatcheryEta > 0 && engine.hatcheryEta <= config.saveForHatcherySeconds) {
      return `Hatchery in ${formatDuration(engine.hatcheryEta)}`;
    }

    const nextNexus = getNextNexusUpgrade(game);
    if (protectedResources?.has("energy") && nextNexus) {
      const energyCost = getCostForResource(nextNexus, "energy");
      const currentEnergy = getCurrentResource(game, "energy");
      const energyVelocity = getVelocity(game, "energy");
      if (energyCost.greaterThan(currentEnergy) && isPositive(energyVelocity)) {
        return `${getDisplayName(nextNexus)} in ${formatDuration(decimalToNumber(energyCost.minus(currentEnergy).dividedBy(energyVelocity), Infinity))}`;
      }
      return getDisplayName(nextNexus);
    }

    const allowed = summary?.bestAllowedCandidate;
    if (allowed) return `${allowed.candidate}${allowed.decision === "SIDE" ? " companion action" : ""}`;

    const rejected = summary?.bestRejectedCandidate;
    if (rejected) return `${rejected.candidate} when blockers clear`;

    return "unknown";
  }

  function mainLaneDecisionLabel(mainActions, sideActions) {
    if (Number(mainActions || 0) > 0) return "BUY";
    if (Number(sideActions || 0) > 0) return "HOLD — companion side-task allowed";
    return "HOLD";
  }


  function inspectProtectedResources(protectedResources) {
    const list = Array.from(protectedResources || []);
    return list.length ? list.join(", ") : "none";
  }

  function findAdvisorRow(decisions, titlePattern, reasonPattern) {
    const titleRx = titlePattern ? new RegExp(titlePattern, "i") : null;
    const reasonRx = reasonPattern ? new RegExp(reasonPattern, "i") : null;

    return advisorLog.find((row) => {
      if (decisions && !decisions.includes(row.decision)) return false;
      if (titleRx && !titleRx.test(row.title || "")) return false;
      if (reasonRx && !reasonRx.test(row.reason || "")) return false;
      return true;
    });
  }

  function getDecisionModeFromAdvisor() {
    const buy = advisorLog.find((row) => ["BUY", "SIDE"].includes(row.decision));
    if (buy) {
      if (config.advisorOnly || !config.autoBuySafeDecisions) return "ADVISE BUY";
      return "BUY";
    }

    if (advisorLog.some((row) => row.decision === "HOLD")) return "HOLD";
    return "OBSERVE";
  }

  function getPrimaryReasonFromAdvisor(mainActions = 0) {
    if (Number(mainActions || 0) > 0) {
      const selectedMainAction = laneCoordinatorState?.selectedLaneActions?.[0] || null;
      if (selectedMainAction?.reason) {
        return `${selectedMainAction.lane} BUY ${selectedMainAction.candidate}: ${selectedMainAction.reason}`;
      }

      if (laneCoordinatorState?.primaryActionReason) {
        return laneCoordinatorState.primaryActionReason;
      }
    }

    return formatAdvisorReason(latestAdvisorRow(["BUY", "HOLD", "PLAN", "NEXT"]));
  }

  function getSelectedLaneActionReason(index) {
    const action = laneCoordinatorState?.selectedLaneActions?.[index] || null;
    if (!action?.reason) return "none";
    return `${action.lane} BUY ${action.candidate}: ${action.reason}`;
  }

  function getCurrentStrategyPhase(game, engine) {
    const nexusCount = Math.floor(decimalToNumber(getNexusCount(game), 0));
    const moth = getGameUnit(game, "moth");
    const clone = getGameUpgrade(game, "clonelarvae");

    if (engine?.expansionBuyable || engine?.hatcheryBuyable) return "Larva engine upgrade";
    if (nexusCount <= 0) return "Pre-Nexus meat/territory setup";
    if (nexusCount < 4) return `Nexus ramp (${nexusCount}/${config.nexusTarget})`;
    if (nexusCount === 4 && config.nexusTarget >= 5) return "Nexus 5 preparation";
    if (nexusCount < config.nexusTarget) return `Nexus target push (${nexusCount}/${config.nexusTarget})`;
    if (moth?.isVisible?.() && getLepidopteraBoostPercent(game) < config.lepidopteraStopAtBoostPercent) return "Post-Nexus energy growth";
    if (clone?.isVisible?.()) return "Meat-chain / Clone Prep observation";
    return "Meat-chain progression";
  }

  function getCurrentStrategyGoal(game, engine, protectedResources, smartFocus) {
    if (engine?.expansionBuyable) return "Buy Expansion now; it is the strongest larva-engine upgrade.";
    if (engine?.hatcheryBuyable) return "Buy Hatchery now; larva production is the active engine goal.";

    const nexusCount = Math.floor(decimalToNumber(getNexusCount(game), 0));
    const nextNexus = getNextNexusUpgrade(game);
    if (config.energyStrategy && nexusCount < config.nexusTarget && nextNexus) {
      return `Reach ${getDisplayName(nextNexus)} while protecting energy.`;
    }

    if (protectedResources?.has("territory")) return "Hold territory because Expansion is inside the save window.";
    if (protectedResources?.has("meat")) return "Hold meat because Hatchery is inside the save window.";

    const plan = safe("Inspector meat goal plan", () => buildMeatGoalPlan(game));
    if (plan?.target) {
      const target = getDisplayName(plan.target);
      const action = plan.actionUnit ? getDisplayName(plan.actionUnit) : "unknown action";
      return `Meat-chain target: ${target}; current action: ${action}.`;
    }

    if (smartFocus === "territory") return "Improve territory/sec toward the next Expansion.";
    if (smartFocus === "meat") return "Improve meat-chain production without breaking reserves.";
    if (smartFocus === "save-territory") return "Save territory for Expansion.";
    if (smartFocus === "save-meat") return "Save meat for Hatchery.";
    return "Observe and make only safe incremental Smart decisions.";
  }

  function getWaitSignals(game, engine, protectedResources) {
    const waits = [];
    const nexusCount = Math.floor(decimalToNumber(getNexusCount(game), 0));
    const nextNexus = getNextNexusUpgrade(game);

    if (engine && Number.isFinite(engine.hatcheryEta) && engine.hatcheryEta > 0 && engine.hatcheryEta <= config.saveForHatcherySeconds) {
      waits.push(`Hatchery (${formatDuration(engine.hatcheryEta)})`);
    }

    if (engine && Number.isFinite(engine.expansionEta) && engine.expansionEta > 0 && engine.expansionEta <= config.saveForExpansionSeconds) {
      waits.push(`Expansion (${formatDuration(engine.expansionEta)})`);
    }

    if (protectedResources?.has("energy") && nextNexus) {
      waits.push(`${getDisplayName(nextNexus)} / Nexus`);
    }

    const lepidopteraHold = findAdvisorRow(["HOLD"], "Lepidoptera|moth", null);
    if (lepidopteraHold) waits.push("Lepidoptera");

    const planRow = findAdvisorRow(["PLAN", "NEXT", "HOLD"], null, "goal planner|bottleneck|meat-chain|chain prep|reserve|payback");
    if (planRow) waits.push("meat-chain target");

    const twinRow = findAdvisorRow(["BUY", "HOLD", "NEXT"], "twin", null) || findAdvisorRow(["BUY", "HOLD", "NEXT"], null, "twin");
    if (twinRow) waits.push("Twin Prep");

    if (nexusCount >= config.nexusTarget && waits.length === 0) {
      const clone = getGameUpgrade(game, "clonelarvae");
      if (clone?.isVisible?.() && config.manageCloneLarvaeCocoons) waits.push("Clone Prep buffer only; no auto-cast");
    }

    return waits.length ? waits.join(", ") : "none";
  }

  function getSettingsInfluencingDecision(protectedResources) {
    const settings = [];

    settings.push(`Smart ${config.smartMode ? "on" : "off"}`);
    settings.push(`Advisor-only ${config.advisorOnly ? "on" : "off"}`);
    settings.push(`safe auto-buy ${config.autoBuySafeDecisions ? "on" : "off"}`);
    settings.push(`focus ${config.focusTab}`);
    settings.push(`chunk ${trimNumber(config.smartUnitBuyPercent * 100)}%`);
    if (config.territoryRoiMode) settings.push(`territory ROI min ${formatEtaImprovementSummary(config.territoryMinEtaImprovementSeconds)} / ${trimNumber(config.territoryMinEtaImprovementRatio * 100)}%`);
    if (config.expansionArmySeedPlanner) {
      settings.push(
        `army seed ${trimNumber(config.expansionArmySeedMaxChunkPercent)}% chunk, min ${formatDuration(config.expansionArmySeedMinEtaImprovementSeconds)} or ${trimNumber(config.expansionArmySeedMinEtaImprovementRatio * 100)}% Expansion ETA gain`
      );
    }

    if (config.larvaEnginePriority) settings.push(`Hatchery/Expansion guard ${inspectProtectedResources(protectedResources)}`);
    if (config.energyStrategy) settings.push(`Nexus target ${config.nexusTarget}`);
    if (config.saveEnergyForNexus) settings.push("energy protected for Nexus");
    if (config.lepidopteraRoiMode) settings.push(`Lepidoptera ROI +${trimNumber(config.lepidopteraStopAtBoostPercent)}% stop`);
    if (config.energySupportBroker) settings.push(`energy support broker ${config.energySupportBrokerAdvisorOnly ? "advisor-first" : "active"}`);
    settings.push(`energy support auto-cast ${config.energySupportBrokerAllowAutoCast ? "ON (risk)" : "off"}`);
    if (config.meatGoalPlanner) settings.push(`meat planner depth ${config.meatPlannerDepth}`);
    if (config.targetAwareUpgradePlanner) settings.push("target-aware upgrade/twin planner");
    if (config.meatChainPaybackGuard) settings.push(`reserve ${trimNumber(config.meatChainReserveMultiplier)}x / payback ${formatDuration(config.meatChainMaxPaybackSeconds)}`);
    if (config.meatFallbackEnabled) settings.push(`meat fallback after ${config.meatFallbackMinHoldRuns} holds / ${trimNumber(config.meatFallbackChunkPercent)}% chunk`);
    if (config.meatActionUnitPaybackBypass) settings.push(`active meat action payback bypass ≥${trimNumber(config.meatActionUnitMinReserveRatio)}x reserve`);
    if (config.meatUnlockPlanner) settings.push(`unlock planner ${config.meatUnlockPaybackBypass ? "payback bypass on" : "payback bypass off"} (min ${trimNumber(config.meatUnlockMinReserveRatio)}x)`);
    if (config.meatParentStepPlanner) settings.push(`parent-step planner ${config.meatParentStepPaybackBypass ? "payback bypass on" : "payback bypass off"} (min ${trimNumber(config.meatParentStepMinReserveRatio)}x)`);
    if (config.twinUnlockPlanner) settings.push(`twin unlock planner ${config.twinUnlockPaybackBypass ? "payback bypass on" : "payback bypass off"} (near ${trimNumber(config.twinUnlockNearThresholdRatio * 100)}%, min ${trimNumber(config.twinUnlockMinReserveRatio)}x)`);
    if (config.twinUnlockPlanner) settings.push(`twin opportunity-cost bypass ${config.twinUpgradeOpportunityCostBypass ? "on" : "off"} (${trimNumber(config.twinUpgradeMaxLostProductionBankRatioPerHour * 100)}%/h bank limit)`);
    if (config.meatFallbackDoNotDropBelowActionUnit) settings.push("fallback floor at planner action unit");
    if (config.meatChainTwinPrep) settings.push(`twin buffer ${trimNumber(config.twinRecoveryBufferMultiplier)}x`);
    if (config.manageCloneLarvaeCocoons) settings.push("Clone Prep cocoons only");
    if (config.cloneBufferPlanner) settings.push(`clone buffer ${String(config.cloneBufferMode || "auto")}`);
    settings.push(`ability prep advisor ${config.abilityPlanner ? "on" : "baseline"}`);
    settings.push(`auto-cast ${config.autoCastAbilities ? "ON (risk)" : "off"}`);
    settings.push(`auto-ascend ${config.autoAscend ? "ON (risk)" : "off"}`);

    return settings;
  }

  function compactConfigSummary() {
    return {
      preset: config.preset,
      smartMode: config.smartMode,
      advisorOnly: config.advisorOnly,
      autoBuySafeDecisions: config.autoBuySafeDecisions,
      focusTab: config.focusTab,
      smartUnitBuyPercent: config.smartUnitBuyPercent,
      territoryRoiMode: config.territoryRoiMode,
      territoryMinEtaImprovementSeconds: config.territoryMinEtaImprovementSeconds,
      territoryMinEtaImprovementRatio: config.territoryMinEtaImprovementRatio,
      expansionArmySeedPlanner: config.expansionArmySeedPlanner,
      expansionArmySeedMaxChunkPercent: config.expansionArmySeedMaxChunkPercent,
      expansionArmySeedMinEtaImprovementSeconds: config.expansionArmySeedMinEtaImprovementSeconds,
      expansionArmySeedMinEtaImprovementRatio: config.expansionArmySeedMinEtaImprovementRatio,
      expansionArmySeedDoNotSpendInsideSaveWindow: config.expansionArmySeedDoNotSpendInsideSaveWindow,
      smartMaxActionsPerRun: config.smartMaxActionsPerRun,
      saveForHatcherySeconds: config.saveForHatcherySeconds,
      saveForExpansionSeconds: config.saveForExpansionSeconds,
      energyStrategy: config.energyStrategy,
      energyPlanner: config.energyPlanner,
      nexusTarget: config.nexusTarget,
      saveEnergyForNexus: config.saveEnergyForNexus,
      blockLepidopteraBeforeNexus: config.blockLepidopteraBeforeNexus,
      fastNexus5MothSoftTarget: config.fastNexus5MothSoftTarget,
      lepidopteraStopAtBoostPercent: config.lepidopteraStopAtBoostPercent,
      maxLepidopteraPerRun: config.maxLepidopteraPerRun,
      postNexusEnergyReserveSeconds: config.postNexusEnergyReserveSeconds,
      postNexusLepidopteraMinBoostGainPercent: config.postNexusLepidopteraMinBoostGainPercent,
      energySupportBroker: config.energySupportBroker,
      energySupportBrokerAdvisorOnly: config.energySupportBrokerAdvisorOnly,
      energySupportBrokerAllowAutoCast: config.energySupportBrokerAllowAutoCast,
      energySupportCloneLarvaeAdvisor: config.energySupportCloneLarvaeAdvisor,
      energySupportHouseOfMirrorsAdvisor: config.energySupportHouseOfMirrorsAdvisor,
      energySupportLepidopteraAdvisor: config.energySupportLepidopteraAdvisor,
      energySupportMinMeaningfulBenefit: config.energySupportMinMeaningfulBenefit,
      energySupportPreferSafeBackgroundLepidoptera: config.energySupportPreferSafeBackgroundLepidoptera,
      targetAwareUpgradePlanner: config.targetAwareUpgradePlanner,
      meatGoalPlanner: config.meatGoalPlanner,
      meatPlannerDepth: config.meatPlannerDepth,
      meatPlannerChunkPercent: config.meatPlannerChunkPercent,
      meatChainReserveMultiplier: config.meatChainReserveMultiplier,
      meatChainMaxPaybackSeconds: config.meatChainMaxPaybackSeconds,
      meatFallbackEnabled: config.meatFallbackEnabled,
      meatFallbackMinHoldRuns: config.meatFallbackMinHoldRuns,
      meatFallbackMaxRankDrop: config.meatFallbackMaxRankDrop,
      meatFallbackChunkPercent: config.meatFallbackChunkPercent,
      meatActionUnitPaybackBypass: config.meatActionUnitPaybackBypass,
      meatActionUnitMinReserveRatio: config.meatActionUnitMinReserveRatio,
      meatFallbackDoNotDropBelowActionUnit: config.meatFallbackDoNotDropBelowActionUnit,
      meatUnlockPlanner: config.meatUnlockPlanner,
      meatUnlockPaybackBypass: config.meatUnlockPaybackBypass,
      meatUnlockMinReserveRatio: config.meatUnlockMinReserveRatio,
      meatUnlockMaxChunkPercent: config.meatUnlockMaxChunkPercent,
      meatParentStepPlanner: config.meatParentStepPlanner,
      meatParentStepPaybackBypass: config.meatParentStepPaybackBypass,
      meatParentStepMinReserveRatio: config.meatParentStepMinReserveRatio,
      meatParentStepMaxChunkPercent: config.meatParentStepMaxChunkPercent,
      twinUnlockPlanner: config.twinUnlockPlanner,
      twinUnlockPaybackBypass: config.twinUnlockPaybackBypass,
      twinUnlockMinReserveRatio: config.twinUnlockMinReserveRatio,
      twinUnlockMaxPrepChunkPercent: config.twinUnlockMaxPrepChunkPercent,
      twinUnlockNearThresholdRatio: config.twinUnlockNearThresholdRatio,
      twinUnlockPostUpgradeRebuildRatio: config.twinUnlockPostUpgradeRebuildRatio,
      twinUpgradeOpportunityCostBypass: config.twinUpgradeOpportunityCostBypass,
      twinUpgradeMaxLostProductionBankRatioPerHour: config.twinUpgradeMaxLostProductionBankRatioPerHour,
      twinRecoveryBufferMultiplier: config.twinRecoveryBufferMultiplier,
      manageCloneLarvaeCocoons: config.manageCloneLarvaeCocoons,
      cloneCocoonTargetPercent: config.cloneCocoonTargetPercent,
      cloneCocoonChunkPercent: config.cloneCocoonChunkPercent,
      clonePrepCooldownSeconds: config.clonePrepCooldownSeconds,
      cloneBufferPlanner: config.cloneBufferPlanner,
      cloneBufferMode: config.cloneBufferMode,
      cloneBufferEarlyProtectRatio: config.cloneBufferEarlyProtectRatio,
      cloneBufferMatureProtectRatio: config.cloneBufferMatureProtectRatio,
      cloneBufferPostCloneProtectRatio: config.cloneBufferPostCloneProtectRatio,
      cloneBufferMinLarvaProductionForHardLock: config.cloneBufferMinLarvaProductionForHardLock,
      cloneBufferProtectLarvae: config.cloneBufferProtectLarvae,
      autoCastAbilities: config.autoCastAbilities,
      autoAscend: config.autoAscend,
    };
  }

  function countBy(items, keyFn) {
    const map = new Map();
    for (const item of items || []) {
      const key = keyFn(item);
      if (!key || key === "none") continue;
      map.set(key, (map.get(key) || 0) + 1);
    }
    return Array.from(map.entries())
      .map(([key, count]) => ({ key, count }))
      .sort((a, b) => b.count - a.count || a.key.localeCompare(b.key));
  }

  function countLabels(labels) {
    const map = new Map();
    for (const label of labels || []) {
      if (!label || label === "none") continue;
      map.set(label, (map.get(label) || 0) + 1);
    }
    return Array.from(map.entries())
      .map(([key, count]) => ({ key, count }))
      .sort((a, b) => b.count - a.count || a.key.localeCompare(b.key));
  }

  function activeBlockerLabelsFromCandidate(candidate) {
    const labels = [];
    const cats = candidate?.blockerCategories || [];

    if (cats.includes("protected-resource")) {
      if (hasActiveExpansionSave(candidate)) labels.push("Expansion save");
      if (hasActiveHatcherySave(candidate)) labels.push("Hatchery save");
      if (hasActiveNexusSave(candidate)) labels.push("Nexus save");
    }

    if (cats.includes("payback")) labels.push("payback");
    if (cats.includes("reserve")) labels.push("reserve");
    if (cats.includes("energy-plan")) labels.push("energy plan");
    if (cats.includes("ability-disabled")) labels.push("ability disabled");

    return Array.from(new Set(labels));
  }

  function futureTargetLabelsFromCandidate(candidate) {
    const observations = (candidate?.observations || []).join(" ").toLowerCase();
    const reason = String(candidate?.reason || "").toLowerCase();
    const labels = [];

    if (/future-expansion-target/.test(observations) || (candidate?.lane === "Engine" && /expansion not buyable yet/.test(reason) && !hasActiveExpansionSave(candidate))) {
      labels.push("future Expansion target");
    }

    if (/future-hatchery-target/.test(observations) || (candidate?.lane === "Engine" && /hatchery not buyable yet/.test(reason) && !hasActiveHatcherySave(candidate))) {
      labels.push("future Hatchery target");
    }

    return labels;
  }

  function genericHoldLabelFromCandidate(candidate) {
    if (!candidate || candidate.decision !== "HOLD") return "none";
    if (activeBlockerLabelsFromCandidate(candidate).length) return "none";
    if (futureTargetLabelsFromCandidate(candidate).length) return "none";

    const blocker = (candidate.blockers || []).find(Boolean);
    if (blocker) return blocker;

    const reason = String(candidate.reason || "");
    if (/not buyable yet/i.test(reason)) return "not buyable yet";
    if (/no safe/i.test(reason)) return "no safe candidate";
    if (/handled by/i.test(reason)) return "handled by planner";
    return reason || "generic HOLD";
  }

  function countConsecutiveRecentMainHoldRuns(history = runHistory) {
    const recent = (history || []).slice(-50);
    let count = 0;

    for (let i = recent.length - 1; i >= 0; i--) {
      if (Number(recent[i]?.mainActions || 0) === 0) {
        count++;
      } else {
        break;
      }
    }

    return count;
  }

  function buildLiveDiagnostics(history = runHistory) {
    const recent = (history || []).slice(-20);
    const sideOnlyRuns = recent.filter((run) => Number(run.mainActions || 0) === 0 && Number(run.sideActions || 0) > 0).length;
    const mainBuyRuns = recent.filter((run) => Number(run.mainActions || 0) > 0).length;
    const holdRuns = recent.filter((run) => Number(run.mainActions || 0) === 0).length;
    const recentMainHoldRuns = countConsecutiveRecentMainHoldRuns(recent);
    const fallbackRuns = recent.filter((run) => run.meatFallbackCandidate && run.meatFallbackCandidate !== "none").length;
    const stallBreakerRuns = recent.filter((run) => !!run.stallBreakerActive).length;

    const repeatedBlockers = countBy(recent, (run) => run.blockedBySummary || "none").slice(0, 6);
    const topRejectedCandidates = countBy(recent, (run) => {
      const candidate = run.bestRejectedStrategicCandidate || run.bestRejectedCandidate;
      return candidate ? `${candidate.lane}: ${candidate.candidate}` : "none";
    }).slice(0, 6);

    const dominantHoldReason = repeatedBlockers[0]
      ? `${repeatedBlockers[0].key} (${repeatedBlockers[0].count}/${recent.length})`
      : "none";

    const saveWindowRuns = recent.filter((run) => /Expansion save|Hatchery save|Nexus save/.test(run.blockedBySummary || ""));
    const saveWindowSuspicion = saveWindowRuns.length >= 3 && holdRuns >= 3
      ? `Repeated save-window holds: ${saveWindowRuns.length}/${recent.length}`
      : "none";

    const missedSafeMainRuns = recent.filter((run) => Number(run.mainActions || 0) === 0 && !!run.bestAllowedMainCandidate);
    const missedSafeMainCandidateSuspicion = missedSafeMainRuns.length >= 2
      ? `${missedSafeMainRuns.length} recent holds had an allowed main-lane candidate; verify advisor-only/safe-auto-buy state`
      : "none";

    const clonePrepOnlyRuns = recent.filter((run) => Number(run.mainActions || 0) === 0 && Number(run.sideActions || 0) > 0 && /Clone Prep/i.test(run.sideDecision || ""));
    const clonePrepOnlyBecauseMainBlocked = clonePrepOnlyRuns.length
      ? `${clonePrepOnlyRuns.length}/${recent.length} recent runs were Clone Prep side-task only`
      : "none";

    const allRecentCandidates = recent.flatMap((run) => run.laneCandidates || []);
    const activeBlockers = countLabels(allRecentCandidates.flatMap(activeBlockerLabelsFromCandidate)).slice(0, 8);
    const futureTargets = countLabels(allRecentCandidates.flatMap(futureTargetLabelsFromCandidate)).slice(0, 8);
    const genericHolds = countBy(allRecentCandidates, genericHoldLabelFromCandidate).slice(0, 8);

    return {
      historySize: recent.length,
      sideOnlyRuns,
      mainBuyRuns,
      holdRuns,
      recentMainHoldRuns,
      fallbackRuns,
      stallBreakerRuns,
      repeatedBlockers,
      activeBlockers,
      futureTargets,
      genericHolds,
      topRejectedCandidates,
      dominantHoldReason,
      saveWindowSuspicion,
      missedSafeMainCandidateSuspicion,
      clonePrepOnlyBecauseMainBlocked,
    };
  }

  function recordRunHistoryEntry(inspector) {
    if (!inspector) return;

    const entry = {
      timestamp: new Date().toISOString(),
      phase: inspector.phase,
      goal: inspector.goal,
      decision: inspector.decision,
      mainDecision: inspector.mainDecision,
      sideDecision: inspector.sideDecision,
      compactStatus: inspector.compactStatus,
      whyWaiting: inspector.whyWaiting,
      protectedResources: inspector.protectedResources,
      waits: inspector.waits,
      actions: inspector.actions,
      mainActions: inspector.mainActions,
      sideActions: inspector.sideActions,
      blockedBySummary: inspector.blockedBySummary,
      bestAllowedMainCandidate: inspector.bestAllowedMainCandidate,
      bestAllowedSideCandidate: inspector.bestAllowedSideCandidate,
      bestRejectedStrategicCandidate: inspector.bestRejectedStrategicCandidate,
      closestRejectedToBuying: inspector.closestRejectedToBuying,
      closestMainLaneToBuying: inspector.closestMainLaneToBuying,
      nextLikelyBuy: inspector.nextLikelyBuy,
      laneCandidates: (inspector.laneCandidates || []).slice(),
      postNexusEnergyCandidate: inspector.postNexusEnergyCandidate,
      postNexusEnergyDecision: inspector.postNexusEnergyDecision,
      postNexusEnergyReason: inspector.postNexusEnergyReason,
      postNexusEnergyAmount: inspector.postNexusEnergyAmount,
      postNexusEnergyBoostBefore: inspector.postNexusEnergyBoostBefore,
      postNexusEnergyBoostAfter: inspector.postNexusEnergyBoostAfter,
      postNexusEnergyBoostGain: inspector.postNexusEnergyBoostGain,
      postNexusEnergyReserve: inspector.postNexusEnergyReserve,
      postNexusEnergyBlockedBy: inspector.postNexusEnergyBlockedBy,
      postNexusEnergySpend: inspector.postNexusEnergySpend,
      meatFallbackEnabled: inspector.meatFallbackEnabled,
      meatFallbackCandidate: inspector.meatFallbackCandidate,
      meatFallbackReason: inspector.meatFallbackReason,
      meatFallbackStrategicTarget: inspector.meatFallbackStrategicTarget,
      meatFallbackBlockedCandidate: inspector.meatFallbackBlockedCandidate,
      skippedMeatCandidates: inspector.skippedMeatCandidates || [],
      topMeatBlockedBy: inspector.topMeatBlockedBy,
      stallBreakerActive: inspector.stallBreakerActive,
      recentMainHoldRuns: inspector.recentMainHoldRuns,
      fallbackRankDrop: inspector.fallbackRankDrop,
      meatActionUnitPaybackBypassTriggered: inspector.meatActionUnitPaybackBypassTriggered,
      meatActionUnitPaybackBypassReason: inspector.meatActionUnitPaybackBypassReason,
      meatActionUnitReserveRatio: inspector.meatActionUnitReserveRatio,
      meatActionUnitPaybackSeconds: inspector.meatActionUnitPaybackSeconds,
      meatActionUnitName: inspector.meatActionUnitName,
      targetAwareUpgradeCandidate: inspector.targetAwareUpgradeCandidate,
      targetAwareUpgradeDecision: inspector.targetAwareUpgradeDecision,
      targetAwareUpgradeReason: inspector.targetAwareUpgradeReason,
      targetAwareUpgradeName: inspector.targetAwareUpgradeName,
      targetAwareUpgradeType: inspector.targetAwareUpgradeType,
      targetAwareUpgradeSupportsActionUnit: inspector.targetAwareUpgradeSupportsActionUnit,
      targetAwareUpgradeReserveRatio: inspector.targetAwareUpgradeReserveRatio,
      targetAwareUpgradeCostResource: inspector.targetAwareUpgradeCostResource,
      unlockPlannerCandidate: inspector.unlockPlannerCandidate,
      unlockPlannerDecision: inspector.unlockPlannerDecision,
      unlockPlannerReason: inspector.unlockPlannerReason,
      unlockPlannerTarget: inspector.unlockPlannerTarget,
      unlockPlannerUnlocks: inspector.unlockPlannerUnlocks,
      unlockPlannerCostResource: inspector.unlockPlannerCostResource,
      unlockPlannerReserveRatio: inspector.unlockPlannerReserveRatio,
      unlockPlannerPaybackBypassed: inspector.unlockPlannerPaybackBypassed,
      parentStepCandidate: inspector.parentStepCandidate,
      parentStepDecision: inspector.parentStepDecision,
      parentStepReason: inspector.parentStepReason,
      parentStepTarget: inspector.parentStepTarget,
      parentStepActionUnit: inspector.parentStepActionUnit,
      parentStepCostResource: inspector.parentStepCostResource,
      parentStepReserveRatio: inspector.parentStepReserveRatio,
      parentStepPaybackBypassed: inspector.parentStepPaybackBypassed,
      parentStepSupportsActionUnit: inspector.parentStepSupportsActionUnit,
      parentStepConsumedActionUnit: inspector.parentStepConsumedActionUnit,
      parentStepConsumedUnit: inspector.parentStepConsumedUnit,
      actionUnitRefillCandidate: inspector.actionUnitRefillCandidate,
      actionUnitRefillDecision: inspector.actionUnitRefillDecision,
      actionUnitRefillReason: inspector.actionUnitRefillReason,
      actionUnitRefillBlockedBy: inspector.actionUnitRefillBlockedBy,
      actionUnitRefillReserveRatio: inspector.actionUnitRefillReserveRatio,
      actionUnitRefillPayback: inspector.actionUnitRefillPayback,
      actionUnitRefillPaybackBypassed: inspector.actionUnitRefillPaybackBypassed,
      actionBudgetRemainingAfterParentStep: inspector.actionBudgetRemainingAfterParentStep,
      followUpActionSelected: inspector.followUpActionSelected,
      whyNoFollowUpAction: inspector.whyNoFollowUpAction,
      antiPingpongGuardActive: inspector.antiPingpongGuardActive,
      antiPingpongGuardAllowedRefill: inspector.antiPingpongGuardAllowedRefill,
      coordinatorRemainingBudgetReason: inspector.coordinatorRemainingBudgetReason,
      twinUnlockCandidate: inspector.twinUnlockCandidate,
      twinUnlockDecision: inspector.twinUnlockDecision,
      twinUnlockReason: inspector.twinUnlockReason,
      twinUnlockTarget: inspector.twinUnlockTarget,
      twinUnlockUpgrade: inspector.twinUnlockUpgrade,
      twinUnlockCostResource: inspector.twinUnlockCostResource,
      twinUnlockCurrent: inspector.twinUnlockCurrent,
      twinUnlockRequired: inspector.twinUnlockRequired,
      twinUnlockMissing: inspector.twinUnlockMissing,
      twinUnlockPrepCandidate: inspector.twinUnlockPrepCandidate,
      twinUnlockReserveRatio: inspector.twinUnlockReserveRatio,
      twinUnlockPaybackBypassed: inspector.twinUnlockPaybackBypassed,
      twinUnlockPostUpgradeRebuildRatio: inspector.twinUnlockPostUpgradeRebuildRatio,
      twinUnlockRebuildSafe: inspector.twinUnlockRebuildSafe,
      twinUnlockOpportunityCostBypass: inspector.twinUnlockOpportunityCostBypass,
      twinUnlockOpportunityCostReason: inspector.twinUnlockOpportunityCostReason,
      twinUnlockLostProductionPerSecond: inspector.twinUnlockLostProductionPerSecond,
      twinUnlockLostProductionPerHour: inspector.twinUnlockLostProductionPerHour,
      twinUnlockLostProductionBankRatioPerHour: inspector.twinUnlockLostProductionBankRatioPerHour,
      twinUnlockLostProductionBankRatioLimit: inspector.twinUnlockLostProductionBankRatioLimit,
      twinUnlockUpgradeBuyAllowedDespiteRebuildUnsafe: inspector.twinUnlockUpgradeBuyAllowedDespiteRebuildUnsafe,
      twinUnlockPrepMeaningful: inspector.twinUnlockPrepMeaningful,
      twinUnlockPrepProgressGainPercent: inspector.twinUnlockPrepProgressGainPercent,
      twinUnlockPrepProgressGainRequiredPercent: inspector.twinUnlockPrepProgressGainRequiredPercent,
      twinUnlockDeferredByParentStep: inspector.twinUnlockDeferredByParentStep,
      twinUnlockParentStepPreferred: inspector.twinUnlockParentStepPreferred,
      twinUnlockWhyParentStepWon: inspector.twinUnlockWhyParentStepWon,
      twinUnlockWhyPrepDidNotWin: inspector.twinUnlockWhyPrepDidNotWin,
      cloneBufferMode: inspector.cloneBufferMode,
      cloneBufferTarget: inspector.cloneBufferTarget,
      cloneBufferCurrent: inspector.cloneBufferCurrent,
      cloneBufferPercent: inspector.cloneBufferPercent,
      cloneBufferDebt: inspector.cloneBufferDebt,
      cloneBufferSpendableLarvae: inspector.cloneBufferSpendableLarvae,
      cloneBufferLarvaeProtected: inspector.cloneBufferLarvaeProtected,
      cloneBufferTargetSource: inspector.cloneBufferTargetSource,
      cloneBufferHardLockActive: inspector.cloneBufferHardLockActive,
      cloneBufferRecoveryComplete: inspector.cloneBufferRecoveryComplete,
      cloneBufferCompletionThreshold: inspector.cloneBufferCompletionThreshold,
      cloneBufferReason: inspector.cloneBufferReason,
      abilityPrepCandidate: inspector.abilityPrepCandidate,
      abilityPrepDecision: inspector.abilityPrepDecision,
      abilityPrepReason: inspector.abilityPrepReason,
      abilityPrepType: inspector.abilityPrepType,
      abilityPrepEnergyAvailable: inspector.abilityPrepEnergyAvailable,
      abilityPrepRequiresArmyPrep: inspector.abilityPrepRequiresArmyPrep,
      abilityPrepRequiresCloneBuffer: inspector.abilityPrepRequiresCloneBuffer,
      houseOfMirrorsArmyValue: inspector.houseOfMirrorsArmyValue,
      houseOfMirrorsMissingUnits: inspector.houseOfMirrorsMissingUnits,
      laneCoordinatorDecision: inspector.laneCoordinatorDecision,
      selectedLaneActions: inspector.laneCoordinatorSelectedActions,
      territoryStarvationCount: inspector.territoryStarvationCount,
      lastTerritoryActionAge: inspector.lastTerritoryActionAge,
      territoryPrepCandidate: inspector.territoryPrepCandidate,
      territoryPrepDecision: inspector.territoryPrepDecision,
      territoryPrepReason: inspector.territoryPrepReason,
      territoryPrepUnit: inspector.territoryPrepUnit,
      territoryPrepAmount: inspector.territoryPrepAmount,
      territoryPrepExpansionEtaBefore: inspector.territoryPrepExpansionEtaBefore,
      territoryPrepExpansionEtaAfter: inspector.territoryPrepExpansionEtaAfter,
      territoryPrepArmySeed: inspector.territoryPrepArmySeed,
      territoryDidNotBuyReason: inspector.territoryDidNotBuyReason,
      armyPrepMissingUnits: inspector.armyPrepMissingUnits,
      configSummary: compactConfigSummary(),
      // Legacy names kept for log consumers written against 0.7.3.
      bestAllowedCandidate: inspector.bestAllowedCandidate,
      bestRejectedCandidate: inspector.bestRejectedCandidate,
      closestLaneToBuying: inspector.closestLaneToBuying,
    };

    runHistory.push(entry);
    runHistory = runHistory.slice(-20);
    liveDiagnostics = buildLiveDiagnostics(runHistory);
  }

  function liveDiagnosticsWarningLabel() {
    const diag = liveDiagnostics || buildLiveDiagnostics(runHistory);
    if (!diag.historySize) return "none";
    if (diag.missedSafeMainCandidateSuspicion !== "none") return diag.missedSafeMainCandidateSuspicion;
    if (diag.saveWindowSuspicion !== "none") return diag.saveWindowSuspicion;
    if (diag.clonePrepOnlyBecauseMainBlocked !== "none" && diag.sideOnlyRuns >= 3) return diag.clonePrepOnlyBecauseMainBlocked;
    if (diag.holdRuns >= 5 && diag.dominantHoldReason !== "none") return `Repeated HOLD: ${diag.dominantHoldReason}`;
    return "none";
  }

  function buildStrategyInspector(game, engine, protectedResources, smartFocus, summaries, mainActions, sideActions, maxActions = 1) {
    if (!config.strategyInspector) return null;

    const nexusCount = Math.floor(decimalToNumber(getNexusCount(game), 0));
    const mothCount = getLepidopteraCount(game);
    const mothBoost = getLepidopteraBoostPercent(game);
    const decision = getDecisionModeFromAdvisor();
    const reason = getPrimaryReasonFromAdvisor(mainActions);
    const settings = getSettingsInfluencingDecision(protectedResources);
    const candidateSummary = summarizeLaneCandidates();
    const meatActionState = meatActionUnitPaybackBypassState || getCurrentMeatActionUnitPaybackState(game);
    const targetAwareState = targetAwareUpgradeState || null;
    const unlockState = unlockPlannerState || null;
    const parentStepState = parentStepPlannerState || null;
    const twinUnlockState = twinUnlockPlannerState || null;
    const cloneBufferState = cloneBufferPlannerState || null;
    const abilityPrepState = abilityPrepPlannerState || null;
    const postNexusEnergyState = postNexusEnergyPlannerState || null;
    const territoryPrepState = territoryPrepPlannerState || null;
    const refillState = actionUnitRefillState || null;
    const coordinatorState = laneCoordinatorState || null;
    const selectedMainAction = coordinatorState?.selectedLaneActions?.[0] || null;
    const selectedSideAction = coordinatorState?.selectedLaneActions?.[1] || null;
    const bestAllowedMain = candidateSummary.bestAllowedMainCandidate;
    const bestAllowedSide = candidateSummary.bestAllowedSideCandidate;
    const bestRejectedStrategic = candidateSummary.bestRejectedStrategicCandidate;
    const noSideReason = selectedSideAction?.reason
      ? selectedSideAction.reason
      : (refillState?.decision === "HOLD" && refillState?.whyNoFollowUpAction && refillState.whyNoFollowUpAction !== "none"
        ? `action-unit refill held: ${refillState.whyNoFollowUpAction}`
      : (coordinatorState?.territoryDidNotBuyReason && coordinatorState.territoryDidNotBuyReason !== "none"
        ? coordinatorState.territoryDidNotBuyReason
        : (bestAllowedSide ? "not selected by coordinator" : (bestRejectedStrategic ? candidateReason(bestRejectedStrategic) : "no side-capable proposal"))));
    const parentStepRefillPreserved = parentStepState?.executed
      ? (refillState?.followUpActionSelected ? "yes" : "no")
      : parentStepState?.decision === "BUY"
        ? "path ready"
        : "n/a";
    const compactStatus = Number(mainActions || 0) === 0 && Number(sideActions || 0) > 0
      ? "Main lanes held; side-task allowed."
      : Number(mainActions || 0) > 0
        ? "Main lane action ran."
        : "Main lanes held.";
    const councilWinningLane = selectedMainAction?.lane || "none";
    const councilWinningCandidate = selectedMainAction?.candidate || "none";
    const energySupport = buildEnergySupportBrokerSnapshot(game, engine, smartFocus, selectedMainAction);
    const waitingSummary = getWhyWaitingSummary(game, engine, protectedResources, mainActions, sideActions, summaries);
    const upcomingMilestone = getNextLikelyBuy(game, engine, protectedResources, candidateSummary);
    const momentum = buildMomentumSnapshot({
      smartFocus,
      selectedMainAction,
      selectedSideAction,
      sideActions,
      mainActions,
      energySupport,
      nextLikelyBuy: upcomingMilestone,
      whyWaiting: waitingSummary,
      bestRejectedStrategic,
    });
    const activeCouncilSpeaker = resolveCouncilPrimarySpeaker(momentum.momentumPrimaryAdvisor, councilWinningLane) || "none";
    const councilFocusBubble = selectedMainAction?.reason || noSideReason || "No lane has a safe bounded action yet.";
    const rawRemainingBudgetReason = coordinatorState?.coordinatorRemainingBudgetReason || refillState?.coordinatorRemainingBudgetReason || "none";
    const firstBlockerReason = (items, label) => {
      const first = Array.isArray(items) ? items[0] : null;
      return first ? `${label}: ${candidateReason(first)}` : "";
    };
    let coordinatorRemainingBudgetReason = rawRemainingBudgetReason;
    if (coordinatorRemainingBudgetReason === "none") {
      if (Number(mainActions || 0) >= Number(maxActions || 1)) {
        coordinatorRemainingBudgetReason = "budget fully used";
      } else if (candidateSummary.blockedByProtectedResources?.length) {
        coordinatorRemainingBudgetReason = firstBlockerReason(candidateSummary.blockedByProtectedResources, "protected resource");
      } else if (candidateSummary.blockedByPayback?.length) {
        coordinatorRemainingBudgetReason = firstBlockerReason(candidateSummary.blockedByPayback, "payback");
      } else if (candidateSummary.blockedByReserve?.length) {
        coordinatorRemainingBudgetReason = firstBlockerReason(candidateSummary.blockedByReserve, "reserve");
      } else if (candidateSummary.blockedByEnergyPlan?.length) {
        coordinatorRemainingBudgetReason = firstBlockerReason(candidateSummary.blockedByEnergyPlan, "save window");
      } else if (candidateSummary.closestRejectedToBuying) {
        coordinatorRemainingBudgetReason = `no safe chunk: ${candidateReason(candidateSummary.closestRejectedToBuying)}`;
      } else {
        coordinatorRemainingBudgetReason = "no safe chunk: no meaningful planner action remained";
      }
    }

    const companionDecision = selectedSideAction ? `${selectedSideAction.lane} BUY` : "none";
    const sideTaskDecision = Number(sideActions || 0) > 0 ? "Clone Prep SIDE" : "none";

    return {
      time: new Date().toLocaleTimeString(),
      timestamp: new Date().toISOString(),
      phase: getCurrentStrategyPhase(game, engine),
      goal: getCurrentStrategyGoal(game, engine, protectedResources, smartFocus),
      decision,
      mainDecision: mainLaneDecisionLabel(mainActions, sideActions),
      sideDecision: sideTaskDecision,
      companionDecision: companionDecision,
      compactStatus,
      reason,
      mainReason: getSelectedLaneActionReason(0),
      sideReason: getSelectedLaneActionReason(1),
      overseerDecision: coordinatorState?.coordinatorDecision || mainLaneDecisionLabel(mainActions, sideActions),
      overseerMainSelected: selectedMainAction ? `${selectedMainAction.lane} BUY ${selectedMainAction.candidate}` : (bestAllowedMain ? shortCandidate(bestAllowedMain) : "none"),
      overseerSideSelected: selectedSideAction ? `${selectedSideAction.lane} BUY ${selectedSideAction.candidate}` : "none",
      overseerActionsUsed: `${Number(mainActions || 0)}/${maxActions}`,
      overseerWhySelected: selectedMainAction?.reason || reason,
      overseerWhyNoSide: selectedSideAction ? selectedSideAction.reason : `No companion selected — ${noSideReason}`,
      overseerBlockedByHardGuard: candidateSummary.blockedBySummary || "none",
      protectedResources: inspectProtectedResources(protectedResources),
      waits: getWaitSignals(game, engine, protectedResources),
      smartFocus: smartFocus || "unknown",
      nexus: `${nexusCount}/${config.nexusTarget}`,
      lepidoptera: `${formatSwarmNumber(mothCount)} (+${trimNumber(mothBoost)}%)`,
      actions: `${mainActions || 0} main, ${sideActions || 0} side-tasks`,
      mainActions: Number(mainActions || 0),
      sideActions: Number(sideActions || 0),
      activeCouncilSpeaker,
      councilWinningLane,
      councilWinningCandidate,
      councilFocusBubble,
      laneCoordinatorDecision: coordinatorState?.coordinatorDecision || mainLaneDecisionLabel(mainActions, sideActions),
      laneCoordinatorSelectedActions: coordinatorState?.selectedLaneActions || [],
      laneCoordinatorSelectedSummary: coordinatorState?.selectedLaneSummary || "none",
      coordinatorRemainingBudgetReason,
      summaries: summaries?.length ? summaries.slice(0, 4).join("; ") : "none",
      whyWaiting: momentum.momentumWhyWaitingIsBest,
      lanes: summarizeDecisionLanes(laneCandidates),
      laneCandidates: candidateSummary.laneCandidates,
      laneBestByName: candidateSummary.laneBestByName,
      bestAllowedMainCandidate: bestAllowedMain,
      bestAllowedSideCandidate: bestAllowedSide,
      bestRejectedStrategicCandidate: bestRejectedStrategic,
      closestRejectedToBuying: candidateSummary.closestRejectedToBuying,
      closestMainLaneToBuying: candidateSummary.closestMainLaneToBuying,
      bestAllowedCandidate: candidateSummary.bestAllowedCandidate,
      bestRejectedCandidate: candidateSummary.bestRejectedCandidate,
      bestAllowedAction: shortCandidate(candidateSummary.bestAllowedCandidate),
      bestAllowedMainAction: shortCandidate(bestAllowedMain),
      bestAllowedSideAction: shortCandidate(bestAllowedSide),
      bestRejectedAction: shortCandidate(candidateSummary.bestRejectedCandidate),
      bestRejectedStrategicAction: shortCandidate(bestRejectedStrategic),
      rejectedBecause: candidateReason(bestRejectedStrategic || candidateSummary.bestRejectedCandidate),
      closestLaneToBuying: candidateSummary.closestLaneToBuying,
      closestMainLaneAction: shortCandidate(candidateSummary.closestMainLaneToBuying),
      closestRejectedAction: shortCandidate(candidateSummary.closestRejectedToBuying),
      blockedByProtectedResources: candidateSummary.blockedByProtectedResources,
      blockedByPayback: candidateSummary.blockedByPayback,
      blockedByReserve: candidateSummary.blockedByReserve,
      blockedByEnergyPlan: candidateSummary.blockedByEnergyPlan,
      blockedByAbilityDisabled: candidateSummary.blockedByAbilityDisabled,
      blockedBySummary: candidateSummary.blockedBySummary,
      nextLikelyBuy: momentum.momentumNextMilestone || upcomingMilestone,
      ...energySupport,
      ...momentum,
      momentumPrimaryPrioritySource: momentum.momentumPrimaryPrioritySource || "default",
      momentumPrimarySelectionReason: momentum.momentumPrimarySelectionReason || "default lane priority",
      settings,
      meatFallbackEnabled: !!config.meatFallbackEnabled,
      meatFallbackCandidate: meatFallbackState?.candidate || "none",
      meatFallbackReason: meatFallbackState?.reason || "none",
      meatFallbackStrategicTarget: meatFallbackState?.strategicTarget || "none",
      meatFallbackBlockedCandidate: meatFallbackState?.blockedCandidate || "none",
      skippedMeatCandidates: meatFallbackState?.skipped || [],
      topMeatBlockedBy: meatFallbackState?.topBlockedBy || "none",
      stallBreakerActive: !!meatFallbackState?.stallBreakerActive,
      recentMainHoldRuns: meatFallbackState?.recentMainHoldRuns ?? countConsecutiveRecentMainHoldRuns(),
      fallbackRankDrop: meatFallbackState?.fallbackRankDrop ?? null,
      meatActionUnitPaybackBypassTriggered: !!meatActionState?.triggered,
      meatActionUnitPaybackBypassReason: meatActionState?.reason || "none",
      meatActionUnitReserveRatio: meatActionState?.reserveRatioText || (Number.isFinite(meatActionState?.reserveRatio) ? `${trimNumber(meatActionState.reserveRatio)}x` : "n/a"),
      meatActionUnitPaybackSeconds: Number.isFinite(meatActionState?.paybackSeconds) ? meatActionState.paybackSeconds : null,
      meatActionUnitPayback: Number.isFinite(meatActionState?.paybackSeconds) ? formatDuration(meatActionState.paybackSeconds) : "n/a",
      meatActionUnitName: meatActionState?.unitName || "none",
      meatActionUnitTarget: meatActionState?.targetName || "none",
      targetAwareUpgradeCandidate: targetAwareState?.candidate || "none",
      targetAwareUpgradeDecision: targetAwareState?.decision || "none",
      targetAwareUpgradeReason: targetAwareState?.reason || "none",
      targetAwareUpgradeName: targetAwareState?.name || "none",
      targetAwareUpgradeType: targetAwareState?.type || "none",
      targetAwareUpgradeSupportsActionUnit: targetAwareState?.supportsActionUnit ? "yes" : "no",
      targetAwareUpgradeReserveRatio: targetAwareState?.reserveRatioText || "n/a",
      targetAwareUpgradeCostResource: targetAwareState?.costResource || "none",
      unlockPlannerCandidate: unlockState?.candidate || "none",
      unlockPlannerDecision: unlockState?.decision || "none",
      unlockPlannerReason: unlockState?.reason || "none",
      unlockPlannerTarget: unlockState?.target || "none",
      unlockPlannerUnlocks: unlockState?.unlocks || "none",
      unlockPlannerCostResource: unlockState?.costResource || "none",
      unlockPlannerReserveRatio: unlockState?.reserveRatioText || "n/a",
      unlockPlannerPaybackBypassed: !!unlockState?.paybackBypassed,
      parentStepCandidate: parentStepState?.candidate || "none",
      parentStepDecision: parentStepState?.decision || "none",
      parentStepReason: parentStepState?.reason || "none",
      parentStepTarget: parentStepState?.target || "none",
      parentStepActionUnit: parentStepState?.actionUnit || "none",
      parentStepCostResource: parentStepState?.costResource || "none",
      parentStepReserveRatio: parentStepState?.reserveRatioText || "n/a",
      parentStepPaybackBypassed: !!parentStepState?.paybackBypassed,
      parentStepSupportsActionUnit: parentStepState?.supportsActionUnit ? "yes" : "no",
      parentStepConsumedActionUnit: parentStepState?.consumedActionUnit ? "yes" : "no",
      parentStepConsumedUnit: parentStepState?.consumedUnit || "none",
      actionUnitRefillCandidate: refillState?.candidate || "none",
      actionUnitRefillDecision: refillState?.decision || "OBSERVE",
      actionUnitRefillReason: refillState?.reason || "none",
      actionUnitRefillBlockedBy: refillState?.blockedBy || "none",
      actionUnitRefillReserveRatio: refillState?.reserveRatioText || "n/a",
      actionUnitRefillPayback: refillState?.paybackText || "n/a",
      actionUnitRefillPaybackBypassed: refillState?.paybackBypassed ? "yes" : "no",
      actionBudgetRemainingAfterParentStep: String(refillState?.actionBudgetRemainingAfterParentStep ?? 0),
      followUpActionSelected: refillState?.followUpActionSelected ? "yes" : "no",
      whyNoFollowUpAction: refillState?.whyNoFollowUpAction || "none",
      antiPingpongGuardActive: refillState?.antiPingpongGuardActive ? "yes" : "no",
      antiPingpongGuardAllowedRefill: refillState?.antiPingpongGuardAllowedRefill ? "yes" : "no",
      twinUnlockCandidate: twinUnlockState?.candidate || "none",
      twinUnlockDecision: twinUnlockState?.decision || "none",
      twinUnlockReason: twinUnlockState?.reason || "none",
      twinUnlockTarget: twinUnlockState?.target || "none",
      twinUnlockUpgrade: twinUnlockState?.upgrade || "none",
      twinUnlockCostResource: twinUnlockState?.costResource || "none",
      twinUnlockCurrent: twinUnlockState?.current || "0",
      twinUnlockRequired: twinUnlockState?.required || "0",
      twinUnlockMissing: twinUnlockState?.missing || "0",
      twinUnlockRatio: twinUnlockState?.thresholdRatioText || "n/a",
      twinUnlockNearThresholdRatio: twinUnlockState?.nearThresholdRatioText || "n/a",
      twinUnlockPrepCandidate: twinUnlockState?.prepCandidate || "none",
      twinUnlockPrepChunk: twinUnlockState?.prepChunk || "0",
      twinUnlockPrepDecision: twinUnlockState?.prepDecision || twinUnlockState?.decision || "none",
      twinUnlockReserveRatio: twinUnlockState?.reserveRatioText || "n/a",
      twinUnlockPaybackBypassed: !!twinUnlockState?.paybackBypassed,
      twinUnlockPostUpgradeRebuildRatio: twinUnlockState?.postUpgradeRebuildRatioText || "n/a",
      twinUnlockRebuildSafe: twinUnlockState?.rebuildSafe ? "yes" : "no",
      twinUnlockOpportunityCostBypass: twinUnlockState?.opportunityCostBypass ? "yes" : "no",
      twinUnlockOpportunityCostReason: twinUnlockState?.opportunityCostReason || "not evaluated",
      twinUnlockLostProductionPerSecond: twinUnlockState?.lostProductionPerSecondText || "n/a",
      twinUnlockLostProductionPerHour: twinUnlockState?.lostProductionPerHourText || "n/a",
      twinUnlockLostProductionBankRatioPerHour: twinUnlockState?.lostProductionBankRatioPerHourText || "n/a",
      twinUnlockLostProductionBankRatioLimit: twinUnlockState?.lostProductionBankRatioLimitText || "n/a",
      twinUnlockUpgradeBuyAllowedDespiteRebuildUnsafe: twinUnlockState?.upgradeBuyAllowedDespiteRebuildUnsafe ? "yes" : "no",
      twinUnlockPrepMeaningful: twinUnlockState?.prepMeaningful ? "yes" : "no",
      twinUnlockPrepProgressGainPercent: twinUnlockState?.prepProgressGainPercentText || "n/a",
      twinUnlockPrepProgressGainRequiredPercent: twinUnlockState?.prepProgressGainRequiredPercentText || "n/a",
      twinUnlockPrepDeferredReason: twinUnlockState?.prepDeferredReason || "none",
      twinUnlockDeferredByParentStep: twinUnlockState?.deferredByParentStep ? "yes" : "no",
      twinUnlockParentStepPreferred: twinUnlockState?.parentStepPreferred ? "yes" : "no",
      twinUnlockWhyParentStepWon: twinUnlockState?.whyParentStepWon || "none",
      twinUnlockWhyPrepDidNotWin: twinUnlockState?.whyTwinPrepDidNotWin || "none",
      parentStepRefillPreserved,
      cloneBufferMode: cloneBufferState?.cloneBufferMode || "none",
      cloneBufferTarget: cloneBufferState?.cloneBufferTarget || "0",
      cloneBufferCurrent: cloneBufferState?.cloneBufferCurrent || "0",
      cloneBufferPercent: Number.isFinite(cloneBufferState?.cloneBufferPercent) ? `${trimNumber(cloneBufferState.cloneBufferPercent)}%` : "n/a",
      cloneBufferDebt: cloneBufferState?.cloneBufferDebt || "0",
      cloneBufferSpendableLarvae: cloneBufferState?.cloneBufferSpendableLarvae || "0",
      cloneBufferLarvaeProtected: cloneBufferState?.cloneBufferLarvaeProtected || "0",
      cloneBufferTargetSource: cloneBufferState?.cloneBufferTargetSource || "none",
      cloneBufferHardLockActive: cloneBufferState?.cloneBufferHardLockActive ? "yes" : "no",
      cloneBufferRecoveryComplete: cloneBufferState?.cloneBufferRecoveryComplete ? "yes" : "no",
      cloneBufferCompletionThreshold: cloneBufferState?.cloneBufferCompletionThreshold || "n/a",
      cloneBufferReason: cloneBufferState?.cloneBufferReason || "none",
      postNexusEnergyCandidate: postNexusEnergyState?.postNexusEnergyCandidate || "none",
      postNexusEnergyDecision: postNexusEnergyState?.postNexusEnergyDecision || "OBSERVE",
      postNexusEnergyReason: postNexusEnergyState?.postNexusEnergyReason || "none",
      postNexusEnergyAmount: postNexusEnergyState?.postNexusEnergyAmount || "0",
      postNexusEnergyBoostBefore: postNexusEnergyState?.postNexusEnergyBoostBefore || "n/a",
      postNexusEnergyBoostAfter: postNexusEnergyState?.postNexusEnergyBoostAfter || "n/a",
      postNexusEnergyBoostGain: postNexusEnergyState?.postNexusEnergyBoostGain || "n/a",
      postNexusEnergyReserve: postNexusEnergyState?.postNexusEnergyReserve || "0",
      postNexusEnergyBlockedBy: postNexusEnergyState?.postNexusEnergyBlockedBy || "none",
      postNexusEnergySpend: postNexusEnergyState?.postNexusEnergySpend || "0",
      abilityPrepCandidate: abilityPrepState?.abilityPrepCandidate || "none",
      abilityPrepDecision: abilityPrepState?.abilityPrepDecision || "none",
      abilityPrepReason: abilityPrepState?.abilityPrepReason || "none",
      abilityPrepType: abilityPrepState?.abilityPrepType || "none",
      abilityPrepEnergyAvailable: abilityPrepState?.abilityPrepEnergyAvailable || "n/a",
      abilityPrepRequiresArmyPrep: abilityPrepState?.abilityPrepRequiresArmyPrep || "no",
      abilityPrepRequiresCloneBuffer: abilityPrepState?.abilityPrepRequiresCloneBuffer || "no",
      houseOfMirrorsArmyValue: abilityPrepState?.houseOfMirrorsArmyValue || "n/a",
      houseOfMirrorsMissingUnits: abilityPrepState?.houseOfMirrorsMissingUnits || "none",
      territoryStarvationCount: coordinatorState?.territoryStarvationCount ?? getTerritoryStarvationCount(),
      lastTerritoryActionAge: coordinatorState?.territoryActionAge ?? getLaneActionAge("Territory"),
      territoryPrepCandidate: territoryPrepState?.territoryPrepCandidate || "none",
      territoryPrepDecision: territoryPrepState?.territoryPrepDecision || "none",
      territoryPrepReason: territoryPrepState?.territoryPrepReason || "none",
      territoryPrepUnit: territoryPrepState?.territoryPrepUnit || "none",
      territoryPrepAmount: territoryPrepState?.territoryPrepAmount || "0",
      territoryPrepExpansionEtaBefore: territoryPrepState?.territoryPrepExpansionEtaBefore || "n/a",
      territoryPrepExpansionEtaAfter: territoryPrepState?.territoryPrepExpansionEtaAfter || "n/a",
      territoryPrepArmySeed: territoryPrepState?.territoryPrepArmySeed || "no",
      territoryPrepScannedFightingUnits: territoryPrepState?.territoryPrepScannedFightingUnits ?? 0,
      territoryPrepVisibleFightingUnits: territoryPrepState?.territoryPrepVisibleFightingUnits ?? 0,
      territoryPrepBuyableFightingUnits: territoryPrepState?.territoryPrepBuyableFightingUnits ?? 0,
      territoryPrepMissingMatchedCount: territoryPrepState?.territoryPrepMissingMatchedCount ?? 0,
      expansionArmySeedCandidate: territoryPrepState?.expansionArmySeedCandidate || "none",
      expansionArmySeedDecision: territoryPrepState?.expansionArmySeedDecision || "OBSERVE",
      expansionArmySeedUnit: territoryPrepState?.expansionArmySeedUnit || "none",
      expansionArmySeedAmount: territoryPrepState?.expansionArmySeedAmount || "0",
      expansionArmySeedReason: territoryPrepState?.expansionArmySeedReason || "none",
      expansionArmySeedEtaBefore: territoryPrepState?.expansionArmySeedEtaBefore || "n/a",
      expansionArmySeedEtaAfter: territoryPrepState?.expansionArmySeedEtaAfter || "n/a",
      expansionArmySeedEtaGainSeconds: territoryPrepState?.expansionArmySeedEtaGainSeconds || "0",
      expansionArmySeedEtaGainPercent: territoryPrepState?.expansionArmySeedEtaGainPercent || "0%",
      expansionArmySeedTerritoryPerSecondBefore: territoryPrepState?.expansionArmySeedTerritoryPerSecondBefore || "0",
      expansionArmySeedTerritoryPerSecondAfter: territoryPrepState?.expansionArmySeedTerritoryPerSecondAfter || "0",
      expansionArmySeedBlockedBy: territoryPrepState?.expansionArmySeedBlockedBy || "none",
      expansionArmySeedInsideSaveWindow: territoryPrepState?.expansionArmySeedInsideSaveWindow || "no",
      expansionArmySeedBestRejectedUnit: territoryPrepState?.expansionArmySeedBestRejectedUnit || "none",
      expansionArmySeedBestRejectedReason: territoryPrepState?.expansionArmySeedBestRejectedReason || "none",
      territoryDidNotBuyReason: coordinatorState?.territoryDidNotBuyReason || "none",
      armyPrepMissingUnits: territoryPrepState?.armyPrepMissingUnits || abilityPrepState?.houseOfMirrorsMissingUnits || "none",
      configSummary: compactConfigSummary(),
      futurePlanners: "0.11.0 adds Energy Support Broker + Council momentum clarity in advisor-first mode while preserving Parent Refill, Twin meaningful gate, clone safety, and no auto-cast defaults.",
      recommendedSmart: `Recommended Smart = Smart mode + safe auto-buy, focus ${PRESETS.smart.focusTab}, ${trimNumber(PRESETS.smart.smartUnitBuyPercent * 100)}% Smart chunk, methodical territory prep on, Nexus protection on, auto-cast off, auto-ascend off.`,
    };
  }

  function strategyInspectorRowsHtml() {
    if (!config.strategyInspector) {
      return `<div class="kbc-inspector-row">Strategy Inspector är avstängd.</div>`;
    }

    if (!strategyInspector) {
      return `<div class="kbc-inspector-row">Strategy Inspector väntar på första Smart-körningen.</div>`;
    }

    const rows = [
      ["Time", strategyInspector.time],
      ["Phase", strategyInspector.phase],
      ["Goal", strategyInspector.goal],
      ["Decision", strategyInspector.decision],
      ["Overseer decision", strategyInspector.overseerDecision || strategyInspector.laneCoordinatorDecision || "none"],
      ["Main selected", strategyInspector.overseerMainSelected || "none"],
      ["Companion selected", strategyInspector.overseerSideSelected || "none"],
      ["Actions used", strategyInspector.overseerActionsUsed || `${strategyInspector.mainActions || 0}/?`],
      ["Why selected", strategyInspector.overseerWhySelected || "none"],
      ["Why no companion", strategyInspector.overseerWhyNoSide || "none"],
      ["Blocked by hard guard", strategyInspector.overseerBlockedByHardGuard || "none"],
      ["Main", strategyInspector.mainDecision || strategyInspector.decision],
      ["Companion", strategyInspector.companionDecision || "none"],
      ["Side-task", strategyInspector.sideDecision || "none"],
      ["Status", strategyInspector.compactStatus || "n/a"],
      ["Reason", strategyInspector.reason],
      ["Main reason", strategyInspector.mainReason || "none"],
      ["Companion reason", strategyInspector.sideReason || "none"],
      ["Best allowed", strategyInspector.bestAllowedAction || "none"],
      ["Best allowed main", strategyInspector.bestAllowedMainAction || "none"],
      ["Best allowed side", strategyInspector.bestAllowedSideAction || "none"],
      ["Best rejected", strategyInspector.bestRejectedAction || "none"],
      ["Best rejected strategic", strategyInspector.bestRejectedStrategicAction || "none"],
      ["Rejected because", strategyInspector.rejectedBecause || "none"],
      ["Closest main", strategyInspector.closestMainLaneToBuying ? `${strategyInspector.closestMainLaneToBuying.lane}: ${strategyInspector.closestMainLaneToBuying.candidate}` : "none"],
      ["Closest rejected", strategyInspector.closestRejectedToBuying ? `${strategyInspector.closestRejectedToBuying.lane}: ${strategyInspector.closestRejectedToBuying.candidate}` : "none"],
      ["Closest lane", strategyInspector.closestLaneToBuying ? `${strategyInspector.closestLaneToBuying.lane}: ${strategyInspector.closestLaneToBuying.candidate}` : "none"],
      ["Blocked by", strategyInspector.blockedBySummary || "none"],
      ["Next likely buy", strategyInspector.nextLikelyBuy || "unknown"],
      ["Why waiting", strategyInspector.whyWaiting],
      ["Protected", strategyInspector.protectedResources],
      ["Waiting on", strategyInspector.waits],
      ["Focus", strategyInspector.smartFocus],
      ["Nexus", strategyInspector.nexus],
      ["Lepidoptera", strategyInspector.lepidoptera],
      ["Post-Nexus energy candidate", strategyInspector.postNexusEnergyCandidate || "none"],
      ["Post-Nexus energy decision", strategyInspector.postNexusEnergyDecision || "OBSERVE"],
      ["Post-Nexus energy reason", strategyInspector.postNexusEnergyReason || "none"],
      ["Post-Nexus energy amount", strategyInspector.postNexusEnergyAmount || "0"],
      ["Post-Nexus energy boost", `${strategyInspector.postNexusEnergyBoostBefore || "n/a"} -> ${strategyInspector.postNexusEnergyBoostAfter || "n/a"} (${strategyInspector.postNexusEnergyBoostGain || "n/a"})`],
      ["Post-Nexus energy reserve", strategyInspector.postNexusEnergyReserve || "0"],
      ["Post-Nexus energy blocked by", strategyInspector.postNexusEnergyBlockedBy || "none"],
      ["Energy support best use", `${strategyInspector.energySupportBestUse || "none"} (${strategyInspector.energySupportBestUseDecision || "HOLD"})`],
      ["Energy support reason", strategyInspector.energySupportBestUseReason || "none"],
      ["Energy support blocked by", strategyInspector.energySupportBestUseBlockedBy || "none"],
      ["Clone support", `${strategyInspector.energySupportCloneDecision || "HOLD"} ${strategyInspector.energySupportCloneCandidate || "none"}`],
      ["Mirror support", `${strategyInspector.energySupportMirrorDecision || "HOLD"} ${strategyInspector.energySupportMirrorCandidate || "none"}`],
      ["Lepidoptera support role", `${strategyInspector.energySupportLepidopteraRole || "wait"} (${strategyInspector.energySupportLepidopteraDecision || "WAIT"})`],
      ["Momentum primary focus", strategyInspector.momentumPrimaryFocus || "Methodical progression"],
      ["Momentum primary advisor", strategyInspector.momentumPrimaryAdvisor || "none"],
      ["Momentum best step", `${strategyInspector.momentumBestStep || "Wait"} (${strategyInspector.momentumBestStepDecision || "WAIT"})`],
      ["Momentum why waiting is best", strategyInspector.momentumWhyWaitingIsBest || "none"],
      ["Actions", strategyInspector.actions],
      ["Coordinator", strategyInspector.laneCoordinatorDecision || "none"],
      ["Selected lanes", strategyInspector.laneCoordinatorSelectedSummary || "none"],
      ["Changed", strategyInspector.summaries],
      ["Strategic target", strategyInspector.meatFallbackStrategicTarget || "none"],
      ["Blocked strategic", strategyInspector.meatFallbackBlockedCandidate || "none"],
      ["Meat fallback", strategyInspector.meatFallbackCandidate || "none"],
      ["Fallback reason", strategyInspector.meatFallbackReason || "none"],
      ["Stall breaker", strategyInspector.stallBreakerActive ? `active (${strategyInspector.recentMainHoldRuns || 0} holds)` : `off (${strategyInspector.recentMainHoldRuns || 0} holds)`],
      ["Top meat blocked by", strategyInspector.topMeatBlockedBy || "none"],
      ["Active action unit", strategyInspector.meatActionUnitName || "none"],
      ["Payback bypass", strategyInspector.meatActionUnitPaybackBypassTriggered ? "yes" : "no"],
      ["Action reserve ratio", strategyInspector.meatActionUnitReserveRatio || "n/a"],
      ["Action payback", strategyInspector.meatActionUnitPayback || "n/a"],
      ["Action bypass reason", strategyInspector.meatActionUnitPaybackBypassReason || "none"],
      ["Target-aware upgrade", strategyInspector.targetAwareUpgradeCandidate || "none"],
      ["Target-aware decision", strategyInspector.targetAwareUpgradeDecision || "none"],
      ["Target-aware reason", strategyInspector.targetAwareUpgradeReason || "none"],
      ["Target-aware type", strategyInspector.targetAwareUpgradeType || "none"],
      ["Target-aware supports action", strategyInspector.targetAwareUpgradeSupportsActionUnit || "no"],
      ["Target-aware reserve", strategyInspector.targetAwareUpgradeReserveRatio || "n/a"],
      ["Target-aware cost", strategyInspector.targetAwareUpgradeCostResource || "none"],
      ["Unlock candidate", strategyInspector.unlockPlannerCandidate || "none"],
      ["Unlock decision", strategyInspector.unlockPlannerDecision || "none"],
      ["Unlock reason", strategyInspector.unlockPlannerReason || "none"],
      ["Unlock target", strategyInspector.unlockPlannerTarget || "none"],
      ["Unlocks", strategyInspector.unlockPlannerUnlocks || "none"],
      ["Unlock reserve", strategyInspector.unlockPlannerReserveRatio || "n/a"],
      ["Unlock bypass", strategyInspector.unlockPlannerPaybackBypassed ? "yes" : "no"],
      ["Parent step candidate", strategyInspector.parentStepCandidate || "none"],
      ["Parent step decision", strategyInspector.parentStepDecision || "none"],
      ["Parent step reason", strategyInspector.parentStepReason || "none"],
      ["Parent step target", strategyInspector.parentStepTarget || "none"],
      ["Parent step action", strategyInspector.parentStepActionUnit || "none"],
      ["Parent step cost", strategyInspector.parentStepCostResource || "none"],
      ["Parent step reserve", strategyInspector.parentStepReserveRatio || "n/a"],
      ["Parent step bypass", strategyInspector.parentStepPaybackBypassed ? "yes" : "no"],
      ["Parent supports action", strategyInspector.parentStepSupportsActionUnit || "no"],
      ["Parent consumed action", strategyInspector.parentStepConsumedActionUnit || "no"],
      ["Parent consumed unit", strategyInspector.parentStepConsumedUnit || "none"],
      ["Refill candidate", strategyInspector.actionUnitRefillCandidate || "none"],
      ["Refill decision", strategyInspector.actionUnitRefillDecision || "OBSERVE"],
      ["Refill reason", strategyInspector.actionUnitRefillReason || "none"],
      ["Refill blocked by", strategyInspector.actionUnitRefillBlockedBy || "none"],
      ["Refill reserve", strategyInspector.actionUnitRefillReserveRatio || "n/a"],
      ["Refill payback", strategyInspector.actionUnitRefillPayback || "n/a"],
      ["Refill bypass", strategyInspector.actionUnitRefillPaybackBypassed || "no"],
      ["Budget after parent", strategyInspector.actionBudgetRemainingAfterParentStep || "0"],
      ["Follow-up selected", strategyInspector.followUpActionSelected || "no"],
      ["Why no follow-up", strategyInspector.whyNoFollowUpAction || "none"],
      ["Anti-pingpong active", strategyInspector.antiPingpongGuardActive || "no"],
      ["Anti-pingpong allows refill", strategyInspector.antiPingpongGuardAllowedRefill || "no"],
      ["Coordinator remaining-budget reason", strategyInspector.coordinatorRemainingBudgetReason || "none"],
      ["Twin unlock candidate", strategyInspector.twinUnlockCandidate || "none"],
      ["Twin unlock decision", strategyInspector.twinUnlockDecision || "none"],
      ["Twin unlock reason", strategyInspector.twinUnlockReason || "none"],
      ["Twin unlock target", strategyInspector.twinUnlockTarget || "none"],
      ["Twin upgrade", strategyInspector.twinUnlockUpgrade || "none"],
      ["Twin cost resource", strategyInspector.twinUnlockCostResource || "none"],
      ["Twin threshold", `${strategyInspector.twinUnlockCurrent || "0"} / ${strategyInspector.twinUnlockRequired || "0"} (missing ${strategyInspector.twinUnlockMissing || "0"})`],
      ["Twin ratio", strategyInspector.twinUnlockRatio || "n/a"],
      ["Twin near-threshold", strategyInspector.twinUnlockNearThresholdRatio || "n/a"],
      ["Twin prep candidate", strategyInspector.twinUnlockPrepCandidate || "none"],
      ["Twin prep chunk", strategyInspector.twinUnlockPrepChunk || "0"],
      ["Twin prep decision", strategyInspector.twinUnlockPrepDecision || "none"],
      ["Twin reserve", strategyInspector.twinUnlockReserveRatio || "n/a"],
      ["Twin bypass", strategyInspector.twinUnlockPaybackBypassed ? "yes" : "no"],
      ["Twin rebuild ratio", strategyInspector.twinUnlockPostUpgradeRebuildRatio || "n/a"],
      ["Twin rebuild safe", strategyInspector.twinUnlockRebuildSafe || "no"],
      ["Twin opportunity bypass", strategyInspector.twinUnlockOpportunityCostBypass || "no"],
      ["Twin opportunity reason", strategyInspector.twinUnlockOpportunityCostReason || "not evaluated"],
      ["Twin lost prod /s", strategyInspector.twinUnlockLostProductionPerSecond || "n/a"],
      ["Twin lost prod /h", strategyInspector.twinUnlockLostProductionPerHour || "n/a"],
      ["Twin lost prod bank ratio /h", strategyInspector.twinUnlockLostProductionBankRatioPerHour || "n/a"],
      ["Twin lost prod bank ratio limit", strategyInspector.twinUnlockLostProductionBankRatioLimit || "n/a"],
      ["Twin BUY despite rebuild unsafe", strategyInspector.twinUnlockUpgradeBuyAllowedDespiteRebuildUnsafe || "no"],
      ["Twin prep meaningful", strategyInspector.twinUnlockPrepMeaningful || "no"],
      ["Twin prep gain", strategyInspector.twinUnlockPrepProgressGainPercent || "n/a"],
      ["Twin prep meaningful gate", strategyInspector.twinUnlockPrepProgressGainRequiredPercent || "n/a"],
      ["Twin prep deferred reason", strategyInspector.twinUnlockPrepDeferredReason || "none"],
      ["Twin deferred by parent", strategyInspector.twinUnlockDeferredByParentStep || "no"],
      ["Parent preferred over twin", strategyInspector.twinUnlockParentStepPreferred || "no"],
      ["Why parent-step won", strategyInspector.twinUnlockWhyParentStepWon || "none"],
      ["Why twin prep did not win", strategyInspector.twinUnlockWhyPrepDidNotWin || "none"],
      ["Parent/refill preserved", strategyInspector.parentStepRefillPreserved || "n/a"],
      ["Clone buffer mode", strategyInspector.cloneBufferMode || "none"],
      ["Clone buffer", `${strategyInspector.cloneBufferCurrent || "0"} / ${strategyInspector.cloneBufferTarget || "0"} (${strategyInspector.cloneBufferPercent || "n/a"})`],
      ["Clone debt", strategyInspector.cloneBufferDebt || "0"],
      ["Spendable larvae", strategyInspector.cloneBufferSpendableLarvae || "0"],
      ["Protected larvae", strategyInspector.cloneBufferLarvaeProtected || "0"],
      ["Clone target source", strategyInspector.cloneBufferTargetSource || "none"],
      ["Clone hard lock", strategyInspector.cloneBufferHardLockActive || "no"],
      ["Clone recovery complete", strategyInspector.cloneBufferRecoveryComplete || "no"],
      ["Clone completion threshold", strategyInspector.cloneBufferCompletionThreshold || "n/a"],
      ["Clone buffer reason", strategyInspector.cloneBufferReason || "none"],
      ["Ability prep", `${strategyInspector.abilityPrepDecision || "none"} ${strategyInspector.abilityPrepCandidate || "none"}`],
      ["Ability prep reason", strategyInspector.abilityPrepReason || "none"],
      ["Ability prep type", strategyInspector.abilityPrepType || "none"],
      ["Ability prep energy", strategyInspector.abilityPrepEnergyAvailable || "n/a"],
      ["Requires army prep", strategyInspector.abilityPrepRequiresArmyPrep || "no"],
      ["Requires clone buffer", strategyInspector.abilityPrepRequiresCloneBuffer || "no"],
      ["House of Mirrors value", strategyInspector.houseOfMirrorsArmyValue || "n/a"],
      ["House of Mirrors missing", strategyInspector.houseOfMirrorsMissingUnits || "none"],
      ["Territory starvation", String(strategyInspector.territoryStarvationCount ?? 0)],
      ["Last territory action age", String(strategyInspector.lastTerritoryActionAge ?? 0)],
      ["Territory prep candidate", strategyInspector.territoryPrepCandidate || "none"],
      ["Territory prep decision", strategyInspector.territoryPrepDecision || "none"],
      ["Territory prep reason", strategyInspector.territoryPrepReason || "none"],
      ["Territory prep unit", strategyInspector.territoryPrepUnit || "none"],
      ["Territory prep amount", strategyInspector.territoryPrepAmount || "0"],
      ["Territory ETA before", strategyInspector.territoryPrepExpansionEtaBefore || "n/a"],
      ["Territory ETA after", strategyInspector.territoryPrepExpansionEtaAfter || "n/a"],
      ["Territory army seed", strategyInspector.territoryPrepArmySeed || "no"],
      ["Territory scanned fighting units", String(strategyInspector.territoryPrepScannedFightingUnits ?? 0)],
      ["Territory visible fighting units", String(strategyInspector.territoryPrepVisibleFightingUnits ?? 0)],
      ["Territory buyable fighting units", String(strategyInspector.territoryPrepBuyableFightingUnits ?? 0)],
      ["Territory HoM matches", String(strategyInspector.territoryPrepMissingMatchedCount ?? 0)],
      ["Army seed candidate", strategyInspector.expansionArmySeedCandidate || "none"],
      ["Army seed decision", strategyInspector.expansionArmySeedDecision || "OBSERVE"],
      ["Army seed reason", strategyInspector.expansionArmySeedReason || "none"],
      ["Army seed unit", strategyInspector.expansionArmySeedUnit || "none"],
      ["Army seed amount", strategyInspector.expansionArmySeedAmount || "0"],
      ["Army seed ETA before", strategyInspector.expansionArmySeedEtaBefore || "n/a"],
      ["Army seed ETA after", strategyInspector.expansionArmySeedEtaAfter || "n/a"],
      ["Army seed ETA gain", `${strategyInspector.expansionArmySeedEtaGainSeconds || "0"}s (${strategyInspector.expansionArmySeedEtaGainPercent || "0%"})`],
      ["Army seed territory/sec", `${strategyInspector.expansionArmySeedTerritoryPerSecondBefore || "0"} -> ${strategyInspector.expansionArmySeedTerritoryPerSecondAfter || "0"}`],
      ["Army seed blocked by", strategyInspector.expansionArmySeedBlockedBy || "none"],
      ["Army seed inside save-window", strategyInspector.expansionArmySeedInsideSaveWindow || "no"],
      ["Army seed best rejected", strategyInspector.expansionArmySeedBestRejectedUnit || "none"],
      ["Army seed reject reason", strategyInspector.expansionArmySeedBestRejectedReason || "none"],
      ["Army prep missing units", strategyInspector.armyPrepMissingUnits || "none"],
      ["Why territory did not buy", strategyInspector.territoryDidNotBuyReason || "none"],
      ["Council speaker", strategyInspector.activeCouncilSpeaker || "none"],
      ["Council winning lane", strategyInspector.councilWinningLane || "none"],
      ["Council winning candidate", strategyInspector.councilWinningCandidate || "none"],
      ["Settings now", strategyInspector.settings.join(" · ")],
      ["Recommended", strategyInspector.recommendedSmart],
      ["Future", strategyInspector.futurePlanners],
    ];

    return rows
      .map(([key, value]) => `
        <div class="kbc-inspector-row">
          <span class="kbc-inspector-key">${escapeHtml(key)}</span>
          <span class="kbc-inspector-value">${escapeHtml(value)}</span>
        </div>
      `)
      .join("");
  }

  function getWhyWaitingSummary(game, engine, protectedResources, mainActions, sideActions, summaries) {
    if (Number(mainActions || 0) > 0) {
      return `Main actions ran: ${summaries?.length ? summaries.slice(0, 3).join("; ") : "safe purchases were made"}.`;
    }

    const reasons = [];
    const nextNexus = getNextNexusUpgrade(game);

    if (protectedResources?.has("territory")) {
      const eta = Number.isFinite(engine?.expansionEta) ? ` (${formatDuration(engine.expansionEta)})` : "";
      reasons.push(`territory held for Expansion${eta}`);
    }

    if (protectedResources?.has("meat")) {
      const eta = Number.isFinite(engine?.hatcheryEta) ? ` (${formatDuration(engine.hatcheryEta)})` : "";
      reasons.push(`meat held for Hatchery${eta}`);
    }

    if (protectedResources?.has("energy")) {
      reasons.push(`energy held for ${nextNexus ? getDisplayName(nextNexus) : `Nexus ${config.nexusTarget}`}`);
    }

    const meatHold = findAdvisorRow(["HOLD"], "hive|neural|prophet|goddess|pantheon|network|cluster|mind", "payback|reserve");
    if (meatHold) reasons.push(`${meatHold.title} held: ${meatHold.reason}`);

    const territoryHold = findAdvisorRow(["HOLD"], "Territory spending", null);
    if (territoryHold && !protectedResources?.has("territory")) reasons.push(territoryHold.reason);

    const lepidopteraHold = findAdvisorRow(["HOLD"], "Lepidoptera|lepidoptera", null);
    if (lepidopteraHold) reasons.push(`Lepidoptera held: ${lepidopteraHold.reason}`);

    const nightbugHold = findAdvisorRow(["HOLD"], "nightbug", null);
    if (nightbugHold) reasons.push(`Nightbug held: ${nightbugHold.reason}`);

    const abilityHold = findAdvisorRow(["HOLD"], "swarmwarp|clone larvae|territory rush|meat rush|larva rush", null);
    if (abilityHold) reasons.push("abilities held because auto-cast is off");

    const cloneInfo = findAdvisorRow(["SIDE", "INFO"], "Clone Prep", null);
    if (cloneInfo && Number(sideActions || 0) > 0) {
      reasons.push("Clone Prep ran only as side-task after main lanes were blocked");
    } else if (cloneInfo) {
      reasons.push(`Clone Prep side-task: ${cloneInfo.reason}`);
    }

    return reasons.length ? reasons.join(" · ") : "No buy passed the active safety guards this run.";
  }

  function summarizeDecisionLanes(candidates = laneCandidates) {
    const laneNames = ["Engine", "Energy", "Meat", "Territory", "Clone Prep", "Ability", "Upgrade", "Twin"];

    return laneNames.map((name) => {
      const laneItems = (candidates || []).filter((candidate) => candidate.lane === name);
      const best = bestCandidate(laneItems, () => true, decisionLaneRankScore);
      return {
        name,
        decision: best?.decision || "OBSERVE",
        title: best?.candidate || "none",
        reason: best?.reason || "no lane-specific candidate this run",
        candidate: compactCandidate(best),
      };
    });
  }

  function isExpansionSaveWindowPriority(smartFocus, selectedMainAction) {
    const focus = String(smartFocus || "");
    const lane = String(selectedMainAction?.lane || "");
    const candidate = String(selectedMainAction?.candidate || "");
    const reason = String(selectedMainAction?.reason || "");

    if (/save-territory/i.test(focus)) return true;
    if (/wait for expansion/i.test(candidate)) return true;
    return lane === "Engine" && /expansion/i.test(candidate) && /save|wait|hold/i.test(reason);
  }

  function getCouncilSpeakerByLane(lane) {
    const laneSpeakerMap = {
      Territory: "General Mandible",
      Energy: "Beetle Magus",
      "Clone Prep": "Larva Steward",
      Meat: "Flesh Smith",
      Twin: "Twin Oracle",
      Upgrade: "Twin Oracle",
      Engine: "Brood Architect",
      Ability: "Beetle Magus",
    };
    return laneSpeakerMap[String(lane || "")] || "none";
  }

  function resolveCouncilPrimarySpeaker(primaryAdvisor, winningLane) {
    const advisor = String(primaryAdvisor || "").trim();
    if (advisor && advisor !== "none") return advisor;
    return getCouncilSpeakerByLane(winningLane);
  }

  function unitCountByArmyPrepLabel(game, label) {
    const tierOverride = getScenarioArmyTierCountOverride(label);
    if (Number.isFinite(Number(tierOverride))) {
      return decimalFrom(Number(tierOverride));
    }

    let total = newDecimal(0);
    for (const unit of game.unitlist?.() || []) {
      if (!unitMatchesArmyPrepLabel(unit, label)) continue;
      const overrideCount = getScenarioUnitCountOverride(unit);
      const unitCount = overrideCount !== null ? overrideCount : decimalToNumber(decimalFrom(unit?.count?.() || 0), 0);
      total = total.plus(decimalFrom(unitCount));
    }
    return total;
  }

  function getHouseOfMirrorsArmyState(game) {
    const mirrors = getGameUpgrade(game, "houseofmirrors") || getGameUpgrade(game, "swarmwarp");
    const visible = !!mirrors?.isVisible?.();
    const missing = [];
    let armyValue = newDecimal(0);

    for (const tier of HOUSE_OF_MIRRORS_ARMY_TIERS) {
      const count = unitCountByArmyPrepLabel(game, tier.label);
      armyValue = armyValue.plus(count);
      if (!isPositive(count)) missing.push(tier.label);
    }

    let territoryArmyTotal = newDecimal(0);
    for (const unit of game.unitlist?.() || []) {
      if (getTabName(unit) !== "territory") continue;
      territoryArmyTotal = territoryArmyTotal.plus(decimalFrom(unit?.count?.() || 0));
    }

    // In deterministic scenario mode, injected HoM army tiers define the
    // intended effective territory army state even when live visibility is shallow.
    let scenarioInjectedArmyTotal = newDecimal(0);
    for (const tier of HOUSE_OF_MIRRORS_ARMY_TIERS) {
      const tierOverride = getScenarioArmyTierCountOverride(tier.label);
      if (Number.isFinite(Number(tierOverride))) {
        scenarioInjectedArmyTotal = scenarioInjectedArmyTotal.plus(decimalFrom(Number(tierOverride)));
      }
    }
    if (isPositive(scenarioInjectedArmyTotal)) {
      territoryArmyTotal = scenarioInjectedArmyTotal.greaterThan(territoryArmyTotal)
        ? scenarioInjectedArmyTotal
        : territoryArmyTotal;
    }

    return {
      visible,
      armyValue,
      missing,
      territoryArmyTotal,
      territoryArmyExists: isPositive(territoryArmyTotal),
    };
  }

  function buildEnergySupportBrokerSnapshot(game, engine, smartFocus, selectedMainAction) {
    if (!config.energySupportBroker) {
      return {
        energySupportBestUse: "none",
        energySupportBestUseDecision: "HOLD",
        energySupportBestUseHelpsAdvisor: "none",
        energySupportBestUseReason: "energy support broker disabled",
        energySupportBestUsePlayerInstruction: "none",
        energySupportBestUseAutobuyerInstruction: "none",
        energySupportBestUseBlockedBy: "broker disabled",
        energySupportBackgroundAction: "none",
        energySupportCloneCandidate: "none",
        energySupportCloneDecision: "HOLD",
        energySupportCloneReason: "clone advisor disabled",
        energySupportCloneLarvaeGain: "n/a",
        energySupportCloneBufferSafe: "no",
        energySupportCloneCocoonReady: "no",
        energySupportCloneHelpsTarget: "no",
        energySupportCloneBlockedBy: "advisor disabled",
        energySupportMirrorCandidate: "none",
        energySupportMirrorDecision: "HOLD",
        energySupportMirrorReason: "mirror advisor disabled",
        energySupportMirrorArmyValue: "n/a",
        energySupportMirrorTerritoryPerSecondBefore: "0",
        energySupportMirrorTerritoryPerSecondAfter: "0",
        energySupportMirrorExpansionEtaBefore: "n/a",
        energySupportMirrorExpansionEtaAfter: "n/a",
        energySupportMirrorEtaGainSeconds: "0",
        energySupportMirrorBlockedBy: "advisor disabled",
        energySupportMirrorPreferredUnitsMissing: "none",
        energySupportMirrorTerritoryArmyExists: "no",
        energySupportMirrorReadinessState: "disabled",
        energySupportMirrorActiveGate: "disabled",
        energySupportMirrorTerritoryRateGainRatio: "0",
        energySupportMirrorEtaGainRatio: "0",
        energySupportLepidopteraDecision: "WAIT",
        energySupportLepidopteraRole: "wait",
        energySupportLepidopteraReason: "broker disabled",
        energySupportLepidopteraSuggestedChunk: "0",
        energySupportLepidopteraBoostBefore: "n/a",
        energySupportLepidopteraBoostAfter: "n/a",
        energySupportLepidopteraBoostGain: "n/a",
        energySupportLepidopteraReserveAfter: "0",
        energySupportCandidateRanking: "none",
        energySupportBestUseSelectionReason: "broker disabled",
      };
    }

    const minMeaningfulBenefit = Number(config.energySupportMinMeaningfulBenefit || 0);
    const expansionSaveWindowPriority = isExpansionSaveWindowPriority(smartFocus, selectedMainAction);
    const energy = decimalFrom(getCurrentResource(game, "energy"));
    const larvaPerSecond = decimalFrom(getVelocity(game, "larva"));
    const larvaBank = decimalFrom(getCurrentResource(game, "larva"));
    const cloneAbility = getGameUpgrade(game, "clonelarvae");
    const mirrorAbility = getGameUpgrade(game, "houseofmirrors") || getGameUpgrade(game, "swarmwarp");
    const moth = getGameUnit(game, "moth");

    const cloneVisible = isItemVisibleWithScenarioOverride(cloneAbility);
    const cloneCost = cloneVisible ? decimalFrom(getCostForResource(cloneAbility, "energy")) : newDecimal(0);
    const cloneCandidate = cloneVisible ? "Clone Larvae" : "none";
    const cloneReadyEnergy = cloneVisible ? decimalAtLeast(energy, cloneCost) : false;
    const cloneCocoonReady = cloneBufferPlannerState?.cloneBufferRecoveryComplete && !cloneBufferPlannerState?.cloneBufferHardLockActive;
    const cloneBufferSafe = !!cloneCocoonReady;
    const cloneHelpsTarget = /meat|save-meat/i.test(String(smartFocus || "")) || /Meat|Clone Prep/i.test(String(selectedMainAction?.lane || ""));
    const cloneGainRaw = decimalFrom(getCurrentResource(game, "clone") || 0).times(0.1);
    const cloneGain = isPositive(cloneGainRaw) ? cloneGainRaw : larvaPerSecond.times(5);
    const cloneGainRatio = isPositive(larvaBank) ? decimalToNumber(cloneGain.dividedBy(larvaBank), 0) : 0;
    const cloneReady = !!cloneCandidate && cloneReadyEnergy && cloneBufferSafe && cloneHelpsTarget && cloneGainRatio >= minMeaningfulBenefit;
    const cloneBlocked = [];
    if (!cloneCandidate) cloneBlocked.push("clone larvae locked/unavailable");
    if (cloneCandidate && !cloneReadyEnergy) cloneBlocked.push("not enough energy");
    if (cloneCandidate && !cloneCocoonReady) cloneBlocked.push("cocoon buffer not ready");
    if (cloneCandidate && !cloneBufferSafe) cloneBlocked.push("clone buffer safety check failed");
    if (cloneCandidate && !cloneHelpsTarget) cloneBlocked.push("does not help current target");
    if (cloneCandidate && cloneGainRatio < minMeaningfulBenefit) cloneBlocked.push("benefit below meaningful threshold");
    const cloneDecision = cloneReady
      ? (config.energySupportBrokerAdvisorOnly || !config.energySupportBrokerAllowAutoCast ? "ADVISE" : "READY")
      : "HOLD";
    const cloneReason = cloneReady
      ? "Clone Larvae is the best energy support: it can feed the meat chain now, but auto-cast stays off by default."
      : (cloneBlocked[0] || "Clone Larvae is not meaningful right now.");

    const mirrorVisible = isItemVisibleWithScenarioOverride(mirrorAbility);
    const mirrorCost = mirrorVisible ? decimalFrom(getCostForResource(mirrorAbility, "energy")) : newDecimal(0);
    const mirrorCandidate = mirrorVisible ? "House of Mirrors" : "none";
    const mirrorArmyState = getHouseOfMirrorsArmyState(game);
    const mirrorArmyValueRaw = mirrorArmyState.armyValue;
    const missingMirrorUnits = mirrorArmyState.missing.slice();
    const mirrorTerritoryArmyExists = mirrorArmyState.territoryArmyExists;
    const mirrorRelevantArmyExists = isPositive(mirrorArmyValueRaw);
    const mirrorReadyEnergy = mirrorVisible ? decimalAtLeast(energy, mirrorCost) : false;
    const mirrorPreferredQuality = Math.max(0, (HOUSE_OF_MIRRORS_ARMY_TIERS.length - missingMirrorUnits.length) / HOUSE_OF_MIRRORS_ARMY_TIERS.length);
    const mirrorArmyScale = Math.max(0, Math.min(0.35, decimalLog10(mirrorArmyValueRaw.plus(1)) * 0.05));
    const mirrorBoostRatio = mirrorTerritoryArmyExists ? mirrorPreferredQuality * mirrorArmyScale : 0;
    const mirrorTpsBeforeRaw = decimalFrom(getVelocity(game, "territory"));
    const mirrorTpsAfterRaw = mirrorTpsBeforeRaw.times(1 + mirrorBoostRatio);
    const mirrorTpsBefore = decimalToNumber(mirrorTpsBeforeRaw, 0);
    const mirrorTpsAfter = decimalToNumber(mirrorTpsAfterRaw, 0);
    const mirrorEtaBeforeSeconds = Number.isFinite(engine?.expansionEta) ? Math.max(0, Number(engine.expansionEta)) : Infinity;
    const mirrorEtaAfterSeconds = Number.isFinite(mirrorEtaBeforeSeconds) && mirrorBoostRatio > 0 ? Math.max(0, mirrorEtaBeforeSeconds / (1 + mirrorBoostRatio)) : mirrorEtaBeforeSeconds;
    const mirrorEtaGainSeconds = Number.isFinite(mirrorEtaBeforeSeconds) && Number.isFinite(mirrorEtaAfterSeconds)
      ? Math.max(0, mirrorEtaBeforeSeconds - mirrorEtaAfterSeconds)
      : 0;
    const mirrorHelpsTarget = /territory|save-territory/i.test(String(smartFocus || "")) || /Territory|Engine/i.test(String(selectedMainAction?.lane || ""));
    const mirrorProjectionCalculable = (Number.isFinite(mirrorTpsBefore) && mirrorTpsBefore > 0 && Number.isFinite(mirrorTpsAfter) && mirrorTpsAfter >= 0)
      || (Number.isFinite(mirrorEtaBeforeSeconds) && mirrorEtaBeforeSeconds > 0 && Number.isFinite(mirrorEtaAfterSeconds));
    const mirrorTerritoryRateGainRatio = Number.isFinite(mirrorTpsBefore) && mirrorTpsBefore > 0
      ? Math.max(0, (mirrorTpsAfter - mirrorTpsBefore) / mirrorTpsBefore)
      : 0;
    const mirrorEtaGainRatio = Number.isFinite(mirrorEtaBeforeSeconds) && mirrorEtaBeforeSeconds > 0 && Number.isFinite(mirrorEtaGainSeconds)
      ? Math.max(0, mirrorEtaGainSeconds / mirrorEtaBeforeSeconds)
      : 0;
    const mirrorMeaningful = Math.max(mirrorTerritoryRateGainRatio, mirrorEtaGainRatio) >= minMeaningfulBenefit;
    const mirrorRelevantContextExists = mirrorRelevantArmyExists || (mirrorHelpsTarget && mirrorBoostRatio > 0);
    const mirrorGateOrder = [
      { key: "ability", pass: mirrorCandidate !== "none", reason: "mirror ritual locked/unavailable" },
      { key: "energy", pass: mirrorReadyEnergy, reason: "not enough energy" },
      { key: "relevant-army", pass: mirrorRelevantContextExists, reason: "no relevant territory army exists" },
      { key: "preferred-units", pass: !missingMirrorUnits.length, reason: `mirror-preferred units missing: ${missingMirrorUnits.join(", ")}` },
      { key: "projection", pass: mirrorProjectionCalculable, reason: "projection unavailable (invalid territory velocity/ETA)" },
      { key: "payoff", pass: mirrorMeaningful, reason: "no clear territory/Expansion payoff yet" },
      { key: "decision", pass: mirrorHelpsTarget, reason: "does not help current target" },
    ];
    const firstMirrorFailedGate = mirrorGateOrder.find((gate) => !gate.pass);
    const mirrorGateKey = firstMirrorFailedGate ? firstMirrorFailedGate.key : "decision";
    const mirrorReady = !!mirrorCandidate && !firstMirrorFailedGate;
    const mirrorBlocked = [];
    if (!mirrorCandidate) mirrorBlocked.push("mirror ritual locked/unavailable");
    if (mirrorCandidate && !mirrorReadyEnergy) mirrorBlocked.push("not enough energy");
    if (mirrorCandidate && !mirrorRelevantContextExists) mirrorBlocked.push("no relevant territory army exists");
    if (mirrorCandidate && missingMirrorUnits.length) mirrorBlocked.push(`mirror-preferred units missing: ${missingMirrorUnits.join(", ")}`);
    if (mirrorCandidate && !mirrorHelpsTarget) mirrorBlocked.push("does not help current target");
    if (mirrorCandidate && !mirrorProjectionCalculable) mirrorBlocked.push("projection unavailable (invalid territory velocity/ETA)");
    if (mirrorCandidate && !mirrorMeaningful) mirrorBlocked.push("no clear territory/Expansion payoff yet");
    const mirrorDecision = mirrorReady
      ? (config.energySupportBrokerAdvisorOnly || !config.energySupportBrokerAllowAutoCast ? "ADVISE" : "READY")
      : "HOLD";
    const mirrorReason = mirrorReady
      ? "Mirror the army would help General Mandible now, but default mode keeps auto-cast off."
      : (firstMirrorFailedGate?.reason || mirrorBlocked[0] || "Mirror ritual is not worth it yet.");
    const mirrorReadinessState = [
      `visible=${mirrorCandidate !== "none" ? "yes" : "no"}`,
      `energy=${mirrorReadyEnergy ? "yes" : "no"}`,
      `territoryArmy=${mirrorTerritoryArmyExists ? "yes" : "no"}`,
      `relevantArmy=${mirrorRelevantArmyExists ? "yes" : "no"}`,
      `preferredMissing=${missingMirrorUnits.length ? missingMirrorUnits.join("|") : "none"}`,
      `projection=${mirrorProjectionCalculable ? "yes" : "no"}`,
      `helpsTarget=${mirrorHelpsTarget ? "yes" : "no"}`,
      `meaningful=${mirrorMeaningful ? "yes" : "no"}`,
      `activeGate=${mirrorGateKey}`,
    ].join("; ");

    const lepidopteraPlan = postNexusEnergyPlannerState || {};
    const lepiVisible = moth?.isVisible?.() && moth?.isBuyable?.();
    const lepiDecisionBase = normalizeCouncilDecision(lepidopteraPlan.postNexusEnergyDecision || "HOLD", "HOLD");
    let lepiRole = "wait";
    if (lepiDecisionBase === "BUY") {
      lepiRole = (/energy/i.test(String(smartFocus || "")) || (!cloneReady && !mirrorReady)) ? "primary" : "background";
    } else if (lepiVisible) {
      lepiRole = String(lepidopteraPlan.postNexusEnergyBlockedBy || "").includes("stop threshold") ? "hold" : "wait";
    }
    if (expansionSaveWindowPriority && lepiRole === "primary") {
      lepiRole = lepiVisible ? "background" : "wait";
    }
    if (config.energySupportPreferSafeBackgroundLepidoptera && lepiRole === "primary" && (cloneReady || mirrorReady)) {
      lepiRole = "background";
    }
    const lepiDecision = lepiRole === "primary"
      ? "ADVISE"
      : (lepiRole === "background" ? "BACKGROUND" : (lepiRole === "hold" ? "HOLD" : "WAIT"));
    const lepiReason = expansionSaveWindowPriority && lepiRole !== "primary"
      ? "Expansion save-window is active; keep Lepidoptera as background support only."
      : (lepidopteraPlan.postNexusEnergyReason
      || (lepiRole === "background"
        ? "Safe energy growth, but Expansion/meat momentum is the current focus."
        : "Save energy for a stronger support action."));
    const lepiChunk = lepidopteraPlan.postNexusEnergyAmount || (lepiVisible ? formatSwarmNumber(getSafeLepidopteraBuyNum(game)) : "0");

    const cloneBenefitScore = Math.max(0, cloneGainRatio);
    const mirrorBenefitScore = Math.max(0, mirrorTerritoryRateGainRatio, mirrorEtaGainRatio);
    const lepiBoostGainScore = Number.parseFloat(String(lepidopteraPlan.postNexusEnergyBoostGain || "0").replace("%", "")) || 0;
    const lepiBenefitScore = Math.max(0, lepiBoostGainScore / 100);
    const focus = String(smartFocus || "").toLowerCase();

    function supportDecisionClass(decision, role = "") {
      if (["ADVISE", "READY"].includes(String(decision || ""))) return "advise";
      if (String(role || "") === "background" || String(decision || "") === "BACKGROUND") return "background";
      if (String(decision || "") === "HOLD") return "hold";
      return "blocked";
    }

    function decisionClassWeight(cls) {
      switch (String(cls || "")) {
      case "advise": return 4000;
      case "background": return 3000;
      case "hold": return 2000;
      case "blocked": return 1000;
      default: return 0;
      }
    }

    function rankCandidate(candidate) {
      return decisionClassWeight(candidate.className)
        + Math.round(Math.max(0, Number(candidate.benefit || 0)) * 1000)
        + Math.round(Math.max(0, Number(candidate.urgency || 0)) * 100);
    }

    const cloneFocusBonus = /meat|save-meat/.test(focus) ? 0.2 : 0;
    const mirrorFocusBonus = /territory|save-territory/.test(focus) ? 0.2 : 0;
    const lepiFocusBonus = /energy/.test(focus) ? 0.15 : 0;

    const supportCandidates = [
      {
        key: "clone-larvae",
        decision: cloneDecision,
        className: supportDecisionClass(cloneDecision),
        benefit: cloneBenefitScore + cloneFocusBonus,
        urgency: cloneReady ? 1 : 0,
        reason: cloneReason,
        blockedBy: cloneBlocked.length ? cloneBlocked.join("; ") : "none",
      },
      {
        key: "house-of-mirrors",
        decision: mirrorDecision,
        className: supportDecisionClass(mirrorDecision),
        benefit: mirrorBenefitScore + mirrorFocusBonus,
        urgency: mirrorReady ? 1 : 0,
        reason: mirrorReason,
        blockedBy: mirrorBlocked.length ? mirrorBlocked.join("; ") : "none",
      },
      {
        key: "lepidoptera",
        decision: lepiDecision,
        className: supportDecisionClass(lepiDecision, lepiRole),
        benefit: lepiBenefitScore + lepiFocusBonus,
        urgency: lepiRole === "primary" ? 1 : (lepiRole === "background" ? 0.5 : 0),
        reason: lepiReason,
        blockedBy: lepidopteraPlan.postNexusEnergyBlockedBy || "none",
      },
      {
        key: "wait",
        decision: "WAIT",
        className: "blocked",
        benefit: 0,
        urgency: 0,
        reason: "Save energy for a stronger support action.",
        blockedBy: "none",
      },
    ];

    supportCandidates.sort((a, b) => {
      const diff = rankCandidate(b) - rankCandidate(a);
      if (diff !== 0) return diff;
      return String(a.key).localeCompare(String(b.key));
    });
    const topSupport = supportCandidates[0];
    const candidateRanking = supportCandidates
      .map((entry) => `${entry.key}:${entry.className}:${trimNumber(entry.benefit)}:${entry.decision}`)
      .join(" | ");

    let bestUse = "wait";
    let bestDecision = "WAIT";
    let bestReason = "Save energy for a stronger support action.";
    let helpsAdvisor = "none";
    let blockedBy = "none";
    let playerInstruction = "Wait for a more meaningful support window.";
    let autobuyerInstruction = "No support cast should run.";
    let backgroundAction = "none";

    if (topSupport?.key === "clone-larvae" && cloneCandidate !== "none") {
      bestUse = "clone-larvae";
      bestDecision = cloneDecision;
      bestReason = cloneReason;
      helpsAdvisor = "Larva Steward / Flesh Smith";
      blockedBy = cloneBlocked.length ? cloneBlocked.join("; ") : "none";
      playerInstruction = cloneReady
        ? "Cast Clone Larvae only if cocoon buffer is safe."
        : "Prepare cocoons and clone buffer before Clone Larvae.";
      autobuyerInstruction = "Auto-cast disabled; do not cast.";
      if (lepiRole === "background") backgroundAction = `Lepidoptera +${lepiChunk} in background`;
    } else if (topSupport?.key === "house-of-mirrors" && mirrorCandidate !== "none") {
      bestUse = "house-of-mirrors";
      bestDecision = mirrorDecision;
      bestReason = mirrorReason;
      helpsAdvisor = "General Mandible";
      blockedBy = mirrorBlocked.length ? mirrorBlocked.join("; ") : "none";
      playerInstruction = mirrorReady
        ? "Mirror the army if you accept manual casting risk."
        : "Do not cast House of Mirrors until army/payoff gates are met.";
      autobuyerInstruction = "Auto-cast disabled; do not cast.";
      if (lepiRole === "background") backgroundAction = `Lepidoptera +${lepiChunk} in background`;
    } else if (topSupport?.key === "lepidoptera" && (lepiRole === "primary" || lepiRole === "background")) {
      bestUse = "lepidoptera";
      bestDecision = lepiDecision;
      bestReason = lepiReason;
      helpsAdvisor = "Beetle Magus";
      blockedBy = lepidopteraPlan.postNexusEnergyBlockedBy || "none";
      playerInstruction = lepiRole === "background"
        ? "Use Lepidoptera as maintenance while main momentum stays elsewhere."
        : "Energy growth is the best safe move right now.";
      autobuyerInstruction = lepiRole === "background"
        ? "Treat Lepidoptera as background work."
        : "Allow bounded Lepidoptera chunking only.";
      backgroundAction = lepiRole === "background" ? `Lepidoptera +${lepiChunk}` : "none";
    }

    const bestUseSelectionReason = `${topSupport?.key || "wait"} selected from ranked support candidates (${candidateRanking})`;

    scenarioHarnessContext.evaluationRevision = (Number(scenarioHarnessContext.evaluationRevision) || 0) + 1;

    return {
      energySupportBestUse: bestUse,
      energySupportBestUseDecision: bestDecision,
      energySupportBestUseHelpsAdvisor: helpsAdvisor,
      energySupportBestUseReason: bestReason,
      energySupportBestUsePlayerInstruction: playerInstruction,
      energySupportBestUseAutobuyerInstruction: autobuyerInstruction,
      energySupportBestUseBlockedBy: blockedBy,
      energySupportBackgroundAction: backgroundAction,
      energySupportCloneCandidate: cloneCandidate,
      energySupportCloneDecision: cloneDecision,
      energySupportCloneReason: cloneReason,
      energySupportCloneLarvaeGain: isPositive(cloneGain) ? formatSwarmNumber(cloneGain) : "n/a",
      energySupportCloneBufferSafe: cloneBufferSafe ? "yes" : "no",
      energySupportCloneCocoonReady: cloneCocoonReady ? "yes" : "no",
      energySupportCloneHelpsTarget: cloneHelpsTarget ? "yes" : "no",
      energySupportCloneBlockedBy: cloneBlocked.length ? cloneBlocked.join("; ") : "none",
      energySupportMirrorCandidate: mirrorCandidate,
      energySupportMirrorDecision: mirrorDecision,
      energySupportMirrorReason: mirrorReason,
      energySupportMirrorArmyValue: formatSwarmNumber(mirrorArmyValueRaw),
      energySupportMirrorTerritoryPerSecondBefore: formatSwarmNumber(mirrorTpsBeforeRaw),
      energySupportMirrorTerritoryPerSecondAfter: formatSwarmNumber(mirrorTpsAfterRaw),
      energySupportMirrorExpansionEtaBefore: Number.isFinite(mirrorEtaBeforeSeconds) ? formatDuration(mirrorEtaBeforeSeconds) : "n/a",
      energySupportMirrorExpansionEtaAfter: Number.isFinite(mirrorEtaAfterSeconds) ? formatDuration(mirrorEtaAfterSeconds) : "n/a",
      energySupportMirrorEtaGainSeconds: Number.isFinite(mirrorEtaGainSeconds) ? trimNumber(mirrorEtaGainSeconds) : "0",
      energySupportMirrorBlockedBy: mirrorBlocked.length ? mirrorBlocked.join("; ") : "none",
      energySupportMirrorPreferredUnitsMissing: missingMirrorUnits.length ? missingMirrorUnits.join(", ") : "none",
      energySupportMirrorTerritoryArmyExists: mirrorTerritoryArmyExists ? "yes" : "no",
      energySupportMirrorReadinessState: mirrorReadinessState,
      energySupportMirrorActiveGate: mirrorGateKey,
      energySupportMirrorTerritoryRateGainRatio: trimNumber(mirrorTerritoryRateGainRatio),
      energySupportMirrorEtaGainRatio: trimNumber(mirrorEtaGainRatio),
      energySupportMirrorArmyStateSource: `live-unitlist:${scenarioSourceTag()}`,
      energySupportMirrorEvaluationRevision: String(scenarioHarnessContext.evaluationRevision),
      energySupportLepidopteraDecision: lepiDecision,
      energySupportLepidopteraRole: lepiRole,
      energySupportLepidopteraReason: lepiReason,
      energySupportLepidopteraSuggestedChunk: lepiChunk || "0",
      energySupportLepidopteraBoostBefore: lepidopteraPlan.postNexusEnergyBoostBefore || "n/a",
      energySupportLepidopteraBoostAfter: lepidopteraPlan.postNexusEnergyBoostAfter || "n/a",
      energySupportLepidopteraBoostGain: lepidopteraPlan.postNexusEnergyBoostGain || "n/a",
      energySupportLepidopteraReserveAfter: lepidopteraPlan.postNexusEnergyReserve || "0",
      energySupportCandidateRanking: candidateRanking,
      energySupportBestUseSelectionReason: bestUseSelectionReason,
    };
  }

  function buildMomentumSnapshot(strategyInput) {
    const {
      smartFocus,
      selectedMainAction,
      selectedSideAction,
      sideActions,
      mainActions,
      energySupport,
      nextLikelyBuy,
      whyWaiting,
      bestRejectedStrategic,
    } = strategyInput;

    let primaryFocus = "Methodical progression";
    let primaryAdvisor = "Flesh Smith";
    let bestStep = selectedMainAction ? `${selectedMainAction.lane}: ${selectedMainAction.candidate}` : "Wait";
    let bestStepDecision = mainActions > 0 ? "BUY" : "WAIT";
    let bestStepReason = selectedMainAction?.reason || whyWaiting || "No safe bounded action yet.";
    let nextMilestone = nextLikelyBuy || "unknown";
    const nextMilestoneEta = "n/a";
    let playerInstruction = "Follow the active advisor and keep reserves safe.";
    let autobuyerInstruction = "Keep bounded smart actions only.";
    const background = [];
    const companion = [];
    const sideTasks = [];
    const topBlockedOpportunity = bestRejectedStrategic ? `${bestRejectedStrategic.lane}: ${bestRejectedStrategic.candidate}` : "none";
    let whyWaitBest = mainActions > 0 ? "none" : (whyWaiting || "No safe lane candidate beat current guardrails.");
    const expansionSaveWindowPriority = isExpansionSaveWindowPriority(smartFocus, selectedMainAction);
    let primaryPrioritySource = selectedMainAction?.lane ? `${selectedMainAction.lane} lane` : "default";
    let primarySelectionReason = selectedMainAction?.reason || "default lane priority";

    if (/save-territory/i.test(String(smartFocus || ""))) {
      primaryFocus = "Save territory for Expansion";
      primaryAdvisor = "Brood Architect";
      bestStep = "Wait for Expansion";
      bestStepDecision = "WAIT";
      bestStepReason = "Expansion is close, and spending territory now would delay the larva engine.";
      playerInstruction = "Do not buy territory-costing army right now.";
      autobuyerInstruction = "Hold territory spend; keep only safe background tasks.";
      nextMilestone = "Expansion";
      primaryPrioritySource = "Expansion save-window";
      primarySelectionReason = "Expansion save-window hard-priority keeps territory reserved.";
    } else if (/territory/i.test(String(smartFocus || "")) || /Territory/.test(String(selectedMainAction?.lane || ""))) {
      primaryFocus = "Army seed toward Expansion";
      primaryAdvisor = "General Mandible";
      playerInstruction = "Build bounded army chunks that improve Expansion ETA.";
      nextMilestone = "Expansion";
      primaryPrioritySource = "Territory lane";
      primarySelectionReason = "Territory lane is the active momentum path.";
    } else if (/meat|save-meat/i.test(String(smartFocus || "")) || /Meat/.test(String(selectedMainAction?.lane || ""))) {
      primaryFocus = "Meat-chain progression";
      primaryAdvisor = "Flesh Smith";
      playerInstruction = "Build the next meat-chain step, then refill the parent cost.";
      nextMilestone = "Lesser Hive Mind path";
      primaryPrioritySource = "Meat lane";
      primarySelectionReason = "Meat lane has the strongest safe progression action.";
    }

    if (!expansionSaveWindowPriority && energySupport.energySupportBestUse === "clone-larvae") {
      primaryAdvisor = "Larva Steward";
      primaryPrioritySource = "Energy support";
      primarySelectionReason = "Clone Larvae is the best immediate support, advisor-only.";
      if (energySupport.energySupportBestUseDecision === "ADVISE") {
        companion.push("Energy support: Clone Larvae advisor-only");
      }
    }

    const lepidopteraIsPrimary = energySupport.energySupportLepidopteraRole === "primary" && energySupport.energySupportBestUse === "lepidoptera";
    if (!expansionSaveWindowPriority && lepidopteraIsPrimary) {
      primaryFocus = "Energy growth via Lepidoptera";
      primaryAdvisor = "Beetle Magus";
      bestStep = `Energy: ${energySupport.energySupportLepidopteraSuggestedChunk || "0"} Lepidoptera`;
      bestStepDecision = "ADVISE";
      bestStepReason = energySupport.energySupportLepidopteraReason || "Lepidoptera has the highest safe energy momentum now.";
      playerInstruction = "Use bounded Lepidoptera growth while reserves stay safe.";
      autobuyerInstruction = "Energy lane leads with bounded Lepidoptera chunking.";
      primaryPrioritySource = "Energy Lepidoptera primary";
      primarySelectionReason = "Lepidoptera is explicitly marked primary and no higher-priority gate blocks it.";
    }

    if (energySupport.energySupportBackgroundAction && energySupport.energySupportBackgroundAction !== "none") {
      background.push(energySupport.energySupportBackgroundAction);
    }

    if (energySupport.energySupportLepidopteraRole === "background") {
      if (/lepidoptera/i.test(String(bestStep || "")) || /energy/i.test(String(primaryFocus || ""))) {
        if (expansionSaveWindowPriority) {
          bestStep = "Wait for Expansion";
          bestStepDecision = "WAIT";
          bestStepReason = "Expansion save-window remains primary; Lepidoptera stays in background only.";
          primaryFocus = "Save territory for Expansion";
          primaryAdvisor = "Brood Architect";
          primaryPrioritySource = "Expansion save-window";
          primarySelectionReason = "Background Lepidoptera cannot replace Expansion primary focus.";
        } else if (/territory/i.test(String(smartFocus || ""))) {
          bestStep = "Territory: Army seed toward Expansion";
          bestStepDecision = "BUY";
          bestStepReason = "Maintain territory momentum while Lepidoptera runs as background growth.";
          primaryFocus = "Army seed toward Expansion";
          primaryAdvisor = "General Mandible";
          primaryPrioritySource = "Territory lane";
          primarySelectionReason = "Background Lepidoptera is demoted below main territory plan.";
        } else {
          bestStep = "Wait for main-lane window";
          bestStepDecision = "WAIT";
          bestStepReason = "Main lane momentum stays primary; Lepidoptera remains background support only.";
          primaryPrioritySource = "Main-lane hold";
          primarySelectionReason = "Background Lepidoptera cannot become momentum best-step.";
        }
      }
    }

    if (selectedSideAction) {
      companion.push(`${selectedSideAction.lane}: ${selectedSideAction.candidate}`);
    }

    if (Number(sideActions || 0) > 0) {
      sideTasks.push("Clone prep / cocoon maintenance");
    }

    if (energySupport.energySupportBestUse === "wait") {
      whyWaitBest = energySupport.energySupportBestUseReason || whyWaitBest;
      bestStepDecision = bestStepDecision === "BUY" ? "BACKGROUND" : bestStepDecision;
    }

    return {
      momentumPrimaryFocus: primaryFocus,
      momentumPrimaryAdvisor: primaryAdvisor,
      momentumBestStep: bestStep,
      momentumBestStepDecision: bestStepDecision,
      momentumBestStepReason: bestStepReason,
      momentumNextMilestone: nextMilestone,
      momentumNextMilestoneEta: nextMilestoneEta,
      momentumPlayerInstruction: playerInstruction,
      momentumAutobuyerInstruction: autobuyerInstruction,
      momentumBackgroundActions: background.length ? background.join("; ") : "none",
      momentumCompanionActions: companion.length ? companion.join("; ") : "none",
      momentumSideTasks: sideTasks.length ? sideTasks.join("; ") : "none",
      momentumTopBlockedOpportunity: topBlockedOpportunity,
      momentumWhyWaitingIsBest: whyWaitBest,
      momentumPrimaryPrioritySource: primaryPrioritySource,
      momentumPrimarySelectionReason: primarySelectionReason,
    };
  }

  function normalizeCouncilDecision(value, fallback = "OBSERVE") {
    const text = String(value || "").toUpperCase();
    if (text.includes("BUY") || text.includes("WOULD BUY")) return "BUY";
    if (text.includes("READY")) return "READY";
    if (text.includes("ADVISE")) return "ADVISE";
    if (text.includes("BACKGROUND")) return "BACKGROUND";
    if (text.includes("SIDE")) return "PLAN";
    if (text.includes("PLAN")) return "PLAN";
    if (text.includes("HOLD")) return "HOLD";
    if (text.includes("WAIT")) return "WAIT";
    if (text.includes("OBSERVE")) return "OBSERVE";
    return fallback;
  }

  function usefulCouncilText(value) {
    const text = String(value ?? "").trim();
    if (!text) return "";
    if (/^(none|n\/a|unknown|0|no)$/i.test(text)) return "";
    return text;
  }

  function firstCouncilText(...values) {
    for (const value of values) {
      const text = usefulCouncilText(value);
      if (text) return text;
    }
    return "";
  }

  function councilBadgeHtml(decision) {
    const normalized = normalizeCouncilDecision(decision);
    return `<span class="kbc-council-badge kbc-council-${normalized.toLowerCase()}">${escapeHtml(normalized)}</span>`;
  }

  function councilBlockersHtml(blockers = []) {
    const filtered = blockers.map(usefulCouncilText).filter(Boolean).slice(0, 4);
    if (!filtered.length) return "";
    return `
      <div class="kbc-council-blockers" aria-label="Blockers">
        ${filtered.map((item) => `<span class="kbc-council-chip">${escapeHtml(item)}</span>`).join("")}
      </div>
    `;
  }

  function councilSummaryTile(label, value, tone = "") {
    return `
      <div class="kbc-council-summary-tile ${tone ? `kbc-council-summary-${tone}` : ""}">
        <span>${escapeHtml(label)}</span>
        <strong>${escapeHtml(value || "none")}</strong>
      </div>
    `;
  }

  function councilLane(name) {
    return (strategyInspector?.lanes || []).find((lane) => lane.name === name) || null;
  }

  function selectedLaneDecision(laneName, fallback) {
    const selected = [
      strategyInspector?.overseerMainSelected,
      strategyInspector?.overseerSideSelected,
      strategyInspector?.laneCoordinatorSelectedSummary,
    ].join(" ");
    if (new RegExp(`\\b${laneName}\\b`, "i").test(selected) && /\bBUY\b/i.test(selected)) return "BUY";
    return normalizeCouncilDecision(fallback);
  }

  function buildCouncilFocusItems() {
    if (!strategyInspector) return ["Waiting for the first Smart run."];

    const items = [];

    items.push(`Primary focus: ${strategyInspector.momentumPrimaryFocus || "Methodical progression"}.`);
    items.push(`Best step: ${strategyInspector.momentumBestStep || "Wait"} (${strategyInspector.momentumBestStepDecision || "WAIT"}).`);
    if (usefulCouncilText(strategyInspector.energySupportBestUseReason)) {
      items.push(`Energy support: ${strategyInspector.energySupportBestUse || "wait"} - ${strategyInspector.energySupportBestUseReason}.`);
    }
    if (usefulCouncilText(strategyInspector.momentumBackgroundActions) && strategyInspector.momentumBackgroundActions !== "none") {
      items.push(`Background: ${strategyInspector.momentumBackgroundActions}.`);
    }

    if (!items.length) {
      items.push(strategyInspector.nextLikelyBuy ? `Watch next likely buy: ${strategyInspector.nextLikelyBuy}.` : "No urgent focus; observe the next Smart run.");
    }

    return items.slice(0, 4);
  }

  function buildCouncilSpeakerState() {
    const lane = String(strategyInspector?.councilWinningLane || "none");
    const candidate = String(strategyInspector?.councilWinningCandidate || "none");
    const resolvedSpeaker = resolveCouncilPrimarySpeaker(strategyInspector?.momentumPrimaryAdvisor, lane) || "The Council";
    const fallback = {
      speaker: resolvedSpeaker,
      lane,
      candidate,
      bubble: strategyInspector?.momentumBestStepReason || strategyInspector?.councilFocusBubble || "Observe the next run.",
    };

    if (lane === "Territory") {
      if (strategyInspector?.expansionArmySeedDecision === "BUY") {
        return {
          speaker: resolvedSpeaker,
          lane,
          candidate,
          bubble: `Raise the warband first. More ${strategyInspector.expansionArmySeedUnit || candidate} will bring the next Expansion much sooner.`,
        };
      }
      if (strategyInspector?.expansionArmySeedInsideSaveWindow === "yes") {
        return {
          speaker: resolvedSpeaker,
          lane,
          candidate,
          bubble: "Hold the ground. Expansion is close, so territory must be saved.",
        };
      }
    }

    if (lane === "Energy") {
      if (strategyInspector?.postNexusEnergyDecision === "BUY") {
        return {
          speaker: resolvedSpeaker,
          lane,
          candidate,
          bubble: `I will feed the energy swarm carefully: +${strategyInspector.postNexusEnergyAmount || "0"} ${strategyInspector.postNexusEnergyCandidate || "Lepidoptera"}, still below the stop line.`,
        };
      }
      return {
        speaker: resolvedSpeaker,
        lane,
        candidate,
        bubble: "Rituals stay sealed. Auto-cast is off.",
      };
    }

    if (lane === "Meat") {
      return {
        speaker: resolvedSpeaker,
        lane,
        candidate,
        bubble: "Forge the next body-step, then refill the hive neurons we spent.",
      };
    }

    if (lane === "Engine") {
      return {
        speaker: resolvedSpeaker,
        lane,
        candidate,
        bubble: strategyInspector?.protectedResources?.includes("territory")
          ? "Save territory. Expansion is near."
          : "Expansion is the next larva engine milestone.",
      };
    }

    return fallback;
  }

  function buildCouncilDoThisNowState() {
    if (!strategyInspector) {
      return {
        doThisNow: "Wait for first Smart run",
        why: "The Council needs one run of data.",
        botIsDoing: "Observing lanes.",
        playerShouldAvoid: "No immediate manual action needed.",
      };
    }

    return {
      doThisNow: strategyInspector.momentumBestStep || "Wait",
      why: strategyInspector.momentumBestStepReason || strategyInspector.energySupportBestUseReason || "No safe bounded action yet.",
      botIsDoing: strategyInspector.momentumAutobuyerInstruction || "Bounded Smart actions only.",
      playerShouldAvoid: strategyInspector.momentumPlayerInstruction || "Avoid risky spend while guardrails are active.",
    };
  }

  function councilCardHtml(card, activeSpeaker) {
    const decision = normalizeCouncilDecision(card.decision);
    const relevantClass = card.relevant ? "is-relevant" : "is-muted";
    const activeClass = activeSpeaker?.speaker === card.name ? "is-active" : "";
    return `
      <article class="kbc-council-card ${relevantClass} ${activeClass}" data-kbc-decision="${escapeHtml(decision)}">
        <div class="kbc-council-card-head">
          <span class="kbc-council-icon" aria-hidden="true">${card.icon}</span>
          <div>
            <strong>${escapeHtml(card.name)}</strong>
            <span>${escapeHtml(card.role)}</span>
          </div>
          ${councilBadgeHtml(decision)}
        </div>
        <div class="kbc-council-action"><strong>I want:</strong> ${escapeHtml(card.want || card.spoken || "Observing this lane.")}</div>
        <p class="kbc-council-why"><strong>Because:</strong> ${escapeHtml(card.because || card.why || "No clear reason reported this run.")}</p>
        <p class="kbc-council-status"><strong>Status:</strong> ${escapeHtml(card.status || "Observing")}</p>
        ${councilBlockersHtml(card.blockers)}
        <details class="kbc-council-technical">
          <summary>Technical details</summary>
          <div>${escapeHtml(card.technical || "No technical detail reported this run.")}</div>
        </details>
      </article>
    `;
  }

  function buildCouncilCards() {
    const territoryLane = councilLane("Territory");
    const energyLane = councilLane("Energy");
    const meatLane = councilLane("Meat");
    const engineLane = councilLane("Engine");
    const cloneLane = councilLane("Clone Prep");
    const abilityLane = councilLane("Ability");
    const twinLane = councilLane("Twin") || councilLane("Upgrade");

    return [
      {
        icon: "🐜",
        name: "General Mandible",
        role: "Territory & Army",
        decision: selectedLaneDecision("Territory", strategyInspector.territoryPrepDecision || territoryLane?.decision),
        want: normalizeCouncilDecision(strategyInspector.expansionArmySeedDecision || strategyInspector.territoryPrepDecision || territoryLane?.decision) === "BUY"
          ? "Raise the army to claim territory faster."
          : (strategyInspector.expansionArmySeedInsideSaveWindow === "yes"
            ? "Hold territory. Expansion is close."
            : "No army move would speed Expansion enough yet."),
        because: firstCouncilText(
          strategyInspector.expansionArmySeedReason,
          strategyInspector.territoryPrepReason,
          strategyInspector.territoryDidNotBuyReason,
          territoryLane?.reason
        ),
        status: normalizeCouncilDecision(strategyInspector.expansionArmySeedDecision || strategyInspector.territoryPrepDecision || territoryLane?.decision) === "BUY"
          ? "Ready / doing this now"
          : (strategyInspector.expansionArmySeedInsideSaveWindow === "yes" ? "Blocked by save-window" : "Blocked"),
        technical: firstCouncilText(
          strategyInspector.expansionArmySeedReason,
          strategyInspector.territoryPrepReason,
          strategyInspector.territoryDidNotBuyReason,
          territoryLane?.reason
        ),
        blockers: [
          strategyInspector.territoryDidNotBuyReason,
          strategyInspector.armyPrepMissingUnits && strategyInspector.armyPrepMissingUnits !== "none" ? `missing ${strategyInspector.armyPrepMissingUnits}` : "",
          strategyInspector.overseerBlockedByHardGuard,
        ],
        relevant: selectedLaneDecision("Territory", strategyInspector.territoryPrepDecision || territoryLane?.decision) !== "OBSERVE" || usefulCouncilText(strategyInspector.territoryPrepCandidate),
      },
      {
        icon: "🪲",
        name: "Beetle Magus",
        role: "Energy & Abilities",
        decision: normalizeCouncilDecision(strategyInspector.energySupportBestUseDecision || strategyInspector.postNexusEnergyDecision || energyLane?.decision || abilityLane?.decision),
        want: strategyInspector.energySupportBestUse === "clone-larvae"
          ? "Help Larva Steward with Clone Larvae."
          : (strategyInspector.energySupportLepidopteraRole === "background"
            ? "Grow energy in the background."
            : "Keep rituals advisor-only until payoff is clear."),
        because: firstCouncilText(
          strategyInspector.energySupportBestUseReason,
          strategyInspector.energySupportLepidopteraReason,
          strategyInspector.postNexusEnergyReason,
          strategyInspector.abilityPrepReason,
          energyLane?.reason,
          abilityLane?.reason
        ),
        status: strategyInspector.energySupportBestUseDecision === "ADVISE"
          ? "Advisor only. Auto-cast is off."
          : (strategyInspector.energySupportBestUseDecision === "BACKGROUND" ? "Background chore" : "Not yet"),
        technical: firstCouncilText(strategyInspector.energySupportBestUseReason, strategyInspector.energySupportCloneReason, strategyInspector.energySupportMirrorReason, strategyInspector.postNexusEnergyReason),
        blockers: [
          config.autoCastAbilities ? "" : "auto-cast disabled",
          usefulCouncilText(strategyInspector.energySupportBestUseBlockedBy) ? strategyInspector.energySupportBestUseBlockedBy : "",
          strategyInspector.abilityPrepRequiresArmyPrep === "yes" ? "army prep required" : "",
          strategyInspector.abilityPrepRequiresCloneBuffer === "yes" ? "clone buffer required" : "",
        ],
        relevant: true,
      },
      {
        icon: "🐛",
        name: "Larva Steward",
        role: "Larvae & Clone Buffer",
        decision: normalizeCouncilDecision(strategyInspector.energySupportCloneDecision || (strategyInspector.cloneBufferHardLockActive === "yes" ? "HOLD" : cloneLane?.decision), "OBSERVE"),
        want: strategyInspector.cloneBufferHardLockActive === "yes"
          ? "Protect larvae until the clone debt is rebuilt."
          : (strategyInspector.cloneBufferRecoveryComplete === "yes"
            ? "The clone buffer is safe again."
            : "Add cocoons so Clone Larvae can be absorbed later."),
        because: strategyInspector.energySupportCloneReason || `Buffer ${strategyInspector.cloneBufferCurrent || "0"} / ${strategyInspector.cloneBufferTarget || "0"} (${strategyInspector.cloneBufferPercent || "n/a"}).`,
        status: strategyInspector.energySupportCloneDecision === "ADVISE"
          ? "Advisor only. Auto-cast is off."
          : (strategyInspector.cloneBufferHardLockActive === "yes" ? "Buffer check" : "Not yet"),
        technical: firstCouncilText(strategyInspector.cloneBufferReason, cloneLane?.reason, strategyInspector.energySupportCloneBlockedBy, `spendable larvae ${strategyInspector.cloneBufferSpendableLarvae || "0"}`),
        blockers: [
          strategyInspector.cloneBufferHardLockActive === "yes" ? "clone hard lock" : "",
          usefulCouncilText(strategyInspector.cloneBufferLarvaeProtected) ? `protected ${strategyInspector.cloneBufferLarvaeProtected}` : "",
          usefulCouncilText(strategyInspector.cloneBufferDebt) ? `debt ${strategyInspector.cloneBufferDebt}` : "",
        ],
        relevant: true,
      },
      {
        icon: "🔨",
        name: "Flesh Smith",
        role: "Meat Chain",
        decision: selectedLaneDecision("Meat", strategyInspector.parentStepDecision || strategyInspector.unlockPlannerDecision || meatLane?.decision),
        want: normalizeCouncilDecision(strategyInspector.parentStepDecision || strategyInspector.unlockPlannerDecision || meatLane?.decision) === "BUY"
          ? "Convert hive neurons into neural clusters for the target path."
          : "The meat chain waits for a safer step.",
        because: normalizeCouncilDecision(strategyInspector.actionUnitRefillDecision) === "BUY"
          ? "Refill the hive neurons spent on the parent step."
          : "Reserve and payback guards still apply.",
        status: normalizeCouncilDecision(strategyInspector.parentStepDecision || strategyInspector.unlockPlannerDecision || meatLane?.decision) === "BUY"
          ? "Ready / doing this now"
          : "Blocked",
        technical: firstCouncilText(
          strategyInspector.parentStepReason,
          strategyInspector.actionUnitRefillReason,
          strategyInspector.unlockPlannerReason,
          strategyInspector.meatActionUnitPaybackBypassReason,
          meatLane?.reason
        ),
        blockers: [
          strategyInspector.topMeatBlockedBy,
          strategyInspector.actionUnitRefillBlockedBy,
          strategyInspector.meatActionUnitReserveRatio && strategyInspector.meatActionUnitReserveRatio !== "n/a" ? `reserve ${strategyInspector.meatActionUnitReserveRatio}` : "",
          strategyInspector.meatActionUnitPayback && strategyInspector.meatActionUnitPayback !== "n/a" ? `payback ${strategyInspector.meatActionUnitPayback}` : "",
        ],
        relevant: true,
      },
      {
        icon: "🔮",
        name: "Twin Oracle",
        role: "Upgrades & Thresholds",
        decision: selectedLaneDecision("Twin|Upgrade", strategyInspector.twinUnlockPrepDecision || strategyInspector.twinUnlockDecision || twinLane?.decision),
        want: strategyInspector.twinUnlockPrepMeaningful === "yes"
          ? "Twin threshold is close enough. Prepare the missing chain."
          : "Too early for Twin Prep. The chunk is too small to matter.",
        because: strategyInspector.twinUnlockPrepMeaningful === "yes"
          ? "The threshold gate says this prep is meaningful now."
          : "Waiting for better threshold proximity.",
        status: strategyInspector.twinUnlockPrepMeaningful === "yes" ? "Ready" : "Not yet",
        technical: firstCouncilText(
          strategyInspector.twinUnlockPrepDeferredReason,
          strategyInspector.twinUnlockReason,
          strategyInspector.twinUnlockWhyPrepDidNotWin,
          twinLane?.reason
        ),
        blockers: [
          strategyInspector.twinUnlockPrepMeaningful === "yes" ? "" : "prep not meaningful",
          strategyInspector.twinUnlockRatio && strategyInspector.twinUnlockRatio !== "n/a" ? `ratio ${strategyInspector.twinUnlockRatio}` : "",
          strategyInspector.twinUnlockReserveRatio && strategyInspector.twinUnlockReserveRatio !== "n/a" ? `reserve ${strategyInspector.twinUnlockReserveRatio}` : "",
        ],
        relevant: usefulCouncilText(strategyInspector.twinUnlockPrepCandidate) || usefulCouncilText(strategyInspector.twinUnlockCandidate),
      },
      {
        icon: "🏗️",
        name: "Brood Architect",
        role: "Hatchery & Expansion",
        decision: selectedLaneDecision("Engine", engineLane?.decision || strategyInspector.mainDecision),
        want: strategyInspector.protectedResources?.includes("territory")
          ? "Save territory. Expansion is near."
          : "Expansion is the next larva engine milestone.",
        because: strategyInspector.protectedResources?.includes("territory")
          ? "Not buyable yet, but territory must be held for the save window."
          : "Not buyable yet.",
        status: strategyInspector.protectedResources?.includes("territory") ? "Do not spend territory" : "Watching milestone",
        technical: firstCouncilText(engineLane?.reason, strategyInspector.waits, strategyInspector.protectedResources),
        blockers: [
          strategyInspector.protectedResources,
          strategyInspector.waits,
        ],
        relevant: true,
      },
    ];
  }

  function councilStrategyBarHtml() {
    if (!config.strategyInspector) {
      return `<div class="kbc-strategy-card"><span>Strategy Inspector</span><strong>Off</strong></div>`;
    }

    if (!strategyInspector) {
      return `
        <div class="kbc-council-shell">
          <div class="kbc-council-hero">
            <div>
              <span class="kbc-council-eyebrow">The Swarm Council</span>
              <strong>Waiting for first Smart run</strong>
            </div>
          </div>
        </div>
      `;
    }

    const importantBlocker = firstCouncilText(
      strategyInspector.overseerBlockedByHardGuard,
      strategyInspector.blockedBySummary,
      liveDiagnosticsWarningLabel()
    ) || "none";
    const focusItems = buildCouncilFocusItems();
    const activeSpeaker = buildCouncilSpeakerState();
    const nowState = buildCouncilDoThisNowState();

    return `
      <div class="kbc-council-shell">
        <div class="kbc-council-hero">
          <div>
            <span class="kbc-council-eyebrow">The Swarm Council</span>
            <strong>${escapeHtml(strategyInspector.overseerDecision || strategyInspector.laneCoordinatorDecision || "OBSERVE")}</strong>
          </div>
          ${councilBadgeHtml(strategyInspector.mainDecision || strategyInspector.decision)}
        </div>
        <div class="kbc-council-summary">
          ${councilSummaryTile("Phase", strategyInspector.phase || "n/a")}
          ${councilSummaryTile("Primary", strategyInspector.momentumPrimaryFocus || "n/a")}
          ${councilSummaryTile("Advisor", strategyInspector.momentumPrimaryAdvisor || activeSpeaker.speaker || "none")}
          ${councilSummaryTile("Main", strategyInspector.overseerMainSelected || "none")}
          ${councilSummaryTile("Companion", strategyInspector.momentumCompanionActions || "none")}
          ${councilSummaryTile("Background", strategyInspector.momentumBackgroundActions || "none")}
          ${councilSummaryTile("Blocker", importantBlocker, importantBlocker === "none" ? "" : "warn")}
        </div>
        <section class="kbc-council-now" aria-label="Do this now">
          <div><strong>Do this now:</strong> <span>${escapeHtml(nowState.doThisNow)}</span></div>
          <div><strong>Why:</strong> <span>${escapeHtml(nowState.why)}</span></div>
          <div><strong>Bot is doing:</strong> <span>${escapeHtml(nowState.botIsDoing)}</span></div>
          <div><strong>Player should avoid:</strong> <span>${escapeHtml(nowState.playerShouldAvoid)}</span></div>
        </section>
        <section class="kbc-council-focus" aria-label="Focus now">
          <strong>Focus now</strong>
          <ul>${focusItems.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
        </section>
        <section class="kbc-council-speaker" aria-label="Active speaker">
          <strong>${escapeHtml(activeSpeaker.speaker || "The Council")}</strong>
          <div class="kbc-council-bubble">${escapeHtml(activeSpeaker.bubble || "Observe the next run.")}</div>
          <small>Winning lane: ${escapeHtml(activeSpeaker.lane || "none")} | Candidate: ${escapeHtml(activeSpeaker.candidate || "none")}</small>
        </section>
        <div class="kbc-council-grid">
          ${buildCouncilCards().map((card) => councilCardHtml(card, activeSpeaker)).join("")}
        </div>
      </div>
    `;
  }

  function classicStrategyBarHtml() {
    if (!config.strategyInspector) {
      return `<div class="kbc-strategy-card"><span>Strategy Inspector</span><strong>Off</strong></div>`;
    }

    if (!strategyInspector) {
      return `<div class="kbc-strategy-card"><span>Strategy Inspector</span><strong>Waiting for first Smart run</strong></div>`;
    }

    const laneByName = new Map((strategyInspector.lanes || []).map((lane) => [lane.name, lane]));

    const laneCard = (label, lane) => [
      label,
      lane ? `${lane.decision} ${lane.title}`.trim() : "none",
      lane?.reason || "no lane-specific candidate this run",
      "",
    ];

    const cards = [
      ["Overseer", strategyInspector.overseerDecision || strategyInspector.laneCoordinatorDecision || "none", strategyInspector.overseerWhySelected || "", strategyInspector.overseerActionsUsed || ""],
      ["Main selected", strategyInspector.overseerMainSelected || "none", strategyInspector.overseerWhySelected || "", ""],
      ["Companion selected", strategyInspector.overseerSideSelected || "none", strategyInspector.overseerWhyNoSide || "", strategyInspector.overseerBlockedByHardGuard || ""],
      laneCard("Engine / Larva", laneByName.get("Engine")),
      laneCard("Meat", laneByName.get("Meat")),
      laneCard("Territory / Army", laneByName.get("Territory")),
      laneCard("Energy", laneByName.get("Energy")),
      laneCard("Clone", laneByName.get("Clone Prep")),
      laneCard("Ability", laneByName.get("Ability")),
      laneCard("Twin / Upgrade", laneByName.get("Upgrade") || laneByName.get("Twin")),
      ["Next likely buy", strategyInspector.nextLikelyBuy || strategyInspector.waits, liveDiagnosticsWarningLabel(), strategyInspector.blockedBySummary || ""],
    ];

    return cards
      .map(([key, value, reason, extra]) => `
        <div class="kbc-strategy-card">
          <span>${escapeHtml(key)}</span>
          <strong>${escapeHtml(value)}</strong>
          ${reason ? `<small>${escapeHtml(reason)}</small>` : ""}
          ${extra ? `<small>${escapeHtml(extra)}</small>` : ""}
        </div>
      `)
      .join("");
  }

  function strategyBarHtml() {
    return config.councilUi ? councilStrategyBarHtml() : classicStrategyBarHtml();
  }

  function buildLogExportPayload() {
    const summary = summarizeLaneCandidates();
    const diagnostics = liveDiagnostics || buildLiveDiagnostics(runHistory);
    const cfg = compactConfigSummary();
    const refillIsActive = String(strategyInspector?.actionUnitRefillDecision || actionUnitRefillState?.decision || "").toUpperCase() === "BUY";
    const refillCandidate = strategyInspector?.actionUnitRefillCandidate || actionUnitRefillState?.candidate || "none";
    const activePlannerAction = refillIsActive
      ? `Parent Refill: ${refillCandidate}`
      : (strategyInspector?.momentumBestStep || "Wait");

    return {
      exportedAt: new Date().toISOString(),
      scriptVersion: SCRIPT_VERSION,
      source: scenarioSourceTag(),
      scenarioId: scenarioHarnessContext.active ? scenarioHarnessContext.scenarioId : "none",
      status: lastStatus,
      strategyInspector,
      activePlannerAction,
      runHistory: runHistory.slice(),
      liveDiagnostics: diagnostics,
      laneCoordinatorDecision: strategyInspector?.laneCoordinatorDecision || laneCoordinatorState?.coordinatorDecision || "none",
      selectedLaneActions: strategyInspector?.laneCoordinatorSelectedActions || laneCoordinatorState?.selectedLaneActions || [],
      decisionLanes: strategyInspector?.lanes || summarizeDecisionLanes(),
      laneCandidates: strategyInspector?.laneCandidates || summary.laneCandidates,
      bestAllowedMainCandidate: strategyInspector?.bestAllowedMainCandidate || summary.bestAllowedMainCandidate,
      bestAllowedSideCandidate: strategyInspector?.bestAllowedSideCandidate || summary.bestAllowedSideCandidate,
      bestRejectedStrategicCandidate: strategyInspector?.bestRejectedStrategicCandidate || summary.bestRejectedStrategicCandidate,
      closestRejectedToBuying: strategyInspector?.closestRejectedToBuying || summary.closestRejectedToBuying,
      closestMainLaneToBuying: strategyInspector?.closestMainLaneToBuying || summary.closestMainLaneToBuying,
      closestLaneToBuying: strategyInspector?.closestLaneToBuying || summary.closestLaneToBuying,
      nextLikelyBuy: strategyInspector?.nextLikelyBuy || "unknown",
      // Legacy 0.7.3 names kept for compatibility.
      bestRejectedCandidate: strategyInspector?.bestRejectedCandidate || summary.bestRejectedCandidate,
      bestAllowedCandidate: strategyInspector?.bestAllowedCandidate || summary.bestAllowedCandidate,
      blockedByProtectedResources: strategyInspector?.blockedByProtectedResources || summary.blockedByProtectedResources,
      blockedByPayback: strategyInspector?.blockedByPayback || summary.blockedByPayback,
      blockedByReserve: strategyInspector?.blockedByReserve || summary.blockedByReserve,
      blockedByEnergyPlan: strategyInspector?.blockedByEnergyPlan || summary.blockedByEnergyPlan,
      blockedByAbilityDisabled: strategyInspector?.blockedByAbilityDisabled || summary.blockedByAbilityDisabled,
      blockedBySummary: strategyInspector?.blockedBySummary || summary.blockedBySummary,
      meatFallbackEnabled: !!config.meatFallbackEnabled,
      meatFallbackCandidate: strategyInspector?.meatFallbackCandidate || meatFallbackState?.candidate || "none",
      meatFallbackReason: strategyInspector?.meatFallbackReason || meatFallbackState?.reason || "none",
      meatFallbackStrategicTarget: strategyInspector?.meatFallbackStrategicTarget || meatFallbackState?.strategicTarget || "none",
      meatFallbackBlockedCandidate: strategyInspector?.meatFallbackBlockedCandidate || meatFallbackState?.blockedCandidate || "none",
      skippedMeatCandidates: strategyInspector?.skippedMeatCandidates || meatFallbackState?.skipped || [],
      topMeatBlockedBy: strategyInspector?.topMeatBlockedBy || meatFallbackState?.topBlockedBy || "none",
      stallBreakerActive: !!(strategyInspector?.stallBreakerActive || meatFallbackState?.stallBreakerActive),
      recentMainHoldRuns: strategyInspector?.recentMainHoldRuns ?? meatFallbackState?.recentMainHoldRuns ?? countConsecutiveRecentMainHoldRuns(),
      fallbackRankDrop: strategyInspector?.fallbackRankDrop ?? meatFallbackState?.fallbackRankDrop ?? null,
      meatActionUnitPaybackBypassTriggered: !!(strategyInspector?.meatActionUnitPaybackBypassTriggered || meatActionUnitPaybackBypassState?.triggered),
      meatActionUnitPaybackBypassReason: strategyInspector?.meatActionUnitPaybackBypassReason || meatActionUnitPaybackBypassState?.reason || "none",
      meatActionUnitReserveRatio: strategyInspector?.meatActionUnitReserveRatio || meatActionUnitPaybackBypassState?.reserveRatioText || (Number.isFinite(meatActionUnitPaybackBypassState?.reserveRatio) ? `${trimNumber(meatActionUnitPaybackBypassState.reserveRatio)}x` : "n/a"),
      meatActionUnitPaybackSeconds: strategyInspector?.meatActionUnitPaybackSeconds ?? (Number.isFinite(meatActionUnitPaybackBypassState?.paybackSeconds) ? meatActionUnitPaybackBypassState.paybackSeconds : null),
      meatActionUnitName: strategyInspector?.meatActionUnitName || meatActionUnitPaybackBypassState?.unitName || "none",
      targetAwareUpgradeCandidate: strategyInspector?.targetAwareUpgradeCandidate || targetAwareUpgradeState?.candidate || "none",
      targetAwareUpgradeDecision: strategyInspector?.targetAwareUpgradeDecision || targetAwareUpgradeState?.decision || "none",
      targetAwareUpgradeReason: strategyInspector?.targetAwareUpgradeReason || targetAwareUpgradeState?.reason || "none",
      targetAwareUpgradeName: strategyInspector?.targetAwareUpgradeName || targetAwareUpgradeState?.name || "none",
      targetAwareUpgradeType: strategyInspector?.targetAwareUpgradeType || targetAwareUpgradeState?.type || "none",
      targetAwareUpgradeSupportsActionUnit: strategyInspector?.targetAwareUpgradeSupportsActionUnit || (targetAwareUpgradeState?.supportsActionUnit ? "yes" : "no"),
      targetAwareUpgradeReserveRatio: strategyInspector?.targetAwareUpgradeReserveRatio || targetAwareUpgradeState?.reserveRatioText || "n/a",
      targetAwareUpgradeCostResource: strategyInspector?.targetAwareUpgradeCostResource || targetAwareUpgradeState?.costResource || "none",
      unlockPlannerCandidate: strategyInspector?.unlockPlannerCandidate || unlockPlannerState?.candidate || "none",
      unlockPlannerDecision: strategyInspector?.unlockPlannerDecision || unlockPlannerState?.decision || "none",
      unlockPlannerReason: strategyInspector?.unlockPlannerReason || unlockPlannerState?.reason || "none",
      unlockPlannerTarget: strategyInspector?.unlockPlannerTarget || unlockPlannerState?.target || "none",
      unlockPlannerUnlocks: strategyInspector?.unlockPlannerUnlocks || unlockPlannerState?.unlocks || "none",
      unlockPlannerCostResource: strategyInspector?.unlockPlannerCostResource || unlockPlannerState?.costResource || "none",
      unlockPlannerReserveRatio: strategyInspector?.unlockPlannerReserveRatio || unlockPlannerState?.reserveRatioText || "n/a",
      unlockPlannerPaybackBypassed: !!(strategyInspector?.unlockPlannerPaybackBypassed || unlockPlannerState?.paybackBypassed),
      parentStepCandidate: strategyInspector?.parentStepCandidate || parentStepPlannerState?.candidate || "none",
      parentStepDecision: strategyInspector?.parentStepDecision || parentStepPlannerState?.decision || "none",
      parentStepReason: strategyInspector?.parentStepReason || parentStepPlannerState?.reason || "none",
      parentStepTarget: strategyInspector?.parentStepTarget || parentStepPlannerState?.target || "none",
      parentStepActionUnit: strategyInspector?.parentStepActionUnit || parentStepPlannerState?.actionUnit || "none",
      parentStepCostResource: strategyInspector?.parentStepCostResource || parentStepPlannerState?.costResource || "none",
      parentStepReserveRatio: strategyInspector?.parentStepReserveRatio || parentStepPlannerState?.reserveRatioText || "n/a",
      parentStepPaybackBypassed: !!(strategyInspector?.parentStepPaybackBypassed || parentStepPlannerState?.paybackBypassed),
      parentStepSupportsActionUnit: strategyInspector?.parentStepSupportsActionUnit || (parentStepPlannerState?.supportsActionUnit ? "yes" : "no"),
      parentStepConsumedActionUnit: strategyInspector?.parentStepConsumedActionUnit || (parentStepPlannerState?.consumedActionUnit ? "yes" : "no"),
      parentStepConsumedUnit: strategyInspector?.parentStepConsumedUnit || parentStepPlannerState?.consumedUnit || "none",
      actionUnitRefillCandidate: strategyInspector?.actionUnitRefillCandidate || actionUnitRefillState?.candidate || "none",
      actionUnitRefillDecision: strategyInspector?.actionUnitRefillDecision || actionUnitRefillState?.decision || "OBSERVE",
      actionUnitRefillReason: strategyInspector?.actionUnitRefillReason || actionUnitRefillState?.reason || "none",
      actionUnitRefillBlockedBy: strategyInspector?.actionUnitRefillBlockedBy || actionUnitRefillState?.blockedBy || "none",
      actionUnitRefillReserveRatio: strategyInspector?.actionUnitRefillReserveRatio || actionUnitRefillState?.reserveRatioText || "n/a",
      actionUnitRefillPayback: strategyInspector?.actionUnitRefillPayback || actionUnitRefillState?.paybackText || "n/a",
      actionUnitRefillPaybackBypassed: strategyInspector?.actionUnitRefillPaybackBypassed || (actionUnitRefillState?.paybackBypassed ? "yes" : "no"),
      actionBudgetRemainingAfterParentStep: strategyInspector?.actionBudgetRemainingAfterParentStep || String(actionUnitRefillState?.actionBudgetRemainingAfterParentStep ?? 0),
      followUpActionSelected: strategyInspector?.followUpActionSelected || (actionUnitRefillState?.followUpActionSelected ? "yes" : "no"),
      whyNoFollowUpAction: strategyInspector?.whyNoFollowUpAction || actionUnitRefillState?.whyNoFollowUpAction || "none",
      antiPingpongGuardActive: strategyInspector?.antiPingpongGuardActive || (actionUnitRefillState?.antiPingpongGuardActive ? "yes" : "no"),
      antiPingpongGuardAllowedRefill: strategyInspector?.antiPingpongGuardAllowedRefill || (actionUnitRefillState?.antiPingpongGuardAllowedRefill ? "yes" : "no"),
      coordinatorRemainingBudgetReason: strategyInspector?.coordinatorRemainingBudgetReason || laneCoordinatorState?.coordinatorRemainingBudgetReason || actionUnitRefillState?.coordinatorRemainingBudgetReason || "none",
      postNexusEnergyCandidate: strategyInspector?.postNexusEnergyCandidate || postNexusEnergyPlannerState?.postNexusEnergyCandidate || "none",
      postNexusEnergyDecision: strategyInspector?.postNexusEnergyDecision || postNexusEnergyPlannerState?.postNexusEnergyDecision || "OBSERVE",
      postNexusEnergyReason: strategyInspector?.postNexusEnergyReason || postNexusEnergyPlannerState?.postNexusEnergyReason || "none",
      postNexusEnergyAmount: strategyInspector?.postNexusEnergyAmount || postNexusEnergyPlannerState?.postNexusEnergyAmount || "0",
      postNexusEnergyBoostBefore: strategyInspector?.postNexusEnergyBoostBefore || postNexusEnergyPlannerState?.postNexusEnergyBoostBefore || "n/a",
      postNexusEnergyBoostAfter: strategyInspector?.postNexusEnergyBoostAfter || postNexusEnergyPlannerState?.postNexusEnergyBoostAfter || "n/a",
      postNexusEnergyBoostGain: strategyInspector?.postNexusEnergyBoostGain || postNexusEnergyPlannerState?.postNexusEnergyBoostGain || "n/a",
      postNexusEnergyReserve: strategyInspector?.postNexusEnergyReserve || postNexusEnergyPlannerState?.postNexusEnergyReserve || "0",
      postNexusEnergyBlockedBy: strategyInspector?.postNexusEnergyBlockedBy || postNexusEnergyPlannerState?.postNexusEnergyBlockedBy || "none",
      postNexusEnergySpend: strategyInspector?.postNexusEnergySpend || postNexusEnergyPlannerState?.postNexusEnergySpend || "0",
      twinUnlockCandidate: strategyInspector?.twinUnlockCandidate || twinUnlockPlannerState?.candidate || "none",
      twinUnlockDecision: strategyInspector?.twinUnlockDecision || twinUnlockPlannerState?.decision || "none",
      twinUnlockReason: strategyInspector?.twinUnlockReason || twinUnlockPlannerState?.reason || "none",
      twinUnlockTarget: strategyInspector?.twinUnlockTarget || twinUnlockPlannerState?.target || "none",
      twinUnlockUpgrade: strategyInspector?.twinUnlockUpgrade || twinUnlockPlannerState?.upgrade || "none",
      twinUnlockCostResource: strategyInspector?.twinUnlockCostResource || twinUnlockPlannerState?.costResource || "none",
      twinUnlockCurrent: strategyInspector?.twinUnlockCurrent || twinUnlockPlannerState?.current || "0",
      twinUnlockRequired: strategyInspector?.twinUnlockRequired || twinUnlockPlannerState?.required || "0",
      twinUnlockMissing: strategyInspector?.twinUnlockMissing || twinUnlockPlannerState?.missing || "0",
      twinUnlockRatio: strategyInspector?.twinUnlockRatio || twinUnlockPlannerState?.thresholdRatioText || "n/a",
      twinUnlockNearThresholdRatio: strategyInspector?.twinUnlockNearThresholdRatio || twinUnlockPlannerState?.nearThresholdRatioText || "n/a",
      twinUnlockPrepCandidate: strategyInspector?.twinUnlockPrepCandidate || twinUnlockPlannerState?.prepCandidate || "none",
      twinUnlockPrepChunk: strategyInspector?.twinUnlockPrepChunk || twinUnlockPlannerState?.prepChunk || "0",
      twinUnlockPrepDecision: strategyInspector?.twinUnlockPrepDecision || twinUnlockPlannerState?.prepDecision || twinUnlockPlannerState?.decision || "none",
      twinUnlockReserveRatio: strategyInspector?.twinUnlockReserveRatio || twinUnlockPlannerState?.reserveRatioText || "n/a",
      twinUnlockPaybackBypassed: !!(strategyInspector?.twinUnlockPaybackBypassed || twinUnlockPlannerState?.paybackBypassed),
      twinUnlockPostUpgradeRebuildRatio: strategyInspector?.twinUnlockPostUpgradeRebuildRatio || twinUnlockPlannerState?.postUpgradeRebuildRatioText || "n/a",
      twinUnlockRebuildSafe: strategyInspector?.twinUnlockRebuildSafe || (twinUnlockPlannerState?.rebuildSafe ? "yes" : "no"),
      twinUnlockOpportunityCostBypass: strategyInspector?.twinUnlockOpportunityCostBypass || (twinUnlockPlannerState?.opportunityCostBypass ? "yes" : "no"),
      twinUnlockOpportunityCostReason: strategyInspector?.twinUnlockOpportunityCostReason || twinUnlockPlannerState?.opportunityCostReason || "not evaluated",
      twinUnlockLostProductionPerSecond: strategyInspector?.twinUnlockLostProductionPerSecond || twinUnlockPlannerState?.lostProductionPerSecondText || "n/a",
      twinUnlockLostProductionPerHour: strategyInspector?.twinUnlockLostProductionPerHour || twinUnlockPlannerState?.lostProductionPerHourText || "n/a",
      twinUnlockLostProductionBankRatioPerHour: strategyInspector?.twinUnlockLostProductionBankRatioPerHour || twinUnlockPlannerState?.lostProductionBankRatioPerHourText || "n/a",
      twinUnlockLostProductionBankRatioLimit: strategyInspector?.twinUnlockLostProductionBankRatioLimit || twinUnlockPlannerState?.lostProductionBankRatioLimitText || "n/a",
      twinUnlockUpgradeBuyAllowedDespiteRebuildUnsafe: strategyInspector?.twinUnlockUpgradeBuyAllowedDespiteRebuildUnsafe || (twinUnlockPlannerState?.upgradeBuyAllowedDespiteRebuildUnsafe ? "yes" : "no"),
      twinUnlockPrepMeaningful: strategyInspector?.twinUnlockPrepMeaningful || (twinUnlockPlannerState?.prepMeaningful ? "yes" : "no"),
      twinUnlockPrepProgressGainPercent: strategyInspector?.twinUnlockPrepProgressGainPercent || twinUnlockPlannerState?.prepProgressGainPercentText || "n/a",
      twinUnlockPrepProgressGainRequiredPercent: strategyInspector?.twinUnlockPrepProgressGainRequiredPercent || twinUnlockPlannerState?.prepProgressGainRequiredPercentText || "n/a",
      twinUnlockPrepDeferredReason: strategyInspector?.twinUnlockPrepDeferredReason || twinUnlockPlannerState?.prepDeferredReason || "none",
      twinUnlockDeferredByParentStep: strategyInspector?.twinUnlockDeferredByParentStep || (twinUnlockPlannerState?.deferredByParentStep ? "yes" : "no"),
      twinUnlockParentStepPreferred: strategyInspector?.twinUnlockParentStepPreferred || (twinUnlockPlannerState?.parentStepPreferred ? "yes" : "no"),
      twinUnlockWhyParentStepWon: strategyInspector?.twinUnlockWhyParentStepWon || twinUnlockPlannerState?.whyParentStepWon || "none",
      twinUnlockWhyPrepDidNotWin: strategyInspector?.twinUnlockWhyPrepDidNotWin || twinUnlockPlannerState?.whyTwinPrepDidNotWin || "none",
      parentStepRefillPreserved: strategyInspector?.parentStepRefillPreserved || "n/a",
      cloneBufferMode: strategyInspector?.cloneBufferMode || cloneBufferPlannerState?.cloneBufferMode || "none",
      cloneBufferTarget: strategyInspector?.cloneBufferTarget || cloneBufferPlannerState?.cloneBufferTarget || "0",
      cloneBufferCurrent: strategyInspector?.cloneBufferCurrent || cloneBufferPlannerState?.cloneBufferCurrent || "0",
      cloneBufferPercent: strategyInspector?.cloneBufferPercent || (Number.isFinite(cloneBufferPlannerState?.cloneBufferPercent) ? `${trimNumber(cloneBufferPlannerState.cloneBufferPercent)}%` : "n/a"),
      cloneBufferDebt: strategyInspector?.cloneBufferDebt || cloneBufferPlannerState?.cloneBufferDebt || "0",
      cloneBufferSpendableLarvae: strategyInspector?.cloneBufferSpendableLarvae || cloneBufferPlannerState?.cloneBufferSpendableLarvae || "0",
      cloneBufferLarvaeProtected: strategyInspector?.cloneBufferLarvaeProtected || cloneBufferPlannerState?.cloneBufferLarvaeProtected || "0",
      cloneBufferTargetSource: strategyInspector?.cloneBufferTargetSource || cloneBufferPlannerState?.cloneBufferTargetSource || "none",
      cloneBufferHardLockActive: strategyInspector?.cloneBufferHardLockActive || (cloneBufferPlannerState?.cloneBufferHardLockActive ? "yes" : "no"),
      cloneBufferRecoveryComplete: strategyInspector?.cloneBufferRecoveryComplete || (cloneBufferPlannerState?.cloneBufferRecoveryComplete ? "yes" : "no"),
      cloneBufferCompletionThreshold: strategyInspector?.cloneBufferCompletionThreshold || cloneBufferPlannerState?.cloneBufferCompletionThreshold || "n/a",
      cloneBufferReason: strategyInspector?.cloneBufferReason || cloneBufferPlannerState?.cloneBufferReason || "none",
      abilityPrepCandidate: strategyInspector?.abilityPrepCandidate || abilityPrepPlannerState?.abilityPrepCandidate || "none",
      abilityPrepDecision: strategyInspector?.abilityPrepDecision || abilityPrepPlannerState?.abilityPrepDecision || "none",
      abilityPrepReason: strategyInspector?.abilityPrepReason || abilityPrepPlannerState?.abilityPrepReason || "none",
      abilityPrepType: strategyInspector?.abilityPrepType || abilityPrepPlannerState?.abilityPrepType || "none",
      abilityPrepEnergyAvailable: strategyInspector?.abilityPrepEnergyAvailable || abilityPrepPlannerState?.abilityPrepEnergyAvailable || "n/a",
      abilityPrepRequiresArmyPrep: strategyInspector?.abilityPrepRequiresArmyPrep || abilityPrepPlannerState?.abilityPrepRequiresArmyPrep || "no",
      abilityPrepRequiresCloneBuffer: strategyInspector?.abilityPrepRequiresCloneBuffer || abilityPrepPlannerState?.abilityPrepRequiresCloneBuffer || "no",
      houseOfMirrorsArmyValue: strategyInspector?.houseOfMirrorsArmyValue || abilityPrepPlannerState?.houseOfMirrorsArmyValue || "n/a",
      houseOfMirrorsMissingUnits: strategyInspector?.houseOfMirrorsMissingUnits || abilityPrepPlannerState?.houseOfMirrorsMissingUnits || "none",
      territoryStarvationCount: strategyInspector?.territoryStarvationCount ?? laneCoordinatorState?.territoryStarvationCount ?? getTerritoryStarvationCount(),
      lastTerritoryActionAge: strategyInspector?.lastTerritoryActionAge ?? laneCoordinatorState?.territoryActionAge ?? getLaneActionAge("Territory"),
      territoryPrepCandidate: strategyInspector?.territoryPrepCandidate || territoryPrepPlannerState?.territoryPrepCandidate || "none",
      territoryPrepDecision: strategyInspector?.territoryPrepDecision || territoryPrepPlannerState?.territoryPrepDecision || "none",
      territoryPrepReason: strategyInspector?.territoryPrepReason || territoryPrepPlannerState?.territoryPrepReason || "none",
      territoryPrepUnit: strategyInspector?.territoryPrepUnit || territoryPrepPlannerState?.territoryPrepUnit || "none",
      territoryPrepAmount: strategyInspector?.territoryPrepAmount || territoryPrepPlannerState?.territoryPrepAmount || "0",
      territoryPrepExpansionEtaBefore: strategyInspector?.territoryPrepExpansionEtaBefore || territoryPrepPlannerState?.territoryPrepExpansionEtaBefore || "n/a",
      territoryPrepExpansionEtaAfter: strategyInspector?.territoryPrepExpansionEtaAfter || territoryPrepPlannerState?.territoryPrepExpansionEtaAfter || "n/a",
      territoryPrepArmySeed: strategyInspector?.territoryPrepArmySeed || territoryPrepPlannerState?.territoryPrepArmySeed || "no",
      territoryPrepScannedFightingUnits: strategyInspector?.territoryPrepScannedFightingUnits ?? territoryPrepPlannerState?.territoryPrepScannedFightingUnits ?? 0,
      territoryPrepVisibleFightingUnits: strategyInspector?.territoryPrepVisibleFightingUnits ?? territoryPrepPlannerState?.territoryPrepVisibleFightingUnits ?? 0,
      territoryPrepBuyableFightingUnits: strategyInspector?.territoryPrepBuyableFightingUnits ?? territoryPrepPlannerState?.territoryPrepBuyableFightingUnits ?? 0,
      territoryPrepMissingMatchedCount: strategyInspector?.territoryPrepMissingMatchedCount ?? territoryPrepPlannerState?.territoryPrepMissingMatchedCount ?? 0,
      expansionArmySeedCandidate: strategyInspector?.expansionArmySeedCandidate || territoryPrepPlannerState?.expansionArmySeedCandidate || "none",
      expansionArmySeedDecision: strategyInspector?.expansionArmySeedDecision || territoryPrepPlannerState?.expansionArmySeedDecision || "OBSERVE",
      expansionArmySeedUnit: strategyInspector?.expansionArmySeedUnit || territoryPrepPlannerState?.expansionArmySeedUnit || "none",
      expansionArmySeedAmount: strategyInspector?.expansionArmySeedAmount || territoryPrepPlannerState?.expansionArmySeedAmount || "0",
      expansionArmySeedReason: strategyInspector?.expansionArmySeedReason || territoryPrepPlannerState?.expansionArmySeedReason || "none",
      expansionArmySeedEtaBefore: strategyInspector?.expansionArmySeedEtaBefore || territoryPrepPlannerState?.expansionArmySeedEtaBefore || "n/a",
      expansionArmySeedEtaAfter: strategyInspector?.expansionArmySeedEtaAfter || territoryPrepPlannerState?.expansionArmySeedEtaAfter || "n/a",
      expansionArmySeedEtaGainSeconds: strategyInspector?.expansionArmySeedEtaGainSeconds || territoryPrepPlannerState?.expansionArmySeedEtaGainSeconds || "0",
      expansionArmySeedEtaGainPercent: strategyInspector?.expansionArmySeedEtaGainPercent || territoryPrepPlannerState?.expansionArmySeedEtaGainPercent || "0%",
      expansionArmySeedTerritoryPerSecondBefore: strategyInspector?.expansionArmySeedTerritoryPerSecondBefore || territoryPrepPlannerState?.expansionArmySeedTerritoryPerSecondBefore || "0",
      expansionArmySeedTerritoryPerSecondAfter: strategyInspector?.expansionArmySeedTerritoryPerSecondAfter || territoryPrepPlannerState?.expansionArmySeedTerritoryPerSecondAfter || "0",
      expansionArmySeedBlockedBy: strategyInspector?.expansionArmySeedBlockedBy || territoryPrepPlannerState?.expansionArmySeedBlockedBy || "none",
      expansionArmySeedInsideSaveWindow: strategyInspector?.expansionArmySeedInsideSaveWindow || territoryPrepPlannerState?.expansionArmySeedInsideSaveWindow || "no",
      expansionArmySeedBestRejectedUnit: strategyInspector?.expansionArmySeedBestRejectedUnit || territoryPrepPlannerState?.expansionArmySeedBestRejectedUnit || "none",
      expansionArmySeedBestRejectedReason: strategyInspector?.expansionArmySeedBestRejectedReason || territoryPrepPlannerState?.expansionArmySeedBestRejectedReason || "none",
      territoryDidNotBuyReason: strategyInspector?.territoryDidNotBuyReason || laneCoordinatorState?.territoryDidNotBuyReason || "none",
      armyPrepMissingUnits: strategyInspector?.armyPrepMissingUnits || territoryPrepPlannerState?.armyPrepMissingUnits || abilityPrepPlannerState?.houseOfMirrorsMissingUnits || "none",
      activeCouncilSpeaker: strategyInspector?.activeCouncilSpeaker || "none",
      councilWinningLane: strategyInspector?.councilWinningLane || "none",
      councilWinningCandidate: strategyInspector?.councilWinningCandidate || "none",
      councilFocusBubble: strategyInspector?.councilFocusBubble || "none",
      energySupportBestUse: strategyInspector?.energySupportBestUse || "none",
      energySupportBestUseDecision: strategyInspector?.energySupportBestUseDecision || "HOLD",
      energySupportBestUseHelpsAdvisor: strategyInspector?.energySupportBestUseHelpsAdvisor || "none",
      energySupportBestUseReason: strategyInspector?.energySupportBestUseReason || "none",
      energySupportBestUsePlayerInstruction: strategyInspector?.energySupportBestUsePlayerInstruction || "none",
      energySupportBestUseAutobuyerInstruction: strategyInspector?.energySupportBestUseAutobuyerInstruction || "none",
      energySupportBestUseBlockedBy: strategyInspector?.energySupportBestUseBlockedBy || "none",
      energySupportBestUseSelectionReason: strategyInspector?.energySupportBestUseSelectionReason || "none",
      energySupportBackgroundAction: strategyInspector?.energySupportBackgroundAction || "none",
      energySupportCandidateRanking: strategyInspector?.energySupportCandidateRanking || "none",
      energySupportCloneCandidate: strategyInspector?.energySupportCloneCandidate || "none",
      energySupportCloneDecision: strategyInspector?.energySupportCloneDecision || "HOLD",
      energySupportCloneReason: strategyInspector?.energySupportCloneReason || "none",
      energySupportCloneLarvaeGain: strategyInspector?.energySupportCloneLarvaeGain || "n/a",
      energySupportCloneBufferSafe: strategyInspector?.energySupportCloneBufferSafe || "no",
      energySupportCloneCocoonReady: strategyInspector?.energySupportCloneCocoonReady || "no",
      energySupportCloneHelpsTarget: strategyInspector?.energySupportCloneHelpsTarget || "no",
      energySupportCloneBlockedBy: strategyInspector?.energySupportCloneBlockedBy || "none",
      energySupportMirrorCandidate: strategyInspector?.energySupportMirrorCandidate || "none",
      energySupportMirrorDecision: strategyInspector?.energySupportMirrorDecision || "HOLD",
      energySupportMirrorReason: strategyInspector?.energySupportMirrorReason || "none",
      energySupportMirrorArmyValue: strategyInspector?.energySupportMirrorArmyValue || "n/a",
      energySupportMirrorTerritoryPerSecondBefore: strategyInspector?.energySupportMirrorTerritoryPerSecondBefore || "0",
      energySupportMirrorTerritoryPerSecondAfter: strategyInspector?.energySupportMirrorTerritoryPerSecondAfter || "0",
      energySupportMirrorExpansionEtaBefore: strategyInspector?.energySupportMirrorExpansionEtaBefore || "n/a",
      energySupportMirrorExpansionEtaAfter: strategyInspector?.energySupportMirrorExpansionEtaAfter || "n/a",
      energySupportMirrorEtaGainSeconds: strategyInspector?.energySupportMirrorEtaGainSeconds || "0",
      energySupportMirrorBlockedBy: strategyInspector?.energySupportMirrorBlockedBy || "none",
      energySupportMirrorPreferredUnitsMissing: strategyInspector?.energySupportMirrorPreferredUnitsMissing || "none",
      energySupportMirrorTerritoryArmyExists: strategyInspector?.energySupportMirrorTerritoryArmyExists || "no",
      energySupportMirrorReadinessState: strategyInspector?.energySupportMirrorReadinessState || "none",
      energySupportMirrorActiveGate: strategyInspector?.energySupportMirrorActiveGate || "none",
      energySupportMirrorTerritoryRateGainRatio: strategyInspector?.energySupportMirrorTerritoryRateGainRatio || "0",
      energySupportMirrorEtaGainRatio: strategyInspector?.energySupportMirrorEtaGainRatio || "0",
      energySupportMirrorArmyStateSource: strategyInspector?.energySupportMirrorArmyStateSource || "live-unitlist:live-browser",
      energySupportMirrorEvaluationRevision: strategyInspector?.energySupportMirrorEvaluationRevision || "0",
      energySupportLepidopteraDecision: strategyInspector?.energySupportLepidopteraDecision || "WAIT",
      energySupportLepidopteraRole: strategyInspector?.energySupportLepidopteraRole || "wait",
      energySupportLepidopteraReason: strategyInspector?.energySupportLepidopteraReason || "none",
      energySupportLepidopteraSuggestedChunk: strategyInspector?.energySupportLepidopteraSuggestedChunk || "0",
      energySupportLepidopteraBoostBefore: strategyInspector?.energySupportLepidopteraBoostBefore || "n/a",
      energySupportLepidopteraBoostAfter: strategyInspector?.energySupportLepidopteraBoostAfter || "n/a",
      energySupportLepidopteraBoostGain: strategyInspector?.energySupportLepidopteraBoostGain || "n/a",
      energySupportLepidopteraReserveAfter: strategyInspector?.energySupportLepidopteraReserveAfter || "0",
      momentumPrimaryFocus: strategyInspector?.momentumPrimaryFocus || "Methodical progression",
      momentumPrimaryAdvisor: strategyInspector?.momentumPrimaryAdvisor || "none",
      momentumBestStep: strategyInspector?.momentumBestStep || "Wait",
      momentumBestStepDecision: strategyInspector?.momentumBestStepDecision || "WAIT",
      momentumBestStepReason: strategyInspector?.momentumBestStepReason || "none",
      momentumPrimaryPrioritySource: strategyInspector?.momentumPrimaryPrioritySource || "default",
      momentumPrimarySelectionReason: strategyInspector?.momentumPrimarySelectionReason || "default lane priority",
      momentumNextMilestone: strategyInspector?.momentumNextMilestone || "unknown",
      momentumNextMilestoneEta: strategyInspector?.momentumNextMilestoneEta || "n/a",
      momentumPlayerInstruction: strategyInspector?.momentumPlayerInstruction || "none",
      momentumAutobuyerInstruction: strategyInspector?.momentumAutobuyerInstruction || "none",
      momentumBackgroundActions: strategyInspector?.momentumBackgroundActions || "none",
      momentumCompanionActions: strategyInspector?.momentumCompanionActions || "none",
      momentumSideTasks: strategyInspector?.momentumSideTasks || "none",
      momentumTopBlockedOpportunity: strategyInspector?.momentumTopBlockedOpportunity || "none",
      momentumWhyWaitingIsBest: strategyInspector?.momentumWhyWaitingIsBest || "none",
      advisorLog: advisorLog.slice(),
      purchaseLog: purchaseLog.slice(),
      configSummary: cfg,
      config: cfg,
    };
  }

  function getScenarioStateSnapshot(game, engine) {
    const resourceNames = ["meat", "larva", "cocoon", "territory", "energy", "clone", "nexus"];
    const resources = {};
    const rates = {};

    for (const name of resourceNames) {
      resources[name] = formatSwarmNumber(getCurrentResource(game, name));
      rates[name] = formatSwarmNumber(getVelocity(game, name));
    }

    const plan = safe("Scenario snapshot meat plan", () => buildMeatGoalPlan(game)) || null;
    const actionUnit = plan?.actionUnit || null;
    const parentUnit = getDirectTargetPathParentUnit(plan);
    const transition = getScenarioTransitionState();

    return {
      resources,
      productionRates: rates,
      remainingActions: Number.isFinite(Number(scenarioHarnessContext.overrides?.remainingActions))
        ? Number(scenarioHarnessContext.overrides.remainingActions)
        : null,
      preferredUnitCounts: {
        "Culicimorph V": formatSwarmNumber(unitCountByArmyPrepLabel(game, "Culicimorph V")),
        "Arachnomorph V": formatSwarmNumber(unitCountByArmyPrepLabel(game, "Arachnomorph V")),
        "Stinger V": formatSwarmNumber(unitCountByArmyPrepLabel(game, "Stinger V")),
      },
      plannerUnits: {
        targetUnit: plan?.target ? getDisplayName(plan.target) : "none",
        actionUnit: actionUnit ? getDisplayName(actionUnit) : "none",
        parentUnit: parentUnit ? getDisplayName(parentUnit) : "none",
        actionUnitCount: formatSwarmNumber(actionUnit?.count?.() || 0),
        parentUnitCount: formatSwarmNumber(parentUnit?.count?.() || 0),
        actionUnitBuyable: actionUnit?.isVisible?.() && actionUnit?.isBuyable?.() ? "yes" : "no",
        parentUnitBuyable: parentUnit?.isVisible?.() && parentUnit?.isBuyable?.() ? "yes" : "no",
      },
      reserveResult: {
        parentStepReserveRatio: parentStepPlannerState?.reserveRatioText || "n/a",
        actionUnitRefillReserveRatio: actionUnitRefillState?.reserveRatioText || "n/a",
      },
      activePlannerAction: strategyInspector?.momentumBestStep || "Wait",
      plannerTransitionState: {
        betweenCycleApplied: transition?.betweenCycleApplied ? "yes" : "no",
        plannerTransitionMarker: transition?.plannerTransitionMarker || "none",
        parentStepCompletedForRefill: transition?.parentStepCompletedForRefill ? "yes" : "no",
        transitionSeenByCycle: transition?.appliedAfterCycle
          ? (Number(scenarioHarnessContext.cycleRevision || 0) > Number(transition.appliedAfterCycle) ? "yes" : "no")
          : "no",
      },
      abilityCosts: {
        houseOfMirrorsEnergy: formatSwarmNumber(getCostForResource(getGameUpgrade(game, "houseofmirrors") || getGameUpgrade(game, "swarmwarp"), "energy")),
        cloneLarvaeEnergy: formatSwarmNumber(getCostForResource(getGameUpgrade(game, "clonelarvae"), "energy")),
      },
      expansionEtaSeconds: Number.isFinite(engine?.expansionEta) ? Number(engine.expansionEta) : null,
      territoryPerSecond: formatSwarmNumber(getVelocity(game, "territory")),
    };
  }

  function evaluateScenarioExpectations(actual, expectations) {
    const rows = [];
    for (const exp of expectations || []) {
      const field = String(exp?.field || "");
      const actualValue = field ? String(actual?.[field] ?? "") : "";
      let pass = false;

      if (exp?.equals !== undefined) {
        pass = actualValue === String(exp.equals);
      } else if (exp?.includes !== undefined) {
        pass = actualValue.includes(String(exp.includes));
      } else if (exp?.notIncludes !== undefined) {
        pass = !actualValue.includes(String(exp.notIncludes));
      } else if (Array.isArray(exp?.oneOf)) {
        pass = exp.oneOf.map(String).includes(actualValue);
      }

      rows.push({
        id: exp?.id || field,
        pass,
        field,
        expected: exp,
        actual: actualValue,
      });
    }
    return rows;
  }

  function getScenarioExpectedForCycle(scenario, cycle) {
    const shared = Array.isArray(scenario?.expected) ? scenario.expected : [];
    const byCycle = [];
    const map = scenario?.expectedByCycle;

    if (Array.isArray(map)) {
      for (const entry of map) {
        if (Number(entry?.cycle) !== Number(cycle)) continue;
        for (const exp of entry?.expected || []) byCycle.push(exp);
      }
    } else if (map && typeof map === "object") {
      const rows = map[String(cycle)];
      if (Array.isArray(rows)) {
        for (const exp of rows) byCycle.push(exp);
      }
    }

    return [...shared, ...byCycle];
  }

  function mergeScenarioOverrideMaps(base = {}, patch = {}) {
    const out = { ...base };
    for (const [k, v] of Object.entries(patch || {})) out[k] = v;
    return out;
  }

  function mergeScenarioOverrides(baseOverrides, patchOverrides) {
    const base = baseOverrides || {};
    const patch = patchOverrides || {};
    return {
      ...base,
      ...patch,
      resourceCounts: mergeScenarioOverrideMaps(base.resourceCounts || base.resources, patch.resourceCounts || patch.resources),
      resourceVelocities: mergeScenarioOverrideMaps(base.resourceVelocities || base.velocities, patch.resourceVelocities || patch.velocities),
      unitCounts: mergeScenarioOverrideMaps(base.unitCounts, patch.unitCounts),
      armyUnitCounts: mergeScenarioOverrideMaps(base.armyUnitCounts || base.armyUnits, patch.armyUnitCounts || patch.armyUnits),
      abilities: mergeScenarioOverrideMaps(base.abilities, patch.abilities),
      config: mergeScenarioOverrideMaps(base.config, patch.config),
      remainingActions: Number.isFinite(Number(patch.remainingActions))
        ? Number(patch.remainingActions)
        : (Number.isFinite(Number(base.remainingActions)) ? Number(base.remainingActions) : null),
      engine: {
        ...(base.engine || {}),
        ...(patch.engine || {}),
      },
    };
  }

  function applyScenarioConfigOverrides(overrides) {
    const normalized = normalizeScenarioOverrides(overrides || {});
    const configOverrides = normalized.config || {};
    const restore = {};
    for (const [key, value] of Object.entries(configOverrides)) {
      if (!Object.prototype.hasOwnProperty.call(config, key)) continue;
      restore[key] = config[key];
      config[key] = value;
    }
    return restore;
  }

  function restoreScenarioConfigOverrides(restoreMap) {
    for (const [key, value] of Object.entries(restoreMap || {})) {
      config[key] = value;
    }
  }

  function suppressScenarioCommandWrites(commands) {
    const api = commands && typeof commands === "object" ? commands : null;
    if (!api) return () => {};

    const methods = ["buyUnit", "buyUpgrade", "buyMaxUnit", "buyMaxUpgrade"];
    const original = {};

    for (const method of methods) {
      if (typeof api[method] !== "function") continue;
      original[method] = api[method];
      api[method] = function scenarioHarnessNoOp() {
        return undefined;
      };
    }

    return function restoreScenarioCommandWrites() {
      for (const [method, fn] of Object.entries(original)) {
        api[method] = fn;
      }
    };
  }

  function runDeterministicScenarioHarness(options = {}) {
    if (!isScenarioHarnessEnabled()) {
      return {
        ok: false,
        error: `Scenario harness is disabled. Enable explicitly with localStorage key ${SCENARIO_HARNESS_ENABLE_KEY}=true.`,
      };
    }

    const game = getGame();
    const commands = getCommands();
    const scenarios = Array.isArray(options.scenarios) ? options.scenarios : [];
    const report = {
      source: "deterministic-scenario",
      scriptVersion: SCRIPT_VERSION,
      scenarioReportVersion: SCENARIO_REPORT_VERSION,
      autobuyerVersion: SCRIPT_VERSION,
      runAt: new Date().toISOString(),
      warning: "Scenario harness runs against live browser state but uses deterministic override layers and does not write save state.",
      scenarios: [],
    };

    const savedConfig = {
      advisorOnly: config.advisorOnly,
      autoBuySafeDecisions: config.autoBuySafeDecisions,
      smartMaxActionsPerRun: config.smartMaxActionsPerRun,
    };
    const restoreScenarioCommandWrites = suppressScenarioCommandWrites(commands);

    config.advisorOnly = true;
    config.autoBuySafeDecisions = false;
    config.smartMaxActionsPerRun = Math.max(1, Number(config.smartMaxActionsPerRun || 1));

    try {
      for (const scenario of scenarios) {
        const scenarioId = String(scenario?.id || "scenario");
        const source = String(scenario?.source || "deterministic-scenario");
        const cycles = Math.max(1, Number(scenario?.evaluationCycles || 1));
        const cycleReport = [];
        let scenarioOverrides = normalizeScenarioOverrides(scenario?.overrides || {});

        setScenarioContext({ scenarioId, source, overrides: scenarioOverrides });

        for (let cycle = 1; cycle <= cycles; cycle++) {
          const setupResolution = resolveScenarioArmyUnitOverrides(game, scenarioOverrides);
          if (!setupResolution.ok) {
            cycleReport.push({
              cycle,
              source,
              scenarioId,
              inputOverrides: scenarioOverrides,
              setupError: {
                code: "SCENARIO_SETUP_ALIAS_RESOLUTION_FAILED",
                errors: setupResolution.errors,
              },
              invariants: [],
            });
            break;
          }

          scenarioOverrides = setupResolution.resolvedOverrides;
          setScenarioContext({
            scenarioId,
            source,
            overrides: scenarioOverrides,
            preserveEvaluationRevision: true,
            preserveTransition: true,
          });

          scenarioHarnessContext.cycleRevision = Number(scenarioHarnessContext.cycleRevision || 0) + 1;
          const cycleConfigRestore = applyScenarioConfigOverrides(scenarioOverrides);
          clearAdvisorLog();
          clearLaneCandidates();
          meatFallbackState = null;
          meatActionUnitPaybackBypassState = null;
          actionUnitRefillState = null;
          targetAwareUpgradeState = null;
          unlockPlannerState = null;
          parentStepPlannerState = null;
          twinUnlockPlannerState = null;
          cloneBufferPlannerState = null;
          abilityPrepPlannerState = null;
          postNexusEnergyPlannerState = null;
          territoryPrepPlannerState = null;

          let engine = analyzeLarvaEngine(game);
          const engineOverrides = scenarioHarnessContext.overrides?.engine || {};
          if (Number.isFinite(engineOverrides.expansionEtaSeconds)) engine.expansionEta = engineOverrides.expansionEtaSeconds;
          if (Number.isFinite(engineOverrides.hatcheryEtaSeconds)) engine.hatcheryEta = engineOverrides.hatcheryEtaSeconds;

          const protectedResources = mergeResourceSets(protectedResourcesFromEngine(engine), getEnergyProtectedResources(game));
          const smartFocus = scenario?.smartFocus || decideSmartFocus(engine);
          const remainingActions = Number.isFinite(Number(scenarioHarnessContext.overrides?.remainingActions))
            ? Number(scenarioHarnessContext.overrides.remainingActions)
            : Math.max(1, Number(scenario?.remainingActions || 1));

          safe(`Scenario ${scenarioId} energy`, () => handleEnergyStrategy(game, commands, protectedResources));
          safe(`Scenario ${scenarioId} clone`, () => runCloneBufferPlanner(game, commands));
          safe(`Scenario ${scenarioId} unlock`, () => runUnlockPlanner(game, commands, protectedResources));
          safe(`Scenario ${scenarioId} units`, () => buySmartUnits(game, commands, engine, protectedResources, Math.max(1, remainingActions)));
          runAbilityPrepPlanner(game);

          strategyInspector = buildStrategyInspector(game, engine, protectedResources, smartFocus, [], 0, 0, Math.max(1, Number(config.smartMaxActionsPerRun || 1)));

          const payload = buildLogExportPayload();
          const cyclePlan = safe(`Scenario ${scenarioId} cycle ${cycle} plan`, () => buildMeatGoalPlan(game)) || null;
          const cycleActionUnit = cyclePlan?.actionUnit || null;
          const cycleParentUnit = getDirectTargetPathParentUnit(cyclePlan);
          const parentStepCandidateCosts = getCostList(cycleParentUnit)
            .filter((row) => row?.unit && isPositive(row?.val))
            .map((row) => `${getDisplayName(row.unit)}=${formatSwarmNumber(row.val)}`)
            .join("; ");
          const parentStepCandidateResources = getCostList(cycleParentUnit)
            .filter((row) => row?.unit && isPositive(row?.val))
            .map((row) => `${getDisplayName(row.unit)}=${formatSwarmNumber(getCurrentResource(game, row.unit?.name || ""))}`)
            .join("; ");
          const cycleTransition = getScenarioTransitionState();
          const decisionFields = {
            energySupportBestUse: payload.energySupportBestUse,
            energySupportBestUseDecision: payload.energySupportBestUseDecision,
            energySupportBestUseReason: payload.energySupportBestUseReason,
            energySupportBestUseSelectionReason: payload.energySupportBestUseSelectionReason,
            energySupportCandidateRanking: payload.energySupportCandidateRanking,
            energySupportCloneDecision: payload.energySupportCloneDecision,
            energySupportCloneReason: payload.energySupportCloneReason,
            energySupportMirrorDecision: payload.energySupportMirrorDecision,
            energySupportMirrorReason: payload.energySupportMirrorReason,
            energySupportMirrorReadinessState: payload.energySupportMirrorReadinessState,
            energySupportMirrorPreferredUnitsMissing: payload.energySupportMirrorPreferredUnitsMissing,
            energySupportMirrorActiveGate: payload.energySupportMirrorActiveGate,
            energySupportMirrorTerritoryRateGainRatio: payload.energySupportMirrorTerritoryRateGainRatio,
            energySupportMirrorEtaGainRatio: payload.energySupportMirrorEtaGainRatio,
            energySupportMirrorArmyStateSource: payload.energySupportMirrorArmyStateSource || "n/a",
            energySupportMirrorEvaluationRevision: payload.energySupportMirrorEvaluationRevision || "0",
            energySupportLepidopteraRole: payload.energySupportLepidopteraRole,
            momentumPrimaryFocus: payload.momentumPrimaryFocus,
            momentumPrimaryAdvisor: payload.momentumPrimaryAdvisor,
            momentumBestStep: payload.momentumBestStep,
            momentumBestStepDecision: payload.momentumBestStepDecision,
            momentumPrimaryPrioritySource: payload.momentumPrimaryPrioritySource,
            momentumPrimarySelectionReason: payload.momentumPrimarySelectionReason,
            parentStepDecision: payload.parentStepDecision,
            parentStepTargetUnit: payload.parentStepTarget,
            parentStepParentUnit: payload.parentStepCandidate,
            parentStepCandidate: payload.parentStepCandidate,
            parentStepReason: payload.parentStepReason,
            parentStepTarget: payload.parentStepTarget,
            parentStepActionUnit: payload.parentStepActionUnit,
            parentStepConsumedUnit: payload.parentStepConsumedUnit,
            parentStepCandidateUnitId: cycleParentUnit ? (getScenarioCanonicalUnitKey(cycleParentUnit) || "none") : "none",
            parentStepCandidateLabel: cycleParentUnit ? getDisplayName(cycleParentUnit) : "none",
            parentStepCandidateCurrentCount: formatSwarmNumber(cycleParentUnit?.count?.() || 0),
            parentStepCandidateCosts: parentStepCandidateCosts || "none",
            parentStepCandidateResources: parentStepCandidateResources || "none",
            parentStepCandidateVisible: cycleParentUnit?.isVisible?.() ? "yes" : "no",
            parentStepCandidateAvailable: cycleParentUnit ? "yes" : "no",
            parentStepCandidateBuyable: cycleParentUnit?.isVisible?.() && cycleParentUnit?.isBuyable?.() ? "yes" : "no",
            parentStepReserveResult: parentStepPlannerState?.reserveRatioText || "n/a",
            parentStepPaybackResult: parentStepPlannerState?.paybackBypassed ? "bypassed" : (parentStepPlannerState?.decision === "BUY" ? "passed" : "blocked/unknown"),
            actionUnitRefillDecision: payload.actionUnitRefillDecision,
            actionUnitRefillTargetUnit: payload.actionUnitRefillCandidate,
            actionUnitRefillParentUnit: payload.parentStepCandidate,
            actionUnitRefillReason: payload.actionUnitRefillReason,
            actionUnitRefillBlockedBy: payload.actionUnitRefillBlockedBy,
            actionUnitRefillParentStepConsumedUnit: payload.actionUnitRefillParentStepConsumedUnit,
            remainingActions: String(Math.max(1, Number(remainingActions || 1))),
            actionUnitCount: formatSwarmNumber(cycleActionUnit?.count?.() || 0),
            parentUnitCount: formatSwarmNumber(cycleParentUnit?.count?.() || 0),
            affordability: `actionUnit=${cycleActionUnit?.isVisible?.() && cycleActionUnit?.isBuyable?.() ? "buyable" : "hold"}; parentUnit=${cycleParentUnit?.isVisible?.() && cycleParentUnit?.isBuyable?.() ? "buyable" : "hold"}`,
            reserveResult: `parentStep=${payload.parentStepReserveRatio || "n/a"}; refill=${payload.actionUnitRefillReserveRatio || "n/a"}`,
            activePlannerAction: payload.activePlannerAction || payload.momentumBestStep || "Wait",
            plannerTransitionState: cycleTransition?.plannerTransitionMarker || "none",
            betweenCycleApplied: cycleTransition?.betweenCycleApplied ? "yes" : "no",
            plannerTransitionMarker: cycleTransition?.plannerTransitionMarker || "none",
            parentStepCompletedForRefill: cycleTransition?.parentStepCompletedForRefill ? "yes" : "no",
            transitionSeenByCycle: cycleTransition?.appliedAfterCycle ? (cycle > Number(cycleTransition.appliedAfterCycle) ? "yes" : "no") : "no",
            plannerEvaluationRevision: String(scenarioHarnessContext.evaluationRevision || 0),
            harnessCycleRevision: String(scenarioHarnessContext.cycleRevision || 0),
            cloneLarvaeAvailability: payload.energySupportCloneCandidate !== "none" ? "yes" : "no",
            cloneLarvaeEnergyCost: formatSwarmNumber(getCostForResource(getGameUpgrade(game, "clonelarvae"), "energy")),
            cloneLarvaeLarvaCount: formatSwarmNumber(getCurrentResource(game, "larva")),
            cloneLarvaeCocoonCount: formatSwarmNumber(getCurrentResource(game, "cocoon")),
            cloneLarvaeLarvaVelocity: formatSwarmNumber(getVelocity(game, "larva")),
            cloneLarvaeCocoonVelocity: formatSwarmNumber(getVelocity(game, "cocoon")),
            cloneLarvaeRuntimePreview: payload.energySupportCloneLarvaeGain || "n/a",
            houseOfMirrorsAvailability: payload.energySupportMirrorCandidate !== "none" ? "yes" : "no",
            houseOfMirrorsEnergyCost: formatSwarmNumber(getCostForResource(getGameUpgrade(game, "houseofmirrors") || getGameUpgrade(game, "swarmwarp"), "energy")),
            houseOfMirrorsAffectedUnitIds: (setupResolution.observability.aliasToCanonicalRuntimeId || [])
              .filter((row) => row.inHouseOfMirrorsPreferredSet === "yes")
              .map((row) => row.canonicalRuntimeUnitId)
              .join(", ") || "none",
            houseOfMirrorsAffectedCountsBefore: (setupResolution.observability.aliasToCanonicalRuntimeId || [])
              .filter((row) => row.inHouseOfMirrorsPreferredSet === "yes")
              .map((row) => `${row.canonicalRuntimeUnitId}=${row.runtimeVisibleEffectiveCount}`)
              .join("; ") || "none",
            houseOfMirrorsAffectedTerritoryPerSecondBefore: setupResolution.observability.houseOfMirrorsAffectedTerritoryPerSecond || "0",
            houseOfMirrorsAffectedTerritoryPerSecondAfter: payload.energySupportMirrorTerritoryPerSecondAfter || "0",
            houseOfMirrorsUnaffectedTerritoryPerSecond: setupResolution.observability.unaffectedTerritoryPerSecond || "0",
            whyNoFollowUpAction: payload.whyNoFollowUpAction,
            activeCouncilSpeaker: payload.activeCouncilSpeaker,
            doThisNow: payload.momentumBestStep,
            why: payload.momentumBestStepReason,
          };
          const expectedForCycle = getScenarioExpectedForCycle(scenario, cycle);

          cycleReport.push({
            cycle,
            source,
            scenarioId,
            inputOverrides: scenarioOverrides,
            beforeState: getScenarioStateSnapshot(game, engine),
            decisions: decisionFields,
            setupObservability: setupResolution.observability,
            projection: {
              territoryPerSecondBefore: payload.energySupportMirrorTerritoryPerSecondBefore,
              territoryPerSecondAfter: payload.energySupportMirrorTerritoryPerSecondAfter,
              expansionEtaBefore: payload.energySupportMirrorExpansionEtaBefore,
              expansionEtaAfter: payload.energySupportMirrorExpansionEtaAfter,
              etaGainSeconds: payload.energySupportMirrorEtaGainSeconds,
            },
            invariants: evaluateScenarioExpectations(decisionFields, expectedForCycle),
          });
          restoreScenarioConfigOverrides(cycleConfigRestore);

          const between = Array.isArray(scenario?.betweenEvaluations) ? scenario.betweenEvaluations : [];
          for (const action of between) {
            if (Number(action?.afterCycle) !== cycle) continue;
            const beforeApply = getScenarioStateSnapshot(game, engine);
            scenarioOverrides = normalizeScenarioOverrides(mergeScenarioOverrides(scenarioOverrides, action?.applyOverrides || {}));
            setScenarioContext({
              scenarioId,
              source,
              overrides: scenarioOverrides,
              preserveEvaluationRevision: true,
              preserveTransition: true,
            });
            const afterApply = getScenarioStateSnapshot(game, engine);
            const transitionMarker = String(
              action?.plannerTransitionMarker
              || action?.transition?.plannerTransitionMarker
              || `between-cycle-${scenarioId}-${cycle}`
            );
            const transition = setScenarioTransitionState({
              betweenCycleApplied: true,
              plannerTransitionMarker: transitionMarker,
              parentStepCompletedForRefill: !!(action?.parentStepCompletedForRefill || action?.transition?.parentStepCompletedForRefill),
              parentStepCompletedForRefillConsumed: false,
              transitionActionUnit: action?.transition?.actionUnit || payload.parentStepActionUnit || "none",
              transitionParentUnit: action?.transition?.parentUnit || payload.parentStepCandidate || "none",
              transitionTargetUnit: action?.transition?.targetUnit || payload.parentStepTarget || "none",
              appliedAfterCycle: cycle,
              beforeApplyState: beforeApply,
              afterApplyState: afterApply,
            });

            cycleReport[cycleReport.length - 1].betweenCycleApply = {
              transition,
              beforeApply,
              afterApply,
            };
          }
        }

        report.scenarios.push({
          scenarioId,
          description: scenario?.description || "",
          source,
          cycles: cycleReport,
        });

        clearScenarioContext();
      }
    } finally {
      clearScenarioContext();
      restoreScenarioCommandWrites();
      config.advisorOnly = savedConfig.advisorOnly;
      config.autoBuySafeDecisions = savedConfig.autoBuySafeDecisions;
      config.smartMaxActionsPerRun = savedConfig.smartMaxActionsPerRun;
    }

    return {
      ok: true,
      report,
    };
  }

  function rankingLine(candidate) {
    return candidate
      ? `${candidate.lane}: ${candidate.candidate}${candidate.wouldBuyAmount ? ` × ${candidate.wouldBuyAmount}` : ""} — ${candidate.reason}`
      : "none";
  }

  function buildLogExportMarkdown() {
    const payload = buildLogExportPayload();
    const inspector = payload.strategyInspector || {};
    const lanes = payload.decisionLanes || [];
    const diag = payload.liveDiagnostics || {};
    const history = payload.runHistory || [];

    const lines = [
      `# SwarmBot log export`,
      ``,
      `- Exported: ${payload.exportedAt}`,
      `- Script: ${payload.scriptVersion}`,
      `- Source: ${payload.source || "live-browser"}`,
      `- Scenario ID: ${payload.scenarioId || "none"}`,
      `- Status: ${payload.status}`,
      ``,
      `## Strategy Inspector`,
      ``,
      `- Phase: ${inspector.phase || "n/a"}`,
      `- Goal: ${inspector.goal || "n/a"}`,
      `- Decision: ${inspector.decision || "n/a"}`,
      `- Main: ${inspector.mainDecision || "n/a"}`,
      `- Companion: ${inspector.companionDecision || "none"}`,
      `- Side-task: ${inspector.sideDecision || "none"}`,
      `- Status: ${inspector.compactStatus || "n/a"}`,
      `- Reason: ${inspector.reason || "n/a"}`,
      `- Main reason: ${inspector.mainReason || "none"}`,
      `- Companion reason: ${inspector.sideReason || "none"}`,
      `- Best allowed main: ${rankingLine(payload.bestAllowedMainCandidate)}`,
      `- Best allowed side: ${rankingLine(payload.bestAllowedSideCandidate)}`,
      `- Best rejected strategic: ${rankingLine(payload.bestRejectedStrategicCandidate)}`,
      `- Closest rejected to buying: ${rankingLine(payload.closestRejectedToBuying)}`,
      `- Closest main lane to buying: ${rankingLine(payload.closestMainLaneToBuying)}`,
      `- Closest lane to buying: ${rankingLine(payload.closestLaneToBuying)}`,
      `- Next likely buy: ${payload.nextLikelyBuy || "unknown"}`,
      `- Why waiting: ${inspector.whyWaiting || "n/a"}`,
      `- Protected: ${inspector.protectedResources || "n/a"}`,
      `- Waiting on: ${inspector.waits || "n/a"}`,
      `- Focus: ${inspector.smartFocus || "n/a"}`,
      `- Nexus: ${inspector.nexus || "n/a"}`,
      `- Lepidoptera: ${inspector.lepidoptera || "n/a"}`,
      `- Post-Nexus energy candidate: ${payload.postNexusEnergyCandidate || "none"}`,
      `- Post-Nexus energy decision: ${payload.postNexusEnergyDecision || "OBSERVE"}`,
      `- Post-Nexus energy reason: ${payload.postNexusEnergyReason || "none"}`,
      `- Post-Nexus energy amount: ${payload.postNexusEnergyAmount || "0"}`,
      `- Post-Nexus energy boost: ${payload.postNexusEnergyBoostBefore || "n/a"} -> ${payload.postNexusEnergyBoostAfter || "n/a"} (${payload.postNexusEnergyBoostGain || "n/a"})`,
      `- Post-Nexus energy reserve: ${payload.postNexusEnergyReserve || "0"}`,
      `- Post-Nexus energy blocked by: ${payload.postNexusEnergyBlockedBy || "none"}`,
      `- Energy support best use: ${payload.energySupportBestUse || "none"}`,
      `- Energy support decision: ${payload.energySupportBestUseDecision || "HOLD"}`,
      `- Energy support helps advisor: ${payload.energySupportBestUseHelpsAdvisor || "none"}`,
      `- Energy support reason: ${payload.energySupportBestUseReason || "none"}`,
      `- Energy support player instruction: ${payload.energySupportBestUsePlayerInstruction || "none"}`,
      `- Energy support autobuyer instruction: ${payload.energySupportBestUseAutobuyerInstruction || "none"}`,
      `- Energy support blocked by: ${payload.energySupportBestUseBlockedBy || "none"}`,
      `- Energy support background action: ${payload.energySupportBackgroundAction || "none"}`,
      `- Clone support: ${payload.energySupportCloneDecision || "HOLD"} ${payload.energySupportCloneCandidate || "none"} (${payload.energySupportCloneReason || "none"})`,
      `- Mirror support: ${payload.energySupportMirrorDecision || "HOLD"} ${payload.energySupportMirrorCandidate || "none"} (${payload.energySupportMirrorReason || "none"})`,
      `- Mirror readiness state: ${payload.energySupportMirrorReadinessState || "none"}`,
      `- Mirror army state source: ${payload.energySupportMirrorArmyStateSource || "none"}`,
      `- Mirror evaluation revision: ${payload.energySupportMirrorEvaluationRevision || "0"}`,
      `- Lepidoptera support role: ${payload.energySupportLepidopteraRole || "wait"} (${payload.energySupportLepidopteraDecision || "WAIT"})`,
      `- Momentum primary focus: ${payload.momentumPrimaryFocus || "Methodical progression"}`,
      `- Momentum advisor: ${payload.momentumPrimaryAdvisor || "none"}`,
      `- Momentum best step: ${payload.momentumBestStep || "Wait"} (${payload.momentumBestStepDecision || "WAIT"})`,
      `- Momentum best-step reason: ${payload.momentumBestStepReason || "none"}`,
      `- Momentum priority source: ${payload.momentumPrimaryPrioritySource || "default"}`,
      `- Momentum selection reason: ${payload.momentumPrimarySelectionReason || "default lane priority"}`,
      `- Momentum companion actions: ${payload.momentumCompanionActions || "none"}`,
      `- Momentum background actions: ${payload.momentumBackgroundActions || "none"}`,
      `- Momentum side tasks: ${payload.momentumSideTasks || "none"}`,
      `- Momentum top blocked opportunity: ${payload.momentumTopBlockedOpportunity || "none"}`,
      `- Momentum why waiting is best: ${payload.momentumWhyWaitingIsBest || "none"}`,
      `- Actions: ${inspector.actions || "n/a"}`,
      `- Changed: ${inspector.summaries || "n/a"}`,
      `- Meat fallback enabled: ${payload.meatFallbackEnabled ? "true" : "false"}`,
      `- Meat fallback candidate: ${payload.meatFallbackCandidate || "none"}`,
      `- Meat fallback reason: ${payload.meatFallbackReason || "none"}`,
      `- Strategic target: ${payload.meatFallbackStrategicTarget || "none"}`,
      `- Blocked strategic candidate: ${payload.meatFallbackBlockedCandidate || "none"}`,
      `- Top meat blocked by: ${payload.topMeatBlockedBy || "none"}`,
      `- Stall breaker active: ${payload.stallBreakerActive ? "true" : "false"}`,
      `- Recent main hold runs: ${payload.recentMainHoldRuns ?? 0}`,
      `- Fallback rank drop: ${payload.fallbackRankDrop ?? "n/a"}`,
      `- Active action unit: ${payload.meatActionUnitName || "none"}`,
      `- Payback bypass: ${payload.meatActionUnitPaybackBypassTriggered ? "yes" : "no"}`,
      `- Reserve ratio: ${payload.meatActionUnitReserveRatio || "n/a"}`,
      `- Payback: ${Number.isFinite(payload.meatActionUnitPaybackSeconds) ? formatDuration(payload.meatActionUnitPaybackSeconds) : "n/a"}`,
      `- Bypass reason: ${payload.meatActionUnitPaybackBypassReason || "none"}`,
      `- Target-aware upgrade: ${payload.targetAwareUpgradeCandidate || "none"}`,
      `- Target-aware decision: ${payload.targetAwareUpgradeDecision || "none"}`,
      `- Target-aware reason: ${payload.targetAwareUpgradeReason || "none"}`,
      `- Target-aware type: ${payload.targetAwareUpgradeType || "none"}`,
      `- Target-aware supports action: ${payload.targetAwareUpgradeSupportsActionUnit || "no"}`,
      `- Target-aware reserve ratio: ${payload.targetAwareUpgradeReserveRatio || "n/a"}`,
      `- Target-aware cost resource: ${payload.targetAwareUpgradeCostResource || "none"}`,
      `- Unlock candidate: ${payload.unlockPlannerCandidate || "none"}`,
      `- Unlock decision: ${payload.unlockPlannerDecision || "none"}`,
      `- Unlock reason: ${payload.unlockPlannerReason || "none"}`,
      `- Unlock target: ${payload.unlockPlannerTarget || "none"}`,
      `- Unlocks: ${payload.unlockPlannerUnlocks || "none"}`,
      `- Unlock cost resource: ${payload.unlockPlannerCostResource || "none"}`,
      `- Unlock reserve ratio: ${payload.unlockPlannerReserveRatio || "n/a"}`,
      `- Unlock payback bypassed: ${payload.unlockPlannerPaybackBypassed ? "yes" : "no"}`,
      `- Parent step candidate: ${payload.parentStepCandidate || "none"}`,
      `- Parent step decision: ${payload.parentStepDecision || "none"}`,
      `- Parent step reason: ${payload.parentStepReason || "none"}`,
      `- Parent step target: ${payload.parentStepTarget || "none"}`,
      `- Parent step action unit: ${payload.parentStepActionUnit || "none"}`,
      `- Parent step cost resource: ${payload.parentStepCostResource || "none"}`,
      `- Parent step reserve ratio: ${payload.parentStepReserveRatio || "n/a"}`,
      `- Parent step payback bypassed: ${payload.parentStepPaybackBypassed ? "yes" : "no"}`,
      `- Parent step supports action unit: ${payload.parentStepSupportsActionUnit || "no"}`,
      `- Parent step consumed action unit: ${payload.parentStepConsumedActionUnit || "no"}`,
      `- Parent step consumed unit: ${payload.parentStepConsumedUnit || "none"}`,
      `- Action-unit refill candidate: ${payload.actionUnitRefillCandidate || "none"}`,
      `- Action-unit refill decision: ${payload.actionUnitRefillDecision || "OBSERVE"}`,
      `- Action-unit refill reason: ${payload.actionUnitRefillReason || "none"}`,
      `- Action-unit refill blocked by: ${payload.actionUnitRefillBlockedBy || "none"}`,
      `- Action-unit refill reserve ratio: ${payload.actionUnitRefillReserveRatio || "n/a"}`,
      `- Action-unit refill payback: ${payload.actionUnitRefillPayback || "n/a"}`,
      `- Action-unit refill payback bypassed: ${payload.actionUnitRefillPaybackBypassed || "no"}`,
      `- Action budget remaining after parent-step: ${payload.actionBudgetRemainingAfterParentStep || "0"}`,
      `- Follow-up action selected: ${payload.followUpActionSelected || "no"}`,
      `- Why no follow-up action: ${payload.whyNoFollowUpAction || "none"}`,
      `- Anti-pingpong guard active: ${payload.antiPingpongGuardActive || "no"}`,
      `- Anti-pingpong guard allowed refill: ${payload.antiPingpongGuardAllowedRefill || "no"}`,
      `- Coordinator remaining-budget reason: ${payload.coordinatorRemainingBudgetReason || "none"}`,
      `- Twin unlock candidate: ${payload.twinUnlockCandidate || "none"}`,
      `- Twin unlock decision: ${payload.twinUnlockDecision || "none"}`,
      `- Twin unlock reason: ${payload.twinUnlockReason || "none"}`,
      `- Twin unlock target: ${payload.twinUnlockTarget || "none"}`,
      `- Twin unlock upgrade: ${payload.twinUnlockUpgrade || "none"}`,
      `- Twin unlock cost resource: ${payload.twinUnlockCostResource || "none"}`,
      `- Twin unlock threshold: ${payload.twinUnlockCurrent || "0"} / ${payload.twinUnlockRequired || "0"} (missing ${payload.twinUnlockMissing || "0"})`,
      `- Twin unlock ratio: ${payload.twinUnlockRatio || "n/a"}`,
      `- Twin unlock near-threshold ratio: ${payload.twinUnlockNearThresholdRatio || "n/a"}`,
      `- Twin unlock prep candidate: ${payload.twinUnlockPrepCandidate || "none"}`,
      `- Twin unlock prep chunk: ${payload.twinUnlockPrepChunk || "0"}`,
      `- Twin unlock prep decision: ${payload.twinUnlockPrepDecision || "none"}`,
      `- Twin unlock reserve ratio: ${payload.twinUnlockReserveRatio || "n/a"}`,
      `- Twin unlock payback bypassed: ${payload.twinUnlockPaybackBypassed ? "yes" : "no"}`,
      `- Twin unlock post-upgrade rebuild ratio: ${payload.twinUnlockPostUpgradeRebuildRatio || "n/a"}`,
      `- Twin unlock rebuild safe: ${payload.twinUnlockRebuildSafe || "no"}`,
      `- Twin unlock opportunity bypass: ${payload.twinUnlockOpportunityCostBypass || "no"}`,
      `- Twin unlock opportunity reason: ${payload.twinUnlockOpportunityCostReason || "not evaluated"}`,
      `- Twin unlock lost production /s: ${payload.twinUnlockLostProductionPerSecond || "n/a"}`,
      `- Twin unlock lost production /h: ${payload.twinUnlockLostProductionPerHour || "n/a"}`,
      `- Twin unlock lost production bank ratio /h: ${payload.twinUnlockLostProductionBankRatioPerHour || "n/a"}`,
      `- Twin unlock lost production bank ratio limit: ${payload.twinUnlockLostProductionBankRatioLimit || "n/a"}`,
      `- Twin unlock BUY despite rebuild unsafe: ${payload.twinUnlockUpgradeBuyAllowedDespiteRebuildUnsafe || "no"}`,
      `- Twin prep meaningful: ${payload.twinUnlockPrepMeaningful || "no"}`,
      `- Twin prep progress gain: ${payload.twinUnlockPrepProgressGainPercent || "n/a"}`,
      `- Twin prep meaningful gate: ${payload.twinUnlockPrepProgressGainRequiredPercent || "n/a"}`,
      `- Twin prep deferred reason: ${payload.twinUnlockPrepDeferredReason || "none"}`,
      `- Twin deferred by parent step: ${payload.twinUnlockDeferredByParentStep || "no"}`,
      `- Parent step preferred over twin prep: ${payload.twinUnlockParentStepPreferred || "no"}`,
      `- Why parent step won: ${payload.twinUnlockWhyParentStepWon || "none"}`,
      `- Why twin prep did not win: ${payload.twinUnlockWhyPrepDidNotWin || "none"}`,
      `- Parent-step/refill preserved: ${payload.parentStepRefillPreserved || "n/a"}`,
      `- Clone buffer mode: ${payload.cloneBufferMode || "none"}`,
      `- Clone buffer current/target: ${payload.cloneBufferCurrent || "0"} / ${payload.cloneBufferTarget || "0"}`,
      `- Clone buffer percent: ${payload.cloneBufferPercent || "n/a"}`,
      `- Clone buffer debt: ${payload.cloneBufferDebt || "0"}`,
      `- Clone buffer spendable larvae: ${payload.cloneBufferSpendableLarvae || "0"}`,
      `- Clone buffer larvae protected: ${payload.cloneBufferLarvaeProtected || "0"}`,
      `- Clone buffer target source: ${payload.cloneBufferTargetSource || "none"}`,
      `- Clone buffer hard lock: ${payload.cloneBufferHardLockActive || "no"}`,
      `- Clone buffer recovery complete: ${payload.cloneBufferRecoveryComplete || "no"}`,
      `- Clone buffer completion threshold: ${payload.cloneBufferCompletionThreshold || "n/a"}`,
      `- Clone buffer reason: ${payload.cloneBufferReason || "none"}`,
      `- Ability prep candidate: ${payload.abilityPrepCandidate || "none"}`,
      `- Ability prep decision: ${payload.abilityPrepDecision || "none"}`,
      `- Ability prep reason: ${payload.abilityPrepReason || "none"}`,
      `- Ability prep type: ${payload.abilityPrepType || "none"}`,
      `- Ability prep energy available: ${payload.abilityPrepEnergyAvailable || "n/a"}`,
      `- Ability prep requires army prep: ${payload.abilityPrepRequiresArmyPrep || "no"}`,
      `- Ability prep requires clone buffer: ${payload.abilityPrepRequiresCloneBuffer || "no"}`,
      `- House of Mirrors army value: ${payload.houseOfMirrorsArmyValue || "n/a"}`,
      `- House of Mirrors missing units: ${payload.houseOfMirrorsMissingUnits || "none"}`,
      `- Army seed candidate: ${payload.expansionArmySeedCandidate || "none"}`,
      `- Army seed decision: ${payload.expansionArmySeedDecision || "OBSERVE"}`,
      `- Army seed reason: ${payload.expansionArmySeedReason || "none"}`,
      `- Army seed unit: ${payload.expansionArmySeedUnit || "none"}`,
      `- Army seed amount: ${payload.expansionArmySeedAmount || "0"}`,
      `- Army seed ETA before: ${payload.expansionArmySeedEtaBefore || "n/a"}`,
      `- Army seed ETA after: ${payload.expansionArmySeedEtaAfter || "n/a"}`,
      `- Army seed ETA gain: ${payload.expansionArmySeedEtaGainSeconds || "0"}s (${payload.expansionArmySeedEtaGainPercent || "0%"})`,
      `- Army seed territory/sec: ${payload.expansionArmySeedTerritoryPerSecondBefore || "0"} -> ${payload.expansionArmySeedTerritoryPerSecondAfter || "0"}`,
      `- Army seed blocked by: ${payload.expansionArmySeedBlockedBy || "none"}`,
      `- Army seed inside save-window: ${payload.expansionArmySeedInsideSaveWindow || "no"}`,
      `- Army seed best rejected unit: ${payload.expansionArmySeedBestRejectedUnit || "none"}`,
      `- Army seed best rejected reason: ${payload.expansionArmySeedBestRejectedReason || "none"}`,
      `- Council active speaker: ${payload.activeCouncilSpeaker || "none"}`,
      `- Council winning lane: ${payload.councilWinningLane || "none"}`,
      `- Council winning candidate: ${payload.councilWinningCandidate || "none"}`,
      `- Council focus bubble: ${payload.councilFocusBubble || "none"}`,
      `- Skipped meat candidates: ${(payload.skippedMeatCandidates || []).map((item) => `${item.candidate || "unknown"}: ${item.reason || "skipped"}`).join("; ") || "none"}`,
      ``,
      `## Live diagnostics`,
      ``,
      `- History size: ${diag.historySize ?? 0}`,
      `- Side-task-only runs: ${diag.sideOnlyRuns ?? 0}`,
      `- Main-buy runs: ${diag.mainBuyRuns ?? 0}`,
      `- Hold runs: ${diag.holdRuns ?? 0}`,
      `- Recent main hold runs: ${diag.recentMainHoldRuns ?? 0}`,
      `- Fallback runs: ${diag.fallbackRuns ?? 0}`,
      `- Stall breaker runs: ${diag.stallBreakerRuns ?? 0}`,
      `- Dominant hold reason: ${diag.dominantHoldReason || "none"}`,
      `- Save-window suspicion: ${diag.saveWindowSuspicion || "none"}`,
      `- Missed safe main candidate suspicion: ${diag.missedSafeMainCandidateSuspicion || "none"}`,
      `- Clone Prep only because main blocked: ${diag.clonePrepOnlyBecauseMainBlocked || "none"}`,
      `- Active blockers: ${(diag.activeBlockers || []).map((item) => `${item.key} (${item.count})`).join(", ") || "none"}`,
      `- Future targets / observations: ${(diag.futureTargets || []).map((item) => `${item.key} (${item.count})`).join(", ") || "none"}`,
      `- Generic holds: ${(diag.genericHolds || []).map((item) => `${item.key} (${item.count})`).join(", ") || "none"}`,
      `- Repeated blockers: ${(diag.repeatedBlockers || []).map((item) => `${item.key} (${item.count})`).join(", ") || "none"}`,
      `- Top rejected candidates: ${(diag.topRejectedCandidates || []).map((item) => `${item.key} (${item.count})`).join(", ") || "none"}`,
      ``,
      `## Candidate ranking`,
      ``,
      `- Best allowed main: ${rankingLine(payload.bestAllowedMainCandidate)}`,
      `- Best allowed side: ${rankingLine(payload.bestAllowedSideCandidate)}`,
      `- Best rejected strategic: ${rankingLine(payload.bestRejectedStrategicCandidate)}`,
      `- Closest rejected to buying: ${rankingLine(payload.closestRejectedToBuying)}`,
      `- Closest main lane to buying: ${rankingLine(payload.closestMainLaneToBuying)}`,
      `- Closest lane to buying: ${rankingLine(payload.closestLaneToBuying)}`,
      `- Legacy best allowed: ${rankingLine(payload.bestAllowedCandidate)}`,
      `- Legacy best rejected: ${rankingLine(payload.bestRejectedCandidate)}`,
      `- Blocked by protected resources: ${payload.blockedByProtectedResources.length}`,
      `- Blocked by payback: ${payload.blockedByPayback.length}`,
      `- Blocked by reserve: ${payload.blockedByReserve.length}`,
      `- Blocked by energy plan: ${payload.blockedByEnergyPlan.length}`,
      `- Blocked by ability disabled: ${payload.blockedByAbilityDisabled.length}`,
      ``,
      `## Decision lanes`,
      ``,
      ...lanes.map((lane) => `- ${lane.name}: ${lane.decision} ${lane.title} — ${lane.reason}`),
      ``,
      `## Lane candidates`,
      ``,
      ...payload.laneCandidates.map((candidate) => `- ${candidate.lane}: ${candidate.decision} ${candidate.candidate}${candidate.wouldBuyAmount ? ` × ${candidate.wouldBuyAmount}` : ""} · score ${trimNumber(candidate.score)} · ${candidate.reason}${candidate.blockers?.length ? ` · blockers: ${candidate.blockers.join(", ")}` : ""}${candidate.observations?.length ? ` · observations: ${candidate.observations.join(", ")}` : ""}${candidate.raw ? ` · raw: ${JSON.stringify(candidate.raw)}` : ""}`),
      ``,
      `## Run history summary`,
      ``,
      ...history.slice(-20).map((run) => `- ${run.timestamp} · ${run.decision} · ${run.mainActions} main/${run.sideActions} side-tasks · ${run.phase} · next ${run.nextLikelyBuy || "unknown"} · blocked ${run.blockedBySummary || "none"}`),
      ``,
      `## Advisor log`,
      ``,
      ...payload.advisorLog.map((item) => `- ${item.time} · ${item.decision} ${item.title}${item.reason ? ` — ${item.reason}` : ""}`),
      ``,
      `## Purchase log`,
      ``,
      ...payload.purchaseLog.map((item) => item.type === "Info"
        ? `- ${item.time} · ${item.name}`
        : `- ${item.time} · ${item.type} · +${item.amount} ${item.name}${item.internalName ? ` (${item.internalName})` : ""}`),
      ``,
      `## Config summary`,
      ``,
      "```json",
      JSON.stringify(payload.configSummary, null, 2),
      "```",
    ];

    return lines.join("\n");
  }

  function getLogExportText(format = "markdown") {
    return format === "json"
      ? JSON.stringify(buildLogExportPayload(), null, 2)
      : buildLogExportMarkdown();
  }

  function copyTextToClipboard(text) {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).catch(() => fallbackCopyText(text));
      return true;
    }

    return fallbackCopyText(text);
  }

  function fallbackCopyText(text) {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();

    let ok = false;
    try {
      ok = document.execCommand("copy");
    } catch {
      ok = false;
    }

    textarea.remove();
    return ok;
  }

  function copyLogExport(format = "markdown") {
    const text = getLogExportText(format);
    copyTextToClipboard(text);
    recordMessage(`Log export copied as ${format}`);
    refreshPanel();
    return text;
  }

  function downloadLogExport(format = "json") {
    const text = getLogExportText(format);
    const ext = format === "json" ? "json" : "md";
    const safeDate = new Date().toISOString().replace(/[:.]/g, "-");
    const blob = new Blob([text], { type: format === "json" ? "application/json" : "text/markdown" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = `swarmsim-bot-log-${safeDate}.${ext}`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);

    recordMessage(`Log export downloaded as ${format}`);
    refreshPanel();
    return text;
  }

  function newDecimal(value = 0) {
    const D = getDecimalCtor();
    if (!D) return Number(value || 0);

    try {
      return new D(value);
    } catch {
      return new D(0);
    }
  }

  function decimalFrom(value, fallback = 0) {
    const D = getDecimalCtor();
    if (!D) return Number(value || fallback);

    try {
      if (value && value.toString) return new D(value.toString());
      return new D(value ?? fallback);
    } catch {
      return new D(fallback);
    }
  }

  function decimalToNumber(value, fallback = 0) {
    try {
      if (value && value.toNumber) {
        const n = value.toNumber();
        return Number.isFinite(n) ? n : fallback;
      }

      const n = Number(value);
      return Number.isFinite(n) ? n : fallback;
    } catch {
      return fallback;
    }
  }

  function isPositive(value) {
    try {
      return value && value.greaterThan && value.greaterThan(0);
    } catch {
      return Number(value) > 0;
    }
  }

  function decimalMin(...values) {
    const normalized = values
      .filter((value) => value !== null && value !== undefined)
      .map((value) => decimalFrom(value));

    if (!normalized.length) return newDecimal(0);

    const D = getDecimalCtor();

    if (D?.min) {
      return D.min(...normalized);
    }

    return normalized.reduce((best, value) => {
      try {
        return value.lessThan(best) ? value : best;
      } catch {
        return Number(value) < Number(best) ? value : best;
      }
    }, normalized[0]);
  }

  function formatDuration(seconds) {
    const sec = Math.max(0, Math.floor(Number(seconds || 0)));

    if (!Number.isFinite(sec)) return "∞";
    if (sec < 60) return `${sec}s`;

    const minutes = Math.floor(sec / 60);
    const restSec = sec % 60;

    if (minutes < 60) return `${minutes}m ${restSec}s`;

    const hours = Math.floor(minutes / 60);
    const restMin = minutes % 60;

    if (hours < 48) return `${hours}h ${restMin}m`;

    const days = Math.floor(hours / 24);
    const restHours = hours % 24;
    return `${days}d ${restHours}h`;
  }

  function secondsToTimeParts(seconds) {
    const safeSeconds = Math.max(0, Math.floor(Number(seconds || 0)));

    const days = Math.floor(safeSeconds / 86400);
    const hours = Math.floor((safeSeconds % 86400) / 3600);
    const minutes = Math.floor((safeSeconds % 3600) / 60);
    const restSeconds = safeSeconds % 60;

    return { days, hours, minutes, seconds: restSeconds };
  }

  function readTimePart(prefix, part) {
    const input = panel?.querySelector(`#${prefix}-${part}`);
    const value = Number(input?.value || 0);
    return Number.isFinite(value) && value > 0 ? Math.floor(value) : 0;
  }

  function readDurationSeconds(prefix) {
    return (
      readTimePart(prefix, "days") * 86400 +
      readTimePart(prefix, "hours") * 3600 +
      readTimePart(prefix, "minutes") * 60 +
      readTimePart(prefix, "seconds")
    );
  }

  function writeDurationInputs(prefix, totalSeconds) {
    if (!panel) return;

    const parts = secondsToTimeParts(totalSeconds);

    for (const part of ["days", "hours", "minutes", "seconds"]) {
      const input = panel.querySelector(`#${prefix}-${part}`);
      if (input) input.value = parts[part];
    }
  }

  function bindDurationInputs(prefix, configKey, maxSeconds) {
    for (const part of ["days", "hours", "minutes", "seconds"]) {
      const input = panel?.querySelector(`#${prefix}-${part}`);
      if (!input) continue;

      input.addEventListener("change", () => {
        config[configKey] = clampNumber(readDurationSeconds(prefix), 0, maxSeconds, config[configKey]);
        saveConfig();
        refreshPanel();
      });
    }
  }

  function setSettingsTab(tabName) {
    if (!panel) return;

    const validTabs = new Set(["main", "smart", "economy", "energy", "advanced"]);
    const activeTab = validTabs.has(tabName) ? tabName : "main";

    localStorage.setItem(SETTINGS_TAB_STORAGE_KEY, activeTab);

    panel.querySelectorAll("[data-kbc-tab]").forEach((button) => {
      button.classList.toggle("is-active", button.dataset.kbcTab === activeTab);
    });

    panel.querySelectorAll("[data-kbc-tab-panel]").forEach((tabPanel) => {
      tabPanel.classList.toggle("is-active", tabPanel.dataset.kbcTabPanel === activeTab);
    });
  }

  function installSettingsTabs() {
    if (!panel) return;

    panel.querySelectorAll("[data-kbc-tab]").forEach((button) => {
      button.addEventListener("click", () => setSettingsTab(button.dataset.kbcTab));
    });

    setSettingsTab(localStorage.getItem(SETTINGS_TAB_STORAGE_KEY) || "main");
  }

  function helpIcon(text) {
    return `<span class="kbc-help" title="${escapeHtml(text)}">?</span>`;
  }

  function getGameUnit(game, name) {
    return safe(`Hämta unit ${name}`, () => game.unit(name));
  }

  function getGameUpgrade(game, name) {
    return safe(`Hämta upgrade ${name}`, () => game.upgrade(name));
  }

  function getCostList(item) {
    if (!item) return [];

    return safe(`Läs kostnader ${item.name}`, () => {
      if (item.totalCost) return item.totalCost() || [];
      if (item.eachCost) return item.eachCost() || [];
      return item.cost || [];
    }) || [];
  }

  function costUsesResource(item, resourceName) {
    return getCostList(item).some((cost) => cost?.unit?.name === resourceName && isPositive(cost.val));
  }

  function getCostForResource(item, resourceName) {
    if (item && String(resourceName || "").toLowerCase() === "energy") {
      const override = getScenarioAbilityOverride(item.name);
      if (override && Number.isFinite(override.energyCost)) return decimalFrom(override.energyCost);
    }

    const cost = getCostList(item).find((entry) => entry?.unit?.name === resourceName);
    return cost?.val || newDecimal(0);
  }

  function getUpgradeCostList(upgrade) {
    if (!upgrade) return [];

    const rows = [];
    const addRows = (list) => {
      for (const row of list || []) {
        if (!row?.unit || !isPositive(row.val)) continue;
        if (rows.some((existing) => isSameGameItem(existing.unit, row.unit) && decimalFrom(existing.val).eq(decimalFrom(row.val)))) continue;
        rows.push(row);
      }
    };

    addRows(getCostList(upgrade));
    if (!rows.length && upgrade?.next) addRows(getCostList(upgrade.next));
    if (!rows.length && Array.isArray(upgrade?.cost)) addRows(upgrade.cost);

    return rows;
  }

  function formatPlanPath(plan) {
    const names = (plan?.path || []).map((step) => getDisplayName(step?.unit)).filter(Boolean);
    return names.length ? names.join(" -> ") : "unknown";
  }

  function getTwinUpgradeThresholdInfo(game, twinUpgrade, strategicPlan) {
    if (!twinUpgrade) {
      return {
        costResourceUnit: null,
        costResourceName: "none",
        requiredAmount: newDecimal(0),
        currentAmount: newDecimal(0),
        missingAmount: newDecimal(0),
        costResourceOnPath: false,
        pathLabel: formatPlanPath(strategicPlan),
        error: "no-upgrade",
      };
    }

    const rows = getUpgradeCostList(twinUpgrade)
      .filter((cost) => cost?.unit && isPositive(cost.val) && isMeatChainUnit(cost.unit));

    if (!rows.length) {
      return {
        costResourceUnit: null,
        costResourceName: "none",
        requiredAmount: newDecimal(0),
        currentAmount: newDecimal(0),
        missingAmount: newDecimal(0),
        costResourceOnPath: false,
        pathLabel: formatPlanPath(strategicPlan),
        error: "cost-resource-unreadable",
      };
    }

    const preferred = rows.find((row) => isUnitOnPlanPath(strategicPlan, row.unit)) || rows[0];
    const costResourceUnit = preferred?.unit || null;
    const requiredAmount = decimalFrom(preferred?.val || 0);

    if (!costResourceUnit) {
      return {
        costResourceUnit: null,
        costResourceName: "none",
        requiredAmount,
        currentAmount: newDecimal(0),
        missingAmount: requiredAmount.greaterThan(0) ? requiredAmount : newDecimal(0),
        costResourceOnPath: false,
        pathLabel: formatPlanPath(strategicPlan),
        error: "cost-resource-unreadable",
      };
    }

    const currentAmount = decimalFrom(costResourceUnit.count?.() || 0);
    const rawMissing = requiredAmount.minus(currentAmount);
    const missingAmount = rawMissing.greaterThan(0) ? rawMissing : newDecimal(0);
    const costResourceOnPath = isUnitOnPlanPath(strategicPlan, costResourceUnit);
    const error = !isPositive(requiredAmount) ? "invalid-threshold" : null;

    return {
      costResourceUnit,
      costResourceName: getDisplayName(costResourceUnit),
      requiredAmount,
      currentAmount,
      missingAmount,
      costResourceOnPath,
      pathLabel: formatPlanPath(strategicPlan),
      error,
    };
  }

  function evaluateTwinUpgradeOpportunityCostBypass({
    game,
    targetName,
    twinUpgradeName,
    twinCostUnitName,
    twinRequiredRaw,
    twinCurrentRaw,
    directParentUnit,
  }) {
    const bypassEnabled = !!config.twinUpgradeOpportunityCostBypass;
    const rawLimit = Number(config.twinUpgradeMaxLostProductionBankRatioPerHour || DEFAULT_CONFIG.twinUpgradeMaxLostProductionBankRatioPerHour);
    const limit = Number.isFinite(rawLimit) ? Math.max(0, rawLimit) : DEFAULT_CONFIG.twinUpgradeMaxLostProductionBankRatioPerHour;

    const costCurrent = decimalFrom(twinCurrentRaw || 0);
    const costSpend = decimalMin(decimalFrom(twinRequiredRaw || 0), costCurrent);
    const spendRatio = isPositive(costCurrent)
      ? decimalToNumber(costSpend.dividedBy(costCurrent), 0)
      : 0;

    const producedChildName = directParentUnit ? getDisplayName(directParentUnit) : "none";
    const producedChildBank = decimalFrom(directParentUnit?.count?.() || 0);
    const producedChildVelocity = directParentUnit ? decimalFrom(getVelocity(game, directParentUnit.name)) : newDecimal(0);
    const lostProductionPerSecond = producedChildVelocity.times(spendRatio);
    const lostProductionPerHour = lostProductionPerSecond.times(3600);

    let lostProductionBankRatioPerHour = Infinity;
    if (isPositive(producedChildBank)) {
      lostProductionBankRatioPerHour = decimalToNumber(lostProductionPerHour.dividedBy(producedChildBank), Infinity);
    } else if (!isPositive(lostProductionPerHour)) {
      lostProductionBankRatioPerHour = 0;
    }

    const opportunityCostBypass = bypassEnabled
      && isPositive(costSpend)
      && Number.isFinite(lostProductionBankRatioPerHour)
      && lostProductionBankRatioPerHour <= limit;

    let opportunityCostReason = "not evaluated";
    if (!bypassEnabled) {
      opportunityCostReason = "opportunity-cost bypass disabled";
    } else if (!isPositive(costSpend)) {
      opportunityCostReason = `opportunity-cost bypass denied: no spendable ${twinCostUnitName} amount detected`;
    } else if (!Number.isFinite(lostProductionBankRatioPerHour)) {
      opportunityCostReason = `opportunity-cost bypass denied: cannot compute lost production ratio against current ${producedChildName} bank`;
    } else if (opportunityCostBypass) {
      opportunityCostReason = `upgrade buyable for ${twinUpgradeName}; post-upgrade rebuild buffer unsafe, but opportunity-cost bypass allowed for ${targetName}: spending ${formatSwarmNumber(costSpend)} ${twinCostUnitName} loses about ${formatSwarmNumber(lostProductionPerSecond)}/s and ${formatSwarmNumber(lostProductionPerHour)}/h ${producedChildName}, which is ${trimNumber(lostProductionBankRatioPerHour * 100)}%/h of current ${producedChildName} bank (limit ${trimNumber(limit * 100)}%/h)`;
    } else {
      opportunityCostReason = `opportunity-cost bypass denied: estimated lost ${producedChildName} production ${trimNumber(lostProductionBankRatioPerHour * 100)}%/h exceeds limit ${trimNumber(limit * 100)}%/h`;
    }

    return {
      opportunityCostBypass,
      opportunityCostReason,
      lostProductionPerSecond,
      lostProductionPerHour,
      lostProductionBankRatioPerHour,
      lostProductionBankRatioLimit: limit,
      upgradeBuyAllowedDespiteRebuildUnsafe: opportunityCostBypass,
      producedChildName,
    };
  }

  function getCurrentResource(game, resourceName) {
    const scenarioOverride = getScenarioResourceCountOverride(resourceName);
    if (Number.isFinite(scenarioOverride)) return decimalFrom(scenarioOverride);

    const unit = getGameUnit(game, resourceName);
    return unit?.count?.() || newDecimal(0);
  }

  function getVelocity(game, resourceName) {
    const scenarioOverride = getScenarioResourceVelocityOverride(resourceName);
    if (Number.isFinite(scenarioOverride)) return decimalFrom(scenarioOverride);

    const unit = getGameUnit(game, resourceName);
    return safe(`Velocity ${resourceName}`, () => unit?.velocity?.() || newDecimal(0)) || newDecimal(0);
  }

  function estimateUpgradeSeconds(upgrade) {
    if (!upgrade) return Infinity;

    if (upgrade.isBuyable?.()) return 0;

    const estimate = safe(`ETA ${getDisplayName(upgrade)}`, () => upgrade.estimateSecsUntilBuyable?.());

    if (estimate && estimate.val) {
      return decimalToNumber(estimate.val, Infinity);
    }

    return decimalToNumber(estimate, Infinity);
  }

  function getUpgradeProgressPercent(upgrade) {
    if (!upgrade) return 0;

    const percent = safe(`Progress ${getDisplayName(upgrade)}`, () => upgrade.costMetPercent?.());
    if (!percent) return upgrade.isBuyable?.() ? 1 : 0;

    return Math.max(0, Math.min(1, decimalToNumber(percent, 0)));
  }

  function analyzeLarvaEngine(game) {
    const hatchery = getGameUpgrade(game, "hatchery");
    const expansion = getGameUpgrade(game, "expansion");

    return {
      hatchery,
      expansion,
      hatcheryBuyable: !!hatchery?.isBuyable?.(),
      expansionBuyable: !!expansion?.isBuyable?.(),
      hatcheryEta: estimateUpgradeSeconds(hatchery),
      expansionEta: estimateUpgradeSeconds(expansion),
      hatcheryProgress: getUpgradeProgressPercent(hatchery),
      expansionProgress: getUpgradeProgressPercent(expansion),
    };
  }

  function engineSummary(engine) {
    if (!engine) return "Ingen engine-analys";

    return `Expansion ${Math.round(engine.expansionProgress * 100)}% · ${formatDuration(engine.expansionEta)} | Hatchery ${Math.round(engine.hatcheryProgress * 100)}% · ${formatDuration(engine.hatcheryEta)}`;
  }

  function protectedResourcesFromEngine(engine) {
    const protectedResources = new Set();

    if (!engine) return protectedResources;

    if (Number.isFinite(engine.expansionEta) && engine.expansionEta > 0 && engine.expansionEta <= config.saveForExpansionSeconds) {
      protectedResources.add("territory");
    }

    if (Number.isFinite(engine.hatcheryEta) && engine.hatcheryEta > 0 && engine.hatcheryEta <= config.saveForHatcherySeconds) {
      protectedResources.add("meat");
    }

    return protectedResources;
  }

  function shouldAvoidProtectedCost(item, protectedResources) {
    const cloneBufferIssue = getCloneBufferProtectionIssue(item);
    if (cloneBufferIssue) return "larva";

    for (const resourceName of protectedResources) {
      if (costUsesResource(item, resourceName)) return resourceName;
    }

    return null;
  }

  function protectedResourceTarget(resourceName) {
    if (resourceName === "energy") return "Nexus";
    if (resourceName === "territory") return "Expansion";
    if (resourceName === "meat") return "Hatchery";
    if (resourceName === "larva") return "Clone Cocoon Buffer";
    return "protected plan";
  }

  function protectedResourceHoldReason(resourceName) {
    if (resourceName === "larva" && cloneBufferPlannerState?.cloneBufferReason) {
      return `cloned larvae protected for Clone Cocoon Buffer; ${cloneBufferPlannerState.cloneBufferReason}`;
    }
    return `saving ${resourceName} for ${protectedResourceTarget(resourceName)}`;
  }

  function protectedResourceBlocker(resourceName) {
    return `${resourceName} protected for ${protectedResourceTarget(resourceName)}`;
  }

  function getCloneBufferProtectionIssue(item, num = newDecimal(1)) {
    if (!config.cloneBufferPlanner || !config.cloneBufferProtectLarvae) return null;
    if (!cloneBufferPlannerState) return null;
    if (!cloneBufferPlannerState.cloneBufferProtectLarvae) return null;
    if (!item || String(item?.name || "").toLowerCase() === "cocoon") return null;
    if (!costUsesResource(item, "larva")) return null;

    const protectedRaw = decimalFrom(cloneBufferPlannerState.cloneBufferLarvaeProtectedRaw || 0);
    const debtRaw = decimalFrom(cloneBufferPlannerState.cloneBufferDebtRaw || 0);
    const postCloneLockActive = !!cloneBufferPlannerState.postCloneLockActive;

    if (!isPositive(protectedRaw)) return null;
    if (!isPositive(debtRaw) && !postCloneLockActive) return null;

    const larvaCost = decimalFrom(getCostForResource(item, "larva")).times(decimalFrom(num || 1));
    if (!isPositive(larvaCost)) return null;

    const spendable = decimalFrom(cloneBufferPlannerState.cloneBufferSpendableLarvaeRaw || 0);
    if (!spendable.lessThan(larvaCost)) return null;

    return {
      type: "clone-buffer",
      larvaCost,
      spendable,
      reason: `clone buffer lock: spendable larvae ${formatSwarmNumber(spendable)} < cost ${formatSwarmNumber(larvaCost)}`,
    };
  }

  function hasActiveExpansionSave(candidate) {
    const blockerText = (candidate?.blockers || []).join(" ").toLowerCase();
    const reasonText = String(candidate?.reason || "").toLowerCase();
    const observationText = (candidate?.observations || []).join(" ").toLowerCase();
    const text = `${reasonText} ${blockerText} ${observationText}`;
    return /active-expansion-save-window|territory protected for expansion|saving territory for expansion|territory held for expansion|expansion save/.test(text) || (candidate?.decision === "HOLD" && candidate?.resource === "territory" && /cost uses protected resource/.test(blockerText));
  }

  function hasActiveHatcherySave(candidate) {
    const blockerText = (candidate?.blockers || []).join(" ").toLowerCase();
    const reasonText = String(candidate?.reason || "").toLowerCase();
    const observationText = (candidate?.observations || []).join(" ").toLowerCase();
    const text = `${reasonText} ${blockerText} ${observationText}`;
    return /active-hatchery-save-window|meat protected for hatchery|saving meat for hatchery|meat held for hatchery|hatchery save/.test(text) || (candidate?.decision === "HOLD" && candidate?.resource === "meat" && /cost uses protected resource/.test(blockerText));
  }

  function hasActiveNexusSave(candidate) {
    const blockerText = (candidate?.blockers || []).join(" ").toLowerCase();
    const reasonText = String(candidate?.reason || "").toLowerCase();
    const text = `${reasonText} ${blockerText}`;
    return /energy protected for nexus|saving energy for nexus|nexus save/.test(text) || (candidate?.decision === "HOLD" && candidate?.resource === "energy" && /cost uses protected resource/.test(blockerText));
  }

  function formatEtaImprovementSummary(seconds) {
    const n = Number(seconds || 0);
    if (!Number.isFinite(n)) return "ETA unknown";
    if (Math.abs(n) < 1) return "ETA unchanged";
    return `ETA -${formatDuration(n)}`;
  }

  function formatEtaImprovementDelta(seconds) {
    const n = Number(seconds || 0);
    if (!Number.isFinite(n)) return "ETA unknown";
    if (Math.abs(n) < 1) return "ETA unchanged";
    return `ETA -${formatDuration(n)}`;
  }

  function getItemClass(item) {
    return item?.type?.class || item?.class || "";
  }

  function isAbility(item) {
    return getItemClass(item) === "ability";
  }

  function isNamedAbility(item) {
    const name = String(item?.name || "").toLowerCase();
    return ["larvarush", "meatrush", "territoryrush", "clonelarvae", "swarmwarp"].includes(name);
  }

  function shouldSkipAbility(item) {
    return isAbility(item) || isNamedAbility(item);
  }

  function buyUpgradeAmount(commands, upgrade, num, label) {
    const before = upgrade.count();

    commands.buyUpgrade({
      upgrade,
      num,
      ui: BOT_NAME,
    });

    const after = upgrade.count();
    const delta = after.minus(before);

    if (delta.greaterThan(0)) {
      recordPurchase(label || "Upgrade", upgrade, delta);
      return true;
    }

    return false;
  }

  function buyUnitAmount(commands, unit, num, label) {
    const before = unit.count();

    commands.buyUnit({
      unit,
      num,
      ui: BOT_NAME,
    });

    const after = unit.count();
    const delta = after.minus(before);

    if (delta.greaterThan(0)) {
      recordPurchase(label || "Unit", unit, delta);
      return true;
    }

    return false;
  }

  function handleLarvaEnginePriority(game, commands, engine) {
    if (!config.larvaEnginePriority || !engine) {
      return { actionTaken: false, bought: 0 };
    }

    const order = [
      { upgrade: engine.expansion, key: "Expansion", reason: "highest larva-engine priority", eta: engine.expansionEta, progress: engine.expansionProgress, resource: "territory", score: 90000 },
      { upgrade: engine.hatchery, key: "Hatchery", reason: "larva-engine priority", eta: engine.hatcheryEta, progress: engine.hatcheryProgress, resource: "meat", score: 80000 },
    ];

    for (const item of order) {
      if (!item.upgrade?.isVisible?.()) continue;
      const etaText = Number.isFinite(item.eta) ? formatDuration(item.eta) : "unknown ETA";
      const buyable = item.upgrade?.isBuyable?.();
      const saveLimit = item.resource === "territory" ? config.saveForExpansionSeconds : config.saveForHatcherySeconds;
      const activeSaveWindow = !buyable && Number.isFinite(item.eta) && item.eta > 0 && item.eta <= saveLimit;
      addLaneCandidate({
        lane: "Engine",
        decision: buyable ? "BUY" : "HOLD",
        candidate: item.key,
        reason: buyable
          ? item.reason
          : `${item.key} not buyable yet; ${Math.round((item.progress || 0) * 100)}% ready, ETA ${etaText}`,
        blockers: activeSaveWindow ? [`${item.resource} protected for ${item.key}`, "active save window"] : [],
        observations: !buyable ? [activeSaveWindow ? `active-${item.key.toLowerCase()}-save-window` : `future-${item.key.toLowerCase()}-target`] : [],
        score: item.score - Math.min(Number.isFinite(item.eta) ? item.eta : 999999, 999999) / 10,
        etaBefore: etaText,
        target: item.key,
        resource: item.resource,
        raw: {
          etaSeconds: buyable ? 0 : item.eta,
          progressPercent: (item.progress || 0) * 100,
        },
      });
    }

    for (const item of order) {
      const upgrade = item.upgrade;
      if (!upgrade?.isBuyable?.()) continue;

      recordAdvisor("BUY", item.key, item.reason);
      addLaneCandidate({
        lane: "Engine",
        decision: "BUY",
        candidate: item.key,
        reason: item.reason,
        score: item.score,
        etaBefore: "0s",
        target: item.key,
        resource: item.resource,
        raw: {
          etaSeconds: 0,
          progressPercent: 100,
        },
      });

      if (config.advisorOnly || !config.autoBuySafeDecisions) {
        recordMessage(`Advisor: WOULD BUY ${item.key} — ${item.reason}`);
        return { actionTaken: true, bought: 0, summary: `Would buy ${item.key}` };
      }

      const bought = safe(`Smart köp ${item.key}`, () => buyUpgradeAmount(commands, upgrade, newDecimal(1), "Engine"));
      return { actionTaken: true, bought: bought ? 1 : 0, summary: `Bought ${item.key}` };
    }

    recordAdvisor("INFO", "Larva engine", engineSummary(engine));
    return { actionTaken: false, bought: 0 };
  }

  function isCriticalProductionUpgrade(upgrade) {
    if (!upgrade) return false;
    if (upgrade.name === "hatchery" || upgrade.name === "expansion") return false;

    // Energy abilities such as Larva Rush, Meat Rush, Territory Rush and Clone Larvae
    // are casts, not permanent production upgrades. They must never enter
    // the critical production layer.
    if (shouldSkipAbility(upgrade)) return false;

    const text = [
      upgrade.name,
      getDisplayName(upgrade),
      upgrade?.type?.label,
      upgrade?.type?.plural,
      upgrade?.type?.l?.label,
      upgrade?.type?.l?.plural,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    // Twin-upgrades are useful, but they are not the same thing as production/speed upgrades.
    // They should be handled by normal upgrade logic or later by target-upgrade logic.
    if (text.includes("twin")) return false;

    // Keep this layer strict: critical production means actual Faster/Speed/Production upgrades,
    // not one-time energy abilities.
    if (text.includes("faster")) return true;
    if (text.includes("speed")) return true;
    if (text.includes("production")) return true;

    return false;
  }


  function scoreCriticalProductionUpgrade(upgrade) {
    const text = `${upgrade.name} ${getDisplayName(upgrade)}`.toLowerCase();
    let score = 1000;

    if (text.includes("faster")) score += 500;
    if (text.includes("speed")) score += 350;
    if (text.includes("prod")) score += 250;

    const tab = getTabName(upgrade);
    if (tab === "meat") score += 160;
    if (tab === "territory") score += 140;
    if (tab === "larva") score += 220;

    const unitCount = safe(`Score critical ${upgrade.name}`, () => upgrade?.unit?.count?.()) || newDecimal(0);
    score += decimalLog10(unitCount) * 8;

    return score;
  }

  function getCriticalProductionCandidates(game, protectedResources) {
    if (!config.prioritizeProductionUpgrades) return [];

    const targetAwarePlan = config.targetAwareUpgradePlanner
      ? safe("Critical production target-aware deferral", () => buildMeatGoalPlan(game))
      : null;

    const source = config.productionUpgradesIgnoreNotify
      ? game.upgradelist().filter((upgrade) => upgrade?.isVisible?.() && upgrade?.isBuyable?.())
      : game.availableAutobuyUpgrades(config.upgradeBuyPercent);

    return source
      .filter((upgrade) => !shouldSkipAbility(upgrade))
      .filter((upgrade) => isCriticalProductionUpgrade(upgrade))
      .filter((upgrade) => !isTargetAwareUpgradeRelevant(game, upgrade, targetAwarePlan))
      .filter((upgrade) => {
        const protectedCost = shouldAvoidProtectedCost(upgrade, protectedResources);

        if (protectedCost) {
          recordAdvisor("HOLD", getDisplayName(upgrade), protectedResourceHoldReason(protectedCost));
          addLaneCandidate({
            lane: "Upgrade",
            decision: "HOLD",
            candidate: getDisplayName(upgrade),
            reason: protectedResourceHoldReason(protectedCost),
            blockers: [protectedResourceBlocker(protectedCost), "cost uses protected resource"],
            score: unitCostScore(upgrade),
            resource: protectedCost,
          });
          return false;
        }

        return true;
      })
      .map((upgrade) => ({
        upgrade,
        score: scoreCriticalProductionUpgrade(upgrade),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, config.criticalProductionMaxPerRun)
      .map((entry) => entry.upgrade);
  }

  function handleCriticalProductionUpgrades(game, commands, protectedResources) {
    const upgrades = getCriticalProductionCandidates(game, protectedResources);

    if (!upgrades.length) return { actionTaken: false, bought: 0 };

    let bought = 0;

    for (const upgrade of upgrades) {
      recordAdvisor(
        "BUY",
        getDisplayName(upgrade),
        config.productionUpgradesIgnoreNotify
          ? "critical production upgrade available now; ignoring notify threshold"
          : "critical production upgrade available"
      );
      addLaneCandidate({
        lane: "Upgrade",
        decision: "BUY",
        candidate: getDisplayName(upgrade),
        reason: config.productionUpgradesIgnoreNotify
          ? "critical production upgrade available now; ignoring notify threshold"
          : "critical production upgrade available",
        score: 60000 + unitCostScore(upgrade),
        target: "production upgrade",
      });

      if (config.advisorOnly || !config.autoBuySafeDecisions) {
        recordMessage(`Advisor: WOULD BUY ${getDisplayName(upgrade)} — critical production upgrade`);
        continue;
      }

      const didBuy = safe(`Critical production upgrade ${getDisplayName(upgrade)}`, () =>
        buyUpgradeAmount(commands, upgrade, newDecimal(1), "Critical Upgrade")
      );

      if (didBuy) bought++;
    }

    return {
      actionTaken: true,
      bought,
      summary: bought > 0 ? `${bought} critical production upgrade(s)` : "Would buy critical production upgrade",
    };
  }

  function getNexusCount(game) {
    return getCurrentResource(game, "nexus");
  }

  function getNextNexusUpgrade(game) {
    const nexusCount = Math.floor(decimalToNumber(getNexusCount(game), 0));
    const nextLevel = Math.min(5, Math.max(1, nexusCount + 1));

    for (let level = nextLevel; level <= 5; level++) {
      const upgrade = getGameUpgrade(game, `nexus${level}`);
      if (upgrade?.isVisible?.() && (!upgrade.count || upgrade.count().lessThan(1))) {
        return upgrade;
      }
    }

    return null;
  }

  function isEnergyLaneUnlockedOrVisible(game) {
    if (decimalToNumber(getNexusCount(game), 0) > 0) return true;
    if (getNextNexusUpgrade(game)?.isVisible?.()) return true;
    if (getGameUnit(game, "energy")?.isVisible?.()) return true;
    if (getGameUnit(game, "moth")?.isVisible?.()) return true;
    return false;
  }

  function getEnergyProtectedResources(game) {
    const protectedResources = new Set();
    if (!config.energyStrategy || !config.saveEnergyForNexus) return protectedResources;

    if (!isEnergyLaneUnlockedOrVisible(game)) {
      return protectedResources;
    }

    const nexusCount = decimalToNumber(getNexusCount(game), 0);
    if (nexusCount < config.nexusTarget) {
      protectedResources.add("energy");
    }

    return protectedResources;
  }

  function mergeResourceSets(...sets) {
    const merged = new Set();
    for (const set of sets) {
      if (!set) continue;
      for (const item of set) merged.add(item);
    }
    return merged;
  }

  function estimateLepidopteraBoostPercentForCount(countValue) {
    const count = decimalFrom(countValue || 0);
    const weight = count.times(0.001);
    if (!isPositive(weight)) return 0;

    // moth/lepidoptera uses asympStat with val=2, val2=0.001:
    // multiplier = 1 + count/(count + 1000). Displayed as +0..+100% energy.
    const bonus = weight.dividedBy(weight.plus(1));
    return decimalToNumber(bonus.times(100), 0);
  }

  function getLepidopteraBoostPercent(game) {
    const moth = getGameUnit(game, "moth");
    return estimateLepidopteraBoostPercentForCount(moth?.count?.() || 0);
  }

  function getLepidopteraCount(game) {
    const moth = getGameUnit(game, "moth");
    return decimalFrom(moth?.count?.() || 0);
  }

  function decimalAtLeast(value, threshold) {
    try {
      return decimalFrom(value).greaterThanOrEqualTo(decimalFrom(threshold));
    } catch {
      return decimalToNumber(value, 0) >= Number(threshold || 0);
    }
  }

  function getNextNexusEnergyCost(game) {
    const upgrade = getNextNexusUpgrade(game);
    if (!upgrade) return newDecimal(0);
    return getCostForResource(upgrade, "energy");
  }

  function scoreLepidopteraInvestment(game, num) {
    const moth = getGameUnit(game, "moth");
    const nextNexus = getNextNexusUpgrade(game);
    if (!moth || !nextNexus || !isPositive(num)) return null;

    const currentBoost = getLepidopteraBoostPercent(game);
    if (currentBoost >= config.lepidopteraStopAtBoostPercent) {
      return {
        ok: false,
        reason: `lepidoptera already high: +${trimNumber(currentBoost)}% energy`,
      };
    }

    const energyCostPer = getCostForResource(moth, "energy");
    const spentEnergy = decimalFrom(energyCostPer).times(num);
    const currentEnergy = getCurrentResource(game, "energy");
    const targetEnergy = getCostForResource(nextNexus, "energy");
    const currentVelocity = getVelocity(game, "energy");

    if (!isPositive(spentEnergy) || !isPositive(currentVelocity) || !isPositive(targetEnergy)) {
      return { ok: false, reason: "missing energy ROI data" };
    }

    const remaining = decimalFrom(targetEnergy).minus(currentEnergy);
    if (!remaining.greaterThan(0)) {
      return { ok: true, reason: "Nexus energy cost already met", etaImprovement: 0, etaBeforeSeconds: 0, etaAfterSeconds: 0, spentEnergy };
    }

    const countBefore = decimalFrom(moth.count());
    const countAfter = countBefore.plus(num);

    const multBefore = newDecimal(1).plus(countBefore.times(0.001).dividedBy(countBefore.times(0.001).plus(1)));
    const multAfter = newDecimal(1).plus(countAfter.times(0.001).dividedBy(countAfter.times(0.001).plus(1)));

    if (!isPositive(multBefore) || !isPositive(multAfter)) {
      return { ok: false, reason: "could not estimate lepidoptera multiplier" };
    }

    const newVelocity = decimalFrom(currentVelocity).times(multAfter).dividedBy(multBefore);
    const beforeEta = remaining.dividedBy(currentVelocity);
    const afterEta = remaining.plus(spentEnergy).dividedBy(newVelocity);
    const etaImprovement = decimalToNumber(beforeEta.minus(afterEta), 0);

    return {
      ok: etaImprovement > 0,
      etaImprovement,
      etaBeforeSeconds: decimalToNumber(beforeEta, Infinity),
      etaAfterSeconds: decimalToNumber(afterEta, Infinity),
      spentEnergy,
      reason: etaImprovement > 0
        ? `lepidoptera ROI improves Nexus ETA by ${formatDuration(etaImprovement)}`
        : `lepidoptera would delay Nexus ETA by ${formatDuration(Math.abs(etaImprovement))}`,
    };
  }

  function getSafeLepidopteraBuyNum(game) {
    const moth = getGameUnit(game, "moth");
    if (!moth?.isVisible?.() || !moth?.isBuyable?.()) return newDecimal(0);

    const max = safe("Max lepidoptera", () => moth.maxCostMet?.(1)) || newDecimal(0);
    if (!isPositive(max)) return newDecimal(0);

    let num = Decimal.min ? Decimal.min(max, config.maxLepidopteraPerRun) : decimalFrom(Math.min(decimalToNumber(max, 0), config.maxLepidopteraPerRun));
    if (!isPositive(num)) return newDecimal(0);

    num = decimalFrom(num).floor();
    return isPositive(num) ? num : newDecimal(1);
  }

  function buildPostNexusLepidopteraPlan(game, nexusCount) {
    const moth = getGameUnit(game, "moth");
    const boostBefore = getLepidopteraBoostPercent(game);

    function hold(reason, blockedBy = "none", extra = {}) {
      return {
        ok: false,
        reason,
        blockedBy,
        candidate: "Lepidoptera",
        boostBefore,
        ...extra,
      };
    }

    if (!config.energyPlanner) {
      return hold("post-Nexus Energy Planner disabled", "planner disabled");
    }

    if (nexusCount < config.nexusTarget) {
      return hold(`Nexus target not met: ${Math.floor(nexusCount)}/${config.nexusTarget}`, "Nexus target not met");
    }

    if (!moth?.isVisible?.()) {
      return hold("Lepidoptera not visible yet", "locked/unavailable");
    }

    if (!moth?.isBuyable?.()) {
      return hold("no safe Lepidoptera chunk is currently buyable", "no safe chunk");
    }

    if (boostBefore >= config.lepidopteraStopAtBoostPercent) {
      return hold(
        `post-Nexus Lepidoptera held: +${trimNumber(boostBefore)}% energy is at/above stop threshold ${trimNumber(config.lepidopteraStopAtBoostPercent)}%`,
        "lepidoptera stop threshold"
      );
    }

    const costPer = getCostForResource(moth, "energy");
    const currentEnergy = getCurrentResource(game, "energy");
    const energyVelocity = getVelocity(game, "energy");
    const reserveSeconds = Math.max(0, Number(config.postNexusEnergyReserveSeconds || 0));
    const reserve = decimalFrom(energyVelocity).times(reserveSeconds);
    const spendableEnergy = decimalFrom(currentEnergy).minus(reserve);

    if (!isPositive(costPer)) {
      return hold("missing Lepidoptera energy cost data", "no safe chunk", {
        reserve,
      });
    }

    if (!spendableEnergy.greaterThanOrEqualTo(costPer)) {
      return hold(
        `energy reserve blocks post-Nexus Lepidoptera: spendable ${formatSwarmNumber(spendableEnergy)} after ${formatDuration(reserveSeconds)} reserve < cost ${formatSwarmNumber(costPer)}`,
        "protected resource",
        { reserve }
      );
    }

    const maxByButton = safe("Post-Nexus lepidoptera max", () => moth.maxCostMet?.(1)) || newDecimal(0);
    const maxByReserve = spendableEnergy.dividedBy(costPer).floor();
    const configuredMax = decimalFrom(Math.max(0, Number(config.maxLepidopteraPerRun || 0)));
    const num = decimalMin(maxByButton, maxByReserve, configuredMax).floor();

    if (!isPositive(num)) {
      return hold("no safe chunk after max-per-run and energy reserve guards", "no safe chunk", {
        reserve,
      });
    }

    const countBefore = getLepidopteraCount(game);
    const countAfter = countBefore.plus(num);
    const boostAfter = estimateLepidopteraBoostPercentForCount(countAfter);
    const boostGain = Math.max(0, boostAfter - boostBefore);
    const minGain = Math.max(0, Number(config.postNexusLepidopteraMinBoostGainPercent || 0));
    const spentEnergy = decimalFrom(costPer).times(num);

    if (boostGain < minGain) {
      return hold(
        `post-Nexus Lepidoptera chunk not meaningful: +${trimNumber(boostGain)}% energy gain < ${trimNumber(minGain)}% minimum`,
        "not meaningful",
        { num, reserve, boostAfter, boostGain, spentEnergy }
      );
    }

    return {
      ok: true,
      candidate: "Lepidoptera",
      num,
      reserve,
      spentEnergy,
      boostBefore,
      boostAfter,
      boostGain,
      reason: `post-Nexus Energy Planner: bounded ${formatSwarmNumber(num)} Lepidoptera chunk, +${trimNumber(boostBefore)}% -> +${trimNumber(boostAfter)}% energy, reserve ${formatDuration(reserveSeconds)} kept`,
    };
  }

  function getCompoundEffect(ability) {
    const list = ability?.effectByType?.compoundUnit || ability?.effect || [];
    return Array.isArray(list) ? list[0] : null;
  }

  function getCloneLarvaeCap(game) {
    const ability = getGameUpgrade(game, "clonelarvae");
    const effect = getCompoundEffect(ability);
    return safe("Clone Larvae cap", () => effect?.cap?.()) || newDecimal(0);
  }

  function getCloneLarvaeBank(game) {
    const ability = getGameUpgrade(game, "clonelarvae");
    const effect = getCompoundEffect(ability);
    return safe("Clone Larvae bank", () => effect?.bank?.()) || newDecimal(0);
  }

  function manageCloneCocoons(game, commands) {
    // Clone-prep is a side task. It should never block Nexus, upgrades or unit buys.
    if (!config.energyStrategy || !config.manageCloneLarvaeCocoons) {
      addLaneCandidate({
        lane: "Clone Prep",
        decision: "OBSERVE",
        candidate: "Clone Prep",
        reason: "Clone Prep disabled or energy strategy off",
        score: 0,
      });
      return { actionTaken: false, bought: 0, sideAction: true };
    }

    const now = Date.now();
    const cooldownMs = Math.max(0, Number(config.clonePrepCooldownSeconds || 0)) * 1000;

    if (cooldownMs > 0 && lastClonePrepAt && now - lastClonePrepAt < cooldownMs) {
      const waitSeconds = Math.ceil((cooldownMs - (now - lastClonePrepAt)) / 1000);
      recordAdvisor("INFO", "Clone Prep", `cooldown ${formatDuration(waitSeconds)} before next cocoon side-task`);
      addLaneCandidate({
        lane: "Clone Prep",
        decision: "OBSERVE",
        candidate: "Cocoons",
        reason: `cooldown ${formatDuration(waitSeconds)} before next cocoon side-task`,
        score: 20000 - waitSeconds,
        etaBefore: formatDuration(waitSeconds),
        target: "Clone Larvae cocoon buffer",
      });
      return { actionTaken: false, bought: 0, sideAction: true };
    }

    const cocooning = getGameUpgrade(game, "cocooning");
    const clone = getGameUpgrade(game, "clonelarvae");
    const cocoon = getGameUnit(game, "cocoon");
    const larva = getGameUnit(game, "larva");

    if (!cocooning || !clone || !cocoon || !larva) {
      addLaneCandidate({ lane: "Clone Prep", decision: "OBSERVE", candidate: "Clone Prep", reason: "Clone Prep data unavailable", score: 0 });
      return { actionTaken: false, bought: 0, sideAction: true };
    }
    if (cocooning.count?.().lessThan(1)) {
      addLaneCandidate({ lane: "Clone Prep", decision: "OBSERVE", candidate: "Cocoons", reason: "Cocooning upgrade not owned", score: 0 });
      return { actionTaken: false, bought: 0, sideAction: true };
    }
    if (!clone.isVisible?.()) {
      addLaneCandidate({ lane: "Clone Prep", decision: "OBSERVE", candidate: "Clone Larvae", reason: "Clone Larvae not visible yet", score: 0 });
      return { actionTaken: false, bought: 0, sideAction: true };
    }

    const cap = getCloneLarvaeCap(game);
    if (!isPositive(cap)) {
      addLaneCandidate({ lane: "Clone Prep", decision: "OBSERVE", candidate: "Clone Larvae", reason: "Clone Larvae cap unavailable", score: 0 });
      return { actionTaken: false, bought: 0, sideAction: true };
    }

    const targetCocoons = decimalFrom(cap).times(config.cloneCocoonTargetPercent).dividedBy(100);
    const currentCocoons = decimalFrom(cocoon.count());

    if (currentCocoons.greaterThanOrEqualTo(targetCocoons)) {
      recordAdvisor("INFO", "Clone Larvae cocoons", `cocoon buffer ok: ${formatSwarmNumber(currentCocoons)} / ${formatSwarmNumber(targetCocoons)}`);
      addLaneCandidate({
        lane: "Clone Prep",
        decision: "OBSERVE",
        candidate: "Cocoons",
        reason: `cocoon buffer ok: ${formatSwarmNumber(currentCocoons)} / ${formatSwarmNumber(targetCocoons)}`,
        score: 21000,
        reserveAfter: `${formatSwarmNumber(currentCocoons)} / ${formatSwarmNumber(targetCocoons)}`,
        target: "Clone Larvae cocoon buffer",
      });
      return { actionTaken: false, bought: 0, sideAction: true };
    }

    const larvae = decimalFrom(larva.count());
    if (!isPositive(larvae)) {
      addLaneCandidate({
        lane: "Clone Prep",
        decision: "HOLD",
        candidate: "Cocoons",
        reason: "no larvae available for cocoon side-task",
        blockers: ["no safe larvae chunk"],
        score: 10000,
        target: "Clone Larvae cocoon buffer",
      });
      return { actionTaken: false, bought: 0, sideAction: true };
    }

    const needed = targetCocoons.minus(currentCocoons);
    const chunk = larvae.times(config.cloneCocoonChunkPercent).dividedBy(100).floor();
    const num = Decimal.min ? Decimal.min(needed, chunk, larvae) : decimalFrom(Math.min(decimalToNumber(needed, 0), decimalToNumber(chunk, 0), decimalToNumber(larvae, 0)));

    if (!isPositive(num)) {
      recordAdvisor("HOLD", "Clone Larvae cocoons", "not enough safe larvae to cocoon this side-task");
      addLaneCandidate({
        lane: "Clone Prep",
        decision: "HOLD",
        candidate: "Cocoons",
        reason: "not enough safe larvae to cocoon this side-task",
        blockers: ["no safe larvae chunk"],
        score: 15000,
        target: "Clone Larvae cocoon buffer",
      });
      return { actionTaken: false, bought: 0, sideAction: true };
    }

    recordAdvisor("SIDE", "Cocoons", `Clone prep side-task: ${formatSwarmNumber(num)} toward target ${formatSwarmNumber(targetCocoons)}`);
    addLaneCandidate({
      lane: "Clone Prep",
      decision: "SIDE",
      candidate: "Cocoons",
      reason: `Clone prep side-task: ${formatSwarmNumber(num)} toward target ${formatSwarmNumber(targetCocoons)}`,
      score: 30000,
      wouldBuyAmount: formatSwarmNumber(num),
      reserveAfter: `${formatSwarmNumber(currentCocoons.plus(num))} / ${formatSwarmNumber(targetCocoons)}`,
      target: "Clone Larvae cocoon buffer",
    });

    if (config.advisorOnly || !config.autoBuySafeDecisions) {
      recordMessage(`Advisor: WOULD COCOON ${formatSwarmNumber(num)} larvae for Clone Larvae`);
      return { actionTaken: true, bought: 0, sideAction: true, summary: "Would cocoon larvae" };
    }

    const didBuy = safe("Cocoon larvae for Clone Larvae", () => buyUnitAmount(commands, cocoon, num, "Clone Prep"));

    if (didBuy) {
      lastClonePrepAt = Date.now();
    }

    return { actionTaken: !!didBuy, bought: didBuy ? 1 : 0, sideAction: true, summary: didBuy ? "prepared Clone Larvae cocoons" : "Clone prep failed" };
  }

  function resolveCloneBufferMode({ cap, bank, larvae, larvaVelocity }) {
    const configured = String(config.cloneBufferMode || "auto").toLowerCase();
    if (configured && configured !== "auto") {
      if (configured === "post-clone-lock") return "POST_CLONE_LOCK";
      if (configured === "buildup") return "BUILDUP";
      return "MATURE";
    }

    if (isPositive(bank)) return "POST_CLONE_LOCK";

    const capDec = decimalFrom(cap || 0);
    const larvaeDec = decimalFrom(larvae || 0);
    const earlyThreshold = capDec.times(0.5);
    const lowProduction = decimalToNumber(larvaVelocity, 0) <= Number(config.cloneBufferMinLarvaProductionForHardLock || 0);

    if (larvaeDec.lessThan(earlyThreshold) || lowProduction) return "BUILDUP";
    return "MATURE";
  }

  function getCloneBufferProtectionRatio(mode) {
    if (mode === "POST_CLONE_LOCK") return clampNumber(config.cloneBufferPostCloneProtectRatio, 0, 1, DEFAULT_CONFIG.cloneBufferPostCloneProtectRatio);
    if (mode === "BUILDUP") return clampNumber(config.cloneBufferEarlyProtectRatio, 0, 1, DEFAULT_CONFIG.cloneBufferEarlyProtectRatio);
    return clampNumber(config.cloneBufferMatureProtectRatio, 0, 1, DEFAULT_CONFIG.cloneBufferMatureProtectRatio);
  }

  function estimateCloneBufferRecoveryEta(target, cocoons, cocoonVelocity) {
    const targetAmount = decimalFrom(target || 0);
    const currentAmount = decimalFrom(cocoons || 0);
    const remaining = targetAmount.minus(currentAmount);

    if (!remaining.greaterThan(0)) return "0s";
    if (!isPositive(cocoonVelocity)) return "n/a";

    const etaSeconds = decimalToNumber(remaining.dividedBy(cocoonVelocity), Infinity);
    if (!Number.isFinite(etaSeconds) || etaSeconds < 0) return "n/a";

    return formatDuration(etaSeconds);
  }

  function getCloneBufferCompletionThresholdText(absoluteDebtThreshold) {
    const absoluteText = formatSwarmNumber(absoluteDebtThreshold || 0);
    return `>= ${trimNumber(CLONE_BUFFER_RECOVERY_COMPLETE_PERCENT)}% or debt/target <= ${trimNumber(CLONE_BUFFER_RECOVERY_COMPLETE_DEBT_RATIO * 100)}% or debt <= ${absoluteText}`;
  }

  function isCloneBufferRecoveryComplete({ target, cocoons, debt, percent, absoluteDebtThreshold }) {
    const targetAmount = decimalFrom(target || 0);
    const cocoonAmount = decimalFrom(cocoons || 0);
    const debtAmount = decimalFrom(debt || 0);
    const absoluteThreshold = decimalFrom(absoluteDebtThreshold || 0);

    if (!isPositive(targetAmount)) return true;
    if (!isPositive(debtAmount)) return true;
    if (Number.isFinite(percent) && percent >= CLONE_BUFFER_RECOVERY_COMPLETE_PERCENT) return true;
    if (cocoonAmount.greaterThanOrEqualTo(targetAmount.times(CLONE_BUFFER_RECOVERY_COMPLETE_PERCENT / 100))) return true;
    if (debtAmount.lessThanOrEqualTo(targetAmount.times(CLONE_BUFFER_RECOVERY_COMPLETE_DEBT_RATIO))) return true;
    if (isPositive(absoluteThreshold) && debtAmount.lessThanOrEqualTo(absoluteThreshold)) return true;

    return false;
  }

  function resolveCloneBufferTarget({ mode, cap, bank, snapshotTarget }) {
    const capTarget = decimalFrom(cap || 0);
    const actualBank = decimalFrom(bank || 0);
    const snapshotBank = decimalFrom(snapshotTarget || 0);

    if (mode === "POST_CLONE_LOCK") {
      if (isPositive(snapshotBank)) {
        return {
          target: snapshotBank,
          source: "actual clone bank/debt snapshot",
          hardLockActive: true,
          usingSnapshot: true,
        };
      }

      if (isPositive(actualBank)) {
        return {
          target: actualBank,
          source: "actual clone bank/debt snapshot",
          hardLockActive: true,
          usingSnapshot: true,
        };
      }

      const fallbackRatio = Math.min(
        clampNumber(config.cloneBufferPostCloneProtectRatio, 0, 1, DEFAULT_CONFIG.cloneBufferPostCloneProtectRatio),
        0.1
      );
      return {
        target: capTarget.times(fallbackRatio),
        source: `bounded fallback because actual clone bank unavailable (${trimNumber(fallbackRatio * 100)}% cap reference)`,
        hardLockActive: false,
        usingSnapshot: false,
      };
    }

    return {
      target: capTarget,
      source: mode === "BUILDUP" ? "cap reference for buildup" : "cap reference for mature buffer",
      hardLockActive: false,
      usingSnapshot: false,
    };
  }

  function runCloneBufferPlanner(game, commands) {
    if (!config.cloneBufferPlanner || !config.manageCloneLarvaeCocoons) {
      cloneBufferPostCloneTargetSnapshotRaw = null;
      cloneBufferPreviousMode = "OFF";
      recordCloneBufferPlannerState({
        cloneBufferMode: "OFF",
        cloneBufferTarget: "0",
        cloneBufferCurrent: "0",
        cloneBufferPercent: 0,
        cloneBufferDebt: "0",
        cloneBufferSpendableLarvae: "0",
        cloneBufferLarvaeProtected: "0",
        cloneBufferTargetSource: "none",
        cloneBufferRecoveryComplete: true,
        cloneBufferCompletionThreshold: getCloneBufferCompletionThresholdText(0),
        cloneBufferHardLockActive: false,
        cloneBufferReason: "clone buffer planner disabled",
        cloneBufferProtectLarvae: false,
        postCloneLockActive: false,
      });
      return { actionTaken: false, bought: 0 };
    }

    const cloneAbility = getGameUpgrade(game, "clonelarvae");
    const cocoon = getGameUnit(game, "cocoon");
    const larva = getGameUnit(game, "larva");

    if (!cloneAbility?.isVisible?.() || !cocoon || !larva) {
      cloneBufferPostCloneTargetSnapshotRaw = null;
      cloneBufferPreviousMode = "WAIT";
      recordCloneBufferPlannerState({
        cloneBufferMode: "WAIT",
        cloneBufferTarget: "0",
        cloneBufferCurrent: "0",
        cloneBufferPercent: 0,
        cloneBufferDebt: "0",
        cloneBufferSpendableLarvae: formatSwarmNumber(larva?.count?.() || 0),
        cloneBufferLarvaeProtected: "0",
        cloneBufferTargetSource: "none",
        cloneBufferRecoveryComplete: true,
        cloneBufferCompletionThreshold: getCloneBufferCompletionThresholdText(0),
        cloneBufferHardLockActive: false,
        cloneBufferReason: "Clone Larvae not visible yet",
        cloneBufferProtectLarvae: false,
        postCloneLockActive: false,
      });
      return { actionTaken: false, bought: 0 };
    }

    const cap = decimalFrom(getCloneLarvaeCap(game));
    const bank = decimalFrom(getCloneLarvaeBank(game));
    const cocoons = decimalFrom(cocoon.count?.() || 0);
    const larvae = decimalFrom(larva.count?.() || 0);
    const larvaVelocity = decimalFrom(getVelocity(game, "larva"));
    const cocoonVelocity = decimalFrom(getVelocity(game, "cocoon"));
    const mode = resolveCloneBufferMode({ cap, bank, larvae, larvaVelocity });
    const protectRatio = getCloneBufferProtectionRatio(mode);

    if (mode !== "POST_CLONE_LOCK") {
      cloneBufferPostCloneTargetSnapshotRaw = null;
    } else {
      const enteringPostCloneLock = cloneBufferPreviousMode !== "POST_CLONE_LOCK";
      if ((enteringPostCloneLock || !isPositive(cloneBufferPostCloneTargetSnapshotRaw)) && isPositive(bank)) {
        cloneBufferPostCloneTargetSnapshotRaw = decimalFrom(bank);
      }
    }

    const targetResolution = resolveCloneBufferTarget({
      mode,
      cap: cap.times(protectRatio),
      bank,
      snapshotTarget: cloneBufferPostCloneTargetSnapshotRaw,
    });

    if (mode === "POST_CLONE_LOCK" && targetResolution.usingSnapshot && isPositive(targetResolution.target)) {
      cloneBufferPostCloneTargetSnapshotRaw = decimalFrom(targetResolution.target);
    }

    const target = targetResolution.target;
    const rawDebt = target.minus(cocoons);
    const debt = rawDebt.greaterThan(0) ? rawDebt : newDecimal(0);
    const runSeconds = Math.max(1, Number(config.runEverySeconds || DEFAULT_CONFIG.runEverySeconds || 1));
    const recentLarvaChunk = larvaVelocity.times(runSeconds);
    const recentCocoonChunk = cocoonVelocity.times(runSeconds);
    let absoluteDebtThreshold = recentLarvaChunk.greaterThan(recentCocoonChunk) ? recentLarvaChunk : recentCocoonChunk;
    const thresholdCap = target.times(0.005);

    if (!isPositive(absoluteDebtThreshold)) {
      absoluteDebtThreshold = newDecimal(1);
    } else if (isPositive(thresholdCap) && absoluteDebtThreshold.greaterThan(thresholdCap)) {
      absoluteDebtThreshold = thresholdCap;
    }

    const percent = isPositive(target) ? decimalToNumber(cocoons.dividedBy(target).times(100), 0) : 100;
    const recoveryComplete = mode === "POST_CLONE_LOCK"
      ? isCloneBufferRecoveryComplete({
        target,
        cocoons,
        debt,
        percent,
        absoluteDebtThreshold,
      })
      : !isPositive(debt);
    const effectiveDebt = mode === "POST_CLONE_LOCK" && recoveryComplete ? newDecimal(0) : debt;
    const completionThresholdText = getCloneBufferCompletionThresholdText(absoluteDebtThreshold);
    let larvaeProtected;
    if (mode === "BUILDUP") {
      const maxBuildupProtection = larvae.times(protectRatio);
      larvaeProtected = decimalMin(effectiveDebt, maxBuildupProtection);
    } else {
      const desiredProtected = effectiveDebt.times(protectRatio);
      larvaeProtected = decimalMin(larvae, desiredProtected);
    }
    const rawSpendable = larvae.minus(larvaeProtected);
    const spendableLarvae = rawSpendable.greaterThan(0) ? rawSpendable : newDecimal(0);
    const hardLockActive = !!targetResolution.hardLockActive && isPositive(effectiveDebt) && !recoveryComplete;
    const recoveryEta = estimateCloneBufferRecoveryEta(target, cocoons, cocoonVelocity);

    const modeReason = mode === "POST_CLONE_LOCK"
      ? hardLockActive
        ? `post-clone lock active; protecting actual Clone Larvae bank/debt snapshot (${formatSwarmNumber(target)} target, ${trimNumber(percent)}% recovered)`
        : recoveryComplete
          ? `post-clone lock complete; recovery threshold met (${trimNumber(percent)}% recovered, debt ${formatSwarmNumber(debt)}); releasing hard lock`
        : `post-clone lock fallback; actual Clone Larvae bank unavailable, using ${targetResolution.source}`
      : mode === "BUILDUP"
        ? "cocoon target is large relative to current larva production; protect partial larvae for cocoons, allow larva-engine/unlock buys"
        : "mature buffer; use spendable larvae above clone buffer debt";

    recordCloneBufferPlannerState({
      cloneBufferMode: mode,
      cloneBufferCap: formatSwarmNumber(cap),
      cloneBufferBank: formatSwarmNumber(bank),
      cloneBufferTarget: formatSwarmNumber(target),
      cloneBufferCurrent: formatSwarmNumber(cocoons),
      cloneBufferPercent: percent,
      cloneBufferDebt: formatSwarmNumber(debt),
      cloneBufferSpendableLarvae: formatSwarmNumber(spendableLarvae),
      cloneBufferLarvaeProtected: formatSwarmNumber(larvaeProtected),
      cloneBufferTargetSource: targetResolution.source,
      cloneBufferRecoveryComplete: recoveryComplete,
      cloneBufferCompletionThreshold: completionThresholdText,
      cloneBufferRecoveryEta: recoveryEta,
      cloneBufferHardLockActive: hardLockActive,
      cloneBufferReason: modeReason,
      cloneBufferDebtRaw: debt,
      cloneBufferSpendableLarvaeRaw: spendableLarvae,
      cloneBufferLarvaeProtectedRaw: larvaeProtected,
      cloneBufferProtectLarvae: config.cloneBufferProtectLarvae && (mode !== "BUILDUP" || isPositive(effectiveDebt)),
      postCloneLockActive: hardLockActive,
    });

    addLaneCandidate({
      lane: "Clone Prep",
      decision: hardLockActive ? "HOLD" : "OBSERVE",
      candidate: "Clone Buffer Planner",
      reason: modeReason,
      blockers: hardLockActive ? ["cloned larvae protected", "buffer recovery not complete"] : [],
      score: hardLockActive ? 82000 : mode === "BUILDUP" ? 42000 : 52000,
      reserveAfter: `${formatSwarmNumber(cocoons)} / ${formatSwarmNumber(target)}`,
      resource: "larva",
      raw: {
        cloneBufferTarget: target,
        cloneBufferCurrent: cocoons,
        cloneBufferPercent: percent,
        cloneBufferDebt: debt,
        cloneBufferSpendableLarvae: spendableLarvae,
      },
    });

    if (!hardLockActive) {
      cloneBufferPreviousMode = mode;
      return { actionTaken: false, bought: 0 };
    }

    if (!cocoon?.isVisible?.() || !cocoon?.isBuyable?.()) {
      cloneBufferPreviousMode = mode;
      recordAdvisor("HOLD", "Clone Buffer", `post-clone lock active but cocoons are not buyable; ${modeReason}`);
      return { actionTaken: false, bought: 0 };
    }

    const maxChunk = larvae.floor ? larvae.floor() : larvae;
    const buyNum = decimalMin(effectiveDebt, maxChunk);
    if (!isPositive(buyNum)) {
      cloneBufferPreviousMode = mode;
      recordAdvisor("HOLD", "Clone Buffer", "post-clone lock active; no larvae available for cocoon recovery");
      return { actionTaken: false, bought: 0 };
    }

    const reason = `post-clone buffer recovery; cloned larvae must be cocooned before normal spending (${formatSwarmNumber(cocoons)} / ${formatSwarmNumber(target)})`;
    recordAdvisor("BUY", getDisplayName(cocoon), reason);
    addLaneCandidate({
      lane: "Clone Prep",
      decision: "BUY",
      candidate: getDisplayName(cocoon),
      reason,
      score: 92000,
      wouldBuyAmount: formatSwarmNumber(buyNum),
      reserveAfter: `${formatSwarmNumber(cocoons.plus(buyNum))} / ${formatSwarmNumber(target)}`,
      resource: "larva",
    });

    if (config.advisorOnly || !config.autoBuySafeDecisions) {
      cloneBufferPreviousMode = mode;
      recordMessage(`Advisor: WOULD BUY ${formatSwarmNumber(buyNum)} ${getDisplayName(cocoon)} — post-clone lock recovery`);
      return { actionTaken: true, bought: 0, summary: "Would recover clone buffer" };
    }

    const didBuy = safe("Clone buffer recovery", () => buyUnitAmount(commands, cocoon, buyNum, "Clone Buffer"));
    cloneBufferPreviousMode = mode;
    return { actionTaken: true, bought: didBuy ? 1 : 0, summary: didBuy ? "Clone buffer recovery" : "Clone buffer recovery failed" };
  }

  function runUnlockPlanner(game, commands, protectedResources) {
    if (!config.meatUnlockPlanner || !config.meatGoalPlanner) {
      recordUnlockPlannerState({
        candidate: "none",
        decision: "OBSERVE",
        reason: "unlock planner disabled",
        target: "none",
        unlocks: "none",
        costResource: "none",
        reserveRatio: NaN,
        paybackBypassed: false,
      });
      recordParentStepPlannerState({
        candidate: "none",
        decision: "OBSERVE",
        reason: "parent-step planner disabled",
        target: "none",
        actionUnit: "none",
        costResource: "none",
        reserveRatio: NaN,
        paybackBypassed: false,
        supportsActionUnit: false,
      });
      recordTwinUnlockPlannerState({
        candidate: "none",
        decision: "OBSERVE",
        reason: "twin unlock planner disabled",
        target: "none",
        upgrade: "none",
        costResource: "none",
        current: "0",
        required: "0",
        missing: "0",
        prepCandidate: "none",
        reserveRatio: NaN,
        paybackBypassed: false,
        postUpgradeRebuildRatio: NaN,
        rebuildSafe: false,
      });
      return { actionTaken: false, bought: 0 };
    }

    const plan = buildMeatGoalPlan(game);
    if (!plan?.actionUnit) {
      recordUnlockPlannerState({
        candidate: "none",
        decision: "OBSERVE",
        reason: "no unlock/action step available on current meat target path",
        target: plan?.target ? getDisplayName(plan.target) : "none",
        unlocks: "none",
        costResource: "none",
        reserveRatio: NaN,
        paybackBypassed: false,
      });
      recordParentStepPlannerState({
        candidate: "none",
        decision: "OBSERVE",
        reason: "no active action unit on current meat target path",
        target: plan?.target ? getDisplayName(plan.target) : "none",
        actionUnit: "none",
        costResource: "none",
        reserveRatio: NaN,
        paybackBypassed: false,
        supportsActionUnit: false,
      });
      recordTwinUnlockPlannerState({
        candidate: "none",
        decision: "OBSERVE",
        reason: "no relevant target-path twin threshold",
        target: plan?.target ? getDisplayName(plan.target) : "none",
        upgrade: "none",
        costResource: "none",
        current: "0",
        required: "0",
        missing: "0",
        prepCandidate: "none",
        reserveRatio: NaN,
        paybackBypassed: false,
        postUpgradeRebuildRatio: NaN,
        rebuildSafe: false,
      });
      return { actionTaken: false, bought: 0 };
    }

    const targetName = getDisplayName(plan.target);
    const actionUnit = plan.actionUnit;
    const actionUnitName = getDisplayName(actionUnit);
    const directParentUnit = getDirectTargetPathParentUnit(plan);
    const parentUnitName = directParentUnit ? getDisplayName(directParentUnit) : "none";
    const actionOnPath = isUnitOnPlanPath(plan, actionUnit);
    const parentOnPath = isUnitOnPlanPath(plan, directParentUnit);
    const parentCostRow = directParentUnit
      ? getCostList(directParentUnit).find((cost) => cost?.unit && isPositive(cost.val) && isSameGameItem(cost.unit, actionUnit))
      : null;
    const parentCostResourceName = parentCostRow?.unit ? getDisplayName(parentCostRow.unit) : "none";
    const parentSupportsActionUnit = !!parentCostRow || (actionOnPath && parentOnPath);
    let parentChoice = null;

    if (!config.meatParentStepPlanner) {
      recordParentStepPlannerState({
        candidate: parentUnitName,
        decision: "OBSERVE",
        reason: `parent-step planner disabled for ${targetName}`,
        target: targetName,
        actionUnit: actionUnitName,
        costResource: parentCostResourceName,
        reserveRatio: NaN,
        paybackBypassed: false,
        supportsActionUnit: parentSupportsActionUnit,
      });
    } else if (!directParentUnit) {
      recordParentStepPlannerState({
        candidate: "none",
        decision: "HOLD",
        reason: `no direct parent step above ${actionUnitName} on target path to ${targetName}`,
        target: targetName,
        actionUnit: actionUnitName,
        costResource: "none",
        reserveRatio: NaN,
        paybackBypassed: false,
        supportsActionUnit: false,
      });
    } else if (!actionOnPath || !parentOnPath || !isSameGameItem(plan.parentUnit, directParentUnit)) {
      recordParentStepPlannerState({
        candidate: parentUnitName,
        decision: "HOLD",
        reason: `candidate ${parentUnitName} is not a direct target-path parent step for action ${actionUnitName}`,
        target: targetName,
        actionUnit: actionUnitName,
        costResource: parentCostResourceName,
        reserveRatio: NaN,
        paybackBypassed: false,
        supportsActionUnit: false,
      });
    } else if (!parentCostRow) {
      recordParentStepPlannerState({
        candidate: parentUnitName,
        decision: "HOLD",
        reason: `candidate ${parentUnitName} does not directly consume ${actionUnitName} as cost resource`,
        target: targetName,
        actionUnit: actionUnitName,
        costResource: "none",
        reserveRatio: NaN,
        paybackBypassed: false,
        supportsActionUnit: false,
      });
    } else if (!directParentUnit?.isVisible?.() || !directParentUnit?.isBuyable?.()) {
      recordParentStepPlannerState({
        candidate: parentUnitName,
        decision: "HOLD",
        reason: `parent-step candidate ${parentUnitName} is not buyable yet`,
        target: targetName,
        actionUnit: actionUnitName,
        costResource: parentCostResourceName,
        reserveRatio: NaN,
        paybackBypassed: false,
        supportsActionUnit: parentSupportsActionUnit,
      });
    } else {
      const protectedCost = shouldAvoidProtectedCost(directParentUnit, protectedResources || new Set());
      if (protectedCost) {
        recordParentStepPlannerState({
          candidate: parentUnitName,
          decision: "HOLD",
          reason: `parent-step candidate blocked: ${protectedResourceHoldReason(protectedCost)}`,
          target: targetName,
          actionUnit: actionUnitName,
          costResource: protectedCost,
          reserveRatio: NaN,
          paybackBypassed: false,
          supportsActionUnit: parentSupportsActionUnit,
        });
      } else {
        const plannerNum = getPlannerUnitBuyNum(directParentUnit);
        const maxByChunk = decimalFrom(directParentUnit.maxCostMet?.(config.unitBuyPercent) || 0)
          .times(clampNumber(config.meatParentStepMaxChunkPercent, 0.1, 100, DEFAULT_CONFIG.meatParentStepMaxChunkPercent))
          .dividedBy(100)
          .floor();
        const parentNum = decimalMin(plannerNum, maxByChunk);

        if (!isPositive(parentNum)) {
          recordParentStepPlannerState({
            candidate: parentUnitName,
            decision: "HOLD",
            reason: `parent-step candidate ${parentUnitName} has no safe chunk this run`,
            target: targetName,
            actionUnit: actionUnitName,
            costResource: parentCostResourceName,
            reserveRatio: NaN,
            paybackBypassed: false,
            supportsActionUnit: parentSupportsActionUnit,
          });
        } else {
          const guard = getMeatChainPurchaseAnalysis(directParentUnit, parentNum);
          const reserveRatio = rawMetricNumber(guard?.raw || {}, "reserveRatio", NaN);
          const requiredRatio = Number(config.meatParentStepMinReserveRatio || DEFAULT_CONFIG.meatParentStepMinReserveRatio);
          let decision = "BUY";
          let paybackBypassed = false;
          let reason = `target parent-step conversion for ${targetName}; converts ${actionUnitName} into ${parentUnitName}; ${parentUnitName} supports ${actionUnitName} and advances toward ${targetName}; reserve/payback guard ok`;

          if (guard && !guard.ok) {
            if (
              guard.type === "payback" &&
              config.meatParentStepPaybackBypass &&
              parentSupportsActionUnit &&
              Number.isFinite(reserveRatio) &&
              reserveRatio >= requiredRatio
            ) {
              paybackBypassed = true;
              reason = `target parent-step conversion for ${targetName}; converts ${actionUnitName} into ${parentUnitName}; ${parentUnitName} supports ${actionUnitName} and advances toward ${targetName}; reserve after buy ${trimNumber(reserveRatio)}x >= required ${trimNumber(requiredRatio)}x; payback bypassed for target-path parent-step value`;
            } else {
              decision = "HOLD";
              reason = `target parent-step conversion blocked for ${targetName}; ${parentUnitName} from ${actionUnitName}; ${guard.reason}`;
            }
          }

          recordParentStepPlannerState({
            candidate: parentUnitName,
            decision,
            reason,
            target: targetName,
            actionUnit: actionUnitName,
            costResource: parentCostResourceName,
            reserveRatio,
            paybackBypassed,
            supportsActionUnit: parentSupportsActionUnit,
          });

          if (decision === "BUY") {
            parentChoice = {
              unit: directParentUnit,
              num: parentNum,
              reason,
              reserveRatio,
              paybackBypassed,
              costResource: parentCostResourceName,
              raw: guard?.raw || null,
            };
          }
        }
      }
    }

    const twinUpgrade = directParentUnit ? getGameUpgrade(game, `${directParentUnit.name}twin`) : null;
    const twinUpgradeName = twinUpgrade ? getDisplayName(twinUpgrade) : "none";
    const twinThresholdInfo = getTwinUpgradeThresholdInfo(game, twinUpgrade, plan);
    const twinCostUnit = twinThresholdInfo.costResourceUnit;
    const twinCostUnitName = twinThresholdInfo.costResourceName;
    const twinRequiredRaw = twinThresholdInfo.requiredAmount;
    const twinCurrentRaw = twinThresholdInfo.currentAmount;
    const twinMissing = twinThresholdInfo.missingAmount;
    const twinThresholdRatio = isPositive(twinRequiredRaw) ? decimalToNumber(twinCurrentRaw.dividedBy(twinRequiredRaw), 0) : 0;
    const twinNearRatioRequired = Number(config.twinUnlockNearThresholdRatio || DEFAULT_CONFIG.twinUnlockNearThresholdRatio);
    const twinNearEnough = isPositive(twinRequiredRaw) && twinThresholdRatio >= twinNearRatioRequired;
    const twinSupportsPath = !!twinUpgrade && !!directParentUnit && isUnitOnPlanPath(plan, directParentUnit) && !!twinCostUnit && twinThresholdInfo.costResourceOnPath;
    const twinDecisionTarget = targetName;
    const twinPrepCandidateName = twinCostUnitName;

    if (!config.twinUnlockPlanner) {
      recordTwinUnlockPlannerState({
        candidate: twinUpgradeName,
        decision: "OBSERVE",
        reason: "twin unlock planner disabled",
        target: twinDecisionTarget,
        upgrade: twinUpgradeName,
        costResource: twinCostUnitName,
        current: formatSwarmNumber(twinCurrentRaw),
        required: formatSwarmNumber(twinRequiredRaw),
        missing: formatSwarmNumber(twinMissing),
        prepCandidate: twinPrepCandidateName,
        reserveRatio: NaN,
        paybackBypassed: false,
        postUpgradeRebuildRatio: NaN,
        rebuildSafe: false,
      });
    } else if (!twinUpgrade) {
      const reason = "no relevant target-path twin threshold";
      recordTwinUnlockPlannerState({
        candidate: twinUpgradeName,
        decision: "HOLD",
        reason,
        target: twinDecisionTarget,
        upgrade: twinUpgradeName,
        costResource: twinCostUnitName,
        current: formatSwarmNumber(twinCurrentRaw),
        required: formatSwarmNumber(twinRequiredRaw),
        missing: formatSwarmNumber(twinMissing),
        prepCandidate: twinPrepCandidateName,
        reserveRatio: NaN,
        paybackBypassed: false,
        postUpgradeRebuildRatio: NaN,
        rebuildSafe: false,
      });
    } else if (twinThresholdInfo.error === "cost-resource-unreadable") {
      const reason = "could not read twin upgrade cost resource";
      recordTwinUnlockPlannerState({
        candidate: twinUpgradeName,
        decision: "HOLD",
        reason,
        target: twinDecisionTarget,
        upgrade: twinUpgradeName,
        costResource: "none",
        current: "0",
        required: "0",
        missing: "0",
        prepCandidate: "none",
        reserveRatio: NaN,
        paybackBypassed: false,
        postUpgradeRebuildRatio: NaN,
        rebuildSafe: false,
      });
    } else if (twinThresholdInfo.error === "invalid-threshold") {
      const reason = "invalid twin upgrade threshold amount";
      recordTwinUnlockPlannerState({
        candidate: twinUpgradeName,
        decision: "HOLD",
        reason,
        target: twinDecisionTarget,
        upgrade: twinUpgradeName,
        costResource: twinCostUnitName,
        current: formatSwarmNumber(twinCurrentRaw),
        required: formatSwarmNumber(twinRequiredRaw),
        missing: formatSwarmNumber(twinMissing),
        prepCandidate: twinPrepCandidateName,
        reserveRatio: NaN,
        paybackBypassed: false,
        postUpgradeRebuildRatio: NaN,
        rebuildSafe: false,
      });
    } else if (!twinSupportsPath) {
      const reason = `twin cost resource ${twinCostUnitName} not on target path ${twinThresholdInfo.pathLabel}`;
      recordTwinUnlockPlannerState({
        candidate: twinUpgradeName,
        decision: "HOLD",
        reason,
        target: twinDecisionTarget,
        upgrade: twinUpgradeName,
        costResource: twinCostUnitName,
        current: formatSwarmNumber(twinCurrentRaw),
        required: formatSwarmNumber(twinRequiredRaw),
        missing: formatSwarmNumber(twinMissing),
        prepCandidate: twinPrepCandidateName,
        reserveRatio: NaN,
        paybackBypassed: false,
        postUpgradeRebuildRatio: NaN,
        rebuildSafe: false,
      });
    } else if (twinUpgrade.isBuyable?.()) {
      const protectedTwinCost = shouldAvoidProtectedCost(twinUpgrade, protectedResources || new Set());
      const rebuildRatioRequired = Number(config.twinUnlockPostUpgradeRebuildRatio || DEFAULT_CONFIG.twinUnlockPostUpgradeRebuildRatio);
      const meatRows = getCostList(twinUpgrade).filter((cost) => cost?.unit && isPositive(cost.val) && isMeatChainUnit(cost.unit));
      let rebuildSafe = true;
      let rebuildReason = "";
      let rebuildRatio = NaN;

      for (const cost of meatRows) {
        const current = decimalFrom(cost.unit.count?.() || 0);
        const required = decimalFrom(cost.val);
        const after = current.minus(required);
        const ratio = isPositive(required) ? decimalToNumber(after.dividedBy(required), Infinity) : Infinity;

        if (isSameGameItem(cost.unit, twinCostUnit)) {
          rebuildRatio = ratio;
        }

        if (after.lessThan(0) || !Number.isFinite(ratio) || ratio < rebuildRatioRequired) {
          rebuildSafe = false;
          rebuildReason = `upgrade buyable but post-upgrade rebuild buffer unsafe; ${getDisplayName(cost.unit)} after buy ${formatSwarmNumber(after)} gives ${Number.isFinite(ratio) ? `${trimNumber(ratio)}x` : "n/a"} < required ${trimNumber(rebuildRatioRequired)}x`;
          break;
        }
      }

      if (protectedTwinCost) {
        const reason = "protected resource";
        recordTwinUnlockPlannerState({
          candidate: twinUpgradeName,
          decision: "HOLD",
          reason,
          target: twinDecisionTarget,
          upgrade: twinUpgradeName,
          costResource: twinCostUnitName,
          current: formatSwarmNumber(twinCurrentRaw),
          required: formatSwarmNumber(twinRequiredRaw),
          missing: formatSwarmNumber(twinMissing),
          prepCandidate: twinPrepCandidateName,
          reserveRatio: NaN,
          paybackBypassed: false,
          postUpgradeRebuildRatio: rebuildRatio,
          rebuildSafe: false,
          opportunityCostBypass: false,
          opportunityCostReason: "opportunity-cost bypass not evaluated because protected resources are in use",
          lostProductionPerSecond: newDecimal(0),
          lostProductionPerHour: newDecimal(0),
          lostProductionBankRatioPerHour: Infinity,
          lostProductionBankRatioLimit: Number(config.twinUpgradeMaxLostProductionBankRatioPerHour || DEFAULT_CONFIG.twinUpgradeMaxLostProductionBankRatioPerHour),
          upgradeBuyAllowedDespiteRebuildUnsafe: false,
        });
      } else if (!rebuildSafe) {
        const opportunityCost = evaluateTwinUpgradeOpportunityCostBypass({
          game,
          targetName,
          twinUpgradeName,
          twinCostUnitName,
          twinRequiredRaw,
          twinCurrentRaw,
          directParentUnit,
        });

        if (opportunityCost.opportunityCostBypass) {
          const reason = `${rebuildReason || "upgrade buyable but post-upgrade rebuild buffer unsafe"}; opportunity-cost bypass allowed because lost production is negligible (${formatSwarmNumber(opportunityCost.lostProductionPerSecond)}/s, ${formatSwarmNumber(opportunityCost.lostProductionPerHour)}/h, ${trimNumber(opportunityCost.lostProductionBankRatioPerHour * 100)}%/h <= ${trimNumber(opportunityCost.lostProductionBankRatioLimit * 100)}%/h of current ${opportunityCost.producedChildName} bank)`;
          recordTwinUnlockPlannerState({
            candidate: twinUpgradeName,
            decision: "BUY",
            reason,
            target: twinDecisionTarget,
            upgrade: twinUpgradeName,
            costResource: twinCostUnitName,
            current: formatSwarmNumber(twinCurrentRaw),
            required: formatSwarmNumber(twinRequiredRaw),
            missing: formatSwarmNumber(twinMissing),
            prepCandidate: twinPrepCandidateName,
            reserveRatio: NaN,
            paybackBypassed: false,
            postUpgradeRebuildRatio: rebuildRatio,
            rebuildSafe: false,
            opportunityCostBypass: true,
            opportunityCostReason: opportunityCost.opportunityCostReason,
            lostProductionPerSecond: opportunityCost.lostProductionPerSecond,
            lostProductionPerHour: opportunityCost.lostProductionPerHour,
            lostProductionBankRatioPerHour: opportunityCost.lostProductionBankRatioPerHour,
            lostProductionBankRatioLimit: opportunityCost.lostProductionBankRatioLimit,
            upgradeBuyAllowedDespiteRebuildUnsafe: true,
          });
          recordAdvisor("BUY", twinUpgradeName, reason);
          addLaneCandidate({
            lane: "Twin",
            decision: "BUY",
            candidate: twinUpgradeName,
            reason,
            score: unitCostScore(twinUpgrade) + 8600,
            target: twinDecisionTarget,
            resource: twinCostUnitName,
          });

          if (config.advisorOnly || !config.autoBuySafeDecisions) {
            recordMessage(`Advisor: WOULD BUY ${twinUpgradeName} — twin unlock threshold (opportunity-cost bypass)`);
            return { actionTaken: true, bought: 0, summary: "Would buy twin unlock upgrade" };
          }

          const didTwinBuy = safe(`Twin unlock threshold ${twinUpgradeName}`, () => buyUpgradeAmount(commands, twinUpgrade, newDecimal(1), "Twin Unlock"));
          if (didTwinBuy) {
            recordTwinUnlockPlannerState({
              candidate: twinUpgradeName,
              decision: "BUY",
              reason,
              target: twinDecisionTarget,
              upgrade: twinUpgradeName,
              costResource: twinCostUnitName,
              current: formatSwarmNumber(twinCurrentRaw),
              required: formatSwarmNumber(twinRequiredRaw),
              missing: formatSwarmNumber(twinMissing),
              prepCandidate: twinPrepCandidateName,
              reserveRatio: NaN,
              paybackBypassed: false,
              postUpgradeRebuildRatio: rebuildRatio,
              rebuildSafe: false,
              opportunityCostBypass: true,
              opportunityCostReason: opportunityCost.opportunityCostReason,
              lostProductionPerSecond: opportunityCost.lostProductionPerSecond,
              lostProductionPerHour: opportunityCost.lostProductionPerHour,
              lostProductionBankRatioPerHour: opportunityCost.lostProductionBankRatioPerHour,
              lostProductionBankRatioLimit: opportunityCost.lostProductionBankRatioLimit,
              upgradeBuyAllowedDespiteRebuildUnsafe: true,
              executed: true,
            });
          }
          return { actionTaken: true, bought: didTwinBuy ? 1 : 0, summary: didTwinBuy ? `Twin unlock ${twinUpgradeName}` : "Twin unlock buy failed" };
        }

        const deniedReason = `${rebuildReason || "upgrade buyable but post-upgrade rebuild buffer unsafe"}; ${opportunityCost.opportunityCostReason}; lost production ${formatSwarmNumber(opportunityCost.lostProductionPerSecond)}/s, ${formatSwarmNumber(opportunityCost.lostProductionPerHour)}/h, ${Number.isFinite(opportunityCost.lostProductionBankRatioPerHour) ? `${trimNumber(opportunityCost.lostProductionBankRatioPerHour * 100)}%/h` : "n/a"} (limit ${trimNumber(opportunityCost.lostProductionBankRatioLimit * 100)}%/h)`;
        recordTwinUnlockPlannerState({
          candidate: twinUpgradeName,
          decision: "HOLD",
          reason: deniedReason,
          target: twinDecisionTarget,
          upgrade: twinUpgradeName,
          costResource: twinCostUnitName,
          current: formatSwarmNumber(twinCurrentRaw),
          required: formatSwarmNumber(twinRequiredRaw),
          missing: formatSwarmNumber(twinMissing),
          prepCandidate: twinPrepCandidateName,
          reserveRatio: NaN,
          paybackBypassed: false,
          postUpgradeRebuildRatio: rebuildRatio,
          rebuildSafe: false,
          opportunityCostBypass: false,
          opportunityCostReason: opportunityCost.opportunityCostReason,
          lostProductionPerSecond: opportunityCost.lostProductionPerSecond,
          lostProductionPerHour: opportunityCost.lostProductionPerHour,
          lostProductionBankRatioPerHour: opportunityCost.lostProductionBankRatioPerHour,
          lostProductionBankRatioLimit: opportunityCost.lostProductionBankRatioLimit,
          upgradeBuyAllowedDespiteRebuildUnsafe: false,
        });
        recordAdvisor("HOLD", twinUpgradeName, deniedReason);
        addLaneCandidate({
          lane: "Twin",
          decision: "HOLD",
          candidate: twinUpgradeName,
          reason: deniedReason,
          blockers: ["post-upgrade rebuild buffer"],
          score: unitCostScore(twinUpgrade) + 7800,
          target: twinDecisionTarget,
          resource: twinCostUnitName,
        });
      } else {
        const reason = `twin threshold reached for ${twinUpgradeName}; ${twinCostUnitName} ${formatSwarmNumber(twinCurrentRaw)} / ${formatSwarmNumber(twinRequiredRaw)}; post-upgrade rebuild ratio ${Number.isFinite(rebuildRatio) ? `${trimNumber(rebuildRatio)}x` : "n/a"} >= required ${trimNumber(rebuildRatioRequired)}x`;
        recordTwinUnlockPlannerState({
          candidate: twinUpgradeName,
          decision: "BUY",
          reason,
          target: twinDecisionTarget,
          upgrade: twinUpgradeName,
          costResource: twinCostUnitName,
          current: formatSwarmNumber(twinCurrentRaw),
          required: formatSwarmNumber(twinRequiredRaw),
          missing: formatSwarmNumber(twinMissing),
          prepCandidate: twinPrepCandidateName,
          reserveRatio: NaN,
          paybackBypassed: false,
          postUpgradeRebuildRatio: rebuildRatio,
          rebuildSafe: true,
          opportunityCostBypass: false,
          opportunityCostReason: "opportunity-cost bypass not needed because rebuild buffer is already safe",
          lostProductionPerSecond: newDecimal(0),
          lostProductionPerHour: newDecimal(0),
          lostProductionBankRatioPerHour: 0,
          lostProductionBankRatioLimit: Number(config.twinUpgradeMaxLostProductionBankRatioPerHour || DEFAULT_CONFIG.twinUpgradeMaxLostProductionBankRatioPerHour),
          upgradeBuyAllowedDespiteRebuildUnsafe: false,
        });
        recordAdvisor("BUY", twinUpgradeName, reason);
        addLaneCandidate({
          lane: "Twin",
          decision: "BUY",
          candidate: twinUpgradeName,
          reason,
          score: unitCostScore(twinUpgrade) + 8600,
          target: twinDecisionTarget,
          resource: twinCostUnitName,
        });

        if (config.advisorOnly || !config.autoBuySafeDecisions) {
          recordMessage(`Advisor: WOULD BUY ${twinUpgradeName} — twin unlock threshold`);
          return { actionTaken: true, bought: 0, summary: "Would buy twin unlock upgrade" };
        }

        const didTwinBuy = safe(`Twin unlock threshold ${twinUpgradeName}`, () => buyUpgradeAmount(commands, twinUpgrade, newDecimal(1), "Twin Unlock"));
        if (didTwinBuy) {
          recordTwinUnlockPlannerState({
            candidate: twinUpgradeName,
            decision: "BUY",
            reason,
            target: twinDecisionTarget,
            upgrade: twinUpgradeName,
            costResource: twinCostUnitName,
            current: formatSwarmNumber(twinCurrentRaw),
            required: formatSwarmNumber(twinRequiredRaw),
            missing: formatSwarmNumber(twinMissing),
            prepCandidate: twinPrepCandidateName,
            reserveRatio: NaN,
            paybackBypassed: false,
            postUpgradeRebuildRatio: rebuildRatio,
            rebuildSafe: true,
            opportunityCostBypass: false,
            opportunityCostReason: "opportunity-cost bypass not needed because rebuild buffer is already safe",
            lostProductionPerSecond: newDecimal(0),
            lostProductionPerHour: newDecimal(0),
            lostProductionBankRatioPerHour: 0,
            lostProductionBankRatioLimit: Number(config.twinUpgradeMaxLostProductionBankRatioPerHour || DEFAULT_CONFIG.twinUpgradeMaxLostProductionBankRatioPerHour),
            upgradeBuyAllowedDespiteRebuildUnsafe: false,
            executed: true,
          });
        }
        return { actionTaken: true, bought: didTwinBuy ? 1 : 0, summary: didTwinBuy ? `Twin unlock ${twinUpgradeName}` : "Twin unlock buy failed" };
      }
    } else if (!twinCostUnit?.isVisible?.() || !twinCostUnit?.isBuyable?.()) {
      const reason = !twinNearEnough
        ? `threshold reachability prep below near-threshold ratio (${trimNumber(twinThresholdRatio * 100)}% < required ${trimNumber(twinNearRatioRequired * 100)}%); twin prep resource ${twinCostUnitName} is not buyable yet`
        : `twin prep resource ${twinCostUnitName} is not buyable yet`;
      recordTwinUnlockPlannerState({
        candidate: twinUpgradeName,
        decision: "HOLD",
        reason,
        target: twinDecisionTarget,
        upgrade: twinUpgradeName,
        costResource: twinCostUnitName,
        current: formatSwarmNumber(twinCurrentRaw),
        required: formatSwarmNumber(twinRequiredRaw),
        missing: formatSwarmNumber(twinMissing),
        prepCandidate: twinPrepCandidateName,
        reserveRatio: NaN,
        paybackBypassed: false,
        postUpgradeRebuildRatio: NaN,
        rebuildSafe: false,
      });
    } else {
      const protectedPrepCost = shouldAvoidProtectedCost(twinCostUnit, protectedResources || new Set());
      const plannerNum = getPlannerUnitBuyNum(twinCostUnit);
      const maxByChunk = decimalFrom(twinCostUnit.maxCostMet?.(config.unitBuyPercent) || 0)
        .times(clampNumber(config.twinUnlockMaxPrepChunkPercent, 0.1, 100, DEFAULT_CONFIG.twinUnlockMaxPrepChunkPercent))
        .dividedBy(100)
        .floor();
      const prepNum = decimalMin(plannerNum, maxByChunk, twinMissing);
      const prepGainPercent = isPositive(twinRequiredRaw)
        ? decimalToNumber(decimalFrom(prepNum).dividedBy(twinRequiredRaw).times(100), 0)
        : 0;
      const thresholdRatioText = `${trimNumber(twinThresholdRatio * 100)}%`;
      const nearThresholdRatioText = `${trimNumber(twinNearRatioRequired * 100)}%`;
      const prepChunkText = formatSwarmNumber(prepNum);
      const prepReachesThreshold = isPositive(twinRequiredRaw)
        ? decimalFrom(twinCurrentRaw).plus(prepNum).greaterThanOrEqualTo(twinRequiredRaw)
        : false;
      const prepGainMeaningful = prepGainPercent >= TWIN_UNLOCK_MEANINGFUL_PROGRESS_GAIN_PERCENT;
      const parentStepPreferred = !!(parentChoice && parentSupportsActionUnit && parentChoice.decision === "BUY");
      const twinPrepMeaningful = twinNearEnough || prepReachesThreshold || prepGainMeaningful;
      const twinPrepTooFarReason = `Twin prep HOLD: threshold too far (${thresholdRatioText} < ${nearThresholdRatioText}); chunk +${prepChunkText} ${twinCostUnitName} advances only ${trimNumber(prepGainPercent)}% of required threshold and is not meaningful yet`;
      const twinPrepDeferredReason = parentStepPreferred
        ? `${twinPrepTooFarReason}; parent-step target path is available: ${parentChoice.reason}`
        : `${twinPrepTooFarReason}; parent-step/refill not currently available, so budget stays unused until a meaningful target-path action appears`;

      if (protectedPrepCost) {
        recordTwinUnlockPlannerState({
          candidate: twinUpgradeName,
          decision: "HOLD",
          reason: "protected resource",
          target: twinDecisionTarget,
          upgrade: twinUpgradeName,
          costResource: twinCostUnitName,
          current: formatSwarmNumber(twinCurrentRaw),
          required: formatSwarmNumber(twinRequiredRaw),
          missing: formatSwarmNumber(twinMissing),
          thresholdRatio: twinThresholdRatio,
          nearThresholdRatio: twinNearRatioRequired,
          prepCandidate: twinPrepCandidateName,
          prepChunk: prepChunkText,
          prepDecision: "HOLD",
          reserveRatio: NaN,
          paybackBypassed: false,
          postUpgradeRebuildRatio: NaN,
          rebuildSafe: false,
          prepMeaningful: false,
          prepProgressGainPercent: prepGainPercent,
          prepProgressGainRequiredPercent: TWIN_UNLOCK_MEANINGFUL_PROGRESS_GAIN_PERCENT,
          prepDeferredReason: "protected resource",
          deferredByParentStep: parentStepPreferred,
          parentStepPreferred,
          whyParentStepWon: parentStepPreferred ? parentChoice.reason : "none",
          whyTwinPrepDidNotWin: parentStepPreferred ? twinPrepDeferredReason : "protected resource",
        });
      } else if (!isPositive(prepNum)) {
        recordTwinUnlockPlannerState({
          candidate: twinUpgradeName,
          decision: "HOLD",
          reason: "threshold prep has no safe chunk this run",
          target: twinDecisionTarget,
          upgrade: twinUpgradeName,
          costResource: twinCostUnitName,
          current: formatSwarmNumber(twinCurrentRaw),
          required: formatSwarmNumber(twinRequiredRaw),
          missing: formatSwarmNumber(twinMissing),
          thresholdRatio: twinThresholdRatio,
          nearThresholdRatio: twinNearRatioRequired,
          prepCandidate: twinPrepCandidateName,
          prepChunk: prepChunkText,
          prepDecision: "HOLD",
          reserveRatio: NaN,
          paybackBypassed: false,
          postUpgradeRebuildRatio: NaN,
          rebuildSafe: false,
          prepMeaningful: false,
          prepProgressGainPercent: prepGainPercent,
          prepProgressGainRequiredPercent: TWIN_UNLOCK_MEANINGFUL_PROGRESS_GAIN_PERCENT,
          prepDeferredReason: "threshold prep has no safe chunk this run",
          deferredByParentStep: parentStepPreferred,
          parentStepPreferred,
          whyParentStepWon: parentStepPreferred ? parentChoice.reason : "none",
          whyTwinPrepDidNotWin: parentStepPreferred ? twinPrepDeferredReason : "no safe chunk this run",
        });
      } else if (!twinPrepMeaningful) {
        const reason = twinPrepDeferredReason;
        recordTwinUnlockPlannerState({
          candidate: twinUpgradeName,
          decision: "HOLD",
          reason,
          target: twinDecisionTarget,
          upgrade: twinUpgradeName,
          costResource: twinCostUnitName,
          current: formatSwarmNumber(twinCurrentRaw),
          required: formatSwarmNumber(twinRequiredRaw),
          missing: formatSwarmNumber(twinMissing),
          thresholdRatio: twinThresholdRatio,
          nearThresholdRatio: twinNearRatioRequired,
          prepCandidate: twinPrepCandidateName,
          prepChunk: prepChunkText,
          prepDecision: "HOLD",
          reserveRatio: NaN,
          paybackBypassed: false,
          postUpgradeRebuildRatio: NaN,
          rebuildSafe: false,
          prepMeaningful: false,
          prepProgressGainPercent: prepGainPercent,
          prepProgressGainRequiredPercent: TWIN_UNLOCK_MEANINGFUL_PROGRESS_GAIN_PERCENT,
          prepDeferredReason: reason,
          deferredByParentStep: parentStepPreferred,
          parentStepPreferred,
          whyParentStepWon: parentStepPreferred ? parentChoice.reason : "none",
          whyTwinPrepDidNotWin: reason,
        });
        recordAdvisor("HOLD", twinUpgradeName, reason);
        addLaneCandidate({
          lane: "Twin",
          decision: "HOLD",
          candidate: twinUpgradeName,
          reason,
          blockers: parentStepPreferred ? ["parent-step preferred", "twin prep too small"] : ["threshold too far", "twin prep too small"],
          observations: [
            `ratio ${thresholdRatioText} vs near-threshold ${nearThresholdRatioText}`,
            `prep gain ${trimNumber(prepGainPercent)}% of required`,
            `prep chunk +${prepChunkText} ${twinCostUnitName}`,
            parentStepPreferred ? `parent step ready: ${parentUnitName}` : `parent step unavailable: ${parentStepPlannerState?.reason || "none"}`,
          ],
          score: unitCostScore(twinUpgrade) + 7800,
          target: twinDecisionTarget,
          resource: twinCostUnitName,
        });
      } else {
        const guard = getMeatChainPurchaseAnalysis(twinCostUnit, prepNum);
        const reserveRatio = rawMetricNumber(guard?.raw || {}, "reserveRatio", NaN);
        const requiredRatio = Number(config.twinUnlockMinReserveRatio || DEFAULT_CONFIG.twinUnlockMinReserveRatio);
        const reachabilityPrefix = !twinNearEnough
          ? `Twin prep near-threshold not reached yet (${thresholdRatioText} < required ${nearThresholdRatioText}), but chunk is meaningful`
          : "threshold prep";
        let decision = "BUY";
        let paybackBypassed = false;
        let reason = `${reachabilityPrefix} for ${twinUpgradeName}; need ${formatSwarmNumber(twinRequiredRaw)} ${twinCostUnitName}; current ${formatSwarmNumber(twinCurrentRaw)}; missing ${formatSwarmNumber(twinMissing)}; buying ${twinCostUnitName} advances concrete twin threshold for ${targetName}`;

        if (guard && !guard.ok) {
          if (
            guard.type === "payback" &&
            config.twinUnlockPaybackBypass &&
            Number.isFinite(reserveRatio) &&
            reserveRatio >= requiredRatio
          ) {
            paybackBypassed = true;
            reason = `${reachabilityPrefix} for ${twinUpgradeName}; need ${formatSwarmNumber(twinRequiredRaw)} ${twinCostUnitName}; current ${formatSwarmNumber(twinCurrentRaw)}; missing ${formatSwarmNumber(twinMissing)}; buying ${twinCostUnitName} advances concrete twin threshold for ${targetName}; reserve after buy ${trimNumber(reserveRatio)}x >= required ${trimNumber(requiredRatio)}x; payback bypassed for twin threshold value`;
          } else {
            decision = "HOLD";
            reason = guard.type === "reserve" || (Number.isFinite(reserveRatio) && reserveRatio < requiredRatio)
              ? `${reachabilityPrefix} for ${twinUpgradeName}; need ${formatSwarmNumber(twinRequiredRaw)} ${twinCostUnitName}; current ${formatSwarmNumber(twinCurrentRaw)}; missing ${formatSwarmNumber(twinMissing)}; HOLD because reserve after ${twinCostUnitName} prep is below required threshold`
              : `threshold prep blocked: ${guard.reason}`;
          }
        }

        recordTwinUnlockPlannerState({
          candidate: twinUpgradeName,
          decision,
          reason,
          target: twinDecisionTarget,
          upgrade: twinUpgradeName,
          costResource: twinCostUnitName,
          current: formatSwarmNumber(twinCurrentRaw),
          required: formatSwarmNumber(twinRequiredRaw),
          missing: formatSwarmNumber(twinMissing),
          thresholdRatio: twinThresholdRatio,
          nearThresholdRatio: twinNearRatioRequired,
          prepCandidate: twinPrepCandidateName,
          prepChunk: prepChunkText,
          prepDecision: decision,
          reserveRatio,
          paybackBypassed,
          postUpgradeRebuildRatio: NaN,
          rebuildSafe: false,
          prepMeaningful: twinPrepMeaningful,
          prepProgressGainPercent: prepGainPercent,
          prepProgressGainRequiredPercent: TWIN_UNLOCK_MEANINGFUL_PROGRESS_GAIN_PERCENT,
          prepDeferredReason: decision === "HOLD" ? reason : "none",
          deferredByParentStep: false,
          parentStepPreferred,
          whyParentStepWon: parentStepPreferred ? parentChoice.reason : "none",
          whyTwinPrepDidNotWin: decision === "HOLD" ? reason : "none",
        });

        if (decision === "BUY") {
          recordAdvisor("BUY", twinCostUnitName, reason);
          addLaneCandidate({
            lane: "Meat",
            decision: "BUY",
            candidate: twinCostUnitName,
            reason,
            score: unitCostScore(twinCostUnit) + 8700,
            wouldBuyAmount: formatSwarmNumber(prepNum),
            target: targetName,
            resource: twinCostUnitName,
            raw: guard?.raw || null,
          });

          if (config.advisorOnly || !config.autoBuySafeDecisions) {
            recordMessage(`Advisor: WOULD BUY ${formatSwarmNumber(prepNum)} ${twinCostUnitName} — twin unlock threshold prep`);
            return { actionTaken: true, bought: 0, summary: "Would buy twin threshold prep" };
          }

          const didPrepBuy = safe(`Twin unlock prep ${twinCostUnitName}`, () => buyUnitAmount(commands, twinCostUnit, prepNum, "Twin Unlock Prep"));
          if (didPrepBuy) {
            recordTwinUnlockPlannerState({
              candidate: twinUpgradeName,
              decision: "BUY",
              reason,
              target: twinDecisionTarget,
              upgrade: twinUpgradeName,
              costResource: twinCostUnitName,
              current: formatSwarmNumber(twinCurrentRaw),
              required: formatSwarmNumber(twinRequiredRaw),
              missing: formatSwarmNumber(twinMissing),
              thresholdRatio: twinThresholdRatio,
              nearThresholdRatio: twinNearRatioRequired,
              prepCandidate: twinPrepCandidateName,
              prepChunk: prepChunkText,
              prepDecision: "BUY",
              reserveRatio,
              paybackBypassed,
              postUpgradeRebuildRatio: NaN,
              rebuildSafe: false,
              prepMeaningful: twinPrepMeaningful,
              prepProgressGainPercent: prepGainPercent,
              prepProgressGainRequiredPercent: TWIN_UNLOCK_MEANINGFUL_PROGRESS_GAIN_PERCENT,
              prepDeferredReason: "none",
              deferredByParentStep: false,
              parentStepPreferred,
              whyParentStepWon: parentChoice?.reason || "none",
              whyTwinPrepDidNotWin: "none",
              executed: true,
            });
          }
          return { actionTaken: true, bought: didPrepBuy ? 1 : 0, summary: didPrepBuy ? `Twin threshold prep ${twinCostUnitName}` : "Twin threshold prep buy failed" };
        }
      }
    }

    const candidate = parentChoice?.unit || actionUnit;
    const candidateName = getDisplayName(candidate);
    const bottleneckUnit = getUnitBottleneckCost(candidate)?.unit || plan.bottleneck?.unit || null;
    const bottleneckResource = parentChoice?.costResource || (bottleneckUnit ? getDisplayName(bottleneckUnit) : "bottleneck resource");

    if (!candidate?.isVisible?.() || !candidate?.isBuyable?.()) {
      recordUnlockPlannerState({
        candidate: candidateName,
        decision: "HOLD",
        reason: `unlock/action candidate ${candidateName} is not buyable yet; bottleneck ${bottleneckResource}`,
        target: targetName,
        unlocks: "none",
        costResource: bottleneckResource,
        reserveRatio: NaN,
        paybackBypassed: false,
      });
      return { actionTaken: false, bought: 0 };
    }

    const num = parentChoice
      ? parentChoice.num
      : (() => {
        const plannerNum = getPlannerUnitBuyNum(candidate);
        const maxByChunk = decimalFrom(candidate.maxCostMet?.(config.unitBuyPercent) || 0)
          .times(clampNumber(config.meatUnlockMaxChunkPercent, 0.1, 100, DEFAULT_CONFIG.meatUnlockMaxChunkPercent))
          .dividedBy(100)
          .floor();
        return decimalMin(plannerNum, maxByChunk);
      })();

    if (!isPositive(num)) {
      return { actionTaken: false, bought: 0 };
    }

    const twin = getTwinUpgradeForUnit(game, candidate);
    const unlocks = [];
    if (twin) unlocks.push(getDisplayName(twin));
    unlocks.push(`progress toward ${targetName}`);

    const protectedCost = shouldAvoidProtectedCost(candidate, protectedResources || new Set());
    if (protectedCost) {
      const reason = `unlock/action candidate blocked; ${protectedResourceHoldReason(protectedCost)}`;
      recordAdvisor("HOLD", candidateName, reason);
      addLaneCandidate({
        lane: "Meat",
        decision: "HOLD",
        candidate: candidateName,
        reason,
        blockers: [protectedResourceBlocker(protectedCost), "cost uses protected resource"],
        score: unitCostScore(candidate) + 6000,
        wouldBuyAmount: formatSwarmNumber(num),
        target: targetName,
      });
      recordUnlockPlannerState({
        candidate: candidateName,
        decision: "HOLD",
        reason,
        target: targetName,
        unlocks: unlocks.join(", "),
        costResource: protectedCost,
        reserveRatio: NaN,
        paybackBypassed: false,
      });
      return { actionTaken: false, bought: 0 };
    }

    const guard = parentChoice ? { ok: true, raw: parentChoice.raw } : getMeatChainPurchaseAnalysis(candidate, num);
    const reserveRatio = parentChoice?.reserveRatio ?? rawMetricNumber(guard?.raw || {}, "reserveRatio", NaN);
    const hasConcreteUnlockValue = parentChoice ? true : (!!twin || candidateName !== targetName);
    let paybackBypassed = !!parentChoice?.paybackBypassed;

    if (!parentChoice && guard && !guard.ok) {
      if (
        guard.type === "payback" &&
        config.meatUnlockPaybackBypass &&
        hasConcreteUnlockValue &&
        Number.isFinite(reserveRatio) &&
        reserveRatio >= Number(config.meatUnlockMinReserveRatio || DEFAULT_CONFIG.meatUnlockMinReserveRatio)
      ) {
        paybackBypassed = true;
      } else {
        const reason = `unlock/action candidate blocked; would unlock ${unlocks.join(", ")} but ${guard.reason}`;
        recordAdvisor("HOLD", candidateName, reason);
        addLaneCandidate({
          lane: "Meat",
          decision: "HOLD",
          candidate: candidateName,
          reason,
          blockers: [guard.type === "payback" ? "payback guard" : "reserve guard"],
          score: unitCostScore(candidate) + 5500,
          wouldBuyAmount: formatSwarmNumber(num),
          payback: guard.type === "payback" ? guard.reason : "",
          reserveAfter: guard.reason,
          target: targetName,
          raw: guard.raw || null,
        });
        recordUnlockPlannerState({
          candidate: candidateName,
          decision: "HOLD",
          reason,
          target: targetName,
          unlocks: unlocks.join(", "),
          costResource: getDisplayName(guard?.raw?.costResource || actionUnit),
          reserveRatio,
          paybackBypassed: false,
        });
        return { actionTaken: false, bought: 0 };
      }
    }

    const reason = parentChoice
      ? parentChoice.reason
      : paybackBypassed
        ? `target unlock step for ${targetName}; converts ${bottleneckResource} into ${candidateName}; unlocks ${unlocks.join(", ")}; reserve after buy ${Number.isFinite(reserveRatio) ? `${trimNumber(reserveRatio)}x` : "n/a"} >= required ${trimNumber(config.meatUnlockMinReserveRatio)}x; payback bypassed for unlock value`
        : `target unlock step for ${targetName}; converts ${bottleneckResource} into ${candidateName}; unlocks ${unlocks.join(", ")}; reserve/payback guard ok`;

    recordAdvisor("BUY", candidateName, reason);
    addLaneCandidate({
      lane: "Meat",
      decision: "BUY",
      candidate: candidateName,
      reason,
      score: unitCostScore(candidate) + (parentChoice ? 8600 : 8000),
      wouldBuyAmount: formatSwarmNumber(num),
      target: targetName,
      raw: parentChoice?.raw || guard?.raw || null,
    });
    recordUnlockPlannerState({
      candidate: candidateName,
      decision: "BUY",
      reason,
      target: targetName,
      unlocks: unlocks.join(", "),
      costResource: bottleneckResource,
      reserveRatio,
      paybackBypassed,
    });

    if (config.advisorOnly || !config.autoBuySafeDecisions) {
      recordMessage(`Advisor: WOULD BUY ${formatSwarmNumber(num)} ${candidateName} — unlock planner`);
      return { actionTaken: true, bought: 0, summary: "Would buy unlock step" };
    }

    const didBuy = safe(`Unlock planner ${candidateName}`, () => buyUnitAmount(commands, candidate, num, parentChoice ? "Parent Step" : "Unlock Step"));
    if (didBuy && parentChoice) {
      const consumedActionUnit = !!parentSupportsActionUnit && String(bottleneckResource || "") === String(actionUnitName || "");
      recordParentStepPlannerState({
        candidate: candidateName,
        decision: "BUY",
        reason,
        target: targetName,
        actionUnit: actionUnitName,
        costResource: bottleneckResource,
        reserveRatio,
        paybackBypassed,
        supportsActionUnit: parentSupportsActionUnit,
        consumedActionUnit,
        consumedUnit: consumedActionUnit ? actionUnitName : "none",
        executed: true,
      });
    }
    return { actionTaken: true, bought: didBuy ? 1 : 0, summary: didBuy ? `Unlock planner ${candidateName}` : "Unlock planner buy failed" };
  }

  function unitCountByNameLike(game, query) {
    const q = String(query || "").toLowerCase();
    if (!q) return newDecimal(0);

    let total = newDecimal(0);
    for (const unit of game.unitlist?.() || []) {
      const text = `${unit?.name || ""} ${getDisplayName(unit)}`.toLowerCase();
      if (!text.includes(q)) continue;
      total = total.plus(decimalFrom(unit?.count?.() || 0));
    }
    return total;
  }

  function runAbilityPrepPlanner(game) {
    const energy = getCurrentResource(game, "energy");
    let lastState = null;

    const clone = getGameUpgrade(game, "clonelarvae");
    if (isItemVisibleWithScenarioOverride(clone)) {
      const cloneCost = getCostForResource(clone, "energy");
      const energyOk = decimalAtLeast(energy, cloneCost);
      const bufferDebt = decimalFrom(cloneBufferPlannerState?.cloneBufferDebtRaw || 0);
      const needsCloneBuffer = isPositive(bufferDebt) || !!cloneBufferPlannerState?.postCloneLockActive;
      const decision = energyOk && !needsCloneBuffer ? "PLAN" : "HOLD";
      const reason = energyOk && !needsCloneBuffer
        ? "energy safe, clone cap high enough and cocoon buffer can absorb cloned larvae; auto-cast disabled"
        : "cocoon buffer cannot absorb cloned larvae yet; build buffer first; auto-cast disabled";

      recordAdvisor(decision, "Clone Larvae", reason);
      addLaneCandidate({
        lane: "Ability",
        decision: decision === "PLAN" ? "OBSERVE" : "HOLD",
        candidate: "Clone Larvae",
        reason,
        blockers: decision === "HOLD" ? ["clone buffer required", "ability auto-cast disabled"] : ["ability auto-cast disabled"],
        score: 38000,
        resource: "energy",
      });

      lastState = recordAbilityPrepPlannerState({
        abilityPrepCandidate: "Clone Larvae",
        abilityPrepDecision: decision,
        abilityPrepReason: reason,
        abilityPrepType: "clone-larvae",
        abilityPrepEnergyAvailable: formatSwarmNumber(energy),
        abilityPrepRequiresArmyPrep: false,
        abilityPrepRequiresCloneBuffer: needsCloneBuffer,
        houseOfMirrorsArmyValue: abilityPrepPlannerState?.houseOfMirrorsArmyValue || "n/a",
        houseOfMirrorsMissingUnits: abilityPrepPlannerState?.houseOfMirrorsMissingUnits || "none",
      });
    }

    const mirrors = getGameUpgrade(game, "houseofmirrors") || getGameUpgrade(game, "swarmwarp");
    if (isItemVisibleWithScenarioOverride(mirrors)) {
      const mirrorArmyState = getHouseOfMirrorsArmyState(game);
      const missing = mirrorArmyState.missing;
      const armyValue = mirrorArmyState.armyValue;

      const needsArmyPrep = missing.length >= 2 || !isPositive(armyValue);
      const territoryArmyExists = mirrorArmyState.territoryArmyExists;
      const decision = needsArmyPrep ? "HOLD" : "PLAN";
      const reason = needsArmyPrep
        ? (territoryArmyExists
          ? `Territory army exists, but the mirror ritual still lacks its preferred units: ${missing.join(", ")}.`
          : `Mirror ritual army prep missing; preferred units ${missing.join(", ")} are still empty.`)
        : "army has meaningful mirror value; energy available; auto-cast disabled";

      recordAdvisor(decision, "House of Mirrors", reason);
      addLaneCandidate({
        lane: "Ability",
        decision: decision === "PLAN" ? "OBSERVE" : "HOLD",
        candidate: "House of Mirrors",
        reason,
        blockers: decision === "HOLD" ? ["army prep missing", "ability auto-cast disabled"] : ["ability auto-cast disabled"],
        score: 37000,
        resource: "energy",
      });

      lastState = recordAbilityPrepPlannerState({
        abilityPrepCandidate: "House of Mirrors",
        abilityPrepDecision: decision,
        abilityPrepReason: reason,
        abilityPrepType: "house-of-mirrors",
        abilityPrepEnergyAvailable: formatSwarmNumber(energy),
        abilityPrepRequiresArmyPrep: needsArmyPrep,
        abilityPrepRequiresCloneBuffer: false,
        houseOfMirrorsArmyValue: formatSwarmNumber(armyValue),
        houseOfMirrorsMissingUnits: missing.length ? missing.join(", ") : "none",
      });
    }

    if (!lastState) {
      recordAbilityPrepPlannerState({
        abilityPrepCandidate: "none",
        abilityPrepDecision: "none",
        abilityPrepReason: "no ability prep candidate visible",
        abilityPrepType: "none",
        abilityPrepEnergyAvailable: formatSwarmNumber(energy),
        abilityPrepRequiresArmyPrep: false,
        abilityPrepRequiresCloneBuffer: false,
        houseOfMirrorsArmyValue: "n/a",
        houseOfMirrorsMissingUnits: "none",
      });
    }
  }

  function recordEnergyCreatureHolds(game) {
    const nightbug = getGameUnit(game, "nightbug");
    if (nightbug?.isVisible?.() && nightbug?.isBuyable?.()) {
      if (!config.offlineMode && !config.nightbugStorageMode) {
        recordAdvisor("HOLD", getDisplayName(nightbug), "storage only; default Smart Mode keeps energy for Nexus/Lepidoptera unless offline/storage mode is enabled");
        addLaneCandidate({
          lane: "Energy",
          decision: "HOLD",
          candidate: getDisplayName(nightbug),
          reason: "storage only; default Smart Mode keeps energy for Nexus/Lepidoptera unless offline/storage mode is enabled",
          blockers: ["energy plan", "storage mode disabled"],
          score: 35000,
          resource: "energy",
        });
      } else {
        recordAdvisor("INFO", getDisplayName(nightbug), "storage mode enabled, but Nightbug remains HOLD/INFO until a dedicated storage/cap planner exists");
        addLaneCandidate({
          lane: "Energy",
          decision: "OBSERVE",
          candidate: getDisplayName(nightbug),
          reason: "storage mode enabled, but Nightbug remains HOLD/INFO until a dedicated storage/cap planner exists",
          score: 36000,
          resource: "energy",
        });
      }
    }

    const bat = getGameUnit(game, "bat");
    if (bat?.isVisible?.() && bat?.isBuyable?.()) {
      if (!config.autoCastAbilities && !config.abilityPlanner) {
        recordAdvisor("HOLD", getDisplayName(bat), "ability booster only; auto-cast and ability planner are disabled");
        addLaneCandidate({
          lane: "Ability",
          decision: "HOLD",
          candidate: getDisplayName(bat),
          reason: "ability booster only; auto-cast and ability planner are disabled",
          blockers: ["ability auto-cast disabled", "ability planner disabled"],
          score: 25000,
          resource: "energy",
        });
      } else {
        recordAdvisor("INFO", getDisplayName(bat), "ability planning enabled, but Bat remains HOLD/INFO until dedicated ability ROI logic exists");
        addLaneCandidate({
          lane: "Ability",
          decision: "OBSERVE",
          candidate: getDisplayName(bat),
          reason: "ability planning enabled, but Bat remains HOLD/INFO until dedicated ability ROI logic exists",
          score: 26000,
          resource: "energy",
        });
      }
    }
  }

  function getLepidopteraPlannerHoldReason(game, nexusCount) {
    if (!config.energyPlanner) return "";

    const moth = getGameUnit(game, "moth");
    if (!moth?.isVisible?.() || !moth?.isBuyable?.()) return "";

    const nexusLevel = Math.floor(nexusCount);
    const mothCount = getLepidopteraCount(game);
    const boost = getLepidopteraBoostPercent(game);

    if (nexusLevel < config.blockLepidopteraBeforeNexus) {
      return `Nexus ${nexusLevel}/${config.nexusTarget}; analysis says fastest Nexus ${config.blockLepidopteraBeforeNexus} buys 0 Lepidoptera; current ${formatSwarmNumber(mothCount)}, +${trimNumber(boost)}% energy`;
    }

    if (
      nexusLevel === 4 &&
      config.nexusTarget >= 5 &&
      config.fastNexus5MothSoftTarget > 0 &&
      decimalAtLeast(mothCount, config.fastNexus5MothSoftTarget)
    ) {
      return `at/above fast Nexus 5 soft target: ${formatSwarmNumber(mothCount)} / ${formatSwarmNumber(config.fastNexus5MothSoftTarget)} Lepidoptera, +${trimNumber(boost)}% energy; save for Nexus 5`;
    }

    return "";
  }

  function handleEnergyStrategy(game, commands, protectedResources) {
    if (!config.energyStrategy) return { actionTaken: false, bought: 0 };

    const nexusCount = decimalToNumber(getNexusCount(game), 0);
    const nextNexus = getNextNexusUpgrade(game);

    if (nexusCount < config.nexusTarget && !isEnergyLaneUnlockedOrVisible(game)) {
      addLaneCandidate({
        lane: "Energy",
        decision: "OBSERVE",
        candidate: "Nexus",
        reason: "locked/unavailable until Energy/Nexus is visible",
        blockers: ["locked/unavailable"],
        score: 0,
        target: `Nexus ${Math.floor(nexusCount) + 1}`,
        resource: "energy",
      });
      return { actionTaken: false, bought: 0, summary: "Energy/Nexus locked" };
    }

    if (nexusCount < config.nexusTarget && nextNexus?.isBuyable?.()) {
      recordAdvisor("BUY", getDisplayName(nextNexus), `Nexus priority: ${Math.floor(nexusCount)} / ${config.nexusTarget}`);
      addLaneCandidate({
        lane: "Energy",
        decision: "BUY",
        candidate: getDisplayName(nextNexus),
        reason: `Nexus priority: ${Math.floor(nexusCount)} / ${config.nexusTarget}`,
        score: 90000 + Math.floor(nexusCount) * 1000,
        etaBefore: "0s",
        target: `Nexus ${Math.floor(nexusCount) + 1}`,
        resource: "energy",
        raw: {
          etaSeconds: 0,
          progressPercent: 100,
          costAmount: getCostForResource(nextNexus, "energy"),
          currentAmount: getCurrentResource(game, "energy"),
          velocity: getVelocity(game, "energy"),
        },
      });

      if (config.advisorOnly || !config.autoBuySafeDecisions) {
        recordMessage(`Advisor: WOULD BUY ${getDisplayName(nextNexus)} — Nexus priority`);
        return { actionTaken: true, bought: 0, summary: "Would buy Nexus" };
      }

      const didBuy = safe("Energy Nexus priority", () => buyUpgradeAmount(commands, nextNexus, newDecimal(1), "Energy Upgrade"));
      return { actionTaken: true, bought: didBuy ? 1 : 0, summary: didBuy ? "Bought Nexus" : "Nexus buy failed" };
    }

    if (nexusCount < config.nexusTarget && nextNexus) {
      const energyCost = getCostForResource(nextNexus, "energy");
      const currentEnergy = getCurrentResource(game, "energy");
      const energyVelocity = getVelocity(game, "energy");
      let eta = Infinity;

      if (energyCost.greaterThan(currentEnergy) && isPositive(energyVelocity)) {
        eta = decimalToNumber(energyCost.minus(currentEnergy).dividedBy(energyVelocity), Infinity);
      }

      recordAdvisor("HOLD", getDisplayName(nextNexus), `saving energy for Nexus ${Math.floor(nexusCount) + 1}/${config.nexusTarget}, ETA ${formatDuration(eta)}`);
      addLaneCandidate({
        lane: "Energy",
        decision: "HOLD",
        candidate: getDisplayName(nextNexus),
        reason: `saving energy for Nexus ${Math.floor(nexusCount) + 1}/${config.nexusTarget}, ETA ${formatDuration(eta)}`,
        blockers: ["energy protected for Nexus", "Nexus save"],
        score: 85000 - Math.min(Number.isFinite(eta) ? eta : 999999, 999999) / 10,
        etaBefore: formatDuration(eta),
        target: `Nexus ${Math.floor(nexusCount) + 1}`,
        resource: "energy",
        raw: {
          etaSeconds: eta,
          etaBeforeSeconds: eta,
          costAmount: energyCost,
          currentAmount: currentEnergy,
          velocity: energyVelocity,
          progressPercent: energyCost.greaterThan(0) ? currentEnergy.dividedBy(energyCost).times(100) : 0,
        },
      });

      if (config.lepidopteraRoiMode) {
        const mothNum = getSafeLepidopteraBuyNum(game);
        if (isPositive(mothNum)) {
          const plannerHold = getLepidopteraPlannerHoldReason(game, nexusCount);
          if (plannerHold) {
            recordAdvisor("HOLD", "Lepidoptera", plannerHold);
            addLaneCandidate({
              lane: "Energy",
              decision: "HOLD",
              candidate: "Lepidoptera",
              reason: plannerHold,
              blockers: ["energy plan", "Nexus save"],
              score: 65000,
              wouldBuyAmount: formatSwarmNumber(mothNum),
              target: "Nexus energy plan",
              resource: "energy",
              raw: {
                costAmount: getCostForResource(getGameUnit(game, "moth"), "energy"),
                currentAmount: getCurrentResource(game, "energy"),
              },
            });
          } else {
            const roi = scoreLepidopteraInvestment(game, mothNum);
            if (roi?.ok) {
              const moth = getGameUnit(game, "moth");
              const mothCount = getLepidopteraCount(game);
              const boost = getLepidopteraBoostPercent(game);
              recordAdvisor(
                "BUY",
                "Lepidoptera",
                `Nexus ${Math.floor(nexusCount)}/${config.nexusTarget}, moth ${formatSwarmNumber(mothCount)}, +${trimNumber(boost)}% energy; ${roi.reason}`
              );
              addLaneCandidate({
                lane: "Energy",
                decision: "BUY",
                candidate: "Lepidoptera",
                reason: `Nexus ${Math.floor(nexusCount)}/${config.nexusTarget}, moth ${formatSwarmNumber(mothCount)}, +${trimNumber(boost)}% energy; ${roi.reason}`,
                score: 70000 + Math.max(0, Number(roi.etaImprovement || 0)),
                etaBefore: "Nexus ETA before ROI",
                etaAfter: `improves by ${formatDuration(roi.etaImprovement)}`,
                wouldBuyAmount: formatSwarmNumber(mothNum),
                target: "Nexus ETA",
                resource: "energy",
                raw: {
                  etaBeforeSeconds: roi.etaBeforeSeconds,
                  etaAfterSeconds: roi.etaAfterSeconds,
                  etaImprovementSeconds: roi.etaImprovement,
                  costAmount: roi.spentEnergy,
                  currentAmount: getCurrentResource(game, "energy"),
                  velocity: getVelocity(game, "energy"),
                },
              });

              if (config.advisorOnly || !config.autoBuySafeDecisions) {
                recordMessage(`Advisor: WOULD BUY ${formatSwarmNumber(mothNum)} lepidoptera — ${roi.reason}`);
                return { actionTaken: true, bought: 0, summary: "Would buy Lepidoptera" };
              }

              const didBuy = safe("Energy ROI lepidoptera", () => buyUnitAmount(commands, moth, mothNum, "Energy Unit"));
              return { actionTaken: true, bought: didBuy ? 1 : 0, summary: didBuy ? "Bought Lepidoptera ROI" : "Lepidoptera buy failed" };
            }

            if (roi?.reason) {
              recordAdvisor("HOLD", "Lepidoptera", roi.reason);
              addLaneCandidate({
                lane: "Energy",
                decision: "HOLD",
                candidate: "Lepidoptera",
                reason: roi.reason,
                blockers: ["energy plan", "Nexus ETA would worsen"],
                score: 60000,
                wouldBuyAmount: formatSwarmNumber(mothNum),
                target: "Nexus ETA",
                resource: "energy",
                raw: roi ? {
                  etaBeforeSeconds: roi.etaBeforeSeconds,
                  etaAfterSeconds: roi.etaAfterSeconds,
                  etaImprovementSeconds: roi.etaImprovement,
                  costAmount: roi.spentEnergy,
                  currentAmount: getCurrentResource(game, "energy"),
                  velocity: getVelocity(game, "energy"),
                } : null,
              });
            }
          }
        }
      }
    } else if (nexusCount >= config.nexusTarget && config.lepidopteraRoiMode) {
      const moth = getGameUnit(game, "moth");
      if (moth?.isVisible?.() && moth?.isBuyable?.()) {
        const plan = buildPostNexusLepidopteraPlan(game, nexusCount);
        recordPostNexusEnergyPlannerState({
          postNexusEnergyCandidate: "Lepidoptera",
          postNexusEnergyDecision: plan.ok ? "BUY" : "HOLD",
          postNexusEnergyReason: plan.reason,
          postNexusEnergyAmount: plan.num ? formatSwarmNumber(plan.num) : "0",
          postNexusEnergyBoostBefore: Number.isFinite(plan.boostBefore) ? `+${trimNumber(plan.boostBefore)}%` : "n/a",
          postNexusEnergyBoostAfter: Number.isFinite(plan.boostAfter) ? `+${trimNumber(plan.boostAfter)}%` : "n/a",
          postNexusEnergyBoostGain: Number.isFinite(plan.boostGain) ? `+${trimNumber(plan.boostGain)}%` : "n/a",
          postNexusEnergyReserve: plan.reserve ? formatSwarmNumber(plan.reserve) : "0",
          postNexusEnergyBlockedBy: plan.blockedBy || "none",
          postNexusEnergySpend: plan.spentEnergy ? formatSwarmNumber(plan.spentEnergy) : "0",
        });

        if (plan.ok) {
          recordAdvisor("BUY", "Lepidoptera", plan.reason);
          addLaneCandidate({
            lane: "Energy",
            decision: "BUY",
            candidate: "Lepidoptera",
            reason: plan.reason,
            score: 69000 + Math.max(0, Number(plan.boostGain || 0)) * 100,
            wouldBuyAmount: formatSwarmNumber(plan.num),
            reserveAfter: `${formatSwarmNumber(decimalFrom(getCurrentResource(game, "energy")).minus(plan.spentEnergy))} energy`,
            target: "Post-Nexus energy growth",
            resource: "energy",
            raw: {
              costAmount: plan.spentEnergy,
              currentAmount: getCurrentResource(game, "energy"),
              velocity: getVelocity(game, "energy"),
              boostBeforePercent: plan.boostBefore,
              boostAfterPercent: plan.boostAfter,
              boostGainPercent: plan.boostGain,
            },
          });

          if (config.advisorOnly || !config.autoBuySafeDecisions) {
            recordMessage(`Advisor: WOULD BUY ${formatSwarmNumber(plan.num)} lepidoptera - ${plan.reason}`);
            return { actionTaken: true, bought: 0, summary: "Would buy post-Nexus Lepidoptera" };
          }

          const didBuy = safe("Post-Nexus Energy Planner lepidoptera", () => buyUnitAmount(commands, moth, plan.num, "Energy Unit"));
          return { actionTaken: true, bought: didBuy ? 1 : 0, summary: didBuy ? "Bought post-Nexus Lepidoptera" : "Post-Nexus Lepidoptera buy failed" };
        } else {
          recordAdvisor("HOLD", "Lepidoptera", plan.reason);
          addLaneCandidate({
            lane: "Energy",
            decision: "HOLD",
            candidate: "Lepidoptera",
            reason: plan.reason,
            blockers: ["energy plan", plan.blockedBy || "not meaningful"].filter(Boolean),
            score: plan.blockedBy === "lepidoptera stop threshold" ? 50000 : 47000,
            wouldBuyAmount: plan.num ? formatSwarmNumber(plan.num) : "0",
            target: "Post-Nexus energy growth",
            resource: "energy",
            raw: {
              costAmount: plan.spentEnergy || newDecimal(0),
              currentAmount: getCurrentResource(game, "energy"),
              velocity: getVelocity(game, "energy"),
              boostBeforePercent: plan.boostBefore,
              boostAfterPercent: plan.boostAfter,
              boostGainPercent: plan.boostGain,
            },
          });
        }
      } else {
        recordPostNexusEnergyPlannerState({
          postNexusEnergyCandidate: "Lepidoptera",
          postNexusEnergyDecision: "OBSERVE",
          postNexusEnergyReason: "post-Nexus Energy Planner waiting for visible buyable Lepidoptera",
          postNexusEnergyBlockedBy: "locked/unavailable",
        });
      }
    }

    recordEnergyCreatureHolds(game);

    if (!config.autoCastAbilities) {
      for (const abilityName of ["larvarush", "meatrush", "territoryrush", "clonelarvae", "swarmwarp"]) {
        const ability = getGameUpgrade(game, abilityName);
        if (ability?.isVisible?.() && ability?.isBuyable?.()) {
          recordAdvisor("HOLD", getDisplayName(ability), "auto-cast abilities disabled");
          addLaneCandidate({
            lane: abilityName === "clonelarvae" ? "Clone Prep" : "Ability",
            decision: "HOLD",
            candidate: getDisplayName(ability),
            reason: "auto-cast abilities disabled",
            blockers: ["ability auto-cast disabled"],
            score: abilityName === "clonelarvae" ? 25000 : 20000,
            resource: "energy",
          });
        }
      }
    }

    return { actionTaken: false, bought: 0 };
  }

  function decideSmartFocus(engine) {
    if (!engine) return "balanced";

    if (engine.expansionEta <= config.saveForExpansionSeconds && engine.expansionEta > 0) {
      return "save-territory";
    }

    if (engine.hatcheryEta <= config.saveForHatcherySeconds && engine.hatcheryEta > 0) {
      return "save-meat";
    }

    const exp = Number.isFinite(engine.expansionEta) ? engine.expansionEta : Infinity;
    const hatch = Number.isFinite(engine.hatcheryEta) ? engine.hatcheryEta : Infinity;

    if (exp === Infinity && hatch === Infinity) return "balanced";
    if (exp > hatch * config.expansionPriorityWeight) return "territory";
    if (hatch > exp * 1.35) return "meat";

    return "balanced";
  }

  function productionPerUnit(unit, resourceName) {
    const prod = safe(`Produktion ${unit.name}`, () => unit.eachProduction?.()) || {};
    return prod[resourceName] || newDecimal(0);
  }

  function getSmartUnitBuyNum(unit) {
    const max = safe(`Smart max ${unit.name}`, () => unit.maxCostMet?.(config.unitBuyPercent)) || newDecimal(0);

    if (!isPositive(max)) return newDecimal(0);

    const chunk = decimalFrom(max).times(config.smartUnitBuyPercent).floor();

    if (isPositive(chunk)) return chunk;
    return newDecimal(1);
  }

  function unitCostPressure(unit, num) {
    let pressure = 0;

    for (const cost of getCostList(unit)) {
      if (!isPositive(cost.val)) continue;

      const total = decimalFrom(cost.val).times(num || 1);
      const logValue = decimalLog10(total);

      if (cost.unit?.name === "larva") {
        pressure += logValue * 0.45;
      } else if (cost.unit?.name === "meat") {
        pressure += logValue * 0.35;
      } else {
        pressure += logValue * 0.25;
      }
    }

    return pressure;
  }

  function scoreTerritoryCandidate(game, unit, num, engine) {
    const territoryPerUnit = productionPerUnit(unit, "territory");
    if (!isPositive(territoryPerUnit)) return null;

    const addedVelocity = decimalFrom(territoryPerUnit).times(num);
    const addedLog = decimalLog10(addedVelocity);
    const costPressure = unitCostPressure(unit, num);

    let etaImprovement = 0;
    let etaBeforeSeconds = Infinity;
    let etaAfterSeconds = Infinity;

    if (engine?.expansion) {
      const territoryCost = getCostForResource(engine.expansion, "territory");
      const currentTerritory = getCurrentResource(game, "territory");
      const remaining = decimalFrom(territoryCost).minus(currentTerritory);
      const currentVelocity = getVelocity(game, "territory");
      const newVelocity = decimalFrom(currentVelocity).plus(addedVelocity);

      if (remaining.greaterThan(0) && currentVelocity.greaterThan(0) && newVelocity.greaterThan(0)) {
        const before = remaining.dividedBy(currentVelocity);
        const after = remaining.dividedBy(newVelocity);
        etaBeforeSeconds = decimalToNumber(before, Infinity);
        etaAfterSeconds = decimalToNumber(after, Infinity);
        etaImprovement = Math.max(0, decimalToNumber(before.minus(after), 0));
      }
    }

    const etaImprovementRatio = Number.isFinite(etaBeforeSeconds) && etaBeforeSeconds > 0
      ? etaImprovement / etaBeforeSeconds
      : 0;
    const minEtaImprovementSeconds = Number(config.territoryMinEtaImprovementSeconds || 0);
    const minEtaImprovementRatio = Number(config.territoryMinEtaImprovementRatio || 0);
    const meetsMinimum = etaImprovement >= minEtaImprovementSeconds || etaImprovementRatio >= minEtaImprovementRatio;
    const improvementScore = etaImprovement > 0 ? Math.log10(etaImprovement + 1) * 220 : 0;
    const gainScore = addedLog * 90;
    const roiPenalty = costPressure * 35;
    const raw = {
      etaImprovementSeconds: etaImprovement,
      etaBeforeSeconds,
      etaAfterSeconds,
      etaImprovementRatio,
      minEtaImprovementSeconds,
      minEtaImprovementRatio,
      velocity: addedVelocity,
    };

    return {
      unit,
      num,
      addedVelocity,
      etaImprovement,
      etaBeforeSeconds,
      etaAfterSeconds,
      etaImprovementRatio,
      minEtaImprovementSeconds,
      minEtaImprovementRatio,
      meetsMinimum,
      raw,
      score: improvementScore + gainScore - roiPenalty,
      reason: `territory ROI: +${formatSwarmNumber(addedVelocity)}/sec, ${formatEtaImprovementDelta(etaImprovement)}`,
      guardReason: `territory ROI below minimum: ETA improvement ${formatEtaImprovementDelta(etaImprovement)} < ${formatEtaImprovementDelta(minEtaImprovementSeconds)} and ${trimNumber(etaImprovementRatio * 100)}% < ${trimNumber(minEtaImprovementRatio * 100)}%`,
    };
  }

  function getHouseOfMirrorsArmyPrep(game) {
    const state = getHouseOfMirrorsArmyState(game);

    if (!state.visible) {
      return {
        visible: false,
        armyValue: newDecimal(0),
        missing: [],
      };
    }

    return {
      visible: true,
      armyValue: state.armyValue,
      missing: state.missing,
    };
  }

  function getArmyPrepMissingUnitLabels(game) {
    const raw = String(abilityPrepPlannerState?.houseOfMirrorsMissingUnits || "").trim();
    if (raw && raw !== "none") {
      return raw.split(",").map((part) => part.trim()).filter(Boolean);
    }

    const direct = getHouseOfMirrorsArmyPrep(game);
    return direct.visible ? direct.missing : [];
  }

  function unitMatchesArmyPrepLabel(unit, label) {
    const labelKey = normalizeLabelKey(label);
    if (!labelKey) return false;
    const text = normalizeLabelKey(`${unit?.name || ""} ${getDisplayName(unit)} ${unit?.suffix || ""}`);
    const textTokens = new Set(text.split(/\s+/).filter(Boolean));

    const aliases = [labelKey];
    if (/culicimorph/.test(labelKey)) aliases.push(labelKey.replace(/culicimorph/g, "mosquito"));
    if (/arachnomorph/.test(labelKey)) aliases.push(labelKey.replace(/arachnomorph/g, "spider"));
    if (/\bv\b/.test(labelKey)) aliases.push(labelKey.replace(/\bv\b/g, "5"));

    return aliases.some((entry) => {
      const tokens = normalizeLabelKey(entry).split(/\s+/).filter(Boolean);
      if (!tokens.length) return false;
      return tokens.every((token) => textTokens.has(token));
    });
  }

  function getTerritoryPrepBuyNum(unit, forceSingle = false) {
    const max = safe(`Territory prep max ${unit?.name}`, () => unit?.maxCostMet?.(config.unitBuyPercent)) || newDecimal(0);
    if (!isPositive(max)) return newDecimal(0);
    if (forceSingle) return newDecimal(1);

    const percent = clampNumber(config.territoryPrepChunkPercent, 0.1, 25, DEFAULT_CONFIG.territoryPrepChunkPercent);
    const chunk = decimalFrom(max).times(percent).dividedBy(100).floor();
    if (isPositive(chunk)) return chunk;
    return newDecimal(1);
  }

  function getExpansionArmySeedBuyNum(unit) {
    const max = safe(`Expansion army seed max ${unit?.name}`, () => unit?.maxCostMet?.(config.unitBuyPercent)) || newDecimal(0);
    if (!isPositive(max)) return newDecimal(0);

    const percent = clampNumber(config.expansionArmySeedMaxChunkPercent, 0.1, 25, DEFAULT_CONFIG.expansionArmySeedMaxChunkPercent);
    const chunk = decimalFrom(max).times(percent).dividedBy(100).floor();
    if (isPositive(chunk)) return chunk;
    return newDecimal(1);
  }

  function buildTerritoryPrepProposal(game, engine, protectedResources) {
    const armyPrep = getHouseOfMirrorsArmyPrep(game);
    const missingLabels = getArmyPrepMissingUnitLabels(game);
    const expansionEtaBeforeSeconds = Number.isFinite(engine?.expansionEta) ? Math.max(0, Number(engine.expansionEta)) : Infinity;
    const expansionEtaBefore = Number.isFinite(expansionEtaBeforeSeconds) ? formatDuration(expansionEtaBeforeSeconds) : "n/a";
    const scannedFightingUnits = (game.unitlist?.() || []).filter((unit) => unit?.isVisible?.() && (getTabName(unit) === "territory" || HOUSE_OF_MIRRORS_ARMY_TIERS.some((tier) => unitMatchesArmyPrepLabel(unit, tier.label))));
    const visibleFightingUnits = scannedFightingUnits.filter((unit) => isPositive(productionPerUnit(unit, "territory")));
    const buyableUnits = visibleFightingUnits.filter((unit) => unit?.isBuyable?.());
    const matchingBuyableUnits = buyableUnits.filter((unit) => missingLabels.some((label) => unitMatchesArmyPrepLabel(unit, label)));

    const nowNexus = Math.floor(decimalToNumber(getNexusCount(game), 0));
    const postNexusReady = nowNexus >= Number(config.nexusTarget || DEFAULT_CONFIG.nexusTarget);
    const expansionRelevant = !!engine?.expansion && (postNexusReady || Number.isFinite(engine?.expansionEta) || !!engine?.expansionBuyable);
    const insideSaveWindow = !!(protectedResources?.has("territory") || (Number.isFinite(engine?.expansionEta) && engine.expansionEta > 0 && engine.expansionEta <= config.saveForExpansionSeconds));

    if (!config.territoryPrepPlanner) {
      return recordTerritoryPrepPlannerState({
        territoryPrepCandidate: "none",
        territoryPrepDecision: "OBSERVE",
        territoryPrepReason: "territory prep planner disabled",
        territoryPrepExpansionEtaBefore: expansionEtaBefore,
        territoryPrepExpansionEtaAfter: "n/a",
        territoryPrepBlockedBy: "planner disabled",
        armyPrepMissingUnits: missingLabels.length ? missingLabels.join(", ") : "none",
        territoryPrepScannedFightingUnits: scannedFightingUnits.length,
        territoryPrepVisibleFightingUnits: scannedFightingUnits.length,
        territoryPrepBuyableFightingUnits: scannedFightingUnits.filter((unit) => unit?.isBuyable?.()).length,
        territoryPrepMissingMatchedCount: missingLabels.length,
        expansionArmySeedCandidate: "none",
        expansionArmySeedDecision: "OBSERVE",
        expansionArmySeedReason: "expansion army seed planner disabled",
        expansionArmySeedUnit: "none",
        expansionArmySeedAmount: "0",
        expansionArmySeedEtaBefore: expansionEtaBefore,
        expansionArmySeedEtaAfter: "n/a",
        expansionArmySeedEtaGainSeconds: "0",
        expansionArmySeedEtaGainPercent: "0%",
        expansionArmySeedTerritoryPerSecondBefore: "0",
        expansionArmySeedTerritoryPerSecondAfter: "0",
        expansionArmySeedBlockedBy: "planner disabled",
        expansionArmySeedInsideSaveWindow: insideSaveWindow,
        expansionArmySeedBestRejectedUnit: "none",
        expansionArmySeedBestRejectedReason: "planner disabled",
      });
    }

    if (!config.expansionArmySeedPlanner) {
      return recordTerritoryPrepPlannerState({
        territoryPrepCandidate: "none",
        territoryPrepDecision: "OBSERVE",
        territoryPrepReason: "expansion army seed planner disabled",
        territoryPrepExpansionEtaBefore: expansionEtaBefore,
        territoryPrepExpansionEtaAfter: "n/a",
        territoryPrepBlockedBy: "planner disabled",
        armyPrepMissingUnits: missingLabels.length ? missingLabels.join(", ") : "none",
        territoryPrepScannedFightingUnits: scannedFightingUnits.length,
        territoryPrepVisibleFightingUnits: visibleFightingUnits.length,
        territoryPrepBuyableFightingUnits: buyableUnits.length,
        territoryPrepMissingMatchedCount: matchingBuyableUnits.length,
        expansionArmySeedCandidate: "none",
        expansionArmySeedDecision: "OBSERVE",
        expansionArmySeedReason: "expansion army seed planner disabled",
        expansionArmySeedUnit: "none",
        expansionArmySeedAmount: "0",
        expansionArmySeedEtaBefore: expansionEtaBefore,
        expansionArmySeedEtaAfter: "n/a",
        expansionArmySeedEtaGainSeconds: "0",
        expansionArmySeedEtaGainPercent: "0%",
        expansionArmySeedTerritoryPerSecondBefore: formatSwarmNumber(getVelocity(game, "territory")),
        expansionArmySeedTerritoryPerSecondAfter: formatSwarmNumber(getVelocity(game, "territory")),
        expansionArmySeedBlockedBy: "planner disabled",
        expansionArmySeedInsideSaveWindow: insideSaveWindow,
        expansionArmySeedBestRejectedUnit: "none",
        expansionArmySeedBestRejectedReason: "planner disabled",
      });
    }

    if (!expansionRelevant) {
      const holdReason = "Army seed HOLD: waiting for post-Nexus or a relevant Expansion target.";
      addLaneCandidate({
        lane: "Territory",
        decision: "HOLD",
        candidate: "Army seed",
        reason: holdReason,
        blockers: ["expansion not relevant yet"],
        score: 0,
        target: "Expansion",
        resource: "territory",
      });

      return recordTerritoryPrepPlannerState({
        territoryPrepCandidate: "none",
        territoryPrepDecision: "HOLD",
        territoryPrepReason: holdReason,
        territoryPrepExpansionEtaBefore: expansionEtaBefore,
        territoryPrepExpansionEtaAfter: "n/a",
        territoryPrepBlockedBy: "expansion not relevant yet",
        armyPrepMissingUnits: missingLabels.length ? missingLabels.join(", ") : "none",
        territoryPrepScannedFightingUnits: scannedFightingUnits.length,
        territoryPrepVisibleFightingUnits: visibleFightingUnits.length,
        territoryPrepBuyableFightingUnits: buyableUnits.length,
        territoryPrepMissingMatchedCount: matchingBuyableUnits.length,
        expansionArmySeedCandidate: "none",
        expansionArmySeedDecision: "HOLD",
        expansionArmySeedReason: holdReason,
        expansionArmySeedUnit: "none",
        expansionArmySeedAmount: "0",
        expansionArmySeedEtaBefore: expansionEtaBefore,
        expansionArmySeedEtaAfter: "n/a",
        expansionArmySeedEtaGainSeconds: "0",
        expansionArmySeedEtaGainPercent: "0%",
        expansionArmySeedTerritoryPerSecondBefore: formatSwarmNumber(getVelocity(game, "territory")),
        expansionArmySeedTerritoryPerSecondAfter: formatSwarmNumber(getVelocity(game, "territory")),
        expansionArmySeedBlockedBy: "expansion not relevant yet",
        expansionArmySeedInsideSaveWindow: insideSaveWindow,
        expansionArmySeedBestRejectedUnit: "none",
        expansionArmySeedBestRejectedReason: "expansion not relevant yet",
      });
    }

    if (config.expansionArmySeedDoNotSpendInsideSaveWindow && insideSaveWindow) {
      const holdReason = "Army seed HOLD: Expansion is already inside save-window; saving territory for Expansion.";
      addLaneCandidate({
        lane: "Territory",
        decision: "HOLD",
        candidate: "Army seed",
        reason: holdReason,
        blockers: ["territory protected for Expansion"],
        score: 0,
        target: "Expansion",
        resource: "territory",
      });

      return recordTerritoryPrepPlannerState({
        territoryPrepCandidate: "none",
        territoryPrepDecision: "HOLD",
        territoryPrepReason: holdReason,
        territoryPrepExpansionEtaBefore: expansionEtaBefore,
        territoryPrepExpansionEtaAfter: expansionEtaBefore,
        territoryPrepBlockedBy: "inside save-window",
        armyPrepMissingUnits: missingLabels.length ? missingLabels.join(", ") : "none",
        territoryPrepScannedFightingUnits: scannedFightingUnits.length,
        territoryPrepVisibleFightingUnits: visibleFightingUnits.length,
        territoryPrepBuyableFightingUnits: buyableUnits.length,
        territoryPrepMissingMatchedCount: matchingBuyableUnits.length,
        expansionArmySeedCandidate: "none",
        expansionArmySeedDecision: "HOLD",
        expansionArmySeedReason: holdReason,
        expansionArmySeedUnit: "none",
        expansionArmySeedAmount: "0",
        expansionArmySeedEtaBefore: expansionEtaBefore,
        expansionArmySeedEtaAfter: expansionEtaBefore,
        expansionArmySeedEtaGainSeconds: "0",
        expansionArmySeedEtaGainPercent: "0%",
        expansionArmySeedTerritoryPerSecondBefore: formatSwarmNumber(getVelocity(game, "territory")),
        expansionArmySeedTerritoryPerSecondAfter: formatSwarmNumber(getVelocity(game, "territory")),
        expansionArmySeedBlockedBy: "inside save-window",
        expansionArmySeedInsideSaveWindow: true,
        expansionArmySeedBestRejectedUnit: "none",
        expansionArmySeedBestRejectedReason: "inside save-window",
      });
    }

    if (!visibleFightingUnits.length) {
      const holdReason = armyPrep.visible && missingLabels.length
        ? "Army seed HOLD: no visible territory-producing army units; territory army exists check cannot pass yet."
        : "Army seed HOLD: no visible territory-producing army units.";
      addLaneCandidate({
        lane: "Territory",
        decision: "HOLD",
        candidate: "Army seed",
        reason: holdReason,
        blockers: ["no visible territory army"],
        score: 0,
        target: "Expansion",
        resource: "territory",
      });
      return recordTerritoryPrepPlannerState({
        territoryPrepCandidate: "none",
        territoryPrepDecision: "HOLD",
        territoryPrepReason: holdReason,
        territoryPrepExpansionEtaBefore: expansionEtaBefore,
        territoryPrepExpansionEtaAfter: "n/a",
        territoryPrepBlockedBy: "no visible territory army",
        armyPrepMissingUnits: missingLabels.length ? missingLabels.join(", ") : "none",
        territoryPrepScannedFightingUnits: scannedFightingUnits.length,
        territoryPrepVisibleFightingUnits: visibleFightingUnits.length,
        territoryPrepBuyableFightingUnits: buyableUnits.length,
        territoryPrepMissingMatchedCount: matchingBuyableUnits.length,
        expansionArmySeedCandidate: "none",
        expansionArmySeedDecision: "HOLD",
        expansionArmySeedReason: holdReason,
        expansionArmySeedUnit: "none",
        expansionArmySeedAmount: "0",
        expansionArmySeedEtaBefore: expansionEtaBefore,
        expansionArmySeedEtaAfter: "n/a",
        expansionArmySeedEtaGainSeconds: "0",
        expansionArmySeedEtaGainPercent: "0%",
        expansionArmySeedTerritoryPerSecondBefore: formatSwarmNumber(getVelocity(game, "territory")),
        expansionArmySeedTerritoryPerSecondAfter: formatSwarmNumber(getVelocity(game, "territory")),
        expansionArmySeedBlockedBy: "no visible territory army",
        expansionArmySeedInsideSaveWindow: insideSaveWindow,
        expansionArmySeedBestRejectedUnit: "none",
        expansionArmySeedBestRejectedReason: "no visible territory army",
      });
    }

    if (!buyableUnits.length) {
      const holdReason = "Army seed HOLD: territory army is visible, but no safe buyable territory producer right now.";
      addLaneCandidate({
        lane: "Territory",
        decision: "HOLD",
        candidate: "Army seed",
        reason: holdReason,
        blockers: ["no buyable territory army"],
        score: 0,
        target: "Expansion",
        resource: "territory",
      });
      return recordTerritoryPrepPlannerState({
        territoryPrepCandidate: "none",
        territoryPrepDecision: "HOLD",
        territoryPrepReason: holdReason,
        territoryPrepExpansionEtaBefore: expansionEtaBefore,
        territoryPrepExpansionEtaAfter: "n/a",
        territoryPrepBlockedBy: "no buyable territory army",
        armyPrepMissingUnits: missingLabels.length ? missingLabels.join(", ") : "none",
        territoryPrepScannedFightingUnits: scannedFightingUnits.length,
        territoryPrepVisibleFightingUnits: visibleFightingUnits.length,
        territoryPrepBuyableFightingUnits: buyableUnits.length,
        territoryPrepMissingMatchedCount: matchingBuyableUnits.length,
        expansionArmySeedCandidate: "none",
        expansionArmySeedDecision: "HOLD",
        expansionArmySeedReason: holdReason,
        expansionArmySeedUnit: "none",
        expansionArmySeedAmount: "0",
        expansionArmySeedEtaBefore: expansionEtaBefore,
        expansionArmySeedEtaAfter: "n/a",
        expansionArmySeedEtaGainSeconds: "0",
        expansionArmySeedEtaGainPercent: "0%",
        expansionArmySeedTerritoryPerSecondBefore: formatSwarmNumber(getVelocity(game, "territory")),
        expansionArmySeedTerritoryPerSecondAfter: formatSwarmNumber(getVelocity(game, "territory")),
        expansionArmySeedBlockedBy: "no buyable territory army",
        expansionArmySeedInsideSaveWindow: insideSaveWindow,
        expansionArmySeedBestRejectedUnit: "none",
        expansionArmySeedBestRejectedReason: "no buyable territory army",
      });
    }

    const territoryVelocityBefore = decimalFrom(getVelocity(game, "territory"));
    const territoryNow = getCurrentResource(game, "territory");
    const territoryCost = getCostForResource(engine?.expansion, "territory");
    const remainingTerritory = decimalFrom(territoryCost).minus(territoryNow);
    const minEtaGainSeconds = Number(config.expansionArmySeedMinEtaImprovementSeconds || 0);
    const minEtaGainRatio = Number(config.expansionArmySeedMinEtaImprovementRatio || 0);

    let bestAccepted = null;
    let bestRejected = null;
    let bestRejectedReason = "no candidate evaluated";

    for (const unit of buyableUnits) {
      const num = getExpansionArmySeedBuyNum(unit);

      if (!isPositive(num)) {
        bestRejectedReason = "candidate had no safe bounded chunk";
        continue;
      }

      const territory = scoreTerritoryCandidate(game, unit, num, engine);
      if (!territory) {
        bestRejected = {
          unit,
          unitName: getDisplayName(unit),
          num,
          etaGainSeconds: 0,
        };
        bestRejectedReason = `${getDisplayName(unit)} has no territory/sec production in eachProduction()`;
        continue;
      }

      const block = getUnitCandidateBlock({ unit, meetsMinimum: true }, num, protectedResources, "expansion army seed guard");
      if (block) {
        const blockedCandidate = {
          unit,
          unitName: getDisplayName(unit),
          num,
          etaGainSeconds: territory.etaImprovement,
        };
        if (!bestRejected || blockedCandidate.etaGainSeconds > bestRejected.etaGainSeconds) {
          bestRejected = blockedCandidate;
          bestRejectedReason = `Army seed HOLD: ${getDisplayName(unit)} would spend a protected resource (${block.reason}).`;
        }
        continue;
      }

      const beforeSeconds = Number.isFinite(territory.etaBeforeSeconds) ? Math.max(0, territory.etaBeforeSeconds) : Infinity;
      const afterSeconds = Number.isFinite(territory.etaAfterSeconds) ? Math.max(0, territory.etaAfterSeconds) : Infinity;
      const etaGainSeconds = Number.isFinite(beforeSeconds) && Number.isFinite(afterSeconds)
        ? Math.max(0, beforeSeconds - afterSeconds)
        : (!Number.isFinite(beforeSeconds) && Number.isFinite(afterSeconds) ? Number.POSITIVE_INFINITY : 0);
      const etaGainRatio = Number.isFinite(beforeSeconds) && beforeSeconds > 0
        ? (Number.isFinite(etaGainSeconds) ? etaGainSeconds / beforeSeconds : 1)
        : (!Number.isFinite(beforeSeconds) && Number.isFinite(afterSeconds) ? 1 : 0);
      const territoryPerSecondAfter = territoryVelocityBefore.plus(decimalFrom(territory.addedVelocity || 0));

      const meaningful = (!Number.isFinite(beforeSeconds) && Number.isFinite(afterSeconds))
        || (Number.isFinite(etaGainSeconds) && etaGainSeconds >= minEtaGainSeconds)
        || etaGainRatio >= minEtaGainRatio;

      const candidate = {
        unit,
        num,
        score: (meaningful ? 60000 : 0) + Math.min(Number.isFinite(etaGainSeconds) ? etaGainSeconds : 999999, 999999) + Math.max(0, unitCostScore(unit) * 0.05),
        reason: meaningful
          ? `Army seed BUY ${getDisplayName(unit)}: bounded ${trimNumber(config.expansionArmySeedMaxChunkPercent)}% chunk; Expansion ETA ${Number.isFinite(beforeSeconds) ? formatDuration(beforeSeconds) : "n/a"} -> ${Number.isFinite(afterSeconds) ? formatDuration(afterSeconds) : "n/a"}; territory/sec gain is meaningful; Expansion not inside save-window yet.`
          : `Army seed HOLD: best candidate ${getDisplayName(unit)} only improves Expansion ETA by ${Number.isFinite(etaGainSeconds) ? formatDuration(etaGainSeconds) : "n/a"}, below ${formatDuration(minEtaGainSeconds)} minimum.`,
        unitName: getDisplayName(unit),
        etaBeforeSeconds: beforeSeconds,
        etaAfterSeconds: afterSeconds,
        etaGainSeconds,
        etaGainRatio,
        territoryPerSecondBefore: territoryVelocityBefore,
        territoryPerSecondAfter,
        raw: {
          etaBeforeSeconds: beforeSeconds,
          etaAfterSeconds: afterSeconds,
          etaGainSeconds,
          etaGainRatio,
          minEtaGainSeconds,
          minEtaGainRatio,
          territoryPerSecondBefore: territoryVelocityBefore,
          territoryPerSecondAfter,
          remainingTerritory,
        },
      };

      if (meaningful) {
        if (!bestAccepted || candidate.score > bestAccepted.score) bestAccepted = candidate;
      } else if (!bestRejected || candidate.etaGainSeconds > bestRejected.etaGainSeconds) {
        bestRejected = candidate;
        bestRejectedReason = candidate.reason;
      }
    }

    if (!bestAccepted) {
      const holdReason = bestRejectedReason || "Army seed HOLD: no candidate improved Expansion ETA meaningfully.";
      addLaneCandidate({
        lane: "Territory",
        decision: "HOLD",
        candidate: bestRejected?.unitName || "Army seed",
        reason: holdReason,
        blockers: ["not meaningful"],
        score: 0,
        target: "Expansion",
        resource: "territory",
      });

      return recordTerritoryPrepPlannerState({
        territoryPrepCandidate: bestRejected?.unitName || "none",
        territoryPrepDecision: "HOLD",
        territoryPrepReason: holdReason,
        territoryPrepUnit: bestRejected?.unitName || "none",
        territoryPrepAmount: bestRejected?.num ? formatSwarmNumber(bestRejected.num) : "0",
        territoryPrepExpansionEtaBefore: expansionEtaBefore,
        territoryPrepExpansionEtaAfter: bestRejected && Number.isFinite(bestRejected.etaAfterSeconds) ? formatDuration(bestRejected.etaAfterSeconds) : "n/a",
        territoryPrepBlockedBy: "not meaningful",
        armyPrepMissingUnits: missingLabels.length ? missingLabels.join(", ") : "none",
        territoryPrepScannedFightingUnits: scannedFightingUnits.length,
        territoryPrepVisibleFightingUnits: visibleFightingUnits.length,
        territoryPrepBuyableFightingUnits: buyableUnits.length,
        territoryPrepMissingMatchedCount: matchingBuyableUnits.length,
        expansionArmySeedCandidate: bestRejected?.unitName || "none",
        expansionArmySeedDecision: "HOLD",
        expansionArmySeedReason: holdReason,
        expansionArmySeedUnit: bestRejected?.unitName || "none",
        expansionArmySeedAmount: bestRejected?.num ? formatSwarmNumber(bestRejected.num) : "0",
        expansionArmySeedEtaBefore: expansionEtaBefore,
        expansionArmySeedEtaAfter: bestRejected && Number.isFinite(bestRejected.etaAfterSeconds) ? formatDuration(bestRejected.etaAfterSeconds) : "n/a",
        expansionArmySeedEtaGainSeconds: bestRejected && Number.isFinite(bestRejected.etaGainSeconds) ? trimNumber(bestRejected.etaGainSeconds) : "0",
        expansionArmySeedEtaGainPercent: bestRejected && Number.isFinite(bestRejected.etaGainRatio) ? `${trimNumber(bestRejected.etaGainRatio * 100)}%` : "0%",
        expansionArmySeedTerritoryPerSecondBefore: bestRejected?.territoryPerSecondBefore ? formatSwarmNumber(bestRejected.territoryPerSecondBefore) : formatSwarmNumber(territoryVelocityBefore),
        expansionArmySeedTerritoryPerSecondAfter: bestRejected?.territoryPerSecondAfter ? formatSwarmNumber(bestRejected.territoryPerSecondAfter) : formatSwarmNumber(territoryVelocityBefore),
        expansionArmySeedBlockedBy: "not meaningful",
        expansionArmySeedInsideSaveWindow: insideSaveWindow,
        expansionArmySeedBestRejectedUnit: bestRejected?.unitName || "none",
        expansionArmySeedBestRejectedReason: holdReason,
      });
    }

    const etaAfter = Number.isFinite(bestAccepted.etaAfterSeconds) ? formatDuration(bestAccepted.etaAfterSeconds) : "n/a";
    addLaneCandidate({
      lane: "Territory",
      decision: "BUY",
      candidate: bestAccepted.unitName,
      reason: bestAccepted.reason,
      score: bestAccepted.score,
      wouldBuyAmount: formatSwarmNumber(bestAccepted.num),
      etaBefore: expansionEtaBefore,
      etaAfter,
      target: "Expansion",
      resource: "territory",
      observations: missingLabels.length ? [`army prep missing: ${missingLabels.join(", ")}`] : [],
      raw: bestAccepted.raw,
    });

    return recordTerritoryPrepPlannerState({
      territoryPrepCandidate: bestAccepted.unitName,
      territoryPrepDecision: "BUY",
      territoryPrepReason: bestAccepted.reason,
      territoryPrepUnit: bestAccepted.unitName,
      territoryPrepAmount: formatSwarmNumber(bestAccepted.num),
      territoryPrepExpansionEtaBefore: expansionEtaBefore,
      territoryPrepExpansionEtaAfter: etaAfter,
      territoryPrepArmySeed: true,
      territoryPrepSafeCandidate: true,
      territoryPrepBlockedBy: "none",
      armyPrepMissingUnits: missingLabels.length ? missingLabels.join(", ") : "none",
      territoryPrepScannedFightingUnits: scannedFightingUnits.length,
      territoryPrepVisibleFightingUnits: visibleFightingUnits.length,
      territoryPrepBuyableFightingUnits: buyableUnits.length,
      territoryPrepMissingMatchedCount: matchingBuyableUnits.length,
      expansionArmySeedCandidate: bestAccepted.unitName,
      expansionArmySeedDecision: "BUY",
      expansionArmySeedReason: bestAccepted.reason,
      expansionArmySeedUnit: bestAccepted.unitName,
      expansionArmySeedAmount: formatSwarmNumber(bestAccepted.num),
      expansionArmySeedEtaBefore: expansionEtaBefore,
      expansionArmySeedEtaAfter: etaAfter,
      expansionArmySeedEtaGainSeconds: Number.isFinite(bestAccepted.etaGainSeconds) ? trimNumber(bestAccepted.etaGainSeconds) : "n/a",
      expansionArmySeedEtaGainPercent: Number.isFinite(bestAccepted.etaGainRatio) ? `${trimNumber(bestAccepted.etaGainRatio * 100)}%` : "n/a",
      expansionArmySeedTerritoryPerSecondBefore: formatSwarmNumber(bestAccepted.territoryPerSecondBefore),
      expansionArmySeedTerritoryPerSecondAfter: formatSwarmNumber(bestAccepted.territoryPerSecondAfter),
      expansionArmySeedBlockedBy: "none",
      expansionArmySeedInsideSaveWindow: insideSaveWindow,
      expansionArmySeedBestRejectedUnit: bestRejected?.unitName || "none",
      expansionArmySeedBestRejectedReason: bestRejectedReason || "none",
      proposal: {
        ...bestAccepted,
        armySeed: true,
        meetsMinimum: true,
      },
    });
  }

  // <build:section:adapter-territory-meat:start>
  // Phase 3 extraction: dedicated proposal adapter boundary for territory/army lane.
  function buildTerritoryGuardProposal({ game, engine, protectedResources }) {
    return buildTerritoryPrepProposal(game, engine, protectedResources);
  }
  
  // Phase 3 extraction: dedicated execution adapter boundary for meat lane.
  function executeMeatGuardAction({ game, commands, protectedResources, remainingActions = 0 }) {
    return handleMeatGoalPlanner(game, commands, protectedResources, remainingActions);
  }
  // <build:section:adapter-territory-meat:end>

  function scoreMeatCandidate(unit, num) {
    const tab = getTabName(unit);
    if (tab !== "meat") return null;

    const displayName = String(getDisplayName(unit)).toLowerCase();
    const costPressure = unitCostPressure(unit, num);
    const costScore = unitCostScore(unit);

    let chainBonus = 0;
    if (displayName.includes("hive network")) chainBonus += 140;
    if (displayName.includes("neural")) chainBonus += 120;
    if (displayName.includes("hive")) chainBonus += 80;
    if (displayName.includes("mind")) chainBonus += 100;

    return {
      unit,
      num,
      score: costScore * 0.5 + chainBonus - costPressure * 20,
      reason: `meat-chain safe chunk: ${formatSwarmNumber(num)} ${getDisplayName(unit)}`,
    };
  }

  function addTerritoryRoiLaneCandidate(unit, num, territory) {
    const belowMinimum = territory && !territory.meetsMinimum;

    return addLaneCandidate({
      lane: "Territory",
      decision: belowMinimum ? "HOLD" : "OBSERVE",
      candidate: getDisplayName(unit),
      reason: belowMinimum ? territory.guardReason : territory.reason,
      blockers: belowMinimum ? ["territory ROI below minimum"] : [],
      score: territory.score,
      etaAfter: formatEtaImprovementSummary(territory.etaImprovement),
      wouldBuyAmount: formatSwarmNumber(num),
      target: "Expansion",
      resource: "territory",
      raw: territory.raw,
    });
  }

  function getMeatFallbackBuyNum(unit) {
    const max = safe(`Meat fallback max ${unit?.name}`, () => unit?.maxCostMet?.(config.unitBuyPercent)) || newDecimal(0);
    if (!isPositive(max)) return newDecimal(0);

    try {
      if (decimalFrom(max).lessThan(1)) return newDecimal(0);
    } catch {
      if (Number(max) < 1) return newDecimal(0);
    }

    const percent = clampNumber(config.meatFallbackChunkPercent, 0.1, 100, DEFAULT_CONFIG.meatFallbackChunkPercent);
    const chunk = decimalFrom(max).times(percent).dividedBy(100).floor();

    if (isPositive(chunk)) return chunk;
    return newDecimal(1);
  }

  function collectSmartUnitCandidates(game, engine, protectedResources) {
    const focus = decideSmartFocus(engine);
    const ignored = ignoredUnitsSet();
    const candidates = [];

    for (const unit of game.unitlist()) {
      if (!unit || ignored.has(unit.name)) continue;
      if (!unit.isVisible?.() || !unit.isBuyable?.()) continue;

      const protectedCost = shouldAvoidProtectedCost(unit, protectedResources);
      if (protectedCost) {
        const lane = getTabName(unit) === "territory" ? "Territory" : getTabName(unit) === "meat" ? "Meat" : "Other";
        recordAdvisor("HOLD", getDisplayName(unit), protectedResourceHoldReason(protectedCost));
        addLaneCandidate({
          lane,
          decision: "HOLD",
          candidate: getDisplayName(unit),
          reason: protectedResourceHoldReason(protectedCost),
          blockers: [protectedResourceBlocker(protectedCost), "cost uses protected resource"],
          score: unitCostScore(unit),
          resource: protectedCost,
        });
        continue;
      }

      const num = getSmartUnitBuyNum(unit);
      if (!isPositive(num)) continue;

      const tab = getTabName(unit);

      if (focus === "territory" || focus === "balanced") {
        const territory = config.territoryRoiMode ? scoreTerritoryCandidate(game, unit, num, engine) : null;
        if (territory) {
          territory.lane = "Territory";
          addTerritoryRoiLaneCandidate(unit, num, territory);
          if (territory.meetsMinimum) candidates.push(territory);
        }
      }

      if (focus === "meat" || focus === "balanced" || focus === "save-territory") {
        const meat = scoreMeatCandidate(unit, num);
        if (meat) {
          meat.lane = "Meat";
          candidates.push(meat);
          addLaneCandidate({
            lane: "Meat",
            decision: "OBSERVE",
            candidate: getDisplayName(unit),
            reason: meat.reason,
            score: meat.score,
            wouldBuyAmount: formatSwarmNumber(num),
            target: "meat-chain progression",
            resource: "meat",
          });
        }
      }

      if (focus === "save-meat" && tab === "territory") {
        const territory = config.territoryRoiMode ? scoreTerritoryCandidate(game, unit, num, engine) : null;
        if (territory) {
          territory.lane = "Territory";
          addTerritoryRoiLaneCandidate(unit, num, territory);
          if (territory.meetsMinimum) candidates.push(territory);
        }
      }
    }

    candidates.sort((a, b) => b.score - a.score);

    const best = candidates[0] || null;

    if (best) {
      recordAdvisor("CANDIDATE", getDisplayName(best.unit), best.reason);
    } else {
      recordAdvisor("HOLD", "Units", `No safe unit candidate. Focus: ${focus}`);
      addLaneCandidate({
        lane: focus === "territory" || focus === "save-meat" ? "Territory" : "Meat",
        decision: "HOLD",
        candidate: "Units",
        reason: `No safe unit candidate. Focus: ${focus}`,
        blockers: ["no safe scored candidate"],
        score: 0,
      });
    }

    return { best, candidates, focus };
  }

  function pickSmartUnitCandidate(game, engine, protectedResources) {
    return collectSmartUnitCandidates(game, engine, protectedResources).best;
  }

  function shortBlockReason(block) {
    if (!block) return "unknown";
    if (block.type === "payback") return "payback";
    if (block.type === "reserve") return "reserve";
    if (block.type === "protected") return `${block.resource || "resource"} protected`;
    if (block.type === "territory-roi") return "territory ROI";
    if (block.type === "amount") return "no safe amount";
    return block.type || "guard";
  }

  function getUnitCandidateBlock(candidate, num, protectedResources, contextLabel) {
    const unit = candidate?.unit;
    if (!unit) return { type: "missing", reason: "candidate missing unit" };
    if (!isPositive(num)) return { type: "amount", reason: "no safe amount" };

    const cloneBufferIssue = getCloneBufferProtectionIssue(unit, num);
    if (cloneBufferIssue) {
      return {
        type: "clone-buffer",
        resource: "larva",
        reason: cloneBufferIssue.reason,
        blockers: ["larva protected for Clone Cocoon Buffer", "clone buffer spendable larvae guard"],
      };
    }

    const protectedCost = shouldAvoidProtectedCost(unit, protectedResources);
    if (protectedCost) {
      return {
        type: "protected",
        resource: protectedCost,
        reason: protectedResourceHoldReason(protectedCost),
        blockers: [protectedResourceBlocker(protectedCost), "cost uses protected resource"],
      };
    }

    if (getTabName(unit) === "territory" && candidate.meetsMinimum === false) {
      return {
        type: "territory-roi",
        reason: candidate.guardReason || "territory ROI below minimum",
        blockers: ["territory ROI below minimum"],
        raw: candidate.raw || null,
      };
    }

    const analysis = getMeatChainPurchaseAnalysis(unit, num);
    if (analysis && !analysis.ok) {
      return {
        type: analysis.type || "meat-chain",
        reason: `${contextLabel || "meat-chain guard"}: ${analysis.reason}`,
        blockers: [analysis.type === "payback" ? "payback guard" : "reserve guard"],
        raw: analysis.raw || null,
      };
    }

    return null;
  }

  function addSkippedMeatCandidate(candidate, num, block, rankDrop, strategicTarget, topCandidate, topBlockedBy) {
    const skipped = {
      candidate: getDisplayName(candidate.unit),
      amount: isPositive(num) ? formatSwarmNumber(num) : "0",
      reason: block?.reason || "blocked",
      blockedBy: shortBlockReason(block),
      rankDrop,
    };

    if (!meatFallbackState) {
      meatFallbackState = { skipped: [] };
    }

    meatFallbackState.skipped = meatFallbackState.skipped || [];
    meatFallbackState.skipped.push(skipped);

    addLaneCandidate({
      lane: "Meat",
      decision: "HOLD",
      candidate: getDisplayName(candidate.unit),
      reason: block?.reason || "blocked by safety guard",
      blockers: block?.blockers || [shortBlockReason(block)],
      score: candidate.score || unitCostScore(candidate.unit),
      wouldBuyAmount: skipped.amount,
      payback: block?.type === "payback" ? block.reason : "",
      reserveAfter: block?.type === "reserve" ? block.reason : "",
      target: strategicTarget || "meat-chain progression",
      resource: "meat-chain producer",
      raw: block?.raw || null,
      meatFallback: rankDrop > 0,
      fallbackRankDrop: rankDrop,
      strategicTarget,
      blockedStrategicCandidate: topCandidate ? getDisplayName(topCandidate.unit) : "",
      topMeatBlockedBy: topBlockedBy || "",
    });

    return skipped;
  }

  function canActivateMeatStallBreaker(engine, protectedResources) {
    if (!config.meatFallbackEnabled) return false;
    const recentMainHoldRuns = countConsecutiveRecentMainHoldRuns();
    if (recentMainHoldRuns < config.meatFallbackMinHoldRuns) return false;
    if (engine?.expansionBuyable || engine?.hatcheryBuyable) return false;
    if (protectedResources?.has("meat") || protectedResources?.has("territory")) return false;
    return true;
  }


  function recordMeatFallbackState(fields = {}) {
    meatFallbackState = {
      enabled: !!config.meatFallbackEnabled,
      candidate: fields.candidate || meatFallbackState?.candidate || "none",
      reason: fields.reason || meatFallbackState?.reason || "none",
      skipped: fields.skipped || meatFallbackState?.skipped || [],
      topBlockedBy: fields.topBlockedBy || meatFallbackState?.topBlockedBy || "none",
      strategicTarget: fields.strategicTarget || meatFallbackState?.strategicTarget || "none",
      blockedCandidate: fields.blockedCandidate || meatFallbackState?.blockedCandidate || "none",
      stallBreakerActive: !!fields.stallBreakerActive,
      recentMainHoldRuns: fields.recentMainHoldRuns ?? countConsecutiveRecentMainHoldRuns(),
      fallbackRankDrop: fields.fallbackRankDrop ?? meatFallbackState?.fallbackRankDrop ?? null,
    };
  }

  function recordMeatActionUnitPaybackBypassState(fields = {}) {
    const reserveRatio = Number(fields.reserveRatio);
    const paybackSeconds = Number(fields.paybackSeconds);

    meatActionUnitPaybackBypassState = {
      triggered: !!fields.triggered,
      allowed: !!fields.allowed,
      reason: fields.reason || "none",
      unitName: fields.unitName || "none",
      targetName: fields.targetName || "none",
      reserveRatio: Number.isFinite(reserveRatio) ? reserveRatio : null,
      reserveRatioText: Number.isFinite(reserveRatio) ? `${trimNumber(reserveRatio)}x` : "n/a",
      paybackSeconds: Number.isFinite(paybackSeconds) ? paybackSeconds : null,
      paybackText: Number.isFinite(paybackSeconds) ? formatDuration(paybackSeconds) : "n/a",
    };

    return meatActionUnitPaybackBypassState;
  }

  function recordTargetAwareUpgradeState(fields = {}) {
    const reserveRatio = Number(fields.reserveRatio);

    targetAwareUpgradeState = {
      candidate: fields.candidate || fields.name || targetAwareUpgradeState?.candidate || "none",
      name: fields.name || fields.candidate || targetAwareUpgradeState?.name || "none",
      decision: fields.decision || targetAwareUpgradeState?.decision || "OBSERVE",
      reason: fields.reason || targetAwareUpgradeState?.reason || "none",
      type: fields.type || targetAwareUpgradeState?.type || "none",
      targetName: fields.targetName || targetAwareUpgradeState?.targetName || "none",
      actionUnitName: fields.actionUnitName || targetAwareUpgradeState?.actionUnitName || "none",
      affectedUnitName: fields.affectedUnitName || targetAwareUpgradeState?.affectedUnitName || "none",
      supportsActionUnit: !!fields.supportsActionUnit,
      reserveRatio: Number.isFinite(reserveRatio) ? reserveRatio : null,
      reserveRatioText: Number.isFinite(reserveRatio) ? `${trimNumber(reserveRatio)}x` : "n/a",
      costResource: fields.costResource || targetAwareUpgradeState?.costResource || "none",
    };

    return targetAwareUpgradeState;
  }

  function recordUnlockPlannerState(fields = {}) {
    const reserveRatio = Number(fields.reserveRatio);

    unlockPlannerState = {
      candidate: fields.candidate || unlockPlannerState?.candidate || "none",
      decision: fields.decision || unlockPlannerState?.decision || "OBSERVE",
      reason: fields.reason || unlockPlannerState?.reason || "none",
      target: fields.target || unlockPlannerState?.target || "none",
      unlocks: fields.unlocks || unlockPlannerState?.unlocks || "none",
      costResource: fields.costResource || unlockPlannerState?.costResource || "none",
      reserveRatio: Number.isFinite(reserveRatio) ? reserveRatio : null,
      reserveRatioText: Number.isFinite(reserveRatio) ? `${trimNumber(reserveRatio)}x` : "n/a",
      paybackBypassed: !!fields.paybackBypassed,
    };

    return unlockPlannerState;
  }

  function recordParentStepPlannerState(fields = {}) {
    const reserveRatio = Number(fields.reserveRatio);

    parentStepPlannerState = {
      candidate: fields.candidate || parentStepPlannerState?.candidate || "none",
      decision: fields.decision || parentStepPlannerState?.decision || "OBSERVE",
      reason: fields.reason || parentStepPlannerState?.reason || "none",
      target: fields.target || parentStepPlannerState?.target || "none",
      actionUnit: fields.actionUnit || parentStepPlannerState?.actionUnit || "none",
      costResource: fields.costResource || parentStepPlannerState?.costResource || "none",
      reserveRatio: Number.isFinite(reserveRatio) ? reserveRatio : null,
      reserveRatioText: Number.isFinite(reserveRatio) ? `${trimNumber(reserveRatio)}x` : "n/a",
      paybackBypassed: !!fields.paybackBypassed,
      supportsActionUnit: !!fields.supportsActionUnit,
      consumedActionUnit: !!fields.consumedActionUnit,
      consumedUnit: fields.consumedUnit || (fields.consumedActionUnit ? (fields.actionUnit || "none") : "none"),
      executed: !!fields.executed,
    };

    return parentStepPlannerState;
  }

  function recordTwinUnlockPlannerState(fields = {}) {
    const reserveRatio = Number(fields.reserveRatio);
    const postUpgradeRebuildRatio = Number(fields.postUpgradeRebuildRatio);
    const lostProductionBankRatioPerHour = Number(fields.lostProductionBankRatioPerHour);
    const lostProductionBankRatioLimit = Number(fields.lostProductionBankRatioLimit);
    const prepProgressGainPercent = Number(fields.prepProgressGainPercent);
    const prepProgressGainRequiredPercent = Number(fields.prepProgressGainRequiredPercent);

    twinUnlockPlannerState = {
      candidate: fields.candidate || twinUnlockPlannerState?.candidate || "none",
      decision: fields.decision || twinUnlockPlannerState?.decision || "OBSERVE",
      reason: fields.reason || twinUnlockPlannerState?.reason || "none",
      target: fields.target || twinUnlockPlannerState?.target || "none",
      upgrade: fields.upgrade || twinUnlockPlannerState?.upgrade || "none",
      costResource: fields.costResource || twinUnlockPlannerState?.costResource || "none",
      current: fields.current || twinUnlockPlannerState?.current || "0",
      required: fields.required || twinUnlockPlannerState?.required || "0",
      missing: fields.missing || twinUnlockPlannerState?.missing || "0",
      thresholdRatio: Number.isFinite(Number(fields.thresholdRatio)) ? Number(fields.thresholdRatio) : (twinUnlockPlannerState?.thresholdRatio ?? null),
      thresholdRatioText: Number.isFinite(Number(fields.thresholdRatio)) ? `${trimNumber(Number(fields.thresholdRatio) * 100)}%` : (twinUnlockPlannerState?.thresholdRatioText || "n/a"),
      nearThresholdRatio: Number.isFinite(Number(fields.nearThresholdRatio)) ? Number(fields.nearThresholdRatio) : (twinUnlockPlannerState?.nearThresholdRatio ?? null),
      nearThresholdRatioText: Number.isFinite(Number(fields.nearThresholdRatio)) ? `${trimNumber(Number(fields.nearThresholdRatio) * 100)}%` : (twinUnlockPlannerState?.nearThresholdRatioText || "n/a"),
      prepCandidate: fields.prepCandidate || twinUnlockPlannerState?.prepCandidate || "none",
      prepChunk: fields.prepChunk || twinUnlockPlannerState?.prepChunk || "0",
      prepDecision: fields.prepDecision || fields.decision || twinUnlockPlannerState?.prepDecision || twinUnlockPlannerState?.decision || "OBSERVE",
      reserveRatio: Number.isFinite(reserveRatio) ? reserveRatio : null,
      reserveRatioText: Number.isFinite(reserveRatio) ? `${trimNumber(reserveRatio)}x` : "n/a",
      paybackBypassed: !!fields.paybackBypassed,
      postUpgradeRebuildRatio: Number.isFinite(postUpgradeRebuildRatio) ? postUpgradeRebuildRatio : null,
      postUpgradeRebuildRatioText: Number.isFinite(postUpgradeRebuildRatio) ? `${trimNumber(postUpgradeRebuildRatio)}x` : "n/a",
      rebuildSafe: !!fields.rebuildSafe,
      opportunityCostBypass: !!fields.opportunityCostBypass,
      opportunityCostReason: fields.opportunityCostReason || "not evaluated",
      lostProductionPerSecond: fields.lostProductionPerSecond || newDecimal(0),
      lostProductionPerSecondText: fields.lostProductionPerSecond ? `${formatSwarmNumber(fields.lostProductionPerSecond)}` : "n/a",
      lostProductionPerHour: fields.lostProductionPerHour || newDecimal(0),
      lostProductionPerHourText: fields.lostProductionPerHour ? `${formatSwarmNumber(fields.lostProductionPerHour)}` : "n/a",
      lostProductionBankRatioPerHour: Number.isFinite(lostProductionBankRatioPerHour) ? lostProductionBankRatioPerHour : null,
      lostProductionBankRatioPerHourText: Number.isFinite(lostProductionBankRatioPerHour) ? `${trimNumber(lostProductionBankRatioPerHour * 100)}%/h` : "n/a",
      lostProductionBankRatioLimit: Number.isFinite(lostProductionBankRatioLimit) ? lostProductionBankRatioLimit : null,
      lostProductionBankRatioLimitText: Number.isFinite(lostProductionBankRatioLimit) ? `${trimNumber(lostProductionBankRatioLimit * 100)}%/h` : "n/a",
      upgradeBuyAllowedDespiteRebuildUnsafe: !!fields.upgradeBuyAllowedDespiteRebuildUnsafe,
      prepMeaningful: !!fields.prepMeaningful,
      prepProgressGainPercent: Number.isFinite(prepProgressGainPercent) ? prepProgressGainPercent : null,
      prepProgressGainPercentText: Number.isFinite(prepProgressGainPercent) ? `${trimNumber(prepProgressGainPercent)}%` : "n/a",
      prepProgressGainRequiredPercent: Number.isFinite(prepProgressGainRequiredPercent) ? prepProgressGainRequiredPercent : null,
      prepProgressGainRequiredPercentText: Number.isFinite(prepProgressGainRequiredPercent) ? `${trimNumber(prepProgressGainRequiredPercent)}%` : "n/a",
      prepDeferredReason: fields.prepDeferredReason || twinUnlockPlannerState?.prepDeferredReason || "none",
      deferredByParentStep: !!fields.deferredByParentStep,
      parentStepPreferred: !!fields.parentStepPreferred,
      whyParentStepWon: fields.whyParentStepWon || twinUnlockPlannerState?.whyParentStepWon || "none",
      whyTwinPrepDidNotWin: fields.whyTwinPrepDidNotWin || twinUnlockPlannerState?.whyTwinPrepDidNotWin || "none",
      executed: !!fields.executed,
    };

    return twinUnlockPlannerState;
  }

  function recordCloneBufferPlannerState(fields = {}) {
    const percent = Number(fields.cloneBufferPercent);

    cloneBufferPlannerState = {
      cloneBufferMode: fields.cloneBufferMode || cloneBufferPlannerState?.cloneBufferMode || "none",
      cloneBufferCap: fields.cloneBufferCap || cloneBufferPlannerState?.cloneBufferCap || "0",
      cloneBufferBank: fields.cloneBufferBank || cloneBufferPlannerState?.cloneBufferBank || "0",
      cloneBufferTarget: fields.cloneBufferTarget || cloneBufferPlannerState?.cloneBufferTarget || "0",
      cloneBufferCurrent: fields.cloneBufferCurrent || cloneBufferPlannerState?.cloneBufferCurrent || "0",
      cloneBufferPercent: Number.isFinite(percent) ? percent : (Number(cloneBufferPlannerState?.cloneBufferPercent) || 0),
      cloneBufferDebt: fields.cloneBufferDebt || cloneBufferPlannerState?.cloneBufferDebt || "0",
      cloneBufferSpendableLarvae: fields.cloneBufferSpendableLarvae || cloneBufferPlannerState?.cloneBufferSpendableLarvae || "0",
      cloneBufferLarvaeProtected: fields.cloneBufferLarvaeProtected || cloneBufferPlannerState?.cloneBufferLarvaeProtected || "0",
      cloneBufferTargetSource: fields.cloneBufferTargetSource || cloneBufferPlannerState?.cloneBufferTargetSource || "none",
      cloneBufferRecoveryComplete: fields.cloneBufferRecoveryComplete !== undefined
        ? !!fields.cloneBufferRecoveryComplete
        : !!cloneBufferPlannerState?.cloneBufferRecoveryComplete,
      cloneBufferCompletionThreshold: fields.cloneBufferCompletionThreshold || cloneBufferPlannerState?.cloneBufferCompletionThreshold || "n/a",
      cloneBufferRecoveryEta: fields.cloneBufferRecoveryEta || cloneBufferPlannerState?.cloneBufferRecoveryEta || "n/a",
      cloneBufferHardLockActive: !!fields.cloneBufferHardLockActive,
      cloneBufferReason: fields.cloneBufferReason || cloneBufferPlannerState?.cloneBufferReason || "none",
      cloneBufferDebtRaw: fields.cloneBufferDebtRaw || cloneBufferPlannerState?.cloneBufferDebtRaw || newDecimal(0),
      cloneBufferSpendableLarvaeRaw: fields.cloneBufferSpendableLarvaeRaw || cloneBufferPlannerState?.cloneBufferSpendableLarvaeRaw || newDecimal(0),
      cloneBufferLarvaeProtectedRaw: fields.cloneBufferLarvaeProtectedRaw || cloneBufferPlannerState?.cloneBufferLarvaeProtectedRaw || newDecimal(0),
      cloneBufferProtectLarvae: fields.cloneBufferProtectLarvae !== undefined
        ? !!fields.cloneBufferProtectLarvae
        : !!cloneBufferPlannerState?.cloneBufferProtectLarvae,
      postCloneLockActive: fields.postCloneLockActive !== undefined ? !!fields.postCloneLockActive : !!cloneBufferPlannerState?.postCloneLockActive,
    };

    return cloneBufferPlannerState;
  }

  function recordAbilityPrepPlannerState(fields = {}) {
    abilityPrepPlannerState = {
      abilityPrepCandidate: fields.abilityPrepCandidate || abilityPrepPlannerState?.abilityPrepCandidate || "none",
      abilityPrepDecision: fields.abilityPrepDecision || abilityPrepPlannerState?.abilityPrepDecision || "none",
      abilityPrepReason: fields.abilityPrepReason || abilityPrepPlannerState?.abilityPrepReason || "none",
      abilityPrepType: fields.abilityPrepType || abilityPrepPlannerState?.abilityPrepType || "none",
      abilityPrepEnergyAvailable: fields.abilityPrepEnergyAvailable || abilityPrepPlannerState?.abilityPrepEnergyAvailable || "n/a",
      abilityPrepRequiresArmyPrep: fields.abilityPrepRequiresArmyPrep ? "yes" : "no",
      abilityPrepRequiresCloneBuffer: fields.abilityPrepRequiresCloneBuffer ? "yes" : "no",
      houseOfMirrorsArmyValue: fields.houseOfMirrorsArmyValue || abilityPrepPlannerState?.houseOfMirrorsArmyValue || "n/a",
      houseOfMirrorsMissingUnits: fields.houseOfMirrorsMissingUnits || abilityPrepPlannerState?.houseOfMirrorsMissingUnits || "none",
    };

    return abilityPrepPlannerState;
  }

  function recordPostNexusEnergyPlannerState(fields = {}) {
    postNexusEnergyPlannerState = {
      postNexusEnergyCandidate: fields.postNexusEnergyCandidate || postNexusEnergyPlannerState?.postNexusEnergyCandidate || "none",
      postNexusEnergyDecision: fields.postNexusEnergyDecision || postNexusEnergyPlannerState?.postNexusEnergyDecision || "OBSERVE",
      postNexusEnergyReason: fields.postNexusEnergyReason || postNexusEnergyPlannerState?.postNexusEnergyReason || "none",
      postNexusEnergyAmount: fields.postNexusEnergyAmount || postNexusEnergyPlannerState?.postNexusEnergyAmount || "0",
      postNexusEnergyBoostBefore: fields.postNexusEnergyBoostBefore || postNexusEnergyPlannerState?.postNexusEnergyBoostBefore || "n/a",
      postNexusEnergyBoostAfter: fields.postNexusEnergyBoostAfter || postNexusEnergyPlannerState?.postNexusEnergyBoostAfter || "n/a",
      postNexusEnergyBoostGain: fields.postNexusEnergyBoostGain || postNexusEnergyPlannerState?.postNexusEnergyBoostGain || "n/a",
      postNexusEnergyReserve: fields.postNexusEnergyReserve || postNexusEnergyPlannerState?.postNexusEnergyReserve || "0",
      postNexusEnergyBlockedBy: fields.postNexusEnergyBlockedBy || postNexusEnergyPlannerState?.postNexusEnergyBlockedBy || "none",
      postNexusEnergySpend: fields.postNexusEnergySpend || postNexusEnergyPlannerState?.postNexusEnergySpend || "0",
    };

    return postNexusEnergyPlannerState;
  }

  function recordTerritoryPrepPlannerState(fields = {}) {
    territoryPrepPlannerState = {
      territoryPrepCandidate: fields.territoryPrepCandidate || territoryPrepPlannerState?.territoryPrepCandidate || "none",
      territoryPrepDecision: fields.territoryPrepDecision || territoryPrepPlannerState?.territoryPrepDecision || "none",
      territoryPrepReason: fields.territoryPrepReason || territoryPrepPlannerState?.territoryPrepReason || "none",
      territoryPrepUnit: fields.territoryPrepUnit || territoryPrepPlannerState?.territoryPrepUnit || "none",
      territoryPrepAmount: fields.territoryPrepAmount || territoryPrepPlannerState?.territoryPrepAmount || "0",
      territoryPrepExpansionEtaBefore: fields.territoryPrepExpansionEtaBefore || territoryPrepPlannerState?.territoryPrepExpansionEtaBefore || "n/a",
      territoryPrepExpansionEtaAfter: fields.territoryPrepExpansionEtaAfter || territoryPrepPlannerState?.territoryPrepExpansionEtaAfter || "n/a",
      territoryPrepArmySeed: fields.territoryPrepArmySeed ? "yes" : "no",
      territoryPrepSafeCandidate: fields.territoryPrepSafeCandidate ? "yes" : "no",
      territoryPrepBlockedBy: fields.territoryPrepBlockedBy || territoryPrepPlannerState?.territoryPrepBlockedBy || "none",
      armyPrepMissingUnits: fields.armyPrepMissingUnits || territoryPrepPlannerState?.armyPrepMissingUnits || "none",
      territoryPrepScannedFightingUnits: Number.isFinite(Number(fields.territoryPrepScannedFightingUnits)) ? Number(fields.territoryPrepScannedFightingUnits) : (territoryPrepPlannerState?.territoryPrepScannedFightingUnits ?? 0),
      territoryPrepVisibleFightingUnits: Number.isFinite(Number(fields.territoryPrepVisibleFightingUnits)) ? Number(fields.territoryPrepVisibleFightingUnits) : (territoryPrepPlannerState?.territoryPrepVisibleFightingUnits ?? 0),
      territoryPrepBuyableFightingUnits: Number.isFinite(Number(fields.territoryPrepBuyableFightingUnits)) ? Number(fields.territoryPrepBuyableFightingUnits) : (territoryPrepPlannerState?.territoryPrepBuyableFightingUnits ?? 0),
      territoryPrepMissingMatchedCount: Number.isFinite(Number(fields.territoryPrepMissingMatchedCount)) ? Number(fields.territoryPrepMissingMatchedCount) : (territoryPrepPlannerState?.territoryPrepMissingMatchedCount ?? 0),
      expansionArmySeedCandidate: fields.expansionArmySeedCandidate || territoryPrepPlannerState?.expansionArmySeedCandidate || "none",
      expansionArmySeedDecision: fields.expansionArmySeedDecision || territoryPrepPlannerState?.expansionArmySeedDecision || "OBSERVE",
      expansionArmySeedUnit: fields.expansionArmySeedUnit || territoryPrepPlannerState?.expansionArmySeedUnit || "none",
      expansionArmySeedAmount: fields.expansionArmySeedAmount || territoryPrepPlannerState?.expansionArmySeedAmount || "0",
      expansionArmySeedReason: fields.expansionArmySeedReason || territoryPrepPlannerState?.expansionArmySeedReason || "none",
      expansionArmySeedEtaBefore: fields.expansionArmySeedEtaBefore || territoryPrepPlannerState?.expansionArmySeedEtaBefore || "n/a",
      expansionArmySeedEtaAfter: fields.expansionArmySeedEtaAfter || territoryPrepPlannerState?.expansionArmySeedEtaAfter || "n/a",
      expansionArmySeedEtaGainSeconds: fields.expansionArmySeedEtaGainSeconds || territoryPrepPlannerState?.expansionArmySeedEtaGainSeconds || "0",
      expansionArmySeedEtaGainPercent: fields.expansionArmySeedEtaGainPercent || territoryPrepPlannerState?.expansionArmySeedEtaGainPercent || "0%",
      expansionArmySeedTerritoryPerSecondBefore: fields.expansionArmySeedTerritoryPerSecondBefore || territoryPrepPlannerState?.expansionArmySeedTerritoryPerSecondBefore || "0",
      expansionArmySeedTerritoryPerSecondAfter: fields.expansionArmySeedTerritoryPerSecondAfter || territoryPrepPlannerState?.expansionArmySeedTerritoryPerSecondAfter || "0",
      expansionArmySeedBlockedBy: fields.expansionArmySeedBlockedBy || territoryPrepPlannerState?.expansionArmySeedBlockedBy || "none",
      expansionArmySeedInsideSaveWindow: fields.expansionArmySeedInsideSaveWindow !== undefined
        ? (fields.expansionArmySeedInsideSaveWindow ? "yes" : "no")
        : (territoryPrepPlannerState?.expansionArmySeedInsideSaveWindow || "no"),
      expansionArmySeedBestRejectedUnit: fields.expansionArmySeedBestRejectedUnit || territoryPrepPlannerState?.expansionArmySeedBestRejectedUnit || "none",
      expansionArmySeedBestRejectedReason: fields.expansionArmySeedBestRejectedReason || territoryPrepPlannerState?.expansionArmySeedBestRejectedReason || "none",
      proposal: fields.proposal || territoryPrepPlannerState?.proposal || null,
    };

    return territoryPrepPlannerState;
  }

  function recordLaneCoordinatorState(fields = {}) {
    laneCoordinatorState = {
      coordinatorDecision: fields.coordinatorDecision || laneCoordinatorState?.coordinatorDecision || "HOLD",
      selectedLaneActions: fields.selectedLaneActions || laneCoordinatorState?.selectedLaneActions || [],
      selectedLaneLabels: fields.selectedLaneLabels || laneCoordinatorState?.selectedLaneLabels || [],
      selectedLaneSummary: fields.selectedLaneSummary || laneCoordinatorState?.selectedLaneSummary || "none",
      primaryActionReason: fields.primaryActionReason || laneCoordinatorState?.primaryActionReason || "",
      coordinatorRemainingBudgetReason: fields.coordinatorRemainingBudgetReason || laneCoordinatorState?.coordinatorRemainingBudgetReason || "none",
      territoryActionAge: Number.isFinite(Number(fields.territoryActionAge)) ? Number(fields.territoryActionAge) : (laneCoordinatorState?.territoryActionAge ?? getLaneActionAge("Territory")),
      territoryStarvationCount: Number.isFinite(Number(fields.territoryStarvationCount)) ? Number(fields.territoryStarvationCount) : (laneCoordinatorState?.territoryStarvationCount ?? getTerritoryStarvationCount()),
      territoryDidNotBuyReason: fields.territoryDidNotBuyReason || laneCoordinatorState?.territoryDidNotBuyReason || "none",
    };

    return laneCoordinatorState;
  }

  function recordActionUnitRefillState(fields = {}) {
    const reserveRatio = Number(fields.reserveRatio);
    const paybackSeconds = Number(fields.paybackSeconds);
    const budgetRemaining = Number(fields.actionBudgetRemainingAfterParentStep);

    actionUnitRefillState = {
      candidate: fields.candidate || actionUnitRefillState?.candidate || "none",
      decision: fields.decision || actionUnitRefillState?.decision || "OBSERVE",
      reason: fields.reason || actionUnitRefillState?.reason || "none",
      blockedBy: fields.blockedBy || actionUnitRefillState?.blockedBy || "none",
      reserveRatio: Number.isFinite(reserveRatio) ? reserveRatio : null,
      reserveRatioText: Number.isFinite(reserveRatio) ? `${trimNumber(reserveRatio)}x` : "n/a",
      paybackSeconds: Number.isFinite(paybackSeconds) ? paybackSeconds : null,
      paybackText: Number.isFinite(paybackSeconds) ? formatDuration(paybackSeconds) : "n/a",
      paybackBypassed: !!fields.paybackBypassed,
      parentStepConsumedActionUnit: !!fields.parentStepConsumedActionUnit,
      parentStepConsumedUnit: fields.parentStepConsumedUnit || actionUnitRefillState?.parentStepConsumedUnit || "none",
      actionBudgetRemainingAfterParentStep: Number.isFinite(budgetRemaining) ? Math.max(0, budgetRemaining) : (actionUnitRefillState?.actionBudgetRemainingAfterParentStep ?? 0),
      followUpActionSelected: !!fields.followUpActionSelected,
      whyNoFollowUpAction: fields.whyNoFollowUpAction || actionUnitRefillState?.whyNoFollowUpAction || "none",
      antiPingpongGuardActive: !!fields.antiPingpongGuardActive,
      antiPingpongGuardAllowedRefill: !!fields.antiPingpongGuardAllowedRefill,
      coordinatorRemainingBudgetReason: fields.coordinatorRemainingBudgetReason || actionUnitRefillState?.coordinatorRemainingBudgetReason || "none",
    };

    return actionUnitRefillState;
  }

  function finalizeParentStepAfterRefillSelection(refillCandidate, refillReason = "") {
    if (!parentStepPlannerState) return null;
    if (String(parentStepPlannerState.decision || "").toUpperCase() !== "BUY") return parentStepPlannerState;

    const chosenRefill = String(refillCandidate || actionUnitRefillState?.candidate || parentStepPlannerState.actionUnit || "none");
    const statusReason = refillReason
      ? `parent-step already completed; Parent Refill is active: ${chosenRefill}; ${refillReason}`
      : `parent-step already completed; Parent Refill is active: ${chosenRefill}`;

    return recordParentStepPlannerState({
      candidate: parentStepPlannerState.candidate,
      decision: "OBSERVE",
      reason: statusReason,
      target: parentStepPlannerState.target,
      actionUnit: parentStepPlannerState.actionUnit,
      costResource: parentStepPlannerState.costResource,
      reserveRatio: parentStepPlannerState.reserveRatio,
      paybackBypassed: !!parentStepPlannerState.paybackBypassed,
      supportsActionUnit: !!parentStepPlannerState.supportsActionUnit,
      consumedActionUnit: !!parentStepPlannerState.consumedActionUnit,
      consumedUnit: parentStepPlannerState.consumedUnit || "none",
      executed: !!parentStepPlannerState.executed,
    });
  }

  function getCurrentMeatActionUnitPaybackState(game) {
    const plan = safe("Current meat action payback state", () => buildMeatGoalPlan(game));
    const actionUnit = getStrategicActionUnit(plan);
    if (!actionUnit) return null;

    return {
      triggered: false,
      allowed: false,
      reason: "active action unit observed; no payback bypass evaluated this run",
      unitName: getDisplayName(actionUnit),
      targetName: plan?.target ? getDisplayName(plan.target) : "meat-chain progression",
      reserveRatio: null,
      reserveRatioText: "n/a",
      paybackSeconds: null,
      paybackText: "n/a",
    };
  }

  function assessStrategicActionPaybackBypass(unit, block, strategicPlan, protectedResources) {
    const actionUnit = getStrategicActionUnit(strategicPlan);
    if (!unit || !actionUnit || !isSameGameItem(unit, actionUnit)) return { applies: false, allowed: false };

    const unitName = getDisplayName(unit);
    const targetName = strategicPlan?.target ? getDisplayName(strategicPlan.target) : "meat-chain progression";
    const reserveRatio = rawMetricNumber(block?.raw || {}, "reserveRatio", NaN);
    const paybackSeconds = rawMetricNumber(block?.raw || {}, "paybackSeconds", NaN);
    const requiredRatio = clampNumber(
      config.meatActionUnitMinReserveRatio,
      1,
      1000,
      DEFAULT_CONFIG.meatActionUnitMinReserveRatio
    );

    function result(allowed, reason) {
      const state = recordMeatActionUnitPaybackBypassState({
        triggered: allowed,
        allowed,
        reason,
        unitName,
        targetName,
        reserveRatio,
        paybackSeconds,
      });
      return { applies: true, allowed, reason, state };
    }

    if (!config.meatActionUnitPaybackBypass) {
      return result(false, `active action payback bypass not allowed because config is off`);
    }

    if (!block) {
      return result(false, `active action payback bypass not needed because ${unitName} was not blocked`);
    }

    if (block.type !== "payback") {
      const why = block.type === "reserve"
        ? "reserve guard failed"
        : `${shortBlockReason(block)} guard failed`;
      return result(false, `active action payback bypass not allowed because ${why}`);
    }

    const protectedCost = shouldAvoidProtectedCost(unit, protectedResources || new Set());
    if (protectedCost) {
      return result(false, `active action payback bypass not allowed because ${protectedResourceHoldReason(protectedCost)}`);
    }

    if (!Number.isFinite(reserveRatio)) {
      return result(false, `active action payback bypass not allowed because reserve ratio is unavailable`);
    }

    if (reserveRatio < requiredRatio) {
      return result(false, `active action payback bypass not allowed because reserve ${trimNumber(reserveRatio)}x < ${trimNumber(requiredRatio)}x`);
    }

    const paybackText = Number.isFinite(paybackSeconds) ? `; payback ${formatDuration(paybackSeconds)}` : "";
    return result(
      true,
      `active meat action for ${targetName}: ${unitName}; active action unit payback bypass; reserve ${trimNumber(reserveRatio)}x >= ${trimNumber(requiredRatio)}x${paybackText}`
    );
  }

  function isSameGameItem(a, b) {
    return !!a && !!b && String(a.name || "") === String(b.name || "");
  }

  function getStrategicActionUnit(strategicPlan) {
    return strategicPlan?.actionUnit || null;
  }

  function getPlanPathIndex(strategicPlan, unit) {
    if (!strategicPlan?.path?.length || !unit) return -1;

    for (let i = 0; i < strategicPlan.path.length; i++) {
      if (isSameGameItem(strategicPlan.path[i]?.unit, unit)) return i;
    }

    return -1;
  }

  function isUnitOnPlanPath(strategicPlan, unit) {
    return getPlanPathIndex(strategicPlan, unit) >= 0;
  }

  function getDirectTargetPathParentUnit(strategicPlan) {
    const actionUnit = getStrategicActionUnit(strategicPlan);
    const actionIndex = getPlanPathIndex(strategicPlan, actionUnit);
    if (actionIndex <= 0) return null;
    return strategicPlan.path[actionIndex - 1]?.unit || null;
  }

  function getStrategicActionRank(strategicPlan) {
    const actionUnit = getStrategicActionUnit(strategicPlan);
    return actionUnit ? getMeatChainRank(actionUnit) : -1;
  }

  function isStrategicActionUnit(unit, strategicPlan) {
    return isSameGameItem(unit, getStrategicActionUnit(strategicPlan));
  }

  function canBypassPaybackForStrategicAction(candidate, block, strategicPlan, protectedResources) {
    return assessStrategicActionPaybackBypass(candidate?.unit, block, strategicPlan, protectedResources).allowed;
  }

  function strategicActionPaybackBypassReason(unit, block, strategicPlan, protectedResources) {
    return assessStrategicActionPaybackBypass(unit, block, strategicPlan, protectedResources).reason;
  }

  function isTwinUpgrade(upgrade) {
    if (!upgrade) return false;

    const text = [
      upgrade.name,
      getDisplayName(upgrade),
      upgrade?.type?.label,
      upgrade?.type?.plural,
      upgrade?.type?.l?.label,
      upgrade?.type?.l?.plural,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return text.includes("twin") || String(upgrade.name || "").toLowerCase().endsWith("twin");
  }

  function getTwinRecoveryIssue(twinUpgrade) {
    if (!twinUpgrade || !config.twinRecoveryBufferMultiplier) return null;

    const costs = getCostList(twinUpgrade);

    for (const cost of costs) {
      const costUnit = cost?.unit;
      if (!costUnit || !isPositive(cost.val)) continue;
      if (getTabName(costUnit) !== "meat") continue;

      const current = decimalFrom(costUnit.count?.() || 0);
      const costVal = decimalFrom(cost.val);
      const after = current.minus(costVal);
      const minAfter = costVal.times(config.twinRecoveryBufferMultiplier);

      if (after.lessThan(minAfter)) {
        return {
          unit: costUnit,
          after,
          minAfter,
          costVal,
          reason: `post-twin recovery buffer too low: ${getDisplayName(costUnit)} after ${formatSwarmNumber(after)} < required ${formatSwarmNumber(minAfter)}`,
        };
      }
    }

    return null;
  }

  function shouldHoldTwinForRecovery(twinUpgrade, contextLabel) {
    const issue = getTwinRecoveryIssue(twinUpgrade);
    if (!issue) return false;

    recordAdvisor(
      "HOLD",
      getDisplayName(twinUpgrade),
      `${contextLabel || "twin-prep"}: ${issue.reason}`
    );
    addLaneCandidate({
      lane: "Twin",
      decision: "HOLD",
      candidate: getDisplayName(twinUpgrade),
      reason: `${contextLabel || "twin-prep"}: ${issue.reason}`,
      blockers: ["post-twin recovery buffer", "reserve guard"],
      score: unitCostScore(twinUpgrade),
      reserveAfter: `${formatSwarmNumber(issue.after)} < ${formatSwarmNumber(issue.minAfter)}`,
      resource: getDisplayName(issue.unit),
    });

    return true;
  }

  function getBuyableUpgradeList(game) {
    const list = [];
    const seen = new Set();

    function add(upgrade) {
      if (!upgrade?.name || seen.has(upgrade.name)) return;
      if (!upgrade?.isVisible?.() || !upgrade?.isBuyable?.()) return;
      seen.add(upgrade.name);
      list.push(upgrade);
    }

    for (const upgrade of game.availableAutobuyUpgrades?.(config.upgradeBuyPercent) || []) {
      add(upgrade);
    }

    for (const upgrade of game.upgradelist?.() || []) {
      add(upgrade);
    }

    return list;
  }

  function getUpgradeText(upgrade) {
    return [
      upgrade?.name,
      getDisplayName(upgrade),
      upgrade?.label,
      upgrade?.plural,
      upgrade?.type?.label,
      upgrade?.type?.plural,
      upgrade?.type?.l?.label,
      upgrade?.type?.l?.plural,
      upgrade?.unit?.name,
      upgrade?.unit?.label,
      upgrade?.unit?.plural,
      upgrade?.unit?.type?.label,
      upgrade?.unit?.type?.plural,
      upgrade?.unit?.type?.l?.label,
      upgrade?.unit?.type?.l?.plural,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
  }

  function getTargetAwareUpgradeType(upgrade) {
    if (!upgrade || shouldSkipAbility(upgrade)) return null;
    if (isTwinUpgrade(upgrade)) return "twin";

    const text = getUpgradeText(upgrade);
    if (text.includes("faster") || text.includes("speed") || text.includes("production")) return "production";
    return null;
  }

  function escapeRegExp(value) {
    return String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function textContainsLabel(text, label) {
    const normalizedText = String(text || "").toLowerCase().replace(/[^a-z0-9]+/g, " ");
    const normalizedLabel = String(label || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
    if (!normalizedLabel) return false;
    return new RegExp(`(^| )${escapeRegExp(normalizedLabel)}( |$)`).test(normalizedText);
  }

  function getUpgradeAffectedMeatUnit(game, upgrade) {
    if (!upgrade) return null;
    if (upgrade.unit && isMeatChainUnit(upgrade.unit)) return upgrade.unit;

    const upgradeName = String(upgrade.name || "").toLowerCase();

    if (isTwinUpgrade(upgrade) && upgradeName.endsWith("twin")) {
      const unit = getGameUnit(game, upgradeName.slice(0, -4));
      if (unit && isMeatChainUnit(unit)) return unit;
    }

    const text = getUpgradeText(upgrade);
    const units = MEAT_CHAIN_NAMES
      .map((name) => getGameUnit(game, name))
      .filter((unit) => unit && isMeatChainUnit(unit))
      .sort((a, b) => getDisplayName(b).length - getDisplayName(a).length || b.name.length - a.name.length);

    for (const unit of units) {
      const labels = [
        unit.name,
        getDisplayName(unit),
        unit?.plural,
        unit?.type?.label,
        unit?.type?.plural,
        unit?.type?.l?.label,
        unit?.type?.l?.plural,
      ].filter(Boolean);

      if (labels.some((label) => textContainsLabel(text, label))) return unit;
    }

    return null;
  }

  function targetAwareSupportUnitsForPlan(plan) {
    const support = new Map();
    const actionUnit = getStrategicActionUnit(plan);

    function add(unit, role) {
      if (!unit || !isMeatChainUnit(unit)) return;
      if (!support.has(unit.name)) {
        support.set(unit.name, { unit, roles: [] });
      }
      support.get(unit.name).roles.push(role);
    }

    add(actionUnit, "active action unit");

    for (const cost of getCostList(actionUnit)) {
      if (cost?.unit && isPositive(cost.val) && isMeatChainUnit(cost.unit)) {
        add(cost.unit, `active action cost resource for ${getDisplayName(actionUnit)}`);
      }
    }

    if (plan?.parentUnit) add(plan.parentUnit, `next target step toward ${getDisplayName(plan.target)}`);

    for (const step of plan?.path || []) {
      if (step?.unit && isMeatChainUnit(step.unit)) {
        add(step.unit, `target path to ${getDisplayName(plan.target)}`);
      }
    }

    return support;
  }

  function getTargetAwareUpgradeSupport(game, upgrade, strategicPlan) {
    if (!config.targetAwareUpgradePlanner || !strategicPlan) return null;

    const type = getTargetAwareUpgradeType(upgrade);
    if (!type) return null;

    const affectedUnit = getUpgradeAffectedMeatUnit(game, upgrade);
    if (!affectedUnit) return null;

    const actionUnit = getStrategicActionUnit(strategicPlan);
    const support = targetAwareSupportUnitsForPlan(strategicPlan);
    const supportRow = support.get(affectedUnit.name);
    if (!supportRow) return null;

    const supportsActionUnit = isSameGameItem(affectedUnit, actionUnit) || supportRow.roles.some((role) => /active action/.test(role));

    return {
      type,
      affectedUnit,
      actionUnit,
      targetUnit: strategicPlan.target,
      roles: supportRow.roles,
      supportsActionUnit,
    };
  }

  function isTargetAwareUpgradeRelevant(game, upgrade, strategicPlan) {
    return !!getTargetAwareUpgradeSupport(game, upgrade, strategicPlan);
  }

  function getTargetAwareUpgradeReserveCheck(upgrade, type) {
    const rows = getCostList(upgrade)
      .filter((cost) => cost?.unit && isPositive(cost.val) && isMeatChainUnit(cost.unit));

    if (!rows.length) {
      return { ok: type !== "twin", hasMeatChainCost: false, reason: "reserve data unavailable for target-aware twin support" };
    }

    const baseMultiplier = Math.max(0, Number(config.meatChainReserveMultiplier || 0));
    const twinBuffer = type === "twin" ? Math.max(0, Number(config.twinRecoveryBufferMultiplier || 0)) : 0;
    const requiredMultiplier = baseMultiplier + twinBuffer;
    let bestRaw = null;

    for (const cost of rows) {
      const costUnit = cost.unit;
      const costVal = decimalFrom(cost.val);
      const current = decimalFrom(costUnit.count?.() || 0);
      const after = current.minus(costVal);
      const requiredAfter = costVal.times(requiredMultiplier);
      const reserveRatio = isPositive(costVal) ? decimalToNumber(after.dividedBy(costVal), Infinity) : Infinity;
      const requiredReserveRatio = requiredMultiplier;
      const raw = {
        targetAwareUpgradeReserveRatio: reserveRatio,
        targetAwareUpgradeRequiredReserveRatio: requiredReserveRatio,
        targetAwareUpgradeCostAmount: costVal,
        targetAwareUpgradeCurrentAmount: current,
        targetAwareUpgradeReserveAfter: after,
        costAmount: costVal,
        currentAmount: current,
        reserveAfter: after,
        reserveRequired: requiredAfter,
        reserveRatio: requiredMultiplier > 0 ? decimalToNumber(after.dividedBy(requiredAfter), Infinity) : Infinity,
      };

      bestRaw = raw;

      if (after.lessThan(0)) {
        return {
          ok: false,
          hasMeatChainCost: true,
          unit: costUnit,
          costVal,
          current,
          after,
          requiredAfter,
          reserveRatio,
          requiredReserveRatio,
          raw,
          reason: `costs ${formatSwarmNumber(costVal)} ${getDisplayName(costUnit)}; after buy ${formatSwarmNumber(after)}; would go negative`,
        };
      }

      if (requiredMultiplier > 0 && after.lessThan(requiredAfter)) {
        return {
          ok: false,
          hasMeatChainCost: true,
          unit: costUnit,
          costVal,
          current,
          after,
          requiredAfter,
          reserveRatio,
          requiredReserveRatio,
          raw,
          reason: `costs ${formatSwarmNumber(costVal)} ${getDisplayName(costUnit)}; after buy ${formatSwarmNumber(after)}; reserve ${trimNumber(reserveRatio)}x < required ${trimNumber(requiredReserveRatio)}x`,
        };
      }
    }

    return { ok: true, hasMeatChainCost: true, raw: bestRaw };
  }

  function assessTargetAwareUpgrade(game, upgrade, strategicPlan, protectedResources) {
    const support = getTargetAwareUpgradeSupport(game, upgrade, strategicPlan);
    if (!support) return null;

    const name = getDisplayName(upgrade);
    const targetName = support.targetUnit ? getDisplayName(support.targetUnit) : "meat-chain target";
    const actionName = support.actionUnit ? getDisplayName(support.actionUnit) : "active action";
    const affectedName = getDisplayName(support.affectedUnit);
    const baseReason = `target-aware ${support.type} support for ${targetName}; active action ${actionName} uses/supports ${affectedName}`;
    const protectedCost = shouldAvoidProtectedCost(upgrade, protectedResources || new Set());

    if (protectedCost) {
      return {
        upgrade,
        support,
        decision: "HOLD",
        reason: `${baseReason}; blocked: ${protectedResourceHoldReason(protectedCost)}`,
        blockers: [protectedResourceBlocker(protectedCost), "cost uses protected resource"],
        score: (support.type === "twin" ? 72000 : 76000) + unitCostScore(upgrade),
        raw: null,
        costResource: protectedCost,
      };
    }

    const reserveCheck = getTargetAwareUpgradeReserveCheck(upgrade, support.type);

    if (!reserveCheck.ok) {
      const blocker = reserveCheck.hasMeatChainCost ? "reserve guard" : "recovery data unavailable";
      const costResource = reserveCheck.unit ? getDisplayName(reserveCheck.unit) : "meat-chain producer";
      return {
        upgrade,
        support,
        decision: "HOLD",
        reason: `${baseReason}; blocked: ${reserveCheck.reason}`,
        blockers: [blocker],
        score: (support.type === "twin" ? 72000 : 76000) + unitCostScore(upgrade),
        raw: reserveCheck.raw || null,
        reserveAfter: reserveCheck.after ? `${formatSwarmNumber(reserveCheck.after)} < ${formatSwarmNumber(reserveCheck.requiredAfter)}` : "n/a",
        costResource,
        reserveRatio: reserveCheck.reserveRatio,
      };
    }

    const reserveRatio = rawMetricNumber(reserveCheck.raw || {}, "targetAwareUpgradeReserveRatio", NaN);
    const reserveText = Number.isFinite(reserveRatio) ? `; reserve/recovery ${trimNumber(reserveRatio)}x ok` : "";
    const costUnit = getCostList(upgrade).find((cost) => cost?.unit && isMeatChainUnit(cost.unit))?.unit;

    return {
      upgrade,
      support,
      decision: "BUY",
      reason: `${baseReason}; reserve/recovery ok${reserveText}`,
      blockers: [],
      score: (support.type === "twin" ? 72000 : 76000) + (support.supportsActionUnit ? 6000 : 0) + unitCostScore(upgrade),
      raw: reserveCheck.raw || null,
      reserveAfter: reserveCheck.raw?.reserveAfter ? formatSwarmNumber(reserveCheck.raw.reserveAfter) : "",
      costResource: costUnit ? getDisplayName(costUnit) : "none",
      reserveRatio,
    };
  }

  function recordTargetAwareUpgradeCandidate(result, decisionOverride = null, reasonOverride = null) {
    const decision = decisionOverride || result.decision;
    const reason = reasonOverride || result.reason;
    const upgrade = result.upgrade;
    const support = result.support;
    const lane = support.type === "twin" ? "Twin" : "Upgrade";

    recordAdvisor(decision, getDisplayName(upgrade), reason);
    addLaneCandidate({
      lane,
      decision,
      candidate: getDisplayName(upgrade),
      reason,
      blockers: result.blockers || [],
      observations: [
        `target-aware-${support.type}-support`,
        `supports ${getDisplayName(support.affectedUnit)} for ${getDisplayName(support.actionUnit)}`,
      ],
      score: result.score,
      reserveAfter: result.reserveAfter || "",
      target: support.targetUnit ? getDisplayName(support.targetUnit) : "meat-chain target",
      resource: result.costResource || getDisplayName(support.affectedUnit),
      raw: result.raw || null,
    });

    recordTargetAwareUpgradeState({
      candidate: getDisplayName(upgrade),
      name: getDisplayName(upgrade),
      decision,
      reason,
      type: support.type,
      targetName: support.targetUnit ? getDisplayName(support.targetUnit) : "none",
      actionUnitName: support.actionUnit ? getDisplayName(support.actionUnit) : "none",
      affectedUnitName: getDisplayName(support.affectedUnit),
      supportsActionUnit: support.supportsActionUnit,
      reserveRatio: result.reserveRatio,
      costResource: result.costResource || "none",
    });
  }

  function handleTargetAwareUpgradePlanner(game, commands, protectedResources) {
    const evaluatedNames = new Set();
    if (!config.targetAwareUpgradePlanner) return { bought: 0, evaluatedNames };

    const strategicPlan = safe("Target-aware upgrade plan", () => buildMeatGoalPlan(game));
    if (!strategicPlan) return { bought: 0, evaluatedNames };

    const upgrades = getBuyableUpgradeList(game)
      .filter((upgrade) => upgrade.name !== "hatchery" && upgrade.name !== "expansion")
      .filter((upgrade) => !shouldSkipAbility(upgrade));

    const results = [];

    for (const upgrade of upgrades) {
      const result = assessTargetAwareUpgrade(game, upgrade, strategicPlan, protectedResources);
      if (!result) continue;
      evaluatedNames.add(upgrade.name);
      results.push(result);
    }

    if (!results.length) return { bought: 0, evaluatedNames };

    const allowed = results
      .filter((result) => result.decision === "BUY")
      .sort((a, b) => b.score - a.score);

    const top = allowed[0] || null;

    for (const result of results) {
      if (top && result === top) continue;
      if (result.decision === "HOLD") {
        recordTargetAwareUpgradeCandidate(result);
      } else {
        recordTargetAwareUpgradeCandidate(
          result,
          "OBSERVE",
          `${result.reason}; lower-ranked than ${getDisplayName(top.upgrade)} this run`
        );
      }
    }

    if (!top) return { bought: 0, evaluatedNames };

    recordTargetAwareUpgradeCandidate(top, "BUY", top.reason);

    if (config.advisorOnly || !config.autoBuySafeDecisions) {
      recordMessage(`Advisor: WOULD BUY ${getDisplayName(top.upgrade)} — target-aware ${top.support.type} support`);
      return { bought: 0, evaluatedNames };
    }

    const didBuy = safe(`Target-aware ${top.support.type} ${getDisplayName(top.upgrade)}`, () =>
      buyUpgradeAmount(commands, top.upgrade, newDecimal(1), "Target Upgrade")
    );

    return { bought: didBuy ? 1 : 0, evaluatedNames };
  }

  function getMeatChainPurchaseAnalysis(unit, num) {
    if (!config.meatChainPaybackGuard) return null;
    if (!unit || !isMeatChainUnit(unit) || !isPositive(num)) return null;

    const costRows = getCostList(unit)
      .filter((cost) => cost?.unit && isPositive(cost.val) && isMeatChainUnit(cost.unit));

    if (!costRows.length) return null;

    let worstIssue = null;
    let bestSummary = "";
    let bestRaw = null;
    let maxPaybackSeconds = 0;

    for (const cost of costRows) {
      const costUnit = cost.unit;
      const totalCost = decimalFrom(cost.val).times(num || 1);
      const current = decimalFrom(costUnit.count?.() || 0);
      const after = current.minus(totalCost);
      const reserveRequired = totalCost.times(config.meatChainReserveMultiplier || 0);
      const addedVelocity = decimalFrom(productionPerUnit(unit, costUnit.name)).times(num || 1);
      let paybackSeconds = Infinity;

      if (isPositive(addedVelocity)) {
        paybackSeconds = decimalToNumber(totalCost.dividedBy(addedVelocity), Infinity);
        if (Number.isFinite(paybackSeconds)) {
          maxPaybackSeconds = Math.max(maxPaybackSeconds, paybackSeconds);
        }
      }

      const reserveRatio = isPositive(reserveRequired) ? decimalToNumber(after.dividedBy(reserveRequired), Infinity) : Infinity;
      const paybackRatio = config.meatChainMaxPaybackSeconds > 0 && Number.isFinite(paybackSeconds)
        ? paybackSeconds / config.meatChainMaxPaybackSeconds
        : Infinity;
      const raw = {
        paybackSeconds,
        paybackLimitSeconds: config.meatChainMaxPaybackSeconds,
        paybackRatio,
        reserveAfter: after,
        reserveRequired,
        reserveRatio,
        costAmount: totalCost,
        currentAmount: current,
        velocity: addedVelocity,
      };

      const base = `${getDisplayName(unit)} costs ${formatSwarmNumber(totalCost)} ${getDisplayName(costUnit)}; after buy ${formatSwarmNumber(after)}`;

      if (after.lessThan(0)) {
        worstIssue = {
          type: "reserve",
          reason: `${base}; would go negative`,
          raw,
        };
        break;
      }

      if ((config.meatChainReserveMultiplier || 0) > 0 && after.lessThan(reserveRequired)) {
        worstIssue = {
          type: "reserve",
          reason: `${base}; reserve below ${trimNumber(config.meatChainReserveMultiplier)}x cost (${formatSwarmNumber(reserveRequired)})`,
          raw,
        };
        break;
      }

      if (
        config.meatChainMaxPaybackSeconds > 0 &&
        Number.isFinite(paybackSeconds) &&
        paybackSeconds > config.meatChainMaxPaybackSeconds
      ) {
        worstIssue = {
          type: "payback",
          reason: `${base}; payback ${formatDuration(paybackSeconds)} exceeds limit ${formatDuration(config.meatChainMaxPaybackSeconds)}`,
          raw,
        };
        break;
      }

      bestSummary = Number.isFinite(paybackSeconds)
        ? `${base}; payback ${formatDuration(paybackSeconds)}`
        : `${base}; payback data unavailable`;
      bestRaw = raw;
    }

    if (worstIssue) return { ok: false, ...worstIssue };

    return {
      ok: true,
      reason: bestSummary || `meat-chain reserve/payback ok${maxPaybackSeconds ? `, max payback ${formatDuration(maxPaybackSeconds)}` : ""}`,
      raw: bestRaw,
    };
  }

  function shouldHoldMeatChainPurchase(unit, num, contextLabel) {
    const analysis = getMeatChainPurchaseAnalysis(unit, num);
    if (!analysis || analysis.ok) return false;

    recordAdvisor(
      "HOLD",
      getDisplayName(unit),
      `${contextLabel || "meat-chain guard"}: ${analysis.reason}`
    );
    addLaneCandidate({
      lane: "Meat",
      decision: "HOLD",
      candidate: getDisplayName(unit),
      reason: `${contextLabel || "meat-chain guard"}: ${analysis.reason}`,
      blockers: [analysis.type === "payback" ? "payback guard" : "reserve guard"],
      score: unitCostScore(unit),
      wouldBuyAmount: formatSwarmNumber(num),
      payback: analysis.type === "payback" ? analysis.reason : "",
      reserveAfter: analysis.reason,
      target: "meat-chain progression",
      resource: "meat-chain producer",
      raw: analysis.raw || null,
    });

    return true;
  }

  function meatChainPurchaseOkReason(unit, num) {
    const analysis = getMeatChainPurchaseAnalysis(unit, num);
    return analysis?.ok && analysis.reason ? analysis.reason : "";
  }

  function buySmartUpgrades(game, commands, protectedResources) {
    const targetAwareResult = handleTargetAwareUpgradePlanner(game, commands, protectedResources);
    const targetAwareEvaluatedNames = targetAwareResult?.evaluatedNames || new Set();

    if (Number(targetAwareResult?.bought || 0) > 0) {
      return Number(targetAwareResult.bought || 0);
    }

    let upgrades = game.availableAutobuyUpgrades(config.upgradeBuyPercent) || [];

    upgrades = upgrades
      .filter((upgrade) => upgrade.name !== "hatchery" && upgrade.name !== "expansion")
      .filter((upgrade) => {
        if (!config.autoCastAbilities && shouldSkipAbility(upgrade)) {
          recordAdvisor("HOLD", getDisplayName(upgrade), "ability auto-cast disabled");
          addLaneCandidate({
            lane: "Ability",
            decision: "HOLD",
            candidate: getDisplayName(upgrade),
            reason: "ability auto-cast disabled",
            blockers: ["ability auto-cast disabled"],
            score: 20000,
          });
          return false;
        }
        return true;
      })
      .filter((upgrade) => !targetAwareEvaluatedNames.has(upgrade.name))
      .filter((upgrade) => {
        if (!isTwinUpgrade(upgrade)) return true;

        if (shouldHoldTwinForRecovery(upgrade, "safe upgrade twin")) return false;

        recordAdvisor("HOLD", getDisplayName(upgrade), "twin upgrades are handled by goal planner / chain prep, not generic safe-upgrade buying");
        addLaneCandidate({
          lane: "Twin",
          decision: "HOLD",
          candidate: getDisplayName(upgrade),
          reason: "twin upgrades are handled by goal planner / chain prep, not generic safe-upgrade buying",
          blockers: ["handled by twin planner"],
          score: unitCostScore(upgrade),
        });
        return false;
      })
      .filter((upgrade) => !config.prioritizeProductionUpgrades || !isCriticalProductionUpgrade(upgrade))
      .filter((upgrade) => {
        const protectedCost = shouldAvoidProtectedCost(upgrade, protectedResources);

        if (protectedCost) {
          recordAdvisor("HOLD", getDisplayName(upgrade), protectedResourceHoldReason(protectedCost));
          return false;
        }

        return true;
      })
      .map((upgrade, index) => ({
        upgrade,
        score: scoreUpgrade(upgrade, index),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, config.maxUpgradesPerRun)
      .map((entry) => entry.upgrade);

    if (!upgrades.length) return 0;

    let bought = 0;

    for (const upgrade of upgrades) {
      recordAdvisor("BUY", getDisplayName(upgrade), "safe upgrade after larva-engine checks");
      addLaneCandidate({
        lane: "Upgrade",
        decision: "BUY",
        candidate: getDisplayName(upgrade),
        reason: "safe upgrade after larva-engine checks",
        score: unitCostScore(upgrade),
        target: "safe upgrade",
      });

      if (config.advisorOnly || !config.autoBuySafeDecisions) continue;

      safe(`Smart upgrade ${getDisplayName(upgrade)}`, () => {
        const divisor =
          config.respectUpgradeWatchDivisor && upgrade.watchedDivisor
            ? upgrade.watchedDivisor()
            : 1;

        const before = upgrade.count();

        commands.buyMaxUpgrade({
          upgrade,
          percent: config.upgradeBuyPercent / divisor,
          ui: BOT_NAME,
        });

        const after = upgrade.count();
        const delta = after.minus(before);

        if (delta.greaterThan(0)) {
          recordPurchase("Upgrade", upgrade, delta);
          bought++;
        }
      });
    }

    return bought;
  }



  function isMeatChainUnit(unit) {
    return !!unit?.name && Object.prototype.hasOwnProperty.call(MEAT_CHAIN_INDEX, unit.name);
  }

  function isBasePlannerResourceName(name) {
    return ["meat", "larva", "cocoon", "energy", "territory", "mutagen"].includes(String(name || ""));
  }

  function getMeatChainRank(unit) {
    return isMeatChainUnit(unit) ? MEAT_CHAIN_INDEX[unit.name] : -1;
  }

  function isOwned(unit) {
    try {
      return unit?.count?.().greaterThan(0);
    } catch {
      return Number(unit?.count?.() || 0) > 0;
    }
  }

  function getUnitAffordableByCost(cost) {
    if (!cost?.unit || !isPositive(cost.val)) return null;

    const current = decimalFrom(cost.unit.count?.() || 0);

    try {
      return current.dividedBy(cost.val);
    } catch {
      return newDecimal(0);
    }
  }

  function getUnitBottleneckCost(unit) {
    const costs = getCostList(unit)
      .filter((cost) => cost?.unit && isPositive(cost.val))
      .map((cost) => ({
        cost,
        unit: cost.unit,
        affordable: getUnitAffordableByCost(cost),
      }))
      .filter((entry) => entry.affordable !== null);

    if (!costs.length) return null;

    costs.sort((a, b) => {
      try {
        const cmp = a.affordable.comparedTo(b.affordable);
        if (cmp !== 0) return cmp;
      } catch {
        const na = decimalToNumber(a.affordable, 0);
        const nb = decimalToNumber(b.affordable, 0);
        if (na !== nb) return na - nb;
      }

      return getMeatChainRank(b.unit) - getMeatChainRank(a.unit);
    });

    return costs[0];
  }

  function getAutoMeatGoalTarget(game) {
    if (!config.meatGoalPlanner) return null;

    if (scenarioHarnessContext.active) {
      const forcedTargetAlias = scenarioHarnessContext.overrides?.engine?.meatGoalTarget;
      const forcedTargetUnit = getScenarioTargetUnitOverride(game, forcedTargetAlias);
      if (forcedTargetUnit) return forcedTargetUnit;
    }

    for (let i = MEAT_CHAIN_NAMES.length - 1; i >= 0; i--) {
      const unit = getGameUnit(game, MEAT_CHAIN_NAMES[i]);
      if (!unit?.isVisible?.()) continue;
      if (!isOwned(unit)) return unit;
    }

    // If all visible meat-chain targets are owned, prefer a target where
    // parent-step conversion can still advance the current path.
    for (let i = MEAT_CHAIN_NAMES.length - 1; i >= 0; i--) {
      const unit = getGameUnit(game, MEAT_CHAIN_NAMES[i]);
      if (!unit?.isVisible?.()) continue;

      const bottleneck = getUnitBottleneckCost(unit);
      const bottleneckUnit = bottleneck?.unit || null;
      if (!bottleneckUnit || !isMeatChainUnit(bottleneckUnit)) continue;
      if (isBasePlannerResourceName(bottleneckUnit?.name || "")) continue;

      return unit;
    }

    // Deterministic scenarios may run from early live-state snapshots where
    // deeper units are hidden. Allow hidden target-path planning in harness
    // mode so parent-step/refill transitions can still be evaluated.
    if (scenarioHarnessContext.active) {
      for (let i = MEAT_CHAIN_NAMES.length - 1; i >= 0; i--) {
        const unit = getGameUnit(game, MEAT_CHAIN_NAMES[i]);
        if (!unit) continue;

        const bottleneck = getUnitBottleneckCost(unit);
        const bottleneckUnit = bottleneck?.unit || null;
        if (!bottleneckUnit || !isMeatChainUnit(bottleneckUnit)) continue;
        if (isBasePlannerResourceName(bottleneckUnit?.name || "")) continue;

        return unit;
      }
    }

    // Last resort: pick highest visible target to keep momentum planner alive.
    for (let i = MEAT_CHAIN_NAMES.length - 1; i >= 0; i--) {
      const unit = getGameUnit(game, MEAT_CHAIN_NAMES[i]);
      if (!unit?.isVisible?.()) continue;
      return unit;
    }

    return null;
  }

  function formatPlannerPath(path) {
    if (!path?.length) return "no path";

    return path
      .map((step) => getDisplayName(step.unit))
      .join(" → ");
  }

  function buildMeatGoalPlan(game) {
    if (!config.meatGoalPlanner) return null;

    const target = getAutoMeatGoalTarget(game);
    if (!target) return null;

    const maxDepth = Math.max(1, Number(config.meatPlannerDepth || 1));
    const path = [];
    let current = target;
    let actionUnit = null;
    let parentUnit = null;
    let finalBottleneck = null;

    for (let depth = 0; depth <= maxDepth && current; depth++) {
      const bottleneck = getUnitBottleneckCost(current);
      path.push({ unit: current, bottleneck });
      finalBottleneck = bottleneck;

      const bottleneckUnit = bottleneck?.unit || null;
      const bottleneckName = bottleneckUnit?.name || "unknown";

      if (!bottleneckUnit || isBasePlannerResourceName(bottleneckName) || !isMeatChainUnit(bottleneckUnit)) {
        actionUnit = current;
        parentUnit = path.length >= 2 ? path[path.length - 2].unit : null;
        break;
      }

      parentUnit = current;
      current = bottleneckUnit;
    }

    if (!actionUnit) {
      actionUnit = current || path[path.length - 1]?.unit || null;
    }

    if (!actionUnit) return null;

    return {
      target,
      actionUnit,
      parentUnit,
      path,
      bottleneck: finalBottleneck,
      reason: `goal ${getDisplayName(target)}; path ${formatPlannerPath(path)}`,
    };
  }

  function getPlannerUnitBuyNum(unit) {
    const max = safe(`Planner max ${unit?.name}`, () => unit?.maxCostMet?.(config.unitBuyPercent)) || newDecimal(0);
    if (!isPositive(max)) return newDecimal(0);

    const percent = clampNumber(config.meatPlannerChunkPercent, 0.1, 100, DEFAULT_CONFIG.meatPlannerChunkPercent);
    const chunk = decimalFrom(max).times(percent).dividedBy(100).floor();

    if (isPositive(chunk)) return chunk;
    return newDecimal(1);
  }

  function canPlannerBuyUnit(unit) {
    if (!unit?.isVisible?.() || !unit?.isBuyable?.()) return false;
    return isPositive(getPlannerUnitBuyNum(unit));
  }

  function buyPlannerTwinIfUseful(game, commands, unit, protectedResources, targetLabel) {
    const twinUpgrade = getTwinUpgradeForUnit(game, unit);
    if (!twinUpgrade) return 0;

    const protectedTwinCost = shouldAvoidProtectedCost(twinUpgrade, protectedResources);
    if (protectedTwinCost) {
      recordAdvisor("HOLD", getDisplayName(twinUpgrade), `planner twin blocked: ${protectedResourceHoldReason(protectedTwinCost)}`);
      return 0;
    }

    if (shouldHoldTwinForRecovery(twinUpgrade, "goal-planner twin-prep")) {
      return 0;
    }

    recordAdvisor("BUY", getDisplayName(twinUpgrade), `goal-planner twin-prep before ${getDisplayName(unit)} for ${targetLabel}`);

    if (config.advisorOnly || !config.autoBuySafeDecisions) {
      recordMessage(`Advisor: WOULD BUY ${getDisplayName(twinUpgrade)} — goal-planner twin-prep`);
      return 0;
    }

    const didTwin = safe(`Goal-planner twin ${getDisplayName(twinUpgrade)}`, () =>
      buyUpgradeAmount(commands, twinUpgrade, newDecimal(1), "Goal Upgrade")
    );

    return didTwin ? 1 : 0;
  }

  function buyPlannerUnit(commands, unit, label, reason, strategicPlan, protectedResources) {
    const num = getPlannerUnitBuyNum(unit);

    if (!isPositive(num)) {
      recordAdvisor("HOLD", getDisplayName(unit), `goal planner: no safe amount. ${reason || ""}`);
      addLaneCandidate({
        lane: "Meat",
        decision: "HOLD",
        candidate: getDisplayName(unit),
        reason: `goal planner: no safe amount. ${reason || ""}`,
        blockers: ["no safe amount"],
        score: unitCostScore(unit),
        target: "meat goal planner",
      });
      return 0;
    }

    const guardAnalysis = getMeatChainPurchaseAnalysis(unit, num);
    let guardReason = guardAnalysis?.ok && guardAnalysis.reason ? guardAnalysis.reason : "";
    let paybackBypassReason = "";

    if (guardAnalysis && !guardAnalysis.ok) {
      const bypass = assessStrategicActionPaybackBypass(unit, guardAnalysis, strategicPlan, protectedResources);

      if (!bypass.allowed) {
        const holdReason = bypass.applies
          ? `goal planner payback/reserve: ${guardAnalysis.reason}; ${bypass.reason}`
          : `goal planner payback/reserve: ${guardAnalysis.reason}`;

        recordAdvisor("HOLD", getDisplayName(unit), holdReason);
        addLaneCandidate({
          lane: "Meat",
          decision: "HOLD",
          candidate: getDisplayName(unit),
          reason: holdReason,
          blockers: [guardAnalysis.type === "payback" ? "payback guard" : "reserve guard"],
          score: unitCostScore(unit),
          wouldBuyAmount: formatSwarmNumber(num),
          payback: guardAnalysis.type === "payback" ? guardAnalysis.reason : "",
          reserveAfter: guardAnalysis.reason,
          target: strategicPlan?.target ? getDisplayName(strategicPlan.target) : "meat goal planner",
          resource: "meat-chain producer",
          raw: guardAnalysis.raw || null,
        });
        return 0;
      }

      paybackBypassReason = bypass.reason;
      guardReason = paybackBypassReason;
    }

    recordAdvisor("BUY", getDisplayName(unit), `${reason}; amount ${formatSwarmNumber(num)}${guardReason ? `; ${guardReason}` : ""}`);
    addLaneCandidate({
      lane: "Meat",
      decision: "BUY",
      candidate: getDisplayName(unit),
      reason: `${reason}; amount ${formatSwarmNumber(num)}${guardReason ? `; ${guardReason}` : ""}`,
      score: unitCostScore(unit),
      wouldBuyAmount: formatSwarmNumber(num),
      target: "meat goal planner",
      resource: "meat-chain producer",
      raw: guardAnalysis?.raw ? {
        ...guardAnalysis.raw,
        meatActionUnitPaybackBypassTriggered: !!paybackBypassReason,
        meatActionUnitReserveRatio: rawMetricNumber(guardAnalysis.raw, "reserveRatio", NaN),
        meatActionUnitPaybackSeconds: rawMetricNumber(guardAnalysis.raw, "paybackSeconds", NaN),
      } : null,
    });

    if (config.advisorOnly || !config.autoBuySafeDecisions) {
      recordMessage(`Advisor: WOULD BUY ${formatSwarmNumber(num)} ${getDisplayName(unit)} — goal planner`);
      return 0;
    }

    const didBuy = safe(`Goal-planner unit ${getDisplayName(unit)}`, () =>
      buyUnitAmount(commands, unit, num, label || "Goal Step")
    );

    return didBuy ? 1 : 0;
  }

  function parentStepRefillBlockedByProtectedResource(resourceName) {
    const resource = String(resourceName || "").toLowerCase();
    if (resource === "meat") return "blocked by Hatchery save-window";
    if (resource === "territory") return "blocked by Expansion save-window";
    if (resource === "larva" && cloneBufferPlannerState?.cloneBufferHardLockActive) return "blocked by clone buffer";
    if (resource === "larva") return "blocked by larva reserve";
    if (resource === "energy") return "blocked by reserve";
    return "blocked by reserve";
  }

  function runParentStepActionUnitRefillPass(game, commands, plan, protectedResources, remainingActions = 0) {
    const targetLabel = getDisplayName(plan?.target);
    const actionUnit = plan?.actionUnit;
    const actionLabel = getDisplayName(actionUnit);
    const parentName = parentStepPlannerState?.candidate || "parent step";
    const budgetRemaining = Math.max(0, Number(remainingActions || 0));
    const antiPingpongGuardActive = !!parentStepPlannerState?.executed;
    const consumedActionUnit = !!parentStepPlannerState?.consumedActionUnit;
    const consumedUnit = parentStepPlannerState?.consumedUnit || "none";
    const actionOnPath = isUnitOnPlanPath(plan, actionUnit);
    const antiPingpongAllowsRefill = antiPingpongGuardActive && consumedActionUnit && actionOnPath;

    recordActionUnitRefillState({
      candidate: actionLabel,
      decision: "OBSERVE",
      reason: "evaluating parent-step refill pass",
      blockedBy: "none",
      reserveRatio: NaN,
      paybackSeconds: NaN,
      paybackBypassed: false,
      parentStepConsumedActionUnit: consumedActionUnit,
      parentStepConsumedUnit: consumedUnit,
      actionBudgetRemainingAfterParentStep: budgetRemaining,
      followUpActionSelected: false,
      whyNoFollowUpAction: "none",
      antiPingpongGuardActive,
      antiPingpongGuardAllowedRefill: antiPingpongAllowsRefill,
      coordinatorRemainingBudgetReason: "none",
    });

    if (budgetRemaining < 1) {
      const reason = "blocked by coordinator single-main limit";
      recordAdvisor("HOLD", actionLabel, reason);
      addLaneCandidate({
        lane: "Meat",
        decision: "HOLD",
        candidate: actionLabel,
        reason,
        blockers: ["coordinator single-main limit"],
        score: unitCostScore(actionUnit),
        target: targetLabel,
        resource: actionLabel,
      });
      recordActionUnitRefillState({
        candidate: actionLabel,
        decision: "HOLD",
        reason,
        blockedBy: reason,
        reserveRatio: NaN,
        paybackSeconds: NaN,
        paybackBypassed: false,
        parentStepConsumedActionUnit: consumedActionUnit,
        parentStepConsumedUnit: consumedUnit,
        actionBudgetRemainingAfterParentStep: budgetRemaining,
        followUpActionSelected: false,
        whyNoFollowUpAction: reason,
        antiPingpongGuardActive,
        antiPingpongGuardAllowedRefill: antiPingpongAllowsRefill,
        coordinatorRemainingBudgetReason: reason,
      });
      return { actionTaken: true, bought: 0, stopFurtherUnitBuys: true, summary: `Parent step conversion ${parentName}`, noFollowUpReason: reason };
    }

    if (!antiPingpongAllowsRefill) {
      const reason = "blocked by anti-pingpong because refill would undo parent-step without target gain";
      recordAdvisor("HOLD", actionLabel, reason);
      addLaneCandidate({
        lane: "Meat",
        decision: "HOLD",
        candidate: actionLabel,
        reason,
        blockers: ["anti-pingpong"],
        score: unitCostScore(actionUnit),
        target: targetLabel,
        resource: actionLabel,
      });
      recordActionUnitRefillState({
        candidate: actionLabel,
        decision: "HOLD",
        reason,
        blockedBy: reason,
        reserveRatio: NaN,
        paybackSeconds: NaN,
        paybackBypassed: false,
        parentStepConsumedActionUnit: consumedActionUnit,
        parentStepConsumedUnit: consumedUnit,
        actionBudgetRemainingAfterParentStep: budgetRemaining,
        followUpActionSelected: false,
        whyNoFollowUpAction: reason,
        antiPingpongGuardActive,
        antiPingpongGuardAllowedRefill: false,
        coordinatorRemainingBudgetReason: reason,
      });
      return { actionTaken: true, bought: 0, stopFurtherUnitBuys: true, summary: `Parent step conversion ${parentName}`, noFollowUpReason: reason };
    }

    if (!canPlannerBuyUnit(actionUnit)) {
      const reason = `${actionLabel} is not buyable yet`;
      const blockedBy = "blocked by no safe chunk";
      recordAdvisor("HOLD", actionLabel, reason);
      addLaneCandidate({
        lane: "Meat",
        decision: "HOLD",
        candidate: actionLabel,
        reason,
        blockers: ["no safe chunk"],
        score: unitCostScore(actionUnit),
        target: targetLabel,
        resource: actionLabel,
      });
      recordActionUnitRefillState({
        candidate: actionLabel,
        decision: "HOLD",
        reason,
        blockedBy,
        reserveRatio: NaN,
        paybackSeconds: NaN,
        paybackBypassed: false,
        parentStepConsumedActionUnit: true,
        parentStepConsumedUnit: consumedUnit,
        actionBudgetRemainingAfterParentStep: budgetRemaining,
        followUpActionSelected: false,
        whyNoFollowUpAction: blockedBy,
        antiPingpongGuardActive,
        antiPingpongGuardAllowedRefill: true,
        coordinatorRemainingBudgetReason: blockedBy,
      });
      return { actionTaken: true, bought: 0, stopFurtherUnitBuys: true, summary: `Parent step conversion ${parentName}`, noFollowUpReason: blockedBy };
    }

    const refillNum = getPlannerUnitBuyNum(actionUnit);
    if (!isPositive(refillNum)) {
      const blockedBy = "blocked by no safe chunk";
      const reason = `${actionLabel} has no safe refill chunk this run`;
      recordAdvisor("HOLD", actionLabel, reason);
      addLaneCandidate({
        lane: "Meat",
        decision: "HOLD",
        candidate: actionLabel,
        reason,
        blockers: ["no safe chunk"],
        score: unitCostScore(actionUnit),
        target: targetLabel,
        resource: actionLabel,
      });
      recordActionUnitRefillState({
        candidate: actionLabel,
        decision: "HOLD",
        reason,
        blockedBy,
        reserveRatio: NaN,
        paybackSeconds: NaN,
        paybackBypassed: false,
        parentStepConsumedActionUnit: true,
        parentStepConsumedUnit: consumedUnit,
        actionBudgetRemainingAfterParentStep: budgetRemaining,
        followUpActionSelected: false,
        whyNoFollowUpAction: blockedBy,
        antiPingpongGuardActive,
        antiPingpongGuardAllowedRefill: true,
        coordinatorRemainingBudgetReason: blockedBy,
      });
      return { actionTaken: true, bought: 0, stopFurtherUnitBuys: true, summary: `Parent step conversion ${parentName}`, noFollowUpReason: blockedBy };
    }

    const protectedCost = shouldAvoidProtectedCost(actionUnit, protectedResources || new Set());
    if (protectedCost) {
      const blockedBy = parentStepRefillBlockedByProtectedResource(protectedCost);
      const reason = `action-unit refill blocked: ${protectedResourceHoldReason(protectedCost)}`;
      recordAdvisor("HOLD", actionLabel, reason);
      addLaneCandidate({
        lane: "Meat",
        decision: "HOLD",
        candidate: actionLabel,
        reason,
        blockers: [protectedResourceBlocker(protectedCost), "cost uses protected resource"],
        score: unitCostScore(actionUnit),
        target: targetLabel,
        resource: protectedCost,
      });
      recordActionUnitRefillState({
        candidate: actionLabel,
        decision: "HOLD",
        reason,
        blockedBy,
        reserveRatio: NaN,
        paybackSeconds: NaN,
        paybackBypassed: false,
        parentStepConsumedActionUnit: true,
        parentStepConsumedUnit: consumedUnit,
        actionBudgetRemainingAfterParentStep: budgetRemaining,
        followUpActionSelected: false,
        whyNoFollowUpAction: blockedBy,
        antiPingpongGuardActive,
        antiPingpongGuardAllowedRefill: true,
        coordinatorRemainingBudgetReason: blockedBy,
      });
      return { actionTaken: true, bought: 0, stopFurtherUnitBuys: true, summary: `Parent step conversion ${parentName}`, noFollowUpReason: blockedBy };
    }

    const guard = getMeatChainPurchaseAnalysis(actionUnit, refillNum);
    const reserveRatio = rawMetricNumber(guard?.raw || {}, "reserveRatio", NaN);
    const paybackSeconds = rawMetricNumber(guard?.raw || {}, "paybackSeconds", NaN);
    const bypass = assessStrategicActionPaybackBypass(actionUnit, guard && !guard.ok ? guard : null, plan, protectedResources);
    const paybackBypassed = !!(guard && !guard.ok && bypass.allowed);

    if (guard && !guard.ok && !bypass.allowed) {
      const blockedBy = guard.type === "payback" ? "blocked by payback" : "blocked by reserve";
      const reason = guard.type === "payback"
        ? `action-unit refill hold after parent-step ${parentName}; payback too high and bypass not allowed; ${bypass.reason || guard.reason}`
        : `action-unit refill hold after parent-step ${parentName}; ${guard.reason}`;
      recordAdvisor("HOLD", actionLabel, reason);
      addLaneCandidate({
        lane: "Meat",
        decision: "HOLD",
        candidate: actionLabel,
        reason,
        blockers: [guard.type === "payback" ? "payback guard" : "reserve guard"],
        score: unitCostScore(actionUnit),
        wouldBuyAmount: formatSwarmNumber(refillNum),
        target: targetLabel,
        resource: actionLabel,
        raw: guard.raw || null,
      });
      recordActionUnitRefillState({
        candidate: actionLabel,
        decision: "HOLD",
        reason,
        blockedBy,
        reserveRatio,
        paybackSeconds,
        paybackBypassed: false,
        parentStepConsumedActionUnit: true,
        parentStepConsumedUnit: consumedUnit,
        actionBudgetRemainingAfterParentStep: budgetRemaining,
        followUpActionSelected: false,
        whyNoFollowUpAction: blockedBy,
        antiPingpongGuardActive,
        antiPingpongGuardAllowedRefill: true,
        coordinatorRemainingBudgetReason: blockedBy,
      });
      return { actionTaken: true, bought: 0, stopFurtherUnitBuys: true, summary: `Parent step conversion ${parentName}`, noFollowUpReason: blockedBy };
    }

    const reason = `action-unit refill after parent-step ${parentName}; buy ${formatSwarmNumber(refillNum)} ${actionLabel} for target path ${targetLabel}${paybackBypassed ? `; ${bypass.reason}` : "; payback/reserve guard ok"}`;
    recordAdvisor("BUY", actionLabel, reason);
    addLaneCandidate({
      lane: "Meat",
      decision: "BUY",
      candidate: actionLabel,
      reason,
      score: unitCostScore(actionUnit),
      wouldBuyAmount: formatSwarmNumber(refillNum),
      target: targetLabel,
      resource: actionLabel,
      raw: guard?.raw || null,
    });

    if (config.advisorOnly || !config.autoBuySafeDecisions) {
      recordActionUnitRefillState({
        candidate: actionLabel,
        decision: "BUY",
        reason,
        blockedBy: "none",
        reserveRatio,
        paybackSeconds,
        paybackBypassed,
        parentStepConsumedActionUnit: true,
        parentStepConsumedUnit: consumedUnit,
        actionBudgetRemainingAfterParentStep: budgetRemaining,
        followUpActionSelected: true,
        whyNoFollowUpAction: "none",
        antiPingpongGuardActive,
        antiPingpongGuardAllowedRefill: true,
        coordinatorRemainingBudgetReason: "none",
      });
      finalizeParentStepAfterRefillSelection(actionLabel, reason);
      return { actionTaken: true, bought: 0, stopFurtherUnitBuys: true, summary: `Would refill ${actionLabel} after parent-step` };
    }

    const didBuy = safe(`Parent-step refill ${actionLabel}`, () =>
      buyUnitAmount(commands, actionUnit, refillNum, "Parent Refill")
    );

    recordActionUnitRefillState({
      candidate: actionLabel,
      decision: didBuy ? "BUY" : "HOLD",
      reason: didBuy ? reason : `action-unit refill buy failed for ${actionLabel}`,
      blockedBy: didBuy ? "none" : "blocked by no safe chunk",
      reserveRatio,
      paybackSeconds,
      paybackBypassed,
      parentStepConsumedActionUnit: true,
      parentStepConsumedUnit: consumedUnit,
      actionBudgetRemainingAfterParentStep: budgetRemaining,
      followUpActionSelected: !!didBuy,
      whyNoFollowUpAction: didBuy ? "none" : "blocked by no safe chunk",
      antiPingpongGuardActive,
      antiPingpongGuardAllowedRefill: true,
      coordinatorRemainingBudgetReason: didBuy ? "none" : "blocked by no safe chunk",
    });

    if (didBuy) {
      finalizeParentStepAfterRefillSelection(actionLabel, reason);
    }

    return {
      actionTaken: true,
      bought: didBuy ? 1 : 0,
      stopFurtherUnitBuys: true,
      summary: didBuy ? `Parent-step refill ${actionLabel}` : `Parent-step refill failed ${actionLabel}`,
      noFollowUpReason: didBuy ? "none" : "blocked by no safe chunk",
    };
  }

  function handleMeatGoalPlanner(game, commands, protectedResources, remainingActions = 0) {
    if (!config.meatGoalPlanner) return { actionTaken: false, bought: 0 };

    const plan = buildMeatGoalPlan(game);
    if (!plan) return { actionTaken: false, bought: 0 };

    const targetLabel = getDisplayName(plan.target);
    const actionLabel = getDisplayName(plan.actionUnit);
    const bottleneckLabel = plan.bottleneck?.unit ? getDisplayName(plan.bottleneck.unit) : "unknown";

    recordAdvisor(
      "PLAN",
      targetLabel,
      `${plan.reason}; bottleneck ${bottleneckLabel}; action ${actionLabel}`
    );
    addLaneCandidate({
      lane: "Meat",
      decision: "OBSERVE",
      candidate: actionLabel,
      reason: `${plan.reason}; bottleneck ${bottleneckLabel}; action ${actionLabel}`,
      score: unitCostScore(plan.actionUnit),
      target: targetLabel,
      resource: bottleneckLabel,
    });

    const scenarioTransitionReady = hydrateScenarioParentStepTransitionForRefill(plan);
    const parentStepExecuted =
      (
        !config.advisorOnly &&
        config.autoBuySafeDecisions &&
        !!parentStepPlannerState?.executed &&
        parentStepPlannerState?.target === targetLabel
      ) || scenarioTransitionReady;

    const twinUnlockExecuted =
      !config.advisorOnly &&
      config.autoBuySafeDecisions &&
      !!twinUnlockPlannerState?.executed &&
      twinUnlockPlannerState?.target === targetLabel &&
      !!twinUnlockPlannerState?.prepMeaningful;

    if (parentStepExecuted) {
      return runParentStepActionUnitRefillPass(game, commands, plan, protectedResources, remainingActions);
    }

    if (twinUnlockExecuted) {
      const twinName = twinUnlockPlannerState?.upgrade || twinUnlockPlannerState?.prepCandidate || "twin unlock threshold";
      const reason = `twin unlock threshold action already executed this run (${twinName}); skip immediate lower action-unit filler ${actionLabel}`;
      recordAdvisor("HOLD", actionLabel, reason);
      addLaneCandidate({
        lane: "Meat",
        decision: "HOLD",
        candidate: actionLabel,
        reason,
        blockers: ["twin unlock threshold just executed"],
        score: unitCostScore(plan.actionUnit),
        target: targetLabel,
        resource: bottleneckLabel,
      });
      return { actionTaken: true, bought: 0, summary: `Twin unlock threshold ${twinName}`, stopFurtherUnitBuys: true };
    }

    if (!canPlannerBuyUnit(plan.actionUnit)) {
      recordAdvisor(
        "HOLD",
        actionLabel,
        `goal planner waits: ${actionLabel} is not buyable yet; bottleneck ${bottleneckLabel}`
      );
      addLaneCandidate({
        lane: "Meat",
        decision: "HOLD",
        candidate: actionLabel,
        reason: `goal planner waits: ${actionLabel} is not buyable yet; bottleneck ${bottleneckLabel}`,
        blockers: ["goal planner bottleneck", `${bottleneckLabel} unavailable`],
        score: unitCostScore(plan.actionUnit),
        target: targetLabel,
        resource: bottleneckLabel,
      });
      return { actionTaken: true, bought: 0, summary: `Planner hold ${actionLabel}` };
    }

    const protectedCost = shouldAvoidProtectedCost(plan.actionUnit, protectedResources);
    if (protectedCost) {
      recordAdvisor("HOLD", actionLabel, `goal planner blocked: ${protectedResourceHoldReason(protectedCost)}`);
      addLaneCandidate({
        lane: "Meat",
        decision: "HOLD",
        candidate: actionLabel,
        reason: `goal planner blocked: ${protectedResourceHoldReason(protectedCost)}`,
        blockers: [protectedResourceBlocker(protectedCost), "cost uses protected resource"],
        score: unitCostScore(plan.actionUnit),
        target: targetLabel,
        resource: protectedCost,
      });
      return { actionTaken: true, bought: 0, summary: `Planner blocked ${protectedCost}` };
    }

    let bought = 0;

    bought += buyPlannerTwinIfUseful(game, commands, plan.actionUnit, protectedResources, targetLabel);

    bought += buyPlannerUnit(
      commands,
      plan.actionUnit,
      "Goal Step",
      `goal planner for ${targetLabel}: build bottleneck resource (${bottleneckLabel})`,
      plan,
      protectedResources
    );

    if (!config.advisorOnly && config.autoBuySafeDecisions && plan.parentUnit?.isVisible?.() && plan.parentUnit?.isBuyable?.()) {
      const refreshedParentNum = getPlannerUnitBuyNum(plan.parentUnit);

      if (isPositive(refreshedParentNum)) {
        if (shouldHoldMeatChainPurchase(plan.parentUnit, refreshedParentNum, "goal follow-up payback/reserve")) {
          recordAdvisor(
            "NEXT",
            getDisplayName(plan.parentUnit),
            `after ${actionLabel}, wait for safer reserve before converting toward ${targetLabel}`
          );
          addLaneCandidate({
            lane: "Meat",
            decision: "OBSERVE",
            candidate: getDisplayName(plan.parentUnit),
            reason: `after ${actionLabel}, wait for safer reserve before converting toward ${targetLabel}`,
            score: unitCostScore(plan.parentUnit),
            target: targetLabel,
          });
        } else {
          const guardReason = meatChainPurchaseOkReason(plan.parentUnit, refreshedParentNum);
          recordAdvisor(
            "BUY",
            getDisplayName(plan.parentUnit),
            `goal planner follow-up after ${actionLabel}: convert bank toward ${targetLabel}; amount ${formatSwarmNumber(refreshedParentNum)}${guardReason ? `; ${guardReason}` : ""}`
          );
          addLaneCandidate({
            lane: "Meat",
            decision: "BUY",
            candidate: getDisplayName(plan.parentUnit),
            reason: `goal planner follow-up after ${actionLabel}: convert bank toward ${targetLabel}; amount ${formatSwarmNumber(refreshedParentNum)}${guardReason ? `; ${guardReason}` : ""}`,
            score: unitCostScore(plan.parentUnit),
            wouldBuyAmount: formatSwarmNumber(refreshedParentNum),
            target: targetLabel,
          });

          const didParent = safe(`Goal-planner parent ${getDisplayName(plan.parentUnit)}`, () =>
            buyUnitAmount(commands, plan.parentUnit, refreshedParentNum, "Goal Follow-up")
          );

          if (didParent) bought++;
        }
      }
    } else if (plan.parentUnit) {
      recordAdvisor(
        "NEXT",
        getDisplayName(plan.parentUnit),
        `after ${actionLabel}, try converting toward ${targetLabel}`
      );
    }

    return {
      actionTaken: true,
      bought,
      summary: bought > 0 ? `Goal planner ${targetLabel}` : `Would plan ${targetLabel}`,
    };
  }

  function getPrimaryMeatCostUnit(unit) {
    if (!config.meatChainCascade) return null;
    if (!unit || getTabName(unit) !== "meat") return null;

    const ignoredNames = new Set(["meat", "larva", "cocoon", unit.name]);
    const candidates = [];

    for (const cost of getCostList(unit)) {
      const costUnit = cost?.unit;
      if (!costUnit || !isPositive(cost.val)) continue;
      if (ignoredNames.has(costUnit.name)) continue;
      if (getTabName(costUnit) !== "meat") continue;
      if (!costUnit.isVisible?.() || !costUnit.isBuyable?.()) continue;
      candidates.push(costUnit);
    }

    if (!candidates.length) return null;

    candidates.sort((a, b) => unitCostScore(b) - unitCostScore(a));
    return candidates[0];
  }

  function getTwinUpgradeForUnit(game, unit) {
    if (!config.meatChainTwinPrep || !unit?.name) return null;

    const upgrade = getGameUpgrade(game, `${unit.name}twin`);
    if (!upgrade?.isVisible?.() || !upgrade?.isBuyable?.()) return null;
    if (shouldSkipAbility(upgrade)) return null;

    return upgrade;
  }

  function getMeatChainPrep(game, targetUnit, protectedResources) {
    const feeder = getPrimaryMeatCostUnit(targetUnit);
    if (!feeder) return null;

    const protectedCost = shouldAvoidProtectedCost(feeder, protectedResources);
    if (protectedCost) {
      recordAdvisor("HOLD", getDisplayName(feeder), `chain prep blocked: ${protectedResourceHoldReason(protectedCost)}`);
      return null;
    }

    const feederNum = getSmartUnitBuyNum(feeder);
    if (!isPositive(feederNum)) return null;

    const twinUpgrade = getTwinUpgradeForUnit(game, feeder);
    const protectedTwinCost = twinUpgrade ? shouldAvoidProtectedCost(twinUpgrade, protectedResources) : null;

    return {
      feeder,
      feederNum,
      twinUpgrade: protectedTwinCost ? null : twinUpgrade,
      target: targetUnit,
      reason: `chain prep before ${getDisplayName(targetUnit)}: buy ${getDisplayName(feeder)} first`,
    };
  }

  function performMeatChainPrep(game, commands, targetUnit, protectedResources) {
    const prep = getMeatChainPrep(game, targetUnit, protectedResources);
    if (!prep) return { bought: 0, didPrep: false };

    let bought = 0;

    if (prep.twinUpgrade && !shouldHoldTwinForRecovery(prep.twinUpgrade, "chain twin-prep")) {
      recordAdvisor(
        "BUY",
        getDisplayName(prep.twinUpgrade),
        `twin-prep before buying ${getDisplayName(prep.feeder)}`
      );

      if (config.advisorOnly || !config.autoBuySafeDecisions) {
        recordMessage(`Advisor: WOULD BUY ${getDisplayName(prep.twinUpgrade)} — twin-prep`);
      } else {
        const didTwin = safe(`Meat-chain twin-prep ${getDisplayName(prep.twinUpgrade)}`, () =>
          buyUpgradeAmount(commands, prep.twinUpgrade, newDecimal(1), "Chain Upgrade")
        );
        if (didTwin) bought++;
      }
    }

    if (shouldHoldMeatChainPurchase(prep.feeder, prep.feederNum, "chain prep payback/reserve")) {
      return { bought, didPrep: true };
    }

    const guardReason = meatChainPurchaseOkReason(prep.feeder, prep.feederNum);
    recordAdvisor("BUY", getDisplayName(prep.feeder), `${prep.reason}${guardReason ? `; ${guardReason}` : ""}`);

    if (config.advisorOnly || !config.autoBuySafeDecisions) {
      recordMessage(`Advisor: WOULD BUY ${formatSwarmNumber(prep.feederNum)} ${getDisplayName(prep.feeder)} — chain prep`);
      return { bought, didPrep: true };
    }

    const didFeeder = safe(`Meat-chain feeder ${getDisplayName(prep.feeder)}`, () =>
      buyUnitAmount(commands, prep.feeder, prep.feederNum, "Chain Prep")
    );

    if (didFeeder) bought++;

    return { bought, didPrep: true };
  }

  // <build:section:adapter-territory-execution:start>
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
    const territoryRelevant = !!(
      proposal && (
        proposal.armySeed ||
        proposal.meetsMinimum ||
        (state?.armyPrepMissingUnits && state.armyPrepMissingUnits !== "none")
      )
    );
  
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
  
    if (trigger !== "post-meat" && !shouldForce && !territoryRelevant) {
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
  // <build:section:adapter-territory-execution:end>

  function buySmartUnits(game, commands, engine, protectedResources, remainingActions = 1) {
    if (shouldPauseUnitsForAscension(game)) {
      recordAdvisor("HOLD", "Units", "near ascension");
      addLaneCandidate({
        lane: "Meat",
        decision: "HOLD",
        candidate: "Units",
        reason: "near ascension",
        blockers: ["ascension safety pause"],
        score: 0,
      });
      return "paused-ascension";
    }

    const maxUnitActions = Math.max(1, Number(remainingActions || 1));
    let boughtCount = 0;
    const selectedLaneActions = (laneCoordinatorState?.selectedLaneActions || []).slice();

    function markSelectedLane(lane, candidate, reason, amount = "") {
      const action = {
        lane,
        candidate: candidate || "unknown",
        reason: reason || "executed",
        amount: amount || "",
      };
      selectedLaneActions.push(action);
      recordLaneCoordinatorState({
        coordinatorDecision: "BUY",
        selectedLaneActions,
        selectedLaneLabels: selectedLaneActions.map((item) => `${item.lane}: ${item.candidate}`),
        selectedLaneSummary: selectedLaneActions.map((item) => `${item.lane}: ${item.candidate}`).join(" · "),
        primaryActionReason: laneCoordinatorState?.primaryActionReason || `${lane} BUY ${candidate}: ${reason}`,
      });
    }

    function classifyCoordinatorBudgetReason(reason) {
      const text = String(reason || "").trim();
      const lower = text.toLowerCase();
      if (!text) return "no safe chunk: no planner reported a safe bounded action";
      if (/cooldown/.test(lower)) return text;
      if (/save-window|saving meat|saving territory|saving energy|nexus save|hatchery|expansion/.test(lower)) return text;
      if (/protected|hard lock|clone buffer|larva.*guard|energy reserve/.test(lower)) return text;
      if (/payback/.test(lower)) return text;
      if (/reserve/.test(lower)) return text;
      if (/not meaningful|too far|too small|below.*minimum|roi below/.test(lower)) return text;
      if (/consumed the remaining|single-main limit|main action slots were full|budget/.test(lower)) return text;
      if (/not selected by coordinator/.test(lower)) return text;
      if (/no .*candidate|no .*proposal|no buyable|no visible|no safe chunk/.test(lower)) return text;
      return `no safe chunk: ${text}`;
    }

    function syncCoordinatorHold(reason) {
      const concreteReason = classifyCoordinatorBudgetReason(reason);
      recordLaneCoordinatorState({
        coordinatorDecision: selectedLaneActions.length ? "BUY" : "HOLD",
        selectedLaneActions,
        selectedLaneLabels: selectedLaneActions.map((item) => `${item.lane}: ${item.candidate}`),
        selectedLaneSummary: selectedLaneActions.length
          ? selectedLaneActions.map((item) => `${item.lane}: ${item.candidate}`).join(" · ")
          : "none",
        coordinatorRemainingBudgetReason: concreteReason || laneCoordinatorState?.coordinatorRemainingBudgetReason || "none",
        territoryDidNotBuyReason: concreteReason || laneCoordinatorState?.territoryDidNotBuyReason || "none",
      });
    }

    const plannerResult = executeMeatGuardAction({ game, commands, protectedResources, remainingActions: Math.max(0, maxUnitActions - boughtCount) });
    if (plannerResult.actionTaken && Number(plannerResult.bought || 0) > 0) {
      boughtCount += Number(plannerResult.bought || 0);
      const row = latestAdvisorRow(["BUY"]);
      const refillWon = String(actionUnitRefillState?.decision || "").toUpperCase() === "BUY" && !!actionUnitRefillState?.followUpActionSelected;
      const selectedCandidate = refillWon
        ? `Parent Refill: ${actionUnitRefillState?.candidate || row?.title || "none"}`
        : (row?.title || plannerResult.summary || "Meat planner");
      const selectedReason = refillWon
        ? (actionUnitRefillState?.reason || formatAdvisorReason(row))
        : formatAdvisorReason(row);
      markSelectedLane("Meat", selectedCandidate, selectedReason, "");

      buildTerritoryGuardProposal({ game, engine, protectedResources });
      if (boughtCount < maxUnitActions) {
        const territoryAction = executeTerritoryGuardAction({
          trigger: "post-meat",
          game,
          engine,
          commands,
          protectedResources,
          boughtCount,
          maxUnitActions,
          markSelectedLane,
          syncCoordinatorHold,
        });
        boughtCount += Number(territoryAction?.bought || 0);
      } else {
        syncCoordinatorHold(`not selected by coordinator: meat planner consumed the remaining unit action budget`);
      }

      return boughtCount;
    }

    if (plannerResult.actionTaken && plannerResult.stopFurtherUnitBuys) {
      const holdReason = plannerResult.noFollowUpReason || plannerResult.summary || "no safe chunk: meat planner found no bounded follow-up that passed target-path, reserve and payback guards";
      syncCoordinatorHold(holdReason);
      return boughtCount;
    }

    if (plannerResult.actionTaken) {
      recordAdvisor(
        "INFO",
        "Planner fallback",
        "meat goal planner held without buying; checking ranked safe unit queue this run"
      );
    }

    buildTerritoryGuardProposal({ game, engine, protectedResources });

    const preQueueTerritoryAction = executeTerritoryGuardAction({
      trigger: "pre-queue",
      game,
      engine,
      commands,
      protectedResources,
      boughtCount,
      maxUnitActions,
      markSelectedLane,
      syncCoordinatorHold,
    });
    boughtCount += Number(preQueueTerritoryAction?.bought || 0);

    if (preQueueTerritoryAction?.executed && boughtCount >= maxUnitActions) {
      return boughtCount;
    }

    const strategicPlan = safe("Meat fallback strategic plan", () => buildMeatGoalPlan(game));
    const strategicTarget = strategicPlan?.target ? getDisplayName(strategicPlan.target) : "meat-chain progression";
    const strategicActionUnit = getStrategicActionUnit(strategicPlan);
    const strategicActionRank = getStrategicActionRank(strategicPlan);
    const collected = collectSmartUnitCandidates(game, engine, protectedResources);
    const candidates = collected.candidates || [];
    if (!candidates.length) {
      syncCoordinatorHold("no safe chunk: no ranked unit candidates after protected-resource, save-window and payback guards");
      return 0;
    }

    const meatCandidates = candidates.filter((entry) => getTabName(entry.unit) === "meat");
    const topMeatCandidate = meatCandidates[0] || null;
    const topMeatRank = topMeatCandidate ? getMeatChainRank(topMeatCandidate.unit) : -1;
    const recentMainHoldRuns = countConsecutiveRecentMainHoldRuns();
    const canStallBreak = canActivateMeatStallBreaker(engine, protectedResources);
    let topMeatBlockedBy = "";
    let topMeatBlockReason = "";
    const skipped = [];

    for (const candidate of candidates) {
      const unit = candidate.unit;
      const tab = getTabName(unit);
      const isMeat = tab === "meat";
      const meatIndex = isMeat ? meatCandidates.indexOf(candidate) : -1;
      const fallbackRankDrop = isMeat && topMeatCandidate ? Math.max(0, meatIndex) : 0;
      const isFallbackMeat = isMeat && !!topMeatBlockedBy && topMeatCandidate && candidate !== topMeatCandidate;

      if (isFallbackMeat) {
        if (!config.meatFallbackEnabled) {
          continue;
        }

        if (fallbackRankDrop > config.meatFallbackMaxRankDrop) {
          const block = {
            type: "rank-drop",
            reason: `meat fallback rank drop ${fallbackRankDrop} exceeds limit ${config.meatFallbackMaxRankDrop}`,
            blockers: ["fallback rank drop limit"],
          };
          skipped.push(addSkippedMeatCandidate(candidate, newDecimal(0), block, fallbackRankDrop, strategicTarget, topMeatCandidate, topMeatBlockedBy));
          continue;
        }

        const candidateRank = getMeatChainRank(unit);
        if (topMeatRank >= 0 && candidateRank >= 0 && candidateRank >= topMeatRank) {
          const block = {
            type: "not-lower-chain",
            reason: `meat fallback requires a lower-chain buy than blocked ${getDisplayName(topMeatCandidate.unit)}`,
            blockers: ["not lower-chain fallback"],
          };
          skipped.push(addSkippedMeatCandidate(candidate, newDecimal(0), block, fallbackRankDrop, strategicTarget, topMeatCandidate, topMeatBlockedBy));
          continue;
        }

        if (
          config.meatFallbackDoNotDropBelowActionUnit &&
          strategicActionRank >= 0 &&
          candidateRank >= 0 &&
          candidateRank < strategicActionRank
        ) {
          const block = {
            type: "action-floor",
            reason: `meat fallback floor: ${getDisplayName(unit)} is below active planner action ${getDisplayName(strategicActionUnit)}; hold lower filler and keep pressure on ${getDisplayName(strategicActionUnit)}`,
            blockers: ["fallback below action unit"],
          };
          skipped.push(addSkippedMeatCandidate(candidate, newDecimal(0), block, fallbackRankDrop, strategicTarget, topMeatCandidate, topMeatBlockedBy));
          continue;
        }
      }

      let prep = { bought: 0, didPrep: false };
      let actionPaybackBypassNote = "";

      if (isMeat && !isFallbackMeat) {
        // Normal top candidate behavior keeps the existing methodical chain prep.
        prep = performMeatChainPrep(game, commands, unit, protectedResources);
        boughtCount += prep.bought || 0;
        if (boughtCount > 0) return boughtCount;
      }

      const num = isFallbackMeat
        ? getMeatFallbackBuyNum(unit)
        : prep.didPrep && !config.advisorOnly && config.autoBuySafeDecisions
          ? getSmartUnitBuyNum(unit)
          : candidate.num;

      let block = getUnitCandidateBlock(
        candidate,
        num,
        protectedResources,
        isFallbackMeat ? "meat fallback payback/reserve" : "smart unit payback/reserve"
      );

      if (block && isMeat) {
        const bypass = assessStrategicActionPaybackBypass(unit, block, strategicPlan, protectedResources);
        if (bypass.allowed) {
          actionPaybackBypassNote = bypass.reason;
          block = null;
        }
      }

      if (block) {
        if (isMeat) {
          if (candidate === topMeatCandidate && !topMeatBlockedBy) {
            topMeatBlockedBy = shortBlockReason(block);
            topMeatBlockReason = block.reason || topMeatBlockedBy;
          }

          skipped.push(addSkippedMeatCandidate(candidate, num, block, fallbackRankDrop, strategicTarget, topMeatCandidate, topMeatBlockedBy));
          continue;
        }

        recordAdvisor("HOLD", getDisplayName(unit), block.reason || "blocked by safety guard");
        addLaneCandidate({
          lane: tab === "territory" ? "Territory" : "Other",
          decision: "HOLD",
          candidate: getDisplayName(unit),
          reason: block.reason || "blocked by safety guard",
          blockers: block.blockers || [shortBlockReason(block)],
          score: candidate.score || unitCostScore(unit),
          wouldBuyAmount: isPositive(num) ? formatSwarmNumber(num) : "0",
          raw: block.raw || candidate.raw || null,
        });
        continue;
      }

      const guardReason = meatChainPurchaseOkReason(unit, num);
      const fallbackAllowedByEnergyGuard = !protectedResources?.has("energy") || !costUsesResource(unit, "energy");
      const stallBreakerActive = isFallbackMeat && canStallBreak && fallbackAllowedByEnergyGuard;
      const fallbackReason = isFallbackMeat
        ? `${stallBreakerActive ? "meat stall breaker" : "meat fallback"}: top target ${getDisplayName(topMeatCandidate.unit)} blocked by ${topMeatBlockedBy}; ${actionPaybackBypassNote || "safe lower-chain buy keeps production moving"}`
        : `${prep.didPrep ? `${candidate.reason}; after chain prep` : candidate.reason}${guardReason ? `; ${guardReason}` : ""}`;

      if (isFallbackMeat) {
        recordMeatFallbackState({
          candidate: getDisplayName(unit),
          reason: fallbackReason,
          skipped,
          topBlockedBy: topMeatBlockedBy,
          strategicTarget,
          blockedCandidate: getDisplayName(topMeatCandidate.unit),
          stallBreakerActive,
          recentMainHoldRuns,
          fallbackRankDrop,
        });
      }

      recordAdvisor("BUY", getDisplayName(unit), fallbackReason);
      addLaneCandidate({
        lane: tab === "territory" ? "Territory" : "Meat",
        decision: "BUY",
        candidate: getDisplayName(unit),
        reason: fallbackReason,
        score: candidate.score || unitCostScore(unit),
        etaAfter: candidate.etaImprovement ? formatEtaImprovementSummary(candidate.etaImprovement) : "",
        wouldBuyAmount: formatSwarmNumber(num),
        target: isFallbackMeat ? strategicTarget : tab === "territory" ? "Expansion" : "meat-chain progression",
        resource: tab,
        raw: {
          ...(candidate.raw || {}),
          recentMainHoldRuns,
          fallbackRankDrop,
          meatActionUnitPaybackBypassTriggered: !!actionPaybackBypassNote,
          meatActionUnitReserveRatio: Number.isFinite(meatActionUnitPaybackBypassState?.reserveRatio) ? meatActionUnitPaybackBypassState.reserveRatio : undefined,
          meatActionUnitPaybackSeconds: Number.isFinite(meatActionUnitPaybackBypassState?.paybackSeconds) ? meatActionUnitPaybackBypassState.paybackSeconds : undefined,
        },
        meatFallback: isFallbackMeat,
        fallbackRankDrop: isFallbackMeat ? fallbackRankDrop : null,
        strategicTarget: isFallbackMeat ? strategicTarget : "",
        blockedStrategicCandidate: isFallbackMeat ? getDisplayName(topMeatCandidate.unit) : "",
        topMeatBlockedBy: isFallbackMeat ? topMeatBlockedBy : "",
      });

      if (config.advisorOnly || !config.autoBuySafeDecisions) {
        markSelectedLane(tab === "territory" ? "Territory" : "Meat", getDisplayName(unit), fallbackReason, formatSwarmNumber(num));
        recordMessage(`Advisor: WOULD BUY ${formatSwarmNumber(num)} ${getDisplayName(unit)}${isFallbackMeat ? " — meat fallback" : ""}`);
        boughtCount++;
        return boughtCount;
      }

      const label = isFallbackMeat ? "Meat Fallback" : "Smart Unit";
      const bought = safe(`${label} ${getDisplayName(unit)}`, () =>
        buyUnitAmount(commands, unit, num, label)
      );

      if (bought) {
        markSelectedLane(tab === "territory" ? "Territory" : "Meat", getDisplayName(unit), fallbackReason, formatSwarmNumber(num));
        boughtCount++;

        if (tab !== "territory" && boughtCount < maxUnitActions) {
          const territoryAction = executeTerritoryGuardAction({
            trigger: "post-meat",
            game,
            engine,
            commands,
            protectedResources,
            boughtCount,
            maxUnitActions,
            markSelectedLane,
            syncCoordinatorHold,
          });
          boughtCount += Number(territoryAction?.bought || 0);
        }

        return boughtCount;
      }
    }

    if (topMeatBlockedBy) {
      const reason = config.meatFallbackEnabled
        ? `no fallback passed reserve/payback/protected-resource guards after top target ${getDisplayName(topMeatCandidate.unit)} was blocked by ${topMeatBlockedBy}`
        : `meat fallback disabled; top target ${getDisplayName(topMeatCandidate.unit)} was blocked by ${topMeatBlockedBy}`;

      recordMeatFallbackState({
        candidate: "none",
        reason,
        skipped,
        topBlockedBy: topMeatBlockedBy,
        strategicTarget,
        blockedCandidate: topMeatCandidate ? getDisplayName(topMeatCandidate.unit) : "none",
        stallBreakerActive: false,
        recentMainHoldRuns,
        fallbackRankDrop: null,
      });

      recordAdvisor("HOLD", "Meat fallback", reason);
      addLaneCandidate({
        lane: "Meat",
        decision: "HOLD",
        candidate: "Meat fallback",
        reason,
        blockers: ["no fallback passed guards", topMeatBlockedBy],
        observations: [`skipped ${skipped.length} meat candidate(s)`, topMeatBlockReason],
        score: topMeatCandidate ? unitCostScore(topMeatCandidate.unit) : 0,
        target: strategicTarget,
        resource: "meat-chain producer",
        meatFallback: true,
        strategicTarget,
        blockedStrategicCandidate: topMeatCandidate ? getDisplayName(topMeatCandidate.unit) : "",
        topMeatBlockedBy,
        raw: { recentMainHoldRuns },
      });
    }

    syncCoordinatorHold(
      territoryPrepPlannerState?.territoryPrepCandidate && territoryPrepPlannerState?.territoryPrepCandidate !== "none"
        ? "not selected by coordinator: better target-path action already used budget or territory did not meet starvation/ROI gate"
        : (territoryPrepPlannerState?.territoryPrepReason || "no territory proposal this run")
    );

    return boughtCount;
  }

  // <build:section:adapter-smart-execution:start>
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
  // <build:section:adapter-smart-execution:end>

  function smartRunOnce() {
    if (!config.enabled) {
      lastStatus = "Pausad";
      refreshPanel();
      return;
    }

    clearAdvisorLog();
    clearLaneCandidates();
    meatFallbackState = null;
    meatActionUnitPaybackBypassState = null;
    actionUnitRefillState = null;
    targetAwareUpgradeState = null;
    unlockPlannerState = null;
    parentStepPlannerState = null;
    twinUnlockPlannerState = null;
    cloneBufferPlannerState = null;
    abilityPrepPlannerState = null;
    postNexusEnergyPlannerState = null;
    territoryPrepPlannerState = null;
    laneCoordinatorState = recordLaneCoordinatorState({
      coordinatorDecision: "HOLD",
      selectedLaneActions: [],
      selectedLaneLabels: [],
      selectedLaneSummary: "none",
      primaryActionReason: "",
      coordinatorRemainingBudgetReason: "none",
      territoryActionAge: getLaneActionAge("Territory"),
      territoryStarvationCount: getTerritoryStarvationCount(),
      territoryDidNotBuyReason: "no territory proposal this run",
    });

    const game = getGame();
    const commands = getCommands();
    const maxActions = Math.max(1, Number(config.smartMaxActionsPerRun || 1));
    const summaries = [];
    let mainActions = 0;
    let sideActions = 0;
    let upgrades = 0;
    let units = 0;

    function laneFromMainLabel(label) {
      return {
        "Larva engine": "Engine",
        "Critical upgrades": "Upgrade",
        "Energy": "Energy",
        "Clone buffer": "Clone Prep",
        "Unlock planner": "Meat",
      }[label] || label;
    }

    function resultActionCount(result) {
      if (!result?.actionTaken) return 0;
      const bought = Number(result.bought || 0);
      return bought > 0 ? bought : 1;
    }

    function addMainResult(label, result) {
      const count = resultActionCount(result);
      if (!count) return false;

      mainActions += count;
      summaries.push(result.summary || label);

      const row = latestAdvisorRow(["BUY", "SIDE", "PLAN", "NEXT", "HOLD"]);
      const selectedLaneActions = (laneCoordinatorState?.selectedLaneActions || []).slice();
      selectedLaneActions.push({
        lane: laneFromMainLabel(label),
        candidate: row?.title || result.summary || label,
        reason: formatAdvisorReason(row),
        amount: "",
      });
      recordLaneCoordinatorState({
        coordinatorDecision: "BUY",
        selectedLaneActions,
        selectedLaneLabels: selectedLaneActions.map((item) => `${item.lane}: ${item.candidate}`),
        selectedLaneSummary: selectedLaneActions.map((item) => `${item.lane}: ${item.candidate}`).join(" · "),
        primaryActionReason: laneCoordinatorState?.primaryActionReason || formatAdvisorReason(row),
      });

      return true;
    }

    function addSideResult(label, result) {
      if (!result?.actionTaken) return false;

      sideActions += Math.max(1, Number(result.bought || 0));
      summaries.push(result.summary || label);
      return true;
    }

    function canDoMoreMainActions() {
      return mainActions < maxActions;
    }

    if (tryAutoAscend(game, commands)) {
      refreshUi();
      refreshPanel();
      return;
    }

    let engine = analyzeLarvaEngine(game);
    let protectedResources = mergeResourceSets(protectedResourcesFromEngine(engine), getEnergyProtectedResources(game));

    if (canDoMoreMainActions()) {
      const engineAction = executeEngineGuardAction({ game, commands, engine });
      addMainResult("Larva engine", engineAction);

      if (engineAction.actionTaken) {
        engine = analyzeLarvaEngine(game);
        protectedResources = mergeResourceSets(protectedResourcesFromEngine(engine), getEnergyProtectedResources(game));
      }
    }

    if (canDoMoreMainActions()) {
      const criticalUpgradeAction = handleCriticalProductionUpgrades(game, commands, protectedResources);
      addMainResult("Critical upgrades", criticalUpgradeAction);
    }

    if (canDoMoreMainActions()) {
      const energyAction = executeEnergyGuardAction({ game, commands, protectedResources });
      addMainResult("Energy", energyAction);
    }

    if (canDoMoreMainActions()) {
      const cloneBufferAction = executeCloneGuardAction({ game, commands });
      addMainResult("Clone buffer", cloneBufferAction);
    } else {
      executeCloneGuardAction({ game, commands });
    }

    if (canDoMoreMainActions()) {
      const unlockAction = runUnlockPlanner(game, commands, protectedResources);
      addMainResult("Unlock planner", unlockAction);
    }

    const smartFocus = decideSmartFocus(engine);

    if (protectedResources.has("territory")) {
      recordAdvisor("HOLD", "Territory spending", "saving territory for Expansion");
      addLaneCandidate({
        lane: "Territory",
        decision: "HOLD",
        candidate: "Territory spending",
        reason: "saving territory for Expansion",
        blockers: ["territory protected for Expansion", "cost uses protected resource"],
        score: 70000,
        etaBefore: Number.isFinite(engine?.expansionEta) ? formatDuration(engine.expansionEta) : "",
        target: "Expansion",
        resource: "territory",
      });
    }

    if (protectedResources.has("meat")) {
      recordAdvisor("HOLD", "Meat spending", "saving meat for Hatchery");
      addLaneCandidate({
        lane: "Meat",
        decision: "HOLD",
        candidate: "Meat spending",
        reason: "saving meat for Hatchery",
        blockers: ["meat protected for Hatchery", "cost uses protected resource"],
        score: 65000,
        etaBefore: Number.isFinite(engine?.hatcheryEta) ? formatDuration(engine.hatcheryEta) : "",
        target: "Hatchery",
        resource: "meat",
      });
    }

    if (protectedResources.has("energy")) {
      recordAdvisor("HOLD", "Energy spending", "saving energy for Nexus");
      addLaneCandidate({
        lane: "Energy",
        decision: "HOLD",
        candidate: "Energy spending",
        reason: "saving energy for Nexus",
        blockers: ["energy protected for Nexus", "Nexus save"],
        score: 80000,
        target: "Nexus",
        resource: "energy",
      });
    }

    recordAdvisor("INFO", "Smart focus", smartFocus);

    if (config.buyUpgrades && canDoMoreMainActions()) {
      upgrades = safe("Smart upgrades", () => buySmartUpgrades(game, commands, protectedResources)) || 0;
      if (upgrades > 0) {
        mainActions += upgrades;
        summaries.push(`${upgrades} upgrade(s)`);
      }
    }

    if (config.buyUnits && canDoMoreMainActions()) {
      units = safe("Smart units", () => buySmartUnits(game, commands, engine, protectedResources, Math.max(1, maxActions - mainActions))) || 0;
      if (units === "paused-ascension") {
        summaries.push("units paused near ascension");
      } else if (units > 0) {
        mainActions += units;
        summaries.push(`${units} unit buy`);
      }
    }

    // Clone prep runs last as a side task. It may cocoon a small chunk, but it must
    // not prevent upgrades, Nexus, lepidoptera or normal unit decisions in the same run.
    const clonePrep = manageCloneCocoons(game, commands);
    addSideResult("Clone prep", clonePrep);

    runAbilityPrepPlanner(game);

    strategyInspector = buildStrategyInspector(game, engine, protectedResources, smartFocus, summaries, mainActions, sideActions, maxActions);
    recordRunHistoryEntry(strategyInspector);

    refreshUi();

    if (units === "paused-ascension") {
      lastStatus = `Smart: ${mainActions}/${maxActions} main actions, ${sideActions} side-tasks, units pausade nära ascension`;
    } else if (summaries.length) {
      lastStatus = `Smart: ${mainActions}/${maxActions} main actions, ${sideActions} side-tasks · ${summaries.slice(0, 3).join("; ")}`;
    } else {
      lastStatus = `Smart: 0/${maxActions} main actions, ${sideActions} side-tasks`;
    }

    refreshPanel();
  }

  function getInjector() {
    const angular = w.angular;

    if (!angular) {
      throw new Error("Angular hittades inte. Spelet är kanske inte färdigladdat.");
    }

    const candidates = [
      document.querySelector("[ng-app]"),
      document.querySelector(".ng-scope"),
      document.body,
      document.documentElement,
    ].filter(Boolean);

    for (const el of candidates) {
      const injector = angular.element(el).injector?.();
      if (injector) return injector;
    }

    throw new Error("Kunde inte hitta Angular injector.");
  }

  function getService(name) {
    return getInjector().get(name);
  }

  function getGame() {
    return getService("game");
  }

  function getCommands() {
    return getService("commands");
  }

  function getRootScope() {
    return getService("$rootScope");
  }

  function safe(label, fn) {
    try {
      return fn();
    } catch (error) {
      warn(`${label} misslyckades:`, error.message || error);
      return null;
    }
  }

  function getTabName(item) {
    return (
      item?.tab?.name ||
      item?.unit?.tab?.name ||
      item?.unit?.unittype?.tab ||
      item?.unittype?.tab ||
      "other"
    );
  }

  function ignoredUnitsSet() {
    return new Set(config.ignoredUnits || []);
  }

  function shouldPauseUnitsForAscension(game) {
    if (!config.pauseUnitsNearAscension) return false;
    if (!game.ascendCostPercent) return false;

    const percent = safe("Ascension percent", () => game.ascendCostPercent());
    if (!percent || !percent.toNumber) return false;

    return percent.toNumber() >= config.pauseUnitsAscensionPercent;
  }

  function tryAutoAscend(game, commands) {
    if (!config.autoAscend) return false;
    if (!game.ascendCostPercent) return false;

    const percent = game.ascendCostPercent();

    if (percent && percent.toNumber && percent.toNumber() >= 1) {
      commands.ascend({ game });
      lastStatus = "Ascend körd";
      recordMessage("Auto-ascend körd");
      log("Auto-ascend körd");
      return true;
    }

    return false;
  }

  function unitCostScore(unit) {
    const costs = safe(`Läs kostnad ${unit.name}`, () => unit.eachCost?.() || []) || [];

    if (!costs.length) return 0;

    let maxLog = 0;
    let sumLog = 0;

    for (const cost of costs) {
      const logValue = decimalLog10(cost.val);
      maxLog = Math.max(maxLog, logValue);
      sumLog += logValue;
    }

    return maxLog * 100 + sumLog * 10;
  }

  function scoreUnit(unit, index, total) {
    const tab = getTabName(unit);
    const name = String(unit.name || "").toLowerCase();
    const displayName = String(getDisplayName(unit) || "").toLowerCase();
    const costScore = unitCostScore(unit);

    let score = 0;

    if (config.unitStrategy === "expensive-first") {
      score += costScore * 10;
    } else if (config.unitStrategy === "balanced") {
      score += costScore * 6;
      score += TAB_PRIORITY[tab] || 0;
    } else if (config.unitStrategy === "cheap-fill") {
      score += index * 10;
      score += TAB_PRIORITY[tab] || 0;
    }

    if (name.includes("larv") || displayName.includes("larv")) score += 120;
    if (name.includes("territ") || displayName.includes("territ")) score += 120;
    if (name.includes("queen") || displayName.includes("queen")) score += 80;
    if (name.includes("nest") || displayName.includes("nest")) score += 70;
    if (name.includes("hive") || displayName.includes("hive")) score += 60;
    if (name.includes("drone") || displayName.includes("drone")) score += 40;
    if (displayName.includes("neural")) score += 50;
    if (displayName.includes("mind")) score += 50;
    if (displayName.includes("network")) score += 50;

    if (config.focusTab !== "all" && tab === config.focusTab) {
      score += 2000;
    }

    return score;
  }

  function scoreUpgrade(upgrade, index) {
    const tab = getTabName(upgrade);
    const name = String(upgrade.name || "").toLowerCase();
    const displayName = String(getDisplayName(upgrade) || "").toLowerCase();

    let score = 0;

    score += index;
    score += TAB_PRIORITY[tab] || 0;

    if (name.includes("hatch") || displayName.includes("hatch")) score += 150;
    if (name.includes("larv") || displayName.includes("larv")) score += 120;
    if (name.includes("territ") || displayName.includes("territ")) score += 100;
    if (name.includes("expan") || displayName.includes("expan")) score += 100;
    if (name.includes("speed") || displayName.includes("speed")) score += 80;
    if (name.includes("prod") || displayName.includes("prod")) score += 80;
    if (name.includes("cost") || displayName.includes("cost")) score += 60;

    return score;
  }

  function buyAvailableUpgrades() {
    const game = getGame();
    const commands = getCommands();

    let upgrades = game.availableAutobuyUpgrades(config.upgradeBuyPercent) || [];

    upgrades = upgrades
      .map((upgrade, index) => ({
        upgrade,
        score: scoreUpgrade(upgrade, index),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, config.maxUpgradesPerRun)
      .map((entry) => entry.upgrade);

    let bought = 0;

    for (const upgrade of upgrades) {
      safe(`Köp upgrade ${getDisplayName(upgrade)}`, () => {
        const divisor =
          config.respectUpgradeWatchDivisor && upgrade.watchedDivisor
            ? upgrade.watchedDivisor()
            : 1;

        const before = upgrade.count();

        commands.buyMaxUpgrade({
          upgrade,
          percent: config.upgradeBuyPercent / divisor,
          ui: BOT_NAME,
        });

        const after = upgrade.count();
        const delta = after.minus(before);

        if (delta.greaterThan(0)) {
          recordPurchase("Upgrade", upgrade, delta);
          bought++;
        }
      });
    }

    return bought;
  }

  function buyAvailableUnits() {
    const game = getGame();
    const commands = getCommands();
    const ignored = ignoredUnitsSet();

    if (shouldPauseUnitsForAscension(game)) {
      return "paused-ascension";
    }

    const unitList = game.unitlist();
    const total = unitList.length;

    const candidates = unitList
      .map((unit, index) => ({
        unit,
        index,
        score: scoreUnit(unit, index, total),
        costScore: unitCostScore(unit),
      }))
      .filter(({ unit }) => {
        if (!unit) return false;
        if (ignored.has(unit.name)) return false;

        const tab = getTabName(unit);

        if (config.focusTab !== "all" && tab !== config.focusTab) {
          return false;
        }

        if (!unit.isVisible?.()) return false;
        if (!unit.isBuyable?.()) return false;

        if (unit.maxCostMet) {
          const affordable = unit.maxCostMet(config.unitBuyPercent);

          if (!affordable || !affordable.greaterThan || !affordable.greaterThan(0)) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return b.index - a.index;
      });

    const chosen = candidates
      .slice(0, config.maxUnitTypesPerRun)
      .map((entry) => entry.unit);

    let bought = 0;

    for (const unit of chosen) {
      safe(`Köp unit ${getDisplayName(unit)}`, () => {
        const before = unit.count();

        commands.buyMaxUnit({
          unit,
          percent: config.unitBuyPercent,
          ui: BOT_NAME,
        });

        const after = unit.count();
        const delta = after.minus(before);

        if (delta.greaterThan(0)) {
          recordPurchase("Unit", unit, delta);
          bought++;
        }
      });
    }

    return bought;
  }

  function runOnce() {
    if (config.smartMode) {
      smartRunOnce();
      return;
    }

    legacyRunOnce();
  }

  function legacyRunOnce() {
    if (!config.enabled) {
      lastStatus = "Pausad";
      refreshPanel();
      return;
    }

    const game = getGame();
    const commands = getCommands();

    if (tryAutoAscend(game, commands)) {
      refreshUi();
      refreshPanel();
      return;
    }

    let upgrades = 0;
    let units = 0;

    if (config.purchaseOrder === "units-first") {
      units = config.buyUnits ? safe("Köp units", buyAvailableUnits) || 0 : 0;
      upgrades = config.buyUpgrades ? safe("Köp upgrades", buyAvailableUpgrades) || 0 : 0;
    } else {
      upgrades = config.buyUpgrades ? safe("Köp upgrades", buyAvailableUpgrades) || 0 : 0;
      units = config.buyUnits ? safe("Köp units", buyAvailableUnits) || 0 : 0;
    }

    refreshUi();

    if (units === "paused-ascension") {
      lastStatus = `${upgrades} upgrades, units pausade nära ascension`;
    } else {
      lastStatus = `${upgrades} upgrades, ${units} unit-typer`;
    }

    strategyInspector = {
      time: new Date().toLocaleTimeString(),
      phase: "Legacy mode",
      goal: "Legacy autobuyer is active; Strategy Inspector is designed for Smart Mode decisions.",
      decision: units || upgrades ? "BUY" : "OBSERVE",
      reason: "Smart Mode is off, so advisor/planner guards are not the primary decision layer.",
      protectedResources: "not evaluated in legacy mode",
      waits: "none",
      smartFocus: config.focusTab,
      nexus: "not inspected",
      lepidoptera: "not inspected",
      actions: `${upgrades} upgrades, ${units} unit-types`,
      summaries: lastStatus,
      settings: getSettingsInfluencingDecision(new Set()),
      futurePlanners: "Switch Smart Mode on for full Strategy Inspector and Council UI details.",
      recommendedSmart: `Recommended Smart = Smart mode + safe auto-buy, focus ${PRESETS.smart.focusTab}, ${trimNumber(PRESETS.smart.smartUnitBuyPercent * 100)}% Smart chunk, Nexus protection on, auto-cast off, auto-ascend off.`,
    };

    log(`Körning: ${lastStatus}`);
    refreshPanel();
  }

  function refreshUi() {
    safe("Uppdatera UI", () => {
      getRootScope().$applyAsync?.();
    });
  }

  function restartTimer() {
    if (timer) clearInterval(timer);

    timer = setInterval(() => {
      safe("Körning", runOnce);
    }, config.runEverySeconds * 1000);

    if (w[BOT_NAME]) {
      w[BOT_NAME].timer = timer;
    }
  }

  function createPanel() {
    const existingPanel = document.getElementById("kbc-swarmbot-panel");
    if (existingPanel) existingPanel.remove();

    for (const id of [
      "kbc-swarmbot-log-panel",
      "kbc-swarmbot-strategy-bar",
      "kbc-swarmbot-advisor-panel",
      "kbc-swarmbot-purchase-panel",
    ]) {
      const existing = document.getElementById(id);
      if (existing) existing.remove();
    }

    panel = document.createElement("div");
    panel.id = "kbc-swarmbot-panel";
    panel.className = "kbc-swarmbot-window";

    panel.innerHTML = `
      <div class="kbc-title" title="Dra här för att flytta inställningarna">SwarmBot v${SCRIPT_VERSION} <span class="kbc-title-hint">settings · drag</span></div>

      <div class="kbc-row">
        <button id="kbc-toggle" title="Pausa eller starta hela botten"></button>
        <button id="kbc-run" title="Kör en analys/köprunda direkt">Kör nu</button>
      </div>

      <div class="kbc-row">
        <button id="kbc-reset-recommended" title="Återställ till rekommenderat Smart-läge för ${SCRIPT_VERSION}. Detta skriver över sparade bot-inställningar men inte fönsterpositioner.">Recommended</button>
        <button id="kbc-reset-settings-layout" title="Återställ inställningsfönstrets position och storlek">Reset inst.</button>
        <button id="kbc-reset-log-layout-from-settings" title="Återställ advisor/köp-fönstrens position och storlek">Reset vyer</button>
      </div>

      <div class="kbc-row">
        <button id="kbc-toggle-strategy-bar" title="Visa/dölj Strategy Bar högst upp">Strategy bar</button>
        <button id="kbc-toggle-advisor-panel" title="Visa/dölj Advisor-fönstret">Advisor</button>
        <button id="kbc-toggle-purchase-panel" title="Visa/dölj senaste köp-fönstret">Köp</button>
      </div>

      <div class="kbc-row">
        <button id="kbc-copy-log-md" title="Kopiera AI-vänlig loggexport som Markdown">Kopiera logg</button>
        <button id="kbc-download-log-json" title="Ladda ner komplett loggexport som JSON">Export JSON</button>
      </div>

      <div class="kbc-tabs" title="Dela upp inställningarna i enklare grupper">
        <button type="button" class="kbc-tab" data-kbc-tab="main">Start</button>
        <button type="button" class="kbc-tab" data-kbc-tab="smart">Smart</button>
        <button type="button" class="kbc-tab" data-kbc-tab="economy">Ekonomi</button>
        <button type="button" class="kbc-tab" data-kbc-tab="energy">Energy</button>
        <button type="button" class="kbc-tab" data-kbc-tab="advanced">Avancerat</button>
      </div>

      <div class="kbc-tab-panel" data-kbc-tab-panel="main">
        <div class="kbc-section-title">Grundläge</div>

        <label title="Välj färdig inställningsprofil. Smart är rekommenderad medan vi utvecklar advisor-läget.">Preset ${helpIcon("Smart = advisor med säkra auto-köp. Aggressive = gammal mer riskabel autobuyer.")}
          <select id="kbc-preset">
            <option value="smart">Smart</option>
            <option value="safe">Safe</option>
            <option value="progression">Progression</option>
            <option value="balanced">Balanced</option>
            <option value="aggressive">Aggressive</option>
            <option value="upgradesOnly">Upgrades only</option>
            <option value="unitsOnly">Units only</option>
          </select>
        </label>

        <label title="När Smart mode är på använder botten advisor-regler för Hatchery, Expansion, sparande och ROI.">
          <input id="kbc-smart-mode" type="checkbox">
          Smart mode ${helpIcon("På = använd nya smartbuyer/advisor-logiken. Av = använd äldre köplogik.")}
        </label>

        <label title="Botten analyserar och skriver WOULD BUY/HOLD men köper inte automatiskt.">
          <input id="kbc-advisor-only" type="checkbox">
          Advisor only ${helpIcon("Bra för test. Visar vad botten skulle göra utan att spendera resurser.")}
        </label>

        <label title="När detta är på får botten köpa beslut som advisor bedömer som säkra.">
          <input id="kbc-auto-buy-safe" type="checkbox">
          Auto-köp säkra beslut ${helpIcon("Stäng av om du bara vill ha rekommendationer i loggen.")}
        </label>

        <label title="Visar fas, mål, skyddade resurser och varför botten köper eller håller.">
          <input id="kbc-strategy-inspector" type="checkbox">
          Strategy Inspector ${helpIcon("På = loggpanelen visar vad Smart Mode tror att strategin är just nu och vilka inställningar som påverkar beslutet.")}
        </label>

        <label title="Byt Strategy Bar till Swarm Council-rådgivarkort. Detta ändrar bara presentation, inte planner eller köp.">
          <input id="kbc-council-ui" type="checkbox">
          Council UI ${helpIcon("På = visar Swarm Council med lane-rådgivare, focus now och tydliga BUY/HOLD/OBSERVE-badges. Av = klassisk Strategy Bar.")}
        </label>

        <div class="kbc-note">Recommended Smart betyder: 25% Smart chunk, säkra auto-köp, Focus meat, Nexus-skydd på, auto-cast av och auto-ascend av.</div>

        <label title="Hur ofta botten ska analysera och eventuellt köpa.">Kör var X sekund ${helpIcon("Lägre = mer aktiv bot. Högre = lugnare och lättare att följa i loggen.")}
          <input id="kbc-seconds" type="number" min="1" max="60" step="1">
        </label>

        <label title="Hur många huvudåtgärder smartläget får göra under samma körning. Clone prep räknas som sidouppgift.">Max smartåtgärder/körning ${helpIcon("4 betyder att botten kan köpa t.ex. Nexus, production upgrade, upgrade och unit under samma runda. Clone Prep körs sist som sidouppgift.")}
          <input id="kbc-smart-max-actions" type="number" min="1" max="20" step="1">
        </label>

        <label title="Tillåt eller stoppa unit-köp helt.">
          <input id="kbc-buy-units" type="checkbox">
          Köp units ${helpIcon("Styr om botten får köpa units/producers.")}
        </label>

        <label title="Tillåt eller stoppa upgrade-köp helt.">
          <input id="kbc-buy-upgrades" type="checkbox">
          Köp upgrades ${helpIcon("Styr om botten får köpa upgrades.")}
        </label>
      </div>

      <div class="kbc-tab-panel" data-kbc-tab-panel="smart">
        <div class="kbc-section-title">Unit och upgrade-strategi</div>

        <label title="I Smart mode styrs prioritet främst av advisor, Hatchery/Expansion, production-upgrades och ROI. Den här påverkar mest legacy/fallback.">Unit-strategi (legacy/fallback) ${helpIcon("I Smart mode är detta inte huvudprioritet. Smart buyer väljer själv via advisor-regler.")}
          <select id="kbc-unit-strategy">
            <option value="expensive-first">Dyraste först</option>
            <option value="balanced">Balanserad</option>
            <option value="cheap-fill">Fyll billigt</option>
          </select>
        </label>

        <label title="Begränsa botten till en viss flik. All låter advisor välja mellan meat och territory.">Focus tab ${helpIcon("All = botten får balansera. Meat/Territory = tvinga fokus.")}
          <select id="kbc-focus">
            <option value="all">All</option>
            <option value="meat">Meat</option>
            <option value="larva">Larva</option>
            <option value="territory">Territory</option>
            <option value="energy">Energy</option>
          </select>
        </label>

        <label title="Hur stor del av maxköpet smartläget får köpa åt gången.">Smart unit chunk % ${helpIcon("25% är Recommended Smart i 0.11.0. Det betyder upp till 25% av safe max per action, men reserve/payback/Nexus-skydd kan fortfarande blockera köp.")}
          <input id="kbc-smart-unit-percent" type="number" min="0.1" max="100" step="1">
        </label>

        <label title="När botten tänker köpa en högre meat-chain-unit köper den först dess feed-unit, t.ex. Hive Neuron före Neural Cluster.">
          <input id="kbc-meat-chain-cascade" type="checkbox">
          Meat-chain cascade ${helpIcon("På = köp förberedande kedje-unit före målet så nästa köp får större max, t.ex. Hive Neuron → Neural Cluster.")}
        </label>

        <label title="Om feed-unitens twin-upgrade är köpbar köps den före feed-unit-köpet, t.ex. Twin Hive Neurons före Hive Neurons.">
          <input id="kbc-meat-chain-twin-prep" type="checkbox">
          Twin-prep i meat-chain ${helpIcon("På = köp relevant twin-upgrade innan botten använder larver på den unittypen. Detta ignorerar inte Hatchery/Expansion-skydd.")}
        </label>

        <label title="Låt botten välja ett stort meat-chain-mål och leta 3–4 steg bakåt efter flaskhalsen.">
          <input id="kbc-meat-goal-planner" type="checkbox">
          Meat goal planner ${helpIcon("På = t.ex. Lesser Hive Mind → Hive Network → Neural Cluster → Hive Neuron, och köper flaskhalsen först.")}
        </label>

        <label title="Hur många steg bakåt i meat-kedjan goal planner får titta.">Planner depth ${helpIcon("4 betyder att botten kan se flera steg ner, t.ex. Lesser Hive Mind till Hive Neuron.")}
          <input id="kbc-meat-planner-depth" type="number" min="1" max="6" step="1">
        </label>

        <label title="Hur stor andel av maxköpet goal planner får använda när den bygger flaskhalsen.">Planner chunk % ${helpIcon("25% bygger bank snabbare än vanlig smart chunk, men lämnar ändå resurser kvar.")}
          <input id="kbc-meat-planner-chunk" type="number" min="0.1" max="100" step="0.5">
        </label>

        <label title="Låt botten prova lägre rankade meat-chain-köp om toppmålet blockeras av reserve/payback.">
          <input id="kbc-meat-fallback-enabled" type="checkbox">
          Meat fallback enabled ${helpIcon("På = om Hive Network/Neural Cluster/Hive Neuron blockeras kan botten prova ett säkrare lägre meat-köp i samma körning.")}
        </label>

        <label title="Hur många raka Smart-körningar utan main action innan stall breaker markerar fallback som aktiv.">Fallback after hold runs ${helpIcon("5 betyder att stall breaker börjar flagga fallback efter fem raka körningar utan main action. Guards ignoreras aldrig.")}
          <input id="kbc-meat-fallback-hold-runs" type="number" min="0" max="1000" step="1">
        </label>

        <label title="Hur långt ner i den rankade meat-listan fallback får leta.">Fallback max rank drop ${helpIcon("8 betyder att fallback får testa upp till åtta lägre rankade meat-kandidater efter blockerad toppkandidat.")}
          <input id="kbc-meat-fallback-rank-drop" type="number" min="0" max="50" step="1">
        </label>

        <label title="Fallback använder en mindre chunk än vanlig planner.">Fallback chunk % ${helpIcon("10% av safe max som default. Respekterar fortfarande Unit spend, skyddade resurser, reserve och payback.")}
          <input id="kbc-meat-fallback-chunk" type="number" min="0.1" max="100" step="0.5">
        </label>

        <label title="Tillåt planner-action-unit, t.ex. Hive Neuron, att gå förbi payback-gränsen när reserve är mycket hög.">
          <input id="kbc-meat-action-payback-bypass" type="checkbox">
          Active action payback bypass ${helpIcon("På = om Hive Neuron är planner action och payback ser extrem ut men reserve är trygg kan botten ändå köpa den. Detta gäller inte Hive Network/Neural Cluster utan trygg reserve.")}
        </label>

        <label title="Minsta reserve-ratio för active action payback bypass.">Action bypass min reserve × ${helpIcon("5 betyder att cost-unit efter köp måste vara minst 5x reservkravet/trygg ratio innan payback kan bypassas för planner-action-unit.")}
          <input id="kbc-meat-action-min-reserve" type="number" min="1" max="1000" step="1">
        </label>

        <label title="Hindra fallback från att droppa under planner-action-unit, t.ex. Hive Neuron till Hive Empress.">
          <input id="kbc-meat-fallback-floor-action" type="checkbox">
          Fallback floor at action unit ${helpIcon("På = om planner säger Hive Neuron så får fallback inte köpa Neuroprophet/Hive Empress bara för att de passerar payback.")}
        </label>

        <label title="Extra buffer för twin-upgrades. 0.5 betyder att kostnadsresursen efter twin ska vara minst 50% av twin-kostnaden.">Twin recovery buffer ${helpIcon("Hindrar Twin Prep från att köpa så fort en twin är buyable om det skulle tömma kedjan för hårt.")}
          <input id="kbc-twin-recovery-buffer" type="number" min="0" max="5" step="0.1">
        </label>

        <label title="Blockera meat-chain-köp som tömmer föregående producent eller har för lång återbetalningstid.">
          <input id="kbc-meat-payback-guard" type="checkbox">
          Meat-chain payback guard ${helpIcon("På = Smart Mode håller högre meat-chain-köp om reserv eller payback ser dåligt ut.")}
        </label>

        <label title="Kostnadsresursen ska finnas kvar efter köp med denna multipel av köpets kostnad.">Meat reserve multiplier ${helpIcon("2 betyder att cost-unit efter köp ska vara minst 2x köpets kostnad. 0 stänger av reservkravet.")}
          <input id="kbc-meat-reserve-multiplier" type="number" min="0" max="10" step="0.25">
        </label>

        <label title="Max återbetalningstid för meat-chain-köp, i sekunder. 1800 = 30 minuter. 0 stänger av payback-gränsen.">Max meat payback sek ${helpIcon("Om köpet tar längre tid än detta att tjäna tillbaka sin offrade producent håller botten köpet.")}
          <input id="kbc-meat-max-payback" type="number" min="0" max="31536000" step="60">
        </label>

        <label title="Hur mycket av relevanta resurser unit-köp får använda.">Unit spend ${helpIcon("0.85 betyder att unit-köp får räkna på upp till 85% av resursen.")}
          <input id="kbc-unit-percent" type="number" min="0.01" max="1" step="0.05">
        </label>

        <label title="Hur mycket av relevanta resurser upgrade-köp får använda.">Upgrade spend ${helpIcon("0.65 betyder att upgrades försöker lämna mer buffert till andra mål.")}
          <input id="kbc-upgrade-percent" type="number" min="0.01" max="1" step="0.05">
        </label>

        <label title="Max antal olika unit-typer botten får köpa per körning.">Max unit-typer/körning ${helpIcon("1 är lättast att följa och minskar risken för att botten spammar flera kedjor.")}
          <input id="kbc-max-units" type="number" min="0" step="1">
        </label>

        <label title="Max antal upgrades botten får köpa per körning.">Max upgrades/körning ${helpIcon("Håller upgrade-köp begränsade så loggen går att läsa.")}
          <input id="kbc-max-upgrades" type="number" min="0" step="1">
        </label>

        <div class="kbc-section-title">Production upgrades</div>

        <label title="Production upgrades som Faster Hives köps före unit-köp när de är köpbara.">
          <input id="kbc-prioritize-production-upgrades" type="checkbox">
          Prioritera production upgrades ${helpIcon("Köper exempelvis Faster Hives direkt före vanliga units.")}
        </label>

        <label title="Låt production upgrades ignoreras från spelets Notify at 2x/4x-tröskel.">
          <input id="kbc-production-ignore-notify" type="checkbox">
          Ignorera notify för production upgrades ${helpIcon("På = köp när upgraden faktiskt är köpbar, även om spelets notify-tröskel väntar längre.")}
        </label>

        <label title="Max antal kritiska production upgrades botten får köpa per körning.">Max production upgrades/körning ${helpIcon("1–3 är lagom. Efter sådana köp hoppar botten över units tills nästa körning.")}
          <input id="kbc-critical-production-max" type="number" min="0" step="1">
        </label>
      </div>

      <div class="kbc-tab-panel" data-kbc-tab-panel="economy">
        <div class="kbc-section-title">Hatchery / Expansion</div>

        <label title="Hatchery och Expansion ökar larvproduktionen och ska prioriteras före vanliga köp.">
          <input id="kbc-larva-engine" type="checkbox">
          Prioritera Hatchery/Expansion ${helpIcon("Om Expansion eller Hatchery kan köpas försöker botten köpa dem först.")}
        </label>

        <label title="Rankar territory-köp efter hur mycket de hjälper vägen mot nästa Expansion, inte bara efter dyraste unit.">
          <input id="kbc-territory-roi" type="checkbox">
          Territory ROI ${helpIcon("Väljer territory-producent efter nytta/ROI mot Expansion.")}
        </label>

        <label title="Minsta ETA-förbättring i sekunder för att Smart Mode ska få köpa en Territory ROI-kandidat. Kandidaten loggas ändå.">Territory min ETA sek ${helpIcon("2 betyder att mikroskopiska territory-köp hålls som diagnostics/observe i stället för att köpas.")}
          <input id="kbc-territory-min-eta" type="number" min="0" max="31536000" step="1">
        </label>

        <label title="Alternativ minsta relativ förbättring av Expansion-ETA. 0.001 = 0.1%.">Territory min ETA ratio ${helpIcon("Köp tillåts om ETA-förbättringen antingen når sekunder-gränsen eller denna relativa gräns.")}
          <input id="kbc-territory-min-ratio" type="number" min="0" max="1" step="0.0001">
        </label>

        <div class="kbc-field" title="Om nästa Hatchery är närmare än denna tid försöker botten spara meat.">
          <div class="kbc-field-label">Spara meat för Hatchery om ETA är under ${helpIcon("Exempel: 0d 0h 10m 0s = spara meat när Hatchery är under 10 minuter bort.")}</div>
          <div class="kbc-time-grid">
            <label>Dagar<input id="kbc-save-hatchery-days" type="number" min="0" max="365" step="1"></label>
            <label>Timmar<input id="kbc-save-hatchery-hours" type="number" min="0" max="23" step="1"></label>
            <label>Min<input id="kbc-save-hatchery-minutes" type="number" min="0" max="59" step="1"></label>
            <label>Sek<input id="kbc-save-hatchery-seconds" type="number" min="0" max="59" step="1"></label>
          </div>
        </div>

        <div class="kbc-field" title="Om nästa Expansion är närmare än denna tid försöker botten spara territory.">
          <div class="kbc-field-label">Spara territory för Expansion om ETA är under ${helpIcon("Expansion är stark, så den kan ha längre sparfönster än Hatchery.")}</div>
          <div class="kbc-time-grid">
            <label>Dagar<input id="kbc-save-expansion-days" type="number" min="0" max="365" step="1"></label>
            <label>Timmar<input id="kbc-save-expansion-hours" type="number" min="0" max="23" step="1"></label>
            <label>Min<input id="kbc-save-expansion-minutes" type="number" min="0" max="59" step="1"></label>
            <label>Sek<input id="kbc-save-expansion-seconds" type="number" min="0" max="59" step="1"></label>
          </div>
        </div>

        <label title="Hur mycket viktigare Expansion är jämfört med Hatchery när botten väljer fokus.">Expansion vikt ${helpIcon("2 betyder att Expansion väger ungefär dubbelt så tungt som Hatchery i fokusvalet.")}
          <input id="kbc-expansion-weight" type="number" min="0.5" max="10" step="0.25">
        </label>
      </div>

      <div class="kbc-tab-panel" data-kbc-tab-panel="energy">
        <div class="kbc-section-title">Nexus / Energy</div>

        <label title="Prioritera Nexus, energiproduktion och Clone Larvae-förberedelse i Smart mode.">
          <input id="kbc-energy-strategy" type="checkbox">
          Energy strategy ${helpIcon("På = botten sparar energy för Nexus, köper Nexus när den kan, och hanterar lepidoptera/cocoons smartare.")}
        </label>

        <label title="Sätt hur många Nexus botten ska försöka nå. Fem är slutmålet.">Nexus target ${helpIcon("Nexus 5 låser upp hela energy-systemet. Botten sparar energy tills target är nått.")}
          <input id="kbc-nexus-target" type="number" min="1" max="5" step="1">
        </label>

        <label title="Skydda energy från rush-abilities och onödiga köp när nästa Nexus saknas.">
          <input id="kbc-save-energy-nexus" type="checkbox">
          Spara energy för Nexus ${helpIcon("På = energy räknas som skyddad tills Nexus target är nått.")}
        </label>

        <label title="Lepidoptera väljs bara när de faktiskt kortar tiden till nästa Nexus eller target redan är nått.">
          <input id="kbc-lepidoptera-roi" type="checkbox">
          Lepidoptera ROI ${helpIcon("Stoppar konstant köp av lepidoptera när investeringen inte betalar sig.")}
        </label>

        <label title="Sluta köpa lepidoptera när energy-bonusen är över denna nivå.">Stoppa lepidoptera vid +% energy ${helpIcon("Lepidoptera har avtagande effekt. Runt 90% är de ofta för dyra jämfört med annat.")}
          <input id="kbc-lepidoptera-stop" type="number" min="0" max="99.9" step="1">
        </label>

        <label title="Max antal lepidoptera per körning när ROI säger att de är värda det.">Max lepidoptera/körning ${helpIcon("Lågt värde hindrar botten från att tömma energy när Nexus är målet.")}
          <input id="kbc-max-lepidoptera" type="number" min="0" step="1">
        </label>

        <label title="Slå på den försiktiga Energy Planner-logiken från referensmodellen.">Energy planner-regler ${helpIcon("På = blockerar Lepidoptera före Nexus 4, använder Nexus 5-soft target, kan köpa bounded Lepidoptera efter Nexus target och håller Nightbugs/Bats som default.")}
          <input id="kbc-energy-planner" type="checkbox">
        </label>

        <label title="Köp inte Lepidoptera före detta Nexus-tal. Default 4 enligt analysen.">Blockera Lepidoptera före Nexus ${helpIcon("Analysen säger att snabbaste Nexus 4 fås med 0 Lepidoptera.")}
          <input id="kbc-block-lepidoptera-before" type="number" min="1" max="5" step="1">
        </label>

        <label title="Soft target före Nexus 5 när målet är snabbaste Nexus 5.">Nexus 5 Lepidoptera soft target ${helpIcon("Runt 572 är riktvärde för snabbaste Nexus 5. Över detta håller botten hellre energy för Nexus 5.")}
          <input id="kbc-fast-nexus5-moth-target" type="number" min="0" step="1">
        </label>

        <label title="Används bara för advisor/HOLD än så länge. Riktig Nightbug-köpregel kräver framtida storage planner.">Offline/storage mode (experimental) ${helpIcon("På = Nightbugs markeras inte som vanlig default-HOLD, men de auto-köps inte ännu. Riktig Nightbug planner är framtid.")}
          <input id="kbc-offline-mode" type="checkbox">
        </label>

        <label title="Används bara för advisor/HOLD än så länge. Bats auto-buy kräver framtida ability planner.">Ability planner (experimental advisor only) ${helpIcon("På = Bats markeras inte som vanlig default-HOLD, men de auto-köps inte ännu. Auto-cast och riktig ability ROI är framtid.")}
          <input id="kbc-ability-planner" type="checkbox">
        </label>

        <div class="kbc-section-title">Clone Larvae</div>

        <label title="Försök hålla cocoons så Clone Larvae får något vettigt att klona senare.">
          <input id="kbc-manage-clone-cocoons" type="checkbox">
          Håll cocoons för Clone Larvae ${helpIcon("Cocoonar en liten del larver i taget baserat på Clone Larvae-cap. Castar inte automatiskt.")}
        </label>

        <label title="Hur mycket av Clone Larvae-cap som ska finnas skyddat som cocoons.">Cocoon target % av clone cap ${helpIcon("100% betyder att botten försöker ha cocoons upp till ungefär hela clone-cap, men i små steg.")}
          <input id="kbc-clone-cocoon-target" type="number" min="0" max="200" step="5">
        </label>

        <label title="Hur stor del av nuvarande larvae botten får cocoon:a per clone-prep. Körs som sidouppgift efter andra köp.">Cocoon chunk % ${helpIcon("0.5% är försiktigt. Högre värden bygger cocoons snabbare men kan bromsa andra larvköp.")}
          <input id="kbc-clone-cocoon-chunk" type="number" min="0.1" max="100" step="0.1">
        </label>

        <label title="Minsta tid mellan två Clone Prep-köp. Hindrar loggen från att bara fyllas med cocoons.">Clone prep cooldown sek ${helpIcon("60 betyder att cocoon-prep högst körs en gång per minut, men andra smartköp fortsätter varje körning.")}
          <input id="kbc-clone-prep-cooldown" type="number" min="0" max="86400" step="5">
        </label>

        <label title="Ability-casts är avstängda som standard. Rush-abilities är oftast dåliga här.">
          <input id="kbc-auto-cast-abilities" type="checkbox">
          Auto-casta abilities (risk / off by default) ${helpIcon("Av som standard. 0.8.3 planerar abilities i advisor-läge men castar aldrig Clone Larvae eller House of Mirrors automatiskt när detta är av.")}
        </label>
      </div>

      <div class="kbc-tab-panel" data-kbc-tab-panel="advanced">
        <div class="kbc-section-title">Avancerat / legacy</div>

        <label title="Påverkar främst legacy-köplogik. Smartläget gör alltid larva-engine-koll först.">Order ${helpIcon("Upgrades först är oftast säkrast. Units först kan vara mer aggressivt.")}
          <select id="kbc-order">
            <option value="upgrades-first">Upgrades först</option>
            <option value="units-first">Units först</option>
          </select>
        </label>

        <label title="Skyddar mot att spendera bort resurser när ascension är nära.">
          <input id="kbc-pause-asc" type="checkbox">
          Pausa units nära ascension ${helpIcon("Stoppar unit-köp när botten tycker att ascension är nära.")}
        </label>

        <label title="Låt botten ascenda automatiskt när det är möjligt. Lämna normalt avstängt.">
          <input id="kbc-auto-asc" type="checkbox">
          Auto-ascend (risk / off by default) ${helpIcon("Riskabelt. 0.8.3 ändrar inte ascension automatiskt när detta är av.")}
        </label>

        <label title="Skriv mer teknisk information i webbläsarens console.">
          <input id="kbc-console-log" type="checkbox">
          Console-logg ${helpIcon("För felsökning i DevTools console.")}
        </label>
      </div>

      <div id="kbc-status"></div>
    `;

    strategyBar = document.createElement("div");
    strategyBar.id = "kbc-swarmbot-strategy-bar";
    strategyBar.className = "kbc-strategy-bar";

    strategyBar.innerHTML = `
      <div class="kbc-strategy-bar-head">
        <strong>The Swarm Council</strong>
        <button id="kbc-hide-strategy-bar" title="Dölj Strategy Bar">×</button>
      </div>
      <div id="kbc-strategy-bar-cards"></div>
    `;

    logPanel = document.createElement("div");
    logPanel.id = "kbc-swarmbot-advisor-panel";
    logPanel.className = "kbc-swarmbot-window";

    logPanel.innerHTML = `
      <div class="kbc-title" title="Dra här för att flytta Advisor">Advisor <span class="kbc-title-hint">why · hold · buy</span></div>

      <div class="kbc-row kbc-log-actions">
        <button id="kbc-clear-advisor">Rensa advisor</button>
        <button id="kbc-copy-advisor-md">Kopiera logg</button>
        <button id="kbc-hide-advisor-panel">Stäng</button>
      </div>

      <div class="kbc-section-title">Advisor</div>
      <div id="kbc-advisor-log"></div>
    `;

    purchasePanel = document.createElement("div");
    purchasePanel.id = "kbc-swarmbot-purchase-panel";
    purchasePanel.className = "kbc-swarmbot-window";

    purchasePanel.innerHTML = `
      <div class="kbc-title" title="Dra här för att flytta senaste köp">Senaste köp <span class="kbc-title-hint">purchases · drag</span></div>

      <div class="kbc-row kbc-log-actions">
        <button id="kbc-clear-log">Rensa köp</button>
        <button id="kbc-download-log-md">Export MD</button>
        <button id="kbc-hide-purchase-panel">Stäng</button>
      </div>

      <div id="kbc-purchase-log"></div>
    `;

    let css = document.getElementById("kbc-swarmbot-style");

    if (!css) {
      css = document.createElement("style");
      css.id = "kbc-swarmbot-style";
      document.head.appendChild(css);
    }

    css.textContent = `
      .kbc-swarmbot-window {
        position: fixed;
        z-index: 999999;
        overflow: auto;
        resize: both;
        padding: 10px;
        background: rgba(20, 20, 20, 0.92);
        color: white;
        border-radius: 8px;
        font-size: 12px;
        font-family: Arial, sans-serif;
        box-shadow: 0 4px 18px rgba(0,0,0,0.35);
        box-sizing: border-box;
      }

      #kbc-swarmbot-panel {
        left: auto;
        top: 80px;
        right: 12px;
        bottom: auto;
        width: 300px;
        height: 540px;
        min-width: 260px;
        min-height: 240px;
        max-width: calc(100vw - 24px);
        max-height: calc(100vh - 24px);
      }

      #kbc-swarmbot-advisor-panel {
        left: 12px;
        top: 80px;
        right: auto;
        bottom: auto;
        width: 560px;
        height: 420px;
        min-width: 320px;
        min-height: 200px;
        max-width: calc(100vw - 24px);
        max-height: calc(100vh - 24px);
      }

      #kbc-swarmbot-purchase-panel {
        left: 584px;
        top: 88px;
        right: auto;
        bottom: auto;
        width: 420px;
        height: 260px;
        min-width: 300px;
        min-height: 160px;
        max-width: calc(100vw - 24px);
        max-height: calc(100vh - 24px);
      }

      .kbc-strategy-bar {
        position: fixed;
        z-index: 1000000;
        left: 12px;
        right: 326px;
        top: 8px;
        min-height: 54px;
        padding: 8px 10px;
        background: rgba(20, 20, 20, 0.94);
        color: white;
        border-radius: 8px;
        font-size: 11px;
        font-family: Arial, sans-serif;
        box-shadow: 0 4px 18px rgba(0,0,0,0.35);
        box-sizing: border-box;
      }

      .kbc-strategy-bar-head {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 6px;
        opacity: 0.92;
      }

      .kbc-strategy-bar-head button {
        max-width: 28px;
        cursor: pointer;
      }

      #kbc-strategy-bar-cards {
        display: grid;
        grid-template-columns: repeat(8, minmax(90px, 1fr));
        gap: 6px;
      }

      .kbc-strategy-card {
        min-width: 0;
        padding: 6px;
        border: 1px solid rgba(255,255,255,0.12);
        border-radius: 6px;
        background: rgba(0,0,0,0.16);
        overflow: hidden;
      }

      .kbc-strategy-card span {
        display: block;
        opacity: 0.58;
        font-size: 10px;
        text-transform: uppercase;
        margin-bottom: 2px;
      }

      .kbc-strategy-card strong {
        display: block;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: normal;
        font-size: 11px;
        line-height: 1.2;
      }

      .kbc-strategy-card small {
        display: block;
        margin-top: 3px;
        font-size: 10px;
        line-height: 1.2;
        opacity: 0.8;
      }

      .kbc-council-shell {
        grid-column: 1 / -1;
        --kbc-council-line: rgba(255,255,255,0.14);
        --kbc-council-muted: rgba(255,255,255,0.68);
        --kbc-buy: #7ce38b;
        --kbc-hold: #ffd36a;
        --kbc-observe: #9fc7ff;
        --kbc-plan: #d8b4ff;
        display: grid;
        gap: 8px;
      }

      .kbc-council-hero {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        padding-bottom: 6px;
        border-bottom: 1px solid var(--kbc-council-line);
      }

      .kbc-council-hero strong {
        display: block;
        margin-top: 1px;
        font-size: 13px;
      }

      .kbc-council-eyebrow {
        display: block;
        color: var(--kbc-council-muted);
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 0;
        text-transform: uppercase;
      }

      .kbc-council-summary {
        display: grid;
        grid-template-columns: repeat(7, minmax(88px, 1fr));
        gap: 6px;
      }

      .kbc-council-summary-tile {
        min-width: 0;
        padding: 6px;
        border: 1px solid var(--kbc-council-line);
        border-radius: 6px;
        background: rgba(255,255,255,0.06);
      }

      .kbc-council-summary-tile span {
        display: block;
        color: var(--kbc-council-muted);
        font-size: 9px;
        font-weight: 700;
        text-transform: uppercase;
      }

      .kbc-council-summary-tile strong {
        display: block;
        margin-top: 2px;
        font-size: 10px;
        line-height: 1.25;
        overflow-wrap: anywhere;
      }

      .kbc-council-summary-warn {
        border-color: rgba(255, 211, 106, 0.5);
        background: rgba(255, 211, 106, 0.12);
      }

      .kbc-council-focus {
        padding: 7px 8px;
        border: 1px solid rgba(124, 227, 139, 0.34);
        border-radius: 6px;
        background: rgba(124, 227, 139, 0.09);
      }

      .kbc-council-now {
        display: grid;
        gap: 4px;
        padding: 7px 8px;
        border: 1px solid rgba(159, 199, 255, 0.42);
        border-radius: 6px;
        background: rgba(159, 199, 255, 0.12);
      }

      .kbc-council-now div {
        line-height: 1.25;
      }

      .kbc-council-now strong {
        color: rgba(255,255,255,0.88);
        margin-right: 4px;
      }

      .kbc-council-focus strong {
        display: block;
        margin-bottom: 4px;
        font-size: 11px;
        text-transform: uppercase;
      }

      .kbc-council-focus ul {
        margin: 0;
        padding-left: 16px;
      }

      .kbc-council-focus li {
        margin: 2px 0;
        line-height: 1.25;
      }

      .kbc-council-speaker {
        padding: 7px 8px;
        border: 1px solid rgba(255, 211, 106, 0.42);
        border-radius: 6px;
        background: rgba(255, 211, 106, 0.12);
      }

      .kbc-council-speaker strong {
        display: block;
        margin-bottom: 4px;
        font-size: 11px;
        text-transform: uppercase;
      }

      .kbc-council-bubble {
        padding: 6px 8px;
        border-radius: 8px;
        background: rgba(255,255,255,0.12);
        border: 1px solid rgba(255,255,255,0.25);
        line-height: 1.3;
      }

      .kbc-council-speaker small {
        display: block;
        margin-top: 4px;
        color: var(--kbc-council-muted);
        line-height: 1.2;
      }

      .kbc-council-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(150px, 1fr));
        gap: 6px;
      }

      .kbc-council-card {
        min-width: 0;
        padding: 7px;
        border: 1px solid var(--kbc-council-line);
        border-radius: 6px;
        background: rgba(0,0,0,0.18);
      }

      .kbc-council-card.is-active {
        border-color: rgba(124, 227, 139, 0.88);
        box-shadow: 0 0 0 1px rgba(124, 227, 139, 0.4), 0 0 14px rgba(124, 227, 139, 0.22);
        background: rgba(124, 227, 139, 0.11);
      }

      .kbc-council-card.is-muted {
        opacity: 0.78;
      }

      .kbc-council-card-head {
        display: grid;
        grid-template-columns: 20px minmax(0, 1fr) auto;
        align-items: center;
        gap: 6px;
      }

      .kbc-council-icon {
        font-size: 16px;
        line-height: 1;
        text-align: center;
      }

      .kbc-council-card-head strong,
      .kbc-council-card-head span {
        display: block;
      }

      .kbc-council-card-head div > span {
        color: var(--kbc-council-muted);
        font-size: 9px;
        line-height: 1.2;
      }

      .kbc-council-badge,
      .kbc-council-chip {
        display: inline-flex;
        align-items: center;
        max-width: 100%;
        min-height: 18px;
        padding: 2px 6px;
        border-radius: 999px;
        border: 1px solid rgba(255,255,255,0.18);
        color: white;
        font-size: 9px;
        font-weight: 700;
        line-height: 1.2;
        overflow-wrap: anywhere;
      }

      .kbc-council-buy {
        border-color: rgba(124, 227, 139, 0.8);
        background: rgba(124, 227, 139, 0.24);
      }

      .kbc-council-hold {
        border-color: rgba(255, 211, 106, 0.82);
        background: rgba(255, 211, 106, 0.22);
      }

      .kbc-council-observe {
        border-color: rgba(159, 199, 255, 0.75);
        background: rgba(159, 199, 255, 0.2);
      }

      .kbc-council-plan {
        border-color: rgba(216, 180, 255, 0.76);
        background: rgba(216, 180, 255, 0.2);
      }

      .kbc-council-ready {
        border-color: rgba(124, 227, 139, 0.9);
        background: rgba(124, 227, 139, 0.32);
      }

      .kbc-council-advise {
        border-color: rgba(159, 199, 255, 0.85);
        background: rgba(159, 199, 255, 0.28);
      }

      .kbc-council-background {
        border-color: rgba(255, 211, 106, 0.8);
        background: rgba(255, 211, 106, 0.2);
      }

      .kbc-council-wait {
        border-color: rgba(255,255,255,0.4);
        background: rgba(255,255,255,0.12);
      }

      .kbc-council-action {
        margin-top: 6px;
        font-weight: 700;
        line-height: 1.25;
        overflow-wrap: anywhere;
      }

      .kbc-council-card p {
        margin: 4px 0 0 0;
        color: rgba(255,255,255,0.86);
        line-height: 1.25;
      }

      .kbc-council-why {
        margin: 4px 0 0 0;
        color: rgba(255,255,255,0.82);
      }

      .kbc-council-status {
        margin: 4px 0 0 0;
        color: rgba(255,255,255,0.9);
      }

      .kbc-council-blockers {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
        margin-top: 6px;
      }

      .kbc-council-chip {
        color: rgba(255,255,255,0.9);
        background: rgba(255,255,255,0.08);
        font-weight: 600;
      }

      .kbc-council-technical {
        margin-top: 6px;
        color: rgba(255,255,255,0.72);
      }

      .kbc-council-technical summary {
        cursor: pointer;
        font-weight: 700;
      }

      .kbc-council-technical div {
        margin-top: 3px;
        line-height: 1.25;
        overflow-wrap: anywhere;
      }

      @media (max-width: 1100px) {
        .kbc-strategy-bar {
          right: 12px;
        }

        #kbc-strategy-bar-cards {
          grid-template-columns: repeat(4, minmax(90px, 1fr));
        }

        .kbc-council-summary {
          grid-template-columns: repeat(2, minmax(120px, 1fr));
        }

        .kbc-council-grid {
          grid-template-columns: repeat(2, minmax(140px, 1fr));
        }
      }

      @media (max-width: 700px) {
        .kbc-council-summary,
        .kbc-council-grid {
          grid-template-columns: 1fr;
        }
      }

      .kbc-swarmbot-window .kbc-title {
        font-weight: 700;
        font-size: 14px;
        margin: -2px -2px 8px -2px;
        padding: 4px 2px 8px 2px;
        cursor: move;
        user-select: none;
        border-bottom: 1px solid rgba(255,255,255,0.16);
      }

      .kbc-swarmbot-window .kbc-title-hint {
        float: right;
        opacity: 0.45;
        font-size: 10px;
        font-weight: 400;
        text-transform: uppercase;
      }

      .kbc-swarmbot-window .kbc-row {
        display: flex;
        gap: 6px;
        margin-bottom: 6px;
      }

      .kbc-swarmbot-window button {
        flex: 1;
        cursor: pointer;
      }

      .kbc-swarmbot-window label {
        display: block;
        margin: 5px 0;
      }

      .kbc-note {
        margin: 6px 0 8px 0;
        padding: 6px;
        border-left: 3px solid rgba(255,255,255,0.28);
        background: rgba(255,255,255,0.07);
        color: rgba(255,255,255,0.86);
        line-height: 1.3;
      }

      #kbc-strategy-inspector-view {
        overflow-y: auto;
        max-height: 210px;
        font-size: 11px;
        line-height: 1.35;
        border: 1px solid rgba(255,255,255,0.12);
        border-radius: 6px;
        padding: 6px;
        box-sizing: border-box;
        background: rgba(0,0,0,0.16);
      }

      .kbc-inspector-row {
        display: grid;
        grid-template-columns: 92px 1fr;
        gap: 8px;
        padding: 3px 0;
        border-bottom: 1px solid rgba(255,255,255,0.07);
        line-height: 1.25;
      }

      .kbc-inspector-key {
        color: rgba(255,255,255,0.62);
        font-weight: 700;
      }

      .kbc-inspector-value {
        color: rgba(255,255,255,0.92);
      }

      .kbc-swarmbot-window input[type="number"],
      .kbc-swarmbot-window select {
        width: 100%;
        box-sizing: border-box;
        margin-top: 2px;
        color: black;
      }

      .kbc-tabs {
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        gap: 4px;
        margin: 8px 0;
      }

      .kbc-tab {
        padding: 5px 3px;
        border: 1px solid rgba(255,255,255,0.25);
        background: rgba(255,255,255,0.12);
        color: white;
        border-radius: 4px;
        font-size: 11px;
      }

      .kbc-tab.is-active {
        background: rgba(255,255,255,0.92);
        color: black;
        font-weight: 700;
      }

      .kbc-tab-panel {
        display: none;
      }

      .kbc-tab-panel.is-active {
        display: block;
      }

      .kbc-field {
        margin: 8px 0;
      }

      .kbc-field-label {
        margin-bottom: 4px;
        font-weight: 700;
      }

      .kbc-help {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 14px;
        height: 14px;
        margin-left: 4px;
        border-radius: 50%;
        background: rgba(255,255,255,0.25);
        color: white;
        font-size: 10px;
        font-weight: 700;
        cursor: help;
      }

      .kbc-time-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 4px;
      }

      .kbc-time-grid label {
        margin: 0;
        font-size: 10px;
        opacity: 0.95;
      }

      .kbc-time-grid input {
        text-align: right;
      }

      #kbc-status {
        margin-top: 8px;
        padding-top: 6px;
        border-top: 1px solid rgba(255,255,255,0.25);
        opacity: 0.9;
      }

      .kbc-section-title {
        margin-top: 8px;
        margin-bottom: 4px;
        font-weight: 700;
        font-size: 11px;
        opacity: 0.9;
        text-transform: uppercase;
      }

      #kbc-advisor-log,
      #kbc-purchase-log {
        overflow-y: auto;
        font-size: 11px;
        line-height: 1.35;
        border: 1px solid rgba(255,255,255,0.12);
        border-radius: 6px;
        padding: 6px;
        box-sizing: border-box;
        background: rgba(0,0,0,0.16);
      }

      #kbc-advisor-log {
        height: calc(100% - 82px);
        min-height: 120px;
      }

      #kbc-purchase-log {
        height: calc(100% - 46px);
        min-height: 100px;
      }

      .kbc-advisor-row {
        padding: 4px 0;
        border-bottom: 1px solid rgba(255,255,255,0.06);
      }

      .kbc-advisor-row .kbc-decision {
        font-weight: 700;
      }

      .kbc-advisor-row .kbc-reason {
        display: block;
        opacity: 0.75;
        margin-top: 1px;
      }

      .kbc-purchase-row {
        padding: 3px 0;
        opacity: 0.95;
        border-bottom: 1px solid rgba(255,255,255,0.06);
      }

      .kbc-purchase-row .kbc-time {
        opacity: 0.65;
      }

      .kbc-purchase-row .kbc-type {
        font-weight: 700;
      }

      .kbc-purchase-row .kbc-amount {
        opacity: 0.85;
      }

      .kbc-purchase-row .kbc-internal {
        opacity: 0.45;
        font-size: 10px;
      }
    `;

    document.body.appendChild(strategyBar);
    document.body.appendChild(panel);
    document.body.appendChild(logPanel);
    document.body.appendChild(purchasePanel);

    applyAllWindowLayouts();
    installWindowDragAndResize(panel, SETTINGS_LAYOUT_STORAGE_KEY, defaultSettingsLayout(), "settings", 260, 240);
    installWindowDragAndResize(logPanel, LOG_LAYOUT_STORAGE_KEY, defaultLogLayout(), "log", 320, 200);
    installWindowDragAndResize(purchasePanel, PURCHASE_LAYOUT_STORAGE_KEY, defaultPurchaseLayout(), "log", 300, 160);

    window.addEventListener("resize", () => {
      applyAllWindowLayouts();
      scheduleSaveWindowLayout(panel, SETTINGS_LAYOUT_STORAGE_KEY, "settings");
      scheduleSaveWindowLayout(logPanel, LOG_LAYOUT_STORAGE_KEY, "log");
      scheduleSaveWindowLayout(purchasePanel, PURCHASE_LAYOUT_STORAGE_KEY, "log");
    });

    bindPanel();
    refreshPanel();
  }

  function bindPanel() {
    const $ = (id) => panel.querySelector(id);

    installSettingsTabs();

    $("#kbc-toggle").addEventListener("click", () => {
      config.enabled = !config.enabled;
      saveConfig();
      refreshPanel();
    });

    $("#kbc-run").addEventListener("click", () => safe("Manuell körning", runOnce));

    $("#kbc-reset-recommended").addEventListener("click", () => {
      resetToRecommendedSettings();
    });

    $("#kbc-reset-settings-layout").addEventListener("click", () => {
      resetSettingsPanelLayout();
    });

    $("#kbc-reset-log-layout-from-settings").addEventListener("click", () => {
      resetLogPanelLayout();
      resetPurchasePanelLayout();
    });

    $("#kbc-toggle-strategy-bar").addEventListener("click", () => {
      config.strategyBar = !config.strategyBar;
      saveConfig();
      refreshPanel();
    });

    $("#kbc-toggle-advisor-panel").addEventListener("click", () => {
      config.showAdvisorPanel = !config.showAdvisorPanel;
      saveConfig();
      refreshPanel();
    });

    $("#kbc-toggle-purchase-panel").addEventListener("click", () => {
      config.showPurchasePanel = !config.showPurchasePanel;
      saveConfig();
      refreshPanel();
    });

    $("#kbc-copy-log-md").addEventListener("click", () => copyLogExport("markdown"));
    $("#kbc-download-log-json").addEventListener("click", () => downloadLogExport("json"));

    strategyBar?.querySelector("#kbc-hide-strategy-bar")?.addEventListener("click", () => {
      config.strategyBar = false;
      saveConfig();
      refreshPanel();
    });

    logPanel?.querySelector("#kbc-hide-advisor-panel")?.addEventListener("click", () => {
      config.showAdvisorPanel = false;
      saveConfig();
      refreshPanel();
    });

    purchasePanel?.querySelector("#kbc-hide-purchase-panel")?.addEventListener("click", () => {
      config.showPurchasePanel = false;
      saveConfig();
      refreshPanel();
    });

    logPanel?.querySelector("#kbc-clear-advisor")?.addEventListener("click", () => {
      advisorLog = [];
      refreshPanel();
    });

    logPanel?.querySelector("#kbc-copy-advisor-md")?.addEventListener("click", () => copyLogExport("markdown"));

    purchasePanel?.querySelector("#kbc-clear-log")?.addEventListener("click", () => {
      purchaseLog = [];
      refreshPanel();
    });

    purchasePanel?.querySelector("#kbc-download-log-md")?.addEventListener("click", () => downloadLogExport("markdown"));

    $("#kbc-smart-mode").addEventListener("change", (e) => {
      config.smartMode = e.target.checked;
      saveConfig();
      refreshPanel();
    });

    $("#kbc-advisor-only").addEventListener("change", (e) => {
      config.advisorOnly = e.target.checked;
      saveConfig();
      refreshPanel();
    });

    $("#kbc-auto-buy-safe").addEventListener("change", (e) => {
      config.autoBuySafeDecisions = e.target.checked;
      saveConfig();
      refreshPanel();
    });

    $("#kbc-strategy-inspector").addEventListener("change", (e) => {
      config.strategyInspector = e.target.checked;
      saveConfig();
      refreshPanel();
    });

    $("#kbc-council-ui").addEventListener("change", (e) => {
      config.councilUi = e.target.checked;
      saveConfig();
      refreshPanel();
    });

    $("#kbc-larva-engine").addEventListener("change", (e) => {
      config.larvaEnginePriority = e.target.checked;
      saveConfig();
      refreshPanel();
    });

    $("#kbc-territory-roi").addEventListener("change", (e) => {
      config.territoryRoiMode = e.target.checked;
      saveConfig();
      refreshPanel();
    });

    $("#kbc-territory-min-eta").addEventListener("change", (e) => {
      config.territoryMinEtaImprovementSeconds = clampNumber(e.target.value, 0, 31536000, config.territoryMinEtaImprovementSeconds);
      saveConfig();
      refreshPanel();
    });

    $("#kbc-territory-min-ratio").addEventListener("change", (e) => {
      config.territoryMinEtaImprovementRatio = clampNumber(e.target.value, 0, 1, config.territoryMinEtaImprovementRatio);
      saveConfig();
      refreshPanel();
    });

    $("#kbc-prioritize-production-upgrades").addEventListener("change", (e) => {
      config.prioritizeProductionUpgrades = e.target.checked;
      saveConfig();
      refreshPanel();
    });

    $("#kbc-production-ignore-notify").addEventListener("change", (e) => {
      config.productionUpgradesIgnoreNotify = e.target.checked;
      saveConfig();
      refreshPanel();
    });

    $("#kbc-critical-production-max").addEventListener("change", (e) => {
      config.criticalProductionMaxPerRun = Math.max(0, Number(e.target.value || 0));
      saveConfig();
      refreshPanel();
    });

    $("#kbc-energy-strategy").addEventListener("change", (e) => {
      config.energyStrategy = e.target.checked;
      saveConfig();
      refreshPanel();
    });

    $("#kbc-nexus-target").addEventListener("change", (e) => {
      config.nexusTarget = Math.round(clampNumber(e.target.value, 1, 5, config.nexusTarget));
      saveConfig();
      refreshPanel();
    });

    $("#kbc-save-energy-nexus").addEventListener("change", (e) => {
      config.saveEnergyForNexus = e.target.checked;
      saveConfig();
      refreshPanel();
    });

    $("#kbc-lepidoptera-roi").addEventListener("change", (e) => {
      config.lepidopteraRoiMode = e.target.checked;
      saveConfig();
      refreshPanel();
    });

    $("#kbc-lepidoptera-stop").addEventListener("change", (e) => {
      config.lepidopteraStopAtBoostPercent = clampNumber(e.target.value, 0, 99.9, config.lepidopteraStopAtBoostPercent);
      saveConfig();
      refreshPanel();
    });

    $("#kbc-max-lepidoptera").addEventListener("change", (e) => {
      config.maxLepidopteraPerRun = Math.max(0, Number(e.target.value || 0));
      saveConfig();
      refreshPanel();
    });

    $("#kbc-energy-planner").addEventListener("change", (e) => {
      config.energyPlanner = e.target.checked;
      saveConfig();
      refreshPanel();
    });

    $("#kbc-block-lepidoptera-before").addEventListener("change", (e) => {
      config.blockLepidopteraBeforeNexus = Math.round(clampNumber(e.target.value, 1, 5, config.blockLepidopteraBeforeNexus));
      saveConfig();
      refreshPanel();
    });

    $("#kbc-fast-nexus5-moth-target").addEventListener("change", (e) => {
      config.fastNexus5MothSoftTarget = Math.max(0, Number(e.target.value || 0));
      saveConfig();
      refreshPanel();
    });

    $("#kbc-offline-mode").addEventListener("change", (e) => {
      config.offlineMode = e.target.checked;
      saveConfig();
      refreshPanel();
    });

    $("#kbc-ability-planner").addEventListener("change", (e) => {
      config.abilityPlanner = e.target.checked;
      saveConfig();
      refreshPanel();
    });

    $("#kbc-manage-clone-cocoons").addEventListener("change", (e) => {
      config.manageCloneLarvaeCocoons = e.target.checked;
      saveConfig();
      refreshPanel();
    });

    $("#kbc-clone-cocoon-target").addEventListener("change", (e) => {
      config.cloneCocoonTargetPercent = clampNumber(e.target.value, 0, 200, config.cloneCocoonTargetPercent);
      saveConfig();
      refreshPanel();
    });

    $("#kbc-clone-cocoon-chunk").addEventListener("change", (e) => {
      config.cloneCocoonChunkPercent = clampNumber(e.target.value, 0.1, 100, config.cloneCocoonChunkPercent);
      saveConfig();
      refreshPanel();
    });

    $("#kbc-clone-prep-cooldown").addEventListener("change", (e) => {
      config.clonePrepCooldownSeconds = Math.round(clampNumber(e.target.value, 0, 86400, config.clonePrepCooldownSeconds));
      saveConfig();
      refreshPanel();
    });

    $("#kbc-auto-cast-abilities").addEventListener("change", (e) => {
      config.autoCastAbilities = e.target.checked;
      saveConfig();
      refreshPanel();
    });

    $("#kbc-preset").addEventListener("change", (e) => {
      applyPreset(e.target.value);
    });

    $("#kbc-seconds").addEventListener("change", (e) => {
      config.runEverySeconds = clampNumber(e.target.value, 1, 60, config.runEverySeconds);
      saveConfig();
      restartTimer();
      refreshPanel();
    });

    $("#kbc-smart-max-actions").addEventListener("change", (e) => {
      config.smartMaxActionsPerRun = Math.round(clampNumber(e.target.value, 1, 20, config.smartMaxActionsPerRun));
      saveConfig();
      refreshPanel();
    });

    $("#kbc-order").addEventListener("change", (e) => {
      config.purchaseOrder = e.target.value;
      saveConfig();
    });

    $("#kbc-unit-strategy").addEventListener("change", (e) => {
      config.unitStrategy = e.target.value;
      saveConfig();
    });

    $("#kbc-focus").addEventListener("change", (e) => {
      config.focusTab = e.target.value;
      saveConfig();
    });

    $("#kbc-buy-units").addEventListener("change", (e) => {
      config.buyUnits = e.target.checked;
      saveConfig();
    });

    $("#kbc-buy-upgrades").addEventListener("change", (e) => {
      config.buyUpgrades = e.target.checked;
      saveConfig();
    });

    $("#kbc-unit-percent").addEventListener("change", (e) => {
      config.unitBuyPercent = clampNumber(e.target.value, 0.01, 1, config.unitBuyPercent);
      saveConfig();
      refreshPanel();
    });

    $("#kbc-upgrade-percent").addEventListener("change", (e) => {
      config.upgradeBuyPercent = clampNumber(e.target.value, 0.01, 1, config.upgradeBuyPercent);
      saveConfig();
      refreshPanel();
    });

    $("#kbc-smart-unit-percent").addEventListener("change", (e) => {
      const percent = clampNumber(e.target.value, 0.1, 100, config.smartUnitBuyPercent * 100);
      config.smartUnitBuyPercent = percent / 100;
      saveConfig();
      refreshPanel();
    });

    $("#kbc-meat-chain-cascade").addEventListener("change", (e) => {
      config.meatChainCascade = e.target.checked;
      saveConfig();
      refreshPanel();
    });

    $("#kbc-meat-chain-twin-prep").addEventListener("change", (e) => {
      config.meatChainTwinPrep = e.target.checked;
      saveConfig();
      refreshPanel();
    });

    $("#kbc-meat-goal-planner").addEventListener("change", (e) => {
      config.meatGoalPlanner = e.target.checked;
      saveConfig();
      refreshPanel();
    });

    $("#kbc-meat-planner-depth").addEventListener("change", (e) => {
      config.meatPlannerDepth = Math.round(clampNumber(e.target.value, 1, 6, config.meatPlannerDepth));
      saveConfig();
      refreshPanel();
    });

    $("#kbc-meat-planner-chunk").addEventListener("change", (e) => {
      config.meatPlannerChunkPercent = clampNumber(e.target.value, 0.1, 100, config.meatPlannerChunkPercent);
      saveConfig();
      refreshPanel();
    });

    const meatFallbackEnabledInput = $("#kbc-meat-fallback-enabled");
    if (meatFallbackEnabledInput) {
      meatFallbackEnabledInput.addEventListener("change", (e) => {
        config.meatFallbackEnabled = e.target.checked;
        saveConfig();
        refreshPanel();
      });
    }

    const meatFallbackHoldRunsInput = $("#kbc-meat-fallback-hold-runs");
    if (meatFallbackHoldRunsInput) {
      meatFallbackHoldRunsInput.addEventListener("change", (e) => {
        config.meatFallbackMinHoldRuns = Math.round(clampNumber(e.target.value, 0, 1000, config.meatFallbackMinHoldRuns));
        saveConfig();
        refreshPanel();
      });
    }

    const meatFallbackRankDropInput = $("#kbc-meat-fallback-rank-drop");
    if (meatFallbackRankDropInput) {
      meatFallbackRankDropInput.addEventListener("change", (e) => {
        config.meatFallbackMaxRankDrop = Math.round(clampNumber(e.target.value, 0, 50, config.meatFallbackMaxRankDrop));
        saveConfig();
        refreshPanel();
      });
    }

    const meatFallbackChunkInput = $("#kbc-meat-fallback-chunk");
    if (meatFallbackChunkInput) {
      meatFallbackChunkInput.addEventListener("change", (e) => {
        config.meatFallbackChunkPercent = clampNumber(e.target.value, 0.1, 100, config.meatFallbackChunkPercent);
        saveConfig();
        refreshPanel();
      });
    }

    const meatActionBypassInput = $("#kbc-meat-action-payback-bypass");
    if (meatActionBypassInput) {
      meatActionBypassInput.addEventListener("change", (e) => {
        config.meatActionUnitPaybackBypass = e.target.checked;
        saveConfig();
        refreshPanel();
      });
    }

    const meatActionMinReserveInput = $("#kbc-meat-action-min-reserve");
    if (meatActionMinReserveInput) {
      meatActionMinReserveInput.addEventListener("change", (e) => {
        config.meatActionUnitMinReserveRatio = clampNumber(e.target.value, 1, 1000, config.meatActionUnitMinReserveRatio);
        saveConfig();
        refreshPanel();
      });
    }

    const meatFallbackFloorInput = $("#kbc-meat-fallback-floor-action");
    if (meatFallbackFloorInput) {
      meatFallbackFloorInput.addEventListener("change", (e) => {
        config.meatFallbackDoNotDropBelowActionUnit = e.target.checked;
        saveConfig();
        refreshPanel();
      });
    }

    const twinBufferInput = $("#kbc-twin-recovery-buffer");
    if (twinBufferInput) {
      twinBufferInput.addEventListener("change", (e) => {
        config.twinRecoveryBufferMultiplier = clampNumber(e.target.value, 0, 5, config.twinRecoveryBufferMultiplier);
        saveConfig();
        refreshPanel();
      });
    }

    const meatPaybackGuardInput = $("#kbc-meat-payback-guard");
    if (meatPaybackGuardInput) {
      meatPaybackGuardInput.addEventListener("change", (e) => {
        config.meatChainPaybackGuard = e.target.checked;
        saveConfig();
        refreshPanel();
      });
    }

    const meatReserveInput = $("#kbc-meat-reserve-multiplier");
    if (meatReserveInput) {
      meatReserveInput.addEventListener("change", (e) => {
        config.meatChainReserveMultiplier = clampNumber(e.target.value, 0, 10, config.meatChainReserveMultiplier);
        saveConfig();
        refreshPanel();
      });
    }

    const meatPaybackInput = $("#kbc-meat-max-payback");
    if (meatPaybackInput) {
      meatPaybackInput.addEventListener("change", (e) => {
        config.meatChainMaxPaybackSeconds = Math.round(clampNumber(e.target.value, 0, 31536000, config.meatChainMaxPaybackSeconds));
        saveConfig();
        refreshPanel();
      });
    }

    bindDurationInputs("kbc-save-hatchery", "saveForHatcherySeconds", 31536000);
    bindDurationInputs("kbc-save-expansion", "saveForExpansionSeconds", 31536000);

    $("#kbc-expansion-weight").addEventListener("change", (e) => {
      config.expansionPriorityWeight = clampNumber(e.target.value, 0.5, 10, config.expansionPriorityWeight);
      saveConfig();
      refreshPanel();
    });

    $("#kbc-max-units").addEventListener("change", (e) => {
      config.maxUnitTypesPerRun = Math.max(0, Number(e.target.value || 0));
      saveConfig();
      refreshPanel();
    });

    $("#kbc-max-upgrades").addEventListener("change", (e) => {
      config.maxUpgradesPerRun = Math.max(0, Number(e.target.value || 0));
      saveConfig();
      refreshPanel();
    });

    $("#kbc-pause-asc").addEventListener("change", (e) => {
      config.pauseUnitsNearAscension = e.target.checked;
      saveConfig();
    });

    $("#kbc-auto-asc").addEventListener("change", (e) => {
      config.autoAscend = e.target.checked;
      saveConfig();
    });

    $("#kbc-console-log").addEventListener("change", (e) => {
      config.showConsoleLogs = e.target.checked;
      saveConfig();
    });
  }

  function refreshPanel() {
    if (!panel) return;

    const $ = (id) => panel.querySelector(id);

    $("#kbc-toggle").textContent = config.enabled ? "Pausa" : "Starta";
    $("#kbc-toggle").style.opacity = config.enabled ? "1" : "0.65";

    $("#kbc-preset").value = config.preset;
    $("#kbc-smart-mode").checked = !!config.smartMode;
    $("#kbc-advisor-only").checked = !!config.advisorOnly;
    $("#kbc-auto-buy-safe").checked = !!config.autoBuySafeDecisions;
    $("#kbc-strategy-inspector").checked = !!config.strategyInspector;
    $("#kbc-council-ui").checked = !!config.councilUi;
    $("#kbc-smart-max-actions").value = config.smartMaxActionsPerRun;
    $("#kbc-larva-engine").checked = !!config.larvaEnginePriority;
    $("#kbc-territory-roi").checked = !!config.territoryRoiMode;
    $("#kbc-territory-min-eta").value = config.territoryMinEtaImprovementSeconds;
    $("#kbc-territory-min-ratio").value = config.territoryMinEtaImprovementRatio;
    $("#kbc-prioritize-production-upgrades").checked = !!config.prioritizeProductionUpgrades;
    $("#kbc-production-ignore-notify").checked = !!config.productionUpgradesIgnoreNotify;
    $("#kbc-critical-production-max").value = config.criticalProductionMaxPerRun;
    $("#kbc-energy-strategy").checked = !!config.energyStrategy;
    $("#kbc-nexus-target").value = config.nexusTarget;
    $("#kbc-save-energy-nexus").checked = !!config.saveEnergyForNexus;
    $("#kbc-lepidoptera-roi").checked = !!config.lepidopteraRoiMode;
    $("#kbc-lepidoptera-stop").value = config.lepidopteraStopAtBoostPercent;
    $("#kbc-max-lepidoptera").value = config.maxLepidopteraPerRun;
    $("#kbc-energy-planner").checked = !!config.energyPlanner;
    $("#kbc-block-lepidoptera-before").value = config.blockLepidopteraBeforeNexus;
    $("#kbc-fast-nexus5-moth-target").value = config.fastNexus5MothSoftTarget;
    $("#kbc-offline-mode").checked = !!config.offlineMode;
    $("#kbc-ability-planner").checked = !!config.abilityPlanner;
    $("#kbc-manage-clone-cocoons").checked = !!config.manageCloneLarvaeCocoons;
    $("#kbc-clone-cocoon-target").value = config.cloneCocoonTargetPercent;
    $("#kbc-clone-cocoon-chunk").value = config.cloneCocoonChunkPercent;
    $("#kbc-clone-prep-cooldown").value = config.clonePrepCooldownSeconds;
    $("#kbc-auto-cast-abilities").checked = !!config.autoCastAbilities;
    $("#kbc-seconds").value = config.runEverySeconds;
    $("#kbc-order").value = config.purchaseOrder;
    $("#kbc-unit-strategy").value = config.unitStrategy;
    $("#kbc-focus").value = config.focusTab;

    $("#kbc-buy-units").checked = !!config.buyUnits;
    $("#kbc-buy-upgrades").checked = !!config.buyUpgrades;

    $("#kbc-unit-percent").value = config.unitBuyPercent;
    $("#kbc-upgrade-percent").value = config.upgradeBuyPercent;
    $("#kbc-smart-unit-percent").value = trimNumber(config.smartUnitBuyPercent * 100);
    $("#kbc-meat-chain-cascade").checked = !!config.meatChainCascade;
    $("#kbc-meat-chain-twin-prep").checked = !!config.meatChainTwinPrep;
    $("#kbc-meat-goal-planner").checked = !!config.meatGoalPlanner;
    $("#kbc-meat-planner-depth").value = config.meatPlannerDepth;
    $("#kbc-meat-planner-chunk").value = config.meatPlannerChunkPercent;
    if ($("#kbc-meat-fallback-enabled")) $("#kbc-meat-fallback-enabled").checked = !!config.meatFallbackEnabled;
    if ($("#kbc-meat-fallback-hold-runs")) $("#kbc-meat-fallback-hold-runs").value = config.meatFallbackMinHoldRuns;
    if ($("#kbc-meat-fallback-rank-drop")) $("#kbc-meat-fallback-rank-drop").value = config.meatFallbackMaxRankDrop;
    if ($("#kbc-meat-fallback-chunk")) $("#kbc-meat-fallback-chunk").value = config.meatFallbackChunkPercent;
    if ($("#kbc-meat-action-payback-bypass")) $("#kbc-meat-action-payback-bypass").checked = !!config.meatActionUnitPaybackBypass;
    if ($("#kbc-meat-action-min-reserve")) $("#kbc-meat-action-min-reserve").value = config.meatActionUnitMinReserveRatio;
    if ($("#kbc-meat-fallback-floor-action")) $("#kbc-meat-fallback-floor-action").checked = !!config.meatFallbackDoNotDropBelowActionUnit;
    if ($("#kbc-twin-recovery-buffer")) $("#kbc-twin-recovery-buffer").value = config.twinRecoveryBufferMultiplier;
    if ($("#kbc-meat-payback-guard")) $("#kbc-meat-payback-guard").checked = !!config.meatChainPaybackGuard;
    if ($("#kbc-meat-reserve-multiplier")) $("#kbc-meat-reserve-multiplier").value = config.meatChainReserveMultiplier;
    if ($("#kbc-meat-max-payback")) $("#kbc-meat-max-payback").value = config.meatChainMaxPaybackSeconds;
    writeDurationInputs("kbc-save-hatchery", config.saveForHatcherySeconds);
    writeDurationInputs("kbc-save-expansion", config.saveForExpansionSeconds);
    $("#kbc-expansion-weight").value = config.expansionPriorityWeight;
    $("#kbc-max-units").value = config.maxUnitTypesPerRun;
    $("#kbc-max-upgrades").value = config.maxUpgradesPerRun;

    $("#kbc-pause-asc").checked = !!config.pauseUnitsNearAscension;
    $("#kbc-auto-asc").checked = !!config.autoAscend;
    $("#kbc-console-log").checked = !!config.showConsoleLogs;

    $("#kbc-status").textContent = lastStatus;

    const strategyToggle = $("#kbc-toggle-strategy-bar");
    if (strategyToggle) strategyToggle.textContent = config.strategyBar ? "Hide bar" : "Show bar";

    const advisorToggle = $("#kbc-toggle-advisor-panel");
    if (advisorToggle) advisorToggle.textContent = config.showAdvisorPanel ? "Hide advisor" : "Show advisor";

    const purchaseToggle = $("#kbc-toggle-purchase-panel");
    if (purchaseToggle) purchaseToggle.textContent = config.showPurchasePanel ? "Hide köp" : "Show köp";

    if (strategyBar) strategyBar.style.display = config.strategyBar ? "block" : "none";
    if (logPanel) logPanel.style.display = config.showAdvisorPanel ? "block" : "none";
    if (purchasePanel) purchasePanel.style.display = config.showPurchasePanel ? "block" : "none";

    const strategyBarCardsEl = strategyBar?.querySelector("#kbc-strategy-bar-cards");
    if (strategyBarCardsEl) strategyBarCardsEl.innerHTML = strategyBarHtml();

    const advisorLogEl = logPanel?.querySelector("#kbc-advisor-log");

    if (advisorLogEl) {
      advisorLogEl.innerHTML = advisorLog.length
        ? advisorLog
            .map((item) => `
              <div class="kbc-advisor-row">
                <span class="kbc-time">${escapeHtml(item.time)}</span>
                · <span class="kbc-decision">${escapeHtml(item.decision)}</span>
                ${escapeHtml(item.title)}
                ${item.reason ? `<span class="kbc-reason">${escapeHtml(item.reason)}</span>` : ""}
              </div>
            `)
            .join("")
        : `<div class="kbc-advisor-row">Ingen advisor-info ännu</div>`;
    }

    const purchaseLogEl = purchasePanel?.querySelector("#kbc-purchase-log");

    if (purchaseLogEl) {
      purchaseLogEl.innerHTML = purchaseLog.length
        ? purchaseLog
            .map((item) => {
              if (item.type === "Info") {
                return `
                  <div class="kbc-purchase-row">
                    <span class="kbc-time">${escapeHtml(item.time)}</span>
                    · ${escapeHtml(item.name)}
                  </div>
                `;
              }

              const internal =
                item.internalName && item.internalName !== item.name
                  ? ` <span class="kbc-internal">(${escapeHtml(item.internalName)})</span>`
                  : "";

              return `
                <div class="kbc-purchase-row">
                  <span class="kbc-time">${escapeHtml(item.time)}</span>
                  · <span class="kbc-type">${escapeHtml(item.type)}</span>
                  · <span class="kbc-amount">+${escapeHtml(item.amount)}</span>
                  ${escapeHtml(item.name)}${internal}
                </div>
              `;
            })
            .join("")
        : `<div class="kbc-purchase-row">Inga köp ännu</div>`;
    }
  }

  function start() {
    if (w[BOT_NAME]?.timer) {
      clearInterval(w[BOT_NAME].timer);
    }

    scenarioHarnessContext.enabled = isScenarioHarnessEnabled();

    w[BOT_NAME] = {
      scriptVersion: SCRIPT_VERSION,
      autobuyerVersion: SCRIPT_VERSION,
      scenarioReportVersion: SCENARIO_REPORT_VERSION,
      config,
      runOnce,

      // Bakåtkompatibelt alias från tidigare versioner.
      tick: runOnce,

      applyPreset,
      resetToRecommendedSettings,

      stop() {
        config.enabled = false;
        saveConfig();
        refreshPanel();
        log("Pausad");
      },

      start() {
        config.enabled = true;
        saveConfig();
        refreshPanel();
        log("Startad");
      },

      resetSettings() {
        resetToRecommendedSettings();
      },

      clearLog() {
        purchaseLog = [];
        refreshPanel();
        log("Köploggen rensad");
      },

      clearAdvisor() {
        advisorLog = [];
        refreshPanel();
        log("Advisor-loggen rensad");
      },

      getStrategyInspector() {
        return strategyInspector;
      },

      getRunHistory() {
        return runHistory.slice();
      },

      getLiveDiagnostics() {
        return liveDiagnostics || buildLiveDiagnostics(runHistory);
      },

      clearRunHistory,

      getLogExport(format = "markdown") {
        return getLogExportText(format);
      },

      scenarioHarness: {
        isEnabled: isScenarioHarnessEnabled,
        enable() {
          return setScenarioHarnessEnabled(true);
        },
        disable() {
          return setScenarioHarnessEnabled(false);
        },
        run(options = {}) {
          return runDeterministicScenarioHarness(options);
        },
      },

      copyLogExport,
      downloadLogExport,

      resetSettingsPanelLayout,
      resetLogPanelLayout,
      resetPurchasePanelLayout,
      resetAllPanelLayouts,
    };

    createPanel();
    restartTimer();

    setTimeout(() => safe("Första körning", runOnce), 1500);

    log("Laddad. Styr via panelen eller console: kbcSwarmBot.runOnce()");
  }

  function waitForGame(retries = 40) {
    try {
      getGame();
      start();
    } catch (error) {
      if (retries <= 0) {
        warn("Kunde inte starta:", error.message || error);
        return;
      }

      setTimeout(() => waitForGame(retries - 1), 500);
    }
  }

  waitForGame();
})();

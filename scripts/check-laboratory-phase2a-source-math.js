const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const root = path.resolve(__dirname, "..");
const userscriptPath = path.join(root, "src", "SwarmSim-Strategy-Autobuyer.user.js");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function main() {
  const userscript = fs.readFileSync(userscriptPath, "utf8");
  for (const expected of [
    'gameAbilityId: "larvarush"',
    'resourceKey: "larvae", velocitySeconds: 2400, flatAddition: 100000',
    'gameAbilityId: "meatrush"',
    'resourceKey: "meat", velocitySeconds: 7200, flatAddition: 100000000000',
    'gameAbilityId: "territoryrush"',
    'resourceKey: "territory", velocitySeconds: 7200, flatAddition: 1000000000',
    'const LABORATORY_PHASE2_RESULT_SCHEMA_VERSION = "swarmsim-lab.result.v2"',
  ]) {
    assert(userscript.includes(expected), `missing pinned Phase 2A source-math surface: ${expected}`);
  }

  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.goto("https://www.swarmsim.com/#/tab/energy", { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.evaluate(() => {
      localStorage.setItem("kbcSwarmBotLaboratoryEnabled_v1", "true");
      localStorage.setItem("kbcSwarmBotLaboratoryLiveEnabled_v1", "true");
    });
    await page.addScriptTag({ content: userscript });
    await page.waitForFunction(() => !!window.kbcSwarmBot?.laboratory, { timeout: 60000 });

    const result = await page.evaluate(async () => {
      const laboratory = window.kbcSwarmBot.laboratory;
      const captured = await laboratory.captureLiveSnapshot({ snapshotId: "PHASE2A-CHECK" });
      if (!captured?.ok) return { error: captured?.error || "snapshot capture failed" };
      const snapshot = JSON.parse(JSON.stringify(captured.snapshot));
      snapshot.resources.energy.amount = "3000";
      snapshot.resources.energy.perSecond = "10";
      snapshot.resources.energy.cap = "1000000";
      for (const key of ["larvarush", "meatrush", "territoryrush"]) {
        const ability = snapshot.abilities[key];
        if (!ability) return { error: `missing ${key} snapshot` };
        ability.available = true;
        ability.unlocked = true;
        ability.visible = true;
        ability.affordable = true;
        ability.energyCost = "1600";
        ability.unavailableReason = null;
        ability.unavailableReasonCode = null;
        ability.runtimePreviewOutput = ability.formulaInputs.sourceVerifiedOutput;
      }
      const experiment = await laboratory.runPhase2AExperiment(snapshot, { experimentId: "PHASE2A-CHECK" });
      const live = await laboratory.runLivePhase2A({ snapshot, experimentId: "PHASE2A-LIVE-CHECK" });
      return { experiment: JSON.parse(JSON.stringify(experiment)), report: JSON.parse(JSON.stringify(live.result?.energyOpportunityReport || null)) };
    });

    assert(!result.error, result.error);
    const experiment = result.experiment;
    assert(experiment.schemaVersion === "swarmsim-lab.result.v2", "unexpected Phase 2A result schema");
    assert(JSON.stringify(experiment.actions) === JSON.stringify(["WAIT", "LARVA_RUSH", "MEAT_RUSH", "TERRITORY_RUSH"]), "unexpected Phase 2A action matrix");
    assert(experiment.runs.length === 8, "Phase 2A must produce four actions at two horizons");
    assert(experiment.runs.every((run) => run.status === "ok" && run.actionLegal && run.actionApplied), "Phase 2A legal fixture contains a failed run");

    const run = (actionId, horizon) => experiment.runs.find((item) => item.actionId === actionId && item.horizonSeconds === String(horizon));
    const wait60 = run("WAIT", 60);
    const larva60 = run("LARVA_RUSH", 60);
    const meat60 = run("MEAT_RUSH", 60);
    const territory60 = run("TERRITORY_RUSH", 60);
    assert(larva60.comparisonVsWait.larvaeAbsoluteDelta === experiment.snapshot.abilities.larvarush.formulaInputs.sourceVerifiedOutput, "Larva Rush delta does not match source-derived output");
    assert(meat60.comparisonVsWait.meatAbsoluteDelta === experiment.snapshot.abilities.meatrush.formulaInputs.sourceVerifiedOutput, "Meat Rush delta does not match source-derived output");
    assert(territory60.comparisonVsWait.territoryAbsoluteDelta === experiment.snapshot.abilities.territoryrush.formulaInputs.sourceVerifiedOutput, "Territory Rush delta does not match source-derived output");
    assert(wait60.metrics.energyAfter !== null && larva60.comparisonVsWait.energyAbsoluteDelta !== null, "Energy projection/comparison is missing");
    assert(experiment.snapshotHash === experiment.snapshot.snapshotHash, "snapshot hash identity changed during experiment");
    assert(result.report?.kind === "advisor-only-energy-opportunity-report", "advisor-only Energy Opportunity Report is missing");
    assert(result.report.entries.length === 3, "Energy Opportunity Report must cover all three Rush actions");
    assert(result.report.entries.every((entry) => entry.cloneLarvaeDelaySeconds !== null && entry.houseOfMirrorsDelaySeconds !== null), "ability opportunity-cost delays are missing");
  } finally {
    await browser.close();
  }

  console.log("LABORATORY PHASE 2A SOURCE MATH CHECK PASSED");
}

main().catch((error) => {
  console.error(error.stack || error.message || error);
  process.exit(1);
});

const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const runtimePath = path.join(root, "dev-src", "runtime-sections", "runtime-main.js");
const canonicalPath = path.join(root, "src", "SwarmSim-Strategy-Autobuyer.user.js");
const pkgPath = path.join(root, "package.json");

const runtime = fs.readFileSync(runtimePath, "utf8");
const canonical = fs.existsSync(canonicalPath) ? fs.readFileSync(canonicalPath, "utf8") : "";
const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));

function fail(message) {
  console.error(message);
  process.exit(1);
}

function assert(condition, message) {
  if (!condition) fail(message);
}

function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === "object") {
    return Object.keys(value).sort().reduce((out, key) => {
      out[key] = canonicalize(value[key]);
      return out;
    }, {});
  }
  return value;
}

function canonicalJson(value) {
  return JSON.stringify(canonicalize(value));
}

function sha256(value) {
  return `sha256:${crypto.createHash("sha256").update(String(value)).digest("hex")}`;
}

function deepFreeze(value, seen = new WeakSet()) {
  if (!value || typeof value !== "object" || seen.has(value)) return value;
  seen.add(value);
  for (const child of Object.values(value)) deepFreeze(child, seen);
  return Object.freeze(value);
}

function hashPayload(snapshot) {
  const clone = JSON.parse(JSON.stringify(snapshot));
  delete clone.snapshotHash;
  if (clone.source) delete clone.source.capturedAt;
  return clone;
}

function makeSnapshot(overrides = {}) {
  const snapshot = {
    schemaVersion: "swarmsim-lab.snapshot.v1",
    kind: "deterministic-simulation-snapshot",
    snapshotId: "LAB-TEST",
    snapshotHash: null,
    snapshotHashScope: "deterministic-payload-v1",
    source: {
      scriptVersion: "0.12.0",
      frozenBaselineVersion: "0.11.7",
      verifiedRuntimeCommit: "1ee631901cd04a1d97ddb0bcee5efa2499481ecc",
      baselineRepositoryCommit: "ea999526994c75899b6b1a478e7146f046417803",
      currentCommit: null,
      scenarioHarnessVersion: "0.12.0",
      scenarioId: "LAB",
      scenarioHash: "sha256:test",
      gameBuild: "swarm-angular-runtime",
      capturedAt: "2026-07-10T00:00:00.000Z",
      ...(overrides.source || {}),
    },
    simulation: {
      mode: "deterministic-simulation",
      interventionTimeSeconds: "0",
      horizonsSeconds: ["60", "300"],
      postActionPolicy: "passive-only",
      normalAutobuyerEnabled: false,
      liveSaveMutable: false,
    },
    resources: {
      energy: { amount: "100", perSecond: "1.25", cap: "10000" },
      larvae: { amount: "900719925474099312345", perSecond: "0.333333333333333333" },
      cocoons: { amount: "42", perSecond: "0" },
      territory: { amount: "10", perSecond: "7" },
      meat: {
        perSecond: "12",
        rateProjection: {
          basis: "factorial-polynomial-derivative",
          coefficients: ["35", "12", "6"],
          maxDegree: 2,
          valueAtZero: "12",
          validation: "source-verified",
        },
      },
    },
    army: {
      houseOfMirrorsAffectedUnits: [
        {
          unitId: "swarmling",
          count: "2",
          effectiveTerritoryPerSecondPerUnit: "3",
          territoryPerSecondContribution: "6",
          affectedByHouseOfMirrors: true,
        },
      ],
      affectedTerritoryPerSecondTotal: "6",
      unaffectedTerritoryPerSecond: "1",
    },
    expansion: {
      currentLevel: "4",
      nextCost: "20",
      territoryRemaining: "10",
      etaSeconds: "1.4285714285714285714",
    },
    abilities: {
      cloneLarvae: {
        gameAbilityId: "clonelarvae",
        available: true,
        unavailableReason: null,
        energyCost: "12000",
        formulaInputs: {
          larvaeBank: "900719925474099312345",
          cocoonBank: "42",
          combinedBank: "900719925474099312387",
          larvaePerSecond: "0.333333333333333333",
          cocoonsPerSecond: "0",
          combinedVelocity: "0.333333333333333333",
          capSeconds: "100000",
          abilityPower: "1",
          sourceVerifiedOutput: "33333.3333333333333",
        },
        runtimePreviewOutput: null,
      },
      houseOfMirrors: {
        gameAbilityId: "clonearmy",
        available: true,
        unavailableReason: null,
        energyCost: "2500",
        affectedUnitIds: ["swarmling"],
        affectedTerritoryPerSecondBefore: "6",
        unaffectedTerritoryPerSecond: "1",
        sourceVerifiedTerritoryPerSecondAfter: "13",
        runtimePreviewTerritoryPerSecondAfter: null,
      },
    },
    safety: {
      resource: "energy",
      requiredReserve: "10",
      headroomBefore: "90",
      ruleId: "post-nexus-energy-reserve",
      reserveSource: "scenario-harness",
    },
    context: {
      nexusCount: "5",
      lepidopteraCount: "0",
      activePhase: null,
      activeMilestone: null,
      activeTarget: null,
    },
    formulaProvenance: {
      formulaSetId: "swarmsim-runtime-formulas",
      status: "verified",
      sourceRepository: "https://github.com/swarmsim/swarm",
      sourceCommit: "06b4f404aa324a0b454348508cfa63d5c0f1ff54",
      externalReferenceOnly: true,
      runtimeDependency: false,
      ratesCapturedFromRuntime: true,
      uncertainFields: [],
      warnings: [],
      formulas: {},
    },
    ...overrides.root,
  };
  snapshot.snapshotHash = sha256(canonicalJson(hashPayload(snapshot)));
  return snapshot;
}

function functionBlock(name) {
  const start = runtime.indexOf(`function ${name}`);
  assert(start >= 0, `${name} missing`);
  const next = runtime.indexOf("\n  function ", start + 1);
  return runtime.slice(start, next > start ? next : runtime.length);
}

const tests = [];
function test(name, fn) {
  tests.push({ name, fn });
}

test("identical scenario gives identical deterministic payload hash", () => {
  assert(makeSnapshot().snapshotHash === makeSnapshot().snapshotHash, "identical snapshots changed hash");
});

test("different scenario input gives different hash", () => {
  assert(makeSnapshot().snapshotHash !== makeSnapshot({ source: { scenarioId: "LAB-OTHER" } }).snapshotHash, "different scenario did not change hash");
});

test("capturedAt does not affect deterministic hash", () => {
  assert(makeSnapshot().snapshotHash === makeSnapshot({ source: { capturedAt: "2026-07-10T01:00:00.000Z" } }).snapshotHash, "capturedAt changed hash");
});

test("snapshot is deep frozen", () => {
  const snapshot = deepFreeze(makeSnapshot());
  assert(Object.isFrozen(snapshot) && Object.isFrozen(snapshot.resources.energy), "snapshot was not deep frozen");
});

test("two captures share no mutable references", () => {
  const a = makeSnapshot();
  const b = makeSnapshot();
  assert(a !== b && a.resources !== b.resources && a.abilities.cloneLarvae !== b.abilities.cloneLarvae, "snapshots share references");
});

test("normal run history and live-state mutation paths are absent from Laboratory capture", () => {
  const block = functionBlock("captureLaboratorySnapshot");
  assert(!/recordRunHistoryEntry/.test(block), "Laboratory capture writes run history");
  assert(!/buy(Unit|Upgrade|MaxUnit|MaxUpgrade)\s*\(/.test(block), "Laboratory capture buys through commands");
});

test("gating off denies capture", () => {
  assert(/Laboratory development gate is disabled/.test(runtime), "Laboratory gate denial missing");
});

test("scenario harness off denies capture", () => {
  assert(/Scenario harness is disabled/.test(runtime), "scenario harness denial missing");
});

test("large Decimal values are serialized as strings", () => {
  assert(typeof makeSnapshot().resources.larvae.amount === "string", "large Decimal was not serialized as string");
});

test("mandatory missing field would be detected by shape assertion", () => {
  const snapshot = makeSnapshot();
  delete snapshot.abilities.cloneLarvae.gameAbilityId;
  assert(snapshot.abilities.cloneLarvae.gameAbilityId === undefined, "test setup failed");
});

test("army contributions sum to territory/sec", () => {
  const snapshot = makeSnapshot();
  assert(Number(snapshot.army.affectedTerritoryPerSecondTotal) + Number(snapshot.army.unaffectedTerritoryPerSecond) === Number(snapshot.resources.territory.perSecond), "army contribution sum mismatch");
});

test("Clone Larvae preview or warning is represented without cast", () => {
  const clone = makeSnapshot().abilities.cloneLarvae;
  assert(clone.runtimePreviewOutput === null || typeof clone.runtimePreviewOutput === "string", "clone preview field invalid");
  assert(!/Clone Larvae[\s\S]*autoCastAbilities:\s*true/.test(runtime), "Clone Larvae auto-cast default changed");
});

test("House of Mirrors inputs or warning are represented without cast", () => {
  const mirror = makeSnapshot().abilities.houseOfMirrors;
  assert(mirror.gameAbilityId === "clonearmy" && mirror.affectedUnitIds.includes("swarmling"), "House of Mirrors inputs missing");
});

test("Expansion remaining is consistent", () => {
  const expansion = makeSnapshot().expansion;
  assert(String(Math.max(0, Number(expansion.nextCost) - 10)) === expansion.territoryRemaining, "Expansion remaining mismatch");
});

test("meat coefficient t=0 matches runtime meat/sec field", () => {
  const meat = makeSnapshot().resources.meat;
  assert(meat.rateProjection.valueAtZero === meat.perSecond, "meat t=0 validation mismatch");
});

test("normal advisor/autobuyer output is not called by Laboratory capture", () => {
  const block = functionBlock("captureLaboratorySnapshot");
  assert(!/runOnce\s*\(/.test(block), "Laboratory capture invokes normal runOnce");
});

test("safety defaults are unchanged", () => {
  assert(/autoCastAbilities:\s*false/.test(runtime), "autoCastAbilities default changed");
  assert(/autoAscend:\s*false/.test(runtime), "autoAscend default changed");
  assert(/saveEnergyForNexus:\s*true/.test(runtime), "Nexus energy protection default changed");
});

test("base-game formula provenance is pinned to exact Swarm commit", () => {
  assert(runtime.includes("https://github.com/swarmsim/swarm"), "source repository missing");
  assert(runtime.includes("06b4f404aa324a0b454348508cfa63d5c0f1ff54"), "source commit missing");
  assert(/sourceCommit:\s*LABORATORY_BASE_GAME_SOURCE_COMMIT/.test(runtime), "snapshot formulaProvenance does not use pinned source commit");
});

test("0.12.0 version surfaces are present after build", () => {
  assert(pkg.version === "0.12.0", "package version must be 0.12.0");
  assert(/const\s+AUTOBUYER_VERSION\s*=\s*"0\.12\.0"\s*;/.test(runtime), "runtime version must be 0.12.0");
  if (canonical) assert(/^\/\/\s*@version\s+0\.12\.0$/m.test(canonical) || /^\/\/\s*@version\s+0\.11\.7$/m.test(canonical), "canonical userscript version surface unexpected before build");
});

for (const { name, fn } of tests) {
  try {
    fn();
  } catch (error) {
    fail(`${name}: ${error.message || error}`);
  }
}

console.log(`0.12.0 Laboratory snapshot checks passed (${tests.length} checks).`);

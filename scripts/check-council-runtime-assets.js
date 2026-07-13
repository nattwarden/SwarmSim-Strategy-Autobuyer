const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const ROOT = path.resolve(__dirname, "..");
const manifestPath = path.join(ROOT, "assets", "council", "runtime", "manifest.v1.json");
const userscriptPath = path.join(ROOT, "src", "SwarmSim-Strategy-Autobuyer.user.js");
const failures = [];

function sha256(buffer) {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

if (!fs.existsSync(manifestPath)) {
  console.error("FAIL check-council-runtime-assets: manifest is missing");
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const userscript = fs.readFileSync(userscriptPath, "utf8");
if (manifest.schemaVersion !== "council-runtime-assets.v1") failures.push("unexpected manifest schema");
if (manifest.format !== "image/webp") failures.push("runtime format must be image/webp");
if (!Array.isArray(manifest.assets) || manifest.assets.length !== 13) failures.push("expected 13 runtime assets");

let totalBytes = 0;
for (const asset of manifest.assets || []) {
  const sourcePath = path.join(ROOT, asset.source);
  const outputPath = path.join(ROOT, asset.output);
  if (!fs.existsSync(sourcePath)) {
    failures.push(`missing source ${asset.source}`);
    continue;
  }
  if (!fs.existsSync(outputPath)) {
    failures.push(`missing output ${asset.output}`);
    continue;
  }
  const sourceBuffer = fs.readFileSync(sourcePath);
  const outputBuffer = fs.readFileSync(outputPath);
  totalBytes += outputBuffer.length;
  if (sha256(sourceBuffer) !== asset.sourceSha256) failures.push(`source hash mismatch ${asset.source}`);
  if (sha256(outputBuffer) !== asset.sha256) failures.push(`output hash mismatch ${asset.output}`);
  if (outputBuffer.length !== asset.bytes) failures.push(`byte count mismatch ${asset.output}`);
  if (!Number.isInteger(asset.width) || !Number.isInteger(asset.height) || asset.width < 1 || asset.height < 1) {
    failures.push(`invalid dimensions ${asset.output}`);
  }
  const fileName = path.basename(asset.output);
  if (!userscript.includes(`/assets/council/runtime/${fileName}`)) failures.push(`metadata URL missing ${fileName}`);
}

if (totalBytes !== manifest.totalBytes) failures.push("manifest total byte count mismatch");
if (totalBytes > 600000) failures.push(`runtime asset budget exceeded: ${totalBytes} bytes`);
if (!userscript.includes("// @grant        GM_getResourceURL")) failures.push("GM_getResourceURL grant missing");

if (failures.length) {
  console.error(`FAIL check-council-runtime-assets:\n- ${failures.join("\n- ")}`);
  process.exit(1);
}

console.log(`PASS check-council-runtime-assets (${manifest.assets.length} assets, ${totalBytes} bytes)`);

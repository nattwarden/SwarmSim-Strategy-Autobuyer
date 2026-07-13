const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { chromium } = require("playwright");

const ROOT = path.resolve(__dirname, "..");
const OUTPUT_DIR = path.join(ROOT, "assets", "council", "runtime");

const assets = [
  ["docs/ui/reference/swarmbot-council-chamber-north-star.png", "council-chamber-v1.webp", 1366, 0, 0.82],
  ["assets/council/council-ornate-frame-source-v1.png", "council-ornate-frame-v1.webp", 1366, 0, 0.86],
  ["assets/council/council-parchment-source-v1.png", "council-parchment-v1.webp", 900, 0, 0.84],
  ["assets/council/council-lane-meat-source-v1.png", "council-lane-meat-v1.webp", 160, 0, 0.88],
  ["assets/council/council-lane-engine-source-v1.png", "council-lane-engine-v1.webp", 160, 0, 0.88],
  ["assets/council/council-lane-territory-source-v1.png", "council-lane-territory-v1.webp", 160, 0, 0.88],
  ["assets/council/council-lane-energy-source-v1.png", "council-lane-energy-v1.webp", 160, 0, 0.88],
  ["assets/council/council-advisor-beetle-magus-source-v1.png", "council-advisor-beetle-magus-v1.webp", 160, 0, 0.88],
  ["assets/council/council-advisor-larva-steward-source-v1.png", "council-advisor-larva-steward-v1.webp", 160, 0, 0.88],
  ["assets/council/council-advisor-flesh-smith-source-v1.png", "council-advisor-flesh-smith-v1.webp", 160, 0, 0.88],
  ["assets/council/council-advisor-general-mandible-source-v1.png", "council-advisor-general-mandible-v1.webp", 160, 0, 0.88],
  ["assets/council/council-advisor-twin-oracle-source-v1.png", "council-advisor-twin-oracle-v1.webp", 160, 0, 0.88],
  ["assets/council/council-advisor-brood-architect-source-v1.png", "council-advisor-brood-architect-v1.webp", 160, 0, 0.88],
];

async function main() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const manifestAssets = [];

  try {
    for (const [sourcePath, outputName, targetWidth, targetHeight, quality] of assets) {
      const sourceBuffer = fs.readFileSync(path.join(ROOT, sourcePath));
      const input = sourceBuffer.toString("base64");
      const result = await page.evaluate(async ({ input, targetWidth, targetHeight, quality }) => {
        const response = await fetch(`data:image/png;base64,${input}`);
        const bitmap = await createImageBitmap(await response.blob());
        const width = targetWidth || Math.round(bitmap.width * (targetHeight / bitmap.height));
        const height = targetHeight || Math.round(bitmap.height * (targetWidth / bitmap.width));
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext("2d");
        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = "high";
        context.clearRect(0, 0, width, height);
        context.drawImage(bitmap, 0, 0, width, height);
        bitmap.close();
        return { width, height, dataUrl: canvas.toDataURL("image/webp", quality) };
      }, { input, targetWidth, targetHeight, quality });

      const encoded = result.dataUrl.replace(/^data:image\/webp;base64,/, "");
      const outputPath = path.join(OUTPUT_DIR, outputName);
      const outputBuffer = Buffer.from(encoded, "base64");
      fs.writeFileSync(outputPath, outputBuffer);
      manifestAssets.push({
        source: sourcePath.replace(/\\/g, "/"),
        sourceSha256: crypto.createHash("sha256").update(sourceBuffer).digest("hex"),
        output: `assets/council/runtime/${outputName}`,
        width: result.width,
        height: result.height,
        bytes: outputBuffer.length,
        sha256: crypto.createHash("sha256").update(outputBuffer).digest("hex"),
        quality,
      });
      console.log(`${outputName}: ${result.width}x${result.height} (${outputBuffer.length} bytes)`);
    }
    fs.writeFileSync(path.join(OUTPUT_DIR, "manifest.v1.json"), `${JSON.stringify({
      schemaVersion: "council-runtime-assets.v1",
      format: "image/webp",
      encoder: "Chromium Canvas",
      totalBytes: manifestAssets.reduce((sum, asset) => sum + asset.bytes, 0),
      assets: manifestAssets,
    }, null, 2)}\n`);
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error.stack || error.message || error);
  process.exit(1);
});

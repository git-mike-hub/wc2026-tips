import sharp from "sharp";
import { readFileSync } from "fs";

const input = process.argv[2] || "public/eshkol-logo.png";
const output = process.argv[3] || "public/eshkol-logo.png";

const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });

for (let i = 0; i < data.length; i += 4) {
  const r = data[i];
  const g = data[i + 1];
  const b = data[i + 2];
  // Treat near-black as transparent (JPEG logo backdrop)
  if (r < 40 && g < 40 && b < 40) {
    data[i + 3] = 0;
  }
}

await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } })
  .png()
  .toFile(output);

console.log(`Wrote transparent PNG: ${output} (${info.width}x${info.height})`);

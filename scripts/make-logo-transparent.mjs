import sharp from "sharp";
import { readFileSync } from "fs";

const args = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const whiteKey = process.argv.includes("--white");
const input = args[0] || "public/eshkol-logo.png";
const output = args[1] || "public/eshkol-logo.png";

const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });

for (let i = 0; i < data.length; i += 4) {
  const r = data[i];
  const g = data[i + 1];
  const b = data[i + 2];
  const key =
    whiteKey ? r > 238 && g > 238 && b > 238 : r < 40 && g < 40 && b < 40;
  if (key) data[i + 3] = 0;
}

await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } })
  .png()
  .toFile(output);

console.log(`Wrote transparent PNG: ${output} (${info.width}x${info.height})`);

import sharp from "sharp";

const input = process.argv[2] || "public/eshkol-logo-source.png";
const output = process.argv[3] || "public/eshkol-logo.png";

await sharp(input)
  .trim({ threshold: 18 })
  .png()
  .toFile(output);

const meta = await sharp(output).metadata();
console.log(`Trimmed logo → ${output} (${meta.width}x${meta.height})`);

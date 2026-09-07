/*
 * توليد أيقونات التطبيق من public/icon.svg.
 *
 * SVG وحده لا يكفي للتثبيت: أندرويد يقبله، لكن آيفون يطلب PNG لأيقونة
 * الشاشة الرئيسية، وبعض المتصفحات ترفض المانيفست بلا مقاس 192 و512 صراحةً.
 *
 * والنسخة المقنَّعة (maskable) لها هامش داخلي: أندرويد يقصّ الأيقونة في شكل
 * يختاره النظام، فبلا هامش تُقطع أطراف الرسم.
 *
 * يُشغَّل عند تغيير الأيقونة: node scripts/make-icons.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import sharp from "sharp";

const source = readFileSync("public/icon.svg");

const SIZES = [
  { file: "public/icon-192.png", size: 192 },
  { file: "public/icon-512.png", size: 512 },
  { file: "public/apple-touch-icon.png", size: 180 },
];

for (const { file, size } of SIZES) {
  await sharp(source, { density: 384 }).resize(size, size).png().toFile(file);
  console.log(`${file} — ${size}x${size}`);
}

/* المقنَّعة: الرسم داخل ٨٠٪ من المساحة، والباقي أرضية */
const inner = Math.round(512 * 0.78);
const padded = await sharp(source, { density: 384 }).resize(inner, inner).png().toBuffer();

await sharp({
  create: {
    width: 512,
    height: 512,
    channels: 4,
    background: { r: 22, g: 22, b: 26, alpha: 1 },
  },
})
  .composite([{ input: padded, gravity: "center" }])
  .png()
  .toFile("public/icon-maskable.png");

console.log("public/icon-maskable.png — 512x512 (safe area)");

/* تحديث المانيفست ليشير إلى ما وُلِّد فعلاً */
const manifestPath = "public/manifest.webmanifest";
const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));

manifest.icons = [
  { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
  { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
  { src: "/icon-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
  { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
];

writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log("manifest icons updated");

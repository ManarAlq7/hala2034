/*
 * تحويل لوحة unDraw إلى ألوان هلا.
 *
 * الرسوم تأتي ببنفسجي unDraw الافتراضي ورماديّاتها الخاصة. هذا يستبدلها
 * بالذهبي والجرافيت والأسطح المعرّفة في نظام التصميم، فتبدو الرسمة جزءاً من
 * الموقع لا ملفاً استُورد إليه. ألوان البشرة تُترك كما هي.
 *
 * يُشغَّل عند إضافة رسمة جديدة: node scripts/recolour-art.mjs
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const DIR = "public/art";

/** من لون unDraw إلى لون هلا */
const MAP = {
  "#6c63ff": "#8a6a24", // البنفسجي المميّز → الذهبي
  "#3f3d56": "#2b2b33", // الداكن الثانوي → جرافيت
  "#2f2e41": "#16161a", // الداكن الأساسي → لون النصّ
  "#e6e6e6": "#eaeaee", // الرمادي الفاتح → السطح الثالث
  "#e0e0e0": "#eaeaee",
  "#e4e4e4": "#e3e3e8", // → لون الحدّ
  "#cacaca": "#c8c8d1", // → الحدّ القوي
  "#ccc": "#c8c8d1",
  "#f2f2f2": "#f2f2f4",
  "#fff": "#ffffff",
};

let touched = 0;

for (const file of readdirSync(DIR).filter((f) => f.endsWith(".svg"))) {
  const path = join(DIR, file);
  let svg = readFileSync(path, "utf8");
  let hits = 0;

  for (const [from, to] of Object.entries(MAP)) {
    const re = new RegExp(from.replace("#", "#"), "gi");
    const before = svg;
    svg = svg.replace(re, to);
    if (svg !== before) hits += 1;
  }

  writeFileSync(path, svg);
  touched += 1;
  console.log(`${file}: ${hits} colour groups remapped`);
}

console.log(`done — ${touched} file(s)`);

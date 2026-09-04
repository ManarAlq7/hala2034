import { registerHooks } from "node:module";
import { existsSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

/**
 * مُحلّل وحدات للاختبارات.
 *
 * Node يشغّل ملفات TypeScript مباشرة (--experimental-strip-types) لكنه يطبّق قواعد
 * ESM في تحديد المسارات، فيرفض الاستيراد بلا امتداد ولا يعرف الاختصار "@/".
 * هذا الخطّاف يسدّ الفجوتين حتى تعمل الاختبارات على نفس الشيفرة المصدرية
 * دون أي حزمة إضافية ودون تعديل مسارات الاستيراد في المشروع.
 */

const SRC = pathToFileURL(path.join(process.cwd(), "src") + path.sep);
const EXTENSIONS = [".ts", ".tsx", "/index.ts", "/index.tsx"];
const HAS_EXTENSION = /\.[cm]?[jt]sx?$/;

function firstExisting(baseHref) {
  for (const ext of EXTENSIONS) {
    const candidate = new URL(baseHref + ext);
    if (existsSync(fileURLToPath(candidate))) return candidate.href;
  }
  return null;
}

registerHooks({
  resolve(specifier, context, nextResolve) {
    // اختصار المشروع: "@/lib/ai" -> "<cwd>/src/lib/ai"
    if (specifier.startsWith("@/")) {
      const base = new URL(specifier.slice(2), SRC).href;
      const resolved = HAS_EXTENSION.test(specifier) ? base : firstExisting(base);
      if (resolved) return nextResolve(resolved, context);
    }

    // استيراد نسبي بلا امتداد: "./taxonomy" -> "./taxonomy.ts"
    if (specifier.startsWith(".") && !HAS_EXTENSION.test(specifier) && context.parentURL) {
      const resolved = firstExisting(new URL(specifier, context.parentURL).href);
      if (resolved) return nextResolve(resolved, context);
    }

    return nextResolve(specifier, context);
  },
});

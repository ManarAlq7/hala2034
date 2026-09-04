import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import { GENERAL_SUBTYPE, SUBTYPES, classifyLocal, subtypeCategory } from "@/lib/ai";
import { ZONES, zoneById } from "@/lib/taxonomy";
import type { Classification } from "@/lib/types";

/* -------------------------------------------------------------------------- */
/*  تصنيف البلاغ بنموذج لغوي — على الخادم حصراً                                 */
/*                                                                             */
/*  يُستدعى من المتصفح عبر POST /api/classify. المفتاح لا يغادر الخادم.          */
/*  إن لم يكن هناك مفتاح، أو فشل الاستدعاء لأي سبب، يرتد المسار تلقائياً إلى     */
/*  المحرك المحلي في lib/ai.ts — فالنظام يعمل في كل الأحوال.                    */
/* -------------------------------------------------------------------------- */

const SUBTYPE_IDS: [string, ...string[]] = [GENERAL_SUBTYPE, ...SUBTYPES.map((s) => s.id)];
const ZONE_IDS: [string, ...string[]] = [ZONES[0].id, ...ZONES.slice(1).map((z) => z.id)];

const ClassificationSchema = z.object({
  subtype: z.enum(SUBTYPE_IDS),
  severity: z.enum(["low", "medium", "high", "critical"]),
  zoneId: z.enum(ZONE_IDS),
  keywords: z.array(z.string()),
  confidence: z.number(),
  lang: z.string(),
  textAr: z.string(),
  textEn: z.string(),
});

const SUBTYPE_CATALOG = SUBTYPES.map((s) => `- ${s.id} — ${s.label}`).join("\n");
const ZONE_CATALOG = ZONES.map((z) => `- ${z.id} — ${z.label} (${z.venue})`).join("\n");

const SYSTEM_PROMPT = `أنت محرك تصنيف في مركز عمليات جماهير كأس العالم. تستقبل بلاغاً واحداً من أحد الحضور بأي لغة، وتُخرج تصنيفاً منظّماً.

الأنواع الفرعية المتاحة (اختر أدقّ نوع واحد فقط):
${SUBTYPE_CATALOG}
- ${GENERAL_SUBTYPE} — ملاحظة عامة أو اقتراح لا يندرج تحت ما سبق

المواقع المتاحة:
${ZONE_CATALOG}

قواعد:
- subtype: اختر الأدق. النوع الفرعي هو أساس تجميع البلاغات المتشابهة، فبلاغان عن نفس المشكلة بلغتين مختلفتين يجب أن يحملا نفس النوع الفرعي.
- severity: "critical" لخطر على الحياة أو السلامة (حالة طبية، حريق، تدافع، طفل مفقود). "high" لتعطيل جسيم أو مخاطرة أمنية. "medium" لإزعاج حقيقي يحتاج معالجة. "low" لاقتراح أو ملاحظة بسيطة.
- zoneId: إن ذكر البلاغ موقعاً صراحةً فاعتمده، وإلا استخدم الموقع المرسل في الحقل hintZone.
- keywords: من ١ إلى ٤ كلمات أو عبارات قصيرة منقولة حرفياً من نص البلاغ الأصلي بلغته.
- lang: رمز ISO من حرفين للغة البلاغ (ar, en, es, fr, ...).
- confidence: رقم بين 0 و 1 يعبّر عن ثقتك في التصنيف.
- textAr: نص البلاغ بالعربية. إن كان البلاغ عربياً أصلاً فانقله كما هو دون تغيير.
- textEn: نص البلاغ بالإنجليزية. إن كان البلاغ إنجليزياً أصلاً فانقله كما هو دون تغيير.

في الترجمة: انقل ما قاله المشجّع فقط — لا تلخّص، ولا تضف تفسيراً، ولا تلطّف
شكوى حادّة. زمن الاستجابة يُبنى على هذا النص، فالمبالغة والتخفيف كلاهما ضار.

أخرج التصنيف فقط دون أي شرح.`;

interface RequestBody {
  text?: unknown;
  zoneId?: unknown;
}

export async function POST(req: Request) {
  let body: RequestBody;
  try {
    body = (await req.json()) as RequestBody;
  } catch {
    return Response.json({ error: "نص الطلب غير صالح" }, { status: 400 });
  }

  const text = typeof body.text === "string" ? body.text.trim() : "";
  const hintZone =
    typeof body.zoneId === "string" && ZONES.some((z) => z.id === body.zoneId)
      ? body.zoneId
      : ZONES[0].id;

  if (text.length < 3) {
    return Response.json({ error: "نص البلاغ قصير جداً" }, { status: 400 });
  }

  // لا توجد بيانات اعتماد: المحرك المحلي هو المسار الوحيد
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json(classifyLocal(text, hintZone));
  }

  try {
    const client = new Anthropic();

    const response = await client.messages.parse({
      model: "claude-opus-5",
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      output_config: {
        // التصنيف مهمة قصيرة ومحددة، فلا داعي لعمق تفكير عالٍ
        effort: "low",
        format: zodOutputFormat(ClassificationSchema),
      },
      messages: [
        {
          role: "user",
          content: `hintZone: ${hintZone} (${zoneById(hintZone).label})\n\nنص البلاغ:\n${text}`,
        },
      ],
    });

    // البلاغات المرفوضة أمنياً نادرة هنا، لكن التحقق قبل قراءة المحتوى إلزامي
    if (response.stop_reason === "refusal" || !response.parsed_output) {
      return Response.json(classifyLocal(text, hintZone));
    }

    const parsed = response.parsed_output;
    const result: Classification = {
      subtype: parsed.subtype,
      // الفئة تُشتق من النوع الفرعي على الخادم، فلا يمكن أن يردّ النموذج بزوج غير متسق
      category: subtypeCategory(parsed.subtype),
      severity: parsed.severity,
      zoneId: parsed.zoneId,
      keywords: parsed.keywords.slice(0, 4),
      confidence: Math.min(1, Math.max(0, parsed.confidence)),
      lang: parsed.lang.slice(0, 5),
      textAr: parsed.textAr.trim() || undefined,
      textEn: parsed.textEn.trim() || undefined,
      source: "claude",
    };

    return Response.json(result);
  } catch (err) {
    // انقطاع شبكة، تجاوز حد الاستخدام، مفتاح غير صالح — النظام يواصل عمله محلياً
    console.error("[classify] تعذّر التصنيف بالنموذج اللغوي، تم الارتداد للمحرك المحلي:", err);
    return Response.json(classifyLocal(text, hintZone));
  }
}

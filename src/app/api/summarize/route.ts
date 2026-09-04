import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import { subtypeLabel } from "@/lib/ai";
import { MAX_SUMMARY_INPUTS } from "@/lib/summarize";
import { ZONES, categoryById, severityDef, zoneById } from "@/lib/taxonomy";
import type { CategoryId, SeverityId } from "@/lib/types";

/* -------------------------------------------------------------------------- */
/*  تلخيص المشكلة — على الخادم حصراً                                            */
/*                                                                             */
/*  يستقبل نصوص البلاغات المجمّعة تحت مشكلة واحدة، ويعيد عنواناً وملخّصاً        */
/*  وإجراءً مقترحاً بلغتين. هذا ما يوفّر على فريق العمليات قراءة عشرات           */
/*  البلاغات المتشابهة يدوياً.                                                   */
/*                                                                             */
/*  بخلاف /api/classify لا يوجد هنا ارتداد محلي: الملخّص إمّا أن يكون مولَّداً    */
/*  فعلاً أو لا يوجد. عنوان قالبي مصطنع يُعرض كأنه ملخّص أسوأ من لا شيء.          */
/* -------------------------------------------------------------------------- */

const SummarySchema = z.object({
  titleAr: z.string(),
  titleEn: z.string(),
  summaryAr: z.string(),
  summaryEn: z.string(),
  actionAr: z.string(),
  actionEn: z.string(),
});

const SYSTEM_PROMPT = `أنت محلّل في مركز عمليات جماهير كأس العالم. تستقبل مجموعة بلاغات — قد تكون بلغات مختلفة — جمّعها النظام تحت مشكلة واحدة، وتُخرج خلاصة تشغيلية موجزة.

قواعد:
- titleAr / titleEn: عنوان المشكلة في ٣ إلى ٧ كلمات. وصف لما يحدث فعلاً كما ورد في البلاغات، لا إعادة صياغة لاسم التصنيف.
- summaryAr / summaryEn: جملة إلى جملتين. ما المشكلة، ما حجمها كما تدل عليه البلاغات، وأي تفصيل متكرر يفيد الميدان (بوابة بعينها، دور بعينه، وقت بعينه). اذكر ما ورد في البلاغات فقط — لا تفترض سبباً لم يُذكر.
- actionAr / actionEn: إجراء واحد محدد وقابل للتنفيذ الآن من الجهة المختصة. لا نصائح عامة.
- إن تناقضت البلاغات أو تباينت، قل ذلك صراحةً بدل ترجيح رواية على أخرى.
- النصان العربي والإنجليزي يحملان نفس المعنى، وكلاهما مكتوب بلغة سليمة طبيعية لا ترجمة حرفية.

أخرج الخلاصة فقط دون أي شرح.`;

interface RequestBody {
  subtype?: unknown;
  zoneId?: unknown;
  category?: unknown;
  severity?: unknown;
  texts?: unknown;
}

export async function POST(req: Request) {
  let body: RequestBody;
  try {
    body = (await req.json()) as RequestBody;
  } catch {
    return Response.json({ error: "نص الطلب غير صالح" }, { status: 400 });
  }

  const texts = Array.isArray(body.texts)
    ? body.texts
        .filter((t): t is string => typeof t === "string" && t.trim().length > 0)
        .slice(0, MAX_SUMMARY_INPUTS)
    : [];

  if (texts.length === 0) {
    return Response.json({ error: "لا توجد بلاغات للتلخيص" }, { status: 400 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({ error: "التلخيص يحتاج مفتاح API" }, { status: 503 });
  }

  const subtype = typeof body.subtype === "string" ? body.subtype : "";
  const zoneId =
    typeof body.zoneId === "string" && ZONES.some((z) => z.id === body.zoneId)
      ? body.zoneId
      : ZONES[0].id;
  const category = typeof body.category === "string" ? (body.category as CategoryId) : "other";
  const severity = typeof body.severity === "string" ? (body.severity as SeverityId) : "medium";

  const context = [
    `النوع الفرعي: ${subtypeLabel(subtype)}`,
    `الموقع: ${zoneById(zoneId).label} (${zoneById(zoneId).venue})`,
    `الجهة المختصة: ${categoryById(category).owner}`,
    `درجة الخطورة الحالية: ${severityDef(severity).label}`,
    `عدد البلاغات: ${texts.length}`,
  ].join("\n");

  const reportList = texts.map((t, i) => `${i + 1}. ${t}`).join("\n");

  try {
    const client = new Anthropic();

    const response = await client.messages.parse({
      model: "claude-opus-5",
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      output_config: {
        format: zodOutputFormat(SummarySchema),
      },
      messages: [
        {
          role: "user",
          content: `${context}\n\nالبلاغات:\n${reportList}`,
        },
      ],
    });

    if (response.stop_reason === "refusal" || !response.parsed_output) {
      return Response.json({ error: "تعذّر توليد الملخّص" }, { status: 502 });
    }

    return Response.json({ ...response.parsed_output, basedOn: texts.length });
  } catch (err) {
    console.error("[summarize] تعذّر توليد الملخّص:", err);
    return Response.json({ error: "تعذّر توليد الملخّص" }, { status: 502 });
  }
}

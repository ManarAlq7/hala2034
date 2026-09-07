import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import { ROUTE_RULES, answerLocally, catalogContext, type GuideAnswer } from "@/lib/guide";
import type { Catalog } from "@/lib/catalog";

/* -------------------------------------------------------------------------- */
/*  مرشد الحدث — على الخادم حصراً                                              */
/*                                                                             */
/*  المفتاح لا يغادر الخادم، والدليل يصعد مع كل سؤال فيجيب النموذج من بيانات     */
/*  الحدث لا من ذاكرته. وبلا مفتاح — أو عند أي فشل — يرتدّ إلى المحرّك المحلي،    */
/*  فالمرشد يعمل في كل الأحوال كما يعمل التصنيف.                                 */
/* -------------------------------------------------------------------------- */

const AnswerSchema = z.object({
  text: z.string(),
  links: z.array(z.object({ label: z.string(), href: z.string() })),
});

const SYSTEM_PROMPT = `You are the guide for HALA 2034, the fan companion for the 2034 World Cup in Saudi Arabia. A fan asks where to go or what to do, in any language.

Answer ONLY from the event directory given in the user message. It lists every stadium, match and fan zone this app knows about, each with an id in square brackets.

Rules:
- Never invent a stadium, match, date, price or amenity. If the directory does not contain it, say plainly that you do not have it.
- Answer in the SAME language the fan wrote in. If they write in Japanese, answer in Japanese.
- Keep the answer to two or three sentences. The fan is standing somewhere with a phone, not reading an article.
- Give one to four links, most useful first, using the ids from the directory.
- Never link to a path outside the allowed list.
- If the question is about something going wrong at a venue — crowding, a dirty restroom, a medical issue — point them to /report, because that reaches the operations team immediately.
- Do not greet, do not apologise, do not offer to help further. Answer the question.

${ROUTE_RULES}`;

interface RequestBody {
  question?: unknown;
  locale?: unknown;
  catalog?: unknown;
}

/** المسارات المسموحة — يُرفض ما عداها بدل أن يُسلَّم للمشجّع رابط مكسور */
const ALLOWED = /^\/(venues\/[\w-]+|fan-zones(\/[\w-]+)?|matches\/[\w-]+|tickets|report|track|account)$/;

export async function POST(req: Request) {
  let body: RequestBody;
  try {
    body = (await req.json()) as RequestBody;
  } catch {
    return Response.json({ error: "نص الطلب غير صالح" }, { status: 400 });
  }

  const question = typeof body.question === "string" ? body.question.trim() : "";
  const locale = typeof body.locale === "string" ? body.locale.slice(0, 5) : "ar";
  const catalog = (body.catalog ?? null) as Catalog | null;

  if (question.length < 2) {
    return Response.json({ error: "السؤال قصير جداً" }, { status: 400 });
  }

  if (!catalog || !Array.isArray(catalog.venues)) {
    return Response.json({ error: "الدليل غير متاح" }, { status: 400 });
  }

  const local = (): GuideAnswer => answerLocally(question, catalog, locale);

  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json(local());
  }

  try {
    const client = new Anthropic();

    const response = await client.messages.parse({
      model: "claude-opus-5",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      output_config: {
        // سؤال إرشاد قصير: العمق هنا يبطئ الجواب ولا يحسّنه
        effort: "low",
        format: zodOutputFormat(AnswerSchema),
      },
      messages: [
        {
          role: "user",
          content: `Fan's interface language: ${locale}\n\nEVENT DIRECTORY\n${catalogContext(catalog)}\n\nQUESTION\n${question}`,
        },
      ],
    });

    if (response.stop_reason === "refusal" || !response.parsed_output) {
      return Response.json(local());
    }

    const parsed = response.parsed_output;
    const links = parsed.links
      .filter((l) => ALLOWED.test(l.href))
      .slice(0, 4)
      .map((l) => ({ label: l.label.slice(0, 60), href: l.href }));

    const answer: GuideAnswer = {
      text: parsed.text.trim(),
      links,
      source: "claude",
    };

    // جواب بلا نصّ ليس جواباً — المحلي أنفع من فراغ
    return Response.json(answer.text ? answer : local());
  } catch {
    return Response.json(local());
  }
}

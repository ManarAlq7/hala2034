import assert from "node:assert/strict";
import test, { describe } from "node:test";

/* -------------------------------------------------------------------------- */
/*  حدود الصلاحيات                                                             */
/*                                                                             */
/*  الحدود الحقيقية في قاعدة البيانات لا في الواجهة، ولذلك تُختبر هناك: هذه       */
/*  الاختبارات تنادي واجهة Supabase بالمفتاح العام — وهو ما يملكه أي زائر —      */
/*  وتتأكد أن ما يجب أن يُرفض يُرفض فعلاً.                                        */
/*                                                                             */
/*  بلا هذه الاختبارات، أي تعديل سياسة مستقبلاً قد يفتح ما أُغلق ولا ينتبه أحد:    */
/*  الواجهة ستبدو سليمة تماماً في الحالتين.                                       */
/*                                                                             */
/*  تُتخطّى بلا إعدادات أو بلا شبكة بدل أن تفشل: اختبار يفشل على جهاز بلا إنترنت  */
/*  يُهمَل بعد أسبوع، والمُهمَل لا يحرس شيئاً.                                     */
/* -------------------------------------------------------------------------- */

function env(): { url: string; key: string } | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  return url && key ? { url, key } : null;
}

const TIMEOUT_MS = 15000;

async function call(
  path: string,
  init: RequestInit & { key: string },
): Promise<{ status: number; body: string }> {
  const config = env();
  if (!config) throw new Error("unconfigured");

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(`${config.url}${path}`, {
      ...init,
      signal: controller.signal,
      headers: {
        apikey: init.key,
        Authorization: `Bearer ${init.key}`,
        "Content-Type": "application/json",
        ...(init.headers ?? {}),
      },
    });
    return { status: res.status, body: await res.text() };
  } finally {
    clearTimeout(timer);
  }
}

describe("حدود الزائر المجهول", { concurrency: false }, () => {
  const config = env();
  const skip = config ? false : "لا توجد إعدادات Supabase في البيئة";

  test("لا يقرأ البلاغات", { skip }, async () => {
    const res = await call("/rest/v1/reports?select=id,reporter_name,text", {
      key: config!.key,
    });

    // إمّا يُمنع صراحةً، وإمّا تُرشّحه السياسة إلى لا شيء
    if (res.status === 200) {
      assert.equal(res.body.trim(), "[]", "البلاغات يجب ألّا تُقرأ من المتصفح");
    } else {
      assert.ok(res.status === 401 || res.status === 403, `حالة غير متوقعة: ${res.status}`);
    }
  });

  test("لا يكتب بلاغاً مباشرة على الجدول", { skip }, async () => {
    const res = await call("/rest/v1/reports", {
      key: config!.key,
      method: "POST",
      body: JSON.stringify({
        cluster_id: "CL-0001",
        text: "اختبار حدود",
        subtype: "test",
        lang: "ar",
        channel: "web",
        source: "text",
        zone_id: "gate_a",
        category: "crowding",
        severity: "low",
        confidence: 0.5,
        keywords: [],
      }),
    });

    assert.notEqual(res.status, 201, "الإدراج المباشر يجب أن يُرفض — الإرسال يمرّ بالدالّة");
  });

  test("لا يرفع خطورة مشكلة", { skip }, async () => {
    const res = await call("/rest/v1/clusters?id=eq.CL-0001", {
      key: config!.key,
      method: "PATCH",
      body: JSON.stringify({ severity: "critical" }),
    });

    assert.notEqual(res.status, 200, "تعديل الخطورة يجب أن يُرفض");
    assert.notEqual(res.status, 204, "تعديل الخطورة يجب أن يُرفض");
  });

  test("لا يغيّر حالة مشكلة", { skip }, async () => {
    const res = await call("/rest/v1/clusters?id=eq.CL-0001", {
      key: config!.key,
      method: "PATCH",
      body: JSON.stringify({ status: "resolved" }),
    });

    assert.notEqual(res.status, 200, "تغيير الحالة للمشغّلين وحدهم");
    assert.notEqual(res.status, 204, "تغيير الحالة للمشغّلين وحدهم");
  });

  test("لا يقرأ الحجوزات", { skip }, async () => {
    const res = await call("/rest/v1/bookings?select=holder_name", { key: config!.key });

    if (res.status === 200) {
      assert.equal(res.body.trim(), "[]", "أسماء الحاجزين ليست عامة");
    } else {
      assert.ok(res.status === 401 || res.status === 403, `حالة غير متوقعة: ${res.status}`);
    }
  });

  test("لا يرفع عدد المقاعد المتاحة", { skip }, async () => {
    const res = await call("/rest/v1/ticket_tiers?id=eq.MT-0001-C1", {
      key: config!.key,
      method: "PATCH",
      body: JSON.stringify({ sold: 0 }),
    });

    assert.notEqual(res.status, 200, "المقاعد تُنقص بالحجز وحده");
    assert.notEqual(res.status, 204, "المقاعد تُنقص بالحجز وحده");
  });

  test("لا يفتح بلاغاً برمز تتبّع مخترَع", { skip }, async () => {
    const res = await call("/rest/v1/rpc/track_report", {
      key: config!.key,
      method: "POST",
      body: JSON.stringify({ p_code: "ZZZZZZZZZZ" }),
    });

    assert.equal(res.status, 200, "الدالّة نفسها متاحة للزائر");
    assert.equal(res.body.trim(), "null", "رمز غير موجود يجب أن يعود بلا شيء");
  });

  test("المشكلات وحدها مقروءة — وهي بلا أسماء", { skip }, async () => {
    const res = await call("/rest/v1/clusters?select=id,status,severity&limit=1", {
      key: config!.key,
    });

    assert.equal(res.status, 200, "المشكلات تغذّي التتبّع اللحظي فتبقى مقروءة");
  });
});

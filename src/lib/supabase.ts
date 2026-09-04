import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/* -------------------------------------------------------------------------- */
/*  عميل قاعدة البيانات المشتركة                                                */
/*                                                                             */
/*  المتغيّران أدناه عامّان بالتصميم: المفتاح المنشور مقيَّد بسياسات الوصول في    */
/*  قاعدة البيانات، لا بإخفائه. وإن غابا عمل التطبيق كاملاً من تخزين المتصفح     */
/*  المحلي — فمن ينسخ المستودع يشغّله فوراً بلا إعداد.                            */
/* -------------------------------------------------------------------------- */

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

/** هل هناك قاعدة بيانات مشتركة مهيّأة؟ */
export const hasSupabase = Boolean(url && key);

let client: SupabaseClient | null = null;

export function supabase(): SupabaseClient {
  if (!client) {
    if (!url || !key) throw new Error("قاعدة البيانات المشتركة غير مهيّأة");
    client = createClient(url, key, {
      auth: {
        // الجلسة تُحفظ ويُجدَّد رمزها تلقائياً: تحديث الصفحة لا يُخرج فريق
        // العمليات من الكونسول في منتصف حدث جارٍ
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
        storageKey: "hala2034:auth",
      },
    });
  }
  return client;
}

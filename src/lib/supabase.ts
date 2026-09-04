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
    // لا يوجد تسجيل دخول في هذا العرض، فلا داعي لحفظ جلسة
    client = createClient(url, key, { auth: { persistSession: false } });
  }
  return client;
}

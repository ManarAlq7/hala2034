"use client";

import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { hasSupabase, supabase } from "./supabase";
import type { Locale } from "./types";

/* -------------------------------------------------------------------------- */
/*  جلسة فريق العمليات                                                          */
/*                                                                             */
/*  المصدر الوحيد للحقيقة هو Supabase Auth، لا علامة في تخزين المتصفح: من       */
/*  يحذف مفتاحاً من localStorage لا يصبح مخوّلاً، لأن كل كتابة تشغيلية تمر على    */
/*  سياسات قاعدة البيانات وتُرفض بلا رمز صالح. الحراسة في الواجهة توجيه          */
/*  للمستخدم، والمنع الفعلي في الخادم.                                          */
/* -------------------------------------------------------------------------- */

export type SessionStatus = "loading" | "authenticated" | "anonymous";

export interface OpsUser {
  id: string;
  email: string;
  name: string;
  nameAr: string;
  role: string;
  roleAr: string;
}

/** الحروف الأولى للاسم — تُعرض في الشريط العلوي بدل صورة رمزية */
export const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("") || "OP";

function toUser(session: Session): OpsUser {
  const meta = (session.user.user_metadata ?? {}) as Record<string, unknown>;
  const str = (key: string, fallback: string) =>
    typeof meta[key] === "string" && meta[key] ? (meta[key] as string) : fallback;

  const email = session.user.email ?? "";
  const name = str("full_name", email.split("@")[0] || "Operator");

  return {
    id: session.user.id,
    email,
    name,
    nameAr: str("name_ar", name),
    role: str("role", "Operator"),
    roleAr: str("role_ar", "مشغّل"),
  };
}

export const userName = (user: OpsUser, locale: Locale) =>
  locale === "ar" ? user.nameAr : user.name;

export const userRole = (user: OpsUser, locale: Locale) =>
  locale === "ar" ? user.roleAr : user.role;

export interface UseSession {
  status: SessionStatus;
  user: OpsUser | null;
  /**
   * هل صاحب الجلسة عضو في فريق العمليات؟
   *
   * منذ أن صار للجمهور حسابات، لم يعد وجود جلسة دليلاً على الصلاحية. الجواب
   * يأتي من قاعدة البيانات لا من بيانات المستخدم: ما يكتبه المستخدم عن نفسه
   * لا يمنحه صلاحية.
   */
  isOps: boolean;
}

/**
 * حالة الجلسة الحالية.
 *
 * تبدأ بـ `loading` حتى ترد Supabase، فلا تُعرض شاشة «سجّل دخولك» لمن هو مسجَّل
 * فعلاً لمجرد أن قراءة الجلسة لم تكتمل بعد.
 */
export function useSession(): UseSession {
  // بلا خدمة دخول مهيّأة لا يوجد ما يُنتظر، فالحالة الابتدائية «غير مسجَّل»
  // مباشرةً بدل ومضة انتظار لا تنتهي
  const [state, setState] = useState<UseSession>(() =>
    hasSupabase
      ? { status: "loading", user: null, isOps: false }
      : { status: "anonymous", user: null, isOps: false },
  );

  useEffect(() => {
    if (!hasSupabase) return;

    const db = supabase();
    let alive = true;

    const apply = async (session: Session | null) => {
      if (!alive) return;
      if (!session) {
        setState({ status: "anonymous", user: null, isOps: false });
        return;
      }
      const { data } = await db.rpc("is_ops");
      if (!alive) return;
      setState({ status: "authenticated", user: toUser(session), isOps: data === true });
    };

    void db.auth.getSession().then(({ data }) => apply(data.session));

    const { data: sub } = db.auth.onAuthStateChange((_event, session) => apply(session));

    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return state;
}

export type SignInError = "invalid" | "unconfigured" | "network";

/** تسجيل الدخول — تعيد سبب الفشل مصنّفاً لا نصّاً جاهزاً، فالصياغة للواجهة */
export async function signIn(email: string, password: string): Promise<SignInError | null> {
  if (!hasSupabase) return "unconfigured";

  try {
    const { error } = await supabase().auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (!error) return null;
    // Supabase تردّ برسالة واحدة للبريد الخاطئ ولكلمة المرور الخاطئة عن قصد،
    // فلا يستدل أحد على وجود حساب من نصّ الخطأ
    return error.status === 400 || error.status === 401 ? "invalid" : "network";
  } catch {
    return "network";
  }
}

export async function signOut(): Promise<void> {
  if (!hasSupabase) return;
  await supabase().auth.signOut();
}

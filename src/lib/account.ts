"use client";

import { useEffect, useState } from "react";
import { hasSupabase, supabase } from "./supabase";

/* -------------------------------------------------------------------------- */
/*  حساب المشجّع                                                               */
/*                                                                             */
/*  حساب اختياري لا بوّابة: الحجز والبلاغ يعملان بلا تسجيل كما كانا، والحساب     */
/*  يضيف شيئاً واحداً — أن تجد ما فعلته دون أن تحفظ رمزاً.                        */
/*                                                                             */
/*  ولا يُقرأ شيء هنا بترشيح من المتصفح: سياسات قاعدة البيانات هي التي تحصر      */
/*  كل صفّ بصاحبه، فطلب «كل الحجوزات» لا يعيد إلا حجوزات صاحب الجلسة.           */
/* -------------------------------------------------------------------------- */

export type SignUpError = "taken" | "weak" | "invalid" | "unconfigured" | "network";

export interface FanAccount {
  id: string;
  email: string;
  name: string;
}

export type AccountStatus = "loading" | "signedIn" | "signedOut";

export interface UseAccount {
  status: AccountStatus;
  account: FanAccount | null;
}

/** حالة حساب المشجّع الحالي */
export function useAccount(): UseAccount {
  const [state, setState] = useState<UseAccount>(() =>
    hasSupabase ? { status: "loading", account: null } : { status: "signedOut", account: null },
  );

  useEffect(() => {
    if (!hasSupabase) return;

    const db = supabase();
    let alive = true;

    const apply = (user: { id: string; email?: string; user_metadata?: Record<string, unknown> } | null) => {
      if (!alive) return;
      if (!user) {
        setState({ status: "signedOut", account: null });
        return;
      }
      const meta = user.user_metadata ?? {};
      const email = user.email ?? "";
      const named = typeof meta.full_name === "string" && meta.full_name ? meta.full_name : "";
      setState({
        status: "signedIn",
        account: { id: user.id, email, name: named || email.split("@")[0] || email },
      });
    };

    void db.auth.getSession().then(({ data }) => apply(data.session?.user ?? null));

    const { data: sub } = db.auth.onAuthStateChange((_e, session) => apply(session?.user ?? null));

    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return state;
}

/**
 * إنشاء حساب.
 *
 * قد يعود بلا جلسة إن كان تأكيد البريد مفعّلاً في المشروع، ولذلك تُميَّز
 * الحالتان: «دخلتَ» و«تحقّق من بريدك» ليستا رسالة واحدة.
 */
export async function signUp(
  email: string,
  password: string,
  name: string,
): Promise<{ error: SignUpError | null; needsEmail: boolean }> {
  if (!hasSupabase) return { error: "unconfigured", needsEmail: false };

  try {
    const { data, error } = await supabase().auth.signUp({
      email: email.trim(),
      password,
      options: { data: { full_name: name.trim() } },
    });

    if (error) {
      const message = error.message.toLowerCase();
      if (message.includes("already") || error.status === 422) return { error: "taken", needsEmail: false };
      if (message.includes("password")) return { error: "weak", needsEmail: false };
      if (error.status === 400) return { error: "invalid", needsEmail: false };
      return { error: "network", needsEmail: false };
    }

    return { error: null, needsEmail: !data.session };
  } catch {
    return { error: "network", needsEmail: false };
  }
}

/* ------------------------------ ما فعله المشجّع ------------------------------ */

export interface MyBooking {
  id: string;
  matchId: string;
  quantity: number;
  totalSar: number;
  createdAt: number;
}

export interface MyReport {
  id: string;
  clusterId: string;
  text: string;
  category: string;
  severity: string;
  createdAt: number;
}

interface MyBookingRow {
  id: string;
  match_id: string;
  quantity: number;
  total_sar: number;
  created_at: string;
}

interface MyReportRow {
  id: string;
  cluster_id: string;
  text: string;
  category: string;
  severity: string;
  created_at: string;
}

export interface MyActivity {
  bookings: MyBooking[];
  reports: MyReport[];
}

const EMPTY: MyActivity = { bookings: [], reports: [] };

export async function fetchMyActivity(userId: string): Promise<MyActivity> {
  if (!hasSupabase) return EMPTY;
  const db = supabase();

  const [bookings, reports] = await Promise.all([
    db
      .from("bookings")
      .select("id, match_id, quantity, total_sar, created_at")
      /* السياسة تكفي، والترشيح هنا لأن المشغّل يقرأ كل الحجوزات فلا يرى حجوزات غيره في حسابه */
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),
    db
      .from("reports")
      .select("id, cluster_id, text, category, severity, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),
  ]);

  return {
    bookings: ((bookings.data ?? []) as MyBookingRow[]).map((r) => ({
      id: r.id,
      matchId: r.match_id,
      quantity: r.quantity,
      totalSar: r.total_sar,
      createdAt: Date.parse(r.created_at),
    })),
    reports: ((reports.data ?? []) as MyReportRow[]).map((r) => ({
      id: r.id,
      clusterId: r.cluster_id,
      text: r.text,
      category: r.category,
      severity: r.severity,
      createdAt: Date.parse(r.created_at),
    })),
  };
}

/**
 * قراءة نشاط الحساب.
 *
 * النتيجة مخزَّنة مع صاحبها لا وحدها: بذلك يُشتقّ «جارٍ التحميل» من كون
 * المحفوظ لصاحب آخر، ولا تُكتب حالة داخل الأثر لتصحيح ما بعد تبديل الحساب —
 * فلا يرى الداخل الجديد بيانات من قبله للحظة.
 */
export function useMyActivity(userId: string | null) {
  const [loaded, setLoaded] = useState<{ id: string; data: MyActivity } | null>(null);

  useEffect(() => {
    if (!userId) return;
    let alive = true;

    void fetchMyActivity(userId)
      .then((data) => {
        if (alive) setLoaded({ id: userId, data });
      })
      .catch(() => {
        if (alive) setLoaded({ id: userId, data: EMPTY });
      });

    return () => {
      alive = false;
    };
  }, [userId]);

  const fresh = userId !== null && loaded?.id === userId;
  const data = fresh ? loaded.data : EMPTY;

  return { ...data, loading: userId !== null && !fresh };
}

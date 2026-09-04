"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { signIn, useSession, type SignInError } from "@/lib/auth";
import { useLocale } from "@/lib/i18n";
import type { StringKey } from "@/lib/strings";

const DEMO_EMAIL = "ops@hala2034.app";
const DEMO_PASSWORD = "HalaOps2034!";

const ERROR_KEY: Record<SignInError, StringKey> = {
  invalid: "login.errorInvalid",
  unconfigured: "login.errorUnconfigured",
  network: "login.errorNetwork",
};

export default function OpsLoginPage() {
  const { t, toggle } = useLocale();
  const { status } = useSession();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<SignInError | null>(null);
  const [busy, setBusy] = useState(false);

  // من هو مسجَّل أصلاً لا يرى صفحة الدخول
  useEffect(() => {
    if (status === "authenticated") router.replace("/ops");
  }, [status, router]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;

    setBusy(true);
    setError(null);
    const failure = await signIn(email, password);
    if (failure) {
      setError(failure);
      setBusy(false);
      return;
    }
    // لا نُنهي حالة الانشغال عند النجاح: التوجيه قادم، وإعادة تفعيل الزر
    // للحظة تسمح بإرسال ثانٍ لا معنى له
    router.replace("/ops");
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-[1fr_1.1fr]">
      {/* الهوية — تُخفى على الجوال حيث المساحة للنموذج */}
      <aside className="aura grid-lines relative hidden border-e border-line p-12 lg:flex lg:flex-col lg:justify-between">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-wash text-lg ring-1 ring-brand-dim">
            ⚽
          </span>
          <span className="leading-none">
            <span className="nums block text-lg font-bold tracking-tight text-text">HALA 2034</span>
            <span className="mt-1.5 block text-[10px] tracking-[0.2em] text-text-dim">
              {t("ops.console")}
            </span>
          </span>
        </div>

        <div className="max-w-sm">
          <p className="text-2xl font-bold leading-snug text-text">{t("login.title")}</p>
          <p className="mt-3 text-sm leading-relaxed text-text-muted">{t("login.subtitle")}</p>
        </div>

        <p className="text-[11px] text-text-dim">{t("footer.motto")}</p>
      </aside>

      {/* النموذج */}
      <main className="flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center justify-between">
            <Link href="/" className="text-xs font-semibold text-text-muted transition hover:text-brand">
              ← {t("login.back")}
            </Link>
            <button onClick={toggle} className="btn btn-ghost btn-sm">
              {t("header.switchLang")}
            </button>
          </div>

          <h1 className="text-xl font-bold text-text lg:hidden">{t("login.title")}</h1>
          <p className="mt-1.5 text-sm text-text-muted lg:hidden">{t("login.subtitle")}</p>

          <form onSubmit={onSubmit} className="card mt-6 space-y-4 p-5 lg:mt-0">
            <div>
              <label htmlFor="email" className="label">
                {t("login.email")}
              </label>
              <input
                id="email"
                type="email"
                autoComplete="username"
                required
                dir="ltr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
              />
            </div>

            <div>
              <label htmlFor="password" className="label">
                {t("login.password")}
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                dir="ltr"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
              />
            </div>

            {error && (
              <p
                role="alert"
                className="rounded-xl border border-danger/40 bg-danger-wash px-3 py-2 text-xs font-semibold text-danger"
              >
                {t(ERROR_KEY[error])}
              </p>
            )}

            <button
              type="submit"
              disabled={busy || !email || !password}
              className="btn btn-primary w-full py-3"
            >
              {busy ? t("login.signingIn") : t("login.submit")}
            </button>
          </form>

          {/* حساب العرض — هذا نموذج أولي عام، فبياناته معلنة عن قصد */}
          <div className="card-2 mt-4 p-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-text-dim">
              {t("login.demoTitle")}
            </p>
            <p className="nums mt-2 text-xs text-text-muted">{DEMO_EMAIL}</p>
            <p className="nums text-xs text-text-muted">{DEMO_PASSWORD}</p>
            <button
              type="button"
              onClick={() => {
                setEmail(DEMO_EMAIL);
                setPassword(DEMO_PASSWORD);
              }}
              className="btn btn-ghost btn-sm mt-3"
            >
              {t("login.demoFill")}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

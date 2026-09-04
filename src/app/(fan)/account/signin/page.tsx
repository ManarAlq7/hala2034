"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { signUp, useAccount, type SignUpError } from "@/lib/account";
import { signIn, type SignInError } from "@/lib/auth";
import { useLocale } from "@/lib/i18n";

/* -------------------------------------------------------------------------- */
/*  دخول المشجّع                                                                */
/*                                                                             */
/*  شاشة واحدة لبابين: الدخول وإنشاء حساب. الفصل بينهما في صفحتين يجعل من       */
/*  أخطأ الباب يبدأ من جديد، والتبديل هنا لا يفقد ما كُتب.                        */
/*                                                                             */
/*  وهي ليست بوّابة: الحجز والبلاغ يعملان بلا حساب، والصفحة تقول ذلك صراحةً      */
/*  كي لا يظنّ أحد أن عليه التسجيل ليحضر مباراة.                                 */
/* -------------------------------------------------------------------------- */

type Mode = "in" | "up";

export default function FanSignInPage() {
  const { t } = useLocale();
  const router = useRouter();
  const { status } = useAccount();

  const [mode, setMode] = useState<Mode>("in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<SignInError | SignUpError | null>(null);
  const [checkEmail, setCheckEmail] = useState(false);

  /* من كان داخلاً فعلاً لا يُعرض له باب */
  useEffect(() => {
    if (status === "signedIn") router.replace("/account");
  }, [status, router]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    setCheckEmail(false);

    if (mode === "in") {
      const failed = await signIn(email, password);
      setBusy(false);
      if (failed) setError(failed);
      else router.replace("/account");
      return;
    }

    const { error: failed, needsEmail } = await signUp(email, password, name);
    setBusy(false);
    if (failed) setError(failed);
    else if (needsEmail) setCheckEmail(true);
    else router.replace("/account");
  }

  const disabled =
    busy ||
    !email.includes("@") ||
    password.length < 8 ||
    (mode === "up" && name.trim().length < 2);

  return (
    <div className="mx-auto max-w-md px-5 py-14 sm:py-20">
      <h1 className="text-2xl font-bold tracking-tight text-text sm:text-3xl">
        {mode === "in" ? t("acc.signInTitle") : t("acc.signUpTitle")}
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-text-muted">{t("acc.optional")}</p>

      <form onSubmit={submit} className="card mt-7 space-y-4 p-5">
        {mode === "up" && (
          <div>
            <label htmlFor="name" className="label">
              {t("acc.name")}
            </label>
            <input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              className="input mt-1.5"
            />
          </div>
        )}

        <div>
          <label htmlFor="email" className="label">
            {t("acc.email")}
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            className="input mt-1.5"
          />
        </div>

        <div>
          <label htmlFor="password" className="label">
            {t("acc.password")}
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === "in" ? "current-password" : "new-password"}
            className="input mt-1.5"
          />
          {mode === "up" && <p className="mt-1.5 text-[11px] text-text-dim">{t("acc.passwordHint")}</p>}
        </div>

        {error && (
          <p role="alert" className="rounded-lg bg-danger-wash px-3 py-2 text-[13px] text-danger">
            {t(
              error === "invalid"
                ? "acc.errInvalid"
                : error === "taken"
                  ? "acc.errTaken"
                  : error === "weak"
                    ? "acc.errWeak"
                    : error === "unconfigured"
                      ? "acc.errUnconfigured"
                      : "acc.errNetwork",
            )}
          </p>
        )}

        {checkEmail && (
          <p role="status" className="rounded-lg bg-ok-wash px-3 py-2 text-[13px] text-ok">
            {t("acc.checkEmail")}
          </p>
        )}

        <button type="submit" disabled={disabled} className="btn btn-primary w-full py-3">
          {busy ? t("acc.working") : mode === "in" ? t("acc.signIn") : t("acc.signUp")}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-text-muted">
        {mode === "in" ? t("acc.noAccount") : t("acc.haveAccount")}{" "}
        <button
          type="button"
          onClick={() => {
            setMode(mode === "in" ? "up" : "in");
            setError(null);
            setCheckEmail(false);
          }}
          className="font-semibold text-brand underline underline-offset-4"
        >
          {mode === "in" ? t("acc.signUp") : t("acc.signIn")}
        </button>
      </p>

      <p className="mt-8 text-center text-[11px] text-text-dim">
        {t("acc.opsHint")}{" "}
        <Link href="/ops/login" className="underline underline-offset-4">
          {t("acc.opsLink")}
        </Link>
      </p>
    </div>
  );
}

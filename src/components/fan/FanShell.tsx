"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale } from "@/lib/i18n";

/**
 * هيكل واجهة الجمهور.
 *
 * ترويسة من سطر واحد: الهوية، وتبديل اللغة، ورابط واحد لفريق العمليات.
 * لا مؤشرات ولا أرقام ولا تنقّل تشغيلي — المشجّع جاء ليقول شيئاً ويمضي.
 */
export default function FanShell({ children }: { children: React.ReactNode }) {
  const { t, toggle, isRtl } = useLocale();
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-5 py-4">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-wash text-base ring-1 ring-brand-dim">
              ⚽
            </span>
            <span className="leading-none">
              <span className="nums block text-[15px] font-bold tracking-tight text-text">
                HALA 2034
              </span>
              <span className="mt-1 block text-[10px] tracking-[0.2em] text-text-dim">
                {isRtl ? "تجربة الجماهير" : "FAN EXPERIENCE"}
              </span>
            </span>
          </Link>

          <div className="flex items-center gap-1.5">
            {pathname !== "/track" && (
              <Link href="/track" className="btn btn-ghost btn-sm">
                {t("nav.track")}
              </Link>
            )}
            <button onClick={toggle} className="btn btn-ghost btn-sm" aria-label={t("header.switchLangAria")}>
              {t("header.switchLang")}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-3xl flex-col items-center justify-between gap-3 px-5 py-5 text-xs text-text-dim sm:flex-row">
          <span>{t("footer.tagline")}</span>
          <Link href="/ops/login" className="font-semibold text-text-muted transition hover:text-brand">
            {t("fan.opsLink")} ↗
          </Link>
        </div>
      </footer>
    </div>
  );
}

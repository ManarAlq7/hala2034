"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import GuideDock from "@/components/fan/GuideDock";
import LanguagePicker from "@/components/fan/LanguagePicker";
import { IconClose, IconMenu } from "@/components/ops/Icons";
import { useAccount } from "@/lib/account";
import { useLocale } from "@/lib/i18n";
import type { StringKey } from "@/lib/strings";

const NAV: { href: string; key: StringKey }[] = [
  { href: "/", key: "nav.home" },
  { href: "/tickets", key: "nav.tickets" },
  { href: "/fan-zones", key: "nav.zones" },
  { href: "/report", key: "nav.report" },
  { href: "/track", key: "nav.track" },
];

/**
 * هيكل واجهة الجمهور.
 *
 * تنقّل واحد من خمسة روابط، بلا أي مؤشر تشغيلي. رابط فريق العمليات في التذييل
 * لا في الترويسة: هو مدخل موظّفين، ووجوده بين روابط المشجّع يوحي بأنه وجهة له.
 */
export default function FanShell({ children }: { children: React.ReactNode }) {
  const { t, isRtl } = useLocale();
  const { status } = useAccount();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const links = NAV.map((item) => {
    const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
    return (
      <Link
        key={item.href}
        href={item.href}
        data-active={active}
        onClick={() => setOpen(false)}
        className="nav-link"
      >
        {t(item.key)}
      </Link>
    );
  });

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 border-b border-line bg-bg/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-3">
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

          <nav className="hidden items-center gap-0.5 md:flex">{links}</nav>

          <div className="flex items-center gap-1.5">
            {/* الحساب اختياري، فالرابط يقول «تسجيل الدخول» لا يفرضه */}
            <Link
              href={status === "signedIn" ? "/account" : "/account/signin"}
              className="btn btn-ghost btn-sm"
            >
              {status === "signedIn" ? t("nav.account") : t("nav.signIn")}
            </Link>
            <LanguagePicker />
            <button
              onClick={() => setOpen((v) => !v)}
              className="btn btn-ghost btn-sm md:hidden"
              aria-label={t("ops.menu")}
              aria-expanded={open}
            >
              {open ? <IconClose /> : <IconMenu />}
            </button>
          </div>
        </div>

        {open && (
          <nav className="mx-auto flex max-w-5xl flex-col gap-0.5 border-t border-line px-5 py-3 md:hidden">
            {links}
          </nav>
        )}
      </header>

      <main className="flex-1">{children}</main>

      {/* المرشد متاح من كل صفحة، ولا يفتح إلا بطلب */}
      <GuideDock />

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 px-5 py-5 text-xs text-text-dim sm:flex-row">
          <span>{t("footer.tagline")}</span>
          <Link href="/ops/login" className="font-semibold text-text-muted transition hover:text-brand">
            {t("fan.opsLink")} ↗
          </Link>
        </div>
      </footer>
    </div>
  );
}

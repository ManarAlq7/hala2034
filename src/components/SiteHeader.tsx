"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/", label: "الرئيسية" },
  { href: "/report", label: "تقديم بلاغ" },
  { href: "/track", label: "تتبّع بلاغ" },
  { href: "/dashboard", label: "لوحة المتابعة" },
];

export default function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="brand-gradient sticky top-0 z-40 text-white shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3">
        <Link href="/" className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/12 text-lg ring-1 ring-white/20">
            ⚽
          </span>
          <span className="leading-tight">
            <span className="block text-lg font-bold tracking-tight">
              هلا <span className="nums">2034</span>
            </span>
            <span className="block text-[11px] tracking-[0.22em] text-gold-200/90">HALA 2034</span>
          </span>
        </Link>

        <nav className="flex items-center gap-1 rounded-full bg-white/10 p-1 ring-1 ring-white/15">
          {NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-3 py-1.5 text-sm font-medium transition sm:px-4 ${
                  active ? "bg-white text-brand-800 shadow-sm" : "text-white/85 hover:bg-white/10"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

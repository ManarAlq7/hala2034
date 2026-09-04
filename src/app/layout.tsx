import type { Metadata } from "next";
import { IBM_Plex_Sans_Arabic } from "next/font/google";
import "./globals.css";
import SiteHeader from "@/components/SiteHeader";

const arabic = IBM_Plex_Sans_Arabic({
  variable: "--font-arabic",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "هلا 2034 — ذكاء تشغيلي لتجربة الجماهير",
  description:
    "منصة ذكية متعددة اللغات تستقبل ملاحظات الجماهير عبر مختلف القنوات، تصنّفها وتجمّع المتشابه منها في مشكلة واحدة، وتعرضها على لوحة متابعة وخريطة حرارية.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={`${arabic.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-hairline bg-surface">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-5 py-6 text-sm text-ink-muted sm:flex-row">
            <span>هلا 2034 — نموذج أولي لذكاء تشغيلي لتجربة جماهير كأس العالم</span>
            <span className="text-gold-600 font-semibold">طموحنا عنان السماء</span>
          </div>
        </footer>
      </body>
    </html>
  );
}

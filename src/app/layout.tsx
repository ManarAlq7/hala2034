import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans_Arabic } from "next/font/google";
import ServiceWorker from "@/components/fan/ServiceWorker";
import "./globals.css";

const arabic = IBM_Plex_Sans_Arabic({
  variable: "--font-arabic",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "HALA 2034 — Fan Experience Operations",
  description:
    "AI-powered fan experience operations for the FIFA World Cup 2034. Multilingual fan reports are translated, classified, grouped into single issues, and summarised for the operations team on a live console.",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "HALA 2034", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: "#8a6a24",
};

/**
 * الجذر لا يحمل أي هيكل مرئي.
 *
 * للتطبيق واجهتان مختلفتان في الغرض والشكل — واجهة الجمهور وكونسول العمليات —
 * ولكلٍّ منهما هيكلها الخاص. ترويسة واحدة تجمعهما هي ما جعل النسخة السابقة
 * تخلط بين مَن يرسل بلاغاً ومَن يديره.
 *
 * الخادم يُصيّر بالعربية دائماً، ثم يصحّح lib/i18n اللغة والاتجاه بعد الترطيب
 * إن كان الاختيار المحفوظ مختلفاً — فلا يختلف تصيير الخادم عن أول تصيير للعميل.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={`${arabic.variable} h-full`}>
      <body className="min-h-full antialiased">
        {children}
        <ServiceWorker />
      </body>
    </html>
  );
}

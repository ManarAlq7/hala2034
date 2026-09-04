import OpsShell from "@/components/ops/OpsShell";

/**
 * كل ما تحت هذا الهيكل محمي.
 *
 * صفحة الدخول تقع خارج مجموعة `(console)` عن قصد — لو كانت داخلها لحرستها
 * الحراسة نفسها وصار الدخول مستحيلاً.
 */
export default function ConsoleLayout({ children }: { children: React.ReactNode }) {
  return <OpsShell>{children}</OpsShell>;
}

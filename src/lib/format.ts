/** صياغة الوقت النسبي بالعربية */
export function relativeTime(ts: number, now: number = Date.now()): string {
  const diff = Math.max(0, now - ts);
  const min = Math.floor(diff / 60000);
  if (min < 1) return "الآن";
  if (min === 1) return "قبل دقيقة";
  if (min === 2) return "قبل دقيقتين";
  if (min < 11) return `قبل ${min} دقائق`;
  if (min < 60) return `قبل ${min} دقيقة`;
  const hr = Math.floor(min / 60);
  if (hr === 1) return "قبل ساعة";
  if (hr === 2) return "قبل ساعتين";
  if (hr < 11) return `قبل ${hr} ساعات`;
  if (hr < 24) return `قبل ${hr} ساعة`;
  const day = Math.floor(hr / 24);
  if (day === 1) return "أمس";
  return `قبل ${day} أيام`;
}

/** الوقت بصيغة ٢٤ ساعة */
export function clockTime(ts: number): string {
  const d = new Date(ts);
  const h = String(d.getHours()).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

/** صياغة عدد البلاغات بصيغة عربية سليمة */
export function countLabel(n: number, singular: string, dual: string, plural: string): string {
  if (n === 1) return singular;
  if (n === 2) return dual;
  if (n <= 10) return `${n} ${plural}`;
  return `${n} ${singular}`;
}

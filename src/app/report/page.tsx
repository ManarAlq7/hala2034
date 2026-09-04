"use client";

import Link from "next/link";
import { useState } from "react";
import VoiceInput from "@/components/VoiceInput";
import { CategoryChip, MetaChip, SeverityBadge } from "@/components/Badges";
import { CHANNELS, ZONES, categoryById, zoneById } from "@/lib/taxonomy";
import { langLabel, subtypeLabel } from "@/lib/ai";
import { useApp, type SubmitResult } from "@/lib/store";
import type { ChannelId, SourceId } from "@/lib/types";

const EXAMPLES = [
  "الزحمة شديدة جداً عند البوابة B وواقفين من نص ساعة",
  "The toilets near the concourse are dirty and there is no water",
  "Hay mucha gente en la puerta B y la cola no avanza",
  "شخص أُغمي عليه في المدرج الجنوبي ونحتاج إسعاف بسرعة",
];

export default function ReportPage() {
  const { ready, submit } = useApp();
  const [text, setText] = useState("");
  const [zoneId, setZoneId] = useState(ZONES[1].id);
  const [channel, setChannel] = useState<ChannelId>("app");
  const [source, setSource] = useState<SourceId>("text");
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [sending, setSending] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = text.trim();
    if (clean.length < 4 || sending) return;

    setSending(true);
    try {
      setResult(await submit({ text: clean, zoneId, channel, source }));
      setText("");
      setSource("text");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-5 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-ink sm:text-3xl">تقديم بلاغ</h1>
        <p className="mt-1 text-sm text-ink-muted">
          شاركنا ملاحظتك بأي لغة، نصاً أو صوتاً. النظام يفهم البلاغ ويحدّد نوعه وموقعه ويحيله للجهة المختصة خلال ثوانٍ.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        {/* ------------------------------- النموذج ------------------------------- */}
        <form onSubmit={onSubmit} className="card space-y-5 p-5">
          <div>
            <label htmlFor="text" className="mb-2 block text-sm font-bold text-ink">
              نص البلاغ
            </label>
            <textarea
              id="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={5}
              placeholder="اكتب ملاحظتك هنا… مثال: الطابور طويل جداً عند البوابة B"
              className="w-full resize-y rounded-xl border border-hairline bg-white px-3 py-2.5 text-sm text-ink outline-none transition placeholder:text-ink-muted/60 focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            />
            <div className="mt-2 flex flex-wrap gap-1.5">
              {EXAMPLES.map((ex) => (
                <button
                  key={ex}
                  type="button"
                  onClick={() => setText(ex)}
                  className="rounded-full bg-slate-50 px-2.5 py-1 text-[11px] text-slate-600 ring-1 ring-slate-200 transition hover:bg-slate-100"
                >
                  {ex.length > 46 ? `${ex.slice(0, 46)}…` : ex}
                </button>
              ))}
            </div>
          </div>

          <VoiceInput
            onTranscript={(t) => {
              setText((prev) => (prev ? `${prev} ${t}` : t));
              setSource("voice");
            }}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="zone" className="mb-2 block text-sm font-bold text-ink">
                موقعك الحالي
              </label>
              <select
                id="zone"
                value={zoneId}
                onChange={(e) => setZoneId(e.target.value)}
                className="w-full rounded-xl border border-hairline bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              >
                {ZONES.map((z) => (
                  <option key={z.id} value={z.id}>
                    {z.label} — {z.venue}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-[11px] text-ink-muted">
                إن ذكرت موقعاً آخر داخل النص، يعتمد النظام ما ورد في النص.
              </p>
            </div>

            <div>
              <span className="mb-2 block text-sm font-bold text-ink">قناة الاستقبال</span>
              <div className="grid grid-cols-2 gap-1.5">
                {CHANNELS.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setChannel(c.id)}
                    className={`flex items-center gap-1.5 rounded-xl px-2.5 py-2 text-xs font-semibold ring-1 transition ${
                      channel === c.id
                        ? "bg-brand-700 text-white ring-brand-700"
                        : "bg-white text-ink-muted ring-hairline hover:bg-brand-50"
                    }`}
                  >
                    <span aria-hidden>{c.icon}</span>
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={!ready || sending || text.trim().length < 4}
            className="w-full rounded-xl bg-brand-700 px-4 py-3 text-sm font-bold text-white transition hover:bg-brand-800 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {sending ? "جارٍ تحليل البلاغ…" : "إرسال البلاغ"}
          </button>
        </form>

        {/* ------------------------------ نتيجة التحليل ------------------------------ */}
        <div className="space-y-4">
          {result ? (
            <AnalysisCard key={result.report.id} result={result} />
          ) : (
            <div className="card flex h-full min-h-[280px] flex-col items-center justify-center gap-3 p-6 text-center">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-50 text-2xl ring-1 ring-brand-100">
                🧠
              </span>
              <p className="text-sm font-semibold text-ink">نتيجة التحليل تظهر هنا</p>
              <p className="max-w-xs text-xs text-ink-muted">
                بعد الإرسال يعرض النظام اللغة المكتشفة، نوع المشكلة، درجة الخطورة، الموقع، والجهة
                المختصة — إضافة إلى ربط البلاغ ببلاغات مشابهة إن وُجدت.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AnalysisCard({ result }: { result: SubmitResult }) {
  const { report, cluster, classification, isNewCluster, similarCount } = result;
  const cat = categoryById(report.category);

  return (
    <div className="card rise space-y-4 p-5">
      <div className="rounded-xl bg-emerald-50 px-3 py-2.5 ring-1 ring-emerald-200">
        <p className="flex items-center gap-2 text-sm font-bold text-emerald-800">
          <span aria-hidden>✓</span>
          تم استلام البلاغ
        </p>
        <p className="mt-1 text-xs text-emerald-900/80">
          رقم المتابعة <span className="nums font-bold">{report.id}</span> — احتفظ به لمتابعة الحالة من
          صفحة{" "}
          <Link href="/track" className="font-semibold underline">
            تتبّع بلاغ
          </Link>
          .
        </p>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-bold text-ink">ما فهمه النظام</h3>
        <div className="flex flex-wrap gap-1.5">
          <MetaChip>🎯 {subtypeLabel(report.subtype)}</MetaChip>
          <CategoryChip id={report.category} />
          <SeverityBadge id={report.severity} />
          <MetaChip>📍 {zoneById(report.zoneId).label}</MetaChip>
          <MetaChip>🌐 {langLabel(classification.lang)}</MetaChip>
          <MetaChip>
            دقة التصنيف <span className="nums">{Math.round(report.confidence * 100)}٪</span>
          </MetaChip>
        </div>
        <p className="mt-2 text-[11px] text-ink-muted">
          {classification.source === "claude"
            ? "صُنّف بنموذج لغوي على الخادم."
            : "صُنّف بالمحرك المحلي — يعمل بلا إنترنت ولا مفتاح."}
        </p>
      </div>

      {report.keywords.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-bold text-ink">الكلمات الدالة</h3>
          <div className="flex flex-wrap gap-1.5">
            {report.keywords.map((k) => (
              <span
                key={k}
                className="rounded-md bg-gold-200/40 px-2 py-0.5 text-xs font-medium text-gold-600 ring-1 ring-gold-200"
              >
                {k}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-xl bg-brand-50 p-3 ring-1 ring-brand-100">
        <h3 className="mb-1 text-sm font-bold text-brand-800">
          {isNewCluster ? "أُنشئت مشكلة جديدة" : "ضُمّ البلاغ لمشكلة قائمة"}
        </h3>
        <p className="text-xs text-ink-muted">
          {isNewCluster ? (
            <>
              لم يُرصد بلاغ مشابه في هذا الموقع، فأُنشئت المشكلة{" "}
              <span className="nums font-semibold text-brand-700">{cluster.id}</span> وأُحيلت إلى{" "}
              <span className="font-semibold text-brand-700">{cat.owner}</span>.
            </>
          ) : (
            <>
              يوجد <span className="nums font-semibold text-brand-700">{similarCount}</span> بلاغاً
              متشابهاً في نفس الموقع، جُمعت كلها في المشكلة{" "}
              <span className="nums font-semibold text-brand-700">{cluster.id}</span> لدى{" "}
              <span className="font-semibold text-brand-700">{cluster.assignedTo}</span>.
            </>
          )}
        </p>
      </div>

      <Link
        href="/dashboard"
        className="block rounded-xl bg-brand-700 px-4 py-2.5 text-center text-sm font-bold text-white transition hover:bg-brand-800"
      >
        متابعة الحالة في لوحة المتابعة
      </Link>
    </div>
  );
}

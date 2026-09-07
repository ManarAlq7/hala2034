"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import VoiceInput from "@/components/VoiceInput";
import { ZONES, categoryOwner, zoneLabel, zoneVenue } from "@/lib/taxonomy";
import { langLabel, subtypeLabel } from "@/lib/ai";
import { useLocale } from "@/lib/i18n";
import { askNotifyPermission } from "@/lib/notify";
import { queueReport, useFlushOnReconnect, useOutbox, type QueuedReport } from "@/lib/offline";
import { useApp, submitReport, type SubmitResult } from "@/lib/store";
import type { ChannelId, SourceId } from "@/lib/types";

/** أمثلة بلغات مختلفة — مُدخلات لا نصوص واجهة، فتبقى كما هي في اللغتين */
const EXAMPLES = [
  "الزحمة شديدة جداً عند البوابة B وواقفين من نص ساعة",
  "The toilets near the concourse are dirty and there is no water",
  "Hay mucha gente en la puerta B y la cola no avanza",
];

export default function FanReportPage() {
  const { ready, submit } = useApp();
  const { t, locale } = useLocale();

  const [mode, setMode] = useState<SourceId>("text");
  const [text, setText] = useState("");
  const [zoneId, setZoneId] = useState(ZONES[1].id);
  const [source, setSource] = useState<SourceId>("text");
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [queued, setQueued] = useState(false);
  const [failed, setFailed] = useState(false);
  const [sending, setSending] = useState(false);

  const { online, pending } = useOutbox();

  /* ما حُفظ أثناء الانقطاع يُرسَل وحده حين تعود الشبكة */
  const sendQueued = useCallback(
    (item: QueuedReport) =>
      submitReport({
        text: item.text,
        zoneId: item.zoneId,
        channel: item.channel as ChannelId,
        source: item.source as SourceId,
        reporterName: item.reporterName,
        at: item.at,
      }),
    [],
  );
  useFlushOnReconnect(sendQueued);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = text.trim();
    if (clean.length < 4 || sending) return;

    setSending(true);
    setFailed(false);
    try {
      const saved = await submit({ text: clean, zoneId, channel: "web", source });
      setResult(saved);
      // الإذن يُطلب الآن لا عند فتح الصفحة: صار للإشعار معنى يُشرح
      void askNotifyPermission();
    } catch {
      /*
       * الفشل هنا ليس نهاية البلاغ. الشبكة تسقط في الملعب تحديداً وقت الحاجة،
       * فيُحفظ ما كُتب في الجهاز ويُرسَل حين تعود — بوقت كتابته لا بوقت وصوله.
       */
      queueReport({ text: clean, zoneId, channel: "web", source, at: Date.now() });
      setQueued(true);
    } finally {
      setSending(false);
    }
  };

  const reset = () => {
    setResult(null);
    setQueued(false);
    setFailed(false);
    setText("");
    setSource("text");
    setMode("text");
  };

  if (result) {
    return <Confirmation result={result} onAnother={reset} />;
  }

  if (queued) {
    return <Queued onAnother={reset} />;
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-10 sm:py-14">
      <div className="mb-8">
        <h1 className="text-2xl font-bold leading-snug text-text sm:text-3xl">{t("fan.tagline")}</h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-text-muted">{t("fan.blurb")}</p>
      </div>

      {/* الحالة تُقال قبل أن يكتب، لا بعد أن يضغط ويفشل */}
      {(!online || pending > 0) && (
        <p
          role="status"
          className="mb-4 rounded-xl border border-warn/30 bg-warn-wash px-4 py-3 text-[13px] leading-relaxed text-warn"
        >
          {!online ? t("report.offline") : t("report.pending", { n: pending })}
        </p>
      )}

      <form onSubmit={onSubmit} className="card space-y-6 p-5 sm:p-6">
        {/* اختيار طريقة الإدخال */}
        <div className="inline-flex rounded-xl border border-line bg-surface-2 p-1">
          {(
            [
              { id: "text" as SourceId, label: t("fan.modeText"), icon: "⌨️" },
              { id: "voice" as SourceId, label: t("fan.modeVoice"), icon: "🎙" },
            ]
          ).map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setMode(m.id)}
              aria-pressed={mode === m.id}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                mode === m.id
                  ? "bg-brand-wash text-brand"
                  : "text-text-muted hover:text-text"
              }`}
            >
              <span aria-hidden className="me-1.5">
                {m.icon}
              </span>
              {m.label}
            </button>
          ))}
        </div>

        {mode === "voice" && (
          <VoiceInput
            onTranscript={(spoken) => {
              setText((prev) => (prev ? `${prev} ${spoken}` : spoken));
              setSource("voice");
            }}
          />
        )}

        <div>
          <label htmlFor="text" className="label">
            {t("report.textLabel")}
          </label>
          <textarea
            id="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={5}
            placeholder={t("report.placeholder")}
            className="input resize-y"
          />
          <div className="mt-2 flex flex-wrap gap-1.5">
            {EXAMPLES.map((ex) => (
              <button
                key={ex}
                type="button"
                onClick={() => setText(ex)}
                className="rounded-full border border-line bg-surface-2 px-2.5 py-1 text-[11px] text-text-dim transition hover:border-line-strong hover:text-text-muted"
              >
                {ex.length > 40 ? `${ex.slice(0, 40)}…` : ex}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="zone" className="label">
            {t("report.zoneLabel")}
          </label>
          <select
            id="zone"
            value={zoneId}
            onChange={(e) => setZoneId(e.target.value)}
            className="input"
          >
            {ZONES.map((z) => (
              <option key={z.id} value={z.id}>
                {zoneLabel(z.id, locale)} — {zoneVenue(z.id, locale)}
              </option>
            ))}
          </select>
          <p className="mt-1.5 text-[11px] text-text-dim">{t("report.zoneHint")}</p>
        </div>

        {failed && (
          <p role="alert" className="rounded-lg bg-danger-wash px-3 py-2 text-[13px] text-danger">
            {t("report.failed")}
          </p>
        )}

        {/* لا يُعطَّل الزرّ بانقطاع الشبكة: البلاغ يُحفظ ويُرسل لاحقاً */}
        <button
          type="submit"
          disabled={(!ready && online) || sending || text.trim().length < 4}
          className="btn btn-primary w-full py-3"
        >
          {sending ? t("report.sending") : online ? t("report.submit") : t("report.submitOffline")}
        </button>
      </form>
    </div>
  );
}

/* --------------------------- حُفظ حتى تعود الشبكة --------------------------- */

function Queued({ onAnother }: { onAnother: () => void }) {
  const { t } = useLocale();

  return (
    <div className="rise mx-auto max-w-3xl px-5 py-10 sm:py-14">
      <div className="card overflow-hidden">
        <div className="border-b border-line bg-warn-wash px-5 py-6 text-center sm:px-8">
          <span className="mx-auto mb-3 grid h-11 w-11 place-items-center rounded-full bg-warn text-lg text-white">
            ⇅
          </span>
          <h1 className="text-xl font-bold text-text">{t("report.queuedTitle")}</h1>
        </div>
        <div className="space-y-5 p-5 sm:p-8">
          <p className="text-sm leading-relaxed text-text-muted">{t("report.queuedBody")}</p>
          <button onClick={onAnother} className="btn btn-ghost w-full">
            {t("fan.another")}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------ شاشة التأكيد ------------------------------ */

function Confirmation({ result, onAnother }: { result: SubmitResult; onAnother: () => void }) {
  const { report, cluster, classification, isNewCluster, similarCount } = result;
  const { t, locale } = useLocale();

  return (
    <div className="rise mx-auto max-w-3xl px-5 py-10 sm:py-14">
      <div className="card overflow-hidden">
        {/* ما يهمّ المشجّع أولاً: وصل، وهذا رقمه */}
        <div className="border-b border-line bg-brand-wash px-5 py-6 text-center sm:px-8">
          <span className="mx-auto mb-3 grid h-11 w-11 place-items-center rounded-full bg-brand-strong text-lg text-on-brand">
            ✓
          </span>
          <h1 className="text-xl font-bold text-text">{t("report.received")}</h1>
          <p className="mt-3 text-xs uppercase tracking-[0.14em] text-text-dim">
            {t("report.trackingNo")}
          </p>
          {/* الرمز لا المعرّف: المعرّف متسلسل، وهذا وحده ما يفتح تفاصيل البلاغ */}
          <p className="nums mt-1 text-3xl font-bold tracking-[0.14em] text-brand">
            {report.trackCode ?? report.id}
          </p>
        </div>

        <div className="space-y-5 p-5 sm:p-8">
          <p className="text-sm leading-relaxed text-text-muted">
            {isNewCluster
              ? t("report.newClusterBody", {
                  id: cluster.id,
                  owner: categoryOwner(report.category, locale),
                })
              : t("report.joinedClusterBody", {
                  n: similarCount,
                  id: cluster.id,
                  owner: categoryOwner(report.category, locale),
                })}
          </p>

          <div>
            <h2 className="label">{t("report.understood")}</h2>
            <div className="flex flex-wrap gap-1.5">
              <span className="chip chip-brand">{subtypeLabel(report.subtype, locale)}</span>
              <span className="chip chip-neutral">📍 {zoneLabel(report.zoneId, locale)}</span>
              <span className="chip chip-neutral">🌐 {langLabel(classification.lang, locale)}</span>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <button onClick={onAnother} className="btn btn-ghost flex-1">
              {t("fan.another")}
            </button>
            <Link href="/track" className="btn btn-primary flex-1">
              {t("fan.trackCta")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

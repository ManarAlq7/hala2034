"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useLocale } from "@/lib/i18n";
import type { StringKey } from "@/lib/strings";

/** واجهة التعرّف على الكلام في المتصفح (Web Speech API) */
interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult:
    | ((e: {
        resultIndex: number;
        results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }>;
      }) => void)
    | null;
  onerror: ((e: { error?: string }) => void) | null;
  onend: (() => void) | null;
}

type RecognitionCtor = new () => SpeechRecognitionLike;

function getRecognitionCtor(): RecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: RecognitionCtor;
    webkitSpeechRecognition?: RecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

/** لا يتغيّر دعم المتصفح أثناء عمل الصفحة، فلا حاجة للاشتراك في أي تحديث */
const noopSubscribe = () => () => {};

const LANGS = [
  { code: "ar-SA", label: "العربية" },
  { code: "en-US", label: "English" },
  { code: "es-ES", label: "Español" },
  { code: "fr-FR", label: "Français" },
];

interface Props {
  onTranscript: (text: string) => void;
}

export default function VoiceInput({ onTranscript }: Props) {
  const { t } = useLocale();
  // قراءة قدرة المتصفح بعد الترطيب فقط، تفادياً لاختلاف الخادم عن العميل
  const supported = useSyncExternalStore(
    noopSubscribe,
    () => getRecognitionCtor() !== null,
    () => null as boolean | null,
  );
  const [listening, setListening] = useState(false);
  const [lang, setLang] = useState("ar-SA");
  const [interim, setInterim] = useState("");
  const [error, setError] = useState<StringKey | null>(null);
  const recRef = useRef<SpeechRecognitionLike | null>(null);

  // إيقاف أي تسجيل جارٍ عند مغادرة الصفحة
  useEffect(() => () => recRef.current?.stop(), []);

  const toggle = () => {
    if (listening) {
      recRef.current?.stop();
      return;
    }
    const Ctor = getRecognitionCtor();
    if (!Ctor) return;

    const rec = new Ctor();
    rec.lang = lang;
    rec.continuous = true;
    rec.interimResults = true;
    rec.onresult = (e) => {
      let finalText = "";
      let partial = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const res = e.results[i];
        const chunk = res[0]?.transcript ?? "";
        if (res.isFinal) finalText += chunk;
        else partial += chunk;
      }
      setInterim(partial);
      if (finalText.trim()) {
        onTranscript(finalText.trim());
        setInterim("");
      }
    };
    rec.onerror = (e) => {
      setError(e.error === "not-allowed" ? "voice.denied" : "voice.failed");
      setListening(false);
    };
    rec.onend = () => {
      setListening(false);
      setInterim("");
    };

    recRef.current = rec;
    setError(null);
    try {
      rec.start();
      setListening(true);
    } catch {
      setError("voice.startFailed");
    }
  };

  if (supported === null) return null;

  if (!supported) {
    return (
      <p className="rounded-xl border border-warn/35 bg-warn-wash px-3 py-2.5 text-xs text-warn">
        {t("voice.unsupported")}
      </p>
    );
  }

  return (
    <div className="card-2 p-4">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={toggle}
          className={`btn ${listening ? "btn-danger" : "btn-primary"}`}
        >
          <span aria-hidden>{listening ? "■" : "🎙"}</span>
          {listening ? t("voice.stop") : t("voice.record")}
        </button>

        <label className="flex items-center gap-2 text-xs text-text-muted">
          {t("voice.lang")}
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            disabled={listening}
            className="input w-auto px-2 py-1 text-xs"
          >
            {LANGS.map((l) => (
              <option key={l.code} value={l.code}>
                {l.label}
              </option>
            ))}
          </select>
        </label>

        {listening && (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-danger">
            <span className="h-2 w-2 animate-pulse rounded-full bg-danger" />
            {t("voice.listening")}
          </span>
        )}
      </div>

      {interim && <p className="mt-2.5 text-sm text-text-muted">{interim}</p>}
      {error && <p className="mt-2.5 text-xs font-semibold text-danger">{t(error)}</p>}
      <p className="mt-2.5 text-[11px] text-text-dim">{t("voice.hint")}</p>
    </div>
  );
}

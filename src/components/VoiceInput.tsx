"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

/** واجهة التعرّف على الكلام في المتصفح (Web Speech API) */
interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((e: { resultIndex: number; results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> }) => void) | null;
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
  // قراءة قدرة المتصفح بعد الترطيب فقط، تفادياً لاختلاف الخادم عن العميل
  const supported = useSyncExternalStore(
    noopSubscribe,
    () => getRecognitionCtor() !== null,
    () => null as boolean | null,
  );
  const [listening, setListening] = useState(false);
  const [lang, setLang] = useState("ar-SA");
  const [interim, setInterim] = useState("");
  const [error, setError] = useState<string | null>(null);
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
        const t = res[0]?.transcript ?? "";
        if (res.isFinal) finalText += t;
        else partial += t;
      }
      setInterim(partial);
      if (finalText.trim()) {
        onTranscript(finalText.trim());
        setInterim("");
      }
    };
    rec.onerror = (e) => {
      setError(
        e.error === "not-allowed"
          ? "لم يُسمح بالوصول إلى المايكروفون. فعّل الإذن من إعدادات المتصفح."
          : "تعذّر التعرّف على الصوت. جرّب مرة أخرى أو اكتب البلاغ نصاً.",
      );
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
      setError("تعذّر بدء التسجيل.");
    }
  };

  if (supported === null) return null;

  if (!supported) {
    return (
      <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-800 ring-1 ring-amber-200">
        المتصفح الحالي لا يدعم الإدخال الصوتي. استخدم Chrome أو Edge، أو اكتب البلاغ نصاً.
      </p>
    );
  }

  return (
    <div className="rounded-xl bg-brand-50 p-3 ring-1 ring-brand-100">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={toggle}
          className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold text-white transition ${
            listening ? "bg-red-600 hover:bg-red-700" : "bg-brand-700 hover:bg-brand-800"
          }`}
        >
          <span className="relative grid h-4 w-4 place-items-center">
            <span aria-hidden>{listening ? "■" : "🎙"}</span>
          </span>
          {listening ? "إيقاف التسجيل" : "تسجيل صوتي"}
        </button>

        <label className="flex items-center gap-2 text-xs text-ink-muted">
          لغة النطق
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            disabled={listening}
            className="rounded-lg border border-hairline bg-white px-2 py-1 text-xs text-ink"
          >
            {LANGS.map((l) => (
              <option key={l.code} value={l.code}>
                {l.label}
              </option>
            ))}
          </select>
        </label>

        {listening && (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600">
            <span className="h-2 w-2 animate-pulse rounded-full bg-red-600" />
            جارٍ الاستماع…
          </span>
        )}
      </div>

      {interim && <p className="mt-2 text-sm text-ink-muted">{interim}</p>}
      {error && <p className="mt-2 text-xs font-semibold text-red-700">{error}</p>}
      <p className="mt-2 text-[11px] text-ink-muted">
        يُحوَّل الصوت إلى نص داخل المتصفح ثم يمر على نفس محرك التصنيف.
      </p>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useCatalog } from "@/lib/catalog";
import type { GuideAnswer } from "@/lib/guide";
import { useLocale } from "@/lib/i18n";

/* -------------------------------------------------------------------------- */
/*  مرشد الحدث                                                                 */
/*                                                                             */
/*  زرّ واحد على كل صفحة: يسأل المشجّع بلغته فيصل إلى الصفحة التي يريدها بدل     */
/*  أن يتنقّل في القوائم. الجواب ينتهي دائماً بروابط — الإرشاد أن تصل، لا أن      */
/*  تُشرح لك الطريق.                                                             */
/*                                                                             */
/*  ولا يفتح من تلقاء نفسه: نافذة تقفز على من يقرأ صفحة مقاطعةٌ لا مساعدة.      */
/* -------------------------------------------------------------------------- */

interface Turn {
  question: string;
  answer: GuideAnswer | null;
}

export default function GuideDock() {
  const { t, locale } = useLocale();
  const catalog = useCatalog();

  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [turns, setTurns] = useState<Turn[]>([]);
  const [busy, setBusy] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const feed = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) input.current?.focus();
  }, [open]);

  /* آخر جواب هو ما يُقرأ، فيُنزَل إليه */
  useEffect(() => {
    feed.current?.scrollTo({ top: feed.current.scrollHeight, behavior: "smooth" });
  }, [turns, busy]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  async function ask(text: string) {
    const clean = text.trim();
    if (clean.length < 2 || busy) return;

    setQuestion("");
    setTurns((prev) => [...prev, { question: clean, answer: null }]);
    setBusy(true);

    try {
      const res = await fetch("/api/guide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: clean,
          locale,
          catalog: {
            venues: catalog.venues,
            matches: catalog.matches,
            zones: catalog.zones,
            tiers: [],
          },
        }),
      });

      const data = (await res.json()) as GuideAnswer & { error?: string };
      setTurns((prev) =>
        prev.map((turn, i) =>
          i === prev.length - 1
            ? {
                ...turn,
                answer: data.error
                  ? { text: t("guide.failed"), links: [], source: "local" }
                  : data,
              }
            : turn,
        ),
      );
    } catch {
      setTurns((prev) =>
        prev.map((turn, i) =>
          i === prev.length - 1
            ? { ...turn, answer: { text: t("guide.failed"), links: [], source: "local" } }
            : turn,
        ),
      );
    } finally {
      setBusy(false);
    }
  }

  const suggestions = [t("guide.ex1"), t("guide.ex2"), t("guide.ex3")];

  return (
    <>
      {/* ------------------------------- الزرّ ------------------------------- */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="fixed bottom-5 end-5 z-40 flex h-14 items-center gap-2.5 rounded-full bg-brand px-5 text-on-brand shadow-lg transition hover:bg-brand-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        <span aria-hidden className="text-lg leading-none">
          {open ? "✕" : "✦"}
        </span>
        <span className="text-sm font-bold">{t("guide.button")}</span>
      </button>

      {/* ------------------------------ اللوحة ------------------------------ */}
      {open && (
        <div
          role="dialog"
          aria-label={t("guide.title")}
          className="fixed bottom-24 end-5 z-40 flex max-h-[min(32rem,70vh)] w-[min(24rem,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-2xl"
        >
          <header className="border-b border-line bg-surface-2 px-4 py-3">
            <h2 className="text-sm font-bold text-text">{t("guide.title")}</h2>
            <p className="mt-0.5 text-[11px] leading-relaxed text-text-dim">{t("guide.subtitle")}</p>
          </header>

          <div ref={feed} className="flex-1 space-y-4 overflow-y-auto p-4">
            {turns.length === 0 && (
              <div>
                <p className="text-[13px] leading-relaxed text-text-muted">{t("guide.empty")}</p>
                <ul className="mt-3 space-y-1.5">
                  {suggestions.map((s) => (
                    <li key={s}>
                      <button
                        type="button"
                        onClick={() => ask(s)}
                        className="w-full rounded-lg border border-line bg-surface-2 px-3 py-2 text-start text-[12px] text-text-muted transition hover:border-line-strong hover:text-text"
                      >
                        {s}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {turns.map((turn, i) => (
              <div key={i} className="space-y-2">
                <p className="ms-auto w-fit max-w-[85%] rounded-2xl bg-brand-wash px-3 py-2 text-[13px] font-semibold text-brand">
                  {turn.question}
                </p>

                {turn.answer ? (
                  <div className="w-fit max-w-[92%] rounded-2xl bg-surface-2 px-3 py-2.5">
                    <p className="text-[13px] leading-relaxed text-text">{turn.answer.text}</p>

                    {turn.answer.links.length > 0 && (
                      <ul className="mt-2.5 space-y-1">
                        {turn.answer.links.map((l) => (
                          <li key={l.href + l.label}>
                            <Link
                              href={l.href}
                              onClick={() => setOpen(false)}
                              className="flex items-center justify-between gap-2 rounded-lg border border-line bg-surface px-2.5 py-1.5 text-[12px] font-semibold text-brand transition hover:border-brand-dim"
                            >
                              <span>{l.label}</span>
                              <span aria-hidden>←</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}

                    {/* أي مسلك أجاب — يُقال بصراحة لا يُخفى */}
                    <p className="mt-2 text-[10px] text-text-dim">
                      {turn.answer.source === "claude" ? t("guide.byModel") : t("guide.byLocal")}
                    </p>
                  </div>
                ) : (
                  <p className="w-fit rounded-2xl bg-surface-2 px-3 py-2 text-[13px] text-text-dim">
                    {t("guide.thinking")}
                  </p>
                )}
              </div>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              void ask(question);
            }}
            className="flex gap-2 border-t border-line p-3"
          >
            <input
              ref={input}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder={t("guide.placeholder")}
              className="input flex-1 py-2 text-sm"
            />
            <button
              type="submit"
              disabled={busy || question.trim().length < 2}
              className="btn btn-primary px-4"
            >
              {busy ? "…" : "↑"}
            </button>
          </form>
        </div>
      )}
    </>
  );
}

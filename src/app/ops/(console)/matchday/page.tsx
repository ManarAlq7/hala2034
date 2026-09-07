"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ops/Primitives";
import { matchAway, matchHome, matchStage, useCatalog } from "@/lib/catalog";
import { matchDateTime } from "@/lib/format";
import { useLocale } from "@/lib/i18n";
import {
  ICONS,
  clockLabel,
  eventDetail,
  eventPlayer,
  scoreOf,
  useLiveEvents,
  type EventKind,
  type Side,
} from "@/lib/matchday";
import { supabase } from "@/lib/supabase";

/* الأحداث التي تُسجَّل من الملعب، بترتيب ورودها في المباراة لا أبجدياً */
const KINDS: EventKind[] = [
  "lineup",
  "kickoff",
  "goal",
  "own_goal",
  "penalty",
  "yellow",
  "red",
  "substitution",
  "var",
  "half_time",
  "second_half",
  "full_time",
];

/** الأحداث التي تخصّ المباراة لا فريقاً بعينه */
const NEUTRAL: EventKind[] = ["lineup", "kickoff", "half_time", "second_half", "full_time", "var"];

/**
 * غرفة يوم المباراة.
 *
 * من هنا يُسجَّل ما يقع في الملعب، فيصل لحظتها إلى كل من ضغط «نبّهني».
 * الكتابة تمرّ بدالّة محروسة كبقية كتابات المشغّل — لا كتابة مباشرة على الجدول.
 */
export default function MatchdayPage() {
  const { t, locale } = useLocale();
  const { matches, status } = useCatalog();

  /* أول مباراة مختارة اشتقاقاً لا بأثر جانبي: الاختيار الفارغ يعني «الأولى» */
  const [picked, setPicked] = useState("");
  const [minute, setMinute] = useState(0);
  const [stoppage, setStoppage] = useState(0);
  const [kind, setKind] = useState<EventKind>("goal");
  const [side, setSide] = useState<Side>("home");
  const [playerAr, setPlayerAr] = useState("");
  const [playerEn, setPlayerEn] = useState("");
  const [detailAr, setDetailAr] = useState("");
  const [detailEn, setDetailEn] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const matchId = picked || matches[0]?.id || "";
  const setMatchId = setPicked;

  const { events } = useLiveEvents(matchId, false);
  const match = matches.find((m) => m.id === matchId);
  const score = scoreOf(events);
  const neutral = NEUTRAL.includes(kind);

  async function post(e: React.FormEvent) {
    e.preventDefault();
    if (busy || !matchId) return;

    setBusy(true);
    setError(null);
    try {
      const { error: failed } = await supabase().rpc("ops_add_match_event", {
        p_match_id: matchId,
        p_minute: minute,
        p_stoppage: stoppage,
        p_kind: kind,
        p_side: neutral ? null : side,
        p_player_ar: playerAr,
        p_player_en: playerEn,
        p_detail_ar: detailAr,
        p_detail_en: detailEn,
      });
      if (failed) throw failed;

      setPlayerAr("");
      setPlayerEn("");
      setDetailAr("");
      setDetailEn("");
    } catch {
      setError(t("md.failed"));
    } finally {
      setBusy(false);
    }
  }

  if (status === "loading") {
    return <p className="py-20 text-center text-sm text-text-dim">{t("dash.loading")}</p>;
  }

  return (
    <>
      <PageHeader title={t("md.title")} subtitle={t("md.subtitle")} />

      <div className="grid gap-5 lg:grid-cols-[1fr_1.1fr]">
        {/* --------------------------- تسجيل حدث --------------------------- */}
        <form onSubmit={post} className="card space-y-4 p-5">
          <div>
            <label htmlFor="match" className="label">
              {t("md.match")}
            </label>
            <select
              id="match"
              value={matchId}
              onChange={(e) => setMatchId(e.target.value)}
              className="input"
            >
              {matches.map((m) => (
                <option key={m.id} value={m.id}>
                  {matchHome(m, locale)} — {matchAway(m, locale)} · {matchDateTime(m.kickoff, locale)}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label htmlFor="minute" className="label">
                {t("md.minute")}
              </label>
              <input
                id="minute"
                type="number"
                min={0}
                max={130}
                value={minute}
                onChange={(e) => setMinute(Number(e.target.value))}
                className="input nums"
              />
            </div>
            <div>
              <label htmlFor="stoppage" className="label">
                {t("md.stoppage")}
              </label>
              <input
                id="stoppage"
                type="number"
                min={0}
                max={20}
                value={stoppage}
                onChange={(e) => setStoppage(Number(e.target.value))}
                className="input nums"
              />
            </div>
            <div>
              <label htmlFor="kind" className="label">
                {t("md.kind")}
              </label>
              <select
                id="kind"
                value={kind}
                onChange={(e) => setKind(e.target.value as EventKind)}
                className="input"
              >
                {KINDS.map((k) => (
                  <option key={k} value={k}>
                    {ICONS[k]} {k}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* الجهة تختفي لما لا يخصّ فريقاً: حقل بلا معنى يُملأ خطأً */}
          {!neutral && match && (
            <div>
              <span className="label">{t("md.side")}</span>
              <div className="inline-flex rounded-xl border border-line bg-surface-2 p-1">
                {(["home", "away"] as Side[]).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSide(s)}
                    aria-pressed={side === s}
                    className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                      side === s ? "bg-brand-wash text-brand" : "text-text-muted hover:text-text"
                    }`}
                  >
                    {s === "home" ? matchHome(match, locale) : matchAway(match, locale)}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="pAr" className="label">
                {t("md.playerAr")}
              </label>
              <input id="pAr" value={playerAr} onChange={(e) => setPlayerAr(e.target.value)} className="input" />
            </div>
            <div>
              <label htmlFor="pEn" className="label">
                {t("md.playerEn")}
              </label>
              <input id="pEn" value={playerEn} onChange={(e) => setPlayerEn(e.target.value)} className="input" dir="ltr" />
            </div>
            <div>
              <label htmlFor="dAr" className="label">
                {t("md.detailAr")}
              </label>
              <input id="dAr" value={detailAr} onChange={(e) => setDetailAr(e.target.value)} className="input" />
            </div>
            <div>
              <label htmlFor="dEn" className="label">
                {t("md.detailEn")}
              </label>
              <input id="dEn" value={detailEn} onChange={(e) => setDetailEn(e.target.value)} className="input" dir="ltr" />
            </div>
          </div>

          {error && (
            <p role="alert" className="rounded-lg bg-danger-wash px-3 py-2 text-[13px] text-danger">
              {error}
            </p>
          )}

          <button type="submit" disabled={busy || !matchId} className="btn btn-primary w-full py-3">
            {busy ? t("md.sending") : t("md.publish")}
          </button>
          <p className="text-[11px] text-text-dim">{t("md.note")}</p>
        </form>

        {/* --------------------------- ما نُشر --------------------------- */}
        <section className="card p-5">
          {match && (
            <div className="flex items-baseline justify-between gap-3 border-b border-line pb-3">
              <h2 className="font-bold text-text">
                {matchHome(match, locale)} — {matchAway(match, locale)}
              </h2>
              <span className="nums text-xl font-bold text-brand">
                {score.home} – {score.away}
              </span>
            </div>
          )}
          {match && <p className="mt-1 text-[11px] text-text-dim">{matchStage(match, locale)}</p>}

          {events.length === 0 ? (
            <p className="py-10 text-center text-sm text-text-dim">{t("md.empty")}</p>
          ) : (
            <ul className="mt-3 max-h-[28rem] space-y-2 overflow-y-auto">
              {[...events].reverse().map((e) => (
                <li key={e.id} className="flex items-start gap-2.5 border-b border-line pb-2 text-sm">
                  <span aria-hidden>{ICONS[e.kind]}</span>
                  <span className="nums text-[12px] font-bold text-brand">{clockLabel(e)}</span>
                  <span className="min-w-0 flex-1">
                    <span className="font-semibold text-text">{eventPlayer(e, locale) || e.kind}</span>
                    {eventDetail(e, locale) && (
                      <span className="block text-[12px] text-text-muted">{eventDetail(e, locale)}</span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}

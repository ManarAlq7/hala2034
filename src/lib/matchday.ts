"use client";

import { useCallback, useEffect, useState } from "react";
import { notifyStatus } from "./notify";
import { hasSupabase, supabase } from "./supabase";
import type { Locale } from "./types";

/* -------------------------------------------------------------------------- */
/*  يوم المباراة: التشكيلة والأحداث والتنبيه                                    */
/*                                                                             */
/*  الحدث سطر لا حالة: الهدف في الدقيقة ٦٧ يبقى في الدقيقة ٦٧ مهما جرى بعده.    */
/*  والنتيجة تُحسب من الأحداث ولا تُخزَّن بجانبها — رقمان يصفان الشيء نفسه         */
/*  يفترقان يوماً، والمصدر الواحد لا يفترق عن نفسه.                              */
/* -------------------------------------------------------------------------- */

export type EventKind =
  | "lineup"
  | "kickoff"
  | "goal"
  | "own_goal"
  | "penalty"
  | "yellow"
  | "red"
  | "substitution"
  | "half_time"
  | "second_half"
  | "full_time"
  | "var";

export type Side = "home" | "away";

export interface MatchEvent {
  id: number;
  matchId: string;
  minute: number;
  stoppage: number;
  kind: EventKind;
  side: Side | null;
  playerAr: string | null;
  playerEn: string | null;
  detailAr: string | null;
  detailEn: string | null;
}

export interface LineupPlayer {
  n: number;
  pos: string;
  ar: string;
  en: string;
}

export interface Lineup {
  formation: string;
  players: LineupPlayer[];
}

interface EventRow {
  id: number;
  match_id: string;
  minute: number;
  stoppage: number;
  kind: EventKind;
  side: Side | null;
  player_ar: string | null;
  player_en: string | null;
  detail_ar: string | null;
  detail_en: string | null;
}

const toEvent = (row: EventRow): MatchEvent => ({
  id: row.id,
  matchId: row.match_id,
  minute: row.minute,
  stoppage: row.stoppage,
  kind: row.kind,
  side: row.side,
  playerAr: row.player_ar,
  playerEn: row.player_en,
  detailAr: row.detail_ar,
  detailEn: row.detail_en,
});

export const eventPlayer = (e: MatchEvent, locale: Locale) =>
  (locale === "ar" ? e.playerAr : e.playerEn) ?? "";
export const eventDetail = (e: MatchEvent, locale: Locale) =>
  (locale === "ar" ? e.detailAr : e.detailEn) ?? "";

/** الأحداث التي ترفع النتيجة — ملخّصة في مكان واحد فلا تُنسى واحدة عند الإضافة */
const SCORING: EventKind[] = ["goal", "penalty"];

/**
 * النتيجة من الأحداث.
 *
 * الهدف العكسي يُحسب للفريق الآخر: من سجّله ليس من استفاد منه.
 */
export function scoreOf(events: MatchEvent[]): { home: number; away: number } {
  let home = 0;
  let away = 0;

  for (const e of events) {
    if (!e.side) continue;
    if (SCORING.includes(e.kind)) {
      if (e.side === "home") home += 1;
      else away += 1;
    } else if (e.kind === "own_goal") {
      if (e.side === "home") away += 1;
      else home += 1;
    }
  }

  return { home, away };
}

/** الدقيقة كما تُقرأ: ٤٥+٢ لا ٤٧ */
export const clockLabel = (e: MatchEvent) =>
  e.stoppage > 0 ? `${e.minute}+${e.stoppage}'` : `${e.minute}'`;

export const ICONS: Record<EventKind, string> = {
  lineup: "📋",
  kickoff: "🕐",
  goal: "⚽",
  own_goal: "🥅",
  penalty: "🎯",
  yellow: "🟨",
  red: "🟥",
  substitution: "🔁",
  half_time: "⏸",
  second_half: "▶️",
  full_time: "🏁",
  var: "📺",
};

/** الأحداث التي تستحق إشعاراً — لا تُنبَّه الهواتف بكل تمريرة */
const NOTIFY: EventKind[] = ["goal", "own_goal", "penalty", "red", "lineup", "kickoff", "full_time"];

/* --------------------------------- القراءة --------------------------------- */

export async function fetchEvents(matchId: string): Promise<MatchEvent[]> {
  if (!hasSupabase) return [];
  const { data, error } = await supabase()
    .from("match_events")
    .select("*")
    .eq("match_id", matchId)
    .order("id");
  if (error) throw error;
  return ((data ?? []) as EventRow[]).map(toEvent);
}

export async function fetchLineups(
  matchId: string,
): Promise<{ home: Lineup | null; away: Lineup | null }> {
  if (!hasSupabase) return { home: null, away: null };
  const { data, error } = await supabase()
    .from("matches")
    .select("lineup_home, lineup_away")
    .eq("id", matchId)
    .single();
  if (error) throw error;

  const row = data as { lineup_home: Lineup | null; lineup_away: Lineup | null };
  return { home: row.lineup_home, away: row.lineup_away };
}

/* -------------------------------- المتابعة -------------------------------- */

const FOLLOW_KEY = "hala.following.v1";

function readFollowing(): string[] {
  try {
    const raw = window.localStorage.getItem(FOLLOW_KEY);
    const parsed = raw ? (JSON.parse(raw) as string[]) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

const followListeners = new Set<() => void>();

export function toggleFollow(matchId: string): boolean {
  const list = readFollowing();
  const next = list.includes(matchId) ? list.filter((id) => id !== matchId) : [...list, matchId];
  try {
    window.localStorage.setItem(FOLLOW_KEY, JSON.stringify(next));
  } catch {
    // بلا تخزين تبقى المتابعة فاعلة في هذه الجلسة وحدها
  }
  for (const fn of followListeners) fn();
  return next.includes(matchId);
}

export function useFollowing(matchId: string) {
  const [following, setFollowing] = useState(false);

  useEffect(() => {
    const sync = () => setFollowing(readFollowing().includes(matchId));
    sync();
    followListeners.add(sync);
    return () => {
      followListeners.delete(sync);
    };
  }, [matchId]);

  return following;
}

/* ------------------------------ البثّ اللحظي ------------------------------ */

/**
 * أحداث مباراة واحدة، حيّة.
 *
 * الاشتراك مرشَّح بالمباراة على الخادم: من يتابع مباراة لا يستيقظ جهازه لأخرى.
 * والتنبيه لا يُطلق عند أول تحميل — من فتح الصفحة الآن لا يريد عشرة إشعارات
 * عن أهداف وقعت قبل وصوله.
 */
export function useLiveEvents(matchId: string, notifyOn: boolean) {
  const [events, setEvents] = useState<MatchEvent[]>([]);
  const [loaded, setLoaded] = useState(false);

  const announce = useCallback(
    (event: MatchEvent) => {
      if (!notifyOn || !NOTIFY.includes(event.kind)) return;
      const title = `${ICONS[event.kind]} ${event.playerAr ?? ""}`.trim();
      notifyStatus(title || "HALA 2034", event.detailAr ?? clockLabel(event));
    },
    [notifyOn],
  );

  useEffect(() => {
    if (!matchId || !hasSupabase) return;
    let alive = true;

    void fetchEvents(matchId)
      .then((list) => {
        if (!alive) return;
        setEvents(list);
        setLoaded(true);
      })
      .catch(() => {
        if (alive) setLoaded(true);
      });

    const channel = supabase()
      .channel(`match-${matchId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "match_events",
          filter: `match_id=eq.${matchId}`,
        },
        (payload) => {
          if (!alive) return;
          const incoming = toEvent(payload.new as EventRow);
          setEvents((prev) => (prev.some((e) => e.id === incoming.id) ? prev : [...prev, incoming]));
          announce(incoming);
        },
      )
      .subscribe();

    return () => {
      alive = false;
      void supabase().removeChannel(channel);
    };
  }, [matchId, announce]);

  return { events, loaded };
}

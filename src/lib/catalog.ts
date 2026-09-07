"use client";

import { useEffect, useState } from "react";
import { hasSupabase, supabase } from "./supabase";
import type { Locale } from "./types";

/* -------------------------------------------------------------------------- */
/*  دليل الحدث: الملاعب، المباريات، التذاكر، مناطق المشجعين                     */
/*                                                                             */
/*  بيانات مرجعية ثابتة تُقرأ ولا تُكتب من المتصفح. الحجز وحده يكتب، وهو يمر     */
/*  عبر دالة في قاعدة البيانات لا عبر جدول مفتوح — فلا يملك أحد أن يرفع عدد     */
/*  المقاعد المتاحة أو يغيّر سعراً من واجهة المتصفح.                              */
/* -------------------------------------------------------------------------- */

export interface Venue {
  id: string;
  nameAr: string;
  nameEn: string;
  cityAr: string;
  cityEn: string;
  /** السعة المعلنة تقديرية — تُعرض موسومة بذلك */
  capacity: number;
  lat: number | null;
  lng: number | null;
  /** موقع فعليّ للمبنى، أم موقع المشروع لما لم يُبنَ بعد؟ */
  precise: boolean;
}

export interface Match {
  id: string;
  venueId: string;
  stageAr: string;
  stageEn: string;
  group: string | null;
  homeAr: string;
  homeEn: string;
  homeFlag: string;
  awayAr: string;
  awayEn: string;
  awayFlag: string;
  /** موعد الانطلاق بملّي ثانية منذ الحقبة */
  kickoff: number;
}

export interface TicketTier {
  id: string;
  matchId: string;
  nameAr: string;
  nameEn: string;
  priceSar: number;
  capacity: number;
  sold: number;
}

export interface FanZone {
  id: string;
  nameAr: string;
  nameEn: string;
  cityAr: string;
  cityEn: string;
  aboutAr: string;
  aboutEn: string;
  capacity: number;
  /** مفاتيح المزايا — الأسماء والأيقونات في lib/zones */
  amenities: string[];
  lat: number | null;
  lng: number | null;
  precise: boolean;
  opensAt: string;
  closesAt: string;
  featuresAr: string[];
  featuresEn: string[];
}

export interface Booking {
  id: string;
  matchId: string;
  tierId: string;
  quantity: number;
  holderName: string;
  totalSar: number;
}

export const remaining = (tier: TicketTier) => Math.max(0, tier.capacity - tier.sold);

export const venueName = (venue: Venue, locale: Locale) =>
  locale === "en" ? venue.nameEn : venue.nameAr;
export const venueCity = (venue: Venue, locale: Locale) =>
  locale === "en" ? venue.cityEn : venue.cityAr;
export const matchStage = (match: Match, locale: Locale) =>
  locale === "en" ? match.stageEn : match.stageAr;
export const matchHome = (match: Match, locale: Locale) =>
  locale === "en" ? match.homeEn : match.homeAr;
export const matchAway = (match: Match, locale: Locale) =>
  locale === "en" ? match.awayEn : match.awayAr;
export const tierName = (tier: TicketTier, locale: Locale) =>
  locale === "en" ? tier.nameEn : tier.nameAr;
export const zoneName = (zone: FanZone, locale: Locale) =>
  locale === "en" ? zone.nameEn : zone.nameAr;
export const zoneCity = (zone: FanZone, locale: Locale) =>
  locale === "en" ? zone.cityEn : zone.cityAr;
export const zoneAbout = (zone: FanZone, locale: Locale) =>
  locale === "en" ? zone.aboutEn : zone.aboutAr;
export const zoneFeatures = (zone: FanZone, locale: Locale) =>
  locale === "en" ? zone.featuresEn : zone.featuresAr;

/* --------------------------------- القراءة --------------------------------- */

interface VenueRow {
  id: string;
  name_ar: string;
  name_en: string;
  city_ar: string;
  city_en: string;
  capacity: number;
  lat: number | null;
  lng: number | null;
  precise: boolean;
}

interface MatchRow {
  id: string;
  venue_id: string;
  stage_ar: string;
  stage_en: string;
  group_label: string | null;
  home_ar: string;
  home_en: string;
  home_flag: string;
  away_ar: string;
  away_en: string;
  away_flag: string;
  kickoff: string;
}

interface TierRow {
  id: string;
  match_id: string;
  name_ar: string;
  name_en: string;
  price_sar: number;
  capacity: number;
  sold: number;
}

interface ZoneRow {
  id: string;
  name_ar: string;
  name_en: string;
  city_ar: string;
  city_en: string;
  about_ar: string;
  about_en: string;
  capacity: number;
  opens_at: string;
  closes_at: string;
  features_ar: string[] | null;
  features_en: string[] | null;
  amenities: string[] | null;
  lat: number | null;
  lng: number | null;
  precise: boolean;
}

export interface Catalog {
  venues: Venue[];
  matches: Match[];
  tiers: TicketTier[];
  zones: FanZone[];
}

const EMPTY_CATALOG: Catalog = { venues: [], matches: [], tiers: [], zones: [] };

export async function fetchCatalog(): Promise<Catalog> {
  const db = supabase();

  const [venueRes, matchRes, tierRes, zoneRes] = await Promise.all([
    db.from("venues").select("*").order("sort_order"),
    db.from("matches").select("*").order("kickoff"),
    db.from("ticket_tiers").select("*").order("sort_order"),
    db.from("fan_zones").select("*").order("sort_order"),
  ]);

  const firstError = venueRes.error ?? matchRes.error ?? tierRes.error ?? zoneRes.error;
  if (firstError) throw firstError;

  return {
    venues: (venueRes.data as VenueRow[]).map((v) => ({
      id: v.id,
      nameAr: v.name_ar,
      nameEn: v.name_en,
      cityAr: v.city_ar,
      cityEn: v.city_en,
      capacity: v.capacity,
      lat: v.lat,
      lng: v.lng,
      precise: v.precise,
    })),
    matches: (matchRes.data as MatchRow[]).map((m) => ({
      id: m.id,
      venueId: m.venue_id,
      stageAr: m.stage_ar,
      stageEn: m.stage_en,
      group: m.group_label,
      homeAr: m.home_ar,
      homeEn: m.home_en,
      homeFlag: m.home_flag,
      awayAr: m.away_ar,
      awayEn: m.away_en,
      awayFlag: m.away_flag,
      kickoff: new Date(m.kickoff).getTime(),
    })),
    tiers: (tierRes.data as TierRow[]).map((t) => ({
      id: t.id,
      matchId: t.match_id,
      nameAr: t.name_ar,
      nameEn: t.name_en,
      priceSar: t.price_sar,
      capacity: t.capacity,
      sold: t.sold,
    })),
    zones: (zoneRes.data as ZoneRow[]).map((z) => ({
      id: z.id,
      nameAr: z.name_ar,
      nameEn: z.name_en,
      cityAr: z.city_ar,
      cityEn: z.city_en,
      aboutAr: z.about_ar,
      aboutEn: z.about_en,
      capacity: z.capacity,
      amenities: z.amenities ?? [],
      opensAt: z.opens_at,
      closesAt: z.closes_at,
      featuresAr: z.features_ar ?? [],
      featuresEn: z.features_en ?? [],
      lat: z.lat,
      lng: z.lng,
      precise: z.precise,
    })),
  };
}

export type CatalogStatus = "loading" | "ready" | "unavailable";

export interface UseCatalog extends Catalog {
  status: CatalogStatus;
  reload: () => void;
}

/**
 * تحميل الدليل مرة واحدة لكل صفحة.
 *
 * بلا قاعدة بيانات مهيّأة تعود الحالة `unavailable` بدل بيانات مُختلقة: صفحة
 * تذاكر تعرض مباريات لا وجود لها في أي مكان أسوأ من صفحة تقول إنها غير متاحة.
 */
export function useCatalog(): UseCatalog {
  const [catalog, setCatalog] = useState<Catalog>(EMPTY_CATALOG);
  const [status, setStatus] = useState<CatalogStatus>(hasSupabase ? "loading" : "unavailable");
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    if (!hasSupabase) return;
    let alive = true;

    fetchCatalog()
      .then((data) => {
        if (!alive) return;
        setCatalog(data);
        setStatus("ready");
      })
      .catch(() => {
        if (alive) setStatus("unavailable");
      });

    return () => {
      alive = false;
    };
  }, [nonce]);

  return { ...catalog, status, reload: () => setNonce((n) => n + 1) };
}

/* --------------------------------- الحجز --------------------------------- */

export type BookingError = "sold_out" | "invalid" | "unavailable";

interface BookingRow {
  id: string;
  match_id: string;
  tier_id: string;
  quantity: number;
  holder_name: string;
  total_sar: number;
}

/**
 * حجز تذاكر عبر دالة قاعدة البيانات.
 *
 * الدالة تقفل صف الفئة قبل قراءة المتاح، فلا يبيع طلبان متزامنان آخر مقعد
 * مرتين. أي فشل يعود مصنّفاً لا نصّاً، فالصياغة مسؤولية الواجهة.
 */
export async function bookTickets(
  tierId: string,
  quantity: number,
  holderName: string,
): Promise<Booking | BookingError> {
  if (!hasSupabase) return "unavailable";

  const { data, error } = await supabase().rpc("book_tickets", {
    p_tier_id: tierId,
    p_quantity: quantity,
    p_holder_name: holderName,
  });

  if (error) {
    if (error.message.includes("sold_out")) return "sold_out";
    if (error.message.includes("invalid_quantity") || error.message.includes("missing_holder")) {
      return "invalid";
    }
    return "unavailable";
  }

  const row = (Array.isArray(data) ? data[0] : data) as BookingRow | null;
  if (!row) return "unavailable";

  return {
    id: row.id,
    matchId: row.match_id,
    tierId: row.tier_id,
    quantity: row.quantity,
    holderName: row.holder_name,
    totalSar: row.total_sar,
  };
}

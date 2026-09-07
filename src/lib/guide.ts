import type { Catalog, FanZone, Match, Venue } from "./catalog";
import { AMENITIES } from "./zones";

/* -------------------------------------------------------------------------- */
/*  مرشد الحدث                                                                 */
/*                                                                             */
/*  يسأل المشجّع بلغته: «وين أشوف مباراة السعودية؟» أو «أي منطقة فيها مصلّى؟»،   */
/*  فيُجاب بجواب قصير وروابط تأخذه إلى الصفحة نفسها لا إلى قائمة.                */
/*                                                                             */
/*  الجواب يُبنى على الدليل الحقيقي دائماً — الملاعب والمباريات والمناطق          */
/*  ومزاياها — لا على ما يعرفه النموذج. فما لا يوجد في الدليل لا يُقال، ولا       */
/*  يُخترع ملعبٌ أو موعد.                                                        */
/*                                                                             */
/*  ومسلكان: النموذج اللغوي إن توفّر مفتاحه، ومحرّك محلي إن لم يتوفّر. المحلي      */
/*  ليس اعتذاراً — يجيب أكثر ما يُسأل عنه بلا شبكة ولا مفتاح.                     */
/* -------------------------------------------------------------------------- */

export interface GuideLink {
  label: string;
  href: string;
}

export interface GuideAnswer {
  text: string;
  links: GuideLink[];
  /** أي مسلك أنتج الجواب — تعرضه الواجهة بصراحة */
  source: "claude" | "local";
}

/* ----------------------------- سياق الدليل ----------------------------- */

/**
 * الدليل مختصراً للنموذج.
 *
 * كل سطر يحمل المعرّف الذي يُبنى منه الرابط، فيستطيع النموذج أن يشير إلى صفحة
 * بعينها بدل أن يصف مكاناً ويترك المشجّع يبحث عنه.
 */
export function catalogContext(catalog: Catalog): string {
  const venues = catalog.venues
    .map(
      (v) =>
        `- [${v.id}] ${v.nameEn} / ${v.nameAr} — ${v.cityEn} / ${v.cityAr} — capacity ${v.capacity}`,
    )
    .join("\n");

  const matches = catalog.matches
    .slice(0, 16)
    .map((m) => {
      const venue = catalog.venues.find((v) => v.id === m.venueId);
      return `- [${m.id}] ${m.homeEn} vs ${m.awayEn} / ${m.homeAr} ضد ${m.awayAr} — ${new Date(
        m.kickoff,
      ).toISOString()} — ${venue?.nameEn ?? m.venueId} [${m.venueId}]`;
    })
    .join("\n");

  const zones = catalog.zones
    .map((z) => {
      const names = z.amenities
        .map((key) => AMENITIES.find((a) => a.key === key)?.en)
        .filter(Boolean)
        .join(", ");
      return `- [${z.id}] ${z.nameEn} / ${z.nameAr} — ${z.cityEn} / ${z.cityAr} — ${z.opensAt}-${z.closesAt} — holds ${z.capacity} — amenities: ${names}`;
    })
    .join("\n");

  return `STADIUMS\n${venues}\n\nMATCHES\n${matches}\n\nFAN ZONES\n${zones}`;
}

/** الروابط المسموح للنموذج أن يشير إليها — بلا هذا يخترع مسارات لا وجود لها */
export const ROUTE_RULES = `Allowed link targets, and nothing else:
- /venues/<STADIUM_ID>   a stadium page
- /fan-zones/<ZONE_ID>   a fan zone page
- /matches/<MATCH_ID>    a match page with live events and line-ups
- /tickets               booking
- /fan-zones             all fan zones
- /report                report something that needs attention
- /track                 track a report by its code
- /account               the fan's tickets and reports`;

/* --------------------------- المحرّك المحلي --------------------------- */

const norm = (s: string) =>
  s
    .toLowerCase()
    .replace(/[ً-ْ]/g, "")
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي");

/** هل يذكر النصّ أياً من هذه الكلمات؟ */
const mentions = (text: string, words: string[]) => words.some((w) => text.includes(norm(w)));

const AMENITY_WORDS: Record<string, string[]> = {
  prayer: ["مصلى", "صلاة", "prayer", "mosque", "rezo", "prière"],
  family: ["عائل", "اطفال", "family", "kids", "niños", "famille"],
  kids: ["اطفال", "العاب", "kids", "children", "play"],
  food: ["اكل", "طعام", "مطعم", "food", "eat", "comida", "manger"],
  cafe: ["قهوه", "كافيه", "cafe", "coffee"],
  parking: ["مواقف", "موقف", "سياره", "parking", "car", "aparcamiento"],
  metro: ["مترو", "قطار", "metro", "train", "subway"],
  accessible: ["اعاقه", "كرسي", "متحرك", "accessible", "wheelchair", "disabled"],
  first_aid: ["اسعاف", "طبي", "first aid", "medic", "doctor"],
  wifi: ["واي فاي", "انترنت", "wifi", "internet"],
  water: ["ماء", "مياه", "water", "agua"],
  shade: ["ظل", "مظله", "تبريد", "shade", "cool"],
  restrooms: ["دوره مياه", "حمام", "توالet", "restroom", "toilet", "bathroom"],
  seaview: ["بحر", "شاطئ", "sea", "beach", "waterfront"],
  giant_screen: ["شاشه", "شاشات", "screen", "pantalla", "écran"],
};

const cityOf = (place: Venue | FanZone) => `${norm(place.cityAr)} ${norm(place.cityEn)}`;

const matchNames = (m: Match) =>
  norm(`${m.homeAr} ${m.homeEn} ${m.awayAr} ${m.awayEn}`);

/**
 * جواب بلا نموذج لغوي.
 *
 * لا يفهم كل صياغة، لكنه يفهم ما يُسأل عنه فعلاً: مباراة بعينها، منطقة فيها
 * ميزة، ما يُلعب في مدينة، وكيف أبلّغ. وما عجز عنه يقوله صراحةً ويعرض المداخل
 * بدل أن يخمّن.
 */
export function answerLocally(
  question: string,
  catalog: Catalog,
  locale: string,
): GuideAnswer {
  const ar = locale === "ar";
  const q = norm(question);
  const links: GuideLink[] = [];

  /* مباراة بالاسم */
  const match = catalog.matches.find((m) =>
    matchNames(m)
      .split(/\s+/)
      .filter((w) => w.length > 3)
      .some((w) => q.includes(w)),
  );

  if (match) {
    const venue = catalog.venues.find((v) => v.id === match.venueId);
    const zones = catalog.zones.filter((z) => z.cityEn === venue?.cityEn);

    links.push({
      label: ar ? "تفاصيل المباراة" : "Match details",
      href: `/matches/${match.id}`,
    });
    if (venue) {
      links.push({
        label: ar ? venue.nameAr : venue.nameEn,
        href: `/venues/${venue.id}`,
      });
    }
    for (const z of zones.slice(0, 2)) {
      links.push({ label: ar ? z.nameAr : z.nameEn, href: `/fan-zones/${z.id}` });
    }

    const when = new Date(match.kickoff).toLocaleString(ar ? "ar-u-ca-gregory-nu-latn" : "en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      hour: "2-digit",
      minute: "2-digit",
    });

    return {
      source: "local",
      links,
      text: ar
        ? `${match.homeAr} ضد ${match.awayAr} — ${when} في ${venue?.nameAr ?? ""}${
            zones.length ? `. وإن لم تكن معك تذكرة، تُعرض في مناطق المشجعين بـ${venue?.cityAr}.` : "."
          }`
        : `${match.homeEn} vs ${match.awayEn} — ${when} at ${venue?.nameEn ?? ""}${
            zones.length ? `. Without a ticket, it is shown at the fan zones in ${venue?.cityEn}.` : "."
          }`,
    };
  }

  /*
   * منطقة فيها ما يحتاجه.
   *
   * كل ما ذُكر لا أوّل ما ذُكر: من سأل عن «مصلّى ومواقف» يريد الاثنين معاً،
   * والردّ بقائمة كل ما فيه مصلّى يتجاهل نصف سؤاله.
   */
  const wanted = Object.entries(AMENITY_WORDS)
    .filter(([, words]) => mentions(q, words))
    .map(([key]) => key);

  if (wanted.length > 0) {
    const found = catalog.zones.filter((z) => wanted.every((key) => z.amenities.includes(key)));
    const names = wanted
      .map((key) => AMENITIES.find((a) => a.key === key))
      .map((a) => (ar ? a?.ar : a?.en))
      .filter(Boolean);
    const wantedLabel = names.join(ar ? " و" : " and ");

    if (found.length > 0) {
      for (const z of found.slice(0, 4)) {
        links.push({ label: ar ? z.nameAr : z.nameEn, href: `/fan-zones/${z.id}` });
      }
      return {
        source: "local",
        links,
        text: ar
          ? `${found.length} من مناطق المشجعين فيها ${wantedLabel}: ${found
              .map((z) => `${z.nameAr} (${z.cityAr})`)
              .join("، ")}.`
          : `${found.length} fan zone(s) have ${wantedLabel}: ${found
              .map((z) => `${z.nameEn} (${z.cityEn})`)
              .join(", ")}.`,
      };
    }

    /* لا منطقة تجمعها كلها — يُقال ذلك، ويُعرض ما يقارب */
    if (wanted.length > 1) {
      const partial = catalog.zones.filter((z) => wanted.some((key) => z.amenities.includes(key)));
      for (const z of partial.slice(0, 3)) {
        links.push({ label: ar ? z.nameAr : z.nameEn, href: `/fan-zones/${z.id}` });
      }
      return {
        source: "local",
        links,
        text: ar
          ? `ما فيه منطقة تجمع ${wantedLabel} معاً. أقرب ما يوجد:`
          : `No single zone has ${wantedLabel} together. The closest are:`,
      };
    }
  }

  /* كل ما في مدينة */
  const city = [...catalog.venues, ...catalog.zones].find((p) =>
    cityOf(p)
      .split(/\s+/)
      .filter((w) => w.length > 2)
      .some((w) => q.includes(w)),
  );

  if (city) {
    const cityEn = city.cityEn;
    const venues = catalog.venues.filter((v) => v.cityEn === cityEn);
    const zones = catalog.zones.filter((z) => z.cityEn === cityEn);

    for (const v of venues.slice(0, 3)) {
      links.push({ label: ar ? v.nameAr : v.nameEn, href: `/venues/${v.id}` });
    }
    for (const z of zones.slice(0, 3)) {
      links.push({ label: ar ? z.nameAr : z.nameEn, href: `/fan-zones/${z.id}` });
    }

    return {
      source: "local",
      links,
      text: ar
        ? `في ${city.cityAr}: ${venues.length} ملعب و${zones.length} من مناطق المشجعين.`
        : `In ${cityEn}: ${venues.length} stadium(s) and ${zones.length} fan zone(s).`,
    };
  }

  /* نوايا ثابتة */
  if (mentions(q, ["تذكره", "تذاكر", "حجز", "ticket", "book", "entrada", "billet"])) {
    return {
      source: "local",
      links: [{ label: ar ? "احجز تذكرة" : "Book a ticket", href: "/tickets" }],
      text: ar
        ? "الحجز من صفحة التذاكر: تختار المباراة والفئة ويصلك رمز الحجز فوراً."
        : "Booking is on the tickets page: pick a match and a category, and your reference arrives at once.",
    };
  }

  if (mentions(q, ["بلاغ", "ابلغ", "شكوى", "مشكله", "report", "complain", "problema"])) {
    return {
      source: "local",
      links: [
        { label: ar ? "أرسل بلاغاً" : "File a report", href: "/report" },
        { label: ar ? "تتبّع بلاغاً" : "Track a report", href: "/track" },
      ],
      text: ar
        ? "أرسل بلاغك من صفحة البلاغ ويصل للفريق المسؤول فوراً، ويعطيك رمزاً تتابع به الحالة."
        : "Send it from the report page and it reaches the right team at once, with a code to follow it.",
    };
  }

  if (mentions(q, ["منطقه", "مناطق", "اشاهد", "اشوف", "zone", "watch", "fan zone"])) {
    return {
      source: "local",
      links: [{ label: ar ? "مناطق المشجعين" : "Fan zones", href: "/fan-zones" }],
      text: ar
        ? "مناطق المشجعين تعرض المباريات على شاشات كبيرة خارج الملاعب، ولكل منطقة مزاياها وأوقات فتحها."
        : "Fan zones show the matches on big screens outside the stadiums, each with its own amenities and hours.",
    };
  }

  /* لم يُفهم: تُعرض المداخل بدل التخمين */
  return {
    source: "local",
    links: [
      { label: ar ? "المباريات والتذاكر" : "Matches and tickets", href: "/tickets" },
      { label: ar ? "مناطق المشجعين" : "Fan zones", href: "/fan-zones" },
      { label: ar ? "أرسل بلاغاً" : "File a report", href: "/report" },
    ],
    text: ar
      ? "ما فهمت السؤال تماماً. جرّب تسأل عن مباراة بالاسم، أو عن منطقة فيها ميزة تحتاجها — مثل «أي منطقة فيها مصلّى؟»."
      : "I did not quite catch that. Try naming a match, or asking for a zone with something you need — like “which zone has a prayer area?”.",
  };
}

import { test } from "node:test";
import assert from "node:assert/strict";
import {
  CLUSTER_WINDOW_MS,
  classifyLocal,
  detectLang,
  escalate,
  findOrCreateCluster,
  subtypeCategory,
  zoneHeat,
} from "./ai.ts";
import type { Classification, Cluster, Report } from "./types.ts";

/* -------------------------------------------------------------------------- */
/*  اختبارات محرك التصنيف والتجميع                                              */
/*  التشغيل: npm test                                                          */
/* -------------------------------------------------------------------------- */

const cls = (text: string, zone = "gate_b") => classifyLocal(text, zone);

/* -------------------------------- كشف اللغة -------------------------------- */

test("يكشف اللغة من النظام الكتابي", () => {
  assert.equal(detectLang("الزحمة شديدة عند البوابة"), "ar");
  assert.equal(detectLang("The queue is very long"), "en");
  assert.equal(detectLang("Hay mucha gente en la puerta"), "es");
  assert.equal(detectLang("ゲートが混雑しています"), "ja");
  assert.equal(detectLang("Очень много людей"), "ru");
});

/* -------------------------------- التصنيف -------------------------------- */

test("يصنّف البلاغات إلى الأنواع الفرعية الصحيحة", () => {
  assert.equal(cls("الزحمة شديدة جداً عند البوابة B").subtype, "crowding:congestion");
  assert.equal(cls("الطابور طويل والصف ما يتحرك").subtype, "crowding:congestion");
  assert.equal(cls("المصعد معطل").subtype, "facilities:elevator");
  assert.equal(cls("المقاعد مكسورة في الصف الأخير").subtype, "facilities:seating");
  // ذِكر المرفق صراحةً أدلّ من وصف الاتساخ، وكلا التصنيفين لدى «خدمات الموقع»
  assert.equal(cls("دورات المياه وسخة").subtype, "facilities:toilet");
  assert.equal(cls("بقايا ومهملات على الأرض").category, "cleanliness");
  assert.equal(cls("التذكرة ما تنقرأ الباركود").subtype, "ticketing:entry");
});

test("يحسم التعادل لصالح العبارة الأدلّ لا لترتيب القائمة", () => {
  // «خلص الاكل» عبارة أطول وأدلّ من «طوابير»، فالمشكلة نفاد الطعام لا الازدحام
  assert.equal(cls("خلص الأكل في أغلب المطاعم والطوابير طويلة").subtype, "food:availability");
  // «دورات المياه» أدلّ من «وسخ» و«رائحة» على أن المشكلة في المرفق نفسه
  assert.equal(cls("دورات المياه في الممرات وسخة والرائحة مزعجة").subtype, "facilities:toilet");
});

test("يصنّف نفس المشكلة بلغات مختلفة إلى نفس النوع الفرعي", () => {
  // هذه هي ميزة النظام الأساسية: التجميع عبر اللغات
  const ar = cls("المصعد معطل وما نقدر نوصل للدور الثاني");
  const en = cls("The elevator is broken and we cannot reach the second floor");
  assert.equal(ar.subtype, "facilities:elevator");
  assert.equal(en.subtype, "facilities:elevator");
  assert.equal(ar.subtype, en.subtype);

  const arQueue = cls("الطابور طويل جداً وواقفين من نص ساعة");
  const enQueue = cls("The queue is extremely long and not moving");
  assert.equal(arQueue.subtype, enQueue.subtype);
  assert.equal(arQueue.subtype, "crowding:congestion");
});

test("يميّز مشكلتين مختلفتين داخل نفس الفئة", () => {
  // الخلل الذي كان قائماً: الاثنان كانا يندمجان تحت فئة «مرافق»
  const elevator = cls("المصعد معطل في الممرات");
  const seating = cls("المقاعد مكسورة في الممرات الداخلية");
  assert.equal(elevator.category, seating.category, "نفس الفئة العامة");
  assert.notEqual(elevator.subtype, seating.subtype, "نوعان فرعيان مختلفان");
});

test("يعطي البلاغات الطبية والأمنية حداً أدنى من الخطورة", () => {
  assert.equal(cls("شخص أُغمي عليه ونحتاج إسعاف").severity, "critical");
  assert.equal(cls("فيه دخان وحريق").severity, "critical");
  assert.equal(cls("فيه مشاجرة بين مجموعة").severity, "high");
  assert.equal(cls("طفل مفقود").severity, "critical");
});

test("يخفض الخطورة للاقتراحات والملاحظات البسيطة", () => {
  assert.equal(cls("اقتراح بسيط: زيدوا اللوحات الإرشادية").severity, "low");
});

test("يستخرج الموقع من نص البلاغ ويتجاوز الموقع المُرسل", () => {
  const c = cls("الزحمة شديدة في محطة القطار", "gate_a");
  assert.equal(c.zoneId, "metro");
});

test("يستخدم الموقع المُرسل حين لا يُذكر موقع في النص", () => {
  const c = cls("المكيف معطل", "gate_c");
  assert.equal(c.zoneId, "gate_c");
});

test("يعيد ملاحظة عامة حين لا يطابق أي قاموس", () => {
  const c = cls("شكراً لكم على التنظيم");
  assert.equal(c.subtype, "other:general");
  assert.equal(c.category, "other");
});

test("يعلّم النتيجة بمصدر المحرك", () => {
  assert.equal(cls("الزحمة شديدة").source, "local");
});

test("تشتق الفئة من النوع الفرعي", () => {
  assert.equal(subtypeCategory("facilities:elevator"), "facilities");
  assert.equal(subtypeCategory("medical:emergency"), "medical");
  assert.equal(subtypeCategory("نوع غير موجود"), "other");
});

/* -------------------------------- التجميع -------------------------------- */

const makeCluster = (over: Partial<Cluster> = {}): Cluster => ({
  id: "CL-0001",
  title: "اختبار",
  subtype: "facilities:elevator",
  category: "facilities",
  zoneId: "concourse",
  severity: "medium",
  status: "new",
  reportIds: ["R-0001"],
  firstSeen: 1_000_000,
  lastSeen: 1_000_000,
  assignedTo: "خدمات الموقع",
  timeline: [],
  ...over,
});

const makeClassification = (over: Partial<Classification> = {}): Classification => ({
  subtype: "facilities:elevator",
  category: "facilities",
  severity: "medium",
  zoneId: "concourse",
  keywords: [],
  confidence: 0.9,
  lang: "ar",
  source: "local",
  ...over,
});

test("يضم البلاغ لمشكلة قائمة بنفس النوع والموقع داخل النافذة الزمنية", () => {
  const existing = makeCluster();
  const { cluster, isNew } = findOrCreateCluster(
    [existing],
    makeClassification(),
    existing.lastSeen + 10 * 60 * 1000,
    "0002",
  );
  assert.equal(isNew, false);
  assert.equal(cluster.id, existing.id);
});

test("ينشئ مشكلة جديدة لنوع فرعي مختلف في نفس الموقع", () => {
  const existing = makeCluster();
  const { isNew } = findOrCreateCluster(
    [existing],
    makeClassification({ subtype: "facilities:seating" }),
    existing.lastSeen + 60_000,
    "0002",
  );
  assert.equal(isNew, true, "المقاعد لا تُدمج مع المصاعد");
});

test("ينشئ مشكلة جديدة بعد انقضاء النافذة الزمنية", () => {
  const existing = makeCluster();
  const { isNew } = findOrCreateCluster(
    [existing],
    makeClassification(),
    existing.lastSeen + CLUSTER_WINDOW_MS + 1,
    "0002",
  );
  assert.equal(isNew, true);
});

test("لا يضم بلاغاً إلى مشكلة مغلقة", () => {
  const existing = makeCluster({ status: "resolved" });
  const { isNew } = findOrCreateCluster([existing], makeClassification(), existing.lastSeen + 60_000, "0002");
  assert.equal(isNew, true);
});

test("ينشئ مشكلة جديدة لنفس النوع في موقع مختلف", () => {
  const existing = makeCluster();
  const { isNew } = findOrCreateCluster(
    [existing],
    makeClassification({ zoneId: "gate_a" }),
    existing.lastSeen + 60_000,
    "0002",
  );
  assert.equal(isNew, true);
});

/* -------------------------------- التصعيد -------------------------------- */

test("يصعّد الخطورة مع تكرار البلاغات", () => {
  assert.equal(escalate("medium", 1), "medium");
  assert.equal(escalate("medium", 5), "high");
  assert.equal(escalate("medium", 12), "critical");
  assert.equal(escalate("critical", 20), "critical", "لا يتجاوز الحد الأعلى");
});

/* ----------------------------- الخريطة الحرارية ----------------------------- */

test("تحسب الكثافة مرجّحة بالخطورة ومعيّرة على الأعلى", () => {
  const reports = [
    { zoneId: "gate_a", severity: "critical" },
    { zoneId: "gate_b", severity: "low" },
  ] as Report[];

  const heat = zoneHeat(reports);
  assert.equal(heat.gate_a, 1, "الأعلى يساوي واحداً");
  assert.ok(heat.gate_b > 0 && heat.gate_b < 1);
  assert.equal(heat.metro, 0, "موقع بلا بلاغات");
});

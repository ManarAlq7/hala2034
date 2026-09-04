import { test } from "node:test";
import assert from "node:assert/strict";
import { SUMMARY_MIN_REPORTS, needsSummary } from "./summarize.ts";
import type { Cluster, ClusterSummary } from "./types.ts";

/* -------------------------------------------------------------------------- */
/*  اختبارات قاعدة تقادم الملخّص                                                */
/*  التشغيل: npm test                                                          */
/* -------------------------------------------------------------------------- */

const summary = (basedOn: number): ClusterSummary => ({
  titleAr: "عنوان",
  titleEn: "Title",
  summaryAr: "ملخّص",
  summaryEn: "Summary",
  actionAr: "إجراء",
  actionEn: "Action",
  basedOn,
  at: 1_000_000,
});

const makeCluster = (over: Partial<Cluster> = {}): Cluster => ({
  id: "CL-0001",
  title: "اختبار",
  subtype: "facilities:elevator",
  category: "facilities",
  zoneId: "concourse",
  severity: "medium",
  status: "new",
  reportIds: [],
  firstSeen: 1_000_000,
  lastSeen: 1_000_000,
  assignedTo: "خدمات الموقع",
  timeline: [],
  ...over,
});

const withReports = (n: number, over: Partial<Cluster> = {}) =>
  makeCluster({ reportIds: Array.from({ length: n }, (_, i) => `R-${i}`), ...over });

test("لا يلخّص مشكلة دون الحد الأدنى من البلاغات", () => {
  for (let n = 0; n < SUMMARY_MIN_REPORTS; n++) {
    assert.equal(needsSummary(withReports(n)), false, `عدد البلاغات ${n}`);
  }
});

test("يلخّص أول مرة عند بلوغ الحد الأدنى", () => {
  assert.equal(needsSummary(withReports(SUMMARY_MIN_REPORTS)), true);
});

test("لا يعيد التلخيص ما لم يتضاعف عدد البلاغات", () => {
  assert.equal(needsSummary(withReports(3, { summary: summary(3) })), false);
  assert.equal(needsSummary(withReports(5, { summary: summary(3) })), false);
});

test("يعيد التلخيص حين يتضاعف عدد البلاغات", () => {
  assert.equal(needsSummary(withReports(6, { summary: summary(3) })), true);
  assert.equal(needsSummary(withReports(9, { summary: summary(3) })), true);
});

test("المضاعفة نسبية فلا تُستنزف المشكلات الكبيرة بإعادة تلخيص متكررة", () => {
  // مشكلة فيها ٤٠ بلاغاً لا يتغيّر وصفها بوصول بلاغ واحد
  assert.equal(needsSummary(withReports(41, { summary: summary(40) })), false);
  assert.equal(needsSummary(withReports(80, { summary: summary(40) })), true);
});

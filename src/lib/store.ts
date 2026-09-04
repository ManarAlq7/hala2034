"use client";

import { useEffect, useSyncExternalStore } from "react";
import type { ChannelId, Classification, Cluster, Report, SeverityId, SourceId, StatusId } from "./types";
import { classifyLocal, escalate, findOrCreateCluster } from "./ai";
import { classifyReport } from "./classify";
import { buildSeedInputs } from "./seed";

const STORAGE_KEY = "hala2034:state:v2";

export interface AppState {
  ready: boolean;
  reports: Report[];
  clusters: Cluster[];
  counter: number;
}

export interface SubmitInput {
  text: string;
  zoneId: string;
  channel: ChannelId;
  source: SourceId;
  reporterName?: string;
  at?: number;
}

export interface SubmitResult {
  report: Report;
  cluster: Cluster;
  classification: Classification;
  isNewCluster: boolean;
  /** عدد البلاغات المتشابهة التي انضم إليها هذا البلاغ */
  similarCount: number;
}

const SEV_ORDER: SeverityId[] = ["low", "medium", "high", "critical"];
const highest = (a: SeverityId, b: SeverityId): SeverityId =>
  SEV_ORDER.indexOf(a) >= SEV_ORDER.indexOf(b) ? a : b;

const pad = (n: number) => String(n).padStart(4, "0");

/* -------------------------------------------------------------------------- */
/*  منطق الاستقبال والتجميع — دالة نقية قابلة للاختبار                          */
/* -------------------------------------------------------------------------- */

/**
 * ضمّ بلاغ مصنَّف إلى الحالة: يبحث عن مشكلة قائمة بنفس النوع الفرعي والموقع،
 * أو ينشئ مشكلة جديدة، ثم يعيد حساب درجة الخطورة بعد التصعيد.
 */
export function ingest(
  state: AppState,
  input: SubmitInput,
  classification: Classification,
): { state: AppState; result: SubmitResult } {
  const at = input.at ?? Date.now();
  const counter = state.counter + 1;

  const { cluster: found, isNew } = findOrCreateCluster(
    state.clusters,
    classification,
    at,
    pad(counter),
  );

  const report: Report = {
    id: `R-${pad(counter)}`,
    text: input.text,
    subtype: classification.subtype,
    lang: classification.lang,
    channel: input.channel,
    source: input.source,
    zoneId: classification.zoneId,
    category: classification.category,
    severity: classification.severity,
    confidence: classification.confidence,
    keywords: classification.keywords,
    createdAt: at,
    clusterId: found.id,
    reporterName: input.reporterName,
  };

  const reportIds = [...found.reportIds, report.id];
  const baseSeverity = isNew
    ? classification.severity
    : highest(found.severity, classification.severity);

  const timeline = [...found.timeline];
  const escalated = escalate(baseSeverity, reportIds.length);
  if (!isNew && escalated !== found.severity) {
    timeline.push({
      at,
      text: `رُفعت درجة الخطورة تلقائياً بعد وصول ${reportIds.length} بلاغات متشابهة`,
    });
  }

  const cluster: Cluster = { ...found, reportIds, lastSeen: at, severity: escalated, timeline };

  const clusters = isNew
    ? [cluster, ...state.clusters]
    : state.clusters.map((c) => (c.id === cluster.id ? cluster : c));

  return {
    state: { ...state, reports: [report, ...state.reports], clusters, counter },
    result: { report, cluster, classification, isNewCluster: isNew, similarCount: reportIds.length },
  };
}

/** يبني حالة تجريبية كاملة بتمرير البلاغات التجريبية على نفس مسار المعالجة */
function buildInitialState(now: number): AppState {
  let state: AppState = { ready: true, reports: [], clusters: [], counter: 0 };

  for (const s of buildSeedInputs()) {
    const at = now - s.minutesAgo * 60 * 1000;
    const input: SubmitInput = {
      text: s.text,
      zoneId: s.zoneId,
      channel: s.channel,
      source: s.source,
      reporterName: s.reporterName,
      at,
    };
    // البيانات التجريبية تُبنى بالمحرك المحلي: فورية وبلا استدعاء شبكة
    state = ingest(state, input, classifyLocal(s.text, s.zoneId)).state;
  }

  // بعض المشكلات القديمة تكون قد عولجت بالفعل — مع تسجيل أزمنة الاستجابة
  const clusters = state.clusters.map((c, i) => {
    const ageMin = (now - c.lastSeen) / 60000;
    const firstActionAt = c.firstSeen + (6 + (i % 5) * 4) * 60000;

    if (ageMin > 210 && i % 2 === 0) {
      const resolvedAt = c.lastSeen + (18 + (i % 4) * 9) * 60000;
      return {
        ...c,
        status: "resolved" as StatusId,
        firstActionAt,
        resolvedAt,
        timeline: [
          ...c.timeline,
          { at: firstActionAt, text: "الجهة المختصة باشرت المعالجة" },
          { at: resolvedAt, text: "تم إغلاق المشكلة بعد المعالجة" },
        ],
      };
    }
    if (ageMin > 90) {
      return {
        ...c,
        status: "in_progress" as StatusId,
        firstActionAt,
        timeline: [...c.timeline, { at: firstActionAt, text: "الجهة المختصة باشرت المعالجة" }],
      };
    }
    return c;
  });

  return { ...state, clusters };
}

/* -------------------------------------------------------------------------- */
/*  مخزن الحالة — خارج React، تشترك فيه كل المكوّنات                           */
/* -------------------------------------------------------------------------- */

const EMPTY: AppState = { ready: false, reports: [], clusters: [], counter: 0 };

let current: AppState = EMPTY;
let initialized = false;
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function persist(state: AppState) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // مساحة التخزين ممتلئة — النموذج يواصل العمل من الذاكرة
  }
}

function setState(next: AppState, save = true) {
  current = next;
  if (save) persist(next);
  emit();
}

/** تُستدعى مرة واحدة من المتصفح: تُحمّل الحالة المحفوظة أو تبني البيانات التجريبية */
function ensureInit() {
  if (initialized || typeof window === "undefined") return;
  initialized = true;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AppState;
      if (parsed?.reports?.length) {
        setState({ ...parsed, ready: true }, false);
        return;
      }
    }
  } catch {
    // تجاهل أي بيانات محفوظة تالفة وأعد البناء
  }
  setState(buildInitialState(Date.now()));
}

const subscribe = (cb: () => void) => {
  listeners.add(cb);
  return () => listeners.delete(cb);
};

const getSnapshot = () => current;
const getServerSnapshot = () => EMPTY;

/* --------------------------------- الإجراءات --------------------------------- */

/**
 * استقبال بلاغ جديد: يصنَّف بالنموذج اللغوي إن توفّر، وإلا بالمحرك المحلي،
 * ثم يُضم إلى الحالة.
 */
export async function submitReport(input: SubmitInput): Promise<SubmitResult> {
  const classification = await classifyReport(input.text, input.zoneId);
  const { state, result } = ingest(current, input, classification);
  setState(state);
  return result;
}

export function setClusterStatus(clusterId: string, status: StatusId) {
  const now = Date.now();
  const note =
    status === "resolved" ? "تم إغلاق المشكلة" : status === "in_progress" ? "بدأت المعالجة" : "أُعيد فتح المشكلة";

  setState({
    ...current,
    clusters: current.clusters.map((c) => {
      if (c.id !== clusterId) return c;
      return {
        ...c,
        status,
        firstActionAt: status === "new" ? c.firstActionAt : (c.firstActionAt ?? now),
        resolvedAt: status === "resolved" ? now : undefined,
        timeline: [...c.timeline, { at: now, text: note }],
      };
    }),
  });
}

export function addClusterNote(clusterId: string, text: string) {
  const now = Date.now();
  setState({
    ...current,
    clusters: current.clusters.map((c) =>
      c.id === clusterId
        ? { ...c, firstActionAt: c.firstActionAt ?? now, timeline: [...c.timeline, { at: now, text }] }
        : c,
    ),
  });
}

export function resetState() {
  setState(buildInitialState(Date.now()));
}

/* ---------------------------------- الخطّاف ---------------------------------- */

export interface UseApp extends AppState {
  submit: typeof submitReport;
  setStatus: typeof setClusterStatus;
  addNote: typeof addClusterNote;
  reset: typeof resetState;
}

export function useApp(): UseApp {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    ensureInit();
  }, []);

  return {
    ...state,
    submit: submitReport,
    setStatus: setClusterStatus,
    addNote: addClusterNote,
    reset: resetState,
  };
}

/*
 * عامل الخدمة — هلا 2034
 *
 * غرضه واحد: أن تفتح الصفحة حين تسقط الشبكة، فيستطيع المشجّع كتابة بلاغه
 * ويُحفظ في جهازه حتى تعود. بلا هذا الملف، انقطاع الشبكة يعني شاشة ديناصور
 * ولا شيء يُكتب أصلاً.
 *
 * لا يُخزَّن هنا أي شيء يخصّ شخصاً: الأصول الثابتة فقط. البلاغات المنتظرة
 * مكانها تخزين الصفحة نفسها، لا ذاكرة عامل الخدمة.
 */

const CACHE = "hala-shell-v1";

/* الحدّ الأدنى الذي يجعل الصفحة تفتح وتُكتب */
const SHELL = ["/", "/report", "/manifest.webmanifest"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(SHELL))
      // ملف واحد يفشل تنزيله يجب ألّا يمنع التثبيت كلّه
      .catch(() => undefined)
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;

  // الكتابات لا تُخزَّن ولا تُعاد من ذاكرة: البلاغ يُرسل أو يُحفظ في الطابور
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // الشبكة أولاً ثم الذاكرة: الأحدث ما دام ممكناً، والمخزَّن حين ينقطع
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response && response.ok && response.type === "basic") {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy)).catch(() => undefined);
        }
        return response;
      })
      .catch(async () => {
        const cached = await caches.match(request);
        if (cached) return cached;
        // تنقّل إلى صفحة لم تُزَر من قبل: تُعرض صفحة البلاغ فهي المقصد وقت الانقطاع
        if (request.mode === "navigate") {
          const fallback = await caches.match("/report");
          if (fallback) return fallback;
        }
        return Response.error();
      }),
  );
});

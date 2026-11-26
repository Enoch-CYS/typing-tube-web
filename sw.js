// 서비스 워커 — 앱 파일을 보관해 두어 설치(PWA)와 빠른 열기를 돕습니다.
// 인터넷이 될 때는 항상 새 파일을 먼저 받아(network-first) 고친 내용이 바로 보이게 합니다.
// 유튜브 영상은 보관하지 않습니다(영상 재생에는 인터넷이 필요).
const CACHE = "typing-tube-v12";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./css/style.css",
  "./data/config.js",
  "./data/categories.js",
  "./data/catalog/pop.js",
  "./data/catalog/ccm.js",
  "./data/catalog/talk.js",
  "./data/catalog/movie.js",
  "./data/catalog/ted.js",
  "./data/dict.js",
  "./js/ui.js",
  "./js/storage.js",
  "./js/cloud.js",
  "./js/typing.js",
  "./js/player.js",
  "./js/praise.js",
  "./js/practice.js",
  "./js/maker.js",
  "./js/app.js",
  "./icons/icon.svg",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== self.location.origin) return;
  // no-cache: 브라우저 임시 보관본 대신 서버에 새 파일이 있는지 꼭 확인합니다(고친 내용이 바로 보이게).
  const fresh = fetch(req.mode === "navigate" ? req.url : req, { cache: "no-cache" });
  e.respondWith(
    fresh
      .then((res) => {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
        }
        return res;
      })
      .catch(() => caches.match(req).then((r) => r || caches.match("./index.html")))
  );
});

/* ============================================================
   sw.js v2 — অফলাইন ক্যাশ, দ্রুত লোড, আপডেট, নোটিফিকেশন ক্লিক
   নতুন কিছু deploy করলে শুধু নিচের VERSION নম্বর বাড়াবেন।
   ============================================================ */
var VERSION = 'v7';
var CORE = 'babycare-core-' + VERSION;
var RUNTIME = 'babycare-runtime-' + VERSION;

var ASSETS = [
  './',
  './index.html',
  './css/style.css',
  './css/app.css',
  './css/glass.css',
  './css/footer.css',
  './css/theme.css',
  './js/data.js',
  './js/app.js',
  './js/tracker.js',
  './js/features.js',
  './js/main.js',
  './js/app-shell.js',
  './js/fx.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable-512.png',
  './apple-touch-icon.png',
  './logo.png'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CORE).then(function (c) {
      /* একটা ফাইল না পেলেও পুরো install যেন ফেল না করে */
      return Promise.all(ASSETS.map(function (u) {
        return c.add(u).catch(function () {});
      }));
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) {
        return k !== CORE && k !== RUNTIME;
      }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('message', function (e) {
  if (e.data === 'SKIP_WAITING') self.skipWaiting();
});

/* নেটওয়ার্ক আগে (সর্বোচ্চ ms অপেক্ষা) — ধীর নেটে ক্যাশে ফলব্যাক */
function networkFirst(req, cacheName, ms, fallbackUrl) {
  return new Promise(function (resolve) {
    var done = false;
    function fromCache() {
      return caches.match(req, { ignoreSearch: true }).then(function (r) {
        return r || (fallbackUrl ? caches.match(fallbackUrl) : null);
      });
    }
    var timer = setTimeout(function () {
      fromCache().then(function (r) { if (r && !done) { done = true; resolve(r); } });
    }, ms);
    fetch(req).then(function (res) {
      clearTimeout(timer);
      if (res && res.ok) {
        var copy = res.clone();
        caches.open(cacheName).then(function (c) { c.put(req, copy); });
      }
      if (!done) { done = true; resolve(res); }
    }).catch(function () {
      clearTimeout(timer);
      fromCache().then(function (r) {
        if (!done) { done = true; resolve(r || new Response('অফলাইন', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } })); }
      });
    });
  });
}

/* ক্যাশ আগে, পেছনে আপডেট (ছবি ও ফন্ট) */
function staleWhileRevalidate(req, cacheName) {
  return caches.open(cacheName).then(function (c) {
    return c.match(req).then(function (cached) {
      var net = fetch(req).then(function (res) {
        if (res && (res.ok || res.type === 'opaque')) c.put(req, res.clone());
        return res;
      }).catch(function () { return cached; });
      return cached || net;
    });
  });
}

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);

  /* ফন্ট (Google Fonts) */
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    e.respondWith(staleWhileRevalidate(req, RUNTIME));
    return;
  }
  if (url.origin !== location.origin) return;

  /* পেজ নেভিগেশন */
  if (req.mode === 'navigate') {
    e.respondWith(networkFirst(req, CORE, 3500, './index.html'));
    return;
  }
  /* ছবি */
  if (/\.(png|jpg|jpeg|webp|svg|ico|gif)$/i.test(url.pathname)) {
    e.respondWith(staleWhileRevalidate(req, CORE));
    return;
  }
  /* css / js / json */
  e.respondWith(networkFirst(req, CORE, 3500));
});

/* নোটিফিকেশনে ট্যাপ করলে অ্যাপ খুলবে (ট্র্যাকিং-এ) */
self.addEventListener('notificationclick', function (e) {
  e.notification.close();
  var target = new URL('./index.html?source=notification#tracker', self.registration.scope).href;
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (list) {
      for (var i = 0; i < list.length; i++) {
        if (list[i].url.indexOf(self.registration.scope) === 0 && 'focus' in list[i]) {
          list[i].navigate(target).catch(function () {});
          return list[i].focus();
        }
      }
      return self.clients.openWindow(target);
    })
  );
});

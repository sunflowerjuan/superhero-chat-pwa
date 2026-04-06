const STATIC_CACHE = "static-v2";
const DYNAMIC_CACHE = "dynamic-v2";
const INMUTABLE_CACHE = "inmutable-v2";
const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.json",
  "./css/style.css",
  "./css/animate.css",
  "./js/app.js",
  "./js/libs/jquery.js",
  "./img/avatars/spiderman.jpg",
  "./img/avatars/ironman.jpg",
  "./img/avatars/wolverine.jpg",
  "./img/avatars/thor.jpg",
  "./img/avatars/hulk.jpg",
  "./img/favicon.ico",
  "./img/icons/icon-152x152.png",
  "./img/icons/icon-192x192.png",
  "./img/icons/icon-512x512.png",
  "./img/icons-ios/apple-launch-640x1136.png",
  "./img/icons-ios/apple-launch-750x1334.png",
  "./img/icons-ios/apple-launch-1125x2436.png",
  "./img/icons-ios/apple-launch-1242x2208.png",
];
const APP_SHELL_INMUTABLE = [
  "https://fonts.googleapis.com/css?family=Quicksand:300,400",
  "https://fonts.googleapis.com/css?family=Lato:400,300",
  "https://use.fontawesome.com/releases/v5.3.1/css/all.css",
];

self.addEventListener("install", (e) => {
  const cacheStatic = caches
    .open(STATIC_CACHE)
    .then((cache) => cache.addAll(APP_SHELL));
  const cacheInmutable = caches
    .open(INMUTABLE_CACHE)
    .then((cache) => cache.addAll(APP_SHELL_INMUTABLE));
  e.waitUntil(Promise.all([cacheStatic, cacheInmutable]));
});

self.addEventListener("activate", (e) => {
  const respuesta = caches.keys().then((keys) =>
    Promise.all(
      keys.map((key) => {
        if (key !== STATIC_CACHE && key.includes("static")) {
          return caches.delete(key);
        }

        if (key !== DYNAMIC_CACHE && key.includes("dynamic")) {
          return caches.delete(key);
        }

        if (key !== INMUTABLE_CACHE && key.includes("inmutable")) {
          return caches.delete(key);
        }

        return Promise.resolve();
      }),
    ),
  );
  e.waitUntil(respuesta);
});

self.addEventListener("fetch", (e) => {
  const respuesta = caches.match(e.request).then((cacheRes) => {
    if (cacheRes) {
      return cacheRes;
    }

    return fetch(e.request)
      .then((networkRes) => {
        if (!networkRes || networkRes.status !== 200 || networkRes.type !== "basic") {
          return networkRes;
        }

        const responseToCache = networkRes.clone();
        caches.open(DYNAMIC_CACHE).then((cache) => cache.put(e.request, responseToCache));

        return networkRes;
      })
      .catch(() => caches.match("./index.html"));
  });

  e.respondWith(respuesta);
});

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open('dhawan-mall-v1').then((cache) => {
      return cache.addAll(['/', '/index.html', '/product.json']);
    })
  );
});
self.addEventListener('fetch', (e) => {
  e.respondWith(caches.match(e.request).then((response) => response || fetch(e.request)));
});

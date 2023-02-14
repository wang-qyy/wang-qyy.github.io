self.addEventListener('install', function (e) {
    console.log('install success')
    e.waitUntil(
        caches.open('fox-store').then((cache) => cache.addAll([
            '/',
            '/index.html',
        ])),
    );
});

self.addEventListener('fetch', function (e) {
    console.log(e.request.url);
    // e.respondWith(
    //   caches.match(e.request).then(function(response) {
    //     return response || fetch(e.request);
    //   })
    // );
});
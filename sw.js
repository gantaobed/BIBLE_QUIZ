// గమనిక: మీరు ఇకపై ఏమైనా మార్పులు చేస్తే, యాప్ వెంటనే యూజర్లకు అప్‌డేట్ అవ్వడానికి ఇక్కడున్న v2 ని v3, v4 ఇలా మార్చాలి.
const CACHE_NAME = 'bible-quiz-cache-v2';

self.addEventListener('install', (event) => {
    self.skipWaiting(); // కొత్త వెర్షన్ రాగానే వెంటనే ఇన్‌స్టాల్ చేసుకుంటుంది
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    // పాత కాష్ (Cache) లను తొలగిస్తుంది
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Network First, fallback to cache స్ట్రాటెజీ
self.addEventListener('fetch', (event) => {
    event.respondWith(
        fetch(event.request)
            .then((networkResponse) => {
                // ఇంటర్నెట్ ఉంటే ముందుగా కొత్త ఫైల్స్ తెచ్చుకుంటుంది
                return caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, networkResponse.clone());
                    return networkResponse;
                });
            })
            .catch(() => {
                // ఇంటర్నెట్ లేనప్పుడు మాత్రమే సేవ్ అయిన పాత ఫైల్స్ చూపిస్తుంది
                return caches.match(event.request);
            })
    );
});
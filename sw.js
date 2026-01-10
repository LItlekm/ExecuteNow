// Service Worker for 任务拆解助手
const CACHE_NAME = 'plancoach-v1';
const ASSETS = [
    '/',
    '/index.html',
    '/styles.css',
    '/app.js',
    '/templates.js',
    '/achievements.js',
    '/challengeManager.js',
    '/usageStatsManager.js',
    '/i18n.js',
    '/customTemplates.js'
];

// 安装 Service Worker
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('缓存资源中...');
                return cache.addAll(ASSETS);
            })
            .then(() => self.skipWaiting())
    );
});

// 激活 Service Worker
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('删除旧缓存:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// 请求拦截 - 缓存优先策略
self.addEventListener('fetch', (event) => {
    // 跳过非 GET 请求
    if (event.request.method !== 'GET') return;

    // 跳过 API 请求
    if (event.request.url.includes('/api/') ||
        event.request.url.includes('workers.dev') ||
        event.request.url.includes('deepseek.com') ||
        event.request.url.includes('bigmodel.cn')) {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // 返回缓存或发起网络请求
                if (response) {
                    return response;
                }
                return fetch(event.request).then((fetchResponse) => {
                    // 不缓存非成功响应
                    if (!fetchResponse || fetchResponse.status !== 200 || fetchResponse.type !== 'basic') {
                        return fetchResponse;
                    }
                    // 克隆响应并缓存
                    const responseToCache = fetchResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseToCache);
                    });
                    return fetchResponse;
                });
            })
            .catch(() => {
                // 离线回退
                if (event.request.destination === 'document') {
                    return caches.match('/index.html');
                }
            })
    );
});

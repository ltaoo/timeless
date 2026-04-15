const files = new Map();

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'sync-files') {
    files.clear();
    for (const [name, code] of Object.entries(event.data.files)) {
      files.set(name, code);
    }
  }
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  const prefix = '/__playground__/';

  if (!url.pathname.startsWith(prefix)) return;

  const filename = url.pathname.slice(prefix.length);

  event.respondWith(handlePlaygroundRequest(filename));
});

function handlePlaygroundRequest(filename) {
  if (filename === '__boot__.js') {
    const code = [
      "import app from '/__playground__/app.js';",
      "Timeless.DOM.render(app, document.getElementById('root'));",
    ].join('\n');
    return new Response(code, {
      headers: { 'Content-Type': 'application/javascript' },
    });
  }

  const code = files.get(filename);
  if (code !== undefined) {
    return new Response(code, {
      headers: { 'Content-Type': 'application/javascript' },
    });
  }

  return new Response(`/* 404: ${filename} not found */`, {
    status: 404,
    headers: { 'Content-Type': 'application/javascript' },
  });
}

import { exec, execSync } from 'child_process';
import http from 'http';
import { createServer } from 'http';
import { readFile } from 'fs/promises';
import { join } from 'path';

const APP_DIR = '/Users/mayfair/Documents/other/timeless/apps/js-heap-size';
const PORT = 8765;

// Start simple HTTP server
const server = createServer(async (req, res) => {
  let filePath = join(APP_DIR, req.url === '/' ? 'index.html' : req.url);
  try {
    const data = await readFile(filePath);
    const ext = filePath.split('.').pop();
    const types = { html: 'text/html', js: 'text/javascript', css: 'text/css' };
    res.writeHead(200, { 'Content-Type': types[ext] || 'application/octet-stream' });
    res.end(data);
  } catch {
    res.writeHead(404);
    res.end('Not Found');
  }
});
server.listen(PORT);
console.log(`Server running on http://localhost:${PORT}`);

// Start Chrome with remote debugging
const chrome = exec(
  `/Applications/Google\\ Chrome.app/Contents/MacOS/Google\\ Chrome \
    --headless=new \
    --remote-debugging-port=9222 \
    --js-flags=--expose-gc \
    --disable-gpu --no-sandbox --disable-extensions \
    http://localhost:${PORT}`
);

// Wait for Chrome to start
await new Promise(r => setTimeout(r, 3000));

// Get CDP websocket info
const getWsUrl = () => new Promise((resolve, reject) => {
  http.get('http://localhost:9222/json', res => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      const pages = JSON.parse(data);
      resolve(pages[0]?.webSocketDebuggerUrl);
    });
  }).on('error', reject);
});

const wsUrl = await getWsUrl();
console.log('CDP WebSocket:', wsUrl);

// Connect via WebSocket using Node.js built-in
const ws = new WebSocket(wsUrl);
let msgId = 0;
const pending = new Map();

ws.onmessage = (event) => {
  const msg = JSON.parse(event.data);
  if (msg.id && pending.has(msg.id)) {
    pending.get(msg.id)(msg);
    pending.delete(msg.id);
  }
};

function send(method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = ++msgId;
    pending.set(id, resolve);
    ws.send(JSON.stringify({ id, method, params }));
    setTimeout(() => { pending.delete(id); reject(new Error('timeout')); }, 30000);
  });
}

await new Promise(resolve => { ws.onopen = resolve; });
console.log('Connected to CDP');

// Wait for page to load
await new Promise(r => setTimeout(r, 2000));

// Helper: get heap stats
async function getHeapStats() {
  await send('Runtime.evaluate', { expression: 'gc()', objectGroup: 'gc' });
  await new Promise(r => setTimeout(r, 300));
  await send('Runtime.evaluate', { expression: 'gc()', objectGroup: 'gc' });
  await new Promise(r => setTimeout(r, 300));
  const res = await send('Runtime.evaluate', {
    expression: `JSON.stringify({ usedSize: performance.memory?.usedJSHeapSize || 0, totalSize: performance.memory?.totalJSHeapSize || 0, domNodes: document.getElementsByTagName('*').length })`,
    returnByValue: true,
  });
  return JSON.parse(res.result.result.value);
}

console.log('\n=== Baseline (before any toggles) ===');
const baseline = await getHeapStats();
console.log(`  Heap: ${(baseline.usedSize / 1024 / 1024).toFixed(2)} MB`);
console.log(`  DOM Nodes: ${baseline.domNodes}`);

// Toggle 100 times
console.log('\n=== Toggling 100 times ===');
await send('Runtime.evaluate', {
  expression: `
    (async () => {
      const btn = document.querySelector('button');
      for (let i = 0; i < 100; i++) {
        btn.click();
        if (i % 20 === 0) await new Promise(r => setTimeout(r, 10));
      }
    })()
  `,
  awaitPromise: true,
});
await new Promise(r => setTimeout(r, 1000));

console.log('=== After 100 toggles ===');
const afterToggles = await getHeapStats();
console.log(`  Heap: ${(afterToggles.usedSize / 1024 / 1024).toFixed(2)} MB`);
console.log(`  DOM Nodes: ${afterToggles.domNodes}`);

console.log('\n=== After 5s wait + GC ===');
await new Promise(r => setTimeout(r, 5000));
const final = await getHeapStats();
console.log(`  Heap: ${(final.usedSize / 1024 / 1024).toFixed(2)} MB`);
console.log(`  DOM Nodes: ${final.domNodes}`);

console.log('\n=== Summary ===');
const heapDelta = ((final.usedSize - baseline.usedSize) / 1024 / 1024).toFixed(2);
const domDelta = final.domNodes - baseline.domNodes;
console.log(`  Heap delta: ${heapDelta} MB`);
console.log(`  DOM Nodes delta: ${domDelta}`);
console.log(domDelta > 10 ? '  ⚠️  DOM Nodes leaked!' : '  ✅ No DOM leak');
console.log(parseFloat(heapDelta) > 5 ? '  ⚠️  Heap grew significantly!' : '  ✅ No significant heap leak');

ws.close();
chrome.kill();
server.close();
process.exit(0);

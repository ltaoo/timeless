export async function initServiceWorker() {
  const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });

  // Wait for the SW to be active
  const sw = reg.installing || reg.waiting || reg.active;
  if (sw && sw.state !== 'activated') {
    await new Promise((resolve) => {
      sw.addEventListener('statechange', function onStateChange() {
        if (sw.state === 'activated') {
          sw.removeEventListener('statechange', onStateChange);
          resolve();
        }
      });
    });
  }
}

export function syncFilesToSW(filesObject) {
  const controller = navigator.serviceWorker.controller;
  if (!controller) return;
  controller.postMessage({ type: 'sync-files', files: filesObject });
}

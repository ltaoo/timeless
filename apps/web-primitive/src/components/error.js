const { View, Text } = Timeless;

// Simple error modal component
export function ErrorModal() {
  let container = null;

  return {
    show(error) {
      if (container) this.hide();
      container = document.createElement("div");
      container.className = "fixed inset-0 z-[9999] flex items-center justify-center bg-black/50";
      container.innerHTML = `
        <div class="bg-white dark:bg-zinc-900 rounded-lg shadow-xl max-w-lg w-full mx-4 p-6">
          <h3 class="text-lg font-semibold text-red-600 mb-2">Error</h3>
          <pre class="text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap max-h-80 overflow-auto">${error.message || String(error)}</pre>
          <button class="mt-4 px-4 py-2 bg-zinc-900 text-white rounded-md text-sm hover:bg-zinc-700">Dismiss</button>
        </div>
      `;
      container.querySelector("button").onclick = () => this.hide();
      document.body.appendChild(container);
    },
    hide() {
      if (container) {
        container.remove();
        container = null;
      }
    },
  };
}

// Global error handling
const errorModal = ErrorModal();

window.addEventListener("error", (e) => {
  console.error("[global error]", e.error);
  if (e.error) {
    errorModal.show(e.error);
  }
});

window.addEventListener("unhandledrejection", (e) => {
  console.error("[unhandled rejection]", e.reason);
  errorModal.show(e.reason);
});

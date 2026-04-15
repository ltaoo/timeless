import { createFileStore } from "@/file-store.js";
import { initServiceWorker, syncFilesToSW } from "@/sw-bridge.js";

function debounce(fn, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

function PlaygroundView(store, error_) {
  function handleAddFile() {
    const name = window.prompt("File name (e.g. helpers.js):");
    if (!name) return;
    const normalized = name.endsWith(".js") ? name : name + ".js";
    store.addFile(normalized);
  }

  function handleDeleteFile(name) {
    store.deleteFile(name);
  }

  function TabBar() {
    return View(
      {
        class:
          "flex items-center gap-0 border-b border-zinc-200 dark:border-zinc-800 overflow-x-auto select-none",
      },
      [
        For({
          each: store.fileList_,
          render(filename) {
            const isActive = computed(store.activeFile_, (v) => v === filename);
            return View(
              {
                class: computed(
                  isActive,
                  (active) =>
                    "flex items-center gap-1 px-3 py-2 text-sm font-mono cursor-pointer border-r border-zinc-200 dark:border-zinc-800 " +
                    (active
                      ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-semibold"
                      : "bg-zinc-50 dark:bg-zinc-950 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"),
                ),
                onClick() {
                  store.activeFile_.as(filename);
                },
              },
              [
                View({}, [filename]),
                filename !== "app.js"
                  ? View(
                      {
                        class:
                          "ml-1 text-zinc-400 hover:text-red-500 cursor-pointer text-xs leading-none",
                        onClick(e) {
                          e.stopPropagation();
                          handleDeleteFile(filename);
                        },
                      },
                      ["\u00d7"],
                    )
                  : null,
              ],
            );
          },
        }),
        View(
          {
            class:
              "px-3 py-2 text-sm text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 cursor-pointer select-none",
            onClick: handleAddFile,
          },
          ["+"],
        ),
      ],
    );
  }

  return View({ class: "flex h-screen w-screen" }, [
    // Editor panel
    View(
      {
        class:
          "flex flex-col w-1/2 border-r border-zinc-200 dark:border-zinc-800",
      },
      [
        TabBar(),
        View({ class: "flex-1 relative" }, [
          View({ class: "absolute inset-0", dataset: { role: "editor" } }, []),
        ]),
      ],
    ),
    // Preview panel
    View({ class: "flex flex-col w-1/2" }, [
      View(
        {
          class:
            "px-4 py-2 text-sm font-semibold text-zinc-500 border-b border-zinc-200 dark:border-zinc-800 select-none",
        },
        ["Preview"],
      ),
      View({ class: "flex-1 relative" }, [
        View({ class: "absolute inset-0", dataset: { role: "preview" } }, []),
      ]),
      Show({
        when: error_,
        ok() {
          return [
            View(
              {
                class:
                  "rounded-md border border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950 p-3 mx-4 mb-4 text-sm text-red-600 dark:text-red-400 font-mono whitespace-pre-wrap",
              },
              [error_],
            ),
          ];
        },
      }),
    ]),
  ]);
}

document.addEventListener("DOMContentLoaded", async function () {
  await initServiceWorker();

  const store = createFileStore();
  const error_ = ref("");
  let iframeEl = null;
  let version = 0;

  // Render the UI
  Timeless.DOM.render(
    PlaygroundView(store, error_),
    document.querySelector("#root"),
  );

  // Sync default files to SW before iframe loads
  syncFilesToSW(store.getFilesObject());

  // Set up imperative DOM elements after render
  requestAnimationFrame(() => {
    // Editor textarea
    const editorContainer = document.querySelector('[data-role="editor"]');
    function renderTextarea() {
      editorContainer.innerHTML = "";
      const file = store.activeFile_.value;
      const currentCode = store.getCode(file);
      const textarea = document.createElement("textarea");
      textarea.className =
        "absolute inset-0 w-full h-full resize-none rounded-none border-0 p-4 font-mono text-sm focus-visible:ring-0 focus:outline-none bg-transparent";
      textarea.value = currentCode;
      textarea.addEventListener("input", () => {
        store.setCode(file, textarea.value);
      });
      editorContainer.appendChild(textarea);
    }
    renderTextarea();
    store.activeFile_.subscribe({ onChange: renderTextarea });

    // Preview iframe
    const previewContainer = document.querySelector('[data-role="preview"]');
    const iframe = document.createElement("iframe");
    iframe.className = "w-full h-full border-0";
    iframe.src = "/preview.html";
    previewContainer.appendChild(iframe);
    iframeEl = iframe;

    // Error messages from preview iframe
    window.addEventListener("message", (event) => {
      if (event.data && event.data.type === "preview-error") {
        error_.as(event.data.message);
      }
    });

    // Debounced refresh on file changes
    const debouncedRefresh = debounce(() => {
      error_.as("");
      syncFilesToSW(store.getFilesObject());
      version++;
      if (iframeEl) {
        iframeEl.src = "/preview.html?v=" + version;
      }
    }, 300);

    store.files_.subscribe({ onChange: debouncedRefresh });
  });
});

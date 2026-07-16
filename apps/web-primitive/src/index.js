import { app, history$, client$, views, storage$ } from "./store/index.js";

// Error fallback view
function ErrorFallbackView(error, viewName) {
  const { View, Text } = Timeless;
  return View({
    class: "p-6 m-4 rounded-lg border border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800",
  }, [
    Text({ class: "text-lg font-semibold text-red-700 dark:text-red-300" }, [
      "Error: " + viewName,
    ]),
    Text({ class: "text-sm text-red-600 mt-2" }, [
      error?.message || String(error),
    ]),
    error?.stack ? Text({ class: "text-xs text-red-500 mt-2 whitespace-pre-wrap" }, [
      error.stack,
    ]) : null,
  ]);
}

// Application root view
function ApplicationRootView() {
  const { View, Text, Fragment, For, Show, computed, ref, refobj, Portal, Icon } = Timeless;
  const { ErrorBoundary } = Timeless;

  const { ToasterModel } = Timeless.ui;
  const toaster$ = ToasterModel({ position: "top-center" });

  app.onTip((msg) => {
    const id = toaster$.loading({ content: msg });
    setTimeout(() => {
      toaster$.success({ content: msg + " OK" });
    }, 1000);
  });

  app.onError((err) => {
    console.error("[app error]", err);
    toaster$.error({ content: err?.message || String(err) });
  });

  // Standard sub-views layout
  function StandardSubViews(props) {
    const { View, KeepAliveSubViews } = Timeless.web;
    return View({ class: "flex-1" }, [
      KeepAliveSubViews({}),
    ]);
  }

  return ErrorBoundary(
    { fallback: (e) => ErrorFallbackView(e, "Root") },
    [
      StandardSubViews({}),
      Portal({}, []),
    ],
  );
}

// Mount on DOM ready
window.addEventListener("DOMContentLoaded", () => {
  const { View } = Timeless;

  // Prepare initial route
  const pathname = window.location.pathname;
  const query = window.location.search;
  const hash = window.location.hash;
  history$.replace(pathname + query + hash);

  // Start app
  app.start({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  // Render
  const rootView = ApplicationRootView();
  Timeless.DOM.render(rootView, document.getElementById("root"));
});

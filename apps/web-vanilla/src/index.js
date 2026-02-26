import { app, history, client, views } from "./store/index.js";
import { storage } from "./store/storage.js";

const render = ($elm) => {
  const root_view$ = history.$view;

  root_view$.onSubViewsChange(async (view$s) => {
    renderViews(view$s);
  });

  const renderViews = async (view$s) => {
    if (!view$s || view$s.length === 0) {
      console.log("[Render] No views to render");
      return;
    }
    const $segments = document.createDocumentFragment();
    for (let i = 0; i < view$s.length; i += 1) {
      const view$ = view$s[i];
      const _Page = views[view$.name];
      if (!_Page) {
        console.warn("[Render] No page component found for:", view$.name);
        return;
      }
      const $elm = renderPage(_Page, view$);
      if ($elm) {
        $segments.appendChild($elm);
      }
    }
    $elm.appendChild($segments);
  };

  const renderPage = (PageView, view) => {
    try {
      const page$ = PageView({
        app,
        view: view,
        history: history,
        views: views,
        storage,
        client,
      });
      return page$.render();
    } catch (err) {
      console.error("[Render] Error rendering page:", err);
      return null;
    }
  };

  const { innerWidth, innerHeight, location } = window;
  history.$router.prepare(location);
  app.start({
    width: innerWidth,
    height: innerHeight,
  });
};

document.addEventListener("DOMContentLoaded", function () {
  const $root = document.querySelector("#root");
  if (!$root) {
    console.error("[Render] Root element not found");
    return;
  }
  render($root);
});

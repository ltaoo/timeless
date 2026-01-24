import { app, history, client, views } from "./store/index.js";
import { storage } from "./store/storage.js";

let currentPage$ = null;
let currentContainer = null;
let isRendering = false;

const render = ($elm) => {
  // currentContainer = $elm;
  const root_view$ = history.$view;

  root_view$.onSubViewsChange(async (view$s) => {
    console.log("[Render] onSubViewsChange", view$s);
    // if (isRendering) {
    //   console.log("[Render] Already rendering, skipping...");
    //   return;
    // }
    // isRendering = true;
    // try {
    // } finally {
    //   isRendering = false;
    // }
    renderViews(view$s);
  });

  const renderViews = async (view$s) => {
    // if (currentPage$) {
    //   console.log("[Render] Unmounting current page:", currentPage$);
    //   try {
    //     if (typeof currentPage$.unmount === "function") {
    //       await currentPage$.unount();
    //     }
    //   } catch (err) {
    //     console.error("[Render] Error unmounting page:", err);
    //   }
    //   currentPage$ = null;
    // }

    if (!view$s || view$s.length === 0) {
      console.log("[Render] No views to render");
      // if (currentContainer) {
      //   currentContainer.innerHTML = "";
      // }
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
      console.log("[Render] Rendering page:", view$.name);
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

      // if (!page$ || typeof page$.mount !== "function") {
      //   console.error("[Render] Invalid page component:", page$);
      //   return;
      // }

      // if (typeof page$.mount === "function") {
      //   await page$.mount();
      // }

      // let $content;
      // if (typeof page$.render === "function") {
      //   $content = ;
      // } else {
      //   $content = page$.$elm;
      // }

      // if (!$content) {
      //   console.error("[Render] Page render returned null:", page$);
      //   return;
      // }

      // console.log("[Render] Page mounted and rendered:", page$, $content);

      // if (currentContainer) {
      //   currentContainer.innerHTML = "";
      //   if (page$.$elm) {
      //     currentContainer.appendChild(page$.$elm);
      //   } else if ($content) {
      //     currentContainer.appendChild($content);
      //   }
      // }

      // currentPage$ = page$;
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

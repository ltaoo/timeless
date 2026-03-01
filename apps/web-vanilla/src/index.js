import { app, history, client, views, storage } from "./store/index.js";
import NotFoundPageView from "./pages/notfound/index.js";

Timeless.NavigatorCore.prefix = "/timeless";

const render = ($root) => {
  const root_view$ = history.$view;
  const view$ = RouteSubViews({
    view: root_view$,
    client,
    storage,
    history,
    views,
    NotFound: NotFoundPageView,
  });
  $root.appendChild(view$.$elm);
  // Portal({}, [
  //   Toast()
  // ]);

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

import { app, history, client, views, storage } from "./store/index.js";
import NotFoundPageView from "./pages/notfound/index.js";

Timeless.NavigatorCore.prefix = "/timeless";

function ApplicationRootView() {
  const root_view$ = history.$view;
  return RouteSubViews({
    view: root_view$,
    client,
    storage,
    history,
    views,
    NotFound: NotFoundPageView,
  });
}

document.addEventListener("DOMContentLoaded", function () {
  const { innerWidth, innerHeight, location } = window;
  history.$router.prepare(location);
  app.start({
    width: innerWidth,
    height: innerHeight,
  });
  render(ApplicationRootView(), document.querySelector("#root"));
});

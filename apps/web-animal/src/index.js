import { app, history$, views, storage$, client$ } from "./store/index.js";

function ApplicationRootView() {
  const root_view$ = history$.$view;

  return Fragment({}, [
    Timeless.ui.StandardSubViews({
      view: root_view$,
      views,
      client: client$,
      history: history$,
      app,
      storage: storage$,
    }),
  ]);
}

document.addEventListener("DOMContentLoaded", function () {
  const { innerWidth, innerHeight, location } = window;
  history$.$router.prepare(location);
  app.start({
    width: innerWidth,
    height: innerHeight,
  });
  Timeless.DOM.render(ApplicationRootView(), document.querySelector("#root"));
});

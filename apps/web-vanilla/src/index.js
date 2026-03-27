import { app, history$, client$, views, storage$ } from "./store/index.js";
import NotFoundPageView from "./pages/notfound/index.js";

function ApplicationRootView() {
  const root_view$ = history$.$view;
  // const toast$ = new Timeless.ToastCore();
  app.onTip((msg) => {
    const { text } = msg;
    console.log("[]tip", text);
    // toast$.show({
    //   texts: text,
    // });
  });
  app.onError((err) => {
    console.error(err);
  });

  return Fragment({}, [
    StandardSubViews({
      view: root_view$,
      views,
      history: history$,
      app,
      client: client$,
      storage: storage$,
      NotFound: NotFoundPageView,
    }),
    // HistoryPanel({ store: history }),
  ]);
}

document.addEventListener("DOMContentLoaded", function () {
  const { innerWidth, innerHeight, location } = window;
  history$.$router.prepare(location);
  app.start({
    width: innerWidth,
    height: innerHeight,
  });
  Timeless.render(ApplicationRootView(), document.querySelector("#root"));
});

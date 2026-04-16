import {
  View,
  Show,
  For,
  Fragment,
  Portal,
  Icon,
  ref,
  computed,
} from "@timeless/timeless";
import { render } from "@timeless/timeless-dom";
import { StandardSubViews, Toaster, ui } from "@timeless/shadcn";

import { history$, client$, storage$, app, views } from "./store/index.js";

function ApplicationRootView() {
  const root_view$ = history$.$view;
  const toaster$ = ui.ToasterModel({ position: "top-center" });
  const icon_name_ = ref("info");

  app.onTip((msg) => {
    const { text, type } = msg;
    const content = View(
      {
        class: "flex items-center gap-4 p-4",
        onMounted() {
          setTimeout(() => {
            icon_name_.as("check");
          }, 1000);
        },
      },
      [
        View({}, [
          Show({
            when: computed(icon_name_, (t) => t === "check"),
            ok() {
              return Icon({ name: "check", size: 16 });
            },
            else() {
              return Icon({ name: "loader", size: 16 });
            },
          }),
        ]),
        View({}, [
          For({
            each: text,
            render(t) {
              return View({}, [t]);
            },
          }),
        ]),
      ],
    );
    const method = type && toaster$[type] ? type : "message";
    toaster$[method](content);
  });
  app.onError((err) => {
    console.error(err);
  });

  // const elm = Select({
  //   class: "w-[120px]",
  //   store: new Timeless.ui.SelectCore({
  //     defaultValue: "apple",
  //     options: [
  //       { value: "apple", label: "苹果" },
  //       { value: "banana", label: "香蕉" },
  //       { value: "orange", label: "橙子" },
  //     ],
  //   }),
  // });
  // console.log("elm", elm);
  // return elm;
  return Fragment({}, [
    StandardSubViews({
      view: root_view$,
      views,
      history: history$,
      app,
      client: client$,
      storage: storage$,
      // NotFound: NotFoundPageView,
      // ErrorFallback: ErrorFallbackView,
    }),
    Portal({}, [Toaster({ store: toaster$, position: "top-center" })]),
    // HistoryPanel({ store: history }),
  ]);
}

function mount() {
  render(ApplicationRootView(), document.querySelector("#root"));
}

if (import.meta.hot && import.meta.hot.data.initialized) {
  // HMR re-execution: module code is fresh, just re-render
  mount();
} else {
  // Initial load
  document.addEventListener("DOMContentLoaded", function () {
    const { innerWidth, innerHeight } = window;
    history$.$router.prepare(window.location);
    app.start({ width: innerWidth, height: innerHeight });
    mount();
  });
}

if (import.meta.hot) {
  import.meta.hot.data.initialized = true;
  import.meta.hot.accept();
}

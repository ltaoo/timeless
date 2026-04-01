import { app, history$, client$, views, storage$ } from "./store/index.js";
import NotFoundPageView from "./pages/notfound/index.js";
// import { initToaster } from "./components/toaster.js";

function ErrorFallbackView(error, viewName) {
  return View(
    {
      class:
        "flex flex-col items-center justify-center gap-4 p-8 min-h-[200px]",
    },
    [
      View(
        {
          class:
            "w-full max-w-lg rounded-lg border border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30 p-6",
        },
        [
          View({ class: "flex items-center gap-2 mb-3" }, [
            View(
              {
                as: "span",
                class: "text-red-500 dark:text-red-400 text-lg",
              },
              ["\u26A0"],
            ),
            View(
              {
                as: "span",
                class: "text-sm font-semibold text-red-700 dark:text-red-300",
              },
              [`"${viewName}" render error`],
            ),
          ]),
          View(
            {
              as: "pre",
              class:
                "text-xs text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-950/50 rounded p-3 overflow-auto max-h-[200px] whitespace-pre-wrap break-words font-mono",
            },
            [error.message],
          ),
          error.stack
            ? View(
                {
                  as: "details",
                  class: "mt-3",
                },
                [
                  View(
                    {
                      as: "summary",
                      class:
                        "text-xs text-red-500 dark:text-red-400 cursor-pointer select-none",
                    },
                    ["Stack trace"],
                  ),
                  View(
                    {
                      as: "pre",
                      class:
                        "mt-2 text-xs text-red-500/80 dark:text-red-400/60 bg-red-100 dark:bg-red-950/50 rounded p-3 overflow-auto max-h-[300px] whitespace-pre-wrap break-words font-mono",
                    },
                    [error.stack],
                  ),
                ],
              )
            : null,
        ],
      ),
    ],
  );
}

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
      ErrorFallback: ErrorFallbackView,
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
  Timeless.DOM.render(ApplicationRootView(), document.querySelector("#root"));
});

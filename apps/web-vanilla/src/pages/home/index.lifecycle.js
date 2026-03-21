import { Section, Item } from "@/components/index.js";

function LifecyclePageA(props) {
  return View(
    {
      class: cn(["space-y-4"]),
      onMounted() {
        props.addLog?.("Page A: onMounted");
      },
      onUnmounted() {
        props.addLog?.("Page A: onUnmounted");
      },
    },
    [
      View(
        {
          class:
            "p-4 rounded-lg bg-blue-50 border border-blue-200 dark:bg-blue-950 dark:border-blue-800",
        },
        [
          View(
            { class: "text-sm font-medium text-blue-900 dark:text-blue-100" },
            "页面 A",
          ),
          View({ class: "text-xs text-blue-600 dark:text-blue-400 mt-1" }, [
            "这是一个子页面，用于演示 onMounted / onUnmounted 生命周期",
          ]),
        ],
      ),
    ],
  );
}

function LifecyclePageB(props) {
  return View(
    {
      class: cn(["space-y-4"]),
      onMounted() {
        props.addLog?.("Page B: onMounted");
      },
      onUnmounted() {
        props.addLog?.("Page B: onUnmounted");
      },
    },
    [
      View(
        {
          class:
            "p-4 rounded-lg bg-green-50 border border-green-200 dark:bg-green-950 dark:border-green-800",
        },
        [
          View(
            { class: "text-sm font-medium text-green-900 dark:text-green-100" },
            "页面 B",
          ),
          View({ class: "text-xs text-green-600 dark:text-green-400 mt-1" }, [
            "这是另一个子页面，用于对比演示生命周期的调用",
          ]),
        ],
      ),
    ],
  );
}

function LifecyclePageC(props) {
  return View(
    {
      class: cn(["space-y-4"]),
      onMounted() {
        props.addLog?.("Page C: onMounted");
      },
      onUnmounted() {
        props.addLog?.("Page C: onUnmounted");
      },
    },
    [
      View(
        {
          class:
            "p-4 rounded-lg bg-purple-50 border border-purple-200 dark:bg-purple-950 dark:border-purple-800",
        },
        [
          View(
            {
              class: "text-sm font-medium text-purple-900 dark:text-purple-100",
            },
            "页面 C",
          ),
          View({ class: "text-xs text-purple-600 dark:text-purple-400 mt-1" }, [
            "第三个子页面，用于观察多次切换时的生命周期调用",
          ]),
        ],
      ),
    ],
  );
}

function LifecyclePageD(props) {
  return View(
    {
      class: cn(["space-y-4"]),
      onMounted() {
        props.addLog?.("Page D: onMounted");
      },
      onUnmounted() {
        props.addLog?.("Page D: onUnmounted");
      },
    },
    [
      View(
        {
          class:
            "p-4 rounded-lg bg-purple-50 border border-purple-200 dark:bg-purple-950 dark:border-purple-800",
        },
        [
          View(
            {
              class: "text-sm font-medium text-purple-900 dark:text-purple-100",
            },
            "页面 D",
          ),
          View({ class: "text-xs text-purple-600 dark:text-purple-400 mt-1" }, [
            "第四个子页面，观察懒加载的页面能否正确触发生命周期",
          ]),
        ],
      ),
    ],
  );
}

function LifecyclePageE(props) {
  return View(
    {
      class: cn(["space-y-4"]),
      onMounted() {
        props.addLog?.("Page E: onMounted");
      },
      onUnmounted() {
        props.addLog?.("Page E: onUnmounted");
      },
    },
    [
      View(
        {
          class:
            "p-4 rounded-lg bg-purple-50 border border-purple-200 dark:bg-purple-950 dark:border-purple-800",
        },
        [
          View(
            {
              class: "text-sm font-medium text-purple-900 dark:text-purple-100",
            },
            "页面 E",
          ),
          View({ class: "text-xs text-purple-600 dark:text-purple-400 mt-1" }, [
            "第五个子页面，观察懒加载的页面能否正确触发生命周期",
          ]),
        ],
      ),
    ],
  );
}

export default function LifecycleView(props) {
  const logs = refarr([]);

  const addLog = (message) => {
    const time = new Date().toLocaleTimeString();
    logs.push({ time, message });
  };

  const routesConfigure = {
    pagea: {
      default: true,
      title: "页面 A",
      pathname: "/page-a",
      component: (p) => LifecyclePageA({ ...p, addLog }),
    },
    pageb: {
      title: "页面 B",
      pathname: "/page-b",
      component: (p) => LifecyclePageB({ ...p, addLog }),
    },
    pagec: {
      title: "页面 C",
      pathname: "/page-c",
      component: (p) => LifecyclePageC({ ...p, addLog }),
    },
    paged: {
      title: "页面 D",
      pathname: "/page-d",
      component: (p) => {
        return new Promise(async (resolve) => {
          setTimeout(() => {
            resolve(LifecyclePageD);
          }, 3000);
        });
      },
    },
    pagee: {
      title: "页面 E",
      pathname: "/page-e",
      component: (p) => {
        return new Promise((resolve) => {
          resolve(LifecyclePageE);
        });
      },
    },
  };

  const { routes, views, defaultRouteName } =
    Timeless.buildRoutes(routesConfigure);

  const router$ = new Timeless.NavigatorCore();
  const rootview$ = new Timeless.RouteViewCore({
    name: "root",
    pathname: "/",
    title: "Lifecycle Demo",
    visible: true,
    parent: null,
    views: [],
  });
  rootview$.isRoot = true;

  const subhistory$ = new Timeless.HistoryCore({
    view: rootview$,
    router: router$,
    routes,
    views: { root: rootview$ },
  });
  //   addLog("LifecycleView: mounted");
  const curRoute = ref("pageA");

  subhistory$.onRouteChange(({ view }) => {
    if (view) {
      curRoute.as(view.name.split(".").pop());
    }
  });
  //   console.log('[]defaultRouteName', defaultRouteName);
  subhistory$.push(defaultRouteName, {}, { ignore: true });

  return View({ class: cn(["space-y-8"]) }, [
    Section("Page Lifecycle", [
      Item("onMounted / onUnmounted", [
        View({ class: "flex gap-4" }, [
          View({ class: "flex-1 flex flex-col gap-4" }, [
            View({ class: "flex gap-2" }, [
              For({
                each: [
                  { key: "pagea", label: "页面 A" },
                  { key: "pageb", label: "页面 B" },
                  { key: "pagec", label: "页面 C" },
                  { key: "paged", label: "页面 D" },
                  { key: "pagee", label: "页面 E" },
                ],
                render(item) {
                  return View(
                    {
                      class: cn([
                        "px-4 py-2 rounded-md text-sm cursor-pointer transition-colors",
                        computed(curRoute, (r) =>
                          r === item.key
                            ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                            : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700",
                        ),
                      ]),
                      onClick() {
                        subhistory$.push(`root.${item.key}`);
                      },
                    },
                    item.label,
                  );
                },
              }),
            ]),
            View(
              { class: "relative border rounded-lg p-4 dark:border-zinc-800" },
              [
                StandardSubViews({
                  view: rootview$,
                  views,
                  history: subhistory$,
                  app: props.app,
                  placeholder: [
                    View({ class: "flex items-center justify-center h-full" }, [
                      View({ class: "flex flex-col items-center gap-3" }, [
                        View({
                          class:
                            "w-6 h-6 border-2 border-zinc-300 border-t-zinc-600 rounded-full animate-spin dark:border-zinc-600 dark:border-t-zinc-300",
                        }),
                        View(
                          { class: "text-sm text-zinc-400 dark:text-zinc-500" },
                          "加载中...",
                        ),
                      ]),
                    ]),
                  ],
                  // @ts-ignore
                  addLog,
                }),
              ],
            ),
          ]),
          View(
            {
              class:
                "w-[320px] border rounded-lg dark:border-zinc-800 flex flex-col",
            },
            [
              View(
                {
                  class:
                    "px-4 py-2 border-b dark:border-zinc-800 flex items-center justify-between",
                },
                [
                  View({ class: "text-sm font-medium" }, "Lifecycle Logs"),
                  View(
                    {
                      class:
                        "text-xs text-zinc-500 cursor-pointer hover:text-zinc-700 dark:hover:text-zinc-300",
                      onClick() {
                        logs.splice(0, logs.length);
                      },
                    },
                    "Clear",
                  ),
                ],
              ),
              View(
                {
                  class:
                    "flex-1 overflow-y-auto p-3 font-mono text-xs max-h-[400px]",
                },
                [
                  For({
                    each: logs,
                    render(log) {
                      return View(
                        {
                          class:
                            "py-1 border-b border-zinc-100 dark:border-zinc-800 last:border-0",
                        },
                        [
                          View({ class: "flex gap-2" }, [
                            View({ class: "text-zinc-400 shrink-0" }, log.time),
                            View(
                              { class: "text-zinc-700 dark:text-zinc-300" },
                              log.message,
                            ),
                          ]),
                        ],
                      );
                    },
                  }),
                ],
              ),
            ],
          ),
        ]),
      ]),
    ]),
  ]);
}

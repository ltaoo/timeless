/**
 *
 * @param {ViewComponentProps} props
 * @returns
 */
export default function HomePageView(props) {
  const collapsed_ = ref(false);
  const hideText_ = ref(false);

  const sidemenu$ = Timeless.RouteMenusModel({
    view: props.view,
    history: props.history,
    menus: /** @type {{ title: string; name: PageKey; icon: string }[]} */ ([
      {
        title: "General",
        name: "root.home_layout.index.general",
        icon: "house",
      },
      {
        title: "Input",
        name: "root.home_layout.index.form",
        icon: "file-text",
      },
      {
        title: "Field",
        name: "root.home_layout.index.validate",
        icon: "check",
      },
      { title: "LLM", name: "root.home_layout.index.llm", icon: "bolt" },
      {
        title: "Data Display",
        name: "root.home_layout.index.data",
        icon: "table",
      },
      {
        title: "ScrollView",
        name: "root.home_layout.index.scroll",
        icon: "arrow-down-to-line",
      },
      {
        title: "Feedback",
        name: "root.home_layout.index.feedback",
        icon: "message-square-more",
      },
      { title: "Navigation", name: "root.home_layout.index.nav", icon: "menu" },
      {
        title: "Overlay",
        name: "root.home_layout.index.overlay",
        icon: "square-arrow-down",
      },
      {
        title: "Command",
        name: "root.home_layout.index.command",
        icon: "play",
      },
      {
        title: "Debug",
        name: "root.home_layout.index.debug",
        icon: "circle-alert",
      },
      {
        title: "Lifecycle",
        name: "root.home_layout.index.lifecycle",
        icon: "refresh-ccw",
      },
      {
        title: "Download Task",
        name: "root.home_layout.index.download_task",
        icon: "download",
      },
      { title: "Flow", name: "root.home_layout.index.flow", icon: "git-fork" },
    ]),
  });

  props.view.onSubViewsChange((subviews) => {
    console.log("[]index.js - subviews change", subviews, subviews.length);
  });

  return View(
    {
      class: "h-full",
      onMounted() {
        console.log("home/index.js mounted");
      },
    },
    [
      SplitView({
        panels: [
          {
            size: 220,
            minSize: 40,
            collapsed: collapsed_,
            onCollapse(event) {
              if (!event.data.collapsed) {
                hideText_.set(false);
              }
            },
            onCollapsed(event) {
              if (event.data.collapsed) {
                hideText_.set(true);
              }
            },
            content() {
              return Flex({ direction: "col", class: "overflow-hidden py-4" }, [
                Flex(
                  { items: "center", justify: "between", class: "px-3 mb-3" },
                  [
                    View(
                      {
                        class:
                          "text-xs font-bold text-zinc-400 uppercase tracking-widest",
                        style: {
                          "white-space": "nowrap",
                          overflow: "hidden",
                        },
                      },
                      ["Components"],
                    ),
                  ],
                ),
                View({ class: "flex-1 overflow-y-auto" }, [
                  For({
                    each: sidemenu$.menus,
                    render(menu) {
                      return View(
                        {
                          class: classNames([
                            "px-3 py-2 text-sm cursor-pointer transition-colors",
                            computed(sidemenu$.cur, (t) => {
                              return sidemenu$.isSelected(t, menu)
                                ? "text-zinc-900 bg-zinc-100 font-medium dark:text-zinc-50 dark:bg-zinc-800"
                                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50";
                            }),
                          ]),
                          style: {
                            "white-space": "nowrap",
                            overflow: "hidden",
                          },
                          onClick() {
                            props.history.push(menu.name);
                          },
                        },
                        [
                          Flex({ items: "center", gap: 2 }, [
                            View(
                              {
                                class:
                                  "flex items-center w-[16px] h-[20px] shrink-0",
                              },
                              [Icon({ name: menu.icon, size: 16 })],
                            ),
                            View(
                              {
                                class: computed(hideText_, (c) =>
                                  c ? "hidden" : "flex-1",
                                ),
                              },
                              [menu.title],
                            ),
                          ]),
                        ],
                      );
                    },
                  }),
                ]),
              ]);
            },
          },
          {
            size: "auto",
            content() {
              return View({ class: "flex flex-col h-full" }, [
                View(
                  {
                    onClick() {
                      collapsed_.toggle();
                    },
                  },
                  [View({}, [Icon({ name: "panel-left" })])],
                ),
                View(
                  {
                    class: "flex-1",
                  },
                  [KeepAliveSubViews(props)],
                ),
              ]);
            },
          },
        ],
      }),
    ],
  );
}

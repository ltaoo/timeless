/**
 *
 * @param {ViewComponentProps} props
 * @returns
 */
export default function HomePageView(props) {
  const sidemenu$ = Timeless.RouteMenusModel({
    view: props.view,
    history: props.history,
    menus: /** @type {{ title: string; name: PageKey }[]} */ ([
      { title: "General", name: "root.home_layout.index.general" },
      { title: "Input", name: "root.home_layout.index.form" },
      { title: "Field", name: "root.home_layout.index.validate" },
      { title: "LLM", name: "root.home_layout.index.llm" },
      { title: "Data Display", name: "root.home_layout.index.data" },
      { title: "ScrollView", name: "root.home_layout.index.scroll" },
      { title: "Feedback", name: "root.home_layout.index.feedback" },
      { title: "Navigation", name: "root.home_layout.index.nav" },
      { title: "Overlay", name: "root.home_layout.index.overlay" },
      { title: "Command", name: "root.home_layout.index.command" },
      { title: "Debug", name: "root.home_layout.index.debug" },
      { title: "Lifecycle", name: "root.home_layout.index.lifecycle" },
      { title: "Download Task", name: "root.home_layout.index.download_task" },
      { title: "Flow", name: "root.home_layout.index.flow" },
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
            content() {
              return Flex({ direction: "col", class: "py-4" }, [
                Flex(
                  { items: "center", justify: "between", class: "px-3 mb-3" },
                  [
                    View(
                      {
                        class:
                          "text-xs font-bold text-zinc-400 uppercase tracking-widest",
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
                          onClick() {
                            props.history.push(menu.name);
                          },
                        },
                        [menu.title],
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
              return KeepAliveSubViews(props);
            },
          },
        ],
      }),
    ],
  );
}

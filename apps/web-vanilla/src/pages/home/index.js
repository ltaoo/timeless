export function HomePageView(props) {
  // Shared state for interactive demos
  // const activeCategory = ref("general");
  // const curView = ref(props.view.curSubView);
  const curSubView = ref(props.view.curView);
  props.view.onCurViewChange((view) => {
    // console.log("[LAYOUT]handle cur view change", view.name);
    curSubView.as(view);
  });

  const categories = [
    { label: "General", value: "root.home_layout.index.general" },
    { label: "Form", value: "root.home_layout.index.form" },
    { label: "Data Display", value: "root.home_layout.index.data" },
    { label: "Feedback", value: "root.home_layout.index.feedback" },
    { label: "Navigation", value: "root.home_layout.index.nav" },
    { label: "Overlay", value: "root.home_layout.index.overlay" },
  ];

  return View({ class: cn(["flex h-full"]) }, [
    // Sidebar
    View(
      {
        class: cn([
          "w-[180px] border-r border-zinc-200 dark:border-zinc-800 py-4",
        ]),
      },
      [
        View(
          {
            class: cn([
              "px-3 mb-3 text-xs font-bold text-zinc-400 uppercase tracking-widest",
            ]),
          },
          [Txt("Components")],
        ),
        For({
          each: refarr(categories),
          render(menu) {
            return View(
              {
                class: cn([
                  "px-3 py-2 text-sm cursor-pointer transition-colors",
                  computed(curSubView, (d) => {
                    return d && d.name === menu.value
                      ? "text-zinc-900 bg-zinc-100 font-medium dark:text-zinc-50 dark:bg-zinc-800"
                      : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50";
                  }),
                ]),
                onClick() {
                  props.history.push(menu.value);
                  // activeCategory.as(cat.value);
                },
              },
              [Txt(menu.label)],
            );
          },
        }),
      ],
    ),
    // Content
    View(
      {
        class: "relative flex-1 w-0 overflow-y-auto p-6",
      },
      [
        RouteSubViews({
          view: props.view,
          history: props.history,
          views: props.views,
        }),
      ],
    ),
  ]);
}

import { defaultRouteName } from "@/store/routes.js";

export default function HomePageView(props) {
  const curSubView = ref(props.view.curView);
  props.view.onCurViewChange((view) => {
    curSubView.as(view);
  });
  const sidemenu$ = Timeless.RouteMenusModel({
    route: props.view.curView ? props.view.curView.name : defaultRouteName,
    history: props.history,
    menus: [
      { title: "General", url: "root.home_layout.index.general" },
      { title: "Form", url: "root.home_layout.index.form" },
      { title: "Data Display", url: "root.home_layout.index.data" },
      { title: "Feedback", url: "root.home_layout.index.feedback" },
      { title: "Navigation", url: "root.home_layout.index.nav" },
      { title: "Overlay", url: "root.home_layout.index.overlay" },
    ],
  });

  const categories = refarr(sidemenu$.menus);

  return View({ class: "flex w-full h-screen" }, [
    // Sidebar
    View(
      { class: "w-[180px] border-r border-zinc-200 dark:border-zinc-800 py-4" },
      [
        View(
          {
            class:
              "px-3 mb-3 text-xs font-bold text-zinc-400 uppercase tracking-widest",
          },
          [Txt("Components")],
        ),
        For({
          each: categories,
          render(menu) {
            return View(
              {
                class: cn([
                  "px-3 py-2 text-sm cursor-pointer transition-colors",
                  computed(curSubView, (d) => {
                    return d && d.name === menu.url
                      ? "text-zinc-900 bg-zinc-100 font-medium dark:text-zinc-50 dark:bg-zinc-800"
                      : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50";
                  }),
                ]),
                onClick() {
                  props.history.push(menu.url);
                  // activeCategory.as(cat.value);
                },
              },
              [Txt(menu.title)],
            );
          },
        }),
      ],
    ),
    View({ class: "relative overflow-y-auto flex-1 w-0 h-full p-6" }, [
      KeepAliveSubViews({
        ...props,
      }),
    ]),
  ]);
}

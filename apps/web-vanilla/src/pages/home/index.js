import { defaultRouteName } from "@/store/index.js";
// import { ResizablePanelsCore, ResizablePanelCore } from "@timeless/ui";
// import { ResizablePanels, ResizablePanel, ResizableHandle } from "@timeless/shadcnui";

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
      { title: "Form Validate", url: "root.home_layout.index.validate" },
      { title: "Data Display", url: "root.home_layout.index.data" },
      { title: "Feedback", url: "root.home_layout.index.feedback" },
      { title: "Navigation", url: "root.home_layout.index.nav" },
      { title: "Overlay", url: "root.home_layout.index.overlay" },
      { title: "Debug", url: "root.home_layout.index.debug" },
    ],
  });

  const categories = refarr(sidemenu$.menus);

  // 创建 ResizablePanels 实例
  const panelsGroup = new Timeless.ui.ResizablePanelsCore({
    direction: "horizontal",
  });

  // 创建侧边栏面板
  const sidebarPanel = new Timeless.ui.ResizablePanelCore({
    defaultSize: 25,
    minSize: 20,
    maxSize: 50,
  });

  // 创建主内容面板
  const contentPanel = new Timeless.ui.ResizablePanelCore({
    defaultSize: 85,
    minSize: 70,
  });

  return TooltipProvider({}, [
    View({ class: "w-full h-screen" }, [
      ResizablePanels(
        {
          store: panelsGroup,
          direction: "horizontal",
          class: "w-full h-full",
        },
        [
          // Sidebar Panel
          ResizablePanel(
            {
              store: sidebarPanel,
              group: panelsGroup,
            },
            [
              View(
                {
                  class:
                    "border-r border-zinc-200 dark:border-zinc-950 py-4 h-full",
                },
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
                          },
                        },
                        [Txt(menu.title)],
                      );
                    },
                  }),
                ],
              ),
            ],
          ),

          // Resize Handle
          ResizableHandle({
            store: panelsGroup,
            panelBefore: sidebarPanel,
            panelAfter: contentPanel,
            withHandle: true,
          }),

          // Content Panel
          ResizablePanel(
            {
              store: contentPanel,
              group: panelsGroup,
            },
            [
              View({ class: "overflow-y-auto h-full" }, [
                View({ class: "relative p-6" }, [
                  KeepAliveSubViews({
                    ...props,
                  }),
                ]),
              ]),
            ],
          ),
        ],
      ),
    ]),
  ]);
}

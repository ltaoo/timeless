export default function HomePageView(props) {
  const sidemenu$ = Timeless.kit.RouteMenusModel({
    view: props.view,
    history: props.history,
    menus: [
      { title: "General", url: "root.home_layout.index.general" },
      { title: "Input", url: "root.home_layout.index.form" },
      { title: "Field", url: "root.home_layout.index.validate" },
      { title: "Data Display", url: "root.home_layout.index.data" },
      { title: "ScrollView", url: "root.home_layout.index.scroll" },
      { title: "Feedback", url: "root.home_layout.index.feedback" },
      { title: "Navigation", url: "root.home_layout.index.nav" },
      { title: "Overlay", url: "root.home_layout.index.overlay" },
      { title: "Command", url: "root.home_layout.index.command" },
      { title: "Debug", url: "root.home_layout.index.debug" },
      { title: "Lifecycle", url: "root.home_layout.index.lifecycle" },
      { title: "Download Task", url: "root.home_layout.index.download_task" },
    ],
  });

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
    View({ class: "w-full h-screen bg-background text-foreground" }, [
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
                  class: "py-4 h-full flex flex-col",
                },
                [
                  View(
                    {
                      class: "px-3 mb-3 flex items-center justify-between",
                    },
                    [
                      View(
                        {
                          class:
                            "text-xs font-bold text-zinc-400 uppercase tracking-widest",
                        },
                        [Txt("Components")],
                      ),
                    ],
                  ),
                  View({ class: "flex-1 overflow-y-auto" }, [
                    For({
                      each: sidemenu$.menus,
                      render(menu) {
                        return View(
                          {
                            class: cn([
                              "px-3 py-2 text-sm cursor-pointer transition-colors",
                              computed(sidemenu$.cur, (t) => {
                                return t && t.name === menu.url
                                  ? "text-zinc-900 bg-zinc-100 font-medium dark:text-zinc-50 dark:bg-zinc-800"
                                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50";
                              }),
                            ]),
                            onClick() {
                              sidemenu$.handleClick(menu);
                            },
                          },
                          [menu.title],
                        );
                      },
                    }),
                  ]),
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
                KeepAliveSubViews({
                  ...props,
                }),
              ]),
            ],
          ),
        ],
      ),
    ]),
  ]);
}

/**
 * @file 首页布局
 */

/**
 * @param {ViewComponentProps} props
 */
export default function HomeLayoutView(props) {
  const sidemenu$ = Timeless.RouteMenusModel({
    view: props.view,
    history: props.history,
    menus: [
      { title: "Home", name: "root.home_layout.index", children: [] },
      { title: "Tables", name: "root.home_layout.tables", children: [] },
      { title: "Settings", name: "root.home_layout.settings" },
    ],
  });

  return SplitView({
    resizable: false,
    panels: [
      {
        size: 72,
        style: { overflow: "hidden" },
        content() {
          return View(
            {
              class:
                "sidebar-wrapper py-6 border-r border-zinc-200 dark:border-zinc-800 h-full",
            },
            [
              Flex(
                {
                  direction: "col",
                  items: "center",
                  justify: "between",
                  class: "h-full",
                },
                [
                  // Logo
                  Flex(
                    {
                      items: "center",
                      justify: "center",
                      class:
                        "relative w-10 h-10 rounded-xl font-bold text-xl mb-8 shadow-sm cursor-pointer hover:opacity-90 transition-opacity",
                      onClick() {
                        props.history.push("root.home_layout.index.general");
                      },
                    },
                    [
                      "T",
                      Show({
                        when: computed(sidemenu$.cur, (t) => {
                          return sidemenu$.isSelected(t, sidemenu$.menus[0]);
                        }),
                        ok() {
                          return View({
                            class:
                              "absolute top-[-4px] right-[-4px] w-2 h-2 rounded-full bg-zinc-500",
                          });
                        },
                      }),
                    ],
                  ),
                  // Bottom Actions
                  Flex(
                    { direction: "col", items: "center", class: "gap-6 mb-4" },
                    [
                      Button(
                        {
                          store: new Timeless.ui.ButtonCore({
                            variant: "outline",
                            onClick() {
                              const cur = props.app.getTheme();
                              const next = cur === "dark" ? "light" : "dark";
                              props.app.setTheme(next);
                            },
                          }),
                        },
                        [Icon({ name: "sun", size: 24 })],
                      ),
                      // User Avatar
                      (() => {
                        const dropdown$ = new Timeless.ui.DropdownMenuCore({
                          trigger: "hover",
                          side: "right",
                          align: "end",
                          offsetX: 4,
                          offsetY: -8,
                          items: [
                            new Timeless.ui.MenuItemCore({
                              label: "Profile",
                              onClick() {
                                const toasts = [
                                  {
                                    type: "success",
                                    text: [
                                      "Welcome back!",
                                      "Have a productive day.",
                                    ],
                                  },
                                  {
                                    type: "success",
                                    text: ["Profile updated successfully."],
                                  },
                                  {
                                    type: "info",
                                    text: ["You have 3 unread notifications."],
                                  },
                                  {
                                    type: "info",
                                    text: [
                                      "Session active",
                                      "Last login: 2 hours ago.",
                                    ],
                                  },
                                  {
                                    type: "loading",
                                    text: [
                                      "Syncing your data...",
                                      "This may take a moment.",
                                    ],
                                  },
                                  {
                                    type: "warning",
                                    text: [
                                      "Storage almost full.",
                                      "Consider cleaning up.",
                                    ],
                                  },
                                  {
                                    type: "error",
                                    text: [
                                      "Connection lost.",
                                      "Retrying in 5s...",
                                    ],
                                  },
                                  { text: ["All systems operational."] },
                                ];
                                const pick =
                                  toasts[
                                    Math.floor(Math.random() * toasts.length)
                                  ];
                                // @ts-ignore
                                props.app.tip(pick);
                              },
                            }),
                            new Timeless.ui.MenuItemCore({
                              label: "Bill",
                              onClick() {
                                console.log("Bill clicked");
                              },
                            }),
                            new Timeless.ui.MenuItemCore({
                              label: "Other",
                              menu: new Timeless.ui.MenuCore({
                                items: [
                                  new Timeless.ui.MenuItemCore({
                                    label: "Toast",
                                    onClick() {
                                      const toasts = [
                                        { text: ["Task completed!"] },
                                        {
                                          text: [
                                            "File saved.",
                                            "Auto-backup enabled.",
                                          ],
                                        },
                                        {
                                          text: [
                                            "Reminder:",
                                            "Meeting starts in 15 minutes.",
                                          ],
                                        },
                                        {
                                          text: [
                                            "Download finished.",
                                            "3 files ready.",
                                          ],
                                        },
                                        { text: ["Settings applied."] },
                                      ];
                                      const pick =
                                        toasts[
                                          Math.floor(
                                            Math.random() * toasts.length,
                                          )
                                        ];
                                      props.app.tip(pick);
                                    },
                                  }),
                                  new Timeless.ui.MenuItemCore({
                                    label: "Item 2",
                                    onClick() {
                                      console.log("Item 2 clicked");
                                    },
                                  }),
                                  new Timeless.ui.MenuItemCore({
                                    label: "Item 3",
                                    onClick() {
                                      console.log("Item 3 clicked");
                                    },
                                  }),
                                  new Timeless.ui.MenuItemCore({
                                    label: "Close DropdownMenu",
                                    onClick() {
                                      console.log("Item 4 clicked");
                                      dropdown$.hide();
                                    },
                                  }),
                                  new Timeless.ui.MenuItemCore({
                                    label: "Item 5",
                                    onClick() {
                                      console.log("Item 5 clicked");
                                    },
                                  }),
                                ],
                              }),
                              onClick() {
                                console.log("Other clicked");
                              },
                            }),
                            new Timeless.ui.MenuItemCore({
                              label: "Logout",
                              onClick() {
                                console.log("Logout clicked");
                                dropdown$.hide();
                                props.history.destroyAllAndPush("root.login");
                              },
                            }),
                          ],
                        });
                        return DropdownMenu(
                          {
                            store: dropdown$,
                          },
                          [
                            View(
                              {
                                class:
                                  "w-10 h-10 rounded-full bg-zinc-100 overflow-hidden cursor-pointer border border-zinc-200 hover:ring-2 ring-zinc-200 transition-all dark:bg-zinc-800 dark:border-zinc-700 dark:ring-zinc-700",
                                onClick() {
                                  console.log("Avatar clicked");
                                },
                              },
                              [
                                Img({
                                  class: "w-full h-full object-cover",
                                  src: "public/avatar.jpeg",
                                  alt: "User Avatar",
                                }),
                              ],
                            ),
                          ],
                        );
                      })(),
                    ],
                  ),
                ],
              ),
            ],
          );
        },
      },
      {
        size: "auto",
        content() {
          return KeepAliveSubViews(props);
        },
      },
    ],
  });
}

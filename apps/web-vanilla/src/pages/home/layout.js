/** 首页布局 */
import { SidebarLayout } from "@/components/layout.js";

export default function HomeLayoutView(props) {
  const sidemenu$ = Timeless.kit.RouteMenusModel({
    view: props.view,
    history: props.history,
    menus: [
      { title: "Home", url: "root.home_layout.index", children: [] },
      { title: "Article", url: "root.home_layout.article" },
      { title: "Project", url: "root.home_layout.project" },
      { title: "Settings", url: "root.home_layout.settings" },
    ],
  });

  return SidebarLayout(
    {
      sidebarWidth: "72px",
      sidebarClass:
        "sidebar-wrapper py-6 border-r border-zinc-200 dark:border-zinc-800",
      sidebar: [
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
                Show(
                  {
                    when: computed(sidemenu$.cur, (t) => {
                      return sidemenu$.isSelected(t, sidemenu$.menus[0]);
                    }),
                  },
                  [
                    h(View, {
                      class:
                        "absolute top-[-4px] right-[-4px] w-2 h-2 rounded-full bg-zinc-500",
                    }),
                  ],
                ),
              ],
            ),

            // Middle spacer
            // Flex({ direction: "col", items: "center", class: "flex-1 flex gap-3" }, [
            //   View(
            //     {
            //       class: "cursor-pointer",
            //       onClick() {
            //         props.history.push("root.home_layout.article");
            //       },
            //     },
            //     ["Article"],
            //   ),
            //   Separator({ orientation: "horizontal", class: "w-8 mx-auto" }),
            //   Flex({ direction: "col", items: "center", class: "gap-2" }, [
            //     For({
            //       each: projects,
            //       render(project) {
            //         return View(
            //           {
            //             class: computed(sidemenu$.cur, () => {
            //               const isActive = sidemenu$.isSubRoute(
            //                 "root.home_layout.project",
            //               );
            //               return isActive
            //                 ? "w-10 h-10 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-700 cursor-pointer transition-colors dark:bg-zinc-800 dark:text-white"
            //                 : "w-10 h-10 rounded-lg hover:bg-zinc-100 flex items-center justify-center text-zinc-500 hover:text-black cursor-pointer transition-colors dark:hover:bg-zinc-800 dark:hover:text-white";
            //             }),
            //             onClick() {
            //               props.history.push(
            //                 "root.home_layout.project.workspace",
            //                 {
            //                   id: project.id,
            //                 },
            //               );
            //             },
            //           },
            //           [project.name.charAt(0)],
            //         );
            //       },
            //     }),
            //   ]),
            // ]),

            // Bottom Actions
            Flex({ direction: "col", items: "center", class: "gap-6 mb-4" }, [
              // Settings Icon
              // View(
              //   {
              //     class: computed(sidemenu$.cur, () => {
              //       return sidemenu$.isActive("root.home_layout.settings")
              //         ? "w-10 h-10 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-500 cursor-pointer transition-colors dark:bg-zinc-800 dark:text-white"
              //         : "w-10 h-10 rounded-lg hover:bg-zinc-100 flex items-center justify-center text-zinc-500 hover:text-black cursor-pointer transition-colors dark:hover:bg-zinc-800 dark:hover:text-white";
              //     }),
              //     onClick() {
              //       props.history.push("root.home_layout.settings");
              //       console.log("Settings clicked");
              //     },
              //   },
              //   [
              //     Timeless.icons.BoltOutlined({
              //       style: "font-size: 24px",
              //     }),
              //   ],
              // ),
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
                [Timeless.icons.SunOutlined({ class: "size-4" })],
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
                        props.app.tip({
                          text: ["Hello"],
                        });
                        console.log("Profile clicked");
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
                            label: "Item 1",
                            onClick() {
                              console.log("Item 1 clicked");
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
                          onMounted($elm) {
                            $elm.src = "public/avatar.jpeg";
                            $elm.alt = "User Avatar";
                          },
                        }),
                      ],
                    ),
                  ],
                );
              })(),
            ]),
          ],
        ),
      ],
    },
    [KeepAliveSubViews(props)],
  );
}

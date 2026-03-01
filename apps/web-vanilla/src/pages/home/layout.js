/** 首页布局 */
import { defaultRouteName } from "@/store/index.js";
import NotFoundPageView from "@/pages/notfound/index.js";

export default function HomeLayoutView(props) {
  const view = props.view;
  const subViews = refarr([]);
  const curSubView = refobj(view.curView);
  view.onCurViewChange((view) => {
    curSubView.as(view);
  });
  view.onSubViewAppended((v) => {
    subViews.push(v);
  });
  const sidemenu$ = Timeless.RouteMenusModel({
    route: props.view.curView ? props.view.curView.name : defaultRouteName,
    history: props.history,
    menus: [
      { title: "Home", url: "root.home_layout.index" },
      { title: "Settings", url: "root.home_layout.settings" },
    ],
  });
  const curMenu = ref(sidemenu$.curMenu);
  sidemenu$.onStateChange(() => {
    curMenu.as(sidemenu$.curMenu);
  });

  return Flex({ class: "layout_home w-full h-full" }, [
    View(
      {
        class:
          "sidebar-wrapper w-[72px] h-full flex flex-col items-center py-6 border-r border-zinc-200 bg-white dark:bg-zinc-950 dark:border-zinc-800",
      },
      [
        // Logo
        View(
          {
            class:
              "relative w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center font-bold text-xl mb-8 shadow-sm cursor-pointer hover:opacity-90 transition-opacity dark:bg-white dark:text-black",
            onClick() {
              props.history.push("root.home_layout.index.general");
            },
          },
          [
            Txt("T"),
            Show(
              {
                when: computed(curMenu, (c) => {
                  return c.startsWith("root.home_layout.index");
                }),
              },
              [
                View({
                  class:
                    "absolute top-[-4px] right-[-4px] w-2 h-2 rounded-full bg-black dark:bg-white",
                }),
              ],
            ),
          ],
        ),

        // Middle spacer
        View({ class: "flex-1" }, []),

        // Bottom Actions
        View({ class: "flex flex-col gap-6 items-center mb-4" }, [
          // Settings Icon
          View(
            {
              class: computed(curMenu, (c) => {
                return c === "root.home_layout.settings"
                  ? "w-10 h-10 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-500 cursor-pointer transition-colors dark:bg-zinc-800 dark:text-white"
                  : "w-10 h-10 rounded-lg hover:bg-zinc-100 flex items-center justify-center text-zinc-500 hover:text-black cursor-pointer transition-colors dark:hover:bg-zinc-800 dark:hover:text-white";
              }),
              onClick() {
                props.history.push("root.home_layout.settings");
                console.log("Settings clicked");
              },
            },
            [
              Timeless.icons.BoltOutlined({
                style: "font-size: 24px",
              }),
            ],
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
                    View(
                      {
                        type: "img",
                        class: "w-full h-full object-cover",
                        onMounted($elm) {
                          $elm.src = "public/avatar.jpeg";
                          $elm.alt = "User Avatar";
                        },
                      },
                      [],
                    ),
                  ],
                ),
              ],
            );
          })(),
        ]),
      ],
    ),
    View({ class: "relative overflow-y-auto flex-1 w-0 h-full" }, [
      KeepAliveSubViews({
        ...props,
        NotFound: NotFoundPageView,
      }),
    ]),
  ]);
}

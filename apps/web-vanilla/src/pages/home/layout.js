/** 首页布局 */
import { NotFoundPageView } from "../notfound/index.js";

export function HomeLayoutView(props) {
  const view = props.view;
  const subViews = refarr([]);
  const curSubView = refobj(view.curView);
  view.onCurViewChange((view) => {
    curSubView.as(view);
  });
  view.onSubViewAppended((v) => {
    subViews.push(v);
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
              "w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center font-bold text-xl mb-8 shadow-sm cursor-pointer hover:opacity-90 transition-opacity dark:bg-white dark:text-black",
          },
          [Txt("T")],
        ),

        // Middle spacer
        View({ class: "flex-1" }, []),

        // Bottom Actions
        View({ class: "flex flex-col gap-6 items-center mb-4" }, [
          // Settings Icon
          View(
            {
              class:
                "w-10 h-10 rounded-lg hover:bg-zinc-100 flex items-center justify-center text-zinc-500 hover:text-black cursor-pointer transition-colors dark:hover:bg-zinc-800 dark:hover:text-white",
              onClick() {
                console.log("Settings clicked");
              },
              onMounted($elm) {
                $elm.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>`;
              },
            },
            [],
          ),
          // User Avatar

          DropdownMenu(
            {
              store: new Timeless.ui.DropdownMenuCore({
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
                    },
                  }),
                ],
              }),
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
                        $elm.src = "https://github.com/shadcn.png";
                        $elm.alt = "User Avatar";
                      },
                    },
                    [],
                  ),
                ],
              ),
            ],
          ),
        ]),
      ],
    ),
    For({
      class: "relative flex-1 w-0 h-full",
      each: subViews,
      render(sub_view) {
        const PageView = props.views[sub_view.name];
        if (!PageView) {
          return NotFoundPageView({
            history: props.history,
          });
        }
        const displayed = computed(curSubView, (s) => {
          return [
            "page absolute inset-0 right-0 h-full",
            s && s.name === sub_view.name ? "display" : "hidden",
          ].join(" ");
        });
        return View(
          {
            class: displayed,
            dataset: {
              name: sub_view.name,
              pathname: sub_view.pathname,
            },
          },
          [
            PageView({
              view: sub_view,
              app: props.app,
              history: props.history,
              storage: props.storage,
              client: props.client,
              views: props.views,
            }),
          ],
        );
      },
    }),
  ]);
}

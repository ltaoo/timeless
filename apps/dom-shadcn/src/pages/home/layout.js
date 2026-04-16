/**
 * 首页布局
 */
import { View, Show, Icon, Img, computed } from "@timeless/timeless";
import {
  KeepAliveSubViews,
  Separator,
  DropdownMenu,
  Button,
  ui,
} from "@timeless/shadcn";
import { RouteMenusModel } from "@timeless/kit";

export default function HomeLayoutView(props) {
  const sidemenu$ = RouteMenusModel({
    view: props.view,
    history: props.history,
    menus: [
      { title: "Home", name: "root.home_layout.index", children: [] },
      { title: "Article", name: "root.home_layout.article" },
      { title: "Project", name: "root.home_layout.project" },
      { title: "Settings", name: "root.home_layout.settings" },
      { title: "Chat", name: "root.home_layout.chat" },
    ],
  });

  return View(
    {
      class: "home-layout",
      style: {
        display: "flex",
        height: "100%",
      },
    },
    [
      View(
        {
          class: "sidebar-wrapper",
          style: {
            width: "80px",
            padding: "24px 0",
            // "border-right": "1px solid #e4e4e7",
            display: "flex",
            "flex-direction": "column",
            "justify-content": "space-between",
          },
        },
        [
          View(
            {
              style: {
                display: "flex",
                "flex-direction": "column",
                "align-items": "center",
                gap: "12px",
              },
              class: "flex-1",
            },
            [
              View(
                {
                  style: {
                    position: "relative",
                    width: "40px",
                    height: "40px",
                    "border-radius": "12px",
                    display: "flex",
                    "align-items": "center",
                    "justify-content": "center",
                    "font-weight": "bold",
                    "font-size": "20px",
                    cursor: "pointer",
                  },
                  class: "bg-zinc-100 dark:bg-zinc-800",
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
              View(
                {
                  style: {
                    width: "40px",
                    height: "40px",
                    "border-radius": "8px",
                    display: "flex",
                    "align-items": "center",
                    "justify-content": "center",
                    cursor: "pointer",
                  },
                  class: "hover:bg-zinc-100 dark:hover:bg-zinc-800",
                  onClick() {
                    props.history.push("root.home_layout.article");
                  },
                },
                [Icon({ name: "rss", size: 24 })],
              ),
              View(
                {
                  style: {
                    width: "40px",
                    height: "40px",
                    "border-radius": "8px",
                    display: "flex",
                    "align-items": "center",
                    "justify-content": "center",
                    cursor: "pointer",
                  },
                  class: "hover:bg-zinc-100 dark:hover:bg-zinc-800",
                  onClick() {
                    props.history.push("root.home_layout.chat");
                  },
                },
                [Icon({ name: "message-square-more", size: 24 })],
              ),
              Separator({ orientation: "horizontal" }),
            ],
          ),
          View(
            {
              style: {
                display: "flex",
                "flex-direction": "column",
                alignItems: "center",
                gap: "24px",
                padding: "16px 0",
              },
            },
            [
              Button(
                {
                  store: new ui.ButtonCore({
                    onClick() {
                      props.history.push("root.admin_layout.dashboard");
                    },
                  }),
                },
                [Icon({ name: "grid-3x3", size: 24 })],
              ),
              Button(
                {
                  store: new ui.ButtonCore({
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
                const dropdown$ = new ui.DropdownMenuCore({
                  trigger: "hover",
                  side: "right",
                  align: "end",
                  offsetX: 4,
                  offsetY: -8,
                  items: [
                    new ui.MenuItemCore({
                      label: "Profile",
                      onClick() {
                        const toasts = [
                          {
                            type: "success",
                            text: ["Welcome back!", "Have a productive day."],
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
                            text: ["Connection lost.", "Retrying in 5s..."],
                          },
                          { text: ["All systems operational."] },
                        ];
                        const pick =
                          toasts[Math.floor(Math.random() * toasts.length)];
                        // @ts-ignore
                        props.app.tip(pick);
                      },
                    }),
                    new ui.MenuItemCore({
                      label: "Bill",
                      onClick() {
                        console.log("Bill clicked");
                      },
                    }),
                    new ui.MenuItemCore({
                      label: "Other",
                      menu: new ui.MenuCore({
                        items: [
                          new ui.MenuItemCore({
                            label: "Toast",
                            onClick() {
                              const toasts = [
                                { text: ["Task completed!"] },
                                {
                                  text: ["File saved.", "Auto-backup enabled."],
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
                                  Math.floor(Math.random() * toasts.length)
                                ];
                              props.app.tip(pick);
                            },
                          }),
                          new ui.MenuItemCore({
                            label: "Item 2",
                            onClick() {
                              console.log("Item 2 clicked");
                            },
                          }),
                          new ui.MenuItemCore({
                            label: "Item 3",
                            onClick() {
                              console.log("Item 3 clicked");
                            },
                          }),
                          new ui.MenuItemCore({
                            label: "Close DropdownMenu",
                            onClick() {
                              console.log("Item 4 clicked");
                              dropdown$.hide();
                            },
                          }),
                          new ui.MenuItemCore({
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
                    new ui.MenuItemCore({
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
                          src: "/avatar.jpeg",
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
      View(
        {
          style: {
            flex: 1,
            overflow: "auto",
          },
        },
        [KeepAliveSubViews(props)],
      ),
    ],
  );
}

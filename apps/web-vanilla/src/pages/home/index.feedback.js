import { Section, Item } from "@/components/index.js";

export default function FeedbackView() {
  const dialog$ = new Timeless.ui.DialogCore({
    title: "Dialog Title",
    onOk() {
      dialog$.okBtn.setLoading(true);
      setTimeout(() => {
        dialog$.okBtn.setLoading(false);
      }, 3000);
    },
  });

  return View({ class: "space-y-8" }, [
    Section("Menu", [
      Item("Default", [
        Menu({
          store: new Timeless.ui.MenuCore({
            items: [
              new Timeless.ui.MenuItemCore({
                label: "Edit",
                icon: Timeless.icons.PlayOutlined({ class: "icon icon--play" }),
                onClick() {
                  console.log("edit");
                },
              }),
              new Timeless.ui.MenuItemCore({
                label: "Duplicate",
                onClick() {
                  console.log("duplicate");
                },
              }),
              new Timeless.ui.MenuItemCore({
                label: "Delete",
                onClick() {
                  console.log("delete");
                },
              }),
            ],
          }),
        }),
      ]),
      Item("With Submenu", [
        Menu({
          store: new Timeless.ui.MenuCore({
            items: [
              new Timeless.ui.MenuItemCore({
                label: "Cut",
                onClick() {
                  console.log("cut");
                },
              }),
              new Timeless.ui.MenuItemCore({
                label: "Copy",
                onClick() {
                  console.log("copy");
                },
              }),
              new Timeless.ui.MenuItemCore({
                label: "Share",
                menu: new Timeless.ui.MenuCore({
                  items: [
                    new Timeless.ui.MenuItemCore({
                      label: "Email",
                      onClick() {
                        console.log("email");
                      },
                    }),
                    new Timeless.ui.MenuItemCore({
                      label: "Message",
                      onClick() {
                        console.log("message");
                      },
                    }),
                  ],
                }),
              }),
            ],
          }),
        }),
      ]),
    ]),
    Section("Dialog", [
      Item("Default", [
        Button(
          {
            store: new Timeless.ui.ButtonCore({
              onClick() {
                dialog$.show();
              },
            }),
          },
          [Txt("Open Dialog")],
        ),
        Dialog({ store: dialog$ }, [
          View({ class: "text-sm text-zinc-500" }, [
            Txt("This is a dialog content area. You can put anything here."),
          ]),
        ]),
      ]),
    ]),
    Section("Sheet", [
      Item("Sides", [
        (() => {
          const sheetR$ = new Timeless.ui.DialogCore({
            title: "Sheet Right",
          });
          const sheetL$ = new Timeless.ui.DialogCore({
            title: "Sheet Left",
          });
          const sheetB$ = new Timeless.ui.DialogCore({
            title: "Sheet Bottom",
          });
          return View({ class: cn(["flex gap-2"]) }, [
            Button(
              {
                size: "sm",
                store: new Timeless.ui.ButtonCore({
                  onClick() {
                    sheetR$.show();
                  },
                }),
              },
              [Txt("Right")],
            ),
            Button(
              {
                size: "sm",
                variant: "outline",
                store: new Timeless.ui.ButtonCore({
                  onClick() {
                    sheetL$.show();
                  },
                }),
              },
              [Txt("Left")],
            ),
            Button(
              {
                size: "sm",
                variant: "outline",
                store: new Timeless.ui.ButtonCore({
                  onClick() {
                    sheetB$.show();
                  },
                }),
              },
              [Txt("Bottom")],
            ),
            Sheet({ store: sheetR$, side: "right" }, [
              View({ class: cn(["text-sm text-zinc-500"]) }, [
                Txt("This is a right sheet."),
              ]),
            ]),
            Sheet({ store: sheetL$, side: "left" }, [
              View({ class: cn(["text-sm text-zinc-500"]) }, [
                Txt("This is a left sheet."),
              ]),
            ]),
            Sheet({ store: sheetB$, side: "bottom" }, [
              View({ class: cn(["text-sm text-zinc-500"]) }, [
                Txt("This is a bottom sheet."),
              ]),
            ]),
          ]);
        })(),
      ]),
    ]),
    Section("transition", [
      Item("Toggle visibility", [
        (() => {
          const p$ = new Timeless.ui.PresenceCore({});
          return View({ class: "space-y-2" }, [
            Button(
              {
                size: "sm",
                variant: "outline",
                store: new Timeless.ui.ButtonCore({
                  onClick() {
                    p$.show();
                  },
                }),
              },
              [Txt("Show")],
            ),
            Button(
              {
                size: "sm",
                variant: "outline",
                store: new Timeless.ui.ButtonCore({
                  onClick() {
                    p$.hide();
                  },
                }),
              },
              [Txt("Hide")],
            ),
            Transition(
              {
                store: p$,
                class: "p-3 rounded-md bg-zinc-100 dark:bg-zinc-800 text-sm",
              },
              [Txt("I am visible!")],
            ),
          ]);
        })(),
      ]),
      Item("Fade animation", [
        (() => {
          const p$ = new Timeless.ui.PresenceCore({});
          return View({ class: "space-y-2" }, [
            View({ class: "flex gap-2" }, [
              Button(
                {
                  size: "sm",
                  variant: "outline",
                  store: new Timeless.ui.ButtonCore({
                    onClick() {
                      p$.show();
                    },
                  }),
                },
                [Txt("Show")],
              ),
              Button(
                {
                  size: "sm",
                  variant: "outline",
                  store: new Timeless.ui.ButtonCore({
                    onClick() {
                      p$.hide();
                    },
                  }),
                },
                [Txt("Hide")],
              ),
            ]),
            Transition(
              {
                store: p$,
                animation: {
                  in: "animate-in fade-in",
                  out: "animate-out fade-out",
                },
                class:
                  "p-4 rounded-lg bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100 text-sm",
              },
              [Txt("✨ Fade in/out animation")],
            ),
          ]);
        })(),
      ]),
      Item("Slide from bottom", [
        (() => {
          const p$ = new Timeless.ui.PresenceCore({});
          return View({ class: "space-y-2" }, [
            View({ class: "flex gap-2" }, [
              Button(
                {
                  size: "sm",
                  variant: "outline",
                  store: new Timeless.ui.ButtonCore({
                    onClick() {
                      p$.show();
                    },
                  }),
                },
                [Txt("Show")],
              ),
              Button(
                {
                  size: "sm",
                  variant: "outline",
                  store: new Timeless.ui.ButtonCore({
                    onClick() {
                      p$.hide();
                    },
                  }),
                },
                [Txt("Hide")],
              ),
            ]),
            Transition(
              {
                store: p$,
                animation: {
                  in: "animate-in fade-in slide-in-from-bottom",
                  out: "animate-out fade-out slide-out-to-bottom",
                },
                class:
                  "p-4 rounded-lg bg-green-100 dark:bg-green-900 text-green-900 dark:text-green-100 text-sm",
              },
              [Txt("📤 Slide from bottom animation")],
            ),
          ]);
        })(),
      ]),
      Item("Zoom with fade", [
        (() => {
          const p$ = new Timeless.ui.PresenceCore({});
          return View({ class: "space-y-2" }, [
            View({ class: "flex gap-2" }, [
              Button(
                {
                  size: "sm",
                  variant: "outline",
                  store: new Timeless.ui.ButtonCore({
                    onClick() {
                      p$.show();
                    },
                  }),
                },
                [Txt("Show")],
              ),
              Button(
                {
                  size: "sm",
                  variant: "outline",
                  store: new Timeless.ui.ButtonCore({
                    onClick() {
                      p$.hide();
                    },
                  }),
                },
                [Txt("Hide")],
              ),
            ]),
            Transition(
              {
                store: p$,
                animation: {
                  in: "animate-in fade-in zoom-in-95",
                  out: "animate-out fade-out zoom-out-95",
                },
                class:
                  "p-4 rounded-lg bg-purple-100 dark:bg-purple-900 text-purple-900 dark:text-purple-100 text-sm",
              },
              [Txt("🎯 Zoom with fade animation")],
            ),
          ]);
        })(),
      ]),
      Item("Slide from right", [
        (() => {
          const p$ = new Timeless.ui.PresenceCore({});
          return View({ class: "space-y-2" }, [
            View({ class: "flex gap-2" }, [
              Button(
                {
                  size: "sm",
                  variant: "outline",
                  store: new Timeless.ui.ButtonCore({
                    onClick() {
                      p$.show();
                    },
                  }),
                },
                [Txt("Show")],
              ),
              Button(
                {
                  size: "sm",
                  variant: "outline",
                  store: new Timeless.ui.ButtonCore({
                    onClick() {
                      p$.hide();
                    },
                  }),
                },
                [Txt("Hide")],
              ),
            ]),
            Transition(
              {
                store: p$,
                animation: {
                  in: "animate-in fade-in slide-in-from-right",
                  out: "animate-out fade-out slide-out-to-right",
                },
                class:
                  "p-4 rounded-lg bg-orange-100 dark:bg-orange-900 text-orange-900 dark:text-orange-100 text-sm",
              },
              [Txt("➡️ Slide from right animation")],
            ),
          ]);
        })(),
      ]),
      Item("Presence in Portal", [
        (() => {
          const p$ = new Timeless.ui.PresenceCore({});
          return View({ class: "space-y-2" }, [
            View({ class: "flex gap-2" }, [
              Button(
                {
                  size: "sm",
                  variant: "outline",
                  store: new Timeless.ui.ButtonCore({
                    onClick() {
                      p$.show();
                    },
                  }),
                },
                [Txt("Show in Portal")],
              ),
              Button(
                {
                  size: "sm",
                  variant: "outline",
                  store: new Timeless.ui.ButtonCore({
                    onClick() {
                      p$.hide();
                    },
                  }),
                },
                [Txt("Hide")],
              ),
            ]),
            Transition(
              {
                store: p$,
              },
              [
                Portal(
                  {
                    class:
                      "fixed inset-0 z-50 flex items-center justify-center bg-black/50",
                    onClick(e) {
                      if (e.target === e.currentTarget) {
                        p$.hide();
                      }
                    },
                  },
                  [
                    View(
                      {
                        class:
                          "p-6 rounded-lg bg-white dark:bg-zinc-800 shadow-lg max-w-md",
                      },
                      [
                        View(
                          { class: "flex items-center justify-between mb-4" },
                          [
                            Txt("🎭 Presence inside Portal"),
                            Button(
                              {
                                size: "sm",
                                variant: "ghost",
                                store: new Timeless.ui.ButtonCore({
                                  onClick() {
                                    p$.hide();
                                  },
                                }),
                              },
                              [Txt("✕")],
                            ),
                          ],
                        ),
                        View(
                          { class: "text-sm text-zinc-600 dark:text-zinc-400" },
                          [
                            Txt(
                              "Click the X button or click outside to close. It should be properly destroyed.",
                            ),
                          ],
                        ),
                      ],
                    ),
                  ],
                ),
              ],
            ),
          ]);
        })(),
      ]),
    ]),
    Section("Toast", [
      Item("Default", [
        (() => {
          const toast$ = new Timeless.ui.ToastCore({});
          return View({ class: "flex gap-2" }, [
            Button(
              {
                size: "sm",
                store: new Timeless.ui.ButtonCore({
                  onClick() {
                    toast$.show({ texts: ["Operation successful!"] });
                  },
                }),
              },
              [Txt("Success")],
            ),
            Button(
              {
                store: new Timeless.ui.ButtonCore({
                  size: "sm",
                  variant: "outline",
                  onClick() {
                    toast$.show({
                      texts: ["Loading..."],
                      icon: "loading",
                      mask: true,
                    });
                    setTimeout(() => toast$.hide(), 2000);
                  },
                }),
              },
              [Txt("Loading")],
            ),
            Toast({ store: toast$ }),
          ]);
        })(),
      ]),
    ]),
    Section("Popover", [
      Item("Side + Align", [
        View({ class: "flex flex-col" }, [
          Popover(
            {
              store: new Timeless.ui.PopoverCore({
                side: "left",
                align: "start",
              }),
              content: [
                View({ class: "p-3 space-y-1" }, [
                  View({ class: "text-xs text-gray-500" }, ["Left + Start"]),
                ]),
              ],
            },
            [
              View(
                {
                  class:
                    "text-center text-xs font-medium text-zinc-500 uppercase tracking-wide",
                },
                ["Left+Start"],
              ),
            ],
          ),
          Popover(
            {
              store: new Timeless.ui.PopoverCore({
                side: "left",
                align: "center",
              }),
              content: [
                View({ class: "p-3 space-y-1" }, [
                  View({ class: "text-xs text-gray-500" }, ["Left + Center"]),
                ]),
              ],
            },
            [
              View(
                {
                  class:
                    "text-center text-xs font-medium text-zinc-500 uppercase tracking-wide",
                },
                ["Left+Center"],
              ),
            ],
          ),
          Popover(
            {
              store: new Timeless.ui.PopoverCore({
                side: "left",
                align: "end",
              }),
              content: [
                View({ class: "p-3 space-y-1" }, [
                  View({ class: "text-xs text-gray-500" }, ["Left + End"]),
                ]),
              ],
            },
            [
              View(
                {
                  class:
                    "text-center text-xs font-medium text-zinc-500 uppercase tracking-wide",
                },
                ["Left+End"],
              ),
            ],
          ),
        ]),
        View({ class: "flex gap-3" }, [
          Popover(
            {
              store: new Timeless.ui.PopoverCore({
                side: "top",
                align: "start",
              }),
              content: [
                View({ class: "p-3 space-y-1" }, [
                  View({ class: "text-xs text-gray-500" }, ["Top + Start"]),
                ]),
              ],
            },
            [
              View(
                {
                  class:
                    "text-center text-xs font-medium text-zinc-500 uppercase tracking-wide",
                },
                ["Top+Start"],
              ),
            ],
          ),
          Popover(
            {
              store: new Timeless.ui.PopoverCore({
                side: "top",
                align: "center",
              }),
              content: [
                View({ class: "p-3 space-y-1" }, [
                  View({ class: "text-xs text-gray-500" }, ["Top + Center"]),
                ]),
              ],
            },
            [
              View(
                {
                  class:
                    "text-center text-xs font-medium text-zinc-500 uppercase tracking-wide",
                },
                ["Top+Center"],
              ),
            ],
          ),
          Popover(
            {
              store: new Timeless.ui.PopoverCore({
                side: "top",
                align: "end",
              }),
              content: [
                View({ class: "p-3 space-y-1" }, [
                  View({ class: "text-xs text-gray-500" }, ["Top + End"]),
                ]),
              ],
            },
            [
              View(
                {
                  class:
                    "text-center text-xs font-medium text-zinc-500 uppercase tracking-wide",
                },
                ["Top+End"],
              ),
            ],
          ),
        ]),
        View({ class: "flex flex-col" }, [
          Popover(
            {
              store: new Timeless.ui.PopoverCore({
                side: "right",
                align: "start",
              }),
              content: [
                View({ class: "p-3 space-y-1" }, [
                  View({ class: "text-xs text-gray-500" }, ["Right + Start"]),
                ]),
              ],
            },
            [
              View(
                {
                  class:
                    "text-center text-xs font-medium text-zinc-500 uppercase tracking-wide",
                },
                ["Right+Start"],
              ),
            ],
          ),
          Popover(
            {
              store: new Timeless.ui.PopoverCore({
                side: "right",
                align: "center",
              }),
              content: [
                View({ class: "p-3 space-y-1" }, [
                  View({ class: "text-xs text-gray-500" }, ["Right + Center"]),
                ]),
              ],
            },
            [
              View(
                {
                  class:
                    "text-center text-xs font-medium text-zinc-500 uppercase tracking-wide",
                },
                ["Right+Center"],
              ),
            ],
          ),
          Popover(
            {
              store: new Timeless.ui.PopoverCore({
                side: "right",
                align: "end",
              }),
              content: [
                View({ class: "p-3 space-y-1" }, [
                  View({ class: "text-xs text-gray-500" }, ["Right + End"]),
                ]),
              ],
            },
            [
              View(
                {
                  class:
                    "text-center text-xs font-medium text-zinc-500 uppercase tracking-wide",
                },
                ["Right+End"],
              ),
            ],
          ),
        ]),
        View({ class: "flex gap-3" }, [
          Popover(
            {
              store: new Timeless.ui.PopoverCore({
                side: "bottom",
                align: "start",
              }),
              content: [
                View({ class: "p-3 space-y-1" }, [
                  View({ class: "text-xs text-gray-500" }, ["Bottom + Start"]),
                ]),
              ],
            },
            [
              View(
                {
                  class:
                    "text-center text-xs font-medium text-zinc-500 uppercase tracking-wide",
                },
                ["Bottom+Start"],
              ),
            ],
          ),
          Popover(
            {
              store: new Timeless.ui.PopoverCore({
                side: "bottom",
                align: "center",
              }),
              content: [
                View({ class: "p-3 space-y-1" }, [
                  View({ class: "text-xs text-gray-500" }, ["Bottom + Center"]),
                ]),
              ],
            },
            [
              View(
                {
                  class:
                    "text-center text-xs font-medium text-zinc-500 uppercase tracking-wide",
                },
                ["Bottom+Center"],
              ),
            ],
          ),
          Popover(
            {
              store: new Timeless.ui.PopoverCore({
                side: "bottom",
                align: "end",
              }),
              content: [
                View({ class: "p-3 space-y-1" }, [
                  View({ class: "text-xs text-gray-500" }, ["Bottom + End"]),
                ]),
              ],
            },
            [
              View(
                {
                  class:
                    "text-center text-xs font-medium text-zinc-500 uppercase tracking-wide",
                },
                ["Bottom+End"],
              ),
            ],
          ),
        ]),
      ]),
      Item("Wide Trigger", [
        Popover(
          {
            store: new Timeless.ui.PopoverCore({
              side: "bottom",
              align: "start",
            }),
            content: [
              View({ class: "p-4 space-y-2" }, [
                View({ class: "font-semibold" }, ["Popover Title"]),
                View({ class: "text-sm text-gray-600" }, [
                  "When trigger is much wider than content, the arrow should stay near the align side.",
                ]),
              ]),
            ],
          },
          [
            View(
              {
                class:
                  "w-[800px] h-10 flex items-center justify-center rounded-md border-2 border-dashed border-zinc-300 dark:border-zinc-700 text-sm text-zinc-500 cursor-pointer",
              },
              ["Very Wide Trigger (800px) — bottom / start"],
            ),
          ],
        ),
      ]),
    ]),
    Section("Alert", [
      Item("Default", [
        Alert({}, [
          AlertTitle({}, [Txt("Heads up!")]),
          AlertDescription({}, [
            Txt("You can add components to your app using the CLI."),
          ]),
        ]),
      ]),
      Item("Destructive", [
        Alert({ variant: "destructive" }, [
          AlertTitle({}, [Txt("Error")]),
          AlertDescription({}, [
            Txt("Something went wrong. Please try again."),
          ]),
        ]),
      ]),
    ]),
  ]);
}

import { TestDialog } from "@/components/dialogtest.js";
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
  const viewportDialog$ = new Timeless.ui.DialogCore({
    title: "Dialog With Viewport",
  });
  // const viewportBoxEl = ref(null);

  const view$ = new Timeless.ui.ScrollViewCore({});
  return ScrollView({ class: "p-6 h-screen", store: view$ }, [
    View({ class: "space-y-8" }, [
      Section("Menu", [
        Item("Default", [
          // Menu({
          //   store: new Timeless.ui.MenuCore({
          //     items: [
          //       new Timeless.ui.MenuItemCore({
          //         label: "Edit",
          //         icon: View(
          //           {
          //             class: "icon icon--play",
          //           },
          //           [Icon({ name: "play" })],
          //         ),
          //         onClick() {
          //           console.log("edit");
          //         },
          //       }),
          //       new Timeless.ui.MenuItemCore({
          //         label: "Duplicate",
          //         onClick() {
          //           console.log("duplicate");
          //         },
          //       }),
          //       new Timeless.ui.MenuItemCore({
          //         label: "Delete",
          //         onClick() {
          //           console.log("delete");
          //         },
          //       }),
          //     ],
          //   }),
          // }),
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
            ["Open Dialog hello"],
          ),
          TestDialog({ store: dialog$ }),
        ]),
        Item("setViewport({ getRect })", [
          View(
            {
              class:
                "relative w-full h-[320px] max-w-md rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 p-4",
              onMounted(event) {
                viewportDialog$.setViewport({
                  getRect() {
                    return event.target.getBoundingClientRect();
                  },
                });
              },
            },
            [
              View({ class: "text-xs text-zinc-500 mb-3" }, [
                "Dialog will be centered relative to this box.",
              ]),
              Button(
                {
                  store: new Timeless.ui.ButtonCore({
                    onClick() {
                      viewportDialog$.show();
                    },
                  }),
                },
                ["Open Viewport Dialog"],
              ),
            ],
          ),
          Dialog({ store: viewportDialog$ }, [
            View({ class: "text-sm text-zinc-500" }, [
              "Centered relative to the dashed box via setViewport({ getRect }).",
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
            return View({ class: classNames(["flex gap-2"]) }, [
              Button(
                {
                  store: new Timeless.ui.ButtonCore({
                    size: "sm",
                    onClick() {
                      sheetR$.show();
                    },
                  }),
                },
                ["Right"],
              ),
              Button(
                {
                  store: new Timeless.ui.ButtonCore({
                    size: "sm",
                    variant: "outline",
                    onClick() {
                      sheetL$.show();
                    },
                  }),
                },
                ["Left"],
              ),
              Button(
                {
                  store: new Timeless.ui.ButtonCore({
                    size: "sm",
                    variant: "outline",
                    onClick() {
                      sheetB$.show();
                    },
                  }),
                },
                ["Bottom"],
              ),
              Sheet({ store: sheetR$, side: "right" }, [
                View({ class: classNames(["text-sm text-zinc-500"]) }, [
                  "This is a right sheet.",
                ]),
              ]),
              Sheet({ store: sheetL$, side: "left" }, [
                View({ class: classNames(["text-sm text-zinc-500"]) }, [
                  "This is a left sheet.",
                ]),
              ]),
              Sheet({ store: sheetB$, side: "bottom" }, [
                View({ class: classNames(["text-sm text-zinc-500"]) }, [
                  "This is a bottom sheet.",
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
                  store: new Timeless.ui.ButtonCore({
                    size: "sm",
                    variant: "outline",
                    onClick() {
                      p$.show();
                    },
                  }),
                },
                ["Show"],
              ),
              Button(
                {
                  store: new Timeless.ui.ButtonCore({
                    size: "sm",
                    variant: "outline",
                    onClick() {
                      p$.hide();
                    },
                  }),
                },
                ["Hide"],
              ),
              Transition(
                {
                  store: p$,
                  class: "p-3 rounded-md bg-zinc-100 dark:bg-zinc-800 text-sm",
                },
                ["I am visible!"],
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
                    store: new Timeless.ui.ButtonCore({
                      size: "sm",
                      variant: "outline",
                      onClick() {
                        p$.show();
                      },
                    }),
                  },
                  ["Show"],
                ),
                Button(
                  {
                    store: new Timeless.ui.ButtonCore({
                      size: "sm",
                      variant: "outline",
                      onClick() {
                        p$.hide();
                      },
                    }),
                  },
                  ["Hide"],
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
                ["✨ Fade in/out animation"],
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
                    store: new Timeless.ui.ButtonCore({
                      size: "sm",
                      variant: "outline",
                      onClick() {
                        p$.show();
                      },
                    }),
                  },
                  ["Show"],
                ),
                Button(
                  {
                    store: new Timeless.ui.ButtonCore({
                      size: "sm",
                      variant: "outline",
                      onClick() {
                        p$.hide();
                      },
                    }),
                  },
                  ["Hide"],
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
                ["📤 Slide from bottom animation"],
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
                    store: new Timeless.ui.ButtonCore({
                      size: "sm",
                      variant: "outline",
                      onClick() {
                        p$.show();
                      },
                    }),
                  },
                  ["Show"],
                ),
                Button(
                  {
                    store: new Timeless.ui.ButtonCore({
                      size: "sm",
                      variant: "outline",
                      onClick() {
                        p$.hide();
                      },
                    }),
                  },
                  ["Hide"],
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
                ["🎯 Zoom with fade animation"],
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
                    store: new Timeless.ui.ButtonCore({
                      size: "sm",
                      variant: "outline",
                      onClick() {
                        p$.show();
                      },
                    }),
                  },
                  ["Show"],
                ),
                Button(
                  {
                    store: new Timeless.ui.ButtonCore({
                      size: "sm",
                      variant: "outline",
                      onClick() {
                        p$.hide();
                      },
                    }),
                  },
                  ["Hide"],
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
                ["➡️ Slide from right animation"],
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
                    store: new Timeless.ui.ButtonCore({
                      size: "sm",
                      variant: "outline",
                      onClick() {
                        p$.show();
                      },
                    }),
                  },
                  ["Show in Portal"],
                ),
                Button(
                  {
                    store: new Timeless.ui.ButtonCore({
                      size: "sm",
                      variant: "outline",
                      onClick() {
                        p$.hide();
                      },
                    }),
                  },
                  ["Hide"],
                ),
              ]),
              Transition(
                {
                  store: p$,
                },
                [
                  Portal(
                    {
                      // @ts-ignore
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
                          class: "p-6 rounded-lg shadow-lg max-w-md",
                        },
                        [
                          View(
                            { class: "flex items-center justify-between mb-4" },
                            [
                              "🎭 Presence inside Portal",
                              Button(
                                {
                                  store: new Timeless.ui.ButtonCore({
                                    size: "sm",
                                    variant: "ghost",
                                    onClick() {
                                      p$.hide();
                                    },
                                  }),
                                },
                                ["✕"],
                              ),
                            ],
                          ),
                          View(
                            {
                              class: "text-sm text-zinc-600 dark:text-zinc-400",
                            },
                            [
                              "Click the X button or click outside to close. It should be properly destroyed.",
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
      Section("Popover", [
        Item("Side + Align", [
          (() => {
            const cellClass =
              "w-full h-12 flex items-center justify-center rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer select-none text-center text-xs font-medium text-zinc-600 uppercase tracking-wide";
            const centerClass =
              "w-full h-12 flex items-center justify-center rounded-md border-2 border-dashed border-zinc-300 dark:border-zinc-700 text-center text-xs text-zinc-500 uppercase tracking-wide";

            const toTitle = (v) => v.charAt(0).toUpperCase() + v.slice(1);
            const toContentLabel = ({ side, align }) =>
              `${toTitle(side)} / ${toTitle(align)}`;

            const Cell = ({ side, align, label }) =>
              Popover(
                {
                  store: new Timeless.ui.PopoverCore({ side, align }),
                  content: [
                    View({ class: "p-3 space-y-1" }, [
                      View({ class: "text-xs text-gray-500" }, [
                        toContentLabel({ side, align }),
                      ]),
                    ]),
                  ],
                },
                [View({ class: cellClass }, [label])],
              );

            return View(
              {
                class: "grid grid-cols-3 gap-3 w-full max-w-md",
              },
              [
                Cell({ side: "top", align: "start", label: "Top+Start" }),
                Cell({ side: "top", align: "center", label: "Top+Center" }),
                Cell({ side: "top", align: "end", label: "Top+End" }),
                Cell({ side: "left", align: "center", label: "Left" }),
                View({ class: centerClass }, ["Trigger"]),
                Cell({ side: "right", align: "center", label: "Right" }),
                Cell({ side: "bottom", align: "start", label: "Bottom+Start" }),
                Cell({
                  side: "bottom",
                  align: "center",
                  label: "Bottom+Center",
                }),
                Cell({ side: "bottom", align: "end", label: "Bottom+End" }),
              ],
            );
          })(),
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
      Section("Sonner", [
        // Item("Basic Types", [
        //   (() => {
        //     const sonner = Timeless.ui.SonnerCore.getInstance();
        //     return View({ class: "flex flex-wrap gap-2" }, [
        //       Button(
        //         {
        //           store: new Timeless.ui.ButtonCore({
        //             size: "sm",
        //             onClick() {
        //               sonner.toast("This is a default toast.");
        //             },
        //           }),
        //         },
        //         ["Default"],
        //       ),
        //       Button(
        //         {
        //           store: new Timeless.ui.ButtonCore({
        //             size: "sm",
        //             onClick() {
        //               sonner.success("Operation completed successfully!");
        //             },
        //           }),
        //         },
        //         ["Success"],
        //       ),
        //       Button(
        //         {
        //           store: new Timeless.ui.ButtonCore({
        //             size: "sm",
        //             variant: "outline",
        //             onClick() {
        //               sonner.error("Something went wrong.");
        //             },
        //           }),
        //         },
        //         ["Error"],
        //       ),
        //       Button(
        //         {
        //           store: new Timeless.ui.ButtonCore({
        //             size: "sm",
        //             variant: "outline",
        //             onClick() {
        //               sonner.info("Here is some useful information.");
        //             },
        //           }),
        //         },
        //         ["Info"],
        //       ),
        //       Button(
        //         {
        //           store: new Timeless.ui.ButtonCore({
        //             size: "sm",
        //             variant: "outline",
        //             onClick() {
        //               sonner.warning("Please check your input.");
        //             },
        //           }),
        //         },
        //         ["Warning"],
        //       ),
        //       Button(
        //         {
        //           store: new Timeless.ui.ButtonCore({
        //             size: "sm",
        //             variant: "outline",
        //             onClick() {
        //               sonner.loading("Loading data...");
        //             },
        //           }),
        //         },
        //         ["Loading"],
        //       ),
        //     ]);
        //   })(),
        // ]),
        // Item("With Description", [
        //   (() => {
        //     const sonner = Timeless.ui.SonnerCore.getInstance();
        //     return View({ class: "flex gap-2" }, [
        //       Button(
        //         {
        //           store: new Timeless.ui.ButtonCore({
        //             size: "sm",
        //             onClick() {
        //               sonner.success("Event has been created", {
        //                 description: "Monday, January 3rd at 6:00pm",
        //               });
        //             },
        //           }),
        //         },
        //         ["With description"],
        //       ),
        //       Button(
        //         {
        //           store: new Timeless.ui.ButtonCore({
        //             size: "sm",
        //             variant: "outline",
        //             onClick() {
        //               sonner.error("Failed to save", {
        //                 description:
        //                   "Your changes could not be saved. Please try again.",
        //               });
        //             },
        //           }),
        //         },
        //         ["Error + description"],
        //       ),
        //     ]);
        //   })(),
        // ]),
        // Item("Promise", [
        //   (() => {
        //     const sonner = Timeless.ui.SonnerCore.getInstance();
        //     return View({ class: "flex gap-2" }, [
        //       Button(
        //         {
        //           store: new Timeless.ui.ButtonCore({
        //             size: "sm",
        //             onClick() {
        //               const fakePromise = new Promise((resolve) => {
        //                 setTimeout(resolve, 2000);
        //               });
        //               sonner.promise(fakePromise, {
        //                 loading: "Saving your data...",
        //                 success: "Data saved successfully!",
        //                 error: "Failed to save data.",
        //               });
        //             },
        //           }),
        //         },
        //         ["Promise toast"],
        //       ),
        //       Button(
        //         {
        //           store: new Timeless.ui.ButtonCore({
        //             size: "sm",
        //             variant: "outline",
        //             onClick() {
        //               const fakePromise = new Promise((resolve, reject) => {
        //                 setTimeout(
        //                   () => reject(new Error("Network error")),
        //                   2000,
        //                 );
        //               });
        //               sonner.promise(fakePromise, {
        //                 loading: "Uploading file...",
        //                 success: "File uploaded!",
        //                 error: "Upload failed.",
        //               });
        //             },
        //           }),
        //         },
        //         ["Promise reject"],
        //       ),
        //     ]);
        //   })(),
        // ]),
        // Item("Dismiss", [
        //   (() => {
        //     const sonner = Timeless.ui.SonnerCore.getInstance();
        //     return View({ class: "flex gap-2" }, [
        //       Button(
        //         {
        //           store: new Timeless.ui.ButtonCore({
        //             size: "sm",
        //             onClick() {
        //               sonner.success("I will stay until dismissed.", {
        //                 duration: Infinity,
        //               });
        //             },
        //           }),
        //         },
        //         ["Show persistent"],
        //       ),
        //       Button(
        //         {
        //           store: new Timeless.ui.ButtonCore({
        //             size: "sm",
        //             variant: "outline",
        //             onClick() {
        //               sonner.dismiss();
        //             },
        //           }),
        //         },
        //         ["Dismiss all"],
        //       ),
        //     ]);
        //   })(),
        // ]),
        // Item("Custom Duration", [
        //   (() => {
        //     const sonner = Timeless.ui.SonnerCore.getInstance();
        //     return View({ class: "flex gap-2" }, [
        //       Button(
        //         {
        //           store: new Timeless.ui.ButtonCore({
        //             size: "sm",
        //             onClick() {
        //               sonner.toast("Quick toast (1s)", { duration: 1000 });
        //             },
        //           }),
        //         },
        //         ["1 second"],
        //       ),
        //       Button(
        //         {
        //           store: new Timeless.ui.ButtonCore({
        //             size: "sm",
        //             variant: "outline",
        //             onClick() {
        //               sonner.toast("Long toast (5s)", { duration: 5000 });
        //             },
        //           }),
        //         },
        //         ["5 seconds"],
        //       ),
        //     ]);
        //   })(),
        // ]),
      ]),
      Section("Alert", [
        Item("Default", [
          Alert({}, [
            AlertTitle({}, ["Heads up!"]),
            AlertDescription({}, [
              "You can add components to your app using the CLI.",
            ]),
          ]),
        ]),
        Item("Destructive", [
          Alert({ variant: "destructive" }, [
            AlertTitle({}, ["Error"]),
            AlertDescription({}, ["Something went wrong. Please try again."]),
          ]),
        ]),
      ]),
    ]),
  ]);
}

import { Section, Item } from "@/components/index.js";

export function OverlayView() {
  return View({ class: "space-y-8" }, [
    Section("Dropdown Menu", [
      Item("Default", [
        DropdownMenu(
          {
            store: new Timeless.ui.DropdownMenuCore({
              items: [
                new Timeless.ui.MenuItemCore({
                  label: "Edit",
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
          },
          [Button({ variant: "outline", onClick() {} }, [Txt("Open Menu")])],
        ),
      ]),
      Item("With Submenu", [
        DropdownMenu(
          {
            store: new Timeless.ui.DropdownMenuCore({
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
                      new Timeless.ui.MenuItemCore({
                        label: "AirDrop",
                        onClick() {
                          console.log("airdrop");
                        },
                      }),
                    ],
                  }),
                }),
                new Timeless.ui.MenuItemCore({
                  label: "Delete",
                  onClick() {
                    console.log("delete");
                  },
                }),
              ],
            }),
          },
          [Button({}, [Txt("With Submenu")])],
        ),
      ]),
      Item("Dynamic Submenu", [
        (() => {
          const shareMenu = new Timeless.ui.MenuCore({
            items: [
              new Timeless.ui.MenuItemCore({
                label: "February",
                onClick() {
                  console.log("February");
                },
              }),
              new Timeless.ui.MenuItemCore({
                label: "March",
                onClick() {
                  console.log("March");
                },
              }),
            ],
          });
          const menuItem = new Timeless.ui.MenuItemCore({
            label: "Month",
            menu: shareMenu,
            onClick() {
              console.log("Month");
            },
          });
          let count = 0;
          shareMenu.onShow(() => {
            setTimeout(() => {
              count++;
              const extra = Array.from({ length: 3 }, (_, i) => {
                const label = `Extra ${(count - 1) * 3 + i + 1}`;
                return new Timeless.ui.MenuItemCore({
                  label,
                  onClick() {
                    console.log(label);
                  },
                });
              });
              shareMenu.setItems([...shareMenu.items, ...extra]);
            }, 1000);
          });
          const dm$ = new Timeless.ui.DropdownMenuCore({
            items: [
              new Timeless.ui.MenuItemCore({
                label: "Year 2025",
                onClick() {
                  console.log("Year 2025");
                },
              }),
              menuItem,
            ],
          });
          return DropdownMenu({ store: dm$ }, [
            Button({ variant: "outline" }, [Txt("Dynamic Submenu")]),
          ]);
        })(),
      ]),
      Item("Hover Trigger", [
        DropdownMenu(
          {
            store: new Timeless.ui.DropdownMenuCore({
              trigger: "hover",
              items: [
                new Timeless.ui.MenuItemCore({
                  label: "Profile",
                  onClick() {
                    console.log("profile");
                  },
                }),
                new Timeless.ui.MenuItemCore({
                  label: "Settings",
                  onClick() {
                    console.log("settings");
                  },
                }),
                new Timeless.ui.MenuItemCore({
                  label: "Logout",
                  onClick() {
                    console.log("logout");
                  },
                }),
              ],
            }),
          },
          [Button({ variant: "outline" }, [Txt("Hover Me")])],
        ),
      ]),
      Item("Context Menu", [
        (() => {
          const ctxStore = new Timeless.ui.DropdownMenuCore({
            trigger: "manual",
            side: "bottom",
            align: "start",
            offsetX: 4,
            offsetY: 4,
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
                label: "Paste",
                onClick() {
                  console.log("paste");
                },
              }),
              new Timeless.ui.MenuItemCore({
                label: "Delete",
                onClick() {
                  console.log("delete");
                },
              }),
            ],
          });
          return DropdownMenu(
            {
              store: ctxStore,
              onMounted($e) {
                $e.addEventListener("contextmenu", (e) => {
                  e.preventDefault();
                  ctxStore.toggle({ x: e.clientX, y: e.clientY });
                });
              },
            },
            [
              View(
                {
                  class:
                    "flex items-center justify-center w-[300px] h-[150px] rounded-md border-2 border-dashed border-zinc-300 dark:border-zinc-700 text-sm text-zinc-500 select-none",
                },
                [Txt("Right click here")],
              ),
            ],
          );
        })(),
      ]),
      Item("Near Page Bottom", [
        View(
          {
            class: "w-full h-[800px] flex items-end justify-center",
          },
          [
            DropdownMenu(
              {
                store: new Timeless.ui.DropdownMenuCore({
                  items: [
                    new Timeless.ui.MenuItemCore({
                      label: "Edit",
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
              },
              [Button({ variant: "outline" }, [Txt("Open Menu")])],
            ),
          ],
        ),
      ]),
      Item("Near Right Side", [
        View(
          {
            class: "w-full flex justify-end",
          },
          [
            DropdownMenu(
              {
                store: new Timeless.ui.DropdownMenuCore({
                  items: [
                    new Timeless.ui.MenuItemCore({
                      label: "Edit",
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
              },
              [Button({ variant: "outline" }, [Txt("Open Menu")])],
            ),
          ],
        ),
      ]),
      Item("Tooltip", [
        View({ class: cn(["flex gap-2"]) }, [
          Tooltip({ content: "Top tooltip" }, [
            Button({ variant: "outline", size: "sm" }, [Txt("Top")]),
          ]),
          Tooltip({ content: "Bottom tooltip", side: "bottom" }, [
            Button({ variant: "outline", size: "sm" }, [Txt("Bottom")]),
          ]),
          Tooltip({ content: "Left tooltip", side: "left" }, [
            Button({ variant: "outline", size: "sm" }, [Txt("Left")]),
          ]),
          Tooltip({ content: "Right tooltip", side: "right" }, [
            Button({ variant: "outline", size: "sm" }, [Txt("Right")]),
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
                  onClick() {
                    sheetR$.show();
                  },
                },
                [Txt("Right")],
              ),
              Button(
                {
                  size: "sm",
                  variant: "outline",
                  onClick() {
                    sheetL$.show();
                  },
                },
                [Txt("Left")],
              ),
              Button(
                {
                  size: "sm",
                  variant: "outline",
                  onClick() {
                    sheetB$.show();
                  },
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
    ]),
  ]);
}

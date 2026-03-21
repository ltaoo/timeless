import { Section, Item } from "@/components/index.js";

export default function OverlayView() {
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
          [
            Button(
              {
                store: new Timeless.ui.ButtonCore({
                  variant: "outline",
                  onClick() {
                    console.log("click Open Menu");
                  },
                }),
              },
              ["Open Menu"],
            ),
          ],
        ),
      ]),
      Item("With Separator", [
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
                  label: "Paste",
                  onClick() {
                    console.log("paste");
                  },
                }),
                new Timeless.ui.MenuSeparatorCore(),
                new Timeless.ui.MenuItemCore({
                  label: "Rename",
                  onClick() {
                    console.log("rename");
                  },
                }),
                new Timeless.ui.MenuSeparatorCore(),
                new Timeless.ui.MenuItemCore({
                  label: "Delete",
                  onClick() {
                    console.log("delete");
                  },
                }),
              ],
            }),
          },
          [
            Button(
              {
                store: new Timeless.ui.ButtonCore({ variant: "outline" }),
              },
              ["With Separator"],
            ),
          ],
        ),
      ]),
      Item("With Shortcut", [
        DropdownMenu(
          {
            store: new Timeless.ui.DropdownMenuCore({
              items: [
                new Timeless.ui.MenuItemCore({
                  label: "Cut",
                  shortcut: "⌘X",
                  onClick() {
                    console.log("cut");
                  },
                }),
                new Timeless.ui.MenuItemCore({
                  label: "Copy",
                  shortcut: "⌘C",
                  onClick() {
                    console.log("copy");
                  },
                }),
                new Timeless.ui.MenuItemCore({
                  label: "Paste",
                  shortcut: "⌘V",
                  onClick() {
                    console.log("paste");
                  },
                }),
                new Timeless.ui.MenuSeparatorCore(),
                new Timeless.ui.MenuItemCore({
                  label: "Select All",
                  shortcut: "⌘A",
                  onClick() {
                    console.log("select all");
                  },
                }),
              ],
            }),
          },
          [
            Button(
              {
                store: new Timeless.ui.ButtonCore({ variant: "outline" }),
              },
              ["With Shortcut"],
            ),
          ],
        ),
      ]),
      Item("With ShortcutModel", [
        (() => {
          const $shortcut = Timeless.ui.ShortcutModel({});
          $shortcut.methods.register({
            "MetaLeft+KeyX"() {
              console.log("cut via shortcut");
            },
            "MetaLeft+KeyC"() {
              console.log("copy via shortcut");
            },
            "MetaLeft+KeyV"() {
              console.log("paste via shortcut");
            },
          });
          document.addEventListener("keydown", (event) => {
            $shortcut.methods.handleKeydown(event);
          });
          document.addEventListener("keyup", (event) => {
            $shortcut.methods.handleKeyup(event);
          });
          return DropdownMenu(
            {
              store: new Timeless.ui.DropdownMenuCore({
                items: [
                  new Timeless.ui.MenuItemCore({
                    label: "Cut",
                    shortcut: "⌘X",
                    onClick() {
                      console.log("cut");
                    },
                  }),
                  new Timeless.ui.MenuItemCore({
                    label: "Copy",
                    shortcut: "⌘C",
                    onClick() {
                      console.log("copy");
                    },
                  }),
                  new Timeless.ui.MenuItemCore({
                    label: "Paste",
                    shortcut: "⌘V",
                    onClick() {
                      console.log("paste");
                    },
                  }),
                ],
              }),
            },
            [
              Button(
                {
                  store: new Timeless.ui.ButtonCore({ variant: "outline" }),
                },
                ["With ShortcutModel"],
              ),
            ],
          );
        })(),
      ]),
      Item("With Icon", [
        DropdownMenu(
          {
            store: new Timeless.ui.DropdownMenuCore({
              items: [
                new Timeless.ui.MenuItemCore({
                  label: "Undo",
                  shortcut: "⌘Z",
                  icon: Timeless.icons.Undo2Outlined({ class: "w-4 h-4" }),
                  onClick() {
                    console.log("undo");
                  },
                }),
                new Timeless.ui.MenuItemCore({
                  label: "Redo",
                  shortcut: "⇧⌘Z",
                  icon: Timeless.icons.RefreshCcwOutlined({ class: "w-4 h-4" }),
                  onClick() {
                    console.log("redo");
                  },
                }),
                new Timeless.ui.MenuSeparatorCore(),
                new Timeless.ui.MenuItemCore({
                  label: "Cut",
                  shortcut: "⌘X",
                  icon: Timeless.icons.BoltOutlined({ class: "w-4 h-4" }),
                  onClick() {
                    console.log("cut");
                  },
                }),
                new Timeless.ui.MenuItemCore({
                  label: "Copy",
                  shortcut: "⌘C",
                  icon: Timeless.icons.FileSymlinkOutlined({
                    class: "w-4 h-4",
                  }),
                  onClick() {
                    console.log("copy");
                  },
                }),
                new Timeless.ui.MenuItemCore({
                  label: "Paste",
                  shortcut: "⌘V",
                  icon: Timeless.icons.ArrowDownloadToLineOutlined({
                    class: "w-4 h-4",
                  }),
                  onClick() {
                    console.log("paste");
                  },
                }),
                new Timeless.ui.MenuSeparatorCore(),
                new Timeless.ui.MenuItemCore({
                  label: "Delete",
                  shortcut: "⌘⌫",
                  icon: Timeless.icons.Trash2Outlined({ class: "w-4 h-4" }),
                  onClick() {
                    console.log("delete");
                  },
                }),
              ],
            }),
          },
          [
            Button(
              {
                store: new Timeless.ui.ButtonCore({ variant: "outline" }),
              },
              ["With Icon"],
            ),
          ],
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
          [Button({ store: new Timeless.ui.ButtonCore({}) }, ["With Submenu"])],
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
            Button(
              { store: new Timeless.ui.ButtonCore({ variant: "outline" }) },
              ["Dynamic Submenu"],
            ),
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
          [
            Button(
              { store: new Timeless.ui.ButtonCore({ variant: "outline" }) },
              ["Hover Me"],
            ),
          ],
        ),
      ]),
      Item("Context Menu", [
        (() => {
          const menu$ = new Timeless.ui.ContextMenuCore({
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
              new Timeless.ui.MenuItemCore({
                label: "More",
                menu: new Timeless.ui.MenuCore({
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
                onClick() {
                  console.log("delete");
                },
              }),
            ],
          });
          return ContextMenu({ store: menu$ }, [
            View(
              {
                class:
                  "flex items-center justify-center w-[300px] h-[150px] rounded-md border-2 border-dashed border-zinc-300 dark:border-zinc-700 text-sm text-zinc-500 select-none",
              },
              [Txt("Right click here")],
            ),
          ]);
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
              [
                Button(
                  { variant: "outline", store: new Timeless.ui.ButtonCore({}) },
                  ["Open Menu"],
                ),
              ],
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
                  side: "right",
                  align: "start",
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
              [
                Button(
                  { variant: "outline", store: new Timeless.ui.ButtonCore({}) },
                  ["Open Menu"],
                ),
              ],
            ),
          ],
        ),
      ]),
      Item("Tooltip", [
        View({ class: cn(["flex gap-2"]) }, [
          Tooltip({ content: ["Top tooltip"] }, [
            Button(
              {
                variant: "outline",
                size: "sm",
                store: new Timeless.ui.ButtonCore({}),
              },
              ["Top"],
            ),
          ]),
          Tooltip({ side: "bottom", content: ["Bottom tooltip"] }, [
            Button(
              {
                variant: "outline",
                size: "sm",
                store: new Timeless.ui.ButtonCore({}),
              },
              ["Bottom"],
            ),
          ]),
          Tooltip({ side: "left", content: ["Left tooltip"] }, [
            Button(
              {
                variant: "outline",
                size: "sm",
                store: new Timeless.ui.ButtonCore({}),
              },
              ["Left"],
            ),
          ]),
          Tooltip({ side: "right", content: ["Right tooltip"] }, [
            Button(
              {
                variant: "outline",
                size: "sm",
                store: new Timeless.ui.ButtonCore({}),
              },
              ["Right"],
            ),
          ]),
        ]),
      ]),
    ]),
  ]);
}

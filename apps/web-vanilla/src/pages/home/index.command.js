import { Section, Item } from "@/components/index.js";

export default function CommandView() {
  const view$ = new Timeless.ui.ScrollViewCore({});
  const isOpen = ref(false);
  const searchQuery = ref("");
  const selectedIndex = ref(0);
  const contentHostEl = ref(null);
  const contentCenterX = ref(0);
  const contentTop = ref(0);

  const searchInput = new Timeless.ui.InputCore({
    placeholder: "Type a command...",
    defaultValue: "",
  });

  const commands = [
    {
      id: "general",
      label: "Go to General",
      icon: "HomeOutlined",
      shortcut: "⌘1",
    },
    { id: "form", label: "Go to Form", icon: "EditOutlined", shortcut: "⌘2" },
    {
      id: "data",
      label: "Go to Data Display",
      icon: "DatabaseOutlined",
      shortcut: "⌘3",
    },
    {
      id: "overlay",
      label: "Go to Overlay",
      icon: "AppstoreOutlined",
      shortcut: "⌘4",
    },
    { id: "theme-light", label: "Switch to Light Theme", icon: "SunOutlined" },
    { id: "theme-dark", label: "Switch to Dark Theme", icon: "MoonOutlined" },
    {
      id: "refresh",
      label: "Refresh Page",
      icon: "RefreshOutlined",
      shortcut: "⌘R",
    },
    { id: "settings", label: "Open Settings", icon: "SettingOutlined" },
    { id: "search", label: "Search", icon: "SearchOutlined", shortcut: "⌘K" },
    {
      id: "copy",
      label: "Copy to Clipboard",
      icon: "CopyOutlined",
      shortcut: "⌘C",
    },
  ];

  const filteredCommands = computed(searchQuery, (query) => {
    if (!query) return commands;
    return commands.filter((cmd) =>
      cmd.label.toLowerCase().includes(query.toLowerCase()),
    );
  });

  const iconMap = {
    HomeOutlined: Icon({ name: "home" }),
    EditOutlined: Icon({ name: "edit" }),
    DatabaseOutlined: Icon({ name: "database" }),
    AppstoreOutlined: Icon({ name: "appstore" }),
    SunOutlined: Icon({ name: "sun" }),
    MoonOutlined: Icon({ name: "moon" }),
    RefreshOutlined: Icon({ name: "refresh" }),
    SettingOutlined: Icon({ name: "settings" }),
    SearchOutlined: Icon({ name: "search" }),
    CopyOutlined: Icon({ name: "copy" }),
  };

  let resizeListener;
  function getContentHostRect() {
    const el = contentHostEl.value;
    if (el instanceof HTMLElement) return el.getBoundingClientRect();
    return document.documentElement.getBoundingClientRect();
  }

  function syncPaletteAnchor() {
    const rect = getContentHostRect();
    contentCenterX.as(rect.left + rect.width / 2);
    contentTop.as(rect.top + rect.height * 0.2);
  }

  function activateResizeSync() {
    if (resizeListener) return;
    resizeListener = () => {
      syncPaletteAnchor();
    };
    window.addEventListener("resize", resizeListener);
  }

  function deactivateResizeSync() {
    if (!resizeListener) return;
    window.removeEventListener("resize", resizeListener);
    resizeListener = undefined;
  }

  function open() {
    isOpen.as(true);
    searchQuery.as("");
    searchInput.setValue("");
    selectedIndex.as(0);
    syncPaletteAnchor();
    activateResizeSync();
  }

  function close() {
    $clickOutside.methods.deactivate();
    deactivateResizeSync();
    isOpen.as(false);
  }

  function executeCommand(cmd) {
    console.log("Execute command:", cmd.label);
    close();
  }

  function handleKeyDown(e) {
    const filtered = filteredCommands.value;
    if (e.code === "ArrowDown") {
      e.preventDefault();
      selectedIndex.as((selectedIndex.value + 1) % filtered.length);
    } else if (e.code === "ArrowUp") {
      e.preventDefault();
      selectedIndex.as(
        (selectedIndex.value - 1 + filtered.length) % filtered.length,
      );
    } else if (e.code === "Enter") {
      e.preventDefault();
      if (filtered[selectedIndex.value]) {
        executeCommand(filtered[selectedIndex.value]);
      }
    } else if (e.code === "Escape") {
      e.preventDefault();
      close();
    }
  }

  // Click Outside Model - close panel when clicking outside
  const $clickOutside = Timeless.ui.ClickOutsideModel({
    onOutside() {
      close();
    },
  });

  // Register Ctrl+P shortcut
  const $shortcut = Timeless.ui.ShortcutModel({});
  $shortcut.methods.register({
    "ControlLeft+KeyP"() {
      open();
    },
    "ControlRight+KeyP"() {
      open();
    },
  });
  document.addEventListener("keydown", (event) => {
    if ((event.ctrlKey || event.metaKey) && event.code === "KeyP") {
      event.preventDefault();
    }
    $shortcut.methods.handleKeydown(event);
  });
  document.addEventListener("keyup", (event) => {
    $shortcut.methods.handleKeyup(event);
  });

  // Build command list items
  const commandListItems = For({
    each: filteredCommands,
    render(cmd, index) {
      return View(
        {
          class: Timeless.classNames([
            "flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg cursor-pointer transition-colors",
            combine({ selectedIndex, index, filteredCommands }, (t) => {
              return t.selectedIndex === t.index
                ? "bg-zinc-100 dark:bg-zinc-800"
                : "hover:bg-zinc-50 dark:hover:bg-zinc-800/50";
            }),
            computed([], () => {}),
          ]),
          onClick() {
            executeCommand(cmd);
          },
          onMouseEnter() {
            selectedIndex.as(index.value);
          },
        },
        [
          View(
            {
              class:
                "w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center flex-shrink-0",
            },
            [
              (() => {
                const icon = cmd.icon && iconMap[cmd.icon];
                if (icon) {
                  return View(
                    {
                      class: "w-4 h-4 text-zinc-500 dark:text-zinc-400",
                    },
                    [icon],
                  );
                }
                return View({ class: "w-4 h-4" });
              })(),
            ],
          ),
          View({ class: "flex-1 text-sm text-zinc-700 dark:text-zinc-200" }, [
            Txt(cmd.label),
          ]),
          Show({
            when: !!cmd.shortcut,
            ok() {
              return View(
                { class: "flex items-center gap-0.5 text-xs text-zinc-400" },
                [
                  ...cmd.shortcut.split("").map((char) =>
                    View(
                      {
                        class:
                          "px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 font-mono min-w-[20px] text-center",
                      },
                      [char],
                    ),
                  ),
                ],
              );
            },
          }),
        ],
      );
    },
  });

  return ScrollView(
    {
      class: "p-6 h-screen",
      store: view$,
      onMounted($el) {
        contentHostEl.as($el);
      },
    },
    [
      Section("Command Palette", [
        Item("Press Ctrl+P to open", [
          Button(
            {
              store: new Timeless.ui.ButtonCore({
                variant: "outline",
                onClick() {
                  open();
                },
              }),
              prefix: [Icon({ name: "search", size: 24 })],
            },
            ["Open Command Palette"],
          ),
        ]),
      ]),

      Show({
        when: isOpen,
        ok() {
          return [
            Portal({}, [
              View(
                {
                  class:
                    "fixed z-50 w-full max-w-[560px] pointer-events-auto rounded-xl shadow-2xl border border-zinc-200 dark:border-zinc-700 overflow-hidden bg-white dark:bg-zinc-900",
                  onMounted(event) {
                    syncPaletteAnchor();
                    $clickOutside.methods.setTargetRect(() =>
                      event.target.getBoundingClientRect(),
                    );
                    $clickOutside.methods.activate();
                  },
                  style: Timeless.styleNames([
                    computed(contentTop, (t) => {
                      return `top: ${t}px`;
                    }),
                    computed(contentCenterX, (x) => {
                      return `left: ${x}px`;
                    }),
                    "transform: translateX(-50%)",
                  ]),
                  onClick(event) {
                    event.stopPropagation();
                  },
                  onKeyDown(event) {
                    handleKeyDown(event);
                  },
                },
                [
                  View(
                    {
                      class:
                        "flex items-center gap-3 px-4 py-3 border-b border-zinc-200 dark:border-zinc-700",
                    },
                    [
                      Icon({ name: "search", size: 24 }),
                      Input({
                        store: searchInput,
                        class:
                          "flex-1 bg-transparent border-none outline-none text-sm placeholder:text-zinc-400 focus:ring-0",
                        onMounted($el) {
                          $el.addEventListener("input", () => {
                            searchQuery.as(searchInput.value);
                            selectedIndex.as(0);
                          });
                          if ($el instanceof HTMLElement && $el.focus) {
                            setTimeout(() => $el.focus(), 50);
                          }
                        },
                        onKeyDown(event) {
                          handleKeyDown(event);
                        },
                      }),
                      View(
                        {
                          class:
                            "flex items-center gap-1 text-xs text-zinc-400 flex-shrink-0",
                        },
                        [
                          View(
                            {
                              class:
                                "px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 font-mono",
                            },
                            ["ESC"],
                          ),
                        ],
                      ),
                    ],
                  ),

                  View({ class: "max-h-[320px] overflow-y-auto py-2" }, [
                    commandListItems,
                    Show({
                      when: computed(
                        filteredCommands,
                        (cmds) => cmds.length === 0,
                      ),
                      ok() {
                        return [
                          View(
                            {
                              class:
                                "px-4 py-8 text-center text-sm text-zinc-400",
                            },
                            [Txt("No commands found")],
                          ),
                        ];
                      },
                    }),
                  ]),

                  View(
                    {
                      class:
                        "flex items-center justify-between px-4 py-2 border-t border-zinc-200 dark:border-zinc-700 text-xs text-zinc-400",
                    },
                    [
                      View({ class: "flex items-center gap-3" }, [
                        View({ class: "flex items-center gap-1" }, [
                          View(
                            {
                              class:
                                "px-1 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 font-mono",
                            },
                            ["↑"],
                          ),
                          View(
                            {
                              class:
                                "px-1 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 font-mono",
                            },
                            ["↓"],
                          ),
                          Txt(" Navigate"),
                        ]),
                        View({ class: "flex items-center gap-1" }, [
                          View(
                            {
                              class:
                                "px-1 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 font-mono",
                            },
                            ["↵"],
                          ),
                          Txt(" Select"),
                        ]),
                      ]),
                      Txt("Command Palette"),
                    ],
                  ),
                ],
              ),
            ]),
          ];
        },
      }),
    ],
  );
}

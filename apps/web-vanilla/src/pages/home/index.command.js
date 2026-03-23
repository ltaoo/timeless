import { Section, Item } from "@/components/index.js";

export default function CommandView() {
  const isOpen = ref(false);
  const searchQuery = ref("");
  const selectedIndex = ref(0);
  const contentLeft = ref(0);
  const contentWidth = ref(0);

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
    HomeOutlined: Timeless.icons.FileOutlined,
    EditOutlined: Timeless.icons.Undo2Outlined,
    DatabaseOutlined: Timeless.icons.FileBoxOutlined,
    AppstoreOutlined: Timeless.icons.Grid3x3Outlined,
    SunOutlined: Timeless.icons.BoltOutlined,
    MoonOutlined: Timeless.icons.ClockOutlined,
    RefreshOutlined: Timeless.icons.RefreshCcwOutlined,
    SettingOutlined: Timeless.icons.BoltOutlined,
    SearchOutlined: Timeless.icons.SearchOutlined,
    CopyOutlined: Timeless.icons.FileSymlinkOutlined,
  };

  function open() {
    isOpen.as(true);
    searchQuery.as("");
    searchInput.setValue("");
    selectedIndex.as(0);
  }

  function close() {
    $clickOutside.methods.deactivate();
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
          class: cn([
            "flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg cursor-pointer transition-colors",
            computed([selectedIndex, filteredCommands], () => {
              return selectedIndex.value === index
                ? "bg-zinc-100 dark:bg-zinc-800"
                : "hover:bg-zinc-50 dark:hover:bg-zinc-800/50";
            }),
          ]),
          onClick() {
            executeCommand(cmd);
          },
          onMouseEnter() {
            selectedIndex.as(index);
          },
        },
        [
          View(
            {
              class:
                "w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center flex-shrink-0",
            },
            [
              cmd.icon && iconMap[cmd.icon]
                ? iconMap[cmd.icon]({
                    class: "w-4 h-4 text-zinc-500 dark:text-zinc-400",
                  })
                : View({ class: "w-4 h-4" }),
            ],
          ),
          View({ class: "flex-1 text-sm text-zinc-700 dark:text-zinc-200" }, [
            Txt(cmd.label),
          ]),
          cmd.shortcut
            ? View(
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
              )
            : null,
        ],
      );
    },
  });

  return View(
    {
      class: "relative space-y-8",
      /** @param {HTMLDivElement} $el */
      onMounted($el) {
        setTimeout(() => {
          const left = $el.getBoundingClientRect().left;
          contentLeft.as(left);
        }, 0);
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
              prefix: [Timeless.icons.SearchOutlined({ class: "w-4 h-4" })],
            },
            ["Open Command Palette"],
          ),
        ]),
      ]),

      // Command Palette Panel (Portal to body)
      Show({ when: isOpen }, [
        Portal({}, [
          // Command Palette Content
          View(
            {
              class:
                "fixed z-50 w-full max-w-[560px] pointer-events-auto bg-white dark:bg-zinc-900 rounded-xl shadow-2xl border border-zinc-200 dark:border-zinc-700 overflow-hidden",
              /** @param {HTMLDivElement} $el */
              onMounted($el) {
                $clickOutside.methods.setTargetRect(() =>
                  $el.getBoundingClientRect(),
                );
                $clickOutside.methods.activate();
              },
              style: sn([
                "top: 20vh",
                computed(contentLeft, (t) => {
                  return `left: ${t}px`;
                }),
              ]),
              onClick(event) {
                event.stopPropagation();
              },
              onKeyDown(event) {
                handleKeyDown(event);
              },
            },
            [
              // Search Input
              View(
                {
                  class:
                    "flex items-center gap-3 px-4 py-3 border-b border-zinc-200 dark:border-zinc-700",
                },
                [
                  Timeless.icons.SearchOutlined({
                    class: "w-5 h-5 text-zinc-400 flex-shrink-0",
                  }),
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

              // Command List
              View({ class: "max-h-[320px] overflow-y-auto py-2" }, [
                commandListItems,
                Show(
                  {
                    when: computed(
                      filteredCommands,
                      (cmds) => cmds.length === 0,
                    ),
                  },
                  [
                    View(
                      { class: "px-4 py-8 text-center text-sm text-zinc-400" },
                      [Txt("No commands found")],
                    ),
                  ],
                ),
              ]),

              // Footer
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
      ]),
    ],
  );
}

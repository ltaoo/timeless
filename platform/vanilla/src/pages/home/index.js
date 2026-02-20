function Section(title, children) {
  return View({ class: "space-y-3" }, [
    View(
      { class: "text-sm font-semibold text-zinc-500 uppercase tracking-wider" },
      [Txt(title)],
    ),
    View({ class: "space-y-4 pl-1" }, children),
  ]);
}

function Item(label, children) {
  return View({ class: "space-y-2" }, [
    View({ class: "text-sm text-zinc-400" }, [Txt(label)]),
    View({ class: "flex flex-wrap items-center gap-3" }, children),
  ]);
}

export function HomePageView() {
  // Shared state for interactive demos
  const progressVal = ref(60);
  const stepIdx = ref(1);
  const dialog$ = new Timeless.ui.DialogCore({
    title: "Dialog Title",
    footer: true,
  });

  const categories = [
    { label: "General", value: "general" },
    { label: "Form", value: "form" },
    { label: "Data Display", value: "data" },
    { label: "Feedback", value: "feedback" },
    { label: "Navigation", value: "nav" },
    { label: "Overlay", value: "overlay" },
  ];
  const activeCategory = ref("general");

  return View({ class: "flex h-full" }, [
    // Sidebar
    View(
      { class: "w-[180px] border-r border-zinc-200 dark:border-zinc-800 py-4" },
      [
        View(
          {
            class:
              "px-3 mb-3 text-xs font-bold text-zinc-400 uppercase tracking-widest",
          },
          [Txt("Components")],
        ),
        For({
          each: categories,
          render(cat) {
            return View(
              {
                class: computed({ activeCategory }, (d) =>
                  [
                    "px-3 py-2 text-sm cursor-pointer transition-colors",
                    d.activeCategory === cat.value
                      ? "text-zinc-900 bg-zinc-100 font-medium dark:text-zinc-50 dark:bg-zinc-800"
                      : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50",
                  ].join(" "),
                ),
                onClick() {
                  activeCategory.value = cat.value;
                },
              },
              [Txt(cat.label)],
            );
          },
        }),
      ],
    ),
    // Content
    View({ class: "flex-1 w-0 overflow-y-auto p-6" }, [
      // === General ===
      Show(
        {
          when: computed(
            { activeCategory },
            (d) => d.activeCategory === "general",
          ),
        },
        [
          View({ class: "space-y-8" }, [
            Section("Button", [
              Item("Variants", [
                Button({}, [Txt("Default")]),
                Button({ variant: "secondary" }, [Txt("Secondary")]),
                Button({ variant: "outline" }, [Txt("Outline")]),
                Button({ variant: "ghost" }, [Txt("Ghost")]),
                Button({ variant: "destructive" }, [Txt("Destructive")]),
                Button({ variant: "link" }, [Txt("Link")]),
              ]),
              Item("Sizes", [
                Button({ size: "sm" }, [Txt("Small")]),
                Button({}, [Txt("Default")]),
                Button({ size: "lg" }, [Txt("Large")]),
              ]),
            ]),
            Section("Badge", [
              Item("Variants", [
                Badge({}, [Txt("Default")]),
                Badge({ variant: "secondary" }, [Txt("Secondary")]),
                Badge({ variant: "outline" }, [Txt("Outline")]),
                Badge({ variant: "destructive" }, [Txt("Destructive")]),
              ]),
            ]),
            Section("Separator", [
              Item("Horizontal", [View({ class: "w-full" }, [Separator({})])]),
              Item("Vertical", [
                View({ class: "flex items-center h-6 gap-3" }, [
                  Txt("Left"),
                  Separator({ orientation: "vertical" }),
                  Txt("Right"),
                ]),
              ]),
            ]),
            Section("Avatar", [
              Item("Sizes", [
                Avatar({ src: "", fallback: "S", size: "sm" }),
                Avatar({ src: "", fallback: "M" }),
                Avatar({ src: "", fallback: "L", size: "lg" }),
              ]),
            ]),
            Section("Card", [
              Item("Default", [
                Card({ class: "w-[350px]" }, [
                  CardHeader({}, [
                    CardTitle({}, [Txt("Card Title")]),
                    CardDescription({}, [Txt("Card description goes here.")]),
                  ]),
                  CardContent({}, [
                    View({ class: "text-sm" }, [
                      Txt("This is the card content area."),
                    ]),
                  ]),
                  CardFooter({}, [Button({ size: "sm" }, [Txt("Action")])]),
                ]),
              ]),
            ]),
          ]),
        ],
      ),
      // === Form ===
      Show(
        {
          when: computed(
            { activeCategory },
            (d) => d.activeCategory === "form",
          ),
        },
        [
          View({ class: "space-y-8" }, [
            Section("Input", [
              Item("Default", [
                Input({
                  store: new Timeless.ui.InputCore({ defaultValue: "" }),
                  placeholder: "Type something...",
                }),
              ]),
            ]),
            Section("Textarea", [
              Item("Default", [
                Textarea({
                  store: new Timeless.ui.InputCore({ defaultValue: "" }),
                  placeholder: "Enter your message...",
                  rows: "3",
                }),
              ]),
            ]),
            Section("Label", [
              Item("With Input", [
                View({ class: "space-y-2 w-full" }, [
                  Label({}, [Txt("Email")]),
                  Input({
                    store: new Timeless.ui.InputCore({ defaultValue: "" }),
                    placeholder: "email@example.com",
                  }),
                ]),
              ]),
            ]),
            Section("Select", [
              Item("Default", [
                Select({
                  store: new Timeless.ui.SelectCore({
                    defaultValue: "apple",
                    options: [
                      { value: "apple", label: "苹果" },
                      { value: "banana", label: "香蕉" },
                      { value: "orange", label: "橙子" },
                    ],
                  }),
                }),
              ]),
            ]),
            Section("Checkbox", [
              Item("Default", [
                Checkbox({ store: new Timeless.ui.CheckboxCore({}) }),
              ]),
            ]),
            Section("Switch", [
              Item("Default", [
                Switch({ store: new Timeless.ui.CheckboxCore({}) }),
              ]),
            ]),
            Section("Slider", [
              Item("Default", [Slider({ value: ref(50), min: 0, max: 100 })]),
            ]),
          ]),
        ],
      ),
      // === Data Display ===
      Show(
        {
          when: computed(
            { activeCategory },
            (d) => d.activeCategory === "data",
          ),
        },
        [
          View({ class: "space-y-8" }, [
            Section("Progress", [
              Item("60%", [Progress({ value: progressVal, max: 100 })]),
              Item("Controls", [
                Button(
                  {
                    size: "sm",
                    onClick() {
                      progressVal.value = Math.max(0, progressVal.value - 10);
                    },
                  },
                  [Txt("-10")],
                ),
                Button(
                  {
                    size: "sm",
                    onClick() {
                      progressVal.value = Math.min(100, progressVal.value + 10);
                    },
                  },
                  [Txt("+10")],
                ),
              ]),
            ]),
            Section("Steps", [
              Item("3 Steps", [
                Steps({
                  current: stepIdx,
                  items: [
                    { title: "Account" },
                    { title: "Profile" },
                    { title: "Complete" },
                  ],
                }),
              ]),
              Item("Controls", [
                Button(
                  {
                    size: "sm",
                    onClick() {
                      stepIdx.value = Math.max(0, stepIdx.value - 1);
                    },
                  },
                  [Txt("Prev")],
                ),
                Button(
                  {
                    size: "sm",
                    onClick() {
                      stepIdx.value = Math.min(3, stepIdx.value + 1);
                    },
                  },
                  [Txt("Next")],
                ),
              ]),
            ]),
            Section("Skeleton", [
              Item("Default", [
                View({ class: "space-y-3 w-[250px]" }, [
                  Skeleton({ class: "h-[125px] w-full rounded-xl" }),
                  View({ class: "space-y-2" }, [
                    Skeleton({ class: "h-4 w-full" }),
                    Skeleton({ class: "h-4 w-[200px]" }),
                  ]),
                ]),
              ]),
            ]),
            Section("ScrollArea", [
              Item("Default", [
                ScrollArea(
                  {
                    class:
                      "h-[200px] w-[250px] rounded-md border border-zinc-200 p-4 dark:border-zinc-800",
                  },
                  [
                    View({ class: "space-y-4" }, [
                      ...[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) =>
                        View({ class: "text-sm" }, [
                          Txt(`Item ${i} — Scrollable content area`),
                        ]),
                      ),
                    ]),
                  ],
                ),
              ]),
            ]),
            Section("AspectRatio", [
              Item("16:9", [
                View({ class: "w-[300px]" }, [
                  AspectRatio({ ratio: 16 / 9 }, [
                    View(
                      {
                        class:
                          "flex items-center justify-center w-full h-full rounded-md bg-zinc-100 dark:bg-zinc-800 text-sm text-zinc-500",
                      },
                      [Txt("16 : 9")],
                    ),
                  ]),
                ]),
              ]),
            ]),
            Section("Table", [
              Item("Default", [
                Table({}, [
                  TableHeader({}, [
                    TableRow({}, [
                      TableHead({}, [Txt("Name")]),
                      TableHead({}, [Txt("Status")]),
                      TableHead({}, [Txt("Role")]),
                    ]),
                  ]),
                  TableBody({}, [
                    TableRow({}, [
                      TableCell({}, [Txt("Alice")]),
                      TableCell({}, [Txt("Active")]),
                      TableCell({}, [Txt("Admin")]),
                    ]),
                    TableRow({}, [
                      TableCell({}, [Txt("Bob")]),
                      TableCell({}, [Txt("Inactive")]),
                      TableCell({}, [Txt("User")]),
                    ]),
                    TableRow({}, [
                      TableCell({}, [Txt("Charlie")]),
                      TableCell({}, [Txt("Active")]),
                      TableCell({}, [Txt("Editor")]),
                    ]),
                  ]),
                ]),
              ]),
            ]),
          ]),
        ],
      ),
      // === Feedback ===
      Show(
        {
          when: computed(
            { activeCategory },
            (d) => d.activeCategory === "feedback",
          ),
        },
        [
          View({ class: "space-y-8" }, [
            Section("Dialog", [
              Item("Default", [
                Button(
                  {
                    onClick() {
                      dialog$.show();
                    },
                  },
                  [Txt("Open Dialog")],
                ),
                Dialog({ store: dialog$ }, [
                  View({ class: "text-sm text-zinc-500" }, [
                    Txt(
                      "This is a dialog content area. You can put anything here.",
                    ),
                  ]),
                ]),
              ]),
            ]),
            Section("Presence", [
              Item("Toggle visibility", [
                (() => {
                  const p$ = new Timeless.ui.PresenceCore({});
                  return View({ class: "space-y-2" }, [
                    Button(
                      {
                        size: "sm",
                        onClick() {
                          p$.show();
                        },
                      },
                      [Txt("Show")],
                    ),
                    Button(
                      {
                        size: "sm",
                        variant: "outline",
                        onClick() {
                          p$.hide();
                        },
                      },
                      [Txt("Hide")],
                    ),
                    Presence(
                      {
                        store: p$,
                        class:
                          "p-3 rounded-md bg-zinc-100 dark:bg-zinc-800 text-sm",
                      },
                      [Txt("I am visible!")],
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
                        onClick() {
                          toast$.show({ texts: ["Operation successful!"] });
                        },
                      },
                      [Txt("Success")],
                    ),
                    Button(
                      {
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
                      },
                      [Txt("Loading")],
                    ),
                    Toast({ store: toast$ }),
                  ]);
                })(),
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
          ]),
        ],
      ),
      // === Navigation ===
      Show(
        {
          when: computed({ activeCategory }, (d) => d.activeCategory === "nav"),
        },
        [
          View({ class: "space-y-8" }, [
            Section("Tabs", [
              Item("Default", [
                Tabs({
                  value: ref("tab1"),
                  items: [
                    {
                      label: "Account",
                      value: "tab1",
                      content: Txt("Account settings content."),
                    },
                    {
                      label: "Password",
                      value: "tab2",
                      content: Txt("Password settings content."),
                    },
                    {
                      label: "Notifications",
                      value: "tab3",
                      content: Txt("Notification preferences."),
                    },
                  ],
                }),
              ]),
            ]),
            Section("Accordion", [
              Item("Default", [
                Accordion({
                  items: [
                    {
                      title: "Is it accessible?",
                      content:
                        "Yes. It adheres to the WAI-ARIA design pattern.",
                    },
                    {
                      title: "Is it styled?",
                      content:
                        "Yes. It comes with default styles that match the other components.",
                    },
                    {
                      title: "Is it animated?",
                      content:
                        "Yes. It uses CSS transitions for smooth open/close.",
                    },
                  ],
                }),
              ]),
            ]),
          ]),
        ],
      ),
      // === Overlay ===
      Show(
        {
          when: computed(
            { activeCategory },
            (d) => d.activeCategory === "overlay",
          ),
        },
        [
          View({ class: "space-y-8" }, [
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
                  [Button({ variant: "outline" }, [Txt("Open Menu")])],
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
            ]),
            Section("Popover", [
              Item("Default", [
                (() => {
                  const popover$ = new Timeless.ui.PopoverCore({});
                  return View({ class: "inline-block" }, [
                    Button(
                      {
                        variant: "outline",
                        onClick(event) {
                          const rect =
                            event.currentTarget.getBoundingClientRect();
                          popover$.toggle({
                            x: rect.left,
                            y: rect.bottom + 4,
                            width: rect.width,
                            height: rect.height,
                          });
                        },
                      },
                      [Txt("Open Popover")],
                    ),
                    Popover({ store: popover$ }, [
                      View({ class: "space-y-2" }, [
                        View({ class: "text-sm font-medium" }, [
                          Txt("Popover Title"),
                        ]),
                        View({ class: "text-sm text-zinc-500" }, [
                          Txt("This is the popover content."),
                        ]),
                      ]),
                    ]),
                  ]);
                })(),
              ]),
            ]),
            Section("Tooltip", [
              Item("Positions", [
                Tooltip({ content: "Top tooltip", side: "top" }, [
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
                  return View({ class: "flex gap-2" }, [
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
                      View({ class: "mt-8 space-y-2" }, [
                        View({ class: "text-lg font-semibold" }, [
                          Txt("Sheet Right"),
                        ]),
                        View({ class: "text-sm text-zinc-500" }, [
                          Txt("This is sheet content sliding from the right."),
                        ]),
                      ]),
                    ]),
                    Sheet({ store: sheetL$, side: "left" }, [
                      View({ class: "mt-8 space-y-2" }, [
                        View({ class: "text-lg font-semibold" }, [
                          Txt("Sheet Left"),
                        ]),
                        View({ class: "text-sm text-zinc-500" }, [
                          Txt("This is sheet content sliding from the left."),
                        ]),
                      ]),
                    ]),
                    Sheet({ store: sheetB$, side: "bottom" }, [
                      View({ class: "space-y-2" }, [
                        View({ class: "text-lg font-semibold" }, [
                          Txt("Sheet Bottom"),
                        ]),
                        View({ class: "text-sm text-zinc-500" }, [
                          Txt("This is sheet content sliding from the bottom."),
                        ]),
                      ]),
                    ]),
                  ]);
                })(),
              ]),
            ]),
          ]),
        ],
      ),
    ]),
  ]);
}

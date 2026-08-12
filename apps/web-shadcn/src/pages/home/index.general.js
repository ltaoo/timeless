import { Section, Item } from "@/components/index.js";

export default function GeneralView() {
  const view$ = new Timeless.vm.ScrollViewCore({});
  const list_ = refarr([]);

  setTimeout(() => {
    list_.as(["Alpha", "Beta", "Gamma"]);
  }, 3000);

  return ScrollView({ class: "p-6 h-screen", store: view$ }, [
    Flex({ direction: "col", gap: "24px" }, [
      Section("Button", [
        Item("Variants", [
          Button({ store: new Timeless.vm.ButtonCore({}) }, ["Default"]),
          Button(
            {
              store: new Timeless.vm.ButtonCore({ variant: "secondary" }),
            },
            ["Secondary"],
          ),
          Button(
            { store: new Timeless.vm.ButtonCore({ variant: "outline" }) },
            ["Outline"],
          ),
          Button({ store: new Timeless.vm.ButtonCore({ variant: "ghost" }) }, [
            "Ghost",
          ]),
          Button(
            { store: new Timeless.vm.ButtonCore({ variant: "destructive" }) },
            ["Destructive"],
          ),
          Button({ store: new Timeless.vm.ButtonCore({ variant: "link" }) }, [
            "Link",
          ]),
        ]),
        Item("Sizes", [
          Button({ store: new Timeless.vm.ButtonCore({ size: "xs" }) }, ["XS"]),
          Button({ store: new Timeless.vm.ButtonCore({ size: "sm" }) }, ["SM"]),
          Button({ store: new Timeless.vm.ButtonCore({}) }, ["Default"]),
          Button({ store: new Timeless.vm.ButtonCore({ size: "lg" }) }, ["LG"]),
          Button({ store: new Timeless.vm.ButtonCore({ size: "icon-xs" }) }, [
            Icon({ name: "bolt", size: 12 }),
          ]),
          Button({ store: new Timeless.vm.ButtonCore({ size: "icon-sm" }) }, [
            Icon({ name: "bolt", size: 16 }),
          ]),
          Button({ store: new Timeless.vm.ButtonCore({ size: "icon" }) }, [
            Icon({ name: "bolt", size: 24 }),
          ]),
          Button({ store: new Timeless.vm.ButtonCore({ size: "icon-lg" }) }, [
            Icon({ name: "bolt", size: 28 }),
          ]),
        ]),
        Item("Loading", [
          (() => {
            const store = new Timeless.vm.ButtonCore({
              onClick: () => {
                store.setLoading(true);
                setTimeout(() => {
                  store.setLoading(false);
                }, 2000);
              },
            });
            return Button({ store }, ["Click to Load"]);
          })(),
          (() => {
            const store = new Timeless.vm.ButtonCore({
              variant: "secondary",
              onClick: () => {
                store.setLoading(true);
                setTimeout(() => {
                  store.setLoading(false);
                }, 2000);
              },
            });
            return Button({ store }, ["Click to Load"]);
          })(),
          (() => {
            const store = new Timeless.vm.ButtonCore({
              variant: "outline",
              onClick: () => {
                store.setLoading(true);
                setTimeout(() => {
                  store.setLoading(false);
                }, 2000);
              },
            });
            return Button({ store }, ["Click to Load"]);
          })(),
        ]),
        Item("With Prefix Icon", [
          Button(
            {
              store: new Timeless.vm.ButtonCore({}),
              prefix: [Icon({ name: "download", size: 24 })],
            },
            ["Download"],
          ),
          (() => {
            const playing = ref(false);
            const playStore = new Timeless.vm.ButtonCore({
              variant: "secondary",
              onClick: () => {
                playing.as(true);
              },
            });
            const cancelStore = new Timeless.vm.ButtonCore({
              variant: "secondary",
              onClick: () => {
                playing.as(false);
              },
            });
            return View({}, [
              Show({
                when: computed(playing, (v) => !v),
                ok() {
                  return [
                    Button(
                      {
                        store: playStore,
                        prefix: [Icon({ name: "play", size: 24 })],
                      },
                      ["Play"],
                    ),
                  ];
                },
              }),
              Show({
                when: computed(playing, (v) => v),
                ok() {
                  return [
                    Button(
                      {
                        store: cancelStore,
                        prefix: [
                          View(
                            {
                              class: "inline-block h-4 w-4 animate-spin",
                              style: { "transform-origin": "center" },
                            },
                            [Icon({ name: "loader-circle", size: 24 })],
                          ),
                        ],
                      },
                      ["取消"],
                    ),
                  ];
                },
              }),
            ]);
          })(),
          Button(
            {
              store: new Timeless.vm.ButtonCore({ variant: "outline" }),
              prefix: [Icon({ name: "bolt", size: 24 })],
            },
            ["Settings"],
          ),
        ]),
        Item("Show With For", [
          Show({
            when: computed(list_, (list) => list.length > 0),
            ok() {
              return View({ class: "space-y-2" }, [
                For({
                  each: list_,
                  render(item) {
                    return View(
                      {
                        class:
                          "rounded-md border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-800",
                      },
                      [item],
                    );
                  },
                }),
              ]);
            },
            else() {
              return View({ class: "text-sm text-zinc-500" }, [
                "Waiting for list data...",
              ]);
            },
          }),
        ]),
        Item("Disabled", [
          Button({ store: new Timeless.vm.ButtonCore({ disabled: true }) }, [
            "Disabled",
          ]),
          Button(
            {
              store: new Timeless.vm.ButtonCore({
                variant: "secondary",
                disabled: true,
              }),
            },
            ["Disabled"],
          ),
          Button(
            {
              store: new Timeless.vm.ButtonCore({
                variant: "outline",
                disabled: true,
              }),
            },
            ["Disabled"],
          ),
        ]),
      ]),
      Section("Badge", [
        Item("Variants", [
          Badge({}, ["Default"]),
          Badge({ variant: "secondary" }, ["Secondary"]),
          Badge({ variant: "outline" }, ["Outline"]),
          Badge({ variant: "destructive" }, ["Destructive"]),
        ]),
      ]),
      Section("Separator", [
        Item("Horizontal", [View({ class: "w-full" }, [Separator({})])]),
        Item("Vertical", [
          View(
            { class: Timeless.classNames(["flex items-center h-6 gap-3"]) },
            ["Left", Separator({ orientation: "vertical" }), "Right"],
          ),
        ]),
      ]),
      // Section("Avatar", [
      //   Item("Sizes", [
      //     Avatar({ src: "", fallback: "S", size: "sm" }),
      //     Avatar({ src: "", fallback: "M" }),
      //     Avatar({ src: "", fallback: "L", size: "lg" }),
      //   ]),
      // ]),
      Section("Card", [
        Item("Default", [
          Card({ class: "w-[350px]" }, [
            CardHeader({}, [
              CardTitle({}, ["Card Title"]),
              CardDescription({}, ["Card description goes here."]),
            ]),
            CardContent({}, [
              View({ class: "text-sm" }, ["This is the card content area."]),
            ]),
            CardFooter({}, [
              Button({ store: new Timeless.vm.ButtonCore({ size: "sm" }) }, [
                "Action",
              ]),
            ]),
          ]),
        ]),
      ]),
    ]),
  ]);
}

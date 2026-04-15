import { Section, Item } from "@/components/index.js";

export default function GeneralView() {
  const view$ = new Timeless.ui.ScrollViewCore({});

  const elm = ScrollView({ class: "p-6 h-screen", store: view$ }, [
    Flex({ direction: "col", gap: "24px" }, [
      Section("Button", [
        Item("Variants", [
          Button({ store: new Timeless.ui.ButtonCore({}) }, ["Default"]),
          Button(
            {
              store: new Timeless.ui.ButtonCore({ variant: "secondary" }),
            },
            ["Secondary"],
          ),
          Button(
            { store: new Timeless.ui.ButtonCore({ variant: "outline" }) },
            ["Outline"],
          ),
          Button({ store: new Timeless.ui.ButtonCore({ variant: "ghost" }) }, [
            "Ghost",
          ]),
          Button(
            { store: new Timeless.ui.ButtonCore({ variant: "destructive" }) },
            ["Destructive"],
          ),
          Button({ store: new Timeless.ui.ButtonCore({ variant: "link" }) }, [
            "Link",
          ]),
        ]),
        Item("Sizes", [
          Button({ store: new Timeless.ui.ButtonCore({ size: "xs" }) }, ["XS"]),
          Button({ store: new Timeless.ui.ButtonCore({ size: "sm" }) }, ["SM"]),
          Button({ store: new Timeless.ui.ButtonCore({}) }, ["Default"]),
          Button({ store: new Timeless.ui.ButtonCore({ size: "lg" }) }, ["LG"]),
          Button({ store: new Timeless.ui.ButtonCore({ size: "icon-xs" }) }, [
            Icon({ name: "bolt", size: 12 }),
          ]),
          Button({ store: new Timeless.ui.ButtonCore({ size: "icon-sm" }) }, [
            Icon({ name: "bolt", size: 16 }),
          ]),
          Button({ store: new Timeless.ui.ButtonCore({ size: "icon" }) }, [
            Icon({ name: "bolt", size: 24 }),
          ]),
          Button({ store: new Timeless.ui.ButtonCore({ size: "icon-lg" }) }, [
            Icon({ name: "bolt", size: 28 }),
          ]),
        ]),
        Item("Loading", [
          (() => {
            const store = new Timeless.ui.ButtonCore({
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
            const store = new Timeless.ui.ButtonCore({
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
            const store = new Timeless.ui.ButtonCore({
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
              store: new Timeless.ui.ButtonCore({}),
              prefix: [Icon({ name: "download", size: 24 })],
            },
            ["Download"],
          ),
          (() => {
            const playing = ref(false);
            const playStore = new Timeless.ui.ButtonCore({
              variant: "secondary",
              onClick: () => {
                playing.as(true);
              },
            });
            const cancelStore = new Timeless.ui.ButtonCore({
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
              store: new Timeless.ui.ButtonCore({ variant: "outline" }),
              prefix: [Icon({ name: "bolt", size: 24 })],
            },
            ["Settings"],
          ),
        ]),
        Item("Disabled", [
          Button({ store: new Timeless.ui.ButtonCore({ disabled: true }) }, [
            "Disabled",
          ]),
          Button(
            {
              store: new Timeless.ui.ButtonCore({
                variant: "secondary",
                disabled: true,
              }),
            },
            ["Disabled"],
          ),
          Button(
            {
              store: new Timeless.ui.ButtonCore({
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
              Button({ store: new Timeless.ui.ButtonCore({ size: "sm" }) }, [
                "Action",
              ]),
            ]),
          ]),
        ]),
      ]),
    ]),
  ]);

  if (import.meta.hot) {
    import.meta.hot.data.currentElement = elm;
  }

  return elm;
}

// Vite HMR
if (import.meta.hot) {
  import.meta.hot.accept((newModule) => {
    const currentElement = import.meta.hot.data.currentElement;
    if (!newModule || !currentElement) return;
    const newElement = newModule.default();
    const ok = patch(currentElement, newElement);
    console.log("[HMR] patch result:", ok);
  });
}

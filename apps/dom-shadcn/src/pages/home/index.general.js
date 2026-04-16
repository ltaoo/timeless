import { View, Column, Icon } from "@timeless/timeless";
import { Button, Badge, Separator, ScrollView, ui } from "@timeless/shadcn";

import { Section, Item } from "@/components/index";

export default function GeneralView() {
  const view$ = new ui.ScrollViewCore({});

  return ScrollView(
    {
      store: view$,
      style: {
        height: "100vh",
        padding: "24px",
      },
    },
    [
      Column({ gap: "24px" }, [
        Section("Button", [
          Item("Variants", [
            Button({ store: new ui.ButtonCore({}) }, ["Default"]),
            Button({ store: new ui.ButtonCore({ variant: "secondary" }) }, [
              "Secondary",
            ]),
            Button({ store: new ui.ButtonCore({ variant: "outline" }) }, [
              "Outline",
            ]),
            Button({ store: new ui.ButtonCore({ variant: "ghost" }) }, [
              "Ghost",
            ]),
            Button({ store: new ui.ButtonCore({ variant: "destructive" }) }, [
              "Destructive",
            ]),
            Button({ store: new ui.ButtonCore({ variant: "link" }) }, ["Link"]),
          ]),
          Item("Sizes", [
            Button({ store: new ui.ButtonCore({ size: "xs" }) }, ["XS"]),
            Button({ store: new ui.ButtonCore({ size: "sm" }) }, ["SM"]),
            Button({ store: new ui.ButtonCore({}) }, ["Default"]),
            Button({ store: new ui.ButtonCore({ size: "lg" }) }, ["LG"]),
            Button({ store: new ui.ButtonCore({ size: "icon-xs" }) }, [
              Icon({ name: "bolt", size: 12 }),
            ]),
            Button({ store: new ui.ButtonCore({ size: "icon-sm" }) }, [
              Icon({ name: "bolt", size: 16 }),
            ]),
            Button({ store: new ui.ButtonCore({ size: "icon" }) }, [
              Icon({ name: "bolt", size: 24 }),
            ]),
            Button({ store: new ui.ButtonCore({ size: "icon-lg" }) }, [
              Icon({ name: "bolt", size: 28 }),
            ]),
          ]),
          Item("Loading", [
            (() => {
              const store = new ui.ButtonCore({
                onClick() {
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
                store: new ui.ButtonCore({}),
                prefix: [Icon({ name: "download", size: 24 })],
              },
              ["Download"],
            ),
            Button(
              {
                store: new ui.ButtonCore({ variant: "outline" }),
                prefix: [Icon({ name: "bolt", size: 24 })],
              },
              ["Settings"],
            ),
          ]),
          Item("Disabled", [
            Button({ store: new ui.ButtonCore({ disabled: true }) }, [
              "Disabled",
            ]),
            Button(
              {
                store: new ui.ButtonCore({
                  variant: "secondary",
                  disabled: true,
                }),
              },
              ["Disabled"],
            ),
            Button(
              {
                store: new ui.ButtonCore({
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
              {
                style: {
                  display: "flex",
                  alignItems: "center",
                  height: "24px",
                  gap: "12px",
                },
              },
              ["Left", Separator({ orientation: "vertical" }), "Right"],
            ),
          ]),
        ]),
      ]),
    ],
  );
}

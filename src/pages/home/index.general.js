import { Section, Item } from "@/components/index.js";

export default function GeneralView() {
  return View({ class: cn(["space-y-8"]) }, [
    Section("Button", [
      Item("Variants", [
        Button({ store: new Timeless.ui.ButtonCore({}) }, ["Default"]),
        Button(
          {
            store: new Timeless.ui.ButtonCore({ variant: "secondary" }),
          },
          ["Secondary"],
        ),
        Button({ store: new Timeless.ui.ButtonCore({ variant: "outline" }) }, [
          "Outline",
        ]),
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
        Button({ store: new Timeless.ui.ButtonCore({ size: "sm" }) }, [
          "Small",
        ]),
        Button({ store: new Timeless.ui.ButtonCore({}) }, ["Default"]),
        Button({ store: new Timeless.ui.ButtonCore({ size: "lg" }) }, [
          "Large",
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
      Item("Disabled", [
        Button(
          { store: new Timeless.ui.ButtonCore({ disabled: true }) },
          ["Disabled"],
        ),
        Button(
          {
            store: new Timeless.ui.ButtonCore({ variant: "secondary", disabled: true }),
          },
          ["Disabled"],
        ),
        Button(
          {
            store: new Timeless.ui.ButtonCore({ variant: "outline", disabled: true }),
          },
          ["Disabled"],
        ),
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
      Item("Horizontal", [View({ class: cn(["w-full"]) }, [Separator({})])]),
      Item("Vertical", [
        View({ class: cn(["flex items-center h-6 gap-3"]) }, [
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
        Card({ class: cn(["w-[350px]"]) }, [
          CardHeader({}, [
            CardTitle({}, [Txt("Card Title")]),
            CardDescription({}, [Txt("Card description goes here.")]),
          ]),
          CardContent({}, [
            View({ class: cn(["text-sm"]) }, [
              Txt("This is the card content area."),
            ]),
          ]),
          CardFooter({}, [
            Button({ size: "sm", store: new Timeless.ui.ButtonCore({}) }, [
              "Action",
            ]),
          ]),
        ]),
      ]),
    ]),
  ]);
}

import { Section, Item } from "@/components/index.js";

export function GeneralView() {
  return View({ class: cn(["space-y-8"]) }, [
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
      Item("Horizontal", [
        View({ class: cn(["w-full"]) }, [Separator({})]),
      ]),
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
          CardFooter({}, [Button({ size: "sm" }, [Txt("Action")])]),
        ]),
      ]),
    ]),
  ]);
}

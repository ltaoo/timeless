const { View, Text, Fragment, For, Show, computed, ref, refobj } = Timeless;
import { Section, Item } from "../../components/index.js";

export default function Page(props) {
  const count_ = ref(0);
  const loading_ = ref(false);

  return View({ class: "p-6" }, [
    Text({ class: "text-2xl font-bold mb-6" }, ["General Components"]),

    Section("Button", [
      Item("Variants", [
        btn({ label: "Default" }, []),
        btn({ label: "Destructive", class: "bg-red-600 hover:bg-red-700 text-white" }, []),
        btn({ label: "Outline", class: "border border-input bg-transparent hover:bg-accent" }, []),
        btn({ label: "Ghost", class: "hover:bg-accent" }, []),
      ]),
      Item("Sizes", [
        btn({ label: "Sm", class: "h-7 text-xs px-2" }, []),
        btn({ label: "Default", class: "h-8 text-sm" }, []),
        btn({ label: "Lg", class: "h-10 text-base px-4" }, []),
      ]),
      Item("Loading", [
        btn({ label: "Saving...", disabled: true }, []),
        btn({
          label: "Click to load",
          onClick() {
            loading_.as(true);
            setTimeout(() => loading_.as(false), 2000);
          },
        }, [loading_.value ? "Loading..." : "Click me"]),
      ]),
    ]),

    Section("Badge", [
      Item("Variants", [
        badge("Default", "bg-primary text-primary-foreground"),
        badge("Secondary", "bg-secondary text-secondary-foreground"),
        badge("Destructive", "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"),
        badge("Outline", "border border-border"),
      ]),
    ]),

    Section("Card", [
      View({ class: "rounded-xl border border-border bg-card p-6 max-w-md" }, [
        Text({ class: "text-lg font-semibold mb-2" }, ["Card Title"]),
        Text({ class: "text-sm text-muted-foreground mb-4" }, ["Card description text. This card uses the primitive View component with border and padding styling."]),
        btn({ label: "Action" }, []),
      ]),
    ]),
  ]);
}

function btn(opts, children) {
  return View({
    class: "inline-flex items-center justify-center rounded-md font-medium transition-colors cursor-pointer px-3 border border-input bg-white hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800 " + (opts.class || "h-8 text-sm"),
    onClick: opts.onClick,
  }, children.length ? children : [opts.label]);
}

function badge(label, cls) {
  return View({
    class: "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold " + cls,
  }, [label]);
}

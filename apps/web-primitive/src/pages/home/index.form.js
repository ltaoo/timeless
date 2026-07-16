const { View, Text, Fragment, For, Show, computed, ref, refobj, Input, Select, Textarea, NumberInput, Checkbox, Radio, Switch, Icon } = Timeless;
import { Section, Item } from "../../components/index.js";

export default function Page(props) {
  const inputVal_ = ref("");
  const selectVal_ = ref(null);
  const textareaVal_ = ref("");
  const numVal_ = ref(0);
  const checked_ = ref(false);
  const switchOn_ = ref(false);
  const radioVal_ = ref("a");

  const selectOptions = [
    { value: "apple", label: "Apple" },
    { value: "banana", label: "Banana" },
    { value: "cherry", label: "Cherry" },
    { value: "date", label: "Date" },
  ];

  return View({ class: "p-6" }, [
    Text({ class: "text-2xl font-bold mb-6" }, ["Form Components"]),

    Section("Input", [
      Item("Text Input", [
        View({ class: "w-64" }, [
          View({
            class: "flex h-8 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm",
          }, [inputVal_.value || "Type something..."]),
        ]),
      ]),
      Item("Number Input", [
        View({ class: "w-32" }, [
          View({ class: "flex h-8 rounded-md border border-input bg-transparent px-3 py-1 text-sm items-center" }, [
            String(numVal_.value),
          ]),
          View({ class: "flex gap-1 mt-1" }, [
            btn({ label: "+", onClick() { numVal_.as(numVal_.value + 1); } }),
            btn({ label: "-", onClick() { numVal_.as(numVal_.value - 1); } }),
          ]),
        ]),
      ]),
      Item("Textarea", [
        View({ class: "w-64 h-20 rounded-md border border-input bg-transparent p-3 text-sm" }, [
          textareaVal_.value || "Enter text...",
        ]),
      ]),
    ]),

    Section("Select", [
      Item("Dropdown", [
        View({ class: "w-48" }, [
          View({ class: "flex h-8 items-center justify-between rounded-md border border-input bg-transparent px-3 text-sm cursor-pointer" }, [
            Text({}, [selectVal_.value || "Select a fruit"]),
            Icon({ name: "chevron-down", size: 14 }),
          ]),
          View({ class: "mt-1 rounded-md border border-border bg-popover shadow-md p-1" }, [
            ...selectOptions.map((opt) =>
              View({
                class: "px-3 py-1.5 text-sm rounded-sm cursor-pointer hover:bg-accent" + (selectVal_.value === opt.value ? " bg-accent" : ""),
                onClick() { selectVal_.as(opt.value); },
              }, [opt.label]),
            ),
          ]),
        ]),
      ]),
    ]),

    Section("Checkbox & Switch", [
      Item("Checkbox", [
        View({
          class: "inline-flex items-center gap-2 cursor-pointer",
          onClick() { checked_.as(!checked_.value); },
        }, [
          View({ class: "w-4 h-4 rounded border border-input flex items-center justify-center " + (checked_.value ? "bg-primary border-primary" : "") }, [
            checked_.value ? Icon({ name: "check", size: 12, class: "text-primary-foreground" }) : null,
          ]),
          Text({ class: "text-sm" }, ["Accept terms"]),
        ]),
      ]),
      Item("Switch", [
        View({
          class: "inline-flex items-center gap-2 cursor-pointer",
          onClick() { switchOn_.as(!switchOn_.value); },
        }, [
          View({ class: "w-9 h-5 rounded-full relative transition-colors " + (switchOn_.value ? "bg-primary" : "bg-input") }, [
            View({ class: "absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform " + (switchOn_.value ? "translate-x-4" : "translate-x-0.5") }),
          ]),
          Text({ class: "text-sm" }, [switchOn_.value ? "On" : "Off"]),
        ]),
      ]),
    ]),

    Section("Radio", [
      Item("RadioGroup", [
        View({ class: "flex gap-4" }, [
          ...["a", "b", "c"].map((v) =>
            View({
              class: "inline-flex items-center gap-2 cursor-pointer",
              onClick() { radioVal_.as(v); },
            }, [
              View({ class: "w-4 h-4 rounded-full border border-input flex items-center justify-center" }, [
                radioVal_.value === v ? View({ class: "w-2 h-2 rounded-full bg-primary" }) : null,
              ]),
              Text({ class: "text-sm" }, ["Option " + v.toUpperCase()]),
            ]),
          ),
        ]),
      ]),
    ]),
  ]);
}

function btn(opts) {
  return View({
    class: "inline-flex items-center justify-center rounded-md text-sm font-medium h-7 px-3 border border-input bg-white hover:bg-zinc-100 dark:bg-zinc-900 cursor-pointer",
    onClick: opts.onClick,
  }, [opts.label]);
}

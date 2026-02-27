import { Section, Item } from "@/components/index.js";

export function FormView() {
  return View({ class: "space-y-8" }, [
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
    // Section("Switch", [
    //   Item("Default", [
    //     Switch({ store: new Timeless.ui.CheckboxCore({}) }),
    //   ]),
    // ]),
    Section("Slider", [
      Item("Default", [Slider({ value: ref(50), min: 0, max: 100 })]),
    ]),
  ]);
}

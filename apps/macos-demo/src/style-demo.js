import { Button, Input, View, computed, ref } from "@timeless/timeless";
import { render } from "@timeless/timeless-native";
import "./styles.native.css";

export function StylesDemoModel() {
  const count = ref(0);
  const danger = ref(false);
  const disabled = ref(false);
  const compact = ref(false);
  const name = ref("");
  return {
    count,
    disabled,
    name,
    action_class: computed(
      danger,
      (value) => `button ${value ? "danger" : "primary"}`,
    ),
    card_class: computed(compact, (value) => `card${value ? " compact" : ""}`),
    disabled_label: computed(disabled, (value) =>
      value ? "Enable action" : "Disable action",
    ),
    greeting: computed(name, (value) =>
      value ? `Hello, ${value}` : "Your name",
    ),
    increment() {
      count.as(count.value + 1);
    },
    toggle_variant() {
      danger.as(!danger.value);
    },
    toggle_disabled() {
      disabled.as(!disabled.value);
    },
    toggle_spacing() {
      compact.as(!compact.value);
    },
    change_name(value) {
      name.as(value);
    },
  };
}

export function StylesDemoView(model) {
  return View({ class: "page", attributes: { n: "native-style-demo" } }, [
    View({ class: "title", attributes: { n: "demo-title" } }, [
      "Timeless, your style.",
    ]),
    View({ class: "subtitle", attributes: { n: "demo-description" } }, [
      "CSS classes · AppKit views · Yoga layout",
    ]),
    View({ class: model.card_class, attributes: { n: "interactive-card" } }, [
      View({ class: "card-title", attributes: { n: "counter-title" } }, [
        "Custom appearance, native interaction",
      ]),
      View({ class: "counter", attributes: { n: "counter-value" } }, [
        model.count,
      ]),
      Button(
        {
          class: model.action_class,
          disabled: model.disabled,
          attributes: {
            n: "increment-action",
            "aria-label": "Increment counter",
          },
          onClick: () => model.increment(),
        },
        ["Increment counter"],
      ),
      Input({
        class: "field",
        value: model.name,
        placeholder: "Type your name",
        attributes: { n: "name-input", "aria-label": "Your name" },
        onInput: (event) => model.change_name(event.target.value),
      }),
      View({ class: "greeting", attributes: { n: "name-greeting" } }, [
        model.greeting,
      ]),
    ]),
    View({ class: "controls", attributes: { n: "demo-controls" } }, [
      Button(
        {
          class: "button secondary",
          attributes: { n: "variant-toggle" },
          onClick: () => model.toggle_variant(),
        },
        ["Switch color"],
      ),
      Button(
        {
          class: "button secondary",
          attributes: { n: "disabled-toggle" },
          onClick: () => model.toggle_disabled(),
        },
        [model.disabled_label],
      ),
      Button(
        {
          class: "button secondary",
          attributes: { n: "spacing-toggle" },
          onClick: () => model.toggle_spacing(),
        },
        ["Toggle spacing"],
      ),
    ]),
    View({ class: "hint", attributes: { n: "keyboard-hint" } }, [
      "Click an action, then try Tab, Space and Enter. Hover and focus styles come from CSS.",
    ]),
  ]);
}

render(StylesDemoView(StylesDemoModel()));

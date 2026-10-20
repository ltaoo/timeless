import {
  Button,
  Checkbox,
  Input,
  Radio,
  ScrollView,
  Select,
  View,
  computed,
  ref,
} from "@timeless/timeless";
import { render } from "@timeless/timeless-windows";
import "./styles.native.css";

export function WindowsDemoModel() {
  const count = ref(0);
  const danger = ref(false);
  const disabled = ref(false);
  const compact = ref(false);
  const name = ref("");
  const choice = ref(["windows"]);
  const options = ref([
    { label: "Windows", value: "windows" },
    { label: "macOS", value: "macos" },
    { label: "Unavailable", value: "unavailable", disabled: true },
    {
      label: "Other",
      value: "other",
      options: [{ label: "Linux", value: "linux" }],
    },
  ]);
  const checked = ref(true);
  const radio = ref("first");
  const scroll_position = ref("Scroll: 0");
  let scroll_methods;

  return {
    count,
    disabled,
    name,
    choice,
    options,
    checked,
    radio,
    scroll_position,
    first_radio: computed(radio, (value) => value === "first"),
    second_radio: computed(radio, (value) => value === "second"),
    choice_label: computed(
      choice,
      (value) => `Selected: ${value[0] ?? "none"}`,
    ),
    set_choice(value) {
      choice.as([value]);
    },
    set_checked(value) {
      checked.as(value);
    },
    set_radio(value) {
      radio.as(value);
    },
    bind_scroll(methods) {
      scroll_methods = methods;
    },
    scroll_bottom() {
      scroll_methods?.scrollToBottom();
    },
    on_scroll(event) {
      scroll_position.as(`Scroll: ${Math.round(event.scrollTop)}`);
    },
    add_option() {
      options.as([...options.value, { label: "New option", value: "new" }]);
    },
    action_class: computed(
      danger,
      (value) => `button ${value ? "danger" : "primary"}`,
    ),
    card_class: computed(compact, (value) => `card${value ? " compact" : ""}`),
    disabled_label: computed(disabled, (value) =>
      value ? "Enable action" : "Disable action",
    ),
    greeting: computed(name, (value) =>
      value ? `Hello, ${value}` : "Enter your name above",
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

export function WindowsDemoView(model) {
  const list = ScrollView(
    {
      class: "scroll-list",
      horizontal: "auto",
      vertical: "auto",
      attributes: { n: "list-scroll", "aria-label": "Scrollable examples" },
      onScroll: (event) => model.on_scroll(event),
    },
    Array.from({ length: 16 }, (_, index) =>
      Button(
        {
          class: "button secondary scroll-item",
          attributes: { n: `scroll-item-${index}` },
          onClick: () => model.increment(),
        },
        [`Scrollable row ${index + 1}`],
      ),
    ),
  );
  model.bind_scroll(list.methods);
  return ScrollView(
    {
      class: "window-scroll",
      horizontal: "hidden",
      attributes: { n: "window-scroll" },
    },
    [
      View({ class: "page", attributes: { n: "windows-demo" } }, [
        View({ class: "title", attributes: { n: "title" } }, [
          "Timeless for Windows",
        ]),
        View({ class: "subtitle", attributes: { n: "subtitle" } }, [
          "Native Win32 · Direct2D / DirectWrite · CSS classes",
        ]),
        View({ class: model.card_class, attributes: { n: "card" } }, [
          View({ class: "counter", attributes: { n: "counter" } }, [
            model.count,
          ]),
          Button(
            {
              class: model.action_class,
              disabled: model.disabled,
              attributes: { n: "action", "aria-label": "Increment counter" },
              onClick: () => model.increment(),
            },
            ["Increment counter"],
          ),
          Input({
            class: "field",
            value: model.name,
            placeholder: "Your name",
            attributes: { n: "name", "aria-label": "Your name" },
            onInput: (event) => model.change_name(event.target.value),
          }),
          View({ class: "subtitle", attributes: { n: "greeting" } }, [
            model.greeting,
          ]),
        ]),
        View({ class: "controls", attributes: { n: "controls" } }, [
          Button(
            {
              class: "button secondary",
              attributes: { n: "variant" },
              onClick: () => model.toggle_variant(),
            },
            ["Switch color"],
          ),
          Button(
            {
              class: "button secondary",
              attributes: { n: "disabled" },
              onClick: () => model.toggle_disabled(),
            },
            [model.disabled_label],
          ),
          Button(
            {
              class: "button secondary",
              attributes: { n: "spacing" },
              onClick: () => model.toggle_spacing(),
            },
            ["Toggle spacing"],
          ),
        ]),
        View({ class: "card", attributes: { n: "form-controls" } }, [
          Select({
            class: "field",
            attributes: { n: "platform-select", "aria-label": "Platform" },
            value: model.choice,
            options: model.options,
            disabled: model.disabled,
            onChange: (event) => model.set_choice(event.target.value),
          }),
          View({ class: "subtitle", attributes: { n: "choice-label" } }, [
            model.choice_label,
          ]),
          View({ class: "controls", attributes: { n: "check-row" } }, [
            Checkbox({
              class: "check",
              checked: model.checked,
              disabled: model.disabled,
              attributes: {
                n: "feature-check",
                "aria-label": "Enable feature",
              },
              onChange: (event) => model.set_checked(event.target.checked),
            }),
            View({ attributes: { n: "check-label" } }, ["Enable feature"]),
            Radio({
              class: "check",
              name: "demo-choice",
              checked: model.first_radio,
              attributes: { n: "radio-first", "aria-label": "First choice" },
              onChange: () => model.set_radio("first"),
            }),
            Radio({
              class: "check",
              name: "demo-choice",
              checked: model.second_radio,
              attributes: { n: "radio-second", "aria-label": "Second choice" },
              onChange: () => model.set_radio("second"),
            }),
          ]),
          Button(
            {
              class: "button secondary",
              attributes: { n: "add-option" },
              onClick: () => model.add_option(),
            },
            ["Add option"],
          ),
          list,
          View({ class: "subtitle", attributes: { n: "scroll-position" } }, [
            model.scroll_position,
          ]),
          Button(
            {
              class: "button secondary",
              attributes: { n: "scroll-bottom" },
              onClick: () => model.scroll_bottom(),
            },
            ["Scroll to bottom"],
          ),
        ]),
        View({ class: "subtitle", attributes: { n: "keyboard-help" } }, [
          "Tab to focus · Space or Enter to activate · Native text editing and IME",
        ]),
      ]),
    ],
  );
}

render(WindowsDemoView(WindowsDemoModel()));

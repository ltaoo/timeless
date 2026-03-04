import { ref, computed } from "@timeless/reactive";
import { ToggleCore } from "@timeless/ui";

import { tp, merge } from "./theme.js";
import { View, ViewProps } from "./view.js";

export function Toggle(
  props: ViewProps & {
    store: ToggleCore;
    id?: string;
  },
) {
  const { store, class: cls, style: st, id } = props;

  const state = ref(store.state);
  const events: any[] = [];
  if (store.onStateChange)
    events.push(
      store.onStateChange(() => {
        state.as(store.state);
      }),
    );

  // 创建隐藏的 input 用于可访问性
  const hiddenInput = View(
    {
      as: "input",
      type: "checkbox",
      id,
      style:
        "position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border-width: 0;",
      onClick(e) {
        e.stopPropagation();
        store.toggle();
      },
      onMounted(el) {
        el.checked = store.state.checked;
        events.push(
          store.onStateChange(() => {
            el.checked = store.state.checked;
          }),
        );
      },
    },
    [],
  );

  return View(
    {
      ...props,
      type: "button",
      onClick(e) {
        // 如果点击的是隐藏的 input，不要再次 toggle
        if (e.target.tagName === "INPUT") return;
        store.toggle();
      },
      onUnmounted() {
        for (const fn of events) if (typeof fn === "function") fn();
        if (props.onUnmounted) props.onUnmounted();
      },
    },
    [
      hiddenInput,
      View({
        type: "span",
      }),
    ],
  );
}

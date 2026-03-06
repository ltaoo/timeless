import { computed } from "@timeless/reactive";
import { SwitchCore, ToggleCore } from "@timeless/ui";

import { View, ViewProps, ViewChildren } from "./view.js";

export function Root(
  props: ViewProps & {
    store: SwitchCore;
    id?: string;
  },
  children?: ViewChildren,
) {
  const { store, id, ...rest } = props;

  return View(
    {
      ...rest,
      type: "button",
      role: "switch",
      "aria-checked": computed(() => store.state.checked),
      onClick(e) {
        if (e.target.tagName === "INPUT") return;
        store.toggle();
      },
    },
    [
      View(
        {
          as: "input",
          type: "checkbox",
          id,
          style:
            "position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border-width: 0;",
          onClick(e) {
            e.stopPropagation();
          },
          onMounted(el) {
            el.checked = store.state.checked;
            store.onStateChange(() => {
              el.checked = store.state.checked;
            });
          },
        },
        [],
      ),
      ...(children || []),
    ],
  );
}

export function Thumb(
  props: ViewProps & { store: SwitchCore },
  children?: ViewChildren,
) {
  const { store, ...rest } = props;
  return View(rest, children);
}

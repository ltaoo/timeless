import { ui } from "@timeless/core";

export function connect(store: ui.InputCore<any>, actions: { focus: () => void; blur: () => void }) {
  store.onFocus(() => {
    actions.focus();
  });
  store.onBlur(() => {
    actions.blur();
  });
}

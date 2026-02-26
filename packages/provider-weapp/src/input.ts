import { ui } from "@timeless/domains";

export function connect(store: ui.InputCore<any>, actions: { focus: () => void; blur: () => void }) {
  store.onFocus(() => {
    actions.focus();
  });
  store.onBlur(() => {
    actions.blur();
  });
}

import { InputCore } from "@timeless/inner-vm";

export function connect(
  store: InputCore<any>,
  actions: { focus: () => void; blur: () => void },
) {
  store.onFocus(() => {
    actions.focus();
  });
  store.onBlur(() => {
    actions.blur();
  });
}

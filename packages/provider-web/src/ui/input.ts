import { ui } from "@timeless/core";

export function connect(store: ui.InputCore<string>, $input: HTMLInputElement) {
  store.focus = () => {
    $input.focus();
  };
}

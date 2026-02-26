import { ui } from "@timeless/domains";

export function connect(store: ui.InputCore<string>, $input: HTMLInputElement) {
  store.focus = () => {
    $input.focus();
  };
}

import { InputCore } from "@timeless/inner-vm";

export function connect(store: InputCore<string>, $input: HTMLInputElement) {
  store.focus = () => {
    $input.focus();
  };
  store.blur = () => {
    $input.blur();
  };
}

import { InputCore } from "@timeless/ui";

export function connect(store: InputCore<string>, $input: HTMLInputElement) {
  store.focus = () => {
    $input.focus();
  };
  store.blur = () => {
    $input.blur();
  };
}

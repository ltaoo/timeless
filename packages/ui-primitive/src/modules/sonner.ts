import { ViewChildren, View } from "../core";

import { SonnerCore } from "@timeless/inner-vm";

export function Toast(props: { store: SonnerCore }, children?: ViewChildren) {
  return View({}, children);
}

export function Content(props: { store: SonnerCore }, children?: ViewChildren) {
  return View({}, children);
}

export function Close(props: { store: SonnerCore }, children?: ViewChildren) {
  return View({
    onClick() {
      // props.store.methods.deleteToast()
    }
  }, children);
}

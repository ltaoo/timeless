import {
  View,
  ViewProps,
  ViewChildren,
  TimelessElement,
} from "@timeless/timeless";
import { ImageCore } from "@timeless/ui-vm";

type Provider = Partial<{
  provide_ui_image: (store: ImageCore, $img: HTMLDivElement) => void;
}>;

let global_provider: Provider | undefined;

export function setImageProvider(provider?: Provider) {
  global_provider = provider;
}

export function Root(
  props: ViewProps,
  children?: ViewChildren,
): TimelessElement {
  return View(props, children);
}

export function Image(
  props: ViewProps & { store: ImageCore },
  children?: ViewChildren,
): TimelessElement {
  const { store, ...rest } = props;
  return View(
    {
      ...rest,
      onMounted(event) {
        const $elm = event.target;
        const $img = $elm;
        const provide = global_provider?.provide_ui_image;
        if (typeof provide === "function") {
          provide(store, $img.get$elm());
        }
        if (props.onMounted) {
          return props.onMounted(event);
        }
      },
    },
    children,
  );
}

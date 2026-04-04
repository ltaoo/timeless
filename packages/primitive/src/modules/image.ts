import { ImageCore } from "@timeless/ui";

import { View, ViewChildren, ViewProps, TimelessElement } from "@/content/view";

type Provider = Partial<{
  provide_ui_image: (store: ImageCore, $img: HTMLDivElement) => void;
}>;

let global_provider: Provider | undefined;

export function setImageProvider(provider?: Provider) {
  global_provider = provider;
}

export function Root(props: ViewProps, children?: ViewChildren): TimelessElement {
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
        const $elm = (event as any).target;
        const $img = $elm as HTMLDivElement;
        const provide = global_provider?.provide_ui_image;
        if (typeof provide === "function") provide(store, $img);
        if (props.onMounted) props.onMounted(event);
      },
    },
    children,
  );
}

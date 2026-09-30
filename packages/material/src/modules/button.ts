import { ui, vm } from "@timeless/timeless";
import {
  View,
  ViewProps,
  ViewChildren,
  refobj,
  computed,
  ListenerManager,
  classNames,
} from "@timeless/timeless";

/**
 * 把 headless 层的变体名映射到 Material 3 的按钮形态。
 * M3 的五种形态：filled / tonal / outlined / elevated / text。
 * 同时接受 shadcn / bootstrap 风格别名（default/primary/secondary/outline/ghost）
 * 映射到最接近的 M3 形态，方便跨库迁移。
 */
const VARIANT_CLASSES: Record<string, string> = {
  filled: "m3-btn--filled",
  primary: "m3-btn--filled",
  default: "m3-btn--filled",
  tonal: "m3-btn--tonal",
  secondary: "m3-btn--tonal",
  outlined: "m3-btn--outlined",
  outline: "m3-btn--outlined",
  elevated: "m3-btn--elevated",
  text: "m3-btn--text",
  ghost: "m3-btn--text",
  link: "m3-btn--text",
  destructive: "m3-btn--filled m3-btn--destructive",
  danger: "m3-btn--filled m3-btn--destructive",
  error: "m3-btn--filled m3-btn--destructive",
};

const SIZE_CLASSES: Record<string, string> = {
  default: "",
  md: "",
  sm: "m3-btn--sm",
  xs: "m3-btn--sm",
  lg: "m3-btn--lg",
  icon: "m3-btn--icon",
};

export function Button(
  props: ViewProps & {
    store: vm.ButtonCore;
    prefix?: ViewChildren;
  },
  children: ViewChildren = [],
) {
  const { store, class: cls, prefix, ...rest } = props;

  const state_ = refobj(store.state);
  const listener$ = ListenerManager([state_]);
  listener$.add(store.onStateChange(() => state_.as(store.state)));

  // classNames(...) 的返回值本身就是 ClassNameRef，直接作为 class 交给 primitive；
  // 动态部分作为数组项传 computed。切勿把 classNames 再包一层 computed。
  const classname_ = classNames([
    "m3-btn",
    computed(
      state_,
      (s) => VARIANT_CLASSES[(s.variant as string) || "filled"] || VARIANT_CLASSES.filled,
    ),
    computed(state_, (s) => SIZE_CLASSES[(s.size as string) || "md"] ?? ""),
    computed(state_, (s) => (s.loading ? "is-loading" : "")),
    computed(state_, (s) => (s.disabled ? "is-disabled" : "")),
    cls,
  ]);

  return ui.ButtonPrimitive.Root(
    {
      ...rest,
      store,
      class: classname_,
      dataset: {
        slot: "button",
        variant: store.state.variant,
        size: store.state.size,
      },
      onUnmounted() {
        listener$.destroy();
        if (rest.onUnmounted) {
          rest.onUnmounted();
        }
      },
    },
    [
      ui.ButtonPrimitive.Loading({ store }, [
        View({ class: "m3-btn__spinner", as: "span" }, []),
      ]),
      ui.ButtonPrimitive.Prefix({}, prefix || []),
      ui.ButtonPrimitive.Content({}, children),
    ],
  );
}

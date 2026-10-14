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
 * 把 headless 层的变体名映射到 Lucky 外观类名（.lucky-btn--*）。
 * 同时接受 Lucky 原生外观名（primary / outline / subtle / transparent）
 * 与 shadcn 风格别名（default / destructive / ghost / outline），方便跨库迁移。
 */
const VARIANT_CLASSES: Record<string, string> = {
  default: "lucky-btn--primary",
  secondary: "lucky-btn--secondary",
  primary: "lucky-btn--primary",
  outline: "lucky-btn--outline",
  subtle: "lucky-btn--subtle",
  transparent: "lucky-btn--transparent",
  ghost: "lucky-btn--subtle",
  danger: "lucky-btn--danger",
  destructive: "lucky-btn--danger",
  warn: "lucky-btn--danger",
  error: "lucky-btn--danger",
  warning: "lucky-btn--warning",
  success: "lucky-btn--success",
  info: "lucky-btn--info",
  link: "lucky-btn--transparent",
};

const SIZE_CLASSES: Record<string, string> = {
  default: "",
  md: "",
  sm: "lucky-btn--sm",
  xs: "lucky-btn--sm",
  lg: "lucky-btn--lg",
  icon: "lucky-btn--icon",
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

  // 注意：class 必须是 string / ClassNameRef（classNames 返回值）/ Ref<string>。
  // 不要把 classNames(...) 再包一层 computed —— 那样 class 会变成
  // “值为 ClassNameRef 的 Ref”，primitive 的 subscribe_props 会走 Ref 分支做
  // value.split(" ")，从而抛错。这里直接用 classNames + 内部 computed 项。
  const classname_ = classNames([
    "lucky-btn",
    computed(
      state_,
      (s) =>
        VARIANT_CLASSES[(s.variant as string) || "default"] ||
        VARIANT_CLASSES.default,
    ),
    computed(
      state_,
      (s) => SIZE_CLASSES[(s.size as string) || "default"] ?? "",
    ),
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
        View({ class: "tt-content-inline lucky-btn__spinner" }, []),
      ]),
      ui.ButtonPrimitive.Prefix({}, prefix || []),
      ui.ButtonPrimitive.Content({}, children),
    ],
  );
}

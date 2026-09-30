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
 * 把 headless 层的变体名映射到 Bootstrap 类名。
 * 同时接受 Bootstrap 原生名（primary/danger/outline-primary）
 * 与 shadcn 风格别名（default/destructive/ghost/outline），方便跨库迁移。
 */
const VARIANT_CLASSES: Record<string, string> = {
  default: "btn-primary",
  primary: "btn-primary",
  secondary: "btn-secondary",
  success: "btn-success",
  danger: "btn-danger",
  destructive: "btn-danger",
  warn: "btn-danger",
  error: "btn-danger",
  warning: "btn-warning",
  info: "btn-info",
  light: "btn-light",
  dark: "btn-dark",
  link: "btn-link",
  ghost: "btn-link",
  outline: "btn-outline-primary",
  "outline-primary": "btn-outline-primary",
  "outline-secondary": "btn-outline-secondary",
  "outline-success": "btn-outline-success",
  "outline-danger": "btn-outline-danger",
};

const SIZE_CLASSES: Record<string, string> = {
  default: "",
  md: "",
  sm: "btn-sm",
  xs: "btn-sm",
  lg: "btn-lg",
  icon: "btn-icon",
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
    "btn",
    computed(
      state_,
      (s) => VARIANT_CLASSES[(s.variant as string) || "primary"] || VARIANT_CLASSES.primary,
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
        View({ class: "btn__spinner", as: "span" }, []),
      ]),
      ui.ButtonPrimitive.Prefix({}, prefix || []),
      ui.ButtonPrimitive.Content({}, children),
    ],
  );
}

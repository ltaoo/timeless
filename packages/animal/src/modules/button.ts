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
 * 把 headless 层的变体名映射到 Animal Island 外观类名（.animal-btn--*）。
 *
 * 上游的 ButtonType 是 `primary | default | dashed | text | link`（另有 danger /
 * ghost / block 三个布尔修饰）。这里同时接受 shadcn 风格别名，方便跨库迁移：
 * destructive / error → danger，outline → dashed，
 * secondary → default（上游没有「次级」概念，default 就是它的中性形态）。
 */
const VARIANT_CLASSES: Record<string, string> = {
  default: "animal-btn--default",
  secondary: "animal-btn--default",
  primary: "animal-btn--primary",
  dashed: "animal-btn--dashed",
  outline: "animal-btn--dashed",
  text: "animal-btn--text",
  link: "animal-btn--link",
  ghost: "animal-btn--ghost",
  danger: "animal-btn--danger",
  destructive: "animal-btn--danger",
  warn: "animal-btn--danger",
  error: "animal-btn--danger",
  success: "animal-btn--success",
  warning: "animal-btn--warning",
  info: "animal-btn--info",
};

const SIZE_CLASSES: Record<string, string> = {
  default: "",
  middle: "",
  md: "",
  small: "animal-btn--sm",
  sm: "animal-btn--sm",
  xs: "animal-btn--sm",
  large: "animal-btn--lg",
  lg: "animal-btn--lg",
  icon: "animal-btn--icon",
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
    "animal-btn",
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
        View({ class: "animal-btn__spinner", as: "span" }, []),
      ]),
      ui.ButtonPrimitive.Prefix({}, prefix || []),
      ui.ButtonPrimitive.Content({}, children),
    ],
  );
}

import { ui, vm } from "@timeless/timeless";
import {
  View,
  ViewChildren,
  ViewProps,
  refobj,
  computed,
  ListenerManager,
} from "@timeless/timeless";

const VARIANT_STYLES = {
  primary: { background: "var(--weui-BRAND)", color: "#fff" },
  default: { background: "var(--weui-FG-5)", color: "var(--weui-FG-0)" },
  warn: { background: "var(--weui-RED)", color: "#fff" },
  text: { background: "transparent", color: "var(--weui-BRAND)" },
};

const SIZE_STYLES = {
  lg: {
    height: "var(--weui-BTN-HEIGHT)",
    padding: "0 24px",
    width: "100%",
  },
  md: {
    height: "var(--weui-BTN-HEIGHT-MEDIUM)",
    padding: "0 20px",
  },
  sm: {
    height: "var(--weui-BTN-HEIGHT-SMALL)",
    padding: "0 12px",
    "font-size": "var(--weui-FONT-SIZE-SM)",
  },
};

const BASE_STYLE = {
  position: "relative",
  display: "flex",
  "align-items": "center",
  "justify-content": "center",
  "white-space": "nowrap",
  border: "none",
  outline: "none",
  cursor: "pointer",
  "border-radius": "var(--weui-BTN-RADIUS)",
  "font-size": "var(--weui-FONT-SIZE)",
  transition: "opacity .3s",
  "-webkit-tap-highlight-color": "transparent",
};

export function Button(
  props: ViewProps & {
    store: vm.ButtonCore;
  },
  children: ViewChildren = [],
) {
  const { store, ...rest } = props;

  const state_ = refobj(store.state);
  const listener$ = ListenerManager([state_]);
  listener$.add(store.onStateChange(() => state_.as(store.state)));

  const style_ = computed(state_, (s) => {
    const variant = (s.variant as string) || "primary";
    const size = (s.size as string) || "md";
    const result: Record<string, string> = { ...BASE_STYLE };
    const variantStyle =
      VARIANT_STYLES[variant as keyof typeof VARIANT_STYLES] ||
      VARIANT_STYLES.primary;
    const sizeStyle =
      SIZE_STYLES[size as keyof typeof SIZE_STYLES] || SIZE_STYLES.md;
    Object.assign(result, variantStyle, sizeStyle);
    if (s.loading) {
      result.opacity = "0.7";
      result["pointer-events"] = "none";
    }
    if (s.disabled) {
      result.opacity = "0.3";
      result["pointer-events"] = "none";
    }
    return result;
  });

  return ui.ButtonPrimitive.Root(
    {
      ...rest,
      store,
      style: style_,
      onUnmounted() {
        listener$.destroy();
        if (rest.onUnmounted) {
          rest.onUnmounted();
        }
      },
    },
    [
      ui.ButtonPrimitive.Loading({ store }, [
        View(
          {
            style: {
              width: "16px",
              height: "16px",
              "margin-right": "8px",
              border: "2px solid currentColor",
              "border-top-color": "transparent",
              "border-radius": "50%",
              animation: "weui-spin 1s linear infinite",
            },
          },
          [],
        ),
      ]),
      ui.ButtonPrimitive.Content({}, children),
    ],
  );
}

import { ViewProps, computed, refobj } from "@timeless/timeless";
import { SwitchPrimitive } from "@timeless/ui-primitive";
import { SwitchCore } from "@timeless/inner-vm";

export function Switch(props: ViewProps & { store: SwitchCore; id?: string }) {
  const { store, id, ...rest } = props;
  const state_ = refobj(store.state);

  store.onStateChange((v) => {
    state_.as(v);
  });

  return SwitchPrimitive.Root(
    {
      ...rest,
      store,
      id,
      style: computed(state_, (s) => {
        const result: Record<string, string> = {
          position: "relative",
          width: "52px",
          height: "32px",
          "border-radius": "16px",
          border: "none",
          padding: "2px",
          cursor: "pointer",
          transition: "background .3s",
          outline: "none",
          "flex-shrink": "0",
        };
        result.background = s.checked
          ? "var(--weui-BRAND)"
          : "var(--weui-BG-0)";
        if (s.disabled) {
          result.opacity = "0.3";
          result.cursor = "not-allowed";
        }
        return result;
      }),
    },
    [
      SwitchPrimitive.Thumb({
        store,
        style: computed(state_, (s) => {
          const result: Record<string, string> = {
            display: "block",
            width: "28px",
            height: "28px",
            "border-radius": "50%",
            background: "#fff",
            "box-shadow": "0 1px 3px rgba(0,0,0,.4)",
            transition: "transform .3s",
          };
          result.transform = s.checked
            ? "translateX(20px)"
            : "translateX(0)";
          return result;
        }),
      }),
    ],
  );
}

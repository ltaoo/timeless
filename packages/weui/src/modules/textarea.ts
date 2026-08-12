import { ui, vm } from "@timeless/timeless";
import { computed, refobj } from "@timeless/timeless";
import { ViewProps } from "@timeless/timeless";

export function Textarea(
  props: ViewProps & {
    store: vm.InputCore<any>;
    id?: string;
  },
) {
  const { store, id, ...rest } = props;
  const state_ = refobj(store.state);

  store.onStateChange((v) => {
    state_.as(v);
  });

  return ui.TextareaPrimitive.Root(
    { store, style: { position: "relative", width: "100%" } },
    [
      ui.TextareaPrimitive.Textarea({
        ...rest,
        store,
        id,
        style: computed(state_, (s) => {
          const result: Record<string, string> = {
            flex: "1",
            width: "100%",
            "min-height": "80px",
            padding: "0",
            border: "none",
            outline: "none",
            background: "transparent",
            color: "var(--weui-FG-0)",
            "font-size": "var(--weui-FONT-SIZE)",
            "box-sizing": "border-box",
            resize: "vertical",
          };
          if (s.disabled) {
            result.opacity = "0.3";
            result["pointer-events"] = "none";
          }
          return result;
        }),
      }),
    ],
  );
}

import { computed, refobj } from "@timeless/timeless";
import { ViewProps } from "@timeless/timeless";
import { TextareaPrimitive } from "@timeless/ui-primitive";
import { InputCore } from "@timeless/inner-vm";

export function Textarea(
  props: ViewProps & {
    store: InputCore<any>;
    id?: string;
  },
) {
  const { store, id, ...rest } = props;
  const state_ = refobj(store.state);

  store.onStateChange((v) => {
    state_.as(v);
  });

  return TextareaPrimitive.Root(
    { store, style: { position: "relative", width: "100%" } },
    [
      TextareaPrimitive.Textarea({
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

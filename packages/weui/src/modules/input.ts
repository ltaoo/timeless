import { ui, vm } from "@timeless/timeless";
import { computed, refobj, Icon, Show } from "@timeless/timeless";
import { ViewProps } from "@timeless/timeless";

export function Input(
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

  const allowClear = computed(state_, (d) => d.allowClear);
  const hasValue = computed(state_, (d) => d.value && d.value.length > 0);

  return ui.InputPrimitive.Root(
    {
      store,
      style: { position: "relative", flex: "1", width: "100%" },
    },
    [
      ui.InputPrimitive.Input({
        ...rest,
        id,
        store,
        style: computed(state_, (s) => {
          const result: Record<string, string> = {
            flex: "1",
            width: "100%",
            height: "100%",
            padding: "0",
            border: "none",
            outline: "none",
            background: "transparent",
            color: "var(--weui-FG-0)",
            "font-size": "var(--weui-FONT-SIZE)",
            "box-sizing": "border-box",
          };
          if (s.disabled) {
            result.opacity = "0.3";
            result["pointer-events"] = "none";
          }
          return result;
        }),
      }),
      Show({
        when: computed(allowClear, (ac) => ac),
        ok() {
          return [
            Show({
              when: hasValue,
              ok() {
                return [
                  ui.InputPrimitive.Clear(
                    {
                      store,
                      style: {
                        position: "absolute",
                        top: "50%",
                        right: "0",
                        transform: "translateY(-50%)",
                        cursor: "pointer",
                        color: "var(--weui-FG-2)",
                        "font-size": "16px",
                      },
                    },
                    [Icon({ name: "circle-x", size: 16 })],
                  ),
                ];
              },
            }),
          ];
        },
      }),
    ],
  );
}

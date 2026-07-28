import { View, ViewProps, Icon } from "@timeless/timeless";
import { ref, computed, ListenerManager } from "@timeless/timeless";
import { CheckboxPrimitive } from "@timeless/ui-primitive";
import { CheckboxCore } from "@timeless/inner-vm";

export function Checkbox(
  props: ViewProps & { store: CheckboxCore; id?: string },
) {
  const { store, id, ...rest } = props;
  const state_ = ref(store.state);
  const listener$ = ListenerManager();

  return CheckboxPrimitive.Root(
    {
      store,
    },
    [
      CheckboxPrimitive.Input({ store, id }),
      CheckboxPrimitive.Box(
        {
          ...rest,
          store,
          style: computed(state_, (s) => {
            const result: Record<string, string> = {
              width: "20px",
              height: "20px",
              "border-radius": "50%",
              display: "flex",
              "align-items": "center",
              "justify-content": "center",
              "flex-shrink": "0",
              transition: "all .2s",
              cursor: "pointer",
            };
            if (s.checked) {
              result.background = "var(--weui-BRAND)";
              result.border = "1px solid var(--weui-BRAND)";
            } else {
              result.background = "transparent";
              result.border = "1px solid var(--weui-FG-2)";
            }
            if (s.disabled) {
              result.opacity = "0.3";
              result.cursor = "not-allowed";
            }
            return result;
          }),
          onMounted() {
            listener$.add(
              store.onStateChange(() => {
                state_.as(store.state);
              }),
            );
          },
          onUnmounted() {
            listener$.destroy();
          },
        },
        [
          Show({
            when: computed(state_, (t) => {
              return t.checked;
            }),
            ok() {
              return View(
                {
                  style: {
                    color: "#fff",
                    "font-size": "12px",
                    "line-height": "1",
                  },
                },
                [Icon({ name: "check", size: 12 })],
              );
            },
          }),
        ],
      ),
    ],
  );
}

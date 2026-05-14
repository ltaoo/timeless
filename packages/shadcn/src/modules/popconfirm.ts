import { computed, ref, refobj, ViewStyleProperties } from "@timeless/timeless";
import { View, Show, ViewChildren, ViewProps } from "@timeless/timeless";
import { PopconfirmPrimitive } from "@timeless/ui-primitive";
import { PopconfirmCore } from "@timeless/ui-vm";

export function Popconfirm(
  props: ViewProps & {
    store: PopconfirmCore;
    title?: ViewChildren;
    description?: ViewChildren;
    confirmText?: string;
    cancelText?: string;
  },
  children?: ViewChildren,
) {
  const state_ = refobj(props.store.state);
  const popper_state_ = refobj(props.store.popper.state);

  const unlistens = [
    props.store.onStateChange((v) => {
      state_.as(v);
    }),
    props.store.popper.onStateChange((v) => {
      popper_state_.as(v);
    }),
  ];

  const confirmText = props.confirmText || "确定";
  const cancelText = props.cancelText || "取消";

  return PopconfirmPrimitive.Root(
    {
      onUnmounted() {
        unlistens.forEach((fn) => fn());
      },
    },
    [
      PopconfirmPrimitive.Trigger({ store: props.store }, children),
      PopconfirmPrimitive.Portal({ store: props.store }, [
        PopconfirmPrimitive.Content(
          {
            ...props,
            class: computed(state_, (t) => {
              return [
                "popconfirm-content",
                "relative z-50 w-72 rounded-md border border-zinc-200 bg-white p-4 text-sm text-zinc-500 shadow-md outline-none",
                "dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400",
                t.enter ? "animate-in fade-in-0 zoom-in-95" : "",
                t.exit ? "animate-out fade-out-0 zoom-out-95" : "",
              ].join(" ");
            }),
          },
          [
            View({
              onMounted(event) {
                props.store.popper.setArrowElement((event as any).target);
              },
              class: computed(popper_state_, (t) => {
                const side = t.placement?.split("-")[0] as string;
                const base =
                  "absolute w-3 h-3 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800";
                let borderClass = "";
                if (side === "bottom") borderClass = "border-t border-l";
                if (side === "top") borderClass = "border-b border-r";
                if (side === "right") borderClass = "border-b border-l";
                if (side === "left") borderClass = "border-t border-r";
                return [base, borderClass].join(" ");
              }),
              style: computed(popper_state_, (s) => {
                const [side, align = "center"] = (s.placement || "bottom").split("-");
                const styles: ViewStyleProperties = {};
                if (side === "bottom") styles.top = "-6px";
                if (side === "top") styles.bottom = "-6px";
                if (side === "right") styles.left = "-6px";
                if (side === "left") styles.right = "-6px";
                let transform = "rotate(45deg)";
                if (s.arrow && s.arrow.x != null) {
                  styles.left = `${s.arrow.x}px`;
                } else if (s.arrow && s.arrow.y != null) {
                  styles.top = `${s.arrow.y}px`;
                } else if (align === "center" || (align as any) === "middle") {
                  if (side === "bottom" || side === "top") {
                    styles.left = "50%";
                    transform = "translateX(-50%) rotate(45deg)";
                  } else {
                    styles.top = "50%";
                    transform = "translateY(-50%) rotate(45deg)";
                  }
                } else if (align === "start") {
                  if (side === "bottom" || side === "top") styles.left = "16px";
                  else styles.top = "16px";
                } else if (align === "end") {
                  if (side === "bottom" || side === "top")
                    styles.right = "16px";
                  else styles.bottom = "16px";
                }
                styles.transform = transform;
                return styles;
              }),
            }),
            Show({
              when: ref(!!props.title),
              ok() {
                return [
                  View(
                    {
                      class:
                        "mb-1 text-sm font-medium text-zinc-950 dark:text-zinc-50",
                    },
                    props.title,
                  ),
                ];
              },
            }),
            Show({
              when: ref(!!props.description),
              ok() {
                return [
                  View(
                    {
                      class: "mb-4 text-sm text-zinc-500 dark:text-zinc-400",
                    },
                    props.description,
                  ),
                ];
              },
            }),
            View(
              {
                class: "flex justify-end gap-2",
              },
              [
                PopconfirmPrimitive.Cancel(
                  {
                    store: props.store,
                    class:
                      "inline-flex items-center justify-center rounded-md text-sm font-medium h-8 px-3 border border-zinc-200 bg-white hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-800 dark:hover:text-zinc-50",
                  },
                  [cancelText],
                ),
                PopconfirmPrimitive.Confirm(
                  {
                    store: props.store,
                    class: computed(state_, (s) => {
                      return [
                        "inline-flex items-center justify-center rounded-md text-sm font-medium h-8 px-3 bg-zinc-900 text-zinc-50 hover:bg-zinc-900/90 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-50/90",
                        s.loading ? "opacity-50 pointer-events-none" : "",
                      ].join(" ");
                    }),
                  },
                  [confirmText],
                ),
              ],
            ),
          ],
        ),
      ]),
    ],
  );
}

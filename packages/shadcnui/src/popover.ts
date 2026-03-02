import { PopoverCore } from "@timeless/ui";
import { computed, ref, refobj } from "@timeless/reactive";
import { View, Show, ViewChildren, ViewProps } from "@timeless/headless";
import { PopoverPrimitive } from "@timeless/headless";

const t = {
  wrapper: { style: "position:fixed;z-index:999;left:0;top:0;" },
  content: ({ enter, exit }) => ({
    class: [
      "relative z-50 w-72 rounded-md border border-zinc-200 bg-white p-4 text-sm text-zinc-500 shadow-md outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400",
      enter ? "animate-in fade-in-0 zoom-in-95" : "",
      exit ? "animate-out fade-out-0 zoom-out-95" : "",
    ]
      .filter(Boolean)
      .join(" "),
  }),
  title: { class: "mb-2 text-sm font-medium text-zinc-950 dark:text-zinc-50" },
};

export function Popover(
  props: ViewProps & {
    store: PopoverCore;
    title?: ViewChildren;
    content?: ViewChildren;
  },
  children?: ViewChildren,
) {
  const state = refobj(props.store.state);
  const unlisten = props.store.onStateChange((v) => {
    state.as(v);
  });

  const popperState = refobj(props.store.popper.state);
  const unlistenPopper = props.store.popper.onStateChange((v) => {
    popperState.as(v);
  });

  return PopoverPrimitive.Root(
    {
      class: "popover-root",
      onUnmounted() {
        unlisten();
        unlistenPopper();
      },
    },
    [
      PopoverPrimitive.Trigger({ store: props.store }, children),
      PopoverPrimitive.Portal({ store: props.store }, [
        PopoverPrimitive.Content(
          {
            ...props,
            class: computed(state, (s) => {
              return ["popover-content", t.content(s).class].join(" ");
            }),
          },
          [
            View({
              onMounted($el) {
                props.store.popper.setArrowElement($el);
              },
              class: computed(popperState, (s) => {
                const side = s.placedSide;
                const base =
                  "absolute w-3 h-3 rotate-45 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800";
                // side is where the popover is placed.
                // if side is 'bottom', arrow is at top, so we need border-t border-l
                let borderClass = "";
                if (side === "bottom") borderClass = "border-t border-l";
                if (side === "top") borderClass = "border-b border-r";
                if (side === "right") borderClass = "border-b border-l";
                if (side === "left") borderClass = "border-t border-r";
                return [base, borderClass].join(" ");
              }),
              style: computed(popperState, (s) => {
                const side = s.placedSide;
                const align = s.placedAlign;
                const styles: any = {};
                // Position based on side
                if (side === "bottom") styles.top = "-6px";
                if (side === "top") styles.bottom = "-6px";
                if (side === "right") styles.left = "-6px";
                if (side === "left") styles.right = "-6px";

                // Alignment
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

                return Object.keys(styles)
                  .map((k) => `${k}:${styles[k]}`)
                  .join(";");
              }),
            }),
            Show(
              {
                when: ref(!!props.title),
              },
              [
                View(
                  {
                    class: t.title.class,
                  },
                  props.title,
                ),
              ],
            ),
            ...props.content,
          ],
        ),
      ]),
    ],
  );
}

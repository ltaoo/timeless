import { ui, vm } from "@timeless/timeless";
import { computed, ref, refobj } from "@timeless/timeless";
import {
  Show,
  View,
  ViewChildren,
  ViewProps,
} from "@timeless/timeless";

import { makeArrowStyle } from "./popper-shared";

/**
 * Popover · Bootstrap 5.3
 *
 * 类名沿用上游：.popover / .popover-arrow / .popover-header / .popover-body。
 * Trigger 由 headless 层处理（pointerdown 切换 open），浮层通过 Portal 挂到 body。
 */
export function Popover(
  props: ViewProps & {
    store: vm.PopoverCore;
    title?: ViewChildren;
    content?: ViewChildren;
  },
  children?: ViewChildren,
) {
  const { store, title, content, class: cls, ...rest } = props;

  const presence_state_ = refobj(store.presence.state);
  const popper_state_ = refobj(store.popper.state);
  const was_exiting_ = ref(false);

  const unlistens = [
    store.presence.onStateChange((v) => {
      presence_state_.as(v);
      if (v.exit) {
        was_exiting_.as(true);
      }
      if (v.mounted) {
        was_exiting_.as(false);
      }
    }),
    store.popper.onStateChange((v) => {
      popper_state_.as(v);
    }),
  ];

  const arrow = makeArrowStyle(popper_state_, "popover-arrow");

  return ui.PopoverPrimitive.Root(
    {
      onUnmounted() {
        unlistens.forEach((fn) => fn());
      },
    },
    [
      ui.PopoverPrimitive.Trigger({ store }, children),
      ui.PopoverPrimitive.Portal({ store }, [
        ui.PopoverPrimitive.Content(
          {
            ...rest,
            store,
            class: computed(presence_state_, (t) => {
              const keepExitClass =
                !t.mounted && was_exiting_.value ? "is-exit" : "";
              return [
                "popover",
                t.enter ? "is-enter" : "",
                t.exit ? "is-exit" : "",
                keepExitClass,
                cls,
              ]
                .filter(Boolean)
                .join(" ");
            }),
          },
          [
            View(
              {
                class: arrow.class,
                style: arrow.style,
                onMounted(event) {
                  store.popper.setArrowElement((event as any).target);
                },
              },
              [],
            ),
            Show({
              when: !!title,
              ok() {
                return [View({ class: "popover-header" }, title)];
              },
            }),
            View({ class: "popover-body" }, content),
          ],
        ),
      ]),
    ],
  );
}

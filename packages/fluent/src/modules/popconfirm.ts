import { ui, vm } from "@timeless/timeless";
import { computed, refobj } from "@timeless/timeless";
import {
  Show,
  View,
  ViewChildren,
  ViewProps,
  classNames,
} from "@timeless/timeless";

import { makeArrowStyle } from "./popper-shared";

/**
 * Popconfirm · Fluent 2
 *
 * 用 .fl-popconfirm 作为命名空间：
 *   .fl-popconfirm__arrow / __header / __body / __actions。
 * 视觉沿用 popover 的 1px --stroke2 + --shadow-16。
 */
export function Popconfirm(
  props: ViewProps & {
    store: vm.PopconfirmCore;
    title?: ViewChildren;
    description?: ViewChildren;
    confirmText?: string;
    cancelText?: string;
  },
  children?: ViewChildren,
) {
  const {
    store,
    title,
    description,
    confirmText = "确定",
    cancelText = "取消",
    class: cls,
    ...rest
  } = props;

  const state_ = refobj(store.state);
  const popper_state_ = refobj(store.popper.state);

  const unlistens = [
    store.onStateChange((v) => {
      state_.as(v);
    }),
    store.popper.onStateChange((v) => {
      popper_state_.as(v);
    }),
  ];

  const arrow = makeArrowStyle(popper_state_, "fl-popconfirm__arrow");

  return ui.PopconfirmPrimitive.Root(
    {
      onUnmounted() {
        unlistens.forEach((fn) => fn());
      },
    },
    [
      ui.PopconfirmPrimitive.Trigger({ store }, children),
      ui.PopconfirmPrimitive.Portal({ store }, [
        ui.PopconfirmPrimitive.Content(
          {
            ...rest,
            store,
            class: computed(state_, (t) => {
              return [
                "fl-popconfirm",
                t.enter ? "is-enter" : "",
                t.exit ? "is-exit" : "",
                cls,
              ]
                .filter(Boolean)
                .join(" ");
            }),
          },
          [
            View(
              {
                onMounted(event) {
                  store.popper.setArrowElement((event as any).target);
                },
                class: arrow.class,
                style: arrow.style,
              },
              [],
            ),
            Show({
              when: !!title,
              ok() {
                return [View({ class: "fl-popconfirm__header" }, title)];
              },
            }),
            Show({
              when: !!description,
              ok() {
                return [View({ class: "fl-popconfirm__body" }, description)];
              },
            }),
            View({ class: "fl-popconfirm__actions" }, [
              ui.PopconfirmPrimitive.Cancel(
                {
                  store,
                  class: "fl-btn fl-btn--subtle fl-btn--sm",
                },
                [cancelText],
              ),
              ui.PopconfirmPrimitive.Confirm(
                {
                  store,
                  class: classNames([
                    "fl-btn",
                    "fl-btn--primary",
                    "fl-btn--sm",
                    computed(state_, (s) => (s.loading ? "is-loading" : "")),
                  ]),
                },
                [confirmText],
              ),
            ]),
          ],
        ),
      ]),
    ],
  );
}

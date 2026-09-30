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
 * Popconfirm · Material 3
 *
 * 沿用 popover 的视觉语言，命名空间换成 .m3-popconfirm：
 *   .m3-popconfirm / .m3-popconfirm__arrow / .m3-popconfirm__header /
 *   .m3-popconfirm__body / .m3-popconfirm__actions
 *
 * 操作按钮直接复用 `.m3-btn` 的形态类（cancel = text，confirm = filled）。
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

  const arrow = makeArrowStyle(popper_state_, "m3-popconfirm__arrow");

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
                "m3-popconfirm",
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
                return [View({ class: "m3-popconfirm__header" }, title)];
              },
            }),
            Show({
              when: !!description,
              ok() {
                return [View({ class: "m3-popconfirm__body" }, description)];
              },
            }),
            View({ class: "m3-popconfirm__actions" }, [
              ui.PopconfirmPrimitive.Cancel(
                {
                  store,
                  class: "m3-btn m3-btn--text m3-btn--sm",
                },
                [cancelText],
              ),
              ui.PopconfirmPrimitive.Confirm(
                {
                  store,
                  class: classNames([
                    "m3-btn",
                    "m3-btn--filled",
                    "m3-btn--sm",
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

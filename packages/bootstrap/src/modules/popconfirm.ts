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
 * Popconfirm · Bootstrap 5.3
 *
 * Bootstrap 没有 popconfirm，这里沿用 .popover 的视觉语言，用 .popconfirm 作为
 * 命名空间：.popconfirm / .popconfirm-arrow / .popconfirm-header /
 * .popconfirm-body / .popconfirm-actions。
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

  const arrow = makeArrowStyle(popper_state_, "popconfirm-arrow");

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
                "popconfirm",
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
                return [View({ class: "popconfirm-header" }, title)];
              },
            }),
            Show({
              when: !!description,
              ok() {
                return [View({ class: "popconfirm-body" }, description)];
              },
            }),
            View({ class: "popconfirm-actions" }, [
              ui.PopconfirmPrimitive.Cancel(
                {
                  store,
                  class: "btn btn-outline-secondary btn-sm",
                },
                [cancelText],
              ),
              ui.PopconfirmPrimitive.Confirm(
                {
                  store,
                  class: classNames([
                    "btn",
                    "btn-primary",
                    "btn-sm",
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

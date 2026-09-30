import { ui, vm } from "@timeless/timeless";
import { classNames, computed, refobj } from "@timeless/timeless";
import { For, Show, View, ViewChildren, ViewProps } from "@timeless/timeless";

/**
 * Tabs · Material 3
 *
 * 类名（`m3-tabs` 命名空间）：
 *   .m3-tabs > .m3-tabs__list > .m3-tabs__tab(.is-active)
 *            + .m3-tabs__content > .m3-tabs__panel(.is-active)
 *
 * 两种视觉：
 *   · primary（默认）：active 项底部 3px --primary 指示条；
 *   · secondary：`m3-tabs--secondary` → active 项为 --secondary-container pill。
 *
 * headless 层的 TabHeaderCore 用 curId 表示当前选中项，这里映射成 .is-active。
 */

export type TabItem = {
  value: string;
  label: string;
  content?: ViewChildren;
};

export function Tabs(
  props: ViewProps & {
    store: vm.TabHeaderCore<any>;
    items?: TabItem[];
    variant?: "primary" | "secondary";
  },
  children?: ViewChildren,
) {
  const {
    store,
    items,
    variant = "primary",
    class: cls,
    ...rest
  } = props;

  const state_ = refobj(store.state);

  store.onStateChange((v) => {
    state_.as(v);
  });

  const tabs_ = items || computed(state_, (d) => d.tabs);

  return ui.TabsPrimitive.Root(
    {
      store,
      class: classNames([
        "m3-tabs",
        variant === "secondary" ? "m3-tabs--secondary" : "",
        cls,
      ]),
      ...rest,
    },
    [
      ui.TabsPrimitive.List({ store, class: "m3-tabs__list" }, [
        For({
          each: tabs_,
          render(item: TabItem, index) {
            const i = index.value;
            return ui.TabsPrimitive.Tab(
              {
                store,
                value: item.value,
                index: i,
                attributes: { type: "button" },
                class: classNames([
                  "m3-tabs__tab",
                  computed(state_, (d) =>
                    d.curId === item.value ? "is-active" : "",
                  ),
                ]),
              },
              [item.label],
            );
          },
        }),
      ]),
      Show({
        when: !!children,
        ok() {
          return children || [];
        },
        else() {
          return [
            View({ class: "m3-tabs__content" }, [
              For({
                each: tabs_,
                render(item: TabItem) {
                  return Show({
                    when: computed(state_, (d) => d.curId === item.value),
                    ok() {
                      return [
                        ui.TabsPrimitive.Content(
                          {
                            store,
                            value: item.value,
                            class: "m3-tabs__panel is-active",
                          },
                          item.content,
                        ),
                      ];
                    },
                  });
                },
              }),
            ]),
          ];
        },
      }),
    ],
  );
}

import { ui, vm } from "@timeless/timeless";
import { classNames, computed, refobj } from "@timeless/timeless";
import { For, Show, View, ViewChildren, ViewProps } from "@timeless/timeless";

/**
 * Tabs · Fluent 2
 *
 * 类名：.fl-tabs / .fl-tabs__list / .fl-tabs__tab（.is-active）/ .fl-tabs__content /
 * .fl-tabs__panel。
 *
 * Fluent 2 特征：动画下划线 pill —— 当前项底部 2px --compound-brand 圆角指示条，
 * 带 transition；hover 用 --surface-1-hover。
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
  },
  children?: ViewChildren,
) {
  const { store, items, class: cls, ...rest } = props;

  const state_ = refobj(store.state);

  store.onStateChange((v) => {
    state_.as(v);
  });

  const tabs_ = items || computed(state_, (d) => d.tabs);

  return ui.TabsPrimitive.Root(
    {
      store,
      class: classNames(["fl-tabs", cls]),
      ...rest,
    },
    [
      ui.TabsPrimitive.List({ store, class: "fl-tabs__list" }, [
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
                  "fl-tabs__tab",
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
            View({ class: "fl-tabs__content" }, [
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
                            class: "fl-tabs__panel",
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

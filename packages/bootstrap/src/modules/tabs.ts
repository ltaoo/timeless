import { ui, vm } from "@timeless/timeless";
import { classNames, computed, refobj } from "@timeless/timeless";
import { For, Show, View, ViewChildren, ViewProps } from "@timeless/timeless";

/**
 * Tabs · Bootstrap 5.3
 *
 * 类名沿用上游：.nav / .nav-tabs / .nav-link（.active 表示当前项）、
 * 内容区 .tab-content / .tab-pane（.active 表示可见）。
 *
 * headless 层的 TabHeaderCore 用 curId 表示当前选中项，这里映射成 .active。
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
      class: classNames(["tabs", cls]),
      ...rest,
    },
    [
      ui.TabsPrimitive.List({ store, class: "nav nav-tabs" }, [
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
                  "nav-link",
                  computed(state_, (d) =>
                    d.curId === item.value ? "active" : "",
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
            View({ class: "tab-content" }, [
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
                            class: "tab-pane active",
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

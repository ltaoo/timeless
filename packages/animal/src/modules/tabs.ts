import { ui, vm } from "@timeless/timeless";
import { classNames, computed, refobj } from "@timeless/timeless";
import { For, Show, View, ViewChildren, ViewProps } from "@timeless/timeless";

/**
 * Tabs · Animal Island
 *
 * 类名：.animal-tabs / .animal-tabs__list / .animal-tabs__tab（.is-active）/ .animal-tabs__content /
 * .animal-tabs__panel。
 *
 * Animal Island 特征：标签条是米色胶囊（--secondary + --radius-pill），当前项是实心
 * 薄荷青胶囊（--primary 底 + --primary-foreground 字）；hover 用 --accent。
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
      class: classNames(["animal-tabs", cls]),
      ...rest,
    },
    [
      ui.TabsPrimitive.List({ store, class: "animal-tabs__list" }, [
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
                  "animal-tabs__tab",
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
            View({ class: "animal-tabs__content" }, [
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
                            class: "animal-tabs__panel",
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

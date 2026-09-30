import { ui, vm } from "@timeless/timeless";
import { classNames, computed, refobj } from "@timeless/timeless";
import { For, Show, View, ViewProps } from "@timeless/timeless";

/**
 * Steps · Animal Island
 *
 * 类名：.animal-steps / .animal-steps__list / .animal-steps__item /
 * .animal-steps__indicator / .animal-steps__text / .animal-steps__title /
 * .animal-steps__description / .animal-steps__connector。
 *
 * Animal Island 特征：current 用薄荷青 --primary，completed 用 --success。
 * 状态通过 .is-completed / .is-current / .is-upcoming 表达。
 *
 * 注意：headless 的 StepsPrimitive.List 会忽略传入的 children 并自行渲染一套
 * 无 class 的 Item/Indicator 树（Indicator 内部只在有 children 时才输出内容，
 * 因此编号永远为空）。所以这里只用 Root/Item/Title/Description/Connector 这些
 * 透传原语，列表本身用 View + For 自己拼装，保证 .animal-steps__* 类名完整。
 */

export type StepItem = {
  title: string;
  description?: string;
};

export function Steps(
  props: ViewProps & { store: vm.StepCore; items: StepItem[] },
) {
  const { store, items, class: cls, ...rest } = props;

  const state_ = refobj(store.state);

  store.onStateChange((v) => {
    state_.as(v);
  });

  return ui.StepsPrimitive.Root(
    {
      store,
      items,
      class: classNames(["animal-steps", cls]),
      ...rest,
    },
    [
      View({ class: "animal-steps__list" }, [
        For({
          each: items,
          render(item: StepItem, index) {
            const i = index.value;
            const step_state_ = computed(state_, (s) => {
              if (i < s.value) return "is-completed";
              if (i === s.value) return "is-current";
              return "is-upcoming";
            });
            return ui.StepsPrimitive.Item(
              {
                store,
                index: i,
                item,
                class: classNames(["animal-steps__item", step_state_]),
              },
              [
                View({ class: "animal-steps__indicator" }, [
                  computed(state_, (s) => (i < s.value ? "✓" : String(i + 1))),
                ]),
                View({ class: "animal-steps__text" }, [
                  ui.StepsPrimitive.Title({ class: "animal-steps__title" }, [
                    item.title,
                  ]),
                  Show({
                    when: !!item.description,
                    ok() {
                      return [
                        ui.StepsPrimitive.Description(
                          { class: "animal-steps__description" },
                          [item.description as string],
                        ),
                      ];
                    },
                  }),
                ]),
                Show({
                  when: i < items.length - 1,
                  ok() {
                    return [
                      ui.StepsPrimitive.Connector(
                        {
                          store,
                          index: i,
                          class: classNames([
                            "animal-steps__connector",
                            computed(state_, (s) =>
                              i < s.value ? "is-completed" : "",
                            ),
                          ]),
                        },
                        [],
                      ),
                    ];
                  },
                }),
              ],
            );
          },
        }),
      ]),
    ],
  );
}

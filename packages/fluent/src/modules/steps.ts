import { ui, vm } from "@timeless/timeless";
import { classNames, computed, refobj } from "@timeless/timeless";
import { For, Show, View, ViewProps } from "@timeless/timeless";

/**
 * Steps · Fluent 2
 *
 * 类名：.fl-steps / .fl-steps__list / .fl-steps__item /
 * .fl-steps__indicator / .fl-steps__text / .fl-steps__title /
 * .fl-steps__description / .fl-steps__connector。
 *
 * Fluent 2 特征：active 用 --compound-brand，completed 用 --success。
 * 状态通过 .is-completed / .is-current / .is-upcoming 表达。
 *
 * 注意：headless 的 StepsPrimitive.List 会忽略传入的 children 并自行渲染一套
 * 无 class 的 Item/Indicator 树（Indicator 内部只在有 children 时才输出内容，
 * 因此编号永远为空）。所以这里只用 Root/Item/Title/Description/Connector 这些
 * 透传原语，列表本身用 View + For 自己拼装，保证 Fluent 类名完整。
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
      class: classNames(["fl-steps", cls]),
      ...rest,
    },
    [
      View({ class: "fl-steps__list" }, [
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
                class: classNames(["fl-steps__item", step_state_]),
              },
              [
                View({ class: "fl-steps__indicator" }, [
                  computed(state_, (s) => (i < s.value ? "✓" : String(i + 1))),
                ]),
                View({ class: "fl-steps__text" }, [
                  ui.StepsPrimitive.Title({ class: "fl-steps__title" }, [
                    item.title,
                  ]),
                  Show({
                    when: !!item.description,
                    ok() {
                      return [
                        ui.StepsPrimitive.Description(
                          { class: "fl-steps__description" },
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
                            "fl-steps__connector",
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

import { ui, vm } from "@timeless/timeless";
import { classNames, computed, Icon } from "@timeless/timeless";
import { For, Show, View, ViewChildren, ViewProps } from "@timeless/timeless";

/**
 * Accordion · Fluent 2
 *
 * 类名：.fl-accordion / .fl-accordion__item / .fl-accordion__header /
 * .fl-accordion__trigger / .fl-accordion__chevron / .fl-accordion__panel /
 * .fl-accordion__body。分隔用 1px --stroke2，展开态标题字重 600。
 *
 * 三点 headless 约束（决定了这里的写法）：
 *
 * 1. Trigger 直接改 store.openItems，不会 emit StateChange。因此展开态不能从
 *    store.state 派生，必须直接跟随 store.openItems（RefArray）。
 * 2. Trigger / Item 会把 props 透传，所以动态 class 要挂在 .fl-accordion__item 与
 *    .fl-accordion__trigger 上，由 CSS 用后代选择器控制 .fl-accordion__panel。
 * 3. Content 会把传入的 class 强制换成 computed，只在「传入字符串」时保留。
 *    所以 .fl-accordion__panel 只能是固定字符串类名，不能动态加类。
 *
 * 为什么不用 data-state：dataset 的响应式更新目前写错属性名（写成了裸的
 * `state` 而不是 `data-state`），所以这里统一用 .is-open 类名表达展开态。
 */

export type AccordionItem = {
  title: ViewChildren;
  content: ViewChildren;
};

export function Accordion(
  props: ViewProps & {
    store: vm.AccordionCore;
    items: AccordionItem[];
  },
) {
  const { store, items, class: cls, ...rest } = props;

  return ui.AccordionPrimitive.Root(
    {
      store,
      class: classNames(["fl-accordion", cls]),
      ...rest,
    },
    [
      For({
        each: items,
        render(item: AccordionItem, index) {
          const i = index.value;
          const open_cls_ = computed(store.openItems, (d: number[]) =>
            d.includes(i) ? "is-open" : "",
          );
          return ui.AccordionPrimitive.Item(
            {
              store,
              index: i,
              class: classNames(["fl-accordion__item", open_cls_]),
            },
            [
              View({ class: "fl-accordion__header" }, [
                ui.AccordionPrimitive.Trigger(
                  {
                    store,
                    index: i,
                    class: classNames(["fl-accordion__trigger", open_cls_]),
                  },
                  [
                    Show({
                      when: typeof item.title === "string",
                      ok() {
                        return item.title as ViewChildren;
                      },
                      else() {
                        return item.title || [];
                      },
                    }),
                    ui.AccordionPrimitive.Chevron(
                      {
                        store,
                        index: i,
                        class: "fl-accordion__chevron",
                      },
                      [Icon({ name: "chevron-down", size: 16 })],
                    ),
                  ],
                ),
              ]),
              ui.AccordionPrimitive.Content(
                {
                  store,
                  index: i,
                  class: "fl-accordion__panel",
                },
                [View({ class: "fl-accordion__body" }, item.content)],
              ),
            ],
          );
        },
      }),
    ],
  );
}

import { ui, vm } from "@timeless/timeless";
import {
  For,
  TimelessElement,
  ViewProps,
  classNames,
  refarr,
} from "@timeless/timeless";

/**
 * Waterfall · Fluent 2
 *
 * 瀑布流容器：.fl-waterfall > .fl-waterfall__column × N > .fl-waterfall__item。
 * 列高、放置策略、可视区间都在 WaterfallModel 内计算；模块只把
 * Fluent 类名挂到 Root / Column / Cell 上，并交给上层 ScrollView 驱动滚动。
 */
export function Waterfall<T extends Record<string, unknown>>(
  props: ViewProps & {
    store: vm.WaterfallModel<T>;
    render: (payload: T, cell: vm.WaterfallCellModel<T>) => TimelessElement;
  },
) {
  const { store, class: cls, render, ...rest } = props;

  return ui.WaterfallPrimitive.Root(
    {
      ...rest,
      store,
      class: classNames(["fl-waterfall", cls]),
    },
    [
      For({
        each: store.$columns,
        render(column) {
          const visible_cells = refarr([...column.$cells]);
          return ui.WaterfallPrimitive.Column(
            { store: column, class: "fl-waterfall__column" },
            [
              For({
                key: "id",
                each: visible_cells,
                render(slot) {
                  const payload = slot.state.payload;
                  const user_content = slot.state.bound
                    ? render(payload, slot)
                    : null;
                  return ui.WaterfallPrimitive.Cell(
                    { store: slot, class: "fl-waterfall__item" },
                    user_content ? [user_content] : [],
                  );
                },
              }),
            ],
          );
        },
      }),
    ],
  );
}

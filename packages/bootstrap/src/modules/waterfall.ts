import { vm } from "@timeless/timeless";
import {
  classNames,
  computed,
  For,
  ref,
  refarr,
  TimelessElement,
  View,
  ViewProps,
} from "@timeless/timeless";

/**
 * Waterfall · Bootstrap 5.3
 *
 * 结构：.waterfall（横向 flex 容器）> .waterfall__column > .waterfall__item。
 * 列高由 column.state.height 下发，item 的 top/height/bound 由 cell.state 下发，
 * 均以内联 style 落到 DOM，这里只负责类名、槽位绑定与状态订阅。
 */
export function Waterfall<T extends Record<string, unknown>>(
  props: ViewProps & {
    store: vm.WaterfallModel<T>;
    render: (payload: T, cell: vm.WaterfallCellModel<T>) => TimelessElement;
  },
) {
  const { store, class: cls, render, ...rest } = props;

  return View({ ...rest, class: classNames(["waterfall", cls]) }, [
    For({
      each: store.$columns,
      render(column: vm.WaterfallColumnModel<T>) {
        const column_height_ = ref(column.state.height);
        column.onStateChange((v) => column_height_.as(v.height));

        const slots_ = refarr([...column.$cells]);
        column.onStateChange(() => slots_.as([...column.$cells]));

        return View(
          {
            class: "waterfall__column",
            style: {
              position: "relative",
              height: computed(column_height_, (h) => `${h}px`),
            },
          },
          [
            For({
              key: "id",
              each: slots_ as any,
              render(slot: vm.WaterfallCellModel<T>) {
                const cell_ = ref({
                  top: slot.state.top,
                  height: slot.state.height,
                  bound: slot.state.bound ?? true,
                });
                slot.onStateChange((v) => {
                  cell_.as({
                    top: v.top,
                    height: v.height,
                    bound: v.bound ?? true,
                  });
                });

                const content = slot.state.bound
                  ? render(slot.state.payload, slot)
                  : null;

                return View(
                  {
                    class: "waterfall__item",
                    style: {
                      position: "absolute",
                      width: "100%",
                      display: computed(cell_, (s) =>
                        s.bound ? undefined : "none",
                      ),
                      top: computed(cell_, (s) => `${s.top}px`),
                      height: computed(cell_, (s) => `${s.height}px`),
                    },
                  },
                  content ? [content] : [],
                );
              },
            }),
          ],
        );
      },
    }),
  ]);
}

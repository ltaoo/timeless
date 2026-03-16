import {
  WaterfallPrimitive,
  For,
  type ViewProps,
  type TimelessElement,
} from "@timeless/headless";
import { cn, refarr } from "@timeless/reactive";
import { WaterfallModel, WaterfallCellModel } from "@timeless/ui";

export function Waterfall<T extends Record<string, unknown>>(
  props: ViewProps & {
    store: WaterfallModel<T>;
    render: (payload: T, cell: WaterfallCellModel<T>) => TimelessElement;
  },
) {
  const { store, class: cls, render, ...rest } = props;

  const columnChildren = store.$columns.map((column) => {
    const visibleCells = refarr([...column.$cells]);
    column.onStateChange(() => {
      visibleCells.as([...column.$cells]);
    });

    return WaterfallPrimitive.Column({ store: column }, [
      For({
        key: "id",
        each: visibleCells,
        render(cell) {
          const payload = cell.state.payload;
          return WaterfallPrimitive.Cell({ store: cell }, [
            render(payload, cell),
          ]);
        },
      }),
    ]);
  });

  return WaterfallPrimitive.Root(
    {
      store,
      class: cn(["w-full h-full overflow-y-auto", cls]),
      ...rest,
    },
    columnChildren,
  );
}

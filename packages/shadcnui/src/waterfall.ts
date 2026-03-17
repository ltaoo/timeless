import {
  WaterfallPrimitive,
  For,
  type ViewProps,
  type TimelessElement,
  isElement,
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

    return WaterfallPrimitive.Column({ store: column }, [
      For({
        key: "id",
        each: visibleCells,
        render(slot) {
          let payload = slot.state.payload;
          let userContent = slot.state.bound ? render(payload, slot) : null;

          const cellElement = WaterfallPrimitive.Cell({ store: slot }, userContent ? [userContent] : []);

          // 监听 rebind — 替换内部用户内容
          slot.onRebind(() => {
            const cellDiv = cellElement.$elm as HTMLElement;
            if (!cellDiv) return;

            // 卸载旧内容
            if (userContent && typeof userContent.onUnmounted === 'function') {
              userContent.onUnmounted();
            }
            // 清空 Cell div 内部（保留 Cell div 本身在 Column 中的位置不变）
            while (cellDiv.firstChild) {
              cellDiv.removeChild(cellDiv.firstChild);
            }

            // 创建并挂载新内容
            payload = slot.state.payload;
            userContent = render(payload, slot);
            if (userContent && isElement(userContent)) {
              const rendered = userContent.render();
              if (rendered) {
                cellDiv.appendChild(rendered);
              }
              if (typeof userContent.onMounted === 'function') {
                userContent.onMounted(userContent.$elm);
              }
            }
          });

          return cellElement;
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

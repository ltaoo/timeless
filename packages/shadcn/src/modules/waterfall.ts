import { For, type ViewProps, type TimelessElement } from "@timeless/timeless";
import { classNames, refarr } from "@timeless/timeless";
import { WaterfallPrimitive } from "@timeless/ui-primitive";
import type { WaterfallCellModel, WaterfallModel } from "@timeless/inner-vm";

export function Waterfall<T extends Record<string, unknown>>(
  props: ViewProps & {
    store: WaterfallModel<T>;
    render: (payload: T, cell: WaterfallCellModel<T>) => TimelessElement;
  },
) {
  const { store, class: cls, render, ...rest } = props;

  return WaterfallPrimitive.Root(
    {
      ...rest,
      store,
      class: classNames([
        "w-full h-full overflow-y-auto",
        "!overflow-visible !h-auto",
      ]),
    },
    [
      For({
        each: store.$columns,
        render(column) {
          const visible_cells = refarr([...column.$cells]);
          return WaterfallPrimitive.Column({ store: column }, [
            For({
              key: "id",
              each: visible_cells,
              render(slot) {
                let payload = slot.state.payload;
                let user_content = slot.state.bound
                  ? render(payload, slot)
                  : null;

                const cell$ = WaterfallPrimitive.Cell(
                  { store: slot },
                  user_content ? [user_content] : [],
                );

                // 监听 rebind — 替换内部用户内容
                // slot.onRebind(() => {
                //   const $cell = cell$.$elm;
                //   if (!$cell) return;
                //   // 卸载旧内容
                //   if (
                //     user_content &&
                //     typeof user_content.onUnmounted === "function"
                //   ) {
                //     user_content.onUnmounted();
                //   }
                //   // 清空 Cell div 内部（保留 Cell div 本身在 Column 中的位置不变）
                //   while ($cell.firstChild) {
                //     $cell.removeChild($cell.firstChild);
                //   }

                //   // 创建并挂载新内容
                //   payload = slot.state.payload;
                //   user_content = render(payload, slot);
                //   if (user_content && isElement(user_content)) {
                //     const rendered = user_content.render();
                //     if (rendered) {
                //       $cell.appendChild(rendered);
                //     }
                //     if (typeof user_content.onMounted === "function") {
                //       user_content.onMounted({ target: user_content.$elm });
                //     }
                //   }
                // });

                return cell$;
              },
            }),
          ]);
        },
      }),
    ],
  );
}

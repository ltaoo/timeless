import { ui, vm } from "@timeless/timeless";
import { ref } from "@timeless/timeless";
import {
  For,
  Fragment,
  TimelessElement,
  View,
  ViewChildren,
  ViewProps,
} from "@timeless/timeless";

/**
 * Tooltip · Material 3
 *
 * 类名：.m3-tooltip / .m3-tooltip__arrow / .m3-tooltip__inner。
 * 气泡用 --inverse-surface + --inverse-surface-foreground（M3 的 tooltip 配色）。
 *
 * headless 层只实现了一个全局单例的 tooltip store，并且
 * TooltipPrimitive.Trigger 内部固定使用该单例。因此这里采取与单例匹配的架构：
 *   · <Tooltip> 只负责触发器，并在 mouseenter 时把气泡内容写进模块级 content$；
 *   · <TooltipProvider> 渲染唯一一个 Portal，从 content$ 读取当前内容。
 * Provider 需要在页面里挂一次（与 shadcn / bootstrap 版本一致）。
 */

const content$ = ref<TimelessElement[]>([]);

export function Tooltip(
  props: ViewProps & {
    content?: ViewChildren;
    side?: vm.Side;
    align?: vm.Align;
  },
  children?: ViewChildren,
): TimelessElement {
  const { content, side = "top", align = "center", ...rest } = props;

  return ui.TooltipPrimitive.Trigger(
    {
      ...rest,
      side,
      align,
      content,
      onMouseEnter(e) {
        content$.as([View({ class: "m3-tooltip__inner" }, content || [])]);
        if (rest.onMouseEnter) {
          rest.onMouseEnter(e);
        }
      },
    },
    children,
  );
}

export function TooltipProvider(
  props: ViewProps,
  children?: ViewChildren,
): TimelessElement {
  const { class: cls, ...rest } = props;
  return Fragment({}, [
    Fragment({}, children),
    ui.TooltipPrimitive.Portal(
      {
        ...rest,
        class: cls ? `m3-tooltip ${cls}` : "m3-tooltip",
      },
      [
        View({ class: "m3-tooltip__arrow" }, []),
        For({
          each: content$,
          render(el) {
            return el;
          },
        }),
      ],
    ),
  ]);
}

import { ui, vm } from "@timeless/timeless";
import { classNames, TimelessElement, ViewProps } from "@timeless/timeless";

/**
 * Tree · shadcn（Tailwind 内联，与 `modules/flow.ts` 同风格）
 *
 * 逻辑全在 `vm.TreeCore`，DOM 形状全在 `ui.TreePrimitive`。这里只把 Tailwind
 * 工具类对进 primitive 的 `TreeClassNames` 槽位，并给出 shadcn 的行高 / 缩进。
 *
 * 行高 28px（`h-7`），与移植前 `apps/web-shadcn/src/components/tree.js` 的
 * `row_height = 28` 一致 —— itemHeight 是渲染器入参，两边必须对得上。
 *
 * 有两处没走内联类，放在 `src/index.css`：
 *   1. 勾选框的勾 / 半选短横线是两张 SVG 底色，Tailwind 的任意值语法里要塞
 *      data URI（含空格与 `#`）非常易碎；
 *   2. 落点指示线的定位/显隐要按 primitive 写的 `data-tree-line` 属性分叉，
 *      用 `.tree-line[data-tree-line="before"]` 比任意变体可读。
 * 两处都沿用其余三库同一套状态类名（`.is-before` / `.is-after` / `.is-checked`
 * / `.is-indeterminate`），四库的 DOM 契约因此完全一致。
 *
 * 层级引导线（`guide` 槽位）全部走内联工具类，`tree-guide` 只作标记类名
 * （`tree-` 前缀在插件的保留白名单里），不需要动 `src/index.css`。
 */
export const TREE_CLASSES: ui.TreePrimitive.TreeClassNames = {
  root: "text-sm text-zinc-900 dark:text-zinc-100",
  scroll:
    "relative overflow-y-auto rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950",
  row: "relative flex items-center gap-1 h-7 pr-2 rounded-md select-none cursor-default",
  rowLifted: "opacity-40",
  rowInto:
    "bg-blue-50 ring-1 ring-inset ring-blue-400 dark:bg-blue-950/40 dark:ring-blue-500",
  rowSelected: "bg-zinc-100 font-medium dark:bg-zinc-800",
  rowDisabled: "opacity-50 cursor-not-allowed",
  caret:
    "inline-flex items-center justify-center w-4 h-4 shrink-0 rounded text-zinc-400 cursor-pointer hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200",
  caretIcon: "block pointer-events-none",
  icon: "inline-flex items-center shrink-0 text-zinc-400",
  title: "flex-1 min-w-0 truncate",
  meta: "shrink-0 text-xs text-zinc-400 tabular-nums",
  // 层级引导线：`tree-guide` 是自定义类名（`tree-` 前缀在插件的保留白名单里），
  // 其余是 Tailwind 工具类，前缀插件会照常处理。缩进槽位置由 primitive 算好。
  guide:
    "tree-guide absolute top-0 bottom-0 w-px bg-zinc-200 pointer-events-none dark:bg-zinc-800",
  line: "tree-line absolute left-0 right-0 h-0.5 rounded-full bg-blue-500",
  lineBefore: "is-before",
  lineAfter: "is-after",
  checkbox: "tree-check shrink-0 w-4 h-4 cursor-pointer",
  checkboxChecked: "is-checked",
  checkboxHalf: "is-indeterminate",
  checkboxBox:
    "tree-check-box block w-full h-full rounded-[3px] border border-zinc-300 bg-white transition-colors dark:border-zinc-600 dark:bg-zinc-900",
  checkboxIndicator: "tree-check-indicator block w-full h-full",
  ghost:
    "fixed top-0 left-0 z-50 inline-flex items-center gap-1 max-w-xs px-2 py-1 rounded-md border border-zinc-200 bg-white text-sm shadow-2xl pointer-events-none dark:border-zinc-700 dark:bg-zinc-900",
  ghostTitle: "truncate",
  empty: "px-2 py-6 text-center text-sm text-zinc-400",
  hint: "px-2 pt-1 text-xs text-zinc-400",
};

const ROW_HEIGHT = 28;
const INDENT = 18;

export type TreeProps = Omit<ui.TreePrimitive.TreeRootProps, "classes"> &
  ViewProps & { store: vm.TreeCore };

/** Tree 的公开入口。primitive 参数原样透传，只补 Tailwind 类名与默认尺寸。 */
export function Tree(props: TreeProps): TimelessElement {
  const { class: cls, itemHeight, indent, ...rest } = props;

  return ui.TreePrimitive.Root({
    ...rest,
    itemHeight: itemHeight ?? ROW_HEIGHT,
    indent: indent ?? INDENT,
    classes: { ...TREE_CLASSES, root: classNames([TREE_CLASSES.root, cls]) },
  });
}

/** 自定义行渲染时复用的行槽位（`renderRow` 里拿到 props 再交给它）。 */
export function TreeRow(props: ui.TreePrimitive.TreeRowProps): TimelessElement {
  return ui.TreePrimitive.Row({
    ...props,
    classes: { ...TREE_CLASSES, ...(props.classes || {}) },
  });
}

export function TreeCheckbox(
  props: ui.TreePrimitive.TreeCheckboxProps,
): TimelessElement {
  return ui.TreePrimitive.Checkbox({
    ...props,
    classes: { ...TREE_CLASSES, ...(props.classes || {}) },
  });
}

export function TreeIndicator(
  props: { classes?: ui.TreePrimitive.TreeClassNames } = {},
): TimelessElement {
  return ui.TreePrimitive.Indicator({
    ...props,
    classes: { ...TREE_CLASSES, ...(props.classes || {}) },
  });
}

export function TreeEmpty(
  props: { text?: string; classes?: ui.TreePrimitive.TreeClassNames } = {},
): TimelessElement {
  return ui.TreePrimitive.Empty({
    ...props,
    classes: { ...TREE_CLASSES, ...(props.classes || {}) },
  });
}

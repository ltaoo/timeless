import { ui, vm } from "@timeless/timeless";
import { classNames, TimelessElement, ViewProps } from "@timeless/timeless";

/**
 * Tree · Fluent 2
 *
 * 逻辑全在 `vm.TreeCore`，DOM 形状全在 `ui.TreePrimitive`。这里只把 Fluent 的
 * 类名对进 primitive 的 `TreeClassNames` 槽位，并给出 Fluent 的行高 / 缩进。
 *
 * 类名契约（配合 style/components/tree.css）：
 *   .fl-tree > .fl-tree__scroll > .fl-tree__row
 * 行内：.fl-tree__guide(data-tree-guide) / .fl-tree__line(data-tree-line)
 * 状态：.is-lifted / .is-drop-into / .is-before / .is-after / .is-selected
 *       / .is-checked / .is-indeterminate / .is-disabled
 */
export const TREE_CLASSES: ui.TreePrimitive.TreeClassNames = {
  root: "fl-tree",
  scroll: "fl-tree__scroll",
  row: "fl-tree__row",
  rowLifted: "is-lifted",
  rowInto: "is-drop-into",
  rowSelected: "is-selected",
  rowDisabled: "is-disabled",
  caret: "fl-tree__caret",
  caretIcon: "fl-tree__caret-icon",
  icon: "fl-tree__icon",
  title: "fl-tree__title",
  meta: "fl-tree__meta",
  guide: "fl-tree__guide",
  line: "fl-tree__line",
  lineBefore: "is-before",
  lineAfter: "is-after",
  checkbox: "fl-tree__checkbox",
  checkboxChecked: "is-checked",
  checkboxHalf: "is-indeterminate",
  checkboxBox: "fl-tree__checkbox-box",
  checkboxIndicator: "fl-tree__checkbox-indicator",
  ghost: "fl-tree__ghost",
  ghostTitle: "fl-tree__ghost-title",
  empty: "fl-tree__empty",
  hint: "fl-tree__hint",
};

/** Fluent 树行高度：32px。刻意不吃 `--control-height-sm`（Fluent 是 24px，
 *  和树行的视觉密度对不上）。落成 --tree-row-height 是因为 ListViewV2 的
 *  itemHeight 是渲染器入参 —— 两边必须一致，否则首屏估算高度会跳。 */
const ROW_HEIGHT = 32;
const INDENT = 18;

export type TreeProps = Omit<ui.TreePrimitive.TreeRootProps, "classes"> &
  ViewProps & { store: vm.TreeCore };

/** Tree 的公开入口。primitive 参数原样透传，只补 Fluent 的类名与默认尺寸。 */
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

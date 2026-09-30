import { ui, vm } from "@timeless/timeless";
import { classNames, TimelessElement, ViewProps } from "@timeless/timeless";

/**
 * Tree · Material 3
 *
 * 逻辑全在 `vm.TreeCore`，DOM 形状全在 `ui.TreePrimitive`。这里只把 M3 的类名
 * 对进 primitive 的 `TreeClassNames` 槽位，并给出 M3 的行高 / 缩进。
 *
 * 类名契约（配合 style/components/tree.css）：
 *   .m3-tree > .m3-tree__scroll > .m3-tree__row
 * 行内：.m3-tree__guide(data-tree-guide) / .m3-tree__line(data-tree-line)
 * 状态：.is-lifted / .is-drop-into / .is-before / .is-after / .is-selected
 *       / .is-checked / .is-indeterminate / .is-disabled
 */
export const TREE_CLASSES: ui.TreePrimitive.TreeClassNames = {
  root: "m3-tree",
  scroll: "m3-tree__scroll",
  row: "m3-tree__row",
  rowLifted: "is-lifted",
  rowInto: "is-drop-into",
  rowSelected: "is-selected",
  rowDisabled: "is-disabled",
  caret: "m3-tree__caret",
  caretIcon: "m3-tree__caret-icon",
  icon: "m3-tree__icon",
  title: "m3-tree__title",
  meta: "m3-tree__meta",
  guide: "m3-tree__guide",
  line: "m3-tree__line",
  lineBefore: "is-before",
  lineAfter: "is-after",
  checkbox: "m3-tree__checkbox",
  checkboxChecked: "is-checked",
  checkboxHalf: "is-indeterminate",
  checkboxBox: "m3-tree__checkbox-box",
  checkboxIndicator: "m3-tree__checkbox-indicator",
  ghost: "m3-tree__ghost",
  ghostTitle: "m3-tree__ghost-title",
  empty: "m3-tree__empty",
  hint: "m3-tree__hint",
};

/** M3 列表行口径：40px。落成 --tree-row-height 是因为 ListViewV2 的
 *  itemHeight 是渲染器入参，两边必须一致，否则首屏估算高度会跳。 */
const ROW_HEIGHT = 40;
const INDENT = 20;

export type TreeProps = Omit<ui.TreePrimitive.TreeRootProps, "classes"> &
  ViewProps & { store: vm.TreeCore };

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

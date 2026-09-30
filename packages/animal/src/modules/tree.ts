import { ui, vm } from "@timeless/timeless";
import { classNames, TimelessElement, ViewProps } from "@timeless/timeless";

/**
 * Tree · Animal Island
 *
 * 逻辑全在 `vm.TreeCore`，DOM 形状全在 `ui.TreePrimitive`。这里只把 Animal Island 的
 * 类名对进 primitive 的 `TreeClassNames` 槽位，并给出本库的行高 / 缩进。
 *
 * 类名契约（配合 style/components/tree.css）：
 *   .animal-tree > .animal-tree__scroll > .animal-tree__row
 * 行内：.animal-tree__guide(data-tree-guide) / .animal-tree__line(data-tree-line)
 * 状态：.is-lifted / .is-drop-into / .is-before / .is-after / .is-selected
 *       / .is-checked / .is-indeterminate / .is-disabled
 */
export const TREE_CLASSES: ui.TreePrimitive.TreeClassNames = {
  root: "animal-tree",
  scroll: "animal-tree__scroll",
  row: "animal-tree__row",
  rowLifted: "is-lifted",
  rowInto: "is-drop-into",
  rowSelected: "is-selected",
  rowDisabled: "is-disabled",
  caret: "animal-tree__caret",
  caretIcon: "animal-tree__caret-icon",
  icon: "animal-tree__icon",
  title: "animal-tree__title",
  meta: "animal-tree__meta",
  guide: "animal-tree__guide",
  line: "animal-tree__line",
  lineBefore: "is-before",
  lineAfter: "is-after",
  checkbox: "animal-tree__checkbox",
  checkboxChecked: "is-checked",
  checkboxHalf: "is-indeterminate",
  checkboxBox: "animal-tree__checkbox-box",
  checkboxIndicator: "animal-tree__checkbox-indicator",
  ghost: "animal-tree__ghost",
  ghostTitle: "animal-tree__ghost-title",
  empty: "animal-tree__empty",
  hint: "animal-tree__hint",
};

/** Animal Island 树行高度：40px，与 alias 层的 `--tree-row-height` 一致。
 *  刻意不吃控件高度族（--control-height-*）：树行的视觉密度是独立的。
 *  ListViewV2 的 itemHeight 是渲染器入参 —— 必须与 CSS 里的行高数值一致，
 *  否则首屏估算高度会跳。 */
const ROW_HEIGHT = 40;
const INDENT = 18;

export type TreeProps = Omit<ui.TreePrimitive.TreeRootProps, "classes"> &
  ViewProps & { store: vm.TreeCore };

/** Tree 的公开入口。primitive 参数原样透传，只补 Animal Island 的类名与默认尺寸。 */
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

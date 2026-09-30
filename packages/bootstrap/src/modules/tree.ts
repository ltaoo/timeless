import { ui, vm } from "@timeless/timeless";
import { classNames, TimelessElement, ViewProps } from "@timeless/timeless";

/**
 * Tree · Bootstrap 5.3
 *
 * 逻辑全在 `vm.TreeCore`（折叠 / 勾选 / 拖拽落点），DOM 形状全在
 * `ui.TreePrimitive`。这里只做一件事：把 Bootstrap 的类名对进 primitive 的
 * `TreeClassNames` 槽位，并给出 Bootstrap 的行高 / 缩进。
 *
 * 类名契约（配合 style/components/tree.css）：
 *   .tree > .tree__scroll > .tree__row
 * 行内：.tree__guide(data-tree-guide) / .tree__line(data-tree-line) / .tree__caret
 *       / .tree__icon / .tree__title / .tree__meta
 *       / .tree__checkbox > .tree__checkbox-box > .tree__checkbox-indicator
 * 状态：.is-lifted / .is-drop-into / .is-before / .is-after / .is-selected
 *       / .is-checked / .is-indeterminate / .is-disabled
 */
export const TREE_CLASSES: ui.TreePrimitive.TreeClassNames = {
  root: "tree",
  scroll: "tree__scroll",
  row: "tree__row",
  rowLifted: "is-lifted",
  rowInto: "is-drop-into",
  rowSelected: "is-selected",
  rowDisabled: "is-disabled",
  caret: "tree__caret",
  caretIcon: "tree__caret-icon",
  icon: "tree__icon",
  title: "tree__title",
  meta: "tree__meta",
  guide: "tree__guide",
  line: "tree__line",
  lineBefore: "is-before",
  lineAfter: "is-after",
  checkbox: "tree__checkbox",
  checkboxChecked: "is-checked",
  checkboxHalf: "is-indeterminate",
  checkboxBox: "tree__checkbox-box",
  checkboxIndicator: "tree__checkbox-indicator",
  ghost: "tree__ghost",
  ghostTitle: "tree__ghost-title",
  empty: "tree__empty",
  hint: "tree__hint",
};

/** Bootstrap 树行高度：32px（不跟 `--control-height-sm`，那个是表单控件口径）。 */
const ROW_HEIGHT = 32;
const INDENT = 18;

export type TreeProps = Omit<ui.TreePrimitive.TreeRootProps, "classes"> &
  ViewProps & { store: vm.TreeCore };

/**
 * Tree 的公开入口。所有 primitive 参数（`itemHeight` / `indent` /
 * `renderRow` …）原样透传，只补上 Bootstrap 的类名与默认尺寸。
 */
export function Tree(props: TreeProps): TimelessElement {
  const { class: cls, itemHeight, indent, ...rest } = props;

  return ui.TreePrimitive.Root({
    ...rest,
    itemHeight: itemHeight ?? ROW_HEIGHT,
    indent: indent ?? INDENT,
    classes: { ...TREE_CLASSES, root: classNames([TREE_CLASSES.root, cls]) },
  });
}

/**
 * 自定义行渲染时复用的行槽位（`renderRow` 里拿到 `props` 再交给它）。
 * 需要换图标 / 追加体积之类的业务字段时，用这个而不是重写整个 `Row`。
 */
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

/** 勾选框里的方框本身（极少单独用，留作插槽覆盖）。 */
export function TreeIndicator(props: {
  classes?: ui.TreePrimitive.TreeClassNames;
} = {}): TimelessElement {
  return ui.TreePrimitive.Indicator({
    ...props,
    classes: { ...TREE_CLASSES, ...(props.classes || {}) },
  });
}

export function TreeEmpty(props: {
  text?: string;
  classes?: ui.TreePrimitive.TreeClassNames;
} = {}): TimelessElement {
  return ui.TreePrimitive.Empty({
    ...props,
    classes: { ...TREE_CLASSES, ...(props.classes || {}) },
  });
}

/**
 * Tree 的通用节点与落点类型。
 *
 * 这一层刻意不认识 `type: "file" | "directory"` 这类业务字段：**带 `children`
 * 数组的节点就是可展开目录**，其余是叶子。业务字段（type / size / icon /
 * resource …）通过索引签名原样透传，渲染层按需读取。
 */

export type TreeNode = {
  /** 稳定标识；不传则由 assignIds 按下标生成内部 `_id` */
  key?: string;
  /** 显示名 */
  title?: string;
  children?: TreeNode[];
  disabled?: boolean;
  /** 这一行能否作为拖拽源（默认可以）。`false` 只挡「拖起」，仍可作为落点。 */
  draggable?: boolean;
  /** 强制叶子（即使带 children 也不可展开） */
  isLeaf?: boolean;
  /** 内部：稳定 id（`d0/f1` 这种），由 assignIds 生成 */
  _id?: string;
  /** 内部：`a/b/c` 路径，折叠状态跨数据重建的搬运锚点 */
  _path?: string;
  /** 业务字段原样透传 */
  [k: string]: unknown;
};

/** 拖拽落点类型。替代旧的 TARGET_POSITION_TYPE 枚举。 */
export type DropKind = "before" | "after" | "into" | "root";

/**
 * flattenTree 产出的一行。**纯数据，不带任何 ref** —— 行的结构字段全部编进了
 * `key`，所以渲染层可以只读快照、不订阅共享 ref（见 flattenTree 注释）。
 */
export type TreeRow = {
  node: TreeNode;
  depth: number;
  parent: TreeNode | null;
  collapsed: boolean;
  key: string;
  /** 祖先缩进引导线：`guides[level] === true` 表示本行要在第 level 层画一条竖线。
   *  该层祖先后面还有兄弟，或它展开着且有 ≥2 个可见子节点（详见 flattenTree）。
   *  长度恒等于 depth。 */
  guides: boolean[];
};

/** 落点判定结果。 */
export type DropTarget = {
  kind: DropKind;
  /** 命中的行 _id；root 落点为 "" */
  id: string;
  /** 目标父节点 _id；根级为 "" */
  parentKey: string;
  index: number;
  /** 落回原位 / 未发生变化 */
  noop: boolean;
};

/**
 * 渲染层上报的命中信息。
 *
 * 命中测试（`closest("[data-tree-row-id]")` + `(y - rect.top) / rect.height`）留在
 * 渲染层，落点判定（before/after/into/root、目标父节点、index、环防护）留在 core。
 * 所以 `ui-vm` 里不会出现任何 `document` / `getBoundingClientRect`。
 */
export type DragHit = { id: string; ratio: number } | { root: true } | null;

/** moveNode / commitDrag 回传的移动信息。 */
export type TreeMoveInfo = {
  node: TreeNode;
  from: { parentKey: string; index: number };
  to: { parentKey: string; index: number };
  /** 移动后的整棵树（内部字段已剥离） */
  tree: TreeNode;
};

/** 拖拽落定后随 `TreeMoveInfo` 一起回传：目标父节点下移动后的完整子节点顺序。 */
export type TreeMoveContext = {
  /** 目标父节点 children 的 `_id`，按落定后的最终顺序（目录与叶子混编）。 */
  order: string[];
};

export type TreeCheckInfo = {
  node: TreeNode;
  checkedKeys: Set<string>;
  halfCheckedKeys: Set<string>;
};

export type TreeSelectInfo = {
  node: TreeNode;
  selectedKeys: Set<string>;
};

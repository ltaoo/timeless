/**
 * TreeCore —— 树形组件的纯逻辑层。
 *
 * 分层约定（与 apps/web-shadcn/src/components/tree.js 的提升版一致）：
 *
 *   source（外部数据） → prepared（克隆 + _id + _path） → root（叠加手动顺序） → rows（摊平）
 *
 * 三棵树分开的原因：外部数据一变，手动顺序自动作废（拖拽结果不能覆盖新数据），
 * 但 `_id` 必须是稳定的，所以 prepared 只在 setNodes 时重建、拖拽只换 root 那一层。
 *
 * 命中测试（DOM 几何）留在渲染层，落点判定留在 core：渲染层只上报
 * `{ id, ratio }` / `{ root: true }` / `null`，core 据此算出 before / after / into / root、
 * 目标父节点、index、noop，并做环防护。因此本文件不出现任何 document / 几何 API。
 *
 * 行只读快照：`rows` 里的每一行都是纯数据，所有结构字段都编进了 `key`
 * （见 flattenTree）。渲染层因此可以让行完全不订阅共享 ref —— 这是刻意的，
 * 行一旦订阅结构性 ref，被卸载时的同步 destroy 会从正在遍历的订阅者数组里把自己
 * splice 掉，让排在后面的订阅者整批被跳过。
 */

import { BaseDomain, Handler } from "@timeless/inner-base";

import {
  DragHit,
  DropKind,
  DropTarget,
  TreeCheckInfo,
  TreeMoveContext,
  TreeMoveInfo,
  TreeNode,
  TreeRow,
  TreeSelectInfo,
} from "./types";
import {
  assignIds,
  assignPaths,
  buildTreeFromPaths,
  cloneKeepIds,
  cloneNodes,
  collectDirectoryKeys,
  collectSubtreeKeys,
  countChildren,
  flattenTree,
  isDirectory,
  isTreeEmpty,
  locate,
  moveNode as moveNodeInTree,
  plainTree,
  remapCollapsedIds,
} from "./utils";

export * from "./types";
export * from "./utils";

enum Events {
  StateChange,
}

type TheTypesOfEvents = {
  [Events.StateChange]: TreeState;
};

export type TreeCoreProps = {
  /** 树数据：根节点，或根级 children 数组 */
  nodes?: TreeNode[] | TreeNode;
  /** 是否允许折叠（默认 true） */
  collapsible?: boolean;
  /** 是否允许拖拽排序（默认 false） */
  draggable?: boolean;
  /** 是否允许落在根级（根落点 / 根级兄弟旁；默认 true） */
  allowRootDrop?: boolean;
  /** 是否显示勾选框（默认 false） */
  checkable?: boolean;
  /** 多选（配合 checkable，默认 false） */
  multiple?: boolean;
  /** 父子联动勾选（默认 true） */
  checkChildNodesAuto?: boolean;
  /** 受控：展开的目录集合（初始值，之后用 expand / collapse 命令驱动） */
  expandedKeys?: Set<string>;
  /** 受控：勾选的节点集合（初始值） */
  checkedKeys?: Set<string>;
  /** 受控：选中的节点集合（初始值） */
  selectedKeys?: Set<string>;
  onExpand?: (key: string, expanded: boolean) => void;
  onCheck?: (key: string, checked: boolean, info: TreeCheckInfo) => void;
  onSelect?: (key: string, info: TreeSelectInfo) => void;
  onMove?: (info: TreeMoveInfo, context: TreeMoveContext) => void;
  onNodeClick?: (node: TreeNode) => void;
};

export type TreeState = {
  /** 当前展示的根节点（叠加了手动顺序） */
  nodes: TreeNode;
  /** 可见行（每次提交都是新数组） */
  rows: TreeRow[];
  collapsedKeys: Set<string>;
  checkedKeys: Set<string>;
  halfCheckedKeys: Set<string>;
  selectedKeys: Set<string>;
  /** 正在被拖起的节点 _id；未拖拽时为 null */
  draggingKey: string | null;
  /** 正在被拖起的节点；未拖拽时为 null */
  draggingNode: TreeNode | null;
  dropTarget: DropTarget | null;
  /** 是否处于拖拽中（行被拖起后为 true） */
  dragging: boolean;
};

type DragSession = {
  node: TreeNode;
  fromParentKey: string;
  fromIndex: number;
  /** 自己 + 全部后代的 _id（环防护） */
  subtreeKeys: Set<string>;
};

function normalizeSource(nodes: TreeNode[] | TreeNode | undefined): TreeNode {
  if (nodes && !Array.isArray(nodes) && Array.isArray(nodes.children)) {
    return nodes as TreeNode;
  }
  return {
    title: "",
    children: Array.isArray(nodes) ? nodes : [],
  };
}

/** 克隆 + 生成 _id / _path。只有这里会重算 _id，拖拽路径不走它。 */
function prepare(source: TreeNode): TreeNode {
  const children = cloneNodes(source.children);
  assignIds(children, "");
  assignPaths(children, "");
  return { ...source, children };
}

export class TreeCore extends BaseDomain<TheTypesOfEvents> {
  props: TreeCoreProps;

  collapsible: boolean;
  draggable: boolean;
  allowRootDrop: boolean;
  checkable: boolean;
  multiple: boolean;
  checkChildNodesAuto: boolean;

  private _source: TreeNode;
  private _prepared: TreeNode;
  private _manual: TreeNode | null = null;

  private _collapsed = new Set<string>();
  private _checked = new Set<string>();
  private _halfChecked = new Set<string>();
  private _selected = new Set<string>();
  private _rows: TreeRow[] = [];

  private _session: DragSession | null = null;
  private _dropTarget: DropTarget | null = null;

  constructor(props: TreeCoreProps = {}) {
    super({ unique_id: "TreeCore" });
    this.props = props;
    this.collapsible = props.collapsible !== false;
    this.draggable = props.draggable === true;
    this.allowRootDrop = props.allowRootDrop !== false;
    this.checkable = props.checkable === true;
    this.multiple = props.multiple === true;
    this.checkChildNodesAuto = props.checkChildNodesAuto !== false;

    this._source = normalizeSource(props.nodes);
    this._prepared = prepare(this._source);

    if (props.expandedKeys) {
      const all = collectDirectoryKeys(this._prepared.children);
      for (const key of all) {
        if (!props.expandedKeys.has(key)) this._collapsed.add(key);
      }
    }
    if (props.checkedKeys) this._checked = new Set(props.checkedKeys);
    if (props.selectedKeys) this._selected = new Set(props.selectedKeys);

    this._recompute();
  }

  get state(): TreeState {
    return {
      nodes: this._root(),
      rows: this._rows,
      collapsedKeys: this._collapsed,
      checkedKeys: this._checked,
      halfCheckedKeys: this._halfChecked,
      selectedKeys: this._selected,
      draggingKey: this._session ? (this._session.node._id as string) : null,
      draggingNode: this._session ? this._session.node : null,
      dropTarget: this._dropTarget,
      dragging: this._session !== null,
    };
  }

  onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
    return this.on(Events.StateChange, handler);
  }

  get rows(): TreeRow[] {
    return this._rows;
  }

  get nodes(): TreeNode {
    return this._root();
  }

  get collapsedKeys(): Set<string> {
    return this._collapsed;
  }

  // -------------------------------------------------------------------------
  // 数据
  // -------------------------------------------------------------------------

  /**
   * 换一棵树。_id 会重生成，所以折叠状态按 _path 搬到新 _id 上，手动顺序作废。
   */
  setNodes(nodes: TreeNode[] | TreeNode): void {
    const prev = this._prepared;
    this._source = normalizeSource(nodes);
    const next = prepare(this._source);
    this._prepared = next;
    this._manual = null;
    this._collapsed = remapCollapsedIds(
      prev.children,
      next.children,
      this._collapsed,
    );
    this._recompute();
  }

  /** 按扁平资源数组（`name` 里带 `/`）建树。 */
  setResources(resources: unknown): void {
    this.setNodes(buildTreeFromPaths(resources).children || []);
  }

  getRow(key: string): TreeRow | null {
    for (const row of this._rows) {
      if (row.node._id === key) return row;
    }
    return null;
  }

  getNode(key: string): TreeNode | null {
    const located = locate(this._root(), key);
    return located ? located.node : null;
  }

  toJSON(): TreeNode | null {
    return plainTree(this._root());
  }

  isTreeEmpty(): boolean {
    return isTreeEmpty(this._root());
  }

  // -------------------------------------------------------------------------
  // 展开 / 折叠
  // -------------------------------------------------------------------------

  expand(key: string): void {
    this._setCollapsed(key, false);
  }

  collapse(key: string): void {
    this._setCollapsed(key, true);
  }

  toggleExpand(key: string): void {
    this._setCollapsed(key, !this._collapsed.has(key));
  }

  expandAll(): void {
    if (this._collapsed.size === 0) return;
    this._collapsed = new Set();
    this._recompute();
  }

  collapseAll(): void {
    this._collapsed = collectDirectoryKeys(this._root().children);
    this._recompute();
  }

  private _setCollapsed(key: string, collapsed: boolean): void {
    if (!this.collapsible || !key) return;
    const node = this.getNode(key);
    if (!node || !isDirectory(node)) return;
    if (this._collapsed.has(key) === collapsed) return;
    const next = new Set(this._collapsed);
    if (collapsed) {
      next.add(key);
    } else {
      next.delete(key);
    }
    this._collapsed = next;
    this._recompute();
    if (this.props.onExpand) this.props.onExpand(key, !collapsed);
  }

  // -------------------------------------------------------------------------
  // 勾选
  // -------------------------------------------------------------------------

  /** `checked` 省略时取反。会递归整棵子树（checkChildNodesAuto）并重算半选。 */
  check(key: string, checked?: boolean): void {
    if (!this.checkable || !key) return;
    const node = this.getNode(key);
    if (!node || node.disabled) return;
    const next = checked === undefined ? !this._checked.has(key) : Boolean(checked);

    if (this.checkChildNodesAuto && isDirectory(node)) {
      for (const child_key of collectSubtreeKeys(node)) {
        if (next) {
          this._checked.add(child_key);
        } else {
          this._checked.delete(child_key);
        }
      }
    } else if (next) {
      this._checked.add(key);
    } else {
      this._checked.delete(key);
    }

    this._conductChecked();
    this._recomputeHalfChecked();
    this._emitState();
    if (this.props.onCheck) {
      this.props.onCheck(key, next, {
        node,
        checkedKeys: new Set(this._checked),
        halfCheckedKeys: new Set(this._halfChecked),
      });
    }
  }

  uncheckAll(): void {
    if (this._checked.size === 0) return;
    this._checked = new Set();
    this._recomputeHalfChecked();
    this._emitState();
  }

  // -------------------------------------------------------------------------
  // 选中
  // -------------------------------------------------------------------------

  select(key: string, multi?: boolean): void {
    if (!key) return;
    const node = this.getNode(key);
    if (!node || node.disabled) return;
    const use_multi = multi === undefined ? this.multiple : multi;
    if (use_multi) {
      if (this._selected.has(key)) {
        this._selected.delete(key);
      } else {
        this._selected.add(key);
      }
    } else {
      this._selected = new Set([key]);
    }
    this._emitState();
    if (this.props.onSelect) {
      this.props.onSelect(key, {
        node,
        selectedKeys: new Set(this._selected),
      });
    }
  }

  /** 行被点击：先发 onNodeClick，再选中，目录再顺带折叠切换。 */
  clickNode(key: string): void {
    const node = this.getNode(key);
    if (!node) return;
    if (this.props.onNodeClick) this.props.onNodeClick(node);
    if (node.disabled) return;
    this.select(key);
    if (isDirectory(node)) this.toggleExpand(key);
  }

  // -------------------------------------------------------------------------
  // 拖拽
  // -------------------------------------------------------------------------

  /** 指针越过 4px 阈值后由渲染层调用，开启一次拖拽会话。 */
  beginDrag(key: string): void {
    if (!this.draggable || !key) return;
    const located = locate(this._root(), key);
    if (!located || located.node.disabled) return;
    if (located.node.draggable === false) return;
    this._session = {
      node: located.node,
      fromParentKey: (located.parent && (located.parent._id as string)) || "",
      fromIndex: located.index,
      subtreeKeys: collectSubtreeKeys(located.node),
    };
    this._dropTarget = null;
    this._emitState();
  }

  /**
   * 渲染层只上报命中：`{ id, ratio }`（行内相对高度）/ `{ root: true }`（容器底部留白）
   * / `null`（没有落点）。落点判定与环防护都在这里。
   */
  updateDrag(hit: DragHit): void {
    const session = this._session;
    if (!session) return;
    this._dropTarget = this._resolveDrop(session, hit);
    this._emitState();
  }

  /** 返回真实的移动信息；落回原位 / 无落点 / 被环防护拒掉时返回 null。 */
  commitDrag(): TreeMoveInfo | null {
    const session = this._session;
    const target = this._dropTarget;
    this._session = null;
    this._dropTarget = null;
    if (!session) {
      this._emitState();
      return null;
    }
    const info = this._applyMove(
      session.node,
      session.fromParentKey,
      session.fromIndex,
      target,
    );
    // 移动换掉的是 `_manual` 那棵树，`rows` 必须跟着重算：只 emit 的话行还是旧顺序。
    if (info) {
      this._recompute();
    } else {
      this._emitState();
    }
    return info;
  }

  cancelDrag(): void {
    if (!this._session) return;
    this._session = null;
    this._dropTarget = null;
    this._emitState();
  }

  /** 编程式移动：把 `key` 移到 `parentKey`（"" = 根级）的第 `index` 位。 */
  moveNode(
    key: string,
    parentKey: string,
    index: number,
  ): TreeMoveInfo | null {
    const located = locate(this._root(), key);
    if (!located) return null;
    const info = this._applyMove(
      located.node,
      (located.parent && (located.parent._id as string)) || "",
      located.index,
      { parentKey, index, noop: false },
    );
    if (info) {
      this._recompute();
    } else {
      this._emitState();
    }
    return info;
  }

  private _resolveDrop(session: DragSession, hit: DragHit): DropTarget | null {
    if (!hit) return null;
    const root = this._root();

    if ("root" in hit) {
      if (!this.allowRootDrop) return null;
      const last = (root.children || []).length - 1;
      return {
        kind: "root",
        id: "",
        parentKey: "",
        index: last + 1,
        noop: session.fromParentKey === "" && session.fromIndex === last,
      };
    }

    const id = hit.id;
    // 环防护：落在自己或自己后代的整行上都拒绝，不能把父节点拖进自己的子树。
    if (!id || session.subtreeKeys.has(id)) return null;
    const located = locate(root, id);
    if (!located) return null;

    const is_dir = isDirectory(located.node);
    let kind: DropKind;
    if (hit.ratio < 0.25) {
      kind = "before";
    } else if (hit.ratio > 0.75) {
      kind = "after";
    } else {
      // 非目录行的中间区降级为 after。
      kind = is_dir ? "into" : "after";
    }

    if (kind === "into") {
      const last = (located.node.children || []).length - 1;
      return {
        kind,
        id,
        parentKey: id,
        index: last + 1,
        // 已经在该目录最后一位，等于没动。
        noop: session.fromParentKey === id && session.fromIndex === last,
      };
    }

    const parent = located.parent;
    const parent_key = (parent && (parent._id as string)) || "";
    // 落在根级兄弟旁 = 落在「全部」旁边。allowRootDrop 关掉时同样挡掉。
    if (parent_key === "" && !this.allowRootDrop) return null;
    const index = kind === "after" ? located.index + 1 : located.index;
    return {
      kind,
      id,
      parentKey: parent_key,
      index,
      // 同一个父节点下，落回自己的位置（前一位 / 后一位）都算没动。
      noop:
        parent_key === session.fromParentKey &&
        (index === session.fromIndex || index === session.fromIndex + 1),
    };
  }

  private _applyMove(
    node: TreeNode,
    fromParentKey: string,
    fromIndex: number,
    target: { parentKey: string; index: number; noop: boolean } | null,
  ): TreeMoveInfo | null {
    if (!target || target.noop) return null;

    // 必须换一棵新树：rows 靠 root 的引用变化才会重算，原地改 children 不触发刷新。
    // 副本要从当前 root（叠加了手动顺序）拷，而不是 prepared（原始构建顺序），
    // 否则连续第二次拖拽会把上一次的顺序整个丢掉。
    const current = this._root();
    const next_root: TreeNode = {
      ...current,
      children: cloneKeepIds(current.children),
    };
    const dest_parent = target.parentKey
      ? locate(next_root, target.parentKey)?.node
      : next_root;
    const moved = locate(next_root, node._id as string)?.node;
    if (!dest_parent || !moved) return null;
    if (!moveNodeInTree(next_root, moved, dest_parent, target.index)) {
      return null;
    }
    assignPaths(next_root.children, "");
    this._manual = next_root;

    // 落进折叠的目录里会让节点凭空消失，松手时顺手把它展开。
    if (target.parentKey && this._collapsed.has(target.parentKey)) {
      const next = new Set(this._collapsed);
      next.delete(target.parentKey);
      this._collapsed = next;
    }

    const info: TreeMoveInfo = {
      node: moved,
      from: { parentKey: fromParentKey, index: fromIndex },
      to: {
        parentKey: (dest_parent === next_root
          ? ""
          : (dest_parent._id as string)) || "",
        index: (dest_parent.children || []).indexOf(moved),
      },
      tree: plainTree(next_root) as TreeNode,
    };
    // dest_parent 此刻已在作用域内，是唯一能算出「目标父节点移动后完整顺序」的地方。
    const order = (dest_parent.children || []).map((child) =>
      String(child._id),
    );
    if (this.props.onMove) this.props.onMove(info, { order });
    return info;
  }

  /** 供渲染层展示的落点描述（不涉及 DOM）。 */
  describeDropTarget(): string {
    const target = this._dropTarget;
    if (!target || target.noop) return "";
    if (target.kind === "root") return "根级末尾";
    if (target.kind === "into") {
      return `${this.getNode(target.id)?.title ?? ""} 之内`;
    }
    const row = this.getRow(target.id);
    return `${row ? (row.node.title ?? "") : ""} ${
      target.kind === "before" ? "之前" : "之后"
    }`;
  }

  countChildren(node: TreeNode): number {
    return countChildren(node);
  }

  // -------------------------------------------------------------------------
  // 内部
  // -------------------------------------------------------------------------

  private _root(): TreeNode {
    return this._manual || this._prepared;
  }

  /** 重算 rows / 半选 / 清理失效键，然后广播。每次提交 rows 都是新数组。 */
  private _recompute(): void {
    const root = this._root();
    this._rows = flattenTree(root.children, this._collapsed, 0, []);
    this._recomputeHalfChecked();
    this._pruneKeys(root);
    this._emitState();
  }

  /**
   * 自底向上传导勾选：子节点全勾 → 父目录跟着勾上；有一个没勾 → 父目录取消勾选。
   * 空目录不参与传导（没有子节点可依据），只保留它自己的手动勾选态。
   *
   * 只在 checkChildNodesAuto 下跑。向下传导（勾目录带动子树）由 check 自己完成，
   * 这里补的是「取消一个子节点后父目录也要跟着取消」这半程。
   */
  private _conductChecked(): void {
    if (!this.checkChildNodesAuto) return;
    const walk = (node: TreeNode): boolean => {
      if (!isDirectory(node)) return this._checked.has(node._id as string);
      let all = true;
      for (const child of node.children || []) {
        if (!walk(child)) all = false;
      }
      const id = node._id as string;
      if (all && (node.children || []).length > 0) {
        this._checked.add(id);
      } else {
        this._checked.delete(id);
      }
      return all;
    };
    for (const child of this._root().children || []) walk(child);
  }

  /**
   * 自底向上重算半选：子树不是全选但有选中 → 半选。
   * 目录自身的勾选也参与（父子联动下勾目录会连自己也勾上）。
   */
  private _recomputeHalfChecked(): void {
    const half = new Set<string>();
    const walk = (node: TreeNode): { all: boolean; some: boolean } => {
      if (!isDirectory(node)) {
        const on = this._checked.has(node._id as string);
        return { all: on, some: on };
      }
      let all = true;
      let some = false;
      for (const child of node.children || []) {
        const result = walk(child);
        all = all && result.all;
        some = some || result.some;
      }
      const self = this._checked.has(node._id as string);
      const node_all = self && all;
      const node_some = self || some;
      if (!node_all && node_some) half.add(node._id as string);
      return { all: node_all, some: node_some };
    };
    for (const child of this._root().children || []) walk(child);
    this._halfChecked = half;
  }

  /** 数据换代后，指向已不存在节点的键要清掉，否则会一直算进半选。 */
  private _pruneKeys(root: TreeNode): void {
    const alive = new Set<string>();
    const walk = (nodes: TreeNode[] | undefined) => {
      for (const node of nodes || []) {
        alive.add(node._id as string);
        if (isDirectory(node)) walk(node.children);
      }
    };
    walk(root.children);
    if (this._checked.size) {
      for (const key of this._checked) {
        if (!alive.has(key)) this._checked.delete(key);
      }
    }
    if (this._halfChecked.size) {
      for (const key of this._halfChecked) {
        if (!alive.has(key)) this._halfChecked.delete(key);
      }
    }
    if (this._selected.size) {
      for (const key of this._selected) {
        if (!alive.has(key)) this._selected.delete(key);
      }
    }
    if (this._collapsed.size) {
      for (const key of this._collapsed) {
        if (!alive.has(key)) this._collapsed.delete(key);
      }
    }
  }

  private _emitState(): void {
    this.emit(Events.StateChange, this.state);
  }
}

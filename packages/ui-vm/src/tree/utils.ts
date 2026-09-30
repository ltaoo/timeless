/**
 * Tree 的纯数据函数。全部与 DOM / 响应式无关，可在任何宿主里跑。
 *
 * 从 apps/web-shadcn/src/components/tree.js 提升而来，做了两处泛化：
 *   1) 目录判定改成「带 children 数组」，不再读业务字段 `type`；
 *   2) 显示名读 `title`（缺省回落到 payload 的 name / display_name …）。
 *
 * 保留的核心约定：
 *   - `_id`（`d0/f1` 这种稳定 id）作折叠键 / 行标识 / 拖拽命中标识。拖拽会改路径，
 *     所以 _id 必须比 _path 稳：只在「构建 / 重建一棵树」时生成，拖拽后不要重算。
 *   - `_path`（`a/b/c`）是折叠状态跨数据重建时唯一的搬运锚点。
 */

import { DropTarget, DropKind, TreeRow, TreeNode } from "./types";

export function noop() {}

/** 目录 = 非显式 isLeaf，且有 children 数组（空数组也算目录）。 */
export function isDirectory(node: TreeNode | null | undefined): boolean {
  return Boolean(node) && !node!.isLeaf && Array.isArray(node!.children);
}

/** 节点的显示名：title → name → key。 */
export function nodeLabel(node: TreeNode | null | undefined): string {
  if (!node) return "";
  const raw = node.title ?? (node as Record<string, unknown>).name ?? node.key;
  return raw === undefined || raw === null ? "" : String(raw);
}

/** 目录在前、叶子在后，名称按 localeCompare({ numeric: true })。 */
function nodeCompare(a: TreeNode, b: TreeNode): number {
  const a_dir = isDirectory(a);
  const b_dir = isDirectory(b);
  if (a_dir !== b_dir) return a_dir ? -1 : 1;
  return nodeLabel(a).localeCompare(nodeLabel(b), undefined, {
    numeric: true,
    sensitivity: "base",
  });
}

/** 递归按 nodeCompare 排序；只在调用方显式要求时跑（顺序默认就是 children 顺序）。 */
export function sortTree(nodes: TreeNode[] | undefined): TreeNode[] | undefined {
  if (!Array.isArray(nodes)) return nodes;
  nodes.sort(nodeCompare);
  for (const node of nodes) {
    if (isDirectory(node) && node.children) {
      sortTree(node.children);
    }
  }
  return nodes;
}

/** 子树里的叶子数（目录本身不计）。 */
export function countFiles(node: TreeNode | null | undefined): number {
  if (!node) return 0;
  if (!isDirectory(node)) return 1;
  return (node.children || []).reduce(
    (count, child) => count + countFiles(child),
    0,
  );
}

/** 直接子节点数。 */
export function countChildren(node: TreeNode | null | undefined): number {
  if (!node || !isDirectory(node)) return 0;
  return (node.children || []).length;
}

/**
 * 给整棵树生成稳定 _id：显式 `key` 优先，否则 `父_id/类型前缀+同级下标`，例如 "d0/d1/f2"。
 *
 * 只在「构建 / 重建一棵树」时调用。拖拽调整顺序后不要再调用（_id 要跟着节点走，
 * 下标变了也不重算），否则折叠状态与行的 key 会一起失稳。
 */
export function assignIds(
  nodes: TreeNode[] | undefined,
  prefix: string,
): TreeNode[] | undefined {
  if (!Array.isArray(nodes)) return nodes;
  nodes.forEach((node, index) => {
    const tag = isDirectory(node) ? "d" : "f";
    const fallback = prefix ? `${prefix}/${tag}${index}` : `${tag}${index}`;
    node._id =
      node.key === undefined || node.key === null || node.key === ""
        ? fallback
        : String(node.key);
    if (isDirectory(node) && node.children) {
      assignIds(node.children, node._id);
    }
  });
  return nodes;
}

/** 重算 _path：用于 title 提示、外部回传路径，以及折叠状态的跨重建搬运。 */
export function assignPaths(
  nodes: TreeNode[] | undefined,
  prefix: string,
): void {
  for (const node of nodes || []) {
    const label = nodeLabel(node);
    node._path = prefix ? `${prefix}/${label}` : label;
    if (isDirectory(node) && node.children) {
      assignPaths(node.children, node._path);
    }
  }
}

/** 深拷贝并剥掉内部字段（_id / _path），供 assignIds / assignPaths 重新标记。 */
export function cloneNodes(nodes: TreeNode[] | undefined): TreeNode[] {
  return (nodes || []).map((node) => {
    const copy: TreeNode = { ...node };
    delete copy._id;
    delete copy._path;
    if (Array.isArray(node.children)) {
      copy.children = cloneNodes(node.children);
    }
    return copy;
  });
}

/**
 * 深拷贝但保留 _id / _path。
 * 拖拽提交时要换一棵新树（rows 靠引用变化才会重算），但 _id 必须稳定，
 * 所以这里不能用 cloneNodes。
 */
export function cloneKeepIds(nodes: TreeNode[] | undefined): TreeNode[] {
  return (nodes || []).map((node) => {
    const copy: TreeNode = { ...node };
    if (Array.isArray(node.children)) {
      copy.children = cloneKeepIds(node.children);
    }
    return copy;
  });
}

/**
 * 把树摊平成「可见行」数组，折叠的目录不展开其子树。
 *
 * 这里**不排序**：children 的数组顺序就是用户看到、也是拖出来的顺序。
 *
 * 每一行都是纯数据。渲染器对同 key 只 move、不重跑 render，所以凡是「同一个 key
 * 下可能变化」的东西都必须编进 key，否则 DOM 会留着旧内容：
 *   - depth：换层级后缩进不会更新
 *   - collapsed（目录）：箭头与子行展开状态不会更新
 *   - childrenCount：拖进来一个子节点后「N 项」不更新
 *   - _path：同级换父节点后 title 不更新
 *   - guides：兄弟顺序变化后层级引导线该出现 / 消失却不重绘（见下）
 * _id 在树内唯一，这些字段只是让 key 在内容变化时失效，不会互相撞车。
 *
 * `guides` 是「行只读快照」不变量的延续：拖拽重排只换 children 顺序，_id / depth /
 * collapsed / count / _path 全都不变，只有 guides 会变。key 全程只作身份标识
 * （Map 键 / `data-list-view-key` / `Object.is` 比较），从不被解析或 split，
 * 所以把 mask 追加在末尾是安全的。
 *
 * 这条约定是整个 Tree 能「行只读快照、不订阅结构性 ref」的前提，不是实现细节。
 */
export function flattenTree(
  nodes: TreeNode[] | undefined,
  collapsed: Set<string>,
  depth: number,
  output: TreeRow[],
  parent?: TreeNode | null,
): TreeRow[] {
  // 外部传 depth > 0 的潜在调用：补齐祖先链（这些层的引导线信息无从得知，按不画处理）。
  const continues = new Array<boolean>(depth).fill(false);
  return walkTree(nodes, collapsed, depth, output, parent, continues);
}

/**
 * flattenTree 的递归实现，多带一条 `continues` —— 祖先链上「该层要不要画线」。
 *
 * 某行第 level 层的线只在 `continues[level]` 为真时才画。判据两条，满足其一即画：
 *   1. 该层祖先后面还有兄弟 —— 线要从这个祖先继续往下连到兄弟；
 *   2. 该层祖先展开着、且可见子节点 ≥2 —— 线要把它的子节点连起来。
 * 两条都不满足（末位、且只有一个子节点）就不画：那种线只有一行高、上下都不接，
 * 正是要避免的飘线。
 *
 * 判据 2 不能省：只有唯一根的树（阅读端的侧栏就是「全部」一棵）第 1 条永远不成立，
 * 少了它就一根线都不出现。
 */
function walkTree(
  nodes: TreeNode[] | undefined,
  collapsed: Set<string>,
  depth: number,
  output: TreeRow[],
  parent: TreeNode | null | undefined,
  continues: boolean[],
): TreeRow[] {
  const list = nodes || [];
  for (let index = 0; index < list.length; index += 1) {
    const node = list[index];
    const is_dir = isDirectory(node);
    const is_collapsed = is_dir && collapsed.has(node._id as string);
    const count = (node.children || []).length;
    const guides = continues.slice();
    output.push({
      node,
      depth,
      parent: parent || null,
      collapsed: is_collapsed,
      guides,
      key: `${node._id}@${depth}@${is_collapsed ? 1 : 0}@${count}@${
        node._path || nodeLabel(node)
      }@${guides.map((on) => (on ? 1 : 0)).join("")}`,
    });
    if (is_dir && !is_collapsed) {
      walkTree(
        node.children,
        collapsed,
        depth + 1,
        output,
        node,
        continues.concat(index < list.length - 1 || (node.children || []).length > 1),
      );
    }
  }
  return output;
}

/**
 * 把折叠状态从旧树搬到新树：按 _path 对应。
 * 外部数据导致整棵树重建时 _id 会重生成，只能靠 _path 找回折叠的目录。
 */
export function remapCollapsedIds(
  old_nodes: TreeNode[] | undefined,
  new_nodes: TreeNode[] | undefined,
  set: Set<string>,
): Set<string> {
  const next = new Set<string>();
  if (!set || set.size === 0) return next;
  const id_to_path = new Map<string, string | undefined>();
  const walk_old = (nodes: TreeNode[] | undefined) => {
    for (const node of nodes || []) {
      id_to_path.set(node._id as string, node._path);
      if (isDirectory(node) && node.children) walk_old(node.children);
    }
  };
  walk_old(old_nodes);
  const collapsed_paths = new Set<string>();
  for (const id of set) {
    const path = id_to_path.get(id);
    if (path) collapsed_paths.add(path);
  }
  const walk_new = (nodes: TreeNode[] | undefined) => {
    for (const node of nodes || []) {
      if (node._path && collapsed_paths.has(node._path)) {
        next.add(node._id as string);
      }
      if (isDirectory(node) && node.children) walk_new(node.children);
    }
  };
  walk_new(new_nodes);
  return next;
}

/** 收集 node 及其所有后代的 _id（拖拽环防护 + 父子联动勾选）。 */
export function collectSubtreeKeys(
  node: TreeNode | null | undefined,
  output?: Set<string>,
): Set<string> {
  const set = output || new Set<string>();
  if (!node) return set;
  set.add(node._id as string);
  if (isDirectory(node)) {
    for (const child of node.children || []) collectSubtreeKeys(child, set);
  }
  return set;
}

/** 整棵树里所有目录的 _id（collapseAll 用）。 */
export function collectDirectoryKeys(
  nodes: TreeNode[] | undefined,
  output?: Set<string>,
): Set<string> {
  const set = output || new Set<string>();
  for (const node of nodes || []) {
    if (isDirectory(node)) {
      set.add(node._id as string);
      collectDirectoryKeys(node.children, set);
    }
  }
  return set;
}

/** 按 _id 定位节点，返回 { parent, index, node, ancestors }（ancestors 不含自身）。 */
export function locate(
  root: TreeNode | null | undefined,
  id: string,
): { parent: TreeNode; index: number; node: TreeNode; ancestors: TreeNode[] } | null {
  const ancestors: TreeNode[] = [];
  let found: {
    parent: TreeNode;
    index: number;
    node: TreeNode;
    ancestors: TreeNode[];
  } | null = null;
  const walk = (nodes: TreeNode[] | undefined, parent: TreeNode) => {
    if (found) return;
    const list = nodes || [];
    for (let index = 0; index < list.length; index += 1) {
      const node = list[index];
      if (node._id === id) {
        found = { parent, index, node, ancestors: ancestors.slice() };
        return;
      }
      if (isDirectory(node) && node.children) {
        ancestors.push(node);
        walk(node.children, node);
        ancestors.pop();
      }
    }
  };
  if (!root) return null;
  walk(root.children, root);
  return found;
}

/**
 * 把 node 移到 to_parent 的第 to_index 位。返回是否真的产生了位移。
 *
 * 同父下移要先 to_index -= 1：摘除自己之后，目标下标左边的兄弟会左移一位。
 */
export function moveNode(
  root: TreeNode | null | undefined,
  node: TreeNode | null | undefined,
  to_parent: TreeNode | null | undefined,
  to_index?: number,
): boolean {
  if (!root || !node || !to_parent) return false;
  const from = locate(root, node._id as string);
  if (!from) return false;
  // 不能移到自己或自己的后代里，否则整棵子树会从树里脱钩。
  // 注意用「自己的子树」而不是「自己的祖先」——祖先里包含父节点，
  // 而落到父节点下正是同级重排，必须放行。
  if (collectSubtreeKeys(node).has(to_parent._id as string)) return false;
  let index = Number.isFinite(to_index)
    ? (to_index as number)
    : (to_parent.children || []).length;
  if (from.parent === to_parent && from.index < index) {
    index -= 1;
  }
  index = Math.max(0, Math.min(index, (to_parent.children || []).length));
  if (from.parent === to_parent && from.index === index) return false;
  from.parent.children!.splice(from.index, 1);
  to_parent.children!.splice(index, 0, node);
  return true;
}

/** 树是否为空（没有根级节点）。 */
export function isTreeEmpty(root: TreeNode | null | undefined): boolean {
  return !root || !Array.isArray(root.children) || root.children.length === 0;
}

/** 供外部展示用：剥掉 _id / _path 等内部字段，只留结构与业务字段。 */
export function plainTree(node: TreeNode | null | undefined): TreeNode | null {
  if (!node) return null;
  const copy: TreeNode = { ...node };
  delete copy._id;
  delete copy._path;
  if (Array.isArray(node.children)) {
    copy.children = node.children.map((child) => plainTree(child) as TreeNode);
  }
  return copy;
}

function defaultLabel(resource: unknown, index: number): string {
  if (resource && typeof resource === "object") {
    const record = resource as Record<string, unknown>;
    const raw =
      record.title ??
      record.name ??
      record.display_name ??
      record.filename ??
      record.file_name;
    if (raw !== undefined && raw !== null && raw !== "") return String(raw);
  }
  return `资源 ${index + 1}`;
}

/**
 * 按 `name` 里的 `/` 拆名建树。
 *
 * 接受两种输入：
 *  - 扁平资源数组（每项带 `name` / `title` 这类含 `/` 的字段）
 *  - 预览对象 `{ tree, resources }`（兼容旧调用）
 */
export function buildTreeFromPaths(
  input: unknown,
  options?: { label?: (resource: any, index: number) => string },
): TreeNode {
  if (input && !Array.isArray(input)) {
    const record = input as Record<string, unknown>;
    if (record.tree && typeof record.tree === "object") {
      return record.tree as TreeNode;
    }
    if (Array.isArray(record.resources)) {
      return buildTreeFromPaths(record.resources, options);
    }
    return { title: "", children: [] };
  }

  const resources = Array.isArray(input) ? input : [];
  const root: TreeNode = { title: "", children: [] };

  resources.forEach((resource, index) => {
    const label = options?.label
      ? options.label(resource, index)
      : defaultLabel(resource, index);
    const parts = String(label)
      .split("/")
      .filter(Boolean);
    const file_name = parts.pop() || String(label);
    let parent = root;

    parts.forEach((part) => {
      let directory = (parent.children || []).find((node) => {
        return isDirectory(node) && nodeLabel(node) === part;
      });
      if (!directory) {
        directory = { title: part, children: [] };
        parent.children!.push(directory);
      }
      parent = directory;
    });
    parent.children!.push({
      ...(resource && typeof resource === "object" ? resource : {}),
      title: file_name,
      isLeaf: true,
    });
  });
  return root;
}

/** 判定落点是否需要「展开目标目录」（into 且当前折叠）。 */
export function shouldExpandTarget(target: DropTarget | null): string {
  if (!target || target.noop) return "";
  if (target.kind !== "into") return "";
  return target.id;
}

/** 落点类型的中文描述，供渲染层的 hint 文案复用。 */
export function describeDrop(kind: DropKind): string {
  if (kind === "before") return "之前";
  if (kind === "after") return "之后";
  if (kind === "into") return "之内";
  return "根级末尾";
}

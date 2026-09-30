/**
 * TreePrimitive —— Tree 的渲染层（形状层）。
 *
 * 分层：`TreeCore`（`@timeless/inner-vm`）管数据与交互语义，这里只管 DOM 形状与
 * 指针会话，样式库只提供类名 + CSS。所以本文件里没有任何业务字段
 * （`type` / `size` / 文件名后缀）——那些由调用方通过 `renderRow` / `renderIcon` /
 * `renderMeta` 注入。
 *
 * ## 三条不能违反的约定
 *
 * 1. **行只订阅「纯样式」ref。**`flattenTree` 把行的结构字段（depth / collapsed /
 *    子节点数 / _path）全编进了 key，所以行可以只读快照、完全不订阅结构性 ref。
 *    这是必须的：`ref.notify` / `computed._notify` 都是**直接遍历订阅者数组**，行被
 *    卸载时的同步 `destroy` 会 `splice` 掉自己，让排在后面的订阅者整批被跳过 ——
 *    表现为「折叠全部」后部分目录的箭头再也不跟着变。
 *    因此 `Root` 把 store 状态镜像成几个 ref，并且**严格按顺序**赋值：
 *    先 `state_`（它会触发虚拟列表重建 / 卸载行），再 `dragging_node_` /
 *    `drop_target_` / `checked_` / `half_checked_` / `selected_`。后者的 notify 循环里
 *    绝不会发生卸载，行订阅它们才是安全的。
 *
 * 2. **不用手搓 `{t:"view",...}` 对象**（`DOMView.render()` 读 `elm.children` /
 *    `elm.state`，手搓对象会被丢掉）。
 *
 * 3. **`classNames([...])` 立刻调用**，响应式元素写在数组里 —— 它返回
 *    `ClassNameRef`，包进 `computed()` 会变成 `DerivedRef<ClassNameRef>`，primitive
 *    里 `cls.value.split(" ")` 直接抛 TypeError。
 *
 * ## 命中测试在这里，落点判定在 core
 *
 * 渲染层只做 `closest("[data-tree-row-id]")` 与 `(y - rect.top) / rect.height`，然后
 * `store.updateDrag({ id, ratio })`；before / after / into / root、目标父节点、
 * index、noop、环防护全在 core。`ui-vm` 里因此不会出现 `document` /
 * `getBoundingClientRect`。
 *
 * ## 已知边界
 *
 * 拖拽期间**不做边缘自动滚动**（刻意如此：自动滚动会让被拖的行或落点行被虚拟列表
 * 卸载）。缓解手段是列表底部的留白落点带（拖进去 = 移到根级末尾）与 `expandAll()`。
 */

import { isDirectory, nodeLabel, TreeCore } from "@timeless/inner-vm";
import type {
  DropTarget,
  DragHit,
  TreeNode,
  TreeRow,
  TreeState,
} from "@timeless/inner-vm";

import {
  classNames,
  computed,
  derive,
  Fragment,
  Icon,
  ListenerManager,
  ListViewV2,
  Portal,
  ref,
  refobj,
  Show,
  View,
} from "../core";
import type {
  ClassNameRef,
  DerivedRef,
  Ref,
  RefObject,
  TimelessElement,
  ViewChildren,
  ViewProps,
} from "../core";

// ---------------------------------------------------------------------------
// 常量
// ---------------------------------------------------------------------------

/** 指针越过这个位移才从「点击」升级为「拖拽」。 */
const DRAG_THRESHOLD_PX = 4;
/** 每层缩进 px。 */
const DEFAULT_INDENT = 18;
/** 行的初始高度估值（挂载后由 ResizeObserver 实测回填）。 */
const DEFAULT_ROW_HEIGHT = 28;
/** 列表底部留白，是「移到根级末尾」唯一的落点区。 */
const DEFAULT_DROP_ROOT_HEIGHT = 40;
/** 悬停折叠目录中间区多久后自动展开。 */
const DEFAULT_AUTO_EXPAND_MS = 600;
/** 缩进上限，避免深层级把标题挤没。 */
const MAX_INDENT_PX = 180;

// ---------------------------------------------------------------------------
// 类名契约
// ---------------------------------------------------------------------------

/**
 * 类名由样式库提供，primitive 不内置任何默认值 —— 同一页加载多套样式库时，
 * 内置默认类名会互相串味。
 *
 * 状态类（`rowLifted` / `rowInto` / `lineBefore` …）的**名字**也由库决定，
 * primitive 只负责在对应状态下把它们拼上去。
 */
export type TreeClassNames = {
  root?: string | Ref<string> | DerivedRef<string> | ClassNameRef;
  scroll?: string | Ref<string> | DerivedRef<string> | ClassNameRef;
  /** 行：常驻基础类 */
  row?: string;
  /** 行：被拖起的原位影子 */
  rowLifted?: string;
  /** 行：落点是「移入本行（目录）」 */
  rowInto?: string;
  /** 行：落点是「放在本行之前 / 之后」（行本身的高亮） */
  rowBefore?: string;
  rowAfter?: string;
  /** 行：命中落点的目录 */
  rowSelected?: string;
  rowDisabled?: string;
  /** 折叠箭头容器 / 箭头图标 */
  caret?: string;
  caretIcon?: string;
  /** 图标容器 */
  icon?: string;
  /** 标题 */
  title?: string;
  /** 右侧 meta（子项数 / 体积） */
  meta?: string;
  /** 层级引导线：每层缩进槽里的一段竖线（绝对定位，位置由 primitive 算）。 */
  guide?: string;
  /** 落点指示线：基础类 + before / after 两种激活态。 */
  line?: string;
  lineBefore?: string;
  lineAfter?: string;
  /** 勾选框：容器 + 勾选 / 半选两个状态类 + 方框 + 勾 */
  checkbox?: string;
  checkboxChecked?: string;
  checkboxHalf?: string;
  checkboxBox?: string;
  checkboxIndicator?: string;
  /** 跟手浮层 */
  ghost?: string;
  ghostTitle?: string;
  empty?: string;
  hint?: string;
};

/** 渲染层共享的拖拽 / 勾选态。见文件头「行只订阅纯样式 ref」。 */
export type TreeGhostBox = {
  x: number;
  y: number;
  offsetX: number;
  offsetY: number;
  width: number;
  height: number;
};

export type TreeClickGuard = {
  /** 紧跟拖拽的那一次 click 是否为「不该处理」的。 */
  consume(): boolean;
  /** 拖拽结束时置位；用一个 `setTimeout(0)` 复位。 */
  arm(): void;
  reset(): void;
};

export type TreeRuntime = {
  dragging_node_: Ref<TreeNode | null>;
  drop_target_: Ref<DropTarget | null>;
  checked_: Ref<Set<string>>;
  half_checked_: Ref<Set<string>>;
  selected_: Ref<Set<string>>;
  /**
   * `refobj` 造的可写对象 ref。
   * 声明成 `RefObject` 是因为框架把 `refObject()` 的返回值标成了内部
   * `TimelessRefObject`（少了 `eq` / `getDeps` 等 `Ref` 字段），无法直接赋给
   * 任何 `Ref` 形状 —— 但运行时就是同一份对象，`derive` 只用 `value` + `subscribe`。
   */
  ghost_: RefObject<TreeGhostBox>;
  /**
   * `ghostRow` 模式下被拖行起拖瞬间的 DOM 快照（见 `snapshot_row`）。
   * 不是 ref：一次拖拽内有效，`reset_session` 清空，浮层挂载时读一次即用。
   */
  ghost_copy: HTMLElement | null;
  click_guard: TreeClickGuard;
};

export type TreeVisualState = {
  lifted: boolean;
  before: boolean;
  after: boolean;
  into: boolean;
};

// ---------------------------------------------------------------------------
// runtime
// ---------------------------------------------------------------------------

/**
 * 拖拽结束后浏览器会同步补一个 click —— 不吞掉就会顺带折叠/展开行。
 *
 * 置位后立刻排一个 `setTimeout(0)` 复位：click 与 pointerup 在同一个任务里，
 * 必然先于定时器回调执行，所以只影响紧跟拖拽的那一次 click。若把复位交给
 * 「下一次行内 onClick」，拖到行外松手时那次 click 不会到达行，标志位就一直挂着，
 * 会吞掉用户下一次正常的点击。
 */
function createClickGuard(): TreeClickGuard {
  let suppress = false;
  let timer: ReturnType<typeof setTimeout> | null = null;
  return {
    consume() {
      if (!suppress) return false;
      suppress = false;
      return true;
    },
    arm() {
      suppress = true;
      if (timer !== null) clearTimeout(timer);
      timer = setTimeout(() => {
        timer = null;
        suppress = false;
      }, 0);
    },
    reset() {
      suppress = false;
      if (timer !== null) {
        clearTimeout(timer);
        timer = null;
      }
    },
  };
}

export function createTreeRuntime(): TreeRuntime {
  return {
    dragging_node_: ref<TreeNode | null>(null),
    drop_target_: ref<DropTarget | null>(null),
    checked_: ref<Set<string>>(new Set()),
    half_checked_: ref<Set<string>>(new Set()),
    selected_: ref<Set<string>>(new Set()),
    ghost_: refobj({
      x: 0,
      y: 0,
      offsetX: 0,
      offsetY: 0,
      width: 0,
      height: 0,
    }) as unknown as RefObject<TreeGhostBox>,
    ghost_copy: null,
    click_guard: createClickGuard(),
  };
}

/**
 * 一个 store 对应一份渲染态。`Root` / `Scroll` / `Row` 都按 store 取，
 * 这样样式库可以按需组合各槽位，不必层层透传 runtime。
 */
const runtimes = new WeakMap<TreeCore, TreeRuntime>();

export function getTreeRuntime(store: TreeCore): TreeRuntime {
  let runtime = runtimes.get(store);
  if (!runtime) {
    runtime = createTreeRuntime();
    runtimes.set(store, runtime);
  }
  return runtime;
}

/** 只在内容真的变了才 notify —— 结构性变更时这几个集合通常没变，白 notify 没意义。 */
function assignSet(target: Ref<Set<string>>, next: Set<string>): void {
  const current = target.value;
  if (current.size === next.size) {
    let same = true;
    for (const key of next) {
      if (!current.has(key)) {
        same = false;
        break;
      }
    }
    if (same) return;
  }
  target.as(new Set(next));
}

function visualState(
  target: DropTarget | null,
  dragging: TreeNode | null,
  id: string,
  is_dir: boolean,
): TreeVisualState {
  const active = Boolean(target && !target.noop && target.id === id);
  return {
    lifted: Boolean(dragging && String(dragging._id) === id),
    before: Boolean(active && target && target.kind === "before"),
    after: Boolean(active && target && target.kind === "after"),
    into: Boolean(active && target && target.kind === "into" && is_dir),
  };
}

/** 落点对应的显示名（供 hint / 浮层文案用）。 */
function targetLabel(store: TreeCore, target: DropTarget | null): string {
  if (!target) return "";
  if (target.kind === "root") return "根级末尾";
  const node = store.getNode(target.id);
  return node ? nodeLabel(node) : "";
}

/** 落点是否要求「展开目标目录」；要求时返回它的 _id。 */
export function shouldExpandTarget(target: DropTarget | null): string {
  if (!target || target.noop || target.kind !== "into") return "";
  return target.id;
}

// ---------------------------------------------------------------------------
// Row 及其零件
// ---------------------------------------------------------------------------

export type TreeRowProps = {
  store: TreeCore;
  runtime: TreeRuntime;
  row: TreeRow;
  index?: number;
  classes?: TreeClassNames;
  /** 每层缩进 px */
  indent?: number;
  /** 是否渲染折叠箭头 */
  collapsible?: boolean;
  /** 目录 / 叶子图标；不传用 `folder` / `file` */
  renderIcon?: (node: TreeNode, is_dir: boolean) => ViewChildren;
  /** 右侧 meta；不传则目录显示「N 项」、叶子留空 */
  renderMeta?: (node: TreeNode, is_dir: boolean) => ViewChildren;
  /** 覆盖默认的「选中 + 目录折叠」行点击行为 */
  onRowClick?: (node: TreeNode, id: string) => void;
};

export function Row(props: TreeRowProps): TimelessElement {
  const {
    store,
    runtime,
    row,
    classes = {},
    indent = DEFAULT_INDENT,
    collapsible = true,
    renderIcon,
    renderMeta,
    onRowClick,
  } = props;

  const node = row.node;
  const id = String(node._id || "");
  const depth = row.depth || 0;
  const is_dir = isDirectory(node);
  const is_collapsed = Boolean(row.collapsed);
  const label = nodeLabel(node);
  const disabled = node.disabled === true;

  // 行是**只读快照**：名称 / 层级 / 折叠 / 计数 / 路径全部在建行时读一次（见文件头）。
  // 唯一订阅的是「纯样式」ref —— 它们变化只会改类的拼法，不会卸载任何一行。
  const visual_ = derive(
    [runtime.drop_target_, runtime.dragging_node_],
    (target, dragging) => visualState(target, dragging, id, is_dir),
  );

  const row_state_class_ = computed(visual_, (v) => {
    const list: string[] = [];
    if (v.lifted && classes.rowLifted) list.push(classes.rowLifted);
    if (v.into && classes.rowInto) list.push(classes.rowInto);
    if (v.before && classes.rowBefore) list.push(classes.rowBefore);
    if (v.after && classes.rowAfter) list.push(classes.rowAfter);
    return list.join(" ");
  });

  const selected_class_ = computed(runtime.selected_, (set) =>
    set.has(id) && classes.rowSelected ? classes.rowSelected : "",
  );

  const row_class_ = classNames([
    classes.row,
    row_state_class_,
    selected_class_,
    disabled ? classes.rowDisabled : "",
  ]);

  const before_class_ = computed(visual_, (v) =>
    v.before && classes.lineBefore ? classes.lineBefore : "",
  );
  const after_class_ = computed(visual_, (v) =>
    v.after && classes.lineAfter ? classes.lineAfter : "",
  );
  const line_before_ = classNames([classes.line, before_class_]);
  const line_after_ = classNames([classes.line, after_class_]);

  // 层级引导线：行没有「子树容器」可挂竖线，所以每一行自己画出「穿过本行」的那几段。
  // 深度为 d 的行在祖先层级 level ∈ [0, d) 上各画一段，上下相接就拼成连续竖线。
  // 只在 classes.guide 存在时渲染 —— 默认行为由样式库决定，不新增应用层开关。
  // guides 已编进 key（见 flattenTree），所以这里可以用静态快照。
  const guides: ViewChildren = [];
  if (classes.guide) {
    const mask = row.guides || [];
    // 与行的 padding-left 用同一套 clamp：深度超过 MAX_INDENT_PX 后箭头不再右移，
    // 不压上限的话深层级的线会跑到内容区里、压住本行自己的箭头。
    const content_left = Math.min(depth * indent, MAX_INDENT_PX);
    for (let level = 0; level < mask.length; level += 1) {
      if (!mask[level]) continue;
      // 线落在缩进槽中间，与祖先的折叠箭头近似对齐。
      const x = Math.min(
        level * indent + indent / 2,
        content_left - indent / 2,
      );
      guides.push(
        View(
          {
            class: classes.guide,
            // 值必须带单位：viewStyleToCssText 原样输出 `key: value`，不补单位。
            style: { left: `${x}px` },
            attributes: { "data-tree-guide": String(level), "aria-hidden": "true" },
          },
          [],
        ),
      );
    }
  }

  const caret: ViewChildren =
    collapsible && is_dir
      ? [
          View(
            {
              class: classes.caret,
              attributes: { "data-tree-caret": id },
              onClick(e) {
                e.stopPropagation();
                store.toggleExpand(id);
              },
            },
            [
              Icon({
                name: is_collapsed ? "chevron-right" : "chevron-down",
                size: 14,
                class: classes.caretIcon,
              }),
            ],
          ),
        ]
      : [];

  const icon: ViewChildren = [
    View(
      { class: classes.icon },
      renderIcon ? renderIcon(node, is_dir) : [Icon({ name: is_dir ? "folder" : "file", size: 15 })],
    ),
  ];

  const meta: ViewChildren = [
    View(
      { class: classes.meta },
      renderMeta
        ? renderMeta(node, is_dir)
        : [is_dir ? `${(node.children || []).length} 项` : ""],
    ),
  ];

  const checkbox: ViewChildren = store.checkable
    ? [Checkbox({ store, runtime, node, classes })]
    : [];

  return View(
    {
      class: row_class_,
      style: { "padding-left": `${Math.min(depth * indent, MAX_INDENT_PX)}px` },
      attributes: {
        "data-tree-row-id": id,
        title: label,
        n: "tree-row",
      },
      onClick() {
        // 拖拽结束后的那一次 click 不能触发选中 / 折叠。
        if (runtime.click_guard.consume()) return;
        if (disabled) return;
        if (onRowClick) {
          onRowClick(node, id);
          return;
        }
        store.clickNode(id);
      },
      onUnmounted() {
        row_class_.destroy?.();
        line_before_.destroy?.();
        line_after_.destroy?.();
        row_state_class_.destroy?.();
        selected_class_.destroy?.();
        before_class_.destroy?.();
        after_class_.destroy?.();
        visual_.destroy?.();
      },
    },
    [
      // 引导线在最前：落点指示线仍画在竖线之上。
      ...guides,
      View(
        { class: line_before_, attributes: { "data-tree-line": "before" } },
        [],
      ),
      ...caret,
      ...icon,
      View({ class: classes.title }, [label]),
      ...meta,
      ...checkbox,
      View(
        { class: line_after_, attributes: { "data-tree-line": "after" } },
        [],
      ),
    ],
  );
}

export type TreeCheckboxProps = {
  store: TreeCore;
  runtime: TreeRuntime;
  node: TreeNode;
  classes?: TreeClassNames;
};

/**
 * 勾选框。父子联动 / 半选由 `store.check` 负责，这里只把
 * `checked_` / `half_checked_` 投影成类名。
 */
export function Checkbox(props: TreeCheckboxProps): TimelessElement {
  const { store, runtime, node, classes = {} } = props;
  const id = String(node._id || "");

  const state_ = derive(
    [runtime.checked_, runtime.half_checked_],
    (checked, half) => {
      const on = checked.has(id);
      return {
        checked: on,
        half: !on && half.has(id),
      };
    },
  );

  const box_class_ = classNames([
    classes.checkbox,
    computed(state_, (s) =>
      s.checked && classes.checkboxChecked ? classes.checkboxChecked : "",
    ),
    computed(state_, (s) =>
      s.half && classes.checkboxHalf ? classes.checkboxHalf : "",
    ),
  ]);

  return View(
    {
      class: box_class_,
      attributes: {
        role: "checkbox",
        "data-tree-check-id": id,
        "aria-checked": computed(state_, (s) =>
          s.checked ? "true" : s.half ? "mixed" : "false",
        ),
      },
      onClick(e) {
        // 点勾选框不应当顺带选中行 / 折叠目录。
        e.stopPropagation();
        store.check(id);
      },
      onUnmounted() {
        box_class_.destroy?.();
        state_.destroy?.();
      },
    },
    [Indicator({ classes })],
  );
}

/** 勾选框里的方框 + 勾（可见性交给库的 `.is-checked` / `.is-indeterminate` 类）。 */
export function Indicator(props: { classes?: TreeClassNames }): TimelessElement {
  const { classes = {} } = props;
  return View(
    { class: classes.checkboxBox },
    [View({ class: classes.checkboxIndicator }, [])],
  );
}

// ---------------------------------------------------------------------------
// Empty / Hint / Ghost
// ---------------------------------------------------------------------------

export function Empty(props: {
  classes?: TreeClassNames;
  text?: string;
}): TimelessElement {
  const { classes = {}, text = "No files" } = props;
  return View({ class: classes.empty, attributes: { n: "tree-empty" } }, [text]);
}

export function Hint(props: {
  classes?: TreeClassNames;
  text: string | Ref<string> | DerivedRef<string>;
}): TimelessElement {
  const { classes = {}, text } = props;
  return View(
    { class: classes.hint, attributes: { n: "tree-hint" } },
    [text],
  );
}

export type TreeGhostProps = {
  runtime: TreeRuntime;
  classes?: TreeClassNames;
  renderIcon?: (node: TreeNode, is_dir: boolean) => ViewChildren;
  /** 见 `TreeRootProps.ghostRow`。 */
  ghostRow?: boolean;
};

/**
 * 行的纯视觉副本（`ghostRow` 模式）。
 *
 * `cloneNode` 拿到的是行在**起拖那一刻**的完整外观 —— 头像 `<img>`、未读角标、
 * 缩进引导线、行自身的高 / 内边距 / 边框全都在，所以浮层与原行逐像素一致，
 * 也不需要宿主再提供一份 renderer。
 *
 * 副本里的身份 / 交互钩子要全部摘掉：命中测试与页面查询都靠
 * `[data-tree-row-id]` 这类属性找「真行」，留着副本就会被误判成一行。
 * 监听器不会被 `cloneNode` 复制，所以点击 / 指针行为本来就不会跟着走。
 */
function snapshot_row(el: HTMLElement): HTMLElement {
  const copy = el.cloneNode(true) as HTMLElement;
  copy.setAttribute("aria-hidden", "true");
  for (const node of [copy, ...Array.from(copy.querySelectorAll("*"))]) {
    node.removeAttribute("data-tree-row-id");
    node.removeAttribute("data-tree-caret");
    node.removeAttribute("data-tree-check-id");
    node.removeAttribute("n");
    node.removeAttribute("title");
  }
  return copy;
}

/** 跟手浮层（`Portal` 挂在 body，不受列表滚动裁剪）。 */
export function Ghost(props: TreeGhostProps): TimelessElement {
  const { runtime, classes = {}, renderIcon, ghostRow = false } = props;
  const node = runtime.dragging_node_.value;
  if (!node) return View({}, []);
  const is_dir = isDirectory(node);
  // 快照缺失（宿主关掉了 ghostRow）时退回紧凑卡片。
  const copy = ghostRow ? runtime.ghost_copy : null;

  return Portal({}, [
    View(
      {
        class: classes.ghost,
        style: derive([runtime.ghost_], (box) => ({
          transform: `translate3d(${Math.round(box.x)}px, ${Math.round(
            box.y,
          )}px, 0)`,
          width: box.width ? `${Math.round(box.width)}px` : undefined,
          // 快照模式连高度一起锁定：副本自带行高，外层再给一次是为了让
          // 「浮层盒子」与原行的 rect 严格相等（库的 padding / border 收边不会改变它）。
          height: copy && box.height ? `${Math.round(box.height)}px` : undefined,
        })),
        attributes: { n: "tree-ghost" },
        onMounted(event) {
          if (!copy) return;
          // `onMounted` 的 target 是宿主动画抽象节点（VNodeView），不是 DOM 元素 ——
          // 拿真实元素要走 `get$elm()`。副本是宿主原始节点，只能这样挂进去。
          const $elm = event.target?.get$elm?.();
          if ($elm?.appendChild) $elm.appendChild(copy);
        },
      },
      copy
        ? []
        : [
            View(
              { class: classes.icon },
              renderIcon
                ? renderIcon(node, is_dir)
                : [Icon({ name: is_dir ? "folder" : "file", size: 15 })],
            ),
            View({ class: classes.ghostTitle }, [nodeLabel(node) || "根目录"]),
          ],
    ),
  ]);
}

// ---------------------------------------------------------------------------
// Scroll
// ---------------------------------------------------------------------------

type TreeRowItem = TreeRow & Record<string, unknown>;

export type TreeScrollProps = {
  store: TreeCore;
  runtime: TreeRuntime;
  rows: TreeRow[] | Ref<TreeRow[]> | DerivedRef<TreeRow[]>;
  classes?: TreeClassNames;
  /** 行高（initial estimate；挂载后按实测回填） */
  itemHeight?: number;
  /** 可视区外多挂几行 */
  buffer?: number;
  /** 拖到这段底部留白 = 移到根级末尾 */
  dropRootHeight?: number;
  /** 滚动容器最大高度 px（默认 360）；`<= 0` = 不限制：容器随内容长高，滚动交给外层 */
  maxHeight?: number;
  indent?: number;
  collapsible?: boolean;
  renderRow?: (props: TreeRowProps) => ViewChildren;
  renderIcon?: (node: TreeNode, is_dir: boolean) => ViewChildren;
  renderMeta?: (node: TreeNode, is_dir: boolean) => ViewChildren;
};

/**
 * 虚拟列表视口。`ListViewV2` 只在 key 不变时复用已挂载的行，而
 * `flattenTree` 把行的所有结构字段都编进了 key，所以这里可以让行只读快照。
 */
export function Scroll(props: TreeScrollProps): TimelessElement {
  const {
    store,
    runtime,
    rows,
    classes = {},
    itemHeight = DEFAULT_ROW_HEIGHT,
    buffer = 6,
    dropRootHeight = DEFAULT_DROP_ROOT_HEIGHT,
    maxHeight = 360,
    indent = DEFAULT_INDENT,
    collapsible = true,
    renderRow,
    renderIcon,
    renderMeta,
  } = props;

  return ListViewV2<TreeRowItem>({
    each: rows as unknown as DerivedRef<TreeRowItem[]>,
    // 字符串 key 形式：`ListViewV2` 取 `item[key]`，而 `TreeRow.key` 正是
    // flattenTree 编好的复合 key（`BoxProps.key?: string|number` 与函数形式冲突，
    // 传函数过不了类型）。
    key: "key",
    itemHeight,
    buffer,
    // 底部留白就是「移到根级末尾」的可落点区。
    paddingBottom: dropRootHeight,
    class: classes.scroll,
    // 上限 <= 0 = 不限制。这里必须**显式写** `max-height: none` 而不是省略：主题的
    // `.frui-tree-scroll` 之类会自带 `max-height: 360px`，内联 `none` 才能压住它。
    // ListViewV2 的视口就是容器实测 clientHeight，容器随内容长高后可见区覆盖全量行
    // （内部滚动条消失），滚动交给外层容器。
    style: maxHeight > 0 ? { "max-height": `${maxHeight}px` } : { "max-height": "none" },
    attributes: { n: "tree-scroll" },
    render(item, index) {
      const row_props: TreeRowProps = {
        store,
        runtime,
        row: item.value as unknown as TreeRow,
        index: index.value,
        classes,
        indent,
        collapsible,
        renderIcon,
        renderMeta,
      };
      return renderRow ? renderRow(row_props) : Row(row_props);
    },
  });
}

// ---------------------------------------------------------------------------
// Root
// ---------------------------------------------------------------------------

export type TreeRootProps = {
  store: TreeCore;
  classes?: TreeClassNames;
  /** 每层缩进 px（默认 18） */
  indent?: number;
  /** 行高（默认 28） */
  itemHeight?: number;
  buffer?: number;
  /** 底部留白落点带高度（默认 40） */
  dropRootHeight?: number;
  /** 滚动容器最大高度 px（默认 360）；`<= 0` = 不限制：容器随内容长高，滚动交给外层 */
  maxHeight?: number;
  /** 悬停折叠目录的中间区自动展开延时（默认 600ms） */
  autoExpandMs?: number;
  emptyText?: string;
  /** 默认操作提示（没在拖拽时显示） */
  hintText?: string;
  /** 目录 / 叶子图标 */
  renderIcon?: (node: TreeNode, is_dir: boolean) => ViewChildren;
  /** 右侧 meta */
  renderMeta?: (node: TreeNode, is_dir: boolean) => ViewChildren;
  /** 整体替换行渲染（app 层用它注入文件图标 / 体积格式化） */
  renderRow?: (props: TreeRowProps) => ViewChildren;
  onRowClick?: (node: TreeNode, id: string) => void;
  /**
   * 跟手浮层 = **被拖行起拖瞬间的 DOM 快照**，而不是 `ghost` + `ghostTitle`
   * 的紧凑卡片。整行外观（图标 / 头像 / meta / 缩进）与宽高因此与原行完全一致，
   * 且宿主不必再写一份 renderer。
   *
   * 默认 false：紧凑卡片是四套作用域库 / shadcn 的既有外观，只有需要「浮层就是
   * 那一行」的库打开它（findrssui 已打开）。
   */
  ghostRow?: boolean;
  /**
   * 行级右键（`data-tree-row-id` 委托，与 `onRowClick` 同源）。命中行时 `node` 是该行
   * `TreeNode`，空白处 / 行已卸载为 `null`（空树、列表底部留白因此也能开菜单）。
   * 只做命中测试，**不** preventDefault —— 是否吃掉浏览器菜单由宿主决定。
   */
  onRowContextMenu?: (node: TreeNode | null, event: MouseEvent) => void;
} & Omit<ViewProps, "class">;

/**
 * Tree 的最外层。指针事件挂在它身上（稳定祖先），行只是纯派生样式。
 *
 * 同时负责把 store 状态镜像成渲染层 ref —— 见文件头「行只订阅纯样式 ref」。
 */
export function Root(
  props: TreeRootProps,
  children?: ViewChildren,
): TimelessElement {
  const {
    store,
    classes = {},
    indent = DEFAULT_INDENT,
    itemHeight = DEFAULT_ROW_HEIGHT,
    buffer = 6,
    dropRootHeight = DEFAULT_DROP_ROOT_HEIGHT,
    maxHeight = 360,
    autoExpandMs = DEFAULT_AUTO_EXPAND_MS,
    emptyText = "No files",
    hintText = "按住行拖动：上 / 下 25% 调整顺序，中间 50% 移入目录（悬停折叠目录会展开）。",
    renderIcon,
    renderMeta,
    renderRow,
    onRowClick,
    onRowContextMenu,
    ghostRow = false,
    onContextMenu: raw_on_context_menu,
    onUnmounted,
    ...rest
  } = props;

  const runtime = getTreeRuntime(store);
  const listener$ = ListenerManager();

  const state_ = ref<TreeState>(store.state);
  const rows_ = computed(state_, (s) => s.rows);
  const has_rows_ = computed(state_, (s) => s.rows.length > 0);
  const empty_ = computed(state_, (s) => s.rows.length === 0);
  // `Show` 只吃 boolean ref；`dragging_node_` 不是（它是纯样式 ref，见文件头）。
  const dragging_ = computed(runtime.dragging_node_, (node) => Boolean(node));

  listener$.add(store.onStateChange((s) => {
    // 顺序要紧：state_ 会触发虚拟列表重建（可能卸载行），
    // 后面几个 ref 的 notify 循环里绝不发生卸载，行订阅它们才安全。
    state_.as(s);
    runtime.dragging_node_.as(s.draggingNode);
    runtime.drop_target_.as(s.dropTarget);
    assignSet(runtime.checked_, s.checkedKeys);
    assignSet(runtime.half_checked_, s.halfCheckedKeys);
    assignSet(runtime.selected_, s.selectedKeys);
  }));

  const hint_ = ref(hintText);
  const preview_ = derive(
    [runtime.dragging_node_, runtime.drop_target_],
    (node, target) => {
      if (!node) return "";
      const label = nodeLabel(node);
      if (!target) return `拖动中：${label}`;
      if (target.noop) return `《${label}》松手放回原位`;
      const name = targetLabel(store, target);
      if (target.kind === "into") return `松手移入 ${name}（成为子节点）`;
      if (target.kind === "root") return "松手移到根级末尾";
      return `松手放到 ${name} ${target.kind === "before" ? "之前" : "之后"}`;
    },
  );
  const hint_text_ = derive([preview_, hint_], (preview, text) => preview || text);

  listener$.add(hint_);
  listener$.add(preview_);
  listener$.add(hint_text_);

  // 悬停折叠目录中间区 autoExpandMs 后自动展开。
  // 计时器放在闭包里而不是 session 上 —— session 在 pointerup 时会被清掉，
  // 挂在它身上容易漏清理。
  let expand_timer: ReturnType<typeof setTimeout> | null = null;
  let expand_id = "";
  function clear_expand_timer() {
    if (expand_timer !== null) {
      clearTimeout(expand_timer);
      expand_timer = null;
    }
    expand_id = "";
  }
  function schedule_expand(id: string) {
    if (expand_timer !== null && expand_id === id) return;
    clear_expand_timer();
    expand_id = id;
    expand_timer = setTimeout(() => {
      expand_timer = null;
      expand_id = "";
      store.expand(id);
    }, autoExpandMs);
  }

  let session: {
    id: string;
    start_x: number;
    start_y: number;
    rect: DOMRect;
    /** 被拖行本身：`ghostRow` 模式起拖时拿它做快照。 */
    el: HTMLElement;
    dragging: boolean;
  } | null = null;

  function reset_session() {
    clear_expand_timer();
    session = null;
    runtime.ghost_copy = null;
    runtime.click_guard.reset();
    runtime.ghost_.as({
      x: 0,
      y: 0,
      offsetX: 0,
      offsetY: 0,
      width: 0,
      height: 0,
    });
  }

  function on_pointer_down(event: PointerEvent, info?: { x: number; y: number }) {
    if (!store.draggable) return;
    if ((event as MouseEvent).button !== 0 || event.isPrimary === false) return;
    // 「排序」「重置」这类控件保留自己的按下行为。
    const target = event.target as Element | null;
    if (target?.closest?.("button, a, input, textarea, select")) return;
    runtime.click_guard.reset();
    const el = target?.closest?.("[data-tree-row-id]") as HTMLElement | null;
    if (!el) return;
    const id = el.getAttribute("data-tree-row-id") || "";
    // 不可拖的行走早退：不能等 beginDrag 里的 bail —— 那时 click_guard 已经 arm()，
    // 会吞掉随后那次 click，点这一行就选不中了。
    const node = store.getNode(id);
    if (!node || node.draggable === false) return;
    session = {
      id,
      start_x: info?.x || 0,
      start_y: info?.y || 0,
      rect: el.getBoundingClientRect(),
      el,
      dragging: false,
    };
  }

  function on_pointer_move(event: PointerEvent, info?: { x: number; y: number }) {
    if (!session || !store.draggable) return;
    const x = info?.x || 0;
    const y = info?.y || 0;

    if (!session.dragging) {
      const distance = Math.hypot(x - session.start_x, y - session.start_y);
      if (distance < DRAG_THRESHOLD_PX) return;
      session.dragging = true;
      const rect = session.rect;
      runtime.ghost_.assign({
        x: rect.left,
        y: rect.top,
        offsetX: x - rect.left,
        offsetY: y - rect.top,
        width: rect.width,
        height: rect.height,
      });
      // 快照必须在 beginDrag 之前取：之后行会被加 `.is-lifted`（半透明原位影子），
      // 副本带着它就等于浮层也半透明了。
      runtime.ghost_copy = ghostRow ? snapshot_row(session.el) : null;
      store.beginDrag(session.id);
    }

    const box = runtime.ghost_.value;
    runtime.ghost_.assign({ x: x - box.offsetX, y: y - box.offsetY });

    // 全局 pointermove 的 target 就是指针下的元素，直接 closest 命测即可。
    const target = event.target as Element | null;
    const el = target?.closest?.("[data-tree-row-id]") as HTMLElement | null;
    if (el) {
      const rect = el.getBoundingClientRect();
      const hit: DragHit = {
        id: el.getAttribute("data-tree-row-id") || "",
        ratio: rect.height > 0 ? (y - rect.top) / rect.height : 0.5,
      };
      store.updateDrag(hit);
    } else {
      // 没落在行上：只有在树容器内部（底部留白）才当作「根级末尾」。
      // 容器外松手（比如拖到别的组件上）就是没有落点。
      const inside = target?.closest?.('[n="tree-scroll"]');
      store.updateDrag(inside ? { root: true } : null);
    }

    const drop_target = store.state.dropTarget;
    const expand = shouldExpandTarget(drop_target);
    if (expand) {
      schedule_expand(expand);
    } else {
      clear_expand_timer();
    }
  }

  function on_pointer_up(event: PointerEvent) {
    const current = session;
    const target = store.state.dropTarget;
    clear_expand_timer();
    session = null;
    // 取消的指针（触摸滚动、组件重挂载）不算落点。
    if (!current || !current.dragging || event.type === "pointercancel") {
      store.cancelDrag();
      return;
    }
    runtime.click_guard.arm();
    const node = store.getNode(current.id);
    const label = node ? nodeLabel(node) : "";
    const moved = store.commitDrag();
    if (!moved) {
      const verb = target && target.noop ? "放回原位" : "未移动";
      hint_.as(`《${label}》${verb}。`);
      return;
    }
    hint_.as(
      `已移动《${label}》到 ${targetLabel(store, target) || "根级"}。`,
    );
  }

  const pointer_props: ViewProps = store.draggable
    ? {
        onPointerDown: on_pointer_down,
        onPointerMove: on_pointer_move,
        onPointerUp: on_pointer_up,
      }
    : {};

  // 行命中与 on_pointer_down 同源。宿主原有的原生 onContextMenu 是**链式叠加**而不是被覆盖
  // —— 同一元素同一个事件只能挂一个监听器（Box 的 add_event）。
  // 不 preventDefault：吃不吃原生菜单由宿主决定。
  const on_context_menu =
    onRowContextMenu || raw_on_context_menu
      ? (event: MouseEvent) => {
          if (onRowContextMenu) {
            const el = (event.target as Element | null)?.closest?.("[data-tree-row-id]") as HTMLElement | null;
            const id = el ? el.getAttribute("data-tree-row-id") || "" : "";
            onRowContextMenu(id ? store.getNode(id) || null : null, event);
          }
          if (raw_on_context_menu) raw_on_context_menu(event);
        }
      : undefined;

  return View(
    {
      ...rest,
      class: classes.root,
      attributes: { ...(rest.attributes || {}), n: "tree-view" },
      ...pointer_props,
      onContextMenu: on_context_menu,
      onUnmounted() {
        clear_expand_timer();
        runtime.click_guard.reset();
        listener$.destroy();
        rows_.destroy?.();
        has_rows_.destroy?.();
        empty_.destroy?.();
        dragging_.destroy?.();
        hint_.destroy?.();
        preview_.destroy?.();
        hint_text_.destroy?.();
        state_.destroy?.();
        if (onUnmounted) onUnmounted();
      },
    },
    [
      Show({
        when: has_rows_,
        ok() {
          return Scroll({
            store,
            runtime,
            rows: rows_,
            classes,
            itemHeight,
            buffer,
            dropRootHeight,
            maxHeight,
            indent,
            collapsible: store.collapsible,
            renderRow,
            renderIcon,
            renderMeta,
          });
        },
      }),
      Show({
        when: empty_,
        ok() {
          return Empty({ classes, text: emptyText });
        },
      }),
      Hint({ classes, text: hint_text_ }),
      Show({
        when: dragging_,
        ok() {
          return Ghost({ runtime, classes, renderIcon, ghostRow });
        },
      }),
      // 额外槽位统一包一层 Fragment：`ViewChildren` 可能是惰性回调，
      // 直接展开进数组过不了类型。
      Fragment({}, children),
    ],
  );
}

import { ui, vm } from "@timeless/timeless";
import {
  classNames,
  combine,
  computed,
  For,
  Fragment,
  ref,
  refarr,
  refobj,
  Show,
  SVG,
  TimelessElement,
  View,
  ViewChildren,
  ViewProps,
} from "@timeless/timeless";

/**
 * Flow · Fluent 2
 *
 * 逻辑全在 `vm.FlowCanvasModel` / `vm.FlowNodeModel` / `vm.FlowEdgeModel`
 * （节点拖拽、连线、缩放、边路径计算），这里只负责 DOM 形状与类名。
 *
 * 类名契约（配合 style/components/flow.css）：
 *   .fl-flow > .fl-flow__background / .fl-flow__canvas / .fl-flow__controls
 *            / .fl-flow__minimap
 *   .fl-flow__canvas > .fl-flow__edges > svg > .fl-flow__edge-hit + .fl-flow__edge
 *   .fl-flow__canvas > .fl-flow__node > .fl-flow__node-body
 *            > .fl-flow__node-label / .fl-flow__node-desc
 *   .fl-flow__node > .fl-flow__node-actions > .fl-flow__action / .fl-flow__handle
 * 状态：.is-selected / .is-dragging / .is-disabled / .is-animated
 *       / .is-source / .is-target
 *       / .is-pending / .is-running / .is-completed / .is-failed / .is-skipped
 *
 * 两个已知边界（与 shadcn 版一致，四库同款）：
 *   1. 边是「一条边一个 `<svg>`」：viewport 变换挂在共同的父层上，边自身不做矩阵运算，
 *      命中测试靠一根 20px `stroke-width` 的透明 path，而不是 `pointer-events: stroke`。
 *   2. 拖拽期间不做边缘自动滚动（画布本身可 pan，节点拖拽不触发 pan）。
 */

const STATUS_CLASS: Record<string, string> = {
  pending: "is-pending",
  running: "is-running",
  completed: "is-completed",
  failed: "is-failed",
  skipped: "is-skipped",
};

const DEFAULT_ACTIONS: { label: string; class?: string; action: string }[] = [
  { label: "详情", action: "detail" },
  { label: "更多", action: "more" },
];

const ACTION_BUTTONS: Record<
  string,
  { label: string; class?: string; action: string }[]
> = {
  pending: DEFAULT_ACTIONS,
  running: DEFAULT_ACTIONS,
  completed: DEFAULT_ACTIONS,
  skipped: DEFAULT_ACTIONS,
  failed: [
    { label: "重试", class: "is-danger", action: "rerun" },
    { label: "详情", action: "detail" },
    { label: "更多", action: "more" },
  ],
};

/** Fluent 2 类名 —— 四库之间只有这一张表不同。 */
const C = {
  root: "fl-flow",
  background: "fl-flow__background",
  canvas: "fl-flow__canvas",
  edges: "fl-flow__edges",
  connectingPath: "fl-flow__connecting-path",
  edgeHit: "fl-flow__edge-hit",
  edge: "fl-flow__edge",
  node: "fl-flow__node",
  nodeBody: "fl-flow__node-body",
  nodeLabel: "fl-flow__node-label",
  nodeDesc: "fl-flow__node-desc",
  nodeActions: "fl-flow__node-actions",
  action: "fl-flow__action",
  handle: "fl-flow__handle",
  minimap: "fl-flow__minimap",
  minimapNode: "fl-flow__minimap-node",
  controls: "fl-flow__controls",
  control: "fl-flow__control",
};

type FlowNodeViewRender = Record<
  string,
  (props: { node: vm.FlowNodeModel }) => ViewChildren
>;

export interface FlowViewProps extends ViewProps {
  store: vm.FlowCanvasModel;
  nodeTypes?: FlowNodeViewRender;
  showBackground?: boolean;
  backgroundVariant?: "dots" | "lines" | "cross";
  showMinimap?: boolean;
  showControls?: boolean;
  multiSelect?: boolean;
  minZoom?: number;
  maxZoom?: number;
  nodesDraggable?: boolean;
  nodesConnectable?: boolean;
}

const handlePositions: Record<string, { left: string; top: string }> = {
  left: { left: "0", top: "50%" },
  right: { left: "100%", top: "50%" },
  top: { left: "50%", top: "0" },
  bottom: { left: "50%", top: "100%" },
};

export interface FlowHandleViewProps extends ViewProps {
  store: vm.FlowCanvasModel;
  nodeId: string;
  handleId: string;
  type: "source" | "target";
  position?: "top" | "right" | "bottom" | "left";
  index: number;
  total: number;
  connectable?: boolean;
}

/** 节点侧边的连接点。同一侧有多个时按 20px 步长在 `50%` 上下均分。 */
export function FlowHandle(props: FlowHandleViewProps): TimelessElement {
  const {
    store,
    nodeId,
    handleId,
    type,
    position = type === "source" ? "right" : "left",
    index = 0,
    total = 1,
    connectable = true,
    class: cls,
    ...rest
  } = props;

  const id = `${nodeId}-${handleId}`;

  const spacing = 20;
  const total_span = (total - 1) * spacing;
  const offset = -total_span / 2 + index * spacing;
  const is_horizontal = position === "left" || position === "right";

  const base_position = handlePositions[position] || handlePositions.right;
  const positions = { ...base_position };

  if (is_horizontal) {
    // handles distribute vertically along the side
    positions.top = `calc(50% + ${offset}px)`;
  } else {
    // handles distribute horizontally along the side
    positions.left = `calc(50% + ${offset}px)`;
  }

  return View(
    {
      ...rest,
      id,
      class: classNames([
        C.handle,
        type === "source" ? "is-source" : "is-target",
        !connectable && "is-disabled",
        cls,
      ]),
      style: {
        ...positions,
        zIndex: 10,
      },
      onMouseDown(e: MouseEvent) {
        if (!connectable || !store.state.nodesConnectable) return;
        e.stopPropagation();

        const handleEl = document.getElementById(id);
        if (!handleEl) return;
        const rect = handleEl.getBoundingClientRect();

        window.flowConnecting = {
          nodeId,
          handleId,
          type,
          startX: rect.left + rect.width / 2,
          startY: rect.top + rect.height / 2,
          currentX: rect.left + rect.width / 2,
          currentY: rect.top + rect.height / 2,
        };
      },
    },
    [],
  );
}

export interface FlowNodeViewProps extends ViewProps {
  store: vm.FlowNodeModel;
  nodeTypes: FlowNodeViewRender;
}

/**
 * 一个节点。悬浮时在上方浮出动作条（详情 / 更多 / 失败时的重试）。
 *
 * 拖拽用 document 级 mousemove/mouseup（不是 pointer capture）：节点可能在拖拽
 * 过程中被 `For` 重建，绑在节点上的监听会跟着丢。
 */
export function FlowNodeView(props: FlowNodeViewProps): TimelessElement {
  const { store: node$, nodeTypes, class: cls, ...rest } = props;

  const state_ = refobj(node$.state);
  const target_handlers_ = refarr([]);
  const source_handlers_ = refarr([]);
  const execution_ = refobj(node$.execution);

  const off_state = node$.onStateChange((v) => {
    state_.as(v);
    source_handlers_.as(
      node$.handles
        .filter((h) => h.type === "source")
        .sort((a, b) => a.idx - b.idx),
    );
    target_handlers_.as(
      node$.handles
        .filter((h) => h.type === "target")
        .sort((a, b) => a.idx - b.idx),
    );
  });

  const handleAction = (action: string, e: MouseEvent) => {
    e.stopPropagation();
    if (action === "rerun") {
      // 字符串字面量对不上字符串枚举成员（TS 的枚举是标称的），只能显式放行；
      // `FlowCanvasModel.onNodeRerun` 是它的订阅入口。
      node$.canvas$.emit("NodeRerun" as any, { node: node$ });
    } else if (action === "detail") {
      node$.canvas$.emit("NodeDetail" as any, { node: node$ });
    } else if (action === "more") {
      node$.canvas$.emit("NodeMore" as any, { node: node$ });
    }
  };

  let hideTimer: ReturnType<typeof setTimeout> | null = null;

  const startHide = () => {
    hideTimer = setTimeout(() => {
      hideTimer = null;
      node$.setHovering(false);
    }, 150);
  };

  const cancelHide = () => {
    if (hideTimer !== null) {
      clearTimeout(hideTimer);
      hideTimer = null;
    }
  };

  const buttons = computed(
    execution_,
    (t) => ACTION_BUTTONS[t.status] || DEFAULT_ACTIONS,
  );

  return View(
    {
      ...rest,
      class: classNames([
        C.node,
        computed(state_, (t) => (t.dragging ? "is-dragging" : null)),
        computed(state_, (t) => (t.selected ? "is-selected" : null)),
        computed(execution_, (t) => STATUS_CLASS[t.status] || STATUS_CLASS.pending),
        cls,
      ]),
      style: computed(state_, (t) => ({
        left: `${t.position.x}px`,
        top: `${t.position.y}px`,
      })),
      onMouseEnter() {
        cancelHide();
        node$.setHovering(true);
      },
      onMouseLeave() {
        startHide();
      },
      onClick() {
        node$.click();
      },
      onDoubleClick(e: MouseEvent) {
        e.stopPropagation();
        node$.doubleClick();
      },
      onMouseDown(e: MouseEvent) {
        if (e.button !== 0) return;
        e.stopPropagation();
        e.preventDefault();

        const $elm = e.currentTarget as HTMLElement;
        node$.pointerDown(e.clientX, e.clientY);

        const handleMove = (moveEvent: MouseEvent) => {
          node$.pointerMove(moveEvent.clientX, moveEvent.clientY);
          $elm.style.left = `${node$.position.x}px`;
          $elm.style.top = `${node$.position.y}px`;
          node$.canvas$?.refreshEdgesPosition();
        };

        const handleUp = (upEvent: MouseEvent) => {
          node$.pointerUp(upEvent.clientX, upEvent.clientY);
          document.removeEventListener("mousemove", handleMove);
          document.removeEventListener("mouseup", handleUp);
        };

        document.addEventListener("mousemove", handleMove);
        document.addEventListener("mouseup", handleUp);
      },
      onMounted(e) {
        const $elm = e.target.get$elm();
        const rect = $elm.getBoundingClientRect();
        node$.handleMounted({
          data: {
            x: $elm.offsetLeft,
            y: $elm.offsetTop,
            width: rect.width,
            height: rect.height,
          },
        });
      },
      onUnmounted() {
        off_state();
        cancelHide();
        rest.onUnmounted?.();
      },
    },
    [
      Show({
        when: computed(state_, (t) => t.hovering),
        ok() {
          return View(
            {
              class: C.nodeActions,
              onMouseEnter() {
                cancelHide();
              },
              onMouseLeave() {
                startHide();
              },
            },
            [
              For({
                each: buttons,
                render(btn) {
                  return View(
                    {
                      class: classNames([C.action, btn.class || null]),
                      onClick(e: MouseEvent) {
                        handleAction(btn.action, e);
                      },
                    },
                    [btn.label],
                  );
                },
              }),
            ],
          );
        },
      }),
      For({
        key: "id",
        each: source_handlers_,
        render(h) {
          return FlowHandle({
            index: h.idx,
            total: source_handlers_.value.length,
            store: node$.canvas$,
            nodeId: node$.id,
            handleId: h.id,
            type: "source",
            position: h.position || "right",
          });
        },
      }),
      nodeTypes?.[node$.type]
        ? Fragment({}, nodeTypes[node$.type]({ node: node$ }))
        : View({ class: C.nodeBody }, [
            View({ class: C.nodeLabel }, [node$.data["label"] || node$.id]),
            Show({
              when: node$.data["desc"],
              ok() {
                return View({ class: C.nodeDesc }, [node$.data["desc"]]);
              },
            }),
          ]),
      For({
        key: "id",
        each: target_handlers_,
        render(h) {
          return FlowHandle({
            index: h.idx,
            total: target_handlers_.value.length,
            store: node$.canvas$,
            nodeId: node$.id,
            handleId: h.id,
            type: "target",
            position: h.position || "left",
          });
        },
      }),
    ],
  );
}

/**
 * 一条边。里面两根同 `d` 的 path：下面那根透明、20px 粗，只为了拿到点击；
 * 上面那根才是看到的线。`animated` 时挂 `is-animated` 驱动 `stroke-dashoffset`
 * 流动（keyframes 在各库 flow.css 里按库前缀命名）。
 */
export function FlowEdgeView(
  props: ViewProps & { store: vm.FlowEdgeModel },
): ReturnType<typeof SVG.G> {
  const { store, class: cls, ...rest } = props;

  const state_ = refobj(store.state);

  const off_state = store.onStateChange((v) => {
    state_.as(v);
  });

  const handleClick = (e: MouseEvent) => {
    e.stopPropagation();
    store.toggle();
  };

  return SVG.G(
    {
      onUnmounted() {
        off_state();
        rest.onUnmounted?.();
      },
    },
    [
      SVG.Path(
        {
          d: computed(state_, (t) => t.d),
          class: C.edgeHit,
          style: { "stroke-width": 20 },
          onClick: handleClick,
        },
        [],
      ),
      SVG.Path(
        {
          d: computed(state_, (t) => t.d),
          class: classNames([
            C.edge,
            computed(state_, (t) => (t.selected ? "is-selected" : null)),
            computed(state_, (t) => (t.animated ? "is-animated" : null)),
            cls,
          ]),
          style: { strokeWidth: computed(state_, (t) => (t.selected ? 3 : 2)) },
        },
        [],
      ),
    ],
  );
}

function FlowConnectingLine(
  props: ViewProps & { store: vm.FlowCanvasModel },
): TimelessElement {
  const visible_ = ref(false);
  const path_ = ref("");

  window.flowConnectingLineUpdate = (newPath: string, visible: boolean) => {
    path_.as(newPath);
    visible_.as(visible);
  };

  return Show({
    when: visible_,
    ok() {
      return SVG.Path(
        {
          d: path_,
          class: C.connectingPath,
          style: { strokeWidth: 2 },
        },
        [],
      );
    },
  });
}

export function FlowBackground(
  props: ViewProps & {
    variant?: "dots" | "lines" | "cross";
    gap?: number;
    size?: number;
    color?: string;
  },
): TimelessElement {
  const {
    variant = "dots",
    gap = 20,
    size = 1,
    color = "var(--border)",
    class: cls,
    ...rest
  } = props;

  let style: Record<string, string> = {};

  if (variant === "dots") {
    style = {
      backgroundImage: `radial-gradient(circle, ${color} ${size}px, transparent ${size}px)`,
      backgroundSize: `${gap}px ${gap}px`,
    };
  } else if (variant === "lines") {
    style = {
      backgroundImage: `linear-gradient(${color}, ${color}) 1px, transparent 1px, linear-gradient(90deg, ${color}, ${color}) 1px, transparent 1px`,
      backgroundSize: `${gap}px ${gap}px`,
    };
  } else if (variant === "cross") {
    style = {
      backgroundImage: `linear-gradient(${color}, ${color}) 1px, transparent 1px, linear-gradient(90deg, ${color}, ${color}) 1px, transparent 1px`,
      backgroundSize: `${gap}px ${gap}px`,
      backgroundPosition: "center",
    };
  }

  return View(
    {
      ...rest,
      class: classNames([C.background, cls]),
      style,
    },
    [],
  );
}

export function FlowMinimap(
  props: ViewProps & { store: vm.FlowCanvasModel },
): TimelessElement {
  const { store, class: cls, ...rest } = props;

  const minimapWidth = 200;
  const minimapHeight = 150;
  const padding = 10;

  const bounds = combine(store.nodes, () => {
    if (store.nodes.length === 0) {
      return { minX: 0, minY: 0, maxX: 1000, maxY: 1000 };
    }
    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;
    store.nodes.forEach((node) => {
      minX = Math.min(minX, node.position.x);
      minY = Math.min(minY, node.position.y);
      maxX = Math.max(maxX, node.position.x + (node.width || 150));
      maxY = Math.max(maxY, node.position.y + (node.height || 80));
    });
    return { minX, minY, maxX, maxY };
  });

  const scale = combine({ bounds }, (b) => {
    const w = b.bounds.maxX - b.bounds.minX;
    const h = b.bounds.maxY - b.bounds.minY;
    return Math.min(
      (minimapWidth - padding * 2) / (w || 1),
      (minimapHeight - padding * 2) / (h || 1),
      1,
    );
  });

  const renderNodes = combine([bounds, scale], () => {
    return store.nodes.map((node) => {
      const b = bounds.value;
      const s = scale.value;
      const x = (node.position.x - b.minX) * s + padding;
      const y = (node.position.y - b.minY) * s + padding;
      const w = Math.max((node.width || 150) * s, 4);
      const h = Math.max((node.height || 80) * s, 4);

      return View({
        class: classNames([
          C.minimapNode,
          node.selected ? "is-selected" : null,
        ]),
        style: {
          left: `${x}px`,
          top: `${y}px`,
          width: `${w}px`,
          height: `${h}px`,
        },
      });
    });
  });

  return View(
    {
      ...rest,
      class: classNames([C.minimap, cls]),
      style: { width: `${minimapWidth}px`, height: `${minimapHeight}px` },
      onClick(e: MouseEvent) {
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;

        const b = bounds.value;
        const s = scale.value;
        const worldX = b.minX + (clickX - padding) / s;
        const worldY = b.minY + (clickY - padding) / s;

        store.setViewport({
          x: -worldX + rect.width / 2 / s,
          y: -worldY + rect.height / 2 / s,
        });
      },
    },
    renderNodes.value,
  );
}

export function FlowControls(
  props: ViewProps & { store: vm.FlowCanvasModel },
): TimelessElement {
  const { store, class: cls, ...rest } = props;

  const control = (label: string, onClick: () => void) =>
    View({ class: C.control, onClick }, [label]);

  return View({ ...rest, class: classNames([C.controls, cls]) }, [
    control("+", () => store.zoomIn()),
    control("-", () => store.zoomOut()),
    control("⟲", () => store.resetView()),
    control("⊡", () => store.fitView()),
  ]);
}

export function FlowCanvasView(
  props: FlowViewProps,
  children?: ViewChildren,
): TimelessElement {
  const {
    store,
    nodeTypes,
    showBackground = true,
    backgroundVariant = "dots",
    showMinimap = false,
    showControls = false,
    multiSelect = false,
    minZoom = 0.1,
    maxZoom = 2,
    nodesDraggable = true,
    nodesConnectable = true,
    class: cls,
    style: sty,
    ...rest
  } = props;

  const nodes_ = refarr(store.nodes.slice());
  const edges_ = refarr(store.edges.slice());

  const off_nodes = store.onNodesChange((v) => {
    nodes_.as(v);
  });
  const off_edges = store.onEdgesChange((v) => {
    edges_.as(v);
  });

  let panStartX = 0;
  let panStartY = 0;
  let $canvas: HTMLElement | null = null;
  let $root: HTMLElement | null = null;
  let onWheel: ((e: WheelEvent) => void) | null = null;
  let onDragMove: ((e: MouseEvent) => void) | null = null;
  let onDragUp: (() => void) | null = null;

  const updateCanvasTransform = () => {
    if (!$canvas) return;
    const v = store.viewport;
    $canvas.style.transform = `translate(${v.x}px, ${v.y}px) scale(${v.zoom})`;
  };

  const off_viewport = store.onViewportChange(() => {
    updateCanvasTransform();
  });

  return ui.FlowPrimitive.Root(
    {
      store,
      ...rest,
      class: classNames([C.root, cls]),
      style: sty,
      onMounted(event) {
        $root = event.target.get$elm();

        onWheel = function (e: WheelEvent) {
          e.preventDefault();

          const rect = $root!.getBoundingClientRect();
          const cursorX = e.clientX - rect.left;
          const cursorY = e.clientY - rect.top;

          const v = store.viewport;
          const oldZoom = v.zoom;

          // Trackpad pinch fires with ctrlKey=true and small deltaY;
          // mouse wheel fires with larger deltaY. Both should zoom.
          const zoomSensitivity = e.ctrlKey ? 0.01 : 0.001;
          const factor = 1 - e.deltaY * zoomSensitivity;
          const newZoom = Math.min(Math.max(oldZoom * factor, minZoom), maxZoom);

          // Zoom toward cursor: keep the world point under the cursor fixed
          const worldX = (cursorX - v.x) / oldZoom;
          const worldY = (cursorY - v.y) / oldZoom;
          const newX = cursorX - worldX * newZoom;
          const newY = cursorY - worldY * newZoom;

          store.setViewport({ x: newX, y: newY, zoom: newZoom });
        };

        $root.addEventListener("wheel", onWheel, { passive: false });
      },
      onUnmounted() {
        off_nodes();
        off_edges();
        off_viewport();
        if ($root && onWheel) $root.removeEventListener("wheel", onWheel);
        if (onDragMove) document.removeEventListener("mousemove", onDragMove);
        if (onDragUp) document.removeEventListener("mouseup", onDragUp);
        onWheel = null;
        onDragMove = null;
        onDragUp = null;
        document.body.style.cursor = "";
        rest.onUnmounted?.();
      },
      onMouseDown(e: MouseEvent) {
        if (e.button !== 0) return;
        // Only pan when clicking on the root itself or the background/canvas layer,
        // not on nodes, controls, etc. (those stopPropagation)
        const tag = (e.target as HTMLElement).tagName;
        if (tag === "BUTTON" || tag === "INPUT" || tag === "SELECT") return;

        e.preventDefault();
        panStartX = e.clientX - store.viewport.x;
        panStartY = e.clientY - store.viewport.y;

        if ($root) document.body.style.cursor = "grabbing";

        let hasPanned = false;

        onDragMove = (moveEvent: MouseEvent) => {
          hasPanned = true;
          const nx = moveEvent.clientX - panStartX;
          const ny = moveEvent.clientY - panStartY;
          store.setViewport({ x: nx, y: ny });
        };

        onDragUp = () => {
          if (onDragMove) document.removeEventListener("mousemove", onDragMove);
          if (onDragUp) document.removeEventListener("mouseup", onDragUp);
          onDragMove = null;
          onDragUp = null;

          if ($root) document.body.style.cursor = "";

          if (!hasPanned) {
            store.clearSelection();
          }
          hasPanned = false;
        };

        document.addEventListener("mousemove", onDragMove);
        document.addEventListener("mouseup", onDragUp);
      },
    },
    [
      Show({
        when: showBackground,
        ok() {
          return FlowBackground({ variant: backgroundVariant });
        },
      }),
      View(
        {
          class: C.canvas,
          style: {
            "transform-origin": "0 0",
          },
          onMounted(event) {
            $canvas = event.target.get$elm();
          },
          onMouseMove(e: MouseEvent) {
            if (window.flowConnecting) {
              const canvas = e.currentTarget as HTMLElement;
              const rect = canvas.getBoundingClientRect();
              const v = store.viewport;

              const sx =
                (window.flowConnecting.startX - rect.left - v.x) / v.zoom;
              const sy =
                (window.flowConnecting.startY - rect.top - v.y) / v.zoom;
              const tx = (e.clientX - rect.left - v.x) / v.zoom;
              const ty = (e.clientY - rect.top - v.y) / v.zoom;
              const offset = Math.max(Math.abs(tx - sx) * 0.5, 50);
              const path = `M ${sx},${sy} C ${sx + offset},${sy} ${tx - offset},${ty} ${tx},${ty}`;

              window.flowConnectingLineUpdate?.(path, true);
            }
          },
          onMouseUp() {
            if (window.flowConnecting) {
              window.flowConnectingLineUpdate?.("", false);
              window.flowConnecting = null;
            }
          },
        },
        [
          For({
            each: edges_,
            render(edge: vm.FlowEdgeModel) {
              return SVG.SVG(
                {
                  class: C.edges,
                  style: { overflow: "visible" },
                },
                [FlowEdgeView({ store: edge })],
              );
            },
          }),
          SVG.SVG(
            {
              class: C.edges,
              style: { overflow: "visible" },
            },
            [FlowConnectingLine({ store })],
          ),
          For({
            key: "id",
            each: nodes_,
            render(node) {
              return FlowNodeView({ store: node, nodeTypes });
            },
          }),
        ],
      ),
      Show({
        when: showControls,
        ok() {
          return FlowControls({ store });
        },
      }),
      Show({
        when: showMinimap,
        ok() {
          return FlowMinimap({ store });
        },
      }),
    ],
  );
}

export const FlowEdge_ = FlowEdgeView;
export const FlowNode_ = FlowNodeView;
export const FlowHandle_ = FlowHandle;

declare global {
  interface Window {
    flowConnecting: {
      nodeId: string;
      handleId: string;
      type: "source" | "target";
      startX: number;
      startY: number;
      currentX: number;
      currentY: number;
    } | null;
    flowConnectingLineUpdate: ((path: string, visible: boolean) => void) | null;
  }
}

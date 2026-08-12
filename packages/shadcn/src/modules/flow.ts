import { ui, vm } from "@timeless/timeless";
import {
  combine,
  computed,
  For,
  Fragment,
  ref,
  refarr,
  refobj,
} from "@timeless/timeless";
import {
  classNames,
  View,
  ViewChildren,
  ViewProps,
  Show,
  SVG,
} from "@timeless/timeless";

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

export function FlowHandle(props: FlowHandleViewProps) {
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
        "absolute w-3 h-3 rounded-full border-2 border-white",
        "-translate-x-1/2 -translate-y-1/2",
        "dark:border-gray-800",
        type === "source"
          ? "bg-blue-500 dark:bg-blue-600"
          : "bg-green-500 dark:bg-green-600",
        !connectable && "opacity-50 cursor-not-allowed",
        connectable && "cursor-crosshair hover:scale-125",
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

function getDefaultNodeContent(node: vm.FlowNodeModel): ViewChildren {
  return [
    View(
      { class: "flow-node-content flex-1 flex items-center justify-center" },
      [node.data["label"] || node.id],
    ),
  ];
}

export interface FlowNodeViewProps extends ViewProps {
  store: vm.FlowNodeModel;
  nodeTypes: FlowNodeViewRender;
}

const statusColors: Record<string, string> = {
  pending: "border-gray-300 dark:border-gray-600",
  running: "border-yellow-400 dark:border-yellow-500 animate-pulse",
  completed: "border-green-500 dark:border-green-400",
  failed: "border-red-500 dark:border-red-400",
  skipped: "border-blue-400 dark:border-blue-500",
};

const statusBadges: Record<
  string,
  { bg: string; text: string; label: string }
> = {
  pending: {
    bg: "bg-gray-100 dark:bg-gray-700",
    text: "text-gray-600 dark:text-gray-300",
    label: "等待",
  },
  running: {
    bg: "bg-yellow-100 dark:bg-yellow-900",
    text: "text-yellow-700 dark:text-yellow-300",
    label: "运行中",
  },
  completed: {
    bg: "bg-green-100 dark:bg-green-900",
    text: "text-green-700 dark:text-green-300",
    label: "完成",
  },
  failed: {
    bg: "bg-red-100 dark:bg-red-900",
    text: "text-red-700 dark:text-red-300",
    label: "失败",
  },
  skipped: {
    bg: "bg-blue-100 dark:bg-blue-900",
    text: "text-blue-700 dark:text-blue-300",
    label: "跳过",
  },
};

const actionButtons: Record<
  string,
  { label: string; class?: string; action: string }[]
> = {
  pending: [
    { label: "详情", action: "detail" },
    { label: "更多", action: "more" },
  ],
  running: [
    { label: "详情", action: "detail" },
    { label: "更多", action: "more" },
  ],
  completed: [
    { label: "详情", action: "detail" },
    { label: "更多", action: "more" },
  ],
  failed: [
    {
      label: "重试",
      class: "text-red-500 hover:bg-red-50 dark:hover:bg-red-950",
      action: "rerun",
    },
    { label: "详情", action: "detail" },
    { label: "更多", action: "more" },
  ],
  skipped: [
    { label: "详情", action: "detail" },
    { label: "更多", action: "more" },
  ],
};

export function FlowNodeView(props: FlowNodeViewProps) {
  const { store: node$, nodeTypes, class: cls, ...rest } = props;

  const state_ = refobj(node$.state);
  const target_handlers_ = refarr([]);
  const source_handlers_ = refarr([]);
  const execution_ = refobj(node$.execution);

  node$.onStateChange((v) => {
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
    () => actionButtons[execution_.value.status] || actionButtons.pending,
  );

  return View(
    {
      ...rest,
      class: classNames([
        "absolute min-w-[68px] rounded-lg border-2",
        "bg-white dark:bg-gray-800",
        "shadow-md",
        "select-none",
        "cursor-move",
        computed(state_, (t) => (t.dragging ? "shadow-xl" : null)),
        computed(state_, (t) =>
          t.selected ? "ring-2 ring-blue-500 dark:ring-blue-400" : null,
        ),
        statusColors[execution_.value.status] || statusColors.pending,
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
    },
    [
      Show({
        when: computed(state_, (t) => t.hovering),
        ok() {
          return View(
            {
              class:
                "absolute bottom-full left-0 mb-1 flex items-center gap-1 px-1.5 py-1 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg z-30 whitespace-nowrap",
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
                      class: classNames([
                        "px-2 py-0.5 rounded text-xs font-medium cursor-pointer transition-colors",
                        btn.class ||
                          "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700",
                      ]),
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
        : View({ class: "px-4 py-2" }, [
            View(
              { class: "text-sm text-center font-medium whitespace-nowrap" },
              [node$.data["label"] || node$.id],
            ),
            Show({
              when: node$.data["desc"],
              ok() {
                return View(
                  {
                    class:
                      "text-xs text-gray-500 dark:text-gray-400 text-center",
                  },
                  [node$.data["desc"]],
                );
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

export function FlowEdgeView(
  props: ViewProps & { store: vm.FlowEdgeModel },
): ReturnType<typeof SVG.G> {
  const { store, class: cls, ...rest } = props;

  const state_ = refobj(store.state);

  store.onStateChange((v) => {
    state_.as(v);
  });

  const handleClick = (e: MouseEvent) => {
    e.stopPropagation();
    store.toggle();
  };

  return SVG.G({}, [
    SVG.Path(
      {
        d: computed(state_, (t) => t.d),
        class:
          "fill-none stroke-transparent pointer-events-auto cursor-pointer",
        style: { "stroke-width": 20 },
        onClick: handleClick,
      },
      [],
    ),
    SVG.Path(
      {
        d: computed(state_, (t) => t.d),
        class: classNames([
          "fill-none pointer-events-none",
          computed(state_, (t) => {
            if (t.selected) {
              return "stroke-blue-500 dark:stroke-blue-400";
            }
            return "stroke-gray-400 dark:stroke-gray-600";
          }),
          computed(state_, (t) => {
            if (t.animated) {
              return "animate-dash";
            }
            return null;
          }),
          cls,
        ]),
        style: { strokeWidth: computed(state_, (t) => (t.selected ? 3 : 2)) },
      },
      [],
    ),
  ]);
}

function FlowConnectingLine(props: ViewProps & { store: vm.FlowCanvasModel }) {
  const { store, ...rest } = props;

  let visible_ = ref(false);
  let path_ = ref("");

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
          class:
            "fill-none stroke-gray-400 dark:stroke-gray-600 pointer-events-none",
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
) {
  const {
    variant = "dots",
    gap = 20,
    size = 1,
    color = "#e5e7eb",
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
      class: classNames(["absolute inset-0 w-full h-full", cls]),
      style,
    },
    [],
  );
}

export function FlowMinimap(props: ViewProps & { store: vm.FlowCanvasModel }) {
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
          "absolute rounded-sm",
          node.selected
            ? "bg-blue-500 dark:bg-blue-400"
            : "bg-gray-400 dark:bg-gray-600",
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
      class: classNames([
        "absolute bottom-4 right-4 z-50",
        "bg-white/90 dark:bg-gray-800/90",
        "border border-gray-200 dark:border-gray-700",
        "rounded-lg shadow-lg overflow-hidden",
        cls,
      ]),
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

export function FlowControls(props: ViewProps & { store: vm.FlowCanvasModel }) {
  const { store, class: cls, ...rest } = props;

  return View(
    {
      ...rest,
      class: classNames([
        "absolute bottom-4 left-4 z-50",
        "flex flex-col gap-1",
        "bg-white/90 dark:bg-gray-800/90",
        "border border-gray-200 dark:border-gray-700",
        "rounded-lg shadow-lg p-1",
        cls,
      ]),
    },
    [
      View(
        {
          class:
            "w-8 h-8 flex items-center justify-center rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 text-lg",
          onClick() {
            store.zoomIn();
          },
        },
        ["+"],
      ),
      View(
        {
          class:
            "w-8 h-8 flex items-center justify-center rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 text-lg",
          onClick() {
            store.zoomOut();
          },
        },
        ["-"],
      ),
      View(
        {
          class:
            "w-8 h-8 flex items-center justify-center rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700",
          onClick() {
            store.resetView();
          },
        },
        ["⟲"],
      ),
      View(
        {
          class:
            "w-8 h-8 flex items-center justify-center rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700",
          onClick() {
            store.fitView();
          },
        },
        ["⊡"],
      ),
    ],
  );
}

export function FlowCanvasView(props: FlowViewProps, children?: ViewChildren) {
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

  store.onNodesChange((v) => {
    nodes_.as(v);
  });
  store.onEdgesChange((v) => {
    edges_.as(v);
  });

  const viewport_ = refobj({ ...store.viewport });
  store.onViewportChange((v) => {
    viewport_.as(v);
  });

  let panStartX = 0;
  let panStartY = 0;
  let isPanning = false;
  let hasPanned = false;
  let $canvas: HTMLElement | null = null;
  let $root: HTMLElement | null = null;

  const updateCanvasTransform = () => {
    if (!$canvas) return;
    const v = store.viewport;
    $canvas.style.transform = `translate(${v.x}px, ${v.y}px) scale(${v.zoom})`;
  };

  store.onViewportChange(() => {
    updateCanvasTransform();
  });

  return ui.FlowPrimitive.Root(
    {
      store,
      ...rest,
      class: classNames([
        "relative w-full h-full overflow-hidden",
        "bg-gray-50 dark:bg-gray-900",
        cls,
      ]),
      style: sty,
      onMounted(event) {
        $root = event.target.get$elm();

        $root.addEventListener(
          "wheel",
          function (e: WheelEvent) {
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
            const newZoom = Math.min(
              Math.max(oldZoom * factor, minZoom),
              maxZoom,
            );

            // Zoom toward cursor: keep the world point under the cursor fixed
            const worldX = (cursorX - v.x) / oldZoom;
            const worldY = (cursorY - v.y) / oldZoom;
            const newX = cursorX - worldX * newZoom;
            const newY = cursorY - worldY * newZoom;

            store.setViewport({ x: newX, y: newY, zoom: newZoom });
          },
          { passive: false },
        );
      },
      onMouseDown(e: MouseEvent) {
        if (e.button !== 0) return;
        // Only pan when clicking on the root itself or the background/canvas layer,
        // not on nodes, controls, etc. (those stopPropagation)
        const tag = (e.target as HTMLElement).tagName;
        if (tag === "BUTTON" || tag === "INPUT" || tag === "SELECT") return;

        e.preventDefault();
        isPanning = true;
        hasPanned = false;
        panStartX = e.clientX - store.viewport.x;
        panStartY = e.clientY - store.viewport.y;

        if ($root) document.body.style.cursor = "grabbing";

        const handleMove = (moveEvent: MouseEvent) => {
          hasPanned = true;
          const nx = moveEvent.clientX - panStartX;
          const ny = moveEvent.clientY - panStartY;
          store.setViewport({ x: nx, y: ny });
        };

        const handleUp = () => {
          document.removeEventListener("mousemove", handleMove);
          document.removeEventListener("mouseup", handleUp);

          if ($root) document.body.style.cursor = "";

          if (!hasPanned) {
            store.clearSelection();
          }
          isPanning = false;
          hasPanned = false;
        };

        document.addEventListener("mousemove", handleMove);
        document.addEventListener("mouseup", handleUp);
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
          class: "absolute inset-0",
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
                  class: "absolute inset-0 w-full h-full pointer-events-none",
                  style: { overflow: "visible" },
                },
                [FlowEdgeView({ store: edge })],
              );
            },
          }),
          SVG.SVG(
            {
              class: "absolute inset-0 w-full h-full pointer-events-none",
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

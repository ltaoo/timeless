import { combine, computed, For, ref, refobj } from "@timeless/timeless";
import {
  classNames,
  View,
  ViewChildren,
  ViewProps,
  Show,
  SVG,
} from "@timeless/timeless";
import { FlowPrimitive } from "@timeless/ui-primitive";
import { FlowCanvasModel, FlowNodeModel, FlowEdgeModel } from "@timeless/ui-vm";
import type { FlowNode, FlowEdge } from "@timeless/ui-vm";

export interface FlowViewProps extends ViewProps {
  store: FlowCanvasModel;
  nodeTypes?: Record<
    string,
    (props: { node: FlowNode; store: FlowCanvasModel }) => ViewChildren
  >;
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

export interface FlowNodeViewProps extends ViewProps {
  store: FlowCanvasModel;
  node: FlowNode;
  nodeTypes?: Record<
    string,
    (props: { node: FlowNode; store: FlowCanvasModel }) => ViewChildren
  >;
}

export interface FlowHandleViewProps extends ViewProps {
  store: FlowCanvasModel;
  nodeId: string;
  handleId: string;
  type: "source" | "target";
  position?: "top" | "right" | "bottom" | "left";
  connectable?: boolean;
}

const handlePositions: Record<string, Record<string, string>> = {
  left: { top: "50%", right: "auto", bottom: "auto", left: "0" },
  right: { top: "50%", right: "0", bottom: "auto", left: "auto" },
  top: { top: "0", right: "auto", bottom: "auto", left: "50%" },
  bottom: { top: "auto", right: "auto", bottom: "0", left: "50%" },
};

const handleTransforms: Record<string, string> = {
  left: "translate(-50%, -50%)",
  right: "translate(50%, -50%)",
  top: "translate(-50%, -50%)",
  bottom: "translate(-50%, 50%)",
};

export function FlowHandle(props: FlowHandleViewProps) {
  const {
    store,
    nodeId,
    handleId,
    type,
    position = type === "source" ? "right" : "left",
    connectable = true,
    class: cls,
    ...rest
  } = props;

  const id = `${nodeId}-${handleId}`;
  const positions = handlePositions[position] || handlePositions.right;
  const transform = handleTransforms[position] || handleTransforms.right;

  return View(
    {
      ...rest,
      id,
      class: classNames([
        "absolute w-3 h-3 rounded-full border-2 border-white",
        "dark:border-gray-800",
        type === "source"
          ? "bg-blue-500 dark:bg-blue-600"
          : "bg-green-500 dark:bg-green-600",
        !connectable && "opacity-50 cursor-not-allowed",
        connectable && "cursor-crosshair hover:scale-125",
        cls,
      ]),
      style: { ...positions, transform, zIndex: 10 },
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

function getDefaultNodeContent(
  node: FlowNode,
  store: FlowCanvasModel,
): ViewChildren {
  return [
    FlowHandle({
      store,
      nodeId: node.id,
      handleId: "default-target",
      type: "target",
      position: "left",
    }),
    View({ class: "flex-1 flex items-center justify-center" }, [
      node.data?.label || node.id,
    ]),
    FlowHandle({
      store,
      nodeId: node.id,
      handleId: "default-source",
      type: "source",
      position: "right",
    }),
  ];
}

export function FlowNodeView(props: FlowNodeViewProps) {
  const { store, node, nodeTypes, class: cls, ...rest } = props;

  const node$ = new FlowNodeModel(node);

  const state_ = refobj(node$.state);

  let isDragging = false;
  let dragStartClientX = 0;
  let dragStartClientY = 0;
  let nodeStartX = 0;
  let nodeStartY = 0;

  // const currentNode = () => store.getNode(node.id) || node;

  return View(
    {
      ...rest,
      class: classNames([
        "absolute rounded-lg border border-gray-200 dark:border-gray-700",
        "bg-white dark:bg-gray-800",
        "shadow-md",
        "select-none",
        node.dragging && "shadow-xl",
        node.selected && "ring-2 ring-blue-500 dark:ring-blue-400",
        cls,
      ]),
      style: {
        left: `${node.position.x}px`,
        top: `${node.position.y}px`,
        // left: `${currentNode().position.x}px`,
        // top: `${currentNode().position.y}px`,
      },
      onMounted(e) {
        const rect = e.target.get$elm().getBoundingClientRect();
        store.updateNode(node.id, { width: rect.width, height: rect.height });
      },
      onMouseDown(e: MouseEvent) {
        // if (e.button !== 0) return;
        // if (!store.state.nodesDraggable) return;
        // e.stopPropagation();
        // const nodeData = currentNode();
        // store.selectNode(node.id, e.ctrlKey);
        // store.emit("NodeDragStart" as any, { node: nodeData });
        // isDragging = true;
        // dragStartClientX = e.clientX;
        // dragStartClientY = e.clientY;
        // nodeStartX = nodeData.position.x;
        // nodeStartY = nodeData.position.y;
        // node$.startDrag(e.clientX, e.clientY);
        // const onMouseMove = (moveEvent: MouseEvent) => {
        //   if (!isDragging) return;
        //   const deltaX =
        //     (moveEvent.clientX - dragStartClientX) / store.viewport.zoom;
        //   const deltaY =
        //     (moveEvent.clientY - dragStartClientY) / store.viewport.zoom;
        //   const newX = nodeStartX + deltaX;
        //   const newY = nodeStartY + deltaY;
        //   store.updateNode(node.id, { position: { x: newX, y: newY } });
        //   store.emit("NodeDrag" as any, {
        //     node: store.getNode(node.id)!,
        //     position: { x: newX, y: newY },
        //   });
        // };
        // const onMouseUp = () => {
        //   if (isDragging) {
        //     isDragging = false;
        //     store.emit("NodeDragStop" as any, {
        //       node: store.getNode(node.id)!,
        //     });
        //     node$.stopDrag();
        //   }
        //   window.removeEventListener("mousemove", onMouseMove);
        //   window.removeEventListener("mouseup", onMouseUp);
        // };
        // window.addEventListener("mousemove", onMouseMove);
        // window.addEventListener("mouseup", onMouseUp);
      },
      onClick(e: MouseEvent) {
        // store.emit("NodeClick" as any, { node: currentNode(), event: e });
      },
    },
    [
      Show({
        when: !!(nodeTypes && node.type && nodeTypes[node.type]),
        ok() {
          return nodeTypes[node.type]({ node, store });
        },
        else() {
          return getDefaultNodeContent(node, store);
        },
      }),
    ],
  );
}

export function FlowEdgeView(props: ViewProps & { store: FlowEdgeModel }) {
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

function FlowConnectingLine(props: ViewProps & { store: FlowCanvasModel }) {
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

export function FlowMinimap(props: ViewProps & { store: FlowCanvasModel }) {
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

export function FlowControls(props: ViewProps & { store: FlowCanvasModel }) {
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

export function FlowCanvas(props: FlowViewProps, children?: ViewChildren) {
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

  const nodes_ = store.nodes.slice();
  const edges_ = store.edges.slice();

  store.onNodesChange((v) => {
    nodes_.length = 0;
    nodes_.push(...v);
  });
  store.onEdgesChange((v) => {
    edges_.length = 0;
    edges_.push(...v);
  });

  const canvas_transform_ = combine(store.viewport, (v) => {
    return `translate(${v.x}px, ${v.y}px) scale(${v.zoom})`;
  });

  let panStartX = 0;
  let panStartY = 0;
  let isPanning = false;

  return FlowPrimitive.Root(
    {
      store,
      ...rest,
      class: classNames([
        "relative w-full h-full overflow-hidden",
        "bg-gray-50 dark:bg-gray-900",
        cls,
      ]),
      style: sty,
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
          style: computed(canvas_transform_, (t) => ({
            transform: t,
            transformOrigin: "0 0",
          })),
          // onWheel(e: WheelEvent) {
          //   e.preventDefault();

          //   const isZooming = e.ctrlKey || e.metaKey;
          //   const v = store.viewport;

          //   if (isZooming) {
          //     const delta = -e.deltaY * 0.001;
          //     const newZoom = Math.max(
          //       minZoom,
          //       Math.min(maxZoom, v.zoom + delta),
          //     );

          //     const rect = (
          //       e.currentTarget as HTMLElement
          //     ).getBoundingClientRect();
          //     const mouseX = e.clientX - rect.left;
          //     const mouseY = e.clientY - rect.top;

          //     const worldX = (mouseX - v.x) / v.zoom;
          //     const worldY = (mouseY - v.y) / v.zoom;

          //     const newX = mouseX - worldX * newZoom;
          //     const newY = mouseY - worldY * newZoom;

          //     store.setViewport({ x: newX, y: newY, zoom: newZoom });
          //   } else {
          //     store.setViewport({ x: v.x - e.deltaX, y: v.y - e.deltaY });
          //   }
          // },
          onMouseDown(e: MouseEvent) {
            if (e.button === 1 || (e.button === 0 && e.shiftKey)) {
              e.preventDefault();
              isPanning = true;
              panStartX = e.clientX - store.viewport.x;
              panStartY = e.clientY - store.viewport.y;
            } else if (e.button === 0 && e.target === e.currentTarget) {
              store.clearSelection();
            }
          },
          onMouseMove(e: MouseEvent) {
            if (isPanning) {
              store.setViewport({
                x: e.clientX - panStartX,
                y: e.clientY - panStartY,
              });
            }

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
            if (isPanning) {
              isPanning = false;
            }

            if (window.flowConnecting) {
              window.flowConnectingLineUpdate?.("", false);
              window.flowConnecting = null;
            }
          },
        },
        [
          For({
            each: edges_,
            render(edge: FlowEdgeModel) {
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
            each: nodes_,
            render(node) {
              return FlowNodeView({ store, node, nodeTypes });
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

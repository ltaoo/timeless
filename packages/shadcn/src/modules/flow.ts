import {
  combine,
  computed,
  For,
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
import { FlowPrimitive } from "@timeless/ui-primitive";
import { FlowCanvasModel, FlowNodeModel, FlowEdgeModel } from "@timeless/ui-vm";

type FlowNodeViewRender = Record<
  string,
  (props: { node: FlowNodeModel }) => ViewChildren
>;

export interface FlowViewProps extends ViewProps {
  store: FlowCanvasModel;
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

export interface FlowHandleViewProps extends ViewProps {
  store: FlowCanvasModel;
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
  const transform = handleTransforms[position] || handleTransforms.right;

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

function getDefaultNodeContent(node: FlowNodeModel): ViewChildren {
  return [
    View(
      { class: "flow-node-content flex-1 flex items-center justify-center" },
      [node.data["label"] || node.id],
    ),
  ];
}

export interface FlowNodeViewProps extends ViewProps {
  store: FlowNodeModel;
  nodeTypes: FlowNodeViewRender;
}

export function FlowNodeView(props: FlowNodeViewProps) {
  const { store: node$, nodeTypes, class: cls, ...rest } = props;

  const state_ = refobj(node$.state);
  const target_handlers_ = refarr([]);
  const source_handlers_ = refarr([]);

  node$.onStateChange(() => {
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
        "absolute min-w-[68px] rounded-lg border border-gray-200 dark:border-gray-700",
        "bg-white dark:bg-gray-800",
        "shadow-md",
        "select-none",
        computed(state_, (t) => (t.dragging ? "shadow-xl" : null)),
        computed(state_, (t) =>
          t.selected ? "ring-2 ring-blue-500 dark:ring-blue-400" : null,
        ),
        cls,
      ]),
      style: computed(state_, (t) => {
        return {
          left: `${t.position.x}px`,
          top: `${t.position.y}px`,
        };
      }),
      onMounted(e) {
        const $elm = e.target.get$elm();
        const rect = $elm.getBoundingClientRect();
        // console.log("the flow node is mounted", rect.width, rect.height);
        node$.handleMounted({
          data: {
            x: $elm.offsetLeft,
            y: $elm.offsetTop,
            width: rect.width,
            height: rect.height,
          },
        });
        // store.updateNode(node.id, { width: rect.width, height: rect.height });
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
      // computed(target_handlers_, (t) => t.length),
      // computed(source_handlers_, (t) => t.length),
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
      Show({
        when: !!(nodeTypes && node$.type && nodeTypes[node$.type]),
        ok() {
          return nodeTypes[node$.type]({ node: node$ });
        },
        else() {
          return getDefaultNodeContent(node$);
        },
      }),
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
  let $canvas: HTMLElement | null = null;

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
      onMounted(event) {
        const $root = event.target.get$elm();

        let rafId = 0;
        let accDeltaX = 0;
        let accDeltaY = 0;
        let accZoomDelta = 0;
        let isZooming = false;
        let lastMouseX = 0;
        let lastMouseY = 0;

        const flush = () => {
          rafId = 0;
          if (!$canvas) return;

          const v = store.viewport;
          if (isZooming) {
            const newZoom = Math.max(
              minZoom,
              Math.min(maxZoom, v.zoom + accZoomDelta),
            );
            const worldX = (lastMouseX - v.x) / v.zoom;
            const worldY = (lastMouseY - v.y) / v.zoom;
            const newX = lastMouseX - worldX * newZoom;
            const newY = lastMouseY - worldY * newZoom;
            store.setViewport({ x: newX, y: newY, zoom: newZoom });
            $canvas.style.transform = `translate(${newX}px, ${newY}px) scale(${newZoom})`;
          } else {
            const nx = v.x - accDeltaX;
            const ny = v.y - accDeltaY;
            store.setViewport({ x: nx, y: ny });
            $canvas.style.transform = `translate(${nx}px, ${ny}px) scale(${v.zoom})`;
          }

          accDeltaX = 0;
          accDeltaY = 0;
          accZoomDelta = 0;
        };

        $root.addEventListener(
          "wheel",
          function (e) {
            e.preventDefault();
            if (!$canvas) return;

            const zooming = e.ctrlKey || e.metaKey;
            if (zooming) {
              accZoomDelta += -e.deltaY * 0.001;
              isZooming = true;
              const rect = $root.getBoundingClientRect();
              lastMouseX = e.clientX - rect.left;
              lastMouseY = e.clientY - rect.top;
            } else {
              accDeltaX += e.deltaX;
              accDeltaY += e.deltaY;
              isZooming = false;
            }

            if (!rafId) {
              rafId = requestAnimationFrame(flush);
            }
          },
          { passive: false },
        );
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

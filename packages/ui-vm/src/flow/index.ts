import { BaseDomain, Handler } from "@timeless/base";
import { FlowNodeModel } from "./node";
import { FlowEdgeModel } from "./edge";
import { FlowHandleModel } from "./handle";
import { Logger } from "@/util";

export { FlowNodeModel } from "./node";
export type { FlowNodeModelProps, FlowNodeState } from "./node";
export { FlowEdgeModel } from "./edge";
export type { FlowEdgeModelProps, FlowEdgeState } from "./edge";
export { FlowHandleModel } from "./handle";
export type { FlowHandleModelProps, FlowHandleState } from "./handle";

const logger = Logger({ prefix: "ui-vm", scope: "flow/index" });

export interface FlowNode<T = any> {
  id: string;
  type?: string;
  position: { x: number; y: number };
  data: T;
  selected?: boolean;
  dragging?: boolean;
  width?: number;
  height?: number;
}

export interface FlowHandle {
  id: string;
  type: "source" | "target";
  position?: "top" | "right" | "bottom" | "left";
  idx: number;
}

export interface FlowEdge {
  id: string;
  source: string;
  sourceHandle?: string;
  sourcePosition?: "top" | "right" | "bottom" | "left";
  target: string;
  targetHandle?: string;
  targetPosition?: "top" | "right" | "bottom" | "left";
  type?: "bezier" | "step" | "straight" | "smoothstep";
  label?: string;
  animated?: boolean;
  selected?: boolean;
}

export interface Viewport {
  x: number;
  y: number;
  zoom: number;
}

export interface Connection {
  source: string;
  sourceHandle?: string;
  target: string;
  targetHandle?: string;
}

enum Events {
  NodesChange = "NodesChange",
  EdgesChange = "EdgesChange",
  Connect = "Connect",
  NodeClick = "NodeClick",
  NodeDoubleClick = "NodeDoubleClick",
  NodeDragStart = "NodeDragStart",
  NodeDrag = "NodeDrag",
  NodeDragStop = "NodeDragStop",
  EdgeClick = "EdgeClick",
  SelectionChange = "SelectionChange",
  ViewportChange = "ViewportChange",
  StateChange = "StateChange",
}

type TheTypesOfEvents = {
  [Events.NodesChange]: FlowNodeModel[];
  [Events.EdgesChange]: FlowEdgeModel[];
  [Events.Connect]: Connection;
  [Events.NodeClick]: { node: FlowNodeModel; event: MouseEvent };
  [Events.NodeDoubleClick]: { node: FlowNodeModel; event: MouseEvent };
  [Events.NodeDragStart]: { node: FlowNodeModel };
  [Events.NodeDrag]: {
    node: FlowNodeModel;
    position: { x: number; y: number };
  };
  [Events.NodeDragStop]: { node: FlowNodeModel };
  [Events.EdgeClick]: { edge: FlowEdgeModel; event: MouseEvent };
  [Events.SelectionChange]: {
    nodes: FlowNodeModel[];
    edges: FlowEdgeModel[];
  };
  [Events.ViewportChange]: Viewport;
  [Events.StateChange]: FlowState;
};

export interface FlowState {
  nodes: FlowNodeModel[];
  edges: FlowEdgeModel[];
  viewport: Viewport;
  nodesDraggable: boolean;
  nodesConnectable: boolean;
  multiSelect: boolean;
}

export type IsValidConnection = (connection: Connection) => boolean;

export interface FlowCanvasModelProps {
  nodes: FlowNodeModel[];
  edges: FlowEdge[];
  viewport?: Partial<Viewport>;
  isValidConnection?: IsValidConnection;
  minZoom?: number;
  maxZoom?: number;
}

export class FlowCanvasModel extends BaseDomain<TheTypesOfEvents> {
  nodes: FlowNodeModel[] = [];
  edges: FlowEdgeModel[] = [];
  viewport: Viewport = { x: 0, y: 0, zoom: 1 };
  minZoom: number = 0.1;
  maxZoom: number = 2;
  isValidConnection: IsValidConnection = () => true;
  nodesDraggable: boolean = true;
  nodesConnectable: boolean = true;
  multiSelect: boolean = false;

  private nodeMap: Map<string, FlowNodeModel> = new Map();
  private edgeMap: Map<string, FlowEdgeModel> = new Map();
  _mountedNodeCount = 0;

  constructor(
    props: FlowCanvasModelProps & {
      nodesDraggable?: boolean;
      nodesConnectable?: boolean;
      multiSelect?: boolean;
    },
  ) {
    super(props);
    const {
      nodes,
      edges,
      viewport = {},
      isValidConnection,
      minZoom = 0.1,
      maxZoom = 2,
      nodesDraggable = true,
      nodesConnectable = true,
      multiSelect = false,
    } = props;

    this.minZoom = minZoom;
    this.maxZoom = maxZoom;
    this.viewport = { x: 0, y: 0, zoom: 1, ...viewport };
    this.nodesDraggable = nodesDraggable;
    this.nodesConnectable = nodesConnectable;
    this.multiSelect = multiSelect;

    if (isValidConnection) {
      this.isValidConnection = isValidConnection;
    }

    this.setNodes(nodes);
    this.setEdges(edges);
  }

  get state(): FlowState {
    return {
      nodes: this.nodes,
      edges: this.edges,
      viewport: this.viewport,
      nodesDraggable: this.nodesDraggable,
      nodesConnectable: this.nodesConnectable,
      multiSelect: this.multiSelect,
    };
  }

  private addNodeToMap(node: FlowNodeModel) {
    this.nodeMap.set(node.id, node);
  }

  private removeNodeFromMap(id: string) {
    this.nodeMap.delete(id);
  }

  addNode(node: FlowNodeModel): FlowNodeModel {
    this.nodes = [...this.nodes, node];
    this.addNodeToMap(node);
    this.emit(Events.NodesChange, this.nodes);
    this.emit(Events.StateChange, this.state);
    return node;
  }

  removeNode(id: string): void {
    this.nodes = this.nodes.filter((n) => n.id !== id);
    this.removeNodeFromMap(id);
    this.edges = this.edges.filter(
      (e) => e.source.id !== id && e.target.id !== id,
    );
    this.emit(Events.NodesChange, this.nodes);
    this.emit(Events.EdgesChange, this.edges);
    this.emit(Events.StateChange, this.state);
  }

  updateNode(id: string, patch: any): void {
    const node = this.nodeMap.get(id);
    if (!node) {
      return;
    }
    console.log("before ", node);
    node.updateData(patch);
    // this.nodes = [...this.nodes];
    this.emit(Events.NodesChange, this.nodes);
    this.emit(Events.StateChange, this.state);
  }

  getNode(id: string): FlowNodeModel | undefined {
    return this.nodeMap.get(id);
  }

  setNodes(nodes: FlowNodeModel[]): void {
    for (let i = 0; i < nodes.length; i += 1) {
      const node = nodes[i];
      node.setCanvas$(this);
      const unlisten = node.onMounted(() => {
        logger.log(
          "[]setNodes node onMounted callback",
          this._mountedNodeCount,
        );
        unlisten();
        this._mountedNodeCount += 1;
        if (this._mountedNodeCount === nodes.length) {
          this.computeNodeHandles();
          this.computePassThroughNodes();
          this.refreshEdgesPosition();
        }
      });
    }
    this.nodes = nodes;
    this.nodeMap.clear();
    nodes.forEach((n) => this.addNodeToMap(n));
    this.emit(Events.NodesChange, this.nodes);
    this.emit(Events.StateChange, this.state);
  }

  private addEdgeToMap(edge: FlowEdgeModel) {
    this.edgeMap.set(edge.id, edge);
  }

  private removeEdgeFromMap(id: string) {
    this.edgeMap.delete(id);
  }

  private createEdgeModel(edge: FlowEdge): FlowEdgeModel | null {
    const sourceNode = this.nodeMap.get(edge.source);
    const targetNode = this.nodeMap.get(edge.target);
    if (!sourceNode || !targetNode) return null;

    return new FlowEdgeModel({
      id: edge.id,
      source: sourceNode,
      target: targetNode,
      sourceHandle: edge.sourceHandle,
      targetHandle: edge.targetHandle,
      sourcePosition: edge.sourcePosition,
      targetPosition: edge.targetPosition,
      type: edge.type,
      label: edge.label,
      animated: edge.animated,
      canvas$: this,
    });
  }

  addEdge(edge: Omit<FlowEdge, "id"> & { id?: string }): FlowEdgeModel | null {
    const connection: Connection = {
      source: edge.source,
      sourceHandle: edge.sourceHandle,
      target: edge.target,
      targetHandle: edge.targetHandle,
    };

    if (!this.isValidConnection(connection)) {
      return null;
    }

    const id = edge.id || `edge-${this.uid()}`;
    const edgeModel = this.createEdgeModel({ ...edge, id } as FlowEdge);
    if (!edgeModel) return null;

    this.edges = [...this.edges, edgeModel];
    this.addEdgeToMap(edgeModel);
    this.computeNodeHandles();
    this.emit(Events.EdgesChange, this.edges);
    this.emit(Events.StateChange, this.state);
    return edgeModel;
  }

  removeEdge(id: string): void {
    this.edges = this.edges.filter((e) => e.id !== id);
    this.removeEdgeFromMap(id);
    this.computeNodeHandles();
    this.emit(Events.EdgesChange, this.edges);
    this.emit(Events.StateChange, this.state);
  }

  updateEdge(id: string, patch: Partial<FlowEdge>): void {
    const edge = this.edgeMap.get(id);
    if (!edge) return;
    if (patch.label !== undefined) edge.label = patch.label;
    if (patch.animated !== undefined) edge.animated = patch.animated;
    if (patch.type !== undefined) {
      edge.type = patch.type;
      // edge.computePath();
    }
    this.edges = [...this.edges];
    this.emit(Events.EdgesChange, this.edges);
    this.emit(Events.StateChange, this.state);
  }

  getEdge(id: string): FlowEdgeModel | null {
    return this.edgeMap.get(id) ?? null;
  }

  setEdges(edges: FlowEdge[]): void {
    this.edges = [];
    this.edgeMap.clear();
    for (const edge of edges) {
      const edgeModel = this.createEdgeModel(edge);
      if (edgeModel) {
        this.edges.push(edgeModel);
        this.addEdgeToMap(edgeModel);
      }
    }
    this.emit(Events.EdgesChange, this.edges);
    this.emit(Events.StateChange, this.state);
  }

  private computeNodeHandles(): void {
    // console.log("[]flow/index - computeNodeHandles");

    // Collect handles with peer node info for sorting
    type HandleWithPeer = FlowHandle & {
      peerNode: FlowNodeModel;
      edge: FlowEdgeModel;
    };
    const nodeHandlesMap = new Map<string, HandleWithPeer[]>();

    for (const edge of this.edges) {
      // source node → source handle (peer is target node)
      const sourceHandles = nodeHandlesMap.get(edge.source.id) || [];
      const sourceHandleId = edge.sourceHandle || `source-${edge.id}`;
      if (!sourceHandles.some((h) => h.id === sourceHandleId)) {
        sourceHandles.push({
          id: sourceHandleId,
          type: "source",
          position: edge.sourcePosition,
          idx: 0,
          peerNode: edge.target,
          edge,
        });
      }
      nodeHandlesMap.set(edge.source.id, sourceHandles);

      // target node → target handle (peer is source node)
      const targetHandles = nodeHandlesMap.get(edge.target.id) || [];
      const targetHandleId = edge.targetHandle || `target-${edge.id}`;
      if (!targetHandles.some((h) => h.id === targetHandleId)) {
        targetHandles.push({
          id: targetHandleId,
          type: "target",
          position: edge.targetPosition,
          idx: 0,
          peerNode: edge.source,
          edge,
        });
      }
      nodeHandlesMap.set(edge.target.id, targetHandles);
    }

    // Sort handles by peer node position and assign idx per node
    for (const node of this.nodes) {
      const handlesWithPeer = nodeHandlesMap.get(node.id) || [];

      const nodeCenterX = node.position.x + (node.width || 0) / 2;
      const nodeCenterY = node.position.y + (node.height || 0) / 2;

      // Sort within same-position groups
      handlesWithPeer.sort((a, b) => {
        const posA = a.position || (a.type === "source" ? "right" : "left");
        const posB = b.position || (b.type === "source" ? "right" : "left");
        if (posA !== posB) return 0;

        const aCenterX = a.peerNode.position.x + (a.peerNode.width || 0) / 2;
        const aCenterY = a.peerNode.position.y + (a.peerNode.height || 0) / 2;
        const bCenterX = b.peerNode.position.x + (b.peerNode.width || 0) / 2;
        const bCenterY = b.peerNode.position.y + (b.peerNode.height || 0) / 2;

        const isHorizontal = posA === "left" || posA === "right";
        if (isHorizontal) {
          // Primary: X distance ascending (closer peer first)
          const distA = Math.abs(aCenterX - nodeCenterX);
          const distB = Math.abs(bCenterX - nodeCenterX);
          if (distA !== distB) return distA - distB;
          // Secondary: peer Y descending (lower on screen → smaller idx)
          return bCenterY - aCenterY;
        } else {
          // Primary: Y distance ascending (closer peer first)
          const distA = Math.abs(aCenterY - nodeCenterY);
          const distB = Math.abs(bCenterY - nodeCenterY);
          if (distA !== distB) return distA - distB;
          // Secondary: peer X descending
          return bCenterX - aCenterX;
        }
      });

      // Assign idx per position group
      const positionCounters = new Map<string, number>();
      for (const handle of handlesWithPeer) {
        const key = handle.position || "default";
        const idx = positionCounters.get(key) || 0;
        handle.idx = idx;
        positionCounters.set(key, idx + 1);
      }

      const handlers: FlowHandleModel[] = handlesWithPeer.map(
        ({ peerNode, edge, ...h }) =>
          new FlowHandleModel({
            id: h.id,
            type: h.type,
            position: h.position,
            idx: h.idx,
            node,
            edge,
          }),
      );
      console.log(
        "[]flow/index - computeNodeHandles set handlers to node",
        node.id,
        handlers,
      );
      node.setHandlers(handlers);
    }
  }

  private computePassThroughNodes(): void {
    for (const edge of this.edges) {
      const source = edge.source;
      const target = edge.target;

      if (this.isHorizontalEdge(edge)) {
        // Horizontal edge: find nodes whose x range overlaps the corridor
        const leftX = Math.min(
          source.position.x + source.width,
          target.position.x,
        );
        const rightX = Math.max(
          source.position.x + source.width,
          target.position.x,
        );
        // Y corridor: the bezier spans between source and target center Y
        const sourceCenterY = source.position.y + source.height / 2;
        const targetCenterY = target.position.y + target.height / 2;
        const corridorTopY = Math.min(sourceCenterY, targetCenterY);
        const corridorBottomY = Math.max(sourceCenterY, targetCenterY);

        edge.passThroughNodes = this.nodes.filter((n) => {
          if (n === source || n === target) return false;
          const nLeft = n.position.x;
          const nRight = n.position.x + n.width;
          const nTop = n.position.y;
          const nBottom = n.position.y + n.height;
          // Node must overlap both X corridor and Y corridor
          return (
            nRight > leftX &&
            nLeft < rightX &&
            nBottom > corridorTopY &&
            nTop < corridorBottomY
          );
        });
      } else {
        // Vertical edge: find nodes whose y range overlaps the corridor
        const topY = Math.min(
          source.position.y + source.height,
          target.position.y,
        );
        const bottomY = Math.max(
          source.position.y + source.height,
          target.position.y,
        );
        // X corridor: the bezier spans between source and target center X
        const sourceCenterX = source.position.x + source.width / 2;
        const targetCenterX = target.position.x + target.width / 2;
        const corridorLeftX = Math.min(sourceCenterX, targetCenterX);
        const corridorRightX = Math.max(sourceCenterX, targetCenterX);

        edge.passThroughNodes = this.nodes.filter((n) => {
          if (n === source || n === target) return false;
          const nLeft = n.position.x;
          const nRight = n.position.x + n.width;
          const nTop = n.position.y;
          const nBottom = n.position.y + n.height;
          // Node must overlap both Y corridor and X corridor
          return (
            nBottom > topY &&
            nTop < bottomY &&
            nRight > corridorLeftX &&
            nLeft < corridorRightX
          );
        });
      }
    }
  }

  private isHorizontalEdge(edge: FlowEdgeModel): boolean {
    return edge.sourcePosition === "left" || edge.sourcePosition === "right";
  }

  refreshEdgesPosition() {
    for (let i = 0; i < this.edges.length; i += 1) {
      const edge = this.edges[i];
      edge.computePath();
    }
  }

  setViewport(viewport: Partial<Viewport>): void {
    this.viewport = { ...this.viewport, ...viewport };
    // console.log('[]flow/index - setViewport', this.viewport);
    // this.emit(Events.ViewportChange, this.viewport);
    // this.emit(Events.StateChange, this.state);
  }

  zoomIn(step: number = 0.1): void {
    const newZoom = Math.min(this.viewport.zoom + step, this.maxZoom);
    this.setViewport({ zoom: newZoom });
  }

  zoomOut(step: number = 0.1): void {
    const newZoom = Math.max(this.viewport.zoom - step, this.minZoom);
    this.setViewport({ zoom: newZoom });
  }

  fitView(options?: { padding?: number }): void {
    if (this.nodes.length === 0) return;

    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;

    this.nodes.forEach((node) => {
      const x = node.position.x;
      const y = node.position.y;
      const w = node.width || 150;
      const h = node.height || 80;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x + w);
      maxY = Math.max(maxY, y + h);
    });

    const padding = options?.padding || 50;
    const width = maxX - minX + padding * 2;
    const height = maxY - minY + padding * 2;

    this.setViewport({
      x: -minX + padding,
      y: -minY + padding,
    });
  }

  resetView(): void {
    this.setViewport({ x: 0, y: 0, zoom: 1 });
  }

  selectNode(id: string, multi: boolean = false): void {
    if (!multi) {
      this.nodes.forEach((n) => {
        n.selected = n.id === id;
      });
      this.edges.forEach((e) => {
        e.deselect();
      });
    } else {
      const node = this.getNode(id);
      if (node) {
        node.selected = !node.selected;
      }
    }
    this.emit(Events.SelectionChange, {
      nodes: this.getSelectedNodes(),
      edges: this.getSelectedEdges(),
    });
    this.emit(Events.StateChange, this.state);
  }

  selectEdge(id: string, multi: boolean = false): void {
    if (!multi) {
      this.edges.forEach((e) => {
        if (e.id === id) {
          e.select();
        } else {
          e.deselect();
        }
      });
      this.nodes.forEach((n) => {
        n.selected = false;
      });
    } else {
      const edge = this.getEdge(id);
      if (edge) {
        if (edge.selected) {
          edge.deselect();
        } else {
          edge.select();
        }
      }
    }
    this.emit(Events.SelectionChange, {
      nodes: this.getSelectedNodes(),
      edges: this.getSelectedEdges(),
    });
    this.emit(Events.StateChange, this.state);
  }

  clearSelection(): void {
    this.nodes.forEach((n) => {
      n.selected = false;
    });
    this.edges.forEach((e) => {
      e.deselect();
    });
    this.emit(Events.SelectionChange, { nodes: [], edges: [] });
    this.emit(Events.StateChange, this.state);
  }

  getSelectedNodes(): FlowNodeModel[] {
    return this.nodes.filter((n) => n.selected);
  }

  getSelectedEdges(): FlowEdgeModel[] {
    return this.edges.filter((e) => e.selected);
  }

  toJSON(): { nodes: FlowNode[]; edges: FlowEdge[]; viewport: Viewport } {
    return {
      nodes: this.nodes.map((n) => {
        return n.toJSON();
      }),
      edges: this.edges.map((e) => {
        return e.toJSON();
      }),
      viewport: this.viewport,
    };
  }

  fromJSON(data: {
    nodes: FlowNodeModel[];
    edges: FlowEdge[];
    viewport?: Viewport;
  }): void {
    this.setNodes(data.nodes);
    this.setEdges(data.edges);
    if (data.viewport) {
      this.setViewport(data.viewport);
    }
  }

  onConnect(handler: Handler<Connection>): () => void {
    return this.on(Events.Connect, handler);
  }

  onNodesChange(handler: Handler<FlowNodeModel[]>): () => void {
    return this.on(Events.NodesChange, handler);
  }

  onEdgesChange(handler: Handler<FlowEdgeModel[]>): () => void {
    return this.on(Events.EdgesChange, handler);
  }

  onNodeClick(
    handler: Handler<{ node: FlowNodeModel; event: MouseEvent }>,
  ): () => void {
    return this.on(Events.NodeClick, handler);
  }

  onNodeDoubleClick(
    handler: Handler<{ node: FlowNodeModel; event: MouseEvent }>,
  ): () => void {
    return this.on(Events.NodeDoubleClick, handler);
  }

  onNodeDragStart(handler: Handler<{ node: FlowNodeModel }>): () => void {
    return this.on(Events.NodeDragStart, handler);
  }

  onNodeDrag(
    handler: Handler<{
      node: FlowNodeModel;
      position: { x: number; y: number };
    }>,
  ): () => void {
    return this.on(Events.NodeDrag, handler);
  }

  onNodeDragStop(handler: Handler<{ node: FlowNodeModel }>): () => void {
    return this.on(Events.NodeDragStop, handler);
  }

  onEdgeClick(
    handler: Handler<{ edge: FlowEdgeModel; event: MouseEvent }>,
  ): () => void {
    return this.on(Events.EdgeClick, handler);
  }

  onSelectionChange(
    handler: Handler<{ nodes: FlowNodeModel[]; edges: FlowEdgeModel[] }>,
  ): () => void {
    return this.on(Events.SelectionChange, handler);
  }

  onViewportChange(handler: Handler<Viewport>): () => void {
    return this.on(Events.ViewportChange, handler);
  }

  onStateChange(handler: Handler<FlowState>): () => void {
    return this.on(Events.StateChange, handler);
  }
}

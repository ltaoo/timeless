import { BaseDomain, Handler } from "@timeless/base";
import { FlowNodeModel } from "./node";
import { FlowEdgeModel } from "./edge";
import { Logger } from "@/util";

export { FlowNodeModel } from "./node";
export type { FlowNodeModelProps, FlowNodeState } from "./node";
export { FlowEdgeModel } from "./edge";
export type { FlowEdgeModelProps, FlowEdgeState } from "./edge";

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
}

export interface FlowEdge {
  id: string;
  source: string;
  sourceHandle?: string;
  target: string;
  targetHandle?: string;
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
    this.emit(Events.EdgesChange, this.edges);
    this.emit(Events.StateChange, this.state);
    return edgeModel;
  }

  removeEdge(id: string): void {
    this.edges = this.edges.filter((e) => e.id !== id);
    this.removeEdgeFromMap(id);
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

  refreshEdgesPosition() {
    for (let i = 0; i < this.edges.length; i += 1) {
      const edge = this.edges[i];
      edge.computePath();
    }
  }

  setViewport(viewport: Partial<Viewport>): void {
    this.viewport = { ...this.viewport, ...viewport };
    this.emit(Events.ViewportChange, this.viewport);
    this.emit(Events.StateChange, this.state);
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

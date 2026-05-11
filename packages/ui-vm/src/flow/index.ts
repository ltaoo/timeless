import { BaseDomain, Handler } from "@timeless/base";

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
  [Events.NodesChange]: FlowNode[];
  [Events.EdgesChange]: FlowEdge[];
  [Events.Connect]: Connection;
  [Events.NodeClick]: { node: FlowNode; event: MouseEvent };
  [Events.NodeDoubleClick]: { node: FlowNode; event: MouseEvent };
  [Events.NodeDragStart]: { node: FlowNode };
  [Events.NodeDrag]: { node: FlowNode; position: { x: number; y: number } };
  [Events.NodeDragStop]: { node: FlowNode };
  [Events.EdgeClick]: { edge: FlowEdge; event: MouseEvent };
  [Events.SelectionChange]: { nodes: FlowNode[]; edges: FlowEdge[] };
  [Events.ViewportChange]: Viewport;
  [Events.StateChange]: FlowState;
};

export interface FlowState {
  nodes: FlowNode[];
  edges: FlowEdge[];
  viewport: Viewport;
  nodesDraggable: boolean;
  nodesConnectable: boolean;
  multiSelect: boolean;
}

export type IsValidConnection = (connection: Connection) => boolean;

export interface FlowCoreProps {
  nodes?: FlowNode[];
  edges?: FlowEdge[];
  viewport?: Partial<Viewport>;
  isValidConnection?: IsValidConnection;
  minZoom?: number;
  maxZoom?: number;
}

export class FlowCore extends BaseDomain<TheTypesOfEvents> {
  nodes: FlowNode[] = [];
  edges: FlowEdge[] = [];
  viewport: Viewport = { x: 0, y: 0, zoom: 1 };
  minZoom: number = 0.1;
  maxZoom: number = 2;
  isValidConnection: IsValidConnection = () => true;
  nodesDraggable: boolean = true;
  nodesConnectable: boolean = true;
  multiSelect: boolean = false;

  private nodeMap: Map<string, FlowNode> = new Map();
  private edgeMap: Map<string, FlowEdge> = new Map();

  constructor(
    props: FlowCoreProps & {
      nodesDraggable?: boolean;
      nodesConnectable?: boolean;
      multiSelect?: boolean;
    } = {},
  ) {
    super(props);
    const {
      nodes = [],
      edges = [],
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

  private addNodeToMap(node: FlowNode) {
    this.nodeMap.set(node.id, node);
  }

  private removeNodeFromMap(id: string) {
    this.nodeMap.delete(id);
  }

  addNode(node: Omit<FlowNode, "id"> & { id?: string }): FlowNode {
    const id = node.id || `node-${this.uid()}`;
    const newNode: FlowNode = { ...node, id };
    this.nodes = [...this.nodes, newNode];
    this.addNodeToMap(newNode);
    this.emit(Events.NodesChange, this.nodes);
    this.emit(Events.StateChange, this.state);
    return newNode;
  }

  removeNode(id: string): void {
    this.nodes = this.nodes.filter((n) => n.id !== id);
    this.removeNodeFromMap(id);
    this.edges = this.edges.filter((e) => e.source !== id && e.target !== id);
    this.emit(Events.NodesChange, this.nodes);
    this.emit(Events.EdgesChange, this.edges);
    this.emit(Events.StateChange, this.state);
  }

  updateNode(id: string, patch: Partial<FlowNode>): void {
    const index = this.nodes.findIndex((n) => n.id === id);
    if (index === -1) return;
    this.nodes = [
      ...this.nodes.slice(0, index),
      { ...this.nodes[index], ...patch },
      ...this.nodes.slice(index + 1),
    ];
    this.addNodeToMap(this.nodes[index]);
    this.emit(Events.NodesChange, this.nodes);
    this.emit(Events.StateChange, this.state);
  }

  getNode(id: string): FlowNode | undefined {
    return this.nodeMap.get(id);
  }

  setNodes(nodes: FlowNode[]): void {
    this.nodes = nodes;
    this.nodeMap.clear();
    nodes.forEach((n) => this.addNodeToMap(n));
    this.emit(Events.NodesChange, this.nodes);
    this.emit(Events.StateChange, this.state);
  }

  private addEdgeToMap(edge: FlowEdge) {
    this.edgeMap.set(edge.id, edge);
  }

  private removeEdgeFromMap(id: string) {
    this.edgeMap.delete(id);
  }

  addEdge(edge: Omit<FlowEdge, "id"> & { id?: string }): FlowEdge | null {
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
    const newEdge: FlowEdge = { ...edge, id };
    this.edges = [...this.edges, newEdge];
    this.addEdgeToMap(newEdge);
    this.emit(Events.EdgesChange, this.edges);
    this.emit(Events.StateChange, this.state);
    return newEdge;
  }

  removeEdge(id: string): void {
    this.edges = this.edges.filter((e) => e.id !== id);
    this.removeEdgeFromMap(id);
    this.emit(Events.EdgesChange, this.edges);
    this.emit(Events.StateChange, this.state);
  }

  updateEdge(id: string, patch: Partial<FlowEdge>): void {
    const index = this.edges.findIndex((e) => e.id === id);
    if (index === -1) return;
    this.edges = [
      ...this.edges.slice(0, index),
      { ...this.edges[index], ...patch },
      ...this.edges.slice(index + 1),
    ];
    this.addEdgeToMap(this.edges[index]);
    this.emit(Events.EdgesChange, this.edges);
    this.emit(Events.StateChange, this.state);
  }

  getEdge(id: string): FlowEdge | undefined {
    return this.edgeMap.get(id);
  }

  setEdges(edges: FlowEdge[]): void {
    this.edges = edges;
    this.edgeMap.clear();
    edges.forEach((e) => this.addEdgeToMap(e));
    this.emit(Events.EdgesChange, this.edges);
    this.emit(Events.StateChange, this.state);
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
        e.selected = false;
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
        e.selected = e.id === id;
      });
      this.nodes.forEach((n) => {
        n.selected = false;
      });
    } else {
      const edge = this.getEdge(id);
      if (edge) {
        edge.selected = !edge.selected;
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
      e.selected = false;
    });
    this.emit(Events.SelectionChange, { nodes: [], edges: [] });
    this.emit(Events.StateChange, this.state);
  }

  getSelectedNodes(): FlowNode[] {
    return this.nodes.filter((n) => n.selected);
  }

  getSelectedEdges(): FlowEdge[] {
    return this.edges.filter((e) => e.selected);
  }

  toJSON(): { nodes: FlowNode[]; edges: FlowEdge[]; viewport: Viewport } {
    return {
      nodes: this.nodes,
      edges: this.edges,
      viewport: this.viewport,
    };
  }

  fromJSON(data: {
    nodes: FlowNode[];
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

  onNodesChange(handler: Handler<FlowNode[]>): () => void {
    return this.on(Events.NodesChange, handler);
  }

  onEdgesChange(handler: Handler<FlowEdge[]>): () => void {
    return this.on(Events.EdgesChange, handler);
  }

  onNodeClick(
    handler: Handler<{ node: FlowNode; event: MouseEvent }>,
  ): () => void {
    return this.on(Events.NodeClick, handler);
  }

  onNodeDoubleClick(
    handler: Handler<{ node: FlowNode; event: MouseEvent }>,
  ): () => void {
    return this.on(Events.NodeDoubleClick, handler);
  }

  onNodeDragStart(handler: Handler<{ node: FlowNode }>): () => void {
    return this.on(Events.NodeDragStart, handler);
  }

  onNodeDrag(
    handler: Handler<{ node: FlowNode; position: { x: number; y: number } }>,
  ): () => void {
    return this.on(Events.NodeDrag, handler);
  }

  onNodeDragStop(handler: Handler<{ node: FlowNode }>): () => void {
    return this.on(Events.NodeDragStop, handler);
  }

  onEdgeClick(
    handler: Handler<{ edge: FlowEdge; event: MouseEvent }>,
  ): () => void {
    return this.on(Events.EdgeClick, handler);
  }

  onSelectionChange(
    handler: Handler<{ nodes: FlowNode[]; edges: FlowEdge[] }>,
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

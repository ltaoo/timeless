import { BaseDomain, Handler } from "@timeless/base";
import type { FlowNode } from "./index";

export interface FlowNodeModelProps extends FlowNode {
  onClick?: (node: FlowNodeModel) => void;
  onDoubleClick?: (node: FlowNodeModel) => void;
}

enum Events {
  Click = "Click",
  DoubleClick = "DoubleClick",
  FocusedChange = "FocusedChange",
  PositionChange = "PositionChange",
  StateChange = "StateChange",
}

type TheTypesOfEvents = {
  [Events.Click]: FlowNodeModel;
  [Events.DoubleClick]: FlowNodeModel;
  [Events.FocusedChange]: boolean;
  [Events.PositionChange]: { x: number; y: number };
  [Events.StateChange]: FlowNodeState;
};

export interface FlowNodeState {
  dragging: boolean;
  selected: boolean;
  focused: boolean;
}

export class FlowNodeModel extends BaseDomain<TheTypesOfEvents> {
  id: string;
  data: FlowNode;
  focused: boolean = false;
  selected: boolean = false;

  private handleRects: Map<string, DOMRect> = new Map();
  private dragStartPos: { x: number; y: number } | null = null;
  private nodeStartPos: { x: number; y: number } | null = null;
  position: {
    x: number;
    y: number;
  };
  width: number;
  height: number;

  get state(): FlowNodeState {
    return {
      dragging: this.data.dragging || false,
      selected: this.data.selected || false,
      focused: this.focused,
    };
  }

  constructor(props: FlowNodeModelProps) {
    super({ unique_id: `FlowNodeCore-${props.id}` });
    const { onClick, onDoubleClick, ...data } = props;
    this.data = data;

    this.id = data.id;
    this.position = data.position;
    this.width = data.width;
    this.height = data.height;

    if (onClick) {
      this.on(Events.Click, onClick);
    }
    if (onDoubleClick) {
      this.on(Events.DoubleClick, onDoubleClick);
    }
  }

  updateData(patch: Partial<FlowNode>): void {
    this.data = { ...this.data, ...patch };
  }

  focus(): void {
    if (this.focused) {
      return;
    }
    this.focused = true;
    this.emit(Events.FocusedChange, true);
    this.emit(Events.StateChange, this.state);
  }

  blur(): void {
    if (!this.focused) {
      return;
    }
    this.focused = false;
    this.emit(Events.FocusedChange, false);
    this.emit(Events.StateChange, this.state);
  }

  click() {
    this.selected = true;
    this.emit(Events.Click, this as FlowNodeModel);
  }

  doubleClick(): void {
    this.emit(Events.DoubleClick, this as FlowNodeModel);
  }

  startDrag(clientX: number, clientY: number): void {
    this.dragStartPos = { x: clientX, y: clientY };
    this.nodeStartPos = { ...this.data.position };
    this.data.dragging = true;
  }

  drag(clientX: number, clientY: number, zoom: number = 1): void {
    if (!this.dragStartPos || !this.nodeStartPos) return;

    const deltaX = (clientX - this.dragStartPos.x) / zoom;
    const deltaY = (clientY - this.dragStartPos.y) / zoom;

    this.data.position = {
      x: this.nodeStartPos.x + deltaX,
      y: this.nodeStartPos.y + deltaY,
    };
  }

  stopDrag(): void {
    this.dragStartPos = null;
    this.nodeStartPos = null;
    this.data.dragging = false;
  }

  registerHandle(handleId: string, el: HTMLElement): void {
    this.handleRects.set(handleId, el.getBoundingClientRect());
  }

  unregisterHandle(handleId: string): void {
    this.handleRects.delete(handleId);
  }

  getHandleRect(handleId: string): DOMRect | null {
    return this.handleRects.get(handleId) || null;
  }

  updateHandleRect(handleId: string): void {
    const el = document.getElementById(handleId);
    if (el) {
      this.handleRects.set(handleId, el.getBoundingClientRect());
    }
  }

  onPositionChange(handler: Handler<{ x: number; y: number }>): () => void {
    return this.on(Events.PositionChange, handler);
  }

  onStateChange(handler: Handler<FlowNodeState>): () => void {
    return this.on(Events.StateChange, handler);
  }

  onClick(handler: Handler<FlowNodeModel>): () => void {
    return this.on(Events.Click, handler);
  }

  onDoubleClick(handler: Handler<FlowNodeModel>): () => void {
    return this.on(Events.DoubleClick, handler);
  }

  onFocusedChange(handler: Handler<boolean>): () => void {
    return this.on(Events.FocusedChange, handler);
  }
}

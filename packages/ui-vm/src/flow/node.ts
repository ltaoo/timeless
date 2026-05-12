import { BaseDomain, Handler } from "@timeless/base";

import type { FlowCanvasModel, FlowNode } from "./index";

enum Events {
  Mounted,
  Click = "Click",
  DoubleClick = "DoubleClick",
  FocusedChange = "FocusedChange",
  PositionChange = "PositionChange",
  StateChange = "StateChange",
}

type TheTypesOfEvents<T> = {
  [Events.Mounted]: {
    data: { x: number; y: number; width: number; height: number };
  };
  [Events.Click]: FlowNodeModel<T>;
  [Events.DoubleClick]: FlowNodeModel<T>;
  [Events.FocusedChange]: boolean;
  [Events.PositionChange]: { x: number; y: number };
  [Events.StateChange]: FlowNodeState<T>;
};

export interface FlowNodeModelProps<T extends any> {
  id: string;
  type?: string;
  position: { x: number; y: number };
  data: T;
  selected?: boolean;
  dragging?: boolean;
  width?: number;
  height?: number;
  canvas$: FlowCanvasModel;
  // data: FlowNode;
  onClick?: (node: FlowNodeModel<T>) => void;
  onDoubleClick?: (node: FlowNodeModel<T>) => void;
}

export interface FlowNodeState<T extends any> {
  dragging: boolean;
  selected: boolean;
  focused: boolean;
  position: {
    x: number;
    y: number;
  };
}

export class FlowNodeModel<T extends any = {}> extends BaseDomain<
  TheTypesOfEvents<T>
> {
  id: string;
  type: string;
  label: string;
  data: T;

  focused: boolean = false;
  selected: boolean = false;
  dragging: boolean = false;
  position: {
    x: number;
    y: number;
  };
  width: number;
  height: number;

  private handleRects: Map<string, DOMRect> = new Map();
  private dragStartPos: { x: number; y: number } | null = null;
  private nodeStartPos: { x: number; y: number } | null = null;

  canvas$: FlowCanvasModel;

  get state(): FlowNodeState<T> {
    return {
      dragging: false,
      selected: this.selected || false,
      focused: this.focused,
      position: this.position,
    };
  }

  constructor(props: FlowNodeModelProps<T>) {
    super({ unique_id: `FlowNodeCore-${props.id}` });
    const {
      id,
      type,
      position,
      width,
      height,
      data,
      canvas$,
      onClick,
      onDoubleClick,
    } = props;

    this.id = id;
    this.type = type;
    this.position = position ?? {
      x: 0,
      y: 0,
    };
    this.width = width;
    this.height = height;
    this.data = data;
    this.canvas$ = canvas$;

    if (onClick) {
      this.on(Events.Click, onClick);
    }
    if (onDoubleClick) {
      this.on(Events.DoubleClick, onDoubleClick);
    }
  }

  setCanvas$(v: FlowCanvasModel) {
    this.canvas$ = v;
  }

  updateData(patch: Partial<T>): void {
    this.data = {
      // @ts-ignore
      ...this.data,
      ...patch,
    };
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
    this.emit(Events.Click, this as FlowNodeModel<T>);
  }

  doubleClick(): void {
    this.emit(Events.DoubleClick, this as FlowNodeModel<T>);
  }

  startDrag(clientX: number, clientY: number): void {
    this.dragStartPos = { x: clientX, y: clientY };
    this.nodeStartPos = { ...this.position };
    this.dragging = true;
  }

  drag(clientX: number, clientY: number, zoom: number = 1): void {
    if (!this.dragStartPos || !this.nodeStartPos) return;

    const deltaX = (clientX - this.dragStartPos.x) / zoom;
    const deltaY = (clientY - this.dragStartPos.y) / zoom;

    this.position = {
      x: this.nodeStartPos.x + deltaX,
      y: this.nodeStartPos.y + deltaY,
    };
  }

  stopDrag(): void {
    this.dragStartPos = null;
    this.nodeStartPos = null;
    this.dragging = false;
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

  toJSON() {
    return {
      id: this.id,
      position: this.position,
      width: this.width,
      height: this.height,
      data: this.data,
    };
  }

  handleMounted(event: {
    data: { x: number; y: number; width: number; height: number };
  }) {
    this.position = {
      x: event.data.x,
      y: event.data.y,
    };
    this.width = event.data.width;
    this.height = event.data.height;
    this.emit(Events.Mounted, event);
  }

  onMounted(handler: Handler<TheTypesOfEvents<T>[Events.Mounted]>) {
    return this.on(Events.Mounted, handler);
  }
  onPositionChange(
    handler: Handler<TheTypesOfEvents<T>[Events.PositionChange]>,
  ): () => void {
    return this.on(Events.PositionChange, handler);
  }
  onClick(handler: Handler<TheTypesOfEvents<T>[Events.Click]>): () => void {
    return this.on(Events.Click, handler);
  }
  onDoubleClick(
    handler: Handler<TheTypesOfEvents<T>[Events.DoubleClick]>,
  ): () => void {
    return this.on(Events.DoubleClick, handler);
  }
  onFocusedChange(
    handler: Handler<TheTypesOfEvents<T>[Events.FocusedChange]>,
  ): () => void {
    return this.on(Events.FocusedChange, handler);
  }
  onStateChange(
    handler: Handler<TheTypesOfEvents<T>[Events.StateChange]>,
  ): () => void {
    return this.on(Events.StateChange, handler);
  }
}

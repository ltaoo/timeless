import { BaseDomain, Handler } from "@timeless/inner-base";

import type { FlowCanvasModel, FlowHandle } from "./index";
import type { FlowHandleModel } from "./handle";
import { CanvasPointer } from "../pointer";

enum Events {
  Mounted,
  Click,
  DoubleClick,
  FocusedChange,
  PositionChange,
  StateChange,
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

export type NodeExecutionStatus =
  | "pending"
  | "running"
  | "completed"
  | "failed"
  | "skipped";

export interface FlowNodeExecutionData {
  status: NodeExecutionStatus;
  input?: any;
  output?: any;
  logs?: Array<{
    timestamp: Date;
    level: "debug" | "info" | "warn" | "error";
    message: string;
  }>;
  error?: { message: string; stack?: string };
  timing?: { startTime?: Date; endTime?: Date; duration?: number };
  retries?: {
    attempt: number;
    history: Array<{ timestamp: Date; error: string }>;
  };
}

export interface FlowNodeModelProps<T extends any> {
  id: string;
  type?: string;
  position: { x: number; y: number };
  data: T;
  selected?: boolean;
  dragging?: boolean;
  width?: number;
  height?: number;
  handles?: (FlowHandle | FlowHandleModel)[];
  canvas$?: FlowCanvasModel;
  execution?: FlowNodeExecutionData;
  onClick?: (node: FlowNodeModel<T>) => void;
  onDoubleClick?: (node: FlowNodeModel<T>) => void;
}

export interface FlowNodeState<T extends any> {
  dragging: boolean;
  selected: boolean;
  focused: boolean;
  hovering: boolean;
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
  handles: FlowHandleModel[];

  focused: boolean = false;
  selected: boolean = false;
  dragging: boolean = false;
  hovering: boolean = false;
  position: {
    x: number;
    y: number;
  };
  width: number;
  height: number;

  execution: FlowNodeExecutionData = {
    status: "pending",
    logs: [],
  };

  private handleRects: Map<string, DOMRect> = new Map();
  private dragStartPos: { x: number; y: number } | null = null;
  private nodeStartPos: { x: number; y: number } | null = null;
  private _pointer: CanvasPointer;

  canvas$: FlowCanvasModel;

  get state(): FlowNodeState<T> {
    return {
      dragging: this.dragging,
      selected: this.selected || false,
      focused: this.focused,
      hovering: this.hovering,
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
      handles,
      canvas$,
      execution,
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
    this.handles = (handles || []) as FlowHandleModel[];
    this.canvas$ = canvas$;
    this.execution = execution || { status: "pending", logs: [] };

    this._pointer = CanvasPointer({});
    this._pointer.onMove((moveData) => {
      if (this.dragging && this.nodeStartPos) {
        const zoom = this.canvas$?.viewport?.zoom || 1;
        this.position = {
          x: this.nodeStartPos.x + moveData.dx / zoom,
          y: this.nodeStartPos.y + moveData.dy / zoom,
        };
        this.emit(Events.PositionChange, this.position);
      }
    });

    if (onClick) {
      this.on(Events.Click, onClick);
    }
    if (onDoubleClick) {
      this.on(Events.DoubleClick, onDoubleClick);
    }
  }

  updateExecution(patch: Partial<FlowNodeExecutionData>): void {
    this.execution = { ...this.execution, ...patch };
  }

  setExecutionStatus(status: NodeExecutionStatus): void {
    this.execution.status = status;
    if (status === "running" && !this.execution.timing?.startTime) {
      this.execution.timing = { startTime: new Date() };
    }
    if (
      (status === "completed" || status === "failed" || status === "skipped") &&
      !this.execution.timing?.endTime
    ) {
      this.execution.timing = {
        ...this.execution.timing,
        endTime: new Date(),
      };
      if (this.execution.timing?.startTime) {
        this.execution.timing.duration =
          this.execution.timing.endTime.getTime() -
          this.execution.timing.startTime.getTime();
      }
    }
  }

  addLog(level: "debug" | "info" | "warn" | "error", message: string): void {
    if (!this.execution.logs) {
      this.execution.logs = [];
    }
    this.execution.logs.push({
      timestamp: new Date(),
      level,
      message,
    });
  }

  setCanvas$(v: FlowCanvasModel) {
    this.canvas$ = v;
  }

  pointerDown(x: number, y: number): void {
    this.nodeStartPos = { ...this.position };
    this.dragging = true;
    this._pointer.handleMouseDown({ x, y });
  }

  pointerMove(x: number, y: number): void {
    this._pointer.handleMouseMove({ x, y });
  }

  pointerUp(x: number, y: number): void {
    this._pointer.handleMouseUp({ x, y });
    this.dragging = false;
    this.nodeStartPos = null;
  }

  getPointer(): CanvasPointer {
    return this._pointer;
  }

  updateData(patch: Partial<T>): void {
    this.data = {
      // @ts-ignore
      ...this.data,
      ...patch,
    };
  }

  setHovering(value: boolean): void {
    if (this.hovering === value) return;
    this.hovering = value;
    this.emit(Events.StateChange, this.state);
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
    if (this._pointer && this._pointer.dragging) {
      const moving = this._pointer.instanceOfMoving;
      this.position = {
        x: (this.nodeStartPos?.x || this.position.x) + moving.x / zoom,
        y: (this.nodeStartPos?.y || this.position.y) + moving.y / zoom,
      };
      return;
    }
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

  setHandlers(handlers: FlowHandleModel[]) {
    this.handles = [...handlers];
    this.emit(Events.StateChange, { ...this.state });
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
      type: this.type,
      position: this.position,
      width: this.width,
      height: this.height,
      data: this.data,
      execution: this.execution,
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
  ) {
    return this.on(Events.PositionChange, handler);
  }
  onClick(handler: Handler<TheTypesOfEvents<T>[Events.Click]>) {
    return this.on(Events.Click, handler);
  }
  onDoubleClick(handler: Handler<TheTypesOfEvents<T>[Events.DoubleClick]>) {
    return this.on(Events.DoubleClick, handler);
  }
  onFocusedChange(handler: Handler<TheTypesOfEvents<T>[Events.FocusedChange]>) {
    return this.on(Events.FocusedChange, handler);
  }
  onStateChange(handler: Handler<TheTypesOfEvents<T>[Events.StateChange]>) {
    return this.on(Events.StateChange, handler);
  }
}

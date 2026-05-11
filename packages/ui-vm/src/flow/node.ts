import { BaseDomain, Handler } from "@timeless/base";
import type { FlowNode } from "./index";

export interface FlowNodeCoreState {
  dragging: boolean;
  selected: boolean;
}

export class FlowNodeCore extends BaseDomain<any> {
  data: FlowNode;
  private handleRects: Map<string, DOMRect> = new Map();
  private dragStartPos: { x: number; y: number } | null = null;
  private nodeStartPos: { x: number; y: number } | null = null;

  constructor(data: FlowNode) {
    super({ unique_id: `FlowNodeCore-${data.id}` });
    this.data = data;
  }

  get state(): FlowNodeCoreState {
    return {
      dragging: this.data.dragging || false,
      selected: this.data.selected || false,
    };
  }

  updateData(patch: Partial<FlowNode>): void {
    this.data = { ...this.data, ...patch };
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
    return this.on("PositionChange" as any, handler);
  }

  onStateChange(handler: Handler<FlowNodeCoreState>): () => void {
    return this.on("StateChange" as any, handler);
  }
}

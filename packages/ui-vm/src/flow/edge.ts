import { BaseDomain, Handler } from "@timeless/base";
import type { FlowEdge } from "./index";
import { FlowNodeModel } from "./node";

type HandlePosition = "top" | "right" | "bottom" | "left";

export interface FlowEdgeModelProps {
  id: string;
  source: FlowNodeModel;
  target: FlowNodeModel;
  sourceHandle?: string;
  targetHandle?: string;
  sourcePosition?: HandlePosition;
  targetPosition?: HandlePosition;
  type?: FlowEdge["type"];
  label?: string;
  animated?: boolean;
}

enum Events {
  PathChange = "PathChange",
  SelectedChange = "SelectedChange",
  StateChange = "StateChange",
}

type TheTypesOfEvents = {
  [Events.PathChange]: string;
  [Events.SelectedChange]: boolean;
  [Events.StateChange]: FlowEdgeState;
};

export interface FlowEdgeState {
  d: string;
  selected: boolean;
  animated: boolean;
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
}

export class FlowEdgeModel extends BaseDomain<TheTypesOfEvents> {
  id: string;
  source: FlowNodeModel;
  target: FlowNodeModel;
  sourceHandle?: string;
  targetHandle?: string;
  sourcePosition: HandlePosition;
  targetPosition: HandlePosition;
  type: FlowEdge["type"];
  label?: string;
  animated: boolean;
  selected: boolean = false;

  d: string = "";
  sourceX: number = 0;
  sourceY: number = 0;
  targetX: number = 0;
  targetY: number = 0;

  constructor(props: FlowEdgeModelProps) {
    super({ unique_id: `FlowEdge-${props.id}` });
    this.id = props.id;
    this.source = props.source;
    this.target = props.target;
    this.sourceHandle = props.sourceHandle;
    this.targetHandle = props.targetHandle;
    this.sourcePosition = props.sourcePosition || "right";
    this.targetPosition = props.targetPosition || "left";
    this.type = props.type || "bezier";
    this.label = props.label;
    this.animated = props.animated || false;

    this.computePath();
  }

  get state(): FlowEdgeState {
    return {
      d: this.d,
      selected: this.selected,
      animated: this.animated,
      sourceX: this.sourceX,
      sourceY: this.sourceY,
      targetX: this.targetX,
      targetY: this.targetY,
    };
  }

  toggle() {
    if (this.selected) {
      this.deselect();
      return;
    }
    this.select();
  }
  select(): void {
    if (this.selected) {
      return;
    }
    this.selected = true;
    this.emit(Events.SelectedChange, true);
    this.emit(Events.StateChange, this.state);
  }

  deselect(): void {
    if (!this.selected) {
      return;
    }
    this.selected = false;
    this.emit(Events.SelectedChange, false);
    this.emit(Events.StateChange, this.state);
  }

  computePath(): void {
    const { x: sx, y: sy } = this.getAnchorPoint(
      this.source,
      this.sourcePosition,
    );
    const { x: tx, y: ty } = this.getAnchorPoint(
      this.target,
      this.targetPosition,
    );

    this.sourceX = sx;
    this.sourceY = sy;
    this.targetX = tx;
    this.targetY = ty;

    const prevD = this.d;

    switch (this.type) {
      case "straight":
        this.d = this.buildStraightPath(sx, sy, tx, ty);
        break;
      case "step":
        this.d = this.buildStepPath(sx, sy, tx, ty);
        break;
      case "smoothstep":
        this.d = this.buildSmoothStepPath(sx, sy, tx, ty);
        break;
      case "bezier":
      default:
        this.d = this.buildBezierPath(sx, sy, tx, ty);
        break;
    }

    if (this.d !== prevD) {
      this.emit(Events.PathChange, this.d);
      this.emit(Events.StateChange, this.state);
    }
  }

  private getAnchorPoint(
    node: FlowNodeModel,
    position: HandlePosition,
  ): { x: number; y: number } {
    const w = node.width || 150;
    const h = node.height || 80;
    const { x, y } = node.position;

    switch (position) {
      case "top":
        return { x: x + w / 2, y };
      case "bottom":
        return { x: x + w / 2, y: y + h };
      case "left":
        return { x, y: y + h / 2 };
      case "right":
        return { x: x + w, y: y + h / 2 };
    }
  }

  private buildStraightPath(
    sx: number,
    sy: number,
    tx: number,
    ty: number,
  ): string {
    return `M ${sx} ${sy} L ${tx} ${ty}`;
  }

  private buildBezierPath(
    sx: number,
    sy: number,
    tx: number,
    ty: number,
  ): string {
    const { cx1, cy1, cx2, cy2 } = this.getControlPoints(sx, sy, tx, ty);
    return `M ${sx} ${sy} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${tx} ${ty}`;
  }

  private buildStepPath(
    sx: number,
    sy: number,
    tx: number,
    ty: number,
  ): string {
    const { mx, my } = this.getMidPoint(sx, sy, tx, ty);

    if (this.isHorizontal(this.sourcePosition)) {
      return `M ${sx} ${sy} L ${mx} ${sy} L ${mx} ${ty} L ${tx} ${ty}`;
    }
    return `M ${sx} ${sy} L ${sx} ${my} L ${tx} ${my} L ${tx} ${ty}`;
  }

  private buildSmoothStepPath(
    sx: number,
    sy: number,
    tx: number,
    ty: number,
  ): string {
    const borderRadius = 5;
    const { mx, my } = this.getMidPoint(sx, sy, tx, ty);

    if (this.isHorizontal(this.sourcePosition)) {
      const dy = ty - sy;
      const r = Math.min(borderRadius, Math.abs(dy) / 2, Math.abs(mx - sx));
      const ry = dy > 0 ? r : -r;
      const rx1 = mx > sx ? r : -r;
      const rx2 = tx > mx ? r : -r;

      return [
        `M ${sx} ${sy}`,
        `L ${mx - rx1} ${sy}`,
        `Q ${mx} ${sy}, ${mx} ${sy + ry}`,
        `L ${mx} ${ty - ry}`,
        `Q ${mx} ${ty}, ${mx + rx2} ${ty}`,
        `L ${tx} ${ty}`,
      ].join(" ");
    }

    const dx = tx - sx;
    const r = Math.min(borderRadius, Math.abs(dx) / 2, Math.abs(my - sy));
    const rx = dx > 0 ? r : -r;
    const ry1 = my > sy ? r : -r;
    const ry2 = ty > my ? r : -r;

    return [
      `M ${sx} ${sy}`,
      `L ${sx} ${my - ry1}`,
      `Q ${sx} ${my}, ${sx + rx} ${my}`,
      `L ${tx - rx} ${my}`,
      `Q ${tx} ${my}, ${tx} ${my + ry2}`,
      `L ${tx} ${ty}`,
    ].join(" ");
  }

  private getControlPoints(
    sx: number,
    sy: number,
    tx: number,
    ty: number,
  ): { cx1: number; cy1: number; cx2: number; cy2: number } {
    const offset = Math.min(Math.abs(tx - sx) * 0.5, 150);

    if (this.isHorizontal(this.sourcePosition)) {
      const dx = this.sourcePosition === "right" ? offset : -offset;
      const dtx = this.targetPosition === "left" ? -offset : offset;
      return { cx1: sx + dx, cy1: sy, cx2: tx + dtx, cy2: ty };
    }

    const dy = this.sourcePosition === "bottom" ? offset : -offset;
    const dty = this.targetPosition === "top" ? -offset : offset;
    return { cx1: sx, cy1: sy + dy, cx2: tx, cy2: ty + dty };
  }

  private getMidPoint(
    sx: number,
    sy: number,
    tx: number,
    ty: number,
  ): { mx: number; my: number } {
    return { mx: (sx + tx) / 2, my: (sy + ty) / 2 };
  }

  private isHorizontal(position: HandlePosition): boolean {
    return position === "left" || position === "right";
  }

  onPathChange(handler: Handler<string>): () => void {
    return this.on(Events.PathChange, handler);
  }

  onSelectedChange(handler: Handler<boolean>): () => void {
    return this.on(Events.SelectedChange, handler);
  }

  onStateChange(handler: Handler<FlowEdgeState>): () => void {
    return this.on(Events.StateChange, handler);
  }
}

import { BaseDomain, Handler } from "@timeless/inner-base";

import type { FlowNodeModel } from "./node";
import type { FlowEdgeModel } from "./edge";

type HandlePosition = "top" | "right" | "bottom" | "left";

enum Events {
  StateChange = "StateChange",
}

type TheTypesOfEvents = {
  [Events.StateChange]: FlowHandleState;
};

export interface FlowHandleModelProps {
  id: string;
  type: "source" | "target";
  position?: HandlePosition;
  idx: number;
  node: FlowNodeModel;
  edge: FlowEdgeModel;
}

export interface FlowHandleState {
  id: string;
  type: "source" | "target";
  position: HandlePosition;
  idx: number;
}

export class FlowHandleModel extends BaseDomain<TheTypesOfEvents> {
  id: string;
  type: "source" | "target";
  position: HandlePosition;
  idx: number;
  node: FlowNodeModel;
  edge: FlowEdgeModel;

  get state(): FlowHandleState {
    return {
      id: this.id,
      type: this.type,
      position: this.position,
      idx: this.idx,
    };
  }

  constructor(props: FlowHandleModelProps) {
    super({ unique_id: `FlowHandle-${props.id}` });

    this.id = props.id;
    this.type = props.type;
    this.position = props.position || (props.type === "source" ? "right" : "left");
    this.idx = props.idx;
    this.node = props.node;
    this.edge = props.edge;
  }

  /** 获取 edge 另一端的 FlowNodeModel */
  getFromNode(): FlowNodeModel {
    if (this.type === "source") {
      return this.edge.target;
    }
    return this.edge.source;
  }

  setIdx(idx: number): void {
    if (this.idx === idx) return;
    this.idx = idx;
    this.emit(Events.StateChange, this.state);
  }

  setPosition(position: HandlePosition): void {
    if (this.position === position) return;
    this.position = position;
    this.emit(Events.StateChange, this.state);
  }

  onStateChange(handler: Handler<FlowHandleState>): () => void {
    return this.on(Events.StateChange, handler);
  }
}

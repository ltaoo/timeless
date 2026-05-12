import { View, ViewProps, ViewChildren } from "@timeless/timeless";
import { FlowCanvasModel } from "@timeless/ui-vm";

export function Root(
  props: ViewProps & { store: FlowCanvasModel },
  children?: ViewChildren,
) {
  const { store, ...rest } = props;
  return View(rest, children);
}

export function Canvas(
  props: ViewProps & { store: FlowCanvasModel },
  children?: ViewChildren,
) {
  const { store, ...rest } = props;
  return View(rest, children);
}

export function NodeLayer(props: ViewProps, children?: ViewChildren) {
  const { ...rest } = props;
  return View(rest, children);
}

export function EdgeLayer(props: ViewProps, children?: ViewChildren) {
  const { ...rest } = props;
  return View(rest, children);
}

export function Node(
  props: ViewProps & {
    store: FlowCanvasModel;
    nodeId: string;
  },
  children?: ViewChildren,
) {
  const { store, nodeId, ...rest } = props;
  return View(rest, children);
}

export function Edge(
  props: ViewProps & {
    store: FlowCanvasModel;
    edgeId: string;
  },
  children?: ViewChildren,
) {
  const { store, edgeId, ...rest } = props;
  return View(rest, children);
}

export function Handle(
  props: ViewProps & {
    store: FlowCanvasModel;
    nodeId: string;
    handleId: string;
    type: "source" | "target";
    position?: "top" | "right" | "bottom" | "left";
  },
  children?: ViewChildren,
) {
  const { store, nodeId, handleId, type, position = "right", ...rest } = props;
  return View(rest, children);
}

export function Background(
  props: ViewProps & {
    variant?: "dots" | "lines" | "cross";
    gap?: number;
    size?: number;
    color?: string;
  },
  children?: ViewChildren,
) {
  const {
    variant = "dots",
    gap = 20,
    size = 1,
    color = "#e5e7eb",
    ...rest
  } = props;
  return View(rest, children);
}

export function Minimap(
  props: ViewProps & { store: FlowCanvasModel },
  children?: ViewChildren,
) {
  const { store, ...rest } = props;
  return View(rest, children);
}

export function Controls(
  props: ViewProps & { store: FlowCanvasModel },
  children?: ViewChildren,
) {
  const { store, ...rest } = props;
  return View(rest, children);
}

export type VNodeKind = "element" | "text" | "fragment";
export type VNodeKey = string | number;

export type VNodePlatform =
  | "web"
  | "tui"
  | "canvas"
  | "ios"
  | "android"
  | "macos"
  | "windows";

export interface VNodeStyle {
  width?: number | string;
  height?: number | string;
  minWidth?: number | string;
  minHeight?: number | string;
  maxWidth?: number | string;
  maxHeight?: number | string;

  margin?: number | string;
  marginTop?: number | string;
  marginRight?: number | string;
  marginBottom?: number | string;
  marginLeft?: number | string;
  padding?: number | string;
  paddingTop?: number | string;
  paddingRight?: number | string;
  paddingBottom?: number | string;
  paddingLeft?: number | string;

  position?: "static" | "relative" | "absolute" | "fixed" | "sticky";
  top?: number | string;
  right?: number | string;
  bottom?: number | string;
  left?: number | string;
  zIndex?: number;

  color?: string;
  backgroundColor?: string;
  opacity?: number;

  borderWidth?: number;
  borderStyle?: "none" | "solid" | "dashed" | "dotted";
  borderColor?: string;
  borderRadius?: number;
  borderTopWidth?: number;
  borderRightWidth?: number;
  borderBottomWidth?: number;
  borderLeftWidth?: number;
  borderTopLeftRadius?: number;
  borderTopRightRadius?: number;
  borderBottomLeftRadius?: number;
  borderBottomRightRadius?: number;

  fontSize?: number;
  fontWeight?: number | "bold" | "normal";
  fontFamily?: string;
  fontStyle?: "normal" | "italic";
  lineHeight?: number;
  letterSpacing?: number;
  textAlign?: "left" | "center" | "right" | "justify";
  textDecoration?: "none" | "underline" | "line-through";
  textTransform?: "none" | "capitalize" | "uppercase" | "lowercase";
  maxLines?: number;
  overflow?: "visible" | "hidden";

  pointerEvents?: "auto" | "none";

  transforms?: VNodeTransform[];
  shadows?: VNodeShadow[];

  [key: string]: any;
}

export interface VNodeTransform {
  translate?: { x?: number; y?: number; z?: number };
  rotate?: number;
  rotateX?: number;
  rotateY?: number;
  rotateZ?: number;
  scale?: number | { x?: number; y?: number };
  skew?: { x?: number; y?: number };
}

export interface VNodeShadow {
  color: string;
  offsetX: number;
  offsetY: number;
  blurRadius: number;
  spreadRadius?: number;
}

export interface VNodeA11y {
  label?: string;
  hint?: string;
  role?: string;
  hidden?: boolean;
  value?: string;
  live?: "polite" | "assertive";
}

export type VNodeEventHandler = (event: any) => void;

export type VNodeEvents = Partial<Record<string, VNodeEventHandler>>;

export interface VNodeBase {
  kind: VNodeKind;
  key?: VNodeKey;
  parent: VNodeElement | VNodeFragment | null;
  nextSibling: VNode | null;
  _hostNode?: any;
}

export interface VNodeElement extends VNodeBase {
  kind: "element";
  tag: string;
  style: VNodeStyle;
  stylePresets: string[];
  attrs: Record<string, string | boolean | number>;
  props: Record<string, any>;
  events: VNodeEvents;
  children: VNode[];
  focusable?: boolean;
  draggable?: boolean;
  a11y?: VNodeA11y;
  platform?: {
    web?: Record<string, any>;
    ios?: Record<string, any>;
    android?: Record<string, any>;
    macos?: Record<string, any>;
    windows?: Record<string, any>;
  };
}

export interface VNodeText extends VNodeBase {
  kind: "text";
  text: string;
}

export interface VNodeFragment extends VNodeBase {
  kind: "fragment";
  children: VNode[];
}

export type VNode = VNodeElement | VNodeText | VNodeFragment;

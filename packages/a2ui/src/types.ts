import { RefArray } from "@timeless/timeless";
import {
  SingleFieldCore,
  ObjectFieldCore,
  InputCore,
  SelectCore,
  CheckboxCore,
  ButtonCore,
} from "@timeless/ui-vm";

/** Component types mapping to Timeless components */
export type UINodeType =
  | "view"
  | "field"
  | "input"
  | "select"
  | "checkbox"
  | "button"
  | "textarea"
  | "separator"
  | "text"
  | "row"
  | "col";

/** A single UI node in the schema tree */
export interface UINode {
  id: string;
  type: UINodeType;
  props?: Record<string, any>;
  children?: UINode[];
}

/** Field-specific props */
export interface FieldProps {
  label: string;
  name: string;
  required?: boolean;
  help?: string;
  rules?: Array<{ required?: boolean; message?: string }>;
  input: {
    type: "input" | "select" | "checkbox" | "textarea";
    defaultValue?: any;
    placeholder?: string;
    options?: Array<{ label: string; value: string }>;
  };
}

/** Stream operations for incremental rendering */
export type StreamOp =
  | { op: "root"; node: UINode }
  | { op: "append"; parentId: string; node: UINode }
  | { op: "insert"; parentId: string; index: number; node: UINode }
  | { op: "update"; nodeId: string; props: Record<string, any> }
  | { op: "delete"; nodeId: string }
  | { op: "done" };

/** Resolved node stored in the renderer's nodeMap */
export interface ResolvedNode {
  id: string;
  parentId: string | null;
  element: any; // TimelessElement
  children$?: RefArray<any>;
  field$?: SingleFieldCore<any>;
  core?: InputCore<any> | SelectCore<any> | CheckboxCore | ButtonCore;
  schema: UINode;
}

/** Session object returned by renderStream/renderSchema */
export interface A2UISession {
  form$: ObjectFieldCore<any> | null;
  nodeMap: Map<string, ResolvedNode>;
  abort(): void;
  destroy(): void;
  onDone(cb: () => void): void;
}

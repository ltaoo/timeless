import type {
  DerivedRef,
  TimelessElement,
  ViewChildren,
} from "@timeless/timeless";
export type JsonValue =
  | null
  | boolean
  | number
  | string
  | JsonValue[]
  | { [key: string]: JsonValue };
export type ProtocolVersion = "v0.9" | "v0.9.1";
export interface DataBinding {
  path: string;
}
export interface FunctionCall {
  call: string;
  args?: Record<string, unknown>;
  returnType?:
    | "string"
    | "number"
    | "boolean"
    | "array"
    | "object"
    | "any"
    | "void";
}
export type Dynamic<T> = T | DataBinding | FunctionCall;
export type ChildList = string[] | { componentId: string; path: string };
export type Action =
  | { event: { name: string; context?: Record<string, unknown> } }
  | { functionCall: FunctionCall };
export interface CheckRule {
  condition: Dynamic<boolean>;
  message: string;
}
export interface ComponentDefinition {
  id: string;
  component: string;
  accessibility?: { label?: Dynamic<string>; description?: Dynamic<string> };
  weight?: number;
  checks?: CheckRule[];
  [property: string]: unknown;
}
export interface SurfaceDefinition {
  surfaceId: string;
  catalogId: string;
  theme?: Record<string, JsonValue>;
  sendDataModel?: boolean;
}
export type ServerMessage = { version: ProtocolVersion } & (
  | { createSurface: SurfaceDefinition }
  | {
      updateComponents: {
        surfaceId: string;
        components: ComponentDefinition[];
      };
    }
  | { updateDataModel: { surfaceId: string; path?: string; value?: JsonValue } }
  | { deleteSurface: { surfaceId: string } }
);
export type ClientMessage = { version: ProtocolVersion } & (
  | {
      action: {
        name: string;
        surfaceId: string;
        sourceComponentId: string;
        timestamp: string;
        context: Record<string, JsonValue>;
      };
    }
  | {
      error: {
        code: string;
        surfaceId: string;
        path?: string;
        message: string;
      };
    }
);
export interface TransportMetadata {
  a2uiClientCapabilities: { supportedCatalogIds: string[] };
  a2uiClientDataModel?: { surfaces: Record<string, JsonValue> };
}
export interface ComponentContext {
  definition: ComponentDefinition;
  surface: SurfaceDefinition;
  scope: string;
  bind<T>(expression: unknown, convert: (value: unknown) => T): DerivedRef<T>;
  watch<T>(read: () => T): DerivedRef<T>;
  read(expression: unknown): unknown;
  input(): unknown;
  write(value: JsonValue): void;
  errors(): string[];
  act(action: Action): void;
  child(id: string): TimelessElement;
  children(children: ChildList): TimelessElement;
  local(key: string, fallback: JsonValue): unknown;
  setLocal(key: string, value: JsonValue): void;
  onCleanup(cleanup: () => void): void;
}
export type ComponentFactory = (context: ComponentContext) => ViewChildren;
export interface FunctionContext {
  read(path: string): unknown;
  call(name: string, args: Record<string, unknown>): unknown;
  locale?: string;
}
export interface ClientFunction {
  execute(args: Record<string, unknown>, context: FunctionContext): unknown;
  actionOnly?: boolean;
}
export interface Catalog {
  id: string;
  schema: Record<string, unknown>;
  components: Record<string, ComponentFactory>;
  functions: Record<string, ClientFunction>;
}
export interface A2UIOptions {
  catalogs?: Catalog[];
  locale?: string;
  onClientMessage?: (
    message: ClientMessage,
    metadata: TransportMetadata,
  ) => void;
  onOpenUrl?: (url: string) => void;
}

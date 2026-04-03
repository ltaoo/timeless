declare module "@timeless/timeless" {
  export type HeadlessHost = any;
  export type TimelessElement = any;
  export function isElement(v: unknown): v is TimelessElement;
  export function setHost(host: any): void;
  export function registerComponent(original: Function, replacement: Function): void;
  export function getRenderer(): any;
  export function getRendererScheduler(): any;

  export const Grid: any;
  export const View: any;
  export const Txt: any;

  export const InputPrimitive: any;
  export const ButtonPrimitive: any;
  export const CheckboxPrimitive: any;
  export const RadioPrimitive: any;
  export const NativeInput: any;

  export const VNode: any;

  export const isRef: any;
  export const sn: any;
  export const ref: any;
  export const refobj: any;
  export const computed: any;
  export const isStyleRef: any;
}

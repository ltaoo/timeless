declare module "@timeless/timeless" {
  export type HeadlessHost = any;
  export type TimelessElement = any;
  export function setHost(host: any): void;
  export function isElement(v: unknown): v is TimelessElement;
}

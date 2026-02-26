declare module "@timeless/reactive" {
  export interface Ref<T = any> {
    value: T;
    subscribe?: (fn: (v: T) => void) => () => void;
    [key: string]: any;
  }

  export function ref<T>(v: T): Ref<T>;

  export function computed<T>(
    deps: Record<string, Ref<any> | any>,
    fn: (depsValues: any) => T
  ): Ref<T>;

  export function isRef(v: any): boolean;
  export function isComponent(v: any): boolean;
  export function classnames(...args: any[]): string;
  export function watch(deps: any, fn: any): any;
}

export interface Subscriber {
  onChange: (v: any) => void;
  onPatch?: (c: any) => void;
  ignore?: boolean;
}

export type Ref<T> = {
  __is_ref: true;
  _subscribe: (ctx: Subscriber) => void;
  _destroy: () => void;
  value: T;
};

export interface ClassNameRef {
  __cn_ref: true;
  _subscribe(ctx: Subscriber): void;
  del(v: string): void;
  add(v: string): void;
  append(c: string): void;
  toString(): string;
}

export interface StyleRef {
  __style_ref: true;
  _subscribe(ctx: Subscriber): void;
  toString(): string;
}

export function isRef(v: any): v is Ref<any> {
  if (v === null) {
    return false;
  }
  if (v === undefined) {
    return false;
  }
  if (v.__is_ref) {
    return true;
  }
  return false;
}

export function isClassName(v: any): v is ClassNameRef {
  if (v === null || v === undefined) {
    return false;
  }
  if (v.__cn_ref) {
    return true;
  }
  return false;
}

export function isStyleRef(v: any): v is StyleRef {
  if (v === null || v === undefined) {
    return false;
  }
  if (v.__style_ref) {
    return true;
  }
  return false;
}

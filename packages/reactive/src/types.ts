export type Subscriber = {
  onChange: (v: any) => void;
  onPatch?: (c: any) => void;
  ignore?: boolean;
};

export type TimelessRef<T> = {
  __is_ref: true;
  _subscribe: (ctx: Subscriber) => void;
  _destroy: () => void;
  value: T;
  eq: (v: T) => boolean;
  isSame: (v: unknown) => boolean;
  isStrictEqual: (v: unknown) => boolean;
  as: (value: T | ((cur: T) => T)) => void;
};

export type TimelessRefObject<T> = {
  __is_ref: true;
  _subscribe: (ctx: Subscriber) => void;
  _destroy: () => void;
  value: T;
  isSame: (v: unknown) => boolean;
  isStrictEqual: (v: unknown) => boolean;
  set: (key: keyof T, item: any) => void;
  get: (key: keyof T) => any;
  delete: (key: keyof T) => void;
  as: (nextObj: T | ((cur: T) => T)) => void;
  assign: (updated: Partial<T>) => void;
  refresh: () => void;
};

export type TimelessRefObjectNullable<T> = {
  __is_ref: true;
  _subscribe: (ctx: Subscriber) => void;
  _destroy: () => void;
  value: T | null;
  isSame: (v: unknown) => boolean;
  isStrictEqual: (v: unknown) => boolean;
  set: (key: keyof T, item: any) => void;
  get: (key: keyof T) => any;
  delete: (key: keyof T) => void;
  as: (nextObj: T | ((cur: T | null) => T)) => void;
  refresh: () => void;
};

export type TimelessRefArray<T> = {
  __is_ref: true;
  _subscribe: (ctx: Subscriber) => void;
  _destroy: () => void;
  value: T[];
  isSame: (v: unknown) => boolean;
  isStrictEqual: (v: unknown) => boolean;
  key: any;
  length: number;
  get: (idx: number) => any;
  set: (idx: number, item: any) => void;
  splice: (idx: number, dcount: number, ...items: any[]) => any[];
  insert: (idx: number, ...items: any[]) => number;
  push: (...items: any[]) => number;
  unshift: (...items: any[]) => number;
  pop: () => any;
  shift: () => any;
  delete: (idx: number) => void;
  remove: (item: T) => void;
  as: (items: T[] | ((cur: T[]) => T[])) => void;
  assign: (items: T[]) => void;
  refresh: () => void;
  filter: (predicate: (item: T, index: number, array: T[]) => boolean) => any[];
  includes: (item: T) => boolean;
  reverse: () => TimelessRefArray<T>;
  sort: (compareFn?: (a: T, b: T) => number) => TimelessRefArray<T>;
  fill: (value: T, start?: number, end?: number) => TimelessRefArray<T>;
  copyWithin: (
    target: number,
    start: number,
    end?: number,
  ) => TimelessRefArray<T>;
  concat: (...items: any[]) => T[];
  join: (separator?: string) => string;
  slice: (start?: number, end?: number) => any[];
  indexOf: (searchElement: T, fromIndex?: number) => number;
  lastIndexOf: (searchElement: T, fromIndex?: number) => number;
  every: (
    predicate: (value: T, index: number, array: T[]) => unknown,
    thisArg?: any,
  ) => boolean;
  some: (
    predicate: (value: T, index: number, array: T[]) => unknown,
    thisArg?: any,
  ) => boolean;
  forEach: (
    callbackfn: (value: T, index: number, array: T[]) => void,
    thisArg?: any,
  ) => void;
  map: <U>(
    callbackfn: (value: T, index: number, array: T[]) => U,
    thisArg?: any,
  ) => U[];
  reduce: (callbackfn: any, initialValue?: any) => any;
  reduceRight: (callbackfn: any, initialValue?: any) => any;
  find: (
    predicate: (value: T, index: number, obj: T[]) => unknown,
    thisArg?: any,
  ) => any;
  findIndex: (
    predicate: (value: T, index: number, obj: T[]) => unknown,
    thisArg?: any,
  ) => number;
  entries: () => IterableIterator<[number, T]>;
  keys: () => IterableIterator<number>;
  values: () => IterableIterator<T>;
  flat: (depth?: number) => any[];
  flatMap: (callback: any, thisArg?: any) => any[];
  [Symbol.iterator]: () => Iterator<T>;
};

export type Ref<T> = {
  __is_ref: true;
  _subscribe: (ctx: Subscriber) => void;
  _destroy: () => void;
  value: T;
  isSame: (v: unknown) => boolean;
  isStrictEqual: (v: unknown) => boolean;
};

export type ClassNameRef = {
  __cn_ref: true;
  _subscribe(ctx: Subscriber): void;
  del(v: string): void;
  add(v: string): void;
  append(c: string): void;
  toString(): string;
};

export type StyleRef = {
  __style_ref: true;
  _subscribe(ctx: Subscriber): void;
  toString(): string;
};

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

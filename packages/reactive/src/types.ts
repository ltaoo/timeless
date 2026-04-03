export type Subscriber = {
  onChange: (v: unknown) => void;
  onPatch?: (c: unknown) => void;
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
  set: (value: T) => void;
  update: (fn: (current: T) => T) => void;
  reset: () => void;
  toggle: () => boolean;
  increment: (amount?: number) => number;
  decrement: (amount?: number) => number;
  append: (suffix: string) => string;
  prepend: (prefix: string) => string;
  clear: () => void;
  clone: () => T;
  isNullish: () => boolean;
};

export type TimelessRefObject<T> = {
  __is_ref: true;
  _subscribe: (ctx: Subscriber) => void;
  _destroy: () => void;
  value: T;
  isSame: (v: unknown) => boolean;
  isStrictEqual: (v: unknown) => boolean;
  set: (
    key: keyof T,
    item: T[keyof T] | ((current: T[keyof T]) => T[keyof T]),
  ) => void;
  get: (key: keyof T) => unknown;
  delete: (key: keyof T) => void;
  as: (nextObj: T | ((cur: T) => T)) => void;
  assign: (updated: Partial<T>) => void;
  refresh: () => void;
  has: (key: keyof T) => boolean;
  keys: () => (keyof T)[];
  values: () => T[keyof T][];
  entries: () => [keyof T, T[keyof T]][];
  isEmpty: () => boolean;
  size: () => number;
  pick: <K extends keyof T>(...keys: K[]) => Pick<T, K>;
  omit: <K extends keyof T>(...keys: K[]) => Omit<T, K>;
  toggle: (key: keyof T) => void;
  increment: (key: keyof T, amount?: number) => void;
  decrement: (key: keyof T, amount?: number) => void;
  clear: () => void;
  merge: (source: Partial<T>) => void;
  clone: () => T;
  renameKey: (oldKey: keyof T, newKey: string) => void;
  mapValues: <U>(
    fn: (value: T[keyof T], key: keyof T) => U,
  ) => Record<string, U>;
  toJSON: () => T;
  getIn: (path: string) => unknown;
  setIn: (path: string, value: unknown) => void;
  hasIn: (path: string) => boolean;
  update: (key: keyof T, fn: (current: T[keyof T]) => T[keyof T]) => void;
};

export type TimelessRefObjectNullable<T> = {
  __is_ref: true;
  _subscribe: (ctx: Subscriber) => void;
  _destroy: () => void;
  value: T | null;
  isSame: (v: unknown) => boolean;
  isStrictEqual: (v: unknown) => boolean;
  set: (
    key: keyof T,
    item: T[keyof T] | ((current: T[keyof T]) => T[keyof T]),
  ) => void;
  get: (key: keyof T) => unknown;
  delete: (key: keyof T) => void;
  as: (nextObj: T | ((cur: T | null) => T)) => void;
  refresh: () => void;
  has: (key: keyof T) => boolean;
  keys: () => (keyof T)[];
  values: () => T[keyof T][];
  entries: () => [keyof T, T[keyof T]][];
  isEmpty: () => boolean;
  size: () => number;
  pick: <K extends keyof T>(...keys: K[]) => Pick<T, K> | null;
  omit: <K extends keyof T>(...keys: K[]) => Omit<T, K> | null;
  toggle: (key: keyof T) => void;
  increment: (key: keyof T, amount?: number) => void;
  decrement: (key: keyof T, amount?: number) => void;
  clear: () => void;
  merge: (source: Partial<T>) => void;
  clone: () => T | null;
  renameKey: (oldKey: keyof T, newKey: string) => void;
  mapValues: <U>(
    fn: (value: T[keyof T], key: keyof T) => U,
  ) => Record<string, U>;
  toJSON: () => T | null;
  getIn: (path: string) => unknown;
  setIn: (path: string, value: unknown) => void;
  hasIn: (path: string) => boolean;
  update: (key: keyof T, fn: (current: T[keyof T]) => T[keyof T]) => void;
};

export type TimelessRefArray<T> = {
  __is_ref: true;
  _subscribe: (ctx: Subscriber) => void;
  _destroy: () => void;
  value: T[];
  isSame: (v: unknown) => boolean;
  isStrictEqual: (v: unknown) => boolean;
  key: unknown;
  length: number;
  get: (idx: number) => T | undefined;
  set: (idx: number, item: T) => void;
  splice: (idx: number, dcount: number, ...items: T[]) => T[];
  insert: (idx: number, ...items: T[]) => number;
  push: (...items: T[]) => number;
  unshift: (...items: T[]) => number;
  pop: () => T | undefined;
  shift: () => T | undefined;
  delete: (idx: number) => void;
  remove: (item: T) => void;
  as: (items: T[] | ((cur: T[]) => T[])) => void;
  assign: (items: T[]) => void;
  refresh: () => void;
  filter: (predicate: (item: T, index: number, array: T[]) => boolean) => T[];
  includes: (item: T) => boolean;
  reverse: () => TimelessRefArray<T>;
  sort: (compareFn?: (a: T, b: T) => number) => TimelessRefArray<T>;
  fill: (value: T, start?: number, end?: number) => TimelessRefArray<T>;
  copyWithin: (
    target: number,
    start: number,
    end?: number,
  ) => TimelessRefArray<T>;
  concat: (...items: (ConcatArray<T> | T)[]) => T[];
  join: (separator?: string) => string;
  slice: (start?: number, end?: number) => T[];
  indexOf: (searchElement: T, fromIndex?: number) => number;
  lastIndexOf: (searchElement: T, fromIndex?: number) => number;
  every: (
    predicate: (value: T, index: number, array: T[]) => unknown,
    thisArg?: unknown,
  ) => boolean;
  some: (
    predicate: (value: T, index: number, array: T[]) => unknown,
    thisArg?: unknown,
  ) => boolean;
  forEach: (
    callbackfn: (value: T, index: number, array: T[]) => void,
    thisArg?: unknown,
  ) => void;
  map: <U>(
    callbackfn: (value: T, index: number, array: T[]) => U,
    thisArg?: unknown,
  ) => U[];
  reduce: {
    <U>(
      callbackfn: (
        previousValue: U,
        currentValue: T,
        currentIndex: number,
        array: T[],
      ) => U,
      initialValue: U,
    ): U;
    (
      callbackfn: (
        previousValue: T,
        currentValue: T,
        currentIndex: number,
        array: T[],
      ) => T,
    ): T;
  };
  reduceRight: {
    <U>(
      callbackfn: (
        previousValue: U,
        currentValue: T,
        currentIndex: number,
        array: T[],
      ) => U,
      initialValue: U,
    ): U;
    (
      callbackfn: (
        previousValue: T,
        currentValue: T,
        currentIndex: number,
        array: T[],
      ) => T,
    ): T;
  };
  find: (
    predicate: (value: T, index: number, obj: T[]) => unknown,
    thisArg?: unknown,
  ) => T | undefined;
  findIndex: (
    predicate: (value: T, index: number, obj: T[]) => unknown,
    thisArg?: unknown,
  ) => number;
  entries: () => IterableIterator<[number, T]>;
  keys: () => IterableIterator<number>;
  values: () => IterableIterator<T>;
  flat(depth?: number): any[];
  flatMap: (
    callback: (value: T, index: number, array: T[]) => unknown,
    thisArg?: unknown,
  ) => any[];
  [Symbol.iterator]: () => Iterator<T>;

  move: (fromIndex: number, toIndex: number) => TimelessRefArray<T>;
  swap: (indexA: number, indexB: number) => TimelessRefArray<T>;
  moveToFirst: (index: number) => TimelessRefArray<T>;
  moveToLast: (index: number) => TimelessRefArray<T>;
  toggle: (item: T) => TimelessRefArray<T>;
  removeBy: (predicate: (item: T, index: number) => boolean) => void;
  clear: () => void;
  replace: (oldItem: T, newItem: T) => boolean;
  prepend: (...items: T[]) => number;
  first: () => T | undefined;
  last: () => T | undefined;
  nth: (index: number) => T | undefined;
  count: (predicate?: (item: T, index: number) => boolean) => number;
  distinct: (keyFn?: (item: T) => unknown) => T[];
  groupBy: (
    keyFn: (item: T) => string | number,
  ) => Record<string | number, T[]>;
  chunk: (size: number) => T[][];
  partition: (predicate: (item: T, index: number) => boolean) => [T[], T[]];
  intersect: (other: T[]) => T[];
  union: (...others: T[][]) => T[];
  diff: (other: T[]) => T[];
  symmetricDiff: (other: T[]) => T[];
  sum: (fn?: (item: T) => number) => number;
  min: (fn?: (item: T) => number) => T | undefined;
  max: (fn?: (item: T) => number) => T | undefined;
  shuffle: () => TimelessRefArray<T>;
  rotate: (n: number) => TimelessRefArray<T>;
  compact: () => T[];
  take: (n: number) => T[];
  skip: (n: number) => T[];
  isEmpty: () => boolean;
  at: (index: number) => T | undefined;
  toArray: () => T[];
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
  readonly value: Record<string, any>;
  _subscribe(ctx: Subscriber): void;
  toString(): string;
};

export function isRef(v: unknown): v is Ref<unknown> {
  if (v === null) {
    return false;
  }
  if (v === undefined) {
    return false;
  }
  if ((v as Record<string, unknown>).__is_ref) {
    return true;
  }
  return false;
}

export function isClassName(v: unknown): v is ClassNameRef {
  if (v === null || v === undefined) {
    return false;
  }
  if ((v as Record<string, unknown>).__cn_ref) {
    return true;
  }
  return false;
}

export function isStyleRef(v: unknown): v is StyleRef {
  if (v === null || v === undefined) {
    return false;
  }
  if ((v as Record<string, unknown>).__style_ref) {
    return true;
  }
  return false;
}

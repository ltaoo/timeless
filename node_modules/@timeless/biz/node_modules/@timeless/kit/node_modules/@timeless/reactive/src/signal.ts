import { get, set } from "./registry";
import type { RefArray } from "./reactive-array";
import type { RefObject } from "./reactive-object";
import { ref } from "./ref";
import { refArray } from "./reactive-array";
import { refObject } from "./reactive-object";
import type { Ref } from "./types";
import { isRef } from "./types";

export type PrimitiveSignal<T> = Ref<T>;

export type ObjectSignal<T extends Record<string, any>> = RefObject<T>;
export type ArraySignal<T> = RefArray<T>;

export type Signal<T> = T extends readonly (infer U)[]
  ? ArraySignal<U>
  : T extends Record<string, any>
    ? ObjectSignal<T>
    : PrimitiveSignal<T>;

export function signal<T extends Ref<any>>(v: T): T;
export function signal<T>(v: T[]): ArraySignal<T>;
export function signal<T extends Record<string, any>>(v: T): ObjectSignal<T>;
export function signal<T>(v: T): PrimitiveSignal<T>;
export function signal(v: any) {
  if (isRef(v)) {
    return v;
  }

  if (Array.isArray(v)) {
    const existing = get(v);
    if (existing) {
      return existing as ArraySignal<any>;
    }
    const r = refArray(v);
    set(v, r);
    return r;
  }

  if (typeof v === "object" && v !== null) {
    const existing = get(v);
    if (existing) {
      return existing as ObjectSignal<any>;
    }
    const r = refObject(v);
    set(v, r);
    return r;
  }

  return ref(v);
}

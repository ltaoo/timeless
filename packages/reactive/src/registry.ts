import { DerivedRef, Ref } from "./types";
import type { RefObject } from "./reactive-object";
import type { RefArray } from "./reactive-array";

const global_refs = new Map<any, DerivedRef<any> | Ref<any>>();
export function release(ref: any) {
  global_refs.delete(ref);
}
export function release_all() {
  global_refs.clear();
}
export function set(key: any, v: DerivedRef<any> | Ref<any>) {
  global_refs.set(key, v);
}
export function deleteKey(key: any) {
  global_refs.delete(key);
}
export function has(v: any) {
  return global_refs.has(v);
}
export function get(v: any) {
  return global_refs.get(v);
}
export function getobj<T extends Record<string, any>>(v: T) {
  return global_refs.get(v) as RefObject<T> | undefined;
}
export function getarr<T>(v: T[]) {
  return global_refs.get(v) as RefArray<T> | undefined;
}

import { Ref } from "./types";

const global_refs = new Map<any, Ref<any>>();
export function uncomputed(ref: Ref<any>) {
  global_refs.delete(ref);
}
export function set(key: any, v: Ref<any>) {
  global_refs.set(key, v);
}
export function has(v: any) {
  return global_refs.has(v);
}
export function get(v: any) {
  return global_refs.get(v);
}
// @ts-ignore
window._global_refs = global_refs;

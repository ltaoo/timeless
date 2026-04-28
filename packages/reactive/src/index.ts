import type {
  Subscriber,
  SubscriberWithId,
  DepInfo,
  Ref,
  DerivedRef,
  TimelessRefArray,
} from "./types";
import type { RefObject } from "./reactive-object";
import type { RefArray } from "./reactive-array";
import type {
  ArraySignal,
  ObjectSignal,
  PrimitiveSignal,
  Signal,
} from "./signal";
import { isRef, isWriteableRef, isArrayRef } from "./types";
import { hmrScope } from "./hmr";
import { ref } from "./ref";
import { refArray } from "./reactive-array";
import { refObject } from "./reactive-object";
import { defineModel } from "./model";
import { signal } from "./signal";
import { computed } from "./computed";
import { derive } from "./derive";
import {
  release,
  get as registryGet,
  set as registrySet,
  getobj as registryGetObj,
  getarr as registryGetArr,
} from "./registry";

let _trackIdCounter = 0;
export function generateTrackId(prefix = "track"): string {
  _trackIdCounter++;
  return `${prefix}-${_trackIdCounter}-${Date.now()}`;
}

export {
  _current_disposables,
  start_tracking,
  stop_tracking,
} from "./disposal";

export function getDeps<T extends { getDeps?: () => any[] }>(ref: T): any[] {
  return ref.getDeps?.() || [];
}

export function dumpDeps<T extends { dump?: () => void }>(ref: T): void {
  ref.dump?.();
}

export interface DependencyDump {
  ref: any;
  deps: DepInfo[];
  value: any;
}

export function dumpAll(refs: any[]): DependencyDump[] {
  return refs.map((ref) => ({
    ref,
    deps: getDeps(ref),
    value: ref.value,
  }));
}

export function printDepTree(refs: any[]): void {
  console.log("\n=== Reactive Dependency Tree ===");
  refs.forEach((ref, i) => {
    const deps = getDeps(ref);
    console.log(`\n[${i}] ref:`, ref.value);
    if (deps.length === 0) {
      console.log("  └── (no subscribers)");
    }
    deps.forEach((dep, j) => {
      const icon = j === deps.length - 1 ? "└──" : "├──";
      console.log(`  ${icon} [${j}] ${dep.trackId}`, dep.trackInfo || "");
    });
  });
  console.log("\n=================================\n");
}

export function findLeakedDeps(refs: any[]): DepInfo[] {
  const allDeps: DepInfo[] = [];
  refs.forEach((ref) => {
    allDeps.push(...getDeps(ref));
  });
  return allDeps;
}

export {
  Subscriber,
  SubscriberWithId,
  DepInfo,
  Ref,
  DerivedRef,
  RefObject,
  RefArray,
  TimelessRefArray,
  Signal,
  PrimitiveSignal,
  ObjectSignal,
  ArraySignal,
  isRef,
  isWriteableRef,
  isArrayRef,
  ref,
  signal,
  refArray as reactiveArray,
  refObject as reactiveObject,
  defineModel,
  computed,
  derive,
  release,
  registryGet,
  registrySet,
  registryGetObj,
  registryGetArr,
  registryGetObj as getobj,
  registryGetArr as getarr,
  derive as combine,
  refArray as refarr,
  refObject as refobj,
  release as uncomputed,
  hmrScope,
};

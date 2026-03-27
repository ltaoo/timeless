// console.log("reactive.version 1.4.0");

import type { Subscriber, Ref, ClassNameRef, StyleRef } from "./types";
import type { RefObject } from "./reactive-object";
import type { RefArray } from "./reactive-array";
import type { ArraySignal, ObjectSignal, PrimitiveSignal, Signal } from "./signal";
import { isRef, isClassName, isStyleRef } from "./types";
import { ref } from "./ref";
import { refArray } from "./reactive-array";
import { refObject } from "./reactive-object";
import { signal } from "./signal";
import { computed } from "./computed";
import { derive } from "./derive";
import { release, get as registryGet, set as registrySet, getobj as registryGetObj, getarr as registryGetArr } from "./registry";
import { classNames } from "./class-names";
import { styleNames } from "./style-names";

export {
  Subscriber,
  Ref,
  RefObject,
  RefArray,
  Signal,
  PrimitiveSignal,
  ObjectSignal,
  ArraySignal,
  isRef,
  ClassNameRef,
  isClassName,
  StyleRef,
  isStyleRef,
  ref,
  signal,
  refArray as reactiveArray,
  refObject as reactiveObject,
  computed,
  derive,
  release,
  registryGet,
  registrySet,
  registryGetObj,
  registryGetArr,
  registryGetObj as getobj,
  registryGetArr as getarr,
  classNames,
  styleNames,
  // Legacy aliases
  classNames as cn,
  styleNames as sn,
  derive as combine,
  refArray as refarr,
  refObject as refobj,
  release as uncomputed,
};

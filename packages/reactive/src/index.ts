// console.log("reactive.version 1.4.0");

import type { Subscriber, Ref, ClassNameRef, StyleRef } from "./types";
import { isRef, isClassName, isStyleRef } from "./types";
import { ref } from "./ref";
import { refArray } from "./reactive-array";
import { refObject } from "./reactive-object";
import { computed } from "./computed";
import { derive } from "./derive";
import { release } from "./registry";
import { classNames } from "./class-names";
import { styleNames } from "./style-names";

export {
  Subscriber,
  Ref,
  isRef,
  ClassNameRef,
  isClassName,
  StyleRef,
  isStyleRef,
  ref,
  refArray as reactiveArray,
  refObject as reactiveObject,
  computed,
  derive,
  release,
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

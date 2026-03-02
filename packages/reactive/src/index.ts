// console.log("reactive.version 1.4.0");

import { Subscriber, Ref, ClassNameRef, isRef, isClassName } from "./types";
import { ref } from "./ref";
import { refArray } from "./reactive-array";
import { refObject } from "./reactive-object";
import { computed } from "./computed";
import { derive } from "./derive";
import { release } from "./registry";
import { classNames } from "./class-names";

export {
  Subscriber,
  Ref,
  isRef,
  ClassNameRef,
  isClassName,
  ref,
  refArray as reactiveArray,
  refObject as reactiveObject,
  computed,
  derive,
  release,
  classNames,
  // Legacy aliases
  classNames as cn,
  derive as combine,
  refArray as refarr,
  refObject as refobj,
  release as uncomputed,
};

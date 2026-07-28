import { DerivedRef, isRef, Ref } from "@timeless/inner-reactive";

function noop() {}

export function ListenerManager(
  fns?: (DerivedRef<any> | Ref<any> | any | (() => void))[],
) {
  const subscribers: (() => void)[] = [];

  if (fns) {
    for (let i = 0; i < fns?.length; i++) {
      const item = fns[i];
      if (isRef(item)) {
        subscribers.push(item.destroy);
      } else if (typeof item === "function") {
        subscribers.push(item);
      }
    }
  }

  const methods = {
    add(clean?: void | (() => void) | DerivedRef<any> | Ref<any> | any) {
      if (clean) {
        if (isRef(clean)) {
          subscribers.push(clean.destroy);
        } else if (typeof clean === "function") {
          subscribers.push(clean);
        }
      }
      return clean || noop;
    },
    append(arr: (Ref<any> | DerivedRef<any> | any | void | (() => void))[]) {
      for (const item of arr) {
        if (item) {
          if (isRef(item)) {
            subscribers.push(item.destroy);
          } else if (typeof item === "function") {
            subscribers.push(item);
          }
        }
      }
    },
    clean() {
      subscribers.forEach((clean) => clean());
      subscribers.length = 0;
    },
  };

  return {
    add: methods.add,
    push: methods.add,
    append: methods.append,
    clean: methods.clean,
    clear: methods.clean,
    destroy: methods.clean,
    get length() {
      return subscribers.length;
    },
  };
}

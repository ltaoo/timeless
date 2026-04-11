import { DerivedRef, isRef, Ref } from "@timeless/reactive";

function noop() {}

export function ListenerManager(
  fns?: (DerivedRef<any> | Ref<any> | (() => void))[],
) {
  const cleanups: (() => void)[] = [];

  if (fns) {
    for (let i = 0; i < fns?.length; i++) {
      const item = fns[i];
      if (isRef(item)) {
        cleanups.push(item.destroy);
      } else if (item) {
        cleanups.push(item);
      }
    }
  }

  const methods = {
    add(clean?: void | (() => void) | DerivedRef<any> | Ref<any>) {
      if (clean) {
        if (isRef(clean)) {
          cleanups.push(clean.destroy);
        } else {
          cleanups.push(clean);
        }
      }
      return clean || noop;
    },
    append(arr: (Ref<any> | DerivedRef<any> | void | (() => void))[]) {
      for (const item of arr) {
        if (item) {
          if (isRef(item)) {
            cleanups.push(item.destroy);
          } else {
            cleanups.push(item);
          }
        }
      }
    },
    clean() {
      cleanups.forEach((clean) => clean());
      cleanups.length = 0;
    },
  };

  return {
    add: methods.add,
    push: methods.add,
    append: methods.append,
    clean: methods.clean,
    clear: methods.clean,
  };
}

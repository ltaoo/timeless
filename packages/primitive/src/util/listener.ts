function noop() {}

export function ListenerManager() {
  const cleanups: (() => void)[] = [];

  const methods = {
    add(clean?: void | (() => void)) {
      if (clean) {
        cleanups.push(clean);
      }
      return clean || noop;
    },
    append(arr: (void | (() => void))[]) {
      for (const item of arr) {
        if (item) {
          cleanups.push(item);
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

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
    clean() {
      cleanups.forEach((clean) => clean());
      cleanups.length = 0;
    },
  };

  return {
    add: methods.add,
    push: methods.add,
    clean: methods.clean,
    clear: methods.clean,
  };
}

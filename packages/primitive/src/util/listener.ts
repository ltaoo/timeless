export function ListenerManager() {
  const cleanups: (() => void)[] = [];

  const methods = {
    add(clean?: void | (() => void)) {
      if (clean) {
        cleanups.push(clean);
      }
    },
  };

  return {
    add: methods.add,
    push: methods.add,
    clean() {
      cleanups.forEach((clean) => clean());
      cleanups.length = 0;
    },
  };
}

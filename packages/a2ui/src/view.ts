import {
  For,
  View,
  ref,
  release,
  type TimelessElement,
} from "@timeless/timeless";

export function owned(
  view: TimelessElement,
  cleanups: (() => void)[],
): TimelessElement {
  const destroy = view.destroy ?? view.onUnmounted;
  let closed = false;
  view.destroy = view.onUnmounted = () => {
    if (closed) return;
    closed = true;
    const errors: unknown[] = [];
    for (const dispose of cleanups.splice(0).reverse()) {
      try {
        dispose();
      } catch (error) {
        errors.push(error);
      }
    }
    try {
      destroy();
    } catch (error) {
      errors.push(error);
    }
    if (errors.length)
      throw new AggregateError(errors, "A2UI view cleanup failed");
  };
  return view;
}

/** Diff stable descriptors with the existing Timeless For/DOM host. */
export function outlet<T>(
  name: string,
  read: () => T[],
  subscribe: (update: () => void) => () => void,
  render: (item: T) => TimelessElement,
  same: (left: T, right: T) => boolean,
): TimelessElement {
  const items = ref<T[]>([]);
  let closed = false;
  const update = () => {
    if (closed) return;
    const next = read().map(
      (item) => items.value.find((previous) => same(previous, item)) ?? item,
    );
    if (
      next.length !== items.value.length ||
      next.some((item, index) => item !== items.value[index])
    )
      items.as(next);
  };
  update();
  const content = For({ each: items, render });
  const view = View(
    { attributes: { n: name }, style: { display: "contents" } },
    [content],
  );
  let unsubscribe: (() => void) | undefined;
  owned(view, [
    () => {
      closed = true;
      try {
        unsubscribe?.();
      } finally {
        try {
          items.as([]);
        } finally {
          items.destroy();
          release(items);
        }
      }
    },
  ]);
  try {
    unsubscribe = subscribe(update);
    update();
  } catch (error) {
    view.destroy?.();
    throw error;
  }
  return view;
}

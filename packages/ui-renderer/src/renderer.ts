import {
  For,
  Scope,
  View,
  ref,
  release,
  type DerivedRef,
  type TimelessElement,
} from "@timeless/timeless";
import { SlotRegistry, type Selection } from "./registry";
import type {
  Cleanup,
  ComponentProps,
  Observable,
  OwnerProps,
  RenderOptions,
  RendererHost,
  SlotName,
} from "./types";

export class UiRenderer<C> {
  readonly slots: SlotRegistry;
  private host: RendererHost<C>;
  private mounts = new Map<C, Cleanup>();
  private disposed = false;

  constructor(host: RendererHost<C>, slots = new SlotRegistry()) {
    this.host = host;
    this.slots = slots;
  }

  renderSlot<K extends SlotName>(
    name: K,
    owner: OwnerProps<K>,
    options: RenderOptions = {},
  ): TimelessElement {
    if (this.disposed) throw new Error("UI renderer is disposed");
    const items = ref<Selection[]>([]);
    let closed = false;
    const cleanups: Cleanup[] = [];
    const instances = new Set<TimelessElement>();
    const update = () => {
      if (closed) return;
      const key =
        typeof options.entryKey === "string"
          ? options.entryKey
          : options.entryKey?.getSnapshot();
      const selected = this.slots.select(name, owner, key);
      const stable = selected.map(
        (next) =>
          items.value.find(
            (previous) =>
              previous.entry === next.entry &&
              Object.is(previous.matched, next.matched),
          ) ?? next,
      );
      if (
        stable.length !== items.value.length ||
        stable.some((item, index) => item !== items.value[index])
      )
        items.as(stable);
    };
    const cleanup = () => {
      if (closed) return;
      closed = true;
      const errors: unknown[] = [];
      for (const dispose of cleanups.reverse()) {
        try {
          dispose();
        } catch (error) {
          errors.push(error);
        }
      }
      for (const instance of [...instances]) {
        try {
          instance.destroy?.();
        } catch (error) {
          errors.push(error);
        }
      }
      // Empty while For is still subscribed so its item owners and index refs are released.
      try {
        items.as([]);
      } catch (error) {
        errors.push(error);
      }
      items.destroy();
      release(items);
      if (errors.length)
        throw new AggregateError(errors, "Slot outlet cleanup failed");
    };
    try {
      update();
      const content = For({
        each: items,
        render: (selection) => {
          const instance = this.render_entry(selection, owner);
          instances.add(instance);
          const destroy = instance.destroy!;
          instance.destroy = instance.onUnmounted = () => {
            instances.delete(instance);
            destroy();
          };
          return instance;
        },
        onUnmounted: cleanup,
      });
      const view = View(
        { attributes: { n: `slot:${name}` }, style: { display: "contents" } },
        [content],
      );
      const destroy = view.destroy!;
      view.destroy = view.onUnmounted = () => {
        if (closed) return;
        try {
          cleanup();
        } finally {
          destroy();
        }
      };
      cleanups.push(this.slots.source(name).subscribe(update));
      if (options.entryKey && typeof options.entryKey !== "string")
        cleanups.push(options.entryKey.subscribe(update));
      update();
      return view;
    } catch (error) {
      cleanup();
      throw error;
    }
  }

  mount(container: C): Cleanup {
    if (this.disposed) throw new Error("UI renderer is disposed");
    if (this.mounts.has(container))
      throw new Error("Container already has a UI renderer mount");
    const element = this.renderSlot("root", {});
    let detach: Cleanup = () => {};
    let closed = false;
    const unmount = () => {
      if (closed) return;
      closed = true;
      this.mounts.delete(container);
      const errors: unknown[] = [];
      for (const dispose of [
        () => element.beforeUnmounted?.(),
        () => element.destroy?.(),
        detach,
      ]) {
        try {
          dispose();
        } catch (error) {
          errors.push(error);
        }
      }
      if (errors.length) throw new AggregateError(errors, "UI unmount failed");
    };
    try {
      detach = this.host.mount(element, container);
      this.mounts.set(container, unmount);
      element.onMounted({ target: element.$elm });
    } catch (error) {
      unmount();
      throw error;
    }
    return unmount;
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    const errors: unknown[] = [];
    for (const unmount of [...this.mounts.values()]) {
      try {
        unmount();
      } catch (error) {
        errors.push(error);
      }
    }
    try {
      this.slots.dispose();
    } catch (error) {
      errors.push(error);
    }
    if (errors.length)
      throw new AggregateError(errors, "UI renderer cleanup failed");
  }

  private render_entry(selection: Selection, owner: unknown): TimelessElement {
    const { entry, matched } = selection;
    const cleanups: Cleanup[] = [];
    let closed = false;
    const cleanup = () => {
      const errors: unknown[] = [];
      for (const dispose of cleanups.splice(0).reverse()) {
        try {
          dispose();
        } catch (error) {
          errors.push(error);
        }
      }
      if (errors.length)
        throw new AggregateError(errors, "Component cleanup failed");
    };
    const observe = <T, R>(
      source: Observable<T>,
      selector: (snapshot: T) => R,
    ): DerivedRef<R> => {
      if (closed) throw new Error("Component is disposed");
      const value = ref(selector(source.getSnapshot()));
      const update = () => {
        if (closed) return;
        const next = selector(source.getSnapshot());
        if (!Object.is(value.value, next)) value.as(next);
      };
      let unsubscribe: Cleanup | undefined;
      cleanups.push(() => {
        try {
          unsubscribe?.();
        } finally {
          value.destroy();
          release(value);
        }
      });
      unsubscribe = source.subscribe(update);
      update();
      return value;
    };
    try {
      let construction_failure: { error: unknown } | undefined;
      const scope = Scope(
        () => {},
        () => {
          try {
            const props: ComponentProps<SlotName> = {
              owner: owner as OwnerProps<SlotName>,
              matched,
              observe,
              onCleanup: (dispose) => {
                if (closed) throw new Error("Component is disposed");
                cleanups.push(dispose);
              },
              renderSlot: (name, child_owner, options) => {
                if (!Object.hasOwn(entry.children, name))
                  throw new Error(`Component does not own slot "${name}"`);
                const outlet = this.renderSlot(name, child_owner, options);
                cleanups.push(() => outlet.destroy?.());
                return outlet;
              },
            };
            const children = entry.component(props);
            const view = View(
              {
                attributes: {
                  n: `slot-component:${entry.name}:${entry.id ?? entry.key ?? entry.sequence}`,
                },
                style: { display: "contents" },
              },
              children,
            );
            return view;
          } catch (error) {
            construction_failure = { error };
            return null;
          }
        },
      );
      if (construction_failure) {
        scope.onUnmounted();
        throw construction_failure.error;
      }
      // For's host tracks one node per item; retain the owner without returning its fragment.
      const view = scope.children![0]!;
      const destroy = view.destroy!;
      view.destroy = view.onUnmounted = () => {
        if (closed) return;
        closed = true;
        try {
          destroy();
        } finally {
          try {
            scope.onUnmounted();
          } finally {
            cleanup();
          }
        }
      };
      return view;
    } catch (error) {
      closed = true;
      cleanup();
      throw error;
    }
  }
}

export function createUiRenderer<C>(
  host: RendererHost<C>,
  slots?: SlotRegistry,
): UiRenderer<C> {
  return new UiRenderer(host, slots);
}

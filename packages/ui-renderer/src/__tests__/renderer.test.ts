import { describe, expect, it, vi } from "vitest";
import {
  Text,
  View,
  ref,
  type DerivedRef,
  type TimelessElement,
} from "@timeless/timeless";
import {
  createUiRenderer,
  type ComponentProps,
  type Observable,
  type SlotDefinition,
} from "../index";

declare module "../index" {
  interface SlotMap {
    actions: SlotDefinition<"list", { title: string }>;
    sidebar: SlotDefinition<"single", Record<string, never>>;
    panel: SlotDefinition<"keyed", Record<string, never>>;
  }
}

class Model<T> implements Observable<T> {
  private snapshot: T;
  readonly listeners = new Set<() => void>();
  constructor(snapshot: T) {
    this.snapshot = snapshot;
  }
  getSnapshot = () => this.snapshot;
  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };
  set(snapshot: T) {
    this.snapshot = snapshot;
    for (const listener of [...this.listeners]) listener();
  }
}

function setup() {
  const mounted: TimelessElement[] = [];
  const detach = vi.fn();
  const renderer = createUiRenderer({
    mount(element: TimelessElement, _container: object) {
      mounted.push(element);
      return detach;
    },
  });
  return { renderer, mounted, detach };
}

describe("UI renderer", () => {
  it("keeps unchanged components alive when another plugin registers", () => {
    const { renderer } = setup();
    renderer.slots.register(
      { name: "root", children: { actions: "list", sidebar: "single" } },
      (props) =>
        View({ attributes: { n: "app-layout" } }, [
          props.renderSlot("actions", { title: "Actions" }),
        ]),
    );
    const cleanup = vi.fn();
    const action = vi.fn((props: ComponentProps<"actions">) => {
      props.onCleanup(cleanup);
      return View({ attributes: { n: "action" } });
    });
    renderer.slots.register({ name: "actions", id: "action" }, action);
    const unmount = renderer.mount({});
    renderer.slots.register({ name: "sidebar" }, () => "Sidebar");
    expect(action).toHaveBeenCalledOnce();
    const remove_other = renderer.slots.register(
      { name: "actions", id: "other" },
      () => "Other",
    );
    expect(action).toHaveBeenCalledOnce();
    remove_other();
    expect(cleanup).not.toHaveBeenCalled();
    unmount();
    unmount();
    expect(cleanup).toHaveBeenCalledOnce();
    renderer.dispose();
  });

  it("bridges external snapshots, skips unchanged selections, and releases subscriptions", () => {
    const { renderer } = setup();
    const model = new Model({ count: 1, other: false });
    let selected!: DerivedRef<number>;
    renderer.slots.register({ name: "root" }, (props) => {
      selected = props.observe(model, (snapshot) => snapshot.count);
      return Text(selected);
    });
    const unmount = renderer.mount({});
    const changed = vi.fn();
    selected.subscribe({ onChange: changed });
    model.set({ count: 1, other: true });
    expect(changed).not.toHaveBeenCalled();
    model.set({ count: 2, other: true });
    expect(selected.value).toBe(2);
    expect(changed).toHaveBeenCalledOnce();
    unmount();
    expect(model.listeners.size).toBe(0);
    model.set({ count: 3, other: true });
    expect(changed).toHaveBeenCalledOnce();
    renderer.dispose();
  });

  it("cleans observers even when a component fails during construction", () => {
    const { renderer } = setup();
    const model = new Model(1);
    renderer.slots.register({ name: "root" }, (props) => {
      props.observe(model, (value) => value);
      throw new Error("component failed");
    });
    expect(() => renderer.mount({})).toThrow("component failed");
    expect(model.listeners.size).toBe(0);
    renderer.dispose();
  });

  it("runs registered ref cleanup when construction throws", () => {
    const { renderer } = setup();
    let local!: ReturnType<typeof ref<number>>;
    renderer.slots.register({ name: "root" }, (props) => {
      local = ref(1);
      local.subscribe({ onChange: vi.fn() });
      props.onCleanup(() => local.destroy());
      throw new Error("component failed");
    });
    expect(() => renderer.mount({})).toThrow("component failed");
    expect(local.getDeps()).toHaveLength(0);
    renderer.dispose();
  });

  it("releases other subscriptions when a source's unsubscribe throws", () => {
    const { renderer } = setup();
    const model = new Model(1);
    const source: Observable<number> = {
      getSnapshot: () => 1,
      subscribe: () => () => {
        throw new Error("unsubscribe failed");
      },
    };
    renderer.slots.register({ name: "root" }, (props) => {
      props.observe(model, (value) => value);
      return Text(props.observe(source, (value) => value));
    });
    renderer.mount({});
    expect(() => renderer.dispose()).toThrow(AggregateError);
    expect(model.listeners.size).toBe(0);
  });

  it("rejects child rendering without declaration authority", () => {
    const { renderer } = setup();
    renderer.slots.declare("sidebar", "single");
    renderer.slots.register({ name: "root" }, (props) =>
      props.renderSlot("sidebar", {}),
    );
    expect(() => renderer.mount({})).toThrow("does not own");
    renderer.dispose();
  });

  it("switches a keyed panel from an observable and unsubscribes on teardown", () => {
    const { renderer } = setup();
    const key = new Model("first");
    const cleaned = vi.fn();
    const first = vi.fn((props: ComponentProps<"panel">) => {
      props.onCleanup(cleaned);
      return "first";
    });
    const second = vi.fn(() => "second");
    renderer.slots.register(
      { name: "root", children: { panel: "keyed" } },
      (props) => props.renderSlot("panel", {}, { entryKey: key }),
    );
    renderer.slots.register({ name: "panel", key: "first" }, first);
    renderer.slots.register({ name: "panel", key: "second" }, second);
    renderer.mount({});
    key.set("second");
    expect(first).toHaveBeenCalledOnce();
    expect(second).toHaveBeenCalledOnce();
    expect(cleaned).toHaveBeenCalledOnce();
    renderer.dispose();
    expect(key.listeners.size).toBe(0);
  });

  it("supports independent mounts and releases every mount despite cleanup errors", () => {
    const { renderer, detach } = setup();
    const model = new Model(1);
    renderer.slots.register({ name: "root" }, (props) => {
      props.observe(model, (value) => value);
      props.onCleanup(() => {
        throw new Error("cleanup failed");
      });
      return "root";
    });
    const first = {};
    renderer.mount(first);
    expect(() => renderer.mount(first)).toThrow("already has");
    renderer.mount({});
    expect(model.listeners.size).toBe(2);
    expect(() => renderer.dispose()).toThrow("cleanup failed");
    expect(model.listeners.size).toBe(0);
    expect(detach).toHaveBeenCalledTimes(2);
    expect(() => renderer.mount({})).toThrow("disposed");
  });

  it("cleans every sibling after one component's disposer throws", () => {
    const { renderer } = setup();
    const model = new Model(1);
    renderer.slots.register(
      { name: "root", children: { actions: "list" } },
      (props) => props.renderSlot("actions", { title: "Actions" }),
    );
    renderer.slots.register({ name: "actions", id: "throwing" }, (props) => {
      props.observe(model, (value) => value);
      props.onCleanup(() => {
        throw new Error("cleanup failed");
      });
      return "throwing";
    });
    renderer.slots.register({ name: "actions", id: "normal" }, (props) =>
      Text(props.observe(model, (value) => value)),
    );
    renderer.mount({});
    expect(() => renderer.dispose()).toThrow("cleanup failed");
    expect(model.listeners.size).toBe(0);
  });
});

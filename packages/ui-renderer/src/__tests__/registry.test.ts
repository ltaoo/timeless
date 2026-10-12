import { describe, expect, it, vi } from "vitest";
import {
  SlotRegistry,
  type SlotDefinition,
  type SlotComponent,
} from "../index";

declare module "../index" {
  interface SlotMap {
    actions: SlotDefinition<"list", { title: string }>;
    panel: SlotDefinition<"keyed", Record<string, never>>;
    content: SlotDefinition<"chain", { value: string }>;
    sidebar: SlotDefinition<"single", Record<string, never>>;
    nested: SlotDefinition<"list", Record<string, never>>;
  }
}
const empty = () => null;

describe("SlotRegistry", () => {
  it("selects ordered list cells and restores a shadowed registration", () => {
    const slots = new SlotRegistry();
    slots.declare("actions", "list");
    slots.register({ name: "actions", id: "later", order: 20 }, empty);
    slots.register({ name: "actions", id: "first", order: 10 }, empty);
    const remove = slots.register(
      { name: "actions", id: "later", order: 0, priority: -1 },
      empty,
    );
    expect(
      slots
        .select("actions", { title: "Actions" })
        .map((item) => item.entry.id),
    ).toEqual(["later", "first"]);
    remove();
    remove();
    expect(
      slots
        .select("actions", { title: "Actions" })
        .map((item) => item.entry.id),
    ).toEqual(["first", "later"]);
  });

  it("dispatches keyed entries and elects the first matching chain entry", () => {
    const slots = new SlotRegistry();
    slots.declare("panel", "keyed");
    slots.declare("content", "chain");
    slots.register({ name: "panel", key: "files" }, empty);
    expect(slots.select("panel", {}, "missing")).toEqual([]);
    expect(slots.select("panel", {}, "files")).toHaveLength(1);
    slots.register(
      { name: "content", select: () => null, priority: -10 },
      empty,
    );
    slots.register(
      {
        name: "content",
        select: (owner) => (owner.value === "ok" ? "matched" : null),
      },
      empty,
    );
    expect(slots.select("content", { value: "ok" })[0].matched).toBe("matched");
    expect(slots.select("content", { value: "missing" })).toEqual([]);
  });

  it("restarts injections for each declaration lifetime and fences old disposers", () => {
    const slots = new SlotRegistry();
    const setup = vi.fn(() =>
      slots.register({ name: "nested", id: "child" }, empty),
    );
    const stop = slots.inject("nested", setup);
    const remove_old = slots.register(
      { name: "root", children: { nested: "list" } },
      empty,
    );
    expect(setup).toHaveBeenCalledOnce();
    remove_old();
    expect(slots.select("nested", {})).toEqual([]);
    slots.register({ name: "root", children: { nested: "list" } }, empty);
    expect(setup).toHaveBeenCalledTimes(2);
    remove_old();
    expect(slots.select("nested", {})).toHaveLength(1);
    stop();
    expect(slots.select("nested", {})).toEqual([]);
  });

  it("validates declarations and rolls back failed child setup", () => {
    const slots = new SlotRegistry();
    expect(() => slots.register({ name: "sidebar" }, empty)).toThrow(
      "not declared",
    );
    slots.declare("sidebar", "single");
    expect(() => slots.declare("sidebar", "single")).toThrow(
      "already declared",
    );
    expect(() =>
      slots.register({ name: "root", children: { sidebar: "single" } }, empty),
    ).toThrow("already declared");
    slots.declare("actions", "list");
    expect(() => slots.register({ name: "actions" } as never, empty)).toThrow(
      "require an id",
    );
    expect(() =>
      slots.register({ name: "root", priority: NaN }, empty),
    ).toThrow("finite");
    slots.inject("nested", () => {
      throw new Error("setup failed");
    });
    expect(() =>
      slots.register({ name: "root", children: { nested: "list" } }, empty),
    ).toThrow("setup failed");
    expect(slots.select("root", {})).toEqual([]);
    expect(() =>
      slots.register({ name: "nested", id: "child" }, empty),
    ).toThrow("not declared");
  });

  it("continues cleanup after an injection fails and refuses reuse after disposal", () => {
    const slots = new SlotRegistry();
    slots.declare("sidebar", "single");
    const cleanup = vi.fn();
    slots.inject("root", () => () => {
      throw new Error("cleanup failed");
    });
    slots.inject("sidebar", () => cleanup);
    expect(() => slots.dispose()).toThrow("cleanup failed");
    expect(cleanup).toHaveBeenCalledOnce();
    expect(() => slots.register({ name: "root" }, empty)).toThrow("disposed");
    slots.dispose();
  });

  it("checks owner props and required cell ids statically", () => {
    const slots = new SlotRegistry();
    const component: SlotComponent<"actions"> = (props) => props.owner.title;
    slots.declare("actions", "list");
    slots.register({ name: "actions", id: "typed" }, component);
    if (false) {
      // @ts-expect-error list cells need stable ids
      slots.register({ name: "actions" }, component);
      // @ts-expect-error owner props follow the declared slot contract
      slots.select("actions", { title: 123 });
      // @ts-expect-error slot kinds must agree with their declarations
      slots.declare("actions", "single");
    }
  });

  it("keeps observable snapshots stable until a registration changes", () => {
    const slots = new SlotRegistry();
    const source = slots.source("root");
    const before = source.getSnapshot();
    expect(source.getSnapshot()).toBe(before);
    const remove = slots.register({ name: "root" }, empty);
    const registered = source.getSnapshot();
    expect(registered).not.toBe(before);
    expect(source.getSnapshot()).toBe(registered);
    remove();
    expect(source.getSnapshot()).toEqual([]);
  });
});

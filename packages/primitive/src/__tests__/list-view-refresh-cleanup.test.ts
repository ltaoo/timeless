import { describe, expect, it, vi } from "vitest";
import { refarr } from "@timeless/reactive";

import { ListView } from "@/content/list-view";
import { View } from "@/content/view";

type User = {
  id: number;
  name: string;
};

describe("ListView refresh cleanup", () => {
  it("unmounts removed visible views and clears slot references", () => {
    const users = refarr<User>(
      [
        { id: 1, name: "first" },
        { id: 2, name: "second" },
      ],
      { key: "id" },
    );
    const unmountedById = new Map<number, ReturnType<typeof vi.fn>>();
    const renderedById = new Map<number, ReturnType<typeof View>>();

    const list = ListView<User>({
      key: "id",
      each: users,
      size: 2,
      buffer: 0,
      itemHeight: 20,
      render(item) {
        const onUnmounted = unmountedById.get(item.id) ?? vi.fn();
        unmountedById.set(item.id, onUnmounted);
        const view = View({ onUnmounted }, [item.name]);
        renderedById.set(item.id, view);
        return view;
      },
    });

    for (const slot of list.children as any[]) {
      let mountedChildren = [...(slot.children ?? [])];
      slot.$elm = {
        setStyle: vi.fn(),
        setStyleValue: vi.fn(),
        insertChildren(children: unknown[]) {
          mountedChildren = [...children];
        },
        removeChildren() {
          mountedChildren = [];
        },
      };
    }

    list.$elm = {
      setStyleValue: vi.fn(),
      setScrollTop: vi.fn(),
    };
    list.state.rendered = true;

    const previousRaf = globalThis.requestAnimationFrame;
    const previousCancel = globalThis.cancelAnimationFrame;
    globalThis.requestAnimationFrame = ((cb: FrameRequestCallback) => {
      cb(0);
      return 1;
    }) as typeof requestAnimationFrame;
    globalThis.cancelAnimationFrame = vi.fn() as typeof cancelAnimationFrame;

    try {
      users.as([{ id: 2, name: "second" }]);
    } finally {
      globalThis.requestAnimationFrame = previousRaf;
      globalThis.cancelAnimationFrame = previousCancel;
    }

    expect(unmountedById.get(1)).toHaveBeenCalledTimes(1);

    const removedView = renderedById.get(1);
    expect(removedView).toBeDefined();
    expect((list.children as any[]).some((slot) => slot.children.includes(removedView))).toBe(
      false,
    );
  });

  it("unmounts every removed view inside a removed range", () => {
    const users = refarr<User>(
      [
        { id: 1, name: "first" },
        { id: 2, name: "second" },
        { id: 3, name: "third" },
      ],
      { key: "id" },
    );
    const unmountedById = new Map<number, ReturnType<typeof vi.fn>>();

    const list = ListView<User>({
      key: "id",
      each: users,
      size: 3,
      buffer: 0,
      itemHeight: 20,
      render(item) {
        const onUnmounted = unmountedById.get(item.id) ?? vi.fn();
        unmountedById.set(item.id, onUnmounted);
        return View({ onUnmounted }, [item.name]);
      },
    });

    for (const slot of list.children as any[]) {
      let mountedChildren = [...(slot.children ?? [])];
      slot.$elm = {
        setStyle: vi.fn(),
        setStyleValue: vi.fn(),
        insertChildren(children: unknown[]) {
          mountedChildren = [...children];
        },
        removeChildren() {
          mountedChildren = [];
        },
      };
    }

    list.$elm = {
      setStyleValue: vi.fn(),
      setScrollTop: vi.fn(),
    };
    list.state.rendered = true;

    const previousRaf = globalThis.requestAnimationFrame;
    const previousCancel = globalThis.cancelAnimationFrame;
    globalThis.requestAnimationFrame = ((cb: FrameRequestCallback) => {
      cb(0);
      return 1;
    }) as typeof requestAnimationFrame;
    globalThis.cancelAnimationFrame = vi.fn() as typeof cancelAnimationFrame;

    try {
      users.as([{ id: 3, name: "third" }]);
    } finally {
      globalThis.requestAnimationFrame = previousRaf;
      globalThis.cancelAnimationFrame = previousCancel;
    }

    expect(unmountedById.get(1)).toHaveBeenCalledTimes(1);
    expect(unmountedById.get(2)).toHaveBeenCalledTimes(1);
    expect(unmountedById.get(3)).toHaveBeenCalledTimes(1);
  });

  it("releases removed idx subscriptions from each", () => {
    const users = refarr<User>(
      [
        { id: 1, name: "first" },
        { id: 2, name: "second" },
        { id: 3, name: "third" },
      ],
      { key: "id" },
    );

    const list = ListView<User>({
      key: "id",
      each: users,
      size: 3,
      buffer: 0,
      itemHeight: 20,
      render(item) {
        return View({}, [item.name]);
      },
    });

    for (const slot of list.children as any[]) {
      slot.$elm = {
        setStyle: vi.fn(),
        setStyleValue: vi.fn(),
        insertChildren: vi.fn(),
        removeChildren() {
          return;
        },
      };
    }

    list.$elm = {
      setStyleValue: vi.fn(),
      setScrollTop: vi.fn(),
    };
    list.state.rendered = true;

    expect(users.getDeps()).toHaveLength(4);

    const previousRaf = globalThis.requestAnimationFrame;
    const previousCancel = globalThis.cancelAnimationFrame;
    globalThis.requestAnimationFrame = ((cb: FrameRequestCallback) => {
      cb(0);
      return 1;
    }) as typeof requestAnimationFrame;
    globalThis.cancelAnimationFrame = vi.fn() as typeof cancelAnimationFrame;

    try {
      users.as([{ id: 3, name: "third" }]);
    } finally {
      globalThis.requestAnimationFrame = previousRaf;
      globalThis.cancelAnimationFrame = previousCancel;
    }

    expect(users.getDeps()).toHaveLength(2);
  });

  it("replaces retained state.items and slot payloads for same-length refreshes", () => {
    const initial = [
      { id: 1, name: "first", meta: { version: 1 } },
      { id: 2, name: "second", meta: { version: 1 } },
      { id: 3, name: "third", meta: { version: 1 } },
    ];
    const next = [
      { id: 1, name: "first", meta: { version: 2 } },
      { id: 2, name: "second", meta: { version: 2 } },
      { id: 3, name: "third", meta: { version: 2 } },
    ];
    const users = refarr<User & { meta: { version: number } }>(initial, {
      key: "id",
    });

    const list = ListView<User & { meta: { version: number } }>({
      key: "id",
      each: users,
      size: 3,
      buffer: 0,
      itemHeight: 20,
      render(item) {
        return View({}, [item.name]);
      },
    });

    for (const slot of list.children as any[]) {
      let mountedChildren = [...(slot.children ?? [])];
      slot.$elm = {
        setStyle: vi.fn(),
        setStyleValue: vi.fn(),
        insertChildren(children: unknown[]) {
          mountedChildren = [...children];
        },
        removeChildren() {
          mountedChildren = [];
        },
      };
    }

    list.$elm = {
      setStyleValue: vi.fn(),
      setScrollTop: vi.fn(),
    };
    list.state.rendered = true;

    const previousRaf = globalThis.requestAnimationFrame;
    const previousCancel = globalThis.cancelAnimationFrame;
    globalThis.requestAnimationFrame = ((cb: FrameRequestCallback) => {
      cb(0);
      return 1;
    }) as typeof requestAnimationFrame;
    globalThis.cancelAnimationFrame = vi.fn() as typeof cancelAnimationFrame;

    try {
      users.as(next);
    } finally {
      globalThis.requestAnimationFrame = previousRaf;
      globalThis.cancelAnimationFrame = previousCancel;
    }

    expect(list.state.items).toEqual(next);
    expect(list.state.items[0]).toBe(next[0]);
    expect((list.children as any[]).map((slot) => slot.state.payload)).toEqual(next);
    expect((list.children as any[])[0].state.payload).toBe(next[0]);
    expect((list.children as any[])[0].state.payload).not.toBe(initial[0]);
  });

  it("rerenders visible children when same-key items get new object identities", () => {
    const initial = [
      { id: 1, name: "first", meta: { version: 1 } },
      { id: 2, name: "second", meta: { version: 1 } },
    ];
    const next = [
      { id: 1, name: "first", meta: { version: 2 } },
      { id: 2, name: "second", meta: { version: 2 } },
    ];
    const users = refarr<User & { meta: { version: number } }>(initial, {
      key: "id",
    });

    const list = ListView<User & { meta: { version: number } }>({
      key: "id",
      each: users,
      size: 2,
      buffer: 0,
      itemHeight: 20,
      render(item) {
        return View(
          {
            dataset: {
              version: item.meta.version,
            },
          },
          [item.name],
        );
      },
    });

    for (const slot of list.children as any[]) {
      let mountedChildren = [...(slot.children ?? [])];
      slot.$elm = {
        setStyle: vi.fn(),
        setStyleValue: vi.fn(),
        insertChildren(children: unknown[]) {
          mountedChildren = [...children];
        },
        removeChildren() {
          mountedChildren = [];
        },
      };
    }

    list.$elm = {
      setStyleValue: vi.fn(),
      setScrollTop: vi.fn(),
    };
    list.state.rendered = true;

    const prevChild0 = list.state.children[0];
    const prevSlotChild0 = (list.children as any[])[0].children[0];

    const previousRaf = globalThis.requestAnimationFrame;
    const previousCancel = globalThis.cancelAnimationFrame;
    globalThis.requestAnimationFrame = ((cb: FrameRequestCallback) => {
      cb(0);
      return 1;
    }) as typeof requestAnimationFrame;
    globalThis.cancelAnimationFrame = vi.fn() as typeof cancelAnimationFrame;

    try {
      users.as(next);
    } finally {
      globalThis.requestAnimationFrame = previousRaf;
      globalThis.cancelAnimationFrame = previousCancel;
    }

    expect(list.state.children[0]).not.toBe(prevChild0);
    expect((list.children as any[])[0].children[0]).not.toBe(prevSlotChild0);
    expect((list.children as any[])[0].children[0].state.dataset.version).toBe(2);
  });
});

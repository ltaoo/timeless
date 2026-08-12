import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { HostElement } from "@/host/box";

type FakeNode = {
  nodeType: number;
  parentElement: FakeParent | null;
  parentNode: FakeParent | null;
};

type FakeFragment = {
  children: FakeNode[];
  appendChild(child: FakeNode): void;
};

type FakeParent = {
  children: FakeNode[];
  insertBefore(child: FakeNode | FakeFragment, anchor: FakeNode): void;
  appendChild(child: FakeNode | FakeFragment): void;
  removeChild(child: FakeNode): void;
};

function create_fragment(): FakeFragment {
  return {
    children: [],
    appendChild(child) {
      this.children.push(child);
    },
  };
}

function is_fragment(value: FakeNode | FakeFragment): value is FakeFragment {
  return "children" in value;
}

function create_parent(): FakeParent {
  const parent: FakeParent = {
    children: [],
    insertBefore(child, anchor) {
      const children = is_fragment(child) ? child.children : [child];
      const anchor_idx = this.children.indexOf(anchor);
      const insert_idx = anchor_idx < 0 ? this.children.length : anchor_idx;
      this.children.splice(insert_idx, 0, ...children);
      for (const inserted_child of children) {
        inserted_child.parentElement = parent;
        inserted_child.parentNode = parent;
      }
    },
    appendChild(child) {
      const children = is_fragment(child) ? child.children : [child];
      this.children.push(...children);
      for (const inserted_child of children) {
        inserted_child.parentElement = parent;
        inserted_child.parentNode = parent;
      }
    },
    removeChild(child) {
      const child_idx = this.children.indexOf(child);
      if (child_idx >= 0) {
        this.children.splice(child_idx, 1);
      }
      child.parentElement = null;
      child.parentNode = null;
    },
  };
  return parent;
}

function create_element(name: string) {
  const host_node: FakeNode = {
    nodeType: 1,
    parentElement: null,
    parentNode: null,
  };
  const element = {
    t: "view",
    $elm: null,
    state: { name },
    children: [],
    onMounted: vi.fn(),
    onUnmounted: vi.fn(),
  } as any;
  const vnode = {
    render: () => host_node,
    removeChildren: vi.fn(),
  } as any;
  return { element, host_node, vnode };
}

describe("HostElement child lifecycle", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal("document", {
      createDocumentFragment: create_fragment,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("keeps the new nested branch mounted after admin-member-admin switches", () => {
    const parent = create_parent();
    const anchor: FakeNode = {
      nodeType: 3,
      parentElement: parent,
      parentNode: parent,
    };
    parent.children.push(anchor);

    const old_admin = create_element("admin-old");
    const member = create_element("member");
    const new_admin = create_element("admin-new");
    const vnode_by_element = new Map([
      [old_admin.element, old_admin.vnode],
      [member.element, member.vnode],
      [new_admin.element, new_admin.vnode],
    ]);
    const host = HostElement({
      t: "match",
      $elm: anchor,
      build: (element) => vnode_by_element.get(element)!,
    });

    host.methods.insertChildren([old_admin.element]);
    vi.runAllTimers();
    host.methods.removeChildren();
    host.methods.insertChildren([member.element]);
    vi.runAllTimers();
    host.methods.removeChildren();
    host.methods.insertChildren([new_admin.element]);
    vi.runAllTimers();

    expect(old_admin.element.onUnmounted).toHaveBeenCalledOnce();
    expect(member.element.onMounted).toHaveBeenCalledOnce();
    expect(member.element.onUnmounted).toHaveBeenCalledOnce();
    expect(new_admin.element.onMounted).toHaveBeenCalledOnce();
    expect(new_admin.element.onUnmounted).not.toHaveBeenCalled();
    expect(parent.children).toEqual([new_admin.host_node, anchor]);
  });
});

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { HostElement } from "@/host/box";

function create_container(node_type: number) {
  const container: any = {
    nodeType: node_type,
    children: [],
    get firstChild() {
      return this.children[0] || null;
    },
    appendChild(child: any) {
      if (child.nodeType === 11) {
        for (const node of [...child.children]) this.appendChild(node);
        return child;
      }
      child.parentNode?.removeChild(child);
      this.children.push(child);
      child.parentNode = this;
      child.parentElement = this.nodeType === 1 ? this : null;
      return child;
    },
    removeChild(child: any) {
      const idx = this.children.indexOf(child);
      if (idx >= 0) this.children.splice(idx, 1);
      child.parentNode = null;
      child.parentElement = null;
      return child;
    },
  };
  return container;
}

describe("KeepAlive DOM cache", () => {
  beforeEach(() => {
    vi.stubGlobal("document", {
      createDocumentFragment: () => create_container(11),
    });
  });

  afterEach(() => vi.unstubAllGlobals());

  it("detaches and restores the same child nodes", () => {
    const wrapper = create_container(1);
    wrapper.scrollLeft = 12;
    wrapper.scrollTop = 180;
    const page: any = {
      nodeType: 1,
      parentNode: null,
      parentElement: null,
      scrollLeft: 4,
      scrollTop: 75,
    };
    wrapper.querySelectorAll = () => [page];
    wrapper.appendChild(page);
    const host = HostElement({
      t: "view",
      $elm: wrapper,
      build: vi.fn(),
    });

    host.methods.setChildrenActive(false);
    expect(wrapper.children).toEqual([]);
    expect(wrapper.hidden).toBe(true);
    expect(page.parentNode.nodeType).toBe(11);

    wrapper.scrollLeft = 0;
    wrapper.scrollTop = 0;
    page.scrollLeft = 0;
    page.scrollTop = 0;
    host.methods.setChildrenActive(true);
    expect(wrapper.children).toEqual([page]);
    expect(wrapper.hidden).toBe(false);
    expect(wrapper.scrollLeft).toBe(12);
    expect(wrapper.scrollTop).toBe(180);
    expect(page.scrollLeft).toBe(4);
    expect(page.scrollTop).toBe(75);
    expect(wrapper.children[0]).toBe(page);
  });
});

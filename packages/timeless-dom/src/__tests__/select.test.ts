import { afterEach, describe, expect, it, vi } from "vitest";

import { DOMSelect } from "@/host/select";

describe("DOMSelect class", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("applies the initial class to the select element", () => {
    const select_element = {
      nodeType: 1,
      style: {},
      setAttribute: vi.fn(),
      removeAttribute: vi.fn(),
      appendChild: vi.fn(),
      addEventListener: vi.fn(),
    };
    const fragment = {
      children: [] as unknown[],
      appendChild(child: unknown) {
        this.children.push(child);
      },
      insertBefore(child: unknown) {
        this.children.unshift(child);
      },
    };

    vi.stubGlobal("document", {
      createElement(tag: string) {
        if (tag === "select") return select_element;
        return { value: "", innerText: "" };
      },
      createDocumentFragment() {
        return fragment;
      },
    });

    const select = DOMSelect({
      build: vi.fn(),
      elm: {
        state: {
          style: {},
          styleSet: ["field", "compact"],
          attributes: {},
          dataset: {},
          placeholder: "Choose",
        },
        children: [],
        events: {},
      } as any,
    });

    expect(select.render()).toBe(select_element);
    expect(select.get$elm()).toBe(select_element);
    expect(select_element.setAttribute).toHaveBeenCalledWith(
      "class",
      "field compact",
    );
  });
});

import { afterEach, describe, expect, it, vi } from "vitest";

import {
  DOMTable,
  DOMTableElementType,
  isDOMTableElementType,
} from "@/host/table";

const tags: Record<DOMTableElementType, string> = {
  table: "table",
  "table-caption": "caption",
  "table-header": "thead",
  "table-body": "tbody",
  "table-footer": "tfoot",
  "table-row": "tr",
  "table-head": "th",
  "table-cell": "td",
};

describe("DOMTable", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("maps every primitive table type to its native tag", () => {
    const created_tags: string[] = [];
    vi.stubGlobal("document", {
      createElement(tag: string) {
        created_tags.push(tag);
        return {
          nodeType: 1,
          childNodes: [],
          style: {},
          appendChild: vi.fn(),
          setAttribute: vi.fn(),
          removeAttribute: vi.fn(),
          addEventListener: vi.fn(),
        };
      },
      createDocumentFragment() {
        return { appendChild: vi.fn() };
      },
    });

    for (const type of Object.keys(tags) as DOMTableElementType[]) {
      const host = DOMTable({
        build: vi.fn(),
        elm: {
          t: type,
          state: {
            style: {},
            styleSet: [],
            attributes: { n: type },
            dataset: {},
          },
          children: [],
          events: {},
        } as any,
      });
      host.render();
      expect(isDOMTableElementType(type)).toBe(true);
    }

    expect(created_tags).toEqual(Object.values(tags));
  });
});

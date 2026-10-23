import { describe, it, expect } from "vitest";
import { Modal, Canvas, Button, ref, Show, View, RichText } from "@timeless/timeless";

import { renderToString } from "../index";

describe("renderToString", () => {
  it("renders the same reading HTML as the DOM RichText host", () => {
    const element = RichText({ content: "# Heading\n\n**bold**", format: "markdown" });
    const html = renderToString(element);
    expect(html).toContain(element.state.document.html);
    expect(html).toContain('data-n="rich-text-h1"');
    expect(html).toContain("font-weight:700");
    expect(html).not.toContain("**bold**");
  });
  it("renders dedicated surfaces and ignores arbitrary View tags", () => {
    expect(renderToString(Modal({ open: true }, ["Gallery"]))).toBe(
      '<dialog role="dialog" aria-modal="true" open>Gallery</dialog>',
    );
    expect(renderToString(View({ as: "div><script" } as any))).toBe(
      "<div></div>",
    );
    expect(renderToString(Canvas({ attributes: { width: 512 } }))).toBe(
      '<canvas width="512"></canvas>',
    );
  });
  it("renders current reactive modal visibility before mounting", () => {
    const open = ref(false);
    const modal = Modal({ open }, ["Content"]);
    expect(renderToString(modal)).not.toContain(" open");
    open.set(true);
    expect(renderToString(modal)).toContain(" open>Content</dialog>");
  });
  it("should render a simple View with text", () => {
    const element = View({}, ["Hello World"]);
    const result = renderToString(element);
    expect(result).toBe("<div>Hello World</div>");
  });

  it("should render View with style and children", () => {
    const element = View(
      {
        style: { color: "red", "font-size": "16px" },
      },
      ["Styled Text"],
    );
    const result = renderToString(element);
    expect(result).toBe(
      `<div style="color:red;font-size:16px;">Styled Text</div>`,
    );
  });

  it("should render nested View elements", () => {
    const element = View({}, [
      View({ class: "container" }, ["Nested Content"]),
    ]);
    const result = renderToString(element);
    expect(result).toBe(
      `<div><div class="container">Nested Content</div></div>`,
    );
  });

  it("should handle empty children", () => {
    const element = View({}, []);

    const result = renderToString(element);
    expect(result).toBe("<div></div>");
  });

  it("should handle View with no children", () => {
    const element = View({}, []);

    const result = renderToString(element);
    expect(result).toBe("<div></div>");
  });

  it("should escape attribute values", () => {
    const element = View(
      {
        attributes: {
          title: 'Test "quoted" value',
        },
      },
      [],
    );
    const result = renderToString(element);
    expect(result).toBe(`<div title="Test &quot;quoted&quot; value"></div>`);
  });

  it("should render data attributes", () => {
    const element = View(
      {
        dataset: {
          "user-id": "123",
          "is-active": "true",
          "data-slot": "picker",
        },
      },
      [],
    );

    const result = renderToString(element);
    expect(result).toBe(`<div data-user-id="123" data-is-active="true" data-slot="picker"></div>`);
  });

  it("button element", () => {
    const element = Button(
      {
        dataset: {
          "user-id": "123",
          "is-active": "true",
        },
      },
      [],
    );

    const result = renderToString(element);
    expect(result).toBe(
      `<button data-user-id="123" data-is-active="true"></button>`,
    );
  });

  it("button with click handler", () => {
    const element = Button(
      {
        onClick() {
          console.log("hello");
        },
      },
      ["Toggle Content"],
    );
    const result = renderToString(element);
    expect(result).toBe(`<button>Toggle Content</button>`);
  });

  it("show element", () => {
    const element = View(
      {
        onClick() {
          console.log("hello");
        },
      },
      [
        Show({
          when: true,
          ok() {
            return ["Toggle Content"];
          },
        }),
      ],
    );
    const result = renderToString(element);
    expect(result).toBe(`<div>Toggle Content</div>`);
  });

  it("show element with reactive value", () => {
    const visible_ = ref(true);
    const element = Show({
      when: visible_,
      ok() {
        return ["Toggle Content"];
      },
    });
    const result = renderToString(element);
    expect(result).toBe(`Toggle Content`);
  });
});

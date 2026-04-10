import { describe, it, expect } from "vitest";
import { Button, ref, Show, View } from "@timeless/timeless";

import { renderToString } from "../index";

describe("renderToString", () => {
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
        },
      },
      [],
    );

    const result = renderToString(element);
    expect(result).toBe(`<div data-user-id="123" data-is-active="true"></div>`);
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

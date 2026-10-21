import { describe, expect, it } from "vitest";
import { compileNativeStyles } from "../native-styles";

describe("native CSS compiler", () => {
  it("compiles compound/state selectors and expands shorthands in declaration order", () => {
    const rules = compileNativeStyles(
      `
      .button, .button.primary:hover {
        padding: 4px 8px 12px;
        padding-left: 16px;
        background-color: #1234;
        border-radius: 0;
      }
    `,
      "theme.native.css",
    );
    expect(rules[1]).toEqual({
      classes: ["button", "primary"],
      states: ["hover"],
      style: {
        "padding-top": "4px",
        "padding-right": "8px",
        "padding-bottom": "12px",
        "padding-left": "16px",
        "background-color": "#1234",
        "border-radius": "0",
      },
    });
    expect(rules[0].states).toEqual([]);
  });

  it("compiles focus outlines independently of layout borders", () => {
    const [rule] = compileNativeStyles(
      ".button:focus { outline-style: solid; outline-width: 3px; outline-color: #a1a1a180; outline-offset: -1px }",
      "theme.native.css",
    );
    expect(rule.states).toEqual(["focus"]);
    expect(rule.style).toEqual({
      "outline-style": "solid",
      "outline-width": "3px",
      "outline-color": "#a1a1a180",
      "outline-offset": "-1px",
    });
  });

  it("compiles spread rings and blurred outer shadows with an explicit color", () => {
    for (const shadow of ["0 0 0 3px #a1a1a180", "2px -1px 1px 3px #e7000b33", "0 0 2px -1px black", "none"]) {
      const [rule] = compileNativeStyles(`.button:focus { box-shadow: ${shadow} }`, "theme.native.css");
      expect(rule.style).toEqual({ "box-shadow": shadow });
    }
  });

  it.each([
    ".a .b { color: #fff }",
    ".a > .b { color: #fff }",
    "@media (width > 100px) { .a { color: #fff } }",
    ".a { color: var(--foreground) }",
    ".a { color: #fff !important }",
    ".a { box-shadow: 0 0 -1px 3px #000 }",
    ".a { box-shadow: inset 0 0 1px 3px #000 }",
    ".a { box-shadow: 0 0 1px 3px #000, 0 0 2px 1px #fff }",
    ".a { box-shadow: 0 0 1px 3px nonsense }",
    ".a { padding: 1px 2px 3px 4px 5px }",
    ".a { width: nonsense }",
    ".a { outline-width: -1px }",
    ".a { outline-style: dotted }",
  ])("rejects unsupported CSS with the source filename: %s", (source) => {
    expect(() => compileNativeStyles(source, "theme.native.css")).toThrow(
      "theme.native.css",
    );
  });
});

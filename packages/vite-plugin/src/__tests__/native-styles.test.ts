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

  it.each([
    ".a .b { color: #fff }",
    ".a > .b { color: #fff }",
    "@media (width > 100px) { .a { color: #fff } }",
    ".a { color: var(--foreground) }",
    ".a { color: #fff !important }",
    ".a { box-shadow: 0 0 1px #000 }",
    ".a { padding: 1px 2px 3px 4px 5px }",
    ".a { width: nonsense }",
  ])("rejects unsupported CSS with the source filename: %s", (source) => {
    expect(() => compileNativeStyles(source, "theme.native.css")).toThrow(
      "theme.native.css",
    );
  });
});

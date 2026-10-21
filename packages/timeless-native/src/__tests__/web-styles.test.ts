import { readFileSync } from "node:fs";
import { describe, it, expect, afterEach, vi } from "vitest";
import { Button, View, ref, vm } from "@timeless/timeless";
import { Button as ShadcnButton } from "../../../shadcn/src/modules/button";
import { compileWebStyles } from "../../../vite-plugin/src/web-styles";
import { buildAndRender } from "../renderer";
import { registerWebStyleSheet } from "../web-styles";
import { cssVariables, cssMath, cssColor } from "../css-values";
import { bindNativeStyleRoot } from "../stylesheet";

const context = { width: 1000, height: 720, fontSize: 14, rootFontSize: 16 };
afterEach(() => {
  if (vi.isFakeTimers()) vi.runOnlyPendingTimers();
  vi.useRealTimers();
  delete (globalThis as any).__nativeBridge_viewport;
  delete (globalThis as any).__nativeBridge_relayout;
  registerWebStyleSheet("test", { rules: [], properties: {} });
});

describe("shared Web CSS", () => {
  it("recomputes only the changed subtree for local pointer states and ignores unchanged states", () => {
    registerWebStyleSheet(
      "test",
      compileWebStyles(".button:hover { color: #f00 }", "pointer.css"),
    );
    const { dom } = buildAndRender(
      View({ attributes: { n: "page" } }, [
        Button({ class: "button", attributes: { n: "trigger" } }, ["Go"]),
        ...Array.from({ length: 40 }, (_, index) =>
          View({ attributes: { n: `unrelated-${index}` } }, ["Other"]),
        ),
      ]),
    );
    const viewport = vi.fn(() => ({ width: 1000, height: 720 }));
    (globalThis as any).__nativeBridge_viewport = viewport;
    dom.children[0]._setStyleState("hover", true);
    expect(dom.children[0].children[0].style.color).toBe("#ff0000ff");
    expect(viewport.mock.calls.length).toBeLessThanOrEqual(2);
    viewport.mockClear();
    dom.children[0]._setStyleState("hover", true);
    dom.children[0]._setStyleState("active", false);
    expect(viewport).not.toHaveBeenCalled();
  });

  it("still invalidates ancestors and siblings for relational selectors", () => {
    registerWebStyleSheet(
      "test",
      compileWebStyles(
        `
      .panel:has(.trigger:hover) .target { color: #f00 }
      .trigger:focus + .target { background-color: #00f }
      .panel:focus-within { border-width: 2px }
      .panel:has(.selected) .target { height: 40px }
      .panel:has([data-open]) .target { width: 80px }
    `,
        "relations.css",
      ),
    );
    const trigger = Button({ class: "trigger", attributes: { n: "trigger" } }, [
      "Go",
    ]);
    const { dom } = buildAndRender(
      View({ class: "panel", attributes: { n: "panel" } }, [
        trigger,
        View({ class: "target", attributes: { n: "target" } }),
      ]),
    );
    const [button, target] = dom.children;
    button._setStyleState("hover", true);
    expect(target.style.color).toBe("#ff0000ff");
    button._setStyleState("hover", false);
    expect(target.style.color).toBeUndefined();
    button._setStyleState("focus", true);
    expect(target.style["background-color"]).toBe("#0000ffff");
    expect(dom.style["border-width"]).toBe("2px");
    button._setStyleState("focus", false);
    expect(dom.style["border-width"]).toBeUndefined();
    trigger.$elm.setStyleSet(["trigger", "selected"]);
    expect(target.style.height).toBe("40px");
    trigger.$elm.setStyleSet(["trigger"]);
    expect(target.style.height).toBeUndefined();
    trigger.$elm.setAttribute("data-open", "");
    expect(target.style.width).toBe("80px");
    trigger.$elm.removeAttribute("data-open");
    expect(target.style.width).toBeUndefined();
  });

  it("paints color and shadow changes without Yoga layout, but lays out changed dimensions", () => {
    vi.useFakeTimers();
    registerWebStyleSheet(
      "test",
      compileWebStyles(
        `
      .button:hover { background-color: #f00; box-shadow: 0 0 0 3px #123 }
      .button:active { height: 40px }
    `,
        "paint.css",
      ),
    );
    const { dom } = buildAndRender(
      Button({ class: "button", attributes: { n: "paint-button" } }, ["Go"]),
    );
    const relayout = vi.fn();
    (globalThis as any).__nativeBridge_relayout = relayout;
    dom._onStyleChange = vi.fn();
    dom._setStyleState("hover", true);
    expect(dom._onStyleChange).toHaveBeenCalled();
    expect(dom.style["box-shadow"]).toBe("0 0 0 3px #112233ff");
    vi.runAllTimers();
    expect(relayout).not.toHaveBeenCalled();
    dom._setStyleState("active", true);
    vi.runAllTimers();
    expect(relayout).toHaveBeenCalledTimes(1);
  });

  it("defers hidden page styling and applies the current theme when showing it", () => {
    registerWebStyleSheet(
      "test",
      compileWebStyles(
        `
      .theme { --ink: #00f }
      .dark { --ink: #f00 }
      .label { color: var(--ink) }
      .hidden { display: none }
    `,
        "hidden.css",
      ),
    );
    const theme = ref("theme");
    const pageClass = ref("hidden");
    const { dom } = buildAndRender(
      View({ class: theme, attributes: { n: "theme" } }, [
        View({ class: pageClass, attributes: { n: "page" } }, [
          View({ class: "label", attributes: { n: "label" } }, ["Text"]),
        ]),
      ]),
    );
    theme.as("theme dark");
    pageClass.as("");
    expect(dom.children[0].children[0].style.color).toBe("#ff0000ff");
  });

  it("keeps reactive caller classes when a shadcn Button changes state", () => {
    const selection = ref("menu-idle");
    const store = new vm.ButtonCore({ variant: "ghost" });
    const { dom } = buildAndRender(
      ShadcnButton({ store, class: selection }, ["Page"]),
    );
    expect(dom.attrs.class).toContain("menu-idle");
    expect(dom.attrs.class).not.toContain("[object Object]");
    selection.as("menu-selected");
    expect(dom.attrs.class).toContain("menu-selected");
    expect(dom.attrs.class).not.toContain("menu-idle");
    store.setVariant("secondary");
    expect(dom.attrs.class).toContain("bg-secondary");
    expect(dom.attrs.class).toContain("menu-selected");
    store.disable();
    expect(dom.attrs.class).toContain("opacity-50");
    expect(dom.attrs.class).toContain("menu-selected");
  });

  it("resolves variable fallbacks, cycles, CSS lengths and color functions", () => {
    expect(cssVariables("var(--empty,)", {})).toBe("");
    expect(cssVariables("var(--a, red)", { "--a": "var(--a)" })).toBe("red");
    expect(cssMath("calc(.25rem * 2.5)", context)).toBe("10px");
    expect(cssMath("calc(1px + 2px * 3)", context)).toBe("7px");
    expect(cssMath("calc(1px / 0)", context)).toBeUndefined();
    expect(cssColor("oklch(.708 0 0)")).toBe("#a1a1a1ff");
    expect(
      cssColor("color-mix(in oklab, oklch(.708 0 0) 50%, transparent)"),
    ).toBe("#a1a1a180");
  });

  it("matches escaped classes and focus-visible without changing layout borders", () => {
    registerWebStyleSheet(
      "test",
      compileWebStyles(
        `
      @property --tw-ring-shadow { syntax: '*'; inherits: false; initial-value: 0 0 #0000 }
      :root { --ring: oklch(.708 0 0); --spacing: .25rem }
      .button { border-width: 1px; border-color: transparent; padding-inline: calc(var(--spacing) * 2.5) }
      .focus-visible\\:ring-3:focus-visible { --tw-ring-shadow: var(--tw-ring-inset,) 0 0 0 calc(3px + 0px) var(--ring); box-shadow: 0 0 #0000, var(--tw-ring-shadow) }
      .dark { --ring: #ffffff }
    `,
        "shared.css",
      ),
    );
    const theme = ref("");
    const { dom } = buildAndRender(
      View({ class: theme, attributes: { n: "root" } }, [
        Button(
          { class: "button focus-visible:ring-3", attributes: { n: "save" } },
          ["Save"],
        ),
      ]),
    );
    const button = dom.children[0];
    expect(button.style["padding-left"]).toBe("10px");
    expect(button.style["border-width"]).toBe("1px");
    button._setStyleState("focus", true);
    expect(button.style["box-shadow"]).toBeUndefined();
    button._setStyleState("focus-visible", true);
    expect(button.style["box-shadow"]).toBe("0 0 0 3px #a1a1a1ff");
    expect(button.style["border-width"]).toBe("1px");
    expect(button.children[0].style["box-shadow"]).toBeUndefined();
    theme.as("dark");
    expect(button.style["box-shadow"]).toBe("0 0 0 3px #ffffffff");
    button._setStyleState("focus-visible", false);
    expect(button.style["box-shadow"]).toBeUndefined();
  });

  it("consumes the actual shadcn stylesheet, including ring variables and theme tokens", () => {
    const css = readFileSync(
      new URL("../../../shadcn/dist/timeless.shadcn.css", import.meta.url),
      "utf8",
    );
    registerWebStyleSheet("test", compileWebStyles(css, "shadcn.css"));
    const { dom } = buildAndRender(
      Button(
        {
          class:
            "tt-border tt-bg-primary tt-text-primary-foreground tt-rounded-lg focus-visible:tt-ring-3 focus-visible:tt-ring-ring/50 focus-visible:tt-border-ring",
          attributes: { n: "real-styles" },
        },
        ["Save"],
      ),
    );
    expect(dom.style["background-color"]).toMatch(/^#[\da-f]{8}$/);
    expect(dom.style["border-radius"]).toBe("10px");
    dom._setStyleState("focus-visible", true);
    expect(dom.style["box-shadow"]).toBe("0 0 0 3px #a1a1a180");
    expect(dom.style["border-width"]).toBe("1px");
    bindNativeStyleRoot(dom);
    const changed = css.replace(/calc\(3px\s*\+/g, "calc(5px +");
    expect(changed).not.toBe(css);
    registerWebStyleSheet("test", compileWebStyles(changed, "shadcn.css"));
    expect(dom.style["box-shadow"]).toBe("0 0 0 5px #a1a1a180");
  });
});

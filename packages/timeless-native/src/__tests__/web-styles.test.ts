import { readFileSync } from "node:fs";
import { describe, it, expect, afterEach, vi } from "vitest";
import { Button, View, ref, vm } from "@timeless/timeless";
import { Button as ShadcnButton } from "../../../shadcn/src/modules/button";
import { compileWebStyles } from "../../../vite-plugin/src/web-styles";
import { buildAndRender } from "../renderer";
import { computeWebStyle, registerWebStyleSheet } from "../web-styles";
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
  it.each([
    ":where(.peer):disabled + .target { color: #f00 }",
    ":where(.peer):not(:enabled) + .target { color: #f00 }",
    ".panel:has(.peer:disabled) .target { color: #f00 }",
    ".panel:has(.peer[disabled]) .target { color: #f00 }",
  ])("invalidates disabled dependencies only for their owners: %s", (css) => {
    registerWebStyleSheet("test", compileWebStyles(css, "disabled-owners.css"));
    const disabled = ref(false);
    const peer_disabled = ref(false);
    const { dom } = buildAndRender(View({ class: "panel" }, [
      Button({ disabled }, ["Unrelated"]),
      Button({ class: "peer", disabled: peer_disabled }, ["Owner"]),
      View({ class: "target" }, ["Dependent"]),
    ]));
    const viewport = vi.fn(() => ({ width: 1000, height: 720 }));
    (globalThis as any).__nativeBridge_viewport = viewport;
    disabled.as(true);
    expect(viewport).not.toHaveBeenCalled();
    expect(dom.children[2].style.color).toBeUndefined();
    peer_disabled.as(true);
    expect(dom.children[2].style.color).toBe("#ff0000ff");
    peer_disabled.as(false);
    expect(dom.children[2].style.color).toBeUndefined();
  });

  it("does not walk a table when passive ancestors first enter hover, but preserves row hover and later class changes", () => {
    registerWebStyleSheet("test", compileWebStyles(`
      .row:hover { background-color: #f00 }
      .highlight:hover { color: #00f }
    `, "table-hover.css"));
    const rows = Array.from({ length: 20 }, (_, row) => View(
      { class: "row", attributes: { n: `row-${row}` } },
      Array.from({ length: 4 }, (_, column) => View(
        { attributes: { n: `cell-${row}-${column}` } }, ["Invoice"],
      )),
    ));
    const root = View({ attributes: { n: "table-container" } }, [
      View({ attributes: { n: "table" } }, rows),
    ]);
    const { dom } = buildAndRender(root);
    const viewport = vi.fn(() => ({ width: 1000, height: 720 }));
    (globalThis as any).__nativeBridge_viewport = viewport;
    dom._setStyleState("hover", true);
    dom.children[0]._setStyleState("hover", true);
    expect(viewport).not.toHaveBeenCalled();
    const row = dom.children[0].children[0];
    row._setStyleState("hover", true);
    expect(row.style["background-color"]).toBe("#ff0000ff");
    expect(viewport.mock.calls.length).toBeLessThanOrEqual(9);
    row._setStyleState("hover", false);
    expect(row.style["background-color"]).toBeUndefined();
    root.$elm.setStyleSet(["highlight"]);
    expect(row.style.color).toBe("#0000ffff");
  });

  it("observes hover on group, peer and nested logical selector owners without invalidating unrelated ancestors", () => {
    registerWebStyleSheet("test", compileWebStyles(`
      .target:is(:where(.group):hover *) { color: #f00 }
      :where(.peer):not(:hover) + .target { background-color: #00f }
      .panel:has(.trigger:hover) .target { opacity: .5 }
    `, "state-owners.css"));
    const { dom } = buildAndRender(View({ class: "panel", attributes: { n: "panel" } }, [
      View({ class: "group", attributes: { n: "group" } }, [
        Button({ class: "peer trigger", attributes: { n: "peer" } }, ["Hover"]),
        View({ class: "target", attributes: { n: "target" } }, ["Target"]),
      ]),
    ]));
    const [group] = dom.children;
    const [peer, target] = group.children;
    const viewport = vi.fn(() => ({ width: 1000, height: 720 }));
    (globalThis as any).__nativeBridge_viewport = viewport;
    dom._setStyleState("hover", true);
    expect(viewport).not.toHaveBeenCalled();
    group._setStyleState("hover", true);
    expect(target.style.color).toBe("#ff0000ff");
    expect(target.style["background-color"]).toBe("#0000ffff");
    peer._setStyleState("hover", true);
    expect(target.style["background-color"]).toBeUndefined();
    expect(target.style.opacity).toBe(".5");
    peer._setStyleState("hover", false);
    expect(target.style.opacity).toBeUndefined();
    expect(target.style["background-color"]).toBe("#0000ffff");
  });

  it("reuses unchanged cascades and invalidates cached variables, viewport, inline values and sheets", () => {
    let width = 1000;
    (globalThis as any).__nativeBridge_viewport = () => ({ width, height: 720 });
    registerWebStyleSheet("test", compileWebStyles(`
      .root { --gap: 10px }
      .item { width: calc(var(--gap) + 1vw); color: #f00 }
      @media (min-width: 900px) { .item { color: #00f } }
    `, "cache.css"));
    const parent = { type: "view", attrs: { class: "root" }, style: {} };
    const child = { type: "view", attrs: { class: "item" }, style: {}, parentNode: parent };
    const parent_inline = { "--gap": "10px" };
    const inline: Record<string, string> = {};
    const inherited = { "font-size": "14px" };
    const refresh_parent = () => computeWebStyle(parent, {}, {}, parent_inline);
    const resolve = () => computeWebStyle(child, inherited, {}, inline)!;
    refresh_parent();
    const first = resolve();
    expect(first.width).toBe("20px");
    expect(first.color).toBe("#0000ffff");
    refresh_parent();
    expect(resolve()).toBe(first);
    parent_inline["--gap"] = "20px";
    refresh_parent();
    expect(resolve().width).toBe("30px");
    width = 600;
    expect(resolve().width).toBe("26px");
    expect(resolve().color).toBe("#ff0000ff");
    inline.width = "2em";
    expect(resolve().width).toBe("28px");
    inherited["font-size"] = "20px";
    expect(resolve().width).toBe("40px");
    inline.width = "3em";
    expect(resolve().width).toBe("60px");
    registerWebStyleSheet("test", compileWebStyles(".item { opacity: .5 }", "replacement.css"));
    expect(resolve().opacity).toBe(".5");
    expect(resolve().color).toBeUndefined();
  });

  it("inherits white-space into text and permits wrapping inside a nested surface", () => {
    registerWebStyleSheet("test", compileWebStyles(".nowrap { white-space: nowrap } .normal { white-space: normal }", "whitespace.css"));
    const { dom } = buildAndRender(View({ class: "nowrap" }, [
      Button({}, ["Keep button text on one line"]),
      View({ class: "normal" }, ["Allow the surface description to wrap"]),
    ]));
    expect(dom.children[0].children[0].style["white-space"]).toBe("nowrap");
    expect(dom.children[1].children[0].style["white-space"]).toBe("normal");
  });

  it("coalesces event-driven style changes without recalculating unrelated siblings", () => {
    registerWebStyleSheet("test", compileWebStyles(".selected { color: #123 }", "event.css"));
    const selected = ref("");
    const { dom } = buildAndRender(View({}, [
      Button({ class: selected, onClick() { selected.as("intermediate"); selected.as("selected"); } }, ["Choose"]),
      ...Array.from({ length: 40 }, () => View({}, ["Unrelated"])),
    ]));
    const viewport = vi.fn(() => ({ width: 1000, height: 720 }));
    (globalThis as any).__nativeBridge_viewport = viewport;
    dom.children[0]._dispatchNativeEvent("click");
    expect(dom.children[0].children[0].style.color).toBe("#112233ff");
    expect(viewport.mock.calls.length).toBeLessThanOrEqual(2);
  });

  it("resolves a newly built subtree once after its nodes have parents", () => {
    registerWebStyleSheet("test", compileWebStyles(".calendar { color: #123 } .day { height: 32px }", "build.css"));
    const viewport = vi.fn(() => ({ width: 1000, height: 720 }));
    (globalThis as any).__nativeBridge_viewport = viewport;
    const { dom } = buildAndRender(View({ class: "calendar" }, Array.from({ length: 84 }, () => Button({ class: "day" }, ["1"]))));
    expect(dom.children[83].style.height).toBe("32px");
    expect(dom.children[83].children[0].style.color).toBe("#112233ff");
    expect(viewport.mock.calls.length).toBeLessThanOrEqual(169);
  });

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

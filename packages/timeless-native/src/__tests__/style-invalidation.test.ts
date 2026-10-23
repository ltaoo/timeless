import { afterEach, expect, it, vi } from "vitest";
import { Button, Checkbox, Radio, View, ref } from "@timeless/timeless";
import { compileWebStyles } from "../../../vite-plugin/src/web-styles";
import { buildAndRender, nativePlatform } from "../renderer";
import type { BoxMethods } from "../host/box";
import { registerWebStyleSheet } from "../web-styles";

function mount(css: string, content: any) {
  vi.useFakeTimers();
  registerWebStyleSheet(
    "invalidation",
    compileWebStyles(css, "invalidation.css"),
  );
  const view = View({ attributes: { n: "application" } }, [
    content,
    ...Array.from({ length: 40 }, (_, index) =>
      View({ attributes: { n: `unrelated-page-${index}` } }, ["Other page"]),
    ),
  ]);
  const { dom } = buildAndRender(view);
  view.onMounted({ target: view.$elm });
  const viewport = vi.fn(() => ({ width: 1000, height: 720 }));
  (globalThis as any).__nativeBridge_viewport = viewport;
  return { dom, viewport };
}
afterEach(() => {
  vi.runOnlyPendingTimers();
  vi.useRealTimers();
  delete (globalThis as any).__nativeBridge_viewport;
  registerWebStyleSheet("invalidation", { rules: [], properties: {} });
});

it.each([
  [".source[data-open] + .target", "data-open", ""],
  [".source[data-open] ~ .target", "data-open", ""],
  [".panel:has(.source[data-open]) .target", "data-open", ""],
  [".target:is(:where(.source)[data-open] ~ *)", "data-open", ""],
  [".target:not(:where(.source)[data-open] ~ *)", "data-open", ""],
  [".source.selected + .target", "class", "source selected"],
  ["#selected + .target", "id", "selected"],
  ['.source[class="source selected"] + .target', "class", "source selected"],
])(
  "scopes attribute and class changes including removal: %s",
  (selector, key, value) => {
    const source = Button({ class: "source", attributes: { n: "source" } }, [
      "Open",
    ]);
    const { dom, viewport } = mount(
      `${selector} { color: #f00 }`,
      View({ class: "panel", attributes: { n: "panel" } }, [
        source,
        View({ class: "target", attributes: { n: "target" } }, ["Target"]),
      ]),
    );
    const target = dom.children[0].children[1];
    const initial = target.style.color;
    source.$elm.setAttribute(key, value);
    expect(target.style.color).not.toBe(initial);
    expect(viewport.mock.calls.length).toBeLessThanOrEqual(4);
    viewport.mockClear();
    if (key === "class") source.$elm.setStyleSet(["source"]);
    else source.$elm.removeAttribute(key);
    expect(target.style.color).toBe(initial);
    expect(viewport.mock.calls.length).toBeLessThanOrEqual(4);
  },
);

it("ignores unchanged peer classes and unobserved semantic attributes, but preserves exact class selectors", () => {
  const source = Button(
    { class: "peer selected", attributes: { n: "source" } },
    ["Open"],
  );
  const { dom, viewport } = mount(
    `
    .peer + .target { color: #f00 }
    [class="peer selected"] + .target { opacity: .5 }
    .selected { background-color: #000 }
    .alternate { background-color: #fff }
  `,
    View({}, [source, View({ class: "target" }, ["Target"])]),
  );
  source.$elm.setAttribute("n", "renamed-source");
  expect(viewport).not.toHaveBeenCalled();
  source.$elm.setStyleSet(["selected", "peer"]);
  expect(dom.children[0].children[1].style.opacity).toBeUndefined();
  viewport.mockClear();
  source.$elm.setStyleSet(["peer", "alternate"]);
  expect(dom.children[0].children[0].style["background-color"]).toBe(
    "#ffffffff",
  );
  expect(dom.children[0].children[1].style.color).toBe("#ff0000ff");
  expect(viewport.mock.calls.length).toBeLessThanOrEqual(4);
});

it("scopes focus-within to matching ancestors and restores their styles on blur", () => {
  const source = Button({}, ["Focus"]);
  const { dom, viewport } = mount(
    ".panel:focus-within { border-width: 2px }",
    View({ class: "panel" }, [source]),
  );
  source.$elm.$elm._setStyleState("focus", true);
  expect(dom.children[0].style["border-width"]).toBe("2px");
  expect(viewport.mock.calls.length).toBeLessThanOrEqual(3);
  viewport.mockClear();
  source.$elm.$elm._setStyleState("focus", false);
  expect(dom.children[0].style["border-width"]).toBeUndefined();
  expect(viewport.mock.calls.length).toBeLessThanOrEqual(3);
});

it("invalidates has, empty and positional selectors on child insert, move and removal", () => {
  const items = View({ class: "items", attributes: { n: "items" } });
  const { dom, viewport } = mount(
    `
    .panel:has(.selected) .target { color: #f00 }
    .items:empty { opacity: .5 }
    .item:first-child { height: 30px }
    .item:last-child { width: 40px }
  `,
    View({ class: "panel" }, [items, View({ class: "target" }, ["Target"])]),
  );
  const target = dom.children[0].children[1];
  const host = items.$elm as unknown as BoxMethods;
  host.insert(0, [
    View({ class: "item selected" }, ["One"]),
    View({ class: "item" }, ["Two"]),
  ]);
  expect(target.style.color).toBe("#ff0000ff");
  expect(host.get$elm().style.opacity).toBeUndefined();
  const [one, two] = host.get$elm().children;
  expect(one.style.height).toBe("30px");
  expect(two.style.width).toBe("40px");
  host.move(0, 1);
  expect(two.style.height).toBe("30px");
  expect(one.style.height).toBeUndefined();
  host.remove(1, 1);
  expect(target.style.color).toBeUndefined();
  host.remove(0, 1);
  expect(host.get$elm().style.opacity).toBe(".5");
  expect(viewport.mock.calls.length).toBeLessThan(40);
});

it("updates empty selectors when reactive text becomes empty or nonempty", () => {
  const text = ref("");
  const { dom, viewport } = mount(
    ".panel:has(.value:empty) .target { color: #f00 }",
    View({ class: "panel" }, [
      View({ class: "value" }, [text]),
      View({ class: "target" }, ["Target"]),
    ]),
  );
  const target = dom.children[0].children[1];
  expect(target.style.color).toBe("#ff0000ff");
  text.as("Filled");
  expect(target.style.color).toBeUndefined();
  text.as("");
  expect(target.style.color).toBe("#ff0000ff");
  expect(viewport.mock.calls.length).toBeLessThan(12);
});

it("paints a large container without restyling descendants when inheritance is unchanged", () => {
  const panel = View(
    { class: "panel" },
    Array.from({ length: 100 }, () => View({}, ["Row"])),
  );
  const { dom, viewport } = mount(
    ".panel:hover { background-color: #f00; border-width: 2px }",
    panel,
  );
  const container = dom.children[0];
  container._setStyleState("hover", true);
  expect(container.style["background-color"]).toBe("#ff0000ff");
  expect(viewport).toHaveBeenCalledTimes(1);
  viewport.mockClear();
  panel.$elm.setStyleValue("padding", "12px");
  expect(viewport).toHaveBeenCalledTimes(1);
});

it("propagates inherited styles and CSS variables once while coalescing descendant selectors", () => {
  const source = View({ class: "source" }, [
    View({ class: "target" }, ["Target"]),
  ]);
  const { dom, viewport } = mount(
    `
    .source { --space: 10px }
    .source.selected { color: #f00; --space: 20px }
    .target { width: var(--space) }
    .source.selected .target { height: 30px }
  `,
    source,
  );
  source.$elm.setStyleSet(["source", "selected"]);
  const target = dom.children[0].children[0];
  expect(target.style).toMatchObject({
    color: "#ff0000ff",
    height: "30px",
  });
  expect(parseFloat(target.style.width)).toBe(20);
  expect(target.children[0].style.color).toBe("#ff0000ff");
  expect(viewport).toHaveBeenCalledTimes(3);
});

it("restores descendant selectors and inheritance when a hidden container is revealed", () => {
  const source = View({ class: "source hidden" }, [
    View({ class: "target" }, ["Target"]),
  ]);
  const { dom } = mount(
    ".hidden { display: none } .source.revealed .target { color: #f00 }",
    source,
  );
  source.$elm.setStyleSet(["source", "revealed"]);
  expect(dom.children[0].children[0].children[0].style.color).toBe("#ff0000ff");
});

it.each([Checkbox, Radio])(
  "invalidates checked selectors through native control updates: %s",
  (Control) => {
    const source = Control({ class: "source" });
    const { dom, viewport } = mount(
      ".source:checked + .target { color: #f00 }",
      View({}, [source, View({ class: "target" }, ["Target"])]),
    );
    const target = dom.children[0].children[1];
    source.$elm.setChecked(true);
    expect(target.style.color).toBe("#ff0000ff");
    expect(viewport.mock.calls.length).toBeLessThanOrEqual(2);
    source.$elm.setChecked(false);
    expect(target.style.color).toBeUndefined();
    source.$elm.setAttribute("checked", "true");
    expect(target.style.color).toBe("#ff0000ff");
    source.$elm.removeAttribute("checked");
    expect(target.style.color).toBeUndefined();
  },
);

it("applies structural invalidation to native platform insert, replace and remove", () => {
  const { dom, viewport } = mount(
    ".panel:has(.selected) .target { color: #f00 }",
    View({ class: "panel" }, [
      View({ class: "items" }),
      View({ class: "target" }, ["Target"]),
    ]),
  );
  const [items, target] = dom.children[0].children;
  const platform = nativePlatform();
  const source = buildAndRender(View({ class: "selected" })).dom;
  viewport.mockClear();
  platform.insertChild(items, source, 0);
  expect(target.style.color).toBe("#ff0000ff");
  const replacement = buildAndRender(View({ class: "selected" })).dom;
  platform.replaceChild(source, replacement);
  expect(target.style.color).toBe("#ff0000ff");
  platform.removeChild(replacement);
  expect(target.style.color).toBeUndefined();
  expect(viewport.mock.calls.length).toBeLessThan(20);
});

it("keeps structural refreshes when the same batch changes inheritance above an overriding child", () => {
  const branch = View({ class: "branch" });
  const source = View({ class: "source" }, [branch]);
  const { dom, viewport } = mount(
    `
    .source.changed { color: #f00 }
    .branch { color: #00f }
    .branch > .added { width: 20px }
  `,
    source,
  );
  dom._batchStyleUpdates(() => {
    source.$elm.setStyleSet(["source", "changed"]);
    (branch.$elm as unknown as BoxMethods).insert(0, [
      View({ class: "added" }, ["New"]),
    ]);
  });
  expect(dom.children[0].children[0].children[0].style.width).toBe("20px");
  expect(viewport).toHaveBeenCalledTimes(4);
});

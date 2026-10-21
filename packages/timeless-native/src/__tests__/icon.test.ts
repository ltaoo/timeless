import { describe, expect, it, vi } from "vitest";
import {
  Icon,
  View,
  getIconRegistry,
  registerIcons,
  ref,
  patch,
} from "@timeless/timeless";
import { buildAndRender, nativePlatform } from "../renderer";
import { bindNativeStyleRoot } from "../stylesheet";

describe("native Icon", () => {
  it("serializes every registered SVG without importing another icon library", () => {
    for (const name of Object.keys(getIconRegistry())) {
      const element = Icon({ name, size: 16 });
      const { dom } = buildAndRender(element);
      expect(dom.svg).toContain('xmlns="http://www.w3.org/2000/svg"');
      expect(dom.svg).toContain('viewBox="0 0 24 24"');
      expect(dom.svg).toContain('stroke="currentColor"');
      expect(dom.size).toBe(16);
      element.onUnmounted();
    }
    const { dom } = buildAndRender(Icon({ name: "house.fill" }));
    expect(dom.name).toBe("house.fill");
    expect(dom.svg).toBeNull();
    expect(buildAndRender(Icon({ name: "constructor" })).dom.svg).toBeNull();
  });

  it("escapes XML values and rejects malformed XML names", () => {
    const registry = getIconRegistry();
    registerIcons({
      "test-escaped": { tag: "svg", attrs: { "aria-label": 'A & "B" <C>' } },
      "test-invalid": { tag: "svg><script" },
    });
    try {
      expect(buildAndRender(Icon({ name: "test-escaped" })).dom.svg).toContain(
        'aria-label="A &amp; &quot;B&quot; &lt;C&gt;"',
      );
      expect(() => buildAndRender(Icon({ name: "test-invalid" }))).toThrow(
        "Invalid icon tag",
      );
    } finally {
      delete registry["test-escaped"];
      delete registry["test-invalid"];
    }
  });

  it("updates reactive props, inherits theme colors, patches in place and disposes old subscriptions", () => {
    vi.useFakeTimers();
    const relayout = vi.fn();
    (globalThis as any).__nativeBridge_relayout = relayout;
    const name = ref("house");
    const size = ref(16);
    const color = ref("currentColor");
    const element = Icon({ name, size, color, attributes: { n: "test-icon" } });
    const parent = View({ style: { color: "#123456" } }, [element]);
    const { dom: root } = buildAndRender(parent);
    bindNativeStyleRoot(root);
    const dom = root.children[0];
    const update = vi.fn();
    dom._onIconChange = update;
    const style_update = vi.fn();
    dom._onStyleChange = style_update;
    try {
      expect(dom.style.color).toBe("#123456");
      parent.$elm.setStyle({ color: "#abcdef" });
      expect(dom.style.color).toBe("#abcdef");
      expect(style_update).toHaveBeenCalled();
      const initial_svg = dom.svg;
      name.as("bolt");
      size.as(32);
      color.as("#ff0000");
      expect(dom.svg).not.toBe(initial_svg);
      expect(dom.size).toBe(32);
      expect(dom.color).toBe("#ff0000");
      vi.runAllTimers();
      expect(relayout).toHaveBeenCalled();
      const next_size = ref(20);
      const next = Icon({ name: "list", size: next_size });
      patch(element, next, { buildAndRender, platform: nativePlatform() });
      expect(next.$elm.get$elm()).toBe(dom);
      expect(dom.name).toBe("list");
      expect(dom.color).toBe("currentColor");
      expect(dom.size).toBe(20);
      const calls = update.mock.calls.length;
      name.as("search");
      expect(update).toHaveBeenCalledTimes(calls);
      next_size.as(24);
      expect(dom.size).toBe(24);
      next.onUnmounted();
      next_size.as(48);
      expect(dom.size).toBe(24);
    } finally {
      parent.onUnmounted();
      vi.runOnlyPendingTimers();
      vi.useRealTimers();
      delete (globalThis as any).__nativeBridge_relayout;
    }
  });
});

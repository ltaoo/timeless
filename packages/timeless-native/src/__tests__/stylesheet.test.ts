import { Button, Input, Row, Text, View, ref } from "@timeless/timeless";
import { afterEach, describe, expect, it, vi } from "vitest";
import { compileNativeStyles } from "../../../vite-plugin/src/native-styles";
import { buildAndRender } from "../renderer";
import { bindNativeStyleRoot, registerNativeStyleSheet } from "../stylesheet";

function sheet(source: string) {
  registerNativeStyleSheet(
    "test",
    compileNativeStyles(source, "test.native.css"),
  );
}

afterEach(() => {
  vi.useRealTimers();
  delete (globalThis as any).__nativeBridge_relayout;
  sheet("");
});

describe("native class styles", () => {
  it("finishes native event layout once after nested state updates and cancels the deferred pass", () => {
    vi.useFakeTimers();
    sheet(".button:active { height: 40px }");
    const { dom } = buildAndRender(Button({ class: "button" }, ["Go"]));
    dom._onStyleChange = vi.fn();
    const relayout = vi.fn();
    (globalThis as any).__nativeBridge_relayout = relayout;
    dom._batchStyleUpdates(() => {
      dom._batchStyleUpdates(() => dom._setStyleState("active", true));
      expect(relayout).not.toHaveBeenCalled();
    });
    expect(relayout).toHaveBeenCalledTimes(1);
    vi.runAllTimers();
    expect(relayout).toHaveBeenCalledTimes(1);
  });

  it("skips unchanged text and lets hosts avoid layout only when they explicitly return false", () => {
    vi.useFakeTimers();
    const value = ref("old");
    const { dom } = buildAndRender(Text(value));
    const relayout = vi.fn();
    (globalThis as any).__nativeBridge_relayout = relayout;
    const content = vi.fn(() => false);
    dom._onContentChange = content;
    value.as("new");
    vi.runAllTimers();
    expect(content).toHaveBeenCalledWith("new");
    expect(relayout).not.toHaveBeenCalled();
    content.mockClear();
    value.as("new");
    expect(content).not.toHaveBeenCalled();
    dom._onContentChange = () => true;
    value.as("wraps onto another line");
    vi.runAllTimers();
    expect(relayout).toHaveBeenCalledTimes(1);
    dom._onContentChange = () => {};
    value.as("");
    vi.runAllTimers();
    expect(relayout).toHaveBeenCalledTimes(2);
  });

  it("batches native focus, active and listener updates into their final styles", () => {
    sheet(".button:focus { color: #f00 } .button:active { color: #00f }");
    const { dom } = buildAndRender(Button({ class: "button" }, ["Go"]));
    const changed = vi.fn();
    dom._onStyleChange = changed;
    dom._batchStyleUpdates(() => {
      dom._setStyleState("focus", true);
      dom._setStyleState("active", true);
      expect(changed).not.toHaveBeenCalled();
    });
    expect(changed).toHaveBeenCalledTimes(1);
    expect(dom.style.color).toBe("#00f");
  });

  it("updates reactive classes, inherits text styles and removes stale declarations", () => {
    sheet(
      ".primary { color: #fff; background-color: #123; padding: 12px } .danger { color: #f00 }",
    );
    const class_name = ref("primary");
    const child = View({ attributes: { n: "label" } }, [Text("Save")]);
    const button = Button({ class: class_name, attributes: { n: "save" } }, [
      child,
    ]);
    const { dom } = buildAndRender(button);
    expect(dom.style["background-color"]).toBe("#123");
    expect(dom.children[0].children[0].style.color).toBe("#fff");
    class_name.as("danger");
    expect(dom.style["background-color"]).toBe("#eeeeee");
    expect(dom.style["padding-left"]).toBe("12px");
    expect(dom.children[0].children[0].style.color).toBe("#f00");
    class_name.as("");
    expect(dom.style.color).toBeUndefined();
    expect(dom.children[0].children[0].style.color).toBeUndefined();
  });

  it("uses specificity and stylesheet order, while keeping inline overrides", () => {
    sheet(
      ".a { color: #000; height: 20px } .a.b { color: #f00 } .b { color: #fff; height: 30px }",
    );
    const node = View({
      class: "b a",
      style: { height: "40px" },
      attributes: { n: "panel" },
    });
    const { dom } = buildAndRender(node);
    expect(dom.style).toMatchObject({ color: "#f00", height: "40px" });
    node.$elm.setStyle({});
    expect(dom.style.height).toBe("30px");
    node.$elm.setStyleValue("backgroundColor", "#123");
    node.$elm.setStyleSet(["a"]);
    expect(dom.style).toMatchObject({
      color: "#000",
      "background-color": "#123",
    });
  });

  it("resolves interaction/disabled states and replaces sheets on HMR", () => {
    sheet(
      ".button { color: #000 } .button:hover { color: #fff } .button:disabled { opacity: 0.4 }",
    );
    const disabled = ref(false);
    const button = Button(
      { class: "button", disabled, attributes: { n: "action" } },
      [Text("Go")],
    );
    const { dom } = buildAndRender(button);
    bindNativeStyleRoot(dom);
    dom._setStyleState("hover", true);
    expect(dom.children[0].style.color).toBe("#fff");
    disabled.as(true);
    expect(dom.style.opacity).toBe("0.4");
    disabled.as(false);
    expect(dom.style.opacity).toBeUndefined();
    sheet(".button { color: #123 }");
    expect(dom.children[0].style.color).toBe("#123");
  });

  it("coalesces layout after style and text changes and preserves defaults below classes", () => {
    vi.useFakeTimers();
    const relayout = vi.fn();
    (globalThis as any).__nativeBridge_relayout = relayout;
    sheet(".row { gap: 0 } .input { height: 44px }");
    const text = ref("one");
    const input = Input({ attributes: { n: "name" } });
    const row = Row({ class: "row", gap: 20, attributes: { n: "form" } }, [
      Text(text),
      input,
    ]);
    const { dom } = buildAndRender(row);
    expect(dom.style.gap).toBe("0");
    input.$elm.setStyleSet(["input"]);
    expect(dom.children[1].style.height).toBe("44px");
    dom.children[0]._onContentChange = vi.fn();
    text.as("longer text");
    text.as("");
    expect(dom.children[0]._onContentChange).toHaveBeenLastCalledWith("");
    vi.runAllTimers();
    expect(relayout).toHaveBeenCalledTimes(1);
  });
});

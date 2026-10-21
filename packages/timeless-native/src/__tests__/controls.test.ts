import {
  AspectRatio,
  Button,
  Checkbox,
  Grid,
  NumberInput,
  Radio,
  ScrollView,
  Select,
  Textarea,
  View,
  ref,
  refarr,
  ui,
  vm,
} from "@timeless/timeless";
import { describe, expect, it, vi } from "vitest";
import { buildAndRender } from "../renderer";

function options(node: any): any[] {
  return node.type === "select-option"
    ? [node]
    : (node.children ?? []).flatMap(options);
}

describe("native form and scroll protocols", () => {
  it("keeps selected files through intermediate picker state and clears them on reset", () => {
    const store = new vm.FilePickerCore({ accept: ".txt", multiple: true });
    const picker = ui.FilePickerPrimitive.Input({ store });
    const { dom } = buildAndRender(picker);
    picker.onMounted({ target: picker.$elm });
    const file = { name: "example.txt", type: "text/plain", kind: "file" };
    dom._receiveFiles([file]);
    expect(store.value).toEqual([file]);
    expect(dom.files).toEqual([file]);
    store.setAccept(".pdf");
    store.setMultiple(false);
    expect(dom.attrs.accept).toBe(".pdf");
    expect(dom.attrs.multiple).toBeUndefined();
    store.clear();
    expect(dom.files).toEqual([]);
    picker.onUnmounted();
  });

  it("bubbles keyboard events with the original target and honors cancellation", () => {
    const calls: any[] = [];
    const child = Button({ onKeyDown(event) { event.preventDefault(); } }, ["Option"]);
    const { dom } = buildAndRender(View({ onKeyDown(event) { calls.push(event); } }, [child]));
    const button = dom.children[0];
    expect(button._dispatchNativeEvent("keydown", { key: "ArrowDown" })).toBe(true);
    expect(calls).toHaveLength(1);
    expect(calls[0]).toMatchObject({ target: button, currentTarget: dom, key: "ArrowDown", defaultPrevented: true });
    button.listeners.keydown = (event: any) => event.stopPropagation();
    button._dispatchNativeEvent("keydown", { key: "Escape" });
    expect(calls).toHaveLength(1);
    child.onUnmounted();
  });

  it("delivers NumberInput changes and resets numeric/multiline native controls", () => {
    const number = ref(1);
    const content = ref("Draft");
    const input = NumberInput({
      value: number,
      onChange: (event) => number.as(Number((event.target as any).value)),
    });
    const textarea = Textarea({ value: content });
    const numeric = buildAndRender(input).dom;
    const multiline = buildAndRender(textarea).dom;
    numeric.value = "3";
    numeric._dispatchNativeEvent("change");
    expect(number.value).toBe(3);
    const update = vi.fn();
    multiline._onValueChange = update;
    content.as("");
    number.as(1);
    expect([numeric.value, multiline.value]).toEqual(["1", ""]);
    expect(update).toHaveBeenCalledWith("");
    input.onUnmounted();
    textarea.onUnmounted();
  });

  it("uses the Grid shape's column and gap props", () => {
    const { dom } = buildAndRender(Grid({ cols: 3, gap: 10 }));
    expect(dom.style["grid-template-columns"]).toBe("repeat(3, 1fr)");
    expect(dom.style.gap).toBe("10px");
  });

  it("preserves AspectRatio attributes and reactive classes", () => {
    const class_name = ref("preview");
    const ratio = AspectRatio({
      ratio: 2,
      class: class_name,
      attributes: { n: "preview-ratio" },
    });
    const { dom } = buildAndRender(ratio);
    expect(dom.attrs).toMatchObject({ n: "preview-ratio", class: "preview" });
    expect(dom.ratio).toBe(2);
    class_name.as("compact");
    expect(dom.attrs.class).toBe("compact");
    ratio.onUnmounted();
  });

  it("keeps Select classes, grouped options, values and reactive option changes", () => {
    const value = ref(["b"]);
    const items = ref<any[]>([
      { label: "A", value: "a" },
      {
        label: "Group",
        value: "group",
        options: [{ label: "B", value: "b", disabled: true }],
      },
    ]);
    const select = Select({ class: "custom", options: items, value });
    const { dom } = buildAndRender(select);
    select.onMounted({ target: select.$elm });
    expect(dom.attrs.class).toBe("custom");
    expect(dom.value).toBe("b");
    expect(options(dom).map((option) => [option.value, option.label])).toEqual([
      ["a", "A"],
      ["b", "B"],
    ]);
    expect(options(dom)[1].attrs.disabled).toBe("");
    value.as(["a"]);
    expect(dom.value).toBe("a");
    items.as([{ label: "C", value: "c" }]);
    expect(options(dom).map((option) => option.value)).toEqual(["c"]);
    select.onUnmounted();
    items.as([]);
    expect(options(dom).map((option) => option.value)).toEqual(["c"]);
  });

  it("keeps option order during bulk insertion, movement and removal", () => {
    const items = refarr([{ label: "A", value: "a" }], { key: "value" });
    const select = Select({ options: items });
    const { dom } = buildAndRender(select);
    select.onMounted({ target: select.$elm });
    items.insert(0, { label: "B", value: "b" }, { label: "C", value: "c" });
    expect(options(dom).map((option) => option.value)).toEqual(["b", "c", "a"]);
    items.move(2, 0);
    expect(options(dom).map((option) => option.value)).toEqual(["a", "b", "c"]);
    items.as([{ label: "D", value: "d" }]);
    expect(options(dom).map((option) => option.value)).toEqual(["d"]);
    select.onUnmounted();
  });

  it("retains independent click/change handlers and reacts to checked/indeterminate", () => {
    const checked = ref(true);
    const indeterminate = ref(true);
    const click = vi.fn();
    const change = vi.fn();
    const checkbox = Checkbox({
      checked,
      indeterminate,
      onClick: click,
      onChange: change,
    });
    const { dom } = buildAndRender(checkbox);
    expect(dom.checked).toBe(true);
    expect(dom.indeterminate).toBe(true);
    checked.as(false);
    indeterminate.as(false);
    expect(dom.checked).toBe(false);
    expect(dom.indeterminate).toBe(false);
    dom._dispatchNativeEvent("click");
    dom._dispatchNativeEvent("change");
    expect(click).toHaveBeenCalledTimes(1);
    expect(change).toHaveBeenCalledTimes(1);
    checkbox.onUnmounted();
  });

  it("updates Radio and exposes its change event", () => {
    const checked = ref(true);
    const change = vi.fn();
    const radio = Radio({ checked, name: "group", onChange: change });
    const { dom } = buildAndRender(radio);
    expect(dom.checked).toBe(true);
    checked.as(false);
    expect(dom.checked).toBe(false);
    dom._dispatchNativeEvent("change");
    expect(change).toHaveBeenCalledTimes(1);
    radio.onUnmounted();
  });

  it("forwards programmatic scroll positions, metrics and scroll events", () => {
    const on_scroll = vi.fn();
    const mounted = vi.fn();
    const unmounted = vi.fn();
    const scroll = ScrollView(
      { horizontal: "hidden", contentHeight: 900, onScroll: on_scroll },
      [
        View({
          attributes: { n: "scroll-content" },
          onMounted: mounted,
          onUnmounted: unmounted,
        }),
      ],
    );
    const { dom } = buildAndRender(scroll);
    scroll.onMounted({ target: scroll.$elm });
    dom.scrollHeight = 900;
    scroll.methods.scrollTo(20, 40);
    expect([dom.scrollLeft, dom.scrollTop]).toEqual([20, 40]);
    scroll.methods.scrollToBottom();
    expect(dom.scrollTop).toBe(900);
    scroll.methods.scrollToTop();
    expect(dom.scrollTop).toBe(0);
    dom._dispatchNativeEvent("scroll", { scrollTop: 60, scrollLeft: 20 });
    expect(on_scroll).toHaveBeenCalledWith(
      expect.objectContaining({ scrollTop: 60, scrollLeft: 20 }),
    );
    expect(dom.contentHeight).toBe(900);
    expect(mounted).toHaveBeenCalledTimes(1);
    scroll.onUnmounted();
    expect(unmounted).toHaveBeenCalledTimes(1);
  });
});

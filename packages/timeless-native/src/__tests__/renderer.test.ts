import { Icon, Text, View, ref } from "@timeless/timeless";
import { afterEach, expect, it, vi } from "vitest";
import { render } from "../renderer";

afterEach(() => {
  vi.runOnlyPendingTimers();
  vi.useRealTimers();
  delete (globalThis as any).__nativeBridge_render;
  delete (globalThis as any).__nativeBridge_relayout;
});

it("does not repeat initial layout after the native tree has rendered", () => {
  vi.useFakeTimers();
  const bridge = vi.fn();
  const relayout = vi.fn();
  (globalThis as any).__nativeBridge_render = bridge;
  (globalThis as any).__nativeBridge_relayout = relayout;
  render(View({}, [Icon({ name: "house", size: 16 })]));
  vi.runAllTimers();
  expect(bridge).toHaveBeenCalledOnce();
  expect(relayout).not.toHaveBeenCalled();
});

it("preserves layout requested while the native tree is being created", () => {
  vi.useFakeTimers();
  const value = ref("initial");
  const relayout = vi.fn();
  (globalThis as any).__nativeBridge_render = () => value.as("changed during native creation");
  (globalThis as any).__nativeBridge_relayout = relayout;
  render(View({}, [Icon({ name: "house", size: 16 }), Text(value)]));
  vi.runAllTimers();
  expect(relayout).toHaveBeenCalledOnce();
});

import { afterEach, expect, it, vi } from "vitest";
import { View, ui, vm } from "@timeless/timeless";
import { compileWebStyles } from "../../../vite-plugin/src/web-styles";
import { registerWebStyleSheet } from "../web-styles";
import { buildAndRender } from "../renderer";

afterEach(() => {
  if (vi.isFakeTimers()) vi.runOnlyPendingTimers();
  vi.useRealTimers();
  registerWebStyleSheet("transition-test", { rules: [], properties: {} });
});

it("preserves keyframes and resolves their variables independently of utility names", () => {
  const sheet = compileWebStyles(
    `
    @keyframes disappear {
      from { opacity: 1; transform: translateX(0); }
      50%, 75% { opacity: .4; }
      to { opacity: var(--end-opacity); transform: translateX(100%) scale(.95); }
    }
    .moving { --end-opacity: .2; --duration: 450ms; --curve: cubic-bezier(.1,.2,.3,1); --delay: 20ms; animation: disappear var(--duration)var(--curve)var(--delay)both; }
  `,
    "transition.css",
  );
  expect(sheet.keyframes.disappear.map((frame) => frame.offset)).toEqual([
    0, 0.5, 0.75, 1,
  ]);
  expect(sheet.rules).toHaveLength(1);
  registerWebStyleSheet("transition-test", sheet);
  const { dom } = buildAndRender(
    View({ class: "moving", style: { "animation-fill-mode": "forwards" } }),
  );
  expect(JSON.parse(dom.style["-timeless-animation"])).toMatchObject({
    name: "disappear",
    duration: "450ms",
    delay: "20ms",
    fill: "forwards",
    timing: "cubic-bezier(.1,.2,.3,1)",
    frames: [
      { offset: 0, style: { opacity: "1" } },
      { offset: 0.5 },
      { offset: 0.75 },
      {
        offset: 1,
        style: { opacity: ".2", transform: "translateX(100%) scale(.95)" },
      },
    ],
  });
});

it("keeps Transition mounted until the actual animation ends instead of the fallback timer", () => {
  vi.useFakeTimers();
  const store = new vm.PresenceCore();
  const view = ui.Transition(
    {
      store,
      attributes: { n: "animated" },
      animation: { in: "enter", out: "exit" },
    },
    ["Content"],
  );
  const { dom } = buildAndRender(view);
  view.onMounted({ target: view.$elm });
  store.show();
  vi.advanceTimersByTime(0);
  let content = dom.children[0];
  content._dispatchNativeEvent("animationstart");
  vi.advanceTimersByTime(400);
  expect(store.enter).toBe(true);
  content._dispatchNativeEvent("animationend");
  expect(store.enter).toBe(false);
  store.hide();
  content._dispatchNativeEvent("animationstart");
  vi.advanceTimersByTime(400);
  expect(store.exit).toBe(true);
  expect(dom.children).toHaveLength(1);
  content._dispatchNativeEvent("animationend");
  expect(store.mounted).toBe(false);
  expect(dom.children).toHaveLength(0);
  store.show();
  vi.advanceTimersByTime(0);
  content = dom.children[0];
  expect(content.attrs.class).toContain("enter");
  content._dispatchNativeEvent("animationstart");
  store.hide();
  content._dispatchNativeEvent("animationstart");
  store.show();
  content._dispatchNativeEvent("animationstart");
  vi.advanceTimersByTime(400);
  expect(store.exit).toBe(false);
  content._dispatchNativeEvent("animationend");
  expect(store.visible).toBe(true);
  view.onUnmounted?.();
  store.reset();
});

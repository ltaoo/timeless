import { afterEach, expect, it, vi } from "vitest";
import { View, ref, vm } from "@timeless/timeless";
import { Tabs } from "../../../shadcn/src/modules/tabs";
import { Accordion } from "../../../shadcn/src/modules/accordion";
import { Steps } from "../../../shadcn/src/modules/steps";
import { Progress } from "../../../shadcn/src/modules/progress";
import { Separator } from "../../../shadcn/src/modules/separator";
import { Alert } from "../../../shadcn/src/modules/alert";
import { buildAndRender } from "../renderer";

function all(node: any): any[] {
  return [node, ...(node.children ?? []).flatMap(all)];
}
function text(node: any): string {
  return node.type === "text"
    ? node.value
    : (node.children ?? []).map(text).join("");
}
function mount(view: any) {
  const { dom } = buildAndRender(view);
  view.onMounted({ target: view.$elm });
  return dom;
}
afterEach(() => vi.useRealTimers());

it("preserves Separator and Alert attributes and data", () => {
  const dom = mount(
    Separator({
      orientation: "vertical",
      attributes: { n: "divider", "aria-label": "Columns" },
      dataset: { section: "profile" },
    }),
  );
  expect(dom.attrs).toMatchObject({
    n: "divider",
    "aria-label": "Columns",
    "aria-orientation": "vertical",
    "data-section": "profile",
    "data-orientation": "vertical",
  });
  const alert = mount(
    Alert({
      attributes: { n: "notice", "aria-label": "Notice" },
      dataset: { section: "profile" },
    }),
  );
  expect(alert.attrs).toMatchObject({
    n: "notice",
    role: "alert",
    "aria-label": "Notice",
    "data-section": "profile",
  });
});

it("switches real shadcn Tabs content", () => {
  vi.useFakeTimers();
  const store = new vm.TabHeaderCore({
    key: "value",
    options: [
      { value: "one", label: "First", content: ["Panel one"] },
      { value: "two", label: "Second", content: ["Panel two"] },
    ],
  } as any);
  const dom = mount(Tabs({ store }));
  const second = all(dom).find(
    (node) => node.type === "button" && text(node) === "Second",
  );
  expect(text(dom)).toContain("Panel one");
  second._dispatchNativeEvent("click");
  expect(text(dom)).toContain("Panel two");
  expect(text(dom)).not.toContain("Panel one");
  vi.runAllTimers();
  expect(store.state.curId).toBe("two");
  second._dispatchNativeEvent("keydown", { key: "Home" });
  expect(store.state.curId).toBe("one");
  expect(second.attrs["aria-selected"]).toBe("false");
  expect(second.attrs.tabindex).toBe("-1");
});

it("toggles Accordion content and retains the themed class", () => {
  const store = vm.AccordionCore();
  const dom = mount(
    Accordion({ store, items: [{ title: ["Question"], content: ["Answer"] }] }),
  );
  const content = all(dom).find(
    (node) => text(node) === "Answer" && node.type === "view",
  );
  expect(content.style.display).toBe("none");
  const trigger = all(dom).find((node) => node.listeners?.click);
  expect(trigger.attrs.type).toBe("button");
  const arrow = all(trigger).find((node) => node.type === "icon");
  expect(arrow.name).toBe("chevron-down");
  expect(arrow.svg).toContain("<svg");
  expect(arrow.attrs["aria-hidden"]).toBe("true");
  expect(text(trigger)).toBe("Question");
  trigger._dispatchNativeEvent("click");
  expect(arrow.name).toBe("chevron-up");
  expect(store.isOpen(0)).toBe(true);
  expect(content.attrs.class).toContain("pb-4");
  expect(content.style.display).not.toBe("none");
  trigger._dispatchNativeEvent("click");
  expect(arrow.name).toBe("chevron-down");
  expect(content.style.display).toBe("none");
});

it("keeps Steps titles and themed circles and updates completed state", () => {
  const store = new vm.StepCore({ value: 0 });
  const dom = mount(
    Steps({ store, items: [{ title: "Account" }, { title: "Complete" }] }),
  );
  expect(text(dom)).toContain("Account");
  const circle = all(dom).find((node) => node.attrs?.class?.includes("h-8"));
  expect(circle).toBeDefined();
  expect(text(circle)).toBe("1");
  store.change(1);
  expect(text(circle)).toBe("✓");
});

it("updates Progress from a ref and a store", () => {
  const value = ref(20);
  const store = new vm.ProgressCore({ value: 30 });
  const dom = mount(View({}, [Progress({ value }), Progress({ store })]));
  const refIndicator = all(dom.children[0]).find(
    (node) => node.style.width === "20%",
  );
  const storeIndicator = all(dom.children[1]).find(
    (node) => node.style.width === "30%",
  );
  value.as(70);
  store.setValue(80);
  expect(refIndicator.style.width).toBe("70%");
  expect(storeIndicator.style.width).toBe("80%");
  expect(dom.children[1].attrs["aria-valuenow"]).toBe("80");
  const numeric = mount(Progress({ value: 45 }));
  expect(all(numeric).some((node) => node.style.width === "45%")).toBe(true);
});

import { afterEach, expect, it, vi } from "vitest";
import { NumberInput, View, ref, vm } from "@timeless/timeless";
import { Form } from "../../../shadcn/src/modules/form";
import { Field } from "../../../shadcn/src/modules/field";
import { Label } from "../../../shadcn/src/modules/label";
import { Input } from "../../../shadcn/src/modules/input";
import { buildAndRender } from "../renderer";

function all(node: any): any[] {
  return [node, ...(node.children ?? []).flatMap(all)];
}
afterEach(() => {
  vi.runOnlyPendingTimers();
  vi.useRealTimers();
});

it("renders Form/Field/Label associations and preserves submit/reset handlers", () => {
  vi.useFakeTimers();
  const target = ref("name");
  const submit = vi.fn((event) => event.preventDefault());
  const reset = vi.fn();
  const view = Form({ onSubmit: submit, onReset: reset }, [
    Field({ attributes: { n: "name-field" } }, [
      Label({ for: target, attributes: { n: "name-label" } }, ["Name"]),
      Input({ id: "name", store: new vm.InputCore({ defaultValue: "" }) }),
    ]),
  ]);
  const { dom } = buildAndRender(view);
  view.onMounted({ target: view.$elm });
  expect(dom.type).toBe("form");
  const label = all(dom).find((node) => node.attrs?.n === "name-label");
  expect(label.type).toBe("label");
  expect(label.attrs.for).toBe("name");
  expect(
    all(dom).find((node) => node.attrs?.n === "name-field").attrs.role,
  ).toBe("group");
  target.as("email");
  expect(label.attrs.for).toBe("email");
  expect(dom._dispatchNativeEvent("submit")).toBe(true);
  expect(submit).toHaveBeenCalledOnce();
  dom._dispatchNativeEvent("reset");
  expect(reset).toHaveBeenCalledOnce();
  view.onUnmounted();
});

it("keeps the existing Field store API and its generated associated label", () => {
  vi.useFakeTimers();
  const input = new vm.InputCore({ defaultValue: "" });
  const store = new vm.SingleFieldCore({ label: "Name", name: "name", input });
  const view = Field({ store, id: "name-control" }, [
    Input({ store: input, id: "name-control" }),
  ]);
  const { dom } = buildAndRender(view);
  view.onMounted({ target: view.$elm });
  expect(all(dom).find((node) => node.type === "label").attrs.for).toBe(
    "name-control",
  );
  expect(
    all(dom).some(
      (node) => node.type === "input" && node.attrs.id === "name-control",
    ),
  ).toBe(true);
  expect(dom.attrs.id).toBeUndefined();
  view.onUnmounted();
});

it("preserves ids on containers and number controls for label association", () => {
  vi.useFakeTimers();
  const view = View({ id: "group" }, [NumberInput({ id: "quantity" })]);
  const { dom } = buildAndRender(view);
  expect(dom.attrs.id).toBe("group");
  expect(dom.children[0].attrs.id).toBe("quantity");
});

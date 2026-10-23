import { afterEach, expect, it, vi } from "vitest";
import { ref } from "@timeless/timeless";
import {
  PaginationEllipsis,
  PaginationLink,
} from "../../../shadcn/src/modules/pagination";
import { TablePageModel } from "../../../../apps/web-shadcn/src/examples/simple/pages/table-model.js";
import { TablePageView } from "../../../../apps/web-shadcn/src/examples/simple/pages/table-view.js";
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
afterEach(() => {
  vi.runOnlyPendingTimers();
  vi.useRealTimers();
});

it("keeps table shapes and paginates real shadcn rows with reactive active and disabled states", () => {
  vi.useFakeTimers();
  const view = TablePageView(TablePageModel());
  const dom = mount(view);
  const find = (name: string) =>
    all(dom).find((node) => node.attrs?.n === name);
  const click = (name: string) => {
    find(name)._dispatchNativeEvent("click");
    vi.runAllTimers();
    const current = all(find("invoices-body"));
    expect(current).toHaveLength(original.length);
    current.forEach((node, index) => expect(node).toBe(original[index]));
  };
  const original = all(find("invoices-body"));
  expect(find("invoices-scroll").type).toBe("scroll-view");
  expect(text(find("invoices-summary"))).toBe("第 1 / 10 页 · 共 200 条账单");
  expect(
    all(find("invoices-body")).filter((node) => node.type === "table-row"),
  ).toHaveLength(20);
  expect(find("invoices-table").type).toBe("table");
  expect(find("invoices-table").attrs.role).toBe("table");
  expect(find("invoices-header").children[0].type).toBe("table-row");
  expect(find("invoices-heading-0").attrs.role).toBe("columnheader");
  expect(find("invoices-previous").attrs.disabled).toBe("");
  expect(find("invoices-page-1").attrs["aria-current"]).toBe("page");
  expect(text(find("invoices-body"))).toContain("INV001");
  click("invoices-next");
  expect(text(find("invoices-body"))).toContain("INV021");
  expect(text(find("invoices-body"))).not.toContain("INV001");
  expect(find("invoices-page-2").attrs["aria-current"]).toBe("page");
  expect(find("invoices-page-1").attrs["aria-current"]).toBeUndefined();
  click("invoices-page-10");
  expect(text(find("invoices-body"))).toContain("INV181");
  expect(text(find("invoices-body"))).toContain("INV200");
  expect(
    all(find("invoices-body")).filter((node) => node.type === "table-row"),
  ).toHaveLength(20);
  expect(find("invoices-next").attrs.disabled).toBe("");
  click("invoices-next");
  expect(text(find("invoices-summary"))).toContain("第 10 / 10 页");
  click("invoices-previous");
  expect(text(find("invoices-body"))).toContain("INV161");
  click("invoices-page-1");
  expect(text(find("invoices-body"))).toContain("INV001");
  expect(find("invoices-previous").attrs.disabled).toBe("");
  view.onUnmounted();
});

it("provides ten pages of twenty unique invoices", () => {
  vi.useFakeTimers();
  const model = TablePageModel();
  const invoices = new Set();
  expect(model.pages).toHaveLength(10);
  model.previous();
  expect(model.summary.value).toBe("第 1 / 10 页 · 共 200 条账单");
  for (const page of model.pages) {
    page.select();
    expect(model.rows.value).toHaveLength(20);
    for (const row of model.rows.value) invoices.add(row.invoice);
  }
  expect(invoices.size).toBe(200);
  model.next();
  expect(model.summary.value).toBe("第 10 / 10 页 · 共 200 条账单");
});

it("updates standalone pagination selection and hides the decorative ellipsis from accessibility", () => {
  vi.useFakeTimers();
  const active = ref(false);
  const view = PaginationLink({ isActive: active }, ["2"]);
  const dom = mount(view);
  expect(dom.attrs["data-active"]).toBe("false");
  active.as(true);
  expect(dom.attrs["aria-current"]).toBe("page");
  expect(dom.attrs["data-active"]).toBe("true");
  expect(mount(PaginationEllipsis()).attrs["aria-hidden"]).toBe("true");
  view.onUnmounted();
});

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { runInNewContext } from "node:vm";

const platform = process.argv[2] ?? "macos";
assert.ok(["macos", "windows"].includes(platform));
const output = resolve(import.meta.dirname, `../dist/${platform}`);
const html = readFileSync(resolve(output, `index.${platform}.html`), "utf8");
assert.match(html, /src="(?:\.\/|\/)?app\.js"/);

let root;
const timers = [];
let timerId = 0;
const activeTimers = new Set();
const errors = [];
const themeChanges = [];
runInNewContext(
  readFileSync(resolve(output, "app.js"), "utf8"),
  {
    console: { log() {}, warn() {}, error: (...args) => errors.push(args) },
    setTimeout(callback) {
      const id = ++timerId;
      activeTimers.add(id);
      timers.push(() => { if (activeTimers.delete(id)) callback(); });
      return id;
    },
    clearTimeout(id) { activeTimers.delete(id); },
    setInterval() {
      return 1;
    },
    clearInterval() {},
    __nativeBridge_render(tree) {
      root = tree;
    },
    __nativeBridge_relayout() {},
    __nativeBridge_prefersDarkMode() { return false; },
    __nativeBridge_setDarkMode(dark) { themeChanges.push(dark); },
  },
  { filename: "app.js", timeout: 5000 },
);
function flush() {
  let count = 0;
  while (timers.length) {
    assert.ok(count++ < 200, "Native updates must settle");
    timers.shift()();
  }
  assert.deepEqual(errors, [], "No runtime errors");
}
flush();
assert.deepEqual(themeChanges, platform === "macos" ? [false] : []);

function find(node, name) {
  if (node.attrs?.n === name) return node;
  return node.children?.map((child) => find(child, name)).find(Boolean);
}
function node(name) {
  const result = find(root, name);
  assert.ok(result, `Missing native node: ${name}`);
  return result;
}
function text(name) {
  const collect = (item) =>
    item.type === "text"
      ? item.value
      : (item.children ?? []).map(collect).join("");
  return collect(node(name));
}
function click(name) {
  node(name)._dispatchNativeEvent("click", {});
  flush();
}
assert.equal(text("page-title"), "共享 shadcn Button");
assert.equal(text("route-path"), "/home/general");
assert.equal(node("nav-general").attrs["aria-current"], "page");
assert.equal(node("nav-general").style["justify-content"], "flex-start");
for (const page of ["overview", "general", "data_entry", "floating", "navigation", "data_display", "layout"]) {
  const icon = node(`nav-${page}-icon`);
  assert.equal(icon.type, "icon");
  assert.equal(icon.size, 16);
  assert.match(icon.svg, /<svg[^>]*xmlns="http:\/\/www.w3.org\/2000\/svg"/);
  assert.equal(icon.style.color, node(`nav-${page}`).style.color);
}
assert.notEqual(
  node("nav-general").style["background-color"],
  node("sider").style["background-color"],
);
assert.equal(node("nav-overview").attrs["aria-current"], "false");
assert.equal(node("page-overview").style.display, "none");
assert.equal(node("route-back").attrs.disabled, "");
assert.equal(node("route-forward").attrs.disabled, "");
assert.ok(find(node("sider-header"), "application-name"));
assert.ok(find(node("sider-header"), "theme-toggle"));
assert.ok(!find(node("route-toolbar"), "theme-toggle"));
for (const [name, icon, label] of [
  ["route-back", "arrow-left", "后退"],
  ["route-forward", "arrow-right", "前进"],
  ["theme-toggle", "moon", "切换明暗主题"],
]) {
  assert.equal(text(name), "");
  assert.equal(node(name).attrs["aria-label"], label);
  assert.equal(node(name).attrs["data-size"], "icon");
  assert.equal(node(`${name}-icon`).name, icon);
  assert.ok(node(`${name}-icon`).svg);
}
for (const name of ["route-back", "route-forward"]) {
  assert.match(node(name).attrs.class, /rounded-full!/);
  assert.equal(node(name).style.width, node(name).style.height);
}
click("nav-general");
assert.equal(
  node("route-back").attrs.disabled,
  "",
  "Same-route clicks do not add history",
);
assert.equal(text("count"), "0");
const button = node("button-default");
assert.match(button.attrs.class, /focus-visible:tt-ring-3/);
assert.equal(button.attrs["data-slot"], "button");
assert.equal(button.style.height, "32px");
assert.equal(button.style["padding-left"], "10px");
assert.equal(button.style["border-width"], "1px");
assert.equal(button.style["font-size"], "14px");
click("button-default");
assert.equal(text("count"), "1");
click("button-secondary");
assert.equal(text("count"), "2");
click("button-disabled");
assert.equal(
  text("count"),
  "2",
  "The real shadcn store prevents disabled activation",
);
click("nav-overview");
assert.equal(text("route-path"), "/home/overview");
assert.equal(text("route-title"), "概览");
assert.equal(node("nav-overview").attrs["aria-current"], "page");
assert.equal(
  node("nav-overview").style["background-color"],
  node("shared-application").style["background-color"],
);
assert.ok(!node("nav-general").attrs.class.includes("bg-[var(--background)]!"));
assert.equal(node("page-general").style.display, "none");
assert.notEqual(node("page-overview").style.display, "none");
click("nav-layout");
assert.equal(text("route-path"), "/home/layout");
assert.notEqual(node("page-layout").style.display, "none");
click("route-back");
assert.equal(text("route-path"), "/home/overview");
click("route-back");
assert.equal(text("route-path"), "/home/general");
assert.equal(text("count"), "2", "Page state survives route changes");
assert.equal(
  node("button-default"),
  button,
  "Page switches retain the mounted button",
);
assert.equal(node("route-back").attrs.disabled, "");
click("route-forward");
assert.equal(text("route-path"), "/home/overview");
click("nav-general");
assert.equal(text("route-path"), "/home/general");
assert.equal(
  node("route-forward").attrs.disabled,
  "",
  "New navigation discards forward history",
);
click("route-forward");
assert.equal(text("route-path"), "/home/general");
button._setStyleState("focus", true);
assert.ok(!button.style["box-shadow"] || button.style["box-shadow"] === "none");
button._setStyleState("focus-visible", true);
flush();
assert.equal(button.style["box-shadow"], "0 0 0 3px #a1a1a180");
assert.equal(
  button.style["border-width"],
  "1px",
  "A CSS ring does not become a layout border",
);
const light = button.style["background-color"];
click("theme-toggle");
assert.equal(node("theme-toggle-icon").name, "sun");
assert.deepEqual(themeChanges, platform === "macos" ? [false, true] : []);
assert.notEqual(button.style["background-color"], light);
assert.notEqual(button.style["box-shadow"], "0 0 0 3px #a1a1a180");
for (const page of ["overview", "general", "data_entry", "floating", "navigation", "data_display", "layout"]) {
  assert.equal(node(`nav-${page}-icon`).style.color, node(`nav-${page}`).style.color);
}
click("theme-toggle");
assert.equal(node("theme-toggle-icon").name, "moon");
assert.deepEqual(themeChanges, platform === "macos" ? [false, true, false] : []);
assert.equal(button.style["background-color"], light);
button._setStyleState("focus-visible", false);
button._setStyleState("focus", false);
flush();
assert.ok(!button.style["box-shadow"] || button.style["box-shadow"] === "none");
click("reset-count");
assert.equal(text("count"), "0");
click("nav-data_entry");
assert.equal(node("form-page").type, "form");
for (const key of ["name", "email", "quantity", "bio"]) {
  assert.equal(node(`label-${key}`).attrs.for, `form-${key}`);
  assert.equal(node(`form-${key}`).attrs.id, `form-${key}`);
}
assert.equal(text("route-path"), "/home/data_entry");
assert.equal(text("form-page-title"), "表单组件");
click("form-submit");
assert.equal(text("form-result"), "请输入姓名。");
for (const [name, value] of [
  ["form-name", "Timeless"],
  ["form-email", "native@example.com"],
]) {
  node(name).value = value;
  node(name)._dispatchNativeEvent("input", {});
  flush();
}
click("form-role");
function all(item) {
  return [item, ...(item.children ?? []).flatMap(all)];
}
let option = all(root).find(
  (item) => item.attrs?.["data-value"] === "designer",
);
assert.ok(option, "Real shadcn Select renders its options");
option._dispatchNativeEvent("click", {});
flush();
assert.match(text("form-role"), /设计师/);
click("form-dates-trigger");
let days = all(root).filter((item) => item.attrs?.["data-date"]);
assert.ok(days.length >= 56, "The actual dual calendar is rendered");
days[10]._dispatchNativeEvent("click", {});
flush();
days = all(root).filter((item) => item.attrs?.["data-date"]);
assert.ok(days.length, "Selecting the range start keeps the calendar open");
days[14]._dispatchNativeEvent("click", {});
flush();
assert.match(
  text("form-date-value"),
  /\d{4}\/\d{2}\/\d{2} - \d{4}\/\d{2}\/\d{2}/,
);
node("form-files")._receiveFiles([
  { name: "example.txt", type: "text/plain", kind: "file", size: 7 },
]);
flush();
assert.equal(text("form-file-value"), "example.txt");
click("form-agreed-box");
click("form-submit");
assert.match(text("form-result"), /已提交：Timeless · designer/);
click("nav-general");
click("nav-data_entry");
assert.equal(
  node("form-name").value,
  "Timeless",
  "Form values survive route switches",
);
click("form-reset");
assert.equal(node("form-name").value, "");
assert.equal(text("form-file-value"), "尚未选择文件");
assert.equal(text("form-date-value"), "尚未选择日期范围");
assert.equal(text("form-result"), "表单已重置。");
click("nav-floating");
assert.equal(text("route-path"), "/home/floating");
const modal = node("floating-modal");
const popover = node("floating-popover");
const tooltip = node("floating-tooltip-surface");
assert.equal(modal.kind, "modal");
assert.equal(modal.modal, true);
assert.equal(modal.open, false);
click("floating-modal-trigger");
assert.equal(modal.open, true);
assert.equal(modal.attrs.role, "dialog");
node("floating-name").value = "";
node("floating-name")._dispatchNativeEvent("input", {});
click("floating-modal-save");
assert.equal(modal.open, true, "Invalid input keeps the modal open");
assert.equal(text("floating-modal-error"), "请输入显示名称。");
node("floating-name").value = "Native User";
node("floating-name")._dispatchNativeEvent("input", {});
click("floating-modal-save");
assert.equal(text("floating-result"), "已保存：Native User");
assert.equal(modal.open, false);
click("floating-modal-trigger");
modal.listeners.dismiss();
flush();
assert.equal(modal.open, false, "Host dismissal updates controlled state");
click("floating-modal-trigger");
click("floating-modal-cancel");
assert.equal(modal.open, false);
click("floating-popover-trigger");
assert.equal(popover.kind, "popover");
assert.equal(popover.modal, false);
assert.equal(popover.open, true);
assert.equal(popover.anchor, node("floating-popover-trigger"));
assert.equal(node("floating-popover-trigger").attrs["aria-expanded"], "true");
popover.listeners.dismiss();
flush();
assert.equal(popover.open, false);
assert.equal(node("floating-popover-trigger").attrs["aria-expanded"], "false");
click("floating-popover-trigger");
click("floating-popover-close");
assert.equal(popover.open, false);
assert.equal(tooltip.kind, "tooltip");
assert.equal(tooltip.attrs.role, "tooltip");
const tooltipTrigger = node("floating-tooltip-trigger");
tooltipTrigger._dispatchNativeEvent("mouseenter", {});
flush();
assert.equal(tooltip.open, true);
tooltipTrigger._dispatchNativeEvent("focus", {});
tooltipTrigger._dispatchNativeEvent("mouseleave", {});
flush();
assert.equal(tooltip.open, true, "Focus keeps the tooltip open after mouse leave");
tooltip.listeners.dismiss();
flush();
assert.equal(tooltip.open, false);
tooltipTrigger._dispatchNativeEvent("blur", {});
tooltipTrigger._dispatchNativeEvent("focus", {});
flush();
assert.equal(tooltip.open, true);
const modalBackground = modal.style["background-color"];
const tooltipBackground = tooltip.style["background-color"];
click("theme-toggle");
assert.notEqual(modal.style["background-color"], modalBackground);
assert.notEqual(tooltip.style["background-color"], tooltipBackground);
click("theme-toggle");
click("floating-popover-trigger");
click("nav-general");
assert.equal(popover.open, false);
assert.equal(tooltip.open, false);
click("nav-floating");
click("floating-modal-trigger");
click("nav-general");
assert.equal(modal.open, false);
click("nav-floating");
assert.equal(node("floating-name").value, "Native User");
node("floating-dropdown-trigger")._dispatchNativeEvent("pointerdown", {});
flush();
let menu = node("floating-dropdown-content-surface");
assert.equal(menu.open, true);
assert.equal(menu.anchor, node("floating-dropdown-trigger"));
assert.equal(menu.attrs.role, "menu");
assert.equal(node("floating-dropdown-trigger").attrs["aria-expanded"], "true");
click("menu-item-删除（禁用）");
assert.equal(menu.open, true);
click("menu-item-编辑资料");
assert.equal(text("floating-result"), "DropdownMenu：编辑资料");
assert.equal(node("floating-dropdown-trigger").attrs["aria-expanded"], "false");
node("floating-context-trigger")._dispatchNativeEvent("contextmenu", { clientX: 420, clientY: 300 });
flush();
menu = node("floating-context-content-surface");
assert.equal(menu.open, true);
assert.equal(menu.anchor.getBoundingClientRect().x, 420);
click("menu-item-复制");
assert.equal(text("floating-result"), "ContextMenu：复制");
click("floating-drawer-trigger");
const drawer = node("floating-drawer");
assert.equal(drawer.open, true);
assert.equal(drawer.modal, true);
assert.equal(drawer.drawerSide, "right");
drawer.listeners.dismiss();
flush();
assert.equal(drawer.open, false);
click("floating-drawer-trigger");
click("floating-drawer-close");
assert.equal(drawer.open, false);
click("floating-drawer-trigger");
click("nav-general");
assert.equal(drawer.open, false, "Route changes close Drawer");
click("nav-floating");
node("floating-dropdown-trigger")._dispatchNativeEvent("pointerdown", {});
flush();
menu = node("floating-dropdown-content-surface");
click("nav-general");
assert.equal(menu.open, false, "Route changes close DropdownMenu");
click("nav-floating");
node("floating-context-trigger")._dispatchNativeEvent("contextmenu", { clientX: 420, clientY: 300 });
flush();
menu = node("floating-context-content-surface");
click("nav-general");
assert.equal(menu.open, false, "Route changes close ContextMenu");
click("nav-navigation");
assert.equal(text("components-panel-account"), "账户设置内容。");
click("components-tabs-tab-password");
assert.equal(text("components-panel-password"), "密码设置内容。");
assert.equal(node("components-tabs-tab-password").attrs["aria-selected"], "true");
node("components-tabs-tab-password")._dispatchNativeEvent("keydown", { key: "ArrowRight" });
flush();
assert.equal(text("components-panel-notifications"), "通知偏好设置。");
assert.equal(node("components-tabs-tab-password").attrs.tabindex, "-1");
node("components-tabs-tab-notifications")._dispatchNativeEvent("keydown", { key: "Home" });
flush();
assert.equal(text("components-panel-account"), "账户设置内容。");
node("components-tabs-tab-account")._dispatchNativeEvent("keydown", { key: "End" });
flush();
assert.equal(text("components-panel-notifications"), "通知偏好设置。");
node("components-tabs-tab-notifications")._dispatchNativeEvent("keydown", { key: "ArrowRight" });
flush();
assert.equal(text("components-panel-account"), "账户设置内容。");
node("components-tabs-tab-account")._dispatchNativeEvent("keydown", { key: "ArrowLeft" });
flush();
assert.equal(text("components-panel-notifications"), "通知偏好设置。");
assert.notEqual(node("components-accordion-content-0").style.display, "none");
assert.equal(node("components-accordion-content-1").style.display, "none");
click("components-accordion-trigger-1");
assert.equal(node("components-accordion-content-0").style.display, "none");
assert.notEqual(node("components-accordion-content-1").style.display, "none");
assert.match(node("components-accordion-content-1").attrs.class, /pb-4/);
assert.equal(node("components-accordion-trigger-1").attrs["aria-expanded"], "true");
click("components-multiple-trigger-0");
click("components-multiple-trigger-1");
assert.notEqual(node("components-multiple-content-0").style.display, "none");
assert.notEqual(node("components-multiple-content-1").style.display, "none");
click("components-step-next");
assert.equal(text("components-step-value"), "步骤 2 / 3");
assert.match(text("components-steps"), /✓账户2资料3完成/);
click("components-step-next");
click("components-step-next");
assert.equal(text("components-step-value"), "步骤 3 / 3");
click("components-step-prev");
click("nav-data_display");
for (const variant of ["default", "secondary", "outline", "destructive"]) {
  assert.equal(text(`components-badge-${variant}`), variant);
}
assert.notEqual(node("components-badge-default").style["border-color"], node("components-badge-outline").style["border-color"]);
for (const [size, value, width] of [["sm", "S", "32px"], ["default", "M", "40px"], ["lg", "L", "48px"]]) {
  assert.equal(text(`components-avatar-${size}`), value);
  assert.equal(node(`components-avatar-${size}`).style.width, width);
}
assert.equal(node("components-separator-horizontal").style.height, "1px");
assert.equal(node("components-separator-vertical").style.width, "1px");
assert.equal(text("components-alert-title"), "Heads up!");
assert.equal(text("components-alert-error-title"), "Error");
assert.notEqual(node("components-alert-error").style["border-color"], node("components-alert").style["border-color"]);
assert.equal(node("components-skeleton-card").style.height, "96px");
assert.equal(node("components-skeleton-line").style.height, "16px");
const progress = all(node("components-progress")).find((item) => item.style.width === "60%");
const storeProgress = all(node("components-progress-store")).find((item) => item.style.width === "30%");
assert.ok(progress && storeProgress);
click("components-progress-increase");
assert.equal(progress.style.width, "70%");
assert.equal(storeProgress.style.width, "40%");
assert.equal(node("components-progress-store").attrs["aria-valuenow"], "40");
for (let i = 0; i < 10; i++) click("components-progress-increase");
assert.equal(progress.style.width, "100%");
assert.equal(storeProgress.style.width, "100%");
for (let i = 0; i < 12; i++) click("components-progress-decrease");
assert.equal(progress.style.width, "0%");
assert.equal(storeProgress.style.width, "0%");
click("components-progress-increase");
const badgeBackground = node("components-badge-default").style["background-color"];
const skeletonBackground = node("components-skeleton-card").style["background-color"];
click("theme-toggle");
assert.notEqual(node("components-badge-default").style["background-color"], badgeBackground);
assert.notEqual(node("components-skeleton-card").style["background-color"], skeletonBackground);
click("theme-toggle");
click("nav-navigation");
assert.equal(text("components-panel-notifications"), "通知偏好设置。");
assert.notEqual(node("components-accordion-content-1").style.display, "none");
assert.equal(text("components-step-value"), "步骤 2 / 3");
click("nav-data_display");
assert.equal(text("components-progress-value"), "Ref：10%");
assert.equal(text("components-store-value"), "Store：10%");
assert.deepEqual(errors, []);
click("nav-transition");
for (const effect of ["fade", "bottom", "zoom", "right"]) {
  node(`transition-${effect}-show`)._dispatchNativeEvent("click", {});
  const content = node(`transition-${effect}-content`);
  const enter = JSON.parse(content.style["-timeless-animation"]);
  assert.equal(enter.name, "enter");
  assert.equal(parseFloat(enter.duration), 0.3);
  content._dispatchNativeEvent("animationstart", {});
  flush();
  assert.equal(JSON.parse(content.style["-timeless-animation"]).name, "enter", "The fallback timer must not truncate a running animation");
  content._dispatchNativeEvent("animationend", {});
  flush();
  assert.equal(content.style["-timeless-animation"], undefined);
  node(`transition-${effect}-hide`)._dispatchNativeEvent("click", {});
  content._dispatchNativeEvent("animationstart", {});
  flush();
  assert.equal(JSON.parse(content.style["-timeless-animation"]).name, "exit");
  content._dispatchNativeEvent("animationend", {});
  flush();
  assert.equal(find(root, `transition-${effect}-content`), undefined);
}
click("transition-sticky-hide");
const sticky = node("transition-sticky-content");
assert.equal(JSON.parse(sticky.style["-timeless-animation"]).fill, "forwards");
sticky._dispatchNativeEvent("animationend", {});
flush();
assert.match(text("transition-sticky-status"), /保持隐藏/);
click("theme-toggle");
assert.equal(JSON.parse(sticky.style["-timeless-animation"]).fill, "forwards");
click("transition-sticky-restore");
assert.equal(sticky.style["-timeless-animation"], undefined);
assert.equal(text("transition-sticky-status"), "显示中");
click("nav-table");
assert.equal(node("invoices-table").type, "table");
assert.equal(node("invoices-scroll").type, "scroll-view");
assert.equal(node("invoices-footer").style["justify-content"], "space-between");
assert.equal(all(node("invoices-body")).filter((item) => item.type === "table-row").length, 20);
assert.match(text("invoices-summary"), /第 1 \/ 10 页 · 共 200 条账单/);
assert.match(text("invoices-body"), /INV001/);
assert.equal(node("invoices-previous").attrs.disabled, "");
click("invoices-next");
assert.match(text("invoices-body"), /INV021/);
assert.equal(node("invoices-page-2").attrs["aria-current"], "page");
click("invoices-page-10");
assert.match(text("invoices-body"), /INV181/);
assert.match(text("invoices-body"), /INV200/);
assert.equal(all(node("invoices-body")).filter((item) => item.type === "table-row").length, 20);
assert.equal(node("invoices-next").attrs.disabled, "");
click("invoices-next");
assert.match(text("invoices-summary"), /第 10 \/ 10 页/);
click("invoices-previous");
assert.match(text("invoices-summary"), /第 9 \/ 10 页/);
click("nav-scroll");
assert.equal(node("scroll-example").type, "scroll-view");
const virtualList = node("virtual-list");
assert.equal(virtualList.type, "list-view-v2");
assert.equal(virtualList.rowCount, 10000);
assert.equal(virtualList.contentHeight, 480000);
assert.equal(virtualList.children.length, 0, "The native table requests rows on demand");
virtualList._renderRow(5000);
flush();
assert.equal(virtualList.children.length, 1);
assert.match(text("virtual-list-item"), /列表项目 5001/);
virtualList._releaseRow(5000);
assert.equal(virtualList.children.length, 0);
click("virtual-list-middle");
assert.equal(virtualList.scrollTop, 240000);
click("virtual-list-count");
assert.equal(virtualList.rowCount, 100);
click("virtual-list-start");
assert.equal(virtualList.scrollTop, 0);
console.log(
  `${platform} shared page passed: routing, retained state, Button and forms, Modal, Popover, Tooltip, DropdownMenu, ContextMenu, Drawer, Tabs, Accordion, Steps, Badge, Avatar, Separator, Alert, Progress, Skeleton, Table, Pagination, ScrollView, ListViewV2, Transition, animation fill, themes and keyboard interaction.`,
);

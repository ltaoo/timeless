import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { runInNewContext } from "node:vm";

const platform = process.argv[2] ?? "macos";
assert.ok(["macos", "windows"].includes(platform));
const output = resolve(import.meta.dirname, `../dist/${platform}`);
const html = readFileSync(resolve(output, "index.macos.html"), "utf8");
assert.match(html, /src="(?:\.\/|\/)?app\.js"/);

let root;
const timers = [];
const errors = [];
runInNewContext(
  readFileSync(resolve(output, "app.js"), "utf8"),
  {
    console: { log() {}, warn() {}, error: (...args) => errors.push(args) },
    setTimeout(callback) {
      timers.push(callback);
      return timers.length;
    },
    clearTimeout() {},
    setInterval() {
      return 1;
    },
    clearInterval() {},
    __nativeBridge_render(tree) {
      root = tree;
    },
    __nativeBridge_relayout() {},
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
for (const page of ["overview", "general", "data_entry", "layout"]) {
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
assert.notEqual(button.style["background-color"], light);
assert.notEqual(button.style["box-shadow"], "0 0 0 3px #a1a1a180");
click("theme-toggle");
assert.equal(button.style["background-color"], light);
button._setStyleState("focus-visible", false);
button._setStyleState("focus", false);
flush();
assert.ok(!button.style["box-shadow"] || button.style["box-shadow"] === "none");
click("reset-count");
assert.equal(text("count"), "0");
click("nav-data_entry");
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
assert.deepEqual(errors, []);
console.log(
  `${platform} shared page passed: sider, routing history, retained state, real shadcn Button, forms (Select, DateRangePicker, FilePicker), validation, reset, original CSS and focus-visible.`,
);

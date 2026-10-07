import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pkg = path.join(root, "packages/lucky");
const read = (rel) => fs.readFileSync(path.join(pkg, rel), "utf8");
const tokens = JSON.parse(read("src/tokens.json"));
assert.deepEqual(tokens, JSON.parse(read(".design")).tokens.lucky);
let count = 0;
for (const [group, entries] of Object.entries(tokens)) {
  for (const [key, value] of Object.entries(entries)) {
    const unit = ["fontSize", "space", "radius", "size", "border"].includes(group) ? "px" : "";
    assert.ok(read("src/style/tokens.css").includes(`--lucky-${group}-${key}: ${value}${unit};`));
    count++;
  }
}
assert.equal(count, 62);
function files(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? files(path.join(dir,entry.name)) : [path.join(dir,entry.name)]);
}
const css = files(path.join(pkg, "src/style")).filter(p => p.endsWith(".css")).map(p => fs.readFileSync(p,"utf8")).join("\n");
const definitions = new Set([...css.matchAll(/(--[\w-]+)\s*:/g)].map(m => m[1]));
for (const m of css.matchAll(/var\((--[\w-]+)(\s*[,)]?)/g)) {
  assert.ok(definitions.has(m[1]) || m[2].includes(","), `Undefined token: ${m[1]}`);
}
assert.ok(!/data-theme="dark"/.test(css), "Unexpected fabricated dark palette");
assert.ok(!/--(?:colorNeutral|colorBrand|fontWeight|strokeWidth)/.test(css), "Fluent raw token leaked");
const context = vm.createContext({ console, setTimeout, clearTimeout, setInterval: () => 0, clearInterval: () => {} });
vm.runInContext(fs.readFileSync(path.join(root,"packages/timeless/dist/timeless.umd.min.js"),"utf8"),context);
const core = context.Timeless;
vm.runInContext(read("dist/timeless.lucky.umd.min.js"),context);
assert.equal(context.Timeless,core);
const lucky = core.lucky;
assert.equal(lucky.formatPrice(0), "0.00");
assert.equal(lucky.formatPrice(990), "9.90");
assert.equal(lucky.formatPrice(2000), "20.00");
assert.equal(lucky.formatPrice(Number.MAX_SAFE_INTEGER - 1), "90071992547409.90");
for (const invalid of [-1, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER+1]) {
  assert.throws(() => lucky.formatPrice(invalid), /safe integer cents/);
}
const sourceExports = fs.readFileSync(path.join(root,"packages/fluent/src/index.ts"),"utf8").split("export {\n")[1].split("};")[0].replace(/\/\/[^\n]*/g,"").split(",").map(v=>v.trim()).filter(Boolean);
for (const name of sourceExports) assert.equal(typeof lucky[name], name === "TREE_CLASSES" ? "object" : "function", `Missing export ${name}`);
const selected = core.ref(false);
const store = new core.vm.ButtonCore({});
const chip = lucky.OptionChip({ store, selected, attributes: { id: "ice-option" } }, ["标准冰"]);
assert.equal(chip.state.attributes["aria-pressed"],"false");
assert.equal(chip.state.attributes.id,"ice-option");
selected.as(true);
assert.equal(chip.state.attributes["aria-pressed"],"true");
assert.ok(chip.state.styleSet.includes("is-selected"));
selected.as(false);
assert.equal(chip.state.attributes["aria-pressed"],"false");
assert.ok(!chip.state.styleSet.includes("is-selected"));
assert.ok(lucky.Card({ variant:"profile" }).state.styleSet.includes("lucky-card--profile"));
assert.ok(lucky.Price({ amount:2000 }));
// Build documentation VNodes in a VM; no host rendering or browser is started.
Object.assign(context, core, lucky);
context.window = {}; // Flow declares a host callback; no DOM event is executed here.
context.Section = (_title, children) => core.View({}, children);
context.Item = (_label, children) => core.View({}, children);
const gallery = fs.readFileSync(path.join(root, "apps/web-lucky/src/pages/home/sections.js"), "utf8");
const sections = [...gallery.matchAll(/export function (\w+Section)\(/g)].map(m => m[1]);
vm.runInContext(gallery.replace(/^import .*;$/gm, "").replace(/export function/g, "function"), context);
for (const section of sections) vm.runInContext(`${section}()`, context);
assert.equal(sections.length, 47);
console.log(`Lucky checks passed: ${count} reference tokens, ${sourceExports.length} shared exports, scoped semantic variables, price validation, reactive chip accessibility, card variants, ${sections.length} gallery sections and Node-safe UMD.`);

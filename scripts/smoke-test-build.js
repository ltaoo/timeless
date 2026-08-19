const fs = require("fs");
const path = require("path");
const vm = require("vm");

class UmdSmokeTestModel {
  constructor(root_dir) {
    this.root_dir = root_dir;
    this.root_package = JSON.parse(
      fs.readFileSync(path.join(root_dir, "package.json"), "utf8"),
    );
    this.release_dir = path.join(
      root_dir,
      "dist",
      "timeless",
      this.root_package.version,
    );
  }

  create_browser_context() {
    const context = {
      clearInterval: () => {},
      clearTimeout,
      console,
      setInterval: () => 0,
      setTimeout,
    };
    context.globalThis = context;
    context.self = context;
    return vm.createContext(context);
  }

  load_script(context, filename) {
    const file_path = path.join(this.release_dir, filename);
    const source = fs.readFileSync(file_path, "utf8");
    vm.runInContext(source, context, { filename: file_path });
  }

  assert(condition, message) {
    if (!condition) throw new Error(message);
  }

  run() {
    const context = this.create_browser_context();
    this.load_script(context, "timeless.lite.umd.min.js");

    const timeless = context.Timeless;
    this.assert(timeless, "lite did not create globalThis.Timeless");
    this.assert(typeof timeless.ref === "function", "lite is missing ref");
    this.assert(typeof timeless.View === "function", "lite is missing View");
    this.assert(typeof timeless.base === "function", "lite is missing base");
    this.assert(timeless.Result, "lite is missing Result");
    this.assert(!("utils" in timeless), "lite unexpectedly contains utils");
    this.assert(!("vm" in timeless), "lite unexpectedly contains VM");

    this.load_script(context, "timeless.dom.umd.min.js");

    this.assert(
      context.Timeless === timeless,
      "DOM replaced the global Timeless namespace",
    );
    this.assert(timeless.DOM, "DOM did not attach Timeless.DOM");
    this.assert(
      typeof timeless.DOM.render === "function",
      "DOM is missing render with lite",
    );
    this.assert(
      typeof timeless.DOM.hydrate === "function",
      "DOM is missing hydrate with lite",
    );
    this.assert(
      timeless.getPlatform() === timeless.DOM.platform,
      "DOM did not configure the lite primitive platform",
    );

    const ref_before_utils = timeless.ref;
    this.load_script(context, "timeless.utils.umd.min.js");

    this.assert(
      context.Timeless === timeless,
      "utils replaced the global Timeless namespace",
    );
    this.assert(
      timeless.ref === ref_before_utils,
      "utils changed an existing lite export",
    );
    this.assert(timeless.utils, "utils did not attach Timeless.utils");
    this.assert(
      typeof timeless.utils.qs_parse === "function",
      "utils is missing qs_parse",
    );

    const parsed = timeless.utils.parseJSONStr('{"ok":true}');
    this.assert(parsed.error === null, "utils could not use lite Result.Ok");
    this.assert(parsed.data.ok === true, "utils returned unexpected JSON data");

    const full_context = this.create_browser_context();
    this.load_script(full_context, "timeless.umd.min.js");
    this.load_script(full_context, "timeless.dom.umd.min.js");
    const full_timeless = full_context.Timeless;
    this.assert(
      typeof full_timeless.DOM.render === "function",
      "DOM is missing render with full Timeless",
    );
    this.assert(
      full_timeless.vm.getPopperPlatform() === full_timeless.DOM.platform,
      "DOM did not configure the full Timeless VM Popper platform",
    );

    return {
      lite_exports: Object.keys(timeless).filter((key) => key !== "utils")
        .length,
      utils_exports: Object.keys(timeless.utils).length,
    };
  }
}

class UmdSmokeTestView {
  render(result) {
    console.log(
      `UMD smoke test passed: lite (${result.lite_exports} exports) -> optional utils (${result.utils_exports} exports).`,
    );
  }
}

function main() {
  const model = new UmdSmokeTestModel(path.resolve(__dirname, ".."));
  const view = new UmdSmokeTestView();
  view.render(model.run());
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}

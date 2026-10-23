#include "runtime.hpp"
#include <cmath>
#include <iostream>
#include <stdexcept>

static void require(bool value, const char *message) {
  if (!value)
    throw std::runtime_error(message);
}

int main(int argc, char **argv) {
  try {
    require(
        argc == 2 || (argc == 3 && std::string(argv[2]) == "--hmr"),
        "Pass the built Windows demo JS bundle, optionally followed by --hmr");
    timeless::Runtime runtime;
    require(timeless::pixels("12px") == 12 && timeless::pixels(".5") == .5f,
            "Pixel and unitless CSS numbers");
    for (const char *value : {"auto", "fit-content", "50%", "NaN", "inf", "calc(100% - 8px)"})
      require(timeless::pixels(value, 7) == 7, "Non-pixel CSS lengths retain their fallback");
    // Deterministic measurements for layout assertions; Windows uses
    // DirectWrite instead.
    runtime.measure = [](const timeless::Node &node, float width) {
      float size = node.number("font-size", 14);
      return YGSize{
          std::min(width, static_cast<float>(node.text.size()) * size * 0.5f),
          size * 1.25f};
    };
    runtime.load(argv[1]);
    if (argc == 3)
      runtime.evaluate(
          "if(!Object.keys(__native_hmr.data.__hmr_refs).length) throw "
          "Error('Expected a development bundle with native HMR')");
    require(runtime.update(800, 600), "First render must produce a tree");
    auto node = [&](const char *name) -> timeless::Node & {
      auto value = runtime.find(name);
      if (!value)
        throw std::runtime_error(std::string("Missing node: ") + name);
      return *value;
    };
    auto update = [&] {
      runtime.pump();
      runtime.update(800, 600);
    };
    int action = node("action").id;
    require(node("counter").content() == "0", "Initial counter");
    require(node("action").property("background-color") == "#304ffe",
            "Compiled CSS background");
    runtime.event(action, "click");
    update();
    require(node("counter").content() == "1",
            "Native click updates JS model and native text");
    require(node("action").id == action,
            "Node identity survives reactive updates");
    runtime.state(action, "hover", true);
    update();
    require(node("action").property("background-color") == "#2440dc",
            "Hover style");
    runtime.state(action, "active", true);
    update();
    require(node("action").property("background-color") == "#192fae",
            "Pressed style");
    runtime.state(action, "active", false);
    runtime.state(action, "hover", false);
    runtime.event(node("variant").id, "click");
    update();
    require(node("action").property("background-color") == "#cf304a",
            "Reactive class switches color");
    runtime.event(node("disabled").id, "click");
    update();
    require(node("action").disabled, "Native disabled attribute");
    require(std::abs(node("action").number("opacity") - 0.4f) < 0.001f,
            "Disabled style");
    runtime.event(action, "click");
    update();
    require(node("counter").content() == "1",
            "Disabled action must not execute");
    runtime.event(node("disabled").id, "click");
    update();
    require(!node("action").disabled, "Disabled state is reversible");
    require(node("action").property("opacity").empty(),
            "Removed style must not linger");
    float before = node("counter").x;
    runtime.event(node("spacing").id, "click");
    update();
    require(std::abs(before - node("counter").x - 12) < 0.01,
            "Class padding changes Yoga layout");
    runtime.input(node("name").id, "Windows");
    update();
    require(node("greeting").content() == "Hello, Windows",
            "Input events reach the shared JS Model");
    runtime.state(node("name").id, "focus", true);
    update();
    require(node("name").property("border-color") == "#304ffe",
            "Input focus style");
    require(runtime.update(600, 600), "Window resizing recomputes layout");
    require(node("action").id == action, "Resize preserves identity");
    int select = node("platform-select").id;
    require(node("platform-select").options.size() == 4,
            "Select includes grouped options");
    runtime.select(select, "unavailable");
    update();
    require(node("platform-select").text == "windows",
            "Disabled option cannot be selected");
    runtime.select(select, "linux");
    update();
    require(node("choice-label").content() == "Selected: linux",
            "Select value reaches JS Model");
    runtime.event(node("add-option").id, "click");
    update();
    require(node("platform-select").options.size() == 5,
            "Reactive option list reaches native host");
    require(node("platform-select").id == select,
            "Option changes preserve Select identity");
    runtime.select(select, "new");
    update();
    require(node("platform-select").text == "new",
            "New options can be selected");
    require(node("feature-check").checked, "Initial checked state");
    runtime.toggle(node("feature-check").id);
    update();
    require(!node("feature-check").checked,
            "Checkbox updates JS checked state");
    runtime.toggle(node("radio-second").id);
    update();
    require(node("radio-second").checked && !node("radio-first").checked,
            "Radio group is exclusive");
    runtime.event(node("disabled").id, "click");
    update();
    runtime.select(select, "windows");
    runtime.toggle(node("feature-check").id);
    update();
    require(node("platform-select").text == "new" &&
                !node("feature-check").checked,
            "Disabled form controls reject changes");
    runtime.event(node("disabled").id, "click");
    update();
    int scroll = node("list-scroll").id;
    require(node("list-scroll").vertical_bar &&
                node("list-scroll").horizontal_bar,
            "Overflow creates both native scrollbars");
    require(node("list-scroll").content_height > 700,
            "Scroll content keeps its intrinsic extent");
    float item_x = node("scroll-item-0").x, item_y = node("scroll-item-0").y;
    runtime.scroll(scroll, 60, 90);
    update();
    require(std::abs(node("scroll-item-0").x - item_x + 60) < .01f &&
                std::abs(node("scroll-item-0").y - item_y + 90) < .01f,
            "Scroll offsets move child frames");
    require(node("scroll-position").content() == "Scroll: 90",
            "Scroll callback reaches JS Model");
    runtime.event(node("scroll-bottom").id, "click");
    update();
    require(std::abs(node("list-scroll").scroll_y -
                     (node("list-scroll").content_height -
                      node("list-scroll").client_height)) < .01f,
            "Primitive scrollToBottom uses host metrics and clamps to the "
            "viewport");
    update();
    require(node("scroll-position").content() ==
                "Scroll: " + std::to_string(static_cast<int>(
                                 std::round(node("list-scroll").scroll_y))),
            "Programmatic scrolling dispatches onScroll after clamping");
    require(!runtime.scroll(scroll, 60, 100000),
            "Scrolling beyond the end does not emit duplicate events");
    runtime.scroll(scroll, -100, -100);
    update();
    require(node("list-scroll").scroll_x == 0 &&
                node("list-scroll").scroll_y == 0,
            "Scroll positions clamp at zero");
    require(node("list-scroll").id == scroll,
            "Scrolling preserves viewport identity");
    runtime.evaluate("globalThis.timerRan=false;setTimeout(()=>timerRan=true,0)"
                     ";Promise.resolve().then(()=>globalThis.jobRan=true)");
    runtime.pump();
    runtime.evaluate("if(!timerRan||!jobRan) throw Error('Timers and Promise "
                     "jobs must execute')");
    runtime.evaluate(
        "globalThis.cancelRan=false;const "
        "cancelled=setTimeout(()=>cancelRan=true,0);clearTimeout(cancelled)");
    runtime.pump();
    runtime.evaluate("if(cancelRan) throw Error('Cancelled timer ran')");
    bool caught = false;
    try {
      runtime.evaluate("throw new Error('intentional test error')");
    } catch (const std::runtime_error &) {
      caught = true;
    }
    require(caught, "JS exceptions must reach the host");
    runtime.scroll(scroll, 24, 64);
    update();
    auto previous_count = node("counter").content();
    runtime.load(argv[1]);
    update();
    require(node("action").id == action, "HMR patches existing native nodes");
    if (argc == 3)
      require(node("counter").content() == previous_count,
              "Development HMR preserves model state");
    require(node("list-scroll").scroll_y == 64 &&
                node("list-scroll").scroll_x == 24,
            "HMR preserves scroll offsets on the retained viewport");
    runtime.event(node("scroll-bottom").id, "click");
    update();
    require(node("list-scroll").scroll_y > 500,
            "Programmatic scroll binding remains connected after HMR");
    auto previous_root = runtime.root();
    runtime.evaluate("__nativeBridge_render({type:'unknown-widget',style:{},"
                     "attrs:{},children:[]})");
    caught = false;
    try {
      runtime.update(800, 600);
    } catch (const std::runtime_error &) {
      caught = true;
    }
    require(caught, "Unsupported shapes must be reported explicitly");
    require(runtime.root() == previous_root,
            "Decoding errors retain the last valid snapshot");
    runtime.evaluate(
        "__nativeBridge_render(globalThis.__timeless_native_styles.root)");
    update();
    require(node("action").id == action,
            "Host can recover after a rejected tree");
    runtime.evaluate(R"(
      globalThis.smallScroll={type:'scroll-view', attrs:{n:'small-scroll'},
        style:{width:'200px',height:'100px'}, horizontal:'hidden', vertical:'auto',
        scrollTop:999, scrollLeft:0,
        children:[{type:'view',attrs:{n:'wide-content'},style:{width:'500px',height:'300px'},children:[]}]};
      __nativeBridge_render(smallScroll);
    )");
    update();
    require(!node("small-scroll").horizontal_bar &&
                node("small-scroll").vertical_bar,
            "Hidden axis suppresses scrollbar while auto detects overflow");
    require(node("small-scroll").scroll_y == 200,
            "Restored scroll offsets clamp to content bounds");
    runtime.evaluate(
        "smallScroll.children[0].style={width:'50px',height:'20px'}");
    update();
    require(!node("small-scroll").vertical_bar &&
                node("small-scroll").scroll_y == 0,
            "Shrinking content removes auto scrollbar and resets stale offset");
    std::cout << "Windows runtime integration passed\n";
    return 0;
  } catch (const std::exception &error) {
    std::cerr << error.what() << '\n';
    return 1;
  }
}

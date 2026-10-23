#include "runtime.hpp"
#include <algorithm>
#include <cmath>
#include <filesystem>
#include <fstream>
#include <iostream>
#include <limits>
#include <regex>
#include <array>
#include <map>
#include <cstdlib>
#include <cctype>
#include <sstream>
#include <stdexcept>
#include <unordered_set>

namespace timeless {

std::filesystem::path file_path(const std::string &value) {
  return std::filesystem::path(std::u8string(value.begin(), value.end()));
}

std::string string(JSContext *context, JSValueConst value) {
  if (JS_IsUndefined(value) || JS_IsNull(value))
    return "";
  const char *text = JS_ToCString(context, value);
  if (!text)
    throw std::runtime_error("Cannot convert JavaScript value to text");
  std::string result(text);
  JS_FreeCString(context, text);
  return result;
}

float pixels(const std::string &value, float fallback) {
  if (value.empty())
    return fallback;
  char *end = nullptr;
  float result = std::strtof(value.c_str(), &end);
  if (end != value.c_str() && std::isfinite(result) && (*end == '\0' || std::string_view(end) == "px"))
    return result;
  return fallback;
}

static auto properties(JSContext *context, JSValueConst object) {
  std::unordered_map<std::string, std::string> result;
  if (!JS_IsObject(object))
    return result;
  JSPropertyEnum *keys = nullptr;
  uint32_t count = 0;
  if (JS_GetOwnPropertyNames(context, &keys, &count, object,
                             JS_GPN_STRING_MASK | JS_GPN_ENUM_ONLY) < 0)
    throw std::runtime_error("Cannot read native node properties");
  try {
    for (uint32_t i = 0; i < count; ++i) {
      Value key(context, JS_AtomToString(context, keys[i].atom));
      Value value(context, JS_GetProperty(context, object, keys[i].atom));
      if (!JS_IsUndefined(value.get()) && !JS_IsNull(value.get()))
        result[string(context, key.get())] = string(context, value.get());
    }
  } catch (...) {
    JS_FreePropertyEnum(context, keys, count);
    throw;
  }
  JS_FreePropertyEnum(context, keys, count);
  return result;
}

Node::Node(Runtime *owner, JSContext *context, JSValue object)
    : owner(owner), object(context, object), layout(YGNodeNew()) {
  if (!layout)
    throw std::runtime_error("Cannot allocate Yoga node");
}
Node::~Node() { YGNodeFree(layout); }
std::string Node::property(const std::string &name,
                           const std::string &fallback) const {
  auto it = style.find(name);
  return it == style.end() ? fallback : it->second;
}
float Node::number(const std::string &name, float fallback) const {
  return pixels(property(name), fallback);
}
bool Node::hidden() const {
  return property("display") == "none" || (type == "floating" && !open) ||
         (parent && parent->hidden());
}
bool Node::button() const { return type == "button" || clickable; }
bool Node::toggle() const { return type == "checkbox" || type == "radio"; }
bool Node::scrollable() const {
  return type == "scroll-view" || type == "list-view-v2";
}
bool Node::contents() const {
  auto display = property("display");
  return display == "contents" || (display.empty() &&
    (type == "for" || type == "show" || type == "match" || type == "fragment" ||
     type == "portal" || type == "lazy-view"));
}
bool Node::input() const {
  return type == "input" || type == "textarea" || type == "number-input";
}
std::string Node::content() const {
  if (type == "text")
    return text;
  std::string result;
  for (const auto &child : children)
    result += child->content();
  return result;
}

Runtime::Runtime() {
  runtime_ = JS_NewRuntime();
  if (!runtime_)
    throw std::runtime_error("Cannot allocate QuickJS runtime");
  JS_SetMemoryLimit(runtime_, 256 * 1024 * 1024);
  JS_SetMaxStackSize(runtime_, 1024 * 1024);
  JS_SetInterruptHandler(runtime_, interrupt, this);
  context_ = JS_NewContext(runtime_);
  if (!context_) {
    JS_FreeRuntime(runtime_);
    throw std::runtime_error("Cannot allocate QuickJS context");
  }
  JS_SetContextOpaque(context_, this);
  Value global(context_, JS_GetGlobalObject(context_));
  JS_SetPropertyStr(context_, global.get(), "__nativeBridge_render",
                    JS_NewCFunction(context_, render, "render", 1));
  JS_SetPropertyStr(context_, global.get(), "__nativeBridge_relayout",
                    JS_NewCFunction(context_, invalidate, "relayout", 0));
  JS_SetPropertyStr(context_, global.get(), "__nativeLog",
                    JS_NewCFunction(context_, log, "log", 1));
  JS_SetPropertyStr(context_, global.get(), "setTimeout",
                    JS_NewCFunctionMagic(context_, schedule, "setTimeout", 2,
                                         JS_CFUNC_generic_magic, 0));
  JS_SetPropertyStr(context_, global.get(), "setInterval",
                    JS_NewCFunctionMagic(context_, schedule, "setInterval", 2,
                                         JS_CFUNC_generic_magic, 1));
  JS_SetPropertyStr(context_, global.get(), "clearTimeout",
                    JS_NewCFunction(context_, cancel, "clearTimeout", 1));
  JS_SetPropertyStr(context_, global.get(), "clearInterval",
                    JS_NewCFunction(context_, cancel, "clearInterval", 1));
  evaluate(
      "globalThis.console={log:__nativeLog,warn:__nativeLog,error:__nativeLog};"
      "globalThis.__native_hmr={data:{__hmr_refs:{}}};"
      "globalThis.queueMicrotask=(fn)=>Promise.resolve().then(fn);",
      "host.js");
}

Runtime::~Runtime() {
  root_.reset();
  timers_.clear();
  JS_FreeValue(context_, root_object_);
  JS_FreeContext(context_);
  JS_FreeRuntime(runtime_);
}

int Runtime::interrupt(JSRuntime *, void *opaque) {
  return Clock::now() > static_cast<Runtime *>(opaque)->deadline_;
}

void Runtime::check(JSValueConst value) {
  if (!JS_IsException(value))
    return;
  Value exception(context_, JS_GetException(context_));
  Value stack(context_, JS_GetPropertyStr(context_, exception.get(), "stack"));
  throw std::runtime_error(string(context_, exception.get()) + "\n" +
                           string(context_, stack.get()));
}

void Runtime::evaluate(const std::string &source, const std::string &filename) {
  deadline_ = Clock::now() + turn_budget;
  Value result(context_, JS_Eval(context_, source.data(), source.size(),
                                 filename.c_str(), JS_EVAL_TYPE_GLOBAL));
  check(result.get());
  jobs();
  dirty_ = true;
}

void Runtime::load(const std::string &filename) {
  std::ifstream file(file_path(filename), std::ios::binary | std::ios::ate);
  if (!file)
    throw std::runtime_error("Cannot open bundle: " + filename);
  auto size = file.tellg();
  if (size < 0 || size > 64 * 1024 * 1024)
    throw std::runtime_error("Bundle must be at most 64 MiB");
  std::string source(static_cast<size_t>(size), '\0');
  file.seekg(0);
  if (!file.read(source.data(), size))
    throw std::runtime_error("Cannot read bundle: " + filename);
  timers_.clear();
  evaluate(source, filename);
  if (!JS_IsObject(root_object_))
    throw std::runtime_error("Bundle did not call Timeless render()");
}

void Runtime::jobs() {
  JSContext *context = nullptr;
  for (int count = 0;; ++count) {
    int result = JS_ExecutePendingJob(runtime_, &context);
    if (result < 0)
      check(JS_EXCEPTION);
    if (!result)
      break;
    dirty_ = true;
    if (count >= 10000 || Clock::now() > deadline_)
      throw std::runtime_error("JavaScript job queue exceeded its turn budget");
  }
}

void Runtime::pump() {
  deadline_ = Clock::now() + turn_budget;
  std::vector<int> due;
  auto now = Clock::now();
  for (const auto &[id, timer] : timers_)
    if (timer.due <= now)
      due.push_back(id);
  std::sort(due.begin(), due.end());
  for (int id : due) {
    auto it = timers_.find(id);
    if (it == timers_.end())
      continue;
    Value callback(context_, JS_DupValue(context_, it->second.callback.get()));
    if (it->second.interval)
      it->second.due = now + std::chrono::milliseconds(it->second.interval);
    else
      timers_.erase(it);
    Value result(context_,
                 JS_Call(context_, callback.get(), JS_UNDEFINED, 0, nullptr));
    check(result.get());
    dirty_ = true;
  }
  jobs();
}

JSValue Runtime::render(JSContext *context, JSValueConst, int argc,
                        JSValueConst *argv) {
  if (!argc || !JS_IsObject(argv[0]))
    return JS_ThrowTypeError(context, "render expects a native node");
  auto self = static_cast<Runtime *>(JS_GetContextOpaque(context));
  JS_FreeValue(context, self->root_object_);
  self->root_object_ = JS_DupValue(context, argv[0]);
  self->dirty_ = true;
  return JS_UNDEFINED;
}

JSValue Runtime::invalidate(JSContext *context, JSValueConst, int,
                            JSValueConst *) {
  static_cast<Runtime *>(JS_GetContextOpaque(context))->dirty_ = true;
  return JS_UNDEFINED;
}

JSValue Runtime::log(JSContext *context, JSValueConst, int argc,
                     JSValueConst *argv) {
  for (int i = 0; i < argc; ++i) {
    const char *value = JS_ToCString(context, argv[i]);
    if (!value)
      return JS_EXCEPTION;
    std::cout << (i ? " " : "") << value;
    JS_FreeCString(context, value);
  }
  std::cout << std::endl;
  return JS_UNDEFINED;
}

JSValue Runtime::schedule(JSContext *context, JSValueConst, int argc,
                          JSValueConst *argv, int repeat) {
  if (!argc || !JS_IsFunction(context, argv[0]))
    return JS_ThrowTypeError(context, "Timer callback must be a function");
  auto self = static_cast<Runtime *>(JS_GetContextOpaque(context));
  int32_t delay = 0;
  if (argc > 1 && JS_ToInt32(context, &delay, argv[1]) < 0)
    return JS_EXCEPTION;
  delay = std::max(delay, repeat ? 1 : 0);
  if (self->next_timer_ == std::numeric_limits<int>::max())
    return JS_ThrowInternalError(context, "Timer ids exhausted");
  int id = self->next_timer_++;
  self->timers_.emplace(id,
                        Timer{Value(context, JS_DupValue(context, argv[0])),
                              Clock::now() + std::chrono::milliseconds(delay),
                              repeat ? delay : 0});
  return JS_NewInt32(context, id);
}

JSValue Runtime::cancel(JSContext *context, JSValueConst, int argc,
                        JSValueConst *argv) {
  int32_t id = 0;
  if (argc && JS_ToInt32(context, &id, argv[0]) < 0)
    return JS_EXCEPTION;
  static_cast<Runtime *>(JS_GetContextOpaque(context))->timers_.erase(id);
  return JS_UNDEFINED;
}

bool Runtime::call(JSValueConst object, const char *name, int argc,
                   JSValueConst *argv) {
  auto result = invoke(object, name, argc, argv);
  return JS_ToBool(context_, result.get()) > 0;
}

Value Runtime::invoke(JSValueConst object, const char *name, int argc,
                       JSValueConst *argv) {
  Value function(context_, JS_GetPropertyStr(context_, object, name));
  check(function.get());
  if (!JS_IsFunction(context_, function.get()))
    return Value(context_, JS_UNDEFINED);
  deadline_ = Clock::now() + turn_budget;
  Value result(context_, JS_Call(context_, function.get(), object, argc, argv));
  check(result.get());
  jobs();
  dirty_ = true;
  return result;
}

JSValue Runtime::host_method(JSContext *context, JSValueConst, int,
                              JSValueConst *, int method, JSValue *data) {
  auto self = static_cast<Runtime *>(JS_GetContextOpaque(context));
  int32_t id = 0;
  if (JS_ToInt32(context, &id, data[0]) < 0) return JS_EXCEPTION;
  auto node = self->find(id);
  if (!node) return JS_UNDEFINED;
  try {
    if (method == 0 || method == 1) {
      if (self->focus_control) self->focus_control(id, method == 0);
    } else if (method == 2) {
      JSValue rect = JS_NewObject(context);
      for (auto [key, value] : {std::pair{"x", node->x}, {"y", node->y},
             {"left", node->x}, {"top", node->y}, {"width", node->width},
             {"height", node->height}, {"right", node->x + node->width},
             {"bottom", node->y + node->height}})
        JS_SetPropertyStr(context, rect, key, JS_NewFloat64(context, value));
      return rect;
    } else if (self->pick_files && !node->disabled) self->pick_files(id);
  } catch (const std::exception &error) {
    return JS_ThrowInternalError(context, "%s", error.what());
  }
  return JS_UNDEFINED;
}

void Runtime::focus(int id) {
  auto node = find(id);
  if (!node || node->hidden() || node->disabled) return;
  invoke(node->object.get(), "_focus");
}

void Runtime::dismiss(int id) {
  auto node = find(id);
  if (!node || node->type != "floating" || !node->open) return;
  Value listeners(context_, JS_GetPropertyStr(context_, node->object.get(), "listeners"));
  if (JS_IsObject(listeners.get())) invoke(listeners.get(), "dismiss");
}

void Runtime::receive_files(int id, const std::vector<std::string> &paths) {
  auto node = find(id);
  if (!node || node->disabled || paths.empty()) return;
  Value files(context_, JS_NewArray(context_));
  uint32_t index = 0;
  for (const auto &path : paths) {
    auto file = file_path(path);
    auto size = std::filesystem::file_size(file);
    auto name = file.filename().u8string();
    auto extension = file.extension().string();
    std::transform(extension.begin(), extension.end(), extension.begin(), [](unsigned char c) { return static_cast<char>(std::tolower(c)); });
    static const std::unordered_map<std::string, std::string> types = {
      {".txt", "text/plain"}, {".json", "application/json"}, {".csv", "text/csv"},
      {".pdf", "application/pdf"}, {".png", "image/png"}, {".jpg", "image/jpeg"},
      {".jpeg", "image/jpeg"}, {".svg", "image/svg+xml"}, {".webp", "image/webp"}};
    Value item(context_, JS_NewObject(context_));
    for (auto [key, value] : {std::pair{"path", path},
           {"name", std::string(name.begin(), name.end())},
           {"type", types.count(extension) ? types.at(extension) : ""}, {"kind", std::string("file")}})
      JS_SetPropertyStr(context_, item.get(), key, JS_NewString(context_, value.c_str()));
    JS_SetPropertyStr(context_, item.get(), "size", JS_NewFloat64(context_, static_cast<double>(size)));
    auto modified = std::filesystem::last_write_time(file) - std::filesystem::file_time_type::clock::now() + std::chrono::system_clock::now();
    auto milliseconds = std::chrono::duration_cast<std::chrono::milliseconds>(modified.time_since_epoch()).count();
    JS_SetPropertyStr(context_, item.get(), "lastModified", JS_NewFloat64(context_, static_cast<double>(milliseconds)));
    JS_SetPropertyUint32(context_, files.get(), index++, JS_DupValue(context_, item.get()));
  }
  JSValueConst args[] = {files.get()};
  invoke(node->object.get(), "_receiveFiles", 1, args);
}

void Runtime::state(int id, const std::string &name, bool value) {
  auto node = find(id);
  if (!node)
    return;
  Value key(context_, JS_NewString(context_, name.c_str()));
  JSValueConst args[] = {key.get(), JS_NewBool(context_, value)};
  call(node->object.get(), "_setStyleState", 2, args);
}

bool Runtime::event(int id, const std::string &name, const std::string &key, int modifiers) {
  auto node = find(id);
  if (!node || node->disabled || node->hidden())
    return false;
  Value type(context_, JS_NewString(context_, name.c_str()));
  Value payload(context_, JS_NewObject(context_));
  JS_SetPropertyStr(context_, payload.get(), "button",
                    JS_NewInt32(context_, 0));
  JS_SetPropertyStr(context_, payload.get(), "shiftKey", JS_NewBool(context_, modifiers & 1));
  JS_SetPropertyStr(context_, payload.get(), "ctrlKey", JS_NewBool(context_, modifiers & 2));
  JS_SetPropertyStr(context_, payload.get(), "altKey", JS_NewBool(context_, modifiers & 4));
  if (!key.empty())
    JS_SetPropertyStr(context_, payload.get(), "key",
                      JS_NewString(context_, key.c_str()));
  JSValueConst args[] = {type.get(), payload.get()};
  return call(node->object.get(), "_dispatchNativeEvent", 2, args);
}

bool Runtime::pointer(int id, const std::string &name, float x, float y, int button) {
  auto node = find(id);
  if (!node || node->hidden() || node->disabled) return false;
  Value type(context_, JS_NewString(context_, name.c_str()));
  Value payload(context_, JS_NewObject(context_));
  JS_SetPropertyStr(context_, payload.get(), "clientX", JS_NewFloat64(context_, x));
  JS_SetPropertyStr(context_, payload.get(), "clientY", JS_NewFloat64(context_, y));
  JS_SetPropertyStr(context_, payload.get(), "button", JS_NewInt32(context_, button));
  JSValueConst args[] = {type.get(), payload.get()};
  return call(node->object.get(), "_dispatchNativeEvent", 2, args);
}

void Runtime::input(int id, const std::string &text) {
  auto node = find(id);
  if (!node || node->disabled || !node->input())
    return;
  JS_SetPropertyStr(context_, node->object.get(), "value",
                    JS_NewString(context_, text.c_str()));
  Value type(context_, JS_NewString(context_, "input"));
  Value payload(context_, JS_NewObject(context_));
  // The shared dispatcher sets event.target to the native node, whose value is
  // updated above.
  JSValueConst args[] = {type.get(), payload.get()};
  call(node->object.get(), "_dispatchNativeEvent", 2, args);
}

void Runtime::link(int id, const std::string &url) {
  auto node = find(id);
  if (!node || node->disabled) return;
  Value value(context_, JS_NewString(context_, url.c_str()));
  JSValueConst args[] = {value.get()};
  call(node->object.get(), "_onLinkPress", 1, args);
}

void Runtime::select(int id, const std::string &value) {
  auto node = find(id);
  if (!node || node->type != "select" || node->disabled || node->readonly)
    return;
  if (!value.empty() && std::none_of(node->options.begin(), node->options.end(),
                                     [&](const auto &option) {
                                       return option.value == value &&
                                              !option.disabled;
                                     }))
    return;
  if (node->text == value)
    return;
  JS_SetPropertyStr(context_, node->object.get(), "value",
                    JS_NewString(context_, value.c_str()));
  event(id, "change");
  dirty_ = true;
}

void Runtime::toggle(int id) {
  auto node = find(id);
  if (!node || !node->toggle() || node->disabled || node->readonly)
    return;
  bool value = node->type == "radio" || !node->checked;
  if (node->type == "radio" && node->checked) {
    event(id, "click");
    return;
  }
  std::vector<std::pair<Node *, bool>> previous;
  for (const auto &[other_id, other] : nodes_)
    if (other->toggle())
      previous.emplace_back(other, other->checked);
  if (node->type == "radio" && node->attributes.count("name")) {
    for (const auto &[other_id, other] : nodes_)
      if (other_id != id && other->type == "radio" &&
          other->attributes.count("name") &&
          other->attributes.at("name") == node->attributes.at("name"))
        JS_SetPropertyStr(context_, other->object.get(), "checked", JS_FALSE);
  }
  JS_SetPropertyStr(context_, node->object.get(), "checked",
                    JS_NewBool(context_, value));
  JS_SetPropertyStr(context_, node->object.get(), "indeterminate", JS_FALSE);
  if (event(id, "click")) {
    for (const auto &[other, checked] : previous)
      JS_SetPropertyStr(context_, other->object.get(), "checked",
                        JS_NewBool(context_, checked));
    JS_SetPropertyStr(context_, node->object.get(), "indeterminate",
                      JS_NewBool(context_, node->indeterminate));
    dirty_ = true;
    return;
  }
  event(id, "change");
  dirty_ = true;
}

bool Runtime::scroll(int id, float x, float y) {
  auto node = find(id);
  if (!node || !node->scrollable() || node->hidden() || node->disabled)
    return false;
  x = std::clamp(x, 0.f,
                 std::max(0.f, node->content_width - node->client_width));
  y = std::clamp(y, 0.f,
                 std::max(0.f, node->content_height - node->client_height));
  if (x == node->scroll_x && y == node->scroll_y)
    return false;
  JS_SetPropertyStr(context_, node->object.get(), "scrollLeft",
                    JS_NewFloat64(context_, x));
  JS_SetPropertyStr(context_, node->object.get(), "scrollTop",
                    JS_NewFloat64(context_, y));
  scroll_event(*node, x, y);
  dirty_ = true;
  return true;
}

void Runtime::scroll_event(Node &node, float x, float y) {
  JS_SetPropertyStr(context_, node.object.get(), "__windows_scroll_x",
                    JS_NewFloat64(context_, x));
  JS_SetPropertyStr(context_, node.object.get(), "__windows_scroll_y",
                    JS_NewFloat64(context_, y));
  Value type(context_, JS_NewString(context_, "scroll"));
  Value payload(context_, JS_NewObject(context_));
  JS_SetPropertyStr(context_, payload.get(), "scrollLeft",
                    JS_NewFloat64(context_, x));
  JS_SetPropertyStr(context_, payload.get(), "scrollTop",
                    JS_NewFloat64(context_, y));
  JS_SetPropertyStr(context_, payload.get(), "clientHeight", JS_NewFloat64(context_, node.client_height));
  JS_SetPropertyStr(context_, payload.get(), "clientWidth", JS_NewFloat64(context_, node.client_width));
  JSValueConst args[] = {type.get(), payload.get()};
  call(node.object.get(), "_dispatchNativeEvent", 2, args);
}

static void styles(Node &node) {
  auto layout = node.layout;
  if (node.contents()) YGNodeStyleSetDisplay(layout, YGDisplayContents);
  YGNodeStyleSetFlexDirection(layout,
                              node.type == "row" || node.type == "button" ||
                                      node.property("display") == "flex" || node.property("display") == "inline-flex"
                                  ? YGFlexDirectionRow
                                  : YGFlexDirectionColumn);
  if (node.type == "button") {
    YGNodeStyleSetMinHeight(layout, 32);
    YGNodeStyleSetAlignItems(layout, YGAlignCenter);
    YGNodeStyleSetJustifyContent(layout, YGJustifyCenter);
  }
  if (node.toggle()) {
    YGNodeStyleSetWidth(layout, 22);
    YGNodeStyleSetHeight(layout, 22);
  }
  if (node.type == "select")
    YGNodeStyleSetHeight(layout, 32);
  if (node.scrollable())
    YGNodeStyleSetOverflow(layout, YGOverflowScroll);
  if (node.input())
    YGNodeStyleSetHeight(layout, node.type == "textarea" ? 80 : 28);
  struct Dimension {
    const char *name;
    void (*set)(YGNodeRef, float);
    void (*percent)(YGNodeRef, float);
  };
  for (auto d : {
           Dimension{"width", YGNodeStyleSetWidth, YGNodeStyleSetWidthPercent},
           {"height", YGNodeStyleSetHeight, YGNodeStyleSetHeightPercent},
           {"min-width", YGNodeStyleSetMinWidth, YGNodeStyleSetMinWidthPercent},
           {"min-height", YGNodeStyleSetMinHeight,
            YGNodeStyleSetMinHeightPercent},
           {"max-width", YGNodeStyleSetMaxWidth, YGNodeStyleSetMaxWidthPercent},
           {"max-height", YGNodeStyleSetMaxHeight,
            YGNodeStyleSetMaxHeightPercent},
           {"flex-basis", YGNodeStyleSetFlexBasis,
            YGNodeStyleSetFlexBasisPercent},
       }) {
    auto value = node.property(d.name);
    if (value.empty())
      continue;
    if (value == "auto" || value == "fit-content" || value == "max-content" || value == "min-content") {
      if (std::string(d.name) == "width")
        YGNodeStyleSetWidthAuto(layout);
      else if (std::string(d.name) == "height")
        YGNodeStyleSetHeightAuto(layout);
      else if (std::string(d.name) == "flex-basis")
        YGNodeStyleSetFlexBasisAuto(layout);
    } else if (value.back() == '%')
      d.percent(layout, pixels(value.substr(0, value.size() - 1)));
    else
      d.set(layout, pixels(value));
  }
  const YGEdge edges[] = {YGEdgeTop, YGEdgeRight, YGEdgeBottom, YGEdgeLeft};
  const char *names[] = {"top", "right", "bottom", "left"};
  for (auto property : {"padding", "margin"}) {
    bool margin = std::string(property) == "margin";
    auto set = margin ? YGNodeStyleSetMargin : YGNodeStyleSetPadding;
    std::istringstream values(node.property(property));
    std::vector<float> parts;
    for (std::string part; values >> part;)
      parts.push_back(pixels(part));
    if (!parts.empty() && parts.size() <= 4) {
      float sides[] = {parts[0], parts.size() > 1 ? parts[1] : parts[0],
                       parts.size() > 2 ? parts[2] : parts[0],
                       parts.size() > 3
                           ? parts[3]
                           : (parts.size() > 1 ? parts[1] : parts[0])};
      for (int i = 0; i < 4; ++i)
        set(layout, edges[i], sides[i]);
    }
    for (int i = 0; i < 4; ++i) {
      auto value = node.property(std::string(property) + "-" + names[i]);
      if (!value.empty())
        set(layout, edges[i], pixels(value));
    }
  }
  for (int i = 0; i < 4; ++i) {
    auto value = node.property(names[i]);
    if (!value.empty()) {
      if (value.ends_with('%')) YGNodeStyleSetPositionPercent(layout, edges[i], pixels(value.substr(0, value.size() - 1)));
      else YGNodeStyleSetPosition(layout, edges[i], pixels(value));
    }
  }
  if (node.style.count("border-width"))
    YGNodeStyleSetBorder(layout, YGEdgeAll, node.number("border-width"));
  for (int i = 0; i < 4; ++i) {
    auto key = std::string("border-") + names[i] + "-width";
    if (node.style.count(key)) YGNodeStyleSetBorder(layout, edges[i], node.number(key));
  }
  for (auto [name, gutter] : {std::pair{"gap", YGGutterAll},
                              {"row-gap", YGGutterRow},
                              {"column-gap", YGGutterColumn}})
    if (node.style.count(name))
      YGNodeStyleSetGap(layout, gutter, node.number(name));
  if (node.style.count("flex-grow"))
    YGNodeStyleSetFlexGrow(layout, node.number("flex-grow"));
  if (node.style.count("flex-shrink"))
    YGNodeStyleSetFlexShrink(layout, node.number("flex-shrink"));
  if (node.style.count("flex")) {
    std::istringstream parts(node.property("flex"));
    float grow = 0, shrink = 1;
    std::string basis;
    if (parts >> grow >> shrink >> basis) {
      YGNodeStyleSetFlexGrow(layout, grow);
      YGNodeStyleSetFlexShrink(layout, shrink);
      YGNodeStyleSetFlexBasis(layout, pixels(basis));
    } else YGNodeStyleSetFlex(layout, node.number("flex"));
  }
  auto direction = node.property("flex-direction");
  if (direction == "row")
    YGNodeStyleSetFlexDirection(layout, YGFlexDirectionRow);
  if (direction == "row-reverse")
    YGNodeStyleSetFlexDirection(layout, YGFlexDirectionRowReverse);
  if (direction == "column")
    YGNodeStyleSetFlexDirection(layout, YGFlexDirectionColumn);
  if (direction == "column-reverse")
    YGNodeStyleSetFlexDirection(layout, YGFlexDirectionColumnReverse);
  auto align = [](const std::string &value) {
    if (value == "flex-start" || value == "start")
      return YGAlignFlexStart;
    if (value == "flex-end" || value == "end")
      return YGAlignFlexEnd;
    if (value == "center")
      return YGAlignCenter;
    if (value == "stretch")
      return YGAlignStretch;
    if (value == "baseline")
      return YGAlignBaseline;
    return YGAlignAuto;
  };
  if (node.style.count("align-items"))
    YGNodeStyleSetAlignItems(layout, align(node.property("align-items")));
  if (node.style.count("align-self"))
    YGNodeStyleSetAlignSelf(layout, align(node.property("align-self")));
  auto justify = node.property("justify-content");
  if (justify == "flex-start")
    YGNodeStyleSetJustifyContent(layout, YGJustifyFlexStart);
  if (justify == "flex-end")
    YGNodeStyleSetJustifyContent(layout, YGJustifyFlexEnd);
  if (justify == "center")
    YGNodeStyleSetJustifyContent(layout, YGJustifyCenter);
  if (justify == "space-between")
    YGNodeStyleSetJustifyContent(layout, YGJustifySpaceBetween);
  if (justify == "space-around")
    YGNodeStyleSetJustifyContent(layout, YGJustifySpaceAround);
  if (justify == "space-evenly")
    YGNodeStyleSetJustifyContent(layout, YGJustifySpaceEvenly);
  auto wrap = node.property("flex-wrap");
  if (wrap == "wrap")
    YGNodeStyleSetFlexWrap(layout, YGWrapWrap);
  if (wrap == "wrap-reverse")
    YGNodeStyleSetFlexWrap(layout, YGWrapWrapReverse);
  if (node.property("position") == "absolute" || node.property("position") == "fixed")
    YGNodeStyleSetPositionType(layout, YGPositionTypeAbsolute);
  if (node.property("display") == "none")
    YGNodeStyleSetDisplay(layout, YGDisplayNone);
  else if (node.property("display") == "contents")
    YGNodeStyleSetDisplay(layout, YGDisplayContents);

  if (node.property("display") == "grid") {
    auto columns = std::regex_replace(node.property("grid-template-columns"),
      std::regex(R"(minmax\(\s*0(?:px)?\s*,\s*1fr\s*\))"), "1fr");
    std::smatch repeat;
    if (std::regex_match(columns, repeat, std::regex(R"(repeat\(\s*(\d+)\s*,\s*1fr\s*\))")))
      node.grid_count = std::clamp(std::stoi(repeat[1]), 1, 1024);
    else {
      std::istringstream parts(columns);
      for (std::string part; parts >> part;) {
        if (part == "1fr") ++node.grid_count;
        else if (part.ends_with("px") && pixels(part) > 0) {
          node.grid_columns.push_back(pixels(part));
          ++node.grid_count;
        } else throw std::runtime_error("Unsupported native grid columns: " + columns);
      }
    }
    if (node.grid_count > 0) {
      YGNodeStyleSetFlexDirection(layout, YGFlexDirectionRow);
      YGNodeStyleSetFlexWrap(layout, YGWrapWrap);
      if (!node.grid_columns.empty() && !node.style.count("width")) {
        float width = node.number("gap") * (node.grid_count - 1);
        for (float column : node.grid_columns) width += column;
        YGNodeStyleSetWidth(layout, width);
      }
    }
  }
}

std::unique_ptr<Node> Runtime::parse(JSValueConst object, Node *parent,
                                     int depth) {
  if (depth > 256 || nodes_.size() >= 100000)
    throw std::runtime_error("Native tree exceeds depth or node limit");
  auto node =
      std::make_unique<Node>(this, context_, JS_DupValue(context_, object));
  node->parent = parent;
  Value type(context_, JS_GetPropertyStr(context_, object, "type"));
  node->type = string(context_, type.get());
  static const std::unordered_set<std::string> supported = {
      "view",         "text",         "button",        "input",
      "textarea",     "number-input", "row",           "column",
      "aspect-ratio", "for",          "show",          "match",
      "fragment",     "portal",       "lazy-view",     "label",
      "scroll-view",  "select",       "select-option", "select-option-group",
      "checkbox",     "radio", "icon", "floating", "form", "grid",
      "table", "table-header", "table-body", "table-footer", "table-row",
      "table-head", "table-cell", "table-caption", "list-view-v2",
      "split-view", "split-pane", "tab-view", "tab-pane", "img"};
  if (!supported.count(node->type))
    throw std::runtime_error("Windows host does not implement native node: " +
                             node->type);
  Value id(context_, JS_GetPropertyStr(context_, object, "__windows_id"));
  if (JS_IsUndefined(id.get())) {
    node->id = next_node_++;
    JS_SetPropertyStr(context_, object, "__windows_id",
                      JS_NewInt32(context_, node->id));
  } else if (JS_ToInt32(context_, &node->id, id.get()) < 0)
    check(JS_EXCEPTION);
  if (!nodes_.emplace(node->id, node.get()).second)
    throw std::runtime_error("Native tree contains the same node twice");
  Value style(context_, JS_GetPropertyStr(context_, object, "style"));
  Value attrs(context_, JS_GetPropertyStr(context_, object, "attrs"));
  node->style = properties(context_, style.get());
  node->attributes = properties(context_, attrs.get());
  node->name = node->attributes["n"];
  node->disabled = node->attributes.count("disabled") != 0;
  node->readonly = node->attributes.count("readonly") != 0;
  if (node->type == "floating") {
    auto read = [&](const char *name) { return Value(context_, JS_GetPropertyStr(context_, object, name)); };
    node->open = JS_ToBool(context_, read("open").get()) > 0;
    node->modal = JS_ToBool(context_, read("modal").get()) > 0;
    node->kind = string(context_, read("kind").get());
    node->side = string(context_, read("side").get());
    node->align = string(context_, read("align").get());
    node->drawer_side = string(context_, read("drawerSide").get());
    node->offset = pixels(string(context_, read("offset").get()), 8);
    node->cross_offset = pixels(string(context_, read("crossOffset").get()));
    auto anchor = read("anchor");
    if (JS_IsObject(anchor.get())) {
      Value id(context_, JS_GetPropertyStr(context_, anchor.get(), "__windows_id"));
      if (!JS_IsUndefined(id.get()) && JS_ToInt32(context_, &node->anchor, id.get()) < 0) check(JS_EXCEPTION);
      if (!node->anchor) {
        auto bounds = invoke(anchor.get(), "getBoundingClientRect");
        if (JS_IsObject(bounds.get())) {
          node->virtual_anchor = true;
          for (auto [key, field] : {std::pair{"x", &node->anchor_x}, {"y", &node->anchor_y},
                 {"width", &node->anchor_width}, {"height", &node->anchor_height}}) {
            Value value(context_, JS_GetPropertyStr(context_, bounds.get(), key));
            *field = pixels(string(context_, value.get()));
          }
        }
      }
    }
  }
  if (node->type == "icon") {
    Value svg(context_, JS_GetPropertyStr(context_, object, "svg"));
    node->svg = string(context_, svg.get());
    Value size(context_, JS_GetPropertyStr(context_, object, "size"));
    auto length = string(context_, size.get());
    if (!node->style.count("width")) node->style["width"] = length;
    if (!node->style.count("height")) node->style["height"] = length;
    node->style["flex-shrink"] = "0";
  }
  if (node->type == "img") {
    Value source(context_, JS_GetPropertyStr(context_, object, "src"));
    node->src = string(context_, source.get());
  }
  for (auto [key, field] : {std::pair{"checked", &node->checked},
                            {"indeterminate", &node->indeterminate}}) {
    Value flag(context_, JS_GetPropertyStr(context_, object, key));
    *field = JS_ToBool(context_, flag.get()) > 0;
  }
  if (node->scrollable()) {
    Value horizontal(context_,
                     JS_GetPropertyStr(context_, object, "horizontal"));
    Value vertical(context_, JS_GetPropertyStr(context_, object, "vertical"));
    node->horizontal =
        node->property("overflow-x", string(context_, horizontal.get()));
    node->vertical =
        node->property("overflow-y", string(context_, vertical.get()));
  }
  Value listeners(context_, JS_GetPropertyStr(context_, object, "listeners"));
  if (JS_IsObject(listeners.get())) {
    Value keydown(context_, JS_GetPropertyStr(context_, listeners.get(), "keydown"));
    node->keyboard = JS_IsFunction(context_, keydown.get());
  }
  if (JS_IsObject(listeners.get()) && !node->input() && !node->toggle() &&
      node->type != "select" && !node->scrollable()) {
    Value click(context_,
                JS_GetPropertyStr(context_, listeners.get(), "click"));
    node->clickable = JS_IsFunction(context_, click.get());
  }
  Value text(context_, JS_GetPropertyStr(context_, object, "value"));
  node->text = string(context_, text.get());
  Value rich_text(context_, JS_GetPropertyStr(context_, object, "richText"));
  if (JS_IsObject(rich_text.get())) {
    Value spans(context_, JS_GetPropertyStr(context_, rich_text.get(), "spans"));
    if (JS_IsArray(spans.get())) {
      Value length(context_, JS_GetPropertyStr(context_, spans.get(), "length"));
      uint32_t count = 0;
      if (JS_ToUint32(context_, &count, length.get()) < 0) check(JS_EXCEPTION);
      if (count > 100000) throw std::runtime_error("Rich text span count exceeds limit");
      for (uint32_t i = 0; i < count; ++i) {
        Value span(context_, JS_GetPropertyUint32(context_, spans.get(), i));
        Value start(context_, JS_GetPropertyStr(context_, span.get(), "start"));
        Value end(context_, JS_GetPropertyStr(context_, span.get(), "end"));
        Value style(context_, JS_GetPropertyStr(context_, span.get(), "style"));
        Value href(context_, JS_GetPropertyStr(context_, span.get(), "href"));
        Node::TextSpan run{};
        if (JS_ToUint32(context_, &run.start, start.get()) < 0 || JS_ToUint32(context_, &run.end, end.get()) < 0) check(JS_EXCEPTION);
        if (run.end <= run.start) continue;
        run.style = properties(context_, style.get());
        run.href = string(context_, href.get());
        node->text_spans.push_back(std::move(run));
      }
    }
  }
  Value placeholder(context_,
                    JS_GetPropertyStr(context_, object, "placeholder"));
  node->placeholder = string(context_, placeholder.get());
  styles(*node);
  Value host_id(context_, JS_NewInt32(context_, node->id));
  JSValue data[] = {host_id.get()};
  int method = 0;
  for (const char *key : {"_focus", "_blur", "_getBoundingClientRect", "_pickFiles"})
    JS_SetPropertyStr(context_, object, key,
      JS_NewCFunctionData(context_, host_method, 0, method++, 1, data));
  if (node->type == "list-view-v2") virtual_rows(object, !node->hidden());
  if (node->type == "aspect-ratio") {
    Value ratio(context_, JS_GetPropertyStr(context_, object, "ratio"));
    double value = 0;
    if (JS_ToFloat64(context_, &value, ratio.get()) == 0 && value > 0)
      YGNodeStyleSetAspectRatio(node->layout, static_cast<float>(value));
  }
  if (node->type == "text") {
    YGNodeSetContext(node->layout, node.get());
    YGNodeSetMeasureFunc(node->layout, [](YGNodeConstRef layout, float width,
                                          YGMeasureMode mode, float,
                                          YGMeasureMode) {
      auto node = static_cast<Node *>(YGNodeGetContext(layout));
      if (!node->owner->measure)
        return YGSize{0, 0};
      return node->owner->measure(
          *node, mode == YGMeasureModeUndefined ? 1000000 : width);
    });
  } else {
    Value children(context_, JS_GetPropertyStr(context_, object, "children"));
    if (JS_IsArray(children.get())) {
      Value length(context_,
                   JS_GetPropertyStr(context_, children.get(), "length"));
      uint32_t count = 0;
      if (JS_ToUint32(context_, &count, length.get()) < 0)
        check(JS_EXCEPTION);
      if (count > 100000)
        throw std::runtime_error("Native child count exceeds limit");
      for (uint32_t i = 0; i < count; ++i) {
        Value child(context_,
                    JS_GetPropertyUint32(context_, children.get(), i));
        check(child.get());
        if (!JS_IsObject(child.get()))
          continue;
        auto parsed = parse(child.get(), node.get(), depth + 1);
        if (node->type != "select" && parsed->type != "floating")
          YGNodeInsertChild(node->layout, parsed->layout,
                            YGNodeGetChildCount(node->layout));
        node->children.push_back(std::move(parsed));
      }
    }
  }
  if (node->type == "select") {
    std::function<void(const Node &, std::string)> options =
        [&](const Node &child, std::string group) {
          if (child.type == "select-option-group") {
            Value label(context_, JS_GetPropertyStr(
                                      context_, child.object.get(), "label"));
            group = string(context_, label.get());
          }
          if (child.type == "select-option") {
            Value label(context_, JS_GetPropertyStr(
                                      context_, child.object.get(), "label"));
            node->options.push_back({child.text,
                                     (group.empty() ? "" : group + " — ") +
                                         string(context_, label.get()),
                                     child.disabled});
          } else
            for (const auto &entry : child.children)
              options(*entry, group);
        };
    for (const auto &child : node->children)
      options(*child, "");
  }
  if (node->type == "list-view-v2") {
    for (auto &row : node->children) {
      int index = std::stoi(row->attributes.at("data-index"));
      JSValueConst args[] = {JS_NewInt32(context_, index)};
      auto offset = invoke(object, "_rowOffset", 1, args);
      auto height = invoke(object, "_rowHeight", 1, args);
      YGNodeStyleSetPositionType(row->layout, YGPositionTypeAbsolute);
      YGNodeStyleSetPosition(row->layout, YGEdgeTop, pixels(string(context_, offset.get())));
      YGNodeStyleSetWidthPercent(row->layout, 100);
      YGNodeStyleSetHeight(row->layout, pixels(string(context_, height.get()), 40));
    }
  }
  return node;
}

void Runtime::virtual_rows(JSValueConst object, bool visible) {
  Value top(context_, JS_GetPropertyStr(context_, object, "scrollTop"));
  Value style(context_, JS_GetPropertyStr(context_, object, "style"));
  Value height(context_, JS_GetPropertyStr(context_, style.get(), "height"));
  JSValueConst args[] = {JS_NewFloat64(context_, pixels(string(context_, top.get()))),
    JS_NewFloat64(context_, pixels(string(context_, height.get()), height_))};
  auto range = invoke(object, "_visibleRange", 2, args);
  int start = 0, end = 0;
  if (visible) {
    Value first(context_, JS_GetPropertyStr(context_, range.get(), "start"));
    Value last(context_, JS_GetPropertyStr(context_, range.get(), "end"));
    if (JS_ToInt32(context_, &start, first.get()) < 0 || JS_ToInt32(context_, &end, last.get()) < 0) check(JS_EXCEPTION);
  }
  Value children(context_, JS_GetPropertyStr(context_, object, "children"));
  Value length(context_, JS_GetPropertyStr(context_, children.get(), "length"));
  uint32_t count = 0;
  if (JS_ToUint32(context_, &count, length.get()) < 0) check(JS_EXCEPTION);
  std::vector<int> release;
  for (uint32_t i = 0; i < count; ++i) {
    Value child(context_, JS_GetPropertyUint32(context_, children.get(), i));
    Value attrs(context_, JS_GetPropertyStr(context_, child.get(), "attrs"));
    Value index(context_, JS_GetPropertyStr(context_, attrs.get(), "data-index"));
    int row = std::stoi(string(context_, index.get()));
    if (row < start || row >= end) release.push_back(row);
  }
  for (int row : release) {
    JSValueConst index[] = {JS_NewInt32(context_, row)};
    invoke(object, "_releaseRow", 1, index);
  }
  for (int row = start; row < end; ++row) {
    JSValueConst index[] = {JS_NewInt32(context_, row)};
    invoke(object, "_renderRow", 1, index);
  }
}

void Runtime::grid_widths(Node &node) {
  if (node.grid_count > 0) {
    float inner = YGNodeLayoutGetWidth(node.layout) -
      YGNodeLayoutGetPadding(node.layout, YGEdgeLeft) - YGNodeLayoutGetPadding(node.layout, YGEdgeRight) -
      YGNodeLayoutGetBorder(node.layout, YGEdgeLeft) - YGNodeLayoutGetBorder(node.layout, YGEdgeRight);
    float width = std::max(0.f, (inner - node.number("column-gap", node.number("gap")) * (node.grid_count - 1)) / node.grid_count);
    size_t index = 0;
    std::function<void(Node &)> assign = [&](Node &child) {
      if (child.type == "floating") return;
      if (child.contents()) { for (auto &entry : child.children) assign(*entry); return; }
      YGNodeStyleSetFlexBasis(child.layout, node.grid_columns.empty() ? width : node.grid_columns.at(index % node.grid_columns.size()));
      YGNodeStyleSetFlexGrow(child.layout, 0);
      YGNodeStyleSetFlexShrink(child.layout, 0);
      ++index;
    };
    for (auto &child : node.children) assign(*child);
  }
  for (auto &child : node.children) grid_widths(*child);
}

bool Runtime::scroll_metrics(Node &node) {
  bool changed = false;
  for (auto &child : node.children)
    changed = scroll_metrics(*child) || changed;
  if (!node.scrollable())
    return changed;
  auto layout = node.layout;
  float width = YGNodeLayoutGetWidth(layout),
        height = YGNodeLayoutGetHeight(layout);
  float right = 0, bottom = 0;
  std::function<void(const Node &, float, float)> extent =
      [&](const Node &child, float x, float y) {
        if (child.hidden())
          return;
        x += YGNodeLayoutGetLeft(child.layout);
        y += YGNodeLayoutGetTop(child.layout);
        right = std::max(right, x + YGNodeLayoutGetWidth(child.layout));
        bottom = std::max(bottom, y + YGNodeLayoutGetHeight(child.layout));
        if (!child.scrollable() && child.type != "floating")
          for (const auto &entry : child.children)
            extent(*entry, x, y);
      };
  for (const auto &child : node.children)
    extent(*child, 0, 0);
  float padding_right = YGNodeLayoutGetPadding(layout, YGEdgeRight) -
                        (node.vertical_bar ? scrollbar_size : 0);
  float padding_bottom = YGNodeLayoutGetPadding(layout, YGEdgeBottom) -
                         (node.horizontal_bar ? scrollbar_size : 0);
  Value explicit_width(
      context_, JS_GetPropertyStr(context_, node.object.get(), "contentWidth"));
  Value explicit_height(context_, JS_GetPropertyStr(context_, node.object.get(),
                                                    "contentHeight"));
  node.client_width =
      std::max(0.f, width - (node.vertical_bar ? scrollbar_size : 0));
  node.client_height =
      std::max(0.f, height - (node.horizontal_bar ? scrollbar_size : 0));
  node.content_width =
      std::max({node.client_width, right + padding_right,
                pixels(string(context_, explicit_width.get()))});
  node.content_height =
      std::max({node.client_height, bottom + padding_bottom,
                pixels(string(context_, explicit_height.get()))});
  auto bar = [](const std::string &mode, float content, float client) {
    return mode == "scroll" || mode == "visible" ||
           (mode != "hidden" && content > client + 0.5f);
  };
  bool horizontal = bar(node.horizontal, node.content_width, node.client_width);
  bool vertical = bar(node.vertical, node.content_height, node.client_height);
  if (horizontal != node.horizontal_bar || vertical != node.vertical_bar) {
    changed = true;
    node.horizontal_bar = horizontal;
    node.vertical_bar = vertical;
    YGNodeStyleSetPadding(layout, YGEdgeRight,
                          padding_right + (vertical ? scrollbar_size : 0));
    YGNodeStyleSetPadding(layout, YGEdgeBottom,
                          padding_bottom + (horizontal ? scrollbar_size : 0));
  }
  auto read_offset = [&](const char *key, float maximum) {
    Value value(context_, JS_GetPropertyStr(context_, node.object.get(), key));
    return std::clamp(pixels(string(context_, value.get())), 0.f,
                      std::max(0.f, maximum));
  };
  node.scroll_x =
      read_offset("scrollLeft", node.content_width - node.client_width);
  node.scroll_y =
      read_offset("scrollTop", node.content_height - node.client_height);
  return changed;
}

void Runtime::frames(Node &node, float x, float y) {
  node.x = x + YGNodeLayoutGetLeft(node.layout);
  node.y = y + YGNodeLayoutGetTop(node.layout);
  node.width = YGNodeLayoutGetWidth(node.layout);
  node.height = YGNodeLayoutGetHeight(node.layout);
  if (node.scrollable()) {
    for (auto [key, value] : {std::pair{"scrollLeft", node.scroll_x},
                              {"scrollTop", node.scroll_y},
                              {"scrollWidth", node.content_width},
                              {"scrollHeight", node.content_height},
                              {"clientWidth", node.client_width}, {"clientHeight", node.client_height}})
      JS_SetPropertyStr(context_, node.object.get(), key,
                        JS_NewFloat64(context_, value));
  }
  for (auto &child : node.children)
    if (child->type != "floating") frames(*child, node.x - node.scroll_x, node.y - node.scroll_y);
}

void Runtime::floating_frames(Node &node) {
  if (node.type == "floating" && !node.hidden()) {
    float limit = std::max(0.f, width_ - 16);
    auto relative = [](std::string value, float extent) {
      return value.ends_with('%') ? pixels(value.substr(0, value.size() - 1)) * extent / 100 : pixels(value, extent);
    };
    YGNodeStyleSetMaxWidth(node.layout, std::min(limit, relative(node.property("max-width"), width_)));
    YGNodeStyleSetMaxHeight(node.layout, std::max(0.f, height_ - 16));
    if (node.property("width").ends_with('%'))
      YGNodeStyleSetWidth(node.layout, width_ * pixels(node.property("width").substr(0, node.property("width").size() - 1)) / 100);
    float maximum = relative(node.property("max-width"), limit);
    if (!node.style.count("width") && node.modal) YGNodeStyleSetWidth(node.layout, std::min(maximum, 480.f));
    if (!node.drawer_side.empty()) {
      bool horizontal = node.drawer_side == "left" || node.drawer_side == "right";
      if (horizontal) YGNodeStyleSetHeight(node.layout, height_);
      else YGNodeStyleSetWidth(node.layout, width_);
      YGNodeStyleSetMaxHeight(node.layout, height_);
      YGNodeStyleSetMaxWidth(node.layout, width_);
    }
    YGNodeCalculateLayout(node.layout, YGUndefined, YGUndefined, YGDirectionLTR);
    grid_widths(node);
    YGNodeCalculateLayout(node.layout, YGUndefined, YGUndefined, YGDirectionLTR);
    float width = YGNodeLayoutGetWidth(node.layout), height = YGNodeLayoutGetHeight(node.layout);
    float x = (width_ - width) / 2, y = (height_ - height) / 2;
    auto anchor = find(node.anchor);
    if ((anchor || node.virtual_anchor) && !node.modal) {
      float ax = anchor ? anchor->x : node.anchor_x, ay = anchor ? anchor->y : node.anchor_y;
      float aw = anchor ? anchor->width : node.anchor_width, ah = anchor ? anchor->height : node.anchor_height;
      bool horizontal = node.side == "left" || node.side == "right";
      x = horizontal ? (node.side == "left" ? ax - width - node.offset : ax + aw + node.offset) : ax;
      y = horizontal ? ay : (node.side == "top" ? ay - height - node.offset : ay + ah + node.offset);
      if (node.align == "center") { if (horizontal) y += (ah - height) / 2; else x += (aw - width) / 2; }
      if (node.align == "end") { if (horizontal) y += ah - height; else x += aw - width; }
      if (horizontal) y += node.cross_offset; else x += node.cross_offset;
      if (!horizontal && y + height > height_ - 8) y = ay - height - node.offset;
      if (horizontal && x + width > width_ - 8) x = ax - width - node.offset;
      x = std::clamp(x, 8.f, std::max(8.f, width_ - width - 8));
      y = std::clamp(y, 8.f, std::max(8.f, height_ - height - 8));
    }
    if (node.drawer_side == "right") { x = width_ - width; y = 0; }
    if (node.drawer_side == "left") { x = 0; y = 0; }
    if (node.drawer_side == "top") { x = 0; y = 0; }
    if (node.drawer_side == "bottom") { x = 0; y = height_ - height; }
    frames(node, x - YGNodeLayoutGetLeft(node.layout), y - YGNodeLayoutGetTop(node.layout));
  }
  for (auto &child : node.children) floating_frames(*child);
}

static float seconds(const std::string &value) {
  auto text = value.ends_with("ms") ? value.substr(0, value.size() - 2) : value.ends_with('s') ? value.substr(0, value.size() - 1) : value;
  return pixels(text) / (value.ends_with("ms") ? 1000.f : 1.f);
}

static std::array<float, 4> transform(const std::string &value, const Node &node) {
  std::array<float, 4> result{0, 0, 1, 1};
  static const std::regex expression(R"(([A-Za-z0-9]+)\(([^()]*)\))");
  for (auto it = std::sregex_iterator(value.begin(), value.end(), expression); it != std::sregex_iterator(); ++it) {
    auto name = (*it)[1].str(), text = (*it)[2].str();
    std::replace(text.begin(), text.end(), ',', ' ');
    std::istringstream parts(text);
    std::string first, second;
    parts >> first >> second;
    auto length = [](const std::string &part, float extent) {
      return part.ends_with('%') ? pixels(part.substr(0, part.size() - 1)) * extent / 100 : pixels(part);
    };
    if (name == "translate" || name == "translate3d") {
      result[0] += length(first, node.width); result[1] += length(second, node.height);
    } else if (name == "translateX") result[0] += length(first, node.width);
    else if (name == "translateY") result[1] += length(first, node.height);
    else if (name == "scale" || name == "scale3d") {
      result[2] *= pixels(first, 1); result[3] *= pixels(second, pixels(first, 1));
    } else if (name == "scaleX") result[2] *= pixels(first, 1);
    else if (name == "scaleY") result[3] *= pixels(first, 1);
  }
  return result;
}

void Runtime::animate() {
  for (auto it = animations_.begin(); it != animations_.end();) {
    auto node = find(it->first);
    if (!node || node->hidden() || node->property("-timeless-animation").empty()) it = animations_.erase(it);
    else ++it;
  }
  std::vector<std::pair<int, std::string>> events;
  for (const auto &[id, node] : nodes_) {
    auto source = node->property("-timeless-animation");
    if (source.empty() || node->hidden()) continue;
    auto &animation = animations_[id];
    if (source != animation.source) {
      animation = Animation{};
      animation.source = source;
      animation.start = Clock::now();
      Value spec(context_, JS_ParseJSON(context_, source.data(), source.size(), "animation.json"));
      check(spec.get());
      auto field = [&](const char *key) {
        Value value(context_, JS_GetPropertyStr(context_, spec.get(), key));
        return string(context_, value.get());
      };
      animation.name = field("name"); animation.fill = field("fill"); animation.timing = field("timing");
      animation.duration = std::max(0.f, seconds(field("duration"))); animation.delay = seconds(field("delay"));
      animation.reverse = field("direction") == "reverse" || field("direction") == "alternate-reverse";
      Value frames(context_, JS_GetPropertyStr(context_, spec.get(), "frames"));
      Value length(context_, JS_GetPropertyStr(context_, frames.get(), "length"));
      uint32_t count = 0;
      if (JS_ToUint32(context_, &count, length.get()) < 0) check(JS_EXCEPTION);
      if (count > 1000) throw std::runtime_error("Animation exceeds keyframe limit");
      for (uint32_t i = 0; i < count; ++i) {
        Value frame(context_, JS_GetPropertyUint32(context_, frames.get(), i));
        Value offset(context_, JS_GetPropertyStr(context_, frame.get(), "offset"));
        Value style(context_, JS_GetPropertyStr(context_, frame.get(), "style"));
        animation.frames.push_back({pixels(string(context_, offset.get())), properties(context_, style.get())});
      }
    }
    float elapsed = std::chrono::duration<float>(Clock::now() - animation.start).count() - animation.delay;
    float progress = reduce_motion ? 1 : elapsed < 0 ? 0 : animation.duration <= 0 ? 1 : std::clamp(elapsed / animation.duration, 0.f, 1.f);
    bool ended = progress >= 1;
    if (!animation.started && (elapsed >= 0 || reduce_motion)) {
      animation.started = true;
      events.emplace_back(id, "animationstart");
    }
    if (ended && !animation.ended) { animation.ended = true; events.emplace_back(id, "animationend"); }
    if (!ended) dirty_ = true;
    node->animated = true;
    bool apply = elapsed < 0 ? animation.fill == "both" || animation.fill == "backwards" :
      !ended || animation.fill == "both" || animation.fill == "forwards";
    if (!apply) continue;
    // CSS timing uses a cubic Bezier's x-coordinate as time.
    std::array<float, 4> bezier{.25f, .1f, .25f, 1};
    if (animation.timing == "ease-in") bezier = {.42f, 0, 1, 1};
    else if (animation.timing == "ease-out") bezier = {0, 0, .58f, 1};
    else if (animation.timing == "ease-in-out") bezier = {.42f, 0, .58f, 1};
    else if (animation.timing.starts_with("cubic-bezier(")) {
      auto values = animation.timing.substr(13);
      std::replace(values.begin(), values.end(), ',', ' ');
      std::istringstream input(values);
      input >> bezier[0] >> bezier[1] >> bezier[2] >> bezier[3];
    }
    if (animation.timing != "linear") {
      auto cubic = [](float t, float a, float b) { return 3 * (1 - t) * (1 - t) * t * a + 3 * (1 - t) * t * t * b + t * t * t; };
      float low = 0, high = 1;
      for (int i = 0; i < 16; ++i) {
        float middle = (low + high) / 2;
        if (cubic(middle, bezier[0], bezier[2]) < progress) low = middle; else high = middle;
      }
      progress = cubic((low + high) / 2, bezier[1], bezier[3]);
    }
    if (animation.reverse) progress = 1 - progress;
    for (const char *property : {"opacity", "transform"}) {
      auto base = node->property(property, std::string(property) == "opacity" ? "1" : "none");
      std::map<float, std::string> frames{{0, base}, {1, base}};
      for (const auto &frame : animation.frames) {
        auto value = frame.style.find(property);
        if (value != frame.style.end()) frames[frame.offset] = value->second;
      }
      auto upper = frames.lower_bound(progress);
      if (upper == frames.end()) upper = std::prev(frames.end());
      auto lower = upper == frames.begin() ? upper : std::prev(upper);
      float fraction = upper->first == lower->first ? 0 : (progress - lower->first) / (upper->first - lower->first);
      auto mix = [&](float a, float b) { return a + (b - a) * fraction; };
      if (std::string(property) == "opacity") node->animation_opacity = std::clamp(mix(pixels(lower->second, 1), pixels(upper->second, 1)), 0.f, 1.f);
      else {
        auto from = transform(lower->second, *node), to = transform(upper->second, *node);
        node->translate_x = mix(from[0], to[0]); node->translate_y = mix(from[1], to[1]);
        node->scale_x = mix(from[2], to[2]); node->scale_y = mix(from[3], to[3]);
      }
    }
  }
  for (const auto &[id, name] : events) event(id, name);
}

bool Runtime::update(float width, float height) {
  deadline_ = Clock::now() + turn_budget;
  if (!JS_IsObject(root_object_))
    return false;
  for (const auto &[id, animation] : animations_) if (!animation.ended) dirty_ = true;
  if (!dirty_ && width == width_ && height == height_)
    return false;
  width_ = width;
  height_ = height;
  // Retain the previous snapshot if decoding a new tree fails.
  auto previous = std::move(nodes_);
  nodes_.clear();
  try {
    auto next = parse(root_object_, nullptr, 0);
    YGNodeCalculateLayout(next->layout, width, height, YGDirectionLTR);
    grid_widths(*next);
    YGNodeCalculateLayout(next->layout, width, height, YGDirectionLTR);
    for (int pass = 0; pass < 4 && scroll_metrics(*next); ++pass)
      YGNodeCalculateLayout(next->layout, width, height, YGDirectionLTR);
    scroll_metrics(*next);
    frames(*next, 0, 0);
    floating_frames(*next);
    root_ = std::move(next);
  } catch (...) {
    nodes_ = std::move(previous);
    throw;
  }
  dirty_ = false;
  animate();
  std::vector<int> scrolled;
  for (const auto &[id, node] : nodes_) {
    if (!node->scrollable())
      continue;
    Value x(context_, JS_GetPropertyStr(context_, node->object.get(),
                                        "__windows_scroll_x"));
    Value y(context_, JS_GetPropertyStr(context_, node->object.get(),
                                        "__windows_scroll_y"));
    if (node->scroll_x != pixels(string(context_, x.get())) ||
        node->scroll_y != pixels(string(context_, y.get())))
      scrolled.push_back(id);
  }
  for (int id : scrolled) {
    auto node = find(id);
    scroll_event(*node, node->scroll_x, node->scroll_y);
  }
  return true;
}

Node *Runtime::find(int id) const {
  auto it = nodes_.find(id);
  return it == nodes_.end() ? nullptr : it->second;
}
Node *Runtime::find(const std::string &name) const {
  for (const auto &[_, node] : nodes_)
    if (node->name == name)
      return node;
  return nullptr;
}

} // namespace timeless

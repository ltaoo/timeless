#pragma once
#include <chrono>
#include <filesystem>
#include <functional>
#include <memory>
#include <quickjs.h>
#include <string>
#include <unordered_map>
#include <vector>
#include <yoga/Yoga.h>

namespace timeless {

class Value {
public:
  Value(JSContext *context, JSValue value) : context_(context), value_(value) {}
  Value(const Value &) = delete;
  Value &operator=(const Value &) = delete;
  Value(Value &&other) noexcept
      : context_(other.context_), value_(other.value_) {
    other.value_ = JS_UNDEFINED;
  }
  ~Value() { JS_FreeValue(context_, value_); }
  JSValue get() const { return value_; }

private:
  JSContext *context_;
  JSValue value_;
};

class Runtime;
struct Node {
  Node(Runtime *owner, JSContext *context, JSValue object);
  ~Node();
  Runtime *owner;
  Value object;
  YGNodeRef layout;
  int id = 0;
  std::string type, name, text, placeholder;
  std::unordered_map<std::string, std::string> style, attributes;
  std::vector<std::unique_ptr<Node>> children;
  Node *parent = nullptr;
  bool disabled = false;
  bool clickable = false;
  bool checked = false, indeterminate = false, readonly = false;
  struct Option {
    std::string value, label;
    bool disabled;
  };
  std::vector<Option> options;
  float scroll_x = 0, scroll_y = 0, content_width = 0, content_height = 0;
  float client_width = 0, client_height = 0;
  bool horizontal_bar = false, vertical_bar = false;
  std::string horizontal = "auto", vertical = "auto";
  float x = 0, y = 0, width = 0, height = 0;
  std::string property(const std::string &name,
                       const std::string &fallback = "") const;
  float number(const std::string &name, float fallback = 0) const;
  bool hidden() const;
  bool button() const;
  bool input() const;
  bool toggle() const;
  std::string content() const;
};

class Runtime {
public:
  Runtime();
  ~Runtime();
  Runtime(const Runtime &) = delete;
  Runtime &operator=(const Runtime &) = delete;
  void load(const std::string &filename);
  void evaluate(const std::string &source,
                const std::string &filename = "app.js");
  void pump();
  bool update(float width, float height);
  void request_update() { dirty_ = true; }
  void state(int id, const std::string &name, bool value);
  bool event(int id, const std::string &name, const std::string &key = "");
  void input(int id, const std::string &value);
  void select(int id, const std::string &value);
  void toggle(int id);
  bool scroll(int id, float x, float y);
  float scrollbar_size = 17;
  Node *find(int id) const;
  Node *find(const std::string &name) const;
  Node *root() const { return root_.get(); }
  JSContext *context() const { return context_; }
  std::function<YGSize(const Node &, float)> measure;

private:
  using Clock = std::chrono::steady_clock;
  struct Timer {
    Value callback;
    Clock::time_point due;
    int interval;
  };
  JSRuntime *runtime_ = nullptr;
  JSContext *context_ = nullptr;
  JSValue root_object_ = JS_UNDEFINED;
  std::unique_ptr<Node> root_;
  std::unordered_map<int, Node *> nodes_;
  std::unordered_map<int, Timer> timers_;
  int next_node_ = 1, next_timer_ = 1;
  bool dirty_ = false;
  float width_ = 0, height_ = 0;
  Clock::time_point deadline_;
  std::unique_ptr<Node> parse(JSValueConst object, Node *parent, int depth);
  bool call(JSValueConst object, const char *name, int argc,
            JSValueConst *argv);
  void check(JSValueConst value);
  void jobs();
  void frames(Node &node, float x, float y);
  bool scroll_metrics(Node &node);
  void scroll_event(Node &node, float x, float y);
  static JSValue render(JSContext *, JSValueConst, int, JSValueConst *);
  static JSValue invalidate(JSContext *, JSValueConst, int, JSValueConst *);
  static JSValue log(JSContext *, JSValueConst, int, JSValueConst *);
  static JSValue schedule(JSContext *, JSValueConst, int, JSValueConst *, int);
  static JSValue cancel(JSContext *, JSValueConst, int, JSValueConst *);
  static int interrupt(JSRuntime *, void *);
};

std::string string(JSContext *context, JSValueConst value);
std::filesystem::path file_path(const std::string &value);
float pixels(const std::string &value, float fallback = 0);

} // namespace timeless

#include "shared_shadcn.hpp"
#include <iostream>

int main(int argc, char **argv) {
  try {
    if (argc != 2) throw std::runtime_error("Pass the shared shadcn bundle");
    timeless::Runtime runtime;
    runtime.turn_budget = std::chrono::seconds(30);
    runtime.measure = [](const timeless::Node &node, float width) {
      auto size = node.number("font-size", 14);
      float line = node.number("line-height", 1.25f);
      if (!node.property("line-height").ends_with("px")) line *= size;
      return YGSize{std::min(width, static_cast<float>(node.text.size()) * size * .5f),
                    node.text.empty() ? 0 : line};
    };
    runtime.load(argv[1]);
    auto update = [&] {
      for (int pass = 0; pass < 3; ++pass) {
        runtime.pump();
        runtime.update(1100, 800);
      }
    };
    test_shared_shadcn(runtime, update, [&](int id) { runtime.event(id, "click"); });
    std::cout << "Windows shared shadcn QuickJS/Yoga integration passed\n";
    return 0;
  } catch (const std::exception &error) {
    std::cerr << error.what() << '\n';
    return 1;
  }
}

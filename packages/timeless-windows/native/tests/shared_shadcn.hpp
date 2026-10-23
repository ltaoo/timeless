#pragma once
#include "runtime.hpp"
#include <cmath>
#include <stdexcept>
#include <iostream>
#include <thread>
#include <fstream>

inline void test_shared_shadcn(timeless::Runtime &runtime,
                              const std::function<void()> &update,
                              const std::function<void(int)> &activate,
                              const std::function<void(const std::string &)> &snapshot = {}) {
  auto require = [](bool value, const char *message) {
    if (!value) throw std::runtime_error(message);
  };
  auto node = [&](const std::string &name) -> timeless::Node & {
    auto result = runtime.find(name);
    if (!result) throw std::runtime_error("Missing shared node: " + name);
    return *result;
  };
  auto click = [&](const std::string &name) {
    std::cout << "shadcn: " << name << std::endl;
    activate(node(name).id);
    update();
  };
  update();
  if (snapshot) snapshot("general-light");
  require(node("route-path").content() == "/home/general", "Initial shared route");
  require(!node("nav-general-icon").svg.empty(), "Shared SVG icon source");
  require(node("button-default").height == 32, "shadcn button height is CSS-driven");
  require(node("button-default").number("padding-left") == 10, "shadcn button padding");
  require(node("button-default").width > 30, "Button text is measured");
  require(node("application-name").height >= 27, "Unitless line-height is a font-size multiplier");
  click("button-default");
  require(node("count").content() == "1", "Real button updates Model");
  click("button-disabled");
  require(node("count").content() == "1", "Disabled activation is blocked");
  auto background = node("button-default").property("background-color");
  click("theme-toggle");
  if (snapshot) snapshot("general-dark");
  require(node("button-default").property("background-color") != background, "Shared dark theme");
  click("theme-toggle");
  runtime.state(node("button-default").id, "focus-visible", true);
  update();
  require(node("button-default").property("box-shadow") == "0 0 0 3px #a1a1a180", "CSS keyboard focus ring");
  click("nav-data_entry");
  click("form-submit");
  require(node("form-result").content() == "请输入姓名。", "Form validation stays in Model");
  runtime.input(node("form-name").id, "Windows 用户");
  update();
  require(node("form-name").text == "Windows 用户", "Unicode input reaches Model");
  auto file = std::filesystem::temp_directory_path() /
    ("timeless-shared-" + std::to_string(std::chrono::steady_clock::now().time_since_epoch().count()) + ".txt");
  { std::ofstream output(file); output << "Windows file"; }
  try {
    auto path = file.u8string();
    runtime.receive_files(node("form-files").id, {std::string(path.begin(), path.end())});
    update();
    require(node("form-file-value").content().find("timeless-shared-") != std::string::npos, "Native file descriptors reach the shared FileInput");
  } catch (...) { std::filesystem::remove(file); throw; }
  std::filesystem::remove(file);
  click("form-role");
  timeless::Node *option = nullptr;
  std::function<void(timeless::Node &)> find_option = [&](timeless::Node &item) {
    if (item.attributes["data-value"] == "designer") option = &item;
    for (auto &child : item.children) find_option(*child);
  };
  find_option(*runtime.root());
  require(option != nullptr && !option->hidden(), "shadcn Select uses shared popup options");
  activate(option->id);
  update();
  require(node("form-role").content().find("设计师") != std::string::npos, "Shared Select selection");
  click("form-dates-trigger");
  int dates = 0;
  std::vector<std::pair<float, float>> day_positions;
  std::function<void(timeless::Node &)> calendar = [&](timeless::Node &item) {
    if (item.attributes.count("data-date")) {
      ++dates;
      require(item.width > 0 && item.height > 0, "Calendar Grid has real cell dimensions");
      require(item.width < 64 && item.height <= 48, "Calendar days must occupy one of seven columns");
      day_positions.emplace_back(item.x, item.y);
    }
    for (auto &child : item.children) calendar(*child);
  };
  calendar(*runtime.root());
  require(dates >= 56, "Actual shared dual calendar renders");
  require(std::abs(day_positions[0].second - day_positions[6].second) < 1 &&
          day_positions[6].first > day_positions[0].first && day_positions[7].second > day_positions[0].second,
          "Reactive For nodes remain transparent to seven-column calendar layout");
  if (snapshot) snapshot("calendar");
  click("nav-floating");
  click("floating-modal-trigger");
  require(node("floating-modal").open && node("floating-modal").modal, "Modal opens");
  require(node("floating-modal").width > 100 && node("floating-modal").height > 50, "Modal has native layout");
  if (snapshot) snapshot("modal");
  runtime.dismiss(node("floating-modal").id);
  update();
  require(!node("floating-modal").open, "Host dismissal updates Model");
  click("floating-popover-trigger");
  require(node("floating-popover").open && node("floating-popover").anchor != 0, "Popover resolves actual anchor");
  require(node("floating-popover").x >= 0 && node("floating-popover").y >= 0, "Popover stays in viewport");
  if (snapshot) snapshot("popover");
  click("nav-navigation");
  click("components-step-next");
  require(node("components-step-value").content() == "步骤 2 / 3", "Shared Steps behavior");
  click("nav-data_display");
  click("components-progress-increase");
  require(node("components-progress-value").content() == "Ref：70%", "Shared Progress behavior");
  click("nav-table");
  require(node("invoices-body").content().find("INV001") != std::string::npos, "Shared Table rows");
  click("invoices-next");
  require(node("invoices-body").content().find("INV021") != std::string::npos, "Shared pagination");
  if (snapshot) snapshot("table");
  click("nav-scroll");
  require(node("virtual-list").content_height >= 480000, "Virtual list keeps total logical extent");
  require(!node("virtual-list").children.empty() && node("virtual-list").children.size() < 30,
          "Only visible list rows are materialized");
  click("virtual-list-middle");
  update();
  require(node("virtual-list").scroll_y > 200000, "Virtual list scrolls to middle");
  require(node("virtual-list").content().find("5001") != std::string::npos, "Middle list rows render");
  require(node("virtual-list").children.size() < 30, "Offscreen rows are released");
  if (snapshot) snapshot("virtual-list");
  click("virtual-list-count");
  update();
  require(node("virtual-list").scroll_y < 4800, "Shrinking data clamps scroll position");
  click("nav-overview");
  click("nav-layout");
  click("nav-transition");
  click("transition-fade-show");
  std::this_thread::sleep_for(std::chrono::milliseconds(350));
  update();
  require(node("transition-fade-content").animation_opacity > .99f, "Fade enters fully");
  click("transition-fade-hide");
  std::this_thread::sleep_for(std::chrono::milliseconds(350));
  update();
  require(runtime.find("transition-fade-content") == nullptr, "Host animationend unmounts exited content");
  click("transition-sticky-hide");
  std::this_thread::sleep_for(std::chrono::milliseconds(350));
  update();
  require(node("transition-sticky-content").animation_opacity < .01f, "Forwards retains the last opacity");
  click("theme-toggle");
  require(node("transition-sticky-content").animation_opacity < .01f, "Theme changes preserve animation fill");
  click("transition-sticky-restore");
  require(!node("transition-sticky-content").animated, "Removing animation restores base presentation");
  click("nav-general");
  require(node("count").content() == "1", "Page state is retained");
}

#include "runtime.hpp"
#include <fstream>
#include <iostream>
#include <sstream>
#include <stdexcept>

static void require(bool condition, const char *message) {
  if (!condition) throw std::runtime_error(message);
}

int main(int argc, char **argv) {
  try {
    require(argc == 3, "Pass the core and native UMD bundles");
    timeless::Runtime runtime;
    for (int i = 1; i < argc; ++i) {
      std::ifstream file(timeless::file_path(argv[i]), std::ios::binary);
      require(static_cast<bool>(file), "Cannot read UMD bundle");
      std::ostringstream source;
      source << file.rdbuf();
      runtime.evaluate(source.str(), argv[i]);
    }
    runtime.measure = [](const timeless::Node &, float width) { return YGSize{width, 40}; };
    runtime.evaluate(R"(
      var content = Timeless.ref('😀 **bold** [link](https://example.com)');
      var pressed = '';
      var element = Timeless.RichText({ content, format: 'markdown', attributes: { n: 'article' }, onLinkPress: url => pressed = url });
      Timeless.Native.render(element);
    )");
    require(runtime.update(320, 240), "RichText must create a native text leaf");
    auto node = runtime.find("article");
    require(node && node->text == "😀 bold link", "Markdown reaches the host as text");
    bool bold = false, linked = false;
    for (const auto &span : node->text_spans) {
      bold |= span.start == 3 && span.end == 7 && span.style.count("font-weight") && span.style.at("font-weight") == "700";
      linked |= span.href == "https://example.com";
    }
    require(bold && linked, "Formatting and links use UTF-16 offsets");
    runtime.link(node->id, "https://example.com");
    runtime.evaluate("if(pressed !== 'https://example.com') throw Error('Link callback'); content.as('*updated*');");
    runtime.update(320, 240);
    node = runtime.find("article");
    require(node && node->text == "updated", "Reactive changes update host text");
    require(node->text_spans.size() == 1 && node->text_spans[0].style.at("font-style") == "italic", "Updates replace obsolete style ranges");
    std::cout << "RichText QuickJS/native smoke test passed\n";
    return 0;
  } catch (const std::exception &error) {
    std::cerr << error.what() << '\n';
    return 1;
  }
}

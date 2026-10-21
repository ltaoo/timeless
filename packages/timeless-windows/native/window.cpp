#include "runtime.hpp"
#include <windows.h>

#include <algorithm>
#include <cmath>
#include <commctrl.h>
#include <d2d1.h>
#include <dwrite.h>
#include <filesystem>
#include <iostream>
#include <sstream>
#include <initguid.h> // Instantiate the accessibility GUIDs declared by oleacc.h.
#include <oleacc.h>
#include <shellapi.h>
#include <stdexcept>
#include <unordered_set>
#include <windowsx.h>
#include <wrl/client.h>

using Microsoft::WRL::ComPtr;
using timeless::Node;

namespace {
void check(HRESULT result) {
  if (FAILED(result))
    throw std::runtime_error(
        "Windows API failed: " +
        std::to_string(static_cast<unsigned long>(result)));
}
std::wstring wide(const std::string &text) {
  if (text.empty())
    return {};
  int count = MultiByteToWideChar(CP_UTF8, MB_ERR_INVALID_CHARS, text.data(),
                                  static_cast<int>(text.size()), nullptr, 0);
  if (!count)
    throw std::runtime_error("Invalid UTF-8 text");
  std::wstring result(count, L'\0');
  MultiByteToWideChar(CP_UTF8, 0, text.data(), static_cast<int>(text.size()),
                      result.data(), count);
  return result;
}
std::string utf8(const std::wstring &text) {
  int count = WideCharToMultiByte(CP_UTF8, 0, text.data(),
                                  static_cast<int>(text.size()), nullptr, 0,
                                  nullptr, nullptr);
  std::string result(count, '\0');
  WideCharToMultiByte(CP_UTF8, 0, text.data(), static_cast<int>(text.size()),
                      result.data(), count, nullptr, nullptr);
  return result;
}
std::wstring window_text(HWND window) {
  int size = GetWindowTextLengthW(window);
  std::wstring text(static_cast<size_t>(size) + 1, L'\0');
  int copied = GetWindowTextW(window, text.data(), size + 1);
  text.resize(copied);
  return text;
}
D2D1_COLOR_F color(std::string value,
                   D2D1_COLOR_F fallback = D2D1::ColorF(0, 0.f)) {
  if (value == "transparent")
    return D2D1::ColorF(0, 0.f);
  if (value == "white")
    return D2D1::ColorF(0xffffff);
  if (value == "black")
    return D2D1::ColorF(0x000000);
  if (value.empty() || value[0] != '#')
    return fallback;
  value.erase(0, 1);
  if (value.size() == 3 || value.size() == 4) {
    std::string expanded;
    for (char ch : value) {
      expanded += ch;
      expanded += ch;
    }
    value = expanded;
  }
  if (value.size() == 6)
    value += "ff";
  if (value.size() != 8)
    return fallback;
  try {
    auto rgba = std::stoul(value, nullptr, 16);
    return D2D1::ColorF(static_cast<UINT32>(rgba >> 8),
                        static_cast<float>(rgba & 255) / 255.f);
  } catch (const std::exception &) {
    return fallback;
  }
}
D2D1_COLOR_F background(const Node *node) {
  if (!node)
    return D2D1::ColorF(0xffffff);
  auto parent = background(node->parent);
  auto own =
      color(node->property("background-color", node->property("background")));
  return D2D1::ColorF(own.r * own.a + parent.r * (1 - own.a),
                      own.g * own.a + parent.g * (1 - own.a),
                      own.b * own.a + parent.b * (1 - own.a), 1);
}
COLORREF rgb(D2D1_COLOR_F value) {
  return RGB(static_cast<BYTE>(value.r * 255), static_cast<BYTE>(value.g * 255),
             static_cast<BYTE>(value.b * 255));
}
int weight(const Node &node) {
  return node.property("font-weight") == "bold"
             ? 700
             : static_cast<int>(node.number("font-weight", 400));
}

class Window {
  struct Control {
    Window *owner;
    int id;
    HWND window = nullptr;
    HFONT font = nullptr;
    HBRUSH background = nullptr;
    int font_size = 0, font_weight = 0;
    COLORREF background_color = 0;
    std::vector<std::string> option_signature;
    ~Control() {
      if (window && IsWindow(window))
        DestroyWindow(window);
      if (font)
        DeleteObject(font);
      if (background)
        DeleteObject(background);
    }
  };
  timeless::Runtime runtime_;
  HWND window_ = nullptr;
  ComPtr<ID2D1Factory> factory_;
  ComPtr<IDWriteFactory> text_factory_;
  ComPtr<ID2D1DCRenderTarget> target_;
  ComPtr<ID2D1SolidColorBrush> brush_;
  ComPtr<IAccPropServices> accessibility_;
  std::unordered_map<int, std::unique_ptr<Control>> controls_;
  std::unordered_set<int> hovered_;
  std::string bundle_;
  std::filesystem::file_time_type modified_;
  std::filesystem::file_time_type observed_;
  ULONGLONG last_poll_ = 0;
  bool dev_ = false, syncing_ = false, failed_ = false, quiet_ = false;
  float scale_ = 1;

  ComPtr<IDWriteTextLayout> text_layout(const Node &node, float width,
                                        const std::string *label = nullptr) {
    auto text = wide(label ? *label : node.text);
    ComPtr<IDWriteTextFormat> format;
    check(text_factory_->CreateTextFormat(
        L"Segoe UI", nullptr, static_cast<DWRITE_FONT_WEIGHT>(weight(node)),
        DWRITE_FONT_STYLE_NORMAL, DWRITE_FONT_STRETCH_NORMAL,
        node.number("font-size", 14), L"", &format));
    auto align = node.property("text-align");
    format->SetTextAlignment(align == "center" ? DWRITE_TEXT_ALIGNMENT_CENTER
                             : align == "right"
                                 ? DWRITE_TEXT_ALIGNMENT_TRAILING
                                 : DWRITE_TEXT_ALIGNMENT_LEADING);
    ComPtr<IDWriteTextLayout> layout;
    check(text_factory_->CreateTextLayout(
        text.c_str(), static_cast<UINT32>(text.size()), format.Get(),
        std::max(0.01f, width), 1000000, &layout));
    if (!label) for (const auto &span : node.text_spans) {
      if (span.end > text.size()) continue;
      DWRITE_TEXT_RANGE range{span.start, span.end - span.start};
      auto property = [&](const char *key) {
        auto found = span.style.find(key);
        return found == span.style.end() ? node.property(key) : found->second;
      };
      auto size = property("font-size");
      float font_size = timeless::pixels(size, node.number("font-size", 14));
      if (size.ends_with("em")) font_size *= node.number("font-size", 14);
      check(layout->SetFontSize(std::clamp(font_size, 1.f, 512.f), range));
      auto weight = property("font-weight");
      check(layout->SetFontWeight(static_cast<DWRITE_FONT_WEIGHT>(weight == "bold" ? 700 : std::clamp(static_cast<int>(timeless::pixels(weight, 400)), 1, 999)), range));
      check(layout->SetFontStyle(property("font-style") == "italic" ? DWRITE_FONT_STYLE_ITALIC : DWRITE_FONT_STYLE_NORMAL, range));
      auto family = property("font-family");
      if (!family.empty()) check(layout->SetFontFamilyName(wide(family == "monospace" ? "Consolas" : family).c_str(), range));
      auto decoration = property("text-decoration");
      check(layout->SetUnderline(decoration.find("underline") != std::string::npos, range));
      check(layout->SetStrikethrough(decoration.find("line-through") != std::string::npos, range));
    }
    return layout;
  }

  void resources(HDC dc, const RECT &rectangle) {
    if (!target_) {
      auto properties = D2D1::RenderTargetProperties(
          D2D1_RENDER_TARGET_TYPE_DEFAULT,
          D2D1::PixelFormat(DXGI_FORMAT_B8G8R8A8_UNORM,
                            D2D1_ALPHA_MODE_IGNORE));
      check(
          factory_->CreateDCRenderTarget(&properties, target_.GetAddressOf()));
      check(target_->CreateSolidColorBrush(D2D1::ColorF(0), &brush_));
    }
    target_->SetDpi(96 * scale_, 96 * scale_);
    check(target_->BindDC(dc, &rectangle));
  }

  void draw_shadows(const Node &node) {
    std::istringstream shadows(node.property("box-shadow"));
    std::string item;
    std::vector<std::string> items;
    while (std::getline(shadows, item, ',')) items.push_back(item);
    for (auto entry = items.rbegin(); entry != items.rend(); ++entry) {
      std::istringstream values(*entry);
      std::string x, y, blur, spread, tint;
      if (!(values >> x >> y >> blur >> spread >> tint)) continue;
      auto shade = color(tint);
      if (shade.a <= 0) continue;
      float dx, dy, radius, expansion;
      try { dx = std::stof(x); dy = std::stof(y); radius = std::max(0.f, std::stof(blur)) / 2; expansion = std::stof(spread); }
      catch (const std::exception &) { continue; }
      auto box = D2D1::RectF(node.x, node.y, node.x + node.width, node.y + node.height);
      float corner = std::min(node.number("border-radius"), std::min(node.width, node.height) / 2);
      ComPtr<ID2D1RoundedRectangleGeometry> inside;
      check(factory_->CreateRoundedRectangleGeometry(D2D1::RoundedRect(box, corner, corner), &inside));
      int samples = radius > 0 ? std::max(1, static_cast<int>(std::ceil(radius * 3 * scale_))) : 0;
      float total = 0, accumulated = 0;
      for (int i = -samples; i <= samples; ++i) total += samples ? std::exp(-.5f * i * i / (radius * radius * scale_ * scale_)) : 1;
      for (int i = samples; i >= -samples; --i) {
        float weight = (samples ? std::exp(-.5f * i * i / (radius * radius * scale_ * scale_)) : 1) / total;
        float extent = expansion + i / scale_;
        auto outer_box = D2D1::RectF(box.left + dx - extent, box.top + dy - extent, box.right + dx + extent, box.bottom + dy + extent);
        if (outer_box.right <= outer_box.left || outer_box.bottom <= outer_box.top) continue;
        float outer_corner = std::clamp(corner + extent, 0.f, std::min(outer_box.right - outer_box.left, outer_box.bottom - outer_box.top) / 2);
        ComPtr<ID2D1RoundedRectangleGeometry> outside;
        ComPtr<ID2D1PathGeometry> ring;
        ComPtr<ID2D1GeometrySink> sink;
        check(factory_->CreateRoundedRectangleGeometry(D2D1::RoundedRect(outer_box, outer_corner, outer_corner), &outside));
        check(factory_->CreatePathGeometry(&ring));
        check(ring->Open(&sink));
        check(outside->CombineWithGeometry(inside.Get(), D2D1_COMBINE_MODE_EXCLUDE, nullptr, sink.Get()));
        check(sink->Close());
        auto sample_color = shade;
        sample_color.a = std::min(1.f, shade.a * weight / std::max(.0001f, 1 - shade.a * accumulated));
        accumulated += weight;
        brush_->SetColor(sample_color);
        target_->FillGeometry(ring.Get(), brush_.Get());
      }
    }
  }

  void draw_node(const Node &node, bool child_control) {
    if (node.hidden()) return;
    if (!child_control && node.button()) { draw_shadows(node); return; }
    if (
        (!child_control &&
         (node.type == "text" || node.toggle() ||
          node.type == "select" || node.type == "scroll-view")))
      return;
    draw_shadows(node);
    float opacity = std::clamp(node.number("opacity", 1), 0.f, 1.f);
    if (opacity < 1)
      target_->PushLayer(
          D2D1::LayerParameters(D2D1::InfiniteRect(), nullptr,
                                D2D1_ANTIALIAS_MODE_PER_PRIMITIVE,
                                D2D1::IdentityMatrix(), opacity),
          nullptr);
    auto rect =
        D2D1::RectF(node.x, node.y, node.x + node.width, node.y + node.height);
    float radius = node.number("border-radius");
    auto fill =
        color(node.property("background-color", node.property("background")));
    if (fill.a > 0) {
      brush_->SetColor(fill);
      target_->FillRoundedRectangle(D2D1::RoundedRect(rect, radius, radius),
                                    brush_.Get());
    }
    float border = node.number("border-width");
    if (border > 0) {
      brush_->SetColor(color(node.property("border-color"), D2D1::ColorF(0)));
      float half = border / 2;
      auto inside = D2D1::RectF(rect.left + half, rect.top + half,
                                rect.right - half, rect.bottom - half);
      target_->DrawRoundedRectangle(
          D2D1::RoundedRect(inside, std::max(0.f, radius - half),
                            std::max(0.f, radius - half)),
          brush_.Get(), border);
    }
    if (node.type == "text") {
      auto layout = text_layout(node, node.width);
      const auto text_length = wide(node.text).size();
      for (const auto &span : node.text_spans) {
        if (span.end > text_length) continue;
        DWRITE_TEXT_RANGE range{span.start, span.end - span.start};
        auto foreground = span.style.find("color");
        if (foreground != span.style.end()) {
          ComPtr<ID2D1SolidColorBrush> ink;
          check(target_->CreateSolidColorBrush(color(foreground->second, D2D1::ColorF(0x202938)), &ink));
          check(layout->SetDrawingEffect(ink.Get(), range));
        }
        auto background = span.style.find("background-color");
        if (background != span.style.end()) {
          UINT32 count = 0;
          layout->HitTestTextRange(range.startPosition, range.length, node.x, node.y, nullptr, 0, &count);
          std::vector<DWRITE_HIT_TEST_METRICS> boxes(count);
          if (count) {
            check(layout->HitTestTextRange(range.startPosition, range.length, node.x, node.y, boxes.data(), count, &count));
            brush_->SetColor(color(background->second));
            for (const auto &box : boxes) target_->FillRectangle(D2D1::RectF(box.left, box.top, box.left + box.width, box.top + box.height), brush_.Get());
          }
        }
      }
      brush_->SetColor(color(node.property("color"), D2D1::ColorF(0x202938)));
      target_->DrawTextLayout(D2D1::Point2F(node.x, node.y), layout.Get(),
                              brush_.Get());
    }
    if (node.toggle()) {
      brush_->SetColor(color(node.property("color"), D2D1::ColorF(0x304ffe)));
      float cx = node.x + node.width / 2, cy = node.y + node.height / 2;
      float radius = std::max(1.f, std::min(node.width, node.height) / 2 - 3);
      if (node.type == "radio") {
        target_->DrawEllipse(
            D2D1::Ellipse(D2D1::Point2F(cx, cy), radius, radius), brush_.Get(),
            1.5f);
        if (node.checked)
          target_->FillEllipse(D2D1::Ellipse(D2D1::Point2F(cx, cy),
                                             radius * .55f, radius * .55f),
                               brush_.Get());
      } else {
        auto box = D2D1::RoundedRect(
            D2D1::RectF(cx - radius, cy - radius, cx + radius, cy + radius), 3,
            3);
        target_->DrawRoundedRectangle(box, brush_.Get(), 1.5f);
        if (node.indeterminate)
          target_->DrawLine(D2D1::Point2F(cx - radius * .5f, cy),
                            D2D1::Point2F(cx + radius * .5f, cy), brush_.Get(),
                            2);
        else if (node.checked) {
          target_->DrawLine(D2D1::Point2F(cx - radius * .6f, cy),
                            D2D1::Point2F(cx - radius * .1f, cy + radius * .5f),
                            brush_.Get(), 2);
          target_->DrawLine(D2D1::Point2F(cx - radius * .1f, cy + radius * .5f),
                            D2D1::Point2F(cx + radius * .6f, cy - radius * .5f),
                            brush_.Get(), 2);
        }
      }
    }
    if (node.type == "select") {
      auto label = node.placeholder;
      for (const auto &option : node.options)
        if (option.value == node.text) {
          label = option.label;
          break;
        }
      brush_->SetColor(color(node.property("color"), D2D1::ColorF(0x202938)));
      auto layout = text_layout(node, std::max(1.f, node.width - 32), &label);
      DWRITE_TEXT_METRICS metrics{};
      check(layout->GetMetrics(&metrics));
      target_->DrawTextLayout(
          D2D1::Point2F(node.x + 8,
                        node.y + (node.height - metrics.height) / 2),
          layout.Get(), brush_.Get());
      float x = node.x + node.width - 15, y = node.y + node.height / 2;
      target_->DrawLine(D2D1::Point2F(x - 4, y - 2), D2D1::Point2F(x, y + 2),
                        brush_.Get(), 1.5f);
      target_->DrawLine(D2D1::Point2F(x, y + 2), D2D1::Point2F(x + 4, y - 2),
                        brush_.Get(), 1.5f);
    }
    if (!node.input() && node.type != "select")
      for (const auto &child : node.children)
        draw_node(*child, child_control && node.type != "scroll-view");
    if (opacity < 1)
      target_->PopLayer();
  }

  void paint(HDC dc, const RECT &rectangle, Node *control = nullptr) {
    resources(dc, rectangle);
    target_->BeginDraw();
    target_->SetTransform(D2D1::IdentityMatrix());
    target_->Clear(control ? background(control->parent)
                           : D2D1::ColorF(0xffffff));
    if (control)
      target_->SetTransform(
          D2D1::Matrix3x2F::Translation(-control->x, -control->y));
    if (auto root = control ? control : runtime_.root())
      draw_node(*root, control != nullptr);
    auto result = target_->EndDraw();
    if (result == D2DERR_RECREATE_TARGET) {
      brush_.Reset();
      target_.Reset();
      InvalidateRect(window_, nullptr, FALSE);
    } else
      check(result);
  }

  void collect(Node &node, std::unordered_set<int> &live,
               std::unordered_map<HWND, HWND> &previous, HWND parent,
               const Node *viewport = nullptr, bool inside_button = false) {
    bool static_text = node.type == "text" && !inside_button;
    bool scroll = node.type == "scroll-view", select = node.type == "select";
    if (node.button() || node.input() || node.toggle() || scroll || select ||
        static_text) {
      live.insert(node.id);
      auto &entry = controls_[node.id];
      if (!entry) {
        entry = std::make_unique<Control>();
        entry->owner = this;
        entry->id = node.id;
        DWORD style = WS_CHILD | WS_CLIPSIBLINGS |
                      (static_text ? SS_OWNERDRAW | SS_NOTIFY : WS_TABSTOP);
        if (static_text && !node.text_spans.empty()) style |= WS_TABSTOP;
        if (scroll)
          style |= WS_CLIPCHILDREN | SS_NOTIFY;
        else if (select)
          style |= CBS_DROPDOWNLIST | CBS_OWNERDRAWFIXED | CBS_HASSTRINGS |
                   WS_VSCROLL;
        else if (node.toggle())
          style |= node.type == "radio" ? BS_RADIOBUTTON : BS_3STATE;
        else if (!static_text)
          style |= node.button() ? BS_OWNERDRAW
                                 : (node.type == "textarea"
                                        ? ES_MULTILINE | ES_AUTOVSCROLL |
                                              ES_WANTRETURN | WS_VSCROLL
                                        : ES_AUTOHSCROLL);
        entry->window = CreateWindowExW(
            scroll ? WS_EX_CONTROLPARENT : 0,
            (static_text || scroll)            ? L"STATIC"
            : select                           ? L"COMBOBOX"
            : (node.button() || node.toggle()) ? L"BUTTON"
                                               : L"EDIT",
            L"", style, 0, 0, 1, 1, parent,
            reinterpret_cast<HMENU>(static_cast<INT_PTR>(node.id)),
            GetModuleHandleW(nullptr), nullptr);
        if (!entry->window)
          throw std::runtime_error("Cannot create Windows control");
        if (!SetWindowSubclass(entry->window, control_proc, 1,
                               reinterpret_cast<DWORD_PTR>(entry.get())))
          throw std::runtime_error("Cannot subclass Windows control");
      }
      auto &control = *entry;
      if (GetParent(control.window) != parent)
        SetParent(control.window, parent);
      auto label = node.attributes.count("aria-label")
                       ? node.attributes.at("aria-label")
                       : node.content();
      if (accessibility_)
        accessibility_->SetHwndPropStr(control.window, OBJID_CLIENT,
                                       CHILDID_SELF, PROPID_ACC_NAME,
                                       wide(label).c_str());
      EnableWindow(control.window, !node.disabled);
      ShowWindow(control.window, node.hidden() ? SW_HIDE : SW_SHOWNA);
      auto value =
          wide(node.button() || static_text ? node.content() : node.text);
      if (!select && !scroll && window_text(control.window) != value)
        SetWindowTextW(control.window, value.c_str());
      // shortcut: EDIT paints its own text; replace it when exact CSS text
      // effects are required.
      if (node.input()) {
        SendMessageW(control.window, EM_SETCUEBANNER, TRUE,
                     reinterpret_cast<LPARAM>(wide(node.placeholder).c_str()));
        SendMessageW(control.window, EM_SETREADONLY,
                     node.attributes.count("readonly") != 0, 0);
        SendMessageW(control.window, EM_SETPASSWORDCHAR,
                     node.attributes["type"] == "password" ? 0x2022 : 0, 0);
      }
      if (node.toggle())
        SendMessageW(control.window, BM_SETCHECK,
                     node.indeterminate ? BST_INDETERMINATE
                     : node.checked     ? BST_CHECKED
                                        : BST_UNCHECKED,
                     0);
      if (select) {
        std::vector<std::string> signature{node.placeholder};
        for (const auto &option : node.options) {
          signature.push_back(option.value);
          signature.push_back(option.label);
          signature.push_back(option.disabled ? "disabled" : "enabled");
        }
        if (signature != control.option_signature) {
          SendMessageW(control.window, CB_RESETCONTENT, 0, 0);
          SendMessageW(
              control.window, CB_ADDSTRING, 0,
              reinterpret_cast<LPARAM>(wide(node.placeholder).c_str()));
          for (const auto &option : node.options)
            SendMessageW(control.window, CB_ADDSTRING, 0,
                         reinterpret_cast<LPARAM>(wide(option.label).c_str()));
          COMBOBOXINFO combo{sizeof(combo)};
          if (GetComboBoxInfo(control.window, &combo) && accessibility_) {
            for (size_t i = 0; i < node.options.size(); ++i) {
              MSAAPROPID property = PROPID_ACC_STATE;
              if (node.options[i].disabled) {
                VARIANT state{};
                state.vt = VT_I4;
                state.lVal = STATE_SYSTEM_UNAVAILABLE;
                accessibility_->SetHwndProp(combo.hwndList, OBJID_CLIENT,
                                            static_cast<DWORD>(i + 2), property,
                                            state);
              } else
                accessibility_->ClearHwndProps(combo.hwndList, OBJID_CLIENT,
                                               static_cast<DWORD>(i + 2),
                                               &property, 1);
            }
          }
          control.option_signature = std::move(signature);
        }
        int selected = 0;
        for (size_t i = 0; i < node.options.size(); ++i)
          if (node.options[i].value == node.text) {
            selected = static_cast<int>(i) + 1;
            break;
          }
        SendMessageW(control.window, CB_SETCURSEL, selected, 0);
        SendMessageW(control.window, CB_SETITEMHEIGHT, static_cast<WPARAM>(-1),
                     std::max(1, static_cast<int>(node.height * scale_) - 6));
        SendMessageW(control.window, CB_SETITEMHEIGHT, 0,
                     std::max(1, static_cast<int>(28 * scale_)));
      }
      if (scroll) {
        for (int axis : {SB_HORZ, SB_VERT}) {
          bool shown = axis == SB_HORZ ? node.horizontal_bar : node.vertical_bar;
          if (!shown) { ShowScrollBar(control.window, axis, FALSE); continue; }
          SCROLLINFO info{sizeof(info), SIF_RANGE | SIF_PAGE | SIF_POS | SIF_DISABLENOSCROLL};
          info.nMax = std::max(0, static_cast<int>(std::ceil(
                                      axis == SB_HORZ ? node.content_width
                                                      : node.content_height)) -
                                      1);
          info.nPage = static_cast<UINT>(std::max(
              0.f, axis == SB_HORZ ? node.client_width : node.client_height));
          info.nPos =
              static_cast<int>(axis == SB_HORZ ? node.scroll_x : node.scroll_y);
          SetScrollInfo(control.window, axis, &info, TRUE);
          ShowScrollBar(control.window, axis, TRUE);
        }
      }
      int font_size = std::max(1, static_cast<int>(std::round(
                                      node.number("font-size", 14) * scale_)));
      int font_weight = weight(node);
      if (font_size != control.font_size ||
          font_weight != control.font_weight) {
        HFONT font = CreateFontW(-font_size, 0, 0, 0, font_weight, FALSE, FALSE,
                                 FALSE, DEFAULT_CHARSET, OUT_DEFAULT_PRECIS,
                                 CLIP_DEFAULT_PRECIS, CLEARTYPE_QUALITY,
                                 DEFAULT_PITCH, L"Segoe UI");
        if (!font)
          throw std::runtime_error("Cannot create Windows control font");
        SendMessageW(control.window, WM_SETFONT, reinterpret_cast<WPARAM>(font),
                     TRUE);
        if (control.font)
          DeleteObject(control.font);
        control.font = font;
        control.font_size = font_size;
        control.font_weight = font_weight;
      }
      auto bg = rgb(background(&node));
      if (!control.background || control.background_color != bg) {
        if (control.background)
          DeleteObject(control.background);
        control.background = CreateSolidBrush(bg);
        control.background_color = bg;
      }
      float x = node.x - (viewport ? viewport->x : 0),
            y = node.y - (viewport ? viewport->y : 0), width = node.width,
            height = node.height;
      if (select)
        height += 28 * std::min<size_t>(8, node.options.size() + 1);
      if (node.input()) {
        float inset = std::max(node.number("border-width") + 3,
                               node.number("padding-left"));
        x += inset;
        width = std::max(1.f, width - inset -
                                  std::max(node.number("border-width") + 3,
                                           node.number("padding-right")));
        if (node.type != "textarea") {
          float line = std::min(height, node.number("font-size", 14) * 1.5f);
          y += (height - line) / 2;
          height = line;
        }
      }
      // Keep tree order within each viewport for clipping and keyboard
      // traversal.
      SetWindowPos(control.window,
                   previous[parent] ? previous[parent] : HWND_TOP,
                   static_cast<int>(std::round(x * scale_)),
                   static_cast<int>(std::round(y * scale_)),
                   std::max(1, static_cast<int>(std::round(width * scale_))),
                   std::max(1, static_cast<int>(std::round(height * scale_))),
                   SWP_NOACTIVATE);
      previous[parent] = control.window;
      InvalidateRect(control.window, nullptr, FALSE);
    }
    if (select)
      return;
    if (scroll) {
      parent = controls_.at(node.id)->window;
      viewport = &node;
    }
    for (auto &child : node.children)
      collect(*child, live, previous, parent, viewport,
              inside_button || node.button());
  }

  void hover(Node *node) {
    std::unordered_set<int> next;
    for (auto current = node; current; current = current->parent)
      next.insert(current->id);
    for (int id : hovered_)
      if (!next.count(id))
        runtime_.state(id, "hover", false);
    for (int id : next)
      if (!hovered_.count(id))
        runtime_.state(id, "hover", true);
    hovered_ = std::move(next);
  }

  Node *hit(Node *node, float x, float y) {
    if (!node || node->hidden())
      return nullptr;
    if (node->type == "scroll-view" &&
        (x < node->x || y < node->y || x >= node->x + node->client_width ||
         y >= node->y + node->client_height))
      return nullptr;
    for (auto it = node->children.rbegin(); it != node->children.rend(); ++it)
      if (auto child = hit(it->get(), x, y))
        return child;
    return x >= node->x && y >= node->y && x < node->x + node->width &&
                   y < node->y + node->height
               ? node
               : nullptr;
  }

  void press_link(const Node &node, float x, float y) {
    if (node.disabled || node.text_spans.empty()) return;
    auto layout = text_layout(node, node.width);
    BOOL trailing = FALSE, inside = FALSE;
    DWRITE_HIT_TEST_METRICS position{};
    check(layout->HitTestPoint(x, y, &trailing, &inside, &position));
    if (inside) for (const auto &span : node.text_spans) {
      if (!span.href.empty() && position.textPosition >= span.start && position.textPosition < span.end) {
        runtime_.link(node.id, span.href);
        break;
      }
    }
  }

  bool wheel(Node *node, int delta, bool horizontal) {
    UINT lines = 3;
    SystemParametersInfoW(SPI_GETWHEELSCROLLLINES, 0, &lines, 0);
    for (; node; node = node->parent) {
      if (node->type != "scroll-view" ||
          (horizontal ? node->horizontal : node->vertical) == "hidden")
        continue;
      float distance =
          lines == WHEEL_PAGESCROLL
              ? (horizontal ? node->client_width : node->client_height)
              : 20.f * lines;
      float amount = delta / static_cast<float>(WHEEL_DELTA) * distance;
      if (runtime_.scroll(node->id, node->scroll_x + (horizontal ? amount : 0),
                          node->scroll_y - (horizontal ? 0 : amount))) {
        refresh();
        return true;
      }
    }
    return false;
  }

  void scroll_bar(Node &node, int axis, int command, HWND window) {
    if ((axis == SB_HORZ ? node.horizontal : node.vertical) == "hidden")
      return;
    SCROLLINFO info{sizeof(info), SIF_ALL};
    GetScrollInfo(window, axis, &info);
    float position = axis == SB_HORZ ? node.scroll_x : node.scroll_y;
    switch (command) {
    case SB_LINEUP:
      position -= 20;
      break;
    case SB_LINEDOWN:
      position += 20;
      break;
    case SB_PAGEUP:
      position -= info.nPage;
      break;
    case SB_PAGEDOWN:
      position += info.nPage;
      break;
    case SB_THUMBPOSITION:
    case SB_THUMBTRACK:
      position = static_cast<float>(info.nTrackPos);
      break;
    case SB_TOP:
      position = 0;
      break;
    case SB_BOTTOM:
      position = static_cast<float>(info.nMax);
      break;
    default:
      return;
    }
    runtime_.scroll(node.id, axis == SB_HORZ ? position : node.scroll_x,
                    axis == SB_VERT ? position : node.scroll_y);
    refresh();
  }

  void failure(const std::exception &error) {
    failed_ = true;
    std::cerr << error.what() << '\n';
    if (!quiet_)
      MessageBoxW(window_, wide(error.what()).c_str(),
                  L"Timeless Windows error", MB_OK | MB_ICONERROR);
    PostQuitMessage(1);
  }

  static LRESULT CALLBACK control_proc(HWND window, UINT message, WPARAM wparam,
                                       LPARAM lparam, UINT_PTR,
                                       DWORD_PTR data) {
    auto control = reinterpret_cast<Control *>(data);
    auto self = control->owner;
    try {
      auto node = self->runtime_.find(control->id);
      if (node && node->type == "text" && !node->text_spans.empty()) {
        if (message == WM_LBUTTONUP) {
          self->press_link(*node, GET_X_LPARAM(lparam) / self->scale_, GET_Y_LPARAM(lparam) / self->scale_);
          return 0;
        }
        if (message == WM_KEYDOWN && wparam == VK_RETURN) {
          for (const auto &span : node->text_spans) if (!span.href.empty()) {
            self->runtime_.link(node->id, span.href);
            break;
          }
          return 0;
        }
      }
      if (node && node->type == "scroll-view" &&
          (message == WM_COMMAND || message == WM_DRAWITEM ||
           message == WM_MEASUREITEM || message == WM_CTLCOLOREDIT ||
           message == WM_CTLCOLORSTATIC))
        return self->message(message, wparam, lparam);
      bool custom = node && (node->toggle() || node->type == "select" ||
                             node->type == "scroll-view");
      if (custom && message == WM_ERASEBKGND)
        return 1;
      if (custom && message == WM_PAINT) {
        PAINTSTRUCT info{};
        HDC dc = BeginPaint(window, &info);
        RECT rectangle;
        GetClientRect(window, &rectangle);
        try {
          if (rectangle.right > 0 && rectangle.bottom > 0)
            self->paint(dc, rectangle, node);
          if (GetFocus() == window &&
              !(SendMessageW(window, WM_QUERYUISTATE, 0, 0) & UISF_HIDEFOCUS)) {
            InflateRect(&rectangle, -2, -2);
            DrawFocusRect(dc, &rectangle);
          }
        } catch (...) {
          EndPaint(window, &info);
          throw;
        }
        EndPaint(window, &info);
        return 0;
      }
      if (node && message == WM_GETDLGCODE &&
          (node->type == "scroll-view" || node->type == "radio"))
        return DLGC_WANTARROWS;
      if (!self->syncing_ && !self->failed_) {
        if (message == WM_KEYDOWN || message == WM_KEYUP) {
          if (message == WM_KEYDOWN) self->runtime_.state(control->id, "focus-visible", true);
          auto key = wparam == VK_RETURN   ? "Enter"
                     : wparam == VK_SPACE  ? " "
                     : wparam == VK_TAB    ? "Tab"
                     : wparam == VK_UP     ? "ArrowUp"
                     : wparam == VK_DOWN   ? "ArrowDown"
                     : wparam == VK_LEFT   ? "ArrowLeft"
                     : wparam == VK_RIGHT  ? "ArrowRight"
                     : wparam == VK_PRIOR  ? "PageUp"
                     : wparam == VK_NEXT   ? "PageDown"
                     : wparam == VK_HOME   ? "Home"
                     : wparam == VK_END    ? "End"
                     : wparam == VK_ESCAPE ? "Escape"
                                           : "";
          if (self->runtime_.event(control->id,
                                   message == WM_KEYDOWN ? "keydown" : "keyup",
                                   key)) {
            self->refresh();
            return 0;
          }
        }
        if (message == WM_MOUSEMOVE) {
          TRACKMOUSEEVENT track{sizeof(track), TME_LEAVE, window, 0};
          TrackMouseEvent(&track);
          POINT point{GET_X_LPARAM(lparam), GET_Y_LPARAM(lparam)};
          MapWindowPoints(window, self->window_, &point, 1);
          self->hover(self->hit(self->runtime_.root(), point.x / self->scale_,
                                point.y / self->scale_));
        }
        if (message == WM_MOUSELEAVE)
          self->hover(nullptr);
        if (message == WM_LBUTTONDOWN ||
            (message == WM_KEYDOWN && wparam == VK_SPACE))
          self->runtime_.state(control->id, "active", true);
        if (message == WM_LBUTTONDOWN) self->runtime_.state(control->id, "focus-visible", false);
        if (message == WM_LBUTTONUP || message == WM_CAPTURECHANGED ||
            (message == WM_KEYUP && wparam == VK_SPACE))
          self->runtime_.state(control->id, "active", false);
        if (node && node->type == "select" && node->readonly &&
            (message == WM_LBUTTONDOWN || message == WM_LBUTTONDBLCLK ||
             message == WM_KEYDOWN || message == WM_MOUSEWHEEL))
          return 0;
        if (message == WM_SETFOCUS || message == WM_KILLFOCUS) {
          self->runtime_.state(control->id, "focus", message == WM_SETFOCUS);
          self->runtime_.state(control->id, "focus-visible", message == WM_SETFOCUS && !(GetKeyState(VK_LBUTTON) & 0x8000));
          self->runtime_.event(control->id,
                               message == WM_SETFOCUS ? "focus" : "blur");
          if (message == WM_SETFOCUS) {
            std::vector<int> ancestors;
            for (auto current = self->runtime_.find(control->id); current;
                 current = current->parent)
              if (current->type == "scroll-view" && current->id != control->id)
                ancestors.push_back(current->id);
            for (int id : ancestors) {
              auto viewport = self->runtime_.find(id);
              auto focused = self->runtime_.find(control->id);
              if (!viewport || !focused)
                continue;
              float dx =
                  focused->x < viewport->x
                      ? focused->x - viewport->x
                      : std::max(0.f, focused->x + focused->width -
                                          viewport->x - viewport->client_width);
              float dy = focused->y < viewport->y
                             ? focused->y - viewport->y
                             : std::max(0.f, focused->y + focused->height -
                                                 viewport->y -
                                                 viewport->client_height);
              if (self->runtime_.scroll(id, viewport->scroll_x + dx,
                                        viewport->scroll_y + dy))
                self->refresh();
            }
          }
        }
        node = self->runtime_.find(control->id);
        if (node && (message == WM_MOUSEWHEEL || message == WM_MOUSEHWHEEL)) {
          bool horizontal = message == WM_MOUSEHWHEEL ||
                            (GET_KEYSTATE_WPARAM(wparam) & MK_SHIFT);
          int delta = GET_WHEEL_DELTA_WPARAM(wparam);
          if (message == WM_MOUSEWHEEL && horizontal)
            delta = -delta;
          self->wheel(node, delta, horizontal);
          return 0;
        }
        if (node && node->type == "select" && message == WM_KEYDOWN &&
            !(GetKeyState(VK_MENU) & 0x8000) &&
            (wparam == VK_UP || wparam == VK_DOWN || wparam == VK_HOME ||
             wparam == VK_END)) {
          int selected =
              static_cast<int>(SendMessageW(window, CB_GETCURSEL, 0, 0));
          int direction = wparam == VK_UP || wparam == VK_END ? -1 : 1;
          int next = wparam == VK_HOME  ? 0
                     : wparam == VK_END ? static_cast<int>(node->options.size())
                                        : selected + direction;
          while (next >= 0 && next <= static_cast<int>(node->options.size())) {
            if (next == 0 || !node->options[next - 1].disabled) {
              SendMessageW(window, CB_SETCURSEL, next, 0);
              self->runtime_.select(node->id,
                                    next ? node->options[next - 1].value : "");
              self->refresh();
              break;
            }
            next += direction;
          }
          return 0;
        }
        if (node && node->type == "scroll-view") {
          if (message == WM_VSCROLL || message == WM_HSCROLL) {
            self->scroll_bar(*node, message == WM_HSCROLL ? SB_HORZ : SB_VERT,
                             LOWORD(wparam), window);
            return 0;
          }
          if (message == WM_KEYDOWN) {
            int command = wparam == VK_UP || wparam == VK_LEFT ? SB_LINEUP
                          : wparam == VK_DOWN || wparam == VK_RIGHT
                              ? SB_LINEDOWN
                          : wparam == VK_PRIOR ? SB_PAGEUP
                          : wparam == VK_NEXT  ? SB_PAGEDOWN
                          : wparam == VK_HOME  ? SB_TOP
                          : wparam == VK_END   ? SB_BOTTOM
                                               : -1;
            if (command != -1) {
              self->scroll_bar(
                  *node,
                  wparam == VK_LEFT || wparam == VK_RIGHT ? SB_HORZ : SB_VERT,
                  command, window);
              return 0;
            }
          }
        }
        if (node && node->type == "radio" && message == WM_KEYDOWN &&
            (wparam == VK_LEFT || wparam == VK_RIGHT || wparam == VK_UP ||
             wparam == VK_DOWN)) {
          std::vector<int> group;
          std::function<void(Node *)> visit = [&](Node *entry) {
            if (entry->type == "radio" && !entry->disabled &&
                !entry->readonly && !entry->hidden() &&
                entry->attributes.count("name") &&
                node->attributes.count("name") &&
                entry->attributes.at("name") == node->attributes.at("name"))
              group.push_back(entry->id);
            for (const auto &child : entry->children)
              visit(child.get());
          };
          visit(self->runtime_.root());
          auto it = std::find(group.begin(), group.end(), node->id);
          if (it != group.end() && !group.empty()) {
            int index = static_cast<int>(it - group.begin());
            int direction = wparam == VK_LEFT || wparam == VK_UP ? -1 : 1;
            int id =
                group[(index + direction + static_cast<int>(group.size())) %
                      group.size()];
            SetFocus(self->controls_.at(id)->window);
            self->runtime_.toggle(id);
            self->refresh();
            return 0;
          }
        }
        if (message == WM_KEYDOWN && wparam == VK_RETURN && node &&
            node->button()) {
          SendMessageW(window, BM_CLICK, 0, 0);
          return 0;
        }
        self->refresh();
      }
    } catch (const std::exception &error) {
      self->failure(error);
      return 0;
    }
    return DefSubclassProc(window, message, wparam, lparam);
  }

  LRESULT message(UINT message, WPARAM wparam, LPARAM lparam) {
    switch (message) {
    case WM_CREATE:
      SetTimer(window_, 1, 16, nullptr);
      return 0;
    case WM_ERASEBKGND:
      return 1;
    case WM_SIZE:
      refresh();
      return 0;
    case WM_DPICHANGED: {
      auto rectangle = reinterpret_cast<RECT *>(lparam);
      SetWindowPos(window_, nullptr, rectangle->left, rectangle->top,
                   rectangle->right - rectangle->left,
                   rectangle->bottom - rectangle->top,
                   SWP_NOZORDER | SWP_NOACTIVATE);
      refresh();
      return 0;
    }
    case WM_MOUSEMOVE: {
      TRACKMOUSEEVENT track{sizeof(track), TME_LEAVE, window_, 0};
      TrackMouseEvent(&track);
      hover(hit(runtime_.root(), GET_X_LPARAM(lparam) / scale_,
                GET_Y_LPARAM(lparam) / scale_));
      refresh();
      return 0;
    }
    case WM_LBUTTONUP: {
      float x = GET_X_LPARAM(lparam) / scale_, y = GET_Y_LPARAM(lparam) / scale_;
      auto node = hit(runtime_.root(), x, y);
      if (!node || node->disabled || node->text_spans.empty()) break;
      press_link(*node, x - node->x, y - node->y);
      return 0;
    }
    case WM_MOUSEWHEEL:
    case WM_MOUSEHWHEEL: {
      POINT point{GET_X_LPARAM(lparam), GET_Y_LPARAM(lparam)};
      ScreenToClient(window_, &point);
      bool horizontal =
          message == WM_MOUSEHWHEEL || (GET_KEYSTATE_WPARAM(wparam) & MK_SHIFT);
      int delta = GET_WHEEL_DELTA_WPARAM(wparam);
      if (message == WM_MOUSEWHEEL && horizontal)
        delta = -delta;
      wheel(hit(runtime_.root(), point.x / scale_, point.y / scale_), delta,
            horizontal);
      return 0;
    }
    case WM_MOUSELEAVE:
      hover(nullptr);
      refresh();
      return 0;
    case WM_TIMER: {
      if (dev_ && GetTickCount64() - last_poll_ > 300) {
        last_poll_ = GetTickCount64();
        std::error_code error;
        auto changed = std::filesystem::last_write_time(
            timeless::file_path(bundle_), error);
        if (!error && changed != modified_) {
          if (changed != observed_)
            observed_ = changed;
          else {
            runtime_.load(bundle_);
            modified_ = changed;
          }
        }
      }
      refresh();
      return 0;
    }
    case WM_COMMAND: {
      if (syncing_ || !lparam)
        return 0;
      int id = GetDlgCtrlID(reinterpret_cast<HWND>(lparam));
      auto node = runtime_.find(id);
      if (!node)
        return 0;
      if (node->toggle() && HIWORD(wparam) == BN_CLICKED)
        runtime_.toggle(id);
      else if (node->button() && HIWORD(wparam) == BN_CLICKED)
        runtime_.event(id, "click");
      if (node->type == "select" && HIWORD(wparam) == CBN_SELCHANGE) {
        auto selected =
            SendMessageW(reinterpret_cast<HWND>(lparam), CB_GETCURSEL, 0, 0);
        if (selected == 0)
          runtime_.select(id, "");
        else if (selected > 0 &&
                 static_cast<size_t>(selected) <= node->options.size())
          runtime_.select(id, node->options[selected - 1].value);
        runtime_.request_update();
      }
      if (node->input() && HIWORD(wparam) == EN_CHANGE)
        runtime_.input(id, utf8(window_text(reinterpret_cast<HWND>(lparam))));
      refresh();
      return 0;
    }
    case WM_CTLCOLOREDIT:
    case WM_CTLCOLORSTATIC: {
      auto it = controls_.find(GetDlgCtrlID(reinterpret_cast<HWND>(lparam)));
      if (it == controls_.end())
        break;
      auto node = runtime_.find(it->first);
      if (!node)
        break;
      auto dc = reinterpret_cast<HDC>(wparam);
      SetTextColor(dc,
                   rgb(color(node->property("color"), D2D1::ColorF(0x202938))));
      SetBkColor(dc, it->second->background_color);
      return reinterpret_cast<LRESULT>(it->second->background);
    }
    case WM_MEASUREITEM: {
      auto item = reinterpret_cast<MEASUREITEMSTRUCT *>(lparam);
      if (item->CtlType == ODT_COMBOBOX) {
        item->itemHeight = static_cast<UINT>(28 * scale_);
        return TRUE;
      }
      break;
    }
    case WM_DRAWITEM: {
      auto item = reinterpret_cast<DRAWITEMSTRUCT *>(lparam);
      auto node = runtime_.find(static_cast<int>(item->CtlID));
      if (node && node->type == "select") {
        auto index = item->itemID;
        bool option = index > 0 && index <= node->options.size();
        auto label =
            option ? node->options[index - 1].label : node->placeholder;
        bool disabled = option && node->options[index - 1].disabled;
        bool selected = (item->itemState & ODS_SELECTED) && !disabled;
        HBRUSH fill = CreateSolidBrush(selected ? RGB(48, 79, 255)
                                                : rgb(background(node)));
        FillRect(item->hDC, &item->rcItem, fill);
        DeleteObject(fill);
        SetBkMode(item->hDC, TRANSPARENT);
        SetTextColor(item->hDC, disabled ? RGB(130, 130, 130)
                                : selected
                                    ? RGB(255, 255, 255)
                                    : rgb(color(node->property("color"),
                                                D2D1::ColorF(0x202938))));
        auto text = wide(label);
        auto rectangle = item->rcItem;
        rectangle.left += static_cast<int>(8 * scale_);
        auto old_font = SelectObject(item->hDC, controls_.at(node->id)->font);
        DrawTextW(item->hDC, text.c_str(), static_cast<int>(text.size()),
                  &rectangle,
                  DT_SINGLELINE | DT_VCENTER | DT_END_ELLIPSIS | DT_NOPREFIX);
        SelectObject(item->hDC, old_font);
        return TRUE;
      }
      if (node && (node->button() || node->type == "text")) {
        paint(item->hDC, item->rcItem, node);
        return TRUE;
      }
      break;
    }
    case WM_PAINT: {
      PAINTSTRUCT paint_info;
      HDC dc = BeginPaint(window_, &paint_info);
      RECT rectangle;
      GetClientRect(window_, &rectangle);
      try {
        if (rectangle.right > 0 && rectangle.bottom > 0)
          paint(dc, rectangle);
      } catch (...) {
        EndPaint(window_, &paint_info);
        throw;
      }
      EndPaint(window_, &paint_info);
      return 0;
    }
    case WM_DESTROY:
      KillTimer(window_, 1);
      PostQuitMessage(0);
      return 0;
    }
    return DefWindowProcW(window_, message, wparam, lparam);
  }

  static LRESULT CALLBACK window_proc(HWND window, UINT message, WPARAM wparam,
                                      LPARAM lparam) {
    auto self =
        reinterpret_cast<Window *>(GetWindowLongPtrW(window, GWLP_USERDATA));
    if (message == WM_NCCREATE) {
      self = static_cast<Window *>(
          reinterpret_cast<CREATESTRUCTW *>(lparam)->lpCreateParams);
      self->window_ = window;
      SetWindowLongPtrW(window, GWLP_USERDATA,
                        reinterpret_cast<LONG_PTR>(self));
    }
    if (!self)
      return DefWindowProcW(window, message, wparam, lparam);
    try {
      return self->message(message, wparam, lparam);
    } catch (const std::exception &error) {
      self->failure(error);
      return 0;
    }
  }

public:
  Window(const std::string &bundle, bool dev, bool test)
      : bundle_(bundle), dev_(dev), quiet_(test) {
    check(D2D1CreateFactory(
        D2D1_FACTORY_TYPE_SINGLE_THREADED, __uuidof(ID2D1Factory), nullptr,
        reinterpret_cast<void **>(factory_.GetAddressOf())));
    check(DWriteCreateFactory(
        DWRITE_FACTORY_TYPE_SHARED, __uuidof(IDWriteFactory),
        reinterpret_cast<IUnknown **>(text_factory_.GetAddressOf())));
    // Native BUTTON/EDIT retain their built-in accessibility providers; set
    // their semantic names.
    check(CoCreateInstance(
        CLSID_AccPropServices, nullptr, CLSCTX_INPROC_SERVER,
        IID_IAccPropServices,
        reinterpret_cast<void **>(accessibility_.GetAddressOf())));
    runtime_.measure = [this](const Node &node, float width) {
      auto layout = text_layout(node, width);
      DWRITE_TEXT_METRICS metrics{};
      check(layout->GetMetrics(&metrics));
      return YGSize{metrics.widthIncludingTrailingWhitespace, metrics.height};
    };
    WNDCLASSW type{};
    type.lpfnWndProc = window_proc;
    type.hInstance = GetModuleHandleW(nullptr);
    type.lpszClassName = L"TimelessWindowsHost";
    type.hCursor = LoadCursorW(nullptr, IDC_ARROW);
    if (!RegisterClassW(&type) && GetLastError() != ERROR_CLASS_ALREADY_EXISTS)
      throw std::runtime_error("Cannot register window class");
    if (!CreateWindowExW(
            WS_EX_CONTROLPARENT, type.lpszClassName, L"Timeless Windows",
            WS_OVERLAPPEDWINDOW | WS_CLIPCHILDREN, CW_USEDEFAULT, CW_USEDEFAULT,
            860, 680, nullptr, nullptr, type.hInstance, this))
      throw std::runtime_error("Cannot create Timeless window");
    runtime_.load(bundle_);
    modified_ = std::filesystem::last_write_time(timeless::file_path(bundle_));
    observed_ = modified_;
    refresh();
  }
  ~Window() {
    syncing_ = true;
    controls_.clear();
    if (window_ && IsWindow(window_))
      DestroyWindow(window_);
  }
  void refresh() {
    if (syncing_ || failed_ || !window_)
      return;
    runtime_.pump();
    RECT rectangle;
    GetClientRect(window_, &rectangle);
    auto scale = GetDpiForWindow(window_) / 96.f;
    if (scale != scale_)
      runtime_.request_update();
    scale_ = scale;
    runtime_.scrollbar_size =
        GetSystemMetricsForDpi(SM_CXVSCROLL, GetDpiForWindow(window_)) / scale_;
    if (rectangle.right <= 0 || rectangle.bottom <= 0)
      return;
    if (!runtime_.update(rectangle.right / scale_, rectangle.bottom / scale_))
      return;
    syncing_ = true;
    try {
      std::unordered_set<int> live;
      std::unordered_map<HWND, HWND> previous;
      collect(*runtime_.root(), live, previous, window_);
      for (auto it = controls_.begin(); it != controls_.end();) {
        if (!live.count(it->first))
          it = controls_.erase(it);
        else
          ++it;
      }
      InvalidateRect(window_, nullptr, FALSE);
      syncing_ = false;
    } catch (...) {
      syncing_ = false;
      throw;
    }
  }
  int run() {
    ShowWindow(window_, SW_SHOW);
    MSG message{};
    int result;
    while ((result = GetMessageW(&message, nullptr, 0, 0)) > 0) {
      if (message.message == WM_KEYDOWN && message.wParam == VK_RETURN) {
        auto node = runtime_.find(GetDlgCtrlID(message.hwnd));
        if (node && node->button()) {
          DispatchMessageW(&message);
          continue;
        }
      }
      if (!IsDialogMessageW(window_, &message)) {
        TranslateMessage(&message);
        DispatchMessageW(&message);
      }
    }
    if (result < 0)
      throw std::runtime_error("Windows message loop failed");
    return static_cast<int>(message.wParam);
  }
  void test() {
    auto require = [](bool value, const char *text) {
      if (!value)
        throw std::runtime_error(text);
    };
    auto control = [&](const char *name) {
      auto node = runtime_.find(name);
      if (!node || !controls_.count(node->id))
        throw std::runtime_error(std::string("Missing control: ") + name);
      return controls_.at(node->id)->window;
    };
    auto action = control("action");
    require((GetWindowLongPtrW(action, GWL_STYLE) & BS_TYPEMASK) ==
                BS_OWNERDRAW,
            "Action must use Timeless drawing");
    SendMessageW(action, BM_CLICK, 0, 0);
    refresh();
    require(runtime_.find("counter")->content() == "1",
            "Windows button click updates counter");
    SendMessageW(action, WM_MOUSEMOVE, 0, 0);
    refresh();
    require(runtime_.find("action")->property("background-color") == "#2440dc",
            "Windows mouse hover updates CSS");
    SendMessageW(control("disabled"), BM_CLICK, 0, 0);
    refresh();
    require(!IsWindowEnabled(action), "Native button must be disabled");
    SendMessageW(action, BM_CLICK, 0, 0);
    refresh();
    require(runtime_.find("counter")->content() == "1",
            "Disabled button cannot activate");
    SendMessageW(control("disabled"), BM_CLICK, 0, 0);
    refresh();
    SendMessageW(action, WM_KEYDOWN, VK_RETURN, 0);
    refresh();
    require(runtime_.find("counter")->content() == "2",
            "Enter activates native button");
    SetWindowTextW(control("name"), L"Windows");
    refresh();
    require(runtime_.find("greeting")->content() == "Hello, Windows",
            "Native edit sends text to JS");
    MoveWindow(window_, 0, 0, 640, 600, FALSE);
    refresh();
    require(control("action") == action, "Resize must preserve HWND identity");
    require(runtime_.find("counter")->content() == "2",
            "Resize must preserve JS state");
    ComPtr<IAccessible> accessible;
    check(AccessibleObjectFromWindow(
        action, OBJID_CLIENT, IID_IAccessible,
        reinterpret_cast<void **>(accessible.GetAddressOf())));
    VARIANT child{};
    child.vt = VT_I4;
    child.lVal = CHILDID_SELF;
    BSTR name = nullptr;
    check(accessible->get_accName(child, &name));
    std::wstring label(name ? name : L"");
    SysFreeString(name);
    require(label == L"Increment counter",
            "Native accessible name must follow aria-label");
    auto select = control("platform-select");
    require((GetWindowLongPtrW(select, GWL_STYLE) & CBS_DROPDOWNLIST) ==
                CBS_DROPDOWNLIST,
            "Select uses a keyboard accessible native combo");
    SendMessageW(select, CB_SETCURSEL, 2, 0);
    SendMessageW(GetParent(select), WM_COMMAND,
                 MAKEWPARAM(GetDlgCtrlID(select), CBN_SELCHANGE),
                 reinterpret_cast<LPARAM>(select));
    refresh();
    require(runtime_.find("choice-label")->content() == "Selected: macos",
            "Combo selection updates Model");
    SendMessageW(select, CB_SETCURSEL, 3, 0);
    SendMessageW(GetParent(select), WM_COMMAND,
                 MAKEWPARAM(GetDlgCtrlID(select), CBN_SELCHANGE),
                 reinterpret_cast<LPARAM>(select));
    require(SendMessageW(select, CB_GETCURSEL, 0, 0) == 2,
            "Disabled option selection is restored");
    SendMessageW(select, WM_KEYDOWN, VK_DOWN, 0);
    refresh();
    require(runtime_.find("platform-select")->text == "linux",
            "Arrow navigation skips disabled options");
    auto checkbox = control("feature-check");
    require(SendMessageW(checkbox, BM_GETCHECK, 0, 0) == BST_CHECKED,
            "Checkbox reports its native checked state");
    SendMessageW(checkbox, BM_CLICK, 0, 0);
    refresh();
    require(!runtime_.find("feature-check")->checked &&
                SendMessageW(checkbox, BM_GETCHECK, 0, 0) == BST_UNCHECKED,
            "Checkbox click updates Model and accessibility state");
    SendMessageW(control("radio-second"), BM_CLICK, 0, 0);
    refresh();
    require(runtime_.find("radio-second")->checked &&
                !runtime_.find("radio-first")->checked,
            "Radio HWND clicks are exclusive");
    auto viewport = control("list-scroll");
    auto row = control("scroll-item-0");
    require(GetParent(row) == viewport,
            "Scroll content is clipped by a real parent HWND");
    require(GetWindowLongPtrW(viewport, GWL_STYLE) & WS_VSCROLL,
            "Overflow exposes native scrollbar");
    RECT before;
    GetWindowRect(row, &before);
    SendMessageW(viewport, WM_VSCROLL, SB_PAGEDOWN, 0);
    refresh();
    RECT after;
    GetWindowRect(row, &after);
    require(after.top < before.top, "Native scrollbar moves child controls");
    auto position = runtime_.find("list-scroll")->scroll_y;
    SendMessageW(row, WM_MOUSEWHEEL, MAKEWPARAM(0, WHEEL_DELTA), 0);
    refresh();
    require(runtime_.find("list-scroll")->scroll_y < position,
            "Wheel over a child scrolls its viewport");
    SendMessageW(control("scroll-bottom"), BM_CLICK, 0, 0);
    refresh();
    require(runtime_.find("list-scroll")->scroll_y > 500,
            "Programmatic scroll reaches the bottom");
    MoveWindow(window_, 0, 0, 660, 620, FALSE);
    refresh();
    require(control("list-scroll") == viewport &&
                control("scroll-item-0") == row &&
                control("platform-select") == select,
            "Resize preserves scroll, item and select HWNDs");
    HDC dc = GetDC(window_);
    RECT rectangle;
    GetClientRect(window_, &rectangle);
    try {
      paint(dc, rectangle);
    } catch (...) {
      ReleaseDC(window_, dc);
      throw;
    }
    ReleaseDC(window_, dc);
    std::cout << "Windows native controls and Direct2D smoke test passed\n";
  }
};
} // namespace

int WINAPI wWinMain(HINSTANCE, HINSTANCE, PWSTR, int) {
  HRESULT initialized = CoInitializeEx(nullptr, COINIT_APARTMENTTHREADED);
  if (FAILED(initialized))
    return 1;
  int result = 1;
  bool test = false;
  try {
    INITCOMMONCONTROLSEX controls{sizeof(controls), ICC_STANDARD_CLASSES};
    if (!InitCommonControlsEx(&controls))
      throw std::runtime_error("Cannot initialize Windows controls");
    int argc = 0;
    auto argv = CommandLineToArgvW(GetCommandLineW(), &argc);
    if (!argv)
      throw std::runtime_error("Cannot parse command line");
    bool dev = false;
    std::string bundle;
    for (int i = 1; i < argc; ++i) {
      std::wstring argument(argv[i]);
      if (argument == L"--dev")
        dev = true;
      else if (argument == L"--self-test")
        test = true;
      else
        bundle = utf8(argument);
    }
    LocalFree(argv);
    if (bundle.empty()) {
      std::wstring executable(32768, L'\0');
      DWORD count = GetModuleFileNameW(nullptr, executable.data(),
                                       static_cast<DWORD>(executable.size()));
      if (!count || count >= executable.size())
        throw std::runtime_error("Cannot locate executable");
      executable.resize(count);
      bundle =
          utf8((std::filesystem::path(executable).parent_path() / L"app.js")
                   .wstring());
    }
    Window window(bundle, dev, test);
    if (test) {
      window.test();
      result = 0;
    } else
      result = window.run();
  } catch (const std::exception &error) {
    std::cerr << error.what() << '\n';
    if (!test)
      MessageBoxW(nullptr, wide(error.what()).c_str(), L"Timeless Windows",
                  MB_OK | MB_ICONERROR);
  }
  CoUninitialize();
  return result;
}

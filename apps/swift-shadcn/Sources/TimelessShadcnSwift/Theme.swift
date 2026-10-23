import SwiftUI

struct GalleryTheme {
  let dark: Bool
  // Neutral shadcn OKLCH tokens have zero chroma; convert their lightness to sRGB.
  static func neutral(_ lightness: Double) -> Color {
    let linear = pow(lightness, 3)
    let value = linear <= 0.0031308 ? 12.92 * linear : 1.055 * pow(linear, 1 / 2.4) - 0.055
    return Color(.sRGB, red: value, green: value, blue: value, opacity: 1)
  }
  var background: Color { Self.neutral(dark ? 0.145 : 1) }
  var foreground: Color { Self.neutral(dark ? 0.985 : 0.145) }
  var primary: Color { Self.neutral(dark ? 0.922 : 0.205) }
  var primaryForeground: Color { Self.neutral(dark ? 0.205 : 0.985) }
  var muted: Color { Self.neutral(dark ? 0.269 : 0.97) }
  var mutedForeground: Color { Self.neutral(dark ? 0.708 : 0.556) }
  var card: Color { Self.neutral(dark ? 0.205 : 1) }
  var border: Color { dark ? Color.white.opacity(0.1) : Self.neutral(0.922) }
  var input: Color { dark ? Color.white.opacity(0.15) : Self.neutral(0.922) }
  var ring: Color { Self.neutral(dark ? 0.556 : 0.708) }
  var tableHeading: Color {
    dark
      ? Color(red: 161 / 255, green: 161 / 255, blue: 170 / 255)
      : Color(red: 113 / 255, green: 113 / 255, blue: 122 / 255)
  }
  var tableBorder: Color {
    dark
      ? Color(red: 39 / 255, green: 39 / 255, blue: 42 / 255)
      : Color(red: 228 / 255, green: 228 / 255, blue: 231 / 255)
  }
  var destructive: Color {
    dark ? Color(red: 1, green: 0.392, blue: 0.404) : Color(red: 0.906, green: 0, blue: 0.043)
  }
}

enum ButtonVariant: String, CaseIterable {
  case primary = "default"
  case secondary, outline, ghost, destructive, link
  var label: String { rawValue.capitalized }
}

struct GalleryButtonStyle: ButtonStyle {
  var variant: ButtonVariant = .primary
  var circular = false
  @Environment(\.colorScheme) private var scheme
  @Environment(\.isEnabled) private var enabled
  @Environment(\.isFocused) private var focused
  @State private var hovered = false

  func makeBody(configuration: Configuration) -> some View {
    let theme = GalleryTheme(dark: scheme == .dark)
    let shape = RoundedRectangle(cornerRadius: circular ? 100 : 10)
    let highlighted = hovered || configuration.isPressed
    let background: Color = {
      switch variant {
      case .primary: return theme.primary
      case .secondary: return theme.muted
      case .outline: return highlighted ? theme.muted : theme.background
      case .ghost: return highlighted ? theme.muted : .clear
      case .destructive: return theme.destructive.opacity(highlighted ? 0.2 : 0.1)
      case .link: return .clear
      }
    }()
    let foreground: Color =
      variant == .primary
      ? theme.primaryForeground : variant == .destructive ? theme.destructive : theme.foreground
    return configuration.label
      .font(.system(size: 14, weight: .medium))
      .foregroundStyle(foreground)
      .background(background, in: shape)
      .overlay(shape.stroke(variant == .outline ? theme.border : .clear, lineWidth: 1))
      .overlay(shape.stroke(focused ? theme.ring.opacity(0.5) : .clear, lineWidth: 3))
      .contentShape(shape)
      .opacity(enabled ? 1 : 0.5)
      .onHover { hovered = $0 }
  }
}

struct TButton: View {
  let title: String
  var icon: String? = nil
  var variant: ButtonVariant = .primary
  var iconOnly = false
  var circular = false
  var size: CGFloat = 32
  var width: CGFloat? = nil
  var action: () -> Void

  var body: some View {
    Button(action: action) {
      HStack(spacing: 6) {
        if let icon { LucideIcon(name: icon) }
        if !iconOnly { Text(title).underline(variant == .link).lineLimit(1) }
      }
      .padding(.horizontal, iconOnly || width != nil ? 0 : 10)
      .frame(width: iconOnly ? size : width, height: size)
    }
    .buttonStyle(GalleryButtonStyle(variant: variant, circular: circular))
    .focusEffectDisabled()
    .accessibilityLabel(title)
  }
}

@MainActor enum IconAssets {
  private static let resources =
    Bundle.main.url(
      forResource: "TimelessShadcnSwift_TimelessShadcnSwift", withExtension: "bundle"
    ).flatMap { Bundle(url: $0) } ?? Bundle.module
  private static var images: [String: NSImage] = [:]
  static func image(_ name: String) -> NSImage? {
    if let cached = images[name] { return cached }
    guard
      let url = resources.url(forResource: name, withExtension: "svg", subdirectory: "Icons"),
      let source = try? String(contentsOf: url, encoding: .utf8),
      let data = source.replacingOccurrences(of: "currentColor", with: "#000000").data(
        using: .utf8),
      let image = NSImage(data: data), image.isValid
    else { return nil }
    image.isTemplate = true
    images[name] = image
    return image
  }
}

struct LucideIcon: View {
  let name: String
  var size: CGFloat = 16
  var body: some View {
    Group {
      if let image = IconAssets.image(name) {
        Image(nsImage: image).renderingMode(.template).resizable().scaledToFit()
      } else {
        Image(systemName: "questionmark.square").resizable().scaledToFit()
      }
    }
    .frame(width: size, height: size)
    .accessibilityHidden(true)
  }
}

struct TInput: View {
  let title: String
  @Binding var text: String
  var placeholder = ""
  @Environment(\.colorScheme) private var scheme
  @FocusState private var focused: Bool
  var body: some View {
    let theme = GalleryTheme(dark: scheme == .dark)
    TextField(placeholder, text: $text)
      .textFieldStyle(.plain)
      .font(.system(size: 14))
      .padding(.horizontal, 10)
      .frame(height: 32)
      .background(
        scheme == .dark ? theme.input.opacity(0.3) : .clear, in: RoundedRectangle(cornerRadius: 10)
      )
      .overlay(RoundedRectangle(cornerRadius: 10).stroke(focused ? theme.ring : theme.input))
      .overlay(
        RoundedRectangle(cornerRadius: 10).stroke(
          focused ? theme.ring.opacity(0.5) : .clear, lineWidth: 3)
      )
      .focused($focused)
      .accessibilityLabel(title)
  }
}

struct TSection<Content: View>: View {
  let title: String
  @ViewBuilder var content: Content
  var body: some View {
    VStack(alignment: .leading, spacing: 12) {
      Text(title).font(.system(size: 18, weight: .semibold))
      content
    }.frame(maxWidth: .infinity, alignment: .leading)
  }
}

struct TCard<Content: View>: View {
  let title: String
  var description: String? = nil
  @ViewBuilder var content: Content
  @Environment(\.colorScheme) private var scheme
  var body: some View {
    let theme = GalleryTheme(dark: scheme == .dark)
    VStack(alignment: .leading, spacing: 16) {
      Text(title).font(.system(size: 16, weight: .semibold))
      if let description { Text(description).foregroundStyle(theme.mutedForeground) }
      content
    }
    .padding(24)
    .frame(maxWidth: .infinity, alignment: .leading)
    .background(theme.card, in: RoundedRectangle(cornerRadius: 12))
    .overlay(RoundedRectangle(cornerRadius: 12).stroke(theme.border))
  }
}

struct FlowLayout: Layout {
  var spacing: CGFloat = 12
  func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
    positions(width: proposal.width ?? .infinity, subviews: subviews).size
  }
  func placeSubviews(
    in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()
  ) {
    let layout = positions(width: bounds.width, subviews: subviews)
    for (index, point) in layout.points.enumerated() {
      subviews[index].place(
        at: CGPoint(x: bounds.minX + point.x, y: bounds.minY + point.y), proposal: .unspecified)
    }
  }
  private func positions(width: CGFloat, subviews: Subviews) -> (points: [CGPoint], size: CGSize) {
    var points: [CGPoint] = []
    var x: CGFloat = 0
    var y: CGFloat = 0
    var rowHeight: CGFloat = 0
    var maxX: CGFloat = 0
    for view in subviews {
      let size = view.sizeThatFits(.unspecified)
      if x > 0, x + size.width > width {
        x = 0
        y += rowHeight + spacing
        rowHeight = 0
      }
      points.append(CGPoint(x: x, y: y))
      maxX = max(maxX, x + size.width)
      x += size.width + spacing
      rowHeight = max(rowHeight, size.height)
    }
    return (points, CGSize(width: proposalWidth(width, fallback: maxX), height: y + rowHeight))
  }
  private func proposalWidth(_ width: CGFloat, fallback: CGFloat) -> CGFloat {
    width.isFinite ? width : fallback
  }
}

extension View {
  func pageTitle() -> some View {
    font(.system(size: 24, weight: .bold)).accessibilityAddTraits(.isHeader)
  }
  func muted(_ theme: GalleryTheme) -> some View {
    font(.system(size: 14)).foregroundStyle(theme.mutedForeground)
  }
  func statusBox(_ theme: GalleryTheme) -> some View {
    padding(16).frame(maxWidth: .infinity, alignment: .leading).background(
      theme.muted, in: RoundedRectangle(cornerRadius: 10))
  }
}

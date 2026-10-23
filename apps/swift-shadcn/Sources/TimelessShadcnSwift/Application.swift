import SwiftUI

@main struct TimelessShadcnApplication: App {
  @NSApplicationDelegateAdaptor(GalleryApplicationDelegate.self) private var delegate
  @StateObject private var model = GalleryModel()
  var body: some Scene {
    WindowGroup("Timeless Shadcn Swift") {
      GalleryRoot(model: model).frame(minWidth: 760, minHeight: 480)
    }
    .defaultSize(width: 800, height: 560)
    .commands {
      CommandGroup(replacing: .newItem) {}
    }
  }
}

final class GalleryApplicationDelegate: NSObject, NSApplicationDelegate {
  func applicationShouldTerminateAfterLastWindowClosed(_ sender: NSApplication) -> Bool { true }
}

struct GalleryRoot: View {
  @ObservedObject var model: GalleryModel
  @ObservedObject private var floating: FloatingModel
  init(model: GalleryModel) {
    self.model = model
    floating = model.floating
  }
  var body: some View {
    let theme = GalleryTheme(dark: model.dark)
    GeometryReader { geometry in
      ZStack {
        HStack(spacing: 0) {
          sidebar(theme)
          VStack(alignment: .leading, spacing: 0) {
            HStack(spacing: 12) {
              TButton(
                title: "后退", icon: "arrow-left", variant: .outline, iconOnly: true, circular: true,
                action: model.back
              )
              .disabled(!model.canGoBack).accessibilityIdentifier("route-back")
              TButton(
                title: "前进", icon: "arrow-right", variant: .outline, iconOnly: true, circular: true,
                action: model.forward
              )
              .disabled(!model.canGoForward).accessibilityIdentifier("route-forward")
              Text(model.page.path).muted(theme).accessibilityIdentifier("route-path")
              Spacer(minLength: 0)
            }.padding(16)
            Text(model.page.title).font(.system(size: 14, weight: .semibold))
              .padding(.horizontal, 24).accessibilityIdentifier("route-title")
            if model.page == .table {
              InvoicesPage(model: model.invoices).padding(24)
            } else {
              ScrollView {
                pageContent.frame(maxWidth: .infinity, alignment: .leading).padding(24)
              }
              .id(model.page)
              .accessibilityIdentifier("route-scroll")
            }
          }.frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
        }
        .disabled(floating.overlay != nil)
        .accessibilityHidden(floating.overlay != nil)
        if let overlay = floating.overlay {
          FloatingOverlayView(model: floating, overlay: overlay)
            .zIndex(10)
        }
      }.frame(width: geometry.size.width, height: geometry.size.height)
    }
    .font(.system(size: 14))
    .foregroundStyle(theme.foreground)
    .background(theme.background)
    .background(OutsideClickDismissal())
    .environment(\.colorScheme, model.dark ? .dark : .light)
    .preferredColorScheme(model.dark ? .dark : .light)
    .accessibilityIdentifier("shared-application")
  }

  private func sidebar(_ theme: GalleryTheme) -> some View {
    VStack(alignment: .leading, spacing: 24) {
      HStack {
        Text("Timeless").font(.system(size: 20, weight: .bold)).accessibilityIdentifier(
          "application-name")
        Spacer(minLength: 8)
        TButton(title: "切换明暗主题", icon: model.dark ? "sun" : "moon", variant: .ghost, iconOnly: true)
        { model.dark.toggle() }
        .accessibilityIdentifier("theme-toggle")
      }.accessibilityIdentifier("sider-header")
      Text("shadcn / components").muted(theme)
      VStack(spacing: 8) {
        ForEach(GalleryPage.allCases) { page in
          Button {
            model.navigate(page)
          } label: {
            HStack(spacing: 6) {
              LucideIcon(name: page.icon)
              Text(page.title).lineLimit(1)
              Spacer(minLength: 0)
            }
            .padding(.horizontal, 10).frame(height: 32)
            .background(
              model.page == page ? theme.background : .clear, in: RoundedRectangle(cornerRadius: 10)
            )
          }
          .buttonStyle(GalleryButtonStyle(variant: .ghost))
          .accessibilityIdentifier("nav-\(page.rawValue)")
          .accessibilityAddTraits(model.page == page ? .isSelected : [])
        }
      }.accessibilityElement(children: .contain).accessibilityLabel("示例页面")
      Spacer(minLength: 0)
    }
    .padding(16)
    .frame(width: 192)
    .frame(maxHeight: .infinity, alignment: .topLeading)
    .background(theme.muted)
    .accessibilityIdentifier("sider")
  }

  @ViewBuilder private var pageContent: some View {
    switch model.page {
    case .overview: OverviewPage()
    case .general: ButtonsPage(model: model)
    case .dataEntry: FormPage(model: model.form).frame(maxWidth: 672)
    case .floating: FloatingPage(model: model.floating).frame(maxWidth: 672)
    case .navigation: NavigationPage(model: model.components).frame(maxWidth: 672)
    case .dataDisplay: DisplayPage(model: model.components).frame(maxWidth: 672)
    case .layout: LayoutPage()
    case .scroll: ScrollingPage(model: model.scrolling)
    case .transition: TransitionsPage(model: model.transitions).frame(maxWidth: 672)
    case .table: EmptyView()
    }
  }
}

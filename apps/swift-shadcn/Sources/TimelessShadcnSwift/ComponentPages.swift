import SwiftUI

struct OverviewPage: View {
  @Environment(\.colorScheme) private var scheme
  var body: some View {
    let theme = GalleryTheme(dark: scheme == .dark)
    VStack(alignment: .leading, spacing: 24) {
      Text("共享组件示例").pageTitle()
      Text("从左侧选择页面。菜单、路由和组件内容共用同一份 Model、View 与 CSS。").muted(theme)
      TCard(title: "浏览页面", description: "侧边菜单与内容区同步切换，工具栏可前进、后退。") {
        Text("在基础组件页点击按钮，再切换页面返回，点击计数会保留。明暗主题作用于整个应用。")
      }
    }.accessibilityIdentifier("overview-page")
  }
}

struct ButtonsPage: View {
  @ObservedObject var model: GalleryModel
  @Environment(\.colorScheme) private var scheme
  var body: some View {
    let theme = GalleryTheme(dark: scheme == .dark)
    VStack(alignment: .leading, spacing: 24) {
      Text("共享 shadcn Button").pageTitle().accessibilityIdentifier("page-title")
      Text("同一份 Model、View 和 CSS，由 Web、macOS、Windows 宿主渲染。").muted(theme)
      FlowLayout {
        ForEach(ButtonVariant.allCases, id: \.self) { variant in
          TButton(title: variant.label, variant: variant) { model.count += 1 }
            .accessibilityIdentifier("button-\(variant.rawValue)")
        }
      }
      Text("点击次数：\(model.count)").font(.system(size: 18)).accessibilityIdentifier("count")
      HStack(spacing: 12) {
        TButton(title: "重置计数", variant: .secondary) { model.count = 0 }.accessibilityIdentifier(
          "reset-count")
        TButton(title: "Disabled") { model.count += 1 }.disabled(true).accessibilityIdentifier(
          "button-disabled")
      }
    }.accessibilityIdentifier("shared-button-page")
  }
}

struct LayoutPage: View {
  @Environment(\.colorScheme) private var scheme
  private let titles = ["共享布局", "独立滚动", "状态保留"]
  private let descriptions = ["Flex 容器随窗口宽度换行。", "内容区滚动时菜单保持可见。", "页面切换后保留组件状态。"]
  var body: some View {
    VStack(alignment: .leading, spacing: 24) {
      Text("布局与容器").pageTitle()
      Text("固定侧栏、弹性内容区和可换行卡片，均使用共享样式。").muted(GalleryTheme(dark: scheme == .dark))
      FlowLayout(spacing: 16) {
        ForEach(titles.indices, id: \.self) { index in
          TCard(title: titles[index]) { Text(descriptions[index]) }.frame(width: 224)
            .accessibilityIdentifier("layout-card-\(index + 1)")
        }
      }
    }.accessibilityIdentifier("layout-page")
  }
}

struct NavigationPage: View {
  @ObservedObject var model: ComponentsModel
  @Environment(\.colorScheme) private var scheme
  @FocusState private var focusedTab: Int?
  var body: some View {
    let theme = GalleryTheme(dark: scheme == .dark)
    VStack(alignment: .leading, spacing: 24) {
      TSection(title: "Tabs / 标签页") {
        HStack(spacing: 4) {
          ForEach(0..<3) { index in
            TButton(
              title: ComponentsModel.tabs[index], variant: model.tab == index ? .outline : .ghost
            ) { model.tab = index }
            .focused($focusedTab, equals: index)
            .accessibilityIdentifier("components-tab-\(index)")
            .accessibilityAddTraits(model.tab == index ? .isSelected : [])
          }
        }
        .padding(4).background(theme.muted, in: RoundedRectangle(cornerRadius: 10))
        .onMoveCommand { direction in
          if direction == .left || direction == .right {
            model.tab = (model.tab + (direction == .right ? 1 : 2)) % 3
            focusedTab = model.tab
          }
        }
        .onKeyPress(.home) {
          model.tab = 0
          focusedTab = 0
          return .handled
        }
        .onKeyPress(.end) {
          model.tab = 2
          focusedTab = 2
          return .handled
        }
        Text(ComponentsModel.panels[model.tab]).statusBox(theme).accessibilityIdentifier(
          "components-tab-panel")
      }
      TSection(title: "Accordion / 单项展开") {
        accordion(
          title: "页面切换会保留状态吗？", text: "会保留当前展开项与标签选择。", open: model.accordion == 0,
          id: "accordion-0"
        ) { model.toggleAccordion(0) }
        accordion(
          title: "这些是实际 shadcn 组件吗？", text: "是，使用包内组件与共享样式，由宿主渲染。", open: model.accordion == 1,
          id: "accordion-1"
        ) { model.toggleAccordion(1) }
      }
      TSection(title: "Accordion / 多项展开") {
        accordion(
          title: "第一项", text: "第一项可以独立展开。", open: model.multiple.contains(0), id: "multiple-0"
        ) { model.toggleMultiple(0) }
        accordion(
          title: "第二项", text: "第二项可以同时保持展开。", open: model.multiple.contains(1), id: "multiple-1"
        ) { model.toggleMultiple(1) }
      }
      TSection(title: "Steps / 步骤") {
        HStack(spacing: 12) {
          ForEach(0..<3) { index in
            HStack(spacing: 8) {
              Group {
                if index < model.step { LucideIcon(name: "check") } else { Text("\(index + 1)") }
              }
              .frame(width: 32, height: 32)
              .foregroundStyle(
                index <= model.step ? theme.primaryForeground : theme.mutedForeground
              )
              .background(index <= model.step ? theme.primary : theme.muted, in: Circle())
              Text(["账户", "资料", "完成"][index])
            }
            if index < 2 { Rectangle().fill(theme.border).frame(height: 1) }
          }
        }.accessibilityIdentifier("components-steps")
        Text("步骤 \(model.step + 1) / 3").accessibilityIdentifier("components-step-value")
        HStack(spacing: 12) {
          TButton(title: "上一步", variant: .outline) { model.advanceStep(-1) }
          TButton(title: "下一步") { model.advanceStep(1) }
        }
      }
    }.accessibilityIdentifier("components-navigation")
  }
  private func accordion(
    title: String, text: String, open: Bool, id: String, action: @escaping () -> Void
  ) -> some View {
    let theme = GalleryTheme(dark: scheme == .dark)
    return VStack(alignment: .leading, spacing: 12) {
      Button(action: action) {
        HStack {
          Text(title).fontWeight(.medium)
          Spacer()
          LucideIcon(name: "chevron-down").rotationEffect(.degrees(open ? 180 : 0))
        }.padding(.vertical, 12).contentShape(Rectangle())
      }.buttonStyle(.plain).accessibilityIdentifier(id).accessibilityValue(open ? "已展开" : "已收起")
      if open { Text(text).padding(.bottom, 16).accessibilityIdentifier("\(id)-content") }
      Rectangle().fill(theme.border).frame(height: 1)
    }
  }
}

struct DisplayPage: View {
  @ObservedObject var model: ComponentsModel
  @Environment(\.colorScheme) private var scheme
  var body: some View {
    let theme = GalleryTheme(dark: scheme == .dark)
    VStack(alignment: .leading, spacing: 24) {
      TSection(title: "Badge / 变体") {
        HStack(spacing: 12) {
          ForEach([ButtonVariant.primary, .secondary, .outline, .destructive], id: \.self) {
            variant in
            Text(variant.rawValue).font(.system(size: 12, weight: .medium)).padding(.horizontal, 8)
              .padding(.vertical, 3)
              .foregroundStyle(
                variant == .primary
                  ? theme.primaryForeground
                  : variant == .destructive ? theme.destructive : theme.foreground
              )
              .background(
                variant == .primary
                  ? theme.primary
                  : variant == .secondary
                    ? theme.muted
                    : variant == .destructive ? theme.destructive.opacity(0.1) : .clear,
                in: Capsule()
              )
              .overlay(Capsule().stroke(variant == .outline ? theme.border : .clear))
              .accessibilityIdentifier("components-badge-\(variant.rawValue)")
          }
        }
      }
      TSection(title: "Avatar / 兜底与尺寸") {
        HStack(spacing: 12) {
          ForEach(0..<3) { index in
            Text(["S", "M", "L"][index]).fontWeight(.medium)
              .frame(width: CGFloat(32 + index * 8), height: CGFloat(32 + index * 8))
              .background(theme.muted, in: Circle()).accessibilityLabel(
                "\(["sm", "default", "lg"][index]) 头像")
          }
        }
      }
      TSection(title: "Separator / 两个方向") {
        Rectangle().fill(theme.border).frame(height: 1)
        HStack(spacing: 12) {
          Text("左侧")
          Rectangle().fill(theme.border).frame(width: 1, height: 24)
          Text("右侧")
        }
      }
      TSection(title: "Alert / 提示与错误") {
        alert("Heads up!", "使用真实 shadcn Alert，继承整个应用的明暗主题。", theme: theme)
        alert("Error", "这是错误样式示例，不会发起网络请求。", error: true, theme: theme)
      }
      TSection(title: "Progress / Ref 与 Store") {
        Text("Ref：\(model.progress)%").accessibilityIdentifier("components-progress-value")
        progress(model.progress, theme: theme, label: "Ref 进度")
        Text("Store：\(model.storeProgress)%").accessibilityIdentifier("components-store-value")
        progress(model.storeProgress, theme: theme, label: "Store 进度")
        HStack(spacing: 12) {
          TButton(title: "-10", variant: .outline) { model.advanceProgress(-10) }
          TButton(title: "+10") { model.advanceProgress(10) }
        }
      }
      TSection(title: "Skeleton / 占位布局") {
        RoundedRectangle(cornerRadius: 12).fill(theme.muted).frame(height: 96).accessibilityHidden(
          true)
        RoundedRectangle(cornerRadius: 10).fill(theme.muted).frame(height: 16).accessibilityHidden(
          true)
      }
    }.accessibilityIdentifier("components-display")
  }
  private func alert(_ title: String, _ text: String, error: Bool = false, theme: GalleryTheme)
    -> some View
  {
    VStack(alignment: .leading, spacing: 8) {
      Text(title).fontWeight(.medium)
      Text(text).foregroundStyle(error ? theme.destructive : theme.mutedForeground)
    }.foregroundStyle(error ? theme.destructive : theme.foreground)
      .padding(16).frame(maxWidth: .infinity, alignment: .leading)
      .overlay(RoundedRectangle(cornerRadius: 10).stroke(theme.border))
  }
  private func progress(_ value: Int, theme: GalleryTheme, label: String) -> some View {
    GeometryReader { geometry in
      ZStack(alignment: .leading) {
        Capsule().fill(theme.primary.opacity(0.2))
        Capsule().fill(theme.primary).frame(width: geometry.size.width * CGFloat(value) / 100)
      }
    }.frame(height: 8).accessibilityLabel(label).accessibilityValue("\(value)%")
  }
}

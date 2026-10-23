import SwiftUI

struct MenuChoice: Identifiable {
  let id = UUID()
  let title: String
  var disabled = false
  var separatorBefore = false
  var action: () -> Void
}

struct ChoiceMenu: View {
  let items: [MenuChoice]
  var dismiss: () -> Void
  @FocusState private var focused: Int?
  @Environment(\.colorScheme) private var scheme
  var body: some View {
    let theme = GalleryTheme(dark: scheme == .dark)
    VStack(alignment: .leading, spacing: 2) {
      ForEach(items.indices, id: \.self) { index in
        if items[index].separatorBefore {
          Rectangle().fill(theme.border).frame(height: 1).padding(.vertical, 4)
        }
        Button(action: items[index].action) {
          Text(items[index].title).frame(maxWidth: .infinity, alignment: .leading).padding(
            .horizontal, 8
          ).frame(height: 32)
        }.buttonStyle(GalleryButtonStyle(variant: .ghost)).disabled(items[index].disabled)
          .focused($focused, equals: index)
      }
    }.padding(4).background(theme.card).foregroundStyle(theme.foreground)
      .onAppear { focused = items.indices.first { !items[$0].disabled } }
      .onMoveCommand { direction in
        let enabled = items.indices.filter { !items[$0].disabled }
        guard let current = enabled.firstIndex(of: focused ?? -1), !enabled.isEmpty else { return }
        if direction == .down { focused = enabled[(current + 1) % enabled.count] }
        if direction == .up { focused = enabled[(current + enabled.count - 1) % enabled.count] }
      }
      .onKeyPress(.home) {
        focused = items.indices.first { !items[$0].disabled }
        return .handled
      }
      .onKeyPress(.end) {
        focused = items.indices.last { !items[$0].disabled }
        return .handled
      }
      .onExitCommand(perform: dismiss)
  }
}

struct FloatingPage: View {
  @ObservedObject var model: FloatingModel
  @Environment(\.colorScheme) private var scheme
  @FocusState private var tooltipFocused: Bool
  @FocusState private var focusedTrigger: FloatingOverlay?
  @State private var tooltipHovered = false
  @State private var tooltipDismissed = false
  var body: some View {
    let theme = GalleryTheme(dark: scheme == .dark)
    VStack(alignment: .leading, spacing: 24) {
      Text("浮层组件").pageTitle()
      Text("Modal、Popover、Tooltip、Drawer 使用共享 Primitive；DropdownMenu 和 ContextMenu 使用真实 shadcn 组件。")
        .muted(theme)
      FlowLayout {
        TButton(title: "打开 Modal", action: model.openModal).accessibilityIdentifier(
          "floating-modal-trigger"
        )
        .focused($focusedTrigger, equals: .modal)
        TButton(title: "打开 Popover", variant: .outline) { model.popover.toggle() }
          .accessibilityIdentifier("floating-popover-trigger")
          .popover(isPresented: $model.popover, arrowEdge: .top) {
            VStack(alignment: .leading, spacing: 12) {
              Text("Popover / 气泡面板").fontWeight(.semibold)
              Text("面板跟随按钮定位，点击外部或按 Esc 关闭，内容不受滚动容器裁剪。")
              TButton(title: "关闭面板") { model.popover = false }
            }.padding(16).frame(width: 288).background(theme.card)
              .onExitCommand { model.popover = false }.environment(\.colorScheme, scheme)
          }
        TButton(title: "打开 DropdownMenu", variant: .outline) { model.dropdown.toggle() }
          .accessibilityIdentifier("floating-dropdown-trigger")
          .popover(isPresented: $model.dropdown, arrowEdge: .top) {
            ChoiceMenu(
              items: [
                MenuChoice(title: "编辑资料", action: model.editProfile),
                MenuChoice(title: "复制名称", action: model.copyName),
                MenuChoice(title: "删除（禁用）", disabled: true, separatorBefore: true, action: {}),
              ], dismiss: { model.dropdown = false }
            )
            .frame(width: 200).environment(\.colorScheme, scheme)
          }
        TButton(title: "打开 Drawer", variant: .outline) { model.overlay = .drawer }
          .accessibilityIdentifier("floating-drawer-trigger")
          .focused($focusedTrigger, equals: .drawer)
        TButton(title: "悬停或聚焦 Tooltip", variant: .outline) {}
          .focused($tooltipFocused)
          .onHover { hovering in
            tooltipHovered = hovering
            if hovering { tooltipDismissed = false }
          }
          .onChange(of: tooltipFocused) { _, focused in
            if focused { tooltipDismissed = false }
          }
          .background(
            TooltipAnchor(
              visible: (tooltipHovered || tooltipFocused) && !tooltipDismissed, theme: theme)
          )
          .onExitCommand { tooltipDismissed = true }
          .accessibilityHint("保存的名称会保留在本次运行中。")
          .accessibilityIdentifier("floating-tooltip-trigger")
      }
      ContextMenuRegion(model: model, theme: theme).frame(height: 96)
        .overlay(
          RoundedRectangle(cornerRadius: 10).stroke(
            theme.border, style: StrokeStyle(lineWidth: 1, dash: [4, 4])
          ).allowsHitTesting(false))
      Text(model.result).statusBox(theme).accessibilityIdentifier("floating-result")
    }.accessibilityIdentifier("floating-page")
      .onChange(of: model.overlay) { previous, current in
        if current == nil { focusedTrigger = previous }
      }
  }
}

struct FloatingOverlayView: View {
  @ObservedObject var model: FloatingModel
  let overlay: FloatingOverlay
  @Environment(\.colorScheme) private var scheme
  @FocusState private var nameFocused: Bool
  @FocusState private var closeFocused: Bool
  var body: some View {
    let theme = GalleryTheme(dark: scheme == .dark)
    ZStack(alignment: overlay == .drawer ? .trailing : .center) {
      Color.black.opacity(0.5).contentShape(Rectangle()).onTapGesture { model.overlay = nil }
        .accessibilityHidden(true)
      if overlay == .modal {
        VStack(alignment: .leading, spacing: 16) {
          Text("编辑显示名称").font(.system(size: 18, weight: .semibold))
          Text("保存或取消、按 Esc、点击背景均可关闭。Tab 在窗口内移动焦点。").muted(theme)
          Text("显示名称").fontWeight(.medium)
          TInput(title: "显示名称", text: $model.name).focused($nameFocused).accessibilityIdentifier(
            "floating-name")
          Text(model.error).foregroundStyle(theme.destructive).accessibilityIdentifier(
            "floating-modal-error")
          HStack(spacing: 12) {
            Spacer()
            TButton(title: "取消", variant: .outline) { model.overlay = nil }.keyboardShortcut(
              .cancelAction)
            TButton(title: "保存", action: model.save).keyboardShortcut(.defaultAction)
              .accessibilityIdentifier("floating-modal-save")
          }
        }
        .padding(24).frame(width: 384)
        .background(theme.card, in: RoundedRectangle(cornerRadius: 12))
        .overlay(RoundedRectangle(cornerRadius: 12).stroke(theme.foreground.opacity(0.1)))
        .shadow(color: .black.opacity(0.15), radius: 8, y: 4)
        .onAppear { nameFocused = true }
        .accessibilityIdentifier("floating-modal")
      } else {
        VStack(alignment: .leading, spacing: 16) {
          Text("Drawer / 详情抽屉").font(.system(size: 18, weight: .semibold))
          Text("抽屉固定在窗口右侧。按 Esc、点击背景或下方按钮关闭；Tab 焦点保持在抽屉内。").muted(theme)
          TButton(title: "关闭抽屉") { model.overlay = nil }.focused($closeFocused).keyboardShortcut(
            .cancelAction
          )
          .accessibilityIdentifier("floating-drawer-close")
          Spacer()
        }.padding(24).frame(width: 320).frame(maxHeight: .infinity).background(theme.card)
          .onAppear { closeFocused = true }.accessibilityIdentifier("floating-drawer")
      }
    }.onExitCommand { model.overlay = nil }.accessibilityElement(children: .contain)
      .accessibilityAddTraits(.isModal)
  }
}

struct ContextMenuRegion: NSViewRepresentable {
  let model: FloatingModel
  let theme: GalleryTheme
  func makeNSView(context: Context) -> ContextRegionView {
    let view = ContextRegionView()
    view.model = model
    view.identifier = NSUserInterfaceItemIdentifier("floating-context-trigger")
    view.setAccessibilityLabel("右键打开上下文菜单，也可按 Shift+F10")
    return view
  }
  func updateNSView(_ view: ContextRegionView, context: Context) {
    view.theme = theme
    view.text.textColor = NSColor(theme.mutedForeground)
    view.appearance = NSAppearance(named: theme.dark ? .darkAqua : .aqua)
  }
  static func dismantleNSView(_ view: ContextRegionView, coordinator: ()) { view.popover.close() }
}

@MainActor final class ContextRegionView: NSView, NSPopoverDelegate {
  weak var model: FloatingModel?
  var theme = GalleryTheme(dark: false)
  let popover = NSPopover()
  let text = NSTextField(labelWithString: "在此区域右键打开 ContextMenu（Shift+F10）")
  override var acceptsFirstResponder: Bool { true }
  override init(frame frameRect: NSRect) {
    super.init(frame: frameRect)
    setAccessibilityElement(true)
    setAccessibilityRole(.button)
    text.font = .systemFont(ofSize: 14)
    text.alignment = .center
    text.translatesAutoresizingMaskIntoConstraints = false
    addSubview(text)
    NSLayoutConstraint.activate([
      text.centerXAnchor.constraint(equalTo: centerXAnchor),
      text.centerYAnchor.constraint(equalTo: centerYAnchor),
    ])
  }
  required init?(coder: NSCoder) { fatalError("init(coder:) has not been implemented") }
  override func mouseDown(with event: NSEvent) { window?.makeFirstResponder(self) }
  override func rightMouseDown(with event: NSEvent) {
    window?.makeFirstResponder(self)
    showMenu(at: convert(event.locationInWindow, from: nil))
  }
  override func keyDown(with event: NSEvent) {
    if event.keyCode == 109 && event.modifierFlags.contains(.shift) {
      showMenu(at: NSPoint(x: bounds.midX, y: bounds.midY))
    } else {
      super.keyDown(with: event)
    }
  }
  override func accessibilityPerformShowMenu() -> Bool {
    showMenu(at: NSPoint(x: bounds.midX, y: bounds.midY))
    return true
  }
  private func showMenu(at point: NSPoint) {
    popover.behavior = .transient
    popover.animates = false
    popover.delegate = self
    popover.contentViewController = NSHostingController(
      rootView:
        ChoiceMenu(
          items: [
            MenuChoice(title: "复制") { [weak self] in
              self?.popover.close()
              self?.model?.copyContext()
            },
            MenuChoice(title: "查看详情") { [weak self] in
              self?.popover.close()
              self?.model?.overlay = .drawer
            },
            MenuChoice(title: "粘贴（禁用）", disabled: true, separatorBefore: true, action: {}),
          ], dismiss: { [weak self] in self?.popover.close() }
        )
        .frame(width: 200).environment(\.colorScheme, theme.dark ? .dark : .light)
    )
    popover.show(
      relativeTo: NSRect(origin: point, size: NSSize(width: 1, height: 1)), of: self,
      preferredEdge: .maxY)
  }
  func popoverDidClose(_ notification: Notification) { window?.makeFirstResponder(self) }
}

struct TooltipAnchor: NSViewRepresentable {
  let visible: Bool
  let theme: GalleryTheme
  func makeNSView(context: Context) -> TooltipAnchorView { TooltipAnchorView() }
  func updateNSView(_ view: TooltipAnchorView, context: Context) {
    view.visible = visible
    view.theme = theme
    view.updateTooltip()
  }
  static func dismantleNSView(_ view: TooltipAnchorView, coordinator: ()) { view.hideTooltip() }
}

@MainActor final class TooltipAnchorView: NSView {
  var visible = false
  var theme = GalleryTheme(dark: false)
  private var panel: NSPanel?
  private var observer: NSObjectProtocol?
  override func viewDidMoveToWindow() {
    super.viewDidMoveToWindow()
    if let observer { NotificationCenter.default.removeObserver(observer) }
    observer = nil
    if window != nil {
      observer = NotificationCenter.default.addObserver(
        forName: NSView.boundsDidChangeNotification, object: nil, queue: .main
      ) { [weak self] _ in
        MainActor.assumeIsolated { if self?.visible == true { self?.updateTooltip() } }
      }
    }
    updateTooltip()
  }
  override func layout() {
    super.layout()
    updateTooltip()
  }
  override func hitTest(_ point: NSPoint) -> NSView? { nil }
  func updateTooltip() {
    guard visible, let window else {
      hideTooltip()
      return
    }
    let panel =
      self.panel
      ?? NSPanel(
        contentRect: .zero, styleMask: [.borderless, .nonactivatingPanel], backing: .buffered,
        defer: false)
    self.panel = panel
    panel.isOpaque = false
    panel.backgroundColor = .clear
    panel.ignoresMouseEvents = true
    panel.hasShadow = false
    let bubble = NSHostingView(
      rootView: Text("保存的名称会保留在本次运行中。")
        .font(.system(size: 12)).foregroundStyle(theme.background)
        .padding(.horizontal, 12).padding(.vertical, 6)
        .background(theme.foreground, in: RoundedRectangle(cornerRadius: 6)))
    panel.contentView = bubble
    let size = bubble.fittingSize
    let anchor = window.convertToScreen(convert(bounds, to: nil))
    let viewport = window.convertToScreen(window.contentView?.bounds ?? window.frame)
    let x = min(
      max(anchor.midX - size.width / 2, viewport.minX + 8), viewport.maxX - size.width - 8)
    let above = anchor.maxY + 8
    let y = above + size.height <= viewport.maxY ? above : anchor.minY - size.height - 8
    panel.setFrame(NSRect(origin: NSPoint(x: x, y: y), size: size), display: true)
    if panel.parent == nil { window.addChildWindow(panel, ordered: .above) }
    panel.orderFront(nil)
  }
  func hideTooltip() {
    guard let panel else { return }
    panel.parent?.removeChildWindow(panel)
    panel.orderOut(nil)
    self.panel = nil
  }
  deinit { if let observer { NotificationCenter.default.removeObserver(observer) } }
}

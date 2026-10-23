import SwiftUI

struct InvoicesPage: View {
  @ObservedObject var model: InvoiceModel
  @Environment(\.colorScheme) private var scheme
  var body: some View {
    let theme = GalleryTheme(dark: scheme == .dark)
    VStack(alignment: .leading, spacing: 24) {
      Text("Table / 账单列表").pageTitle().fixedSize(horizontal: false, vertical: true)
      Text("最近的账单，共 200 条，每页显示 20 条，共 10 页。使用下方分页查看其余账单。")
        .muted(theme).fixedSize(horizontal: false, vertical: true)
      ScrollView {
        VStack(spacing: 0) {
          InvoiceCells(values: ["账单编号", "状态", "支付方式", "金额"], header: true, theme: theme)
            .overlay(alignment: .bottom) { Rectangle().fill(theme.tableBorder).frame(height: 1) }
          ForEach(model.rows) { invoice in
            InvoiceRow(
              invoice: invoice, theme: theme, last: invoice.number == model.rows.last?.number)
          }
        }
        .frame(maxWidth: .infinity)
        .accessibilityElement(children: .contain).accessibilityLabel("最近账单")
        .accessibilityIdentifier("invoices-table")
      }.frame(maxWidth: .infinity, maxHeight: .infinity).accessibilityIdentifier("invoices-scroll")
      HStack(spacing: 16) {
        Text(model.summary).muted(theme).fixedSize().accessibilityIdentifier("invoices-summary")
        Spacer(minLength: 0)
        HStack(spacing: 0) {
          TButton(title: "上一页", icon: "chevron-left", variant: .ghost, iconOnly: true) {
            model.select(model.page - 1)
          }
          .disabled(model.page == 1).accessibilityIdentifier("invoices-previous")
          ForEach(1...InvoiceModel.pageCount, id: \.self) { page in
            TButton(
              title: "\(page)", variant: page == model.page ? .outline : .ghost, size: 24, width: 24
            ) { model.select(page) }
            .accessibilityLabel("第 \(page) 页")
            .accessibilityIdentifier("invoices-page-\(page)")
            .accessibilityAddTraits(page == model.page ? .isSelected : [])
          }
          TButton(title: "下一页", icon: "chevron-right", variant: .ghost, iconOnly: true) {
            model.select(model.page + 1)
          }
          .disabled(model.page == InvoiceModel.pageCount).accessibilityIdentifier("invoices-next")
        }.fixedSize().accessibilityLabel("账单分页")
      }.fixedSize(horizontal: false, vertical: true).accessibilityIdentifier("invoices-footer")
    }.frame(maxWidth: .infinity, maxHeight: .infinity).accessibilityIdentifier("table-page")
  }
}

private struct InvoiceCells: View {
  let values: [String]
  var header = false
  let theme: GalleryTheme
  var body: some View {
    HStack(spacing: 0) {
      ForEach(values.indices, id: \.self) { index in
        Text(values[index]).fontWeight(header || index == 0 ? .medium : .regular)
          .frame(maxWidth: .infinity, alignment: index == 3 ? .trailing : .leading)
          .padding(.horizontal, 16)
      }
    }.frame(height: header ? 48 : 50).foregroundStyle(
      header ? theme.tableHeading : theme.foreground)
  }
}

private struct InvoiceRow: View {
  let invoice: Invoice
  let theme: GalleryTheme
  let last: Bool
  @State private var hovered = false
  var body: some View {
    InvoiceCells(
      values: [invoice.id, invoice.status, invoice.method, invoice.amount], theme: theme
    )
    .background(hovered ? theme.muted.opacity(0.5) : .clear)
    .overlay(alignment: .bottom) {
      if !last { Rectangle().fill(theme.tableBorder).frame(height: 1) }
    }
    .onHover { hovered = $0 }
    .accessibilityElement(children: .combine).accessibilityIdentifier("invoice-\(invoice.id)")
  }
}

struct TransitionsPage: View {
  @ObservedObject var model: TransitionModel
  @Environment(\.colorScheme) private var scheme
  @Environment(\.accessibilityReduceMotion) private var reducedMotion
  var body: some View {
    let theme = GalleryTheme(dark: scheme == .dark)
    VStack(alignment: .leading, spacing: 24) {
      Text("Transition / 过渡动画").pageTitle()
      Text("参考 shadcn 示例：淡入淡出、滑动和缩放。前四项退场后移除内容；最后一项保留消失动画的最后一帧。").muted(theme)
      ForEach(TransitionEffect.allCases) { effect in
        VStack(alignment: .leading, spacing: 12) {
          Text(effect.title).fontWeight(.semibold)
          HStack(spacing: 12) {
            TButton(title: "显示", variant: .outline) { model.show(effect) }.accessibilityIdentifier(
              "transition-\(effect.id)-show")
            TButton(title: "隐藏", variant: .outline) { model.hide(effect) }.accessibilityIdentifier(
              "transition-\(effect.id)-hide")
          }
          ZStack(alignment: .topLeading) {
            if model.visible.contains(effect) {
              Text(effect.title).statusBox(theme)
                .transition(reducedMotion ? .identity : transition(for: effect))
                .accessibilityIdentifier("transition-\(effect.id)-content")
            }
          }.frame(maxWidth: .infinity, minHeight: 64, alignment: .topLeading)
            .animation(reducedMotion ? nil : .easeOut(duration: 0.3), value: model.visible)
            .clipped()
        }
      }
      VStack(alignment: .leading, spacing: 12) {
        Text("Forwards / 消失后保持最后一帧").fontWeight(.semibold)
        HStack(spacing: 12) {
          TButton(title: "消失并保持", variant: .outline) {
            model.hideSticky(reducedMotion: reducedMotion)
          }
          .disabled(model.sticky != .visible).accessibilityIdentifier("transition-sticky-hide")
          TButton(title: "恢复显示", action: model.restore).accessibilityIdentifier(
            "transition-sticky-restore")
        }
        Text("消失后保留节点和布局；点击恢复显示。")
          .padding(16).frame(maxWidth: .infinity, alignment: .leading)
          .foregroundStyle(theme.primaryForeground).background(
            theme.primary, in: RoundedRectangle(cornerRadius: 10)
          )
          .opacity(model.sticky == .visible ? 1 : 0)
          .animation(reducedMotion ? nil : .easeOut(duration: 0.3), value: model.sticky)
          .accessibilityHidden(model.sticky != .visible).accessibilityIdentifier(
            "transition-sticky-content")
        Text(model.stickyStatus).muted(theme).accessibilityIdentifier("transition-sticky-status")
      }
    }.accessibilityIdentifier("transition-page")
  }
  private func transition(for effect: TransitionEffect) -> AnyTransition {
    switch effect {
    case .fade: return .opacity
    case .bottom: return .opacity.combined(with: .offset(y: 16))
    case .zoom: return .opacity.combined(with: .scale(scale: 0.95))
    case .right: return .opacity.combined(with: .offset(x: 16))
    }
  }
}

struct ScrollingPage: View {
  @ObservedObject var model: ScrollingModel
  @Environment(\.colorScheme) private var scheme
  var body: some View {
    let theme = GalleryTheme(dark: scheme == .dark)
    VStack(alignment: .leading, spacing: 16) {
      Text("ScrollView / 双向滚动").font(.system(size: 20, weight: .semibold))
      CanvasScroll(model: model, theme: theme).frame(height: 120).accessibilityIdentifier(
        "scroll-example")
      Text(model.scrollPosition).muted(theme).accessibilityIdentifier("scroll-position")
      Text("VirtualList / ListViewV2").font(.system(size: 20, weight: .semibold))
      Text("共 \(String(model.count)) 条数据，仅创建可见行").muted(theme).accessibilityIdentifier(
        "virtual-list-total")
      FlowLayout {
        TButton(title: "回到顶部", variant: .outline) { model.scroll(to: 0) }.accessibilityIdentifier(
          "virtual-list-start")
        TButton(title: "跳到中间", variant: .outline) { model.scroll(to: model.count / 2) }
          .accessibilityIdentifier("virtual-list-middle")
        TButton(title: "跳到末尾", variant: .outline) { model.scroll(to: model.count - 1) }
          .accessibilityIdentifier("virtual-list-end")
        TButton(title: "切换 100 / 10000 条", variant: .outline, action: model.toggleCount)
          .accessibilityIdentifier("virtual-list-count")
      }
      VirtualList(model: model, theme: theme).frame(height: 288).accessibilityIdentifier(
        "virtual-list")
      Text(model.position).muted(theme).accessibilityIdentifier("virtual-list-position")
    }.accessibilityIdentifier("scroll-page")
  }
}

struct VirtualList: NSViewControllerRepresentable {
  let model: ScrollingModel
  let theme: GalleryTheme
  func makeNSViewController(context: Context) -> VirtualListController {
    VirtualListController(model: model)
  }
  func updateNSViewController(_ controller: VirtualListController, context: Context) {
    controller.update(theme: theme)
  }
}

@MainActor
final class VirtualListController: NSViewController, NSTableViewDataSource, NSTableViewDelegate {
  let model: ScrollingModel
  let table = NSTableView()
  let scroll = NSScrollView()
  private var observer: NSObjectProtocol?
  private var lastRequest: UUID?
  private var lastCount = 0
  private var lastDark: Bool?
  private var theme = GalleryTheme(dark: false)
  init(model: ScrollingModel) {
    self.model = model
    super.init(nibName: nil, bundle: nil)
  }
  required init?(coder: NSCoder) { fatalError("init(coder:) has not been implemented") }
  override func loadView() {
    scroll.hasVerticalScroller = true
    scroll.autohidesScrollers = true
    scroll.drawsBackground = false
    table.addTableColumn(NSTableColumn(identifier: NSUserInterfaceItemIdentifier("title")))
    table.headerView = nil
    table.columnAutoresizingStyle = .lastColumnOnlyAutoresizingStyle
    table.rowHeight = 48
    table.intercellSpacing = .zero
    table.gridStyleMask = .solidHorizontalGridLineMask
    table.selectionHighlightStyle = .none
    table.dataSource = self
    table.delegate = self
    table.identifier = NSUserInterfaceItemIdentifier("virtual-list-table")
    scroll.documentView = table
    scroll.contentView.postsBoundsChangedNotifications = true
    observer = NotificationCenter.default.addObserver(
      forName: NSView.boundsDidChangeNotification, object: scroll.contentView, queue: .main
    ) { [weak self] _ in
      MainActor.assumeIsolated { self?.publishPosition() }
    }
    view = scroll
  }
  func update(theme: GalleryTheme) {
    loadViewIfNeeded()
    self.theme = theme
    if lastCount != model.count || lastDark != theme.dark {
      lastCount = model.count
      lastDark = theme.dark
      table.backgroundColor = NSColor(theme.background)
      table.gridColor = NSColor(theme.border)
      scroll.appearance = NSAppearance(named: theme.dark ? .darkAqua : .aqua)
      table.reloadData()
    }
    if lastRequest != model.request {
      lastRequest = model.request
      let y = min(
        CGFloat(model.target) * 48, max(0, table.bounds.height - scroll.contentSize.height))
      scroll.contentView.scroll(to: NSPoint(x: 0, y: y))
      scroll.reflectScrolledClipView(scroll.contentView)
    }
  }
  func numberOfRows(in tableView: NSTableView) -> Int { model.count }
  func tableView(_ tableView: NSTableView, shouldSelectRow row: Int) -> Bool { false }
  func tableView(_ tableView: NSTableView, viewFor tableColumn: NSTableColumn?, row: Int) -> NSView?
  {
    let identifier = NSUserInterfaceItemIdentifier("virtual-row")
    let cell =
      tableView.makeView(withIdentifier: identifier, owner: nil) as? NSTableCellView
      ?? NSTableCellView()
    if cell.textField == nil {
      cell.identifier = identifier
      let text = NSTextField(labelWithString: "")
      text.font = .systemFont(ofSize: 14)
      text.translatesAutoresizingMaskIntoConstraints = false
      cell.addSubview(text)
      cell.textField = text
      NSLayoutConstraint.activate([
        text.leadingAnchor.constraint(equalTo: cell.leadingAnchor, constant: 16),
        text.trailingAnchor.constraint(equalTo: cell.trailingAnchor, constant: -16),
        text.centerYAnchor.constraint(equalTo: cell.centerYAnchor),
      ])
    }
    cell.textField?.stringValue = "列表项目 \(row + 1)"
    cell.textField?.textColor = NSColor(theme.foreground)
    cell.setAccessibilityIdentifier("virtual-list-item-\(row + 1)")
    return cell
  }
  private func publishPosition() {
    let position =
      "滚动位置 \(Int(scroll.contentView.bounds.minY.rounded())) · 视口高度 \(Int(scroll.contentSize.height.rounded()))"
    DispatchQueue.main.async { [weak self] in
      guard let self, self.model.position != position else { return }
      self.model.position = position
    }
  }
  deinit { if let observer { NotificationCenter.default.removeObserver(observer) } }
}

struct CanvasScroll: NSViewRepresentable {
  let model: ScrollingModel
  let theme: GalleryTheme
  func makeNSView(context: Context) -> CanvasScrollView { CanvasScrollView(model: model) }
  func updateNSView(_ view: CanvasScrollView, context: Context) {
    view.canvas.layer?.backgroundColor = NSColor(theme.muted).cgColor
    view.text.textColor = NSColor(theme.foreground)
    view.appearance = NSAppearance(named: theme.dark ? .darkAqua : .aqua)
  }
}

@MainActor final class CanvasScrollView: NSScrollView {
  let canvas = NSView(frame: NSRect(x: 0, y: 0, width: 1000, height: 220))
  let text = NSTextField(labelWithString: "拖动滚动条，或使用触控板查看右侧和下方内容。")
  private var observer: NSObjectProtocol?
  init(model: ScrollingModel) {
    super.init(frame: .zero)
    hasHorizontalScroller = true
    hasVerticalScroller = true
    autohidesScrollers = true
    drawsBackground = false
    canvas.wantsLayer = true
    text.font = .systemFont(ofSize: 14)
    text.frame = NSRect(x: 16, y: 184, width: 960, height: 20)
    canvas.addSubview(text)
    documentView = canvas
    contentView.postsBoundsChangedNotifications = true
    observer = NotificationCenter.default.addObserver(
      forName: NSView.boundsDidChangeNotification, object: contentView, queue: .main
    ) { [weak self, weak model] _ in
      guard let self else { return }
      let y = max(
        0, self.canvas.bounds.height - self.contentSize.height - self.contentView.bounds.minY)
      let value = "横向 \(Int(self.contentView.bounds.minX.rounded())) · 纵向 \(Int(y.rounded()))"
      DispatchQueue.main.async {
        if model?.scrollPosition != value { model?.scrollPosition = value }
      }
    }
    contentView.scroll(to: NSPoint(x: 0, y: max(0, canvas.bounds.height - contentSize.height)))
  }
  required init?(coder: NSCoder) { fatalError("init(coder:) has not been implemented") }
  deinit { if let observer { NotificationCenter.default.removeObserver(observer) } }
}

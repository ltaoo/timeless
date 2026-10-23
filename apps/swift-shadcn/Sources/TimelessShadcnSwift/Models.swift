import AppKit
import Combine
import UniformTypeIdentifiers

enum GalleryPage: String, CaseIterable, Identifiable {
  case overview, general
  case dataEntry = "data_entry"
  case floating, navigation
  case dataDisplay = "data_display"
  case layout, table, scroll, transition

  var id: String { rawValue }
  var path: String { "/home/\(rawValue)" }
  var title: String {
    switch self {
    case .overview: return "概览"
    case .general: return "基础组件"
    case .dataEntry: return "表单组件"
    case .floating: return "浮层组件"
    case .navigation: return "导航与折叠"
    case .dataDisplay: return "展示与反馈"
    case .layout: return "布局与容器"
    case .table: return "表格与分页"
    case .scroll: return "滚动与虚拟列表"
    case .transition: return "过渡动画"
    }
  }
  var icon: String {
    switch self {
    case .overview: return "house"
    case .general: return "bolt"
    case .floating: return "message-square-more"
    case .dataDisplay, .layout: return "grid-3x3"
    case .transition: return "activity"
    default: return "list"
    }
  }
}

@MainActor final class GalleryModel: ObservableObject {
  @Published private(set) var history: [GalleryPage] = [.general]
  @Published private(set) var cursor = 0
  @Published var dark = false
  @Published var count = 0
  let form = FormModel()
  let floating = FloatingModel()
  let components = ComponentsModel()
  let invoices = InvoiceModel()
  let scrolling = ScrollingModel()
  let transitions = TransitionModel()

  var page: GalleryPage { history[cursor] }
  var canGoBack: Bool { cursor > 0 }
  var canGoForward: Bool { cursor < history.count - 1 }

  func navigate(_ target: GalleryPage) {
    guard target != page else { return }
    dismissTransientContent()
    history = Array(history.prefix(cursor + 1)) + [target]
    cursor = history.count - 1
  }
  func back() {
    guard canGoBack else { return }
    dismissTransientContent()
    cursor -= 1
  }
  func forward() {
    guard canGoForward else { return }
    dismissTransientContent()
    cursor += 1
  }
  private func dismissTransientContent() {
    form.showDates = false
    form.showRoles = false
    floating.dismiss()
    transitions.reset()
  }
}

@MainActor final class FormModel: ObservableObject {
  @Published var name = ""
  @Published var email = ""
  @Published var bio = ""
  @Published private(set) var quantity = 1
  @Published var role: String?
  @Published var agreed = false
  @Published var notifications = true
  @Published var start: Date?
  @Published var end: Date?
  @Published private(set) var leftMonthOffset = 0
  @Published private(set) var rightMonthOffset = 1
  @Published var showDates = false
  @Published var showRoles = false
  @Published private(set) var files: [URL] = []
  @Published private(set) var result = "填写资料后提交。示例仅在本次运行中保存数据，不上传文件。"

  static let roles = [("developer", "开发者"), ("designer", "设计师"), ("viewer", "只读访客")]
  var roleLabel: String { Self.roles.first { $0.0 == role }?.1 ?? "请选择角色" }
  var dateText: String {
    guard let start, let end else { return "尚未选择日期范围" }
    return "\(Self.format(start)) - \(Self.format(end))"
  }
  var fileText: String {
    files.isEmpty ? "尚未选择文件" : files.map(\.lastPathComponent).joined(separator: "、")
  }
  func setQuantity(_ value: Int) { quantity = min(99, max(1, value)) }
  func monthDate(offset: Int) -> Date {
    let calendar = Calendar.current
    let first = calendar.date(from: calendar.dateComponents([.year, .month], from: Date()))!
    return calendar.date(byAdding: .month, value: offset, to: first)!
  }
  func moveMonth(left: Bool, delta: Int) {
    if left {
      let next = leftMonthOffset + delta
      guard next < rightMonthOffset else { return }
      leftMonthOffset = next
    } else {
      let next = rightMonthOffset + delta
      guard next > leftMonthOffset else { return }
      rightMonthOffset = next
    }
  }
  func days(in month: Date) -> [Date] {
    let calendar = Calendar.current
    let leading = (calendar.component(.weekday, from: month) + 5) % 7
    return (0..<42).map { calendar.date(byAdding: .day, value: $0 - leading, to: month)! }
  }
  static func format(_ date: Date) -> String {
    let formatter = DateFormatter()
    formatter.locale = Locale(identifier: "en_US_POSIX")
    formatter.dateFormat = "yyyy/MM/dd"
    return formatter.string(from: date)
  }
  func selectDate(_ date: Date) {
    let day = Calendar.current.startOfDay(for: date)
    if let start, end == nil {
      self.start = min(start, day)
      end = max(start, day)
      showDates = false
    } else {
      start = day
      end = nil
    }
  }
  func acceptFiles(_ urls: [URL]) {
    guard urls.allSatisfy({ ["txt", "md", "pdf"].contains($0.pathExtension.lowercased()) }) else {
      files = []
      result = "仅支持 .txt、.md、.pdf 文件。"
      return
    }
    files = urls
  }
  func chooseFiles() {
    let panel = NSOpenPanel()
    panel.canChooseDirectories = false
    panel.allowsMultipleSelection = true
    panel.allowedContentTypes = ["txt", "md", "pdf"].compactMap { UTType(filenameExtension: $0) }
    guard let window = NSApp.keyWindow else { return }
    panel.beginSheetModal(for: window) { [weak self] response in
      if response == .OK { self?.acceptFiles(panel.urls) }
    }
  }
  func submit() {
    let trimmed = name.trimmingCharacters(in: .whitespacesAndNewlines)
    guard !trimmed.isEmpty else {
      result = "请输入姓名。"
      return
    }
    guard email.range(of: #"^[^\s@]+@[^\s@]+\.[^\s@]+$"#, options: .regularExpression) != nil else {
      result = "请输入有效的邮箱地址。"
      return
    }
    guard let role else {
      result = "请选择角色。"
      return
    }
    guard start != nil, end != nil else {
      result = "请选择日期范围。"
      return
    }
    guard agreed else {
      result = "请先同意示例条款。"
      return
    }
    result = "已提交：\(trimmed) · \(role) · \(dateText) · \(files.count) 个文件"
  }
  func reset() {
    name = ""
    email = ""
    bio = ""
    quantity = 1
    role = nil
    start = nil
    end = nil
    files = []
    agreed = false
    notifications = true
    showDates = false
    showRoles = false
    result = "表单已重置。"
  }
}

enum FloatingOverlay: Hashable { case modal, drawer }

@MainActor final class FloatingModel: ObservableObject {
  @Published var overlay: FloatingOverlay?
  @Published var popover = false
  @Published var dropdown = false
  @Published var name = "Timeless"
  @Published var error = ""
  @Published var result = "尚未保存。页面切换保留输入并关闭浮层。"
  func openModal() {
    error = ""
    overlay = .modal
  }
  func save() {
    let trimmed = name.trimmingCharacters(in: .whitespacesAndNewlines)
    guard !trimmed.isEmpty else {
      error = "请输入显示名称。"
      return
    }
    result = "已保存：\(trimmed)"
    overlay = nil
  }
  func dismiss() {
    overlay = nil
    popover = false
    dropdown = false
  }
  func editProfile() {
    result = "DropdownMenu：编辑资料"
    dropdown = false
  }
  func copyName() {
    result = "DropdownMenu：\(name)"
    dropdown = false
  }
  func copyContext() { result = "ContextMenu：复制" }
}

@MainActor final class ComponentsModel: ObservableObject {
  @Published var tab = 0
  @Published var accordion: Int? = 0
  @Published var multiple: Set<Int> = []
  @Published private(set) var step = 0
  @Published private(set) var progress = 60
  @Published private(set) var storeProgress = 30
  static let tabs = ["账户", "密码", "通知"]
  static let panels = ["账户设置内容。", "密码设置内容。", "通知偏好设置。"]
  func advanceStep(_ delta: Int) { step = min(2, max(0, step + delta)) }
  func advanceProgress(_ delta: Int) {
    progress = min(100, max(0, progress + delta))
    storeProgress = min(100, max(0, storeProgress + delta))
  }
  func toggleAccordion(_ index: Int) { accordion = accordion == index ? nil : index }
  func toggleMultiple(_ index: Int) {
    if multiple.contains(index) { multiple.remove(index) } else { multiple.insert(index) }
  }
}

struct Invoice: Identifiable {
  let number: Int
  let status: String
  let method: String
  let amount: String
  var id: String { String(format: "INV%03d", number) }
}

@MainActor final class InvoiceModel: ObservableObject {
  @Published private(set) var page = 1
  static let pageSize = 20
  static let pageCount = 10
  static let invoices: [Invoice] = {
    let samples = [
      ("已支付", "信用卡", "¥250.00"), ("待支付", "支付宝", "¥150.00"),
      ("未支付", "银行转账", "¥350.00"), ("已支付", "信用卡", "¥450.00"),
      ("已支付", "微信支付", "¥550.00"), ("待支付", "银行转账", "¥200.00"),
      ("未支付", "信用卡", "¥300.00"),
    ]
    return (1...200).map { number in
      let sample = samples[(number - 1) % samples.count]
      return Invoice(number: number, status: sample.0, method: sample.1, amount: sample.2)
    }
  }()
  var rows: ArraySlice<Invoice> {
    Self.invoices[((page - 1) * Self.pageSize)..<(page * Self.pageSize)]
  }
  var summary: String { "第 \(page) / \(Self.pageCount) 页 · 共 \(Self.invoices.count) 条账单" }
  func select(_ number: Int) {
    guard (1...Self.pageCount).contains(number) else { return }
    page = number
  }
}

@MainActor final class ScrollingModel: ObservableObject {
  @Published private(set) var count = 10_000
  @Published var position = "尚未滚动"
  @Published var scrollPosition = "横向 0 · 纵向 0"
  @Published private(set) var request = UUID()
  private(set) var target = 0
  func scroll(to row: Int) {
    target = min(count - 1, max(0, row))
    request = UUID()
  }
  func toggleCount() {
    count = count == 10_000 ? 100 : 10_000
    scroll(to: min(target, count - 1))
  }
}

enum TransitionEffect: String, CaseIterable, Identifiable {
  case fade, bottom, zoom, right
  var id: String { rawValue }
  var title: String {
    switch self {
    case .fade: return "Fade / 淡入淡出"
    case .bottom: return "Slide / 从底部滑入"
    case .zoom: return "Zoom / 缩放与淡入"
    case .right: return "Slide / 从右侧滑入"
    }
  }
}

@MainActor final class TransitionModel: ObservableObject {
  enum StickyState { case visible, exiting, hidden }
  @Published var visible: Set<TransitionEffect> = []
  @Published private(set) var sticky = StickyState.visible
  private var completion: Task<Void, Never>?
  var stickyStatus: String {
    switch sticky {
    case .visible: return "显示中"
    case .exiting: return "正在消失…"
    case .hidden: return "动画结束，保持隐藏；布局位置保留。"
    }
  }
  func show(_ effect: TransitionEffect) { visible.insert(effect) }
  func hide(_ effect: TransitionEffect) { visible.remove(effect) }
  func hideSticky(reducedMotion: Bool = false) {
    guard sticky == .visible else { return }
    sticky = .exiting
    completion?.cancel()
    completion = Task { [weak self] in
      try? await Task.sleep(nanoseconds: reducedMotion ? 0 : 300_000_000)
      guard !Task.isCancelled else { return }
      self?.sticky = .hidden
    }
  }
  func restore() {
    completion?.cancel()
    sticky = .visible
  }
  func reset() {
    visible = []
    restore()
  }
}

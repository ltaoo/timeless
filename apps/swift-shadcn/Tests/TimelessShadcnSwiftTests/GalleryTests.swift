import AppKit
import SwiftUI
import XCTest

@testable import TimelessShadcnSwift

final class GalleryTests: XCTestCase {
  @MainActor func testHistoryRetainsStateAndDiscardsForwardBranch() {
    let model = GalleryModel()
    XCTAssertEqual(model.page, .general)
    XCTAssertEqual(GalleryPage.allCases.count, 10)
    model.count = 3
    model.form.name = "Ada"
    model.navigate(.general)
    XCTAssertFalse(model.canGoBack)
    model.navigate(.floating)
    model.floating.openModal()
    model.floating.name = "Timeless Swift"
    model.navigate(.table)
    XCTAssertNil(model.floating.overlay)
    model.back()
    XCTAssertEqual(model.page, .floating)
    XCTAssertEqual(model.floating.name, "Timeless Swift")
    model.back()
    XCTAssertEqual(model.count, 3)
    XCTAssertEqual(model.form.name, "Ada")
    model.navigate(.layout)
    XCTAssertFalse(model.canGoForward)
    model.forward()
    XCTAssertEqual(model.page, .layout)
  }

  @MainActor func testFormValidationDatesFilesAndReset() {
    let model = FormModel()
    model.submit()
    XCTAssertEqual(model.result, "请输入姓名。")
    model.name = " Ada "
    model.email = "invalid"
    model.submit()
    XCTAssertEqual(model.result, "请输入有效的邮箱地址。")
    model.email = "ada@example.com"
    model.submit()
    XCTAssertEqual(model.result, "请选择角色。")
    model.role = "developer"
    model.submit()
    XCTAssertEqual(model.result, "请选择日期范围。")
    let today = Calendar.current.startOfDay(for: Date())
    let yesterday = Calendar.current.date(byAdding: .day, value: -1, to: today)!
    model.selectDate(today)
    model.selectDate(yesterday)
    XCTAssertEqual(model.start, yesterday)
    XCTAssertEqual(model.end, today)
    model.submit()
    XCTAssertEqual(model.result, "请先同意示例条款。")
    model.agreed = true
    model.acceptFiles([
      URL(fileURLWithPath: "/tmp/notes.md"), URL(fileURLWithPath: "/tmp/receipt.pdf"),
    ])
    model.submit()
    XCTAssertEqual(model.result, "已提交：Ada · developer · \(model.dateText) · 2 个文件")
    model.acceptFiles([URL(fileURLWithPath: "/tmp/disallowed.exe")])
    XCTAssertTrue(model.files.isEmpty)
    XCTAssertEqual(model.result, "仅支持 .txt、.md、.pdf 文件。")
    model.setQuantity(1000)
    XCTAssertEqual(model.quantity, 99)
    model.setQuantity(-10)
    XCTAssertEqual(model.quantity, 1)
    model.reset()
    XCTAssertEqual(model.result, "表单已重置。")
    XCTAssertTrue(model.name.isEmpty)
    XCTAssertNil(model.role)
    XCTAssertNil(model.start)
    XCTAssertFalse(model.agreed)
    XCTAssertTrue(model.notifications)
  }

  @MainActor func testCalendarMonthsDoNotCrossAndIncludeSixWeeks() {
    let model = FormModel()
    model.moveMonth(left: true, delta: 1)
    XCTAssertEqual(model.leftMonthOffset, 0)
    model.moveMonth(left: false, delta: -1)
    XCTAssertEqual(model.rightMonthOffset, 1)
    model.moveMonth(left: false, delta: 1)
    model.moveMonth(left: true, delta: 1)
    XCTAssertEqual(model.leftMonthOffset, 1)
    XCTAssertEqual(model.rightMonthOffset, 2)
    let days = model.days(in: model.monthDate(offset: 0))
    XCTAssertEqual(days.count, 42)
    XCTAssertEqual(Calendar.current.component(.weekday, from: days[0]), 2)
  }

  @MainActor func testFloatingValidationAndDismissal() {
    let model = FloatingModel()
    model.openModal()
    model.name = " "
    model.save()
    XCTAssertEqual(model.error, "请输入显示名称。")
    XCTAssertEqual(model.overlay, .modal)
    model.name = " Swift "
    model.save()
    XCTAssertNil(model.overlay)
    XCTAssertEqual(model.result, "已保存：Swift")
    model.copyName()
    XCTAssertEqual(model.result, "DropdownMenu： Swift ")
    model.overlay = .drawer
    model.popover = true
    model.dropdown = true
    model.dismiss()
    XCTAssertNil(model.overlay)
    XCTAssertFalse(model.popover)
    XCTAssertFalse(model.dropdown)
  }

  @MainActor func testComponentBoundsAndIndependentAccordionItems() {
    let model = ComponentsModel()
    model.advanceStep(-100)
    XCTAssertEqual(model.step, 0)
    model.advanceStep(100)
    XCTAssertEqual(model.step, 2)
    model.advanceProgress(100)
    XCTAssertEqual(model.progress, 100)
    XCTAssertEqual(model.storeProgress, 100)
    model.advanceProgress(-1000)
    XCTAssertEqual(model.progress, 0)
    XCTAssertEqual(model.storeProgress, 0)
    model.toggleAccordion(1)
    XCTAssertEqual(model.accordion, 1)
    model.toggleAccordion(1)
    XCTAssertNil(model.accordion)
    model.toggleMultiple(0)
    model.toggleMultiple(1)
    XCTAssertEqual(model.multiple, [0, 1])
  }

  @MainActor func testTenPagesMatchSharedInvoiceFixtures() {
    let model = InvoiceModel()
    var seen = Set<String>()
    model.select(0)
    XCTAssertEqual(model.page, 1)
    for page in 1...10 {
      model.select(page)
      XCTAssertEqual(model.rows.count, 20)
      for row in model.rows { seen.insert(row.id) }
    }
    XCTAssertEqual(seen.count, 200)
    XCTAssertEqual(model.rows.first?.id, "INV181")
    XCTAssertEqual(model.rows.last?.id, "INV200")
    XCTAssertEqual(InvoiceModel.invoices[0].amount, "¥250.00")
    XCTAssertEqual(InvoiceModel.invoices[6].amount, "¥300.00")
    model.select(11)
    XCTAssertEqual(model.summary, "第 10 / 10 页 · 共 200 条账单")
  }

  @MainActor func testTransitionsCancelPendingCompletionWhenReset() async throws {
    let model = TransitionModel()
    model.show(.fade)
    XCTAssertTrue(model.visible.contains(.fade))
    model.hide(.fade)
    XCTAssertFalse(model.visible.contains(.fade))
    model.hideSticky()
    XCTAssertEqual(model.sticky, .exiting)
    model.reset()
    try await Task.sleep(nanoseconds: 350_000_000)
    XCTAssertEqual(model.sticky, .visible)
    model.hideSticky(reducedMotion: true)
    try await Task.sleep(nanoseconds: 10_000_000)
    XCTAssertEqual(model.sticky, .hidden)
    model.restore()
    XCTAssertEqual(model.sticky, .visible)
  }

  @MainActor func testLucideIconsDecodeWithoutJavaScript() {
    for icon in Set(
      GalleryPage.allCases.map(\.icon) + [
        "sun", "moon", "arrow-left", "arrow-right", "chevron-left", "chevron-right", "chevron-down",
        "check", "x", "calendar", "file",
      ])
    {
      XCTAssertTrue(IconAssets.image(icon)?.isValid == true, icon)
    }
  }

  @MainActor func testVirtualListReusesRowsAndClampsScrollWhenShrinking() {
    _ = NSApplication.shared
    let model = ScrollingModel()
    let controller = VirtualListController(model: model)
    controller.loadViewIfNeeded()
    controller.view.frame = NSRect(x: 0, y: 0, width: 560, height: 288)
    controller.update(theme: GalleryTheme(dark: false))
    controller.view.layoutSubtreeIfNeeded()
    XCTAssertEqual(controller.table.numberOfRows, 10_000)
    model.scroll(to: 5000)
    controller.update(theme: GalleryTheme(dark: false))
    XCTAssertGreaterThan(controller.scroll.contentView.bounds.minY, 200_000)
    model.scroll(to: 20_000)
    XCTAssertEqual(model.target, 9999)
    model.toggleCount()
    controller.update(theme: GalleryTheme(dark: true))
    XCTAssertEqual(controller.table.numberOfRows, 100)
    XCTAssertEqual(model.target, 99)
    XCTAssertLessThanOrEqual(
      controller.scroll.contentView.bounds.maxY, controller.table.bounds.height + 1)
    var rows = 0
    controller.table.enumerateAvailableRowViews { _, _ in rows += 1 }
    XCTAssertLessThan(rows, 100)
  }

  @MainActor func testAllPagesRenderInBothThemesAndExportPreviews() throws {
    _ = NSApplication.shared
    let model = GalleryModel()
    let host = NSHostingView(rootView: GalleryRoot(model: model))
    let window = NSWindow(
      contentRect: NSRect(x: 0, y: 0, width: 800, height: 560), styleMask: [.titled, .resizable],
      backing: .buffered, defer: false)
    window.contentView = host
    defer { window.orderOut(nil) }
    let previews = URL(fileURLWithPath: #filePath).deletingLastPathComponent()
      .deletingLastPathComponent().deletingLastPathComponent().appendingPathComponent(
        "build/previews")
    try FileManager.default.createDirectory(at: previews, withIntermediateDirectories: true)
    for dark in [false, true] {
      model.dark = dark
      for page in GalleryPage.allCases {
        model.navigate(page)
        settle(host)
        XCTAssertEqual(host.bounds.width, 800, accuracy: 1)
        XCTAssertEqual(host.bounds.height, 560, accuracy: 1)
        let bitmap = try XCTUnwrap(host.bitmapImageRepForCachingDisplay(in: host.bounds))
        host.cacheDisplay(in: host.bounds, to: bitmap)
        let data = try XCTUnwrap(bitmap.representation(using: .png, properties: [:]))
        XCTAssertGreaterThan(data.count, 3000, page.rawValue)
        try data.write(
          to: previews.appendingPathComponent("\(page.rawValue)-\(dark ? "dark" : "light").png"))
      }
    }
    model.navigate(.table)
    func all(_ view: NSView) -> [NSView] { [view] + view.subviews.flatMap(all) }
    var previousHeight: CGFloat = 0
    for height: CGFloat in [560, 720, 960] {
      window.setContentSize(NSSize(width: 1000, height: height))
      settle(host)
      XCTAssertEqual(host.bounds.height, height, accuracy: 1)
      let scroll = try XCTUnwrap(all(host).compactMap { $0 as? NSScrollView }.first)
      XCTAssertGreaterThan(scroll.contentSize.height, previousHeight)
      previousHeight = scroll.contentSize.height
      XCTAssertGreaterThan(
        try XCTUnwrap(scroll.documentView).bounds.height, scroll.contentSize.height)
      let frame = host.convert(scroll.bounds, from: scroll)
      XCTAssertEqual(
        frame.maxY, height - 80, accuracy: 2, "Table reserves space for its bottom pagination")
    }
    for overlay in [FloatingOverlay.modal, .drawer] {
      model.navigate(.floating)
      model.floating.overlay = overlay
      settle(host)
      XCTAssertNotNil(host.window)
    }
  }

  @MainActor func testNativeMouseAndEscapeKeyboardInteraction() throws {
    _ = NSApplication.shared
    let model = GalleryModel()
    let host = NSHostingView(rootView: GalleryRoot(model: model))
    let window = NSWindow(
      contentRect: NSRect(x: 0, y: 0, width: 800, height: 560), styleMask: [.titled, .resizable],
      backing: .buffered, defer: false)
    window.contentView = host
    window.makeKeyAndOrderFront(nil)
    defer { window.orderOut(nil) }
    settle(host)
    func click(_ x: CGFloat, _ top: CGFloat) throws {
      for type in [NSEvent.EventType.leftMouseDown, .leftMouseUp] {
        let event = try XCTUnwrap(
          NSEvent.mouseEvent(
            with: type, location: NSPoint(x: x, y: 560 - top), modifierFlags: [], timestamp: 0,
            windowNumber: window.windowNumber, context: nil, eventNumber: 1, clickCount: 1,
            pressure: 1))
        window.sendEvent(event)
      }
      settle(host)
    }
    try click(250, 214)
    XCTAssertEqual(model.count, 1)
    try click(160, 32)
    XCTAssertTrue(model.dark)
    model.navigate(.table)
    settle(host)
    try click(732, 520)
    XCTAssertEqual(model.invoices.page, 10)
    model.navigate(.floating)
    model.floating.overlay = .drawer
    settle(host)
    let escape = try XCTUnwrap(
      NSEvent.keyEvent(
        with: .keyDown, location: .zero, modifierFlags: [], timestamp: 0,
        windowNumber: window.windowNumber, context: nil, characters: "\u{1b}",
        charactersIgnoringModifiers: "\u{1b}", isARepeat: false, keyCode: 53))
    window.sendEvent(escape)
    settle(host)
    XCTAssertNil(model.floating.overlay)
    model.floating.openModal()
    settle(host)
    XCTAssertTrue(window.firstResponder is NSTextView, "Modal initially focuses its name input")
    model.floating.dismiss()
    settle(host)
    func all(_ view: NSView) -> [NSView] { [view] + view.subviews.flatMap(all) }
    let firstResponder = window.firstResponder
    let tooltip = try XCTUnwrap(all(host).compactMap { $0 as? TooltipAnchorView }.first)
    tooltip.visible = true
    tooltip.updateTooltip()
    XCTAssertTrue(window.firstResponder === firstResponder, "Tooltip must not take keyboard focus")
    XCTAssertEqual(window.childWindows?.count, 1)
    tooltip.hideTooltip()
    let context = try XCTUnwrap(all(host).compactMap { $0 as? ContextRegionView }.first)
    XCTAssertTrue(context.accessibilityPerformShowMenu())
    XCTAssertTrue(context.popover.isShown)
    context.popover.close()
  }

  @MainActor func testClickingOutsideEditorsEndsEditingWithoutLosingValues() throws {
    _ = NSApplication.shared
    let model = GalleryModel()
    model.navigate(.dataEntry)
    let host = NSHostingView(rootView: GalleryRoot(model: model))
    let window = NSWindow(
      contentRect: NSRect(x: 0, y: 0, width: 800, height: 560), styleMask: [.titled, .resizable],
      backing: .buffered, defer: false)
    window.contentView = host
    window.makeKeyAndOrderFront(nil)
    defer { window.orderOut(nil) }
    settle(host)
    func all(_ view: NSView) -> [NSView] { [view] + view.subviews.flatMap(all) }
    let name = try XCTUnwrap(
      all(host).compactMap { $0 as? NSTextField }.first { $0.placeholderString == "请输入姓名" })
    let email = try XCTUnwrap(
      all(host).compactMap { $0 as? NSTextField }.first {
        $0.placeholderString == "name@example.com"
      })
    func click(_ point: NSPoint) throws {
      func event(_ type: NSEvent.EventType) throws -> NSEvent {
        try XCTUnwrap(
          NSEvent.mouseEvent(
            with: type, location: point, modifierFlags: [], timestamp: 0,
            windowNumber: window.windowNumber, context: nil, eventNumber: 1, clickCount: 1,
            pressure: 1))
      }
      // NSTextView tracks mouse selection synchronously until it dequeues mouse-up.
      NSApp.postEvent(try event(.leftMouseUp), atStart: false)
      NSApp.sendEvent(try event(.leftMouseDown))
      if let up = NSApp.nextEvent(
        matching: .leftMouseUp, until: Date(), inMode: .default, dequeue: true)
      {
        NSApp.sendEvent(up)
      }
      settle(host)
    }
    let namePoint = name.convert(NSPoint(x: 20, y: name.bounds.midY), to: nil)
    try click(namePoint)
    let editor = try XCTUnwrap(name.currentEditor())
    editor.insertText("Ada")
    settle(host)
    try click(namePoint)
    XCTAssertNotNil(name.currentEditor(), "Clicking within an input keeps its editor focused")
    try click(email.convert(NSPoint(x: 20, y: email.bounds.midY), to: nil))
    XCTAssertNotNil(email.currentEditor(), "Clicking a different input transfers focus")
    try click(NSPoint(x: 740, y: 440))
    XCTAssertNil(email.currentEditor(), "Clicking blank content must end editing")
    XCTAssertFalse(window.firstResponder is NSTextView)
    XCTAssertEqual(model.form.name, "Ada")
    try click(namePoint)
    try click(NSPoint(x: 160, y: 528))
    XCTAssertNil(name.currentEditor(), "Clicking a button outside the input also ends editing")
    XCTAssertTrue(model.dark, "Dismissing focus must not consume the button click")

    window.setContentSize(NSSize(width: 800, height: 1400))
    settle(host)
    let quantity = try XCTUnwrap(
      all(host).compactMap { $0 as? NSTextField }.first {
        $0.isEditable && $0 !== name && $0 !== email
      })
    let outside = NSPoint(x: 740, y: host.bounds.height - 120)
    try click(quantity.convert(NSPoint(x: 20, y: quantity.bounds.midY), to: nil))
    XCTAssertNotNil(quantity.currentEditor())
    try click(outside)
    XCTAssertNil(quantity.currentEditor(), "Number inputs also end editing on outside clicks")
    XCTAssertEqual(model.form.quantity, 1)
    let bio = try XCTUnwrap(all(host).compactMap { $0 as? NSTextView }.first { !$0.isFieldEditor })
    let bioPoint = bio.convert(NSPoint(x: 20, y: bio.bounds.midY), to: nil)
    XCTAssertTrue(window.makeFirstResponder(bio))
    try click(bioPoint)
    XCTAssertTrue(window.firstResponder === bio)
    bio.insertText("简介", replacementRange: bio.selectedRange())
    settle(host)
    try click(bioPoint)
    XCTAssertTrue(window.firstResponder === bio, "Clicking within a text editor keeps focus")
    try click(outside)
    XCTAssertFalse(window.firstResponder === bio)
    XCTAssertEqual(model.form.bio, "简介")
  }

  @MainActor private func settle(_ host: NSView) {
    RunLoop.main.run(until: Date().addingTimeInterval(0.08))
    host.layoutSubtreeIfNeeded()
    host.displayIfNeeded()
  }
}

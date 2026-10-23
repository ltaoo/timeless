import Cocoa
import XCTest
@testable import TimelessMacOS

final class SharedComponentsTests: XCTestCase {
    func testEmptyTextDoesNotCreateALineBox() {
        let node = YogaLayoutEngine.buildYogaTree(from: .text(value: "", style: [:], jsValue: nil))
        defer { YogaLayoutEngine.freeTree(node) }
        YogaLayoutEngine.calculateLayout(node, width: 100)
        XCTAssertEqual(YogaLayoutEngine.frame(of: node).height, 0)
    }

    func testShadcnNavigationDisplayAndFeedback() throws {
        guard let path = ProcessInfo.processInfo.environment["TIMELESS_MACOS_TEST_BUNDLE"] else { throw XCTSkip("Set TIMELESS_MACOS_TEST_BUNDLE") }
        _ = NSApplication.shared
        let bridge = JSBridge(devScriptPath: path)
        let renderer = NativeViewRenderer(bridge: bridge)
        var root: NSView?
        bridge.onRender = { root = renderer.render($0, containerWidth: 1000, containerHeight: 800) }
        bridge.onRelayout = { renderer.relayout() }
        bridge.run()
        let view = try XCTUnwrap(root)
        let window = NSWindow(contentRect: view.bounds, styleMask: [.titled], backing: .buffered, defer: false)
        window.contentView = view
        defer { window.orderOut(nil) }
        func settle() { RunLoop.main.run(until: Date().addingTimeInterval(0.04)); renderer.relayout() }
        func all(_ node: NSView) -> [NSView] { [node] + node.subviews.flatMap(all) }
        func element(_ name: String) throws -> NSView { try XCTUnwrap(all(view).first { $0.identifier?.rawValue == name }, name) }
        func text(_ name: String) throws -> String { all(try element(name)).compactMap { ($0 as? NSTextField)?.stringValue }.joined() }
        func press(_ name: String) throws { XCTAssertTrue(try XCTUnwrap(element(name) as? FlippedView).accessibilityPerformPress()); settle() }
        func reveal(_ name: String) throws {
            let target = try element(name)
            let scroll = try XCTUnwrap(element("route-scroll") as? NativeScrollView)
            let document = try XCTUnwrap(scroll.documentView)
            let bounds = target.convert(target.bounds, to: document)
            scroll.contentView.scroll(to: NSPoint(x: 0, y: max(0, min(bounds.minY - 40, document.frame.height - scroll.contentSize.height))))
            scroll.reflectScrolledClipView(scroll.contentView)
            settle()
            XCTAssertFalse(target.visibleRect.isEmpty)
        }
        func capture(_ name: String) throws {
            guard let directory = ProcessInfo.processInfo.environment["TIMELESS_MACOS_SCREENSHOTS"] else { return }
            let url = URL(fileURLWithPath: directory)
            try FileManager.default.createDirectory(at: url, withIntermediateDirectories: true)
            window.displayIfNeeded()
            let bitmap = try XCTUnwrap(view.bitmapImageRepForCachingDisplay(in: view.bounds))
            view.cacheDisplay(in: view.bounds, to: bitmap)
            try XCTUnwrap(bitmap.representation(using: .png, properties: [:])).write(to: url.appendingPathComponent("\(name).png"))
        }
        settle()
        try press("nav-navigation")
        XCTAssertEqual(try text("components-panel-account"), "账户设置内容。")
        try press("components-tabs-tab-password")
        XCTAssertEqual(try text("components-panel-password"), "密码设置内容。")
        let tabLabel = try XCTUnwrap(all(try element("components-tabs-tab-password")).compactMap { $0 as? NSTextField }.first)
        XCTAssertGreaterThanOrEqual(tabLabel.frame.width, tabLabel.cell?.cellSize.width ?? 0)
        let tab = try XCTUnwrap(element("components-tabs-tab-password") as? FlippedView)
        XCTAssertTrue(window.makeFirstResponder(tab))
        let right = try XCTUnwrap(NSEvent.keyEvent(with: .keyDown, location: .zero, modifierFlags: [], timestamp: 0, windowNumber: window.windowNumber, context: nil, characters: "\u{F703}", charactersIgnoringModifiers: "\u{F703}", isARepeat: false, keyCode: 124))
        tab.keyDown(with: right); settle()
        XCTAssertEqual(try text("components-panel-notifications"), "通知偏好设置。")
        XCTAssertTrue(window.firstResponder === (try element("components-tabs-tab-notifications")))
        XCTAssertFalse(try element("components-accordion-content-0").isHidden)
        XCTAssertTrue(try element("components-accordion-content-1").isHidden)
        try press("components-accordion-trigger-1")
        XCTAssertTrue(try element("components-accordion-content-0").isHidden)
        XCTAssertFalse(try element("components-accordion-content-1").isHidden)
        XCTAssertGreaterThan(try element("components-accordion-content-1").frame.height, 0)
        let accordionTrigger = try XCTUnwrap(element("components-accordion-trigger-0") as? FlippedView)
        XCTAssertTrue(window.makeFirstResponder(accordionTrigger))
        for type in [NSEvent.EventType.keyDown, .keyUp] {
            let enter = try XCTUnwrap(NSEvent.keyEvent(with: type, location: .zero, modifierFlags: [], timestamp: 0, windowNumber: window.windowNumber, context: nil, characters: "\r", charactersIgnoringModifiers: "\r", isARepeat: false, keyCode: 36))
            if type == .keyDown { accordionTrigger.keyDown(with: enter) } else { accordionTrigger.keyUp(with: enter) }
        }
        settle()
        XCTAssertFalse(try element("components-accordion-content-0").isHidden)
        XCTAssertTrue(try element("components-accordion-content-1").isHidden)
        try press("components-accordion-trigger-1")
        try press("components-multiple-trigger-0")
        try press("components-multiple-trigger-1")
        XCTAssertFalse(try element("components-multiple-content-0").isHidden)
        XCTAssertFalse(try element("components-multiple-content-1").isHidden)
        try capture("shared-components-navigation")
        try reveal("components-step-next")
        let circles = all(try element("components-steps")).compactMap { $0 as? FlippedView }.filter { $0.jsNode?.forProperty("attrs")?.forProperty("class")?.toString().contains("tt-h-8") == true }
        XCTAssertEqual(circles.count, 3)
        XCTAssertEqual(circles.first?.frame.width ?? 0, 32, accuracy: 0.1)
        try press("components-step-next")
        XCTAssertEqual(try text("components-step-value"), "步骤 2 / 3")
        XCTAssertTrue(try text("components-steps").contains("✓"))
        try capture("shared-components-steps")
        try press("nav-data_display")
        for variant in ["default", "secondary", "outline", "destructive"] {
            XCTAssertEqual(try text("components-badge-\(variant)"), variant)
            XCTAssertGreaterThan(try element("components-badge-\(variant)").frame.height, 15)
            let label = try XCTUnwrap(all(try element("components-badge-\(variant)")).compactMap { $0 as? NSTextField }.first)
            XCTAssertGreaterThanOrEqual(label.frame.width, label.cell?.cellSize.width ?? 0)
        }
        XCTAssertEqual(try element("components-badge-default").layer?.borderColor?.alpha ?? 1, 0, accuracy: 0.01)
        for (size, width) in [("sm", 32.0), ("default", 40.0), ("lg", 48.0)] {
            let avatar = try element("components-avatar-\(size)")
            XCTAssertEqual(avatar.frame.width, width, accuracy: 0.1)
            XCTAssertEqual(avatar.frame.height, width, accuracy: 0.1)
            XCTAssertEqual(avatar.layer?.cornerRadius ?? 0, width / 2, accuracy: 0.1)
        }
        XCTAssertEqual(try text("components-avatar-default"), "M")
        XCTAssertEqual(try element("components-separator-horizontal").frame.height, 1, accuracy: 0.1)
        XCTAssertEqual(try element("components-separator-vertical").frame.width, 1, accuracy: 0.1)
        XCTAssertGreaterThan(try element("components-separator-vertical").frame.height, 20)
        XCTAssertEqual(try text("components-alert-title"), "Heads up!")
        XCTAssertEqual(try text("components-alert-error-title"), "Error")
        XCTAssertNotEqual(try element("components-alert-error").layer?.borderColor, try element("components-alert").layer?.borderColor)
        try capture("shared-components-display")
        try reveal("components-progress-increase")
        let progress = try element("components-progress")
        let indicator = try XCTUnwrap(progress.subviews.first)
        let stored = try element("components-progress-store")
        let storedIndicator = try XCTUnwrap(stored.subviews.first)
        XCTAssertEqual(progress.frame.height, 16, accuracy: 0.1)
        XCTAssertEqual(indicator.frame.width / progress.frame.width, 0.6, accuracy: 0.01)
        try press("components-progress-increase")
        XCTAssertEqual(indicator.frame.width / progress.frame.width, 0.7, accuracy: 0.01)
        XCTAssertEqual(storedIndicator.frame.width / stored.frame.width, 0.4, accuracy: 0.01)
        XCTAssertEqual(try element("components-skeleton-card").frame.height, 96, accuracy: 0.1)
        XCTAssertEqual(try element("components-skeleton-line").frame.height, 16, accuracy: 0.1)
        let light = try element("components-skeleton-card").layer?.backgroundColor
        try press("theme-toggle")
        XCTAssertNotEqual(try element("components-skeleton-card").layer?.backgroundColor, light)
        try reveal("components-skeleton-card")
        try capture("shared-components-feedback-dark")
        try press("nav-navigation")
        XCTAssertEqual(try text("components-panel-notifications"), "通知偏好设置。")
        XCTAssertFalse(try element("components-accordion-content-1").isHidden)
        XCTAssertEqual(try text("components-step-value"), "步骤 2 / 3")
        try press("nav-data_display")
        XCTAssertEqual(try text("components-store-value"), "Store：40%")
        XCTAssertTrue(bridge.runtimeErrors.isEmpty, bridge.runtimeErrors.joined(separator: "\n"))
    }
}

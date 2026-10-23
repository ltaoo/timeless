import Cocoa
import XCTest
@testable import TimelessMacOS

final class SharedTableTests: XCTestCase {
    func testShadcnTablePaginationAndThemes() throws {
        guard let path = ProcessInfo.processInfo.environment["TIMELESS_MACOS_TEST_BUNDLE"] else { throw XCTSkip("Set TIMELESS_MACOS_TEST_BUNDLE") }
        _ = NSApplication.shared
        let bridge = JSBridge(devScriptPath: path)
        let renderer = NativeViewRenderer(bridge: bridge)
        var root: NSView?
        bridge.onRender = { root = renderer.render($0, containerWidth: 800, containerHeight: 560) }
        bridge.onRelayout = { renderer.relayout() }
        bridge.run()
        let view = try XCTUnwrap(root)
        let window = NSWindow(contentRect: view.bounds, styleMask: [.titled], backing: .buffered, defer: false)
        window.contentView = view
        defer { window.makeFirstResponder(nil); window.orderOut(nil) }
        func all(_ node: NSView) -> [NSView] { [node] + node.subviews.flatMap(all) }
        func find(_ name: String) throws -> NSView { try XCTUnwrap(all(view).first { $0.identifier?.rawValue == name }, name) }
        func text(_ name: String) throws -> String { all(try find(name)).compactMap { ($0 as? NSTextField)?.stringValue }.joined() }
        func settle() { RunLoop.main.run(until: Date().addingTimeInterval(0.04)); renderer.relayout() }
        func press(_ name: String) throws { XCTAssertTrue(try XCTUnwrap(find(name) as? FlippedView).accessibilityPerformPress()); settle() }
        settle()
        try press("nav-table")
        XCTAssertTrue(try text("invoices-body").contains("INV001"))
        let previous = try XCTUnwrap(find("invoices-previous") as? FlippedView)
        XCTAssertTrue(previous.disabled)
        XCTAssertFalse(previous.accessibilityPerformPress())
        let selected = try find("invoices-page-1")
        XCTAssertEqual(selected.layer?.borderWidth, 1)
        XCTAssertGreaterThan(selected.layer?.borderColor?.alpha ?? 0, 0)
        XCTAssertEqual(all(try find("invoices-heading-3")).compactMap { $0 as? NSTextField }.first?.alignment, .right)
        if let directory = ProcessInfo.processInfo.environment["TIMELESS_MACOS_SCREENSHOTS"] {
            try FileManager.default.createDirectory(atPath: directory, withIntermediateDirectories: true)
            window.displayIfNeeded()
            let bitmap = try XCTUnwrap(view.bitmapImageRepForCachingDisplay(in: view.bounds))
            view.cacheDisplay(in: view.bounds, to: bitmap)
            try XCTUnwrap(bitmap.representation(using: .png, properties: [:])).write(to: URL(fileURLWithPath: directory).appendingPathComponent("shared-table.png"))
        }
        for width: CGFloat in [800, 760, 1000] {
            renderer.relayout(containerWidth: width, containerHeight: 560); settle()
            let row = try find("invoice-row-1")
            let header = try find("invoices-heading-row")
            XCTAssertGreaterThan(row.frame.height, 40)
            XCTAssertEqual(row.subviews.count, 4)
            for (cell, heading) in zip(row.subviews, header.subviews) {
                XCTAssertEqual(cell.frame.minX, heading.frame.minX, accuracy: 1)
                XCTAssertEqual(cell.frame.width, heading.frame.width, accuracy: 1)
                XCTAssertGreaterThan(cell.frame.width, 80)
            }
            let scroll = try XCTUnwrap(find("route-scroll") as? NativeScrollView)
            XCTAssertLessThanOrEqual(try XCTUnwrap(scroll.documentView).frame.width, scroll.contentSize.width + 1)
        }
        var previousHeight: CGFloat = 0
        for height: CGFloat in [560, 720, 960] {
            renderer.relayout(containerWidth: 1000, containerHeight: height); settle()
            let viewport = try XCTUnwrap(find("invoices-scroll") as? NativeScrollView)
            let footer = try find("invoices-footer")
            let page = try find("table-page")
            let routeScroll = try XCTUnwrap(find("route-scroll") as? NativeScrollView)
            XCTAssertGreaterThan(viewport.frame.height, previousHeight)
            previousHeight = viewport.frame.height
            XCTAssertGreaterThan(try XCTUnwrap(viewport.documentView).frame.height, viewport.contentSize.height)
            XCTAssertEqual(footer.frame.maxY, page.bounds.height, accuracy: 1)
            XCTAssertEqual(try XCTUnwrap(routeScroll.documentView).frame.height, routeScroll.contentSize.height, accuracy: 1)
            let summary = try find("invoices-summary")
            let pagination = try find("invoices-pagination")
            XCTAssertGreaterThanOrEqual(pagination.frame.minX, summary.frame.maxX)
        }
        let row = try XCTUnwrap(find("invoice-row-1") as? FlippedView)
        let border = try XCTUnwrap(row.decoration.borderLayers["bottom"])
        XCTAssertEqual(border.frame.height, 1)
        XCTAssertEqual(border.frame.width, row.frame.width)
        let light = border.backgroundColor
        try press("theme-toggle")
        XCTAssertNotEqual(border.backgroundColor, light)
        let next = try XCTUnwrap(find("invoices-next") as? FlippedView)
        let point = next.convert(NSPoint(x: next.bounds.midX, y: next.bounds.midY), to: nil)
        XCTAssertTrue(view.hitTest(view.superview!.convert(point, from: nil)) === next)
        func mouse(_ type: NSEvent.EventType) throws -> NSEvent {
            try XCTUnwrap(NSEvent.mouseEvent(with: type, location: point, modifierFlags: [], timestamp: 0, windowNumber: window.windowNumber, context: nil, eventNumber: 1, clickCount: 1, pressure: 1))
        }
        next.mouseDown(with: try mouse(.leftMouseDown))
        next.mouseUp(with: try mouse(.leftMouseUp)); settle()
        XCTAssertTrue(try text("invoices-body").contains("INV021"))
        XCTAssertFalse(try text("invoices-body").contains("INV001"))
        XCTAssertEqual(try XCTUnwrap(find("invoices-page-2") as? FlippedView).jsNode?.forProperty("attrs")?.forProperty("aria-current")?.toString(), "page")
        try press("invoices-page-10")
        XCTAssertTrue(try text("invoices-body").contains("INV181"))
        XCTAssertTrue(try text("invoices-body").contains("INV200"))
        XCTAssertTrue(next.disabled)
        XCTAssertFalse(next.accessibilityPerformPress())
        try press("invoices-previous")
        XCTAssertTrue(try text("invoices-summary").contains("第 9 / 10 页"))
        try press("nav-general"); try press("nav-table")
        XCTAssertTrue(try text("invoices-body").contains("INV161"))
        XCTAssertTrue(bridge.runtimeErrors.isEmpty, bridge.runtimeErrors.joined(separator: "\n"))
    }
}

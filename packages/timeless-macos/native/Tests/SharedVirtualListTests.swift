import Cocoa
import XCTest
@testable import TimelessMacOS

final class SharedVirtualListTests: XCTestCase {
    func testNativeTableVirtualizesScrollsResizesAndReloadsSharedRows() throws {
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
        func all(_ node: NSView) -> [NSView] { [node] + node.subviews.flatMap(all) }
        func find(_ name: String) throws -> NSView { try XCTUnwrap(all(view).first { $0.identifier?.rawValue == name }, name) }
        func settle() { RunLoop.main.run(until: Date().addingTimeInterval(0.04)); renderer.relayout(); view.layoutSubtreeIfNeeded() }
        func click(_ name: String) throws { XCTAssertTrue(try XCTUnwrap(find(name) as? FlippedView).accessibilityPerformPress()); settle() }
        settle()
        try click("nav-scroll")
        let list = try XCTUnwrap(find("virtual-list") as? NativeVirtualList)
        let js = try XCTUnwrap(list.jsNode)
        func checkRows() throws {
            let count = js.forProperty("children")?.forProperty("length")?.toInt32() ?? 0
            XCTAssertGreaterThan(count, 0)
            XCTAssertLessThan(count, 40, "NSTableView must recycle rows instead of mounting all 10,000")
            XCTAssertEqual(list.table.tableColumns.count, 1)
            XCTAssertLessThanOrEqual(list.table.frame.width, list.contentSize.width + 1)
            let visible = list.table.rows(in: list.contentView.bounds)
            XCTAssertGreaterThan(visible.length, 0)
            let cell = try XCTUnwrap(list.table.view(atColumn: 0, row: visible.location, makeIfNecessary: false))
            XCTAssertTrue(all(cell).contains { ($0 as? NSTextField)?.stringValue == "列表项目 \(visible.location + 1)" })
        }
        XCTAssertEqual(list.table.numberOfRows, 10000)
        XCTAssertEqual(list.table.accessibilityLabel(), "一万条项目")
        XCTAssertEqual(list.frame.height, 288, accuracy: 1)
        try checkRows()
        for button in ["virtual-list-middle", "virtual-list-end", "virtual-list-start", "virtual-list-middle", "virtual-list-start"] {
            try click(button)
            try checkRows()
            let top = list.contentView.bounds.minY
            if button.hasSuffix("middle") { XCTAssertEqual(top, 240000, accuracy: 1) }
            if button.hasSuffix("end") { XCTAssertEqual(top, list.table.frame.height - list.contentSize.height, accuracy: 1) }
            if button.hasSuffix("start") { XCTAssertEqual(top, 0, accuracy: 1) }
            XCTAssertEqual(js.forProperty("scrollTop")?.toDouble() ?? -1, top, accuracy: 1)
        }
        // Exercise native viewport scrolling, independently of the shared jump buttons.
        list.contentView.scroll(to: NSPoint(x: 0, y: 960))
        list.reflectScrolledClipView(list.contentView)
        settle()
        try checkRows()
        XCTAssertEqual(js.forProperty("scrollTop")?.toDouble() ?? -1, 960, accuracy: 1)
        for index in 0..<30 {
            list.contentView.scroll(to: NSPoint(x: 0, y: CGFloat(index * 12000)))
            list.reflectScrolledClipView(list.contentView)
            settle()
            try checkRows()
        }
        try click("virtual-list-end")
        try click("virtual-list-count")
        XCTAssertEqual(list.table.numberOfRows, 100)
        XCTAssertLessThanOrEqual(list.contentView.bounds.minY, 4800 - list.contentSize.height)
        try checkRows()
        try click("virtual-list-count")
        XCTAssertEqual(list.table.numberOfRows, 10000)
        renderer.relayout(containerWidth: 760, containerHeight: 800)
        settle()
        try checkRows()
        try click("theme-toggle")
        try checkRows()
        try click("nav-general")
        try click("nav-scroll")
        try checkRows()

        let scroll = try XCTUnwrap(find("scroll-example") as? NativeScrollView)
        scroll.contentView.scroll(to: NSPoint(x: 100, y: 40))
        scroll.reflectScrolledClipView(scroll.contentView)
        settle()
        XCTAssertEqual(scroll.contentView.bounds.minX, 100, accuracy: 1)
        XCTAssertEqual(scroll.contentView.bounds.minY, 40, accuracy: 1)
        XCTAssertEqual(scroll.jsNode?.forProperty("clientHeight")?.toDouble() ?? -1, scroll.contentSize.height, accuracy: 1)
        js.setValue(0, forProperty: "rowCount")
        js.setValue(0, forProperty: "contentHeight")
        js.setValue((js.forProperty("revision")?.toInt32() ?? 0) + 1, forProperty: "revision")
        list.synchronizeDocument()
        XCTAssertEqual(list.table.numberOfRows, 0)
        XCTAssertEqual(list.contentView.bounds.minY, 0)
        XCTAssertEqual(js.forProperty("children")?.forProperty("length")?.toInt32(), 0)
        XCTAssertTrue(bridge.runtimeErrors.isEmpty, bridge.runtimeErrors.joined(separator: "\n"))
    }
}

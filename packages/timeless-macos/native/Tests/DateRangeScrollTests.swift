import Cocoa
import JavaScriptCore
import XCTest
@testable import TimelessMacOS

private final class CalendarRenderer: NativeViewRenderer {
    var floatingLayouts = 0
    override func layoutFloatingSurface(_ placeholder: NativeFloatingPlaceholder, available: NSSize) {
        floatingLayouts += 1
        super.layoutFloatingSurface(placeholder, available: available)
    }
}

final class DateRangeScrollTests: XCTestCase {
    func testCalendarWheelScrollsPageWithoutRelayingOutTheCalendar() throws {
        guard let path = ProcessInfo.processInfo.environment["TIMELESS_MACOS_TEST_BUNDLE"] else { throw XCTSkip("Set TIMELESS_MACOS_TEST_BUNDLE") }
        _ = NSApplication.shared
        let bridge = JSBridge(devScriptPath: path)
        let renderer = CalendarRenderer(bridge: bridge)
        var root: NSView?
        bridge.onRender = { root = renderer.render($0, containerWidth: 1000, containerHeight: 720) }
        bridge.onRelayout = { renderer.relayout() }
        bridge.run()
        let view = try XCTUnwrap(root)
        let window = NSWindow(contentRect: view.bounds, styleMask: [.titled], backing: .buffered, defer: false)
        window.contentView = view
        defer { window.orderOut(nil) }
        func all(_ node: NSView) -> [NSView] { [node] + node.subviews.flatMap(all) }
        func find(_ name: String) throws -> NSView { try XCTUnwrap(all(view).first { $0.identifier?.rawValue == name }, name) }
        func settle() { RunLoop.main.run(until: Date().addingTimeInterval(0.03)); renderer.relayout() }
        settle()
        XCTAssertTrue(try XCTUnwrap(find("nav-data_entry") as? FlippedView).accessibilityPerformPress()); settle()
        let start = CFAbsoluteTimeGetCurrent()
        XCTAssertTrue(try XCTUnwrap(find("form-dates-trigger") as? FlippedView).accessibilityPerformPress())
        print("[Calendar] handler \((CFAbsoluteTimeGetCurrent() - start) * 1000) ms")
        RunLoop.main.run(until: Date().addingTimeInterval(0.03))
        print("[Calendar] queued layout \((CFAbsoluteTimeGetCurrent() - start) * 1000) ms")
        renderer.relayout()
        print("[Calendar] open \((CFAbsoluteTimeGetCurrent() - start) * 1000) ms")
        let layer = try XCTUnwrap(renderer.floatingLayer)
        let calendar = try XCTUnwrap(layer.presented.last)
        let scroll = try XCTUnwrap(find("route-scroll") as? NativeScrollView)
        let layouts = renderer.floatingLayouts
        let previousY = calendar.surface.frame.minY
        for index in 1...10 { scroll.contentView.scroll(to: NSPoint(x: 0, y: index)) }
        XCTAssertEqual(renderer.floatingLayouts, layouts, "Scrolling only repositions the popup; it must not run Yoga for 84 calendar cells")
        XCTAssertNotEqual(calendar.surface.frame.minY, previousY)

        let point = calendar.surface.convert(NSPoint(x: calendar.surface.bounds.midX, y: calendar.surface.bounds.midY), to: calendar.surface.superview)
        let target = layer.scrollTarget(at: point)
        XCTAssertTrue(target === scroll, "The non-scrollable calendar forwards wheel input to its anchor's ScrollView")
        let cg = try XCTUnwrap(CGEvent(scrollWheelEvent2Source: nil, units: .pixel, wheelCount: 1, wheel1: -40, wheel2: 0, wheel3: 0))
        let wheel = try XCTUnwrap(NSEvent(cgEvent: cg))
        let before = scroll.contentView.bounds.minY
        target?.scrollWheel(with: wheel)
        XCTAssertEqual(renderer.floatingLayouts, layouts)
        RunLoop.main.run(until: Date().addingTimeInterval(0.05))
        XCTAssertGreaterThan(scroll.contentView.bounds.minY, before)
        layer.dismiss(calendar)
        settle()
        XCTAssertTrue(try XCTUnwrap(find("form-role") as? FlippedView).accessibilityPerformPress()); settle()
        let select = try XCTUnwrap(layer.presented.last)
        let option = try XCTUnwrap(all(select.surface).first { ($0 as? FlippedView)?.jsNode?.forProperty("attrs")?.forProperty("data-value")?.toString() == "designer" })
        let optionPoint = option.convert(NSPoint(x: option.bounds.midX, y: option.bounds.midY), to: select.surface.superview)
        XCTAssertNil(layer.scrollTarget(at: optionPoint), "A Select popup keeps wheel input in its own ScrollView")
        XCTAssertTrue(bridge.runtimeErrors.isEmpty, bridge.runtimeErrors.joined(separator: "\n"))
    }
}

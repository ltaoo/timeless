import Cocoa
import XCTest
@testable import TimelessMacOS

final class SharedScrollTests: XCTestCase {
    func testScrollbarsOnlyConsumeSpaceForOverflowingContent() throws {
        _ = NSApplication.shared
        let bridge = JSBridge()
        let renderer = NativeViewRenderer(bridge: bridge)
        for (width, height) in [(320, 60), (320, 400), (640, 195)] {
            let node = NativeNode.scrollView(horizontal: "auto", vertical: "auto", children: [
                .view(style: ["width": "\(width)px", "height": "\(height)px"], children: [], jsValue: nil),
            ], jsValue: nil)
            let scroll = try XCTUnwrap(renderer.render(node, containerWidth: 320, containerHeight: 200) as? NativeScrollView)
            let document = try XCTUnwrap(scroll.documentView)
            XCTAssertTrue(scroll.hasHorizontalScroller)
            if width > 320 {
                XCTAssertFalse(try XCTUnwrap(scroll.horizontalScroller).isHidden)
                XCTAssertGreaterThan(document.frame.width, scroll.contentSize.width)
                scroll.contentView.scroll(to: NSPoint(x: 50, y: 0))
                XCTAssertEqual(scroll.contentView.bounds.minX, 50)
            } else if height < 200 {
                XCTAssertEqual(document.frame.size, scroll.contentSize)
                XCTAssertEqual(scroll.contentSize, NSSize(width: 320, height: 200))
            }
            if NSScroller.preferredScrollerStyle == .legacy, width > 320 {
                XCTAssertLessThan(scroll.contentSize.height, 200)
                XCTAssertLessThan(scroll.contentSize.width, 320, "The horizontal scroller can cause vertical overflow too")
            }
        }
    }

    func testFormFitsContentViewport() throws {
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
        defer { window.orderOut(nil) }
        func all(_ node: NSView) -> [NSView] { [node] + node.subviews.flatMap(all) }
        func find(_ name: String) throws -> NSView { try XCTUnwrap(all(view).first { $0.identifier?.rawValue == name }, name) }
        func settle() { RunLoop.main.run(until: Date().addingTimeInterval(0.03)); renderer.relayout() }
        settle()
        XCTAssertTrue(try XCTUnwrap(find("nav-data_entry") as? FlippedView).accessibilityPerformPress())
        settle()
        let scroll = try XCTUnwrap(find("route-scroll") as? NativeScrollView)
        XCTAssertTrue(scroll.hasHorizontalScroller)
        for width: CGFloat in [800, 1000, 760] {
            renderer.relayout(containerWidth: width, containerHeight: 560)
            settle()
            let document = try XCTUnwrap(scroll.documentView)
            XCTAssertLessThanOrEqual(document.frame.width, scroll.contentSize.width + 1)
            XCTAssertGreaterThan(document.frame.height, scroll.contentSize.height)
            XCTAssertTrue(try XCTUnwrap(scroll.horizontalScroller).isHidden)
            let outlet = try find("route-outlet")
            XCTAssertEqual(outlet.frame.width, scroll.contentSize.width, accuracy: 1)
            XCTAssertLessThanOrEqual(try find("form-page").frame.width, outlet.frame.width - 48)
            let result = try find("form-result")
            XCTAssertTrue(result.scrollToVisible(result.bounds))
            XCTAssertGreaterThan(scroll.contentView.bounds.minY, 0)
            XCTAssertEqual(scroll.contentView.bounds.minX, 0)
            XCTAssertTrue(try XCTUnwrap(find("nav-general") as? FlippedView).accessibilityPerformPress())
            settle()
            XCTAssertEqual(scroll.contentSize.width, scroll.frame.width, accuracy: 1, "Short pages release the vertical scrollbar gutter")
            XCTAssertTrue(try XCTUnwrap(find("nav-data_entry") as? FlippedView).accessibilityPerformPress())
            settle()
            XCTAssertLessThanOrEqual(document.frame.width, scroll.contentSize.width + 1)
            XCTAssertEqual(scroll.contentView.bounds.origin, .zero)
        }
        XCTAssertTrue(bridge.runtimeErrors.isEmpty, bridge.runtimeErrors.joined(separator: "\n"))
    }
}

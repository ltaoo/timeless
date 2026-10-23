import Cocoa
import JavaScriptCore
import XCTest
@testable import TimelessMacOS

final class FirstScrollTests: XCTestCase {
    func testFirstWheelAfterNavigationDoesNotRebuildThePageLayout() throws {
        guard let path = ProcessInfo.processInfo.environment["TIMELESS_MACOS_TEST_BUNDLE"] else {
            throw XCTSkip("Set TIMELESS_MACOS_TEST_BUNDLE")
        }
        _ = NSApplication.shared
        let controller = RootViewController(devScriptPath: path)
        let window = NSWindow(contentRect: NSRect(x: 0, y: 0, width: 800, height: 560), styleMask: [.titled, .resizable], backing: .buffered, defer: false)
        window.contentViewController = controller
        defer { window.orderOut(nil) }
        window.makeKeyAndOrderFront(nil)
        let view = controller.view
        func find(_ name: String, in current: NSView) -> NSView? {
            if current.identifier?.rawValue == name { return current }
            return current.subviews.lazy.compactMap { find(name, in: $0) }.first
        }
        let rootView = try XCTUnwrap(find("shared-application", in: view) as? FlippedView)
        let root = try XCTUnwrap(rootView.jsNode)
        let context = try XCTUnwrap(root.context)
        context.globalObject.setValue(root, forProperty: "firstScrollRoot")
        context.evaluateScript("""
            globalThis.firstScrollRootReads = 0;
            globalThis.firstScrollStyleComputes = 0;
            const firstScrollViewport = globalThis.__nativeBridge_viewport;
            globalThis.__nativeBridge_viewport = () => {
                firstScrollStyleComputes++;
                return firstScrollViewport?.() ?? { width: 1000, height: 720 };
            };
            const firstScrollChildren = firstScrollRoot.children;
            Object.defineProperty(firstScrollRoot, 'children', {
                get() { firstScrollRootReads++; return firstScrollChildren; }
            });
        """)
        for page in ["data_entry", "floating", "navigation", "data_display", "scroll", "data_entry"] {
            let navigation = try XCTUnwrap(find("nav-\(page)", in: view) as? FlippedView)
            XCTAssertTrue(navigation.accessibilityPerformPress())
            RunLoop.main.run(until: Date().addingTimeInterval(0.03))
            view.layoutSubtreeIfNeeded()
            window.displayIfNeeded()
            let scroll = try XCTUnwrap(find("route-scroll", in: view) as? NativeScrollView)
            context.evaluateScript("firstScrollRootReads = 0; firstScrollStyleComputes = 0")
            let cg = try XCTUnwrap(CGEvent(scrollWheelEvent2Source: nil, units: .pixel, wheelCount: 1, wheel1: -40, wheel2: 0, wheel3: 0))
            cg.setIntegerValueField(.scrollWheelEventIsContinuous, value: 1)
            cg.setIntegerValueField(.scrollWheelEventScrollPhase, value: 1)
            let wheel = try XCTUnwrap(NSEvent(cgEvent: cg))
            let start = CFAbsoluteTimeGetCurrent()
            scroll.scrollWheel(with: wheel)
            let wheelEnd = CFAbsoluteTimeGetCurrent()
            view.layoutSubtreeIfNeeded()
            let layoutEnd = CFAbsoluteTimeGetCurrent()
            RunLoop.main.run(until: Date().addingTimeInterval(0.001))
            let loopEnd = CFAbsoluteTimeGetCurrent()
            window.displayIfNeeded()
            if page == "data_entry" {
                XCTAssertGreaterThan(scroll.contentView.bounds.minY, 0, "The first wheel must move the newly opened page")
            }
            let wheelSeconds = CFAbsoluteTimeGetCurrent() - start
            let wheelReads = context.objectForKeyedSubscript("firstScrollRootReads")?.toInt32() ?? -1
            print("FIRST_WHEEL_PROFILE page=\(page) seconds=\(wheelSeconds) wheel=\(wheelEnd-start) nativeLayout=\(layoutEnd-wheelEnd) eventLoop=\(loopEnd-layoutEnd) display=\(CFAbsoluteTimeGetCurrent()-loopEnd) rootReads=\(wheelReads) styles=\(context.objectForKeyedSubscript("firstScrollStyleComputes")?.toInt32() ?? -1)")
            controller.viewDidLayout()
            let reads = context.objectForKeyedSubscript("firstScrollRootReads")?.toInt32() ?? -1
            print("FIRST_SCROLL_PROFILE page=\(page) seconds=\(CFAbsoluteTimeGetCurrent() - start) rootReads=\(reads)")
            XCTAssertEqual(reads, 0, "A native layout pass with an unchanged viewport must not rebuild the page during scrolling")
        }
        window.setContentSize(NSSize(width: 1000, height: 700))
        view.layoutSubtreeIfNeeded()
        controller.viewDidLayout()
        XCTAssertGreaterThan(context.objectForKeyedSubscript("firstScrollRootReads")?.toInt32() ?? 0, 0, "A changed viewport must still update the page layout")
        XCTAssertEqual(rootView.frame.width, view.bounds.width, accuracy: 1)
        XCTAssertNil(context.exception)
    }

    func testTrackingAreaIsRetainedWhenTheVisibleRectChanges() throws {
        let view = FlippedView(frame: NSRect(x: 0, y: 0, width: 300, height: 200))
        view.updateTrackingAreas()
        let area = try XCTUnwrap(view.trackingAreas.first)
        XCTAssertTrue(area.options.contains(.inVisibleRect))
        view.setFrameSize(NSSize(width: 400, height: 300))
        view.setBoundsOrigin(NSPoint(x: 0, y: 40))
        view.updateTrackingAreas()
        XCTAssertEqual(view.trackingAreas.count, 1)
        XCTAssertTrue(view.trackingAreas.first === area, "AppKit tracks the visible rect without reallocating tracking areas during scrolling")
    }
}

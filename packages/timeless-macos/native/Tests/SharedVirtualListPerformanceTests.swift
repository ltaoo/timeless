import Cocoa
import JavaScriptCore
import XCTest
@testable import TimelessMacOS

private final class ListPerformanceRenderer: NativeViewRenderer {
    var rowLayouts = 0
    var rootLayouts = 0
    var rowLayoutSeconds: TimeInterval = 0
    var rowBuildSeconds: TimeInterval = 0
    var rootLayoutSeconds: TimeInterval = 0
    override func buildListRow(_ js: JSValue, width: CGFloat, height: CGFloat) -> NSView? {
        let start = Date()
        defer { rowBuildSeconds += Date().timeIntervalSince(start) }
        return super.buildListRow(js, width: width, height: height)
    }
    override func layoutListRow(_ js: JSValue, view: NSView, width: CGFloat, height: CGFloat) {
        rowLayouts += 1
        let start = Date()
        defer { rowLayoutSeconds += Date().timeIntervalSince(start) }
        super.layoutListRow(js, view: view, width: width, height: height)
    }
    override func relayout(containerWidth: CGFloat? = nil, containerHeight: CGFloat? = nil) {
        rootLayouts += 1
        let start = Date()
        defer { rootLayoutSeconds += Date().timeIntervalSince(start) }
        super.relayout(containerWidth: containerWidth, containerHeight: containerHeight)
    }
}

final class SharedVirtualListPerformanceTests: XCTestCase {
    func testSteadyScrollingBuildsOnlyNewRows() throws {
        guard let path = ProcessInfo.processInfo.environment["TIMELESS_MACOS_TEST_BUNDLE"] else { throw XCTSkip("Set TIMELESS_MACOS_TEST_BUNDLE") }
        _ = NSApplication.shared
        let bridge = JSBridge(devScriptPath: path)
        let renderer = ListPerformanceRenderer(bridge: bridge)
        var root: NSView?
        bridge.onRender = { root = renderer.render($0, containerWidth: 1000, containerHeight: 800) }
        bridge.onRelayout = { renderer.relayout() }
        bridge.run()
        let view = try XCTUnwrap(root)
        let window = NSWindow(contentRect: view.bounds, styleMask: [.titled], backing: .buffered, defer: false)
        window.contentView = view
        defer { window.orderOut(nil) }
        func all(_ node: NSView) -> [NSView] { [node] + node.subviews.flatMap(all) }
        RunLoop.main.run(until: Date().addingTimeInterval(0.03))
        let nav = try XCTUnwrap(all(view).first { $0.identifier?.rawValue == "nav-scroll" } as? FlippedView)
        XCTAssertTrue(nav.accessibilityPerformPress())
        RunLoop.main.run(until: Date().addingTimeInterval(0.03))
        view.layoutSubtreeIfNeeded()
        let list = try XCTUnwrap(all(view).first { $0.identifier?.rawValue == "virtual-list" } as? NativeVirtualList)
        let js = try XCTUnwrap(list.jsNode)
        js.context.globalObject.setValue(js, forProperty: "performanceList")
        js.context.evaluateScript("""
            globalThis.listCounters = { heights: 0, builds: 0, buildMilliseconds: 0 };
            const originalHeight = performanceList._rowHeight;
            const originalRender = performanceList._renderRow;
            performanceList._rowHeight = (index) => { listCounters.heights++; return originalHeight(index); };
            performanceList._renderRow = (index) => {
                listCounters.builds++;
                const start = Date.now();
                try { return originalRender(index); }
                finally { listCounters.buildMilliseconds += Date.now() - start; }
            };
        """)
        renderer.rowLayouts = 0
        renderer.rootLayouts = 0
        renderer.rowBuildSeconds = 0
        renderer.rowLayoutSeconds = 0
        renderer.rootLayoutSeconds = 0
        let start = Date()
        var steps: [TimeInterval] = []
        for index in 1...80 {
            let stepStart = Date()
            list.contentView.scroll(to: NSPoint(x: 0, y: index * 12))
            list.reflectScrolledClipView(list.contentView)
            list.table.layoutSubtreeIfNeeded()
            RunLoop.main.run(until: Date().addingTimeInterval(0.001))
            steps.append(Date().timeIntervalSince(stepStart))
        }
        let elapsed = Date().timeIntervalSince(start)
        let counters = js.context.objectForKeyedSubscript("listCounters")?.toDictionary() ?? [:]
        print("LIST_SCROLL_PROFILE seconds=\(elapsed) p95=\(steps.sorted()[75]) max=\(steps.max() ?? 0) rowLayouts=\(renderer.rowLayouts) rootLayouts=\(renderer.rootLayouts) rowLayoutSeconds=\(renderer.rowLayoutSeconds) rowBuildSeconds=\(renderer.rowBuildSeconds) rootLayoutSeconds=\(renderer.rootLayoutSeconds) js=\(counters)")
        XCTAssertLessThanOrEqual(renderer.rootLayouts, 1, "Steady scrolling must not repeatedly lay out the whole page")
        XCTAssertLessThanOrEqual((counters["builds"] as? NSNumber)?.intValue ?? Int.max, 25, "Only newly visible rows are built")
        let ordinary = try XCTUnwrap(all(view).first { $0.identifier?.rawValue == "scroll-example" } as? NativeScrollView)
        renderer.rootLayouts = 0
        renderer.rootLayoutSeconds = 0
        let ordinaryStart = Date()
        for index in 1...80 {
            ordinary.contentView.scroll(to: NSPoint(x: index, y: index))
            ordinary.reflectScrolledClipView(ordinary.contentView)
            RunLoop.main.run(until: Date().addingTimeInterval(0.001))
        }
        print("ORDINARY_SCROLL_PROFILE seconds=\(Date().timeIntervalSince(ordinaryStart)) rootLayouts=\(renderer.rootLayouts) rootLayoutSeconds=\(renderer.rootLayoutSeconds)")
        XCTAssertEqual(renderer.rootLayouts, 0, "Stable scroll position text measurements must not trigger root layout")
        XCTAssertTrue(bridge.runtimeErrors.isEmpty, bridge.runtimeErrors.joined(separator: "\n"))
    }
}

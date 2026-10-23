import Cocoa
import JavaScriptCore
import XCTest
@testable import TimelessMacOS

final class TableScrollPerformanceTests: XCTestCase {
    func testPaginationReusesTableViews() throws {
        guard let path = ProcessInfo.processInfo.environment["TIMELESS_MACOS_TEST_BUNDLE"] else {
            throw XCTSkip("Set TIMELESS_MACOS_TEST_BUNDLE")
        }
        _ = NSApplication.shared
        let controller = RootViewController(devScriptPath: path)
        let window = NSWindow(contentRect: NSRect(x: 0, y: 0, width: 1000, height: 720), styleMask: [.titled], backing: .buffered, defer: false)
        window.contentViewController = controller
        defer { window.orderOut(nil) }
        let view = controller.view
        func all(_ node: NSView) -> [NSView] { [node] + node.subviews.flatMap(all) }
        func find(_ name: String) throws -> FlippedView {
            try XCTUnwrap(all(view).first { $0.identifier?.rawValue == name } as? FlippedView, name)
        }
        XCTAssertTrue(try find("nav-table").accessibilityPerformPress())
        let body = try find("invoices-body")
        let originalViews = all(body)
        let context = try XCTUnwrap(body.jsNode?.context)
        context.evaluateScript("""
            globalThis.paginationStyleComputations = 0;
            globalThis.paginationLayouts = 0;
            const paginationViewport = globalThis.__nativeBridge_viewport;
            globalThis.__nativeBridge_viewport = () => {
                paginationStyleComputations++;
                return paginationViewport?.() ?? { width: 1000, height: 720 };
            };
            const paginationRelayout = __nativeBridge_relayout;
            globalThis.__nativeBridge_relayout = () => { paginationLayouts++; paginationRelayout(); };
        """)
        XCTAssertNil(context.exception)
        for (button, invoice) in [("invoices-page-2", "INV021"), ("invoices-page-3", "INV041"), ("invoices-page-10", "INV181"), ("invoices-previous", "INV161"), ("invoices-next", "INV181"), ("invoices-page-1", "INV001"), ("invoices-page-1", "INV001")] {
            context.evaluateScript("paginationStyleComputations = 0; paginationLayouts = 0")
            let start = CFAbsoluteTimeGetCurrent()
            XCTAssertTrue(try find(button).accessibilityPerformPress())
            print("Table pagination \(button): \((CFAbsoluteTimeGetCurrent() - start) * 1000) ms")
            XCTAssertLessThanOrEqual(context.objectForKeyedSubscript("paginationStyleComputations")?.toInt32() ?? Int32.max, 12, "Only pagination controls need restyling")
            XCTAssertLessThanOrEqual(context.objectForKeyedSubscript("paginationLayouts")?.toInt32() ?? Int32.max, 1)
            XCTAssertNil(context.exception)
            XCTAssertEqual(all(body).map(ObjectIdentifier.init), originalViews.map(ObjectIdentifier.init), "Pagination must update existing rows rather than rebuild native views")
            XCTAssertTrue(all(body).compactMap { ($0 as? NSTextField)?.stringValue }.joined().contains(invoice))
        }
    }

    func testTablePointerEntryOnlyRestylesTheHoveredRow() throws {
        guard let path = ProcessInfo.processInfo.environment["TIMELESS_MACOS_TEST_BUNDLE"] else {
            throw XCTSkip("Set TIMELESS_MACOS_TEST_BUNDLE")
        }
        _ = NSApplication.shared
        let controller = RootViewController(devScriptPath: path)
        let window = NSWindow(contentRect: NSRect(x: 0, y: 0, width: 800, height: 560), styleMask: [.titled], backing: .buffered, defer: false)
        window.contentViewController = controller
        defer { window.orderOut(nil) }
        let view = controller.view
        func find(_ name: String, in current: NSView) -> NSView? {
            if current.identifier?.rawValue == name { return current }
            return current.subviews.lazy.compactMap { find(name, in: $0) }.first
        }
        let navigation = try XCTUnwrap(find("nav-table", in: view) as? FlippedView)
        XCTAssertTrue(navigation.accessibilityPerformPress())
        let row = try XCTUnwrap(find("invoice-row-1", in: view) as? FlippedView)
        let context = try XCTUnwrap(row.jsNode?.context)
        context.evaluateScript("""
            globalThis.tablePointerStyles = 0;
            const tablePointerViewport = globalThis.__nativeBridge_viewport;
            globalThis.__nativeBridge_viewport = () => {
                tablePointerStyles++;
                return tablePointerViewport?.() ?? { width: 1000, height: 720 };
            };
        """)
        let point = row.convert(NSPoint(x: row.bounds.midX, y: row.bounds.midY), to: nil)
        let event = try XCTUnwrap(NSEvent.mouseEvent(with: .mouseMoved, location: point, modifierFlags: [], timestamp: 0, windowNumber: window.windowNumber, context: nil, eventNumber: 1, clickCount: 0, pressure: 0))
        for name in ["shared-application", "main", "route-outlet", "page-table", "table-page", "invoices-table", "invoices-body"] {
            let container = try XCTUnwrap(find(name, in: view) as? FlippedView, name)
            container.mouseEntered(with: event)
        }
        XCTAssertEqual(context.objectForKeyedSubscript("tablePointerStyles")?.toInt32(), 0, "Passive pointer entry must not walk the table for each ancestor")
        let background = row.layer?.backgroundColor
        row.mouseEntered(with: event)
        XCTAssertNotEqual(row.layer?.backgroundColor, background, "The actual row hover styling must still update")
        XCTAssertLessThanOrEqual(context.objectForKeyedSubscript("tablePointerStyles")?.toInt32() ?? Int32.max, 9)
        row.mouseExited(with: event)
        XCTAssertEqual(row.layer?.backgroundColor, background)
        context.evaluateScript("tablePointerStyles = 0")
        let scroll = try XCTUnwrap(find("invoices-scroll", in: view) as? NativeScrollView)
        scroll.contentView.scroll(to: NSPoint(x: 0, y: 40))
        scroll.reflectScrolledClipView(scroll.contentView)
        XCTAssertEqual(scroll.contentView.bounds.minY, 40, accuracy: 1)
        XCTAssertEqual(context.objectForKeyedSubscript("tablePointerStyles")?.toInt32(), 0)
        XCTAssertNil(context.exception)
    }
}

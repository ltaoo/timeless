import Cocoa
import JavaScriptCore
import XCTest
@testable import TimelessMacOS

final class ClickLatencyTests: XCTestCase {
    func testPointerEventsReachClickHandlerWithoutBlocking() throws {
        guard let path = ProcessInfo.processInfo.environment["TIMELESS_MACOS_TEST_BUNDLE"] else { throw XCTSkip("Set TIMELESS_MACOS_TEST_BUNDLE") }
        _ = NSApplication.shared
        let bridge = JSBridge(devScriptPath: path)
        let renderer = NativeViewRenderer(bridge: bridge)
        var root: NSView?
        bridge.onRender = { root = renderer.render($0, containerWidth: 1000, containerHeight: 720) }
        bridge.onRelayout = { renderer.relayout() }
        bridge.run()
        let view = try XCTUnwrap(root)
        let window = NSWindow(contentRect: view.bounds, styleMask: [.titled], backing: .buffered, defer: false)
        window.contentView = view
        defer { window.orderOut(nil) }
        RunLoop.main.run(until: Date().addingTimeInterval(0.03))
        func find(_ name: String, in current: NSView) -> FlippedView? {
            if current.identifier?.rawValue == name { return current as? FlippedView }
            return current.subviews.lazy.compactMap { find(name, in: $0) }.first
        }
        for name in ["button-default", "nav-overview", "nav-general"] {
            let button = try XCTUnwrap(find(name, in: view), name)
            let listeners = try XCTUnwrap(button.jsNode?.forProperty("listeners"))
            let original = try XCTUnwrap(listeners.forProperty("click"))
            var handlerTime: CFAbsoluteTime?
            let handler: @convention(block) (JSValue) -> Void = { event in
                handlerTime = CFAbsoluteTimeGetCurrent()
                original.call(withArguments: [event])
            }
            listeners.setObject(handler, forKeyedSubscript: "click" as NSString)
            let point = button.convert(NSPoint(x: button.bounds.midX, y: button.bounds.midY), to: nil)
            func event(_ type: NSEvent.EventType) throws -> NSEvent {
                try XCTUnwrap(NSEvent.mouseEvent(with: type, location: point, modifierFlags: [], timestamp: 0, windowNumber: window.windowNumber, context: nil, eventNumber: 0, clickCount: 1, pressure: 1))
            }
            let down = try event(.leftMouseDown), up = try event(.leftMouseUp)
            let start = CFAbsoluteTimeGetCurrent()
            button.mouseEntered(with: down)
            button.mouseDown(with: down)
            RunLoop.main.run(until: Date().addingTimeInterval(0.001))
            button.mouseUp(with: up)
            RunLoop.main.run(until: Date().addingTimeInterval(0.001))
            let end = CFAbsoluteTimeGetCurrent()
            let delay = try XCTUnwrap(handlerTime) - start
            print("[Click latency] \(name): handler \(delay * 1000) ms, complete \((end - start) * 1000) ms")
            XCTAssertLessThan(delay, 0.15, "Pointer state updates must not block the click handler")
            XCTAssertLessThan(end - start, 0.25, "The click and reactive page updates must complete promptly")
            listeners.setValue(original, forProperty: "click")
            RunLoop.main.run(until: Date().addingTimeInterval(0.03))
        }
        XCTAssertTrue(bridge.runtimeErrors.isEmpty, bridge.runtimeErrors.joined(separator: "\n"))
    }
}

import Cocoa
import XCTest
@testable import TimelessMacOS

final class SharedLabelTests: XCTestCase {
    func testLabelsFocusAssociatedControlsWithoutChangingValuesOrLayout() throws {
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
        defer { window.makeFirstResponder(nil); window.orderOut(nil) }
        func all(_ node: NSView) -> [NSView] { [node] + node.subviews.flatMap(all) }
        func find(_ name: String) throws -> NSView { try XCTUnwrap(all(view).first { $0.identifier?.rawValue == name }, name) }
        func settle() { RunLoop.main.run(until: Date().addingTimeInterval(0.04)); renderer.relayout() }
        func clickLabel(_ name: String) throws {
            let label = try XCTUnwrap(find(name) as? FlippedView)
            label.scrollToVisible(label.bounds); settle()
            let point = label.convert(NSPoint(x: label.bounds.midX, y: label.bounds.midY), to: nil)
            let hit = try XCTUnwrap(view.hitTest(view.superview!.convert(point, from: nil)))
            XCTAssertTrue(hit === label)
            for type in [NSEvent.EventType.leftMouseDown, .leftMouseUp] {
                let event = try XCTUnwrap(NSEvent.mouseEvent(with: type, location: point, modifierFlags: [], timestamp: 0, windowNumber: window.windowNumber, context: nil, eventNumber: 1, clickCount: 1, pressure: 1))
                if type == .leftMouseDown { hit.mouseDown(with: event) } else { hit.mouseUp(with: event) }
            }
            settle()
            XCTAssertFalse(label.acceptsFirstResponder, "Labels must not add a Tab stop")
        }
        settle()
        XCTAssertTrue(try XCTUnwrap(find("nav-data_entry") as? FlippedView).accessibilityPerformPress()); settle()
        let before = all(view).filter { $0.identifier != nil }.map(\.frame)
        for (label, name) in [("label-name", "form-name"), ("label-email", "form-email"), ("label-quantity", "form-quantity")] {
            let field = try XCTUnwrap(find(name) as? StyledTextField)
            let value = field.stringValue
            try clickLabel(label)
            XCTAssertTrue(window.firstResponder === field || window.firstResponder === field.currentEditor())
            XCTAssertNotNil(field.currentEditor())
            XCTAssertNotNil(field.decoration.shadowLayer)
            XCTAssertEqual(field.stringValue, value)
            XCTAssertEqual(all(view).filter { $0.identifier != nil }.map(\.frame), before)
        }
        try clickLabel("label-bio")
        let textarea = try XCTUnwrap(find("form-bio") as? NSScrollView)
        XCTAssertTrue(window.firstResponder === textarea.documentView)
        let checkbox = try XCTUnwrap(find("form-agreed-box") as? FlippedView)
        let checked = checkbox.jsNode?.forProperty("attrs")?.hasProperty("data-checked")
        try clickLabel("form-agreed-label")
        XCTAssertNotEqual(checkbox.jsNode?.forProperty("attrs")?.hasProperty("data-checked"), checked)
        try clickLabel("form-agreed-label")
        let toggle = try XCTUnwrap(find("form-notifications") as? FlippedView)
        let notifications = toggle.jsNode?.forProperty("attrs")?.forProperty("aria-checked")?.toString()
        try clickLabel("form-notification-label")
        XCTAssertNotEqual(toggle.jsNode?.forProperty("attrs")?.forProperty("aria-checked")?.toString(), notifications)
        try clickLabel("form-notification-label")
        let email = try XCTUnwrap(find("form-email") as? StyledTextField)
        let node = try XCTUnwrap(email.nativeNode)
        // Attribute changes normally arrive through the shared host; use its callback for this edge case.
        node.forProperty("attrs")?.setValue("", forProperty: "disabled")
        node.forProperty("_onAttributeChange")?.call(withArguments: ["disabled", ""])
        XCTAssertTrue(window.makeFirstResponder(nil))
        try clickLabel("label-email")
        XCTAssertFalse(window.firstResponder === email || window.firstResponder === email.currentEditor())
        node.forProperty("attrs")?.deleteProperty("disabled")
        node.forProperty("_onAttributeChange")?.call(withArguments: ["disabled", NSNull()])
        try clickLabel("label-name")
        let label = try XCTUnwrap(find("label-name") as? FlippedView)
        label.jsNode?.forProperty("attrs")?.setValue("missing-control", forProperty: "for")
        XCTAssertTrue(window.makeFirstResponder(nil))
        try clickLabel("label-name")
        XCTAssertFalse(window.firstResponder === (try find("form-name")))
        XCTAssertTrue(bridge.runtimeErrors.isEmpty, bridge.runtimeErrors.joined(separator: "\n"))
    }
}

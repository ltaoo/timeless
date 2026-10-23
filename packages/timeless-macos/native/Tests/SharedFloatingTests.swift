import Cocoa
import XCTest
@testable import TimelessMacOS

final class SharedFloatingTests: XCTestCase {
    func testProductionModalPopoverAndTooltip() throws {
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
        func settle() {
            RunLoop.main.run(until: Date().addingTimeInterval(0.04))
            renderer.relayout()
        }
        func all(_ node: NSView) -> [NSView] { [node] + node.subviews.flatMap(all) }
        func element(_ name: String) throws -> NSView { try XCTUnwrap(all(view).first { $0.identifier?.rawValue == name }, name) }
        func press(_ name: String) throws {
            XCTAssertTrue(try XCTUnwrap(element(name) as? FlippedView).accessibilityPerformPress())
            settle()
        }
        func key(_ code: UInt16, modifiers: NSEvent.ModifierFlags = []) throws -> NSEvent {
            try XCTUnwrap(NSEvent.keyEvent(with: .keyDown, location: .zero, modifierFlags: modifiers, timestamp: 0, windowNumber: window.windowNumber, context: nil, characters: "", charactersIgnoringModifiers: "", isARepeat: false, keyCode: code))
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
        try press("nav-floating")
        let layer = try XCTUnwrap(renderer.floatingLayer)
        let trigger = try element("floating-modal-trigger")
        let modal = try element("floating-modal")
        XCTAssertTrue(modal.isHidden)
        XCTAssertTrue(window.makeFirstResponder(trigger))
        try press("floating-modal-trigger")
        XCTAssertFalse(modal.isHidden)
        XCTAssertEqual(modal.frame.width, 384, accuracy: 1)
        XCTAssertEqual(modal.frame.midX, view.bounds.midX, accuracy: 0.1)
        let description = try XCTUnwrap(all(try element("floating-modal-description")).compactMap { $0 as? NSTextField }.first)
        XCTAssertTrue(description.cell?.wraps == true)
        XCTAssertGreaterThan(description.frame.height, 25)
        XCTAssertEqual(description.preferredMaxLayoutWidth, description.frame.width)
        XCTAssertTrue(try element("main").isAccessibilityHidden())
        let field = try XCTUnwrap(element("floating-name") as? NSTextField)
        XCTAssertTrue(window.firstResponder === field || window.firstResponder === field.currentEditor())
        try capture("shared-floating-modal")
        XCTAssertNil(layer.handle(try key(48, modifiers: .shift)))
        XCTAssertTrue(window.firstResponder === (try element("floating-modal-save")))
        XCTAssertNil(layer.handle(try key(48)))
        XCTAssertTrue(window.firstResponder === field || window.firstResponder === field.currentEditor())
        XCTAssertNil(layer.handle(try key(53)))
        settle()
        XCTAssertTrue(modal.isHidden)
        XCTAssertTrue(window.firstResponder === trigger)
        XCTAssertFalse(try element("main").isAccessibilityHidden())
        let outside = try XCTUnwrap(NSEvent.mouseEvent(with: .leftMouseDown, location: NSPoint(x: 3, y: 3), modifierFlags: [], timestamp: 0, windowNumber: window.windowNumber, context: nil, eventNumber: 1, clickCount: 1, pressure: 1))
        try press("floating-modal-trigger")
        XCTAssertNil(layer.handle(outside))
        settle()
        XCTAssertTrue(modal.isHidden)
        try press("floating-modal-trigger")
        field.stringValue = "Native User"
        field.delegate?.controlTextDidChange?(Notification(name: NSControl.textDidChangeNotification, object: field))
        try press("floating-modal-save")
        XCTAssertTrue(modal.isHidden)

        try press("floating-popover-trigger")
        let popover = try element("floating-popover")
        let anchor = try element("floating-popover-trigger")
        XCTAssertFalse(popover.isHidden)
        XCTAssertEqual(popover.frame.width, 288, accuracy: 1)
        let reference = anchor.convert(anchor.bounds, to: popover.superview)
        XCTAssertEqual(popover.frame.minX, reference.minX, accuracy: 0.1)
        XCTAssertEqual(popover.frame.minY, reference.maxY + 8, accuracy: 0.1)
        XCTAssertTrue(window.firstResponder === (try element("floating-popover-close")))
        try capture("shared-floating-popover")
        XCTAssertNotNil(layer.handle(outside))
        settle()
        XCTAssertTrue(popover.isHidden)

        let tooltipTrigger = try XCTUnwrap(element("floating-tooltip-trigger") as? FlippedView)
        let tooltip = try element("floating-tooltip-surface")
        let hover = try XCTUnwrap(NSEvent.enterExitEvent(with: .mouseEntered, location: .zero, modifierFlags: [], timestamp: 0, windowNumber: window.windowNumber, context: nil, eventNumber: 1, trackingNumber: 1, userData: nil))
        tooltipTrigger.mouseEntered(with: hover); settle()
        XCTAssertFalse(tooltip.isHidden)
        XCTAssertFalse(window.firstResponder === tooltip)
        XCTAssertGreaterThan(tooltip.frame.width, 100)
        XCTAssertGreaterThan(tooltip.frame.height, 20)
        try capture("shared-floating-tooltip")
        tooltipTrigger.mouseExited(with: hover); settle()
        XCTAssertTrue(tooltip.isHidden)
        XCTAssertTrue(window.makeFirstResponder(tooltipTrigger)); settle()
        XCTAssertFalse(tooltip.isHidden)
        XCTAssertNil(layer.handle(try key(53))); settle()
        XCTAssertTrue(tooltip.isHidden)
        XCTAssertTrue(window.firstResponder === tooltipTrigger)
        try press("floating-popover-trigger")
        try press("theme-toggle")
        XCTAssertFalse(popover.isHidden)
        try capture("shared-floating-dark")
        try press("nav-general")
        XCTAssertTrue(layer.presented.isEmpty)
        try press("nav-floating")
        XCTAssertEqual(field.stringValue, "Native User")
        XCTAssertTrue(bridge.runtimeErrors.isEmpty, bridge.runtimeErrors.joined(separator: "\n"))
    }
}

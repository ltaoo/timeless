import Cocoa
import XCTest
@testable import TimelessMacOS

final class SharedMenuTests: XCTestCase {
    func testShadcnMenusAndDrawerUseNativeFloatingAndFocus() throws {
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
        func element(_ name: String) throws -> NSView { try XCTUnwrap(all(view).first { $0.identifier?.rawValue == name }, name) }
        func settle() {
            RunLoop.main.run(until: Date().addingTimeInterval(0.18))
            renderer.relayout()
        }
        func press(_ name: String) throws {
            XCTAssertTrue(try XCTUnwrap(element(name) as? FlippedView).accessibilityPerformPress())
            settle()
        }
        func key(_ code: UInt16, modifiers: NSEvent.ModifierFlags = []) throws -> NSEvent {
            try XCTUnwrap(NSEvent.keyEvent(with: .keyDown, location: .zero, modifierFlags: modifiers, timestamp: 0, windowNumber: window.windowNumber, context: nil, characters: "", charactersIgnoringModifiers: "", isARepeat: false, keyCode: code))
        }
        func mouse(_ target: NSView, type: NSEvent.EventType) throws -> NSEvent {
            try XCTUnwrap(NSEvent.mouseEvent(with: type, location: target.convert(NSPoint(x: target.bounds.midX, y: target.bounds.midY), to: nil), modifierFlags: [], timestamp: 0, windowNumber: window.windowNumber, context: nil, eventNumber: 1, clickCount: 1, pressure: 1))
        }
        func capture(_ name: String) throws {
            guard let directory = ProcessInfo.processInfo.environment["TIMELESS_MACOS_SCREENSHOTS"] else { return }
            try FileManager.default.createDirectory(atPath: directory, withIntermediateDirectories: true)
            window.orderFrontRegardless()
            RunLoop.main.run(until: Date().addingTimeInterval(0.1))
            let process = Process()
            process.executableURL = URL(fileURLWithPath: "/usr/sbin/screencapture")
            process.arguments = ["-x", "-o", "-l", String(window.windowNumber), directory + "/" + name + ".png"]
            try process.run(); process.waitUntilExit()
            XCTAssertEqual(process.terminationStatus, 0)
            window.orderOut(nil)
        }
        try press("nav-floating")
        let layer = try XCTUnwrap(renderer.floatingLayer)
        let trigger = try XCTUnwrap(element("floating-dropdown-trigger") as? FlippedView)
        for width: CGFloat in [800, 760, 1000] {
            renderer.relayout(containerWidth: width, containerHeight: 560); settle()
            let point = trigger.convert(NSPoint(x: trigger.bounds.midX, y: trigger.bounds.midY), to: view.superview)
            let hit = try XCTUnwrap(view.hitTest(point))
            XCTAssertTrue(hit === trigger, "Dropdown trigger remains clickable at width \(width)")
            hit.mouseDown(with: try mouse(trigger, type: .leftMouseDown))
            hit.mouseUp(with: try mouse(trigger, type: .leftMouseUp)); settle()
            XCTAssertFalse(layer.presented.isEmpty)
            XCTAssertNil(layer.handle(try key(53))); settle()
            XCTAssertTrue(layer.presented.isEmpty)
        }
        renderer.relayout(containerWidth: 1000, containerHeight: 800); settle()
        let triggerPoint = trigger.convert(NSPoint(x: trigger.bounds.midX, y: trigger.bounds.midY), to: view.superview)
        XCTAssertTrue(view.hitTest(triggerPoint) === trigger, "Real pointer input must reach the dropdown trigger")
        trigger.mouseDown(with: try mouse(trigger, type: .leftMouseDown)); settle()
        trigger.mouseUp(with: try mouse(trigger, type: .leftMouseUp)); settle()
        let dropdown = try element("floating-dropdown-content-surface")
        XCTAssertFalse(dropdown.isHidden)
        XCTAssertGreaterThan(dropdown.frame.width, 100)
        let reference = trigger.convert(trigger.bounds, to: dropdown.superview)
        XCTAssertEqual(dropdown.frame.minX, reference.minX, accuracy: 1)
        XCTAssertGreaterThanOrEqual(dropdown.frame.minY, reference.maxY)
        let disabled = try XCTUnwrap(element("menu-item-删除（禁用）") as? FlippedView)
        XCTAssertTrue(disabled.disabled)
        XCTAssertFalse(disabled.accessibilityPerformPress())
        let edit = try XCTUnwrap(element("menu-item-编辑资料") as? FlippedView)
        let copy = try element("menu-item-复制名称")
        let editPoint = edit.convert(NSPoint(x: edit.bounds.midX, y: edit.bounds.midY), to: view.superview)
        XCTAssertTrue(view.hitTest(editPoint) === edit, "Real pointer input must reach the dropdown item")
        XCTAssertTrue(window.firstResponder === edit)
        edit.keyDown(with: try key(125)); settle()
        XCTAssertTrue(window.firstResponder === copy)
        (copy as? FlippedView)?.keyDown(with: try key(119)); settle()
        XCTAssertTrue(window.firstResponder === copy, "End skips disabled items and separators")
        try capture("shared-dropdown")
        XCTAssertNil(layer.handle(try key(53))); settle()
        XCTAssertTrue(layer.presented.isEmpty)
        XCTAssertTrue(window.firstResponder === trigger)
        trigger.keyDown(with: try key(125)); settle()
        XCTAssertTrue(window.firstResponder === (try element("menu-item-编辑资料")))
        let reopenedEdit = try XCTUnwrap(element("menu-item-编辑资料") as? FlippedView)
        let editClick = try mouse(reopenedEdit, type: .leftMouseDown)
        let hit = try XCTUnwrap(view.hitTest(view.superview!.convert(editClick.locationInWindow, from: nil)))
        XCTAssertTrue(hit === reopenedEdit)
        hit.mouseDown(with: editClick)
        hit.mouseUp(with: try mouse(reopenedEdit, type: .leftMouseUp)); settle()
        XCTAssertTrue(layer.presented.isEmpty)
        XCTAssertTrue(all(try element("floating-result")).compactMap { ($0 as? NSTextField)?.stringValue }.joined().contains("DropdownMenu：编辑资料"))

        let target = try XCTUnwrap(element("floating-context-trigger") as? FlippedView)
        let center = target.convert(NSPoint(x: target.bounds.midX + 0.13, y: target.bounds.midY + 0.27), to: nil)
        let click = try XCTUnwrap(NSEvent.mouseEvent(with: .rightMouseDown, location: center, modifierFlags: [], timestamp: 0, windowNumber: window.windowNumber, context: nil, eventNumber: 1, clickCount: 1, pressure: 1))
        target.rightMouseDown(with: click); settle()
        let context = try element("floating-context-content-surface")
        XCTAssertFalse(context.isHidden)
        let point = context.superview!.convert(click.locationInWindow, from: nil)
        XCTAssertEqual(context.frame.minX, point.x, accuracy: 1)
        XCTAssertEqual(context.frame.minY, point.y + 4, accuracy: 1)
        let menuContent = try element("floating-context-content")
        let pixelFrame = context.superview!.convertToBacking(context.frame)
        XCTAssertEqual(pixelFrame.minX, pixelFrame.minX.rounded(), accuracy: 0.001)
        XCTAssertEqual(pixelFrame.minY, pixelFrame.minY.rounded(), accuracy: 0.001)
        for label in all(menuContent).compactMap({ $0 as? NSTextField }) {
            let frame = context.superview!.convertToBacking(label.convert(label.bounds, to: context.superview))
            XCTAssertEqual(frame.minX, frame.minX.rounded(), accuracy: 0.001)
            XCTAssertEqual(frame.minY, frame.minY.rounded(), accuracy: 0.001)
            XCTAssertEqual(label.layer?.contentsScale, window.backingScaleFactor)
        }
        try capture("shared-context-light")
        let background = try XCTUnwrap(menuContent.subviews.first?.layer?.backgroundColor)
        try press("theme-toggle")
        XCTAssertNotEqual(menuContent.subviews.first?.layer?.backgroundColor, background)
        try capture("shared-context-dark")
        try press("menu-item-复制")
        XCTAssertTrue(layer.presented.isEmpty)
        XCTAssertTrue(window.makeFirstResponder(target))
        target.keyDown(with: try key(109, modifiers: .shift)); settle()
        XCTAssertFalse(try element("floating-context-content-surface").isHidden)
        try press("menu-item-查看详情")
        let drawer = try element("floating-drawer")
        XCTAssertFalse(drawer.isHidden)
        XCTAssertEqual(drawer.frame.maxX, view.bounds.maxX, accuracy: 1)
        XCTAssertEqual(drawer.frame.minY, 0, accuracy: 1)
        XCTAssertEqual(drawer.frame.height, view.bounds.height, accuracy: 1)
        XCTAssertEqual(drawer.frame.width, 320, accuracy: 1)
        let close = try element("floating-drawer-close")
        XCTAssertTrue(window.firstResponder === close)
        XCTAssertTrue(try element("main").isAccessibilityHidden())
        XCTAssertNil(layer.handle(try key(48))); settle()
        XCTAssertTrue(window.firstResponder === close)
        try capture("shared-drawer-dark")
        renderer.relayout(containerWidth: 760, containerHeight: 620); settle()
        XCTAssertEqual(drawer.frame.maxX, 760, accuracy: 1)
        XCTAssertEqual(drawer.frame.height, 620, accuracy: 1)
        XCTAssertNil(layer.handle(try key(53))); settle()
        XCTAssertTrue(drawer.isHidden)
        try press("floating-drawer-trigger")
        try press("floating-drawer-close")
        XCTAssertTrue(drawer.isHidden)
        try press("floating-drawer-trigger")
        let outside = try XCTUnwrap(NSEvent.mouseEvent(with: .leftMouseDown, location: NSPoint(x: 2, y: 2), modifierFlags: [], timestamp: 0, windowNumber: window.windowNumber, context: nil, eventNumber: 1, clickCount: 1, pressure: 1))
        XCTAssertNil(layer.handle(outside)); settle()
        XCTAssertTrue(drawer.isHidden)
        try press("floating-drawer-trigger")
        try press("nav-general")
        XCTAssertTrue(layer.presented.isEmpty)
        XCTAssertTrue(bridge.runtimeErrors.isEmpty, bridge.runtimeErrors.joined(separator: "\n"))
    }
}

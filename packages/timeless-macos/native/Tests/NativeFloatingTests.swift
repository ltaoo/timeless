import Cocoa
import XCTest
@testable import TimelessMacOS

final class NativeFloatingTests: XCTestCase {
    private func find(_ name: String, in root: NSView) -> NSView? {
        if root.identifier?.rawValue == name { return root }
        return root.subviews.lazy.compactMap { self.find(name, in: $0) }.first
    }

    func testPositionFlipsAndClampsAtViewportEdges() {
        let viewport = CGRect(x: 0, y: 0, width: 760, height: 620)
        let size = NSSize(width: 300, height: 180)
        let bottom = NativeFloatingLayer.position(size: size, anchor: CGRect(x: 700, y: 580, width: 50, height: 30), viewport: viewport, side: "bottom", align: "start", offset: 8)
        XCTAssertEqual(bottom.y, 392)
        XCTAssertEqual(bottom.x, 452)
        let top = NativeFloatingLayer.position(size: size, anchor: CGRect(x: 100, y: 10, width: 50, height: 30), viewport: viewport, side: "top", align: "center", offset: 8)
        XCTAssertEqual(top.y, 48)
        XCTAssertGreaterThanOrEqual(top.x, 8)
        let left = NativeFloatingLayer.position(size: size, anchor: CGRect(x: 10, y: 100, width: 50, height: 30), viewport: viewport, side: "left", align: "end", offset: 8)
        XCTAssertEqual(left.x, 68)
        XCTAssertGreaterThanOrEqual(left.y, 8)
    }

    func testGalleryModalPopoverAndTooltip() throws {
        guard let path = ProcessInfo.processInfo.environment["TIMELESS_MACOS_LEGACY_GALLERY_BUNDLE"] else { throw XCTSkip("Set TIMELESS_MACOS_LEGACY_GALLERY_BUNDLE for the floating gallery fixture") }
        _ = NSApplication.shared
        let bridge = JSBridge(devScriptPath: path)
        let renderer = NativeViewRenderer(bridge: bridge)
        var root: NSView?
        bridge.onRender = { root = renderer.render($0, containerWidth: 1000, containerHeight: 720) }
        bridge.onRelayout = { renderer.relayout() }
        bridge.run()
        let view = try XCTUnwrap(root)
        let window = NSWindow(contentRect: view.bounds, styleMask: [.titled], backing: .buffered, defer: false)
        let document = NSView(frame: view.bounds)
        document.addSubview(view)
        window.contentView = document
        defer { window.orderOut(nil) }
        func settle() { RunLoop.main.run(until: Date().addingTimeInterval(0.04)) }
        func element(_ name: String) throws -> NSView { try XCTUnwrap(find(name, in: view), name) }
        func press(_ name: String) throws {
            let button = try XCTUnwrap(element(name) as? FlippedView)
            XCTAssertTrue(button.accessibilityPerformPress())
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
        try press("nav-interaction")
        let layer = try XCTUnwrap(renderer.floatingLayer)
        let modal = try element("modal-surface")
        let trigger = try element("modal-trigger")
        XCTAssertTrue(modal.isHidden)
        XCTAssertTrue(window.makeFirstResponder(trigger))
        try press("modal-trigger")
        XCTAssertFalse(modal.isHidden)
        XCTAssertEqual(layer.presented.count, 1)
        XCTAssertTrue(try element("main").isAccessibilityHidden())
        let field = try XCTUnwrap(element("modal-name") as? NSTextField)
        XCTAssertTrue(window.firstResponder === field || window.firstResponder === field.currentEditor())
        XCTAssertEqual(modal.frame.midX, view.bounds.midX, accuracy: 0.01)
        try capture("modal")
        XCTAssertNil(layer.handle(try key(48, modifiers: .shift)))
        XCTAssertTrue(window.firstResponder === (try element("modal-save")))
        XCTAssertNil(layer.handle(try key(48)))
        XCTAssertTrue(window.firstResponder === field || window.firstResponder === field.currentEditor())
        XCTAssertNil(layer.handle(try key(53)))
        settle()
        XCTAssertTrue(modal.isHidden)
        XCTAssertTrue(window.firstResponder === trigger)
        XCTAssertFalse(try element("main").isAccessibilityHidden())
        try press("modal-trigger")
        let outside = try XCTUnwrap(NSEvent.mouseEvent(with: .leftMouseDown, location: NSPoint(x: 3, y: 3), modifierFlags: [], timestamp: 0, windowNumber: window.windowNumber, context: nil, eventNumber: 1, clickCount: 1, pressure: 1))
        XCTAssertNil(layer.handle(outside))
        settle()
        XCTAssertTrue(modal.isHidden)
        try press("modal-trigger")
        field.stringValue = "Native User"
        field.delegate?.controlTextDidChange?(Notification(name: NSControl.textDidChangeNotification, object: field))
        try press("modal-save")
        XCTAssertTrue(modal.isHidden)

        let scroll = try XCTUnwrap(element("page-scroll") as? NativeScrollView)
        func reveal(_ name: String) throws {
            let target = try element(name)
            let bounds = target.convert(target.bounds, to: scroll.documentView)
            scroll.contentView.scroll(to: NSPoint(x: 0, y: max(0, bounds.minY - 80)))
            scroll.reflectScrolledClipView(scroll.contentView)
            settle()
        }
        try reveal("popover-trigger")
        try press("popover-trigger")
        let popover = try element("popover-surface")
        let anchor = try element("popover-trigger")
        XCTAssertFalse(popover.isHidden)
        XCTAssertFalse(popover.isDescendant(of: try XCTUnwrap(scroll.documentView)))
        let reference = anchor.convert(anchor.bounds, to: popover.superview)
        XCTAssertEqual(popover.frame.minX, reference.minX, accuracy: 0.01)
        XCTAssertEqual(popover.frame.minY, reference.maxY + 8, accuracy: 0.01)
        try capture("popover")
        renderer.relayout(containerWidth: 760, containerHeight: 620)
        XCTAssertLessThanOrEqual(popover.frame.maxX, 752)
        XCTAssertNotNil(layer.handle(outside))
        settle()
        XCTAssertTrue(popover.isHidden)
        try reveal("popover-trigger")
        try press("popover-trigger")
        scroll.contentView.scroll(to: NSPoint(x: 0, y: 1500))
        settle()
        XCTAssertTrue(popover.isHidden, "An off-screen anchor dismisses the popover")

        try reveal("tooltip-trigger")
        let tooltipTrigger = try XCTUnwrap(element("tooltip-trigger") as? FlippedView)
        let hover = try XCTUnwrap(NSEvent.enterExitEvent(with: .mouseEntered, location: .zero, modifierFlags: [], timestamp: 0, windowNumber: window.windowNumber, context: nil, eventNumber: 1, trackingNumber: 1, userData: nil))
        tooltipTrigger.mouseEntered(with: hover)
        settle()
        let tooltip = try element("tooltip-surface")
        XCTAssertFalse(tooltip.isHidden)
        try capture("tooltip")
        tooltipTrigger.mouseExited(with: hover)
        settle()
        XCTAssertTrue(tooltip.isHidden)
        XCTAssertTrue(window.makeFirstResponder(tooltipTrigger))
        settle()
        XCTAssertFalse(tooltip.isHidden)
        XCTAssertNil(layer.handle(try key(53)))
        settle()
        XCTAssertTrue(tooltip.isHidden)
        XCTAssertTrue(window.firstResponder === tooltipTrigger)
        try reveal("popover-trigger")
        try press("popover-trigger")
        try press("nav-general")
        XCTAssertTrue(popover.isHidden)
        XCTAssertTrue(layer.presented.isEmpty)
        XCTAssertTrue(bridge.runtimeErrors.isEmpty, bridge.runtimeErrors.joined(separator: "\n"))
    }
}

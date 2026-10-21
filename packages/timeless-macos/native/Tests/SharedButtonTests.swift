import Cocoa
import XCTest
@testable import TimelessMacOS

final class SharedButtonTests: XCTestCase {
    func testOriginalShadcnButtonAndCSS() throws {
        guard let path = ProcessInfo.processInfo.environment["TIMELESS_MACOS_TEST_BUNDLE"] else { throw XCTSkip("Set TIMELESS_MACOS_TEST_BUNDLE") }
        let source = try String(contentsOfFile: path, encoding: .utf8)
        let script = FileManager.default.temporaryDirectory.appendingPathComponent("timeless-shared-button-\(UUID().uuidString).js")
        try source.write(to: script, atomically: true, encoding: .utf8)
        defer { try? FileManager.default.removeItem(at: script) }
        _ = NSApplication.shared
        let bridge = JSBridge(devScriptPath: script.path)
        let renderer = NativeViewRenderer(bridge: bridge)
        var root: NSView?
        bridge.onRender = { root = renderer.render($0, containerWidth: 1000, containerHeight: 720) }
        bridge.onRelayout = { renderer.relayout() }
        bridge.run()
        let view = try XCTUnwrap(root)
        let window = NSWindow(contentRect: view.bounds, styleMask: [.titled], backing: .buffered, defer: false)
        let document = FlippedView(frame: view.bounds)
        document.addSubview(view)
        window.contentView = document
        defer { window.orderOut(nil) }
        func settle() { RunLoop.main.run(until: Date().addingTimeInterval(0.03)) }
        func find(_ name: String, in current: NSView) -> NSView? {
            if current.identifier?.rawValue == name { return current }
            return current.subviews.lazy.compactMap { find(name, in: $0) }.first
        }
        func element(_ name: String) throws -> NSView { try XCTUnwrap(find(name, in: view), name) }
        func frames(_ current: NSView) -> [NSRect] { [current.frame] + current.subviews.flatMap(frames) }
        settle()
        let buttons = try ["default", "secondary", "outline", "ghost", "destructive", "link"].map { try XCTUnwrap(element("button-\($0)") as? FlippedView) }
        for width: CGFloat in [1000, 760] {
            renderer.relayout(containerWidth: width, containerHeight: 720)
            settle()
            let before = frames(view)
            for button in buttons {
                XCTAssertGreaterThan(button.frame.width, 30)
                XCTAssertEqual(button.frame.height, 32, accuracy: 0.01)
                XCTAssertEqual(button.layer?.borderWidth, 1)
                let point = button.convert(NSPoint(x: button.bounds.midX, y: button.bounds.midY), to: nil)
                let event = try XCTUnwrap(NSEvent.mouseEvent(with: .leftMouseDown, location: point, modifierFlags: [], timestamp: 0, windowNumber: window.windowNumber, context: nil, eventNumber: 0, clickCount: 1, pressure: 1))
                button.mouseDown(with: event)
                settle()
                XCTAssertNil(button.shadowLayer, "Mouse focus follows the shared focus-visible selector")
                XCTAssertEqual(frames(view), before)
                XCTAssertTrue(window.makeFirstResponder(nil))
                XCTAssertTrue(window.makeFirstResponder(button))
                settle()
                XCTAssertNotNil(button.shadowLayer)
                XCTAssertEqual(button.shadowLayer?.shadowRadius, 0, "Blur comes from the original CSS, with no platform override")
                XCTAssertEqual(try XCTUnwrap(button.shadowLayer?.shadowPath).boundingBoxOfPath.size, NSSize(width: button.bounds.width + 6, height: button.bounds.height + 6))
                XCTAssertEqual(frames(view), before)
                if width == 1000 && button === buttons[0], let directory = ProcessInfo.processInfo.environment["TIMELESS_MACOS_SCREENSHOTS"] {
                    try FileManager.default.createDirectory(atPath: directory, withIntermediateDirectories: true)
                    window.orderFrontRegardless()
                    RunLoop.main.run(until: Date().addingTimeInterval(0.2))
                    let capture = Process()
                    capture.executableURL = URL(fileURLWithPath: "/usr/sbin/screencapture")
                    capture.arguments = ["-x", "-o", "-l", String(window.windowNumber), directory + "/shared-native-button.png"]
                    try capture.run()
                    capture.waitUntilExit()
                    XCTAssertEqual(capture.terminationStatus, 0)
                    window.orderOut(nil)
                }
                XCTAssertTrue(window.makeFirstResponder(nil))
                settle()
                XCTAssertNil(button.shadowLayer)
                XCTAssertEqual(frames(view), before)
            }
        }
        let button = buttons[0]
        XCTAssertTrue(window.makeFirstResponder(button))
        let tab = try XCTUnwrap(NSEvent.keyEvent(with: .keyDown, location: .zero, modifierFlags: [], timestamp: 0, windowNumber: window.windowNumber, context: nil, characters: "\t", charactersIgnoringModifiers: "\t", isARepeat: false, keyCode: 48))
        button.keyDown(with: tab)
        settle()
        XCTAssertTrue(window.firstResponder === buttons[1], "Tab must reach the next shared button")
        XCTAssertNotNil(buttons[1].shadowLayer)
        let back = try XCTUnwrap(NSEvent.keyEvent(with: .keyDown, location: .zero, modifierFlags: [.shift], timestamp: 0, windowNumber: window.windowNumber, context: nil, characters: "\t", charactersIgnoringModifiers: "\t", isARepeat: false, keyCode: 48))
        buttons[1].keyDown(with: back)
        settle()
        XCTAssertTrue(window.firstResponder === button, "Shift-Tab must restore the previous button")
        XCTAssertTrue(window.makeFirstResponder(nil))
        func press(_ name: String) throws {
            XCTAssertTrue(try XCTUnwrap(element(name) as? FlippedView).accessibilityPerformPress())
            settle()
        }
        func text(in current: NSView) -> String {
            if let field = current as? NSTextField { return field.stringValue }
            return current.subviews.map { text(in: $0) }.joined()
        }
        let sidebar = try element("sider")
        for page in ["overview", "general", "data_entry", "layout"] {
            let icon = try XCTUnwrap(element("nav-\(page)-icon") as? NSImageView)
            XCTAssertNotNil(icon.image, "Registered SVG must render in the shared menu")
            XCTAssertEqual(icon.frame.size, NSSize(width: 16, height: 16))
        }
        let main = try element("main")
        XCTAssertEqual(sidebar.frame.width, 192, accuracy: 0.01)
        XCTAssertEqual(main.frame.minX, sidebar.frame.maxX, accuracy: 0.01)
        try press("button-default")
        XCTAssertEqual(text(in: try element("count")), "1")
        try press("nav-overview")
        XCTAssertEqual(text(in: try element("route-path")), "/home/overview")
        XCTAssertTrue(try element("page-general").isHidden)
        XCTAssertFalse(try element("page-overview").isHidden)
        XCTAssertFalse(button.acceptsFirstResponder)
        _ = window.makeFirstResponder(button)
        XCTAssertFalse(window.firstResponder === button, "Hidden routes must not receive keyboard focus")
        try press("nav-layout")
        XCTAssertFalse(try element("page-layout").isHidden)
        XCTAssertEqual(sidebar.frame.width, 192, accuracy: 0.01)
        let layout = try element("layout-cards")
        XCTAssertGreaterThan(try element("layout-card-3").frame.minY, try element("layout-card-1").frame.minY, "Cards wrap in the narrow content area")
        XCTAssertGreaterThan(layout.frame.height, 0)
        try press("route-back")
        XCTAssertEqual(text(in: try element("route-path")), "/home/overview")
        try press("route-back")
        XCTAssertFalse(try element("page-general").isHidden)
        XCTAssertEqual(text(in: try element("count")), "1")
        XCTAssertTrue(try element("button-default") === button)
        try press("route-forward")
        XCTAssertEqual(text(in: try element("route-path")), "/home/overview")
        try press("nav-general")
        XCTAssertFalse(try XCTUnwrap(element("route-forward") as? FlippedView).accessibilityPerformPress())
        let light = button.layer?.backgroundColor
        let menuIcon = try XCTUnwrap(element("nav-general-icon") as? NSImageView)
        let lightIcon = try XCTUnwrap(menuIcon.image)
        let theme = try XCTUnwrap(element("theme-toggle") as? FlippedView)
        XCTAssertTrue(theme.accessibilityPerformPress())
        settle()
        XCTAssertNotEqual(button.layer?.backgroundColor, light)
        XCTAssertFalse(menuIcon.image === lightIcon, "SVG currentColor must follow the shared dark theme")
        XCTAssertTrue(theme.accessibilityPerformPress())
        settle()
        XCTAssertEqual(button.layer?.backgroundColor, light)
        XCTAssertTrue(menuIcon.image === lightIcon, "The restored theme should reuse the cached SVG")
        XCTAssertFalse(try XCTUnwrap(element("button-disabled") as? FlippedView).accessibilityPerformPress())
        let updated = source.replacingOccurrences(of: "calc\\(3px\\s*\\+", with: "calc(5px +", options: .regularExpression)
        XCTAssertNotEqual(updated, source)
        try updated.write(to: script, atomically: true, encoding: .utf8)
        bridge.reload()
        settle()
        XCTAssertTrue(find("button-default", in: view) === button, "CSS updates must reuse the mounted native button")
        for _ in 0..<2 {
            XCTAssertTrue(window.makeFirstResponder(button))
            settle()
            XCTAssertEqual(try XCTUnwrap(button.shadowLayer?.shadowPath).boundingBoxOfPath.width, button.bounds.width + 10, "A changed stylesheet must remain active after focus changes")
            XCTAssertTrue(window.makeFirstResponder(nil))
        }
        XCTAssertTrue(bridge.runtimeErrors.isEmpty, bridge.runtimeErrors.joined(separator: "\n"))
    }
}

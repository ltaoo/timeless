import Cocoa
import XCTest
@testable import TimelessMacOS

final class SharedTextareaTests: XCTestCase {
    func testShadcnTextareaSynchronizesContentStyleAndFocusDecoration() throws {
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
            RunLoop.main.run(until: Date().addingTimeInterval(0.03))
            renderer.relayout()
        }
        func press(_ name: String) throws {
            XCTAssertTrue(try XCTUnwrap(element(name) as? FlippedView).accessibilityPerformPress())
            settle()
        }
        try press("nav-data_entry")
        let scroll = try XCTUnwrap(element("form-bio") as? NSScrollView)
        let text = try XCTUnwrap(scroll.documentView as? NSTextView)
        let input = try XCTUnwrap(element("form-name") as? StyledTextField)
        func shadow() -> CALayer? { scroll.layer?.sublayers?.first { $0.shadowPath != nil } }
        func frames() -> [NSRect] { all(view).filter { $0.identifier != nil }.map(\.frame) }
        XCTAssertEqual(text.textContainerInset, NSSize(width: 10, height: 8), "Styles resolved when the hidden route is revealed must reach NSTextView")
        XCTAssertEqual(text.textContainer?.lineFragmentPadding, 0)
        XCTAssertEqual(text.textColor, input.textColor)
        var colors: [CGColor] = []
        for theme in ["light", "dark"] {
            let before = frames()
            XCTAssertTrue(window.makeFirstResponder(text))
            settle()
            XCTAssertTrue(text.string.isEmpty, "Focusing must paint the ring without typing")
            let ring = try XCTUnwrap(shadow())
            colors.append(try XCTUnwrap(ring.shadowColor))
            XCTAssertGreaterThan(ring.shadowOpacity, 0)
            XCTAssertEqual(ring.shadowRadius, 0)
            XCTAssertEqual(try XCTUnwrap(ring.shadowPath).boundingBoxOfPath.size, NSSize(width: scroll.bounds.width + 6, height: scroll.bounds.height + 6))
            XCTAssertEqual(scroll.focusRingType, .none)
            XCTAssertEqual(text.focusRingType, .none)
            XCTAssertEqual(frames(), before, "Focus decoration must not change layout (\(theme))")
            if let directory = ProcessInfo.processInfo.environment["TIMELESS_MACOS_SCREENSHOTS"] {
                try FileManager.default.createDirectory(atPath: directory, withIntermediateDirectories: true)
                scroll.scrollToVisible(scroll.bounds)
                window.orderFrontRegardless()
                RunLoop.main.run(until: Date().addingTimeInterval(0.1))
                let capture = Process()
                capture.executableURL = URL(fileURLWithPath: "/usr/sbin/screencapture")
                capture.arguments = ["-x", "-o", "-l", String(window.windowNumber), directory + "/shared-textarea-\(theme).png"]
                try capture.run(); capture.waitUntilExit()
                XCTAssertEqual(capture.terminationStatus, 0)
                window.orderOut(nil)
            }
            renderer.relayout(containerWidth: 760, containerHeight: 800)
            settle()
            XCTAssertEqual(try XCTUnwrap(ring.shadowPath).boundingBoxOfPath.size, NSSize(width: scroll.bounds.width + 6, height: scroll.bounds.height + 6))
            XCTAssertEqual(text.textContainerInset, NSSize(width: 10, height: 8))
            XCTAssertTrue(window.makeFirstResponder(input))
            settle()
            XCTAssertNil(shadow(), "Moving focus from Textarea to Input must remove its ring")
            XCTAssertNotNil(input.decoration.shadowLayer)
            XCTAssertTrue(window.makeFirstResponder(text))
            settle()
            XCTAssertNotNil(shadow())
            XCTAssertNil(input.decoration.shadowLayer)
            XCTAssertTrue(window.makeFirstResponder(nil))
            settle()
            XCTAssertNil(shadow(), "Clearing first responder must remove the ring")
            renderer.relayout(containerWidth: 1000, containerHeight: 800)
            try press("theme-toggle")
            XCTAssertEqual(text.textColor, input.textColor, "Textarea content must follow the shared theme")
        }
        XCTAssertNotEqual(colors.first, colors.last, "The ring must use the current theme tokens")
        XCTAssertTrue(window.makeFirstResponder(text))
        text.insertText("第一行\n第二行", replacementRange: NSRange(location: 0, length: 0))
        settle()
        XCTAssertEqual(text.string, "第一行\n第二行")
        XCTAssertEqual(text.selectedRange().location, (text.string as NSString).length, "Style updates must preserve the caret")
        XCTAssertTrue(window.makeFirstResponder(nil))
        try press("form-reset")
        XCTAssertEqual(text.string, "")
        NativeViewRenderer.applyStyle(["padding-left": "14px", "padding-top": "12px", "font-size": "18px", "color": "#123456"], to: scroll)
        XCTAssertEqual(text.textContainerInset, NSSize(width: 14, height: 12))
        XCTAssertEqual(text.font?.pointSize, 18)
        XCTAssertEqual(text.textColor, NativeViewRenderer.parseColor("#123456"))
        NativeViewRenderer.applyStyle([:], to: scroll)
        XCTAssertEqual(text.textContainerInset, .zero, "Removing padding must reset the native inset")
        XCTAssertTrue(bridge.runtimeErrors.isEmpty, bridge.runtimeErrors.joined(separator: "\n"))
    }
}

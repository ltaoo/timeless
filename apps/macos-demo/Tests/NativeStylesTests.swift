import Cocoa
import XCTest
@testable import TimelessMacDemo

final class NativeStylesTests: XCTestCase {
    private func find(_ name: String, in root: NSView) -> NSView? {
        if root.identifier?.rawValue == name { return root }
        return root.subviews.lazy.compactMap { self.find(name, in: $0) }.first
    }

    private func text(in root: NSView) -> String {
        if let field = root as? NSTextField { return field.stringValue }
        return root.subviews.map { text(in: $0) }.joined()
    }

    func testCompiledCSSRendersAndUpdatesNativeViews() throws {
        let appDirectory = URL(fileURLWithPath: #filePath).deletingLastPathComponent().deletingLastPathComponent()
        let source = try String(contentsOf: appDirectory.appendingPathComponent("dist/app.js"))
        let script = FileManager.default.temporaryDirectory.appendingPathComponent("timeless-styles-\(UUID().uuidString).js")
        try source.write(to: script, atomically: true, encoding: .utf8)
        defer { try? FileManager.default.removeItem(at: script) }
        let bridge = JSBridge(devScriptPath: script.path)
        let renderer = NativeViewRenderer(bridge: bridge)
        var root: NSView?
        bridge.onRender = { node in
            root = renderer.render(node, containerWidth: 800, containerHeight: 650)
        }
        bridge.onRelayout = { renderer.relayout() }
        bridge.run()

        let view = try XCTUnwrap(root, "The built JS bundle must run in JavaScriptCore")
        let action = try XCTUnwrap(find("increment-action", in: view) as? FlippedView)
        let count = try XCTUnwrap(find("counter-value", in: view))
        let card = try XCTUnwrap(find("interactive-card", in: view))
        XCTAssertEqual(action.layer?.cornerRadius, 8)
        XCTAssertEqual(action.accessibilityLabel(), "Increment counter")
        XCTAssertEqual(text(in: count), "0")

        XCTAssertTrue(action.accessibilityPerformPress())
        XCTAssertEqual(text(in: count), "1")
        let variant = try XCTUnwrap(find("variant-toggle", in: view) as? FlippedView)
        XCTAssertTrue(variant.accessibilityPerformPress())
        XCTAssertEqual(action.layer?.backgroundColor, NativeViewRenderer.parseColor("#cf304a")?.cgColor)

        let disabled = try XCTUnwrap(find("disabled-toggle", in: view) as? FlippedView)
        XCTAssertTrue(disabled.accessibilityPerformPress())
        XCTAssertTrue(action.disabled)
        XCTAssertEqual(action.alphaValue, 0.4, accuracy: 0.001)
        XCTAssertFalse(action.accessibilityPerformPress())
        XCTAssertEqual(text(in: count), "1")
        XCTAssertTrue(disabled.accessibilityPerformPress())
        XCTAssertEqual(action.alphaValue, 1)

        let before = count.frame.origin.x
        let spacing = try XCTUnwrap(find("spacing-toggle", in: view) as? FlippedView)
        XCTAssertTrue(spacing.accessibilityPerformPress())
        RunLoop.main.run(until: Date().addingTimeInterval(0.05))
        XCTAssertEqual(before - count.frame.origin.x, 12, accuracy: 0.01)
        XCTAssertGreaterThan(card.frame.height, action.frame.height)

        for type in [NSEvent.EventType.keyDown, .keyUp] {
            let event = try XCTUnwrap(NSEvent.keyEvent(with: type, location: .zero, modifierFlags: [], timestamp: 0, windowNumber: 0, context: nil, characters: " ", charactersIgnoringModifiers: " ", isARepeat: false, keyCode: 49))
            if type == .keyDown { action.keyDown(with: event) } else { action.keyUp(with: event) }
        }
        XCTAssertEqual(text(in: count), "2")

        let field = try XCTUnwrap(find("name-input", in: view) as? StyledTextField)
        field.stringValue = "Timeless"
        field.delegate?.controlTextDidChange?(Notification(name: NSControl.textDidChangeNotification, object: field))
        let greeting = try XCTUnwrap(find("name-greeting", in: view))
        XCTAssertEqual(text(in: greeting), "Hello, Timeless")
        field.delegate?.controlTextDidBeginEditing?(Notification(name: NSControl.textDidBeginEditingNotification, object: field))
        XCTAssertEqual(field.layer?.borderColor, NativeViewRenderer.parseColor("#304ffe")?.cgColor)
        field.delegate?.controlTextDidEndEditing?(Notification(name: NSControl.textDidEndEditingNotification, object: field))
        XCTAssertEqual(field.layer?.borderColor, NativeViewRenderer.parseColor("#c5cede")?.cgColor)

        renderer.relayout(containerWidth: 600, containerHeight: 650)
        XCTAssertTrue(find("increment-action", in: view) === action)
        XCTAssertEqual(view.frame.width, 600)
        XCTAssertEqual(text(in: count), "2")

        try source.replacingOccurrences(of: "#304ffe", with: "#228855").write(to: script, atomically: true, encoding: .utf8)
        bridge.reload()
        XCTAssertTrue(find("increment-action", in: view) === action)
        XCTAssertEqual(action.layer?.backgroundColor, NativeViewRenderer.parseColor("#228855")?.cgColor)
    }

    func testPaintPropertiesResetWhenClassDeclarationsDisappear() {
        let view = FlippedView(frame: NSRect(x: 0, y: 0, width: 100, height: 40))
        NativeViewRenderer.applyStyle(["background-color": "#1234", "border-width": "2px", "border-radius": "10px", "opacity": "0.5", "display": "none"], to: view)
        XCTAssertEqual(view.layer?.cornerRadius, 10)
        XCTAssertTrue(view.isHidden)
        NativeViewRenderer.applyStyle([:], to: view)
        XCTAssertEqual(view.layer?.cornerRadius, 0)
        XCTAssertEqual(view.layer?.borderWidth, 0)
        XCTAssertEqual(view.alphaValue, 1)
        XCTAssertFalse(view.isHidden)
        XCTAssertEqual(view.layer?.backgroundColor, NSColor.clear.cgColor)
    }
}

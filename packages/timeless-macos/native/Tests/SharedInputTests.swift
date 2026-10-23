import Cocoa
import XCTest
@testable import TimelessMacOS

final class SharedInputTests: XCTestCase {
    func testShadcnInputFocusUsesSharedCSSWithoutMovingContent() throws {
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
        XCTAssertTrue(try XCTUnwrap(element("nav-data_entry") as? FlippedView).accessibilityPerformPress())
        settle()
        let field = try XCTUnwrap(element("form-name") as? StyledTextField)
        let node = try XCTUnwrap(field.nativeNode)
        func frames() -> [NSRect] { all(view).filter { $0.identifier != nil }.map(\.frame) }
        let before = frames()
        var colors: [CGColor] = []
        for theme in ["light", "dark"] {
            XCTAssertTrue(window.makeFirstResponder(field))
            settle()
            XCTAssertNotNil(field.currentEditor())
            XCTAssertTrue(node.forProperty("attrs")?.forProperty("class")?.toString().contains("ring-3") == true, "Focusing without typing must update the shared Input VM")
            let shadowCSS = node.forProperty("style")?.forProperty("box-shadow")?.toString() ?? ""
            XCTAssertTrue(shadowCSS.contains("3px"), "The host must receive the computed CSS ring: \(shadowCSS)")
            let shadow = try XCTUnwrap(field.decoration.shadowLayer, "NSTextField must paint the shared CSS shadow")
            let colorCSS = try XCTUnwrap(shadowCSS.split(separator: " ").last)
            let color = try XCTUnwrap(NativeViewRenderer.parseColor(String(colorCSS)))
            XCTAssertEqual(shadow.shadowColor, color.withAlphaComponent(1).cgColor)
            XCTAssertEqual(shadow.shadowOpacity, Float(color.alphaComponent))
            colors.append(try XCTUnwrap(shadow.shadowColor))
            XCTAssertEqual(shadow.shadowRadius, 0, "The current ring-3 CSS has zero blur")
            XCTAssertEqual(try XCTUnwrap(shadow.shadowPath).boundingBoxOfPath.size, NSSize(width: field.bounds.width + 6, height: field.bounds.height + 6))
            XCTAssertEqual(field.focusRingType, .none)
            XCTAssertNil(field.decoration.outlineLayer)
            XCTAssertEqual(frames(), before)
            if let directory = ProcessInfo.processInfo.environment["TIMELESS_MACOS_SCREENSHOTS"] {
                try FileManager.default.createDirectory(atPath: directory, withIntermediateDirectories: true)
                window.orderFrontRegardless()
                RunLoop.main.run(until: Date().addingTimeInterval(0.1))
                let capture = Process()
                capture.executableURL = URL(fileURLWithPath: "/usr/sbin/screencapture")
                capture.arguments = ["-x", "-o", "-l", String(window.windowNumber), directory + "/shared-input-\(theme).png"]
                try capture.run(); capture.waitUntilExit()
                XCTAssertEqual(capture.terminationStatus, 0)
                window.orderOut(nil)
            }
            let email = try XCTUnwrap(element("form-email") as? StyledTextField)
            XCTAssertTrue(window.makeFirstResponder(email))
            settle()
            let emailClass = email.nativeNode?.forProperty("attrs")?.forProperty("class")?.toString() ?? ""
            XCTAssertNotNil(email.decoration.shadowLayer, "Focus transfers to the next input without typing (\(theme)): \(emailClass)")
            XCTAssertFalse(node.forProperty("attrs")?.forProperty("class")?.toString().contains("ring-3") == true)
            XCTAssertNil(field.decoration.shadowLayer)
            XCTAssertEqual(frames(), before)
            let quantity = try XCTUnwrap(element("form-quantity") as? StyledTextField)
            XCTAssertTrue(window.makeFirstResponder(quantity))
            settle()
            XCTAssertNotNil(quantity.decoration.shadowLayer, "Editable text controls also match the shared focus-visible CSS")
            XCTAssertNil(email.decoration.shadowLayer)
            XCTAssertTrue(window.makeFirstResponder(nil))
            settle()
            XCTAssertNil(quantity.decoration.shadowLayer)
            XCTAssertTrue(try XCTUnwrap(element("theme-toggle") as? FlippedView).accessibilityPerformPress())
            settle()
        }
        XCTAssertNotEqual(colors.first, colors.last, "Ring colors follow the shared theme tokens")
        XCTAssertTrue(bridge.runtimeErrors.isEmpty, bridge.runtimeErrors.joined(separator: "\n"))
    }

    func testInputDecorationUsesArbitraryCSSAndTracksResize() throws {
        let field = StyledTextField(frame: NSRect(x: 10, y: 20, width: 100, height: 32))
        NativeViewRenderer.applyStyle([
            "border-width": "1px", "border-radius": "6px",
            "outline-style": "solid", "outline-width": "2px", "outline-offset": "1px",
            "box-shadow": "2px -1px 4px 5px #12345680",
        ], to: field)
        let shadow = try XCTUnwrap(field.decoration.shadowLayer)
        let outline = try XCTUnwrap(field.decoration.outlineLayer)
        XCTAssertEqual(field.frame.size, NSSize(width: 100, height: 32))
        XCTAssertEqual(field.layer?.borderWidth, 1)
        XCTAssertEqual(shadow.shadowRadius, 2)
        XCTAssertEqual(shadow.shadowOffset, NSSize(width: 2, height: -1))
        XCTAssertEqual(try XCTUnwrap(shadow.shadowPath).boundingBoxOfPath.size, NSSize(width: 110, height: 42))
        let mask = try XCTUnwrap(shadow.mask as? CAShapeLayer)
        XCTAssertFalse(try XCTUnwrap(mask.path).contains(NSPoint(x: shadow.bounds.midX, y: shadow.bounds.midY), using: .evenOdd))
        field.setFrameSize(NSSize(width: 200, height: 40))
        XCTAssertEqual(try XCTUnwrap(shadow.shadowPath).boundingBoxOfPath.size, NSSize(width: 210, height: 50))
        XCTAssertEqual(outline.frame, field.bounds.insetBy(dx: -3, dy: -3))
        NativeViewRenderer.applyStyle([:], to: field)
        XCTAssertNil(field.decoration.shadowLayer)
        XCTAssertNil(field.decoration.outlineLayer)
        XCTAssertNil(shadow.superlayer)
        XCTAssertNil(outline.superlayer)
    }
}

import Cocoa
import XCTest
@testable import TimelessMacOS

final class NativeStylesTests: XCTestCase {
    func testFullRadiusAndTranslatePreserveLayoutSize() {
        let view = FlippedView(frame: CGRect(x: 0, y: 0, width: 44, height: 24))
        NativeViewRenderer.applyStyle(["border-radius": "3.40282e38px"], to: view)
        XCTAssertEqual(view.layer?.cornerRadius, 12)
        view.setFrameSize(NSSize(width: 20, height: 20))
        XCTAssertEqual(view.layer?.cornerRadius, 10)
        let frame = CGRect(x: 5, y: 10, width: 20, height: 20)
        XCTAssertEqual(NativeViewRenderer.translatedFrame(frame, style: ["translate": "20px -50%"]), CGRect(x: 25, y: 0, width: 20, height: 20))
        XCTAssertEqual(NativeViewRenderer.translatedFrame(frame, style: ["translate": "none"]), frame)
    }

    private func find(_ name: String, in root: NSView) -> NSView? {
        if root.identifier?.rawValue == name { return root }
        return root.subviews.lazy.compactMap { self.find(name, in: $0) }.first
    }

    private func text(in root: NSView) -> String {
        if let field = root as? NSTextField { return field.stringValue }
        return root.subviews.map { text(in: $0) }.joined()
    }

    func testCompiledCSSRendersAndUpdatesNativeViews() throws {
        let appDirectory = URL(fileURLWithPath: #filePath).deletingLastPathComponent().deletingLastPathComponent().deletingLastPathComponent().deletingLastPathComponent().deletingLastPathComponent().appendingPathComponent("apps/macos-demo")
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

    func testLegacyWebShadcnGallery() throws {
        guard let path = ProcessInfo.processInfo.environment["TIMELESS_MACOS_LEGACY_GALLERY_BUNDLE"] else {
            throw XCTSkip("Set TIMELESS_MACOS_LEGACY_GALLERY_BUNDLE for the previous gallery fixture")
        }
        _ = NSApplication.shared
        let bridge = JSBridge(devScriptPath: path)
        let renderer = NativeViewRenderer(bridge: bridge)
        var root: NSView?
        bridge.onRender = { root = renderer.render($0, containerWidth: 1000, containerHeight: 720) }
        bridge.onRelayout = { renderer.relayout() }
        bridge.run()
        let view = try XCTUnwrap(root)
        let window = NSWindow(contentRect: view.bounds, styleMask: [.borderless], backing: .buffered, defer: false)
        let document = FlippedView(frame: view.bounds)
        document.addSubview(view)
        window.contentView = document
        defer { window.orderOut(nil) }
        func settle() {
            RunLoop.main.run(until: Date().addingTimeInterval(0.03))
            renderer.relayout()
        }
        func element(_ name: String) throws -> NSView { try XCTUnwrap(find(name, in: view), name) }
        func press(_ name: String) throws {
            let button = try XCTUnwrap(element(name) as? FlippedView)
            XCTAssertTrue(button.accessibilityPerformPress(), name)
            settle()
        }
        func type(_ name: String, _ value: String) throws {
            let field = try XCTUnwrap(element(name) as? NSTextField)
            field.stringValue = value
            field.delegate?.controlTextDidChange?(Notification(name: NSControl.textDidChangeNotification, object: field))
            settle()
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
        func frames(in root: NSView) -> [NSRect] {
            [root.frame] + root.subviews.flatMap { frames(in: $0) }
        }
        let buttons = try ["default", "secondary", "outline", "ghost", "destructive", "link", "small", "large"].map {
            try XCTUnwrap(element("button-\($0)") as? FlippedView)
        }
        let page = try element("page-general")
        for width: CGFloat in [1000, 760] {
            renderer.relayout(containerWidth: width, containerHeight: 720)
            settle()
            let before = frames(in: page)
            let borders = buttons.map { $0.layer?.borderWidth }
            for (index, button) in buttons.enumerated() {
                // Exercise the mouse focus path and the responder path used by keyboard navigation.
                let point = button.convert(NSPoint(x: button.bounds.midX, y: button.bounds.midY), to: nil)
                let event = try XCTUnwrap(NSEvent.mouseEvent(with: .leftMouseDown, location: point, modifierFlags: [], timestamp: 0, windowNumber: window.windowNumber, context: nil, eventNumber: 0, clickCount: 1, pressure: 1))
                button.mouseDown(with: event)
                settle()
                XCTAssertTrue(window.firstResponder === button)
                XCTAssertEqual(frames(in: page), before, "Mouse focus must not move content: \(button.identifier!.rawValue), width \(width)")
                XCTAssertEqual(button.layer?.borderWidth, borders[index])
                let shadow = try XCTUnwrap(button.shadowLayer)
                let color = button.identifier?.rawValue == "button-destructive" ? "#e7000b33" : "#a1a1a180"
                let expected = try XCTUnwrap(NativeViewRenderer.parseColor(color))
                XCTAssertEqual(shadow.shadowColor, expected.withAlphaComponent(1).cgColor)
                XCTAssertEqual(shadow.shadowOpacity, Float(expected.alphaComponent))
                XCTAssertEqual(shadow.shadowRadius, 0.5)
                XCTAssertEqual(try XCTUnwrap(shadow.shadowPath).boundingBoxOfPath.size, NSSize(width: button.bounds.width + 6, height: button.bounds.height + 6))
                XCTAssertNil(button.outlineLayer, "The focus ring must use box-shadow, not a hard outline")
                XCTAssertEqual(button.focusRingType, .none)
                if width == 1000 && index == 0 { try capture("focus-default") }
                XCTAssertTrue(window.makeFirstResponder(nil))
                XCTAssertTrue(window.makeFirstResponder(button))
                settle()
                XCTAssertEqual(frames(in: page), before, "Keyboard focus must not move content: \(button.identifier!.rawValue), width \(width)")
                XCTAssertTrue(window.makeFirstResponder(nil))
                settle()
                XCTAssertNil(button.outlineLayer, "The CSS focus ring must disappear on blur")
                XCTAssertNil(button.shadowLayer, "The CSS shadow must disappear on blur")
                XCTAssertEqual(frames(in: page), before, "Blur must not move content")
            }
        }
        renderer.relayout(containerWidth: 1000, containerHeight: 720)
        settle()
        try capture("general")
        let count = try element("macos-count")
        let action = try XCTUnwrap(element("macos-increment") as? FlippedView)
        XCTAssertEqual(text(in: count), "0")
        XCTAssertGreaterThan(action.frame.height, 0)
        XCTAssertEqual(action.accessibilityLabel(), "增加计数")
        try press("macos-increment")
        XCTAssertEqual(text(in: count), "1")
        try press("nav-data_entry")
        XCTAssertTrue(try element("page-general").isHidden)
        XCTAssertFalse(try element("page-data_entry").isHidden)
        XCTAssertEqual(text(in: try element("page-title")), "表单组件")
        let nameField = try XCTUnwrap(element("form-name") as? NSTextField)
        XCTAssertEqual(nameField.placeholderAttributedString?.string ?? nameField.placeholderString, "例如：Timeless")
        XCTAssertGreaterThan(try XCTUnwrap(nameField.cell).drawingRect(forBounds: nameField.bounds).minX, 8)
        try capture("forms")
        try press("form-submit")
        XCTAssertEqual(text(in: try element("form-result")), "请输入姓名。")
        try type("form-name", "Timeless")
        try type("form-email", "native@example.com")
        try type("form-quantity", "3")
        let select = try XCTUnwrap(element("form-role") as? NSPopUpButton)
        XCTAssertEqual(select.itemTitles, ["请选择角色", "开发者", "设计师", "其他"])
        XCTAssertEqual(select.titleOfSelectedItem, "请选择角色")
        select.selectItem(at: 2)
        _ = select.target?.perform(try XCTUnwrap(select.action), with: select)
        let agreed = try XCTUnwrap(element("form-agreed") as? NSButton)
        agreed.performClick(nil)
        let personal = try XCTUnwrap(element("plan-personal") as? NSButton)
        let team = try XCTUnwrap(element("plan-team") as? NSButton)
        team.performClick(nil)
        settle()
        XCTAssertEqual(personal.state, .off)
        XCTAssertEqual(team.state, .on)
        let bio = try XCTUnwrap((try element("form-bio") as? NSScrollView)?.documentView as? NSTextView)
        XCTAssertGreaterThan(bio.frame.width, 200)
        XCTAssertGreaterThan(bio.frame.height, 60)
        XCTAssertEqual(try element("form-bio").layer?.borderWidth, 1)
        bio.string = "Native components"
        bio.delegate?.textDidChange?(Notification(name: NSText.didChangeNotification, object: bio))
        try press("form-submit")
        XCTAssertEqual(text(in: try element("form-result")), "已提交：Timeless · 设计师 · 团队 · 3 个席位")
        XCTAssertFalse(try XCTUnwrap(element("disabled-input") as? NSTextField).isEnabled)
        XCTAssertFalse(try XCTUnwrap(element("disabled-select") as? NSPopUpButton).isEnabled)
        try press("nav-general")
        XCTAssertEqual(text(in: count), "1")
        try press("route-back")
        XCTAssertEqual(text(in: try element("route-path")), "/home/data_entry")
        XCTAssertEqual((try element("form-name") as? NSTextField)?.stringValue, "Timeless")
        try press("route-forward")
        XCTAssertEqual(text(in: try element("route-path")), "/home/general")
        try press("nav-interaction")
        try press("accordion-trigger")
        XCTAssertFalse(try element("accordion-content").isHidden)
        try press("tab-details")
        XCTAssertTrue(try element("tab-preview-panel").isHidden)
        XCTAssertFalse(try element("tab-details-panel").isHidden)
        try press("toast-show")
        XCTAssertFalse(try element("toast-message").isHidden)
        try capture("interaction")
        try press("toast-close")
        XCTAssertTrue(try element("toast-message").isHidden)
        try press("confirm-open")
        try press("confirm-accept")
        XCTAssertEqual(text(in: try element("interaction-result")), "操作已确认。")
        try press("nav-layout")
        let grid = try element("layout-grid")
        let first = try element("grid-cell-1")
        let third = try element("grid-cell-3")
        let fourth = try element("grid-cell-4")
        XCTAssertEqual(first.frame.minY, third.frame.minY, accuracy: 0.01)
        XCTAssertGreaterThan(fourth.frame.minY, first.frame.minY)
        XCTAssertLessThanOrEqual(third.frame.maxX, grid.bounds.width + 0.01)
        let scroll = try XCTUnwrap(element("layout-scroll") as? NativeScrollView)
        XCTAssertEqual(scroll.frame.height, 180, accuracy: 0.01)
        XCTAssertGreaterThan(try XCTUnwrap(scroll.documentView).frame.height, scroll.contentSize.height)
        scroll.contentView.scroll(to: NSPoint(x: 0, y: 120))
        settle()
        let position = scroll.contentView.bounds.origin.y
        XCTAssertGreaterThan(position, 0)
        renderer.relayout(containerWidth: 760, containerHeight: 620)
        XCTAssertTrue(find("macos-increment", in: view) === action)
        XCTAssertEqual(view.frame.width, 760)
        XCTAssertEqual(scroll.contentView.bounds.origin.y, position, accuracy: 0.01)
        let ratio = try element("aspect-ratio")
        XCTAssertEqual(ratio.frame.width / ratio.frame.height, 16.0 / 9.0, accuracy: 0.01)
        try capture("layout")
        try press("nav-data_entry")
        try press("form-reset")
        XCTAssertEqual((try element("form-name") as? NSTextField)?.stringValue, "")
        XCTAssertEqual((try element("form-quantity") as? NSTextField)?.stringValue, "1")
        XCTAssertEqual(bio.string, "")
        XCTAssertEqual(select.indexOfSelectedItem, 0)
        XCTAssertEqual(agreed.state, .off)
        XCTAssertEqual(personal.state, .on)
        XCTAssertEqual(team.state, .off)
        XCTAssertTrue(bridge.runtimeErrors.isEmpty, bridge.runtimeErrors.joined(separator: "\n"))
    }

    func testOutlineStyleResizesAndResetsWithoutChangingViewGeometry() throws {
        let frame = NSRect(x: 10, y: 20, width: 100, height: 40)
        let view = FlippedView(frame: frame)
        NativeViewRenderer.applyStyle([
            "border-width": "1px", "border-radius": "6px",
            "outline-style": "solid", "outline-width": "3px",
            "outline-offset": "2px", "outline-color": "#12345680",
        ], to: view)
        let outline = try XCTUnwrap(view.outlineLayer)
        XCTAssertEqual(view.frame, frame)
        XCTAssertEqual(view.layer?.borderWidth, 1)
        XCTAssertEqual(outline.frame, view.bounds.insetBy(dx: -5, dy: -5))
        XCTAssertEqual(outline.cornerRadius, 11)
        XCTAssertEqual(outline.borderColor, NativeViewRenderer.parseColor("#12345680")?.cgColor)
        view.frame = NSRect(x: 10, y: 20, width: 200, height: 50)
        XCTAssertEqual(outline.frame, view.bounds.insetBy(dx: -5, dy: -5))
        NativeViewRenderer.applyStyle(["outline-style": "none", "outline-width": "3px"], to: view)
        XCTAssertNil(view.outlineLayer)
        XCTAssertNil(outline.superlayer)
    }

    func testBoxShadowBlursOutsideTheBoxAndResizesWithoutAffectingLayout() throws {
        let frame = NSRect(x: 10, y: 20, width: 100, height: 40)
        let view = FlippedView(frame: frame)
        let style = ["border-radius": "6px", "box-shadow": "2px -1px 2px 3px #12345680"]
        NativeViewRenderer.applyStyle(style, to: view)
        let shadow = try XCTUnwrap(view.shadowLayer)
        XCTAssertEqual(view.frame, frame)
        XCTAssertEqual(view.layer?.borderWidth, 0)
        XCTAssertEqual(shadow.shadowRadius, 1)
        XCTAssertEqual(shadow.shadowOffset, NSSize(width: 2, height: -1))
        XCTAssertEqual(shadow.shadowOpacity, Float(128.0 / 255.0), accuracy: 0.001)
        XCTAssertEqual(try XCTUnwrap(shadow.shadowPath).boundingBoxOfPath.size, NSSize(width: 106, height: 46))
        let mask = try XCTUnwrap(shadow.mask as? CAShapeLayer)
        let path = try XCTUnwrap(mask.path)
        XCTAssertFalse(path.contains(NSPoint(x: shadow.bounds.midX, y: shadow.bounds.midY), using: .evenOdd), "Even transparent buttons must have no shadow inside the box")
        XCTAssertTrue(path.contains(NSPoint(x: 1, y: 1), using: .evenOdd))
        view.frame = NSRect(x: 10, y: 20, width: 200, height: 50)
        XCTAssertEqual(try XCTUnwrap(shadow.shadowPath).boundingBoxOfPath.size, NSSize(width: 206, height: 56))
        NativeViewRenderer.applyStyle(["box-shadow": "none"], to: view)
        XCTAssertNil(view.shadowLayer)
        XCTAssertNil(shadow.superlayer)
        view.frame = .zero
        NativeViewRenderer.applyStyle(["border-radius": "100px", "box-shadow": "0 0 1px 3px #000"], to: view)
        XCTAssertEqual(try XCTUnwrap(view.shadowLayer?.shadowPath).boundingBoxOfPath.size, NSSize(width: 6, height: 6))
        NativeViewRenderer.applyStyle(["box-shadow": "0 0 1px -1000px #000"], to: view)
        XCTAssertTrue(try XCTUnwrap(view.shadowLayer?.shadowPath).isEmpty)
        NativeViewRenderer.applyStyle(style, to: view)
        XCTAssertNotNil(view.shadowLayer)
        NativeViewRenderer.applyStyle([:], to: view)
        XCTAssertNil(view.shadowLayer, "Removing a class or focus state must remove its shadow")
    }

    func testMultipleCSSShadowsKeepTheirPaintOrderAndReset() throws {
        let view = FlippedView(frame: NSRect(x: 0, y: 0, width: 100, height: 40))
        NativeViewRenderer.applyStyle(["box-shadow": "0 0 0 3px #a1a1a180, 0 2px 4px 1px #00000033"], to: view)
        XCTAssertEqual(view.shadowLayers.count, 2)
        XCTAssertEqual(view.shadowLayers[0].shadowRadius, 0)
        XCTAssertEqual(view.shadowLayers[1].shadowRadius, 2)
        XCTAssertTrue(view.layer?.sublayers?.first === view.shadowLayers[1])
        let layers = view.shadowLayers
        NativeViewRenderer.applyStyle([:], to: view)
        XCTAssertTrue(view.shadowLayers.isEmpty)
        XCTAssertTrue(layers.allSatisfy { $0.superlayer == nil })
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

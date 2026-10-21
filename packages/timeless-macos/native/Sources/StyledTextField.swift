import Cocoa
import JavaScriptCore

/// Keeps AppKit's editor and IME while the Timeless style dictionary paints the field.
final class StyledTextField: NSTextField {
    private var jsNode: JSValue?
    var nativeNode: JSValue? { jsNode }
    private var tracking: NSTrackingArea?

    override init(frame frameRect: NSRect) {
        super.init(frame: frameRect)
        cell = PaddedTextFieldCell(textCell: "")
    }

    required init?(coder: NSCoder) { super.init(coder: coder) }

    func applyContentStyle(_ style: [String: String]) {
        (cell as? PaddedTextFieldCell)?.insets = NSEdgeInsets(
            top: NativeViewRenderer.parsePx(style["padding-top"]),
            left: NativeViewRenderer.parsePx(style["padding-left"]),
            bottom: NativeViewRenderer.parsePx(style["padding-bottom"]),
            right: NativeViewRenderer.parsePx(style["padding-right"])
        )
    }

    func bind(_ node: JSValue) {
        jsNode = node
        if let name = node.forProperty("attrs")?.forProperty("n"), !name.isUndefined {
            identifier = NSUserInterfaceItemIdentifier(name.toString())
        }
        let attributesChanged: @convention(block) (String, JSValue) -> Void = { [weak self] key, value in
            guard let self = self else { return }
            if key == "disabled" { self.isEnabled = value.isNull || value.isUndefined }
            if key == "placeholder" { self.placeholderString = value.isNull ? nil : value.toString() }
        }
        node.setObject(attributesChanged, forKeyedSubscript: "_onAttributeChange" as NSString)
        let valueChanged: @convention(block) (String) -> Void = { [weak self] value in
            if self?.stringValue != value { self?.stringValue = value }
        }
        node.setObject(valueChanged, forKeyedSubscript: "_onValueChange" as NSString)
        let disabled = node.forProperty("attrs")?.forProperty("disabled")
        isEnabled = disabled == nil || disabled!.isUndefined || disabled!.isNull
        let label = node.forProperty("attrs")?.forProperty("aria-label")
        if let label = label, !label.isUndefined { setAccessibilityLabel(label.toString()) }
    }

    override func updateTrackingAreas() {
        super.updateTrackingAreas()
        if let tracking = tracking { removeTrackingArea(tracking) }
        let area = NSTrackingArea(rect: .zero, options: [.mouseEnteredAndExited, .activeAlways, .inVisibleRect], owner: self, userInfo: nil)
        addTrackingArea(area)
        tracking = area
    }

    override func mouseEntered(with event: NSEvent) {
        jsNode?.forProperty("_setStyleState")?.call(withArguments: ["hover", true])
    }

    override func mouseExited(with event: NSEvent) {
        jsNode?.forProperty("_setStyleState")?.call(withArguments: ["hover", false])
    }
}

private final class PaddedTextFieldCell: NSTextFieldCell {
    var insets = NSEdgeInsetsZero

    override func drawingRect(forBounds rect: NSRect) -> NSRect {
        let font = self.font ?? NSFont.systemFont(ofSize: 14)
        let height = max(0, rect.height - insets.top - insets.bottom)
        let lineHeight = min(height, ceil(font.ascender - font.descender + font.leading))
        return NSRect(x: rect.minX + insets.left, y: rect.minY + insets.top + (height - lineHeight) / 2,
                      width: max(0, rect.width - insets.left - insets.right), height: lineHeight)
    }

    override func edit(withFrame rect: NSRect, in controlView: NSView, editor: NSText, delegate: Any?, event: NSEvent?) {
        super.edit(withFrame: drawingRect(forBounds: rect), in: controlView, editor: editor, delegate: delegate, event: event)
    }

    override func select(withFrame rect: NSRect, in controlView: NSView, editor: NSText, delegate: Any?, start: Int, length: Int) {
        super.select(withFrame: drawingRect(forBounds: rect), in: controlView, editor: editor, delegate: delegate, start: start, length: length)
    }
}

import Cocoa
import JavaScriptCore

/// Keeps AppKit's editor and IME while the Timeless style dictionary paints the field.
final class StyledTextField: NSTextField {
    private var jsNode: JSValue?
    private var tracking: NSTrackingArea?

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

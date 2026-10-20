import Cocoa
import JavaScriptCore

/// Timeless owns decoration and children; AppKit supplies the view, input and accessibility.
class FlippedView: NSView {
    override var isFlipped: Bool { true }
    private(set) var jsNode: JSValue?
    private var button = false
    private var pressed = false
    private var tracking: NSTrackingArea?

    var disabled: Bool {
        guard let value = jsNode?.forProperty("attrs")?.forProperty("disabled") else { return false }
        return !value.isUndefined && !value.isNull && !(value.isBoolean && !value.toBool())
    }

    func bind(_ node: JSValue?, button: Bool = false) {
        jsNode = node
        self.button = button
        if let name = node?.forProperty("attrs")?.forProperty("n"), !name.isUndefined {
            identifier = NSUserInterfaceItemIdentifier(name.toString())
        }
        let focus: @convention(block) () -> Void = { [weak self] in
            guard let self = self else { return }
            self.window?.makeFirstResponder(self)
        }
        let blur: @convention(block) () -> Void = { [weak self] in
            guard let self = self, self.window?.firstResponder === self else { return }
            self.window?.makeFirstResponder(nil)
        }
        node?.setObject(focus, forKeyedSubscript: "_focus" as NSString)
        node?.setObject(blur, forKeyedSubscript: "_blur" as NSString)
    }

    private var clickable: Bool {
        button || jsNode?.forProperty("listeners")?.forProperty("click")?.isObject == true
    }

    override var acceptsFirstResponder: Bool { clickable && !disabled }

    override func hitTest(_ point: NSPoint) -> NSView? {
        let hit = super.hitTest(point)
        return (button || (clickable && hit is NSTextField)) && hit != nil ? self : hit
    }

    override func updateTrackingAreas() {
        super.updateTrackingAreas()
        if let tracking = tracking { removeTrackingArea(tracking) }
        let area = NSTrackingArea(rect: .zero, options: [.mouseEnteredAndExited, .activeAlways, .inVisibleRect], owner: self, userInfo: nil)
        addTrackingArea(area)
        tracking = area
    }

    private func setState(_ name: String, _ value: Bool) {
        jsNode?.forProperty("_setStyleState")?.call(withArguments: [name, value])
        needsDisplay = true
    }

    @discardableResult
    private func emit(_ name: String, _ payload: [String: Any] = [:]) -> Bool {
        jsNode?.forProperty("_dispatchNativeEvent")?.call(withArguments: [name, payload])?.toBool() ?? false
    }

    override func mouseEntered(with event: NSEvent) {
        setState("hover", true)
        emit("mouseenter")
    }

    override func mouseExited(with event: NSEvent) {
        setState("hover", false)
        emit("mouseleave")
    }

    override func mouseDown(with event: NSEvent) {
        guard clickable else { super.mouseDown(with: event); return }
        guard !disabled else { return }
        window?.makeFirstResponder(self)
        pressed = true
        setState("active", true)
        emit("pointerdown", ["button": 0])
    }

    override func mouseDragged(with event: NSEvent) {
        if pressed { setState("active", bounds.contains(convert(event.locationInWindow, from: nil))) }
    }

    override func mouseUp(with event: NSEvent) {
        let activate = pressed && bounds.contains(convert(event.locationInWindow, from: nil))
        pressed = false
        setState("active", false)
        if !disabled {
            emit("pointerup", ["button": 0])
            if activate { emit("click", ["button": 0]) }
        }
    }

    override func keyDown(with event: NSEvent) {
        let key = event.keyCode == 49 ? " " : event.keyCode == 36 ? "Enter" : event.characters ?? ""
        if emit("keydown", ["key": key]) { return }
        if clickable && !disabled && (key == " " || key == "Enter") {
            if !event.isARepeat { pressed = true; setState("active", true) }
        } else { super.keyDown(with: event) }
    }

    override func keyUp(with event: NSEvent) {
        let key = event.keyCode == 49 ? " " : event.keyCode == 36 ? "Enter" : event.characters ?? ""
        emit("keyup", ["key": key])
        if pressed && (key == " " || key == "Enter") {
            pressed = false
            setState("active", false)
            if !disabled { emit("click", ["button": 0]) }
        }
    }

    override func becomeFirstResponder() -> Bool {
        guard acceptsFirstResponder else { return false }
        setState("focus", true)
        emit("focus")
        return true
    }

    override func resignFirstResponder() -> Bool {
        pressed = false
        setState("active", false)
        setState("focus", false)
        emit("blur")
        return true
    }

    override func draw(_ dirtyRect: NSRect) {
        super.draw(dirtyRect)
        if clickable && window?.firstResponder === self && !disabled {
            NSColor.keyboardFocusIndicatorColor.setStroke()
            let ring = NSBezierPath(roundedRect: bounds.insetBy(dx: 1, dy: 1), xRadius: layer?.cornerRadius ?? 0, yRadius: layer?.cornerRadius ?? 0)
            ring.lineWidth = 2
            ring.stroke()
        }
    }

    override func isAccessibilityElement() -> Bool { clickable }
    override func accessibilityRole() -> NSAccessibility.Role? { clickable ? .button : .group }
    override func isAccessibilityEnabled() -> Bool { !disabled }
    override func accessibilityLabel() -> String? {
        let label = jsNode?.forProperty("attrs")?.forProperty("aria-label")
        if let label = label, !label.isUndefined { return label.toString() }
        return subviews.compactMap { ($0 as? NSTextField)?.stringValue }.joined(separator: " ")
    }
    override func accessibilityPerformPress() -> Bool {
        guard clickable && !disabled else { return false }
        emit("click", ["button": 0])
        return true
    }
}

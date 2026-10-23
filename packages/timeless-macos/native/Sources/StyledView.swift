import Cocoa
import JavaScriptCore

/// Timeless owns decoration and children; AppKit supplies the view, input and accessibility.
class FlippedView: NSView {
    override var isFlipped: Bool { true }
    private(set) var jsNode: JSValue?
    private var button = false
    private var pressed = false
    private var pointerFocus = false
    private var tracking: NSTrackingArea?
    var labelAction: (() -> Void)?
    lazy var decoration = NativeViewDecoration(view: self)
    lazy var animation = NativeViewAnimation(view: self)
    override func viewDidMoveToWindow() {
        super.viewDidMoveToWindow()
        if window == nil {
            DispatchQueue.main.async { [weak self] in
                if self?.window == nil { self?.animation.cancel() }
            }
        }
    }
    var outlineLayer: CALayer? { decoration.outlineLayer }
    var shadowLayers: [CALayer] { decoration.shadowLayers }
    var shadowLayer: CALayer? { decoration.shadowLayer }

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
        let rect: @convention(block) () -> [String: CGFloat] = { [weak self] in
            guard let self = self, let content = self.window?.contentView else { return [:] }
            let frame = self.convert(self.bounds, to: content)
            let y = content.isFlipped ? frame.minY : content.bounds.height - frame.maxY
            return ["x": frame.minX, "y": y, "left": frame.minX, "top": y, "right": frame.maxX, "bottom": y + frame.height, "width": frame.width, "height": frame.height]
        }
        node?.setObject(rect, forKeyedSubscript: "_getBoundingClientRect" as NSString)
        if node?.forProperty("filePicker")?.isObject == true {
            let pick: @convention(block) () -> Void = { [weak self] in
                guard let self = self, !self.disabled, let node = self.jsNode else { return }
                NativeFilePickerDialog.open(node: node, window: self.window)
            }
            node?.setObject(pick, forKeyedSubscript: "_pickFiles" as NSString)
        }
    }

    private var clickable: Bool {
        button || labelAction != nil || jsNode?.forProperty("listeners")?.forProperty("click")?.isObject == true
    }

    override var acceptsFirstResponder: Bool {
        let tabIndex = jsNode?.forProperty("attrs")?.forProperty("tabindex")
        return ((clickable && labelAction == nil) || (tabIndex != nil && !tabIndex!.isUndefined && tabIndex!.toInt32() >= 0)) && !disabled && !isHiddenOrHasHiddenAncestor
    }

    override func hitTest(_ point: NSPoint) -> NSView? {
        let hit = super.hitTest(point)
        if labelAction != nil, let field = hit as? NSTextField, field.isEditable { return field }
        return (button || (clickable && hit is NSTextField)) && hit != nil ? self : hit
    }

    override func updateTrackingAreas() {
        super.updateTrackingAreas()
        // inVisibleRect follows scrolling and resizing without replacing the area.
        guard tracking == nil else { return }
        let area = NSTrackingArea(rect: .zero, options: [.mouseEnteredAndExited, .activeAlways, .inVisibleRect], owner: self, userInfo: nil)
        addTrackingArea(area)
        tracking = area
    }

    private func setState(_ name: String, _ value: Bool) {
        jsNode?.forProperty("_setStyleState")?.call(withArguments: [name, value])
        needsDisplay = true
    }

    private func batchStyleUpdates(_ update: @escaping () -> Void) {
        guard let batch = jsNode?.forProperty("_batchStyleUpdates"), batch.isObject else { update(); return }
        let callback: @convention(block) () -> Void = { update() }
        batch.call(withArguments: [callback])
    }

    @discardableResult
    private func emit(_ name: String, _ payload: [String: Any] = [:]) -> Bool {
        var prevented = false
        batchStyleUpdates { [self] in
            prevented = jsNode?.forProperty("_dispatchNativeEvent")?.call(withArguments: [name, payload])?.toBool() ?? false
        }
        return prevented
    }

    override func mouseEntered(with event: NSEvent) {
        batchStyleUpdates { [self] in
            setState("hover", true)
            emit("mouseenter")
        }
    }

    override func mouseExited(with event: NSEvent) {
        batchStyleUpdates { [self] in
            setState("hover", false)
            emit("mouseleave")
        }
    }

    override func mouseDown(with event: NSEvent) {
        guard clickable else { super.mouseDown(with: event); return }
        guard !disabled else { return }
        batchStyleUpdates { [self] in
            pointerFocus = true
            window?.makeFirstResponder(self)
            setState("focus-visible", false)
            pointerFocus = false
            pressed = true
            setState("active", true)
            emit("pointerdown", ["button": 0])
        }
    }

    override func mouseDragged(with event: NSEvent) {
        if pressed { setState("active", bounds.contains(convert(event.locationInWindow, from: nil))) }
    }

    override func rightMouseDown(with event: NSEvent) {
        guard !disabled, let content = window?.contentView else { return }
        let point = content.convert(event.locationInWindow, from: nil)
        emit("contextmenu", ["button": 2, "clientX": point.x, "clientY": content.isFlipped ? point.y : content.bounds.height - point.y])
    }

    override func mouseUp(with event: NSEvent) {
        let activate = pressed && bounds.contains(convert(event.locationInWindow, from: nil))
        batchStyleUpdates { [self] in
            pressed = false
            setState("active", false)
            if !disabled {
                emit("pointerup", ["button": 0])
                if activate && !emit("click", ["button": 0]) { labelAction?() }
            }
        }
    }

    override func keyDown(with event: NSEvent) {
        if clickable && !disabled { setState("focus-visible", true) }
        let key = [UInt16(49): " ", 36: "Enter", 48: "Tab", 53: "Escape", 109: "F10", 115: "Home", 119: "End", 123: "ArrowLeft", 124: "ArrowRight", 125: "ArrowDown", 126: "ArrowUp"][event.keyCode] ?? event.characters ?? ""
        if emit("keydown", ["key": key, "shiftKey": event.modifierFlags.contains(.shift)]) { return }
        if key == "Tab" {
            window?.recalculateKeyViewLoop()
            if event.modifierFlags.contains(.shift) { window?.selectPreviousKeyView(self) }
            else { window?.selectNextKeyView(self) }
            return
        }
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
        batchStyleUpdates { [self] in
            setState("focus", true)
            setState("focus-visible", !pointerFocus)
            emit("focus")
        }
        return true
    }

    override func resignFirstResponder() -> Bool {
        batchStyleUpdates { [self] in
            pressed = false
            setState("active", false)
            setState("focus", false)
            setState("focus-visible", false)
            emit("blur")
        }
        return true
    }

    override func setFrameSize(_ newSize: NSSize) {
        super.setFrameSize(newSize)
        decoration.updateFrame()
    }

    override func isAccessibilityElement() -> Bool { clickable || jsNode?.forProperty("attrs")?.forProperty("role")?.toString() == "dialog" }
    override func accessibilityRole() -> NSAccessibility.Role? {
        if jsNode?.forProperty("attrs")?.forProperty("role")?.toString() == "dialog" { return .group }
        return labelAction != nil ? .staticText : clickable ? .button : .group
    }
    override func accessibilitySubrole() -> NSAccessibility.Subrole? {
        jsNode?.forProperty("attrs")?.forProperty("role")?.toString() == "dialog" ? NSAccessibility.Subrole(rawValue: "AXDialog") : nil
    }
    override func isAccessibilityEnabled() -> Bool { !disabled }
    override func accessibilityLabel() -> String? {
        let label = jsNode?.forProperty("attrs")?.forProperty("aria-label")
        if let label = label, !label.isUndefined { return label.toString() }
        return subviews.compactMap { ($0 as? NSTextField)?.stringValue }.joined(separator: " ")
    }
    override func accessibilityPerformPress() -> Bool {
        guard clickable && !disabled else { return false }
        if !emit("click", ["button": 0]) { labelAction?() }
        return true
    }
}

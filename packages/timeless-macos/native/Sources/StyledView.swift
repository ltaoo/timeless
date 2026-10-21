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
    private(set) var outlineLayer: CALayer?
    private var outlineOffset: CGFloat = 0
    private(set) var shadowLayers: [CALayer] = []
    var shadowLayer: CALayer? { shadowLayers.first }
    private var shadowSpreads: [CGFloat] = []
    private var cssCornerRadius: CGFloat = 0

    func applyCornerRadius(_ radius: CGFloat) {
        cssCornerRadius = radius
        layer?.cornerRadius = min(max(0, radius), max(0, min(bounds.width, bounds.height) / 2))
    }

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
        if node?.forProperty("filePicker")?.isObject == true {
            let pick: @convention(block) () -> Void = { [weak self] in
                guard let self = self, !self.disabled, let node = self.jsNode else { return }
                NativeFilePickerDialog.open(node: node, window: self.window)
            }
            node?.setObject(pick, forKeyedSubscript: "_pickFiles" as NSString)
        }
    }

    private var clickable: Bool {
        button || jsNode?.forProperty("listeners")?.forProperty("click")?.isObject == true
    }

    override var acceptsFirstResponder: Bool { clickable && !disabled && !isHiddenOrHasHiddenAncestor }

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
        pointerFocus = true
        window?.makeFirstResponder(self)
        setState("focus-visible", false)
        pointerFocus = false
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
        if clickable && !disabled { setState("focus-visible", true) }
        let key = [UInt16(49): " ", 36: "Enter", 48: "Tab", 53: "Escape", 123: "ArrowLeft", 124: "ArrowRight", 125: "ArrowDown", 126: "ArrowUp"][event.keyCode] ?? event.characters ?? ""
        if emit("keydown", ["key": key]) { return }
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
        setState("focus", true)
        setState("focus-visible", !pointerFocus)
        emit("focus")
        return true
    }

    override func resignFirstResponder() -> Bool {
        pressed = false
        setState("active", false)
        setState("focus", false)
        setState("focus-visible", false)
        emit("blur")
        return true
    }

    func applyOutlineStyle(_ style: [String: String]) {
        focusRingType = .none
        let width = NativeViewRenderer.parsePx(style["outline-width"])
        guard style["outline-style"] == "solid", width > 0 else {
            outlineLayer?.removeFromSuperlayer()
            outlineLayer = nil
            return
        }
        if outlineLayer == nil {
            let outline = CALayer()
            layer?.addSublayer(outline)
            outlineLayer = outline
        }
        // Outline is decoration outside the box; Yoga only measures the actual border.
        clipsToBounds = false
        layer?.masksToBounds = false
        CATransaction.begin()
        CATransaction.setDisableActions(true)
        outlineLayer?.borderWidth = width
        outlineLayer?.borderColor = NativeViewRenderer.parseColor(style["outline-color"] ?? style["color"] ?? "black")?.cgColor
        outlineOffset = NativeViewRenderer.parsePx(style["outline-offset"])
        updateOutlineFrame()
        CATransaction.commit()
    }

    override func setFrameSize(_ newSize: NSSize) {
        super.setFrameSize(newSize)
        applyCornerRadius(cssCornerRadius)
        updateOutlineFrame()
        updateShadowFrame()
    }

    func applyBoxShadowStyle(_ style: [String: String]) {
        let sources = (style["box-shadow"] ?? "").split(separator: ",")
        var shadows: [(lengths: [Double], color: NSColor)] = []
        for source in sources {
            let parts = source.split(whereSeparator: { $0.isWhitespace }).map(String.init)
            let lengths = parts.prefix(4).compactMap { Double($0.replacingOccurrences(of: "px", with: "")) }
            guard parts.count == 5, lengths.count == 4, lengths.allSatisfy({ $0.isFinite }), lengths[2] >= 0,
                  let color = NativeViewRenderer.parseColor(parts[4]) else { shadows = []; break }
            shadows.append((lengths, color))
        }
        while shadowLayers.count > shadows.count { shadowLayers.removeLast().removeFromSuperlayer() }
        while shadowLayers.count < shadows.count {
            let shadow = CALayer()
            let mask = CAShapeLayer()
            mask.fillRule = .evenOdd
            shadow.mask = mask
            // CSS lists the topmost shadow first.
            layer?.insertSublayer(shadow, at: 0)
            shadowLayers.append(shadow)
        }
        shadowSpreads = shadows.map { CGFloat($0.lengths[3]) }
        guard !shadows.isEmpty else { return }
        clipsToBounds = false
        layer?.masksToBounds = false
        CATransaction.begin()
        CATransaction.setDisableActions(true)
        for (index, spec) in shadows.enumerated() {
            let shadow = shadowLayers[index]
            shadow.shadowColor = spec.color.withAlphaComponent(1).cgColor
            shadow.shadowOpacity = Float(spec.color.alphaComponent)
            shadow.shadowOffset = CGSize(width: spec.lengths[0], height: spec.lengths[1])
            shadow.shadowRadius = CGFloat(spec.lengths[2]) / 2
        }
        updateShadowFrame()
        CATransaction.commit()
    }

    private func updateShadowFrame() {
        guard !shadowLayers.isEmpty else { return }
        CATransaction.begin()
        CATransaction.setDisableActions(true)
        for (index, shadow) in shadowLayers.enumerated() {
            guard let mask = shadow.mask as? CAShapeLayer else { continue }
            let shadowSpread = shadowSpreads[index]
            let extent = max(0, shadowSpread) + shadow.shadowRadius * 4 + max(abs(shadow.shadowOffset.width), abs(shadow.shadowOffset.height)) + 1
            shadow.frame = bounds.insetBy(dx: -extent, dy: -extent)
            let box = CGRect(origin: CGPoint(x: extent, y: extent), size: bounds.size)
            let radius = min(layer?.cornerRadius ?? 0, max(0, min(box.width, box.height) / 2))
            let expanded = box.insetBy(dx: -shadowSpread, dy: -shadowSpread)
            if expanded.size.width > 0 && expanded.size.height > 0 {
                let outerRadius = min(max(0, radius + shadowSpread), min(expanded.width, expanded.height) / 2)
                shadow.shadowPath = CGPath(roundedRect: expanded, cornerWidth: outerRadius, cornerHeight: outerRadius, transform: nil)
            } else {
                shadow.shadowPath = CGMutablePath()
            }
            // CSS outer shadows never paint inside the box, including transparent buttons.
            let cutout = CGMutablePath()
            cutout.addRect(shadow.bounds)
            cutout.addRoundedRect(in: box, cornerWidth: radius, cornerHeight: radius)
            mask.frame = shadow.bounds
            mask.path = cutout
        }
        CATransaction.commit()
    }

    private func updateOutlineFrame() {
        guard let outline = outlineLayer else { return }
        CATransaction.begin()
        CATransaction.setDisableActions(true)
        let outset = outline.borderWidth + outlineOffset
        outline.frame = bounds.insetBy(dx: -outset, dy: -outset)
        outline.cornerRadius = max(0, (layer?.cornerRadius ?? 0) + outset)
        CATransaction.commit()
    }

    override func isAccessibilityElement() -> Bool { clickable || jsNode?.forProperty("attrs")?.forProperty("role")?.toString() == "dialog" }
    override func accessibilityRole() -> NSAccessibility.Role? {
        if jsNode?.forProperty("attrs")?.forProperty("role")?.toString() == "dialog" { return .group }
        return clickable ? .button : .group
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
        emit("click", ["button": 0])
        return true
    }
}

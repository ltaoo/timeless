import Cocoa
import ObjectiveC

/// Target-action handler for NSTextField text changes.
private class InputHandler: NSObject, NSTextFieldDelegate {
    static var associatedKey: UInt8 = 0
    let onTextChanged: (String) -> Void

    init(onTextChanged: @escaping (String) -> Void) {
        self.onTextChanged = onTextChanged
    }

    func controlTextDidChange(_ obj: Notification) {
        guard let textField = obj.object as? NSTextField else { return }
        onTextChanged(textField.stringValue)
    }
}

/// Converts a `NativeNode` tree into an AppKit (NSView) hierarchy.
enum NativeViewRenderer {

    static func render(_ node: NativeNode) -> NSView? {
        switch node {
        case .text(let value):
            let label = NSTextField(labelWithString: value)
            label.font = .systemFont(ofSize: 18)
            label.textColor = .labelColor
            label.isEditable = false
            label.isBezeled = false
            label.drawsBackground = false
            label.maximumNumberOfLines = 0
            return label

        case .view(let style, let children):
            let stack = NSStackView()
            stack.orientation = .vertical
            stack.alignment = .leading
            stack.spacing = 0
            applyStyle(style, to: stack)

            for child in children {
                if let childView = render(child) {
                    stack.addArrangedSubview(childView)
                    // Let input fields stretch to fill width
                    if childView is NSTextField && (childView as! NSTextField).isEditable {
                        childView.widthAnchor.constraint(equalTo: stack.widthAnchor).isActive = true
                    }
                }
            }

            return stack

        case .img(let src, let style):
            let imageView = NSImageView()
            imageView.imageScaling = .scaleProportionallyUpOrDown
            applyStyle(style, to: imageView)
            if let url = URL(string: src) {
                DispatchQueue.global().async {
                    if let data = try? Data(contentsOf: url),
                       let image = NSImage(data: data) {
                        DispatchQueue.main.async {
                            imageView.image = image
                        }
                    }
                }
            }
            let w = parsePx(style["width"])
            let h = parsePx(style["height"])
            if w > 0 {
                imageView.widthAnchor.constraint(equalToConstant: w).isActive = true
            }
            if h > 0 {
                imageView.heightAnchor.constraint(equalToConstant: h).isActive = true
            }
            return imageView

        case .button(let style, let children, _):
            let button = NSButton(title: "", target: nil, action: nil)
            button.bezelStyle = .rounded
            applyStyle(style, to: button)
            for child in children {
                if case .text(let value) = child {
                    button.title = value
                    break
                }
            }
            if let fontSize = style["font-size"] {
                let size = parsePx(fontSize)
                if size > 0 {
                    button.font = .systemFont(ofSize: size)
                }
            }
            return button

        case .input(let value, let placeholder, let style, let onTextChanged):
            let textField = NSTextField()
            textField.stringValue = value
            textField.placeholderString = placeholder.isEmpty ? "Type here..." : placeholder
            textField.isEditable = true
            textField.isSelectable = true
            textField.drawsBackground = true
            textField.backgroundColor = .textBackgroundColor
            textField.isBordered = true
            textField.isBezeled = true
            textField.bezelStyle = .squareBezel
            textField.focusRingType = .exterior
            textField.wantsLayer = true
            textField.layer?.borderColor = NSColor.separatorColor.cgColor
            textField.layer?.borderWidth = 1.0
            textField.layer?.cornerRadius = 4.0
            if let fontSize = style["font-size"] {
                let size = parsePx(fontSize)
                if size > 0 {
                    textField.font = .systemFont(ofSize: size)
                }
            } else {
                textField.font = .systemFont(ofSize: 14)
            }
            if let color = style["color"], let c = parseColor(color) {
                textField.textColor = c
            }
            // Explicit size
            let w = parsePx(style["width"])
            textField.widthAnchor.constraint(equalToConstant: w > 0 ? w : 240).isActive = true
            let h = parsePx(style["height"])
            textField.heightAnchor.constraint(equalToConstant: h > 0 ? h : 28).isActive = true
            // Wire text change callback to JS listener
            if let callback = onTextChanged {
                let handler = InputHandler(onTextChanged: callback)
                textField.delegate = handler
                objc_setAssociatedObject(textField, &InputHandler.associatedKey, handler, .OBJC_ASSOCIATION_RETAIN_NONATOMIC)
            }
            return textField
        }
    }

    // MARK: - Style

    private static func applyStyle(_ style: [String: String], to view: NSView) {
        view.wantsLayer = true
        if let bg = style["background-color"] {
            view.layer?.backgroundColor = parseColor(bg)?.cgColor
        }
    }

    private static func parseColor(_ value: String) -> NSColor? {
        guard value.hasPrefix("#"), value.count == 7 else { return nil }
        let hex = String(value.dropFirst())
        guard let rgb = UInt64(hex, radix: 16) else { return nil }
        return NSColor(
            red: CGFloat((rgb >> 16) & 0xFF) / 255.0,
            green: CGFloat((rgb >> 8) & 0xFF) / 255.0,
            blue: CGFloat(rgb & 0xFF) / 255.0,
            alpha: 1.0
        )
    }

    private static func parsePx(_ value: String?) -> CGFloat {
        guard let value = value else { return 0 }
        let trimmed = value.trimmingCharacters(in: .whitespaces)
            .replacingOccurrences(of: "px", with: "")
        return CGFloat(Double(trimmed) ?? 0)
    }
}

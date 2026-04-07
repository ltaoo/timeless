import Cocoa
import JavaScriptCore

/// Converts a `NativeNode` tree into an AppKit (NSView) hierarchy.
enum NativeViewRenderer {

    static func render(_ node: NativeNode) -> NSView? {
        switch node {
        case .text(let value, let style, let jsValue):
            let label = NSTextField(labelWithString: value)
            label.isEditable = false
            label.isBezeled = false
            label.drawsBackground = false
            label.maximumNumberOfLines = 0
            applyTextStyle(style, to: label)

            // Register a callback so JS reactive updates can push new text
            if let jsValue = jsValue {
                let onContentChange: @convention(block) (String) -> Void = { [weak label] newValue in
                    DispatchQueue.main.async {
                        label?.stringValue = newValue
                    }
                }
                jsValue.setValue(onContentChange, forProperty: "_onContentChange")
            }

            return label

        case .view(let style, let children):
            let container = NSView()
            applyStyle(style, to: container)

            let paddingTop = parsePx(style["padding-top"] ?? style["padding"])
            let paddingLeft = parsePx(style["padding-left"] ?? style["padding"])

            var offsetY: CGFloat = paddingTop
            for child in children {
                if let childView = render(child) {
                    childView.translatesAutoresizingMaskIntoConstraints = false
                    container.addSubview(childView)

                    let marginTop = childMarginTop(child)
                    offsetY += marginTop

                    NSLayoutConstraint.activate([
                        childView.topAnchor.constraint(equalTo: container.topAnchor, constant: offsetY),
                        childView.leadingAnchor.constraint(equalTo: container.leadingAnchor, constant: paddingLeft),
                    ])

                    childView.layoutSubtreeIfNeeded()
                    let childHeight = resolveHeight(childView)
                    offsetY += childHeight

                    let marginBottom = childMarginBottom(child)
                    offsetY += marginBottom
                }
            }

            let paddingBottom = parsePx(style["padding-bottom"] ?? style["padding"])
            offsetY += paddingBottom

            if offsetY > 0 {
                container.heightAnchor.constraint(greaterThanOrEqualToConstant: offsetY).isActive = true
            }

            return container

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

        case .button(let style, let children, let jsValue):
            let button = NSButton(title: "", target: nil, action: nil)
            button.bezelStyle = .rounded
            applyStyle(style, to: button)
            // Use first text child as button title
            for child in children {
                if case .text(let value, _, _) = child {
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
            // Register click handler from JS listeners
            if let jsValue = jsValue {
                let listeners = jsValue.forProperty("listeners")
                if let clickHandler = listeners?.forProperty("click"), !clickHandler.isUndefined {
                    let helper = ButtonClickHelper(callback: clickHandler)
                    button.target = helper
                    button.action = #selector(ButtonClickHelper.handleClick)
                    objc_setAssociatedObject(button, "clickHelper", helper, .OBJC_ASSOCIATION_RETAIN_NONATOMIC)
                }
            }
            return button

        case .input(let value, let placeholder, let style, let jsValue):
            let textField = NSTextField()
            textField.stringValue = value
            textField.placeholderString = placeholder
            textField.isEditable = true
            textField.isBezeled = true
            textField.bezelStyle = .roundedBezel
            applyStyle(style, to: textField)
            applyTextStyle(style, to: textField)
            // Register input callback so JS can receive text changes
            if let jsValue = jsValue {
                let listeners = jsValue.forProperty("listeners")
                if let inputHandler = listeners?.forProperty("input"), !inputHandler.isUndefined {
                    let delegate = TextFieldInputDelegate(callback: inputHandler)
                    textField.delegate = delegate
                    objc_setAssociatedObject(textField, "inputDelegate", delegate, .OBJC_ASSOCIATION_RETAIN_NONATOMIC)
                }
            }
            return textField
        }
    }

    // MARK: - Height

    /// Resolve the height of a view, falling back to fittingSize for containers.
    private static func resolveHeight(_ view: NSView) -> CGFloat {
        let intrinsic = view.intrinsicContentSize.height
        if intrinsic >= 0 {
            return intrinsic
        }
        // For container views, use fittingSize which accounts for subviews + constraints
        let fitting = view.fittingSize.height
        if fitting > 0 {
            return fitting
        }
        return 0
    }

    // MARK: - Child margin helpers

    private static func childMarginTop(_ node: NativeNode) -> CGFloat {
        if case .view(let style, _) = node {
            return parsePx(style["margin-top"] ?? style["margin"])
        }
        return 0
    }

    private static func childMarginBottom(_ node: NativeNode) -> CGFloat {
        if case .view(let style, _) = node {
            return parsePx(style["margin-bottom"] ?? style["margin"])
        }
        return 0
    }

    // MARK: - Style

    private static func applyStyle(_ style: [String: String], to view: NSView) {
        view.wantsLayer = true

        if let bg = style["background-color"] {
            view.layer?.backgroundColor = parseColor(bg)?.cgColor
        }
    }

    private static func applyTextStyle(_ style: [String: String], to label: NSTextField) {
        var fontSize: CGFloat = 14
        if let fs = style["font-size"] {
            fontSize = parsePx(fs)
            if fontSize <= 0 { fontSize = 14 }
        }

        var fontWeight: NSFont.Weight = .regular
        if let fw = style["font-weight"] {
            if fw == "bold" || fw == "700" {
                fontWeight = .bold
            } else if fw == "600" {
                fontWeight = .semibold
            } else if fw == "500" {
                fontWeight = .medium
            } else if fw == "300" {
                fontWeight = .light
            }
        }

        label.font = NSFont.systemFont(ofSize: fontSize, weight: fontWeight)

        if let color = style["color"] {
            if let c = parseColor(color) {
                label.textColor = c
            }
        } else {
            label.textColor = .labelColor
        }
    }

    // MARK: - Parsing

    private static func parsePx(_ value: String?) -> CGFloat {
        guard let value = value else { return 0 }
        let trimmed = value.trimmingCharacters(in: .whitespaces)
            .replacingOccurrences(of: "px", with: "")
        return CGFloat(Double(trimmed) ?? 0)
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
}

// MARK: - Button click helper

class ButtonClickHelper: NSObject {
    let callback: JSValue

    init(callback: JSValue) {
        self.callback = callback
    }

    @objc func handleClick() {
        callback.call(withArguments: [])
    }
}

// MARK: - TextField input delegate

class TextFieldInputDelegate: NSObject, NSTextFieldDelegate {
    let callback: JSValue

    init(callback: JSValue) {
        self.callback = callback
    }

    func controlTextDidChange(_ obj: Notification) {
        guard let textField = obj.object as? NSTextField else { return }
        let event: [String: Any] = ["target": ["value": textField.stringValue]]
        callback.call(withArguments: [event])
    }
}

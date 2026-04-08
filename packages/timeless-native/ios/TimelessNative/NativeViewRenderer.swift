import UIKit
import ObjectiveC

/// Target-action handler for UITextField text changes.
private class InputHandler: NSObject {
    static var associatedKey: UInt8 = 0
    let onTextChanged: (String) -> Void

    init(onTextChanged: @escaping (String) -> Void) {
        self.onTextChanged = onTextChanged
    }

    @objc func textDidChange(_ textField: UITextField) {
        onTextChanged(textField.text ?? "")
    }
}

/// Converts a `NativeNode` tree into a real UIKit view hierarchy.
enum NativeViewRenderer {

    static func render(_ node: NativeNode) -> UIView? {
        switch node {
        case .text(let value):
            let label = UILabel()
            label.text = value
            label.font = .systemFont(ofSize: 18)
            label.textColor = .black
            label.numberOfLines = 0
            return label

        case .view(let style, let children):
            let stack = UIStackView()
            stack.axis = .vertical
            stack.alignment = .fill
            stack.distribution = .equalSpacing
            stack.spacing = 0
            applyStyle(style, to: stack)

            for child in children {
                if let childView = render(child) {
                    stack.addArrangedSubview(childView)
                }
            }

            return stack

        case .img(let src, let style):
            let imageView = UIImageView()
            imageView.contentMode = .scaleAspectFit
            imageView.clipsToBounds = true
            imageView.isUserInteractionEnabled = false
            applyStyle(style, to: imageView)
            if let url = URL(string: src) {
                DispatchQueue.global().async {
                    if let data = try? Data(contentsOf: url),
                       let image = UIImage(data: data) {
                        DispatchQueue.main.async {
                            imageView.image = image
                            imageView.invalidateIntrinsicContentSize()
                            imageView.superview?.setNeedsLayout()
                            imageView.superview?.layoutIfNeeded()
                        }
                    }
                }
            }
            let w = parsePx(style["width"])
            let h = parsePx(style["height"])
            if w > 0 {
                imageView.widthAnchor.constraint(equalToConstant: w).isActive = true
            }
            imageView.heightAnchor.constraint(equalToConstant: h > 0 ? h : 300).isActive = true
            return imageView

        case .button(let style, let children, _):
            let button = UIButton(type: .system)
            applyStyle(style, to: button)
            // Use first text child as button title
            for child in children {
                if case .text(let value) = child {
                    button.setTitle(value, for: .normal)
                    break
                }
            }
            if let fontSize = style["font-size"] {
                let size = parsePx(fontSize)
                if size > 0 {
                    button.titleLabel?.font = .systemFont(ofSize: size)
                }
            }
            if let color = style["color"], let c = parseColor(color) {
                button.setTitleColor(c, for: .normal)
            }
            return button

        case .input(let value, let placeholder, let style, let onTextChanged):
            let textField = UITextField()
            textField.text = value
            textField.placeholder = placeholder.isEmpty ? " " : placeholder
            textField.borderStyle = .roundedRect
            textField.isUserInteractionEnabled = true
            textField.clearButtonMode = .whileEditing
            applyStyle(style, to: textField)
            if let fontSize = style["font-size"] {
                let size = parsePx(fontSize)
                if size > 0 {
                    textField.font = .systemFont(ofSize: size)
                }
            }
            if let color = style["color"], let c = parseColor(color) {
                textField.textColor = c
            }
            // Ensure the text field has a usable size and stretches to fill parent
            textField.setContentHuggingPriority(.defaultLow, for: .horizontal)
            textField.setContentCompressionResistancePriority(.required, for: .vertical)
            let w = parsePx(style["width"])
            if w > 0 {
                textField.widthAnchor.constraint(equalToConstant: w).isActive = true
            }
            let h = parsePx(style["height"])
            if h > 0 {
                textField.heightAnchor.constraint(equalToConstant: h).isActive = true
            } else {
                textField.heightAnchor.constraint(greaterThanOrEqualToConstant: 36).isActive = true
            }
            // Wire text change callback to JS listener
            if let callback = onTextChanged {
                let handler = InputHandler(onTextChanged: callback)
                textField.addTarget(handler, action: #selector(InputHandler.textDidChange(_:)), for: .editingChanged)
                // Retain the handler alongside the text field
                objc_setAssociatedObject(textField, &InputHandler.associatedKey, handler, .OBJC_ASSOCIATION_RETAIN_NONATOMIC)
            }
            return textField
        }
    }

    // MARK: - Style

    private static func applyStyle(_ style: [String: String], to view: UIView) {
        if let bg = style["background-color"] {
            view.backgroundColor = parseColor(bg)
        }
        if let padding = style["padding"], let value = Double(padding) {
            view.layoutMargins = UIEdgeInsets(
                top: value, left: value, bottom: value, right: value
            )
        }
    }

    private static func parseColor(_ value: String) -> UIColor? {
        // Supports basic hex colors: #RRGGBB
        guard value.hasPrefix("#"), value.count == 7 else { return nil }
        let hex = String(value.dropFirst())
        guard let rgb = UInt64(hex, radix: 16) else { return nil }
        return UIColor(
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

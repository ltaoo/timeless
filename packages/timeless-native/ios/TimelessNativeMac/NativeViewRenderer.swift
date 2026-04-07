import Cocoa

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
            let container = NSView()
            applyStyle(style, to: container)

            var offsetY: CGFloat = 0
            for child in children {
                if let childView = render(child) {
                    childView.translatesAutoresizingMaskIntoConstraints = false
                    container.addSubview(childView)

                    NSLayoutConstraint.activate([
                        childView.topAnchor.constraint(equalTo: container.topAnchor, constant: offsetY),
                        childView.leadingAnchor.constraint(equalTo: container.leadingAnchor),
                    ])
                    childView.layoutSubtreeIfNeeded()
                    offsetY += childView.intrinsicContentSize.height
                }
            }

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

        case .input(let value, let placeholder, let style, _):
            let textField = NSTextField()
            textField.stringValue = value
            textField.placeholderString = placeholder
            textField.isEditable = true
            textField.isBezeled = true
            textField.bezelStyle = .roundedBezel
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

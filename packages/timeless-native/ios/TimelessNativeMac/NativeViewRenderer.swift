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
}

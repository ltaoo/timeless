import UIKit

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
            let container = UIView()
            applyStyle(style, to: container)

            // Default to vertical stack layout
            var offsetY: CGFloat = 0
            for child in children {
                if let childView = render(child) {
                    childView.translatesAutoresizingMaskIntoConstraints = false
                    container.addSubview(childView)

                    // Simple top-down layout
                    NSLayoutConstraint.activate([
                        childView.topAnchor.constraint(equalTo: container.topAnchor, constant: offsetY),
                        childView.leadingAnchor.constraint(equalTo: container.leadingAnchor),
                    ])
                    childView.layoutIfNeeded()
                    offsetY += childView.intrinsicContentSize.height
                }
            }

            // Set intrinsic size based on children
            if offsetY > 0 {
                container.heightAnchor.constraint(greaterThanOrEqualToConstant: offsetY).isActive = true
            }

            return container
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
}

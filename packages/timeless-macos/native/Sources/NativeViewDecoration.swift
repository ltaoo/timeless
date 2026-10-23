import Cocoa

/// Paints CSS decoration outside a view's layout box, including native text controls.
final class NativeViewDecoration {
    private weak var view: NSView?
    private(set) var outlineLayer: CALayer?
    private var outlineOffset: CGFloat = 0
    private(set) var shadowLayers: [CALayer] = []
    var shadowLayer: CALayer? { shadowLayers.first }
    private var shadowSpreads: [CGFloat] = []
    private var cssCornerRadius: CGFloat = 0
    private(set) var borderLayers: [String: CALayer] = [:]

    init(view: NSView) { self.view = view }

    func apply(_ style: [String: String]) {
        view?.focusRingType = .none
        cssCornerRadius = NativeViewRenderer.parsePx(style["border-radius"])
        updateFrame()
        applyOutlineStyle(style)
        applyBoxShadowStyle(style)
        applyBorderStyle(style)
    }

    func updateFrame() {
        guard let view = view else { return }
        view.layer?.cornerRadius = min(max(0, cssCornerRadius), max(0, min(view.bounds.width, view.bounds.height) / 2))
        updateOutlineFrame()
        updateShadowFrame()
        updateBorderFrame()
    }

    private func applyBorderStyle(_ style: [String: String]) {
        guard let view = view else { return }
        let edges = ["top", "right", "bottom", "left"]
        let uniform = NativeViewRenderer.parsePx(style["border-width"])
        let asymmetric = edges.contains { NativeViewRenderer.parsePx(style["border-\($0)-width"] ?? style["border-width"]) != uniform }
        if asymmetric { view.layer?.borderWidth = 0 }
        for edge in edges {
            let width = NativeViewRenderer.parsePx(style["border-\(edge)-width"] ?? style["border-width"])
            guard asymmetric, width > 0 else {
                borderLayers.removeValue(forKey: edge)?.removeFromSuperlayer()
                continue
            }
            let border = borderLayers[edge] ?? CALayer()
            if borderLayers[edge] == nil { view.layer?.addSublayer(border); borderLayers[edge] = border }
            border.backgroundColor = NativeViewRenderer.parseColor(style["border-\(edge)-color"] ?? style["border-color"] ?? "black")?.cgColor
            border.frame.size = NSSize(width: width, height: width)
        }
        updateBorderFrame()
    }

    private func updateBorderFrame() {
        guard let view = view else { return }
        CATransaction.begin()
        CATransaction.setDisableActions(true)
        for (edge, border) in borderLayers {
            let horizontal = edge == "top" || edge == "bottom"
            let width = horizontal ? border.bounds.height : border.bounds.width
            border.frame = horizontal
                ? CGRect(x: 0, y: edge == "top" ? 0 : view.bounds.height - width, width: view.bounds.width, height: width)
                : CGRect(x: edge == "left" ? 0 : view.bounds.width - width, y: 0, width: width, height: view.bounds.height)
        }
        CATransaction.commit()
    }

    private func applyOutlineStyle(_ style: [String: String]) {
        guard let view = view else { return }
        let width = NativeViewRenderer.parsePx(style["outline-width"])
        guard style["outline-style"] == "solid", width > 0 else {
            outlineLayer?.removeFromSuperlayer()
            outlineLayer = nil
            return
        }
        if outlineLayer == nil {
            let outline = CALayer()
            view.layer?.addSublayer(outline)
            outlineLayer = outline
        }
        // Outline is decoration outside the box; Yoga only measures the actual border.
        view.clipsToBounds = false
        view.layer?.masksToBounds = false
        CATransaction.begin()
        CATransaction.setDisableActions(true)
        outlineLayer?.borderWidth = width
        outlineLayer?.borderColor = NativeViewRenderer.parseColor(style["outline-color"] ?? style["color"] ?? "black")?.cgColor
        outlineOffset = NativeViewRenderer.parsePx(style["outline-offset"])
        updateOutlineFrame()
        CATransaction.commit()
    }

    private func applyBoxShadowStyle(_ style: [String: String]) {
        guard let view = view else { return }
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
            view.layer?.insertSublayer(shadow, at: 0)
            shadowLayers.append(shadow)
        }
        shadowSpreads = shadows.map { CGFloat($0.lengths[3]) }
        guard !shadows.isEmpty else { return }
        view.clipsToBounds = false
        view.layer?.masksToBounds = false
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
        guard let view = view else { return }
        guard !shadowLayers.isEmpty else { return }
        CATransaction.begin()
        CATransaction.setDisableActions(true)
        for (index, shadow) in shadowLayers.enumerated() {
            guard let mask = shadow.mask as? CAShapeLayer else { continue }
            let shadowSpread = shadowSpreads[index]
            let extent = max(0, shadowSpread) + shadow.shadowRadius * 4 + max(abs(shadow.shadowOffset.width), abs(shadow.shadowOffset.height)) + 1
            shadow.frame = view.bounds.insetBy(dx: -extent, dy: -extent)
            let box = CGRect(origin: CGPoint(x: extent, y: extent), size: view.bounds.size)
            let radius = min(view.layer?.cornerRadius ?? 0, max(0, min(box.width, box.height) / 2))
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
        guard let view = view else { return }
        guard let outline = outlineLayer else { return }
        CATransaction.begin()
        CATransaction.setDisableActions(true)
        let outset = outline.borderWidth + outlineOffset
        outline.frame = view.bounds.insetBy(dx: -outset, dy: -outset)
        outline.cornerRadius = max(0, (view.layer?.cornerRadius ?? 0) + outset)
        CATransaction.commit()
    }

}

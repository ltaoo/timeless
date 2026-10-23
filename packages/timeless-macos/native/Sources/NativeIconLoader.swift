import Cocoa

enum NativeIconLoader {
    private static let cache: NSCache<NSString, NSImage> = {
        let cache = NSCache<NSString, NSImage>()
        cache.countLimit = 128
        return cache
    }()

    static func image(svg: String, size: CGFloat, color: String) -> NSImage? {
        let key = "\(size)\n\(color)\n\(svg)" as NSString
        if let image = cache.object(forKey: key) { return image }
        do {
            let document = try XMLDocument(xmlString: svg, options: [.nodeLoadExternalEntitiesNever])
            guard let root = document.rootElement(), root.name == "svg" else { return nil }
            // AppKit's SVG decoder does not accept CSS's computed #RRGGBBAA colors.
            let rgb = NativeViewRenderer.parseColor(color)?.usingColorSpace(.sRGB)
            let svgColor = rgb.map { String(format: "rgba(%d,%d,%d,%.6f)", Int(($0.redComponent * 255).rounded()), Int(($0.greenComponent * 255).rounded()), Int(($0.blueComponent * 255).rounded()), $0.alphaComponent) } ?? color
            for (name, value) in ["width": String(Double(size)), "height": String(Double(size)), "color": svgColor] {
                root.removeAttribute(forName: name)
                root.addAttribute(XMLNode.attribute(withName: name, stringValue: value) as! XMLNode)
            }
            guard let image = NSImage(data: document.xmlData), image.isValid else {
                print("[Icon] SVG decoding failed")
                return nil
            }
            cache.setObject(image, forKey: key)
            return image
        } catch {
            print("[Icon] Invalid SVG: \(error)")
            return nil
        }
    }

    static func apply(to view: NSImageView, name: String, svg: String?, color: String, size: CGFloat, style: [String: String]) {
        let inherited = style["color"] ?? ""
        let resolved = color.isEmpty || color == "currentColor" ? inherited : color
        let tint = NativeViewRenderer.parseColor(resolved) ?? .labelColor
        if let svg = svg {
            let rgb = tint.usingColorSpace(.sRGB)!
            let fallback = String(format: "#%02x%02x%02x", Int((rgb.redComponent * 255).rounded()), Int((rgb.greenComponent * 255).rounded()), Int((rgb.blueComponent * 255).rounded()))
            view.contentTintColor = nil
            view.image = image(svg: svg, size: size, color: resolved.isEmpty || resolved == "currentColor" ? fallback : resolved)
        } else {
            view.image = NSImage(systemSymbolName: name, accessibilityDescription: nil)?
                .withSymbolConfiguration(NSImage.SymbolConfiguration(pointSize: size, weight: .regular))
            view.contentTintColor = tint
        }
        view.imageScaling = .scaleProportionallyUpOrDown
        NativeViewRenderer.applyStyle(style, to: view)
    }
}

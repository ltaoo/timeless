import Cocoa
import JavaScriptCore

enum NativeRichText {
    static func attributed(_ document: [String: Any], style: [String: String], width: CGFloat = .greatestFiniteMagnitude) -> NSAttributedString {
        let text = document["text"] as? String ?? ""
        let base = YogaLayoutEngine.resolveFont(style)
        let paragraph = NSMutableParagraphStyle()
        paragraph.lineBreakMode = .byWordWrapping
        paragraph.alignment = style["text-align"] == "center" ? .center : style["text-align"] == "right" ? .right : .left
        let result = NSMutableAttributedString(string: text, attributes: [
            .font: base, .foregroundColor: NativeViewRenderer.parseColor(style["color"] ?? "") ?? NSColor.labelColor,
            .paragraphStyle: paragraph,
        ])
        for span in document["spans"] as? [[String: Any]] ?? [] {
            guard let start = span["start"] as? Int, let end = span["end"] as? Int,
                  start >= 0, end > start, end <= result.length else { continue }
            let run = span["style"] as? [String: String] ?? [:]
            var resolved = style.merging(run) { _, new in new }
            if let size = run["font-size"] {
                let value = CGFloat(Double(size.replacingOccurrences(of: "em", with: "").replacingOccurrences(of: "px", with: "")) ?? Double(base.pointSize))
                resolved["font-size"] = String(Double(min(512, max(1, size.hasSuffix("em") ? base.pointSize * value : value))))
            }
            var font = YogaLayoutEngine.resolveFont(resolved)
            if resolved["font-family"] == "monospace" {
                font = NSFont.monospacedSystemFont(ofSize: font.pointSize, weight: resolved["font-weight"] == "700" ? .bold : .regular)
            }
            if resolved["font-style"] == "italic" { font = NSFontManager.shared.convert(font, toHaveTrait: .italicFontMask) }
            var attributes: [NSAttributedString.Key: Any] = [.font: font]
            if let color = run["color"].flatMap(NativeViewRenderer.parseColor) { attributes[.foregroundColor] = color }
            if let color = run["background-color"].flatMap(NativeViewRenderer.parseColor) { attributes[.backgroundColor] = color }
            let decoration = resolved["text-decoration"] ?? ""
            if decoration.contains("underline") { attributes[.underlineStyle] = NSUnderlineStyle.single.rawValue }
            if decoration.contains("line-through") { attributes[.strikethroughStyle] = NSUnderlineStyle.single.rawValue }
            if let href = span["href"] as? String { attributes[.link] = href }
            result.addAttributes(attributes, range: NSRange(location: start, length: end - start))
        }
        // Replace backwards so later UTF-16 ranges remain valid, including links after images.
        for span in (document["spans"] as? [[String: Any]] ?? []).reversed() {
            guard let image = span["image"] as? [String: Any], let source = image["src"] as? String,
                  let bitmap = NativeImageLoader.cache.object(forKey: source as NSString),
                  let start = span["start"] as? Int, let end = span["end"] as? Int,
                  start >= 0, end > start, end <= result.length,
                  bitmap.size.width > 0, bitmap.size.height > 0 else { continue }
            let desiredWidth = (image["width"] as? NSNumber)?.doubleValue ?? 0
            let desiredHeight = (image["height"] as? NSNumber)?.doubleValue ?? 0
            let w = desiredWidth.isFinite && desiredWidth > 0 ? CGFloat(desiredWidth)
                : desiredHeight.isFinite && desiredHeight > 0 ? bitmap.size.width * CGFloat(desiredHeight) / bitmap.size.height : bitmap.size.width
            let h = desiredHeight.isFinite && desiredHeight > 0 ? CGFloat(desiredHeight) : bitmap.size.height * w / bitmap.size.width
            let scale = min(1, max(1, width) / w)
            let attachment = NSTextAttachment()
            let accessibleImage = bitmap.copy() as! NSImage
            accessibleImage.accessibilityDescription = image["alt"] as? String
            attachment.image = accessibleImage
            attachment.bounds = NSRect(x: 0, y: 0, width: w * scale, height: h * scale)
            let content = NSMutableAttributedString(attachment: attachment)
            content.addAttributes(result.attributes(at: start, effectiveRange: nil), range: NSRange(location: 0, length: 1))
            result.replaceCharacters(in: NSRange(location: start, length: end - start), with: content)
        }
        return result
    }
}

final class NativeRichTextView: NSTextView, NSTextViewDelegate {
    private let node: JSValue
    private var imageSources: Set<String> = []
    private var requestedImages: Set<String> = []

    init(frame: NSRect, node: JSValue, style: [String: String]) {
        self.node = node
        let storage = NSTextStorage()
        let manager = NSLayoutManager()
        storage.addLayoutManager(manager)
        let container = NSTextContainer(size: NSSize(width: frame.width, height: .greatestFiniteMagnitude))
        manager.addTextContainer(container)
        super.init(frame: frame, textContainer: container)
        isEditable = false
        isSelectable = true
        drawsBackground = false
        textContainerInset = .zero
        textContainer?.lineFragmentPadding = 0
        textContainer?.widthTracksTextView = true
        isHorizontallyResizable = false
        delegate = self
        linkTextAttributes = [:]
        refresh(style: style)
        let change: @convention(block) (JSValue) -> Void = { [weak self] _ in self?.refresh() }
        node.setValue(change, forProperty: "_onRichTextChange")
        node.setValue(change, forProperty: "_onStyleChange")
    }

    required init?(coder: NSCoder) { fatalError("init(coder:) has not been implemented") }

    func refresh(style: [String: String]? = nil) {
        let document = node.forProperty("richText")?.toDictionary() as? [String: Any] ?? [:]
        let resolved = style ?? (node.forProperty("style")?.toDictionary() as? [String: String] ?? [:])
        let selection = selectedRange()
        textStorage?.setAttributedString(NativeRichText.attributed(document, style: resolved, width: frame.width))
        setSelectedRange(NSRange(location: min(selection.location, (string as NSString).length), length: 0))
        imageSources = Set((document["spans"] as? [[String: Any]] ?? []).compactMap { ($0["image"] as? [String: Any])?["src"] as? String })
        requestedImages.formIntersection(imageSources)
        for source in imageSources where !requestedImages.contains(source) && NativeImageLoader.cache.object(forKey: source as NSString) == nil {
            requestedImages.insert(source)
            NativeImageLoader.load(source) { [weak self] image in
                guard let self = self, self.imageSources.contains(source), image != nil else { return }
                self.refresh()
                self.node.invokeMethod("_requestLayout", withArguments: [])
            }
        }
    }

    override func setFrameSize(_ newSize: NSSize) {
        let changed = frame.width != newSize.width
        super.setFrameSize(newSize)
        if changed && textStorage != nil { refresh() }
    }

    func textView(_ textView: NSTextView, clickedOnLink link: Any, at charIndex: Int) -> Bool {
        node.invokeMethod("_onLinkPress", withArguments: [String(describing: link)])
        return true
    }
}

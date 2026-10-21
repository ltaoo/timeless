import Cocoa
import yoga

/// Holds text measurement context for Yoga's C measure callback.
final class TextMeasureContext {
    let text: String
    let font: NSFont
    var document: [String: Any]?
    var style: [String: String] = [:]

    init(text: String, font: NSFont) {
        self.text = text
        self.font = font
    }
}

/// Builds a parallel Yoga node tree from NativeNode, calculates layout,
/// and provides computed frames for frame-based rendering.
private final class GridLayoutContext {
    let columns: Int
    let gap: Float
    let widths: [Float]?
    init(columns: Int, gap: Float, widths: [Float]? = nil) { self.columns = columns; self.gap = gap; self.widths = widths }
}

enum YogaLayoutEngine {

    // MARK: - Public API

    /// Build a Yoga node tree mirroring the NativeNode tree.
    static func buildYogaTree(from node: NativeNode) -> YGNodeRef {
        let yogaNode = YGNodeNew()!
        applyNodeStyles(yogaNode, node: node)

        let children = nodeChildren(node)
        for (index, child) in children.enumerated() {
            let childYoga = buildYogaTree(from: child)
            YGNodeInsertChild(yogaNode, childYoga, index)
        }

        if case .splitView(let direction, let sizes, _, _, _, _, _) = node {
            for (index, child) in children.enumerated() {
                guard let childYoga = YGNodeGetChild(yogaNode, index) else { continue }
                let size = index < sizes.count ? sizes[index] : 0
                if size > 0 {
                    YGNodeStyleSetFlexGrow(childYoga, 0)
                    YGNodeStyleSetFlexShrink(childYoga, 0)
                    if direction == "horizontal" {
                        YGNodeStyleSetWidth(childYoga, Float(size))
                    } else {
                        YGNodeStyleSetHeight(childYoga, Float(size))
                    }
                } else {
                    YGNodeStyleSetFlexGrow(childYoga, 1)
                    YGNodeStyleSetFlexShrink(childYoga, 1)
                }
            }
        }

        // Row children default to flex-grow:1 so they share space equally
        if case .row = node {
            for i in 0..<children.count {
                if let child = YGNodeGetChild(yogaNode, i) {
                    if YGNodeStyleGetFlexGrow(child) == 0 {
                        YGNodeStyleSetFlexGrow(child, 1)
                    }
                }
            }
        }

        // AspectRatio children default to flex-grow:1 so they fill the container
        if case .aspectRatio = node {
            for i in 0..<children.count {
                if let child = YGNodeGetChild(yogaNode, i) {
                    if YGNodeStyleGetFlexGrow(child) == 0 {
                        YGNodeStyleSetFlexGrow(child, 1)
                    }
                }
            }
        }

        if case .view(let style, _, _) = node { applyGridMapping(yogaNode, style: style) }
        return yogaNode
    }

    /// Run Yoga layout calculation.
    static func calculateLayout(_ root: YGNodeRef, width: Float, height: Float = Float.nan) {
        YGNodeCalculateLayout(root, width, height, .LTR)
        resolveGridWidths(root)
        YGNodeCalculateLayout(root, width, height, .LTR)
    }

    private static func resolveGridWidths(_ node: YGNodeRef) {
        if let context = YGNodeGetContext(node), let grid = Unmanaged<AnyObject>.fromOpaque(context).takeUnretainedValue() as? GridLayoutContext {
            let inset = YGNodeLayoutGetPadding(node, .left) + YGNodeLayoutGetPadding(node, .right) + YGNodeLayoutGetBorder(node, .left) + YGNodeLayoutGetBorder(node, .right)
            let width = max(0, (YGNodeLayoutGetWidth(node) - inset - grid.gap * Float(grid.columns - 1)) / Float(grid.columns))
            for index in 0..<YGNodeGetChildCount(node) {
                if let child = YGNodeGetChild(node, index) { YGNodeStyleSetFlexBasis(child, grid.widths.map { $0[Int(index) % grid.columns] } ?? width) }
            }
        }
        for index in 0..<YGNodeGetChildCount(node) {
            if let child = YGNodeGetChild(node, index) { resolveGridWidths(child) }
        }
    }

    /// Recursively free all Yoga nodes and their associated contexts.
    static func freeTree(_ root: YGNodeRef) {
        freeContextsRecursive(root)
        YGNodeFreeRecursive(root)
    }

    /// Read computed frame from a Yoga node.
    static func frame(of yogaNode: YGNodeRef) -> CGRect {
        CGRect(
            x: CGFloat(YGNodeLayoutGetLeft(yogaNode)),
            y: CGFloat(YGNodeLayoutGetTop(yogaNode)),
            width: CGFloat(YGNodeLayoutGetWidth(yogaNode)),
            height: CGFloat(YGNodeLayoutGetHeight(yogaNode))
        )
    }

    // MARK: - Style Mapping

    private static func applyNodeStyles(_ yogaNode: YGNodeRef, node: NativeNode) {
        switch node {
        case .floating:
            YGNodeStyleSetWidth(yogaNode, 0)
            YGNodeStyleSetHeight(yogaNode, 0)
            YGNodeStyleSetPositionType(yogaNode, .absolute)
        case .view(let style, _, _):
            YGNodeStyleSetFlexDirection(yogaNode, ["flex", "inline-flex"].contains(style["display"] ?? "") ? .row : .column)
            applyStyleDict(yogaNode, style: style)

        case .row(let style, _, _):
            YGNodeStyleSetFlexDirection(yogaNode, .row)
            applyStyleDict(yogaNode, style: style)

        case .column(let style, _, _):
            YGNodeStyleSetFlexDirection(yogaNode, .column)
            applyStyleDict(yogaNode, style: style)

        case .text(let value, let style, let js):
            let font = resolveFont(style)
            let ctx = TextMeasureContext(text: value, font: font)
            if let document = js?.forProperty("richText")?.toDictionary() as? [String: Any] {
                ctx.document = document
                ctx.style = style
            }
            let ptr = Unmanaged.passRetained(ctx).toOpaque()
            YGNodeSetContext(yogaNode, ptr)
            YGNodeSetMeasureFunc(yogaNode, textMeasure)
            applyStyleDict(yogaNode, style: style)

        case .img(_, let style, _):
            applyStyleDict(yogaNode, style: style)

        case .button(let style, _, _):
            if style["height"] == nil && style["min-height"] == nil { YGNodeStyleSetMinHeight(yogaNode, 32) }
            YGNodeStyleSetFlexDirection(yogaNode, .row)
            YGNodeStyleSetAlignItems(yogaNode, .center)
            YGNodeStyleSetJustifyContent(yogaNode, style["display"] == "flex" ? .flexStart : .center)
            applyStyleDict(yogaNode, style: style)

        case .input(_, _, let style, _):
            YGNodeStyleSetHeight(yogaNode, 22)
            applyStyleDict(yogaNode, style: style)

        case .checkbox(_, let style, _):
            YGNodeStyleSetWidth(yogaNode, 18)
            YGNodeStyleSetHeight(yogaNode, 18)
            applyStyleDict(yogaNode, style: style)

        case .radio(_, let style, _):
            YGNodeStyleSetWidth(yogaNode, 18)
            YGNodeStyleSetHeight(yogaNode, 18)
            applyStyleDict(yogaNode, style: style)

        case .textarea(_, _, _, let style, _):
            let h = parsePx(style["height"])
            YGNodeStyleSetHeight(yogaNode, h > 0 ? Float(h) : 80)
            applyStyleDict(yogaNode, style: style)

        case .numberInput(_, _, _, let style, _):
            YGNodeStyleSetHeight(yogaNode, 22)
            applyStyleDict(yogaNode, style: style)

        case .select(_, let style, _):
            YGNodeStyleSetHeight(yogaNode, 26)
            applyStyleDict(yogaNode, style: style)

        case .icon(_, _, _, let size, let style, _):
            YGNodeStyleSetWidth(yogaNode, Float(size))
            YGNodeStyleSetHeight(yogaNode, Float(size))
            applyStyleDict(yogaNode, style: style)

        case .aspectRatio(let ratio, let style, _, _):
            YGNodeStyleSetAspectRatio(yogaNode, Float(ratio))
            applyStyleDict(yogaNode, style: style)

        case .splitView(let direction, _, let minSizes, let maxSizes, _, let children, _):
            YGNodeStyleSetFlexDirection(yogaNode, direction == "horizontal" ? .row : .column)
            if direction == "horizontal" {
                if let minFirst = minSizes.first {
                    YGNodeStyleSetMinWidth(yogaNode, Float(minFirst))
                }
                if let maxFirst = maxSizes.first {
                    YGNodeStyleSetMaxWidth(yogaNode, Float(maxFirst))
                }
            } else {
                if let minFirst = minSizes.first {
                    YGNodeStyleSetMinHeight(yogaNode, Float(minFirst))
                }
                if let maxFirst = maxSizes.first {
                    YGNodeStyleSetMaxHeight(yogaNode, Float(maxFirst))
                }
            }
            for i in 0..<children.count {
                if let childYoga = YGNodeGetChild(yogaNode, i) {
                    YGNodeStyleSetFlexGrow(childYoga, 1)
                }
            }

        case .splitPane:
            break

        case .scrollView(_, _, _, let js):
            YGNodeStyleSetFlexDirection(yogaNode, .column)
            YGNodeStyleSetFlexGrow(yogaNode, 1)
            YGNodeStyleSetOverflow(yogaNode, .scroll)
            applyStyleDict(yogaNode, style: js?.forProperty("style")?.toDictionary() as? [String: String] ?? [:])

        case .tabView(_, _, let children, _):
            YGNodeStyleSetFlexDirection(yogaNode, .column)
            for i in 0..<children.count {
                if let childYoga = YGNodeGetChild(yogaNode, i) {
                    YGNodeStyleSetFlexGrow(childYoga, 1)
                }
            }

        case .tabPane(_, _, let children, _):
            YGNodeStyleSetFlexGrow(yogaNode, 1)
        }
    }

    /// Map CSS style dictionary to Yoga style properties.
    private static func applyStyleDict(_ node: YGNodeRef, style: [String: String]) {
        // Dimensions
        if let w = style["width"] {
            if w.hasSuffix("%"), let pct = Float(w.dropLast()) {
                YGNodeStyleSetWidthPercent(node, pct)
            } else {
                let v = Float(parsePx(w))
                if w == "auto" { YGNodeStyleSetWidthAuto(node) }
                else if v >= 0 { YGNodeStyleSetWidth(node, v) }
            }
        }
        if let h = style["height"] {
            if h.hasSuffix("%"), let pct = Float(h.dropLast()) {
                YGNodeStyleSetHeightPercent(node, pct)
            } else {
                let v = Float(parsePx(h))
                if h == "auto" { YGNodeStyleSetHeightAuto(node) }
                else if v >= 0 { YGNodeStyleSetHeight(node, v) }
            }
        }

        // Min/Max dimensions
        for (key, setter, percentSetter) in [
            ("min-width", YGNodeStyleSetMinWidth, YGNodeStyleSetMinWidthPercent),
            ("min-height", YGNodeStyleSetMinHeight, YGNodeStyleSetMinHeightPercent),
            ("max-width", YGNodeStyleSetMaxWidth, YGNodeStyleSetMaxWidthPercent),
            ("max-height", YGNodeStyleSetMaxHeight, YGNodeStyleSetMaxHeightPercent),
        ] {
            if let value = style[key] {
                if value.hasSuffix("%"), let percent = Float(value.dropLast()) { percentSetter(node, percent) }
                else { setter(node, Float(parsePx(value))) }
            }
        }

        // Padding
        applyEdgeValues(node, style: style, property: "padding", setter: YGNodeStyleSetPadding)

        // Margin
        applyEdgeValues(node, style: style, property: "margin", setter: YGNodeStyleSetMargin)
        if let width = style["border-width"] { YGNodeStyleSetBorder(node, .all, Float(parsePx(width))) }
        for (edge, key) in [(YGEdge.top, "top"), (.right, "right"), (.bottom, "bottom"), (.left, "left")] {
            if let value = style[key] { YGNodeStyleSetPosition(node, edge, Float(parsePx(value))) }
        }

        // Flex direction (can be overridden by node type)
        if let fd = style["flex-direction"] {
            switch fd {
            case "row": YGNodeStyleSetFlexDirection(node, .row)
            case "row-reverse": YGNodeStyleSetFlexDirection(node, .rowReverse)
            case "column": YGNodeStyleSetFlexDirection(node, .column)
            case "column-reverse": YGNodeStyleSetFlexDirection(node, .columnReverse)
            default: break
            }
        }

        // Gap
        if let gap = style["gap"] {
            let v = Float(parsePx(gap))
            if v > 0 { YGNodeStyleSetGap(node, .all, v) }
        }
        if let gap = style["row-gap"] {
            let v = Float(parsePx(gap))
            if v > 0 { YGNodeStyleSetGap(node, .row, v) }
        }
        if let gap = style["column-gap"] {
            let v = Float(parsePx(gap))
            if v > 0 { YGNodeStyleSetGap(node, .column, v) }
        }

        // Align items
        if let ai = style["align-items"] {
            switch ai {
            case "flex-start", "start": YGNodeStyleSetAlignItems(node, .flexStart)
            case "center": YGNodeStyleSetAlignItems(node, .center)
            case "flex-end", "end": YGNodeStyleSetAlignItems(node, .flexEnd)
            case "stretch": YGNodeStyleSetAlignItems(node, .stretch)
            case "baseline": YGNodeStyleSetAlignItems(node, .baseline)
            default: break
            }
        }

        // Justify content
        if let jc = style["justify-content"] {
            switch jc {
            case "flex-start", "start": YGNodeStyleSetJustifyContent(node, .flexStart)
            case "center": YGNodeStyleSetJustifyContent(node, .center)
            case "flex-end", "end": YGNodeStyleSetJustifyContent(node, .flexEnd)
            case "space-between": YGNodeStyleSetJustifyContent(node, .spaceBetween)
            case "space-around": YGNodeStyleSetJustifyContent(node, .spaceAround)
            case "space-evenly": YGNodeStyleSetJustifyContent(node, .spaceEvenly)
            default: break
            }
        }

        // Align self
        if let aself = style["align-self"] {
            switch aself {
            case "auto": YGNodeStyleSetAlignSelf(node, .auto)
            case "flex-start", "start": YGNodeStyleSetAlignSelf(node, .flexStart)
            case "center": YGNodeStyleSetAlignSelf(node, .center)
            case "flex-end", "end": YGNodeStyleSetAlignSelf(node, .flexEnd)
            case "stretch": YGNodeStyleSetAlignSelf(node, .stretch)
            case "baseline": YGNodeStyleSetAlignSelf(node, .baseline)
            default: break
            }
        }

        // Flex grow / shrink / basis
        if let fg = style["flex-grow"], let v = Float(fg) {
            YGNodeStyleSetFlexGrow(node, v)
        }
        if let fs = style["flex-shrink"], let v = Float(fs) {
            YGNodeStyleSetFlexShrink(node, v)
        }
        if let fb = style["flex-basis"] {
            if fb == "auto" {
                YGNodeStyleSetFlexBasisAuto(node)
            } else if fb.hasSuffix("%"), let pct = Float(fb.dropLast()) {
                YGNodeStyleSetFlexBasisPercent(node, pct)
            } else {
                let v = Float(parsePx(fb))
                if v >= 0 { YGNodeStyleSetFlexBasis(node, v) }
            }
        }

        // Flex wrap
        if let fw = style["flex-wrap"] {
            switch fw {
            case "wrap": YGNodeStyleSetFlexWrap(node, .wrap)
            case "wrap-reverse": YGNodeStyleSetFlexWrap(node, .wrapReverse)
            case "nowrap": YGNodeStyleSetFlexWrap(node, .noWrap)
            default: break
            }
        }

        // Position type
        if let pos = style["position"] {
            switch pos {
            case "absolute": YGNodeStyleSetPositionType(node, .absolute)
            case "relative": YGNodeStyleSetPositionType(node, .relative)
            default: break
            }
        }

        // Overflow
        if let ov = style["overflow"] {
            switch ov {
            case "hidden": YGNodeStyleSetOverflow(node, .hidden)
            case "scroll": YGNodeStyleSetOverflow(node, .scroll)
            case "visible": YGNodeStyleSetOverflow(node, .visible)
            default: break
            }
        }

        // Display
        if let d = style["display"] {
            if d == "none" {
                YGNodeStyleSetDisplay(node, .none)
            } else if d == "contents" {
                YGNodeStyleSetDisplay(node, .contents)
            }
        }
    }

    // MARK: - Grid → Flexbox Mapping

    /// Convert `display: grid` + `grid-template-columns: repeat(N, 1fr)` to flex wrap layout.
    private static func applyGridMapping(_ node: YGNodeRef, style: [String: String]) {
        guard style["display"] == "grid",
              let source = style["grid-template-columns"] else { return }
        let cols = source.replacingOccurrences(of: "minmax\\(\\s*0(?:px)?\\s*,\\s*1fr\\s*\\)", with: "1fr", options: .regularExpression)

        // Parse repeat(N, 1fr)
        let colCount: Int
        var fixedWidths: [Float]?
        if cols.hasPrefix("repeat("), cols.hasSuffix(")") {
            let inner = cols.dropFirst(7).dropLast(1) // strip "repeat(" and ")"
            let parts = inner.split(separator: ",").map { $0.trimmingCharacters(in: .whitespaces) }
            if parts.count == 2, let n = Int(parts[0]), parts[1] == "1fr" {
                colCount = n
            } else {
                return
            }
        } else {
            // Count space-separated "1fr" tokens
            let tokens = cols.split(separator: " ").map { $0.trimmingCharacters(in: .whitespaces) }
            if tokens.allSatisfy({ $0 == "1fr" }) {
                colCount = tokens.count
            } else if !tokens.isEmpty && tokens.allSatisfy({ $0.hasSuffix("px") && Float($0.dropLast(2)).map { $0 > 0 } == true }) {
                fixedWidths = tokens.compactMap { Float($0.dropLast(2)) }
                colCount = tokens.count
                if style["width"] == nil || style["width"] == "auto" {
                    YGNodeStyleSetWidth(node, fixedWidths!.reduce(0, +) + Float(parsePx(style["gap"])) * Float(colCount - 1))
                }
            } else {
                return
            }
        }

        guard colCount > 0 else { return }

        // Convert to flex wrap: row direction, wrap enabled, each child gets 100/N% basis
        YGNodeStyleSetFlexDirection(node, .row)
        YGNodeStyleSetFlexWrap(node, .wrap)
        YGNodeStyleSetDisplay(node, .flex)

        let context = GridLayoutContext(columns: colCount, gap: Float(parsePx(style["gap"])), widths: fixedWidths)
        YGNodeSetContext(node, Unmanaged.passRetained(context).toOpaque())
        let childCount = YGNodeGetChildCount(node)
        let basisPercent = Float(100.0 / Double(colCount))
        for i in 0..<childCount {
            if let child = YGNodeGetChild(node, i) {
                YGNodeStyleSetFlexBasisPercent(child, basisPercent)
            }
        }
    }

    // MARK: - Edge Values

    private static func applyEdgeValues(
        _ node: YGNodeRef,
        style: [String: String],
        property: String,
        setter: (YGNodeRef?, YGEdge, Float) -> Void
    ) {
        // Shorthand (all edges)
        if let all = style[property] {
            let v = Float(parsePx(all))
            if v >= 0 || property == "margin" { setter(node, .all, v) }
        }
        // Individual edges
        if let v = style["\(property)-top"] {
            let f = Float(parsePx(v)); if f >= 0 || property == "margin" { setter(node, .top, f) }
        }
        if let v = style["\(property)-right"] {
            let f = Float(parsePx(v)); if f >= 0 || property == "margin" { setter(node, .right, f) }
        }
        if let v = style["\(property)-bottom"] {
            let f = Float(parsePx(v)); if f >= 0 || property == "margin" { setter(node, .bottom, f) }
        }
        if let v = style["\(property)-left"] {
            let f = Float(parsePx(v)); if f >= 0 || property == "margin" { setter(node, .left, f) }
        }
    }

    // MARK: - Text Measure

    /// C-compatible measure function for text nodes.
    private static let textMeasure: @convention(c) (
        YGNodeConstRef?, Float, YGMeasureMode, Float, YGMeasureMode
    ) -> YGSize = { node, width, widthMode, height, heightMode in
        guard let node = node,
              let ctxPtr = YGNodeGetContext(node) else {
            return YGSize(width: 0, height: 0)
        }

        let ctx = Unmanaged<TextMeasureContext>.fromOpaque(ctxPtr).takeUnretainedValue()

        let maxWidth: CGFloat
        switch widthMode {
        case .exactly, .atMost:
            maxWidth = CGFloat(width)
        default:
            maxWidth = CGFloat.greatestFiniteMagnitude
        }

        let str = ctx.document.map { NativeRichText.attributed($0, style: ctx.style, width: maxWidth) }
            ?? NSAttributedString(string: ctx.text, attributes: [.font: ctx.font])
        let size = str.boundingRect(
            with: NSSize(width: maxWidth, height: .greatestFiniteMagnitude),
            options: [.usesLineFragmentOrigin, .usesFontLeading]
        ).size

        return YGSize(width: Float(ceil(size.width)), height: Float(ceil(size.height)))
    }

    // MARK: - Font Resolution

    static func resolveFont(_ style: [String: String]) -> NSFont {
        var fontSize: CGFloat = 14
        if let fs = style["font-size"] {
            let v = parsePx(fs)
            if v > 0 { fontSize = v }
        }

        var weight: NSFont.Weight = .regular
        if let fw = style["font-weight"] {
            switch fw {
            case "100": weight = .ultraLight
            case "200": weight = .thin
            case "bold", "700": weight = .bold
            case "800": weight = .heavy
            case "900": weight = .black
            case "600": weight = .semibold
            case "500": weight = .medium
            case "300": weight = .light
            default: break
            }
        }

        return NSFont.systemFont(ofSize: fontSize, weight: weight)
    }

    // MARK: - Helpers

    static func nodeChildren(_ node: NativeNode) -> [NativeNode] {
        switch node {
        case .view(_, let c, _), .row(_, let c, _), .column(_, let c, _),
             .button(_, let c, _), .aspectRatio(_, _, let c, _),
             .splitView(_, _, _, _, _, let c, _), .splitPane(_, _, _, _, _, let c, _),
             .scrollView(_, _, let c, _), .tabView(_, _, let c, _), .tabPane(_, _, let c, _):
            return c
        default:
            return []
        }
    }

    private static func parsePx(_ value: String?) -> CGFloat {
        guard let value = value else { return 0 }
        let trimmed = value.trimmingCharacters(in: .whitespaces)
            .replacingOccurrences(of: "px", with: "")
        return CGFloat(Double(trimmed) ?? 0)
    }

    private static func freeContextsRecursive(_ node: YGNodeRef) {
        if let ctx = YGNodeGetContext(node) {
            Unmanaged<AnyObject>.fromOpaque(ctx).release()
            YGNodeSetContext(node, nil)
        }
        let count = YGNodeGetChildCount(node)
        for i in 0..<count {
            if let child = YGNodeGetChild(node, i) {
                freeContextsRecursive(child)
            }
        }
    }
}

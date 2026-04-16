import Cocoa
import JavaScriptCore
import yoga

/// An NSView subclass whose coordinate system origin is top-left,
/// matching Yoga's layout output.
class FlippedView: NSView {
    override var isFlipped: Bool { true }
}

/// Converts a `NativeNode` tree into an AppKit (NSView) hierarchy
/// using Yoga for layout calculation. Registers HMR change callbacks
/// on JSValue $elm objects so that property and structural changes
/// propagate to NSViews without a full rebuild.
class NativeViewRenderer {

    /// Reference to the bridge for parsing child JSValues during structural changes.
    private weak var bridge: JSBridge?

    /// The last container width used for layout (needed for relayout).
    private(set) var lastContainerWidth: CGFloat = 0

    /// The root NSView produced by the last `render` call.
    private(set) var rootView: NSView?

    init(bridge: JSBridge) {
        self.bridge = bridge
    }

    // MARK: - Public API

    /// Build an NSView tree from a NativeNode, laid out with Yoga at the given width.
    func render(_ node: NativeNode, containerWidth: CGFloat) -> NSView? {
        lastContainerWidth = containerWidth
        let yogaRoot = YogaLayoutEngine.buildYogaTree(from: node)
        YogaLayoutEngine.calculateLayout(yogaRoot, width: Float(containerWidth))
        let view = buildNSView(node: node, yogaNode: yogaRoot)
        YogaLayoutEngine.freeTree(yogaRoot)
        rootView = view
        return view
    }

    /// Re-layout existing NSView tree using updated $elm data.
    /// Called after JS patch() modifies the $elm tree.
    func relayout() {
        guard let bridge = bridge,
              let rootJSValue = bridge.rootElmJSValue,
              let rootNode = bridge.parseNode(rootJSValue),
              let rootView = rootView,
              lastContainerWidth > 0 else { return }

        let yogaRoot = YogaLayoutEngine.buildYogaTree(from: rootNode)
        YogaLayoutEngine.calculateLayout(yogaRoot, width: Float(lastContainerWidth))
        updateFrames(view: rootView, yogaNode: yogaRoot)
        YogaLayoutEngine.freeTree(yogaRoot)

        // Update the document view height if inside a scroll view
        if let docView = rootView.superview {
            docView.frame.size.height = rootView.frame.height
        }
    }

    // MARK: - Frame Update (Relayout)

    /// Walk NSView + Yoga trees in parallel, updating only frames.
    /// Only recurses into FlippedView containers — native controls (NSButton,
    /// NSImageView, NSTextField, etc.) have internal subviews that must not
    /// be overwritten with Yoga child frames.
    private func updateFrames(view: NSView, yogaNode: YGNodeRef) {
        let frame = YogaLayoutEngine.frame(of: yogaNode)
        view.frame = frame

        guard view is FlippedView else { return }

        let subviews = view.subviews
        let childCount = min(subviews.count, Int(YGNodeGetChildCount(yogaNode)))
        for i in 0..<childCount {
            guard let childYoga = YGNodeGetChild(yogaNode, i) else { continue }
            updateFrames(view: subviews[i], yogaNode: childYoga)
        }
    }

    // MARK: - View Builder

    private func buildNSView(node: NativeNode, yogaNode: YGNodeRef) -> NSView? {
        let frame = YogaLayoutEngine.frame(of: yogaNode)

        switch node {
        case .text(let value, let style, let jsValue):
            let label = NSTextField(labelWithString: value)
            label.isEditable = false
            label.isBezeled = false
            label.drawsBackground = false
            label.maximumNumberOfLines = 0
            label.preferredMaxLayoutWidth = frame.width
            NativeViewRenderer.applyTextStyle(style, to: label)
            label.frame = frame

            if let jsValue = jsValue {
                let onContentChange: @convention(block) (String) -> Void = { [weak label] newValue in
                    label?.stringValue = newValue
                }
                jsValue.setValue(onContentChange, forProperty: "_onContentChange")

                let onStyleChange: @convention(block) (JSValue) -> Void = { [weak label] styleJS in
                    guard let label = label else { return }
                    let style = styleJS.toDictionary() as? [String: String] ?? [:]
                    NativeViewRenderer.applyTextStyle(style, to: label)
                }
                jsValue.setValue(onStyleChange, forProperty: "_onStyleChange")
            }

            return label

        case .view(let style, let children, let jsValue):
            let container = FlippedView(frame: frame)
            NativeViewRenderer.applyStyle(style, to: container)
            addChildren(children, to: container, yogaParent: yogaNode)
            registerContainerCallbacks(jsValue: jsValue, view: container)
            return container

        case .img(let src, let style, let jsValue):
            let imageView = NSImageView(frame: frame)
            imageView.imageScaling = .scaleProportionallyUpOrDown
            NativeViewRenderer.applyStyle(style, to: imageView)
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

            if let jsValue = jsValue {
                let onStyleChange: @convention(block) (JSValue) -> Void = { [weak imageView] styleJS in
                    guard let view = imageView else { return }
                    let s = styleJS.toDictionary() as? [String: String] ?? [:]
                    NativeViewRenderer.applyStyle(s, to: view)
                }
                jsValue.setValue(onStyleChange, forProperty: "_onStyleChange")
            }

            return imageView

        case .button(let style, let children, let jsValue):
            let button = NSButton(title: "", target: nil, action: nil)
            button.bezelStyle = .rounded
            button.frame = frame
            NativeViewRenderer.applyStyle(style, to: button)
            for child in children {
                if case .text(let value, _, _) = child {
                    button.title = value
                    break
                }
            }
            if let fontSize = style["font-size"] {
                let size = NativeViewRenderer.parsePx(fontSize)
                if size > 0 {
                    button.font = .systemFont(ofSize: size)
                }
            }
            if let jsValue = jsValue {
                // Live event reading: read from $elm.listeners on each click
                let helper = LiveButtonClickHelper(jsValue: jsValue)
                button.target = helper
                button.action = #selector(LiveButtonClickHelper.handleClick)
                objc_setAssociatedObject(button, "clickHelper", helper, .OBJC_ASSOCIATION_RETAIN_NONATOMIC)

                let onStyleChange: @convention(block) (JSValue) -> Void = { [weak button] styleJS in
                    guard let btn = button else { return }
                    let s = styleJS.toDictionary() as? [String: String] ?? [:]
                    NativeViewRenderer.applyStyle(s, to: btn)
                }
                jsValue.setValue(onStyleChange, forProperty: "_onStyleChange")
            }
            return button

        case .input(let value, let placeholder, let style, let jsValue):
            let textField = NSTextField(frame: frame)
            textField.stringValue = value
            textField.placeholderString = placeholder
            textField.isEditable = true
            textField.isBezeled = true
            textField.bezelStyle = .roundedBezel
            NativeViewRenderer.applyStyle(style, to: textField)
            NativeViewRenderer.applyTextStyle(style, to: textField)
            if let jsValue = jsValue {
                let delegate = LiveTextFieldInputDelegate(jsValue: jsValue)
                textField.delegate = delegate
                objc_setAssociatedObject(textField, "inputDelegate", delegate, .OBJC_ASSOCIATION_RETAIN_NONATOMIC)

                let onStyleChange: @convention(block) (JSValue) -> Void = { [weak textField] styleJS in
                    guard let tf = textField else { return }
                    let s = styleJS.toDictionary() as? [String: String] ?? [:]
                    NativeViewRenderer.applyStyle(s, to: tf)
                    NativeViewRenderer.applyTextStyle(s, to: tf)
                }
                jsValue.setValue(onStyleChange, forProperty: "_onStyleChange")
            }
            return textField

        case .checkbox(let checked, let style, let jsValue):
            let button = NSButton(checkboxWithTitle: "", target: nil, action: nil)
            button.state = checked ? .on : .off
            button.frame = frame
            NativeViewRenderer.applyStyle(style, to: button)
            if let jsValue = jsValue {
                let helper = LiveCheckboxClickHelper(button: button, jsValue: jsValue)
                button.target = helper
                button.action = #selector(LiveCheckboxClickHelper.handleClick)
                objc_setAssociatedObject(button, "checkboxHelper", helper, .OBJC_ASSOCIATION_RETAIN_NONATOMIC)
            }
            return button

        case .textarea(let value, let placeholder, let disabled, let style, let jsValue):
            let scrollView = NSScrollView(frame: frame)
            scrollView.hasVerticalScroller = true
            scrollView.autohidesScrollers = true
            scrollView.borderType = .bezelBorder
            let textView = NSTextView(frame: NSRect(origin: .zero, size: frame.size))
            textView.string = value
            textView.isEditable = !disabled
            textView.isRichText = false
            textView.font = .systemFont(ofSize: 14)
            if value.isEmpty {
                textView.string = placeholder
                textView.textColor = .placeholderTextColor
            } else {
                textView.textColor = .labelColor
            }
            NativeViewRenderer.applyStyle(style, to: scrollView)
            scrollView.documentView = textView
            if let jsValue = jsValue {
                let delegate = LiveTextViewInputDelegate(placeholder: placeholder, jsValue: jsValue)
                textView.delegate = delegate
                objc_setAssociatedObject(textView, "textViewDelegate", delegate, .OBJC_ASSOCIATION_RETAIN_NONATOMIC)
            }
            return scrollView

        case .numberInput(let value, let placeholder, let disabled, let style, let jsValue):
            let textField = NSTextField(frame: frame)
            textField.stringValue = value
            textField.placeholderString = placeholder
            textField.isEditable = !disabled
            textField.isBezeled = true
            textField.bezelStyle = .roundedBezel
            let formatter = NumberFormatter()
            formatter.numberStyle = .decimal
            textField.formatter = formatter
            NativeViewRenderer.applyStyle(style, to: textField)
            NativeViewRenderer.applyTextStyle(style, to: textField)
            if let jsValue = jsValue {
                let delegate = LiveTextFieldInputDelegate(jsValue: jsValue)
                textField.delegate = delegate
                objc_setAssociatedObject(textField, "inputDelegate", delegate, .OBJC_ASSOCIATION_RETAIN_NONATOMIC)
            }
            return textField

        case .radio(let checked, let style, let jsValue):
            let button = NSButton(radioButtonWithTitle: "", target: nil, action: nil)
            button.state = checked ? .on : .off
            button.frame = frame
            NativeViewRenderer.applyStyle(style, to: button)
            if let jsValue = jsValue {
                let helper = LiveCheckboxClickHelper(button: button, jsValue: jsValue)
                button.target = helper
                button.action = #selector(LiveCheckboxClickHelper.handleClick)
                objc_setAssociatedObject(button, "radioHelper", helper, .OBJC_ASSOCIATION_RETAIN_NONATOMIC)
            }
            return button

        case .row(let style, let children, let jsValue):
            let container = FlippedView(frame: frame)
            NativeViewRenderer.applyStyle(style, to: container)
            addChildren(children, to: container, yogaParent: yogaNode)
            registerContainerCallbacks(jsValue: jsValue, view: container)
            return container

        case .column(let style, let children, let jsValue):
            let container = FlippedView(frame: frame)
            NativeViewRenderer.applyStyle(style, to: container)
            addChildren(children, to: container, yogaParent: yogaNode)
            registerContainerCallbacks(jsValue: jsValue, view: container)
            return container

        case .select(let items, let style, let jsValue):
            let popUp = NSPopUpButton(frame: frame, pullsDown: false)
            popUp.addItems(withTitles: items)
            NativeViewRenderer.applyStyle(style, to: popUp)
            if let jsValue = jsValue {
                let helper = LivePopUpButtonChangeHelper(popUp: popUp, jsValue: jsValue)
                popUp.target = helper
                popUp.action = #selector(LivePopUpButtonChangeHelper.handleChange)
                objc_setAssociatedObject(popUp, "popUpHelper", helper, .OBJC_ASSOCIATION_RETAIN_NONATOMIC)
            }
            return popUp

        case .icon(let name, let color, let size, let style, let jsValue):
            let imageView = NSImageView(frame: frame)
            if #available(macOS 11.0, *) {
                let config = NSImage.SymbolConfiguration(pointSize: size, weight: .regular)
                if let img = NSImage(systemSymbolName: name, accessibilityDescription: nil)?
                    .withSymbolConfiguration(config) {
                    imageView.image = img
                }
            }
            imageView.imageScaling = .scaleProportionallyUpOrDown
            if !color.isEmpty, let c = NativeViewRenderer.parseColor(color) {
                imageView.contentTintColor = c
            }
            NativeViewRenderer.applyStyle(style, to: imageView)

            if let jsValue = jsValue {
                let onStyleChange: @convention(block) (JSValue) -> Void = { [weak imageView] styleJS in
                    guard let view = imageView else { return }
                    let s = styleJS.toDictionary() as? [String: String] ?? [:]
                    NativeViewRenderer.applyStyle(s, to: view)
                }
                jsValue.setValue(onStyleChange, forProperty: "_onStyleChange")
            }

            return imageView

        case .aspectRatio(_, let style, let children, let jsValue):
            let container = FlippedView(frame: frame)
            container.wantsLayer = true
            container.layer?.masksToBounds = true
            NativeViewRenderer.applyStyle(style, to: container)
            addChildren(children, to: container, yogaParent: yogaNode)
            // Images inside aspect-ratio should fill the container
            for subview in container.subviews {
                if let imageView = subview as? NSImageView {
                    imageView.imageScaling = .scaleAxesIndependently
                    imageView.frame = container.bounds
                }
            }
            registerContainerCallbacks(jsValue: jsValue, view: container)
            return container
        }
    }

    // MARK: - Container Callbacks (structural + style)

    /// Register `_onStyleChange`, `_onChildInserted`, `_onChildRemoved`, `_onChildReplaced`
    /// on container JSValues (view, row, column, aspectRatio).
    private func registerContainerCallbacks(jsValue: JSValue?, view: NSView) {
        guard let jsValue = jsValue else { return }

        let onStyleChange: @convention(block) (JSValue) -> Void = { [weak view] styleJS in
            guard let view = view else { return }
            let style = styleJS.toDictionary() as? [String: String] ?? [:]
            NativeViewRenderer.applyStyle(style, to: view)
        }
        jsValue.setValue(onStyleChange, forProperty: "_onStyleChange")

        let onChildInserted: @convention(block) (Int, JSValue) -> Void = { [weak self, weak view] index, childJS in
            guard let self = self, let parentView = view else { return }
            guard let childNode = self.bridge?.parseNode(childJS) else { return }
            // Build a minimal Yoga node for sizing (will be properly laid out on relayout)
            let childYoga = YogaLayoutEngine.buildYogaTree(from: childNode)
            YogaLayoutEngine.calculateLayout(childYoga, width: Float(parentView.frame.width))
            if let childView = self.buildNSView(node: childNode, yogaNode: childYoga) {
                let clampedIndex = min(index, parentView.subviews.count)
                parentView.addSubview(childView, positioned: .above,
                                      relativeTo: clampedIndex > 0 ? parentView.subviews[clampedIndex - 1] : nil)
            }
            YogaLayoutEngine.freeTree(childYoga)
        }
        jsValue.setValue(onChildInserted, forProperty: "_onChildInserted")

        let onChildRemoved: @convention(block) (Int) -> Void = { [weak view] index in
            guard let parentView = view else { return }
            if index < parentView.subviews.count {
                parentView.subviews[index].removeFromSuperview()
            }
        }
        jsValue.setValue(onChildRemoved, forProperty: "_onChildRemoved")

        let onChildReplaced: @convention(block) (Int, JSValue) -> Void = { [weak self, weak view] index, newChildJS in
            guard let self = self, let parentView = view else { return }
            guard index < parentView.subviews.count else { return }
            guard let childNode = self.bridge?.parseNode(newChildJS) else { return }
            let childYoga = YogaLayoutEngine.buildYogaTree(from: childNode)
            YogaLayoutEngine.calculateLayout(childYoga, width: Float(parentView.frame.width))
            if let newView = self.buildNSView(node: childNode, yogaNode: childYoga) {
                let oldView = parentView.subviews[index]
                parentView.replaceSubview(oldView, with: newView)
                newView.frame = oldView.frame
            }
            YogaLayoutEngine.freeTree(childYoga)
        }
        jsValue.setValue(onChildReplaced, forProperty: "_onChildReplaced")
    }

    /// Add child views by walking the NativeNode children and matching Yoga child nodes.
    private func addChildren(
        _ children: [NativeNode],
        to parent: NSView,
        yogaParent: YGNodeRef
    ) {
        for (i, child) in children.enumerated() {
            guard let childYoga = YGNodeGetChild(yogaParent, i),
                  let childView = buildNSView(node: child, yogaNode: childYoga) else { continue }
            parent.addSubview(childView)
        }
    }

    // MARK: - Style

    static func applyStyle(_ style: [String: String], to view: NSView) {
        view.wantsLayer = true

        if let bg = style["background-color"] {
            view.layer?.backgroundColor = parseColor(bg)?.cgColor
        }
    }

    static func applyTextStyle(_ style: [String: String], to label: NSTextField) {
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

    static func parsePx(_ value: String?) -> CGFloat {
        guard let value = value else { return 0 }
        let trimmed = value.trimmingCharacters(in: .whitespaces)
            .replacingOccurrences(of: "px", with: "")
        return CGFloat(Double(trimmed) ?? 0)
    }

    static func parseColor(_ value: String) -> NSColor? {
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

// MARK: - Live event helpers (read from $elm.listeners on each invocation)

/// Reads `$elm.listeners.click` on each click instead of caching the closure.
class LiveButtonClickHelper: NSObject {
    let jsValue: JSValue  // the $elm JSValue

    init(jsValue: JSValue) {
        self.jsValue = jsValue
    }

    @objc func handleClick() {
        guard let listeners = jsValue.forProperty("listeners"),
              let clickHandler = listeners.forProperty("click"),
              !clickHandler.isUndefined else { return }
        clickHandler.call(withArguments: [])
    }
}

/// Reads `$elm.listeners.click` live for checkbox/radio.
class LiveCheckboxClickHelper: NSObject {
    weak var button: NSButton?
    let jsValue: JSValue

    init(button: NSButton, jsValue: JSValue) {
        self.button = button
        self.jsValue = jsValue
    }

    @objc func handleClick() {
        let isChecked = button?.state == .on
        let event: [String: Any] = ["target": ["checked": isChecked]]
        guard let listeners = jsValue.forProperty("listeners"),
              let clickHandler = listeners.forProperty("click"),
              !clickHandler.isUndefined else { return }
        clickHandler.call(withArguments: [event])
    }
}

/// Reads `$elm.listeners.input` live for text fields.
class LiveTextFieldInputDelegate: NSObject, NSTextFieldDelegate {
    let jsValue: JSValue

    init(jsValue: JSValue) {
        self.jsValue = jsValue
    }

    func controlTextDidChange(_ obj: Notification) {
        guard let textField = obj.object as? NSTextField else { return }
        let event: [String: Any] = ["target": ["value": textField.stringValue]]
        guard let listeners = jsValue.forProperty("listeners"),
              let inputHandler = listeners.forProperty("input"),
              !inputHandler.isUndefined else { return }
        inputHandler.call(withArguments: [event])
    }
}

/// Reads `$elm.listeners.input` live for text views (textarea).
class LiveTextViewInputDelegate: NSObject, NSTextViewDelegate {
    let placeholder: String
    let jsValue: JSValue

    init(placeholder: String, jsValue: JSValue) {
        self.placeholder = placeholder
        self.jsValue = jsValue
    }

    func textDidChange(_ notification: Notification) {
        guard let textView = notification.object as? NSTextView else { return }
        if textView.textColor == .placeholderTextColor {
            textView.string = ""
            textView.textColor = .labelColor
        }
        let event: [String: Any] = ["target": ["value": textView.string]]
        guard let listeners = jsValue.forProperty("listeners"),
              let inputHandler = listeners.forProperty("input"),
              !inputHandler.isUndefined else { return }
        inputHandler.call(withArguments: [event])
    }
}

/// Reads `$elm.listeners.change` live for popup buttons (select).
class LivePopUpButtonChangeHelper: NSObject {
    weak var popUp: NSPopUpButton?
    let jsValue: JSValue

    init(popUp: NSPopUpButton, jsValue: JSValue) {
        self.popUp = popUp
        self.jsValue = jsValue
    }

    @objc func handleChange() {
        let selected = popUp?.titleOfSelectedItem ?? ""
        let event: [String: Any] = ["target": ["value": selected]]
        guard let listeners = jsValue.forProperty("listeners"),
              let changeHandler = listeners.forProperty("change"),
              !changeHandler.isUndefined else { return }
        changeHandler.call(withArguments: [event])
    }
}

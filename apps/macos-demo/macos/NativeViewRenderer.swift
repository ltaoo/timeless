import Cocoa
import JavaScriptCore
import yoga

/// An NSView subclass whose coordinate system origin is top-left,
/// matching Yoga's layout output.
class FlippedView: NSView {
    override var isFlipped: Bool { true }
}

/// Converts a `NativeNode` tree into an AppKit (NSView) hierarchy
/// using Yoga for layout calculation.
enum NativeViewRenderer {

    /// Build an NSView tree from a NativeNode, laid out with Yoga at the given width.
    static func render(_ node: NativeNode, containerWidth: CGFloat) -> NSView? {
        let yogaRoot = YogaLayoutEngine.buildYogaTree(from: node)
        YogaLayoutEngine.calculateLayout(yogaRoot, width: Float(containerWidth))
        let view = buildNSView(node: node, yogaNode: yogaRoot)
        YogaLayoutEngine.freeTree(yogaRoot)
        return view
    }

    // MARK: - View Builder

    private static func buildNSView(node: NativeNode, yogaNode: YGNodeRef) -> NSView? {
        let frame = YogaLayoutEngine.frame(of: yogaNode)

        switch node {
        case .text(let value, let style, let jsValue):
            let label = NSTextField(labelWithString: value)
            label.isEditable = false
            label.isBezeled = false
            label.drawsBackground = false
            label.maximumNumberOfLines = 0
            label.preferredMaxLayoutWidth = frame.width
            applyTextStyle(style, to: label)
            label.frame = frame

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
            let container = FlippedView(frame: frame)
            applyStyle(style, to: container)
            addChildren(children, to: container, yogaParent: yogaNode)
            return container

        case .img(let src, let style):
            let imageView = NSImageView(frame: frame)
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
            return imageView

        case .button(let style, let children, let jsValue):
            let button = NSButton(title: "", target: nil, action: nil)
            button.bezelStyle = .rounded
            button.frame = frame
            applyStyle(style, to: button)
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
            let textField = NSTextField(frame: frame)
            textField.stringValue = value
            textField.placeholderString = placeholder
            textField.isEditable = true
            textField.isBezeled = true
            textField.bezelStyle = .roundedBezel
            applyStyle(style, to: textField)
            applyTextStyle(style, to: textField)
            if let jsValue = jsValue {
                let listeners = jsValue.forProperty("listeners")
                if let inputHandler = listeners?.forProperty("input"), !inputHandler.isUndefined {
                    let delegate = TextFieldInputDelegate(callback: inputHandler)
                    textField.delegate = delegate
                    objc_setAssociatedObject(textField, "inputDelegate", delegate, .OBJC_ASSOCIATION_RETAIN_NONATOMIC)
                }
            }
            return textField

        case .checkbox(let checked, let style, let jsValue):
            let button = NSButton(checkboxWithTitle: "", target: nil, action: nil)
            button.state = checked ? .on : .off
            button.frame = frame
            applyStyle(style, to: button)
            if let jsValue = jsValue {
                let listeners = jsValue.forProperty("listeners")
                if let clickHandler = listeners?.forProperty("click"), !clickHandler.isUndefined {
                    let helper = CheckboxClickHelper(button: button, callback: clickHandler)
                    button.target = helper
                    button.action = #selector(CheckboxClickHelper.handleClick)
                    objc_setAssociatedObject(button, "checkboxHelper", helper, .OBJC_ASSOCIATION_RETAIN_NONATOMIC)
                }
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
            applyStyle(style, to: scrollView)
            scrollView.documentView = textView
            if let jsValue = jsValue {
                let listeners = jsValue.forProperty("listeners")
                if let inputHandler = listeners?.forProperty("input"), !inputHandler.isUndefined {
                    let delegate = TextViewInputDelegate(placeholder: placeholder, callback: inputHandler)
                    textView.delegate = delegate
                    objc_setAssociatedObject(textView, "textViewDelegate", delegate, .OBJC_ASSOCIATION_RETAIN_NONATOMIC)
                }
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
            applyStyle(style, to: textField)
            applyTextStyle(style, to: textField)
            if let jsValue = jsValue {
                let listeners = jsValue.forProperty("listeners")
                if let inputHandler = listeners?.forProperty("input"), !inputHandler.isUndefined {
                    let delegate = TextFieldInputDelegate(callback: inputHandler)
                    textField.delegate = delegate
                    objc_setAssociatedObject(textField, "inputDelegate", delegate, .OBJC_ASSOCIATION_RETAIN_NONATOMIC)
                }
            }
            return textField

        case .radio(let checked, let style, let jsValue):
            let button = NSButton(radioButtonWithTitle: "", target: nil, action: nil)
            button.state = checked ? .on : .off
            button.frame = frame
            applyStyle(style, to: button)
            if let jsValue = jsValue {
                let listeners = jsValue.forProperty("listeners")
                if let clickHandler = listeners?.forProperty("click"), !clickHandler.isUndefined {
                    let helper = CheckboxClickHelper(button: button, callback: clickHandler)
                    button.target = helper
                    button.action = #selector(CheckboxClickHelper.handleClick)
                    objc_setAssociatedObject(button, "radioHelper", helper, .OBJC_ASSOCIATION_RETAIN_NONATOMIC)
                }
            }
            return button

        case .row(let style, let children):
            let container = FlippedView(frame: frame)
            applyStyle(style, to: container)
            addChildren(children, to: container, yogaParent: yogaNode)
            return container

        case .column(let style, let children):
            let container = FlippedView(frame: frame)
            applyStyle(style, to: container)
            addChildren(children, to: container, yogaParent: yogaNode)
            return container

        case .select(let items, let style, let jsValue):
            let popUp = NSPopUpButton(frame: frame, pullsDown: false)
            popUp.addItems(withTitles: items)
            applyStyle(style, to: popUp)
            if let jsValue = jsValue {
                let listeners = jsValue.forProperty("listeners")
                if let changeHandler = listeners?.forProperty("change"), !changeHandler.isUndefined {
                    let helper = PopUpButtonChangeHelper(popUp: popUp, callback: changeHandler)
                    popUp.target = helper
                    popUp.action = #selector(PopUpButtonChangeHelper.handleChange)
                    objc_setAssociatedObject(popUp, "popUpHelper", helper, .OBJC_ASSOCIATION_RETAIN_NONATOMIC)
                }
            }
            return popUp

        case .icon(let name, let color, let size, let style):
            let imageView = NSImageView(frame: frame)
            if #available(macOS 11.0, *) {
                let config = NSImage.SymbolConfiguration(pointSize: size, weight: .regular)
                if let img = NSImage(systemSymbolName: name, accessibilityDescription: nil)?
                    .withSymbolConfiguration(config) {
                    imageView.image = img
                }
            }
            imageView.imageScaling = .scaleProportionallyUpOrDown
            if !color.isEmpty, let c = parseColor(color) {
                imageView.contentTintColor = c
            }
            applyStyle(style, to: imageView)
            return imageView

        case .aspectRatio(_, let style, let children):
            let container = FlippedView(frame: frame)
            container.wantsLayer = true
            container.layer?.masksToBounds = true
            applyStyle(style, to: container)
            addChildren(children, to: container, yogaParent: yogaNode)
            // Images inside aspect-ratio should fill the container
            for subview in container.subviews {
                if let imageView = subview as? NSImageView {
                    imageView.imageScaling = .scaleAxesIndependently
                    imageView.frame = container.bounds
                }
            }
            return container
        }
    }

    /// Add child views by walking the NativeNode children and matching Yoga child nodes.
    private static func addChildren(
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

// MARK: - Checkbox click helper

class CheckboxClickHelper: NSObject {
    weak var button: NSButton?
    let callback: JSValue

    init(button: NSButton, callback: JSValue) {
        self.button = button
        self.callback = callback
    }

    @objc func handleClick() {
        let isChecked = button?.state == .on
        let event: [String: Any] = ["target": ["checked": isChecked]]
        callback.call(withArguments: [event])
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

// MARK: - TextView input delegate (textarea)

class TextViewInputDelegate: NSObject, NSTextViewDelegate {
    let placeholder: String
    let callback: JSValue

    init(placeholder: String, callback: JSValue) {
        self.placeholder = placeholder
        self.callback = callback
    }

    func textDidChange(_ notification: Notification) {
        guard let textView = notification.object as? NSTextView else { return }
        if textView.textColor == .placeholderTextColor {
            textView.string = ""
            textView.textColor = .labelColor
        }
        let event: [String: Any] = ["target": ["value": textView.string]]
        callback.call(withArguments: [event])
    }
}

// MARK: - PopUpButton change helper (select)

class PopUpButtonChangeHelper: NSObject {
    weak var popUp: NSPopUpButton?
    let callback: JSValue

    init(popUp: NSPopUpButton, callback: JSValue) {
        self.popUp = popUp
        self.callback = callback
    }

    @objc func handleChange() {
        let selected = popUp?.titleOfSelectedItem ?? ""
        let event: [String: Any] = ["target": ["value": selected]]
        callback.call(withArguments: [event])
    }
}

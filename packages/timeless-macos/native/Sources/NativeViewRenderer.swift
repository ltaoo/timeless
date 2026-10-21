import Cocoa
import JavaScriptCore
import yoga

/// Converts a `NativeNode` tree into an AppKit (NSView) hierarchy
/// using Yoga for layout calculation. Registers HMR change callbacks
/// on JSValue $elm objects so that property and structural changes
/// propagate to NSViews without a full rebuild.
class NativeViewRenderer {

    /// Reference to the bridge for parsing child JSValues during structural changes.
    private weak var bridge: JSBridge?

    /// The last container width used for layout (needed for relayout).
    private(set) var lastContainerWidth: CGFloat = 0
    private(set) var lastContainerHeight: CGFloat = 0

    /// The root NSView produced by the last `render` call.
    private(set) var rootView: NSView?
    private(set) var floatingLayer: NativeFloatingLayer?
    private let bindings = NSMapTable<NSView, JSValue>.weakToStrongObjects()

    init(bridge: JSBridge) {
        self.bridge = bridge
    }

    // MARK: - Public API

    /// Build an NSView tree from a NativeNode, laid out with Yoga at the given width.
    func render(_ node: NativeNode, containerWidth: CGFloat, containerHeight: CGFloat) -> NSView? {
        lastContainerWidth = containerWidth
        lastContainerHeight = containerHeight
        let yogaRoot = YogaLayoutEngine.buildYogaTree(from: node)
        YogaLayoutEngine.calculateLayout(
            yogaRoot,
            width: Float(containerWidth),
            height: Float(containerHeight)
        )
        let view = buildNSView(node: node, yogaNode: yogaRoot)
        YogaLayoutEngine.freeTree(yogaRoot)
        rootView = view
        if let view = view {
            floatingLayer = NativeFloatingLayer(root: view, renderer: self)
            floatingLayer?.refresh()
        }
        return view
    }

    /// Re-layout existing NSView tree using updated $elm data.
    /// Called after JS patch() modifies the $elm tree.
    func relayout(containerWidth: CGFloat? = nil, containerHeight: CGFloat? = nil) {
        if let width = containerWidth { lastContainerWidth = width }
        if let height = containerHeight { lastContainerHeight = height }
        guard let bridge = bridge,
              let rootJSValue = bridge.rootElmJSValue,
              let rootNode = bridge.parseNode(rootJSValue),
              let rootView = rootView,
              lastContainerWidth > 0,
              lastContainerHeight > 0 else { return }

        let yogaRoot = YogaLayoutEngine.buildYogaTree(from: rootNode)
        YogaLayoutEngine.calculateLayout(
            yogaRoot,
            width: Float(lastContainerWidth),
            height: Float(lastContainerHeight)
        )
        updateFrames(view: rootView, yogaNode: yogaRoot, node: rootNode)
        YogaLayoutEngine.freeTree(yogaRoot)

        // Update the document view height if inside a scroll view
        if let docView = rootView.superview {
            docView.frame.size = rootView.frame.size
        }
        floatingLayer?.refresh()
    }

    // MARK: - Frame Update (Relayout)

    /// Walk NSView + Yoga trees in parallel, updating only frames.
    /// Only recurses into FlippedView containers — native controls (NSButton,
    /// NSImageView, NSTextField, etc.) have internal subviews that must not
    /// be overwritten with Yoga child frames.
    private func updateFrames(view: NSView, yogaNode: YGNodeRef, node: NativeNode) {
        let frame = Self.translatedFrame(YogaLayoutEngine.frame(of: yogaNode), style: node.style)
        view.frame = frame
        view.needsDisplay = true

        if let placeholder = view as? NativeFloatingPlaceholder {
            placeholder.node = node
            return
        }

        synchronizeControl(view, node: node)
        let children = YogaLayoutEngine.nodeChildren(node)
        let container = (view as? NativeScrollView)?.documentView ?? view
        guard container is FlippedView else { return }
        let previous = container.subviews.filter { bindings.object(forKey: $0) != nil }
        var retained: [NSView] = []
        for (index, child) in children.enumerated() {
            guard let childYoga = YGNodeGetChild(yogaNode, index) else { continue }
            let existing = child.javascriptValue.flatMap { js in previous.first { bindings.object(forKey: $0)?.isEqual(to: js) == true } }
            if let childView = existing ?? buildNSView(node: child, yogaNode: childYoga) {
                if childView.superview !== container { container.addSubview(childView) }
                retained.append(childView)
                updateFrames(view: childView, yogaNode: childYoga, node: child)
            }
        }
        for old in previous where !retained.contains(where: { $0 === old }) { old.removeFromSuperview() }
        (view as? NativeScrollView)?.synchronizeDocument()
    }

    private func synchronizeControl(_ view: NSView, node: NativeNode) {
        switch node {
        case .select(let items, _, let js):
            guard let popup = view as? NSPopUpButton, let js = js else { return }
            let placeholder = js.forProperty("placeholder")?.toString() ?? ""
            let titles = (placeholder.isEmpty ? [] : [placeholder]) + items.map { $0.label }
            if popup.itemTitles != titles {
                popup.removeAllItems()
                for (index, title) in titles.enumerated() {
                    popup.menu?.addItem(NSMenuItem(title: title, action: nil, keyEquivalent: ""))
                    let offset = placeholder.isEmpty ? index : index - 1
                    popup.item(at: index)?.representedObject = offset >= 0 ? items[offset].value : ""
                    popup.item(at: index)?.isEnabled = offset >= 0 && !items[offset].disabled
                }
            }
            for (index, item) in items.enumerated() {
                let menuItem = popup.item(at: index + (placeholder.isEmpty ? 0 : 1))
                menuItem?.representedObject = item.value
                menuItem?.isEnabled = !item.disabled
            }
            popup.autoenablesItems = false
            let selected = js.forProperty("value")?.toString() ?? ""
            if let index = items.firstIndex(where: { $0.value == selected }) {
                popup.selectItem(at: index + (placeholder.isEmpty ? 0 : 1))
            } else { popup.selectItem(at: placeholder.isEmpty ? -1 : 0) }
            popup.synchronizeTitleAndSelectedItem()
            let style = js.forProperty("style")?.toDictionary() as? [String: String] ?? [:]
            popup.attributedTitle = NSAttributedString(string: popup.titleOfSelectedItem ?? "", attributes: [
                .font: YogaLayoutEngine.resolveFont(style),
                .foregroundColor: NativeViewRenderer.parseColor(style["color"] ?? "#18181b") ?? NSColor.labelColor,
            ])
            bindControl(popup, jsValue: js)
        case .checkbox(let checked, _, let js), .radio(let checked, _, let js):
            guard let button = view as? NSButton else { return }
            button.state = checked ? .on : .off
            bindControl(button, jsValue: js)
        case .numberInput(let value, _, _, _, let js):
            if let field = view as? NSTextField, field.stringValue != value { field.stringValue = value }
            bindControl(view, jsValue: js)
        case .textarea(let value, _, _, _, let js):
            if let scroll = view as? NSScrollView, let text = scroll.documentView as? NSTextView {
                if text.string != value { text.string = value }
                scroll.tile()
                let size = scroll.contentSize
                text.minSize = NSSize(width: 0, height: size.height)
                text.maxSize = NSSize(width: 1_000_000, height: 1_000_000)
                text.frame.size = NSSize(width: size.width, height: max(size.height, text.frame.height))
                text.textContainer?.containerSize = NSSize(width: size.width, height: 1_000_000)
                text.needsDisplay = true
            }
            bindControl(view, jsValue: js)
        default: break
        }
    }

    private func bindControl(_ view: NSView, jsValue: JSValue?) {
        guard let js = jsValue else { return }
        let attrs = js.forProperty("attrs")
        if let name = attrs?.forProperty("n"), !name.isUndefined { view.identifier = NSUserInterfaceItemIdentifier(name.toString()) }
        if let label = attrs?.forProperty("aria-label"), !label.isUndefined { view.setAccessibilityLabel(label.toString()) }
        let disabled = attrs?.forProperty("disabled")
        let readonly = attrs?.forProperty("readonly")
        let enabled = (disabled == nil || disabled!.isUndefined || disabled!.isNull) && (readonly == nil || readonly!.isUndefined || readonly!.isNull)
        (view as? NSControl)?.isEnabled = enabled
        if let text = (view as? NSScrollView)?.documentView as? NSTextView { text.isEditable = enabled }
        let valueChanged: @convention(block) (String) -> Void = { [weak view] value in
            if let field = view as? NSTextField, field.stringValue != value { field.stringValue = value }
            if let text = (view as? NSScrollView)?.documentView as? NSTextView, text.string != value { text.string = value }
        }
        js.setValue(valueChanged, forProperty: "_onValueChange")
        let styleChanged: @convention(block) (JSValue) -> Void = { [weak view] value in
            guard let view = view else { return }
            let style = value.toDictionary() as? [String: String] ?? [:]
            NativeViewRenderer.applyStyle(style, to: view)
            if let field = view as? NSTextField { NativeViewRenderer.applyTextStyle(style, to: field) }
        }
        js.setValue(styleChanged, forProperty: "_onStyleChange")
    }

    // MARK: - View Builder

    private func buildNSView(node: NativeNode, yogaNode: YGNodeRef) -> NSView? {
        let frame = Self.translatedFrame(YogaLayoutEngine.frame(of: yogaNode), style: node.style)
        let result = buildView(node: node, yogaNode: yogaNode, frame: frame)
        if let view = result {
            if let js = node.javascriptValue { bindings.setObject(js, forKey: view) }
            synchronizeControl(view, node: node)
        }
        return result
    }

    private func buildView(node: NativeNode, yogaNode: YGNodeRef, frame: NSRect) -> NSView? {
        switch node {
        case .floating(let style, let children, let js):
            let content = NativeNode.view(style: style, children: children, jsValue: js)
            let yoga = YogaLayoutEngine.buildYogaTree(from: content)
            YogaLayoutEngine.calculateLayout(yoga, width: Float(lastContainerWidth))
            let surface = buildNSView(node: content, yogaNode: yoga)!
            YogaLayoutEngine.freeTree(yoga)
            surface.isHidden = true
            return NativeFloatingPlaceholder(node: node, surface: surface)
        case .text(let value, let style, let jsValue):
            if let js = jsValue, let document = js.forProperty("richText"), document.isObject, !document.isNull {
                return NativeRichTextView(frame: frame, node: js, style: style)
            }
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
            NativeImageLoader.load(src) { [weak imageView] image in imageView?.image = image }

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
            let button = FlippedView(frame: frame)
            NativeViewRenderer.applyStyle(style, to: button)
            addChildren(children, to: button, yogaParent: yogaNode)
            registerContainerCallbacks(jsValue: jsValue, view: button)
            button.bind(jsValue, button: true)
            return button

        case .input(let value, let placeholder, let style, let jsValue):
            let textField = StyledTextField(frame: frame)
            textField.stringValue = value
            textField.placeholderString = placeholder
            textField.isEditable = true
            textField.isBezeled = false
            textField.drawsBackground = false
            NativeViewRenderer.applyStyle(style, to: textField)
            NativeViewRenderer.applyTextStyle(style, to: textField)
            if let jsValue = jsValue {
                textField.bind(jsValue)
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
            let scrollView = StyledTextareaScrollView(frame: frame)
            scrollView.hasVerticalScroller = true
            scrollView.autohidesScrollers = true
            scrollView.borderType = .noBorder
            scrollView.drawsBackground = false
            scrollView.contentView.drawsBackground = false
            let textView = PlaceholderTextView(frame: NSRect(origin: .zero, size: frame.size))
            textView.placeholder = placeholder
            textView.string = value
            textView.isEditable = !disabled
            textView.isRichText = false
            textView.font = .systemFont(ofSize: 14)
            textView.textColor = NativeViewRenderer.parseColor(style["color"] ?? "#18181b")
            textView.font = YogaLayoutEngine.resolveFont(style)
            textView.drawsBackground = false
            textView.textContainerInset = NSSize(width: NativeViewRenderer.parsePx(style["padding-left"]), height: NativeViewRenderer.parsePx(style["padding-top"]))
            textView.textContainer?.lineFragmentPadding = 0
            textView.isVerticallyResizable = true
            textView.autoresizingMask = [.width]
            textView.textContainer?.widthTracksTextView = true
            NativeViewRenderer.applyStyle(style, to: scrollView)
            scrollView.documentView = textView
            if let jsValue = jsValue {
                let delegate = LiveTextViewInputDelegate(placeholder: placeholder, jsValue: jsValue)
                textView.delegate = delegate
                objc_setAssociatedObject(textView, "textViewDelegate", delegate, .OBJC_ASSOCIATION_RETAIN_NONATOMIC)
            }
            return scrollView

        case .numberInput(let value, let placeholder, let disabled, let style, let jsValue):
            let textField = StyledTextField(frame: frame)
            textField.stringValue = value
            textField.placeholderString = placeholder
            textField.isEditable = !disabled
            textField.isBezeled = false
            textField.drawsBackground = false
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

        case .select(_, let style, let jsValue):
            let popUp = StyledPopUpButton(frame: frame, pullsDown: false)
            popUp.isBordered = false
            NativeViewRenderer.applyStyle(style, to: popUp)
            if let jsValue = jsValue {
                let helper = LivePopUpButtonChangeHelper(popUp: popUp, jsValue: jsValue)
                popUp.target = helper
                popUp.action = #selector(LivePopUpButtonChangeHelper.handleChange)
                objc_setAssociatedObject(popUp, "popUpHelper", helper, .OBJC_ASSOCIATION_RETAIN_NONATOMIC)
            }
            return popUp

        case .icon(let name, let svg, let color, let size, let style, let jsValue):
            let imageView = NSImageView(frame: frame)
            NativeIconLoader.apply(to: imageView, name: name, svg: svg, color: color, size: size, style: style)

            if let jsValue = jsValue {
                let attrs = jsValue.forProperty("attrs")
                if let name = attrs?.forProperty("n"), !name.isUndefined { imageView.identifier = NSUserInterfaceItemIdentifier(name.toString()) }
                if let label = attrs?.forProperty("aria-label"), !label.isUndefined { imageView.setAccessibilityLabel(label.toString()) }
                if attrs?.forProperty("aria-hidden")?.toString() == "true" { imageView.setAccessibilityElement(false) }
                let update = { [weak imageView] in
                    guard let view = imageView else { return }
                    let style = jsValue.forProperty("style")?.toDictionary() as? [String: String] ?? [:]
                    let svg = jsValue.forProperty("svg")
                    NativeIconLoader.apply(
                        to: view,
                        name: jsValue.forProperty("name")?.toString() ?? "",
                        svg: svg == nil || svg!.isNull || svg!.isUndefined ? nil : svg!.toString(),
                        color: jsValue.forProperty("color")?.toString() ?? "currentColor",
                        size: CGFloat(jsValue.forProperty("size")?.toDouble() ?? 24),
                        style: style
                    )
                }
                let onStyleChange: @convention(block) (JSValue) -> Void = { _ in update() }
                let onIconChange: @convention(block) () -> Void = { update() }
                jsValue.setValue(onStyleChange, forProperty: "_onStyleChange")
                jsValue.setValue(onIconChange, forProperty: "_onIconChange")
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

        case .splitView(let direction, let defaultSizes, let minSizes, let maxSizes, let dividerStyle, let children, let jsValue):
            let splitView = NSSplitView(frame: frame)
            splitView.isVertical = direction == "horizontal"
            splitView.dividerStyle = .thin
            splitView.autoresizingMask = [.width, .height]
            
            // Build child views with Yoga layout
            var childViews: [NSView] = []
            for (i, child) in children.enumerated() {
                guard let childYoga = YGNodeGetChild(yogaNode, i) else { continue }
                if let childView = buildNSView(node: child, yogaNode: childYoga) {
                    childViews.append(childView)
                    splitView.addSubview(childView)
                }
            }
            
            // Set initial positions after all subviews are added
            if childViews.count >= 2 {
                let total = direction == "horizontal" ? frame.width : frame.height
                let firstSize = defaultSizes.first ?? 0
                let lastSize = defaultSizes.last ?? 0
                let position = firstSize > 0
                    ? min(firstSize, total)
                    : max(0, total - lastSize)
                splitView.setPosition(position, ofDividerAt: 0)
            }
            
            // Store min/max constraints via associated object
            objc_setAssociatedObject(splitView, "minSizes", minSizes, .OBJC_ASSOCIATION_RETAIN_NONATOMIC)
            objc_setAssociatedObject(splitView, "maxSizes", maxSizes, .OBJC_ASSOCIATION_RETAIN_NONATOMIC)
            objc_setAssociatedObject(splitView, "defaultSizes", defaultSizes, .OBJC_ASSOCIATION_RETAIN_NONATOMIC)
            
            if let jsValue = jsValue {
                let onResize: @convention(block) (JSValue) -> Void = { [weak splitView] sizesJS in
                    guard let splitView = splitView else { return }
                    guard let sizes = sizesJS.toArray() else { return }
                    for (i, item) in sizes.enumerated() {
                        if i == 0 {
                            if let sizeValue = item as? NSNumber {
                                let size = CGFloat(sizeValue.doubleValue)
                                splitView.setPosition(splitView.bounds.width * size / 100, ofDividerAt: 0)
                            }
                        }
                    }
                }
                jsValue.setValue(onResize, forProperty: "_onResize")
            }
            
            return splitView

        case .splitPane(let size, let minSize, let maxSize, let collapsible, let collapsedSize, let children, let jsValue):
            let container = FlippedView(frame: frame)
            container.wantsLayer = true
            NativeViewRenderer.applyStyle(["width": "\(frame.width)px", "height": "\(frame.height)px"], to: container)
            addChildren(children, to: container, yogaParent: yogaNode)
            registerContainerCallbacks(jsValue: jsValue, view: container)
            return container

        case .scrollView(let horizontal, let vertical, let children, let jsValue):
            let scrollView = NativeScrollView(frame: frame)
            scrollView.bind(jsValue)
            NativeViewRenderer.applyStyle(jsValue?.forProperty("style")?.toDictionary() as? [String: String] ?? [:], to: scrollView)
            scrollView.hasVerticalScroller = vertical != "hidden"
            scrollView.hasHorizontalScroller = horizontal != "hidden"
            scrollView.autohidesScrollers = true
            scrollView.autoresizingMask = [.width, .height]
            scrollView.drawsBackground = false
            
            let contentContainer = FlippedView(frame: NSRect(x: 0, y: 0, width: frame.width, height: frame.height))
            addChildren(children, to: contentContainer, yogaParent: yogaNode)
            scrollView.documentView = contentContainer
            
            registerContainerCallbacks(jsValue: jsValue, view: scrollView, contentView: contentContainer)
            scrollView.synchronizeDocument()
            return scrollView

        case .tabView(let activeIndex, let position, let children, let jsValue):
            let container = FlippedView(frame: frame)
            container.wantsLayer = true
            
            // Tab bar at top
            let tabBar = NSTabView(frame: NSRect(x: 0, y: 0, width: frame.width, height: frame.height))
            tabBar.tabViewType = .topTabsBezelBorder
            tabBar.controlSize = .regular
            
            // Add tab view items for each child
            for (i, child) in children.enumerated() {
                let tabItem = NSTabViewItem(identifier: i)
                let contentView = FlippedView(frame: NSRect(x: 0, y: 0, width: frame.width - 20, height: frame.height - 30))
                
                // Get child node for yoga layout
                var childNode = child
                if case .tabPane(_, _, let tabChildren, _) = child {
                    if let firstChild = tabChildren.first {
                        childNode = firstChild
                    }
                }
                
                if let childYoga = YGNodeGetChild(yogaNode, i) {
                    addChildren([childNode], to: contentView, yogaParent: childYoga)
                }
                
                tabItem.view = contentView
                
                // Get label from tab-pane child
                if case .tabPane(let label, _, _, _) = child {
                    tabItem.label = label
                } else {
                    tabItem.label = "Tab \(i + 1)"
                }
                
                tabBar.addTabViewItem(tabItem)
            }
            
            // Set active tab
            if activeIndex < tabBar.numberOfTabViewItems {
                tabBar.selectTabViewItem(at: activeIndex)
            }
            
            container.addSubview(tabBar)
            tabBar.frame = container.bounds
            tabBar.autoresizingMask = [.width, .height]
            
            registerContainerCallbacks(jsValue: jsValue, view: container)
            return container

        case .tabPane(_, _, let children, let jsValue):
            let container = FlippedView(frame: frame)
            container.wantsLayer = true
            addChildren(children, to: container, yogaParent: yogaNode)
            registerContainerCallbacks(jsValue: jsValue, view: container)
            return container
        }
    }

    // MARK: - Container Callbacks (structural + style)

    func layoutFloatingSurface(_ placeholder: NativeFloatingPlaceholder, available: NSSize) {
        guard case .floating(var style, let children, let js) = placeholder.node else { return }
        let maxWidth = max(0, available.width - 32)
        style["max-width"] = "\(min(maxWidth, style["max-width"].map { NativeViewRenderer.parsePx($0) } ?? maxWidth))px"
        style["max-height"] = "\(max(0, available.height - 32))px"
        let node = NativeNode.view(style: style, children: children, jsValue: js)
        let yoga = YogaLayoutEngine.buildYogaTree(from: node)
        YogaLayoutEngine.calculateLayout(yoga, width: Float.nan)
        updateFrames(view: placeholder.surface, yogaNode: yoga, node: node)
        YogaLayoutEngine.freeTree(yoga)
    }

    /// Register `_onStyleChange`, `_onChildInserted`, `_onChildRemoved`, `_onChildReplaced`
    /// on container JSValues (view, row, column, aspectRatio).
    private func registerContainerCallbacks(jsValue: JSValue?, view: NSView, contentView: NSView? = nil) {
        guard let jsValue = jsValue else { return }
        let container = contentView ?? view
        (view as? FlippedView)?.bind(jsValue)

        let onStyleChange: @convention(block) (JSValue) -> Void = { [weak view] styleJS in
            guard let view = view else { return }
            let style = styleJS.toDictionary() as? [String: String] ?? [:]
            NativeViewRenderer.applyStyle(style, to: view)
        }
        jsValue.setValue(onStyleChange, forProperty: "_onStyleChange")

        let onChildInserted: @convention(block) (Int, JSValue) -> Void = { [weak self, weak container] index, childJS in
            guard let self = self, let parentView = container else { return }
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

        let onChildRemoved: @convention(block) (Int) -> Void = { [weak container] index in
            guard let parentView = container else { return }
            if index < parentView.subviews.count {
                parentView.subviews[index].removeFromSuperview()
            }
        }
        jsValue.setValue(onChildRemoved, forProperty: "_onChildRemoved")

        let onChildReplaced: @convention(block) (Int, JSValue) -> Void = { [weak self, weak container] index, newChildJS in
            guard let self = self, let parentView = container else { return }
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

    static func translatedFrame(_ frame: CGRect, style: [String: String]) -> CGRect {
        let values = (style["translate"] ?? "none").split(whereSeparator: { $0.isWhitespace }).map(String.init)
        guard !values.isEmpty, values[0] != "none" else { return frame }
        func offset(_ value: String, extent: CGFloat) -> CGFloat {
            if value.hasSuffix("%"), let percent = Double(value.dropLast()) { return extent * percent / 100 }
            return parsePx(value)
        }
        return frame.offsetBy(dx: offset(values[0], extent: frame.width), dy: values.count > 1 ? offset(values[1], extent: frame.height) : 0)
    }

    static func applyStyle(_ style: [String: String], to view: NSView) {
        (view as? StyledTextField)?.applyContentStyle(style)
        (view as? StyledPopUpButton)?.contentStyle = style
        view.wantsLayer = true
        if style["display"] == "contents" { view.clipsToBounds = false; view.layer?.masksToBounds = false }
        view.layer?.backgroundColor = parseColor(style["background-color"] ?? style["background"] ?? "transparent")?.cgColor
        view.layer?.borderColor = parseColor(style["border-color"] ?? "black")?.cgColor
        view.layer?.borderWidth = parsePx(style["border-width"])
        let radius = parsePx(style["border-radius"])
        if let flipped = view as? FlippedView { flipped.applyCornerRadius(radius) }
        else { view.layer?.cornerRadius = min(max(0, radius), max(0, min(view.bounds.width, view.bounds.height) / 2)) }
        (view as? FlippedView)?.applyOutlineStyle(style)
        (view as? FlippedView)?.applyBoxShadowStyle(style)
        view.alphaValue = CGFloat(Double(style["opacity"] ?? "1") ?? 1)
        view.isHidden = style["display"] == "none" || view.superview is NativeFloatingPlaceholder
    }

    static func applyTextStyle(_ style: [String: String], to label: NSTextField) {
        label.font = YogaLayoutEngine.resolveFont(style)
        if label is StyledTextField, let placeholder = label.placeholderAttributedString?.string ?? label.placeholderString {
            label.placeholderAttributedString = NSAttributedString(string: placeholder, attributes: [.font: label.font!, .foregroundColor: NSColor.gray])
        }
        label.alignment = style["text-align"] == "center" ? .center : style["text-align"] == "right" ? .right : .left

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
        switch value.lowercased() {
        case "transparent": return .clear
        case "black": return .black
        case "white": return .white
        default: break
        }
        guard value.hasPrefix("#") else { return nil }
        var hex = String(value.dropFirst())
        if hex.count == 3 || hex.count == 4 { hex = hex.map { "\($0)\($0)" }.joined() }
        if hex.count == 6 { hex += "ff" }
        guard hex.count == 8, let rgba = UInt64(hex, radix: 16) else { return nil }
        return NSColor(
            srgbRed: CGFloat((rgba >> 24) & 0xFF) / 255.0,
            green: CGFloat((rgba >> 16) & 0xFF) / 255.0,
            blue: CGFloat((rgba >> 8) & 0xFF) / 255.0,
            alpha: CGFloat(rgba & 0xFF) / 255.0
        )
    }
}

// MARK: - Live event helpers (read from $elm.listeners on each invocation)

/// Checkbox/radio dispatch the shared click and change events.
class LiveCheckboxClickHelper: NSObject {
    weak var button: NSButton?
    let jsValue: JSValue

    init(button: NSButton, jsValue: JSValue) {
        self.button = button
        self.jsValue = jsValue
    }

    @objc func handleClick() {
        let isChecked = button?.state == .on
        jsValue.setObject(isChecked, forKeyedSubscript: "checked" as NSString)
        jsValue.forProperty("_dispatchNativeEvent")?.call(withArguments: ["click", [:]])
        jsValue.forProperty("_dispatchNativeEvent")?.call(withArguments: ["change", [:]])
    }
}

/// Reads `$elm.listeners.input` live for text fields.
class LiveTextFieldInputDelegate: NSObject, NSTextFieldDelegate {
    let jsValue: JSValue

    init(jsValue: JSValue) {
        self.jsValue = jsValue
    }

    func controlTextDidBeginEditing(_ obj: Notification) {
        jsValue.forProperty("_setStyleState")?.call(withArguments: ["focus", true])
        jsValue.forProperty("_dispatchNativeEvent")?.call(withArguments: ["focus", [:]])
    }

    func controlTextDidEndEditing(_ obj: Notification) {
        jsValue.forProperty("_setStyleState")?.call(withArguments: ["focus", false])
        jsValue.forProperty("_dispatchNativeEvent")?.call(withArguments: ["blur", [:]])
    }

    func controlTextDidChange(_ obj: Notification) {
        guard let textField = obj.object as? NSTextField else { return }
        let event: [String: Any] = ["target": ["value": textField.stringValue]]
        jsValue.setValue(textField.stringValue, forProperty: "value")
        let listeners = jsValue.forProperty("listeners")
        for type in ["input", "change"] {
            if let handler = listeners?.forProperty(type), handler.isObject { handler.call(withArguments: [event]) }
        }
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
        jsValue.setValue(textView.string, forProperty: "value")
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
        let selected = popUp?.selectedItem?.representedObject as? String ?? ""
        jsValue.setValue(selected, forProperty: "value")
        let event: [String: Any] = ["target": ["value": selected]]
        guard let listeners = jsValue.forProperty("listeners"),
              let changeHandler = listeners.forProperty("change"),
              !changeHandler.isUndefined else { return }
        changeHandler.call(withArguments: [event])
    }
}

private final class PlaceholderTextView: NSTextView {
    var placeholder = ""
    override func draw(_ dirtyRect: NSRect) {
        super.draw(dirtyRect)
        if string.isEmpty && !placeholder.isEmpty {
            (placeholder as NSString).draw(at: NSPoint(x: textContainerInset.width, y: textContainerInset.height), withAttributes: [.font: font ?? NSFont.systemFont(ofSize: 14), .foregroundColor: NSColor.gray])
        }
    }
    override var string: String {
        didSet { needsDisplay = true }
    }
}

private final class StyledTextareaScrollView: NSScrollView {
    override func draw(_ dirtyRect: NSRect) {
        super.draw(dirtyRect)
        guard let layer = layer, layer.borderWidth > 0, let color = layer.borderColor else { return }
        NSColor(cgColor: color)?.setStroke()
        let path = NSBezierPath(roundedRect: bounds.insetBy(dx: layer.borderWidth / 2, dy: layer.borderWidth / 2), xRadius: layer.cornerRadius, yRadius: layer.cornerRadius)
        path.lineWidth = layer.borderWidth
        path.stroke()
    }

    override func tile() {
        super.tile()
        let border = layer?.borderWidth ?? 0
        contentView.frame = contentView.frame.insetBy(dx: border, dy: border)
    }
}

/// Keep AppKit's menu, keyboard handling and accessibility while class styles paint the trigger.
private final class StyledPopUpButton: NSPopUpButton {
    var contentStyle: [String: String] = [:]

    override func draw(_ dirtyRect: NSRect) {
        let font = YogaLayoutEngine.resolveFont(contentStyle)
        let color = NativeViewRenderer.parseColor(contentStyle["color"] ?? "#18181b") ?? NSColor.labelColor
        let lineHeight = ceil(font.ascender - font.descender + font.leading)
        let left = NativeViewRenderer.parsePx(contentStyle["padding-left"])
        let textRect = NSRect(x: left, y: (bounds.height - lineHeight) / 2, width: max(0, bounds.width - left - 30), height: lineHeight)
        ((titleOfSelectedItem ?? "") as NSString).draw(in: textRect, withAttributes: [.font: font, .foregroundColor: color])
        color.setStroke()
        let arrow = NSBezierPath()
        let direction: CGFloat = isFlipped ? 1 : -1
        arrow.move(to: NSPoint(x: bounds.maxX - 19, y: bounds.midY - 2 * direction))
        arrow.line(to: NSPoint(x: bounds.maxX - 15, y: bounds.midY + 2 * direction))
        arrow.line(to: NSPoint(x: bounds.maxX - 11, y: bounds.midY - 2 * direction))
        arrow.lineWidth = 1
        arrow.stroke()
    }
}

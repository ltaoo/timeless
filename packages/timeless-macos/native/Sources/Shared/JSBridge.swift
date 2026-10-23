import Foundation
import JavaScriptCore

/// Describes a node in the virtual view tree returned by JS.
/// Holds onto the original JSValue so that native can register callbacks
/// (e.g. `_onContentChange`, `_onStyleChange`) that the JS reactive system will invoke.
struct NativeSelectItem {
    let value: String
    let label: String
    let disabled: Bool
}

enum NativeNode {
    case floating(style: [String: String], children: [NativeNode], jsValue: JSValue?)
    case view(style: [String: String], children: [NativeNode], jsValue: JSValue?)
    case text(value: String, style: [String: String], jsValue: JSValue?)
    case img(src: String, style: [String: String], jsValue: JSValue?)
    case button(style: [String: String], children: [NativeNode], jsValue: JSValue?)
    case input(value: String, placeholder: String, style: [String: String], jsValue: JSValue?)
    case checkbox(checked: Bool, style: [String: String], jsValue: JSValue?)
    case textarea(value: String, placeholder: String, disabled: Bool, style: [String: String], jsValue: JSValue?)
    case numberInput(value: String, placeholder: String, disabled: Bool, style: [String: String], jsValue: JSValue?)
    case radio(checked: Bool, style: [String: String], jsValue: JSValue?)
    case row(style: [String: String], children: [NativeNode], jsValue: JSValue?)
    case column(style: [String: String], children: [NativeNode], jsValue: JSValue?)
    case select(items: [NativeSelectItem], style: [String: String], jsValue: JSValue?)
    case icon(name: String, svg: String?, color: String, size: CGFloat, style: [String: String], jsValue: JSValue?)
    case aspectRatio(ratio: CGFloat, style: [String: String], children: [NativeNode], jsValue: JSValue?)
    case splitView(direction: String, defaultSizes: [CGFloat], minSizes: [CGFloat], maxSizes: [CGFloat], dividerStyle: String, children: [NativeNode], jsValue: JSValue?)
    case splitPane(size: CGFloat, minSize: CGFloat, maxSize: CGFloat, collapsible: Bool, collapsedSize: CGFloat, children: [NativeNode], jsValue: JSValue?)
    case scrollView(horizontal: String, vertical: String, children: [NativeNode], jsValue: JSValue?)
    case tabView(activeIndex: Int, position: String, children: [NativeNode], jsValue: JSValue?)
    case tabPane(label: String, icon: String, children: [NativeNode], jsValue: JSValue?)

    var style: [String: String] {
        switch self {
        case .floating(let style, _, _), .view(let style, _, _), .button(let style, _, _),
             .row(let style, _, _), .column(let style, _, _): return style
        case .text(_, let style, _), .img(_, let style, _), .checkbox(_, let style, _),
             .radio(_, let style, _), .select(_, let style, _): return style
        case .input(_, _, let style, _), .aspectRatio(_, let style, _, _): return style
        case .textarea(_, _, _, let style, _), .numberInput(_, _, _, let style, _): return style
        case .icon(_, _, _, _, let style, _): return style
        case .splitView(_, _, _, _, _, _, let js), .splitPane(_, _, _, _, _, _, let js),
             .scrollView(_, _, _, let js), .tabView(_, _, _, let js), .tabPane(_, _, _, let js):
            return js?.forProperty("style")?.toDictionary() as? [String: String] ?? [:]
        }
    }

    var javascriptValue: JSValue? {
        switch self {
        case .floating(_, _, let js), .view(_, _, let js), .text(_, _, let js),
             .img(_, _, let js), .button(_, _, let js), .checkbox(_, _, let js),
             .radio(_, _, let js), .row(_, _, let js), .column(_, _, let js), .select(_, _, let js): return js
        case .input(_, _, _, let js), .aspectRatio(_, _, _, let js),
             .scrollView(_, _, _, let js), .tabView(_, _, _, let js), .tabPane(_, _, _, let js): return js
        case .textarea(_, _, _, _, let js), .numberInput(_, _, _, _, let js): return js
        case .icon(_, _, _, _, _, let js): return js
        case .splitView(_, _, _, _, _, _, let js), .splitPane(_, _, _, _, _, _, let js): return js
        }
    }
}

/// Bridge between JavaScriptCore and native rendering.
/// Loads the timeless + timeless-native UMD bundles, executes the app script,
/// and converts the resulting virtual tree into `NativeNode` for the platform renderer.
class JSBridge {

    private let ctx: JSContext
    private(set) var runtimeErrors: [String] = []

    /// File path for dev mode; nil = load from app bundle (production).
    let devScriptPath: String?

    /// Called whenever JS sends a new view tree via `__nativeBridge_render`.
    var onRender: ((NativeNode) -> Void)?

    /// Called when JS requests relayout after HMR patch.
    var onRelayout: (() -> Void)?

    var prefersDarkMode: (() -> Bool)?
    var onDarkModeChange: ((Bool) -> Void)?

    /// The root $elm JSValue — stored for relayout (re-parsing into NativeNode).
    private(set) var rootElmJSValue: JSValue?

    // Timer management — allows cleanup on HMR reload
    private var timerItems: [Int: DispatchWorkItem] = [:]
    private var intervalActive: [Int: Bool] = [:]
    // JavaScript Numbers cannot round-trip random 64-bit timer IDs for cancellation.
    private var timerId = 0

    init(devScriptPath: String? = nil) {
        self.devScriptPath = devScriptPath
        ctx = JSContext()!
        setupContext()
        setupNativeHMR()
        setupRenderBridge()
        setupRelayoutBridge()
        setupAppearanceBridge()
    }

    /// Evaluate the app script. Call `onRender` before this to capture the initial tree.
    func run() {
        if let devPath = devScriptPath {
            loadScriptFromFile(devPath, label: "app (dev)")
        } else {
            loadScript(resource: "app", label: "app")
        }
    }

    /// Hot-reload: clear timers, re-evaluate the script. Refs restore via __native_hmr.
    func reload() {
        guard let devPath = devScriptPath else { return }
        let refCount = ctx.evaluateScript("Object.keys(globalThis.__native_hmr.data.__hmr_refs).length")?.toInt32() ?? 0
        print("[HMR] Clearing timers, \(refCount) refs preserved")
        clearAllTimers()
        loadScriptFromFile(devPath, label: "app (hmr)")
    }

    // MARK: - Private Setup

    /// Provide `globalThis.__native_hmr` for reactive state preservation across reloads.
    private func setupNativeHMR() {
        ctx.evaluateScript("""
            if (!globalThis.__native_hmr) {
                globalThis.__native_hmr = { data: { __hmr_refs: {} } };
            }
        """)
    }

    /// Register the `__nativeBridge_render` callback that JS calls to send the view tree.
    private func setupRenderBridge() {
        let renderBlock: @convention(block) (JSValue) -> Void = { [weak self] jsTree in
            self?.rootElmJSValue = jsTree
            if let node = self?.parseNode(jsTree) {
                self?.onRender?(node)
            }
        }
        ctx.setObject(renderBlock, forKeyedSubscript: "__nativeBridge_render" as NSString)
    }

    /// Register `__nativeBridge_relayout` — called by JS after patch() to trigger Yoga re-layout.
    private func setupRelayoutBridge() {
        let relayoutBlock: @convention(block) () -> Void = { [weak self] in
            self?.onRelayout?()
        }
        ctx.setObject(relayoutBlock, forKeyedSubscript: "__nativeBridge_relayout" as NSString)
    }

    private func setupAppearanceBridge() {
        let prefersDark: @convention(block) () -> Bool = { [weak self] in
            self?.prefersDarkMode?() ?? false
        }
        let setDark: @convention(block) (Bool) -> Void = { [weak self] dark in
            self?.onDarkModeChange?(dark)
        }
        ctx.setObject(prefersDark, forKeyedSubscript: "__nativeBridge_prefersDarkMode" as NSString)
        ctx.setObject(setDark, forKeyedSubscript: "__nativeBridge_setDarkMode" as NSString)
    }

    private func setupContext() {
        ctx.exceptionHandler = { [weak self] _, exception in
            self?.runtimeErrors.append(exception?.toString() ?? "Unknown JavaScript exception")
        }
        // Provide console.log/error/warn
        let consoleLog: @convention(block) (String) -> Void = { msg in
            print("[JS]", msg)
        }
        ctx.setObject(consoleLog, forKeyedSubscript: "__consoleLog" as NSString)
        ctx.evaluateScript("""
            var console = {
                log: __consoleLog,
                error: __consoleLog,
                warn: __consoleLog
            };
        """)

        // Inject __Version global that timeless-native expects
        ctx.evaluateScript("var __Version = '0.1.0';")

        // Polyfill timer APIs — use real dispatch-based timers with cancel support

        let setTimeoutBlock: @convention(block) (JSValue, JSValue) -> Int = { [weak self] callback, ms in
            guard let self = self else { return 0 }
            let delay = ms.toInt32()
            self.timerId += 1
            let id = self.timerId
            let workItem = DispatchWorkItem { [weak self] in
                self?.timerItems.removeValue(forKey: id)
                callback.call(withArguments: [])
                if let ex = self?.ctx.exception {
                    print("[JS timer] error:", ex.toString() ?? "")
                    self?.ctx.exception = nil
                }
            }
            self.timerItems[id] = workItem
            DispatchQueue.main.asyncAfter(deadline: .now() + .milliseconds(Int(delay)), execute: workItem)
            return id
        }
        ctx.setObject(setTimeoutBlock, forKeyedSubscript: "setTimeout" as NSString)

        let clearTimeoutBlock: @convention(block) (Int) -> Void = { [weak self] id in
            self?.timerItems[id]?.cancel()
            self?.timerItems.removeValue(forKey: id)
        }
        ctx.setObject(clearTimeoutBlock, forKeyedSubscript: "clearTimeout" as NSString)

        let setIntervalBlock: @convention(block) (JSValue, JSValue) -> Int = { [weak self] callback, ms in
            guard let bridge = self else { return 0 }
            let interval = max(Int(ms.toInt32()), 16)
            bridge.timerId += 1
            let id = bridge.timerId
            bridge.intervalActive[id] = true
            func tick() {
                guard self?.intervalActive[id] == true else { return }
                DispatchQueue.main.asyncAfter(deadline: .now() + .milliseconds(interval)) {
                    guard self?.intervalActive[id] == true else { return }
                    callback.call(withArguments: [])
                    tick()
                }
            }
            tick()
            return id
        }
        ctx.setObject(setIntervalBlock, forKeyedSubscript: "setInterval" as NSString)

        let clearIntervalBlock: @convention(block) (Int) -> Void = { [weak self] id in
            self?.intervalActive[id] = false
            self?.intervalActive.removeValue(forKey: id)
        }
        ctx.setObject(clearIntervalBlock, forKeyedSubscript: "clearInterval" as NSString)

        let queueMicrotaskBlock: @convention(block) (JSValue) -> Void = { callback in
            callback.call(withArguments: [])
        }
        ctx.setObject(queueMicrotaskBlock, forKeyedSubscript: "queueMicrotask" as NSString)
    }

    /// Cancel all pending timers and intervals (called before HMR reload).
    private func clearAllTimers() {
        for (_, item) in timerItems {
            item.cancel()
        }
        timerItems.removeAll()
        for id in intervalActive.keys {
            intervalActive[id] = false
        }
        intervalActive.removeAll()
    }

    private func loadScript(resource: String, label: String) {
        guard let url = Bundle.main.url(forResource: resource, withExtension: "js") else {
            print("[JSBridge] \(label) bundle not found: \(resource).js")
            return
        }
        guard let js = try? String(contentsOf: url) else {
            print("[JSBridge] Failed to read \(label) bundle")
            return
        }
        ctx.evaluateScript(js)
        if let exception = ctx.exception {
            print("[JSBridge] \(label) error:", exception.toString() ?? "unknown")
            ctx.exception = nil
        }
    }

    private func loadScriptFromFile(_ path: String, label: String) {
        guard let js = try? String(contentsOfFile: path, encoding: .utf8) else {
            print("[JSBridge] Failed to read \(label): \(path)")
            return
        }
        ctx.evaluateScript(js)
        if let exception = ctx.exception {
            print("[JSBridge] \(label) error:", exception.toString() ?? "unknown")
            ctx.exception = nil
        }
    }

    /// Parse a JSValue tree into NativeNode. Internal so NativeViewRenderer can call it.
    func parseNode(_ value: JSValue) -> NativeNode? {
        guard value.isObject, !value.isNull else { return nil }
        // Read only node fields: converting the whole tree follows parent links on every node.
        func property(_ key: String) -> Any? {
            guard let item = value.forProperty(key), !item.isUndefined, !item.isNull else { return nil }
            return item.toObject()
        }
        let type = property("type") as? String ?? ""

        if type == "floating" {
            return .floating(style: property("style") as? [String: String] ?? [:], children: parseChildren(value), jsValue: value)
        }

        if type == "text" {
            let text = property("value") as? String ?? ""
            let style = property("style") as? [String: String] ?? [:]
            return .text(value: text, style: style, jsValue: value)
        }

        if ["for", "fragment", "show", "match", "lazy-view", "portal"].contains(type) {
            var style = property("style") as? [String: String] ?? [:]
            style["display"] = style["display"] ?? "contents"
            return .view(style: style, children: parseChildren(value), jsValue: value)
        }

        if type == "view" || type == "label" || type == "form" || type == "table" || type.hasPrefix("table-") {
            let style = property("style") as? [String: String] ?? [:]
            let children = parseChildren(value)
            return .view(style: style, children: children, jsValue: value)
        }

        if type == "img" {
            let src = property("src") as? String ?? ""
            let style = property("style") as? [String: String] ?? [:]
            return .img(src: src, style: style, jsValue: value)
        }

        if type == "button" {
            let style = property("style") as? [String: String] ?? [:]
            let children = parseChildren(value)
            return .button(style: style, children: children, jsValue: value)
        }

        if type == "input" {
            let inputValue = property("value") as? String ?? ""
            let placeholder = property("placeholder") as? String ?? ""
            let style = property("style") as? [String: String] ?? [:]
            return .input(value: inputValue, placeholder: placeholder, style: style, jsValue: value)
        }

        if type == "checkbox" {
            let checked = property("checked") as? Bool ?? false
            let style = property("style") as? [String: String] ?? [:]
            return .checkbox(checked: checked, style: style, jsValue: value)
        }

        if type == "textarea" {
            let textValue = property("value") as? String ?? ""
            let placeholder = property("placeholder") as? String ?? ""
            let disabled = property("disabled") as? Bool ?? false
            let style = property("style") as? [String: String] ?? [:]
            return .textarea(value: textValue, placeholder: placeholder, disabled: disabled, style: style, jsValue: value)
        }

        if type == "number-input" {
            let numValue = property("value") as? String ?? ""
            let placeholder = property("placeholder") as? String ?? ""
            let disabled = property("disabled") as? Bool ?? false
            let style = property("style") as? [String: String] ?? [:]
            return .numberInput(value: numValue, placeholder: placeholder, disabled: disabled, style: style, jsValue: value)
        }

        if type == "radio" {
            let checked = property("checked") as? Bool ?? false
            let style = property("style") as? [String: String] ?? [:]
            return .radio(checked: checked, style: style, jsValue: value)
        }

        if type == "row" {
            let style = property("style") as? [String: String] ?? [:]
            let children = parseChildren(value)
            return .row(style: style, children: children, jsValue: value)
        }

        if type == "column" {
            let style = property("style") as? [String: String] ?? [:]
            let children = parseChildren(value)
            return .column(style: style, children: children, jsValue: value)
        }

        if type == "select" {
            let style = property("style") as? [String: String] ?? [:]
            var items: [NativeSelectItem] = []
            func collect(_ node: JSValue) {
                if node.forProperty("type")?.toString() == "select-option" {
                    let disabled = node.forProperty("attrs")?.forProperty("disabled")
                    items.append(NativeSelectItem(
                        value: node.forProperty("value")?.toString() ?? "",
                        label: node.forProperty("label")?.toString() ?? "",
                        disabled: disabled != nil && !disabled!.isUndefined && !disabled!.isNull
                    ))
                    return
                }
                guard let children = node.forProperty("children"), children.isArray else { return }
                for index in 0..<Int(children.forProperty("length").toInt32()) {
                    if let child = children.atIndex(index) { collect(child) }
                }
            }
            collect(value)
            return .select(items: items, style: style, jsValue: value)
        }

        if type == "icon" {
            let name = property("name") as? String ?? ""
            let color = property("color") as? String ?? ""
            let size: CGFloat
            if let s = property("size") as? Double { size = CGFloat(s) }
            else if let s = property("size") as? Int { size = CGFloat(s) }
            else { size = 24 }
            let style = property("style") as? [String: String] ?? [:]
            return .icon(name: name, svg: property("svg") as? String, color: color, size: size, style: style, jsValue: value)
        }

        if type == "aspect-ratio" {
            let style = property("style") as? [String: String] ?? [:]
            let ratio: CGFloat
            if let r = value.forProperty("ratio"), !r.isUndefined {
                ratio = CGFloat(r.toDouble())
            } else {
                ratio = 16.0 / 9.0
            }
            let children = parseChildren(value)
            return .aspectRatio(ratio: ratio, style: style, children: children, jsValue: value)
        }

        if type == "split-view" {
            let style = property("style") as? [String: String] ?? [:]
            let direction = property("direction") as? String ?? "horizontal"
            let defaultSizes: [CGFloat]
            if let sizes = property("defaultSizes") as? [Double] {
                defaultSizes = sizes.map { CGFloat($0) }
            } else if let sizes = property("defaultSizes") as? Double {
                defaultSizes = [CGFloat(sizes), 100 - CGFloat(sizes)]
            } else {
                defaultSizes = [50, 50]
            }
            let minSizes: [CGFloat]
            if let sizes = property("minSizes") as? [Double] {
                minSizes = sizes.map { CGFloat($0) }
            } else if let size = property("minSize") as? Double {
                minSizes = [CGFloat(size), CGFloat(size)]
            } else {
                minSizes = [10, 10]
            }
            let maxSizes: [CGFloat]
            if let sizes = property("maxSizes") as? [Double] {
                maxSizes = sizes.map { CGFloat($0) }
            } else if let size = property("maxSize") as? Double {
                maxSizes = [CGFloat(size), CGFloat(size)]
            } else {
                maxSizes = [90, 90]
            }
            let dividerStyle = property("dividerStyle") as? String ?? "thin"
            let children = parseChildren(value)
            return .splitView(direction: direction, defaultSizes: defaultSizes, minSizes: minSizes, maxSizes: maxSizes, dividerStyle: dividerStyle, children: children, jsValue: value)
        }

        if type == "split-pane" {
            let style = property("style") as? [String: String] ?? [:]
            let size = property("size") as? CGFloat ?? 50
            let minSize = property("minSize") as? CGFloat ?? 10
            let maxSize = property("maxSize") as? CGFloat ?? 90
            let collapsible = property("collapsible") as? Bool ?? false
            let collapsedSize = property("collapsedSize") as? CGFloat ?? 0
            let children = parseChildren(value)
            return .splitPane(size: size, minSize: minSize, maxSize: maxSize, collapsible: collapsible, collapsedSize: collapsedSize, children: children, jsValue: value)
        }

        if type == "scroll-view" || type == "list-view-v2" {
            let horizontal = property("horizontal") as? String ?? "auto"
            let vertical = property("vertical") as? String ?? "auto"
            let children = type == "list-view-v2" ? [] : parseChildren(value)
            return .scrollView(horizontal: horizontal, vertical: vertical, children: children, jsValue: value)
        }

        if type == "tab-view" {
            let activeIndex = property("activeIndex") as? Int ?? 0
            let position = property("position") as? String ?? "top"
            let children = parseChildren(value)
            return .tabView(activeIndex: activeIndex, position: position, children: children, jsValue: value)
        }

        if type == "tab-pane" {
            let label = property("label") as? String ?? ""
            let icon = property("icon") as? String ?? ""
            let children = parseChildren(value)
            return .tabPane(label: label, icon: icon, children: children, jsValue: value)
        }

        return nil
    }

    private func parseChildren(_ value: JSValue) -> [NativeNode] {
        if let style = value.forProperty("style"), style.isObject,
           style.forProperty("display")?.toString() == "none" { return [] }
        var children: [NativeNode] = []
        guard let jsChildren = value.forProperty("children"), jsChildren.isArray else { return children }
        let length = Int(jsChildren.forProperty("length").toInt32())
        for i in 0..<length {
            guard let child = jsChildren.atIndex(i) else { continue }
            // Transparent logical containers must not create zero-size mouse hit regions.
            if let childType = child.forProperty("type")?.toString(),
               childType == "for" || childType == "fragment" || childType == "show" {
                children.append(contentsOf: parseChildren(child))
                continue
            }
            if let node = parseNode(child) {
                children.append(node)
            }
        }
        return children
    }
}

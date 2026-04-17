import Foundation
import JavaScriptCore

/// Describes a node in the virtual view tree returned by JS.
/// Holds onto the original JSValue so that native can register callbacks
/// (e.g. `_onContentChange`, `_onStyleChange`) that the JS reactive system will invoke.
enum NativeNode {
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
    case select(items: [String], style: [String: String], jsValue: JSValue?)
    case icon(name: String, color: String, size: CGFloat, style: [String: String], jsValue: JSValue?)
    case aspectRatio(ratio: CGFloat, style: [String: String], children: [NativeNode], jsValue: JSValue?)
    case splitView(direction: String, defaultSizes: [CGFloat], minSizes: [CGFloat], maxSizes: [CGFloat], dividerStyle: String, children: [NativeNode], jsValue: JSValue?)
    case splitPane(size: CGFloat, minSize: CGFloat, maxSize: CGFloat, collapsible: Bool, collapsedSize: CGFloat, children: [NativeNode], jsValue: JSValue?)
    case scrollView(horizontal: String, vertical: String, children: [NativeNode], jsValue: JSValue?)
    case tabView(activeIndex: Int, position: String, children: [NativeNode], jsValue: JSValue?)
    case tabPane(label: String, icon: String, children: [NativeNode], jsValue: JSValue?)
}

/// Bridge between JavaScriptCore and native rendering.
/// Loads the timeless + timeless-native UMD bundles, executes the app script,
/// and converts the resulting virtual tree into `NativeNode` for the platform renderer.
class JSBridge {

    private let ctx: JSContext

    /// File path for dev mode; nil = load from app bundle (production).
    let devScriptPath: String?

    /// Called whenever JS sends a new view tree via `__nativeBridge_render`.
    var onRender: ((NativeNode) -> Void)?

    /// Called when JS requests relayout after HMR patch.
    var onRelayout: (() -> Void)?

    /// The root $elm JSValue — stored for relayout (re-parsing into NativeNode).
    private(set) var rootElmJSValue: JSValue?

    // Timer management — allows cleanup on HMR reload
    private var timerItems: [Int: DispatchWorkItem] = [:]
    private var intervalActive: [Int: Bool] = [:]

    init(devScriptPath: String? = nil) {
        self.devScriptPath = devScriptPath
        ctx = JSContext()!
        setupContext()
        setupNativeHMR()
        setupRenderBridge()
        setupRelayoutBridge()
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

    private func setupContext() {
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
            let id = Int.random(in: 1...Int.max)
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
            guard self != nil else { return 0 }
            let interval = max(Int(ms.toInt32()), 16)
            let id = Int.random(in: 1...Int.max)
            self?.intervalActive[id] = true
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
        guard let dict = value.toDictionary() else { return nil }

        let type = dict["type"] as? String ?? ""

        if type == "text" {
            let text = dict["value"] as? String ?? ""
            let style = dict["style"] as? [String: String] ?? [:]
            return .text(value: text, style: style, jsValue: value)
        }

        if type == "view" {
            let style = dict["style"] as? [String: String] ?? [:]
            var children: [NativeNode] = []
            if let jsChildren = value.forProperty("children"), jsChildren.isArray {
                let length = Int(jsChildren.forProperty("length").toInt32())
                for i in 0..<length {
                    guard let childJSValue = jsChildren.atIndex(i) else { continue }
                    if let node = parseNode(childJSValue) {
                        children.append(node)
                    }
                }
            }
            return .view(style: style, children: children, jsValue: value)
        }

        if type == "img" {
            let src = dict["src"] as? String ?? ""
            let style = dict["style"] as? [String: String] ?? [:]
            return .img(src: src, style: style, jsValue: value)
        }

        if type == "button" {
            let style = dict["style"] as? [String: String] ?? [:]
            var children: [NativeNode] = []
            if let jsChildren = value.forProperty("children"), jsChildren.isArray {
                let length = Int(jsChildren.forProperty("length").toInt32())
                for i in 0..<length {
                    guard let childJSValue = jsChildren.atIndex(i) else { continue }
                    if let node = parseNode(childJSValue) {
                        children.append(node)
                    }
                }
            }
            return .button(style: style, children: children, jsValue: value)
        }

        if type == "input" {
            let inputValue = dict["value"] as? String ?? ""
            let placeholder = dict["placeholder"] as? String ?? ""
            let style = dict["style"] as? [String: String] ?? [:]
            return .input(value: inputValue, placeholder: placeholder, style: style, jsValue: value)
        }

        if type == "checkbox" {
            let checked = dict["checked"] as? Bool ?? false
            let style = dict["style"] as? [String: String] ?? [:]
            return .checkbox(checked: checked, style: style, jsValue: value)
        }

        if type == "textarea" {
            let textValue = dict["value"] as? String ?? ""
            let placeholder = dict["placeholder"] as? String ?? ""
            let disabled = dict["disabled"] as? Bool ?? false
            let style = dict["style"] as? [String: String] ?? [:]
            return .textarea(value: textValue, placeholder: placeholder, disabled: disabled, style: style, jsValue: value)
        }

        if type == "number-input" {
            let numValue = dict["value"] as? String ?? ""
            let placeholder = dict["placeholder"] as? String ?? ""
            let disabled = dict["disabled"] as? Bool ?? false
            let style = dict["style"] as? [String: String] ?? [:]
            return .numberInput(value: numValue, placeholder: placeholder, disabled: disabled, style: style, jsValue: value)
        }

        if type == "radio" {
            let checked = dict["checked"] as? Bool ?? false
            let style = dict["style"] as? [String: String] ?? [:]
            return .radio(checked: checked, style: style, jsValue: value)
        }

        if type == "row" {
            let style = dict["style"] as? [String: String] ?? [:]
            let children = parseChildren(value)
            return .row(style: style, children: children, jsValue: value)
        }

        if type == "column" {
            let style = dict["style"] as? [String: String] ?? [:]
            let children = parseChildren(value)
            return .column(style: style, children: children, jsValue: value)
        }

        if type == "select" {
            let style = dict["style"] as? [String: String] ?? [:]
            var items: [String] = []
            for child in parseChildren(value) {
                switch child {
                case .text(let label, _, _):
                    items.append(label)
                case .view(_, let viewChildren, _):
                    for viewChild in viewChildren {
                        if case .text(let label, _, _) = viewChild {
                            items.append(label)
                            break
                        }
                    }
                default:
                    break
                }
            }
            return .select(items: items, style: style, jsValue: value)
        }

        if type == "icon" {
            let name = dict["name"] as? String ?? ""
            let color = dict["color"] as? String ?? ""
            let size: CGFloat
            if let s = dict["size"] as? Double { size = CGFloat(s) }
            else if let s = dict["size"] as? Int { size = CGFloat(s) }
            else { size = 24 }
            let style = dict["style"] as? [String: String] ?? [:]
            return .icon(name: name, color: color, size: size, style: style, jsValue: value)
        }

        if type == "aspect-ratio" {
            let style = dict["style"] as? [String: String] ?? [:]
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
            let style = dict["style"] as? [String: String] ?? [:]
            let direction = dict["direction"] as? String ?? "horizontal"
            let defaultSizes: [CGFloat]
            if let sizes = dict["defaultSizes"] as? [Double] {
                defaultSizes = sizes.map { CGFloat($0) }
            } else if let sizes = dict["defaultSizes"] as? Double {
                defaultSizes = [CGFloat(sizes), 100 - CGFloat(sizes)]
            } else {
                defaultSizes = [50, 50]
            }
            let minSizes: [CGFloat]
            if let sizes = dict["minSizes"] as? [Double] {
                minSizes = sizes.map { CGFloat($0) }
            } else if let size = dict["minSize"] as? Double {
                minSizes = [CGFloat(size), CGFloat(size)]
            } else {
                minSizes = [10, 10]
            }
            let maxSizes: [CGFloat]
            if let sizes = dict["maxSizes"] as? [Double] {
                maxSizes = sizes.map { CGFloat($0) }
            } else if let size = dict["maxSize"] as? Double {
                maxSizes = [CGFloat(size), CGFloat(size)]
            } else {
                maxSizes = [90, 90]
            }
            let dividerStyle = dict["dividerStyle"] as? String ?? "thin"
            let children = parseChildren(value)
            return .splitView(direction: direction, defaultSizes: defaultSizes, minSizes: minSizes, maxSizes: maxSizes, dividerStyle: dividerStyle, children: children, jsValue: value)
        }

        if type == "split-pane" {
            let style = dict["style"] as? [String: String] ?? [:]
            let size = dict["size"] as? CGFloat ?? 50
            let minSize = dict["minSize"] as? CGFloat ?? 10
            let maxSize = dict["maxSize"] as? CGFloat ?? 90
            let collapsible = dict["collapsible"] as? Bool ?? false
            let collapsedSize = dict["collapsedSize"] as? CGFloat ?? 0
            let children = parseChildren(value)
            return .splitPane(size: size, minSize: minSize, maxSize: maxSize, collapsible: collapsible, collapsedSize: collapsedSize, children: children, jsValue: value)
        }

        if type == "scroll-view" {
            let horizontal = dict["horizontal"] as? String ?? "auto"
            let vertical = dict["vertical"] as? String ?? "auto"
            let children = parseChildren(value)
            return .scrollView(horizontal: horizontal, vertical: vertical, children: children, jsValue: value)
        }

        if type == "tab-view" {
            let activeIndex = dict["activeIndex"] as? Int ?? 0
            let position = dict["position"] as? String ?? "top"
            let children = parseChildren(value)
            return .tabView(activeIndex: activeIndex, position: position, children: children, jsValue: value)
        }

        if type == "tab-pane" {
            let label = dict["label"] as? String ?? ""
            let icon = dict["icon"] as? String ?? ""
            let children = parseChildren(value)
            return .tabPane(label: label, icon: icon, children: children, jsValue: value)
        }

        return nil
    }

    private func parseChildren(_ value: JSValue) -> [NativeNode] {
        var children: [NativeNode] = []
        guard let jsChildren = value.forProperty("children"), jsChildren.isArray else { return children }
        let length = Int(jsChildren.forProperty("length").toInt32())
        for i in 0..<length {
            guard let child = jsChildren.atIndex(i) else { continue }
            // Flatten transparent logical containers (For, Fragment) into their parent's children
            if let childDict = child.toDictionary(),
               let childType = childDict["type"] as? String,
               childType == "for" || childType == "fragment" {
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

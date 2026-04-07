import Foundation
import JavaScriptCore

/// Describes a node in the virtual view tree returned by JS.
/// Holds onto the original JSValue so that native can register callbacks
/// (e.g. `_onContentChange`) that the JS reactive system will invoke.
enum NativeNode {
    case view(style: [String: String], children: [NativeNode])
    case text(value: String, style: [String: String], jsValue: JSValue?)
    case img(src: String, style: [String: String])
    case button(style: [String: String], children: [NativeNode], jsValue: JSValue?)
    case input(value: String, placeholder: String, style: [String: String], jsValue: JSValue?)
}

/// Bridge between JavaScriptCore and native rendering.
/// Loads the timeless + timeless-native UMD bundles, executes the app script,
/// and converts the resulting virtual tree into `NativeNode` for the platform renderer.
class JSBridge {

    private let ctx: JSContext

    init() {
        ctx = JSContext()!
        setupContext()
    }

    /// Run the bundled JS and return the root NativeNode tree.
    func run() -> NativeNode {
        var rootNode: NativeNode = .text(value: "", style: [:], jsValue: nil)

        // Bridge: JS calls __nativeBridge_render(tree) to send the view tree to native
        let onRender: @convention(block) (JSValue) -> Void = { [weak self] jsTree in
            if let node = self?.parseNode(jsTree) {
                rootNode = node
            }
        }
        ctx.setObject(onRender, forKeyedSubscript: "__nativeBridge_render" as NSString)

        // Load the single bundled app script (includes timeless + timeless-native)
        loadScript(resource: "app", label: "app")

        return rootNode
    }

    // MARK: - Private

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

        // Polyfill timer APIs — use real dispatch-based timers
        let setTimeoutBlock: @convention(block) (JSValue, JSValue) -> Int = { [weak self] callback, ms in
            guard let ctx = self?.ctx else { return 0 }
            let delay = ms.toInt32()
            let id = Int.random(in: 1...Int.max)
            DispatchQueue.main.asyncAfter(deadline: .now() + .milliseconds(Int(delay))) {
                callback.call(withArguments: [])
                // Check for exception
                if let ex = ctx.exception {
                    print("[JS timer] error:", ex.toString() ?? "")
                    ctx.exception = nil
                }
            }
            return id
        }
        ctx.setObject(setTimeoutBlock, forKeyedSubscript: "setTimeout" as NSString)

        let clearTimeoutBlock: @convention(block) (Int) -> Void = { _ in }
        ctx.setObject(clearTimeoutBlock, forKeyedSubscript: "clearTimeout" as NSString)

        let setIntervalBlock: @convention(block) (JSValue, JSValue) -> Int = { [weak self] callback, ms in
            guard self?.ctx != nil else { return 0 }
            let interval = max(Int(ms.toInt32()), 16)
            let id = Int.random(in: 1...Int.max)
            func tick() {
                DispatchQueue.main.asyncAfter(deadline: .now() + .milliseconds(interval)) {
                    callback.call(withArguments: [])
                    tick()
                }
            }
            tick()
            return id
        }
        ctx.setObject(setIntervalBlock, forKeyedSubscript: "setInterval" as NSString)

        let clearIntervalBlock: @convention(block) (Int) -> Void = { _ in }
        ctx.setObject(clearIntervalBlock, forKeyedSubscript: "clearInterval" as NSString)

        let queueMicrotaskBlock: @convention(block) (JSValue) -> Void = { callback in
            callback.call(withArguments: [])
        }
        ctx.setObject(queueMicrotaskBlock, forKeyedSubscript: "queueMicrotask" as NSString)
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

    /// Parse a JSValue tree into NativeNode.
    private func parseNode(_ value: JSValue) -> NativeNode? {
        guard let dict = value.toDictionary() else { return nil }

        let type = dict["type"] as? String ?? ""

        if type == "text" {
            let text = dict["value"] as? String ?? ""
            let style = dict["style"] as? [String: String] ?? [:]
            // Keep the JSValue reference so we can register _onContentChange later
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
            return .view(style: style, children: children)
        }

        if type == "img" {
            let src = dict["src"] as? String ?? ""
            let style = dict["style"] as? [String: String] ?? [:]
            return .img(src: src, style: style)
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

        return nil
    }
}

import Foundation
import JavaScriptCore

/// Describes a node in the virtual view tree returned by JS.
enum NativeNode {
    case view(style: [String: String], children: [NativeNode])
    case text(value: String)
}

/// Bridge between JavaScriptCore and native rendering.
/// Loads the timeless + timeless-native UMD bundles, executes an app script,
/// and converts the resulting virtual tree into `NativeNode` for the platform renderer.
class JSBridge {

    private let ctx: JSContext

    init() {
        ctx = JSContext()!
        setupContext()
    }

    /// Run the bundled JS and return the root NativeNode tree.
    func run() -> NativeNode {
        var rootNode: NativeNode = .text(value: "")

        // Bridge: JS calls __nativeBridge_render(tree) to send the view tree to native
        let onRender: @convention(block) (JSValue) -> Void = { [weak self] jsTree in
            if let node = self?.parseNode(jsTree) {
                rootNode = node
            }
        }
        ctx.setObject(onRender, forKeyedSubscript: "__nativeBridge_render" as NSString)

        // 1. Load timeless core (includes base, reactive, primitive, etc.)
        loadScript(resource: "timeless.umd.min", label: "timeless")

        // 2. Bridge namespace: native UMD expects Timeless.Primitive.isElement
        ctx.evaluateScript("""
            if (typeof Timeless !== 'undefined') {
                Timeless.Primitive = {
                    isElement: function(v) {
                        if (v === null || v === undefined) return false;
                        return !!(v.t && v.hasOwnProperty('$elm'));
                    }
                };
            }
        """)

        // 3. Load timeless-native renderer
        loadScript(resource: "timeless.native.umd.min", label: "timeless-native")

        // 4. Load app entry script
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

        // Polyfill timer APIs that JSCore doesn't provide
        ctx.evaluateScript("""
            var __timerId = 0;
            function setTimeout(fn, ms) { __timerId++; fn(); return __timerId; }
            function clearTimeout(id) {}
            function setInterval(fn, ms) { __timerId++; return __timerId; }
            function clearInterval(id) {}
            function queueMicrotask(fn) { fn(); }
        """)
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
            return .text(value: text)
        }

        if type == "view" {
            let style = dict["style"] as? [String: String] ?? [:]
            var children: [NativeNode] = []
            if let jsChildren = dict["children"] as? [[String: Any]] {
                for child in jsChildren {
                    let childValue = JSValue(object: child, in: value.context)!
                    if let node = parseNode(childValue) {
                        children.append(node)
                    }
                }
            }
            return .view(style: style, children: children)
        }

        return nil
    }
}

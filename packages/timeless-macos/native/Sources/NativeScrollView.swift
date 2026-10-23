import Cocoa
import JavaScriptCore

/// AppKit owns live scrolling; Timeless issues explicit programmatic scroll requests.
class NativeScrollView: NSScrollView {
    var jsNode: JSValue?
    private var observer: NSObjectProtocol?
    var synchronizing = false
    private var lastMetrics: [CGFloat] = []
    private var synchronizedDocumentSize: NSSize?
    private var synchronizedViewportSize: NSSize?

    func bind(_ node: JSValue?) {
        jsNode = node
        if let name = node?.forProperty("attrs")?.forProperty("n"), !name.isUndefined {
            identifier = NSUserInterfaceItemIdentifier(name.toString())
        }
        contentView.postsBoundsChangedNotifications = true
        let rect: @convention(block) () -> [String: CGFloat] = { [weak self] in
            guard let self = self else { return [:] }
            let frame = self.convert(self.bounds, to: self.window?.contentView)
            return ["x": frame.minX, "y": frame.minY, "top": frame.minY, "left": frame.minX, "right": frame.maxX, "bottom": frame.maxY, "width": frame.width, "height": frame.height]
        }
        node?.setObject(rect, forKeyedSubscript: "_getBoundingClientRect" as NSString)
        observer = NotificationCenter.default.addObserver(forName: NSView.boundsDidChangeNotification, object: contentView, queue: .main) { [weak self] _ in
            guard let self = self, !self.synchronizing else { return }
            self.publishScrollMetrics()
        }
    }

    func publishScrollMetrics() {
        let point = contentView.bounds.origin
        let size = documentView?.frame.size ?? .zero
        let metrics = [point.x, point.y, contentSize.width, contentSize.height, size.width, size.height]
        jsNode?.setValue(point.x, forProperty: "scrollLeft")
        jsNode?.setValue(point.y, forProperty: "scrollTop")
        jsNode?.setValue(contentSize.width, forProperty: "clientWidth")
        jsNode?.setValue(contentSize.height, forProperty: "clientHeight")
        jsNode?.setValue(size.width, forProperty: "scrollWidth")
        jsNode?.setValue(size.height, forProperty: "scrollHeight")
        guard metrics != lastMetrics else { return }
        lastMetrics = metrics
        if let handler = jsNode?.forProperty("listeners")?.forProperty("scroll"), handler.isObject {
            handler.call(withArguments: [["scrollTop": point.y, "scrollLeft": point.x, "clientHeight": contentSize.height, "scrollHeight": size.height]])
        }
    }

    func synchronizeDocument() {
        guard let document = documentView else { return }
        synchronizing = true
        defer { synchronizing = false; publishScrollMetrics() }
        let extent = document.subviews.filter { !$0.isHidden }.reduce(CGRect.zero) { $0.union($1.frame) }
        let explicitWidth = jsNode?.forProperty("contentWidth")
        let explicitHeight = jsNode?.forProperty("contentHeight")
        let width = explicitWidth?.isNumber == true ? CGFloat(explicitWidth!.toDouble()) : extent.maxX
        let height = explicitHeight?.isNumber == true ? CGFloat(explicitHeight!.toDouble()) : extent.maxY
        let size = NSSize(width: max(contentSize.width, width), height: max(contentSize.height, height))
        if document.frame.size != size { document.frame.size = size }
        synchronizeScrollPosition()
    }

    func synchronizeScrollPosition() {
        guard let document = documentView else { return }
        let geometryChanged = synchronizedDocumentSize != document.frame.size || synchronizedViewportSize != contentSize
        synchronizedDocumentSize = document.frame.size
        synchronizedViewportSize = contentSize
        let request = jsNode?.forProperty("scrollRequest")
        let hasRequest = request?.isObject == true && request?.isNull == false
        // Native overscroll coordinates are observations, not commands to clamp on each layout.
        guard hasRequest || geometryChanged else { return }
        func coordinate(_ key: String, fallback: CGFloat) -> CGFloat {
            guard hasRequest, let value = request?.forProperty(key), value.isNumber else { return fallback }
            let number = value.toDouble()
            return number.isFinite ? CGFloat(number) : 0
        }
        let origin = contentView.bounds.origin
        let x = coordinate("left", fallback: origin.x)
        let y = coordinate("top", fallback: origin.y)
        if hasRequest { jsNode?.setValue(NSNull(), forProperty: "scrollRequest") }
        let point = NSPoint(x: max(0, min(x, document.frame.width - contentSize.width)), y: max(0, min(y, document.frame.height - contentSize.height)))
        if point != origin {
            contentView.scroll(to: point)
            reflectScrolledClipView(contentView)
        }
    }

    deinit {
        if let observer = observer { NotificationCenter.default.removeObserver(observer) }
    }
}

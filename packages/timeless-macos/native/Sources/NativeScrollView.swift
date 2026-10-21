import Cocoa
import JavaScriptCore

/// Timeless owns scroll coordinates; AppKit supplies clipping and wheel/trackpad scrolling.
final class NativeScrollView: NSScrollView {
    private var jsNode: JSValue?
    private var observer: NSObjectProtocol?
    private var synchronizing = false

    func bind(_ node: JSValue?) {
        jsNode = node
        if let name = node?.forProperty("attrs")?.forProperty("n"), !name.isUndefined {
            identifier = NSUserInterfaceItemIdentifier(name.toString())
        }
        contentView.postsBoundsChangedNotifications = true
        observer = NotificationCenter.default.addObserver(forName: NSView.boundsDidChangeNotification, object: contentView, queue: .main) { [weak self] _ in
            guard let self = self, !self.synchronizing else { return }
            let point = self.contentView.bounds.origin
            self.jsNode?.setValue(point.y, forProperty: "scrollTop")
            self.jsNode?.setValue(point.x, forProperty: "scrollLeft")
            if let handler = self.jsNode?.forProperty("listeners")?.forProperty("scroll"), handler.isObject {
                handler.call(withArguments: [["scrollTop": point.y, "scrollLeft": point.x]])
            }
        }
    }

    func synchronizeDocument() {
        guard let document = documentView else { return }
        synchronizing = true
        defer { synchronizing = false }
        let extent = document.subviews.filter { !$0.isHidden }.reduce(CGRect.zero) { $0.union($1.frame) }
        let explicitWidth = jsNode?.forProperty("contentWidth")
        let explicitHeight = jsNode?.forProperty("contentHeight")
        let width = explicitWidth?.isNumber == true ? CGFloat(explicitWidth!.toDouble()) : extent.maxX
        let height = explicitHeight?.isNumber == true ? CGFloat(explicitHeight!.toDouble()) : extent.maxY
        document.frame.size = NSSize(width: max(contentSize.width, width), height: max(contentSize.height, height))
        jsNode?.setValue(document.frame.width, forProperty: "scrollWidth")
        jsNode?.setValue(document.frame.height, forProperty: "scrollHeight")
        let x = jsNode?.forProperty("scrollLeft")?.toDouble() ?? 0
        let y = jsNode?.forProperty("scrollTop")?.toDouble() ?? 0
        let point = NSPoint(x: max(0, min(x, document.frame.width - contentSize.width)), y: max(0, min(y, document.frame.height - contentSize.height)))
        contentView.scroll(to: point)
        reflectScrolledClipView(contentView)
        jsNode?.setValue(point.x, forProperty: "scrollLeft")
        jsNode?.setValue(point.y, forProperty: "scrollTop")
    }

    deinit {
        if let observer = observer { NotificationCenter.default.removeObserver(observer) }
    }
}

import Cocoa

/// A root view that resigns first responder when clicking on empty areas.
private class ClickableView: FlippedView {
    override var acceptsFirstResponder: Bool { true }

    override func mouseDown(with event: NSEvent) {
        window?.makeFirstResponder(self)
        super.mouseDown(with: event)
    }
}

class RootViewController: NSViewController {
    private let bridge = JSBridge()
    private var rootNode: NativeNode?
    private var scrollView: NSScrollView?

    override func loadView() {
        view = ClickableView(frame: NSRect(x: 0, y: 0, width: 800, height: 560))
    }

    override func viewDidLoad() {
        super.viewDidLoad()

        rootNode = bridge.run()

        let scroll = NSScrollView(frame: view.bounds)
        scroll.hasVerticalScroller = true
        scroll.autohidesScrollers = true
        scroll.drawsBackground = false
        scroll.autoresizingMask = [.width, .height]
        view.addSubview(scroll)
        scrollView = scroll

        renderLayout()
    }

    override func viewDidLayout() {
        super.viewDidLayout()
        renderLayout()
    }

    override func viewDidAppear() {
        super.viewDidAppear()
        view.window?.makeFirstResponder(view)
    }

    private func renderLayout() {
        guard let rootNode = rootNode, let scroll = scrollView else { return }

        let containerWidth = scroll.contentSize.width
        guard containerWidth > 0 else { return }

        guard let rendered = NativeViewRenderer.render(rootNode, containerWidth: containerWidth) else { return }

        // Replace existing document view content
        let docView = FlippedView(frame: NSRect(
            x: 0, y: 0,
            width: containerWidth,
            height: rendered.frame.height
        ))
        docView.addSubview(rendered)
        scroll.documentView = docView
    }
}

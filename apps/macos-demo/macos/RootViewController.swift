import Cocoa

/// A root view that resigns first responder when clicking on empty areas.
private class ClickableView: NSView {
    override var acceptsFirstResponder: Bool { true }

    override func mouseDown(with event: NSEvent) {
        window?.makeFirstResponder(self)
        super.mouseDown(with: event)
    }
}

class RootViewController: NSViewController {
    private let bridge = JSBridge()
    private var scrollView: NSScrollView?
    private var docWidthConstraint: NSLayoutConstraint?

    override func loadView() {
        view = ClickableView(frame: NSRect(x: 0, y: 0, width: 800, height: 560))
    }

    override func viewDidLoad() {
        super.viewDidLoad()

        let nativeView = bridge.run()

        guard let nsView = NativeViewRenderer.render(nativeView) else { return }

        let scroll = NSScrollView()
        scroll.hasVerticalScroller = true
        scroll.autohidesScrollers = true
        scroll.drawsBackground = false
        scroll.translatesAutoresizingMaskIntoConstraints = false
        nsView.translatesAutoresizingMaskIntoConstraints = false
        scroll.documentView = nsView

        view.addSubview(scroll)
        NSLayoutConstraint.activate([
            scroll.topAnchor.constraint(equalTo: view.topAnchor),
            scroll.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            scroll.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            scroll.bottomAnchor.constraint(equalTo: view.bottomAnchor),
            nsView.topAnchor.constraint(equalTo: scroll.contentView.topAnchor),
            nsView.leadingAnchor.constraint(equalTo: scroll.contentView.leadingAnchor),
        ])

        // Width is set as a constant so it's never zero at startup.
        // viewDidLayout() keeps it in sync with the actual visible width.
        let widthConstraint = nsView.widthAnchor.constraint(equalToConstant: view.bounds.width)
        widthConstraint.isActive = true
        docWidthConstraint = widthConstraint
        scrollView = scroll
    }

    override func viewDidLayout() {
        super.viewDidLayout()
        // Sync document view width to the scroll view's visible content area.
        if let scroll = scrollView {
            docWidthConstraint?.constant = scroll.contentSize.width
        }
    }

    override func viewDidAppear() {
        super.viewDidAppear()
        view.window?.makeFirstResponder(view)
    }
}

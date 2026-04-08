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

    override func loadView() {
        view = ClickableView(frame: NSRect(x: 0, y: 0, width: 600, height: 400))
    }

    override func viewDidLoad() {
        super.viewDidLoad()

        let nativeView = bridge.run()

        if let nsView = NativeViewRenderer.render(nativeView) {
            nsView.translatesAutoresizingMaskIntoConstraints = false
            view.addSubview(nsView)
            NSLayoutConstraint.activate([
                nsView.topAnchor.constraint(equalTo: view.topAnchor),
                nsView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
                nsView.trailingAnchor.constraint(equalTo: view.trailingAnchor),
                nsView.bottomAnchor.constraint(equalTo: view.bottomAnchor),
            ])
        }
    }

    override func viewDidAppear() {
        super.viewDidAppear()
        // Prevent auto-focus on the first text field
        view.window?.makeFirstResponder(view)
    }
}

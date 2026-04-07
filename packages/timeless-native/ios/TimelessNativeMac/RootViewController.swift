import Cocoa

class RootViewController: NSViewController {
    private let bridge = JSBridge()

    override func loadView() {
        view = NSView(frame: NSRect(x: 0, y: 0, width: 480, height: 320))
    }

    override func viewDidLoad() {
        super.viewDidLoad()

        let nativeView = bridge.run()

        if let nsView = NativeViewRenderer.render(nativeView) {
            nsView.translatesAutoresizingMaskIntoConstraints = false
            view.addSubview(nsView)
            NSLayoutConstraint.activate([
                nsView.centerXAnchor.constraint(equalTo: view.centerXAnchor),
                nsView.centerYAnchor.constraint(equalTo: view.centerYAnchor),
            ])
        }
    }
}

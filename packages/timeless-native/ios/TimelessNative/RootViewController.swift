import UIKit

/// The root view controller that hosts the native view tree
/// produced by the JS runtime bridge.
class RootViewController: UIViewController {
    private let bridge = JSBridge()

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = .white

        // Execute the JS bundle and get the native view tree back
        let nativeView = bridge.run()

        // Mount the native view tree into UIKit
        if let uiView = NativeViewRenderer.render(nativeView) {
            uiView.translatesAutoresizingMaskIntoConstraints = false
            view.addSubview(uiView)
            NSLayoutConstraint.activate([
                uiView.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor),
                uiView.leadingAnchor.constraint(equalTo: view.safeAreaLayoutGuide.leadingAnchor),
                uiView.trailingAnchor.constraint(equalTo: view.safeAreaLayoutGuide.trailingAnchor),
            ])
        }
    }
}

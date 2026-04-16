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
    private let bridge: JSBridge
    private let renderer: NativeViewRenderer
    private var rootNode: NativeNode?
    private var scrollView: NSScrollView?
    private var pollTimer: Timer?
    private var lastModifiedDate: Date?

    init(devScriptPath: String? = nil) {
        bridge = JSBridge(devScriptPath: devScriptPath)
        renderer = NativeViewRenderer(bridge: bridge)
        super.init(nibName: nil, bundle: nil)
    }

    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }

    override func loadView() {
        view = ClickableView(frame: NSRect(x: 0, y: 0, width: 800, height: 560))
    }

    override func viewDidLoad() {
        super.viewDidLoad()

        // Capture render output from JS
        bridge.onRender = { [weak self] node in
            self?.rootNode = node
        }

        // Handle relayout requests from JS (after HMR patch)
        bridge.onRelayout = { [weak self] in
            self?.renderer.relayout()
        }

        bridge.run()

        let scroll = NSScrollView(frame: view.bounds)
        scroll.hasVerticalScroller = true
        scroll.autohidesScrollers = true
        scroll.drawsBackground = false
        scroll.autoresizingMask = [.width, .height]
        view.addSubview(scroll)
        scrollView = scroll

        renderLayout()

        // In dev mode, poll dist/app.js for changes
        if let devPath = bridge.devScriptPath {
            startFilePolling(path: devPath)
        }
    }

    override func viewDidLayout() {
        super.viewDidLayout()
        renderLayout()
    }

    override func viewDidAppear() {
        super.viewDidAppear()
        view.window?.makeFirstResponder(view)
    }

    // MARK: - HMR File Polling

    /// Poll the JS bundle file for modification time changes (500ms interval).
    /// More reliable than DispatchSource for atomic writes (Vite/Rollup).
    private func startFilePolling(path: String) {
        // Record initial modification date
        lastModifiedDate = fileModificationDate(path)
        print("[HMR] Watching \(path) (polling 500ms)")

        pollTimer = Timer.scheduledTimer(withTimeInterval: 0.5, repeats: true) { [weak self] _ in
            guard let self = self else { return }
            guard let currentDate = self.fileModificationDate(path) else { return }

            if currentDate != self.lastModifiedDate {
                self.lastModifiedDate = currentDate
                self.handleHotReload()
            }
        }
    }

    private func fileModificationDate(_ path: String) -> Date? {
        guard let attrs = try? FileManager.default.attributesOfItem(atPath: path),
              let date = attrs[.modificationDate] as? Date else { return nil }
        return date
    }

    private func handleHotReload() {
        print("[HMR] File changed, reloading...")

        // Save scroll position before re-render
        let savedScrollOrigin = scrollView?.contentView.bounds.origin

        // Reload JS — if __native_hmr.data.__root exists, JS render() will
        // use patch() instead of full rebuild, and call __nativeBridge_relayout.
        // If it's the first load (no __root), it falls back to full render.
        bridge.reload()

        // If JS triggered a full render (no existing root), we need renderLayout.
        // If JS used patch + relayout, rootNode won't be updated (patch modifies in-place).
        // Check if bridge.onRender was called (rootNode was set) — if so, do full layout.
        if rootNode != nil && renderer.rootView == nil {
            renderLayout()
        }

        // Restore scroll position after re-render
        if let origin = savedScrollOrigin, let scroll = scrollView {
            scroll.contentView.scroll(to: origin)
            scroll.reflectScrolledClipView(scroll.contentView)
        }

        print("[HMR] Reload complete.")
    }

    // MARK: - Layout

    private func renderLayout() {
        guard let rootNode = rootNode, let scroll = scrollView else { return }

        let containerWidth = scroll.contentSize.width
        guard containerWidth > 0 else { return }

        guard let rendered = renderer.render(rootNode, containerWidth: containerWidth) else { return }

        // Replace existing document view content
        let docView = FlippedView(frame: NSRect(
            x: 0, y: 0,
            width: containerWidth,
            height: rendered.frame.height
        ))
        docView.addSubview(rendered)
        scroll.documentView = docView
    }

    deinit {
        pollTimer?.invalidate()
    }
}

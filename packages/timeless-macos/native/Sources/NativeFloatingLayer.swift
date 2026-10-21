import Cocoa
import JavaScriptCore

/// A zero-size logical node keeps the surface's lifecycle in its original tree.
final class NativeFloatingPlaceholder: NSView {
    var node: NativeNode
    let surface: NSView
    weak var savedResponder: NSResponder?
    var presented = false

    init(node: NativeNode, surface: NSView) {
        self.node = node
        self.surface = surface
        super.init(frame: .zero)
        isHidden = true
        addSubview(surface)
    }
    required init?(coder: NSCoder) { fatalError("init(coder:) has not been implemented") }
    var js: JSValue? { if case .floating(_, _, let value) = node { return value }; return nil }
    var kind: String { js?.forProperty("kind")?.toString() ?? "modal" }
    var modal: Bool { js?.forProperty("modal")?.toBool() ?? false }
    var open: Bool { js?.forProperty("open")?.toBool() ?? false }
}

private final class FloatingOverlay: FlippedView {
    weak var owner: NativeFloatingLayer?
    override func hitTest(_ point: NSPoint) -> NSView? {
        let hit = super.hitTest(point)
        if let tooltip = owner?.presented.last(where: { $0.kind == "tooltip" }),
           hit === tooltip.surface || hit?.isDescendant(of: tooltip.surface) == true { return nil }
        return hit === self && owner?.presented.contains(where: { $0.modal }) != true ? nil : hit
    }
    override func viewDidMoveToWindow() {
        super.viewDidMoveToWindow()
        owner?.refresh()
    }
}

/// Owns stacking, viewport positioning, dismissal and focus; JS only owns open state.
final class NativeFloatingLayer {
    private weak var root: NSView?
    private weak var renderer: NativeViewRenderer?
    private let overlay = FloatingOverlay(frame: .zero)
    private let backdrop = FlippedView(frame: .zero)
    private var eventMonitor: Any?
    private var scrollObserver: NSObjectProtocol?
    private var windowObserver: NSObjectProtocol?
    private var refreshing = false
    private(set) var presented: [NativeFloatingPlaceholder] = []

    init(root: NSView, renderer: NativeViewRenderer) {
        self.root = root
        self.renderer = renderer
        overlay.owner = self
        overlay.autoresizingMask = [.width, .height]
        backdrop.wantsLayer = true
        backdrop.layer?.backgroundColor = NativeViewRenderer.parseColor("#0008")?.cgColor
        backdrop.isHidden = true
        overlay.addSubview(backdrop)
        root.addSubview(overlay)
        eventMonitor = NSEvent.addLocalMonitorForEvents(matching: [.keyDown, .leftMouseDown, .rightMouseDown, .otherMouseDown, .scrollWheel]) { [weak self] event in
            guard let self = self else { return event }
            return self.handle(event)
        }
        scrollObserver = NotificationCenter.default.addObserver(forName: NSView.boundsDidChangeNotification, object: nil, queue: .main) { [weak self] notification in
            guard let self = self, let clip = notification.object as? NSClipView,
                  clip.window === self.root?.window else { return }
            self.refresh()
        }
        windowObserver = NotificationCenter.default.addObserver(forName: NSWindow.didResignKeyNotification, object: nil, queue: .main) { [weak self] notification in
            guard let self = self, notification.object as? NSWindow === self.root?.window else { return }
            for surface in self.presented.reversed() where !surface.modal { self.dismiss(surface) }
        }
    }

    private func placeholders(in view: NSView) -> [NativeFloatingPlaceholder] {
        if let placeholder = view as? NativeFloatingPlaceholder {
            return [placeholder] + placeholders(in: placeholder.surface)
        }
        return view.subviews.filter { $0 !== overlay }.flatMap { placeholders(in: $0) }
    }

    private func anchor(for surface: NativeFloatingPlaceholder) -> NSView? {
        guard let value = surface.js?.forProperty("anchor"), value.isObject, let root = root else { return nil }
        func find(_ view: NSView) -> NSView? {
            if let node = (view as? FlippedView)?.jsNode, node.isEqual(to: value), view.frame.width > 0 { return view }
            if let node = (view as? StyledTextField)?.nativeNode, node.isEqual(to: value) { return view }
            return view.subviews.lazy.compactMap { find($0) }.first
        }
        return find(root)
    }

    func refresh() {
        guard !refreshing, let root = root, let renderer = renderer else { return }
        refreshing = true
        defer { refreshing = false }
        overlay.frame = root.bounds
        backdrop.frame = overlay.bounds
        let candidates = placeholders(in: root)
        let activeModal = candidates.last(where: { $0.open && $0.modal && !$0.isHiddenOrHasHiddenAncestorExcludingSelf })
        for old in presented where !candidates.contains(where: { $0 === old }) { hide(old) }
        var visible: [NativeFloatingPlaceholder] = []
        for surface in candidates {
            let ownerVisible = !surface.isHiddenOrHasHiddenAncestorExcludingSelf
            var shouldPresent = surface.open && ownerVisible
            if let modal = activeModal, modal !== surface, !surface.isDescendant(of: modal.surface) {
                shouldPresent = false
                if surface.open { requestDismiss(surface) }
            }
            var reference: CGRect?
            if surface.kind != "modal" {
                if let anchor = anchor(for: surface), !anchor.isHiddenOrHasHiddenAncestor,
                   !anchor.visibleRect.isEmpty {
                    reference = anchor.convert(anchor.bounds, to: overlay)
                    shouldPresent = shouldPresent && overlay.bounds.intersects(reference!)
                } else { shouldPresent = false }
                if surface.presented && surface.open && !shouldPresent { requestDismiss(surface) }
            }
            if !shouldPresent { hide(surface); continue }
            renderer.layoutFloatingSurface(surface, available: overlay.bounds.size)
            if !surface.presented {
                surface.savedResponder = root.window?.firstResponder
                surface.presented = true
                overlay.addSubview(surface.surface)
                surface.surface.isHidden = false
                if surface.kind != "tooltip" {
                    surface.surface.setAccessibilityModal(surface.modal)
                    focusables(in: surface.surface).first.map { root.window?.makeFirstResponder($0) }
                }
            }
            let size = surface.surface.frame.size
            let origin: NSPoint
            if let reference = reference {
                origin = Self.position(size: size, anchor: reference, viewport: overlay.bounds,
                    side: surface.js?.forProperty("side")?.toString() ?? "bottom",
                    align: surface.js?.forProperty("align")?.toString() ?? "start",
                    offset: CGFloat(surface.js?.forProperty("offset")?.toDouble() ?? 8))
            } else {
                origin = NSPoint(x: (overlay.bounds.width - size.width) / 2, y: (overlay.bounds.height - size.height) / 2)
            }
            surface.surface.setFrameOrigin(origin)
            visible.append(surface)
        }
        presented = visible
        backdrop.isHidden = !visible.contains(where: { $0.modal })
        overlay.addSubview(backdrop, positioned: .above, relativeTo: nil)
        for surface in visible {
            overlay.addSubview(surface.surface, positioned: .above, relativeTo: nil)
        }
        for view in root.subviews where view !== overlay { view.setAccessibilityHidden(!backdrop.isHidden) }
    }

    private func hide(_ surface: NativeFloatingPlaceholder) {
        guard surface.presented else { return }
        let responder = root?.window?.firstResponder as? NSView
        let ownsFocus = responder === surface.surface || responder?.isDescendant(of: surface.surface) == true || focusables(in: surface.surface).contains(where: { ($0 as? NSTextField)?.currentEditor() === responder })
        surface.surface.isHidden = true
        surface.addSubview(surface.surface)
        surface.presented = false
        if ownsFocus, let previous = surface.savedResponder { root?.window?.makeFirstResponder(previous) }
        surface.savedResponder = nil
    }

    private func requestDismiss(_ surface: NativeFloatingPlaceholder) {
        if let handler = surface.js?.forProperty("listeners")?.forProperty("dismiss"), handler.isObject {
            handler.call(withArguments: [])
        }
    }

    func dismiss(_ surface: NativeFloatingPlaceholder) {
        requestDismiss(surface)
        refresh()
    }

    private func focusables(in view: NSView) -> [NSView] {
        if view.isHiddenOrHasHiddenAncestor { return [] }
        if let field = view as? NSTextField { return field.isEnabled && (field.isEditable || field.isSelectable) ? [field] : [] }
        if view is NSControl || view is NSTextView { return view.acceptsFirstResponder ? [view] : [] }
        return (view.acceptsFirstResponder ? [view] : []) + view.subviews.flatMap { focusables(in: $0) }
    }

    /// Returning nil consumes the event before it reaches background controls.
    func handle(_ event: NSEvent) -> NSEvent? {
        guard event.window === root?.window, let top = presented.last else { return event }
        if event.type == .keyDown {
            if event.keyCode == 53 { dismiss(top); return nil }
            let active = presented.last(where: { $0.kind != "tooltip" })
            if event.keyCode == 48, let active = active {
                let controls = focusables(in: active.surface)
                guard !controls.isEmpty else { return nil }
                let current = root?.window?.firstResponder
                let index = controls.firstIndex { $0 === current || ($0 as? NSTextField)?.currentEditor() === current }
                let step = event.modifierFlags.contains(.shift) ? -1 : 1
                let next = index.map { ($0 + step + controls.count) % controls.count } ?? (step == 1 ? 0 : controls.count - 1)
                root?.window?.makeFirstResponder(controls[next])
                return nil
            }
            if let active = active, active.modal, let responder = root?.window?.firstResponder as? NSView,
               !responder.isDescendant(of: active.surface),
               !focusables(in: active.surface).contains(where: { ($0 as? NSTextField)?.currentEditor() === responder }) {
                if let first = focusables(in: active.surface).first { root?.window?.makeFirstResponder(first) }
            }
            return event
        }
        let point = overlay.convert(event.locationInWindow, from: nil)
        if event.type == .scrollWheel {
            if let modal = presented.last(where: { $0.modal }), !modal.surface.frame.contains(point) { return nil }
            return event
        }
        for surface in presented.reversed() where surface.kind != "tooltip" {
            if surface.surface.frame.contains(point) { return event }
            if surface.modal { dismiss(surface); return nil }
            if let anchor = anchor(for: surface), anchor.convert(anchor.bounds, to: overlay).contains(point) { return event }
            dismiss(surface)
        }
        return event
    }

    static func position(size: NSSize, anchor: CGRect, viewport: CGRect, side: String, align: String, offset: CGFloat) -> NSPoint {
        func origin(_ side: String) -> NSPoint {
            let horizontal = side == "top" || side == "bottom"
            let cross = horizontal ? anchor.minX : anchor.minY
            let length = horizontal ? anchor.width : anchor.height
            let extent = horizontal ? size.width : size.height
            let aligned = cross + (align == "end" ? length - extent : align == "center" ? (length - extent) / 2 : 0)
            switch side {
            case "top": return NSPoint(x: aligned, y: anchor.minY - size.height - offset)
            case "left": return NSPoint(x: anchor.minX - size.width - offset, y: aligned)
            case "right": return NSPoint(x: anchor.maxX + offset, y: aligned)
            default: return NSPoint(x: aligned, y: anchor.maxY + offset)
            }
        }
        let opposite = ["top": "bottom", "bottom": "top", "left": "right", "right": "left"][side] ?? "top"
        var point = origin(side)
        let inset = viewport.insetBy(dx: 8, dy: 8)
        func fits(_ point: NSPoint, side: String) -> Bool {
            side == "top" || side == "bottom"
                ? point.y >= inset.minY && point.y + size.height <= inset.maxY
                : point.x >= inset.minX && point.x + size.width <= inset.maxX
        }
        if !fits(point, side: side) {
            let alternative = origin(opposite)
            if fits(alternative, side: opposite) { point = alternative }
        }
        return NSPoint(x: max(inset.minX, min(point.x, inset.maxX - size.width)), y: max(inset.minY, min(point.y, inset.maxY - size.height)))
    }

    deinit {
        if let eventMonitor = eventMonitor { NSEvent.removeMonitor(eventMonitor) }
        if let scrollObserver = scrollObserver { NotificationCenter.default.removeObserver(scrollObserver) }
        if let windowObserver = windowObserver { NotificationCenter.default.removeObserver(windowObserver) }
        for surface in presented { hide(surface) }
    }
}

private extension NSView {
    var isHiddenOrHasHiddenAncestorExcludingSelf: Bool { superview?.isHiddenOrHasHiddenAncestor ?? false }
}

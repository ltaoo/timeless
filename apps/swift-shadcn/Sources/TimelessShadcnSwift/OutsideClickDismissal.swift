import SwiftUI

struct OutsideClickDismissal: NSViewRepresentable {
  func makeNSView(context: Context) -> OutsideClickView { OutsideClickView() }
  func updateNSView(_ view: OutsideClickView, context: Context) {}
}

@MainActor final class OutsideClickView: NSView {
  private var monitor: Any?
  override func hitTest(_ point: NSPoint) -> NSView? { nil }
  override func viewDidMoveToWindow() {
    super.viewDidMoveToWindow()
    if let monitor { NSEvent.removeMonitor(monitor) }
    monitor = nil
    guard let window else { return }
    monitor = NSEvent.addLocalMonitorForEvents(matching: .leftMouseDown) { [weak window] event in
      MainActor.assumeIsolated {
        guard let window, event.window === window,
          let editor = window.firstResponder as? NSTextView,
          let content = window.contentView,
          let target = content.hitTest(
            content.superview?.convert(event.locationInWindow, from: nil) ?? event.locationInWindow)
        else { return }
        let owner: NSView =
          (editor.delegate as? NSTextField) ?? editor.enclosingScrollView ?? editor
        if target !== owner && !target.isDescendant(of: owner) {
          window.makeFirstResponder(nil)
        }
      }
      // Preserve the click so buttons and the next input still receive it.
      return event
    }
  }
  deinit { if let monitor { NSEvent.removeMonitor(monitor) } }
}

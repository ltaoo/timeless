import Cocoa
import QuartzCore
import XCTest
@testable import TimelessMacOS

final class SharedTransitionTests: XCTestCase {
    func testSharedTransitionCompletesBeforeUnmountAndCanKeepTheFinalFrame() throws {
        guard let path = ProcessInfo.processInfo.environment["TIMELESS_MACOS_TEST_BUNDLE"] else { throw XCTSkip("Set TIMELESS_MACOS_TEST_BUNDLE") }
        _ = NSApplication.shared
        let bridge = JSBridge(devScriptPath: path)
        let renderer = NativeViewRenderer(bridge: bridge)
        var root: NSView?
        bridge.onRender = { root = renderer.render($0, containerWidth: 1000, containerHeight: 1100) }
        bridge.onRelayout = { renderer.relayout() }
        bridge.run()
        let view = try XCTUnwrap(root)
        let window = NSWindow(contentRect: view.bounds, styleMask: [.titled], backing: .buffered, defer: false)
        window.contentView = view
        window.orderFrontRegardless()
        defer { window.makeFirstResponder(nil); window.orderOut(nil) }
        func all(_ node: NSView) -> [NSView] { [node] + node.subviews.flatMap(all) }
        func find(_ name: String) -> NSView? { all(view).first { $0.identifier?.rawValue == name } }
        func element(_ name: String) throws -> NSView { try XCTUnwrap(find(name), name) }
        func settle(_ seconds: Double = 0.08) {
            let deadline = Date().addingTimeInterval(seconds)
            repeat { RunLoop.main.run(until: min(deadline, Date().addingTimeInterval(0.01))) } while Date() < deadline
        }
        func press(_ name: String) throws {
            XCTAssertTrue(try XCTUnwrap(element(name) as? FlippedView).accessibilityPerformPress())
            settle()
        }
        try press("nav-transition")
        for effect in ["fade", "bottom", "zoom", "right"] {
            try press("transition-\(effect)-show")
            let content = try XCTUnwrap(element("transition-\(effect)-content") as? FlippedView)
            let frame = content.frame
            if !NSWorkspace.shared.accessibilityDisplayShouldReduceMotion {
                XCTAssertTrue(content.animation.running, effect)
                let group = try XCTUnwrap(content.layer?.animation(forKey: NativeViewAnimation.key) as? CAAnimationGroup)
                XCTAssertEqual(group.duration, 0.3, accuracy: 0.01)
                if effect != "fade" {
                    let transform = try XCTUnwrap(group.animations?.compactMap { $0 as? CAKeyframeAnimation }.first { $0.keyPath == "transform" })
                    let first = try XCTUnwrap(transform.values?.first as? NSValue).caTransform3DValue
                    if effect == "bottom" { XCTAssertEqual(first.m42, content.bounds.height, accuracy: 1) }
                    if effect == "right" { XCTAssertEqual(first.m41, content.bounds.width, accuracy: 1) }
                    if effect == "zoom" { XCTAssertEqual(first.m11, 0.95, accuracy: 0.001) }
                }
            }
            settle(0.36)
            XCTAssertFalse(content.animation.running)
            XCTAssertNil(content.layer?.animation(forKey: NativeViewAnimation.key))
            XCTAssertEqual(content.frame, frame, "Animation must not alter Yoga layout")
            try press("transition-\(effect)-hide")
            if !NSWorkspace.shared.accessibilityDisplayShouldReduceMotion {
                settle(0.14)
                XCTAssertNotNil(find("transition-\(effect)-content"), "The old 150ms fallback must not cut off a 300ms exit")
            }
            settle(0.25)
            XCTAssertNil(find("transition-\(effect)-content"))
        }
        let sticky = try XCTUnwrap(element("transition-sticky-content") as? FlippedView)
        let before = sticky.frame
        try press("transition-sticky-hide")
        settle(0.4)
        XCTAssertFalse(sticky.animation.running)
        XCTAssertNotNil(sticky.layer?.animation(forKey: NativeViewAnimation.key))
        XCTAssertEqual(sticky.frame, before)
        let status = try element("transition-sticky-status")
        XCTAssertTrue(status.subviews.compactMap { ($0 as? NSTextField)?.stringValue }.joined().contains("保持隐藏"))
        try press("theme-toggle")
        renderer.relayout(containerWidth: 850, containerHeight: 1100)
        XCTAssertNotNil(sticky.layer?.animation(forKey: NativeViewAnimation.key), "A theme change and relayout must preserve the disappearing animation's final frame")
        try press("transition-sticky-restore")
        XCTAssertNil(sticky.layer?.animation(forKey: NativeViewAnimation.key))
        XCTAssertEqual(sticky.alphaValue, 1)
        try press("transition-fade-show")
        try press("transition-fade-hide")
        try press("transition-fade-show")
        settle(0.4)
        XCTAssertNotNil(find("transition-fade-content"), "Reversing a running animation must not apply a stale exit completion")
        try press("nav-general")
        try press("nav-transition")
        XCTAssertNil(find("transition-fade-content"))
        XCTAssertTrue(bridge.runtimeErrors.isEmpty, bridge.runtimeErrors.joined(separator: "\n"))
    }
}

import Cocoa
import QuartzCore
import XCTest
@testable import TimelessMacOS

final class NativeAnimationTests: XCTestCase {
    private func style(fill: String, duration: String = "80ms", end: String = "0") throws -> [String: String] {
        let spec: [String: Any] = ["name": "custom-disappear", "duration": duration, "delay": "0s", "timing": "linear", "fill": fill, "direction": "normal", "frames": [["offset": 0, "style": ["opacity": "1"]], ["offset": 1, "style": ["opacity": end, "transform": "translateX(100%) scale(.95)"]]]]
        return ["-timeless-animation": String(data: try JSONSerialization.data(withJSONObject: spec), encoding: .utf8)!]
    }

    func testFillForwardsAndBothKeepTheFinalFrameAcrossStyleAndLayoutUpdates() throws {
        _ = NSApplication.shared
        for fill in ["forwards", "both"] {
            let view = FlippedView(frame: NSRect(x: 0, y: 0, width: 200, height: 80))
            let window = NSWindow(contentRect: view.bounds, styleMask: [.titled], backing: .buffered, defer: false)
            window.contentView = view
            window.orderFrontRegardless()
            defer { window.orderOut(nil) }
            let value = try style(fill: fill)
            NativeViewRenderer.applyStyle(value, to: view)
            RunLoop.main.run(until: Date().addingTimeInterval(0.18))
            XCTAssertFalse(view.animation.running)
            let group = try XCTUnwrap(view.layer?.animation(forKey: NativeViewAnimation.key) as? CAAnimationGroup)
            XCTAssertFalse(group.isRemovedOnCompletion)
            XCTAssertEqual(group.fillMode, fill == "both" ? .both : .forwards)
            let opacity = try XCTUnwrap(group.animations?.compactMap { $0 as? CAKeyframeAnimation }.first { $0.keyPath == "opacity" })
            XCTAssertEqual((opacity.values?.last as? NSNumber)?.doubleValue, 0)
            XCTAssertEqual(try XCTUnwrap(view.layer?.presentation()).opacity, 0, accuracy: 0.01)
            var themed = value
            themed["background-color"] = "#123456"
            NativeViewRenderer.applyStyle(themed, to: view)
            view.setFrameSize(NSSize(width: 260, height: 100))
            XCTAssertNotNil(view.layer?.animation(forKey: NativeViewAnimation.key), "Unrelated updates must not reveal a forwards-filled disappearing view")
            XCTAssertFalse(view.animation.running, "Reapplying the same CSS must not restart the animation")
            XCTAssertEqual(view.frame.size, NSSize(width: 260, height: 100))
            NativeViewRenderer.applyStyle([:], to: view)
            XCTAssertNil(view.layer?.animation(forKey: NativeViewAnimation.key))
            XCTAssertEqual(view.alphaValue, 1)
        }
    }

    func testNoneReleasesTheAnimationAndChangingTheAnimationCancelsThePreviousRun() throws {
        _ = NSApplication.shared
        let view = FlippedView(frame: NSRect(x: 0, y: 0, width: 100, height: 40))
        let window = NSWindow(contentRect: view.bounds, styleMask: [.titled], backing: .buffered, defer: false)
        window.contentView = view
        window.orderFrontRegardless()
        defer { window.orderOut(nil) }
        NativeViewRenderer.applyStyle(try style(fill: "forwards", duration: "500ms"), to: view)
        RunLoop.main.run(until: Date().addingTimeInterval(0.02))
        NativeViewRenderer.applyStyle(try style(fill: "none", end: "1"), to: view)
        RunLoop.main.run(until: Date().addingTimeInterval(0.18))
        XCTAssertNil(view.layer?.animation(forKey: NativeViewAnimation.key))
        XCTAssertFalse(view.animation.running)
        XCTAssertEqual(view.alphaValue, 1)
    }

    func testTransformsResolveRelativeDistancesAndScaleAroundTheCSSCenter() {
        let bounds = CGRect(x: 0, y: 0, width: 200, height: 80)
        let translated = NativeViewAnimation.transform("translate3d(50%, 100%, 0)", bounds: bounds, anchor: .zero)
        XCTAssertEqual(translated.m41, 100)
        XCTAssertEqual(translated.m42, 80)
        let scaled = NativeViewAnimation.transform("scale3d(.95, .95, 1)", bounds: bounds, anchor: .zero)
        XCTAssertEqual(scaled.m11, 0.95, accuracy: 0.001)
        XCTAssertEqual(scaled.m41, 5, accuracy: 0.001)
        XCTAssertEqual(scaled.m42, 2, accuracy: 0.001)
    }

    func testZeroDurationKeepsTheFinalFrameAndDetachingCancelsAnActiveAnimation() throws {
        _ = NSApplication.shared
        let view = FlippedView(frame: NSRect(x: 0, y: 0, width: 100, height: 40))
        let window = NSWindow(contentRect: view.bounds, styleMask: [.titled], backing: .buffered, defer: false)
        window.contentView = view
        window.orderFrontRegardless()
        defer { window.orderOut(nil) }
        NativeViewRenderer.applyStyle(try style(fill: "forwards", duration: "0s"), to: view)
        RunLoop.main.run(until: Date().addingTimeInterval(0.03))
        XCTAssertFalse(view.animation.running)
        XCTAssertNotNil(view.layer?.animation(forKey: NativeViewAnimation.key))
        NativeViewRenderer.applyStyle(try style(fill: "forwards", duration: "500ms"), to: view)
        RunLoop.main.run(until: Date().addingTimeInterval(0.02))
        window.contentView = NSView(frame: view.bounds)
        RunLoop.main.run(until: Date().addingTimeInterval(0.03))
        XCTAssertFalse(view.animation.running)
        XCTAssertNil(view.layer?.animation(forKey: NativeViewAnimation.key))
    }
}

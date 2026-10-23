import Cocoa
import XCTest
@testable import TimelessMacOS

final class WindowAppearanceTests: XCTestCase {
    func testSystemThemeAtLaunchAndWindowThemeAfterToggling() throws {
        guard let path = ProcessInfo.processInfo.environment["TIMELESS_MACOS_TEST_BUNDLE"] else {
            throw XCTSkip("Set TIMELESS_MACOS_TEST_BUNDLE")
        }
        let app = NSApplication.shared
        let previousAppearance = app.appearance
        defer { app.appearance = previousAppearance }
        func find(_ name: String, in view: NSView) -> NSView? {
            if view.identifier?.rawValue == name { return view }
            return view.subviews.lazy.compactMap { find(name, in: $0) }.first
        }
        for initialDark in [false, true] {
            app.appearance = NSAppearance(named: initialDark ? .darkAqua : .aqua)
            let controller = RootViewController(devScriptPath: path)
            let content = controller.view
            XCTAssertEqual(content.appearance?.name, initialDark ? .darkAqua : .aqua)
            let window = NSWindow(contentRect: content.bounds, styleMask: [.titled], backing: .buffered, defer: false)
            defer { window.orderOut(nil) }
            window.contentViewController = controller
            controller.viewDidAppear()
            let toggle = try XCTUnwrap(find("theme-toggle", in: content) as? FlippedView)
            let page = try XCTUnwrap(find("shared-application", in: content))
            func check(_ dark: Bool) throws {
                XCTAssertEqual(window.appearance?.name, dark ? .darkAqua : .aqua)
                XCTAssertEqual(content.effectiveAppearance.bestMatch(from: [.aqua, .darkAqua]), dark ? .darkAqua : .aqua)
                let color = try XCTUnwrap(page.layer?.backgroundColor.flatMap { NSColor(cgColor: $0)?.usingColorSpace(.sRGB) })
                if dark { XCTAssertLessThan(color.redComponent, 0.2) }
                else { XCTAssertGreaterThan(color.redComponent, 0.8) }
            }
            try check(initialDark)
            XCTAssertTrue(toggle.accessibilityPerformPress())
            try check(!initialDark)
            XCTAssertTrue(toggle.accessibilityPerformPress())
            try check(initialDark)
            XCTAssertEqual(app.appearance?.name, initialDark ? .darkAqua : .aqua, "Window toggles must preserve the system/application preference")
        }
    }
}

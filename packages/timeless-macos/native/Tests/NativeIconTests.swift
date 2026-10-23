import Cocoa
import JavaScriptCore
import XCTest
@testable import TimelessMacOS

final class NativeIconTests: XCTestCase {
    private let svg = """
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
      <path d="M2 6H22" stroke="currentColor" stroke-width="4"/>
      <rect x="2" y="14" width="20" height="8" fill="#00ff00"/>
    </svg>
    """

    private func hasColor(_ image: NSImage, red: CGFloat, green: CGFloat, blue: CGFloat) throws -> Bool {
        let bitmap = try XCTUnwrap(NSBitmapImageRep(data: XCTUnwrap(image.tiffRepresentation)))
        for x in 0..<bitmap.pixelsWide {
            for y in 0..<bitmap.pixelsHigh {
                guard let color = bitmap.colorAt(x: x, y: y)?.usingColorSpace(.genericRGB), color.alphaComponent > 0.9 else { continue }
                if abs(color.redComponent - red) < 0.05 && abs(color.greenComponent - green) < 0.05 && abs(color.blueComponent - blue) < 0.05 { return true }
            }
        }
        return false
    }

    func testSVGSizeCurrentColorFixedColorsAndCache() throws {
        for size: CGFloat in [16, 24, 48] {
            let red = try XCTUnwrap(NativeIconLoader.image(svg: svg, size: size, color: "#ff0000"))
            XCTAssertEqual(red.size, NSSize(width: size, height: size))
            XCTAssertTrue(try hasColor(red, red: 1, green: 0, blue: 0))
            XCTAssertTrue(try hasColor(red, red: 0, green: 1, blue: 0))
            XCTAssertTrue(red === NativeIconLoader.image(svg: svg, size: size, color: "#ff0000"))
            let blue = try XCTUnwrap(NativeIconLoader.image(svg: svg, size: size, color: "#0000ff"))
            XCTAssertTrue(try hasColor(blue, red: 0, green: 0, blue: 1))
            XCTAssertTrue(try hasColor(blue, red: 0, green: 1, blue: 0))
            XCTAssertFalse(red === blue)
        }
        XCTAssertNil(NativeIconLoader.image(svg: "<svg", size: 24, color: "#000000"))
    }

    func testSVGCurrentColorAcceptsComputedCSSHexColors() throws {
        for color in ["#fafafaff", "#ff0000ff", "#0000ffff"] {
            let expected = try XCTUnwrap(NativeViewRenderer.parseColor(color)?.usingColorSpace(.genericRGB))
            let image = try XCTUnwrap(NativeIconLoader.image(svg: svg, size: 24, color: color))
            XCTAssertTrue(try hasColor(image, red: expected.redComponent, green: expected.greenComponent, blue: expected.blueComponent), color)
            XCTAssertTrue(try hasColor(image, red: 0, green: 1, blue: 0), "Fixed SVG colors must remain unchanged")
        }
    }

    func testBridgeUpdatesSVGColorSizeAndSFSymbolFallback() throws {
        _ = NSApplication.shared
        let script = FileManager.default.temporaryDirectory.appendingPathComponent("timeless-icons-\(UUID().uuidString).js")
        let source = """
        var icon = {type:'icon', name:'house', svg:\(String(data: try JSONSerialization.data(withJSONObject: svg, options: .fragmentsAllowed), encoding: .utf8)!), color:'currentColor', size:24, style:{color:'#ff0000'}, attrs:{n:'icon'}, listeners:{}};
        __nativeBridge_render({type:'view', style:{}, attrs:{}, listeners:{}, children:[icon]});
        """
        try source.write(to: script, atomically: true, encoding: .utf8)
        defer { try? FileManager.default.removeItem(at: script) }
        let bridge = JSBridge(devScriptPath: script.path)
        let renderer = NativeViewRenderer(bridge: bridge)
        var root: NSView?
        bridge.onRender = { root = renderer.render($0, containerWidth: 200, containerHeight: 100) }
        bridge.run()
        let view = try XCTUnwrap(root?.subviews.first as? NSImageView)
        XCTAssertEqual(view.identifier?.rawValue, "icon")
        XCTAssertEqual(view.frame.size, NSSize(width: 24, height: 24))
        XCTAssertTrue(try hasColor(XCTUnwrap(view.image), red: 1, green: 0, blue: 0))
        XCTAssertNil(view.contentTintColor)
        let context = try XCTUnwrap(bridge.rootElmJSValue?.context)
        context.evaluateScript("icon.style.color='#0000ff'; icon._onStyleChange(icon.style)")
        XCTAssertTrue(try hasColor(XCTUnwrap(view.image), red: 0, green: 0, blue: 1))
        context.evaluateScript("icon.color='#ff0000'; icon.size=32; icon._onIconChange()")
        renderer.relayout()
        XCTAssertEqual(view.frame.size, NSSize(width: 32, height: 32))
        XCTAssertEqual(view.image?.size, NSSize(width: 32, height: 32))
        XCTAssertTrue(try hasColor(XCTUnwrap(view.image), red: 1, green: 0, blue: 0))
        context.evaluateScript("icon.svg=null; icon.name='house.fill'; icon._onIconChange()")
        XCTAssertNotNil(view.image)
        XCTAssertNotNil(view.contentTintColor)
        XCTAssertTrue(bridge.runtimeErrors.isEmpty, bridge.runtimeErrors.joined(separator: "\n"))
    }

    func testSharedNavigationIconsFollowTheTextTheme() throws {
        guard let path = ProcessInfo.processInfo.environment["TIMELESS_MACOS_TEST_BUNDLE"] else { throw XCTSkip("Set TIMELESS_MACOS_TEST_BUNDLE") }
        _ = NSApplication.shared
        let bridge = JSBridge(devScriptPath: path)
        let renderer = NativeViewRenderer(bridge: bridge)
        var root: NSView?
        bridge.onRender = { root = renderer.render($0, containerWidth: 1000, containerHeight: 800) }
        bridge.onRelayout = { renderer.relayout() }
        bridge.run()
        let view = try XCTUnwrap(root)
        func all(_ node: NSView) -> [NSView] { [node] + node.subviews.flatMap(all) }
        func element(_ name: String) throws -> NSView { try XCTUnwrap(all(view).first { $0.identifier?.rawValue == name }, name) }
        for _ in 0..<3 {
            for page in ["overview", "general", "data_entry", "floating", "navigation", "data_display", "layout"] {
                let button = try XCTUnwrap(element("nav-" + page) as? FlippedView)
                let label = try XCTUnwrap(button.subviews.compactMap { $0 as? NSTextField }.first)
                let color = try XCTUnwrap(label.textColor?.usingColorSpace(.genericRGB))
                let icon = try XCTUnwrap(element("nav-" + page + "-icon") as? NSImageView)
                XCTAssertTrue(try hasColor(XCTUnwrap(icon.image), red: color.redComponent, green: color.greenComponent, blue: color.blueComponent), page)
            }
            XCTAssertTrue(try XCTUnwrap(element("theme-toggle") as? FlippedView).accessibilityPerformPress())
            RunLoop.main.run(until: Date().addingTimeInterval(0.03))
        }
        XCTAssertTrue(bridge.runtimeErrors.isEmpty, bridge.runtimeErrors.joined(separator: "\n"))
    }
}

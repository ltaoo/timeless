import Cocoa
import JavaScriptCore
import XCTest
@testable import TimelessMacOS

final class NativeUpdateTests: XCTestCase {
    private func scene(_ source: String) throws -> (JSBridge, NativeViewRenderer, NSView) {
        _ = NSApplication.shared
        let script = FileManager.default.temporaryDirectory.appendingPathComponent("native-update-\(UUID().uuidString).js")
        try source.write(to: script, atomically: true, encoding: .utf8)
        defer { try? FileManager.default.removeItem(at: script) }
        let bridge = JSBridge(devScriptPath: script.path)
        let renderer = NativeViewRenderer(bridge: bridge)
        var root: NSView?
        bridge.onRender = { root = renderer.render($0, containerWidth: 400, containerHeight: 300) }
        bridge.run()
        return (bridge, renderer, try XCTUnwrap(root))
    }

    func testTextChangesKeepLayoutOnlyWhenMeasurementsAreStable() throws {
        let (bridge, renderer, root) = try scene("""
            __nativeBridge_render({ type: 'view', attrs: {}, listeners: {}, style: { display: 'flex', 'flex-direction': 'column' }, children: [
                { type: 'text', value: '甲', style: { 'font-size': '14px' } },
                { type: 'view', attrs: {}, listeners: {}, style: { display: 'flex', 'flex-direction': 'row' }, children: [
                    { type: 'text', value: 'Intrinsic', style: { 'font-size': '14px' } }
                ] }
            ] });
        """)
        let nodes = try XCTUnwrap(bridge.rootElmJSValue?.forProperty("children"))
        let stretched = try XCTUnwrap(nodes.atIndex(0))
        let intrinsic = try XCTUnwrap(nodes.atIndex(1)?.forProperty("children")?.atIndex(0))
        func update(_ node: JSValue, _ value: String) -> Bool {
            node.setValue(value, forProperty: "value")
            return node.forProperty("_onContentChange")!.call(withArguments: [value])!.toBool()
        }
        let label = try XCTUnwrap(root.subviews.first as? NSTextField)
        let originalHeight = label.frame.height
        XCTAssertFalse(update(stretched, "乙"))
        XCTAssertEqual(label.stringValue, "乙")
        XCTAssertFalse(update(stretched, "Another short value"), "Yoga's exact width only depends on the text height")
        XCTAssertTrue(update(intrinsic, "X"), "Intrinsic-width labels must let siblings reposition when shrinking")
        XCTAssertTrue(update(stretched, String(repeating: "A long line that must wrap. ", count: 30)))
        renderer.relayout()
        XCTAssertGreaterThan(label.frame.height, originalHeight)
        XCTAssertTrue(update(stretched, ""), "Empty text must release its layout height")
    }

    func testHiddenPagesAreLazyAndKeepTheirNativeChildrenWhenRevisited() throws {
        let (bridge, renderer, root) = try scene("""
            __nativeBridge_render({ type: 'view', attrs: {}, listeners: {}, children: [
                { type: 'view', attrs: {}, listeners: {}, style: { display: 'none' }, children: [
                    { type: 'text', value: 'Retained state', style: {} }
                ] }
            ] });
        """)
        let page = try XCTUnwrap(bridge.rootElmJSValue?.forProperty("children")?.atIndex(0))
        let container = try XCTUnwrap(root.subviews.first)
        XCTAssertTrue(container.subviews.isEmpty, "Initially hidden pages do not create native descendants")
        func display(_ value: String) {
            let style = page.forProperty("style")!
            style.setValue(value, forProperty: "display")
            page.forProperty("_onStyleChange")?.call(withArguments: [style])
            renderer.relayout()
        }
        display("flex")
        let label = try XCTUnwrap(container.subviews.first as? NSTextField)
        display("none")
        XCTAssertTrue(container.subviews.first === label)
        let text = try XCTUnwrap(page.forProperty("children")?.atIndex(0))
        text.setValue("Changed while hidden", forProperty: "value")
        text.forProperty("_onContentChange")?.call(withArguments: ["Changed while hidden"])
        display("flex")
        XCTAssertTrue(container.subviews.first === label)
        XCTAssertEqual(label.stringValue, "Changed while hidden")
        XCTAssertTrue(bridge.runtimeErrors.isEmpty, bridge.runtimeErrors.joined(separator: "\n"))
    }
}

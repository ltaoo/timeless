import Cocoa
import JavaScriptCore
import XCTest
@testable import TimelessMacOS

private final class RichTextImageProtocol: URLProtocol {
    override class func canInit(with request: URLRequest) -> Bool { request.url?.host == "rich-text.test" }
    override class func canonicalRequest(for request: URLRequest) -> URLRequest { request }
    override func startLoading() {
        let status = request.url?.path == "/success.png" ? 200 : 404
        let response = HTTPURLResponse(url: request.url!, statusCode: status, httpVersion: nil, headerFields: ["Content-Type": "image/png"])!
        let bitmap = NSBitmapImageRep(bitmapDataPlanes: nil, pixelsWide: 2, pixelsHigh: 1, bitsPerSample: 8, samplesPerPixel: 4, hasAlpha: true, isPlanar: false, colorSpaceName: .deviceRGB, bytesPerRow: 0, bitsPerPixel: 0)!
        client?.urlProtocol(self, didReceive: response, cacheStoragePolicy: .notAllowed)
        client?.urlProtocol(self, didLoad: bitmap.representation(using: .png, properties: [:])!)
        client?.urlProtocolDidFinishLoading(self)
    }
    override func stopLoading() {}
}

final class NativeRichTextTests: XCTestCase {
    func testHTTPImagesRejectErrorResponsesAndCacheSuccessfulLoads() {
        XCTAssertTrue(URLProtocol.registerClass(RichTextImageProtocol.self))
        defer {
            URLProtocol.unregisterClass(RichTextImageProtocol.self)
            NativeImageLoader.cache.removeObject(forKey: "https://rich-text.test/success.png" as NSString)
        }
        let loaded = expectation(description: "HTTP image decoded")
        NativeImageLoader.load("https://rich-text.test/success.png") { image in
            XCTAssertTrue(Thread.isMainThread)
            XCTAssertNotNil(image)
            XCTAssertNotNil(NativeImageLoader.cache.object(forKey: "https://rich-text.test/success.png" as NSString))
            loaded.fulfill()
        }
        let failed = expectation(description: "HTTP error does not render its response body")
        NativeImageLoader.load("https://rich-text.test/not-found.png") { image in
            XCTAssertNil(image)
            failed.fulfill()
        }
        wait(for: [loaded, failed], timeout: 5)
    }
    private func imageDocument(_ source: String) -> [String: Any] {
        ["text": "picture", "spans": [["start": 0, "end": 7, "style": [:], "image": ["src": source, "alt": "picture"]]]]
    }

    func testImagesPreserveLinksAndFitTheTextWidth() throws {
        let source = "https://example.com/\(UUID().uuidString).png"
        NativeImageLoader.cache.setObject(NSImage(size: NSSize(width: 400, height: 200)), forKey: source as NSString)
        defer { NativeImageLoader.cache.removeObject(forKey: source as NSString) }
        let doc: [String: Any] = ["text": "😀 alt bold alt link", "spans": [
            ["start": 0, "end": 3, "style": [:]],
            ["start": 3, "end": 6, "style": [:], "image": ["src": source, "alt": "first"]],
            ["start": 6, "end": 12, "style": ["font-weight": "700"]],
            ["start": 12, "end": 15, "style": [:], "image": ["src": source, "alt": "second", "width": 64, "height": 32]],
            ["start": 15, "end": 16, "style": [:]],
            ["start": 16, "end": 20, "style": [:], "href": "https://example.com/link"],
        ]]
        let text = NativeRichText.attributed(doc, style: [:], width: 100)
        XCTAssertEqual(text.string, "😀 \u{FFFC} bold \u{FFFC} link")
        let first = try XCTUnwrap(text.attribute(.attachment, at: 3, effectiveRange: nil) as? NSTextAttachment)
        let second = try XCTUnwrap(text.attribute(.attachment, at: 10, effectiveRange: nil) as? NSTextAttachment)
        XCTAssertEqual(first.bounds.size, NSSize(width: 100, height: 50))
        XCTAssertEqual(second.bounds.size, NSSize(width: 64, height: 32))
        XCTAssertEqual(first.image?.accessibilityDescription, "first")
        XCTAssertEqual(second.image?.accessibilityDescription, "second")
        XCTAssertEqual(text.attribute(.link, at: 12, effectiveRange: nil) as? String, "https://example.com/link")
        let narrow = NativeRichText.attributed(imageDocument(source), style: [:], width: 50)
        XCTAssertEqual((narrow.attribute(.attachment, at: 0, effectiveRange: nil) as? NSTextAttachment)?.bounds.size, NSSize(width: 50, height: 25))
        let context = try XCTUnwrap(JSContext())
        let node = try XCTUnwrap(JSValue(newObjectIn: context))
        node.setValue(imageDocument(source), forProperty: "richText")
        let view = NativeRichTextView(frame: NSRect(x: 0, y: 0, width: 100, height: 200), node: node, style: [:])
        view.setFrameSize(NSSize(width: 50, height: 200))
        XCTAssertEqual((view.textStorage?.attribute(.attachment, at: 0, effectiveRange: nil) as? NSTextAttachment)?.bounds.width, 50)
        let native = NativeNode.text(value: "picture", style: [:], jsValue: node)
        let yoga = YogaLayoutEngine.buildYogaTree(from: native)
        defer { YogaLayoutEngine.freeTree(yoga) }
        YogaLayoutEngine.calculateLayout(yoga, width: 100)
        XCTAssertGreaterThanOrEqual(YogaLayoutEngine.frame(of: yoga).height, 50)
    }

    func testImagesLoadAsynchronouslyAndRequestLayout() throws {
        let bitmap = try XCTUnwrap(NSBitmapImageRep(bitmapDataPlanes: nil, pixelsWide: 16, pixelsHigh: 8, bitsPerSample: 8, samplesPerPixel: 4, hasAlpha: true, isPlanar: false, colorSpaceName: .deviceRGB, bytesPerRow: 0, bitsPerPixel: 0))
        let sourcePixels = try XCTUnwrap(bitmap.bitmapData)
        for x in 0..<16 { for y in 0..<8 {
            let index = y * bitmap.bytesPerRow + x * 4
            sourcePixels[index] = 255; sourcePixels[index + 1] = 0
            sourcePixels[index + 2] = 0; sourcePixels[index + 3] = 255
        } }
        let data = try XCTUnwrap(bitmap.representation(using: .png, properties: [:]))
        let file = FileManager.default.temporaryDirectory.appendingPathComponent("rich-text-\(UUID().uuidString).png")
        try data.write(to: file)
        defer { try? FileManager.default.removeItem(at: file); NativeImageLoader.cache.removeObject(forKey: file.path as NSString) }
        let context = try XCTUnwrap(JSContext())
        let node = try XCTUnwrap(JSValue(newObjectIn: context))
        node.setValue(imageDocument(file.path), forProperty: "richText")
        let loaded = expectation(description: "Image triggers native relayout")
        let layout: @convention(block) () -> Void = { loaded.fulfill() }
        node.setValue(layout, forProperty: "_requestLayout")
        let view = NativeRichTextView(frame: NSRect(x: 0, y: 0, width: 100, height: 200), node: node, style: [:])
        XCTAssertEqual(view.string, "picture")
        wait(for: [loaded], timeout: 5)
        XCTAssertEqual(view.string, "\u{FFFC}")
        XCTAssertNotNil(view.textStorage?.attribute(.attachment, at: 0, effectiveRange: nil))
        let rendered = try XCTUnwrap(NSBitmapImageRep(bitmapDataPlanes: nil, pixelsWide: 100, pixelsHigh: 200, bitsPerSample: 8, samplesPerPixel: 4, hasAlpha: true, isPlanar: false, colorSpaceName: .deviceRGB, bytesPerRow: 0, bitsPerPixel: 0))
        view.cacheDisplay(in: view.bounds, to: rendered)
        var redPixels = 0
        let pixels = try XCTUnwrap(rendered.bitmapData)
        for x in 0..<rendered.pixelsWide { for y in 0..<rendered.pixelsHigh {
            let index = y * rendered.bytesPerRow + x * 4
            if pixels[index] > 240 && pixels[index + 1] < 20 && pixels[index + 2] < 20 && pixels[index + 3] > 240 { redPixels += 1 }
        } }
        XCTAssertGreaterThan(redPixels, 0, "The text view must paint the image pixels")
        let failed = expectation(description: "Missing image reports failure")
        NativeImageLoader.load(file.path + ".missing") { image in
            XCTAssertNil(image)
            failed.fulfill()
        }
        wait(for: [failed], timeout: 5)
        XCTAssertNil(context.exception)
    }

    func testRemovedImagesCannotReplaceUpdatedContent() throws {
        let file = FileManager.default.temporaryDirectory.appendingPathComponent("removed-\(UUID().uuidString).png")
        let bitmap = try XCTUnwrap(NSBitmapImageRep(bitmapDataPlanes: nil, pixelsWide: 1, pixelsHigh: 1, bitsPerSample: 8, samplesPerPixel: 4, hasAlpha: true, isPlanar: false, colorSpaceName: .deviceRGB, bytesPerRow: 0, bitsPerPixel: 0))
        try XCTUnwrap(bitmap.representation(using: .png, properties: [:])).write(to: file)
        defer { try? FileManager.default.removeItem(at: file); NativeImageLoader.cache.removeObject(forKey: file.path as NSString) }
        let context = try XCTUnwrap(JSContext())
        let node = try XCTUnwrap(JSValue(newObjectIn: context))
        node.setValue(imageDocument(file.path), forProperty: "richText")
        let view = NativeRichTextView(frame: NSRect(x: 0, y: 0, width: 100, height: 200), node: node, style: [:])
        node.setValue(["text": "new content", "spans": []], forProperty: "richText")
        view.refresh()
        let finished = expectation(description: "Queued image completion")
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) { finished.fulfill() }
        wait(for: [finished], timeout: 2)
        XCTAssertEqual(view.string, "new content")
        XCTAssertNil(context.exception)
    }

    private let document: [String: Any] = [
        "text": "😀 Bold link\n\nHeading",
        "spans": [
            ["start": 0, "end": 3, "style": [:]],
            ["start": 3, "end": 7, "style": ["font-weight": "700", "font-style": "italic"]],
            ["start": 7, "end": 8, "style": [:]],
            ["start": 8, "end": 12, "style": ["color": "#2563eb", "text-decoration": "underline"], "href": "https://example.com"],
            ["start": 12, "end": 14, "style": [:]],
            ["start": 14, "end": 21, "style": ["font-size": "2em", "font-weight": "700"]],
        ],
    ]

    func testAttributesUseUTF16RangesAndInheritedFontSize() throws {
        let text = NativeRichText.attributed(document, style: ["font-size": "18px"])
        let bold = try XCTUnwrap(text.attribute(.font, at: 3, effectiveRange: nil) as? NSFont)
        XCTAssertTrue(NSFontManager.shared.traits(of: bold).contains(.boldFontMask))
        XCTAssertTrue(NSFontManager.shared.traits(of: bold).contains(.italicFontMask))
        XCTAssertEqual(text.attribute(.link, at: 8, effectiveRange: nil) as? String, "https://example.com")
        XCTAssertEqual((text.attribute(.font, at: 14, effectiveRange: nil) as? NSFont)?.pointSize, 36)
        let invalid: [String: Any] = ["text": "safe", "spans": [["start": -1, "end": 500, "style": ["font-weight": "700"]]]]
        XCTAssertEqual(NativeRichText.attributed(invalid, style: [:]).string, "safe")
    }

    func testNativeViewMeasuresWrapsUpdatesAndReportsLinks() throws {
        let context = try XCTUnwrap(JSContext())
        let node = try XCTUnwrap(JSValue(newObjectIn: context))
        node.setValue(document, forProperty: "richText")
        node.setValue(["font-size": "18px"], forProperty: "style")
        var pressed = ""
        let link: @convention(block) (String) -> Void = { pressed = $0 }
        node.setValue(link, forProperty: "_onLinkPress")
        let native = NativeNode.text(value: document["text"] as! String, style: ["font-size": "18px"], jsValue: node)
        let yoga = YogaLayoutEngine.buildYogaTree(from: native)
        defer { YogaLayoutEngine.freeTree(yoga) }
        YogaLayoutEngine.calculateLayout(yoga, width: 100)
        XCTAssertGreaterThan(YogaLayoutEngine.frame(of: yoga).height, 36)
        let view = NativeRichTextView(frame: NSRect(x: 0, y: 0, width: 100, height: 150), node: node, style: ["font-size": "18px"])
        XCTAssertEqual(view.string, document["text"] as? String)
        XCTAssertTrue(view.isSelectable)
        XCTAssertFalse(view.isEditable)
        XCTAssertTrue(view.textView(view, clickedOnLink: "https://example.com", at: 8))
        XCTAssertEqual(pressed, "https://example.com")
        node.setValue(["text": "updated", "spans": []], forProperty: "richText")
        node.invokeMethod("_onRichTextChange", withArguments: [[:]])
        XCTAssertEqual(view.string, "updated")
        let longText = String(repeating: "growing text ", count: 100)
        node.setValue(["text": longText, "spans": []], forProperty: "richText")
        node.invokeMethod("_onRichTextChange", withArguments: [[:]])
        let container = try XCTUnwrap(view.textContainer)
        XCTAssertEqual(view.layoutManager?.glyphRange(for: container).length, longText.utf16.count)
        XCTAssertNil(context.exception)
    }
}

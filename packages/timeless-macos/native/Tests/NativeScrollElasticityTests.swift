import Cocoa
import JavaScriptCore
import XCTest
@testable import TimelessMacOS

private final class RecordingClipView: NSClipView {
    var scrollCommands = 0
    var allowsOverscroll = false
    override func constrainBoundsRect(_ proposedBounds: NSRect) -> NSRect {
        allowsOverscroll ? proposedBounds : super.constrainBoundsRect(proposedBounds)
    }
    override func scroll(to newOrigin: NSPoint) {
        scrollCommands += 1
        super.scroll(to: newOrigin)
    }
}

final class NativeScrollElasticityTests: XCTestCase {
    func testLayoutPreservesNativeOverscrollAndOnlyAppliesExplicitScrollRequests() throws {
        _ = NSApplication.shared
        let context = try XCTUnwrap(JSContext())
        let node = try XCTUnwrap(context.evaluateScript("({attrs: {}, listeners: {}, scrollTop: 0, scrollLeft: 0})"))
        let scroll = NativeScrollView(frame: NSRect(x: 0, y: 0, width: 320, height: 200))
        let clip = RecordingClipView(frame: scroll.bounds)
        scroll.contentView = clip
        scroll.bind(node)
        let document = FlippedView(frame: .zero)
        let content = FlippedView(frame: NSRect(x: 0, y: 0, width: 640, height: 600))
        document.addSubview(content)
        scroll.documentView = document
        scroll.synchronizeDocument()

        for point in [NSPoint(x: -18, y: -24), NSPoint(x: document.frame.width - scroll.contentSize.width + 18, y: document.frame.height - scroll.contentSize.height + 24)] {
            // AppKit temporarily moves clip bounds beyond the document during rubber banding.
            clip.allowsOverscroll = true
            clip.setBoundsOrigin(point)
            clip.allowsOverscroll = false
            scroll.publishScrollMetrics()
            XCTAssertEqual(clip.bounds.origin, point)
            clip.scrollCommands = 0
            for _ in 0..<5 { scroll.synchronizeDocument() }
            XCTAssertEqual(clip.scrollCommands, 0, "A layout must not counteract AppKit's elastic animation")
            XCTAssertEqual(clip.bounds.origin, point)
            XCTAssertEqual(node.forProperty("scrollTop")?.toDouble(), point.y)

            node.setValue(["top": -100, "left": -100], forProperty: "scrollRequest")
            scroll.synchronizeDocument()
            XCTAssertEqual(clip.bounds.origin, .zero, "Explicit programmatic scrolling still clamps to the document")
            XCTAssertTrue(try XCTUnwrap(node.forProperty("scrollRequest")).isNull)
        }
        clip.setBoundsOrigin(NSPoint(x: 100, y: 300))
        scroll.publishScrollMetrics()
        content.frame.size = NSSize(width: 100, height: 50)
        scroll.synchronizeDocument()
        XCTAssertEqual(clip.bounds.origin, .zero, "Shrinking content still releases an invalid scroll position")
        content.frame.size = NSSize(width: 640, height: 600)
        scroll.synchronizeDocument()
        node.setValue(["top": 80], forProperty: "scrollRequest")
        clip.setBoundsOrigin(NSPoint(x: 0, y: 20))
        scroll.publishScrollMetrics()
        scroll.synchronizeDocument()
        XCTAssertEqual(clip.bounds.minY, 80, "Native observations cannot overwrite a pending programmatic request")
    }
}

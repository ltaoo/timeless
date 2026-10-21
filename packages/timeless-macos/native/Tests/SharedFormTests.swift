import Cocoa
import JavaScriptCore
import XCTest
@testable import TimelessMacOS

final class SharedFormTests: XCTestCase {
    func testShadcnFormsAndHostCapabilities() throws {
        guard let path = ProcessInfo.processInfo.environment["TIMELESS_MACOS_TEST_BUNDLE"] else { throw XCTSkip("Set TIMELESS_MACOS_TEST_BUNDLE") }
        _ = NSApplication.shared
        let bridge = JSBridge(devScriptPath: path)
        let renderer = NativeViewRenderer(bridge: bridge)
        var root: NSView?
        bridge.onRender = { root = renderer.render($0, containerWidth: 1000, containerHeight: 800) }
        bridge.onRelayout = { renderer.relayout() }
        bridge.run()
        let view = try XCTUnwrap(root)
        let window = NSWindow(contentRect: view.bounds, styleMask: [.titled], backing: .buffered, defer: false)
        window.contentView = view
        defer { window.orderOut(nil) }
        func settle() { RunLoop.main.run(until: Date().addingTimeInterval(0.05)) }
        func all(_ node: NSView) -> [NSView] { [node] + node.subviews.flatMap(all) }
        func element(_ name: String) throws -> NSView { try XCTUnwrap(all(view).first { $0.identifier?.rawValue == name }, name) }
        func press(_ name: String) throws { XCTAssertTrue(try XCTUnwrap(element(name) as? FlippedView).accessibilityPerformPress()); settle() }
        func text(_ name: String) throws -> String { all(try element(name)).compactMap { ($0 as? NSTextField)?.stringValue }.joined() }
        func capture(_ name: String) throws {
            guard let directory = ProcessInfo.processInfo.environment["TIMELESS_MACOS_SCREENSHOTS"] else { return }
            try FileManager.default.createDirectory(atPath: directory, withIntermediateDirectories: true)
            window.orderFrontRegardless()
            RunLoop.main.run(until: Date().addingTimeInterval(0.1))
            let process = Process()
            process.executableURL = URL(fileURLWithPath: "/usr/sbin/screencapture")
            process.arguments = ["-x", "-o", "-l", String(window.windowNumber), directory + "/" + name + ".png"]
            try process.run(); process.waitUntilExit()
            XCTAssertEqual(process.terminationStatus, 0)
            window.orderOut(nil)
        }
        settle()
        try press("nav-data_entry")
        XCTAssertEqual(try text("label-name"), "姓名")
        XCTAssertGreaterThan(try element("label-name").frame.height, 0)
        XCTAssertEqual(try element("form-agreed-box").frame.height, 16, accuracy: 0.1)
        let notifications = try XCTUnwrap(element("form-notifications") as? FlippedView)
        XCTAssertEqual(notifications.frame.width, 44, accuracy: 0.1)
        XCTAssertEqual(notifications.layer?.cornerRadius, 12)
        let thumb = try XCTUnwrap(all(notifications).first { ($0 as? FlippedView)?.jsNode?.forProperty("style")?.forProperty("translate")?.isString == true })
        let checkedX = thumb.frame.minX
        try press("form-notifications")
        XCTAssertEqual(checkedX - thumb.frame.minX, 20, accuracy: 0.1)
        try press("form-notifications")
        try capture("shared-native-forms")
        try press("form-submit")
        XCTAssertEqual(try text("form-result"), "请输入姓名。")
        for (key, value) in [("form-name", "Timeless"), ("form-email", "native@example.com")] {
            let field = try XCTUnwrap(element(key) as? NSTextField)
            XCTAssertGreaterThan(field.frame.width, 200)
            field.stringValue = value
            field.delegate?.controlTextDidChange?(Notification(name: NSControl.textDidChangeNotification, object: field))
            settle()
        }
        try press("form-role")
        func key(_ code: UInt16, _ characters: String) throws {
            let target = try XCTUnwrap(window.firstResponder as? FlippedView)
            let event = try XCTUnwrap(NSEvent.keyEvent(with: .keyDown, location: .zero, modifierFlags: [], timestamp: 0, windowNumber: window.windowNumber, context: nil, characters: characters, charactersIgnoringModifiers: characters, isARepeat: false, keyCode: code))
            target.keyDown(with: event); settle()
        }
        try key(125, "\u{F701}")
        try key(36, "\r")
        XCTAssertTrue(try text("form-role").contains("设计师"), "ArrowDown and Enter select an option through the native keyboard bridge")
        try press("form-role")
        let select = try XCTUnwrap(renderer.floatingLayer?.presented.last)
        XCTAssertGreaterThan(select.surface.frame.width, 100)
        let option = try XCTUnwrap(all(select.surface).compactMap { $0 as? FlippedView }.first { $0.jsNode?.forProperty("attrs")?.forProperty("data-value")?.toString() == "designer" })
        XCTAssertTrue(option.accessibilityPerformPress()); settle()
        XCTAssertTrue(try text("form-role").contains("设计师"))
        XCTAssertTrue(renderer.floatingLayer?.presented.isEmpty == true)
        try press("form-dates-trigger")
        let calendar = try XCTUnwrap(renderer.floatingLayer?.presented.last)
        XCTAssertGreaterThan(calendar.surface.frame.width, 500)
        let previous = try element("calendar-leftPrev")
        let header = try XCTUnwrap(previous.superview)
        XCTAssertEqual(previous.frame.height, 28, accuracy: 0.1)
        let title = try XCTUnwrap(all(header).compactMap { $0 as? NSTextField }.first)
        XCTAssertEqual(header.convert(title.bounds, from: title).midY, previous.frame.midY, accuracy: 1, "Calendar header uses CSS's default flex row")
        try capture("shared-native-date-range")
        let originalDates = Set(all(calendar.surface).compactMap { ($0 as? FlippedView)?.jsNode?.forProperty("attrs")?.forProperty("data-date")?.toString() }.filter { $0 != "undefined" })
        try press("calendar-leftPrev")
        let previousDates = Set(all(calendar.surface).compactMap { ($0 as? FlippedView)?.jsNode?.forProperty("attrs")?.forProperty("data-date")?.toString() }.filter { $0 != "undefined" })
        XCTAssertNotEqual(previousDates, originalDates, "Month navigation replaces the mounted calendar days")
        let days = all(calendar.surface).compactMap { $0 as? FlippedView }.filter { $0.jsNode?.forProperty("attrs")?.hasProperty("data-date") == true }
        XCTAssertGreaterThanOrEqual(days.count, 56)
        XCTAssertGreaterThan(days[1].frame.minX, days[0].frame.minX)
        XCTAssertEqual(days[1].frame.minY, days[0].frame.minY, accuracy: 0.01)
        XCTAssertTrue(days[10].accessibilityPerformPress()); settle()
        XCTAssertTrue(days[14].accessibilityPerformPress()); settle()
        XCTAssertTrue(try text("form-date-value").contains(" - "))
        let picker = try XCTUnwrap(element("form-files") as? FlippedView)
        XCTAssertTrue(picker.jsNode?.forProperty("_pickFiles")?.isObject == true)
        let file = FileManager.default.temporaryDirectory.appendingPathComponent("timeless-form-\(UUID().uuidString).txt")
        try "Example".write(to: file, atomically: true, encoding: .utf8)
        defer { try? FileManager.default.removeItem(at: file) }
        let descriptor = NativeFilePickerDialog.describe([file])
        XCTAssertEqual(descriptor.first?["size"] as? Int, 7)
        picker.jsNode?.forProperty("_receiveFiles")?.call(withArguments: [descriptor]); settle()
        XCTAssertEqual(try text("form-file-value"), file.lastPathComponent)
        picker.jsNode?.forProperty("_pickFiles")?.call(withArguments: []); settle()
        let sheet = try XCTUnwrap(window.attachedSheet as? NSOpenPanel)
        sheet.cancel(nil); settle()
        XCTAssertEqual(try text("form-file-value"), file.lastPathComponent, "Cancelling the system file window keeps the selection")
        let panel = NativeFilePickerDialog.panel(accept: ".txt,.pdf", multiple: true)
        XCTAssertTrue(panel.allowsMultipleSelection)
        XCTAssertFalse(panel.canChooseDirectories)
        XCTAssertEqual(panel.allowedContentTypes.count, 2)
        try press("form-agreed-box")
        try press("form-submit")
        XCTAssertTrue(try text("form-result").hasPrefix("已提交：Timeless · designer"))
        let result = try element("form-result")
        result.scrollToVisible(result.bounds); settle()
        try capture("shared-native-form-result")
        try press("nav-general"); try press("nav-data_entry")
        XCTAssertEqual((try element("form-name") as? NSTextField)?.stringValue, "Timeless")
        try press("form-reset")
        XCTAssertEqual((try element("form-name") as? NSTextField)?.stringValue, "")
        XCTAssertEqual(try text("form-file-value"), "尚未选择文件")
        XCTAssertTrue(bridge.runtimeErrors.isEmpty, bridge.runtimeErrors.joined(separator: "\n"))
    }
}

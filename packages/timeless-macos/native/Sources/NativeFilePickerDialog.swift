import Cocoa
import JavaScriptCore
import UniformTypeIdentifiers

enum NativeFilePickerDialog {
    static func panel(accept: String, multiple: Bool) -> NSOpenPanel {
        let panel = NSOpenPanel()
        panel.canChooseFiles = true
        panel.canChooseDirectories = false
        panel.allowsMultipleSelection = multiple
        let types = accept.split(separator: ",").compactMap { part -> UTType? in
            let token = part.trimmingCharacters(in: .whitespaces).lowercased()
            if token.hasPrefix(".") { return UTType(filenameExtension: String(token.dropFirst())) }
            if token == "image/*" { return .image }
            if token == "audio/*" { return .audio }
            if token == "video/*" { return .movie }
            return UTType(mimeType: token)
        }
        if !types.isEmpty { panel.allowedContentTypes = types }
        return panel
    }

    static func describe(_ urls: [URL]) -> [[String: Any]] {
        urls.compactMap { url in
            guard let values = try? url.resourceValues(forKeys: [.isRegularFileKey, .fileSizeKey, .contentModificationDateKey, .contentTypeKey]), values.isRegularFile == true else { return nil }
            return ["name": url.lastPathComponent, "kind": "file", "path": url.path,
                    "type": values.contentType?.preferredMIMEType ?? "application/octet-stream",
                    "size": values.fileSize ?? 0, "lastModified": (values.contentModificationDate?.timeIntervalSince1970 ?? 0) * 1000]
        }
    }

    static func open(node: JSValue, window: NSWindow?) {
        let options = node.forProperty("filePicker")
        let picker = panel(accept: options?.forProperty("accept")?.toString() ?? "", multiple: options?.forProperty("multiple")?.toBool() ?? false)
        let complete: (NSApplication.ModalResponse) -> Void = { response in
            guard response == .OK else { return }
            node.forProperty("_receiveFiles")?.call(withArguments: [describe(picker.urls)])
        }
        if let window = window { picker.beginSheetModal(for: window, completionHandler: complete) }
        else { picker.begin(completionHandler: complete) }
    }
}

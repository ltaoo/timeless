# Swift + SwiftUI 文件选择器

## 运行方式

1. 在 Xcode 中打开 `FilePickerDemo.swift`
2. 运行项目 (⌘R)
3. 需要在 TARGETS -> Signing & Capabilities 添加以下权限：
   - com.apple.security.app-sandbox: YES
   - com.apple.security.files.user-selected.read-only: YES

## 功能

- 单文件选择
- 多文件选择
- 文件夹选择
- 显示已选择文件列表
- 删除已选文件

## SwiftUI 文件选择可用组件

### 文件选择

| 组件/类                  | 说明           |
| ------------------------ | -------------- |
| **DocumentPicker**       | 文档选择器     |
| **UTType**               | 文件类型定义   |
| **FileManager**          | 文件管理器     |
| **NSOpenPanel (AppKit)** | macOS 文件面板 |

### 文件展示

| 组件        | 说明        |
| ----------- | ----------- |
| **List**    | 文件列表    |
| **ForEach** | 循环渲染    |
| **Label**   | 文件图标+名 |
| **Image**   | 文件图标    |

## 示例代码

### DocumentPickerLaunched - 文档选择器包装器

```swift
struct DocumentPickerLaunched: UIViewControllerRepresentable {
    let types: [UTType]
    let onPick: ([URL]) -> Void

    func makeUIViewController(context: Context) -> UIDocumentPickerViewController {
        let picker = UIDocumentPickerViewController(forOpeningContentTypes: types, asCopy: true)
        picker.allowsMultipleSelection = true
        picker.delegate = context.coordinator
        return picker
    }

    func updateUIViewController(_ uiViewController: UIDocumentPickerViewController, context: Context) {}

    func makeCoordinator() -> Coordinator {
        Coordinator(onPick: onPick)
    }

    class Coordinator: NSObject, UIDocumentPickerDelegate {
        let onPick: ([URL]) -> Void

        init(onPick: @escaping ([URL]) -> Void) {
            self.onPick = onPick
        }

        func documentPicker(_ controller: UIDocumentPickerViewController, didPickDocumentsAt urls: [URL]) {
            onPick(urls)
        }
    }
}
```

### 文件图标获取

```swift
func fileIcon(for url: URL) -> String {
    switch url.pathExtension.lowercased() {
    case "pdf": return "doc.fill"
    case "jpg", "jpeg", "png", "gif": return "photo.fill"
    case "mp3", "wav", "m4a": return "music.note"
    case "mp4", "mov", "avi": return "video.fill"
    case "txt", "md": return "doc.text.fill"
    case "pdf": return "doc.fill"
    default: return "doc.fill"
    }
}
```

### 文件大小格式化

```swift
func formatFileSize(_ url: URL) -> String {
    do {
        let resourceValues = try url.resourceValues(forKeys: [.fileSizeKey])
        if let size = resourceValues.fileSize {
            let formatter = ByteCountFormatter()
            formatter.allowedUnits = [.useKB, .useMB, .useGB]
            formatter.countStyle = .file
            return formatter.string(fromByteCount: Int64(size))
        }
    } catch {}
    return "Unknown"
}
```

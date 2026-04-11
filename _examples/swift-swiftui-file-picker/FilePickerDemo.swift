import SwiftUI
import UniformTypeIdentifiers

struct SelectedFile: Identifiable {
    let id = UUID()
    let url: URL
}

struct DocumentPickerLaunched: UIViewControllerRepresentable {
    let types: [UTType]
    let allowsMultipleSelection: Bool
    let onPick: ([URL]) -> Void
    
    func makeUIViewController(context: Context) -> UIDocumentPickerViewController {
        let picker = UIDocumentPickerViewController(forOpeningContentTypes: types, asCopy: true)
        picker.allowsMultipleSelection = allowsMultipleSelection
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

struct ContentView: View {
    @State private var selectedFiles: [SelectedFile] = []
    
    @State private var showImagePicker = false
    @State private var showDocumentPicker = false
    @State private var showFolderPicker = false
    
    var body: some View {
        VStack(spacing: 20) {
            Text("文件选择器示例")
                .font(.title)
                .padding(.top)
            
            VStack(spacing: 12) {
                Button {
                    showImagePicker = true
                } label: {
                    HStack {
                        Image(systemName: "photo.fill")
                        Text("选择图片")
                        Spacer()
                        Image(systemName: "chevron.right")
                    }
                    .padding()
                    .background(Color.blue.opacity(0.1))
                    .cornerRadius(10)
                }
                .buttonStyle(.plain)
                
                Button {
                    showDocumentPicker = true
                } label: {
                    HStack {
                        Image(systemName: "doc.fill")
                        Text("选择文档")
                        Spacer()
                        Image(systemName: "chevron.right")
                    }
                    .padding()
                    .background(Color.green.opacity(0.1))
                    .cornerRadius(10)
                }
                .buttonStyle(.plain)
                
                Button {
                    showImagePicker = true
                } label: {
                    HStack {
                        Image(systemName: "folder.fill")
                        Text("选择多个文件")
                        Spacer()
                        Image(systemName: "chevron.right")
                    }
                    .padding()
                    .background(Color.orange.opacity(0.1))
                    .cornerRadius(10)
                }
                .buttonStyle(.plain)
            }
            .padding(.horizontal)
            
            if !selectedFiles.isEmpty {
                VStack(alignment: .leading, spacing: 8) {
                    Text("已选择 \(selectedFiles.count) 个文件")
                        .font(.headline)
                        .padding(.horizontal)
                    
                    List {
                        ForEach(selectedFiles) { file in
                            HStack {
                                Image(systemName: fileIcon(for: file.url))
                                    .foregroundColor(.blue)
                                    .frame(width: 30)
                                
                                VStack(alignment: .leading) {
                                    Text(file.url.lastPathComponent)
                                        .lineLimit(1)
                                    Text(formatFileSize(file.url))
                                        .font(.caption)
                                        .foregroundColor(.secondary)
                                }
                                
                                Spacer()
                                
                                Button {
                                    removeFile(file)
                                } label: {
                                    Image(systemName: "xmark.circle.fill")
                                        .foregroundColor(.red)
                                }
                                .buttonStyle(.plain)
                            }
                        }
                    }
                    .listStyle(.plain)
                    .frame(maxHeight: 200)
                }
            }
            
            Spacer()
        }
        
        DocumentPickerLaunched(
            types: [.image],
            allowsMultipleSelection: false
        ) { urls in
            addFiles(urls)
        }
        .ignoresSafeArea()
        .hidden()
        
        DocumentPickerLaunched(
            types: [.pdf, .text, .plainText, .data],
            allowsMultipleSelection: true
        ) { urls in
            addFiles(urls)
        }
        .ignoresSafeArea()
        .hidden()
    }
    
    private func addFiles(_ urls: [URL]) {
        for url in urls {
            if !selectedFiles.contains(where: { $0.url == url }) {
                selectedFiles.append(SelectedFile(url: url))
            }
        }
    }
    
    private func removeFile(_ file: SelectedFile) {
        selectedFiles.removeAll { $0.id == file.id }
    }
    
    private func fileIcon(for url: URL) -> String {
        let ext = url.pathExtension.lowercased()
        switch ext {
        case "jpg", "jpeg", "png", "gif", "heic", "webp":
            return "photo.fill"
        case "mp3", "wav", "m4a", "aac", "flac":
            return "music.note"
        case "mp4", "mov", "avi", "mkv", "webm":
            return "video.fill"
        case "pdf":
            return "doc.fill"
        case "txt", "md":
            return "doc.text.fill"
        case "zip", "rar", "7z":
            return "doc.zipper"
        default:
            return "doc.fill"
        }
    }
    
    private func formatFileSize(_ url: URL) -> String {
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
}

#Preview {
    ContentView()
}

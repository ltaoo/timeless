import 'package:flutter/material.dart';
import 'package:file_picker/file_picker.dart';

class SelectedFile {
  final PlatformFile file;

  SelectedFile(this.file);
}

class FilePickerDemo extends StatefulWidget {
  const FilePickerDemo({Key? key}) : super(key: key);

  @override
  State<FilePickerDemo> createState() => _FilePickerDemoState();
}

class _FilePickerDemoState extends State<FilePickerDemo> {
  List<SelectedFile> _selectedFiles = [];

  Future<void> _pickImage() async {
    FilePickerResult? result = await FilePicker.platform.pickFiles(
      type: FileType.image,
    );

    if (result != null) {
      setState(() {
        for (var file in result.files) {
          if (!_selectedFiles.any((f) => f.file.path == file.path)) {
            _selectedFiles.add(SelectedFile(file));
          }
        }
      });
    }
  }

  Future<void> _pickDocument() async {
    FilePickerResult? result = await FilePicker.platform.pickFiles(
      type: FileType.custom,
      allowedExtensions: ['pdf', 'doc', 'docx', 'txt', 'xls', 'xlsx'],
    );

    if (result != null) {
      setState(() {
        for (var file in result.files) {
          if (!_selectedFiles.any((f) => f.file.path == file.path)) {
            _selectedFiles.add(SelectedFile(file));
          }
        }
      });
    }
  }

  Future<void> _pickMultipleFiles() async {
    FilePickerResult? result = await FilePicker.platform.pickFiles(
      allowMultiple: true,
    );

    if (result != null) {
      setState(() {
        for (var file in result.files) {
          if (!_selectedFiles.any((f) => f.file.path == file.path)) {
            _selectedFiles.add(SelectedFile(file));
          }
        }
      });
    }
  }

  Future<void> _pickFolder() async {
    String? directoryPath = await FilePicker.platform.getDirectoryPath();

    if (directoryPath != null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Selected folder: $directoryPath')),
      );
    }
  }

  void _removeFile(SelectedFile file) {
    setState(() {
      _selectedFiles.remove(file);
    });
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      home: Scaffold(
        appBar: AppBar(
          title: const Text('文件选择器示例'),
          backgroundColor: Colors.blue,
          foregroundColor: Colors.white,
        ),
        body: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildFilePickerButton(
                icon: Icons.image,
                title: '选择图片',
                color: Colors.blue.withOpacity(0.1),
                onTap: _pickImage,
              ),
              const SizedBox(height: 12),
              _buildFilePickerButton(
                icon: Icons.description,
                title: '选择文档',
                color: Colors.green.withOpacity(0.1),
                onTap: _pickDocument,
              ),
              const SizedBox(height: 12),
              _buildFilePickerButton(
                icon: Icons.folder,
                title: '选择多个文件',
                color: Colors.orange.withOpacity(0.1),
                onTap: _pickMultipleFiles,
              ),
              const SizedBox(height: 12),
              _buildFilePickerButton(
                icon: Icons.folder_open,
                title: '选择文件夹',
                color: Colors.purple.withOpacity(0.1),
                onTap: _pickFolder,
              ),
              if (_selectedFiles.isNotEmpty) ...[
                const SizedBox(height: 24),
                Text(
                  '已选择 ${_selectedFiles.length} 个文件',
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: 8),
                Expanded(
                  child: ListView.builder(
                    itemCount: _selectedFiles.length,
                    itemBuilder: (context, index) {
                      final file = _selectedFiles[index];
                      return Card(
                        margin: const EdgeInsets.only(bottom: 8),
                        child: ListTile(
                          leading: Icon(
                            _getIconForExtension(file.file.extension),
                            color: Colors.blue,
                            size: 32,
                          ),
                          title: Text(
                            file.file.name,
                            overflow: TextOverflow.ellipsis,
                          ),
                          subtitle: Text(
                            formatFileSize(file.file.size),
                            style: const TextStyle(
                              fontSize: 12,
                              color: Colors.grey,
                            ),
                          ),
                          trailing: IconButton(
                            icon: const Icon(
                              Icons.close,
                              color: Colors.red,
                            ),
                            onPressed: () => _removeFile(file),
                          ),
                        ),
                      );
                    },
                  ),
                ),
              ] else
                const Spacer(),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildFilePickerButton({
    required IconData icon,
    required String title,
    required Color color,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: color,
          borderRadius: BorderRadius.circular(10),
        ),
        child: Row(
          children: [
            Icon(icon),
            const SizedBox(width: 16),
            Text(
              title,
              style: const TextStyle(fontSize: 16),
            ),
            const Spacer(),
            const Icon(Icons.chevron_right),
          ],
        ),
      ),
    );
  }

  IconData _getIconForExtension(String? extension) {
    switch (extension?.toLowerCase()) {
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'webp':
      case 'heic':
        return Icons.image;
      case 'mp3':
      case 'wav':
      case 'm4a':
      case 'aac':
      case 'flac':
        return Icons.audio_file;
      case 'mp4':
      case 'mov':
      case 'avi':
      case 'mkv':
      case 'webm':
        return Icons.video_file;
      case 'pdf':
        return Icons.picture_as_pdf;
      case 'doc':
      case 'docx':
        return Icons.description;
      case 'xls':
      case 'xlsx':
        return Icons.table_chart;
      case 'zip':
      case 'rar':
      case '7z':
        return Icons.folder_zip;
      default:
        return Icons.insert_drive_file;
    }
  }

  String formatFileSize(int bytes) {
    if (bytes < 1024) return '$bytes B';
    if (bytes < 1024 * 1024) return '${(bytes / 1024).toStringAsFixed(1)} KB';
    if (bytes < 1024 * 1024 * 1024) {
      return '${(bytes / (1024 * 1024)).toStringAsFixed(1)} MB';
    }
    return '${(bytes / (1024 * 1024 * 1024)).toStringAsFixed(1)} GB';
  }
}

void main() {
  runApp(const FilePickerDemo());
}

# Flutter 文件选择器

## 运行方式

1. 在 Flutter 项目中添加依赖：

```yaml
dependencies:
  file_picker: ^6.1.1
```

2. 运行项目：

```bash
flutter run
```

## 功能

- 单文件选择
- 多文件选择
- 按类型过滤文件（图片、文档、音频、视频）
- 显示已选择文件列表
- 删除已选文件

## Flutter 文件选择可用组件

### file_picker 插件

| 方法                 | 说明         |
| -------------------- | ------------ |
| **pickFile**         | 选择单个文件 |
| **pickFiles**        | 选择多个文件 |
| **getDirectoryPath** | 选择文件夹   |

### FileType 枚举

| 值                  | 说明       |
| ------------------- | ---------- |
| **FileType.any**    | 任意类型   |
| **FileType.image**  | 图片       |
| **FileType.video**  | 视频       |
| **FileType.audio**  | 音频       |
| **FileType.custom** | 自定义类型 |

### XFile 属性

| 属性      | 说明     |
| --------- | -------- |
| **path**  | 文件路径 |
| **name**  | 文件名   |
| **bytes** | 文件字节 |

## 示例代码

### 基本使用

```dart
import 'package:file_picker/file_picker.dart';

FilePickerResult? result = await FilePicker.platform.pickFiles();

if (result != null) {
  PlatformFile file = result.files.first;
  print('File name: ${file.name}');
  print('File size: ${file.size}');
  print('File path: ${file.path}');
}
```

### 多文件选择

```dart
FilePickerResult? result = await FilePicker.platform.pickFiles(
  allowMultiple: true,
  type: FileType.image,
);

if (result != null) {
  List<PlatformFile> files = result.files;
  for (var file in files) {
    print('${file.name} - ${file.size} bytes');
  }
}
```

### 按类型过滤

```dart
// 仅图片
final result = await FilePicker.platform.pickFiles(
  type: FileType.image,
);

// 自定义类型
final result = await FilePicker.platform.pickFiles(
  type: FileType.custom,
  allowedExtensions: ['pdf', 'doc', 'docx'],
);
```

### 文件夹选择

```dart
String? directoryPath = await FilePicker.platform.getDirectoryPath();

if (directoryPath != null) {
  print('Selected folder: $directoryPath');
}
```

### 带初始目录

```dart
final result = await FilePicker.platform.pickFiles(
  initialDirectory: '/Users/name/Documents',
);
```

### 保存文件对话框

```dart
String? savePath = await FilePicker.platform.saveFile(
  dialogTitle: 'Save your file',
  fileName: 'output.pdf',
);

if (savePath != null) {
  // 保存文件到 savePath
}
```

### 文件图标

```dart
IconData getIconForExtension(String? extension) {
  switch (extension?.toLowerCase()) {
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
      return Icons.image;
    case 'mp3':
    case 'wav':
    case 'm4a':
      return Icons.audio_file;
    case 'mp4':
    case 'mov':
    case 'avi':
      return Icons.video_file;
    case 'pdf':
      return Icons.picture_as_pdf;
    default:
      return Icons.insert_drive_file;
  }
}
```

### 文件大小格式化

```dart
String formatFileSize(int bytes) {
  if (bytes < 1024) return '$bytes B';
  if (bytes < 1024 * 1024) return '${(bytes / 1024).toStringAsFixed(1)} KB';
  if (bytes < 1024 * 1024 * 1024) {
    return '${(bytes / (1024 * 1024)).toStringAsFixed(1)} MB';
  }
  return '${(bytes / (1024 * 1024 * 1024)).toStringAsFixed(1)} GB';
}
```

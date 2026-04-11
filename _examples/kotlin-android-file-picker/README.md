# Kotlin + Android 文件选择器

## 运行方式

1. 在 Android Studio 中打开项目
2. 确保在 `AndroidManifest.xml` 中添加以下权限：

```xml
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />
<uses-permission android:name="android.permission.READ_MEDIA_VIDEO" />
<uses-permission android:name="android.permission.READ_MEDIA_AUDIO" />
```

3. 运行项目

## 功能

- 单文件选择
- 多文件选择
- 按类型过滤文件（图片、文档、音频、视频）
- 显示已选择文件列表
- 删除已选文件

## Android 文件选择可用组件

### Intent 方式

| 组件/Intent Action            | 说明             |
| ----------------------------- | ---------------- |
| **ACTION_GET_CONTENT**        | 选择单个文件     |
| **ACTION_OPEN_DOCUMENT**      | 打开文档（可读） |
| **ACTION_OPEN_DOCUMENT_TREE** | 打开文件夹       |

### ActivityResult API

| 类/方法                       | 说明         |
| ----------------------------- | ------------ |
| **registerForActivityResult** | 注册结果回调 |
| **ActivityResultContracts**   | 预定义契约   |
| **CreateDocument**            | 创建文档     |
| **OpenDocument**              | 打开文档     |
| **OpenDocumentTree**          | 打开文件夹   |
| **OpenMultipleDocuments**     | 多文档选择   |

### ContentResolver

| 方法                 | 说明         |
| -------------------- | ------------ |
| **openInputStream**  | 打开输入流   |
| **openOutputStream** | 打开输出流   |
| **query**            | 查询文件信息 |

## 示例代码

### 使用 ActivityResultContracts

```kotlin
// 单文件选择
val pickSingleFile = registerForActivityResult(
    ActivityResultContracts.OpenDocument()
) { uri ->
    uri?.let { handleSelectedFile(it) }
}

// 多文件选择
val pickMultipleFiles = registerForActivityResult(
    ActivityResultContracts.OpenMultipleDocuments()
) { uris ->
    uris?.forEach { handleSelectedFile(it) }
}

// 文件夹选择
val pickFolder = registerForActivityResult(
    ActivityResultContracts.OpenDocumentTree()
) { uri ->
    uri?.let { handleSelectedFolder(it) }
}
```

### 调用选择器

```kotlin
// 选择图片
pickSingleFile.launch(arrayOf("image/*"))

// 选择文档
pickMultipleFiles.launch(arrayOf("application/pdf", "text/plain"))

// 选择文件夹
pickFolder.launch(null)
```

### 处理 URI

```kotlin
private fun handleSelectedFile(uri: Uri) {
    // 需要获取持久化权限
    val flags = Intent.FLAG_GRANT_READ_URI_PERMISSION
    contentResolver.takePersistableUriPermission(uri, flags)

    // 获取文件信息
    val cursor = contentResolver.query(uri, null, null, null, null)
    cursor?.use {
        if (it.moveToFirst()) {
            val nameIndex = it.getColumnIndex(OpenableColumns.DISPLAY_NAME)
            val sizeIndex = it.getColumnIndex(OpenableColumns.SIZE)
            val name = it.getString(nameIndex)
            val size = it.getLong(sizeIndex)
        }
    }
}
```

### 文件类型过滤

```kotlin
// 图片
arrayOf("image/*")

// 视频
arrayOf("video/*")

// 音频
arrayOf("audio/*")

// PDF
arrayOf("application/pdf")

// 多类型
arrayOf(
    "image/*",
    "application/pdf",
    "text/plain"
)
```

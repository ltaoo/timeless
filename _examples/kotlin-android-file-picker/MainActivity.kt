package com.example.filepicker

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.provider.OpenableColumns
import androidx.activity.ComponentActivity
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import com.example.filepicker.ui.theme.FilePickerTheme

data class SelectedFile(
    val uri: Uri,
    val name: String,
    val size: Long,
    val mimeType: String?
)

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            FilePickerTheme {
                FilePickerScreen()
            }
        }
    }
}

@Composable
fun FilePickerScreen() {
    var selectedFiles by remember { mutableStateOf(listOf<SelectedFile>()) }
    
    val pickImageLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.OpenDocument()
    ) { uri ->
        uri?.let { handleSelectedFile(it, selectedFiles, ::selectedFiles) }
    }
    
    val pickDocumentLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.OpenDocument()
    ) { uri ->
        uri?.let { handleSelectedFile(it, selectedFiles, ::selectedFiles) }
    }
    
    val pickMultipleLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.OpenMultipleDocuments()
    ) { uris ->
        uris?.forEach { uri ->
            handleSelectedFile(uri, selectedFiles, ::selectedFiles)
        }
    }
    
    val pickFolderLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.OpenDocumentTree()
    ) { uri ->
        uri?.let {
            contentResolver.takePersistableUriPermission(
                it,
                Intent.FLAG_GRANT_READ_URI_PERMISSION
            )
        }
    }
    
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        Text(
            text = "文件选择器示例",
            style = MaterialTheme.typography.h5,
            modifier = Modifier.padding(bottom = 16.dp)
        )
        
        Column(
            modifier = Modifier.fillMaxWidth(),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            FilePickerButton(
                icon = Icons.Default.Image,
                title = "选择图片",
                color = Color.Blue.copy(alpha = 0.1f),
                onClick = {
                    pickImageLauncher.launch(arrayOf("image/*"))
                }
            )
            
            FilePickerButton(
                icon = Icons.Default.Description,
                title = "选择文档",
                color = Color.Green.copy(alpha = 0.1f),
                onClick = {
                    pickDocumentLauncher.launch(arrayOf(
                        "application/pdf",
                        "text/plain",
                        "application/msword",
                        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    ))
                }
            )
            
            FilePickerButton(
                icon = Icons.Default.Folder,
                title = "选择多个文件",
                color = Color(0xFFFF9800).copy(alpha = 0.1f),
                onClick = {
                    pickMultipleLauncher.launch(arrayOf("*/*"))
                }
            )
            
            FilePickerButton(
                icon = Icons.Default.FolderOpen,
                title = "选择文件夹",
                color = Color.Purple.copy(alpha = 0.1f),
                onClick = {
                    pickFolderLauncher.launch(null)
                }
            )
        }
        
        if (selectedFiles.isNotEmpty()) {
            Spacer(modifier = Modifier.height(24.dp))
            
            Text(
                text = "已选择 ${selectedFiles.size} 个文件",
                style = MaterialTheme.typography.subtitle1
            )
            
            Spacer(modifier = Modifier.height(8.dp))
            
            LazyColumn(
                modifier = Modifier.fillMaxWidth(),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                items(selectedFiles) { file ->
                    FileItem(
                        file = file,
                        onDelete = {
                            selectedFiles = selectedFiles.filter { it.uri != file.uri }
                        }
                    )
                }
            }
        }
    }
}

@Composable
fun FilePickerButton(
    icon: ImageVector,
    title: String,
    color: Color,
    onClick: () -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .background(color, RoundedCornerShape(10.dp))
            .clickable(onClick = onClick)
            .padding(16.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Icon(
            imageVector = icon,
            contentDescription = null,
            tint = Color.Unspecified
        )
        Spacer(modifier = Modifier.width(16.dp))
        Text(
            text = title,
            style = MaterialTheme.typography.bodyLarge
        )
        Spacer(modifier = Modifier.weight(1f))
        Icon(
            imageVector = Icons.Default.ChevronRight,
            contentDescription = null
        )
    }
}

@Composable
fun FileItem(
    file: SelectedFile,
    onDelete: () -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        elevation = 2.dp
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                imageVector = getIconForMimeType(file.mimeType),
                contentDescription = null,
                tint = Color.Blue,
                modifier = Modifier.size(32.dp)
            )
            
            Spacer(modifier = Modifier.width(12.dp))
            
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = file.name,
                    style = MaterialTheme.typography.bodyMedium,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
                Text(
                    text = formatFileSize(file.size),
                    style = MaterialTheme.typography.caption,
                    color = Color.Gray
                )
            }
            
            IconButton(onClick = onDelete) {
                Icon(
                    imageVector = Icons.Default.Close,
                    contentDescription = "删除",
                    tint = Color.Red
                )
            }
        }
    }
}

private fun handleSelectedFile(
    uri: Uri,
    currentFiles: List<SelectedFile>,
    updateFiles: (List<SelectedFile>) -> Unit
) {
    val context = android.app.Application()
    val contentResolver = context.contentResolver
    
    contentResolver.takePersistableUriPermission(
        uri,
        Intent.FLAG_GRANT_READ_URI_PERMISSION
    )
    
    val mimeType = contentResolver.getType(uri)
    val fileName: String
    val fileSize: Long
    
    contentResolver.query(uri, null, null, null, null)?.use { cursor ->
        if (cursor.moveToFirst()) {
            val nameIndex = cursor.getColumnIndex(OpenableColumns.DISPLAY_NAME)
            val sizeIndex = cursor.getColumnIndex(OpenableColumns.SIZE)
            fileName = if (nameIndex >= 0) cursor.getString(nameIndex) else "Unknown"
            fileSize = if (sizeIndex >= 0) cursor.getLong(sizeIndex) else 0L
        } else {
            fileName = "Unknown"
            fileSize = 0L
        }
    }
    
    if (!currentFiles.any { it.uri == uri }) {
        updateFiles(currentFiles + SelectedFile(uri, fileName, fileSize, mimeType))
    }
}

private fun getIconForMimeType(mimeType: String?): ImageVector {
    return when {
        mimeType?.startsWith("image/") == true -> Icons.Default.Image
        mimeType?.startsWith("video/") == true -> Icons.Default.VideoFile
        mimeType?.startsWith("audio/") == true -> Icons.Default.AudioFile
        mimeType?.contains("pdf") == true -> Icons.Default.PictureAsPdf
        else -> Icons.Default.Description
    }
}

private fun formatFileSize(size: Long): String {
    return when {
        size < 1024 -> "$size B"
        size < 1024 * 1024 -> "${size / 1024} KB"
        size < 1024 * 1024 * 1024 -> "${size / (1024 * 1024)} MB"
        else -> "${size / (1024 * 1024 * 1024)} GB"
    }
}

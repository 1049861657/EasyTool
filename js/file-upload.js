document.addEventListener('DOMContentLoaded', function() {
    const fileInput = document.getElementById('fileInput');
    const fileUploadButton = document.getElementById('fileUploadButton');
    const fileDropZone = document.getElementById('fileDropZone');

    if (!fileInput || !fileUploadButton || !fileDropZone) {
        console.error('必要的DOM元素未找到');
        return;
    }

    // 添加拖放支持
    fileDropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        fileDropZone.classList.add('drag-over');
    });

    fileDropZone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        fileDropZone.classList.remove('drag-over');
    });

    fileDropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        fileDropZone.classList.remove('drag-over');
        const files = e.dataTransfer.files;
        fileInput.files = files;
        handleFileSelect({ target: { files } });
    });

    // 处理文件选择
    function handleFileSelect(event) {
        const files = event.target.files;
        const maxSize = 10 * 1024 * 1024; // 10MB
        const selectedFiles = document.getElementById('selectedFilesList');
        selectedFiles.innerHTML = '';

        Array.from(files).forEach(file => {
            if (file.size > maxSize) {
                alert(`${file.name} 超过10MB限制，请选择更小的文件`);
                return;
            }
            
            const fileSpan = document.createElement('span');
            fileSpan.textContent = `${file.name} (${formatFileSize(file.size)})`;
            selectedFiles.appendChild(fileSpan);
        });
    }

    // 添加格式化时间函数
    function formatDateTime(dateString) {
        return new Intl.DateTimeFormat('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        }).format(new Date(dateString));
    }

    // 格式化文件大小
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // 修改删除件函数
    async function deleteFile(id) {
        const deleteBtn = document.querySelector(`.delete-btn[data-id="${id}"]`);
        try {
            // 添加删除中状态
            deleteBtn.textContent = '删除中...';
            deleteBtn.disabled = true;
            deleteBtn.style.opacity = '0.7';

            const response = await fetch(`${window.location.origin}/api/upload/files/${id}`, {
                method: 'DELETE'
            });

            const result = await response.json();
            
            if (result.success) {
                alert('删除成功！');
                await loadFiles(); // 重新加载文件列表
            } else {
                throw new Error(result.message || '删除失败');
            }
        } catch (error) {
            console.error('删除失败:', error);
            alert('删除失败: ' + error.message);
            // 恢复按钮状态
            deleteBtn.textContent = '删除';
            deleteBtn.disabled = false;
            deleteBtn.style.opacity = '1';
        }
    }

    // 添加文件图标映射函数
    function getFileIcon(fileName) {
        const ext = fileName.toLowerCase().split('.').pop();
        switch (ext) {
            case 'txt':
                return '📝';  // 文本文件
            case 'pdf':
                return '📄';  // PDF文件
            case 'doc':
            case 'docx':
                return '📃';  // Word文档
            case 'xls':
            case 'xlsx':
                return '📊';  // Excel表格
            case 'ppt':
            case 'pptx':
                return '📑';  // PPT演示文稿
            case 'jpg':
            case 'jpeg':
            case 'png':
            case 'gif':
                return '🖼️';  // 图片文件
            case 'zip':
            case 'rar':
            case '7z':
            case 'tar':
            case 'gz':
                return '📦';  // 压缩文件
            case 'mp3':
            case 'wav':
            case 'ogg':
                return '🎵';  // 音频文件
            case 'mp4':
            case 'avi':
            case 'mov':
                return '🎬';  // 视频文件
            case 'xml':
            case 'json':
            case 'yml':
                return '📋';  // 配置/数据文件
            default:
                return '📄';  // 默认文件图标
        }
    }

    // 修改加载文件函数
    async function loadFiles() {
        const fileGrid = document.getElementById('fileGrid');
        try {
            // 先清空文件网格
            fileGrid.innerHTML = '';
            
            // 添加加载动画到文件列表下方
            const loadingSpinner = document.createElement('div');
            loadingSpinner.className = 'loading-spinner';
            fileGrid.appendChild(loadingSpinner);

            const response = await fetch(`${window.location.origin}/api/upload/files`);
            const result = await response.json();
            
            if (result.success) {
                fileGrid.innerHTML = '';

                if (result.files && result.files.length > 0) {
                    result.files.forEach((file, index) => {
                        const fileItem = document.createElement('div');
                        fileItem.className = 'file-item fade-in';
                        fileItem.innerHTML = `
                            <div class="file-icon">${getFileIcon(file.name)}</div>
                            <div class="file-name">${file.name}</div>
                            <div class="file-size">${formatFileSize(file.size)}</div>
                            <div class="upload-time">${formatDateTime(file.upload_time)}</div>
                            <div class="file-actions">
                                <button class="download-btn" onclick="downloadFile('${file.public_id}', '${file.name}')">下载</button>
                                <button class="delete-btn" data-id="${file.id}">删除</button>
                            </div>
                        `;
                        fileGrid.appendChild(fileItem);

                        // 添加删除按钮事件监听
                        const deleteBtn = fileItem.querySelector('.delete-btn');
                        deleteBtn.addEventListener('click', () => {
                            if (confirm('确定要删除这个文件吗？')) {
                                deleteFile(file.id);
                            }
                        });

                        // 延迟显示动画
                        setTimeout(() => {
                            fileItem.style.opacity = '1';
                            fileItem.style.transform = 'translateY(0)';
                        }, index * 50);
                    });
                } else {
                    fileGrid.innerHTML = '<div class="no-files fade-in">暂无上传的文件</div>';
                }
            } else {
                throw new Error(result.message || '加载失败');
            }
        } catch (error) {
            console.error('加载文件失败:', error);
            fileGrid.innerHTML = '<div class="error-message fade-in">加载文件失败，请稍后重试</div>';
        }
    }

    // 绑定事件
    fileInput.addEventListener('change', handleFileSelect);
    fileUploadButton.addEventListener('click', handleUpload);

    // 处理文件上传
    async function handleUpload() {
        const files = fileInput.files;
        if (!files.length) {
            alert('请先选择文件');
            return;
        }

        const formData = new FormData();
        Array.from(files).forEach(file => {
            formData.append('files', file);
        });

        try {
            fileUploadButton.disabled = true;
            fileUploadButton.textContent = '上传中...';
            
            const response = await fetch(`${window.location.origin}/api/upload/files`, {
                method: 'POST',
                body: formData
            });

            const result = await response.json();
            
            if (result.success) {
                alert('上传成功！');
                fileInput.value = '';
                document.getElementById('selectedFilesList').innerHTML = '';
                await loadFiles();
            } else {
                throw new Error(result.message || '上传失败');
            }
        } catch (error) {
            console.error('上传错误:', error);
            alert('上传失败: ' + error.message);
        } finally {
            fileUploadButton.disabled = false;
            fileUploadButton.textContent = '上传文件';
        }
    }

    // ��面加载时加载文件列表
    loadFiles();
});

// 修改下载处理函数
async function downloadFile(publicId, fileName) {
    try {
        const downloadBtn = document.querySelector(`.download-btn[onclick*="${publicId}"]`);
        if (downloadBtn) {
            downloadBtn.disabled = true;
            downloadBtn.textContent = '下载中...';
        }

        const ext = fileName.toLowerCase().split('.').pop();
        const isCompressed = ['rar', 'zip', '7z', 'tar', 'gz'].includes(ext);

        const response = await fetch('/api/upload/download', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                public_id: publicId,
                file_name: fileName
            })
        });

        if (!response.ok) {
            throw new Error(`下载失败: ${response.status}`);
        }

        // 对于 txt 文件使用 blob 下载
        if (ext === 'txt') {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } else {
            // 对于压缩文件，下载并重命名
            const result = await response.json();
            if (result.success) {
                // 创建一个隐藏的 iframe 来处理下载
                const iframe = document.createElement('iframe');
                iframe.style.display = 'none';
                document.body.appendChild(iframe);
                
                // 监听 iframe 加载完成事件
                iframe.onload = () => {
                    document.body.removeChild(iframe);
                };

                // 如果是压缩文件，设置正确的文件名（移除.1后缀）
                if (isCompressed) {
                    const link = document.createElement('a');
                    link.href = result.url;
                    link.download = fileName; // 使用原始文件名
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                } else {
                    // 非压缩文件直接在新窗口打开
                    window.open(result.url, '_blank');
                }
            } else {
                throw new Error(result.message || '下载失败');
            }
        }

    } catch (error) {
        console.error('下载错误:', error);
        alert(`下载失败: ${error.message}`);
    } finally {
        // 恢复按钮状态
        const downloadBtn = document.querySelector(`.download-btn[onclick*="${publicId}"]`);
        if (downloadBtn) {
            downloadBtn.disabled = false;
            downloadBtn.textContent = '下载';
        }
    }
} 
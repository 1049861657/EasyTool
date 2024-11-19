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
        const maxSize = 50 * 1024 * 1024; // 50MB
        const selectedFiles = document.getElementById('selectedFilesList');
        selectedFiles.innerHTML = '';

        Array.from(files).forEach(file => {
            if (file.size > maxSize) {
                alert(`${file.name} 超过50MB限制，请选择更小的文件`);
                return;
            }
            
            const fileSpan = document.createElement('span');
            fileSpan.textContent = `${file.name} (${formatFileSize(file.size)})`;
            selectedFiles.appendChild(fileSpan);
        });
    }

    // 格式化文件大小
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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

    // 加载已上传的文件列表
    loadFiles();
});

// 加载已上传的文件
async function loadFiles() {
    try {
        const response = await fetch(`${window.location.origin}/api/upload/files`);
        const result = await response.json();
        
        if (result.success) {
            const fileGrid = document.getElementById('fileGrid');
            fileGrid.innerHTML = '';

            if (result.files && result.files.length > 0) {
                result.files.forEach(file => {
                    const fileItem = document.createElement('div');
                    fileItem.className = 'file-item';
                    fileItem.innerHTML = `
                        <div class="file-info">
                            <div class="file-name">${file.name}</div>
                            <div class="file-size">${formatFileSize(file.size)}</div>
                            <div class="upload-time">上传时间: ${formatDateTime(file.upload_time)}</div>
                        </div>
                        <div class="file-actions">
                            <a href="${file.url}" class="download-btn" download>下载</a>
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
                });
            } else {
                fileGrid.innerHTML = '<div class="no-files">暂无上传的文件</div>';
            }
        }
    } catch (error) {
        console.error('加载文件失败:', error);
        const fileGrid = document.getElementById('fileGrid');
        fileGrid.innerHTML = '<div class="error-message">加载文件失败，请稍后重试</div>';
    }
} 
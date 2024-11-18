document.addEventListener('DOMContentLoaded', function() {
    const imageInput = document.getElementById('imageInput');
    const previewArea = document.getElementById('previewArea');
    const uploadButton = document.getElementById('uploadButton');

    if (!imageInput || !previewArea || !uploadButton) {
        console.error('必要的DOM元素未找到');
        return;
    }

    // 添加格式化时间函数
    function formatDateTime(dateString) {
        const date = new Date(dateString);
        // 转换为北京时间
        date.setHours(date.getHours() + 8);
        return new Intl.DateTimeFormat('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        }).format(date);
    }

    // 添加拖放支持
    const dropZone = document.getElementById('dropZone');

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('drag-over');
    });

    dropZone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        const files = e.dataTransfer.files;
        imageInput.files = files;
        handleFileSelect({ target: { files } });
    });

    // 处理文件选择
    function handleFileSelect(event) {
        const files = event.target.files;
        const maxSize = 10 * 1024 * 1024; // 10MB in bytes
        const selectedFiles = document.getElementById('selectedFiles');
        const validFiles = [];

        selectedFiles.innerHTML = ''; // 清空已选文件显示
        previewArea.innerHTML = ''; // 清空预览区域

        Array.from(files).forEach(file => {
            if (!file.type.startsWith('image/')) {
                alert(`${file.name} 不是图片文件`);
                return;
            }
            if (file.size > maxSize) {
                alert(`${file.name} 超过10MB限制，请选择更小的文件`);
                return;
            }
            validFiles.push(file);
            
            // 添加文件名显示
            const fileSpan = document.createElement('span');
            fileSpan.textContent = file.name;
            selectedFiles.appendChild(fileSpan);

            showPreview(file);
        });

        // 如果没有有效文件，清空输入
        if (validFiles.length === 0) {
            imageInput.value = '';
            selectedFiles.innerHTML = '';
        }
    }

    // 显示预览
    function showPreview(file) {
        const reader = new FileReader();
        const previewContainer = document.createElement('div');
        previewContainer.className = 'preview-item';
        
        reader.onload = function(e) {
            previewContainer.innerHTML = `
                <div class="preview-wrapper">
                    <img src="${e.target.result}" alt="预览图片" style="max-width: 200px; max-height: 200px; margin: 10px;">
                    <div class="file-name">${file.name}</div>
                    <button class="remove-preview" data-name="${file.name}">✕</button>
                </div>
            `;

            // 添加删除预览的事件监听
            const removeBtn = previewContainer.querySelector('.remove-preview');
            removeBtn.addEventListener('click', () => {
                previewContainer.remove();
                updateFileInput(file.name);
            });
        };
        
        previewArea.appendChild(previewContainer);
        reader.readAsDataURL(file);
    }

    // 更新文件输入
    function updateFileInput(removedFileName) {
        const newFileList = Array.from(imageInput.files).filter(file => file.name !== removedFileName);
        const dataTransfer = new DataTransfer();
        newFileList.forEach(file => dataTransfer.items.add(file));
        imageInput.files = dataTransfer.files;
        
        // 更新已选文件显示
        const selectedFiles = document.getElementById('selectedFiles');
        selectedFiles.innerHTML = '';
        newFileList.forEach(file => {
            const fileSpan = document.createElement('span');
            fileSpan.textContent = file.name;
            selectedFiles.appendChild(fileSpan);
        });
    }

    // 加载已上传的图片
    async function loadImages() {
        try {
            const response = await fetch('http://localhost:8080/api/upload/images');
            const result = await response.json();
            
            if (result.success) {
                const imageGrid = document.getElementById('imageGrid');
                imageGrid.innerHTML = '';

                if (result.images && result.images.length > 0) {
                    result.images.forEach(image => {
                        const imageItem = document.createElement('div');
                        imageItem.className = 'image-item';
                        imageItem.innerHTML = `
                            <a href="${image.url}" target="_blank" class="image-link">
                                <img src="${image.url}" alt="上传的图片">
                                <div class="image-info">
                                    <div>上传时间: ${formatDateTime(image.upload_time)}</div>
                                    <div class="click-hint">点击查看原图</div>
                                </div>
                            </a>
                            <button class="delete-btn" data-id="${image.id}" data-public-id="${image.public_id}">
                                <span class="btn-text">🗑️</span>
                            </button>
                        `;
                        imageGrid.appendChild(imageItem);

                        // 添加删除按钮事件监听
                        const deleteBtn = imageItem.querySelector('.delete-btn');
                        deleteBtn.addEventListener('click', async () => {
                            if (confirm('确定要删除这张图片吗？')) {
                                await deleteImage(image.id, image.public_id);
                            }
                        });
                    });
                } else {
                    imageGrid.innerHTML = '<div class="no-images">暂无上传的图片</div>';
                }
            } else {
                throw new Error(result.message || '加载失败');
            }
        } catch (error) {
            console.error('加载图片失败:', error);
            const imageGrid = document.getElementById('imageGrid');
            imageGrid.innerHTML = '<div class="error-message">加载图片失败，请稍后重试</div>';
        }
    }

    // 添加删除图片功能
    async function deleteImage(id, publicId) {
        const deleteBtn = document.querySelector(`.delete-btn[data-id="${id}"]`);
        try {
            // 添加加载状态
            deleteBtn.classList.add('loading');
            deleteBtn.disabled = true;

            const response = await fetch(`http://localhost:8080/api/upload/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ 
                    public_id: publicId 
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || '删除失败');
            }

            const result = await response.json();
            
            if (result.success) {
                await loadImages(); // 重新加载图片列表
            } else {
                throw new Error(result.message || '删除失败');
            }
        } catch (error) {
            console.error('删除失败:', error);
            alert('删除失败: ' + (error.message || '未知错误'));
            // 恢复按钮状态
            deleteBtn.classList.remove('loading');
            deleteBtn.disabled = false;
        }
    }

    // 页面加载时立即加载图片
    loadImages();

    // 处理上传
    async function handleUpload() {
        const files = imageInput.files;
        if (!files.length) {
            alert('请先选择图片');
            return;
        }

        const formData = new FormData();
        Array.from(files).forEach(file => {
            formData.append('images', file);
        });

        try {
            uploadButton.disabled = true;
            uploadButton.textContent = '上传中...';
            
            const response = await fetch('http://localhost:8080/api/upload', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();
            
            if (result.success) {
                alert('上传成功！');
                // 清空预览和输入
                previewArea.innerHTML = '';
                imageInput.value = '';
                // 重新加载图片列表
                await loadImages();
                // 滚动到图片列表
                document.querySelector('.gallery').scrollIntoView({ behavior: 'smooth' });
            } else {
                throw new Error(result.message || '上传失败');
            }
        } catch (error) {
            console.error('上传错误:', error);
            alert('上传失败: ' + error.message);
        } finally {
            uploadButton.disabled = false;
            uploadButton.textContent = '上传图片';
        }
    }

    // 绑定事件
    imageInput.addEventListener('change', handleFileSelect);
    uploadButton.addEventListener('click', handleUpload);

    // 添加定期刷新
    setInterval(loadImages, 30000); // 每30秒刷新一次
}); 
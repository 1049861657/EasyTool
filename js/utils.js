// 通用工具函数
function copyText(elementId) {
    const text = document.getElementById(elementId).textContent;
    if (text === '-' || text.includes('请输入') || text.includes('无效')) {
        return;
    }

    navigator.clipboard.writeText(text).then(() => {
        const button = event.target;
        const originalText = button.textContent;
        button.textContent = '已复制';
        setTimeout(() => {
            button.textContent = originalText;
        }, 1000);
    });
}

function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

function truncateString(str, num) {
    if (str.length <= num) return str;
    return str.slice(0, num - 3) + '...';
} 
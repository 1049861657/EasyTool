// 页面导航相关功能
document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // 如果是上传图片链接，则在新标签页打开
            if (this.dataset.page === 'upload') {
                // 使用相对路径打开upload.html
                const currentPath = window.location.pathname;
                const basePath = currentPath.substring(0, currentPath.lastIndexOf('/'));
                window.open(`${basePath}/upload.html`, '_blank');
                return;
            }
            
            // 其他页面的导航逻辑保持不变
            navLinks.forEach(l => l.classList.remove('active'));
            document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
            
            this.classList.add('active');
            const pageId = `${this.dataset.page}-page`;
            document.getElementById(pageId).classList.add('active');
        });
    });
}); 
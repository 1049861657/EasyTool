// 页面导航相关功能
document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // 移除所有活动状态
            navLinks.forEach(l => l.classList.remove('active'));
            document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
            
            // 添加新的活动状态
            this.classList.add('active');
            const pageId = `${this.dataset.page}-page`;
            document.getElementById(pageId).classList.add('active');
        });
    });
}); 
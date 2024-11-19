document.addEventListener('DOMContentLoaded', function() {
    // 页面切换逻辑
    const navLinks = document.querySelectorAll('.nav-link');
    const pages = document.querySelectorAll('.page');
    
    // 处理 URL hash
    function handleHash() {
        const hash = window.location.hash.slice(1); // 移除 '#' 符号
        if (hash) {
            // 移除所有活动状态
            navLinks.forEach(l => l.classList.remove('active'));
            pages.forEach(p => p.classList.remove('active'));
            
            // 设置当前页面为活动状态
            const link = document.querySelector(`.nav-link[data-page="${hash}"]`);
            const page = document.getElementById(`${hash}-page`);
            if (link && page) {
                link.classList.add('active');
                page.classList.add('active');
            }
        }
    }

    // 页面加载和 hash 变化时处理
    window.addEventListener('hashchange', handleHash);
    handleHash(); // 初始加载时处理

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // 移除所有活动状态
            navLinks.forEach(l => l.classList.remove('active'));
            pages.forEach(p => p.classList.remove('active'));
            
            // 设置当前页面为活动状态
            link.classList.add('active');
            const pageId = link.getAttribute('data-page') + '-page';
            document.getElementById(pageId).classList.add('active');

            // 更新 URL hash
            window.location.hash = link.getAttribute('data-page');
        });
    });

    // 上传页面的标签切换逻辑
    const uploadTabs = document.querySelectorAll('.upload-tabs .tab-btn');
    
    uploadTabs.forEach(btn => {
        btn.addEventListener('click', function() {
            // 移除所有活动状态
            uploadTabs.forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
            
            // 设置当前标签为活动状态
            this.classList.add('active');
            const target = this.getAttribute('data-target');
            document.getElementById(target).classList.add('active');
        });
    });
}); 
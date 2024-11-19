document.addEventListener('DOMContentLoaded', function() {
    // 页面切换逻辑
    const navLinks = document.querySelectorAll('.nav-link');
    const pages = document.querySelectorAll('.page');
    
    // 处理 URL hash
    function handleHash() {
        const hash = window.location.hash.slice(1);
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
    handleHash();

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.getAttribute('data-page');

            // 移除所有活动状态
            navLinks.forEach(l => l.classList.remove('active'));
            pages.forEach(p => p.classList.remove('active'));
            
            // 设置当前页面为活动状态
            link.classList.add('active');
            const pageId = page + '-page';
            const targetPage = document.getElementById(pageId);
            
            if (targetPage) {
                targetPage.classList.add('active');
            }

            window.location.hash = page;
        });
    });
}); 
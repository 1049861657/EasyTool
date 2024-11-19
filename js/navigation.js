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

                // 如果是 WebGL 页面，检查环境支持
                if (hash === 'webgl') {
                    console.log('WebGL页面加载开始');
                    try {
                        const canvas = document.getElementById('glcanvas');
                        if (!canvas) {
                            console.error('找不到 WebGL canvas 元素');
                            return;
                        }

                        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
                        if (!gl) {
                            console.error('无法初始化 WebGL');
                            return;
                        }

                        console.log('WebGL 上下文创建成功:', gl);
                        // 这里可以添加更多 WebGL 初始化的调试信息
                        
                        // 检查是否成功加载了 gl-matrix
                        if (typeof glMatrix === 'undefined') {
                            console.error('gl-matrix 库未加载');
                            return;
                        }
                        console.log('gl-matrix 库加载成功');

                    } catch (error) {
                        console.error('WebGL 初始化错误:', error);
                    }
                }
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
                // 如果是 WebGL 页面，添加调试信息
                if (page === 'webgl') {
                    console.log('通过点击加载 WebGL 页面');
                }
            }

            // 更新 URL hash
            window.location.hash = page;
        });
    });
}); 
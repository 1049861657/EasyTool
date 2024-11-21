// 获取基础路径的函数
function getBasePath() {
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    const pathname = window.location.pathname;

    // 如果是直接打开HTML文件
    if (protocol === 'file:') {
        // 从pathname中提取基础路径
        const pathParts = pathname.split('/');
        const indexPosition = pathParts.findIndex(part => part === 'index.html');
        if (indexPosition !== -1) {
            return pathParts.slice(0, indexPosition).join('/') + '/';
        }
        return '';
    }

    // 如果是通过服务器访问
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return '/'; // 本地服务器
    }

    // GitHub Pages
    if (hostname === '1049861657.github.io') {
        return '/EasyTool/';
    }

    // Vercel 或其他部署
    const basePath = pathname.split('/')[1];
    return basePath ? `/${basePath}/` : '/';
}

// 页面模块初始化映射
const pageInitializers = {
    'card-draw': async () => {
        if (typeof initializeCardDraw === 'function') {
            try {
                await initializeCardDraw();
            } catch (error) {
                console.error('初始化抽卡模拟器失败:', error);
            }
        }
    },
    // 可以添加其他页面的初始化函数
    'calculator': () => {
        // 计算器页面的初始化逻辑
    },
    'timestamp': () => {
        // 时间戳页面的初始化逻辑
    }
    // ... 其他页面的初始化器
};

// 处理返回主页的函数
function handleReturn(returnPath) {
    const basePath = getBasePath();
    window.location.href = `${basePath}index.html${returnPath ? '#' + returnPath : ''}`;
}


// 页面切换函数
function switchPage(pageName) {
    // 隐藏所有页面
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });

    // 更新导航栏状态
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.dataset.page === pageName) {
            link.classList.add('active');
        }
    });

    // 显示目标页面
    const targetPage = document.getElementById(`${pageName}-page`);
    if (targetPage) {
        targetPage.classList.add('active');
        // 调用对应页面的初始化函数
        const initializer = pageInitializers[pageName];
        if (initializer) {
            initializer();
        }
    }
}

// 处理 URL hash
function handleHash() {
    const hash = window.location.hash.slice(1);
    if (hash) {
        switchPage(hash);
    } else {
        // 默认页面
        switchPage('calculator');
    }
}

// 初始化导航
function initializeNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.getAttribute('data-page');
            window.location.hash = page;
        });
    });

    // 监听 hash 变化
    window.addEventListener('hashchange', handleHash);
    
    // 初始页面加载时处理 hash
    handleHash();
}


// 导出处理返回的函数供其他页面使用
window.handleReturn = handleReturn;

// DOM 加载完成后初始化
document.addEventListener('DOMContentLoaded', initializeNavigation); 
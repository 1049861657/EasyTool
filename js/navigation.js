// 获取基础路径的函数
function getBasePath() {
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    const pathname = window.location.pathname;

    // 如果是直接打开HTML文件
    if (protocol === 'file:') {
        return 'index.html';
    }

    // GitHub Pages
    if (hostname === '1049861657.github.io') {
        return '/EasyTool/';
    }

    //其他部署
    return '/';
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
    }
    // ... 其他页面的初始化器
};

// 处理返回主页的函数
function handleReturn(returnPath) {
    const basePath = getBasePath();
    console.log(basePath)
    console.log(`${basePath}index.html${returnPath ? '#' + returnPath : ''}`)
    console.log(`${basePath}${returnPath ? '#' + returnPath : ''}`)
    window.location.href = `${basePath}${returnPath ? '#' + returnPath : ''}`;
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
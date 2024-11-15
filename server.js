const express = require('express');
const path = require('path');
const app = express();

// 为了调试，添加日志
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// 服务主页面的静态文件
app.use(express.static(__dirname));

// WebGL相关文件的服务
app.use('/Build', express.static(path.join(__dirname, 'packaged_Navigation/Build')));
app.use('/TemplateData', express.static(path.join(__dirname, 'packaged_Navigation/TemplateData')));
app.use('/StreamingAssets', express.static(path.join(__dirname, 'packaged_Navigation/StreamingAssets')));

// 所有路由都返回主页面，这样无论访问什么URL都会显示工具箱
app.get('*', (req, res) => {
    // 如果是 /webgl 路径，返回 WebGL 页面
    if (req.path === '/webgl') {
        res.sendFile(path.join(__dirname, 'packaged_Navigation/index.html'));
    } else {
        // 其他所有路径都返回主页面
        res.sendFile(path.join(__dirname, 'index.html'));
    }
});

const port = 8080;
app.listen(port, () => {
    console.log(`服务器运行在 http://localhost:${port}`);
    console.log(`WebGL页面在 http://localhost:${port}/webgl`);
}); 
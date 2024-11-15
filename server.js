const express = require('express');
const path = require('path');
const app = express();

// 添加 CORS 中间件
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

// 中间件
app.use(express.json());
app.use((req, res, next) => {
    console.log('收到请求:', {
        method: req.method,
        url: req.url,
        body: req.method === 'POST' ? req.body : undefined,
        query: req.query
    });
    next();
});

// 静态文件服务
app.use(express.static(__dirname));
app.use('/Build', express.static(path.join(__dirname, 'packaged_Navigation/Build')));
app.use('/TemplateData', express.static(path.join(__dirname, 'packaged_Navigation/TemplateData')));
app.use('/StreamingAssets', express.static(path.join(__dirname, 'packaged_Navigation/StreamingAssets')));

// API 路由
app.use('/api', require('./routes/database'));

// 页面路由
app.get('*', (req, res) => {
    if (req.path === '/webgl') {
        res.sendFile(path.join(__dirname, 'packaged_Navigation/index.html'));
    } else {
        res.sendFile(path.join(__dirname, 'index.html'));
    }
});

// 错误处理中间件
app.use((err, req, res, next) => {
    console.error('错误:', err.stack);
    res.status(500).json({ error: err.message });
});

const port = 8080;
app.listen(port, () => {
    console.log(`服务器运行在 http://localhost:${port}`);
    console.log(`WebGL页面在 http://localhost:${port}/webgl`);
}); 
import express from 'express';
import mysql from 'mysql2';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 添加 CORS 中间件
app.use(cors());

// 基础中间件
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 请求日志中间件
app.use((req, res, next) => {
    console.log('收到请求:', {
        method: req.method,
        url: req.url,
        path: req.path,
        query: req.query,
        body: req.method === 'POST' ? req.body : undefined
    });
    next();
});

// 导入路由
import * as database from './routes/database.js';
import proxyRouter from './routes/proxy.js';

// API 路由注册（放在最前面）
app.use('/api/database', database.router);
app.use('/api/proxy', proxyRouter);

// 静态文件服务
app.use(express.static(__dirname));
app.use('/Build', express.static(path.join(__dirname, 'packaged_Navigation/Build')));
app.use('/TemplateData', express.static(path.join(__dirname, 'packaged_Navigation/TemplateData')));
app.use('/StreamingAssets', express.static(path.join(__dirname, 'packaged_Navigation/StreamingAssets')));

// 页面路由放在最后
app.get('*', (req, res) => {
    if (req.path === '/webgl') {
        res.sendFile(path.join(__dirname, 'packaged_Navigation/index.html'));
    } else {
        res.sendFile(path.join(__dirname, 'index.html'));
    }
});

// 错误处理中间件
app.use((err, req, res, next) => {
    console.error('服务器错误:', err.stack);
    res.status(500).json({ 
        success: false,
        error: err.message,
        details: err.stack
    });
});

const port = 8080;
app.listen(port, () => {
    console.log(`服务器运行在 http://localhost:${port}`);
    console.log(`WebGL页面在 http://localhost:${port}/webgl`);
}); 
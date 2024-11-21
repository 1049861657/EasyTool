import express from 'express';
import mysql from 'mysql2';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import multer from 'multer';
import cloudinary from 'cloudinary';
import dotenv from 'dotenv';
import { promises as fs } from 'fs';

dotenv.config();

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 添加 CORS 中间件
app.use(cors());

// 基础中间件
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cloudinary 配置
cloudinary.config({ 
    cloud_name: 'dibrpa3xg', 
    api_key: '593119669315691', 
    api_secret: '8GJSVDGX3XSM3mXCxc1hrrrerRc' 
});

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
import uploadRouter from './api/upload.js';
import cardsRouter from './routes/cards.js';

// API 路由注册（放在最前面）
app.use('/api/database', database.router);
app.use('/api/proxy', proxyRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/cards', cardsRouter);

// 静态文件服务
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname));
app.use('/Build', express.static(path.join(__dirname, 'packaged_Navigation/Build')));
app.use('/TemplateData', express.static(path.join(__dirname, 'packaged_Navigation/TemplateData')));
app.use('/StreamingAssets', express.static(path.join(__dirname, 'packaged_Navigation/StreamingAssets')));

// 页面路由放在最后
app.get('*', (req, res, next) => {
    // 排除 API 路由
    if (req.path.startsWith('/api/')) {
        return next();
    }
    
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

const port = process.env.PORT || 8080;
app.listen(port, () => {
    if (process.env.NODE_ENV === 'production') {
        console.log(`服务器已启动`);
    } else {
        console.log(`服务器运行在 http://localhost:${port}`);
        console.log(`WebGL页面在 http://localhost:${port}/webgl`);
    }
});
  
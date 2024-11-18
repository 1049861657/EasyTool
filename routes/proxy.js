import express from 'express';
import ProxyService from '../services/proxyService.js';

const router = express.Router();

router.get('/request', async (req, res) => {
    const targetUrl = req.query.url;
    
    if (!targetUrl) {
        console.log('未提供目标URL');
        return res.status(400).json({
            success: false,
            error: '请提供目标URL'
        });
    }

    try {
        const decodedUrl = decodeURIComponent(targetUrl);
        console.log('准备发送代理请求到:', decodedUrl);

        // 验证URL格式
        try {
            new URL(decodedUrl);
        } catch (urlError) {
            return res.status(400).json({
                success: false,
                error: '无效的URL格式'
            });
        }

        const result = await ProxyService.makeRequest(decodedUrl);
        console.log('代理请求完成，状态:', result.success);
        
        if (!result.success) {
            return res.status(result.status || 500).json(result);
        }

        res.json(result);
    } catch (error) {
        console.error('代理请求处理失败:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            details: error.stack
        });
    }
});

export default router; 
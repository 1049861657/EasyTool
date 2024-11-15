const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');

router.get('/proxy', async (req, res) => {
    try {
        const targetUrl = req.query.url;
        
        if (!targetUrl) {
            return res.status(400).json({ 
                error: '请提供目标URL',
                success: false 
            });
        }

        console.log('代理请求URL:', targetUrl);

        const response = await fetch(targetUrl);
        const contentType = response.headers.get('content-type');
        const data = await response.text();

        // 返回响应信息
        res.json({
            success: true,
            status: response.status,
            statusText: response.statusText,
            headers: Object.fromEntries(response.headers),
            data: data
        });

    } catch (error) {
        console.error('代理请求失败:', error);
        res.status(500).json({ 
            error: error.message,
            success: false 
        });
    }
});

module.exports = router; 
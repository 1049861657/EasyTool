import express from 'express';
import CardService from '../services/cardService.js';

const router = express.Router();

router.get('/list', async (req, res) => {
    try {
        const result = await CardService.getCards();
        if (!result.success) {
            throw new Error(result.error);
        }
        res.json(result);
    } catch (error) {
        console.error('获取卡片列表失败:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

export default router; 
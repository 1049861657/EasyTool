const express = require('express');
const router = express.Router();
const DatabaseService = require('../services/database');

router.post('/connect', async (req, res) => {
    try {
        console.log('收到连接请求:', req.body);
        const { host, user, password, database, port } = req.body;
        const connection = await DatabaseService.connect({ host, user, password, database, port });
        const tables = await DatabaseService.getTables(connection);
        connection.end();
        console.log('获取到表:', tables);
        res.json({ tables });
    } catch (error) {
        console.error('连接错误:', error);
        res.status(500).json({ error: error.message });
    }
});

router.post('/query', async (req, res) => {
    try {
        console.log('收到查询请求:', req.body);
        const { host, user, password, database, table, port, page, pageSize } = req.body;
        const connection = await DatabaseService.connect({ host, user, password, database, port });
        const result = await DatabaseService.queryTable(connection, table, page, pageSize);
        connection.end();
        res.json(result);
    } catch (error) {
        console.error('查询错误:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router; 
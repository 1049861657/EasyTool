const express = require('express');
const app = express();
const port = 8080;
const ip = '192.168.1.157';  // 替换为您的实际IP地址

// 设置静态文件目录
app.use(express.static('./'));

// 启动服务器
app.listen(port, ip, () => {
    console.log(`服务器运行在 http://${ip}:${port}`);
}); 
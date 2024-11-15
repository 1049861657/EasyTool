// GET请求测试工具的功能实现
async function sendGetRequest() {
    const urlInput = document.getElementById('request-url');
    const resultArea = document.getElementById('response-result');
    const url = urlInput.value.trim();

    if (!url) {
        alert('请输入URL');
        return;
    }

    try {
        // 显示加载状态
        resultArea.value = '请求中...';
        
        // 通过后端代理发送请求
        const proxyUrl = `/test/proxy?url=${encodeURIComponent(url)}`;
        const response = await fetch(proxyUrl);
        const result = await response.json();
        
        if (!result.success) {
            throw new Error(result.error);
        }
        
        // 格式化显示结果
        resultArea.value = `状态码: ${result.status}\n` +
            `状态文本: ${result.statusText}\n` +
            '\n响应头:\n' +
            Object.entries(result.headers)
                .map(([key, value]) => `${key}: ${value}`)
                .join('\n') +
            '\n\n响应内容:\n' + result.data;
    } catch (error) {
        resultArea.value = `请求失败: ${error.message}`;
    }
}

function clearRequest() {
    document.getElementById('request-url').value = '';
    document.getElementById('response-result').value = '';
} 
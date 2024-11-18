class ProxyRequest {
    static async sendRequest(url) {
        try {
            console.log('开始发送请求, 原始URL:', url);
            const encodedUrl = encodeURIComponent(url);
            const proxyUrl = `/api/proxy/request?url=${encodedUrl}`;
            console.log('构造的代理URL:', proxyUrl);

            const response = await fetch(proxyUrl);
            console.log('收到响应状态:', response.status);
            
            // 检查响应的 Content-Type
            const contentType = response.headers.get('content-type');
            console.log('响应Content-Type:', contentType);

            if (response.status === 404) {
                throw new Error('API路径不存在，请检查服务器配置');
            }

            const responseText = await response.text();
            console.log('收到响应数据长度:', responseText.length);

            let result;
            try {
                result = JSON.parse(responseText);
            } catch (parseError) {
                console.error('响应不是有效的JSON:', responseText.substring(0, 200) + '...');
                throw new Error('服务器返回了非JSON格式的数据');
            }

            if (!result.success) {
                throw new Error(result.error || '请求失败');
            }

            return result;
        } catch (error) {
            console.error('请求处理失败:', error);
            throw error;
        }
    }

    static updateUI(result, error = null) {
        const responseElement = document.getElementById('response-result');
        if (!responseElement) return;

        if (error) {
            responseElement.value = `请求失败:\n${error.message}`;
            responseElement.classList.add('error');
        } else {
            let displayText = '';
            if (result.data.type === 'raw') {
                displayText = `Content-Type: ${result.data.contentType}\n\n${result.data.content}`;
            } else {
                displayText = JSON.stringify(result.data, null, 2);
            }
            responseElement.value = displayText;
            responseElement.classList.remove('error');
        }
    }

    static clearUI() {
        const urlInput = document.getElementById('request-url');
        const responseElement = document.getElementById('response-result');
        
        if (urlInput) urlInput.value = '';
        if (responseElement) {
            responseElement.value = '';
            responseElement.classList.remove('error');
        }
    }

    static async handleRequest() {
        const urlInput = document.getElementById('request-url');
        const sendButton = document.getElementById('send-request-btn');
        
        if (!urlInput || !urlInput.value) {
            alert('请输入URL');
            return;
        }

        try {
            sendButton.disabled = true;
            sendButton.textContent = '请求中...';
            
            const result = await this.sendRequest(urlInput.value);
            this.updateUI(result);
        } catch (error) {
            this.updateUI(null, error);
        } finally {
            sendButton.disabled = false;
            sendButton.textContent = '发送请求';
        }
    }
}

export default ProxyRequest; 
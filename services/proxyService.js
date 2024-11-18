import axios from 'axios';

class ProxyService {
    static async makeRequest(targetUrl) {
        try {
            console.log('代理服务发起请求:', targetUrl);
            
            const response = await axios({
                method: 'GET',
                url: targetUrl,
                timeout: 5000,
                headers: {
                    'User-Agent': 'Node.js Proxy Server',
                    'Accept': '*/*'
                },
                transformResponse: [(data) => {
                    return data;
                }],
                validateStatus: function (status) {
                    return true;
                }
            });

            console.log('收到响应:', {
                status: response.status,
                contentType: response.headers['content-type']
            });

            let parsedData;
            try {
                parsedData = JSON.parse(response.data);
            } catch (parseError) {
                parsedData = {
                    type: 'raw',
                    content: response.data,
                    contentType: response.headers['content-type']
                };
            }

            return {
                success: true,
                data: parsedData,
                status: response.status,
                headers: response.headers
            };
        } catch (error) {
            console.error('代理请求失败:', error);
            return {
                success: false,
                error: error.message,
                status: error.response?.status || 500,
                data: error.response?.data || null
            };
        }
    }
}

export default ProxyService; 
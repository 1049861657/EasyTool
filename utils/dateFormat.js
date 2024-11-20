export const formatDate = (dateString) => {
    console.log('格式化输入:', dateString);
    
    try {
        // 如果输入是 MySQL 格式的时间字符串，直接返回
        if (typeof dateString === 'string' && dateString.match(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/)) {
            return dateString.replace(/-/g, '/');
        }

        // 否则创建 Date 对象并格式化
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            throw new Error('Invalid date');
        }

        return date.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });
    } catch (error) {
        console.error('日期格式化错误:', error);
        return dateString; // 如果出错，返回原始字符串
    }
}; 
// 页面切换功能
document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // 移除所有活动状态
            navLinks.forEach(l => l.classList.remove('active'));
            document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
            
            // 添加新的活动状态
            this.classList.add('active');
            const pageId = `${this.dataset.page}-page`;
            document.getElementById(pageId).classList.add('active');
        });
    });

    // 设置默认时间
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    
    const currentDateTime = `${year}-${month}-${day}T${hours}:${minutes}`;
    document.getElementById('date-input').value = currentDateTime;
});

// 计算功能
function calculate(type) {
    // 获取输入值
    const num1 = parseFloat(document.getElementById(`${type}-num1`).value);
    const num2 = parseFloat(document.getElementById(`${type}-num2`).value);
    
    // 检查输入是否为有效数字
    if (isNaN(num1) || isNaN(num2)) {
        document.getElementById(`${type}-result`).textContent = '请输入有效的数字';
        return;
    }
    
    // 根据类型计算结果
    let result;
    if (type === 'add') {
        result = num1 + num2;
    } else if (type === 'subtract') {
        result = num1 - num2;
    }
    
    // 显示结果
    document.getElementById(`${type}-result`).textContent = result;
}

// 时间戳转日期
function convertTimestamp() {
    const timestamp = document.getElementById('timestamp-input').value;
    
    if (!timestamp) {
        document.getElementById('date-result').textContent = '请输入时间戳';
        return;
    }

    try {
        const date = new Date(parseInt(timestamp));
        if (isNaN(date.getTime())) {
            throw new Error('无效的时间戳');
        }

        const formatted = formatDate(date);
        document.getElementById('date-result').textContent = formatted;
    } catch (error) {
        document.getElementById('date-result').textContent = '无效的时间戳';
    }
}

// 日期转时间戳
function convertDate() {
    const dateInput = document.getElementById('date-input').value;
    
    if (!dateInput) {
        document.getElementById('timestamp-result').textContent = '请选择日期时间';
        return;
    }

    const timestamp = new Date(dateInput).getTime();
    document.getElementById('timestamp-result').textContent = timestamp;
}

// 复制文本功能
function copyText(elementId) {
    const text = document.getElementById(elementId).textContent;
    if (text === '-' || text.includes('请输入') || text.includes('无效')) {
        return;
    }

    navigator.clipboard.writeText(text).then(() => {
        const button = event.target;
        const originalText = button.textContent;
        button.textContent = '已复制';
        setTimeout(() => {
            button.textContent = originalText;
        }, 1000);
    });
}

// 格式化日期
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
} 
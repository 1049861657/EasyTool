// 时间戳转换相关功能
document.addEventListener('DOMContentLoaded', function() {
    // 设置默认时间
    const now = new Date();
    
    // 设置日期输入框的默认值
    const dateInput = document.getElementById('date-input');
    dateInput.value = formatDateForInput(now);
    
    // 设置时间输入框的默认值
    const timeInput = document.getElementById('time-input');
    timeInput.value = formatTimeForInput(now);
});

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

function convertDate() {
    const dateInput = document.getElementById('date-input').value;
    const timeInput = document.getElementById('time-input').value;
    
    if (!dateInput || !timeInput) {
        document.getElementById('timestamp-result').textContent = '请选择完整的日期和时间';
        return;
    }

    // 组合日期和时间
    const dateTimeString = `${dateInput}T${timeInput}`;
    const timestamp = new Date(dateTimeString).getTime();
    
    if (isNaN(timestamp)) {
        document.getElementById('timestamp-result').textContent = '无效的日期时间';
        return;
    }
    
    document.getElementById('timestamp-result').textContent = timestamp;
}

function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function formatDateForInput(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
}

function formatTimeForInput(date) {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return `${hours}:${minutes}:${seconds}`;
} 
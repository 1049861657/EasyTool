// 计算器相关功能
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
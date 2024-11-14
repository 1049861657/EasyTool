function calculate() {
    // 获取输入值
    const num1 = parseFloat(document.getElementById('num1').value);
    const num2 = parseFloat(document.getElementById('num2').value);
    
    // 检查输入是否为有效数字
    if (isNaN(num1) || isNaN(num2)) {
        document.getElementById('result').textContent = '请输入有效的数字';
        return;
    }
    
    // 计算结果
    const sum = num1 + num2;
    
    // 显示结果
    document.getElementById('result').textContent = sum;
} 
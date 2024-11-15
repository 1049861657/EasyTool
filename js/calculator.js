function calculate() {
    const num1 = parseFloat(document.getElementById('num1').value);
    const num2 = parseFloat(document.getElementById('num2').value);
    const operator = document.getElementById('operator').value;
    let result;

    if (isNaN(num1) || isNaN(num2)) {
        alert('请输入有效的数字');
        return;
    }

    switch (operator) {
        case '+':
            result = num1 + num2;
            break;
        case '-':
            result = num1 - num2;
            break;
        case '*':
            result = num1 * num2;
            break;
        case '/':
            if (num2 === 0) {
                alert('除数不能为0');
                return;
            }
            result = num1 / num2;
            break;
    }

    // 处理小数点后过多位数的情况
    result = Math.round(result * 1000000) / 1000000;
    
    document.getElementById('result').textContent = result;
} 
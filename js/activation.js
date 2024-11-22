// 激活码相关变量和函数
let remainingPulls = 0;
// 存储已使用过的激活码
let usedCodes = new Set();

// 获取当前小时的时间戳范围
function getCurrentHourRange() {
    const now = new Date();
    // 设置为当前小时的开始
    const startOfHour = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), 0, 0, 0);
    
    // 设置为当前小时的结束
    const endOfHour = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), 59, 59, 999);
    
    return {
        start: startOfHour.getTime(),
        end: endOfHour.getTime()
    };
}

// 更新十连抽按钮状态
function updateTenPullButton(enabled) {
    const tenPullBtn = document.querySelector('.calc-btn.ten-draw');
    if (tenPullBtn) {
        tenPullBtn.disabled = !enabled;
    }
}

function validateCode() {
    const codeInput = document.getElementById('activationCode');
    const inputCode = parseInt(codeInput.value.trim());
    
    // 验证输入是否为有效数字
    if (isNaN(inputCode)) {
        showToast('请输入有效的激活码！');
        return;
    }

    // 检查激活码是否已使用过
    if (usedCodes.has(inputCode)) {
        showToast('该激活码已被使用！');
        return;
    }
    
    // 验证激活码是否在允许范围内
    const validRange = getCurrentHourRange();
    if (inputCode >= validRange.start && inputCode <= validRange.end) {
        remainingPulls += 1;
        usedCodes.add(inputCode);
        showToast('激活码验证成功！获得1次十连抽机会');
        codeInput.value = '';
        updateRemainingPulls();
        updateTenPullButton(true);
    } else {
        showToast('无效的激活码！');
    }
}

// 增加十连抽次数（用于6星抽中时调用）
function addTenPullChance() {
    remainingPulls += 1;
    updateRemainingPulls();
    updateTenPullButton(true);
}

// 检查是否可以进行十连抽
function canDoTenPull() {
    if (remainingPulls <= 0) {
        showToast('请输入激活码或单抽到6星以获取资格');
        updateTenPullButton(false);
        return false;
    }
    remainingPulls--;
    updateRemainingPulls();
    return true;
}

// 更新剩余次数显示
function updateRemainingPulls() {
    const remainingText = document.getElementById('remainingPulls');
    if (remainingText) {
        remainingText.textContent = `剩余次数：${remainingPulls}`;
    }
    // 根据剩余次数更新按钮状态
    updateTenPullButton(remainingPulls > 0);
}

// 显示提示信息
function showToast(message) {
    const toast = document.getElementById('draw-toast');
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 2000);
}

// 导出需要的函数供其他模块使用
window.validateCode = validateCode;
window.canDoTenPull = canDoTenPull;
window.updateRemainingPulls = updateRemainingPulls;
window.addTenPullChance = addTenPullChance; 
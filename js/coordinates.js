function dmsToDecimal() {
    const degrees = parseFloat(document.getElementById('degrees').value) || 0;
    const minutes = parseFloat(document.getElementById('minutes').value) || 0;
    const seconds = parseFloat(document.getElementById('seconds').value) || 0;

    if (minutes >= 60 || seconds >= 60) {
        alert('分和秒的值必须小于60');
        return;
    }

    const decimal = degrees + (minutes / 60) + (seconds / 3600);
    const formattedDecimal = decimal.toFixed(6);
    document.getElementById('decimal-result').textContent = formattedDecimal + '°';
}

function decimalToDms() {
    const decimal = parseFloat(document.getElementById('decimal-degrees').value);
    
    if (isNaN(decimal)) {
        alert('请输入有效的数字');
        return;
    }

    const absDecimal = Math.abs(decimal);
    const degrees = Math.floor(absDecimal);
    const minutesFloat = (absDecimal - degrees) * 60;
    const minutes = Math.floor(minutesFloat);
    const seconds = ((minutesFloat - minutes) * 60).toFixed(3);

    const sign = decimal >= 0 ? '' : '-';
    const result = `${sign}${degrees}° ${minutes}′ ${seconds}″`;
    document.getElementById('dms-result').textContent = result;
} 
// 在文件开头添加全局变量
let drawHistory = [];
let totalDraws = 0;
let sixStarDraws = 0;
let drawsSinceLast6Star = 0;
let drawHistoryCurrentPage = 1;
const drawHistoryPageSize = 10;

// // 修改初始化函数
// document.addEventListener('DOMContentLoaded', function() {
//     // 监听导航点击事件
//     const navLinks = document.querySelectorAll('.nav-link');
//     navLinks.forEach(link => {
//         link.addEventListener('click', async function(e) {
//             if (this.dataset.page === 'card-draw') {
//                 // 等待一小段时间确保页面已切换
//                 setTimeout(async () => {
//                     try {
//                         await initializeCardDraw();
//                     } catch (error) {
//                         console.error('初始化抽卡模拟器失败:', error);
//                     }
//                 }, 100);
//             }
//         });
//     });

//     // 如果当前页面就是抽卡页面，立即初始化
//     if (window.location.hash === '#card-draw' || 
//         document.querySelector('.page.active')?.id === 'card-draw-page') {
//         initializeCardDraw();
//     }
// });

// 将初始化逻辑抽取为单独的函数
async function initializeCardDraw() {
    console.log('开始初始化抽卡模拟器...');
    
    // 检查是否已经初始化过
    if (window.cards) {
        console.log('卡片数据已加载，跳过初始化');
        return;
    }

    try {
        // 等待卡片加载完成
        await loadCards();
        
        // 添加统计信息容器
        const drawHistory = document.querySelector('.draw-history');
        if (drawHistory && !drawHistory.querySelector('.stats-info')) {
            const statsDiv = document.createElement('div');
            statsDiv.className = 'stats-info';
            statsDiv.innerHTML = '平均<span class="highlight">∞</span>抽出6星';
            drawHistory.appendChild(statsDiv);
        }

        const infoIcon = document.getElementById('infoIcon');
        const tooltipBox = document.getElementById('tooltipBox');
        
        if (infoIcon && tooltipBox) {
            // 移除可能存在的旧事件监听器
            const newInfoIcon = infoIcon.cloneNode(true);
            infoIcon.parentNode.replaceChild(newInfoIcon, infoIcon);
            
            let tooltipTimeout;
            
            newInfoIcon.addEventListener('mouseenter', () => {
                tooltipTimeout = setTimeout(() => {
                    tooltipBox.classList.add('show');
                }, 300);
            });

            newInfoIcon.addEventListener('mouseleave', () => {
                clearTimeout(tooltipTimeout);
                tooltipBox.classList.remove('show');
            });
        }

        console.log('抽卡模拟器初始化完成');
    } catch (error) {
        console.error('初始化失败:', error);
    }
}

// 添加卡片加载函数
async function loadCards() {
    try {
        const response = await fetch('/api/cards/list');
        const result = await response.json();
        
        if (!result.success) {
            throw new Error(result.error || '加载卡片失败');
        }

        // 更新全局变量
        window.cards = result.cards;
        window.highStarCards = result.cards.filter(card => card.rarity >= 5);

        // 初始显示高星卡片
        showHighStarCards();
        
        return result.cards;
    } catch (error) {
        console.error('加载卡片失败:', error);
        // 只在抽卡页面显示错误提示
        if (document.querySelector('.page.active')?.id === 'card-draw-page') {
            alert('加载卡片失败，请刷新页面重试');
        }
        return [];
    }
}

// 修改抽卡函数
function drawCard() {
    if (!window.cards || !window.highStarCards) {
        alert('卡片数据未加载，请刷新页面重试');
        return;
    }

    // 更新抽卡统计
    totalDraws++;
    drawsSinceLast6Star++;
    
    // 计算六星概率
    let sixStarRate = 0.02; // 基础2%概率
    if (drawsSinceLast6Star > 50) {
        // 超过50抽后，每抽增加2%概率
        sixStarRate += (drawsSinceLast6Star - 50) * 0.02;
    }

    // 随机抽取
    const rand = Math.random();
    let card;
    
    if (rand < sixStarRate) {
        // 抽中六星 (2%基础概率，可保底增加)
        const sixStarCards = window.cards.filter(card => card.rarity === 6);
        card = sixStarCards[Math.floor(Math.random() * sixStarCards.length)];
    } else if (rand < sixStarRate + 0.08) {
        // 抽中五星 (8%概率)
        const fiveStarCards = window.cards.filter(card => card.rarity === 5);
        card = fiveStarCards[Math.floor(Math.random() * fiveStarCards.length)];
    } else if (rand < sixStarRate + 0.08 + 0.20) {
        // 抽中四星 (20%概率)
        const fourStarCards = window.cards.filter(card => card.rarity === 4);
        card = fourStarCards[Math.floor(Math.random() * fourStarCards.length)];
    } else if (rand < sixStarRate + 0.08 + 0.20 + 0.30) {
        // 抽中三星 (30%概率)
        const threeStarCards = window.cards.filter(card => card.rarity === 3);
        card = threeStarCards[Math.floor(Math.random() * threeStarCards.length)];
    } else {
        // 抽中一二星 (剩余概率，约40%)
        const lowStarCards = window.cards.filter(card => card.rarity <= 2);
        card = lowStarCards[Math.floor(Math.random() * lowStarCards.length)];
    }
    
    // 显示抽卡记录区域
    const drawHistoryElement = document.querySelector('.draw-history');
    if (drawHistoryElement.style.display === 'none' || !drawHistoryElement.style.display) {
        drawHistoryElement.style.display = 'block';
    }
    
    // 更新6星统计并显示提示
    if (card.rarity === 6) {
        sixStarDraws++;
        drawsSinceLast6Star = 0;
        // 显示提示框
        showToast(`恭喜抽到 ${card.name}！`);
    }
    
    // 更新统计显示
    updateStats();
    
    // 显示抽卡结果
    const resultDiv = document.getElementById("draw-result");
    resultDiv.innerHTML = `
        <div class="card-result">
            <img src="/images/${card.image}" alt="${card.name}">
            <div class="card-info">
                <div class="card-name">${card.name}</div>
                <div class="card-rarity">
                    ${'<i class="star-icon">★</i>'.repeat(card.rarity)}
                </div>
            </div>
        </div>
    `;
    
    // 添加到抽卡历史记录（添加到开头而不是末尾）
    const historyItem = {
        card: card,
        time: new Date()
    };
    drawHistory.unshift(historyItem);
    
    // 新记录添加时重置到第一页
    drawHistoryCurrentPage = 1;
    
    // 更新抽卡记录显示
    updateDrawHistory();
}

// 修改更新抽卡历史函数
function updateDrawHistory() {
    const historyList = document.querySelector('.history-list');
    if (!historyList) return;

    // 计算分页数据
    const totalPages = Math.ceil(drawHistory.length / drawHistoryPageSize);
    const startIndex = (drawHistoryCurrentPage - 1) * drawHistoryPageSize;
    const endIndex = startIndex + drawHistoryPageSize;
    const currentRecords = drawHistory.slice(startIndex, endIndex);

    // 构建记录HTML
    let html = currentRecords.map(item => `
        <div class="history-item">
            <div class="card-info">
                <span class="name ${item.card.rarity === 6 ? 'six-star' : ''}">${item.card.name}</span>
                <span class="rarity">${'★'.repeat(item.card.rarity)}</span>
            </div>
            <span class="time">${formatTime(item.time)}</span>
        </div>
    `).join('');

    // 只有当记录数超过每页显示数时才添加分页控件
    if (drawHistory.length > drawHistoryPageSize) {
        html += `
            <div class="history-pagination">
                <button onclick="changeDrawHistoryPage(${drawHistoryCurrentPage - 1})" ${drawHistoryCurrentPage <= 1 ? 'disabled' : ''}>
                    上一页
                </button>
                <span class="page-info">${drawHistoryCurrentPage} / ${totalPages}</span>
                <button onclick="changeDrawHistoryPage(${drawHistoryCurrentPage + 1})" ${drawHistoryCurrentPage >= totalPages ? 'disabled' : ''}>
                    下一页
                </button>
            </div>
        `;
    }

    historyList.innerHTML = html;
}

function formatTime(date) {
    const pad = num => String(num).padStart(2, '0');
    return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

// 修改展示高星卡片函数
function showHighStarCards() {
    if (!window.highStarCards) return;

    const scrollContent = document.querySelector('.scroll-content');
    if (!scrollContent) return;

    scrollContent.innerHTML = '';
    
    // 按星级降序排序，相同星级按名字排序
    const sortedCards = [...window.highStarCards].sort((a, b) => {
        if (b.rarity !== a.rarity) {
            return a.rarity - b.rarity; // 星级升序（5星->6星）
        }
        return a.name.localeCompare(b.name); // 同星级按名字升序
    });
    
    sortedCards.forEach(card => {
        const cardElement = document.createElement('div');
        cardElement.className = 'card';
        cardElement.innerHTML = `
            <img src="/images/${card.image}" alt="${card.name}">
            <p>${card.name}</p>
        `;
        scrollContent.appendChild(cardElement);
    });
}

// 添加统计信息更新函数
function updateStats() {
    const statsDiv = document.querySelector('.stats-info');
    if (!statsDiv) {
        const drawHistory = document.querySelector('.draw-history');
        const newStatsDiv = document.createElement('div');
        newStatsDiv.className = 'stats-info';
        drawHistory.appendChild(newStatsDiv);
    }
    
    const averageDraws = sixStarDraws > 0 ? 
        Math.round(totalDraws / sixStarDraws) : 
        '∞';
    
    document.querySelector('.stats-info').innerHTML = `
        <div class="stat-item">总抽数<span class="highlight">${totalDraws}</span></div>
        <div class="stat-item">平均<span class="highlight">${averageDraws}</span>抽出6星</div>
        <div class="stat-item">距离上一次<span class="highlight">${drawsSinceLast6Star}</span>抽</div>
    `;
}
// 修改提示框显示函数
function showToast(message) {
    const toast = document.getElementById('draw-toast');
    if (!toast) return;
    
    // 如果已经有正在显示的toast，先移除它
    toast.classList.remove('show');
    void toast.offsetWidth; // 触发重排，确保动画重新开始
    
    // 设置消息并显示
    toast.textContent = message;
    toast.classList.add('show');
    
    // 2秒后隐藏
    clearTimeout(toast.timer); // 清除之前的定时器
    toast.timer = setTimeout(() => {
        toast.classList.remove('show');
    }, 2000);
}

// 添加页码切换函数到全局作用域
window.changeDrawHistoryPage = function(newPage) {
    const totalPages = Math.ceil(drawHistory.length / drawHistoryPageSize);
    if (newPage >= 1 && newPage <= totalPages) {
        drawHistoryCurrentPage = newPage;
        updateDrawHistory();
    }
}

// 添加十连抽函数
function drawTenCards() {
    const results = [];
    for(let i = 0; i < 10; i++) {
        // 获取一张卡但不显示结果
        if (!window.cards || !window.highStarCards) {
            alert('卡片数据未加载，请刷新页面重试');
            return;
        }

        totalDraws++;
        drawsSinceLast6Star++;
        
        let sixStarRate = 0.02;
        if (drawsSinceLast6Star > 50) {
            sixStarRate += (drawsSinceLast6Star - 50) * 0.02;
        }

        const rand = Math.random();
        let card;
        
        if (rand < sixStarRate) {
            const sixStarCards = window.cards.filter(card => card.rarity === 6);
            card = sixStarCards[Math.floor(Math.random() * sixStarCards.length)];
            sixStarDraws++;
            drawsSinceLast6Star = 0;
            showToast(`恭喜抽到 ${card.name}！`);
        } else if (rand < sixStarRate + 0.08) {
            const fiveStarCards = window.cards.filter(card => card.rarity === 5);
            card = fiveStarCards[Math.floor(Math.random() * fiveStarCards.length)];
        } else if (rand < sixStarRate + 0.08 + 0.20) {
            const fourStarCards = window.cards.filter(card => card.rarity === 4);
            card = fourStarCards[Math.floor(Math.random() * fourStarCards.length)];
        } else if (rand < sixStarRate + 0.08 + 0.20 + 0.30) {
            const threeStarCards = window.cards.filter(card => card.rarity === 3);
            card = threeStarCards[Math.floor(Math.random() * threeStarCards.length)];
        } else {
            const lowStarCards = window.cards.filter(card => card.rarity <= 2);
            card = lowStarCards[Math.floor(Math.random() * lowStarCards.length)];
        }
        
        results.push(card);
        
        // 添加到抽卡历史
        const historyItem = {
            card: card,
            time: new Date()
        };
        drawHistory.unshift(historyItem);
    }
    
    // 显示抽卡记录区域
    const drawHistoryElement = document.querySelector('.draw-history');
    if (drawHistoryElement.style.display === 'none' || !drawHistoryElement.style.display) {
        drawHistoryElement.style.display = 'block';
    }
    
    // 更新统计显示
    updateStats();
    
    // 重置到第一页
    drawHistoryCurrentPage = 1;
    
    // 更新抽卡记录显示
    updateDrawHistory();
    
    // 显示所有结果
    showDrawResults(results);
}

// 修改抽卡结果显示函数
function showDrawResults(cards) {
    const resultDiv = document.getElementById("draw-result");
    
    // 根据卡片数量决定显示样式
    const isMultiDraw = cards.length > 1;
    const cardWidth = isMultiDraw ? 'calc(20% - 10px)' : '100%';
    
    resultDiv.innerHTML = `
        <div class="card-results ${isMultiDraw ? 'multi-draw' : ''}">
            ${cards.map(card => `
                <div class="card-result" style="width: ${cardWidth}">
                    <img src="/images/${card.image}" alt="${card.name}">
                    <div class="card-info">
                        <div class="card-name">${card.name}</div>
                        <div class="card-rarity">
                            ${'<i class="star-icon">★</i>'.repeat(card.rarity)}
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}


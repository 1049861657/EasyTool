function connectDatabase() {
    if (window.location.hostname.includes('github.io')) {
        alert('数据库功能仅在本地环境可用。\n请在本地运行服务器使用此功能。');
        return;
    }

    const host = document.getElementById('db-host').value;
    const port = document.getElementById('db-port').value;
    const user = document.getElementById('db-user').value;
    const password = document.getElementById('db-password').value;
    const database = document.getElementById('db-name').value;

    console.log('尝试连接数据库:', { host, port, user, database });

    const connectButton = document.querySelector('.db-connection-form .db-btn');
    connectButton.textContent = '连接中...';
    connectButton.disabled = true;

    fetch('/api/connect', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ host, port, user, password, database })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        if (data.error) {
            throw new Error(data.error);
        }
        
        const connectionSection = document.querySelector('.db-connection-form').parentElement;
        const sectionHeader = connectionSection.querySelector('h3');
        
        sectionHeader.innerHTML = `
            <span class="toggle-icon">▼</span>
            数据库连接 (${database}@${host}:${port})
        `;
        
        const formContent = document.querySelector('.db-connection-form');
        formContent.style.display = 'none';
        
        sectionHeader.style.cursor = 'pointer';
        sectionHeader.onclick = function() {
            const isExpanded = formContent.style.display !== 'none';
            formContent.style.display = isExpanded ? 'none' : 'grid';
            this.querySelector('.toggle-icon').textContent = isExpanded ? '▼' : '▲';
        };

        document.getElementById('table-section').style.display = 'block';
        
        const select = document.getElementById('table-select');
        select.innerHTML = '<option value="">选择表</option>';
        data.tables.forEach(table => {
            const option = document.createElement('option');
            option.value = table[Object.keys(table)[0]];
            option.textContent = table[Object.keys(table)[0]];
            select.appendChild(option);
        });

        alert('连接成功！');
    })
    .catch(error => {
        console.error('连接失败:', error);
        alert('连接失败: ' + error.message);
    })
    .finally(() => {
        connectButton.textContent = '连接数据库';
        connectButton.disabled = false;
    });
}

function loadTableData(page = 1) {
    const table = document.getElementById('table-select').value;
    if (!table) return;

    const pageSize = window.currentPageSize || 10;  // 使用全局变量存储页面大小
    const host = document.getElementById('db-host').value;
    const port = document.getElementById('db-port').value;
    const user = document.getElementById('db-user').value;
    const password = document.getElementById('db-password').value;
    const database = document.getElementById('db-name').value;

    console.log('准备发送查询请求:', {
        table, page, pageSize, host, port, database
    });

    const tableContainer = document.querySelector('.table-container');
    tableContainer.innerHTML = '<div style="text-align: center; padding: 20px;">加载中...</div>';

    fetch('/api/query', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
            host, port, user, password, database, table,
            page,
            pageSize
        })
    })
    .then(response => {
        console.log('收到响应:', response.status);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(response => {
        console.log('响应数据:', response);
        if (response.error) {
            throw new Error(response.error);
        }
        
        displayTableData(response);
    })
    .catch(error => {
        console.error('查询失败:', error);
        tableContainer.innerHTML = `<div style="text-align: center; padding: 20px; color: red;">
            查询失败: ${error.message}</div>`;
    });
}

function displayTableData(response) {
    const { data, total, page, pageSize, totalPages } = response;
    const tableContainer = document.querySelector('.table-container');
    
    if (!data.length) {
        tableContainer.innerHTML = '<div style="text-align: center; padding: 20px;">表中没有数据</div>';
        return;
    }

    // 创建表格
    tableContainer.innerHTML = `
        <div class="table-scroll">
            <table id="data-table">
                <thead>
                    <tr>
                        ${Object.keys(data[0]).map(key => `<th>${key}</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
                    ${data.map(row => `
                        <tr>
                            ${Object.values(row).map(value => `
                                <td title="${value === null ? '-' : value}">
                                    ${value === null ? '-' : value}
                                </td>
                            `).join('')}
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        <div class="table-footer">
            <div class="page-size-selector">
                <select onchange="changePageSize(this.value)">
                    <option value="10" ${pageSize === 10 ? 'selected' : ''}>10条/页</option>
                    <option value="20" ${pageSize === 20 ? 'selected' : ''}>20条/页</option>
                    <option value="50" ${pageSize === 50 ? 'selected' : ''}>50条/页</option>
                    <option value="100" ${pageSize === 100 ? 'selected' : ''}>100条/页</option>
                </select>
            </div>
            <div class="pagination">
                <button onclick="loadTableData(1)" ${page === 1 ? 'disabled' : ''}>首页</button>
                <button onclick="loadTableData(${page - 1})" ${page === 1 ? 'disabled' : ''}>上一页</button>
                <span>第 ${page} / ${totalPages} 页</span>
                <button onclick="loadTableData(${page + 1})" ${page === totalPages ? 'disabled' : ''}>下一页</button>
                <button onclick="loadTableData(${totalPages})" ${page === totalPages ? 'disabled' : ''}>末页</button>
            </div>
            <div class="total-count">共 ${total} 条记录</div>
        </div>
    `;
}

// 添加页面大小改变的处理函数
function changePageSize(newSize) {
    window.currentPageSize = parseInt(newSize);
    loadTableData(1);  // 切换到第一页
}

function syncTableColumns() {
    const headerCells = document.querySelectorAll('#header-table th');
    const dataCells = document.querySelectorAll('#data-table tr:first-child td');
    
    headerCells.forEach((cell, index) => {
        if (dataCells[index]) {
            const width = Math.max(
                cell.getBoundingClientRect().width,
                dataCells[index].getBoundingClientRect().width
            );
            cell.style.width = `${width}px`;
            dataCells[index].style.width = `${width}px`;
        }
    });
}

function initTableScroll() {
    const tableWrapper = document.querySelector('.table-wrapper');
    const table = document.getElementById('data-table');

    // 监听滚动事件
    tableWrapper.addEventListener('scroll', function() {
        // 可以在这里添加滚动时的效果
    });

    // 添加鼠标滚轮事件
    tableWrapper.addEventListener('wheel', function(e) {
        if (e.shiftKey) {  // 按住Shift键时横向滚动
            e.preventDefault();
            tableWrapper.scrollLeft += e.deltaY;
        }
    });
}

function scrollTable(direction) {
    const tableWrapper = document.querySelector('.table-wrapper');
    const scrollAmount = tableWrapper.offsetWidth * 0.8;
    tableWrapper.scrollLeft += direction === 'left' ? -scrollAmount : scrollAmount;
} 
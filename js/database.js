// 在文件开头添加
let isConnectionFormCollapsed = false;

// 添加切换表单显示的函数
function toggleConnectionForm() {
    const form = document.querySelector('.db-connection-form');
    const icon = document.querySelector('.toggle-icon');
    const header = document.querySelector('.db-header');
    
    if (form && icon) {
        isConnectionFormCollapsed = !isConnectionFormCollapsed;
        if (isConnectionFormCollapsed) {
            form.classList.add('collapsed');
            icon.classList.add('collapsed');
        } else {
            form.classList.remove('collapsed');
            icon.classList.remove('collapsed');
        }
    }
}

// 数据库连接函数
async function connectToDatabase(config) {
    try {
        console.log('发送连接请求:', config);
        const response = await fetch('/api/database/connect', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(config)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('连接响应:', data);
        return data;
    } catch (error) {
        console.error('连接请求失败:', error);
        throw error;
    }
}

// 查询表数据
async function queryTable(config) {
    try {
        console.log('发送查询请求:', config);
        const response = await fetch('/api/database/query', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(config)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('查询响应:', data);
        return data;
    } catch (error) {
        console.error('查询请求失败:', error);
        throw error;
    }
}

// 添加分页状态
let currentPage = 1;
let currentPageSize = 10;
let totalRecords = 0;

// 更新表格显示函数
function updateTableDisplay(result) {
    const table = document.getElementById('data-table');
    if (!table) return;

    // 更新总记录数和当前页信息
    totalRecords = result.total;
    currentPage = result.page;
    currentPageSize = result.pageSize;

    // 清空现有表格
    table.innerHTML = '';

    if (!result.data || result.data.length === 0) {
        table.innerHTML = '<tr><td colspan="100%">无数据</td></tr>';
        return;
    }

    // 创建表头
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    Object.keys(result.data[0]).forEach(key => {
        const th = document.createElement('th');
        th.textContent = key;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // 创建表体
    const tbody = document.createElement('tbody');
    result.data.forEach(row => {
        const tr = document.createElement('tr');
        Object.values(row).forEach(value => {
            const td = document.createElement('td');
            td.textContent = value;
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
    table.appendChild(tbody);

    // 更新分页控件
    updatePagination();
}

// 添加分页控件更新函数
function updatePagination() {
    const paginationContainer = document.querySelector('.pagination');
    const pageSizeSelector = document.querySelector('.page-size-selector select');
    const totalCountDisplay = document.querySelector('.total-count');
    
    if (paginationContainer) {
        const totalPages = Math.ceil(totalRecords / currentPageSize);
        
        paginationContainer.innerHTML = `
            <button ${currentPage <= 1 ? 'disabled' : ''} onclick="changePage(${currentPage - 1})">上一页</button>
            <span>第 ${currentPage} 页，共 ${totalPages} 页</span>
            <button ${currentPage >= totalPages ? 'disabled' : ''} onclick="changePage(${currentPage + 1})">下一页</button>
        `;
    }

    if (pageSizeSelector) {
        pageSizeSelector.value = currentPageSize;
    }

    if (totalCountDisplay) {
        totalCountDisplay.textContent = `共 ${totalRecords} 条记录`;
    }
}

// 添加页码改变函数
async function changePage(newPage) {
    if (newPage < 1) return;

    const tableSelect = document.getElementById('table-select');
    const selectedTable = tableSelect.value;
    
    if (selectedTable && window.currentConfig) {
        try {
            const queryConfig = {
                ...window.currentConfig,
                table: selectedTable,
                page: newPage,
                pageSize: currentPageSize
            };

            const result = await queryTable(queryConfig);
            updateTableDisplay(result);
        } catch (error) {
            alert('查询失败: ' + error.message);
        }
    }
}

// 添加每页数量改变函数
async function changePageSize(newSize) {
    currentPageSize = parseInt(newSize);
    await changePage(1); // 切换到第一页
}

// 添加表格加载函数
async function loadTableData(page = 1) {
    const tableSelect = document.getElementById('table-select');
    const selectedTable = tableSelect.value;
    
    if (selectedTable && window.currentConfig) {
        try {
            const queryConfig = {
                ...window.currentConfig,
                table: selectedTable,
                page: page,
                pageSize: currentPageSize
            };

            const result = await queryTable(queryConfig);
            updateTableDisplay(result);
        } catch (error) {
            alert('查询失败: ' + error.message);
        }
    }
}

// 修改事件绑定部分
document.addEventListener('DOMContentLoaded', () => {
    const connectButton = document.querySelector('.db-btn');
    const tableSelect = document.getElementById('table-select');
    const dbHeader = document.querySelector('.db-header');
    window.currentConfig = null;

    // 添加头部点击事件
    if (dbHeader) {
        dbHeader.addEventListener('click', toggleConnectionForm);
    }

    if (connectButton) {
        connectButton.addEventListener('click', async () => {
            try {
                // 修改按钮文本显示连接中状态
                connectButton.textContent = '连接中...';
                connectButton.disabled = true;

                const config = {
                    host: document.getElementById('db-host').value,
                    port: document.getElementById('db-port').value,
                    user: document.getElementById('db-user').value,
                    password: document.getElementById('db-password').value,
                    database: document.getElementById('db-name').value
                };

                window.currentConfig = config;
                const result = await connectToDatabase(config);
                
                // 显示表格选择区域
                const tableSection = document.getElementById('table-section');
                if (tableSection) {
                    tableSection.style.display = 'block';
                }

                // 更新表格下拉列表
                if (tableSelect) {
                    tableSelect.innerHTML = '<option value="">选择数据表</option>' +
                        result.tables.map(table => `<option value="${table}">${table}</option>`).join('');
                }

                // 显示成功消息
                alert('数据库连接成功！');
                
                // 更新按钮状态
                connectButton.textContent = '重新连接';
                connectButton.disabled = false;
                connectButton.classList.add('connected');

                // 连接成功后自动收起表单
                isConnectionFormCollapsed = false;  // 确保状态正确
                toggleConnectionForm();

            } catch (error) {
                // 显示错误消息
                alert('连接失败: ' + error.message);
                
                // 重置按钮状态
                connectButton.textContent = '连接数据库';
                connectButton.disabled = false;
                connectButton.classList.remove('connected');
            }
        });
    }

    if (tableSelect) {
        tableSelect.addEventListener('change', () => {
            loadTableData(1); // 使用函数而不是直接在这里写逻辑
        });
    }

    // 添加页面大小选择器事件监听
    const pageSizeSelector = document.querySelector('.page-size-selector select');
    if (pageSizeSelector) {
        pageSizeSelector.addEventListener('change', (e) => {
            changePageSize(e.target.value);
        });
    }
});

// 将分页函数添加到全局作用域
window.changePage = changePage;
window.changePageSize = changePageSize;

// 将切换函数添加到全局作用域
window.toggleConnectionForm = toggleConnectionForm;
window.loadTableData = loadTableData;
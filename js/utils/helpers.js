/**
 * 辅助函数模块
 * Helper Functions Module
 * 
 * 提供通用的辅助函数
 */

import { UI_CONFIG } from '../config/constants.js';

/**
 * 格式化文件大小
 * @param {number} bytes - 字节数
 * @returns {string} 格式化后的文件大小
 */
export function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * 显示成功消息
 * @param {string} message - 消息内容
 * @param {number} duration - 显示时长（毫秒），默认3000
 */
export function showSuccess(message, duration = 3000) {
    showMessage(message, 'success', duration);
}

/**
 * 显示错误消息
 * @param {string} message - 消息内容
 * @param {number} duration - 显示时长（毫秒），默认5000
 */
export function showError(message, duration = 5000) {
    showMessage(message, 'danger', duration);
}

/**
 * 显示警告消息
 * @param {string} message - 消息内容
 * @param {number} duration - 显示时长（毫秒），默认4000
 */
export function showWarning(message, duration = 4000) {
    showMessage(message, 'warning', duration);
}

/**
 * 显示信息消息
 * @param {string} message - 消息内容
 * @param {number} duration - 显示时长（毫秒），默认3000
 */
export function showInfo(message, duration = 3000) {
    showMessage(message, 'info', duration);
}

/**
 * 通用消息显示函数
 * @param {string} message - 消息内容
 * @param {string} type - 消息类型（success, danger, warning, info）
 * @param {number} duration - 显示时长（毫秒）
 */
function showMessage(message, type, duration) {
    // 创建消息元素
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3`;
    alertDiv.style.zIndex = '9999';
    alertDiv.style.minWidth = '300px';
    alertDiv.setAttribute('role', 'alert');
    
    // 安全地设置消息内容（防止XSS）
    const messageText = document.createTextNode(message);
    alertDiv.appendChild(messageText);
    
    // 添加关闭按钮
    const closeButton = document.createElement('button');
    closeButton.type = 'button';
    closeButton.className = 'btn-close';
    closeButton.setAttribute('data-bs-dismiss', 'alert');
    closeButton.setAttribute('aria-label', 'Close');
    alertDiv.appendChild(closeButton);
    
    // 添加到页面
    document.body.appendChild(alertDiv);
    
    // 自动移除
    setTimeout(() => {
        alertDiv.classList.remove('show');
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.parentNode.removeChild(alertDiv);
            }
        }, 300);
    }, duration);
}

/**
 * 显示/隐藏元素
 * @param {HTMLElement|string} element - DOM元素或选择器
 * @param {boolean} show - true为显示，false为隐藏
 */
export function toggleElement(element, show) {
    const el = typeof element === 'string' ? document.querySelector(element) : element;
    if (el) {
        el.style.display = show ? 'block' : 'none';
    }
}

/**
 * 显示元素
 * @param {HTMLElement|string} element - DOM元素或选择器
 */
export function showElement(element) {
    toggleElement(element, true);
}

/**
 * 隐藏元素
 * @param {HTMLElement|string} element - DOM元素或选择器
 */
export function hideElement(element) {
    toggleElement(element, false);
}

/**
 * 更新进度条
 * @param {number} percentage - 进度百分比（0-100）
 * @param {string} text - 进度文本
 * @param {string} subText - 子文本（可选）
 */
export function updateProgress(percentage, text = '', subText = '') {
    const progressBar = document.getElementById('progressBar');
    if (progressBar) {
        progressBar.style.width = `${percentage}%`;
        progressBar.setAttribute('aria-valuenow', percentage);
        progressBar.textContent = text || `${percentage}%`;
    }
    
    const statusText = document.getElementById('processingStatusText');
    if (statusText) {
        statusText.textContent = text !== undefined ? text : '';
    }
    
    const subStatusText = document.getElementById('processingSubStatus');
    if (subStatusText) {
        subStatusText.textContent = subText || '';
    }
}

/**
 * 延迟执行
 * @param {number} ms - 延迟时间（毫秒）
 * @returns {Promise} Promise对象
 */
export function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 显示加载覆盖层
 * @param {string} message - 加载消息
 */
export function showLoadingOverlay(message = '正在加载...') {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        const loadingText = overlay.querySelector('.loading-text');
        if (loadingText) {
            loadingText.textContent = message;
        }
        overlay.classList.remove('hidden');
        overlay.style.display = 'flex';
    }
}

/**
 * 隐藏加载覆盖层
 */
export function hideLoadingOverlay() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.classList.add('hidden');
        setTimeout(() => {
            overlay.style.display = 'none';
        }, UI_CONFIG.LOADING_TRANSITION_MS);
    }
}

/**
 * 深拷贝对象
 * @param {*} obj - 要拷贝的对象
 * @returns {*} 拷贝后的对象
 */
export function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }
    
    if (obj instanceof Date) {
        return new Date(obj.getTime());
    }
    
    if (obj instanceof Array) {
        return obj.map(item => deepClone(item));
    }
    
    const clonedObj = {};
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            clonedObj[key] = deepClone(obj[key]);
        }
    }
    
    return clonedObj;
}

/**
 * 防抖函数
 * @param {Function} func - 要执行的函数
 * @param {number} wait - 等待时间（毫秒）
 * @returns {Function} 防抖后的函数
 */
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * 节流函数
 * @param {Function} func - 要执行的函数
 * @param {number} wait - 等待时间（毫秒）
 * @returns {Function} 节流后的函数
 */
export function throttle(func, wait) {
    let timeout;
    let lastRun = 0;
    
    return function executedFunction(...args) {
        if (!timeout) {
            func(...args);
            lastRun = Date.now();
            timeout = setTimeout(() => {
                timeout = null;
            }, wait);
        }
    };
}

/**
 * 下载文件
 * @param {Blob} blob - 文件Blob对象
 * @param {string} filename - 文件名
 */
export function downloadFile(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * 转义HTML特殊字符
 * @param {string} str - 要转义的字符串
 * @returns {string} 转义后的字符串
 */
export function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

/**
 * 生成唯一ID
 * @returns {string} 唯一ID
 */
export function generateId() {
    return `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 验证文件类型
 * @param {File} file - 文件对象
 * @param {string[]} allowedExtensions - 允许的文件扩展名数组
 * @returns {boolean} 是否为允许的文件类型
 */
export function validateFileType(file, allowedExtensions) {
    const fileName = file.name.toLowerCase();
    return allowedExtensions.some(ext => fileName.endsWith(ext.toLowerCase()));
}

/**
 * 验证文件大小
 * @param {File} file - 文件对象
 * @param {number} maxSize - 最大文件大小（字节）
 * @returns {boolean} 文件大小是否符合要求
 */
export function validateFileSize(file, maxSize) {
    return file.size <= maxSize;
}

/**
 * 清空表格
 * @param {HTMLElement|string} tableId - 表格元素或ID
 */
export function clearTable(tableId) {
    const table = typeof tableId === 'string' ? document.getElementById(tableId) : tableId;
    if (table) {
        const thead = table.querySelector('thead');
        const tbody = table.querySelector('tbody');
        if (thead) thead.innerHTML = '';
        if (tbody) tbody.innerHTML = '';
    }
}

/**
 * 创建表格
 * @param {string[]} headers - 表头数组
 * @param {Array[]} rows - 数据行数组
 * @param {HTMLElement} container - 容器元素
 */
export function createTable(headers, rows, container) {
    const table = document.createElement('table');
    table.className = 'table table-striped table-bordered table-sm';
    
    // 创建表头
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    headers.forEach(header => {
        const th = document.createElement('th');
        th.textContent = header;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);
    
    // 创建表体
    const tbody = document.createElement('tbody');
    rows.forEach(row => {
        const tr = document.createElement('tr');
        row.forEach(cell => {
            const td = document.createElement('td');
            td.textContent = cell !== null && cell !== undefined ? cell : '';
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    
    // 清空容器并添加表格
    container.innerHTML = '';
    container.appendChild(table);
}

/**
 * 从数据数组中提取所有列名（按照出现顺序）
 * @param {Array} data - 数据数组
 * @param {Array} preferredOrder - 优先的列顺序（可选）
 * @returns {Array} 列名数组
 */
export function extractAllColumns(data, preferredOrder = []) {
    if (!data || data.length === 0) {
        return preferredOrder;
    }
    
    // 收集所有列名（保持顺序）
    const allColumns = new Set();
    
    // 首先添加优先顺序的列（如果它们存在于数据中）
    for (const col of preferredOrder) {
        if (data.some(row => col in row)) {
            allColumns.add(col);
        }
    }
    
    // 然后添加数据中的其他列
    for (const row of data) {
        for (const key of Object.keys(row)) {
            allColumns.add(key);
        }
    }
    
    return Array.from(allColumns);
}

/**
 * 生成导出文件名的时间戳
 * @returns {string} 格式化的时间戳字符串 (YYYYMMDD_HHMMSS)
 */
export function generateExportTimestamp() {
    const now = new Date();
    return now.getFullYear() + 
           String(now.getMonth() + 1).padStart(2, '0') + 
           String(now.getDate()).padStart(2, '0') + '_' +
           String(now.getHours()).padStart(2, '0') + 
           String(now.getMinutes()).padStart(2, '0') + 
           String(now.getSeconds()).padStart(2, '0');
}

/**
 * 转义CSV值（处理逗号、引号、换行符）
 * @param {any} value - 要转义的值
 * @returns {string} 转义后的值
 */
export function escapeCsvValue(value) {
    if (value === null || value === undefined) {
        return '';
    }
    
    const strValue = String(value);
    
    // 如果包含逗号、引号或换行符，需要用引号包裹并转义内部引号
    if (strValue.includes(',') || strValue.includes('"') || strValue.includes('\n')) {
        return '"' + strValue.replace(/"/g, '""') + '"';
    }
    
    return strValue;
}

// 导出所有函数
export default {
    formatFileSize,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    toggleElement,
    showElement,
    hideElement,
    updateProgress,
    showLoadingOverlay,
    hideLoadingOverlay,
    delay,
    deepClone,
    debounce,
    throttle,
    downloadFile,
    escapeHtml,
    generateId,
    validateFileType,
    validateFileSize,
    clearTable,
    createTable,
    extractAllColumns,
    generateExportTimestamp,
    escapeCsvValue
};

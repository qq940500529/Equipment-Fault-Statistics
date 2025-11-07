/**
 * 主程序入口文件
 * Main Application Entry Point
 * 
 * Equipment Fault Statistics System v0.2.0
 */

import { APP_CONFIG } from './config/constants.js';
import { showInfo, showSuccess, showError, formatFileSize, createTable, clearTable, updateProgress } from './utils/helpers.js';
import { FileUploader } from './modules/fileUploader.js';
import { DataParser } from './modules/dataParser.js';

/**
 * 应用程序类
 */
class App {
    constructor() {
        this.initialized = false;
        this.currentStep = 1;
        this.rawData = null;
        this.processedData = null;
        this.stats = null;
        this.fileUploader = new FileUploader();
        this.dataParser = new DataParser();
        this.currentFile = null;
    }

    /**
     * 初始化应用程序
     */
    init() {
        console.log(`${APP_CONFIG.APP_NAME} v${APP_CONFIG.VERSION} 正在初始化...`);
        
        // 绑定事件监听器
        this.bindEvents();
        
        // 设置拖拽上传
        this.setupDragAndDrop();
        
        this.initialized = true;
        console.log('应用程序初始化完成');
        
        // 显示欢迎消息
        this.showWelcomeMessage();
    }

    /**
     * 绑定事件监听器
     */
    bindEvents() {
        // 文件选择按钮
        const selectFileBtn = document.getElementById('selectFileBtn');
        if (selectFileBtn) {
            selectFileBtn.addEventListener('click', () => {
                document.getElementById('fileInput').click();
            });
        }

        // 文件输入变化
        const fileInput = document.getElementById('fileInput');
        if (fileInput) {
            fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        }

        // 处理按钮
        const processBtn = document.getElementById('processBtn');
        if (processBtn) {
            processBtn.addEventListener('click', () => this.handleProcess());
        }

        // 导出按钮
        const exportExcelBtn = document.getElementById('exportExcelBtn');
        if (exportExcelBtn) {
            exportExcelBtn.addEventListener('click', () => this.handleExportExcel());
        }

        const exportCsvBtn = document.getElementById('exportCsvBtn');
        if (exportCsvBtn) {
            exportCsvBtn.addEventListener('click', () => this.handleExportCsv());
        }

        const exportJsonBtn = document.getElementById('exportJsonBtn');
        if (exportJsonBtn) {
            exportJsonBtn.addEventListener('click', () => this.handleExportJson());
        }

        // 重置按钮
        const resetBtn = document.getElementById('resetBtn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.handleReset());
        }
    }

    /**
     * 设置拖拽上传
     */
    setupDragAndDrop() {
        const uploadArea = document.getElementById('uploadArea');
        if (!uploadArea) return;

        // 阻止默认拖拽行为
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            uploadArea.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
            });
        });

        // 拖拽进入
        ['dragenter', 'dragover'].forEach(eventName => {
            uploadArea.addEventListener(eventName, () => {
                uploadArea.classList.add('drag-over');
            });
        });

        // 拖拽离开
        ['dragleave', 'drop'].forEach(eventName => {
            uploadArea.addEventListener(eventName, () => {
                uploadArea.classList.remove('drag-over');
            });
        });

        // 文件拖放
        uploadArea.addEventListener('drop', (e) => {
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleFileSelect({ target: { files: files } });
            }
        });
    }

    /**
     * 显示欢迎消息
     */
    showWelcomeMessage() {
        showInfo('欢迎使用设备故障统计数据处理系统！请上传Excel文件开始处理。', 4000);
    }

    /**
     * 处理文件选择
     * @param {Event} event - 文件选择事件
     */
    async handleFileSelect(event) {
        const file = event.target.files[0];
        if (!file) return;

        console.log('选择的文件:', file.name, file.size);
        
        try {
            // 显示加载状态
            updateProgress(10, '正在读取文件...');
            
            // 读取文件
            const fileData = await this.fileUploader.readFile(file);
            this.currentFile = file;
            
            updateProgress(30, '正在解析Excel...');
            
            // 解析Excel
            const parseResult = this.dataParser.parseExcel(fileData);
            
            if (!parseResult.success) {
                throw new Error(parseResult.error);
            }
            
            updateProgress(60, '解析完成，准备预览...');
            
            // 保存原始数据
            this.rawData = parseResult.data;
            
            // 显示文件信息
            this.displayFileInfo(file);
            
            // 显示数据统计
            this.displayDataStatistics(parseResult);
            
            // 显示数据预览
            this.displayDataPreview(parseResult);
            
            updateProgress(100, '完成！');
            
            // 显示第二步
            this.showStep(2);
            
            showSuccess(`文件读取成功！共 ${parseResult.rowCount} 行数据`, 3000);
            
        } catch (error) {
            console.error('文件处理错误:', error);
            showError('文件处理失败: ' + error.message);
            updateProgress(0, '');
        }
    }

    /**
     * 显示文件信息
     * @param {File} file - 文件对象
     */
    displayFileInfo(file) {
        const fileInfo = document.getElementById('fileInfo');
        const fileName = document.getElementById('fileName');
        const fileSize = document.getElementById('fileSize');
        
        if (fileInfo && fileName && fileSize) {
            fileName.textContent = file.name;
            fileSize.textContent = formatFileSize(file.size);
            fileInfo.style.display = 'block';
        }
    }

    /**
     * 显示数据统计信息
     * @param {Object} parseResult - 解析结果
     */
    displayDataStatistics(parseResult) {
        const statsContainer = document.getElementById('dataStats');
        if (!statsContainer) return;
        
        const stats = this.dataParser.getStatistics();
        
        statsContainer.innerHTML = `
            <div class="row">
                <div class="col-md-4">
                    <div class="card">
                        <div class="card-body text-center">
                            <h5 class="card-title">总行数</h5>
                            <p class="card-text display-6">${stats.totalRows}</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card">
                        <div class="card-body text-center">
                            <h5 class="card-title">列数</h5>
                            <p class="card-text display-6">${stats.columnCount}</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card">
                        <div class="card-body text-center">
                            <h5 class="card-title">工作表</h5>
                            <p class="card-text display-6">${parseResult.sheetName}</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        statsContainer.style.display = 'block';
    }

    /**
     * 显示数据预览
     * @param {Object} parseResult - 解析结果
     */
    displayDataPreview(parseResult) {
        const previewContainer = document.getElementById('dataPreview');
        if (!previewContainer) return;
        
        // 清空之前的内容
        previewContainer.innerHTML = '';
        
        // 获取预览数据（前50行）
        const previewData = this.dataParser.getPreviewData(50);
        
        // 创建表格
        const tableDiv = document.createElement('div');
        tableDiv.className = 'table-responsive';
        tableDiv.style.maxHeight = '400px';
        tableDiv.style.overflow = 'auto';
        
        const table = document.createElement('table');
        table.className = 'table table-striped table-bordered table-sm table-hover';
        
        // 创建表头
        const thead = document.createElement('thead');
        thead.className = 'table-dark sticky-top';
        const headerRow = document.createElement('tr');
        
        // 添加序号列
        const indexTh = document.createElement('th');
        indexTh.textContent = '#';
        indexTh.style.width = '50px';
        headerRow.appendChild(indexTh);
        
        // 添加数据列
        parseResult.headers.forEach(header => {
            const th = document.createElement('th');
            th.textContent = header;
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);
        
        // 创建表体
        const tbody = document.createElement('tbody');
        previewData.forEach((row, index) => {
            const tr = document.createElement('tr');
            
            // 添加序号
            const indexTd = document.createElement('td');
            indexTd.textContent = index + 1;
            indexTd.className = 'text-center';
            tr.appendChild(indexTd);
            
            // 添加数据
            parseResult.headers.forEach(header => {
                const td = document.createElement('td');
                const value = row[header];
                td.textContent = value != null ? value : '';
                tr.appendChild(td);
            });
            
            tbody.appendChild(tr);
        });
        table.appendChild(tbody);
        
        tableDiv.appendChild(table);
        previewContainer.appendChild(tableDiv);
        
        // 添加预览说明
        const note = document.createElement('p');
        note.className = 'text-muted mt-2';
        note.textContent = `显示前 ${Math.min(previewData.length, 50)} 行数据`;
        previewContainer.appendChild(note);
        
        previewContainer.style.display = 'block';
    }

    /**
     * 显示指定步骤
     * @param {number} step - 步骤编号
     */
    showStep(step) {
        this.currentStep = step;
        const stepElement = document.getElementById(`step-${step}`);
        if (stepElement) {
            stepElement.style.display = 'block';
            // 平滑滚动到该步骤
            stepElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    /**
     * 处理数据处理
     */
    handleProcess() {
        console.log('开始处理数据...');
        showInfo('数据处理功能将在后续阶段实现...', 3000);
    }

    /**
     * 处理Excel导出
     */
    handleExportExcel() {
        console.log('导出Excel文件...');
        showInfo('Excel导出功能将在后续阶段实现...', 3000);
    }

    /**
     * 处理CSV导出
     */
    handleExportCsv() {
        console.log('导出CSV文件...');
        showInfo('CSV导出功能将在后续阶段实现...', 3000);
    }

    /**
     * 处理JSON导出
     */
    handleExportJson() {
        console.log('导出JSON文件...');
        showInfo('JSON导出功能将在后续阶段实现...', 3000);
    }

    /**
     * 处理重置
     */
    handleReset() {
        console.log('重置应用程序...');
        
        // 清空数据
        this.rawData = null;
        this.processedData = null;
        this.stats = null;
        this.currentStep = 1;
        this.currentFile = null;
        
        // 重置模块
        this.fileUploader.reset();
        this.dataParser.reset();
        
        // 重置文件输入
        const fileInput = document.getElementById('fileInput');
        if (fileInput) {
            fileInput.value = '';
        }
        
        // 隐藏文件信息
        const fileInfo = document.getElementById('fileInfo');
        if (fileInfo) {
            fileInfo.style.display = 'none';
        }
        
        // 隐藏统计信息
        const dataStats = document.getElementById('dataStats');
        if (dataStats) {
            dataStats.style.display = 'none';
        }
        
        // 隐藏数据预览
        const dataPreview = document.getElementById('dataPreview');
        if (dataPreview) {
            dataPreview.style.display = 'none';
        }
        
        // 隐藏步骤2-4
        ['step-2', 'step-3', 'step-4'].forEach(stepId => {
            const step = document.getElementById(stepId);
            if (step) {
                step.style.display = 'none';
            }
        });
        
        // 重置进度条
        updateProgress(0, '');
        
        showSuccess('已重置，可以处理新文件', 2000);
    }
}

// 创建应用程序实例
const app = new App();

// DOM加载完成后初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        app.init();
    });
} else {
    app.init();
}

// 导出应用实例（用于调试）
window.app = app;

// 全局错误处理
window.addEventListener('error', (event) => {
    console.error('全局错误:', event.error);
    showError('发生错误: ' + event.error.message);
});

// 未捕获的Promise拒绝
window.addEventListener('unhandledrejection', (event) => {
    console.error('未处理的Promise拒绝:', event.reason);
    showError('发生错误: ' + event.reason);
});

console.log(`${APP_CONFIG.APP_NAME} v${APP_CONFIG.VERSION} 已加载`);

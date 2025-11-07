/**
 * 主程序入口文件
 * Main Application Entry Point
 * 
 * Equipment Fault Statistics System v0.1.0
 */

import { APP_CONFIG } from './config/constants.js';
import { showInfo, showSuccess, showError } from './utils/helpers.js';

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
    handleFileSelect(event) {
        const file = event.target.files[0];
        if (!file) return;

        console.log('选择的文件:', file.name, file.size);
        
        // TODO: 在后续阶段实现文件验证和读取
        showInfo('文件读取功能将在下一阶段实现...', 3000);
        
        // 显示文件信息（临时实现）
        const fileInfo = document.getElementById('fileInfo');
        const fileName = document.getElementById('fileName');
        const fileSize = document.getElementById('fileSize');
        
        if (fileInfo && fileName && fileSize) {
            fileName.textContent = file.name;
            fileSize.textContent = this.formatFileSize(file.size);
            fileInfo.style.display = 'block';
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
        
        // 隐藏步骤2-4
        ['step-2', 'step-3', 'step-4'].forEach(stepId => {
            const step = document.getElementById(stepId);
            if (step) {
                step.style.display = 'none';
            }
        });
        
        showSuccess('已重置，可以处理新文件', 2000);
    }

    /**
     * 格式化文件大小
     * @param {number} bytes - 字节数
     * @returns {string} 格式化后的文件大小
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
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

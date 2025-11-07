/**
 * 主程序入口文件
 * Main Application Entry Point
 * 
 * Equipment Fault Statistics System v0.3.0
 */

import { APP_CONFIG, TABLE_CONFIG } from './config/constants.js';
import { showInfo, showSuccess, showError, showWarning, formatFileSize, createTable, clearTable, updateProgress, escapeHtml, extractAllColumns, generateExportTimestamp, escapeCsvValue, showLoadingOverlay, hideLoadingOverlay } from './utils/helpers.js';
import { FileUploader } from './modules/fileUploader.js';
import { DataParser } from './modules/dataParser.js';
import { DataValidator } from './modules/dataValidator.js';
import { DataTransformer } from './modules/dataTransformer.js';

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
        this.dataValidator = new DataValidator();
        this.dataTransformer = new DataTransformer();
        this.currentFile = null;
        this.validationResult = null;
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
        
        // 隐藏加载覆盖层
        hideLoadingOverlay();
        
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
            // 显示处理进度
            this.showStep(3);
            
            // 显示加载状态
            updateProgress(10, '正在读取文件...', `文件大小: ${formatFileSize(file.size)}`);
            
            // 读取文件
            const fileData = await this.fileUploader.readFile(file);
            this.currentFile = file;
            
            updateProgress(30, '正在解析Excel...', '读取文件内容完成');
            
            // 解析Excel
            const parseResult = this.dataParser.parseExcel(fileData);
            
            if (!parseResult.success) {
                throw new Error(parseResult.error);
            }
            
            updateProgress(60, '解析完成，准备预览...', `共 ${parseResult.rowCount} 行数据`);
            
            // 保存原始数据
            this.rawData = parseResult.data;
            
            // 显示文件信息
            this.displayFileInfo(file);
            
            // 显示数据统计
            this.displayDataStatistics(parseResult);
            
            // 显示数据预览
            this.displayDataPreview(parseResult);
            
            updateProgress(100, '完成！', '数据加载成功');
            
            // 短暂延迟以显示完成状态
            await new Promise(resolve => setTimeout(resolve, 300));
            
            // 隐藏步骤3，显示第二步
            const step3 = document.getElementById('step-3');
            if (step3) {
                step3.style.display = 'none';
            }
            this.showStep(2);
            
            showSuccess(`文件读取成功！共 ${parseResult.rowCount} 行数据`, 3000);
            
        } catch (error) {
            console.error('文件处理错误:', error);
            showError('文件处理失败: ' + error.message);
            updateProgress(0, '');
            // 隐藏步骤3
            const step3 = document.getElementById('step-3');
            if (step3) {
                step3.style.display = 'none';
            }
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
        
        // 转义用户输入以防止XSS攻击
        const safeSheetName = escapeHtml(parseResult.sheetName);
        
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
                            <p class="card-text display-6">${safeSheetName}</p>
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
        
        // 获取预览数据（使用配置的行数）
        const previewData = this.dataParser.getPreviewData(TABLE_CONFIG.PREVIEW_ROWS);
        
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
        note.textContent = `显示前 ${Math.min(previewData.length, TABLE_CONFIG.PREVIEW_ROWS)} 行数据`;
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
    async handleProcess() {
        if (!this.rawData) {
            showError('没有可处理的数据，请先上传文件');
            return;
        }

        console.log('开始处理数据...');
        
        try {
            // 显示步骤3
            this.showStep(3);
            
            updateProgress(10, '正在验证数据...', '检查数据完整性');
            
            // 步骤1: 数据验证
            const columnMapping = this.dataParser.getColumnMapping();
            this.validationResult = this.dataValidator.validate(this.rawData, columnMapping);
            
            // 显示验证结果
            this.displayValidationResult(this.validationResult);
            
            if (!this.validationResult.valid) {
                showError('数据验证失败，请检查数据并修正错误后重试');
                updateProgress(0, '');
                // 隐藏步骤3
                const step3 = document.getElementById('step-3');
                if (step3) {
                    step3.style.display = 'none';
                }
                return;
            }
            
            updateProgress(30, '验证通过，开始转换数据...', '数据格式正确');
            
            updateProgress(50, '正在处理数据...', '删除无效行、分列、计算时间');
            
            // 步骤2: 数据转换
            const transformResult = this.dataTransformer.transform(this.rawData, columnMapping);
            this.processedData = transformResult.data;
            this.stats = transformResult.stats;
            
            updateProgress(70, '数据转换完成，准备预览...', `处理后共 ${this.processedData.length} 行数据`);
            
            // 显示处理统计
            this.displayProcessingStats(transformResult.stats);
            
            // 显示处理后数据预览
            this.displayProcessedDataPreview();
            
            updateProgress(100, '完成！', '数据处理成功');
            
            // 短暂延迟以显示完成状态
            await new Promise(resolve => setTimeout(resolve, 300));
            
            showSuccess(`数据处理成功！处理后共 ${this.processedData.length} 行数据`, 3000);
            
        } catch (error) {
            console.error('数据处理错误:', error);
            showError('数据处理失败: ' + error.message);
            updateProgress(0, '');
            // 隐藏步骤3
            const step3 = document.getElementById('step-3');
            if (step3) {
                step3.style.display = 'none';
            }
        }
    }

    /**
     * 显示验证结果
     * @param {Object} validationResult - 验证结果
     */
    displayValidationResult(validationResult) {
        const validationContainer = document.getElementById('validationResult');
        if (!validationContainer) return;
        
        validationContainer.innerHTML = '';
        
        // 显示验证状态
        const statusDiv = document.createElement('div');
        statusDiv.className = validationResult.valid ? 'alert alert-success' : 'alert alert-danger';
        statusDiv.innerHTML = `<strong>${validationResult.valid ? '✓ 数据验证通过' : '✗ 数据验证失败'}</strong>`;
        validationContainer.appendChild(statusDiv);
        
        // 显示错误信息
        if (validationResult.errors.length > 0) {
            const errorsDiv = document.createElement('div');
            errorsDiv.className = 'alert alert-danger';
            errorsDiv.innerHTML = '<strong>错误:</strong><ul class="mb-0">';
            validationResult.errors.forEach(error => {
                errorsDiv.innerHTML += `<li>${escapeHtml(error)}</li>`;
            });
            errorsDiv.innerHTML += '</ul>';
            validationContainer.appendChild(errorsDiv);
        }
        
        // 显示警告信息
        if (validationResult.warnings.length > 0) {
            const warningsDiv = document.createElement('div');
            warningsDiv.className = 'alert alert-warning';
            warningsDiv.innerHTML = '<strong>警告:</strong><ul class="mb-0">';
            validationResult.warnings.forEach(warning => {
                warningsDiv.innerHTML += `<li>${escapeHtml(warning)}</li>`;
            });
            warningsDiv.innerHTML += '</ul>';
            validationContainer.appendChild(warningsDiv);
        }
        
        validationContainer.style.display = 'block';
    }

    /**
     * 显示处理统计信息
     * @param {Object} stats - 处理统计信息
     */
    displayProcessingStats(stats) {
        const statsContainer = document.getElementById('processingStats');
        if (!statsContainer) return;
        
        // Ensure all stats are numbers to prevent XSS
        const totalRowsRemoved = Number(stats.totalRowsRemoved) || 0;
        const incompleteTimeRowsRemoved = Number(stats.incompleteTimeRowsRemoved) || 0;
        const workshopColumnSplit = stats.workshopColumnSplit ? '✓' : '-';
        const repairPersonClassified = stats.repairPersonClassified ? '✓' : '-';
        
        statsContainer.innerHTML = `
            <div class="row">
                <div class="col-md-3">
                    <div class="card">
                        <div class="card-body text-center">
                            <h6 class="card-title">删除合计行</h6>
                            <p class="card-text h4">${totalRowsRemoved}</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card">
                        <div class="card-body text-center">
                            <h6 class="card-title">删除不完整行</h6>
                            <p class="card-text h4">${incompleteTimeRowsRemoved}</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card">
                        <div class="card-body text-center">
                            <h6 class="card-title">车间列分列</h6>
                            <p class="card-text h4">${workshopColumnSplit}</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card">
                        <div class="card-body text-center">
                            <h6 class="card-title">维修人分类</h6>
                            <p class="card-text h4">${repairPersonClassified}</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        statsContainer.style.display = 'block';
    }

    /**
     * 显示处理后数据预览
     */
    displayProcessedDataPreview() {
        const tableHeader = document.getElementById('resultTableHeader');
        const tableBody = document.getElementById('resultTableBody');
        
        if (!tableHeader || !tableBody) return;
        
        // 清空之前的内容
        tableHeader.innerHTML = '';
        tableBody.innerHTML = '';
        
        // 获取列头 - 使用原始表头顺序，然后添加所有其他列
        const originalHeaders = this.dataParser.getHeaders();
        const headers = extractAllColumns(this.processedData, originalHeaders);
        
        // 获取预览数据（前50行）
        const previewData = this.processedData.slice(0, TABLE_CONFIG.PREVIEW_ROWS);
        
        // 创建表头
        const headerRow = document.createElement('tr');
        headerRow.className = 'table-dark';
        
        // 添加序号列
        const indexTh = document.createElement('th');
        indexTh.textContent = '#';
        indexTh.style.width = '50px';
        headerRow.appendChild(indexTh);
        
        // 添加数据列
        headers.forEach(header => {
            const th = document.createElement('th');
            th.textContent = header;
            headerRow.appendChild(th);
        });
        tableHeader.appendChild(headerRow);
        
        // 创建表体
        previewData.forEach((row, index) => {
            const tr = document.createElement('tr');
            
            // 添加序号
            const indexTd = document.createElement('td');
            indexTd.textContent = index + 1;
            indexTd.className = 'text-center';
            tr.appendChild(indexTd);
            
            // 添加数据
            headers.forEach(header => {
                const td = document.createElement('td');
                const value = row[header];
                td.textContent = value != null ? value : '';
                tr.appendChild(td);
            });
            
            tableBody.appendChild(tr);
        });
        
        // 显示第四步
        this.showStep(4);
    }

    /**
     * 处理Excel导出
     */
    handleExportExcel() {
        if (!this.processedData || this.processedData.length === 0) {
            showError('没有可导出的数据');
            return;
        }
        
        // Check if XLSX library is available
        if (typeof XLSX === 'undefined') {
            showError('Excel导出库未加载，请刷新页面重试');
            return;
        }
        
        try {
            console.log('导出Excel文件...');
            showInfo('正在生成Excel文件...', 2000);
            
            // 获取所有列（保持原始顺序）
            const originalHeaders = this.dataParser.getHeaders();
            const allHeaders = extractAllColumns(this.processedData, originalHeaders);
            
            // 准备导出数据 - 确保所有行都包含所有列
            const exportData = this.processedData.map(row => {
                const newRow = {};
                allHeaders.forEach(header => {
                    newRow[header] = row[header] !== undefined ? row[header] : '';
                });
                return newRow;
            });
            
            // 创建工作簿
            const wb = XLSX.utils.book_new();
            
            // 创建工作表
            const ws = XLSX.utils.json_to_sheet(exportData, { 
                header: allHeaders,
                skipHeader: false
            });
            
            // 添加工作表到工作簿
            XLSX.utils.book_append_sheet(wb, ws, '整理后数据');
            
            // 生成文件名（使用当前日期时间）
            const dateStr = generateExportTimestamp();
            const fileName = `设备故障统计_整理后数据_${dateStr}.xlsx`;
            
            // 导出文件
            XLSX.writeFile(wb, fileName);
            
            showSuccess(`Excel文件已成功导出: ${fileName}`, 4000);
            console.log('Excel导出完成');
            
        } catch (error) {
            console.error('Excel导出错误:', error);
            showError('Excel导出失败: ' + error.message);
        }
    }

    /**
     * 处理CSV导出
     */
    handleExportCsv() {
        if (!this.processedData || this.processedData.length === 0) {
            showError('没有可导出的数据');
            return;
        }
        
        try {
            console.log('导出CSV文件...');
            showInfo('正在生成CSV文件...', 2000);
            
            // 获取所有列（保持原始顺序）
            const originalHeaders = this.dataParser.getHeaders();
            const allHeaders = extractAllColumns(this.processedData, originalHeaders);
            
            // 创建CSV内容
            let csvContent = '';
            
            // 添加表头（使用BOM以支持中文）
            csvContent = '\uFEFF' + allHeaders.map(h => escapeCsvValue(h)).join(',') + '\n';
            
            // 添加数据行
            this.processedData.forEach(row => {
                const values = allHeaders.map(header => {
                    const value = row[header];
                    return escapeCsvValue(value !== undefined ? value : '');
                });
                csvContent += values.join(',') + '\n';
            });
            
            // 生成文件名（使用当前日期时间）
            const dateStr = generateExportTimestamp();
            const fileName = `设备故障统计_整理后数据_${dateStr}.csv`;
            
            // 创建Blob并下载
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            
            link.setAttribute('href', url);
            link.setAttribute('download', fileName);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            showSuccess(`CSV文件已成功导出: ${fileName}`, 4000);
            console.log('CSV导出完成');
            
        } catch (error) {
            console.error('CSV导出错误:', error);
            showError('CSV导出失败: ' + error.message);
        }
    }

    /**
     * 处理JSON导出
     */
    handleExportJson() {
        if (!this.processedData || this.processedData.length === 0) {
            showError('没有可导出的数据');
            return;
        }
        
        try {
            console.log('导出JSON文件...');
            showInfo('正在生成JSON文件...', 2000);
            
            // 获取所有列（保持原始顺序）
            const originalHeaders = this.dataParser.getHeaders();
            const allHeaders = extractAllColumns(this.processedData, originalHeaders);
            
            // 准备导出数据 - 确保所有行都包含所有列
            const exportData = this.processedData.map(row => {
                const newRow = {};
                allHeaders.forEach(header => {
                    newRow[header] = row[header] !== undefined ? row[header] : null;
                });
                return newRow;
            });
            
            // 创建JSON内容（格式化输出，便于阅读）
            const jsonContent = JSON.stringify({
                metadata: {
                    exportTime: new Date().toISOString(),
                    totalRows: exportData.length,
                    columns: allHeaders,
                    version: APP_CONFIG.VERSION
                },
                data: exportData
            }, null, 2);
            
            // 生成文件名（使用当前日期时间）
            const dateStr = generateExportTimestamp();
            const fileName = `设备故障统计_整理后数据_${dateStr}.json`;
            
            // 创建Blob并下载
            const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            
            link.setAttribute('href', url);
            link.setAttribute('download', fileName);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            showSuccess(`JSON文件已成功导出: ${fileName}`, 4000);
            console.log('JSON导出完成');
            
        } catch (error) {
            console.error('JSON导出错误:', error);
            showError('JSON导出失败: ' + error.message);
        }
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
        this.validationResult = null;
        
        // 重置模块
        this.fileUploader.reset();
        this.dataParser.reset();
        this.dataValidator.reset();
        this.dataTransformer.reset();
        
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
        
        // 隐藏验证结果
        const validationResult = document.getElementById('validationResult');
        if (validationResult) {
            validationResult.style.display = 'none';
        }
        
        // 隐藏处理统计
        const processingStats = document.getElementById('processingStats');
        if (processingStats) {
            processingStats.style.display = 'none';
        }
        
        // 清空结果表格
        const resultTableHeader = document.getElementById('resultTableHeader');
        const resultTableBody = document.getElementById('resultTableBody');
        if (resultTableHeader) resultTableHeader.innerHTML = '';
        if (resultTableBody) resultTableBody.innerHTML = '';
        
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

/**
 * 数据解析模块
 * Data Parser Module
 * 
 * 功能：解析Excel文件并提取数据
 * Features: Parse Excel files and extract data
 * 
 * 注意：此模块依赖全局XLSX对象，该对象通过index.html中的script标签加载
 * Note: This module depends on the global XLSX object loaded via script tag in index.html
 */

import { REQUIRED_COLUMNS, OPTIONAL_COLUMNS, MESSAGES, TABLE_CONFIG } from '../config/constants.js';
import { showError, showWarning } from '../utils/helpers.js';

// 获取全局XLSX对象（由lib/xlsx.full.min.js提供）
// Access the global XLSX object (provided by lib/xlsx.full.min.js)
const XLSX = window.XLSX;

/**
 * 数据解析器类
 */
export class DataParser {
    constructor() {
        this.workbook = null;
        this.worksheet = null;
        this.columnMapping = {};
        this.headers = [];
        this.rawData = [];
    }

    /**
     * 解析Excel文件
     * @param {ArrayBuffer} data - Excel文件的ArrayBuffer数据
     * @returns {Object} 解析结果
     */
    parseExcel(data) {
        try {
            // 使用SheetJS解析工作簿
            this.workbook = XLSX.read(data, { 
                type: 'array',
                cellDates: true,  // 自动转换日期
                cellNF: false,
                cellText: false
            });

            if (!this.workbook || !this.workbook.SheetNames || this.workbook.SheetNames.length === 0) {
                throw new Error(MESSAGES.ERROR.INVALID_EXCEL);
            }

            // 获取第一个工作表（通常是"原始数据"或实际数据所在的表）
            const firstSheetName = this.workbook.SheetNames[0];
            this.worksheet = this.workbook.Sheets[firstSheetName];

            // 提取表头
            this.extractHeaders();

            // 验证必需列
            const validationResult = this.validateColumns();
            if (!validationResult.isValid) {
                throw new Error(validationResult.message);
            }

            // 提取数据行
            this.extractData();

            return {
                success: true,
                sheetName: firstSheetName,
                headers: this.headers,
                columnMapping: this.columnMapping,
                data: this.rawData,
                rowCount: this.rawData.length
            };

        } catch (error) {
            showError(MESSAGES.ERROR.PARSE_ERROR + ': ' + error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * 提取表头
     */
    extractHeaders() {
        // 将工作表转换为JSON，仅获取第一行作为表头
        const jsonData = XLSX.utils.sheet_to_json(this.worksheet, { 
            header: 1,  // 返回数组格式
            defval: ''  // 空单元格默认值
        });

        if (jsonData.length === 0) {
            throw new Error(MESSAGES.ERROR.EMPTY_FILE);
        }

        // 第一行作为表头
        this.headers = jsonData[0].map(header => String(header).trim());

        // 创建列映射
        this.createColumnMapping();
    }

    /**
     * 创建列映射
     * 记录每个必需列和可选列在数组中的索引
     */
    createColumnMapping() {
        this.columnMapping = {};

        // 映射必需列
        for (const [key, columnName] of Object.entries(REQUIRED_COLUMNS)) {
            const index = this.headers.indexOf(columnName);
            this.columnMapping[key] = index;
        }

        // 映射可选列
        for (const [key, columnName] of Object.entries(OPTIONAL_COLUMNS)) {
            const index = this.headers.indexOf(columnName);
            this.columnMapping[key] = index;
        }
    }

    /**
     * 验证必需列是否存在
     * @returns {Object} 验证结果
     */
    validateColumns() {
        const missingColumns = [];

        for (const [key, columnName] of Object.entries(REQUIRED_COLUMNS)) {
            if (this.columnMapping[key] === -1) {
                missingColumns.push(columnName);
            }
        }

        if (missingColumns.length > 0) {
            return {
                isValid: false,
                message: MESSAGES.ERROR.MISSING_COLUMNS + ': ' + missingColumns.join(', ')
            };
        }

        // 检查可选列，如果不存在则给出警告
        const missingOptionalColumns = [];
        for (const [key, columnName] of Object.entries(OPTIONAL_COLUMNS)) {
            if (this.columnMapping[key] === -1) {
                missingOptionalColumns.push(columnName);
            }
        }

        if (missingOptionalColumns.length > 0) {
            console.log('可选列不存在，将自动创建: ' + missingOptionalColumns.join(', '));
        }

        return {
            isValid: true,
            missingOptionalColumns
        };
    }

    /**
     * 提取数据行
     */
    extractData() {
        // 将工作表转换为JSON对象数组
        const jsonData = XLSX.utils.sheet_to_json(this.worksheet, {
            header: this.headers,  // 使用提取的表头
            defval: '',           // 空单元格默认值
            raw: false,           // 不使用原始值，进行格式化
            dateNF: 'yyyy-mm-dd hh:mm:ss'  // 日期格式
        });

        // 跳过第一行（表头）
        this.rawData = jsonData.slice(1);

        // 过滤空行（工单号为空的行）
        this.rawData = this.rawData.filter(row => {
            const workOrderIndex = this.columnMapping.workOrder;
            if (workOrderIndex === -1) return false;
            const workOrder = row[this.headers[workOrderIndex]];
            return workOrder && String(workOrder).trim() !== '';
        });
    }

    /**
     * 获取列映射
     * @returns {Object} 列映射对象
     */
    getColumnMapping() {
        return this.columnMapping;
    }

    /**
     * 获取预览数据（前N行）
     * @param {number} limit - 限制行数，默认使用配置值
     * @returns {Array} 预览数据
     */
    getPreviewData(limit = TABLE_CONFIG.PREVIEW_ROWS) {
        return this.rawData.slice(0, limit);
    }

    /**
     * 获取数据统计信息
     * @returns {Object} 统计信息
     */
    getStatistics() {
        return {
            totalRows: this.rawData.length,
            columnCount: this.headers.length,
            hasAllRequiredColumns: Object.values(REQUIRED_COLUMNS).every(
                col => this.headers.includes(col)
            ),
            hasAllOptionalColumns: Object.values(OPTIONAL_COLUMNS).every(
                col => this.headers.includes(col)
            )
        };
    }

    /**
     * 重置解析器
     */
    reset() {
        this.workbook = null;
        this.worksheet = null;
        this.columnMapping = {};
        this.headers = [];
        this.rawData = [];
    }
}

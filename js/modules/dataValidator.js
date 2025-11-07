/**
 * 数据验证模块
 * Data Validation Module
 * 
 * 验证上传的Excel数据是否符合处理要求
 * Validates uploaded Excel data meets processing requirements
 */

import { REQUIRED_COLUMNS, OPTIONAL_COLUMNS, MESSAGES } from '../config/constants.js';
import { isValidDate } from '../utils/dateUtils.js';

/**
 * 数据验证器类
 */
export class DataValidator {
    constructor() {
        this.validationResults = null;
        this.errors = [];
        this.warnings = [];
    }

    /**
     * 验证数据
     * @param {Array} data - 原始数据数组
     * @param {Object} columnMapping - 列映射对象
     * @returns {Object} 验证结果
     */
    validate(data, columnMapping) {
        this.reset();
        
        if (!data || !Array.isArray(data)) {
            this.errors.push('数据无效：数据必须是数组');
            return this.getResults();
        }

        if (data.length === 0) {
            this.errors.push('数据为空：没有可处理的数据行');
            return this.getResults();
        }

        // 验证必需列
        this.validateRequiredColumns(columnMapping);
        
        // 验证数据行
        this.validateDataRows(data, columnMapping);
        
        return this.getResults();
    }

    /**
     * 验证必需列是否存在
     * @param {Object} columnMapping - 列映射对象
     */
    validateRequiredColumns(columnMapping) {
        const requiredKeys = Object.keys(REQUIRED_COLUMNS);
        const missingColumns = [];

        for (const key of requiredKeys) {
            if (!columnMapping[key]) {
                const columnName = REQUIRED_COLUMNS[key];
                missingColumns.push(columnName);
            }
        }

        if (missingColumns.length > 0) {
            this.errors.push(`缺少必需列: ${missingColumns.join(', ')}`);
        }
    }

    /**
     * 验证数据行
     * @param {Array} data - 数据数组
     * @param {Object} columnMapping - 列映射对象
     */
    validateDataRows(data, columnMapping) {
        let emptyWorkOrderCount = 0;
        let invalidDateCount = 0;
        let missingTimeCount = 0;

        data.forEach((row, index) => {
            const rowNum = index + 1;

            // 验证工单号
            if (!row[columnMapping.workOrder] || row[columnMapping.workOrder].toString().trim() === '') {
                emptyWorkOrderCount++;
            }

            // 验证时间字段
            const reportTime = row[columnMapping.reportTime];
            const startTime = row[columnMapping.startTime];
            const endTime = row[columnMapping.endTime];

            // 检查时间字段是否存在
            if (!reportTime || !startTime || !endTime) {
                missingTimeCount++;
            } else {
                // 验证日期格式
                if (!isValidDate(reportTime)) {
                    invalidDateCount++;
                }
                if (!isValidDate(startTime)) {
                    invalidDateCount++;
                }
                if (!isValidDate(endTime)) {
                    invalidDateCount++;
                }
            }
        });

        // 添加警告信息
        if (emptyWorkOrderCount > 0) {
            this.warnings.push(`发现 ${emptyWorkOrderCount} 行工单号为空`);
        }

        if (missingTimeCount > 0) {
            this.warnings.push(`发现 ${missingTimeCount} 行时间数据不完整（将在处理时删除）`);
        }

        if (invalidDateCount > 0) {
            this.warnings.push(`发现 ${invalidDateCount} 个无效日期格式`);
        }
    }

    /**
     * 获取验证结果
     * @returns {Object} 验证结果对象
     */
    getResults() {
        this.validationResults = {
            valid: this.errors.length === 0,
            errors: [...this.errors],
            warnings: [...this.warnings],
            errorCount: this.errors.length,
            warningCount: this.warnings.length
        };

        return this.validationResults;
    }

    /**
     * 重置验证器状态
     */
    reset() {
        this.validationResults = null;
        this.errors = [];
        this.warnings = [];
    }

    /**
     * 获取验证摘要文本
     * @returns {string} 验证摘要
     */
    getSummary() {
        if (!this.validationResults) {
            return '尚未进行数据验证';
        }

        if (this.validationResults.valid) {
            let summary = '✓ 数据验证通过';
            if (this.validationResults.warningCount > 0) {
                summary += `\n⚠ ${this.validationResults.warningCount} 个警告`;
            }
            return summary;
        } else {
            return `✗ 数据验证失败\n${this.validationResults.errorCount} 个错误`;
        }
    }
}

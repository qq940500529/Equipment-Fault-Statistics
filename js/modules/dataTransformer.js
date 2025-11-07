/**
 * 数据转换模块
 * Data Transformation Module
 * 
 * 实现VBA脚本中的所有数据处理功能
 * Implements all data processing functions from VBA script
 */

import { REQUIRED_COLUMNS, OPTIONAL_COLUMNS, SPECIAL_VALUES, PERSON_TYPES, REPAIR_WORKERS, ELECTRICIANS } from '../config/constants.js';
import { isValidDate, getHoursDifference } from '../utils/dateUtils.js';

/**
 * 数据转换器类
 */
export class DataTransformer {
    constructor() {
        this.data = null;
        this.columnMapping = null;
        this.stats = {
            totalRowsRemoved: 0,
            incompleteTimeRowsRemoved: 0,
            workshopColumnSplit: false,
            repairPersonClassified: false
        };
        // Store deleted rows for display
        this.deletedRows = {
            totalRows: [],
            incompleteTimeRows: []
        };
    }

    /**
     * 执行所有数据转换
     * @param {Array} data - 原始数据数组
     * @param {Object} columnMapping - 列映射对象
     * @returns {Object} 转换后的数据和统计信息
     * 
     * 注意: 转换过程会自动创建可选列（区域、维修人分类、时间计算等），
     * 即使这些列在原始数据中不存在。这是预期行为，用于数据增强。
     * Note: The transformation automatically creates optional columns (area, 
     * repair person type, time calculations, etc.) even if they don't exist 
     * in the source data. This is intentional for data enrichment.
     */
    transform(data, columnMapping) {
        this.reset();
        this.data = JSON.parse(JSON.stringify(data)); // Deep clone
        this.columnMapping = columnMapping;

        // 按照VBA脚本的顺序执行转换
        this.removeTotalRows();
        this.splitWorkshopColumn();
        this.classifyRepairPersons();
        this.calculateTimes();
        this.removeIncompleteTimeRows();

        return {
            data: this.data,
            stats: this.stats
        };
    }

    /**
     * 功能1: 删除"合计"行
     * 删除车间列值为"合计"的行
     */
    removeTotalRows() {
        const initialLength = this.data.length;
        const workshopKey = this.columnMapping.workshop;

        if (!workshopKey) {
            return;
        }

        const deletedRows = [];
        this.data = this.data.filter(row => {
            const workshopValue = row[workshopKey];
            const shouldKeep = workshopValue !== SPECIAL_VALUES.TOTAL && workshopValue !== '合计';
            if (!shouldKeep) {
                // Use structuredClone for better performance (modern browsers)
                deletedRows.push(typeof structuredClone !== 'undefined' ? structuredClone(row) : JSON.parse(JSON.stringify(row)));
            }
            return shouldKeep;
        });

        this.deletedRows.totalRows = deletedRows;
        this.stats.totalRowsRemoved = initialLength - this.data.length;
    }

    /**
     * 功能2: 车间列分列
     * 将"车间-区域"格式分割为两列
     * 注意：会自动创建"区域"列，即使原始数据中不存在
     */
    splitWorkshopColumn() {
        const workshopKey = this.columnMapping.workshop;
        // 使用映射的列名，如果不存在则使用默认列名来创建新列
        const areaKey = this.columnMapping.area || OPTIONAL_COLUMNS.area;

        if (!workshopKey) {
            return;
        }

        this.data.forEach(row => {
            const workshopValue = row[workshopKey];

            if (workshopValue && typeof workshopValue === 'string' && workshopValue.includes('-')) {
                const parts = workshopValue.split('-');
                row[workshopKey] = parts[0].trim();
                
                // 创建区域列并设置值
                row[areaKey] = parts.length > 1 ? parts[1].trim() : '';
            } else if (!row[areaKey]) {
                // 如果没有"-"且区域列不存在或为空，则设置为空字符串
                row[areaKey] = '';
            }
        });

        this.stats.workshopColumnSplit = true;
    }

    /**
     * 功能3: 维修人分类
     * 根据姓名将维修人分类为"维修工"、"电工"或"未知"
     * 注意：会自动创建"维修人分类"列，即使原始数据中不存在
     */
    classifyRepairPersons() {
        const repairPersonKey = this.columnMapping.repairPerson;
        // 使用映射的列名，如果不存在则使用默认列名来创建新列
        const repairPersonTypeKey = this.columnMapping.repairPersonType || OPTIONAL_COLUMNS.repairPersonType;

        if (!repairPersonKey) {
            return;
        }

        this.data.forEach(row => {
            const repairPerson = row[repairPersonKey];
            let personType = '';

            if (repairPerson && typeof repairPerson === 'string') {
                const trimmedName = repairPerson.trim();

                // 检查是否为维修工
                if (REPAIR_WORKERS.includes(trimmedName)) {
                    personType = PERSON_TYPES.REPAIR_WORKER;
                }
                // 检查是否为电工
                else if (ELECTRICIANS.includes(trimmedName)) {
                    personType = PERSON_TYPES.ELECTRICIAN;
                }
                // 未匹配到任何分类
                else {
                    personType = PERSON_TYPES.UNKNOWN;
                }
            }

            // 创建维修人分类列并设置值
            row[repairPersonTypeKey] = personType;
        });

        this.stats.repairPersonClassified = true;
    }

    /**
     * 功能4: 计算时间
     * 计算等待时间、维修时间和故障时间（单位：小时）
     * 注意：会自动创建时间计算列（等待时间h、维修时间h、故障时间h），即使原始数据中不存在
     */
    calculateTimes() {
        const reportTimeKey = this.columnMapping.reportTime;
        const startTimeKey = this.columnMapping.startTime;
        const endTimeKey = this.columnMapping.endTime;
        // 使用映射的列名，如果不存在则使用默认列名来创建新列
        const waitTimeKey = this.columnMapping.waitTime || OPTIONAL_COLUMNS.waitTime;
        const repairTimeKey = this.columnMapping.repairTime || OPTIONAL_COLUMNS.repairTime;
        const faultTimeKey = this.columnMapping.faultTime || OPTIONAL_COLUMNS.faultTime;

        if (!reportTimeKey || !startTimeKey || !endTimeKey) {
            return;
        }

        this.data.forEach(row => {
            const reportTime = row[reportTimeKey];
            const startTime = row[startTimeKey];
            const endTime = row[endTimeKey];

            // 只有当所有时间都有效时才计算
            if (isValidDate(reportTime) && isValidDate(startTime) && isValidDate(endTime)) {
                // 计算等待时间（报修时间到维修开始时间）
                const waitTime = getHoursDifference(reportTime, startTime);
                
                // 计算维修时间（维修开始时间到维修结束时间）
                const repairTime = getHoursDifference(startTime, endTime);
                
                // 计算故障时间（等待时间 + 维修时间）
                const faultTime = waitTime + repairTime;

                // 创建列并设置计算结果（保留2位小数）
                row[waitTimeKey] = parseFloat(waitTime.toFixed(2));
                row[repairTimeKey] = parseFloat(repairTime.toFixed(2));
                row[faultTimeKey] = parseFloat(faultTime.toFixed(2));
            }
        });
    }

    /**
     * 功能5: 删除时间不完整的行
     * 删除报修时间、维修开始时间或维修结束时间缺失或无效的行
     */
    removeIncompleteTimeRows() {
        const initialLength = this.data.length;
        const reportTimeKey = this.columnMapping.reportTime;
        const startTimeKey = this.columnMapping.startTime;
        const endTimeKey = this.columnMapping.endTime;

        if (!reportTimeKey || !startTimeKey || !endTimeKey) {
            return;
        }

        const deletedRows = [];
        this.data = this.data.filter(row => {
            const reportTime = row[reportTimeKey];
            const startTime = row[startTimeKey];
            const endTime = row[endTimeKey];

            // 检查三个时间字段是否都存在且有效
            const shouldKeep = reportTime && startTime && endTime &&
                   isValidDate(reportTime) && 
                   isValidDate(startTime) && 
                   isValidDate(endTime);
            
            if (!shouldKeep) {
                // Use structuredClone for better performance (modern browsers)
                deletedRows.push(typeof structuredClone !== 'undefined' ? structuredClone(row) : JSON.parse(JSON.stringify(row)));
            }
            return shouldKeep;
        });

        this.deletedRows.incompleteTimeRows = deletedRows;
        this.stats.incompleteTimeRowsRemoved = initialLength - this.data.length;
    }

    /**
     * 获取转换后的数据
     * @returns {Array} 转换后的数据数组
     */
    getData() {
        return this.data;
    }

    /**
     * 获取转换统计信息
     * @returns {Object} 统计信息对象
     */
    getStats() {
        return this.stats;
    }

    /**
     * 获取删除的行
     * @returns {Object} 删除的行对象
     */
    getDeletedRows() {
        return this.deletedRows;
    }

    /**
     * 重置转换器状态
     */
    reset() {
        this.data = null;
        this.columnMapping = null;
        this.stats = {
            totalRowsRemoved: 0,
            incompleteTimeRowsRemoved: 0,
            workshopColumnSplit: false,
            repairPersonClassified: false
        };
        this.deletedRows = {
            totalRows: [],
            incompleteTimeRows: []
        };
    }

    /**
     * 获取处理摘要文本
     * @returns {string} 处理摘要
     */
    getSummary() {
        if (!this.data) {
            return '尚未进行数据处理';
        }

        let summary = `数据处理完成\n`;
        summary += `- 处理后数据行数: ${this.data.length}\n`;
        summary += `- 删除"合计"行: ${this.stats.totalRowsRemoved} 行\n`;
        summary += `- 删除时间不完整行: ${this.stats.incompleteTimeRowsRemoved} 行\n`;
        summary += `- 车间列分列: ${this.stats.workshopColumnSplit ? '已完成' : '跳过'}\n`;
        summary += `- 维修人分类: ${this.stats.repairPersonClassified ? '已完成' : '跳过'}`;

        return summary;
    }
}

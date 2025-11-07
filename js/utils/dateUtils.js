/**
 * 日期工具模块
 * Date Utility Module
 * 
 * 提供日期验证、计算和格式化功能
 */

import { NUMBER_FORMAT } from '../config/constants.js';

/**
 * 检查值是否为有效日期
 * @param {*} value - 要检查的值
 * @returns {boolean} 是否为有效日期
 */
export function isValidDate(value) {
    if (!value) return false;
    
    // 尝试创建Date对象
    const date = new Date(value);
    
    // 检查是否为有效日期
    return date instanceof Date && !isNaN(date.getTime());
}

/**
 * 计算两个日期之间的小时差
 * @param {Date|string} startDate - 开始日期
 * @param {Date|string} endDate - 结束日期
 * @returns {number} 小时差，保留2位小数
 * @throws {Error} 如果日期无效
 */
export function getHoursDifference(startDate, endDate) {
    // 验证输入
    if (!isValidDate(startDate) || !isValidDate(endDate)) {
        throw new Error('无效的日期输入');
    }
    
    // 转换为Date对象
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // 计算毫秒差
    const diffMs = end - start;
    
    // 转换为小时
    const diffHours = diffMs / (1000 * 60 * 60);
    
    // 保留指定位数的小数
    return Math.round(diffHours * Math.pow(10, NUMBER_FORMAT.TIME_DECIMALS)) / 
           Math.pow(10, NUMBER_FORMAT.TIME_DECIMALS);
}

/**
 * 格式化日期为 yyyy-mm-dd hh:mm:ss
 * @param {Date|string} date - 要格式化的日期
 * @returns {string} 格式化后的日期字符串，如果日期无效则返回空字符串
 */
export function formatDateTime(date) {
    if (!isValidDate(date)) return '';
    
    const d = new Date(date);
    
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * 格式化日期为 yyyy-mm-dd
 * @param {Date|string} date - 要格式化的日期
 * @returns {string} 格式化后的日期字符串
 */
export function formatDate(date) {
    if (!isValidDate(date)) return '';
    
    const d = new Date(date);
    
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
}

/**
 * 格式化时间为 hh:mm:ss
 * @param {Date|string} date - 要格式化的日期
 * @returns {string} 格式化后的时间字符串
 */
export function formatTime(date) {
    if (!isValidDate(date)) return '';
    
    const d = new Date(date);
    
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    
    return `${hours}:${minutes}:${seconds}`;
}

/**
 * 解析Excel日期序列号
 * Excel存储日期为1900年1月1日以来的天数
 * @param {number} excelDate - Excel日期序列号
 * @returns {Date} JavaScript Date对象
 */
export function parseExcelDate(excelDate) {
    // Excel日期基准：1900年1月1日
    // 注意：Excel错误地认为1900年是闰年，所以需要减去1天
    const excelEpoch = new Date(1899, 11, 30); // 1899年12月30日
    const msPerDay = 24 * 60 * 60 * 1000;
    
    return new Date(excelEpoch.getTime() + excelDate * msPerDay);
}

/**
 * 将JavaScript Date对象转换为Excel日期序列号
 * @param {Date} date - JavaScript Date对象
 * @returns {number} Excel日期序列号
 */
export function toExcelDate(date) {
    if (!isValidDate(date)) {
        throw new Error('无效的日期输入');
    }
    
    const d = new Date(date);
    const excelEpoch = new Date(1899, 11, 30);
    const msPerDay = 24 * 60 * 60 * 1000;
    
    return (d.getTime() - excelEpoch.getTime()) / msPerDay;
}

/**
 * 计算日期范围的天数
 * @param {Date|string} startDate - 开始日期
 * @param {Date|string} endDate - 结束日期
 * @returns {number} 天数
 */
export function getDaysDifference(startDate, endDate) {
    if (!isValidDate(startDate) || !isValidDate(endDate)) {
        throw new Error('无效的日期输入');
    }
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffMs = end - start;
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    
    return Math.round(diffDays);
}

/**
 * 获取当前日期时间字符串（用于文件命名）
 * @returns {string} 格式：yyyymmdd_hhmmss
 */
export function getCurrentDateTimeString() {
    const now = new Date();
    
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    return `${year}${month}${day}_${hours}${minutes}${seconds}`;
}

// 导出所有函数
export default {
    isValidDate,
    getHoursDifference,
    formatDateTime,
    formatDate,
    formatTime,
    parseExcelDate,
    toExcelDate,
    getDaysDifference,
    getCurrentDateTimeString
};

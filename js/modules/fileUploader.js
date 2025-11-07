/**
 * 文件上传模块
 * File Upload Module
 * 
 * 功能：处理Excel文件的选择、验证和读取
 * Features: Handle Excel file selection, validation, and reading
 */

import { FILE_CONFIG, MESSAGES } from '../config/constants.js';
import { validateFileType, validateFileSize, showError } from '../utils/helpers.js';

/**
 * 文件上传器类
 */
export class FileUploader {
    constructor() {
        this.file = null;
        this.reader = new FileReader();
    }

    /**
     * 验证文件
     * @param {File} file - 要验证的文件
     * @returns {boolean} 验证是否通过
     */
    validateFile(file) {
        if (!file) {
            showError(MESSAGES.ERROR.NO_FILE);
            return false;
        }

        // 验证文件类型
        if (!validateFileType(file, FILE_CONFIG.ALLOWED_TYPES)) {
            showError(MESSAGES.ERROR.INVALID_FILE_TYPE);
            return false;
        }

        // 验证文件大小
        if (!validateFileSize(file, FILE_CONFIG.MAX_FILE_SIZE)) {
            const maxSizeMB = FILE_CONFIG.MAX_FILE_SIZE / (1024 * 1024);
            showError(MESSAGES.ERROR.FILE_TOO_LARGE.replace('{size}', maxSizeMB));
            return false;
        }

        return true;
    }

    /**
     * 读取文件为ArrayBuffer
     * @param {File} file - 要读取的文件
     * @returns {Promise<ArrayBuffer>} 文件内容
     */
    readFile(file) {
        return new Promise((resolve, reject) => {
            if (!this.validateFile(file)) {
                reject(new Error(MESSAGES.ERROR.INVALID_FILE));
                return;
            }

            this.file = file;
            
            this.reader.onload = (e) => {
                resolve(e.target.result);
            };

            this.reader.onerror = (e) => {
                showError(MESSAGES.ERROR.FILE_READ_ERROR);
                reject(new Error(MESSAGES.ERROR.FILE_READ_ERROR));
            };

            // 读取文件为ArrayBuffer，用于SheetJS解析
            this.reader.readAsArrayBuffer(file);
        });
    }

    /**
     * 获取文件信息
     * @returns {Object} 文件信息对象
     */
    getFileInfo() {
        if (!this.file) {
            return null;
        }

        return {
            name: this.file.name,
            size: this.file.size,
            type: this.file.type,
            lastModified: this.file.lastModified,
            lastModifiedDate: new Date(this.file.lastModified)
        };
    }

    /**
     * 重置上传器
     */
    reset() {
        this.file = null;
        // 创建新的FileReader实例以避免重用问题
        this.reader = new FileReader();
    }
}

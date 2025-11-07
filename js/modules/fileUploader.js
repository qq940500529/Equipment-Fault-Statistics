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
     * @returns {Object} 验证结果 {valid: boolean, error: string}
     */
    validateFile(file) {
        if (!file) {
            const errorMsg = MESSAGES.ERROR.NO_FILE;
            showError(errorMsg);
            return { valid: false, error: errorMsg };
        }

        // 验证文件类型
        if (!validateFileType(file, FILE_CONFIG.ALLOWED_EXTENSIONS)) {
            const errorMsg = `${MESSAGES.ERROR.INVALID_FILE_TYPE}。文件名：${file.name}，当前扩展名不在允许列表中（${FILE_CONFIG.ALLOWED_EXTENSIONS.join(', ')}）`;
            showError(errorMsg);
            return { valid: false, error: errorMsg };
        }

        // 验证文件大小
        if (!validateFileSize(file, FILE_CONFIG.MAX_FILE_SIZE)) {
            const maxSizeMB = FILE_CONFIG.MAX_FILE_SIZE / (1024 * 1024);
            const actualSizeMB = (file.size / (1024 * 1024)).toFixed(2);
            const errorMsg = MESSAGES.ERROR.FILE_TOO_LARGE.replace('{size}', maxSizeMB) + `。实际大小：${actualSizeMB}MB`;
            showError(errorMsg);
            return { valid: false, error: errorMsg };
        }

        return { valid: true, error: null };
    }

    /**
     * 读取文件为ArrayBuffer
     * @param {File} file - 要读取的文件
     * @returns {Promise<ArrayBuffer>} 文件内容
     */
    readFile(file) {
        return new Promise((resolve, reject) => {
            const validationResult = this.validateFile(file);
            if (!validationResult.valid) {
                reject(new Error(validationResult.error));
                return;
            }

            this.file = file;
            
            this.reader.onload = (e) => {
                resolve(e.target.result);
            };

            this.reader.onerror = (e) => {
                const errorMsg = `${MESSAGES.ERROR.FILE_READ_ERROR}。文件名：${file.name}`;
                showError(errorMsg);
                reject(new Error(errorMsg));
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

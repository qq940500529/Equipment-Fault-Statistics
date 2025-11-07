/**
 * 文件上传模块单元测试
 * Unit Tests for File Uploader Module
 */

import { FileUploader } from '../../js/modules/fileUploader.js';
import { FILE_CONFIG } from '../../js/config/constants.js';

describe('FileUploader', () => {
    let fileUploader;

    beforeEach(() => {
        fileUploader = new FileUploader();
    });

    afterEach(() => {
        fileUploader.reset();
    });

    describe('constructor', () => {
        test('should initialize with null file', () => {
            expect(fileUploader.file).toBeNull();
        });

        test('should create FileReader instance', () => {
            expect(fileUploader.reader).toBeInstanceOf(FileReader);
        });
    });

    describe('validateFile', () => {
        test('should return invalid result for null file', () => {
            const result = fileUploader.validateFile(null);
            expect(result.valid).toBe(false);
            expect(result.error).toBeDefined();
        });

        test('should return invalid result for undefined file', () => {
            const result = fileUploader.validateFile(undefined);
            expect(result.valid).toBe(false);
            expect(result.error).toBeDefined();
        });

        test('should return valid result for valid .xlsx file', () => {
            const mockFile = new File(['test'], 'test.xlsx', {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            });
            const result = fileUploader.validateFile(mockFile);
            expect(result.valid).toBe(true);
            expect(result.error).toBeNull();
        });

        test('should return valid result for valid .xls file', () => {
            const mockFile = new File(['test'], 'test.xls', {
                type: 'application/vnd.ms-excel'
            });
            const result = fileUploader.validateFile(mockFile);
            expect(result.valid).toBe(true);
            expect(result.error).toBeNull();
        });

        test('should return invalid result for file too large', () => {
            const largeContent = new Array(FILE_CONFIG.MAX_FILE_SIZE + 1).fill('a').join('');
            const mockFile = new File([largeContent], 'test.xlsx', {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            });
            const result = fileUploader.validateFile(mockFile);
            expect(result.valid).toBe(false);
            expect(result.error).toBeDefined();
            expect(result.error).toContain('实际大小');
        });

        test('should return invalid result with detailed error for invalid file type', () => {
            const mockFile = new File(['test'], 'test.txt', {
                type: 'text/plain'
            });
            const result = fileUploader.validateFile(mockFile);
            expect(result.valid).toBe(false);
            expect(result.error).toBeDefined();
            expect(result.error).toContain('test.txt');
            expect(result.error).toContain('.xlsx');
        });
    });

    describe('getFileInfo', () => {
        test('should return null when no file is loaded', () => {
            const info = fileUploader.getFileInfo();
            expect(info).toBeNull();
        });

        test('should return file info when file is loaded', () => {
            const mockFile = new File(['test'], 'test.xlsx', {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                lastModified: Date.now()
            });
            fileUploader.file = mockFile;
            
            const info = fileUploader.getFileInfo();
            expect(info).toBeDefined();
            expect(info.name).toBe('test.xlsx');
            expect(info.type).toBe('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        });
    });

    describe('reset', () => {
        test('should reset file to null', () => {
            const mockFile = new File(['test'], 'test.xlsx', {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            });
            fileUploader.file = mockFile;
            
            fileUploader.reset();
            expect(fileUploader.file).toBeNull();
        });

        test('should create new FileReader instance', () => {
            const oldReader = fileUploader.reader;
            fileUploader.reset();
            expect(fileUploader.reader).not.toBe(oldReader);
        });
    });

    describe('readFile', () => {
        test('should reject with error for invalid file', async () => {
            const mockFile = new File(['test'], 'test.txt', {
                type: 'text/plain'
            });
            
            await expect(fileUploader.readFile(mockFile)).rejects.toThrow();
        });
    });
});

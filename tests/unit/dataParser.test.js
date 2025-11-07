/**
 * 数据解析模块单元测试
 * Unit Tests for Data Parser Module
 */

import { DataParser } from '../../js/modules/dataParser.js';
import { REQUIRED_COLUMNS, OPTIONAL_COLUMNS } from '../../js/config/constants.js';

describe('DataParser', () => {
    let dataParser;

    beforeEach(() => {
        dataParser = new DataParser();
    });

    afterEach(() => {
        dataParser.reset();
    });

    describe('constructor', () => {
        test('should initialize with null workbook', () => {
            expect(dataParser.workbook).toBeNull();
        });

        test('should initialize with null worksheet', () => {
            expect(dataParser.worksheet).toBeNull();
        });

        test('should initialize with empty columnMapping', () => {
            expect(dataParser.columnMapping).toEqual({});
        });

        test('should initialize with empty headers array', () => {
            expect(dataParser.headers).toEqual([]);
        });

        test('should initialize with empty rawData array', () => {
            expect(dataParser.rawData).toEqual([]);
        });
    });

    describe('createColumnMapping', () => {
        test('should map required columns correctly', () => {
            dataParser.headers = ['工单号', '车间', '维修人', '报修时间', '维修开始时间', '维修结束时间'];
            dataParser.createColumnMapping();
            
            expect(dataParser.columnMapping.workOrder).toBe('工单号');
            expect(dataParser.columnMapping.workshop).toBe('车间');
            expect(dataParser.columnMapping.repairPerson).toBe('维修人');
            expect(dataParser.columnMapping.reportTime).toBe('报修时间');
            expect(dataParser.columnMapping.startTime).toBe('维修开始时间');
            expect(dataParser.columnMapping.endTime).toBe('维修结束时间');
        });

        test('should map optional columns when present', () => {
            dataParser.headers = ['工单号', '车间', '区域', '维修人', '维修人分类', '报修时间', '维修开始时间', '维修结束时间'];
            dataParser.createColumnMapping();
            
            expect(dataParser.columnMapping.area).toBe('区域');
            expect(dataParser.columnMapping.repairPersonType).toBe('维修人分类');
        });

        test('should set null for missing optional columns', () => {
            dataParser.headers = ['工单号', '车间', '维修人', '报修时间', '维修开始时间', '维修结束时间'];
            dataParser.createColumnMapping();
            
            expect(dataParser.columnMapping.area).toBe(null);
            expect(dataParser.columnMapping.repairPersonType).toBe(null);
            expect(dataParser.columnMapping.waitTime).toBe(null);
            expect(dataParser.columnMapping.repairTime).toBe(null);
            expect(dataParser.columnMapping.faultTime).toBe(null);
        });
    });

    describe('validateColumns', () => {
        test('should return valid for all required columns present', () => {
            dataParser.headers = ['工单号', '车间', '维修人', '报修时间', '维修开始时间', '维修结束时间'];
            dataParser.createColumnMapping();
            
            const result = dataParser.validateColumns();
            expect(result.isValid).toBe(true);
        });

        test('should return invalid for missing required columns', () => {
            dataParser.headers = ['工单号', '车间', '维修人'];
            dataParser.createColumnMapping();
            
            const result = dataParser.validateColumns();
            expect(result.isValid).toBe(false);
            expect(result.message).toContain('报修时间');
            expect(result.message).toContain('维修开始时间');
            expect(result.message).toContain('维修结束时间');
        });

        test('should list missing optional columns in result', () => {
            dataParser.headers = ['工单号', '车间', '维修人', '报修时间', '维修开始时间', '维修结束时间'];
            dataParser.createColumnMapping();
            
            const result = dataParser.validateColumns();
            expect(result.isValid).toBe(true);
            expect(result.missingOptionalColumns).toContain('区域');
            expect(result.missingOptionalColumns).toContain('维修人分类');
        });
    });

    describe('getColumnMapping', () => {
        test('should return the column mapping object', () => {
            dataParser.headers = ['工单号', '车间', '维修人', '报修时间', '维修开始时间', '维修结束时间'];
            dataParser.createColumnMapping();
            
            const mapping = dataParser.getColumnMapping();
            expect(mapping).toBeDefined();
            expect(mapping.workOrder).toBe('工单号');
            expect(mapping.workshop).toBe('车间');
            expect(mapping.repairPerson).toBe('维修人');
        });

        test('should return empty object when not initialized', () => {
            const mapping = dataParser.getColumnMapping();
            expect(mapping).toEqual({});
        });
    });

    describe('getHeaders', () => {
        test('should return the headers array', () => {
            dataParser.headers = ['工单号', '车间', '维修人', '报修时间', '维修开始时间', '维修结束时间'];
            
            const headers = dataParser.getHeaders();
            expect(headers).toBeDefined();
            expect(Array.isArray(headers)).toBe(true);
            expect(headers).toEqual(['工单号', '车间', '维修人', '报修时间', '维修开始时间', '维修结束时间']);
        });

        test('should return empty array when not initialized', () => {
            const headers = dataParser.getHeaders();
            expect(headers).toEqual([]);
        });
    });

    describe('getPreviewData', () => {
        test('should return empty array when no data', () => {
            const preview = dataParser.getPreviewData();
            expect(preview).toEqual([]);
        });

        test('should return limited rows when data exceeds limit', () => {
            dataParser.rawData = new Array(100).fill({ test: 'data' });
            const preview = dataParser.getPreviewData(50);
            
            expect(preview.length).toBe(50);
        });

        test('should return all rows when data is less than limit', () => {
            dataParser.rawData = new Array(30).fill({ test: 'data' });
            const preview = dataParser.getPreviewData(50);
            
            expect(preview.length).toBe(30);
        });
    });

    describe('getStatistics', () => {
        test('should return correct statistics', () => {
            dataParser.headers = ['工单号', '车间', '维修人', '报修时间', '维修开始时间', '维修结束时间'];
            dataParser.rawData = new Array(100).fill({});
            dataParser.createColumnMapping();
            
            const stats = dataParser.getStatistics();
            expect(stats.totalRows).toBe(100);
            expect(stats.columnCount).toBe(6);
            expect(stats.hasAllRequiredColumns).toBe(true);
            expect(stats.hasAllOptionalColumns).toBe(false);
        });
    });

    describe('reset', () => {
        test('should reset all properties to initial state', () => {
            dataParser.workbook = { test: 'data' };
            dataParser.worksheet = { test: 'data' };
            dataParser.columnMapping = { test: 0 };
            dataParser.headers = ['test'];
            dataParser.rawData = [{ test: 'data' }];
            
            dataParser.reset();
            
            expect(dataParser.workbook).toBeNull();
            expect(dataParser.worksheet).toBeNull();
            expect(dataParser.columnMapping).toEqual({});
            expect(dataParser.headers).toEqual([]);
            expect(dataParser.rawData).toEqual([]);
        });
    });
});

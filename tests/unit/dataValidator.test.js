/**
 * Unit tests for DataValidator module
 */

import { DataValidator } from '../../js/modules/dataValidator.js';
import { REQUIRED_COLUMNS } from '../../js/config/constants.js';

describe('DataValidator', () => {
    let validator;
    
    beforeEach(() => {
        validator = new DataValidator();
    });
    
    describe('Constructor', () => {
        test('should initialize with null validation results', () => {
            expect(validator.validationResults).toBeNull();
        });
        
        test('should initialize with empty errors array', () => {
            expect(validator.errors).toEqual([]);
        });
        
        test('should initialize with empty warnings array', () => {
            expect(validator.warnings).toEqual([]);
        });
    });
    
    describe('validate()', () => {
        test('should return error for null data', () => {
            const result = validator.validate(null, {});
            expect(result.valid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
        });
        
        test('should return error for non-array data', () => {
            const result = validator.validate('not an array', {});
            expect(result.valid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
        });
        
        test('should return error for empty data array', () => {
            const result = validator.validate([], {});
            expect(result.valid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
        });
        
        test('should return error for missing required columns', () => {
            const data = [{ test: 'data' }];
            const columnMapping = {}; // No column mappings
            const result = validator.validate(data, columnMapping);
            expect(result.valid).toBe(false);
            expect(result.errors.some(e => e.includes('缺少必需列'))).toBe(true);
        });
        
        test('should pass validation for valid data', () => {
            const columnMapping = {
                workOrder: '工单号',
                workshop: '车间',
                reportTime: '报修时间',
                startTime: '维修开始时间',
                endTime: '维修结束时间'
            };
            
            const data = [
                {
                    '工单号': 'WO001',
                    '车间': '车间A',
                    '报修时间': new Date('2024-01-01 08:00:00'),
                    '维修开始时间': new Date('2024-01-01 09:00:00'),
                    '维修结束时间': new Date('2024-01-01 10:00:00')
                }
            ];
            
            const result = validator.validate(data, columnMapping);
            expect(result.valid).toBe(true);
            expect(result.errors.length).toBe(0);
        });
        
        test('should add warning for empty work orders', () => {
            const columnMapping = {
                workOrder: '工单号',
                workshop: '车间',
                reportTime: '报修时间',
                startTime: '维修开始时间',
                endTime: '维修结束时间'
            };
            
            const data = [
                {
                    '工单号': '',
                    '车间': '车间A',
                    '报修时间': new Date('2024-01-01 08:00:00'),
                    '维修开始时间': new Date('2024-01-01 09:00:00'),
                    '维修结束时间': new Date('2024-01-01 10:00:00')
                }
            ];
            
            const result = validator.validate(data, columnMapping);
            expect(result.valid).toBe(true);
            expect(result.warnings.some(w => w.includes('工单号为空'))).toBe(true);
        });
        
        test('should add warning for missing time data', () => {
            const columnMapping = {
                workOrder: '工单号',
                workshop: '车间',
                reportTime: '报修时间',
                startTime: '维修开始时间',
                endTime: '维修结束时间'
            };
            
            const data = [
                {
                    '工单号': 'WO001',
                    '车间': '车间A',
                    '报修时间': null,
                    '维修开始时间': new Date('2024-01-01 09:00:00'),
                    '维修结束时间': new Date('2024-01-01 10:00:00')
                }
            ];
            
            const result = validator.validate(data, columnMapping);
            expect(result.valid).toBe(true);
            expect(result.warnings.some(w => w.includes('时间数据不完整'))).toBe(true);
        });
    });
    
    describe('reset()', () => {
        test('should clear validation results', () => {
            validator.validationResults = { valid: true };
            validator.reset();
            expect(validator.validationResults).toBeNull();
        });
        
        test('should clear errors array', () => {
            validator.errors = ['error1', 'error2'];
            validator.reset();
            expect(validator.errors).toEqual([]);
        });
        
        test('should clear warnings array', () => {
            validator.warnings = ['warning1', 'warning2'];
            validator.reset();
            expect(validator.warnings).toEqual([]);
        });
    });
    
    describe('getResults()', () => {
        test('should return validation results object', () => {
            const data = [];
            const result = validator.validate(data, {});
            
            expect(result).toHaveProperty('valid');
            expect(result).toHaveProperty('errors');
            expect(result).toHaveProperty('warnings');
            expect(result).toHaveProperty('errorCount');
            expect(result).toHaveProperty('warningCount');
        });
        
        test('should return correct error and warning counts', () => {
            validator.errors = ['error1', 'error2'];
            validator.warnings = ['warning1'];
            const result = validator.getResults();
            
            expect(result.errorCount).toBe(2);
            expect(result.warningCount).toBe(1);
        });
    });
    
    describe('getSummary()', () => {
        test('should return message when no validation done', () => {
            const summary = validator.getSummary();
            expect(summary).toContain('尚未进行数据验证');
        });
        
        test('should return success message for valid data', () => {
            validator.validationResults = {
                valid: true,
                errors: [],
                warnings: [],
                errorCount: 0,
                warningCount: 0
            };
            
            const summary = validator.getSummary();
            expect(summary).toContain('数据验证通过');
        });
        
        test('should return failure message for invalid data', () => {
            validator.validationResults = {
                valid: false,
                errors: ['error1', 'error2'],
                warnings: [],
                errorCount: 2,
                warningCount: 0
            };
            
            const summary = validator.getSummary();
            expect(summary).toContain('数据验证失败');
            expect(summary).toContain('2 个错误');
        });
    });
});

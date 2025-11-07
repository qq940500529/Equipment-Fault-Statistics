/**
 * Unit tests for DataTransformer module
 */

import { DataTransformer } from '../../js/modules/dataTransformer.js';
import { SPECIAL_VALUES, PERSON_TYPES } from '../../js/config/constants.js';

describe('DataTransformer', () => {
    let transformer;
    
    beforeEach(() => {
        transformer = new DataTransformer();
    });
    
    describe('Constructor', () => {
        test('should initialize with null data', () => {
            expect(transformer.data).toBeNull();
        });
        
        test('should initialize with null column mapping', () => {
            expect(transformer.columnMapping).toBeNull();
        });
        
        test('should initialize stats object', () => {
            expect(transformer.stats).toBeDefined();
            expect(transformer.stats.totalRowsRemoved).toBe(0);
            expect(transformer.stats.incompleteTimeRowsRemoved).toBe(0);
        });
    });
    
    describe('removeTotalRows()', () => {
        test('should remove rows with workshop value "合计"', () => {
            transformer.data = [
                { '车间': '车间A' },
                { '车间': '合计' },
                { '车间': '车间B' }
            ];
            transformer.columnMapping = { workshop: '车间' };
            
            transformer.removeTotalRows();
            
            expect(transformer.data.length).toBe(2);
            expect(transformer.stats.totalRowsRemoved).toBe(1);
        });
        
        test('should not remove rows without "合计" value', () => {
            transformer.data = [
                { '车间': '车间A' },
                { '车间': '车间B' }
            ];
            transformer.columnMapping = { workshop: '车间' };
            
            transformer.removeTotalRows();
            
            expect(transformer.data.length).toBe(2);
            expect(transformer.stats.totalRowsRemoved).toBe(0);
        });
    });
    
    describe('splitWorkshopColumn()', () => {
        test('should split workshop column with "-" delimiter', () => {
            transformer.data = [
                { '车间': '车间A-区域1' },
                { '车间': '车间B-区域2' }
            ];
            transformer.columnMapping = { 
                workshop: '车间',
                area: '区域'
            };
            
            transformer.splitWorkshopColumn();
            
            expect(transformer.data[0]['车间']).toBe('车间A');
            expect(transformer.data[0]['区域']).toBe('区域1');
            expect(transformer.data[1]['车间']).toBe('车间B');
            expect(transformer.data[1]['区域']).toBe('区域2');
            expect(transformer.stats.workshopColumnSplit).toBe(true);
        });
        
        test('should handle workshop values without "-"', () => {
            transformer.data = [
                { '车间': '车间A' }
            ];
            transformer.columnMapping = { 
                workshop: '车间',
                area: '区域'
            };
            
            transformer.splitWorkshopColumn();
            
            expect(transformer.data[0]['车间']).toBe('车间A');
            expect(transformer.data[0]['区域']).toBe('');
        });
        
        test('should trim whitespace from split values', () => {
            transformer.data = [
                { '车间': '车间A - 区域1' }
            ];
            transformer.columnMapping = { 
                workshop: '车间',
                area: '区域'
            };
            
            transformer.splitWorkshopColumn();
            
            expect(transformer.data[0]['车间']).toBe('车间A');
            expect(transformer.data[0]['区域']).toBe('区域1');
        });
    });
    
    describe('classifyRepairPersons()', () => {
        test('should classify repair workers correctly', () => {
            transformer.data = [
                { '维修人': '王兴森' },
                { '维修人': '孙长青' }
            ];
            transformer.columnMapping = { 
                repairPerson: '维修人',
                repairPersonType: '维修人分类'
            };
            
            transformer.classifyRepairPersons();
            
            expect(transformer.data[0]['维修人分类']).toBe(PERSON_TYPES.REPAIR_WORKER);
            expect(transformer.data[1]['维修人分类']).toBe(PERSON_TYPES.REPAIR_WORKER);
            expect(transformer.stats.repairPersonClassified).toBe(true);
        });
        
        test('should classify electricians correctly', () => {
            transformer.data = [
                { '维修人': '李润海' },
                { '维修人': '赵艳伟' }
            ];
            transformer.columnMapping = { 
                repairPerson: '维修人',
                repairPersonType: '维修人分类'
            };
            
            transformer.classifyRepairPersons();
            
            expect(transformer.data[0]['维修人分类']).toBe(PERSON_TYPES.ELECTRICIAN);
            expect(transformer.data[1]['维修人分类']).toBe(PERSON_TYPES.ELECTRICIAN);
        });
        
        test('should classify unknown persons correctly', () => {
            transformer.data = [
                { '维修人': '张三' },
                { '维修人': '李四' }
            ];
            transformer.columnMapping = { 
                repairPerson: '维修人',
                repairPersonType: '维修人分类'
            };
            
            transformer.classifyRepairPersons();
            
            expect(transformer.data[0]['维修人分类']).toBe(PERSON_TYPES.UNKNOWN);
            expect(transformer.data[1]['维修人分类']).toBe(PERSON_TYPES.UNKNOWN);
        });
    });
    
    describe('calculateTimes()', () => {
        test('should calculate wait time, repair time, and fault time', () => {
            const reportTime = new Date('2024-01-01 08:00:00');
            const startTime = new Date('2024-01-01 09:00:00');
            const endTime = new Date('2024-01-01 11:00:00');
            
            transformer.data = [
                {
                    '报修时间': reportTime,
                    '维修开始时间': startTime,
                    '维修结束时间': endTime
                }
            ];
            transformer.columnMapping = {
                reportTime: '报修时间',
                startTime: '维修开始时间',
                endTime: '维修结束时间',
                waitTime: '等待时间h',
                repairTime: '维修时间h',
                faultTime: '故障时间h'
            };
            
            transformer.calculateTimes();
            
            expect(transformer.data[0]['等待时间h']).toBe(1.00); // 1 hour wait
            expect(transformer.data[0]['维修时间h']).toBe(2.00); // 2 hours repair
            expect(transformer.data[0]['故障时间h']).toBe(3.00); // 3 hours total
        });
        
        test('should not calculate times for invalid dates', () => {
            transformer.data = [
                {
                    '报修时间': null,
                    '维修开始时间': new Date('2024-01-01 09:00:00'),
                    '维修结束时间': new Date('2024-01-01 11:00:00')
                }
            ];
            transformer.columnMapping = {
                reportTime: '报修时间',
                startTime: '维修开始时间',
                endTime: '维修结束时间',
                waitTime: '等待时间h',
                repairTime: '维修时间h',
                faultTime: '故障时间h'
            };
            
            transformer.calculateTimes();
            
            expect(transformer.data[0]['等待时间h']).toBeUndefined();
            expect(transformer.data[0]['维修时间h']).toBeUndefined();
            expect(transformer.data[0]['故障时间h']).toBeUndefined();
        });
    });
    
    describe('removeIncompleteTimeRows()', () => {
        test('should remove rows with missing time data', () => {
            transformer.data = [
                {
                    '报修时间': new Date('2024-01-01 08:00:00'),
                    '维修开始时间': new Date('2024-01-01 09:00:00'),
                    '维修结束时间': new Date('2024-01-01 10:00:00')
                },
                {
                    '报修时间': null,
                    '维修开始时间': new Date('2024-01-01 09:00:00'),
                    '维修结束时间': new Date('2024-01-01 10:00:00')
                }
            ];
            transformer.columnMapping = {
                reportTime: '报修时间',
                startTime: '维修开始时间',
                endTime: '维修结束时间'
            };
            
            transformer.removeIncompleteTimeRows();
            
            expect(transformer.data.length).toBe(1);
            expect(transformer.stats.incompleteTimeRowsRemoved).toBe(1);
        });
        
        test('should remove rows with invalid date values', () => {
            transformer.data = [
                {
                    '报修时间': new Date('2024-01-01 08:00:00'),
                    '维修开始时间': new Date('2024-01-01 09:00:00'),
                    '维修结束时间': new Date('2024-01-01 10:00:00')
                },
                {
                    '报修时间': 'invalid',
                    '维修开始时间': new Date('2024-01-01 09:00:00'),
                    '维修结束时间': new Date('2024-01-01 10:00:00')
                }
            ];
            transformer.columnMapping = {
                reportTime: '报修时间',
                startTime: '维修开始时间',
                endTime: '维修结束时间'
            };
            
            transformer.removeIncompleteTimeRows();
            
            expect(transformer.data.length).toBe(1);
            expect(transformer.stats.incompleteTimeRowsRemoved).toBe(1);
        });
    });
    
    describe('transform()', () => {
        test('should execute all transformation steps in order', () => {
            const data = [
                {
                    '工单号': 'WO001',
                    '车间': '车间A-区域1',
                    '维修人': '王兴森',
                    '报修时间': new Date('2024-01-01 08:00:00'),
                    '维修开始时间': new Date('2024-01-01 09:00:00'),
                    '维修结束时间': new Date('2024-01-01 11:00:00')
                },
                {
                    '工单号': 'WO002',
                    '车间': '合计',
                    '维修人': '李润海',
                    '报修时间': new Date('2024-01-01 08:00:00'),
                    '维修开始时间': new Date('2024-01-01 09:00:00'),
                    '维修结束时间': new Date('2024-01-01 11:00:00')
                }
            ];
            
            const columnMapping = {
                workOrder: '工单号',
                workshop: '车间',
                area: '区域',
                repairPerson: '维修人',
                repairPersonType: '维修人分类',
                reportTime: '报修时间',
                startTime: '维修开始时间',
                endTime: '维修结束时间',
                waitTime: '等待时间h',
                repairTime: '维修时间h',
                faultTime: '故障时间h'
            };
            
            const result = transformer.transform(data, columnMapping);
            
            expect(result.data.length).toBe(1); // "合计" row removed
            expect(result.data[0]['车间']).toBe('车间A'); // Workshop split
            expect(result.data[0]['区域']).toBe('区域1'); // Area extracted
            expect(result.data[0]['维修人分类']).toBe(PERSON_TYPES.REPAIR_WORKER); // Person classified
            expect(result.data[0]['等待时间h']).toBeDefined(); // Time calculated
            expect(result.stats.totalRowsRemoved).toBe(1);
            expect(result.stats.workshopColumnSplit).toBe(true);
            expect(result.stats.repairPersonClassified).toBe(true);
        });
    });
    
    describe('reset()', () => {
        test('should reset all properties', () => {
            transformer.data = [{ test: 'data' }];
            transformer.columnMapping = { test: 'column' };
            transformer.stats.totalRowsRemoved = 5;
            
            transformer.reset();
            
            expect(transformer.data).toBeNull();
            expect(transformer.columnMapping).toBeNull();
            expect(transformer.stats.totalRowsRemoved).toBe(0);
        });
    });
    
    describe('getSummary()', () => {
        test('should return message when no transformation done', () => {
            const summary = transformer.getSummary();
            expect(summary).toContain('尚未进行数据处理');
        });
        
        test('should return summary after transformation', () => {
            transformer.data = [{ test: 'data' }];
            transformer.stats = {
                totalRowsRemoved: 2,
                incompleteTimeRowsRemoved: 1,
                workshopColumnSplit: true,
                repairPersonClassified: true
            };
            
            const summary = transformer.getSummary();
            expect(summary).toContain('数据处理完成');
            expect(summary).toContain('1');
            expect(summary).toContain('已完成');
        });
    });
});

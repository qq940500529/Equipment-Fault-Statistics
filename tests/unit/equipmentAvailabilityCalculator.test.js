/**
 * 设备妥善率计算器单元测试
 * Unit Tests for Equipment Availability Calculator
 */

import { EquipmentAvailabilityCalculator } from '../../js/modules/equipmentAvailabilityCalculator.js';

describe('EquipmentAvailabilityCalculator', () => {
    let calculator;

    beforeEach(() => {
        calculator = new EquipmentAvailabilityCalculator();
    });

    describe('constructor', () => {
        test('should initialize with correct default values', () => {
            expect(calculator.MONTH_HOURS).toBe(720); // 30 days * 24 hours
            expect(calculator.equipmentData).toBeNull();
            expect(calculator.faultData).toBeNull();
            expect(calculator.equipmentByWorkshop).toEqual({});
            expect(calculator.faultTimeByWorkshop).toEqual({});
        });
    });

    describe('extractWorkshopFromArea', () => {
        test('should extract workshop name from standard format', () => {
            const result = calculator.extractWorkshopFromArea('TPM天津工厂-TPM七车间-组装区域');
            expect(result).toBe('TPM七车间');
        });

        test('should extract workshop name from TPM factory format', () => {
            const result = calculator.extractWorkshopFromArea('TPM天津工厂-设备科公共任务区域-维修');
            expect(result).toBe('设备科公共任务区域');
        });

        test('should handle single part area', () => {
            const result = calculator.extractWorkshopFromArea('TPM炼胶车间');
            expect(result).toBe('TPM炼胶车间');
        });

        test('should return second part for non-standard format', () => {
            const result = calculator.extractWorkshopFromArea('组装区域-设备1');
            expect(result).toBe('设备1'); // Returns second part when length >= 2
        });
    });

    describe('extractWorkshopFromFaultData', () => {
        test('should extract workshop from fault data format', () => {
            const result = calculator.extractWorkshopFromFaultData('TPM七车间-组装区域-伺服插接设备');
            expect(result).toBe('TPM七车间');
        });

        test('should extract workshop from TPM factory format', () => {
            const result = calculator.extractWorkshopFromFaultData('TPM天津工厂-设备科公共任务区域-零星类安装');
            expect(result).toBe('设备科公共任务区域');
        });

        test('should handle workshop with TPM prefix', () => {
            const result = calculator.extractWorkshopFromFaultData('TPM一车间-硫化区域-卧式硫化罐');
            expect(result).toBe('TPM一车间');
        });
    });

    describe('extractEquipmentCount', () => {
        test('should extract equipment count by workshop', () => {
            const equipmentData = [
                { '区域': 'TPM天津工厂-TPM七车间-组装区域' },
                { '区域': 'TPM天津工厂-TPM七车间-热成型区域' },
                { '区域': 'TPM天津工厂-TPM一车间-组装区域' },
                { '区域': 'TPM天津工厂-TPM七车间-组装区域' }
            ];

            const result = calculator.extractEquipmentCount(equipmentData);

            expect(result['TPM七车间']).toBe(3);
            expect(result['TPM一车间']).toBe(1);
        });

        test('should throw error for empty data', () => {
            expect(() => calculator.extractEquipmentCount([])).toThrow('设备台账数据为空或格式不正确');
        });

        test('should throw error for null data', () => {
            expect(() => calculator.extractEquipmentCount(null)).toThrow('设备台账数据为空或格式不正确');
        });

        test('should skip rows with invalid area', () => {
            const equipmentData = [
                { '区域': 'TPM天津工厂-TPM七车间-组装区域' },
                { '区域': null },
                { '区域': '' },
                { '区域': 'TPM天津工厂-TPM一车间-组装区域' }
            ];

            const result = calculator.extractEquipmentCount(equipmentData);

            expect(result['TPM七车间']).toBe(1);
            expect(result['TPM一车间']).toBe(1);
        });
    });

    describe('aggregateFaultTime', () => {
        test('should aggregate fault time by workshop', () => {
            const faultData = [
                {
                    '车间': 'TPM七车间-组装区域-设备A',
                    '修理耗时(秒)': 3600,  // 1 hour
                    '等待耗时(秒)': 1800   // 0.5 hour
                },
                {
                    '车间': 'TPM七车间-组装区域-设备B',
                    '修理耗时(秒)': 7200,  // 2 hours
                    '等待耗时(秒)': 0
                },
                {
                    '车间': 'TPM一车间-硫化区域-设备C',
                    '修理耗时(秒)': 1800,  // 0.5 hour
                    '等待耗时(秒)': 1800   // 0.5 hour
                }
            ];

            const result = calculator.aggregateFaultTime(faultData);

            expect(result['TPM七车间']).toBeCloseTo(3.5, 2); // 1.5 + 2
            expect(result['TPM一车间']).toBeCloseTo(1.0, 2); // 0.5 + 0.5
        });

        test('should throw error for empty data', () => {
            expect(() => calculator.aggregateFaultTime([])).toThrow('故障信息数据为空或格式不正确');
        });

        test('should handle missing time values', () => {
            const faultData = [
                {
                    '车间': 'TPM七车间-组装区域-设备A',
                    '修理耗时(秒)': 3600,
                    '等待耗时(秒)': null
                },
                {
                    '车间': 'TPM七车间-组装区域-设备B',
                    '修理耗时(秒)': null,
                    '等待耗时(秒)': 1800
                }
            ];

            const result = calculator.aggregateFaultTime(faultData);

            expect(result['TPM七车间']).toBeCloseTo(1.5, 2); // 1 + 0.5
        });

        test('should skip rows with invalid workshop', () => {
            const faultData = [
                {
                    '车间': 'TPM七车间-组装区域-设备A',
                    '修理耗时(秒)': 3600,
                    '等待耗时(秒)': 1800
                },
                {
                    '车间': null,
                    '修理耗时(秒)': 3600,
                    '等待耗时(秒)': 1800
                },
                {
                    '车间': '',
                    '修理耗时(秒)': 3600,
                    '等待耗时(秒)': 1800
                }
            ];

            const result = calculator.aggregateFaultTime(faultData);

            expect(result['TPM七车间']).toBeCloseTo(1.5, 2);
            expect(Object.keys(result).length).toBe(1);
        });
    });

    describe('calculateWorkshopAvailability', () => {
        beforeEach(() => {
            calculator.equipmentByWorkshop = {
                'TPM七车间': 100,
                'TPM一车间': 50
            };
            calculator.faultTimeByWorkshop = {
                'TPM七车间': 720,   // 720 hours fault time
                'TPM一车间': 360    // 360 hours fault time
            };
        });

        test('should calculate availability correctly', () => {
            // TPM七车间: (1 - (720 / (100 * 720))) * 100 = 99%
            const result1 = calculator.calculateWorkshopAvailability('TPM七车间');
            expect(result1).toBeCloseTo(99.0, 2);

            // TPM一车间: (1 - (360 / (50 * 720))) * 100 = 99%
            const result2 = calculator.calculateWorkshopAvailability('TPM一车间');
            expect(result2).toBeCloseTo(99.0, 2);
        });

        test('should return 0 for workshop with no equipment', () => {
            const result = calculator.calculateWorkshopAvailability('TPM二车间');
            expect(result).toBe(0);
        });

        test('should handle workshop with equipment but no faults', () => {
            calculator.equipmentByWorkshop['TPM三车间'] = 50;
            const result = calculator.calculateWorkshopAvailability('TPM三车间');
            expect(result).toBe(100);
        });

        test('should cap availability at 100%', () => {
            calculator.equipmentByWorkshop['TPM四车间'] = 100;
            calculator.faultTimeByWorkshop['TPM四车间'] = -100; // Negative fault time
            const result = calculator.calculateWorkshopAvailability('TPM四车间');
            expect(result).toBe(100);
        });

        test('should cap availability at 0% for excessive fault time', () => {
            calculator.equipmentByWorkshop['TPM五车间'] = 10;
            calculator.faultTimeByWorkshop['TPM五车间'] = 100000; // Excessive fault time
            const result = calculator.calculateWorkshopAvailability('TPM五车间');
            expect(result).toBe(0);
        });
    });

    describe('calculateAllWorkshopsAvailability', () => {
        beforeEach(() => {
            calculator.equipmentByWorkshop = {
                'TPM七车间': 100,
                'TPM一车间': 50,
                'TPM二车间': 75
            };
            calculator.faultTimeByWorkshop = {
                'TPM七车间': 720,
                'TPM一车间': 360,
                'TPM三车间': 100 // Workshop with fault but no equipment
            };
        });

        test('should return all workshops with availability data', () => {
            const results = calculator.calculateAllWorkshopsAvailability();
            
            expect(results.length).toBe(4); // 3 from equipment + 1 from fault only
            expect(results.every(r => r.workshop)).toBe(true);
            expect(results.every(r => typeof r.equipmentCount === 'number')).toBe(true);
            expect(results.every(r => typeof r.faultTimeHours === 'number')).toBe(true);
            expect(results.every(r => typeof r.availabilityRate === 'number')).toBe(true);
        });

        test('should sort results by availability rate (low to high)', () => {
            const results = calculator.calculateAllWorkshopsAvailability();
            
            for (let i = 1; i < results.length; i++) {
                expect(results[i].availabilityRate).toBeGreaterThanOrEqual(results[i - 1].availabilityRate);
            }
        });

        test('should format numbers correctly', () => {
            const results = calculator.calculateAllWorkshopsAvailability();
            
            results.forEach(result => {
                expect(Number.isInteger(result.equipmentCount)).toBe(true);
                expect(result.faultTimeHours.toString().split('.')[1]?.length || 0).toBeLessThanOrEqual(2);
                expect(result.availabilityRate.toString().split('.')[1]?.length || 0).toBeLessThanOrEqual(2);
            });
        });
    });

    describe('calculateOverallAvailability', () => {
        test('should calculate overall availability correctly', () => {
            calculator.equipmentByWorkshop = {
                'TPM七车间': 100,
                'TPM一车间': 50
            };
            calculator.faultTimeByWorkshop = {
                'TPM七车间': 720,
                'TPM一车间': 360
            };

            const result = calculator.calculateOverallAvailability();

            // Total: 150 equipment, 1080 hours fault time
            // (1 - (1080 / (150 * 720))) * 100 = 99%
            expect(result.totalEquipment).toBe(150);
            expect(result.totalFaultTimeHours).toBeCloseTo(1080, 2);
            expect(result.availabilityRate).toBeCloseTo(99.0, 2);
        });

        test('should return zero values for no equipment', () => {
            const result = calculator.calculateOverallAvailability();

            expect(result.totalEquipment).toBe(0);
            expect(result.totalFaultTimeHours).toBe(0);
            expect(result.availabilityRate).toBe(0);
        });

        test('should handle equipment with no faults', () => {
            calculator.equipmentByWorkshop = {
                'TPM七车间': 100
            };

            const result = calculator.calculateOverallAvailability();

            expect(result.totalEquipment).toBe(100);
            expect(result.totalFaultTimeHours).toBe(0);
            expect(result.availabilityRate).toBe(100);
        });
    });

    describe('generateReport', () => {
        test('should generate complete report', () => {
            const equipmentData = [
                { '区域': 'TPM天津工厂-TPM七车间-组装区域' },
                { '区域': 'TPM天津工厂-TPM七车间-热成型区域' },
                { '区域': 'TPM天津工厂-TPM一车间-组装区域' }
            ];

            const faultData = [
                {
                    '车间': 'TPM七车间-组装区域-设备A',
                    '修理耗时(秒)': 3600,
                    '等待耗时(秒)': 1800
                },
                {
                    '车间': 'TPM一车间-硫化区域-设备B',
                    '修理耗时(秒)': 1800,
                    '等待耗时(秒)': 1800
                }
            ];

            const report = calculator.generateReport(equipmentData, faultData);

            expect(report).toHaveProperty('overall');
            expect(report).toHaveProperty('workshops');
            expect(report).toHaveProperty('metadata');
            
            expect(report.overall.totalEquipment).toBe(3);
            expect(report.workshops.length).toBeGreaterThan(0);
            expect(report.metadata.monthHours).toBe(720);
            expect(report.metadata.workshopCount).toBeGreaterThan(0);
            expect(report.metadata.calculationDate).toBeDefined();
        });

        test('should accept custom column names', () => {
            const equipmentData = [
                { 'area': 'TPM天津工厂-TPM七车间-组装区域' }
            ];

            const faultData = [
                {
                    'workshop': 'TPM七车间-组装区域-设备A',
                    'repair_time': 3600,
                    'wait_time': 1800
                }
            ];

            const report = calculator.generateReport(equipmentData, faultData, {
                areaColumnName: 'area',
                workshopColumnName: 'workshop',
                repairTimeColumnName: 'repair_time',
                waitTimeColumnName: 'wait_time'
            });

            expect(report.overall.totalEquipment).toBe(1);
            expect(report.workshops.length).toBeGreaterThan(0);
        });
    });

    describe('reset', () => {
        test('should reset calculator state', () => {
            calculator.equipmentData = [{ test: 'data' }];
            calculator.faultData = [{ test: 'data' }];
            calculator.equipmentByWorkshop = { 'TPM七车间': 100 };
            calculator.faultTimeByWorkshop = { 'TPM七车间': 720 };

            calculator.reset();

            expect(calculator.equipmentData).toBeNull();
            expect(calculator.faultData).toBeNull();
            expect(calculator.equipmentByWorkshop).toEqual({});
            expect(calculator.faultTimeByWorkshop).toEqual({});
        });
    });
});

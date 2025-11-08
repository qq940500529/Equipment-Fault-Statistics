/**
 * 帕累托图生成器单元测试
 * Unit Tests for ParetoChartGenerator
 */

import { ParetoChartGenerator } from '../../js/modules/paretoChartGenerator.js';
import { OPTIONAL_COLUMNS } from '../../js/config/constants.js';

describe('ParetoChartGenerator', () => {
    let chartGenerator;
    let mockContainer;
    
    beforeEach(() => {
        // Create mock DOM element
        mockContainer = document.createElement('div');
        mockContainer.id = 'testChartContainer';
        document.body.appendChild(mockContainer);
        
        chartGenerator = new ParetoChartGenerator('testChartContainer');
    });
    
    afterEach(() => {
        if (chartGenerator) {
            chartGenerator.dispose();
        }
        document.body.removeChild(mockContainer);
    });
    
    describe('构造函数和初始化', () => {
        test('应该正确初始化图表生成器', () => {
            expect(chartGenerator).toBeDefined();
            expect(chartGenerator.chartDom).toBe(mockContainer);
            expect(chartGenerator.currentLevel).toBe(0);
            expect(chartGenerator.currentMetric).toBe('waitTime');
            expect(chartGenerator.showTop20Only).toBe(false);
            expect(chartGenerator.navigationStack).toEqual([]);
        });
        
        test('应该定义4个层级', () => {
            expect(chartGenerator.levels).toHaveLength(4);
            expect(chartGenerator.levels[0].name).toBe('车间');
            expect(chartGenerator.levels[1].name).toBe('设备');
            expect(chartGenerator.levels[2].name).toBe('设备编号');
            expect(chartGenerator.levels[3].name).toBe('失效类型');
        });
        
        test('应该定义3个指标', () => {
            expect(Object.keys(chartGenerator.metrics)).toHaveLength(3);
            expect(chartGenerator.metrics.waitTime.name).toBe('等待时间h');
            expect(chartGenerator.metrics.repairTime.name).toBe('维修时间h');
            expect(chartGenerator.metrics.faultTime.name).toBe('故障时间h');
        });
    });
    
    describe('数据聚合', () => {
        test('应该正确聚合数据', () => {
            const testData = [
                { '车间': '一车间', [OPTIONAL_COLUMNS.waitTime]: 10 },
                { '车间': '一车间', [OPTIONAL_COLUMNS.waitTime]: 20 },
                { '车间': '二车间', [OPTIONAL_COLUMNS.waitTime]: 15 },
                { '车间': '二车间', [OPTIONAL_COLUMNS.waitTime]: 5 }
            ];
            
            const result = chartGenerator.aggregateData(
                testData,
                '车间',
                OPTIONAL_COLUMNS.waitTime
            );
            
            expect(result).toHaveLength(2);
            // 应该按降序排列
            expect(result[0].name).toBe('一车间');
            expect(result[0].value).toBe(30);
            expect(result[1].name).toBe('二车间');
            expect(result[1].value).toBe(20);
        });
        
        test('应该处理空值和未定义值', () => {
            const testData = [
                { '车间': '一车间', [OPTIONAL_COLUMNS.waitTime]: 10 },
                { '车间': null, [OPTIONAL_COLUMNS.waitTime]: 5 },
                { '车间': '一车间', [OPTIONAL_COLUMNS.waitTime]: null },
                { '车间': '二车间' }
            ];
            
            const result = chartGenerator.aggregateData(
                testData,
                '车间',
                OPTIONAL_COLUMNS.waitTime
            );
            
            expect(result).toHaveLength(3);
            expect(result.find(r => r.name === '一车间')?.value).toBe(10);
            expect(result.find(r => r.name === '未知')?.value).toBe(5);
            expect(result.find(r => r.name === '二车间')?.value).toBe(0);
        });
        
        test('应该降序排序结果', () => {
            const testData = [
                { '车间': 'A', [OPTIONAL_COLUMNS.waitTime]: 5 },
                { '车间': 'B', [OPTIONAL_COLUMNS.waitTime]: 30 },
                { '车间': 'C', [OPTIONAL_COLUMNS.waitTime]: 15 }
            ];
            
            const result = chartGenerator.aggregateData(
                testData,
                '车间',
                OPTIONAL_COLUMNS.waitTime
            );
            
            expect(result[0].name).toBe('B');
            expect(result[1].name).toBe('C');
            expect(result[2].name).toBe('A');
        });
    });
    
    describe('帕累托数据计算', () => {
        test('应该正确计算百分比和累计百分比', () => {
            const aggregatedData = [
                { name: 'A', value: 50 },
                { name: 'B', value: 30 },
                { name: 'C', value: 20 }
            ];
            
            const result = chartGenerator.calculateParetoData(aggregatedData);
            
            expect(result.total).toBe(100);
            expect(result.data).toHaveLength(3);
            
            // 检查第一项
            expect(result.data[0].name).toBe('A');
            expect(result.data[0].value).toBe(50);
            expect(result.data[0].percentage).toBe(50);
            expect(result.data[0].cumulativePercentage).toBe(50);
            
            // 检查第二项
            expect(result.data[1].name).toBe('B');
            expect(result.data[1].percentage).toBe(30);
            expect(result.data[1].cumulativePercentage).toBe(80);
            
            // 检查第三项
            expect(result.data[2].cumulativePercentage).toBe(100);
        });
        
        test('应该正确识别前20%的分界点', () => {
            const aggregatedData = [
                { name: 'A', value: 15 },
                { name: 'B', value: 10 },
                { name: 'C', value: 10 },
                { name: 'D', value: 65 }
            ];
            
            const result = chartGenerator.calculateParetoData(aggregatedData);
            
            // 累计15% < 20%，15%+10%=25% >= 20%，所以前两项（索引0和1）是前20%
            expect(result.top20Index).toBe(1);
        });
        
        test('应该处理边界情况：所有值相同', () => {
            const aggregatedData = [
                { name: 'A', value: 10 },
                { name: 'B', value: 10 },
                { name: 'C', value: 10 }
            ];
            
            const result = chartGenerator.calculateParetoData(aggregatedData);
            
            expect(result.total).toBe(30);
            result.data.forEach(item => {
                expect(item.percentage).toBeCloseTo(33.33, 1);
            });
        });
        
        test('应该保留2位小数', () => {
            const aggregatedData = [
                { name: 'A', value: 100/3 }  // 33.333...
            ];
            
            const result = chartGenerator.calculateParetoData(aggregatedData);
            
            expect(result.data[0].percentage).toBe(100);
            expect(result.data[0].cumulativePercentage).toBe(100);
        });
    });
    
    describe('导航功能', () => {
        beforeEach(() => {
            const testData = [
                { 
                    '车间': '一车间', 
                    '设备名称': '设备A',
                    '设备编号': 'EQ001',
                    '故障类型': '机械故障',
                    [OPTIONAL_COLUMNS.waitTime]: 10 
                }
            ];
            chartGenerator.setData(testData);
        });
        
        test('setData应该重置导航状态', () => {
            chartGenerator.currentLevel = 2;
            chartGenerator.currentFilters = { '车间': '一车间' };
            chartGenerator.navigationStack = [{ level: 0, filters: {} }];
            
            const testData = [{ '车间': '二车间', [OPTIONAL_COLUMNS.waitTime]: 5 }];
            chartGenerator.setData(testData);
            
            expect(chartGenerator.currentLevel).toBe(0);
            expect(chartGenerator.currentFilters).toEqual({});
            expect(chartGenerator.navigationStack).toEqual([]);
        });
        
        test('switchMetric应该更新当前指标', () => {
            chartGenerator.switchMetric('repairTime');
            expect(chartGenerator.currentMetric).toBe('repairTime');
            
            chartGenerator.switchMetric('faultTime');
            expect(chartGenerator.currentMetric).toBe('faultTime');
        });
        
        test('switchMetric应该忽略无效指标', () => {
            const originalMetric = chartGenerator.currentMetric;
            chartGenerator.switchMetric('invalidMetric');
            expect(chartGenerator.currentMetric).toBe(originalMetric);
        });
        
        test('toggleTop20应该切换显示模式', () => {
            expect(chartGenerator.showTop20Only).toBe(false);
            
            chartGenerator.toggleTop20();
            expect(chartGenerator.showTop20Only).toBe(true);
            
            chartGenerator.toggleTop20();
            expect(chartGenerator.showTop20Only).toBe(false);
        });
        
        test('goBack应该恢复上一个状态', () => {
            chartGenerator.navigationStack = [
                { level: 0, filters: {} }
            ];
            chartGenerator.currentLevel = 1;
            chartGenerator.currentFilters = { '车间': '一车间' };
            
            chartGenerator.goBack();
            
            expect(chartGenerator.currentLevel).toBe(0);
            expect(chartGenerator.currentFilters).toEqual({});
            expect(chartGenerator.navigationStack).toEqual([]);
        });
        
        test('goBack在没有历史时应该不做任何操作', () => {
            chartGenerator.navigationStack = [];
            chartGenerator.currentLevel = 0;
            
            chartGenerator.goBack();
            
            expect(chartGenerator.currentLevel).toBe(0);
        });
        
        test('reset应该重置所有状态', () => {
            chartGenerator.currentLevel = 2;
            chartGenerator.currentFilters = { '车间': '一车间', '设备名称': '设备A' };
            chartGenerator.navigationStack = [
                { level: 0, filters: {} },
                { level: 1, filters: { '车间': '一车间' } }
            ];
            chartGenerator.showTop20Only = true;
            
            chartGenerator.reset();
            
            expect(chartGenerator.currentLevel).toBe(0);
            expect(chartGenerator.currentFilters).toEqual({});
            expect(chartGenerator.navigationStack).toEqual([]);
            expect(chartGenerator.showTop20Only).toBe(false);
        });
    });
    
    describe('面包屑导航', () => {
        test('应该在初始状态显示"全部"', () => {
            const breadcrumb = chartGenerator.getBreadcrumb();
            expect(breadcrumb).toBe('全部');
        });
        
        test('应该显示当前筛选路径', () => {
            chartGenerator.currentFilters = {
                '车间': '一车间',
                '设备名称': '设备A'
            };
            
            const breadcrumb = chartGenerator.getBreadcrumb();
            expect(breadcrumb).toContain('全部');
            expect(breadcrumb).toContain('一车间');
            expect(breadcrumb).toContain('设备A');
        });
    });
    
    describe('图表点击处理', () => {
        beforeEach(() => {
            const testData = [
                { 
                    '车间': '一车间', 
                    '设备名称': '设备A',
                    [OPTIONAL_COLUMNS.waitTime]: 10 
                }
            ];
            chartGenerator.setData(testData);
        });
        
        test('handleChartClick应该进入下一级', () => {
            const mockParams = { name: '一车间' };
            
            chartGenerator.handleChartClick(mockParams);
            
            expect(chartGenerator.currentLevel).toBe(1);
            expect(chartGenerator.currentFilters).toEqual({ '车间': '一车间' });
            expect(chartGenerator.navigationStack).toHaveLength(1);
        });
        
        test('handleChartClick在最后一级应该不做任何操作', () => {
            chartGenerator.currentLevel = 3;  // 最后一级
            const originalFilters = { ...chartGenerator.currentFilters };
            
            chartGenerator.handleChartClick({ name: '机械故障' });
            
            expect(chartGenerator.currentLevel).toBe(3);
            expect(chartGenerator.currentFilters).toEqual(originalFilters);
        });
    });
});

/**
 * 帕累托图集成测试
 * Integration Tests for Pareto Chart
 */

import { ParetoChartGenerator } from '../../js/modules/paretoChartGenerator.js';
import { DataTransformer } from '../../js/modules/dataTransformer.js';
import { OPTIONAL_COLUMNS } from '../../js/config/constants.js';

describe('Pareto Chart Integration Tests', () => {
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
    
    describe('完整工作流测试', () => {
        test('应该处理完整的数据处理和可视化流程', () => {
            // 模拟处理后的数据
            const processedData = [
                {
                    '车间': '一车间',
                    '设备名称': '设备A',
                    '设备编号': 'EQ001',
                    '故障类型': '机械故障',
                    [OPTIONAL_COLUMNS.waitTime]: 10.5,
                    [OPTIONAL_COLUMNS.repairTime]: 5.2,
                    [OPTIONAL_COLUMNS.faultTime]: 15.7
                },
                {
                    '车间': '一车间',
                    '设备名称': '设备A',
                    '设备编号': 'EQ002',
                    '故障类型': '电气故障',
                    [OPTIONAL_COLUMNS.waitTime]: 20.3,
                    [OPTIONAL_COLUMNS.repairTime]: 8.1,
                    [OPTIONAL_COLUMNS.faultTime]: 28.4
                },
                {
                    '车间': '二车间',
                    '设备名称': '设备B',
                    '设备编号': 'EQ003',
                    '故障类型': '机械故障',
                    [OPTIONAL_COLUMNS.waitTime]: 5.5,
                    [OPTIONAL_COLUMNS.repairTime]: 3.2,
                    [OPTIONAL_COLUMNS.faultTime]: 8.7
                },
                {
                    '车间': '一车间',
                    '设备名称': '设备A',
                    '设备编号': 'EQ001',
                    '故障类型': '机械故障',
                    [OPTIONAL_COLUMNS.waitTime]: 15.0,
                    [OPTIONAL_COLUMNS.repairTime]: 7.5,
                    [OPTIONAL_COLUMNS.faultTime]: 22.5
                }
            ];
            
            // 设置数据
            chartGenerator.setData(processedData);
            
            // 验证初始状态
            expect(chartGenerator.data).toBe(processedData);
            expect(chartGenerator.currentLevel).toBe(0);
            expect(chartGenerator.navigationStack).toEqual([]);
        });
        
        test('应该支持钻取导航流程', () => {
            const processedData = [
                {
                    '车间': '一车间',
                    '设备名称': '设备A',
                    '设备编号': 'EQ001',
                    '故障类型': '机械故障',
                    [OPTIONAL_COLUMNS.waitTime]: 10
                },
                {
                    '车间': '一车间',
                    '设备名称': '设备B',
                    '设备编号': 'EQ002',
                    '故障类型': '电气故障',
                    [OPTIONAL_COLUMNS.waitTime]: 20
                }
            ];
            
            chartGenerator.setData(processedData);
            
            // 第一级：车间
            expect(chartGenerator.currentLevel).toBe(0);
            
            // 点击进入第二级
            chartGenerator.handleChartClick({ name: '一车间' });
            expect(chartGenerator.currentLevel).toBe(1);
            expect(chartGenerator.currentFilters).toEqual({ '车间': '一车间' });
            
            // 点击进入第三级
            chartGenerator.handleChartClick({ name: '设备A' });
            expect(chartGenerator.currentLevel).toBe(2);
            expect(chartGenerator.currentFilters).toEqual({ 
                '车间': '一车间',
                '设备名称': '设备A'
            });
            
            // 返回
            chartGenerator.goBack();
            expect(chartGenerator.currentLevel).toBe(1);
            expect(chartGenerator.currentFilters).toEqual({ '车间': '一车间' });
            
            // 再次返回
            chartGenerator.goBack();
            expect(chartGenerator.currentLevel).toBe(0);
            expect(chartGenerator.currentFilters).toEqual({});
        });
        
        test('应该支持指标切换', () => {
            const processedData = [
                {
                    '车间': '一车间',
                    [OPTIONAL_COLUMNS.waitTime]: 10,
                    [OPTIONAL_COLUMNS.repairTime]: 5,
                    [OPTIONAL_COLUMNS.faultTime]: 15
                }
            ];
            
            chartGenerator.setData(processedData);
            
            // 初始指标
            expect(chartGenerator.currentMetric).toBe('waitTime');
            
            // 切换到维修时间
            chartGenerator.switchMetric('repairTime');
            expect(chartGenerator.currentMetric).toBe('repairTime');
            
            // 切换到故障时间
            chartGenerator.switchMetric('faultTime');
            expect(chartGenerator.currentMetric).toBe('faultTime');
            
            // 切换回等待时间
            chartGenerator.switchMetric('waitTime');
            expect(chartGenerator.currentMetric).toBe('waitTime');
        });
    });
    
    describe('数据过滤和聚合', () => {
        test('应该正确过滤和聚合多层级数据', () => {
            const processedData = [
                {
                    '车间': '一车间',
                    '设备名称': '设备A',
                    [OPTIONAL_COLUMNS.waitTime]: 10
                },
                {
                    '车间': '一车间',
                    '设备名称': '设备A',
                    [OPTIONAL_COLUMNS.waitTime]: 20
                },
                {
                    '车间': '一车间',
                    '设备名称': '设备B',
                    [OPTIONAL_COLUMNS.waitTime]: 15
                },
                {
                    '车间': '二车间',
                    '设备名称': '设备C',
                    [OPTIONAL_COLUMNS.waitTime]: 25
                }
            ];
            
            chartGenerator.setData(processedData);
            
            // 第一级：按车间聚合
            let result = chartGenerator.aggregateData(
                processedData,
                '车间',
                OPTIONAL_COLUMNS.waitTime
            );
            expect(result).toHaveLength(2);
            expect(result[0].name).toBe('一车间');
            expect(result[0].value).toBe(45);
            expect(result[1].name).toBe('二车间');
            expect(result[1].value).toBe(25);
            
            // 第二级：钻取到一车间，按设备聚合
            chartGenerator.currentFilters = { '车间': '一车间' };
            const filteredData = processedData.filter(row => row['车间'] === '一车间');
            result = chartGenerator.aggregateData(
                filteredData,
                '设备名称',
                OPTIONAL_COLUMNS.waitTime
            );
            expect(result).toHaveLength(2);
            expect(result[0].name).toBe('设备A');
            expect(result[0].value).toBe(30);
            expect(result[1].name).toBe('设备B');
            expect(result[1].value).toBe(15);
        });
    });
    
    describe('帕累托分析', () => {
        test('应该正确计算20/80规则', () => {
            const aggregatedData = [
                { name: 'A', value: 80 },
                { name: 'B', value: 10 },
                { name: 'C', value: 6 },
                { name: 'D', value: 4 }
            ];
            
            const result = chartGenerator.calculateParetoData(aggregatedData);
            
            // 检查总和
            expect(result.total).toBe(100);
            
            // 检查第一项（80%）
            expect(result.data[0].percentage).toBe(80);
            expect(result.data[0].cumulativePercentage).toBe(80);
            
            // 通常帕累托规则是前20%的项目产生80%的结果
            // 在这个例子中，第一项就占了80%
            const top80Items = result.data.filter(item => item.cumulativePercentage <= 80);
            expect(top80Items.length).toBe(1);
        });
        
        test('应该支持显示前20%的功能', () => {
            const processedData = [];
            for (let i = 1; i <= 10; i++) {
                processedData.push({
                    '车间': `车间${i}`,
                    [OPTIONAL_COLUMNS.waitTime]: 11 - i  // 10, 9, 8, 7, 6, 5, 4, 3, 2, 1
                });
            }
            
            chartGenerator.setData(processedData);
            
            const aggregatedData = chartGenerator.aggregateData(
                processedData,
                '车间',
                OPTIONAL_COLUMNS.waitTime
            );
            const paretoResult = chartGenerator.calculateParetoData(aggregatedData);
            
            // 不过滤时应该有所有数据
            expect(paretoResult.data).toHaveLength(10);
            
            // 找到达到20%的位置
            const top20Count = paretoResult.top20Index + 1;
            expect(top20Count).toBeGreaterThan(0);
            expect(top20Count).toBeLessThanOrEqual(10);
        });
    });
    
    describe('边界情况处理', () => {
        test('应该处理空数据', () => {
            chartGenerator.setData([]);
            
            const result = chartGenerator.aggregateData([], '车间', OPTIONAL_COLUMNS.waitTime);
            expect(result).toEqual([]);
        });
        
        test('应该处理单条数据', () => {
            const processedData = [
                {
                    '车间': '一车间',
                    [OPTIONAL_COLUMNS.waitTime]: 10
                }
            ];
            
            chartGenerator.setData(processedData);
            
            const result = chartGenerator.aggregateData(
                processedData,
                '车间',
                OPTIONAL_COLUMNS.waitTime
            );
            
            expect(result).toHaveLength(1);
            expect(result[0].name).toBe('一车间');
            expect(result[0].value).toBe(10);
        });
        
        test('应该处理所有值为0的情况', () => {
            const processedData = [
                { '车间': 'A', [OPTIONAL_COLUMNS.waitTime]: 0 },
                { '车间': 'B', [OPTIONAL_COLUMNS.waitTime]: 0 }
            ];
            
            const result = chartGenerator.calculateParetoData(
                chartGenerator.aggregateData(processedData, '车间', OPTIONAL_COLUMNS.waitTime)
            );
            
            expect(result.total).toBe(0);
            result.data.forEach(item => {
                expect(isNaN(item.percentage)).toBe(true);
            });
        });
    });
    
    describe('状态重置', () => {
        test('reset应该清除所有筛选和导航', () => {
            const processedData = [
                {
                    '车间': '一车间',
                    '设备名称': '设备A',
                    [OPTIONAL_COLUMNS.waitTime]: 10
                }
            ];
            
            chartGenerator.setData(processedData);
            
            // 设置一些状态
            chartGenerator.handleChartClick({ name: '一车间' });
            chartGenerator.switchMetric('repairTime');
            chartGenerator.toggleTop20();
            
            // 重置
            chartGenerator.reset();
            
            // 验证所有状态都被重置
            expect(chartGenerator.currentLevel).toBe(0);
            expect(chartGenerator.currentFilters).toEqual({});
            expect(chartGenerator.navigationStack).toEqual([]);
            expect(chartGenerator.showTop20Only).toBe(false);
            // 注意：currentMetric不会被reset重置，这是预期的行为
        });
    });
});

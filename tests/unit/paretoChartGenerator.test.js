/**
 * ParetoChartGenerator Module Tests
 * Tests for the getCurrentFilteredData method
 */

import { ParetoChartGenerator } from '../../js/modules/paretoChartGenerator.js';

// Create mock functions for ECharts
const mockChartInstance = {
    on: () => {},
    getZr: () => ({
        on: () => {}
    }),
    setOption: () => {},
    resize: () => {},
    dispose: () => {},
    getWidth: () => 800,
    containPixel: () => false
};

// Mock DOM and ECharts for testing
beforeAll(() => {
    // Mock DOM element
    document.body.innerHTML = '<div id="testChartContainer"></div>';
    
    // Mock ECharts
    global.echarts = {
        init: () => mockChartInstance
    };
});

describe('ParetoChartGenerator - getCurrentFilteredData', () => {
    let chartGenerator;
    const testData = [
        { '车间': '一车间', '设备': '设备A', '设备编号': 'A001', '失效类型': '机械故障', '等待时间h': 1.5, '维修时间h': 2.0, '故障时间h': 3.5, '工单号': 'WO001' },
        { '车间': '一车间', '设备': '设备A', '设备编号': 'A002', '失效类型': '电气故障', '等待时间h': 2.0, '维修时间h': 1.5, '故障时间h': 3.5, '工单号': 'WO002' },
        { '车间': '一车间', '设备': '设备B', '设备编号': 'B001', '失效类型': '机械故障', '等待时间h': 1.0, '维修时间h': 1.0, '故障时间h': 2.0, '工单号': 'WO003' },
        { '车间': '二车间', '设备': '设备C', '设备编号': 'C001', '失效类型': '液压故障', '等待时间h': 3.0, '维修时间h': 2.5, '故障时间h': 5.5, '工单号': 'WO004' },
        { '车间': '二车间', '设备': '设备C', '设备编号': 'C002', '失效类型': '机械故障', '等待时间h': 2.5, '维修时间h': 3.0, '故障时间h': 5.5, '工单号': 'WO005' }
    ];

    beforeEach(() => {
        chartGenerator = new ParetoChartGenerator('testChartContainer');
    });

    afterEach(() => {
        if (chartGenerator) {
            chartGenerator.dispose();
        }
    });

    test('should return empty data when no data is set', () => {
        const result = chartGenerator.getCurrentFilteredData();
        
        expect(result.data).toEqual([]);
        expect(result.levelName).toBe('');
        expect(result.filters).toEqual({});
        expect(result.breadcrumb).toBe('');
    });

    test('should return all data at top level (车间)', () => {
        chartGenerator.setData(testData);
        const result = chartGenerator.getCurrentFilteredData();
        
        expect(result.data).toHaveLength(5);
        expect(result.levelName).toBe('车间');
        expect(result.filters).toEqual({});
        expect(result.breadcrumb).toBe('全部');
    });

    test('should return filtered data after drilling down to 设备 level', () => {
        chartGenerator.setData(testData);
        
        // Simulate drilling down to "一车间"
        chartGenerator.navigationStack.push({
            level: 0,
            filters: {},
            value: '一车间'
        });
        chartGenerator.currentFilters = { '车间': '一车间' };
        chartGenerator.currentLevel = 1;
        
        const result = chartGenerator.getCurrentFilteredData();
        
        expect(result.data).toHaveLength(3); // Only "一车间" rows
        expect(result.levelName).toBe('设备');
        expect(result.filters).toEqual({ '车间': '一车间' });
        expect(result.data.every(row => row['车间'] === '一车间')).toBe(true);
    });

    test('should return filtered data after drilling down to 设备编号 level', () => {
        chartGenerator.setData(testData);
        
        // Simulate drilling down to "一车间" > "设备A"
        chartGenerator.navigationStack = [
            { level: 0, filters: {}, value: '一车间' },
            { level: 1, filters: { '车间': '一车间' }, value: '设备A' }
        ];
        chartGenerator.currentFilters = { '车间': '一车间', '设备': '设备A' };
        chartGenerator.currentLevel = 2;
        
        const result = chartGenerator.getCurrentFilteredData();
        
        expect(result.data).toHaveLength(2); // Only "一车间" + "设备A" rows
        expect(result.levelName).toBe('设备编号');
        expect(result.filters).toEqual({ '车间': '一车间', '设备': '设备A' });
        expect(result.data.every(row => row['车间'] === '一车间' && row['设备'] === '设备A')).toBe(true);
    });

    test('should return filtered data after drilling down to 失效类型 level', () => {
        chartGenerator.setData(testData);
        
        // Simulate drilling down to "一车间" > "设备A" > "A001"
        chartGenerator.navigationStack = [
            { level: 0, filters: {}, value: '一车间' },
            { level: 1, filters: { '车间': '一车间' }, value: '设备A' },
            { level: 2, filters: { '车间': '一车间', '设备': '设备A' }, value: 'A001' }
        ];
        chartGenerator.currentFilters = { '车间': '一车间', '设备': '设备A', '设备编号': 'A001' };
        chartGenerator.currentLevel = 3;
        
        const result = chartGenerator.getCurrentFilteredData();
        
        expect(result.data).toHaveLength(1);
        expect(result.levelName).toBe('失效类型');
        expect(result.filters).toEqual({ '车间': '一车间', '设备': '设备A', '设备编号': 'A001' });
        expect(result.data[0]['工单号']).toBe('WO001');
    });

    test('should preserve all columns in filtered data', () => {
        chartGenerator.setData(testData);
        
        // Simulate drilling down to "二车间"
        chartGenerator.navigationStack.push({
            level: 0,
            filters: {},
            value: '二车间'
        });
        chartGenerator.currentFilters = { '车间': '二车间' };
        chartGenerator.currentLevel = 1;
        
        const result = chartGenerator.getCurrentFilteredData();
        
        expect(result.data).toHaveLength(2);
        
        // Check that all original columns are preserved
        const firstRow = result.data[0];
        expect(firstRow).toHaveProperty('车间');
        expect(firstRow).toHaveProperty('设备');
        expect(firstRow).toHaveProperty('设备编号');
        expect(firstRow).toHaveProperty('失效类型');
        expect(firstRow).toHaveProperty('等待时间h');
        expect(firstRow).toHaveProperty('维修时间h');
        expect(firstRow).toHaveProperty('故障时间h');
        expect(firstRow).toHaveProperty('工单号');
    });

    test('should generate correct breadcrumb', () => {
        chartGenerator.setData(testData);
        
        // Level 0: 全部
        expect(chartGenerator.getBreadcrumb()).toBe('全部');
        
        // Drill down to "一车间"
        chartGenerator.navigationStack.push({
            level: 0,
            filters: {},
            value: '一车间'
        });
        chartGenerator.currentFilters = { '车间': '一车间' };
        chartGenerator.currentLevel = 1;
        
        const result = chartGenerator.getCurrentFilteredData();
        expect(result.breadcrumb).toBe('全部 > 一车间');
    });
});

describe('ParetoChartGenerator - Basic Functionality', () => {
    let chartGenerator;

    beforeEach(() => {
        chartGenerator = new ParetoChartGenerator('testChartContainer');
    });

    afterEach(() => {
        if (chartGenerator) {
            chartGenerator.dispose();
        }
    });

    test('should initialize with default values', () => {
        expect(chartGenerator.currentLevel).toBe(0);
        expect(chartGenerator.currentMetric).toBe('waitTime');
        expect(chartGenerator.showTop20Only).toBe(false);
        expect(chartGenerator.navigationStack).toEqual([]);
        expect(chartGenerator.currentFilters).toEqual({});
    });

    test('should have four drill-down levels', () => {
        expect(chartGenerator.levels).toHaveLength(4);
        expect(chartGenerator.levels[0].name).toBe('车间');
        expect(chartGenerator.levels[1].name).toBe('设备');
        expect(chartGenerator.levels[2].name).toBe('设备编号');
        expect(chartGenerator.levels[3].name).toBe('失效类型');
    });

    test('should have three metrics available', () => {
        expect(chartGenerator.metrics).toHaveProperty('waitTime');
        expect(chartGenerator.metrics).toHaveProperty('repairTime');
        expect(chartGenerator.metrics).toHaveProperty('faultTime');
    });

    test('should reset all state when reset is called', () => {
        const testData = [
            { '车间': '一车间', '设备': '设备A', '等待时间h': 1.5 }
        ];
        chartGenerator.setData(testData);
        
        // Modify state
        chartGenerator.currentLevel = 2;
        chartGenerator.showTop20Only = true;
        chartGenerator.currentFilters = { '车间': '一车间' };
        chartGenerator.navigationStack.push({ level: 0, filters: {}, value: '一车间' });
        
        // Reset
        chartGenerator.reset();
        
        expect(chartGenerator.currentLevel).toBe(0);
        expect(chartGenerator.showTop20Only).toBe(false);
        expect(chartGenerator.currentFilters).toEqual({});
        expect(chartGenerator.navigationStack).toEqual([]);
    });
});

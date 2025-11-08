/**
 * 帕累托图功能直接测试
 * Direct Pareto Chart Functionality Test
 * 
 * 通过直接注入测试数据来测试图表功能，绕过文件上传步骤
 */

import { test, expect } from '@playwright/test';

test.describe('帕累托图功能测试 - 直接数据注入', () => {
    // 测试数据
    const testData = [
        {
            '车间': '一车间',
            '设备名称': '设备A',
            '设备编号': 'EQ001',
            '故障类型': '机械故障',
            '等待时间h': 10.5,
            '维修时间h': 5.2,
            '故障时间h': 15.7
        },
        {
            '车间': '一车间',
            '设备名称': '设备A',
            '设备编号': 'EQ002',
            '故障类型': '电气故障',
            '等待时间h': 20.3,
            '维修时间h': 8.1,
            '故障时间h': 28.4
        },
        {
            '车间': '二车间',
            '设备名称': '设备B',
            '设备编号': 'EQ003',
            '故障类型': '机械故障',
            '等待时间h': 5.5,
            '维修时间h': 3.2,
            '故障时间h': 8.7
        },
        {
            '车间': '一车间',
            '设备名称': '设备B',
            '设备编号': 'EQ004',
            '故障类型': '液压故障',
            '等待时间h': 15.0,
            '维修时间h': 7.5,
            '故障时间h': 22.5
        },
        {
            '车间': '三车间',
            '设备名称': '设备C',
            '设备编号': 'EQ005',
            '故障类型': '电气故障',
            '等待时间h': 8.0,
            '维修时间h': 4.0,
            '故障时间h': 12.0
        }
    ];

    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:8000');
    });

    test('场景1: 直接加载图表数据', async ({ page }) => {
        // 通过JavaScript直接设置数据并显示图表
        await page.evaluate((data) => {
            // 导入帕累托图生成器
            import('/js/modules/paretoChartGenerator.js').then(module => {
                const { ParetoChartGenerator } = module;
                
                // 创建图表容器
                const container = document.createElement('div');
                container.id = 'testParetoChart';
                container.style.width = '100%';
                container.style.height = '600px';
                document.body.appendChild(container);
                
                // 初始化图表
                window.testChart = new ParetoChartGenerator('testParetoChart');
                window.testChart.setData(data);
                
                console.log('图表已加载，数据行数:', data.length);
            });
        }, testData);

        // 等待图表渲染
        await page.waitForTimeout(2000);

        // 截图
        await page.screenshot({ path: '/tmp/pareto-chart-direct-load.png', fullPage: true });
        
        console.log('✓ 图表直接加载测试通过');
    });

    test('场景2: 测试指标切换功能', async ({ page }) => {
        // 注入数据和创建图表
        await page.evaluate((data) => {
            import('/js/modules/paretoChartGenerator.js').then(module => {
                const { ParetoChartGenerator } = module;
                
                const container = document.createElement('div');
                container.id = 'testParetoChart';
                container.style.width = '100%';
                container.style.height = '600px';
                document.body.appendChild(container);
                
                window.testChart = new ParetoChartGenerator('testParetoChart');
                window.testChart.setData(data);
            });
        }, testData);

        await page.waitForTimeout(2000);

        // 切换到维修时间指标
        await page.evaluate(() => {
            window.testChart.switchMetric('repairTime');
        });
        await page.waitForTimeout(1500);
        await page.screenshot({ path: '/tmp/pareto-chart-metric-repair.png' });

        // 切换到故障时间指标
        await page.evaluate(() => {
            window.testChart.switchMetric('faultTime');
        });
        await page.waitForTimeout(1500);
        await page.screenshot({ path: '/tmp/pareto-chart-metric-fault.png' });

        // 验证当前指标
        const currentMetric = await page.evaluate(() => window.testChart.currentMetric);
        expect(currentMetric).toBe('faultTime');

        console.log('✓ 指标切换测试通过');
    });

    test('场景3: 测试前20%筛选功能', async ({ page }) => {
        await page.evaluate((data) => {
            import('/js/modules/paretoChartGenerator.js').then(module => {
                const { ParetoChartGenerator } = module;
                
                const container = document.createElement('div');
                container.id = 'testParetoChart';
                container.style.width = '100%';
                container.style.height = '600px';
                document.body.appendChild(container);
                
                window.testChart = new ParetoChartGenerator('testParetoChart');
                window.testChart.setData(data);
            });
        }, testData);

        await page.waitForTimeout(2000);

        // 测试切换到仅显示前20%
        const initialState = await page.evaluate(() => window.testChart.showTop20Only);
        expect(initialState).toBe(false);

        await page.evaluate(() => {
            window.testChart.toggleTop20();
        });
        await page.waitForTimeout(1500);

        const toggledState = await page.evaluate(() => window.testChart.showTop20Only);
        expect(toggledState).toBe(true);
        
        await page.screenshot({ path: '/tmp/pareto-chart-top20-filtered.png' });

        // 切换回显示全部
        await page.evaluate(() => {
            window.testChart.toggleTop20();
        });
        await page.waitForTimeout(1500);

        const finalState = await page.evaluate(() => window.testChart.showTop20Only);
        expect(finalState).toBe(false);

        console.log('✓ 前20%筛选功能测试通过');
    });

    test('场景4: 测试钻取和返回功能', async ({ page }) => {
        await page.evaluate((data) => {
            import('/js/modules/paretoChartGenerator.js').then(module => {
                const { ParetoChartGenerator } = module;
                
                const container = document.createElement('div');
                container.id = 'testParetoChart';
                container.style.width = '100%';
                container.style.height = '600px';
                document.body.appendChild(container);
                
                window.testChart = new ParetoChartGenerator('testParetoChart');
                window.testChart.setData(data);
            });
        }, testData);

        await page.waitForTimeout(2000);

        // 验证初始层级
        let currentLevel = await page.evaluate(() => window.testChart.currentLevel);
        expect(currentLevel).toBe(0);

        // 模拟点击进行钻取
        await page.evaluate(() => {
            window.testChart.handleChartClick({ name: '一车间' });
        });
        await page.waitForTimeout(1500);

        currentLevel = await page.evaluate(() => window.testChart.currentLevel);
        expect(currentLevel).toBe(1);
        
        await page.screenshot({ path: '/tmp/pareto-chart-drilldown-level1.png' });

        // 再次钻取
        await page.evaluate(() => {
            window.testChart.handleChartClick({ name: '设备A' });
        });
        await page.waitForTimeout(1500);

        currentLevel = await page.evaluate(() => window.testChart.currentLevel);
        expect(currentLevel).toBe(2);
        
        await page.screenshot({ path: '/tmp/pareto-chart-drilldown-level2.png' });

        // 测试返回功能
        await page.evaluate(() => {
            window.testChart.goBack();
        });
        await page.waitForTimeout(1500);

        currentLevel = await page.evaluate(() => window.testChart.currentLevel);
        expect(currentLevel).toBe(1);

        // 再次返回
        await page.evaluate(() => {
            window.testChart.goBack();
        });
        await page.waitForTimeout(1500);

        currentLevel = await page.evaluate(() => window.testChart.currentLevel);
        expect(currentLevel).toBe(0);

        console.log('✓ 钻取和返回功能测试通过');
    });

    test('场景5: 测试重置功能', async ({ page }) => {
        await page.evaluate((data) => {
            import('/js/modules/paretoChartGenerator.js').then(module => {
                const { ParetoChartGenerator } = module;
                
                const container = document.createElement('div');
                container.id = 'testParetoChart';
                container.style.width = '100%';
                container.style.height = '600px';
                document.body.appendChild(container);
                
                window.testChart = new ParetoChartGenerator('testParetoChart');
                window.testChart.setData(data);
            });
        }, testData);

        await page.waitForTimeout(2000);

        // 进行一些操作
        await page.evaluate(() => {
            window.testChart.switchMetric('repairTime');
            window.testChart.handleChartClick({ name: '一车间' });
            window.testChart.toggleTop20();
        });
        await page.waitForTimeout(1500);

        // 执行重置
        await page.evaluate(() => {
            window.testChart.reset();
        });
        await page.waitForTimeout(1500);

        // 验证状态已重置
        const state = await page.evaluate(() => ({
            level: window.testChart.currentLevel,
            filters: window.testChart.currentFilters,
            showTop20: window.testChart.showTop20Only,
            navStack: window.testChart.navigationStack.length
        }));

        expect(state.level).toBe(0);
        expect(Object.keys(state.filters).length).toBe(0);
        expect(state.showTop20).toBe(false);
        expect(state.navStack).toBe(0);

        await page.screenshot({ path: '/tmp/pareto-chart-reset.png' });

        console.log('✓ 重置功能测试通过');
    });

    test('场景6: 测试数据聚合功能', async ({ page }) => {
        await page.evaluate((data) => {
            import('/js/modules/paretoChartGenerator.js').then(module => {
                const { ParetoChartGenerator } = module;
                
                const container = document.createElement('div');
                container.id = 'testParetoChart';
                container.style.width = '100%';
                container.style.height = '600px';
                document.body.appendChild(container);
                
                window.testChart = new ParetoChartGenerator('testParetoChart');
                window.testChart.setData(data);
            });
        }, testData);

        await page.waitForTimeout(2000);

        // 测试数据聚合
        const aggregatedData = await page.evaluate((data) => {
            return window.testChart.aggregateData(data, '车间', '等待时间h');
        }, testData);

        // 验证聚合结果
        expect(aggregatedData).toHaveLength(3); // 三个车间
        expect(aggregatedData[0]).toHaveProperty('name');
        expect(aggregatedData[0]).toHaveProperty('value');
        
        // 验证降序排列
        for (let i = 0; i < aggregatedData.length - 1; i++) {
            expect(aggregatedData[i].value).toBeGreaterThanOrEqual(aggregatedData[i + 1].value);
        }

        console.log('✓ 数据聚合功能测试通过');
        console.log('  聚合结果:', JSON.stringify(aggregatedData, null, 2));
    });

    test('场景7: 测试帕累托计算功能', async ({ page }) => {
        await page.evaluate((data) => {
            import('/js/modules/paretoChartGenerator.js').then(module => {
                const { ParetoChartGenerator } = module;
                
                const container = document.createElement('div');
                container.id = 'testParetoChart';
                container.style.width = '100%';
                container.style.height = '600px';
                document.body.appendChild(container);
                
                window.testChart = new ParetoChartGenerator('testParetoChart');
                window.testChart.setData(data);
            });
        }, testData);

        await page.waitForTimeout(2000);

        // 计算帕累托数据
        const paretoResult = await page.evaluate((data) => {
            const aggregated = window.testChart.aggregateData(data, '车间', '等待时间h');
            return window.testChart.calculateParetoData(aggregated);
        }, testData);

        // 验证帕累托计算结果
        expect(paretoResult).toHaveProperty('data');
        expect(paretoResult).toHaveProperty('total');
        expect(paretoResult).toHaveProperty('top20Index');

        // 验证累计百分比
        const lastItem = paretoResult.data[paretoResult.data.length - 1];
        expect(lastItem.cumulativePercentage).toBeCloseTo(100, 0);

        console.log('✓ 帕累托计算功能测试通过');
        console.log('  总和:', paretoResult.total);
        console.log('  前20%索引:', paretoResult.top20Index);
    });
});

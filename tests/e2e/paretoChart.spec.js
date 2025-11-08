import { test, expect } from '@playwright/test';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 测试配置
const BASE_URL = 'http://localhost:8000';
const TEST_FILE_PATH = join(__dirname, '../../examples/10月份维修数据.xlsx');

test.describe('帕累托图浏览器自动化测试', () => {
    test.beforeEach(async ({ page }) => {
        // 访问应用
        await page.goto(BASE_URL);
        // 等待应用初始化
        await page.waitForSelector('#step-1', { timeout: 5000 });
    });

    test('场景1: 完整工作流测试 - 上传文件到显示帕累托图', async ({ page }) => {
        // 步骤1: 上传Excel文件
        const fileInput = await page.locator('#fileInput');
        await fileInput.setInputFiles(TEST_FILE_PATH);
        
        // 等待文件处理完成，显示步骤2
        await page.waitForSelector('#step-2', { state: 'visible', timeout: 15000 });
        
        // 验证数据预览表格显示
        const previewTable = await page.locator('#previewTable');
        await expect(previewTable).toBeVisible();
        
        // 验证处理按钮可见
        const processBtn = await page.locator('#processBtn');
        await expect(processBtn).toBeVisible();
        
        // 步骤2: 点击处理数据
        await processBtn.click();
        
        // 等待处理完成，显示步骤4
        await page.waitForSelector('#step-4', { state: 'visible', timeout: 30000 });
        
        // 验证处理统计信息显示
        const stats = await page.locator('#processingStats');
        await expect(stats).toBeVisible();
        
        // 验证查看图表按钮可见
        const viewChartBtn = await page.locator('#viewChartBtn');
        await expect(viewChartBtn).toBeVisible();
        
        // 步骤3: 点击查看帕累托图
        await viewChartBtn.click();
        
        // 等待图表步骤显示
        await page.waitForSelector('#step-5', { state: 'visible', timeout: 5000 });
        
        // 验证图表容器存在
        const chartContainer = await page.locator('#paretoChartContainer');
        await expect(chartContainer).toBeVisible();
        
        // 验证控制按钮存在
        await expect(page.locator('#metricWaitTime')).toBeVisible();
        await expect(page.locator('#toggleTop20Btn')).toBeVisible();
        await expect(page.locator('#chartBackBtn')).toBeVisible();
        await expect(page.locator('#chartResetBtn')).toBeVisible();
        
        // 截图保存图表初始状态
        await page.screenshot({ path: '/tmp/pareto-chart-initial.png', fullPage: true });
        
        console.log('✓ 完整工作流测试通过');
    });

    test('场景2: 指标切换测试', async ({ page }) => {
        // 先导航到图表页面
        await navigateToChart(page);
        
        // 验证初始指标是"等待时间h"
        await expect(page.locator('#metricWaitTime')).toHaveClass(/active/);
        
        // 点击"维修时间h"指标
        await page.click('#metricRepairTime');
        await page.waitForTimeout(1500); // 等待动画完成
        
        // 验证按钮状态更新
        await expect(page.locator('#metricRepairTime')).toHaveClass(/active/);
        await expect(page.locator('#metricWaitTime')).not.toHaveClass(/active/);
        
        // 截图
        await page.screenshot({ path: '/tmp/pareto-chart-metric-repair.png' });
        
        // 点击"故障时间h"指标
        await page.click('#metricFaultTime');
        await page.waitForTimeout(1500);
        
        // 验证按钮状态
        await expect(page.locator('#metricFaultTime')).toHaveClass(/active/);
        
        // 截图
        await page.screenshot({ path: '/tmp/pareto-chart-metric-fault.png' });
        
        console.log('✓ 指标切换测试通过');
    });

    test('场景3: 前20%筛选功能测试', async ({ page }) => {
        await navigateToChart(page);
        
        // 获取切换按钮的初始文本
        const toggleBtn = page.locator('#toggleTop20Btn');
        const initialText = await toggleBtn.textContent();
        expect(initialText).toContain('仅显示前20%');
        
        // 点击切换到仅显示前20%
        await toggleBtn.click();
        await page.waitForTimeout(1500); // 等待动画
        
        // 验证按钮文本更新
        const updatedText = await toggleBtn.textContent();
        expect(updatedText).toContain('显示全部');
        
        // 截图显示筛选后的状态
        await page.screenshot({ path: '/tmp/pareto-chart-top20-only.png' });
        
        // 再次点击切换回全部
        await toggleBtn.click();
        await page.waitForTimeout(1500);
        
        // 验证恢复到显示全部
        const finalText = await toggleBtn.textContent();
        expect(finalText).toContain('仅显示前20%');
        
        console.log('✓ 前20%筛选功能测试通过');
    });

    test('场景4: 返回和重置功能测试', async ({ page }) => {
        await navigateToChart(page);
        
        // 验证初始状态返回按钮禁用
        const backBtn = page.locator('#chartBackBtn');
        await expect(backBtn).toBeDisabled();
        
        // 等待图表完全加载
        await page.waitForTimeout(2000);
        
        // 模拟点击图表进行钻取（点击canvas）
        const canvas = page.locator('#paretoChartContainer canvas').first();
        await canvas.click({ position: { x: 150, y: 300 } });
        await page.waitForTimeout(1500);
        
        // 返回按钮应该启用
        await expect(backBtn).toBeEnabled();
        
        // 截图钻取后的状态
        await page.screenshot({ path: '/tmp/pareto-chart-drilldown.png' });
        
        // 点击返回
        await backBtn.click();
        await page.waitForTimeout(1500);
        
        // 返回按钮应该再次禁用
        await expect(backBtn).toBeDisabled();
        
        // 测试重置功能
        // 先做一些操作
        await page.click('#metricRepairTime');
        await page.click('#toggleTop20Btn');
        await page.waitForTimeout(1000);
        
        // 点击重置
        await page.click('#chartResetBtn');
        await page.waitForTimeout(1500);
        
        // 验证状态重置
        await expect(page.locator('#metricWaitTime')).toHaveClass(/active/);
        await expect(backBtn).toBeDisabled();
        
        const toggleText = await page.locator('#toggleTop20Btn').textContent();
        expect(toggleText).toContain('仅显示前20%');
        
        console.log('✓ 返回和重置功能测试通过');
    });

    test('场景5: 响应式设计测试', async ({ page }) => {
        await navigateToChart(page);
        
        // 测试桌面尺寸
        await page.setViewportSize({ width: 1920, height: 1080 });
        await page.waitForTimeout(500);
        await expect(page.locator('#paretoChartContainer')).toBeVisible();
        await page.screenshot({ path: '/tmp/pareto-chart-desktop.png' });
        
        // 测试平板尺寸
        await page.setViewportSize({ width: 768, height: 1024 });
        await page.waitForTimeout(500);
        await expect(page.locator('#paretoChartContainer')).toBeVisible();
        await page.screenshot({ path: '/tmp/pareto-chart-tablet.png' });
        
        // 测试移动尺寸
        await page.setViewportSize({ width: 375, height: 667 });
        await page.waitForTimeout(500);
        await expect(page.locator('#paretoChartContainer')).toBeVisible();
        await page.screenshot({ path: '/tmp/pareto-chart-mobile.png' });
        
        console.log('✓ 响应式设计测试通过');
    });

    test('场景6: 返回到结果页面', async ({ page }) => {
        await navigateToChart(page);
        
        // 验证在图表页面
        await expect(page.locator('#step-5')).toBeVisible();
        
        // 点击返回结果按钮
        await page.click('#backToResultsBtn');
        await page.waitForTimeout(500);
        
        // 验证返回到步骤4
        await expect(page.locator('#step-4')).toBeVisible();
        await expect(page.locator('#step-5')).not.toBeVisible();
        
        console.log('✓ 返回到结果页面测试通过');
    });
});

// 辅助函数：导航到图表页面
async function navigateToChart(page) {
    // 上传文件
    const fileInput = await page.locator('#fileInput');
    await fileInput.setInputFiles(TEST_FILE_PATH);
    
    // 等待预览
    await page.waitForSelector('#processBtn', { state: 'visible', timeout: 15000 });
    
    // 处理数据
    await page.click('#processBtn');
    
    // 等待处理完成
    await page.waitForSelector('#viewChartBtn', { state: 'visible', timeout: 30000 });
    
    // 查看图表
    await page.click('#viewChartBtn');
    
    // 等待图表显示
    await page.waitForSelector('#step-5', { state: 'visible' });
    await page.waitForTimeout(2000); // 等待图表初始化
}

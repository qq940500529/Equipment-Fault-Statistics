/**
 * 帕累托图生成器模块
 * Pareto Chart Generator Module
 * 
 * 实现分层级的帕累托图，支持钻取功能
 * Implements hierarchical Pareto charts with drill-down capability
 */

import { OPTIONAL_COLUMNS } from '../config/constants.js';

/**
 * 帕累托图生成器类
 */
export class ParetoChartGenerator {
    constructor(chartDomId) {
        this.chartDom = document.getElementById(chartDomId);
        this.chart = null;
        this.data = null;
        this.currentLevel = 0; // 0: 车间, 1: 设备, 2: 设备编号, 3: 失效类型
        this.currentMetric = 'waitTime'; // 当前显示的指标
        this.showTop20Only = false; // 是否只显示前20%
        this.navigationStack = []; // 导航栈，用于返回
        this.currentFilters = {}; // 当前的筛选条件
        this.onStateChange = null; // Callback for state changes (e.g., to update UI buttons)
        
        // 层级定义
        this.levels = [
            { name: '车间', field: '车间', title: '按车间分类' },
            { name: '设备', field: '设备', title: '按设备分类' },
            { name: '设备编号', field: '设备编号', title: '按设备编号分类' },
            { name: '失效类型', field: '失效类型', title: '按失效类型分类' }
        ];
        
        // 指标定义
        this.metrics = {
            waitTime: { name: '等待时间h', field: OPTIONAL_COLUMNS.waitTime },
            repairTime: { name: '维修时间h', field: OPTIONAL_COLUMNS.repairTime },
            faultTime: { name: '故障时间h', field: OPTIONAL_COLUMNS.faultTime }
        };
        
        this.initChart();
    }
    
    /**
     * 初始化图表
     */
    initChart() {
        if (!this.chartDom) {
            console.error('Chart container not found');
            return;
        }
        
        // 使用全局的 echarts
        if (typeof echarts === 'undefined') {
            console.error('ECharts library not loaded');
            return;
        }
        
        this.chart = echarts.init(this.chartDom);
        
        // 添加点击事件处理 - 柱状图点击钻取
        this.chart.on('click', (params) => {
            this.handleChartClick(params);
        });
        
        // 添加标题点击事件处理 - 面包屑导航
        this.chart.getZr().on('click', (params) => {
            const pointInPixel = [params.offsetX, params.offsetY];
            if (this.chart.containPixel('title', pointInPixel)) {
                this.handleBreadcrumbClick(params);
            }
        });
    }
    
    /**
     * 设置数据
     * @param {Array} data - 处理后的数据数组
     */
    setData(data) {
        this.data = data;
        this.currentLevel = 0;
        this.currentFilters = {};
        this.navigationStack = [];
        this.renderChart();
    }
    
    /**
     * 切换指标
     * @param {string} metric - 指标名称 (waitTime, repairTime, faultTime)
     */
    switchMetric(metric) {
        if (this.metrics[metric]) {
            this.currentMetric = metric;
            this.renderChart();
        }
    }
    
    /**
     * 切换显示模式（全部/仅前20%）
     */
    toggleTop20() {
        this.showTop20Only = !this.showTop20Only;
        this.renderChart();
    }
    
    /**
     * 返回上一级
     */
    goBack() {
        if (this.navigationStack.length > 0) {
            const previousState = this.navigationStack.pop();
            this.currentLevel = previousState.level;
            this.currentFilters = previousState.filters;
            this.renderChart();
            
            // Notify state change
            if (this.onStateChange) {
                this.onStateChange();
            }
        }
    }
    
    /**
     * 处理图表点击事件
     */
    handleChartClick(params) {
        // 只处理柱状图的点击，忽略折线图
        if (params.componentType !== 'series' || params.seriesType !== 'bar') {
            return;
        }
        
        // 如果已经到最后一级，不再钻取
        if (this.currentLevel >= this.levels.length - 1) {
            return;
        }
        
        // 确保有有效的点击数据
        if (!params.name || params.name.trim() === '') {
            console.warn('无效的点击数据:', params);
            return;
        }
        
        // 保存当前状态到导航栈
        this.navigationStack.push({
            level: this.currentLevel,
            filters: { ...this.currentFilters },
            value: params.name
        });
        
        // 添加新的筛选条件
        const currentField = this.levels[this.currentLevel].field;
        this.currentFilters[currentField] = params.name;
        
        console.log(`钻取: 从层级${this.currentLevel}到${this.currentLevel + 1}`);
        console.log(`添加筛选: ${currentField} = ${params.name}`);
        console.log('当前所有筛选:', this.currentFilters);
        
        // 进入下一级
        this.currentLevel++;
        
        // 重新渲染图表
        this.renderChart();
        
        // Notify state change
        if (this.onStateChange) {
            this.onStateChange();
        }
    }
    
    /**
     * 处理面包屑点击 - 跳转到指定层级
     * Navigates to clicked breadcrumb level by analyzing click position
     */
    handleBreadcrumbClick(params) {
        // 如果在顶层，不处理
        if (this.currentLevel === 0) {
            return;
        }
        
        // 尝试通过点击位置估算点击了哪一级
        // 由于ECharts没有提供精确的文字级别点击检测，
        // 我们采用简化策略：点击面包屑区域时返回上一级
        // 如果需要更精确的控制，建议在UI中使用独立的面包屑导航组件
        
        // 获取标题宽度和点击位置
        const option = this.chart.getOption();
        const breadcrumbData = this.getBreadcrumbRich();
        
        // 简化实现：点击面包屑副标题区域时，返回上一级
        // 连续点击可以逐级返回到顶层
        this.goBack();
    }
    
    /**
     * 聚合数据
     * @param {Array} data - 原始数据
     * @param {string} groupField - 分组字段
     * @param {string} valueField - 值字段
     * @returns {Array} 聚合后的数据
     */
    aggregateData(data, groupField, valueField) {
        const groups = {};
        
        // 按groupField分组并求和
        data.forEach(row => {
            const key = row[groupField] || '未知';
            const value = parseFloat(row[valueField]) || 0;
            
            if (!groups[key]) {
                groups[key] = 0;
            }
            groups[key] += value;
        });
        
        // 转换为数组并排序（降序）
        const result = Object.entries(groups).map(([name, value]) => ({
            name,
            value
        })).sort((a, b) => b.value - a.value);
        
        return result;
    }
    
    /**
     * 计算帕累托数据（包含累计百分比）
     * @param {Array} aggregatedData - 聚合后的数据
     * @returns {Object} 包含图表数据的对象
     */
    calculateParetoData(aggregatedData) {
        // 计算总和
        const total = aggregatedData.reduce((sum, item) => sum + item.value, 0);
        
        // 计算累计百分比
        let cumulative = 0;
        const paretoData = aggregatedData.map((item, index) => {
            cumulative += item.value;
            const percentage = (item.value / total * 100).toFixed(2);
            const cumulativePercentage = (cumulative / total * 100).toFixed(2);
            
            return {
                name: item.name,
                value: item.value,
                percentage: parseFloat(percentage),
                cumulativePercentage: parseFloat(cumulativePercentage),
                index
            };
        });
        
        // 找到累计百分比达到80%的位置（帕累托原则：20%的项目产生80%的结果）
        // 这些是"关键少数"（vital few），应该被优先关注
        const cutoffIndex = paretoData.findIndex(item => item.cumulativePercentage >= 80);
        const top20Index = cutoffIndex >= 0 ? cutoffIndex : paretoData.length - 1;
        
        return {
            data: paretoData,
            total,
            top20Index
        };
    }
    
    /**
     * 渲染图表
     */
    renderChart() {
        if (!this.chart || !this.data) {
            return;
        }
        
        console.log(`=== 渲染图表 ===`);
        console.log(`层级: ${this.currentLevel} (${this.levels[this.currentLevel].name})`);
        console.log(`筛选条件:`, this.currentFilters);
        
        // 应用筛选条件
        let filteredData = [...this.data]; // Create a copy to avoid mutation
        Object.entries(this.currentFilters).forEach(([field, value]) => {
            const beforeCount = filteredData.length;
            filteredData = filteredData.filter(row => {
                const rowValue = row[field];
                // Handle different value types and ensure exact match
                return rowValue !== null && rowValue !== undefined && String(rowValue).trim() === String(value).trim();
            });
            console.log(`筛选 ${field}='${value}': ${beforeCount} -> ${filteredData.length} 行`);
        });
        
        // 获取当前层级和指标信息
        const currentLevelInfo = this.levels[this.currentLevel];
        const currentMetricInfo = this.metrics[this.currentMetric];
        
        console.log(`分组字段: ${currentLevelInfo.field}`);
        console.log(`值字段: ${currentMetricInfo.field}`);
        
        // 聚合数据
        const aggregatedData = this.aggregateData(
            filteredData,
            currentLevelInfo.field,
            currentMetricInfo.field
        );
        
        console.log(`聚合后组数: ${aggregatedData.length}`);
        if (aggregatedData.length <= 5) {
            console.log('聚合数据:', aggregatedData);
        } else {
            console.log('聚合数据(前5):', aggregatedData.slice(0, 5));
        }
        
        // 计算帕累托数据
        const paretoResult = this.calculateParetoData(aggregatedData);
        
        // 根据显示模式过滤数据
        let displayData = paretoResult.data;
        if (this.showTop20Only) {
            displayData = paretoResult.data.slice(0, paretoResult.top20Index + 1);
        }
        
        console.log(`显示数据组数: ${displayData.length}`);
        console.log(`=================\n`);
        
        // 准备图表配置
        const option = this.buildChartOption(displayData, paretoResult, currentLevelInfo, currentMetricInfo);
        
        // 渲染图表（带动画）
        this.chart.setOption(option, true);
        
        // FIX #1: 渲染后立即调整图表大小，确保宽度正确
        // This fixes the issue where chart width is insufficient on initial display
        // 使用requestAnimationFrame确保在浏览器下一次重绘前调整大小
        requestAnimationFrame(() => {
            if (this.chart) {
                this.chart.resize();
            }
        });
        // 双重保险：再延迟一次确保容器完全渲染
        setTimeout(() => {
            if (this.chart) {
                this.chart.resize();
            }
        }, 150);
    }
    
    /**
     * 构建图表配置
     */
    buildChartOption(displayData, paretoResult, levelInfo, metricInfo) {
        const names = displayData.map(item => item.name);
        const values = displayData.map(item => item.value);
        const percentages = displayData.map(item => item.percentage);
        const cumulativePercentages = displayData.map(item => item.cumulativePercentage);
        
        // 确定颜色：前20%用一种颜色，后80%用另一种颜色
        const colors = displayData.map(item => {
            return item.index <= paretoResult.top20Index ? '#5470c6' : '#91cc75';
        });
        
        // 构建面包屑导航文本（使用rich text支持点击样式）
        const breadcrumb = this.getBreadcrumbRich();
        
        return {
            title: {
                text: `${levelInfo.title} - ${metricInfo.name}`,
                subtext: breadcrumb.text,
                left: 'center',
                top: 5,
                textStyle: {
                    fontSize: 14
                },
                subtextStyle: {
                    fontSize: 11,
                    color: this.currentLevel > 0 ? '#1890ff' : '#666',
                    lineHeight: 18,
                    rich: breadcrumb.rich,
                    // Show pointer cursor when clickable
                    textBorderColor: 'transparent',
                    textBorderWidth: 0
                },
                // Enable clicking on subtitle for breadcrumb navigation
                triggerEvent: true
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow'
                },
                formatter: (params) => {
                    const dataIndex = params[0].dataIndex;
                    const item = displayData[dataIndex];
                    return `${item.name}<br/>` +
                           `${metricInfo.name}: ${item.value.toFixed(2)}<br/>` +
                           `占比: ${item.percentage}%<br/>` +
                           `累计: ${item.cumulativePercentage}%`;
                }
            },
            legend: {
                data: [metricInfo.name + ' (累计贡献≤80%为关键项)', '累计百分比曲线'],
                top: 50,
                left: 'center',
                textStyle: {
                    fontSize: 11
                }
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '22%',
                top: '85px',
                containLabel: true
            },
            xAxis: [
                {
                    type: 'category',
                    data: names,
                    axisLabel: {
                        interval: 0,
                        rotate: 45,
                        fontSize: 11,
                        margin: 10
                    }
                }
            ],
            yAxis: [
                {
                    type: 'value',
                    name: metricInfo.name,
                    position: 'left'
                },
                {
                    type: 'value',
                    name: '累计百分比(%)',
                    position: 'right',
                    max: 100
                }
            ],
            series: [
                {
                    name: metricInfo.name,
                    type: 'bar',
                    data: values,
                    itemStyle: {
                        color: (params) => colors[params.dataIndex]
                    },
                    label: {
                        show: true,
                        position: 'top',
                        formatter: (params) => {
                            const item = displayData[params.dataIndex];
                            // 只显示值，不显示百分比，避免文字过多
                            return `${item.value.toFixed(1)}`;
                        },
                        fontSize: 10,
                        color: '#333',
                        offset: [0, -5]
                    },
                    emphasis: {
                        itemStyle: {
                            shadowBlur: 10,
                            shadowColor: 'rgba(0,0,0,0.5)'
                        }
                    }
                },
                {
                    name: '累计百分比',
                    type: 'line',
                    yAxisIndex: 1,
                    data: cumulativePercentages,
                    smooth: true,
                    symbol: 'circle',
                    symbolSize: 6,
                    lineStyle: {
                        color: '#ee6666',
                        width: 2
                    },
                    itemStyle: {
                        color: '#ee6666'
                    },
                    label: {
                        show: true,
                        position: 'top',
                        formatter: '{c}%',
                        fontSize: 9,
                        color: '#ee6666',
                        offset: [0, -18]
                    }
                }
            ],
            animationDuration: 1000,
            animationEasing: 'cubicOut'
        };
    }
    
    /**
     * 获取面包屑导航文本
     */
    getBreadcrumb() {
        const parts = ['全部'];
        Object.entries(this.currentFilters).forEach(([field, value]) => {
            parts.push(value);
        });
        return parts.join(' > ');
    }
    
    /**
     * 获取带样式的面包屑导航（支持点击）
     */
    getBreadcrumbRich() {
        const parts = [];
        
        // 添加"全部"（顶层）
        parts.push({ name: '全部', level: 0, targetLevel: 0 });
        
        // 根据导航栈构建面包屑路径
        this.navigationStack.forEach((item, index) => {
            parts.push({ name: item.value, level: index + 1, targetLevel: index + 1 });
        });
        
        // 构建rich text配置
        const rich = {};
        const textParts = [];
        
        parts.forEach((part, index) => {
            const styleName = `level${index}`;
            const isCurrentLevel = part.level === this.currentLevel;
            const isClickable = !isCurrentLevel && part.level < this.currentLevel;
            
            rich[styleName] = {
                color: isClickable ? '#1890ff' : (isCurrentLevel ? '#666' : '#999'),
                textDecoration: isClickable ? 'underline' : 'none',
                fontWeight: isCurrentLevel ? 'bold' : 'normal',
                cursor: isClickable ? 'pointer' : 'default'
            };
            
            textParts.push(`{${styleName}|${part.name}}`);
            
            if (index < parts.length - 1) {
                textParts.push(' > ');
            }
        });
        
        return {
            text: textParts.join(''),
            rich: rich,
            levels: parts
        };
    }
    
    /**
     * 重置图表到初始状态
     */
    reset() {
        this.currentLevel = 0;
        this.currentFilters = {};
        this.navigationStack = [];
        this.showTop20Only = false;
        this.renderChart();
        
        // Notify state change
        if (this.onStateChange) {
            this.onStateChange();
        }
    }
    
    /**
     * 销毁图表
     */
    dispose() {
        if (this.chart) {
            this.chart.dispose();
            this.chart = null;
        }
    }
    
    /**
     * 调整图表大小
     */
    resize() {
        if (this.chart) {
            this.chart.resize();
        }
    }
}

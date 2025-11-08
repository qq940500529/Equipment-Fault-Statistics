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
        
        // 层级定义
        this.levels = [
            { name: '车间', field: '车间', title: '按车间分类' },
            { name: '设备', field: '设备名称', title: '按设备分类' },
            { name: '设备编号', field: '设备编号', title: '按设备编号分类' },
            { name: '失效类型', field: '故障类型', title: '按失效类型分类' }
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
        
        // 添加点击事件处理
        this.chart.on('click', (params) => {
            this.handleChartClick(params);
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
        }
    }
    
    /**
     * 处理图表点击事件
     */
    handleChartClick(params) {
        // 如果已经到最后一级，不再钻取
        if (this.currentLevel >= this.levels.length - 1) {
            return;
        }
        
        // 保存当前状态到导航栈
        this.navigationStack.push({
            level: this.currentLevel,
            filters: { ...this.currentFilters }
        });
        
        // 添加新的筛选条件
        const currentField = this.levels[this.currentLevel].field;
        this.currentFilters[currentField] = params.name;
        
        // 进入下一级
        this.currentLevel++;
        
        // 重新渲染图表
        this.renderChart();
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
        
        // 找到累计百分比达到80%的位置（即前20%的项）
        const cutoffIndex = paretoData.findIndex(item => item.cumulativePercentage >= 20);
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
        
        // 应用筛选条件
        let filteredData = this.data;
        Object.entries(this.currentFilters).forEach(([field, value]) => {
            filteredData = filteredData.filter(row => row[field] === value);
        });
        
        // 获取当前层级和指标信息
        const currentLevelInfo = this.levels[this.currentLevel];
        const currentMetricInfo = this.metrics[this.currentMetric];
        
        // 聚合数据
        const aggregatedData = this.aggregateData(
            filteredData,
            currentLevelInfo.field,
            currentMetricInfo.field
        );
        
        // 计算帕累托数据
        const paretoResult = this.calculateParetoData(aggregatedData);
        
        // 根据显示模式过滤数据
        let displayData = paretoResult.data;
        if (this.showTop20Only) {
            displayData = paretoResult.data.slice(0, paretoResult.top20Index + 1);
        }
        
        // 准备图表配置
        const option = this.buildChartOption(displayData, paretoResult, currentLevelInfo, currentMetricInfo);
        
        // 渲染图表（带动画）
        this.chart.setOption(option, true);
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
        
        // 构建面包屑导航文本
        const breadcrumb = this.getBreadcrumb();
        
        return {
            title: {
                text: `${levelInfo.title} - ${metricInfo.name}`,
                subtext: breadcrumb,
                left: 'center'
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
                data: [metricInfo.name, '累计百分比'],
                top: 40
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '15%',
                containLabel: true
            },
            xAxis: [
                {
                    type: 'category',
                    data: names,
                    axisLabel: {
                        interval: 0,
                        rotate: 45
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
                            return `${item.value.toFixed(2)}\n(${item.percentage}%)`;
                        }
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
                    symbolSize: 8,
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
                        formatter: '{c}%'
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
     * 重置图表到初始状态
     */
    reset() {
        this.currentLevel = 0;
        this.currentFilters = {};
        this.navigationStack = [];
        this.showTop20Only = false;
        this.renderChart();
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

/**
 * 员工工作量报表生成器模块
 * Staff Workload Report Generator Module
 * 
 * 生成维修人员的工作任务统计报表和条形图
 * Generates work task statistics report and bar chart for maintenance staff
 */

import { OPTIONAL_COLUMNS } from '../config/constants.js';

/**
 * 员工工作量报表生成器类
 */
export class StaffWorkloadReportGenerator {
    constructor(chartDomId) {
        this.chartDom = document.getElementById(chartDomId);
        this.chart = null;
        this.data = null;
        this.reportData = null;
        
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
    }
    
    /**
     * 设置数据并生成报表
     * @param {Array} data - 处理后的数据数组
     */
    setData(data) {
        this.data = data;
        this.reportData = this.generateReportData(data);
        this.renderChart();
    }
    
    /**
     * 生成报表数据
     * 按维修人统计各项工作任务的工时
     * @param {Array} data - 原始数据
     * @returns {Array} 报表数据
     */
    generateReportData(data) {
        const staffMap = {};
        
        // 遍历数据，按维修人分组
        data.forEach(row => {
            const repairPerson = row['维修人'] || '未知';
            const repairPersonType = row[OPTIONAL_COLUMNS.repairPersonType] || '未知';
            const deviceNumber = row['设备编号'] || '';
            const deviceName = row['设备'] || '设备维修';
            const repairTime = parseFloat(row[OPTIONAL_COLUMNS.repairTime]) || 0;
            
            // 初始化维修人数据
            if (!staffMap[repairPerson]) {
                staffMap[repairPerson] = {
                    name: repairPerson,
                    type: repairPersonType,
                    totalHours: 0,
                    tasks: {}
                };
            }
            
            // 确定任务类型
            let taskName;
            if (String(deviceNumber).trim().startsWith('TJA')) {
                // 虚拟设备，使用设备名称作为任务名
                taskName = deviceName;
            } else {
                // 实际设备，统一归类为"设备维修"
                taskName = '设备维修';
            }
            
            // 累加工时
            if (!staffMap[repairPerson].tasks[taskName]) {
                staffMap[repairPerson].tasks[taskName] = 0;
            }
            staffMap[repairPerson].tasks[taskName] += repairTime;
            staffMap[repairPerson].totalHours += repairTime;
        });
        
        // 转换为数组格式并排序
        const staffArray = Object.values(staffMap).map(staff => {
            // 转换任务对象为数组并按工时降序排序
            const tasksArray = Object.entries(staff.tasks)
                .map(([name, hours]) => ({
                    name,
                    hours: parseFloat(hours.toFixed(2)),
                    percentage: (hours / staff.totalHours * 100).toFixed(2)
                }))
                .sort((a, b) => b.hours - a.hours);
            
            return {
                name: staff.name,
                type: staff.type,
                totalHours: parseFloat(staff.totalHours.toFixed(2)),
                tasks: tasksArray
            };
        });
        
        // 按总工时降序排序
        staffArray.sort((a, b) => b.totalHours - a.totalHours);
        
        console.log('员工工作量报表数据:', staffArray);
        return staffArray;
    }
    
    /**
     * 获取报表数据（供导出使用）
     * @returns {Array} 报表数据
     */
    getReportData() {
        return this.reportData;
    }
    
    /**
     * 将报表数据转换为表格数据格式
     * @returns {Array} 表格数据
     */
    getTableData() {
        if (!this.reportData) {
            return [];
        }
        
        const tableData = [];
        
        this.reportData.forEach(staff => {
            staff.tasks.forEach((task, index) => {
                tableData.push({
                    '维修人': index === 0 ? staff.name : '',
                    '维修人分类': index === 0 ? staff.type : '',
                    '总工时': index === 0 ? staff.totalHours : '',
                    '工作任务': task.name,
                    '任务工时': task.hours,
                    '占比(%)': task.percentage
                });
            });
        });
        
        return tableData;
    }
    
    /**
     * 渲染图表
     */
    renderChart() {
        if (!this.chart || !this.reportData || this.reportData.length === 0) {
            console.warn('无法渲染图表：图表未初始化或无数据');
            return;
        }
        
        console.log('=== 渲染员工工作量条形图 ===');
        
        // 准备图表数据
        const staffNames = [];
        const seriesData = {}; // 任务名 -> 各员工的工时数组
        const allTaskNames = new Set();
        
        // 收集所有任务类型
        this.reportData.forEach(staff => {
            staff.tasks.forEach(task => {
                allTaskNames.add(task.name);
            });
        });
        
        // 初始化系列数据
        allTaskNames.forEach(taskName => {
            seriesData[taskName] = [];
        });
        
        // 按总工时降序遍历员工
        this.reportData.forEach(staff => {
            staffNames.push(staff.name);
            
            // 创建任务工时映射
            const taskHoursMap = {};
            staff.tasks.forEach(task => {
                taskHoursMap[task.name] = task.hours;
            });
            
            // 为每个任务类型添加数据
            allTaskNames.forEach(taskName => {
                seriesData[taskName].push(taskHoursMap[taskName] || 0);
            });
        });
        
        // 构建系列配置
        const series = [];
        const colors = ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc'];
        let colorIndex = 0;
        
        // 为每个任务类型创建一个系列
        Array.from(allTaskNames).forEach(taskName => {
            series.push({
                name: taskName,
                type: 'bar',
                stack: 'total',
                label: {
                    show: false
                },
                emphasis: {
                    focus: 'series'
                },
                data: seriesData[taskName],
                itemStyle: {
                    color: colors[colorIndex % colors.length]
                }
            });
            colorIndex++;
        });
        
        // 图表配置
        const option = {
            title: {
                text: '维修人员工作任务统计',
                subtext: '按总工时降序排序，堆叠显示各任务占比',
                left: 'center',
                top: 5,
                textStyle: {
                    fontSize: 16
                },
                subtextStyle: {
                    fontSize: 12
                }
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow'
                },
                formatter: (params) => {
                    const staffIndex = params[0].dataIndex;
                    const staff = this.reportData[staffIndex];
                    
                    let result = `<strong>${staff.name}</strong> (${staff.type})<br/>`;
                    result += `总工时: ${staff.totalHours}h<br/><br/>`;
                    
                    // 按占比降序显示任务
                    staff.tasks.forEach(task => {
                        result += `${task.name}: ${task.hours}h (${task.percentage}%)<br/>`;
                    });
                    
                    return result;
                }
            },
            legend: {
                data: Array.from(allTaskNames),
                top: 50,
                left: 'center',
                textStyle: {
                    fontSize: 11
                }
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '15%',
                top: '100px',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                data: staffNames,
                axisLabel: {
                    interval: 0,
                    rotate: 45,
                    fontSize: 11,
                    margin: 10
                }
            },
            yAxis: {
                type: 'value',
                name: '工时 (小时)',
                nameTextStyle: {
                    fontSize: 12
                },
                axisLabel: {
                    fontSize: 11
                }
            },
            series: series
        };
        
        // 渲染图表
        this.chart.setOption(option, true);
        
        // Adjust chart size after rendering to ensure proper display
        // Using requestAnimationFrame ensures resize happens after the next browser repaint
        requestAnimationFrame(() => {
            if (this.chart) {
                this.chart.resize();
            }
        });
        
        console.log('员工工作量条形图渲染完成');
    }
    
    /**
     * 调整图表大小
     */
    resize() {
        if (this.chart) {
            this.chart.resize();
        }
    }
    
    /**
     * 重置图表
     */
    reset() {
        this.data = null;
        this.reportData = null;
        if (this.chart) {
            this.chart.clear();
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
}

# 帕累托图报表功能文档
# Pareto Chart Report Documentation

## 功能概述 (Overview)

本模块实现了一个交互式的帕累托图报表系统，支持多层级钻取分析。用户可以通过点击图表逐级深入分析数据，从车间级别一直钻取到具体的失效类型。

This module implements an interactive Pareto chart reporting system with multi-level drill-down capability. Users can analyze data hierarchically by clicking through the chart, from workshop level down to specific failure types.

## 核心功能 (Core Features)

### 1. 分层级钻取 (Hierarchical Drill-down)

系统支持4个层级的数据分析：
The system supports 4 levels of data analysis:

1. **车间** (Workshop) - 顶层视图
2. **设备** (Equipment) - 点击车间后进入
3. **设备编号** (Equipment Number) - 点击设备后进入
4. **失效类型** (Failure Type) - 点击设备编号后进入

### 2. 三种分析指标 (Three Analysis Metrics)

- **等待时间h** (Wait Time in hours) - 从报修到开始维修的时间
- **维修时间h** (Repair Time in hours) - 实际维修所需时间
- **故障时间h** (Fault Time in hours) - 总故障时间（等待+维修）

### 3. 帕累托分析 (Pareto Analysis)

- **20/80规则可视化**: 前20%的关键项用蓝色显示，后80%用绿色显示
- **累计百分比曲线**: 红色折线显示累计百分比，帮助识别关键项
- **筛选功能**: 一键切换显示全部数据或仅显示前20%关键项

### 4. 交互功能 (Interactive Features)

- **点击钻取**: 点击柱状图进入下一级分析
- **返回导航**: 返回按钮支持逐级返回
- **重置功能**: 一键重置到初始状态
- **指标切换**: 快速切换不同分析指标
- **动画过渡**: 平滑的图表切换动画（1000ms）

## 使用方法 (Usage)

### 步骤1: 上传并处理数据
1. 上传Excel文件
2. 点击"开始处理数据"按钮
3. 等待数据处理完成

### 步骤2: 查看帕累托图
1. 在处理结果页面，点击"查看帕累托图"按钮
2. 系统将显示按车间分类的初始图表

### 步骤3: 交互分析
1. **选择指标**: 点击顶部的指标按钮（等待时间h/维修时间h/故障时间h）
2. **钻取分析**: 点击任意柱状图进入下一级
3. **查看关键项**: 点击"仅显示前20%"按钮筛选关键项
4. **返回上级**: 使用"返回"按钮逐级返回
5. **重置**: 点击"重置"按钮返回初始状态

## 技术实现 (Technical Implementation)

### 类结构 (Class Structure)

```javascript
class ParetoChartGenerator {
    constructor(chartDomId)     // 初始化图表
    setData(data)               // 设置数据
    switchMetric(metric)        // 切换指标
    toggleTop20()               // 切换显示模式
    goBack()                    // 返回上一级
    reset()                     // 重置图表
    dispose()                   // 销毁图表
    resize()                    // 调整大小
}
```

### 数据聚合 (Data Aggregation)

系统使用以下算法聚合数据：

1. **分组求和**: 按当前层级字段分组，计算指标总和
2. **降序排序**: 按值从大到小排序
3. **计算百分比**: 计算每项占总和的百分比
4. **累计百分比**: 计算累计百分比用于帕累托分析
5. **识别20%分界点**: 找到累计百分比达到20%的位置

### 图表配置 (Chart Configuration)

```javascript
{
    // 双Y轴配置
    yAxis: [
        { type: 'value', name: '指标值', position: 'left' },
        { type: 'value', name: '累计百分比(%)', position: 'right', max: 100 }
    ],
    
    // 柱状图 + 折线图组合
    series: [
        { type: 'bar', ... },      // 柱状图显示值
        { type: 'line', ... }      // 折线图显示累计百分比
    ],
    
    // 动画配置
    animationDuration: 1000,
    animationEasing: 'cubicOut'
}
```

### 颜色方案 (Color Scheme)

- **前20% (关键项)**: `#5470c6` (蓝色)
- **后80% (次要项)**: `#91cc75` (绿色)
- **累计曲线**: `#ee6666` (红色)

## 响应式设计 (Responsive Design)

系统针对不同设备进行了优化：

### 桌面端 (Desktop)
- 图表高度: 600px
- 完整控制面板布局
- X轴标签旋转45度

### 移动端 (Mobile)
- 图表高度: 400px
- 垂直堆叠的控制面板
- 全宽度按钮

## 测试覆盖 (Test Coverage)

### 单元测试 (Unit Tests) - 21个测试
- 构造函数和初始化
- 数据聚合逻辑
- 帕累托计算
- 导航功能
- 面包屑生成
- 图表点击处理

### 集成测试 (Integration Tests) - 10个测试
- 完整工作流
- 钻取导航
- 指标切换
- 数据过滤和聚合
- 帕累托分析
- 边界情况
- 状态重置

## 性能考虑 (Performance Considerations)

1. **数据缓存**: 原始数据在设置后缓存，避免重复处理
2. **按需计算**: 只在需要时进行数据聚合和计算
3. **动画优化**: 使用CSS3动画和ECharts内置动画
4. **内存管理**: 提供dispose方法清理资源

## 浏览器兼容性 (Browser Compatibility)

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## 依赖项 (Dependencies)

- **ECharts 6.0+**: 图表渲染库
- **Bootstrap 5**: UI框架
- **原生JavaScript (ES6+)**: 核心逻辑

## 示例代码 (Example Code)

```javascript
// 初始化图表
const chartGenerator = new ParetoChartGenerator('paretoChartContainer');

// 设置数据
chartGenerator.setData(processedData);

// 切换指标
chartGenerator.switchMetric('repairTime');

// 切换显示模式
chartGenerator.toggleTop20();

// 返回上一级
chartGenerator.goBack();

// 重置图表
chartGenerator.reset();

// 清理资源
chartGenerator.dispose();
```

## 常见问题 (FAQ)

### Q: 如何确定哪些是关键项？
A: 系统自动计算累计百分比，当累计百分比达到20%时的项目即为关键项（前20%）。

### Q: 可以自定义分界点吗？
A: 当前版本固定为20%分界点，符合经典的帕累托原则。

### Q: 图表支持导出吗？
A: 可以使用浏览器的截图功能，或ECharts的内置导出功能（需要添加工具栏）。

### Q: 数据更新后如何刷新图表？
A: 调用 `chartGenerator.setData(newData)` 即可刷新图表。

## 未来改进 (Future Enhancements)

1. **可配置分界点**: 允许用户自定义20/80的分界点
2. **导出功能**: 添加图表导出为图片的功能
3. **多指标对比**: 支持同时显示多个指标
4. **自定义层级**: 允许用户自定义钻取层级
5. **数据标签优化**: 智能调整标签位置避免重叠

## 维护者 (Maintainer)

设备故障统计系统开发团队
Equipment Fault Statistics System Development Team

## 许可证 (License)

MIT License

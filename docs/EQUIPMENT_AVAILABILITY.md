# 设备妥善率计算功能 (Equipment Availability Rate Calculation Feature)

## 功能概述 (Overview)

设备妥善率计算功能用于根据设备台账和故障信息，计算各车间和总体的设备妥善率。

The equipment availability rate calculation feature calculates the availability rate for each workshop and overall based on equipment ledger and fault information.

## 计算公式 (Formula)

```
妥善率 = (1 - (设备故障时间总和 / (总设备数量 × 月时间))) × 100%
Availability Rate = (1 - (Total Fault Time / (Total Equipment Count × Month Time))) × 100%
```

其中 (Where):
- 月时间 = 30天 × 24小时 = 720小时 (Month Time = 30 days × 24 hours = 720 hours)
- 设备故障时间 = 修理耗时 + 等待耗时 (Fault Time = Repair Time + Wait Time)

## 使用方法 (Usage)

### 1. 在浏览器中使用 (Browser Usage)

1. 打开应用程序 (Open the application)
2. 完成数据处理后，点击 "计算设备妥善率" 按钮 (After data processing, click "Calculate Equipment Availability Rate" button)
3. 上传设备台账文件 (例如: `设备台账.xlsx`) (Upload equipment ledger file, e.g., `设备台账.xlsx`)
4. 上传故障信息文件 (例如: `12月设备故障信息.xlsx`) (Upload fault information file, e.g., `12月设备故障信息.xlsx`)
5. 点击 "开始计算妥善率" 按钮 (Click "Start Calculating Availability Rate" button)
6. 查看结果和图表 (View results and charts)
7. 可选: 导出妥善率数据为Excel文件 (Optional: Export availability rate data as Excel file)

### 2. 在代码中使用 (Code Usage)

```javascript
import { EquipmentAvailabilityCalculator } from './js/modules/equipmentAvailabilityCalculator.js';

// 创建计算器实例 (Create calculator instance)
const calculator = new EquipmentAvailabilityCalculator();

// 生成报告 (Generate report)
const report = calculator.generateReport(equipmentData, faultData);

// 访问结果 (Access results)
console.log('总体妥善率:', report.overall.availabilityRate + '%');
console.log('车间妥善率:', report.workshops);
```

## 数据格式要求 (Data Format Requirements)

### 设备台账文件 (Equipment Ledger File)

必需列 (Required columns):
- **区域** (Area): 格式如 "TPM天津工厂-TPM七车间-组装区域"

示例 (Example):
```
| 设备名 | 区域 | 设备编号 | ... |
|--------|------|---------|-----|
| 设备A  | TPM天津工厂-TPM七车间-组装区域 | TJ-001 | ... |
```

### 故障信息文件 (Fault Information File)

必需列 (Required columns):
- **车间** (Workshop): 格式如 "TPM七车间-组装区域-设备类型"
- **修理耗时(秒)** (Repair Time in seconds)
- **等待耗时(秒)** (Wait Time in seconds)

示例 (Example):
```
| 车间 | 修理耗时(秒) | 等待耗时(秒) | ... |
|------|-------------|-------------|-----|
| TPM七车间-组装区域-设备A | 3600 | 1800 | ... |
```

## 测试 (Testing)

### 单元测试 (Unit Tests)

```bash
# 运行所有单元测试 (Run all unit tests)
npm test -- equipmentAvailabilityCalculator.test.js

# 查看测试覆盖率 (View test coverage)
npm test -- --coverage equipmentAvailabilityCalculator.test.js
```

### 手动测试 (Manual Testing)

使用真实数据进行测试 (Test with real data):

```bash
node tests/manual/testWithRealData.js
```

这将使用 `examples/` 目录下的示例文件进行测试，并输出详细的计算结果。
(This will test using example files in the `examples/` directory and output detailed calculation results.)

## 输出结果 (Output Results)

报告包含以下信息 (The report contains the following information):

### 1. 总体统计 (Overall Statistics)
- 设备总数 (Total Equipment Count)
- 故障时间总和 (Total Fault Time)
- 总体设备妥善率 (Overall Availability Rate)

### 2. 车间详情 (Workshop Details)
- 车间名称 (Workshop Name)
- 设备数量 (Equipment Count)
- 故障时间 (Fault Time in hours)
- 妥善率 (Availability Rate in %)

### 3. 可视化图表 (Visualization Chart)
- 按妥善率排序的条形图 (Bar chart sorted by availability rate)
- 颜色编码: 红色(<95%), 黄色(95%-99%), 蓝色(≥99%)
- (Color coded: Red(<95%), Yellow(95%-99%), Blue(≥99%))

## 示例输出 (Example Output)

```
=== 总体统计 ===
设备总数: 2385 台
故障时间总和: 22891.12 小时
总体设备妥善率: 98.67%

=== 车间妥善率 (前3名) ===
1. TPM七车间: 99.72%
2. TPM二车间: 99.76%
3. TPM三车间: 99.53%
```

## API 参考 (API Reference)

### EquipmentAvailabilityCalculator

#### 方法 (Methods)

- `extractEquipmentCount(equipmentData, areaColumnName)` - 从设备台账提取设备数量
- `aggregateFaultTime(faultData, workshopColumnName, repairTimeColumnName, waitTimeColumnName)` - 聚合故障时间
- `calculateWorkshopAvailability(workshop)` - 计算单个车间的妥善率
- `calculateAllWorkshopsAvailability()` - 计算所有车间的妥善率
- `calculateOverallAvailability()` - 计算总体妥善率
- `generateReport(equipmentData, faultData, options)` - 生成完整报告
- `reset()` - 重置计算器状态

详细文档请参考源代码注释。(For detailed documentation, refer to the source code comments.)

## 注意事项 (Notes)

1. 月时间固定为720小时（30天），不可更改 (Month time is fixed at 720 hours (30 days) and cannot be changed)
2. 妥善率自动限制在0%-100%范围内 (Availability rate is automatically capped between 0% and 100%)
3. 如果车间在设备台账中没有设备但有故障记录，妥善率为0% (If a workshop has no equipment in the ledger but has fault records, availability rate is 0%)
4. 车间名称提取逻辑: 优先匹配包含"TPM"和"车间"的部分 (Workshop name extraction logic: prioritizes parts containing "TPM" and "车间")

## 贡献 (Contributing)

欢迎提交问题和改进建议！(Welcome to submit issues and improvement suggestions!)

## 许可证 (License)

MIT License - 与主项目保持一致 (Same as the main project)

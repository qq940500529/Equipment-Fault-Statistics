# API文档

本文档提供系统各个模块和函数的详细API参考。

## 模块概览

| 模块 | 文件 | 说明 |
|------|------|------|
| FileUploader | `js/modules/fileUploader.js` | 文件上传和验证 |
| DataParser | `js/modules/dataParser.js` | Excel数据解析 |
| DataValidator | `js/modules/dataValidator.js` | 数据验证 |
| DataTransformer | `js/modules/dataTransformer.js` | 数据转换 |
| DataExporter | `js/modules/dataExporter.js` | 数据导出 |
| ChartGenerator | `js/modules/chartGenerator.js` | 图表生成 |
| dateUtils | `js/utils/dateUtils.js` | 日期工具 |
| helpers | `js/utils/helpers.js` | 辅助函数 |
| constants | `js/config/constants.js` | 常量定义 |

## FileUploader 模块

### uploadFile(file)

上传并验证Excel文件。

**参数**:
- `file` (File): 用户选择的文件对象

**返回值**:
- `Promise<ArrayBuffer>`: 文件内容

**异常**:
- 文件类型不支持
- 文件大小超过限制
- 文件读取失败

**示例**:
```javascript
import FileUploader from './modules/fileUploader.js';

const fileInput = document.getElementById('fileInput');
fileInput.addEventListener('change', async (e) => {
  try {
    const file = e.target.files[0];
    const data = await FileUploader.uploadFile(file);
    console.log('文件读取成功', data);
  } catch (error) {
    console.error('文件上传失败', error);
  }
});
```

### validateFile(file)

验证文件类型和大小。

**参数**:
- `file` (File): 文件对象

**返回值**:
- `boolean`: 验证是否通过

**示例**:
```javascript
const isValid = FileUploader.validateFile(file);
if (!isValid) {
  console.error('文件验证失败');
}
```

## DataParser 模块

### parseExcelFile(data)

解析Excel文件数据。

**参数**:
- `data` (ArrayBuffer): Excel文件内容

**返回值**:
- `Promise<Object>`: 解析结果
  ```javascript
  {
    data: Array,        // 数据数组
    columns: Object,    // 列映射
    stats: Object       // 统计信息
  }
  ```

**示例**:
```javascript
import DataParser from './modules/dataParser.js';

const result = await DataParser.parseExcelFile(fileData);
console.log('行数:', result.stats.totalRows);
console.log('数据:', result.data);
```

### extractHeaders(worksheet)

提取Excel工作表的表头。

**参数**:
- `worksheet` (Object): SheetJS工作表对象

**返回值**:
- `Array<string>`: 表头数组

### mapColumns(headers)

映射列名到标准字段名。

**参数**:
- `headers` (Array<string>): 表头数组

**返回值**:
- `Object`: 列映射对象

**示例**:
```javascript
const headers = ['工单号', '车间', '维修人'];
const mapping = DataParser.mapColumns(headers);
// { workOrder: 0, workshop: 1, repairPerson: 2 }
```

## DataValidator 模块

### validate(data, columnMapping)

验证数据完整性和正确性。

**参数**:
- `data` (Array): 数据数组
- `columnMapping` (Object): 列映射对象

**返回值**:
- `Object`: 验证结果
  ```javascript
  {
    valid: boolean,
    errors: Array,
    warnings: Array,
    summary: Object
  }
  ```

**示例**:
```javascript
import DataValidator from './modules/dataValidator.js';

const result = DataValidator.validate(data, columns);
if (!result.valid) {
  console.error('验证失败:', result.errors);
}
```

### validateRow(row, index)

验证单行数据。

**参数**:
- `row` (Object): 数据行
- `index` (number): 行号

**返回值**:
- `Object`: 验证结果
  ```javascript
  {
    valid: boolean,
    errors: Array,
    warnings: Array
  }
  ```

## DataTransformer 模块

### transform(data)

转换数据（复刻VBA功能）。

**参数**:
- `data` (Array): 原始数据数组

**返回值**:
- `Promise<Object>`: 转换结果
  ```javascript
  {
    data: Array,      // 处理后数据
    stats: Object     // 处理统计
  }
  ```

**示例**:
```javascript
import DataTransformer from './modules/dataTransformer.js';

const result = await DataTransformer.transform(rawData);
console.log('处理后行数:', result.data.length);
console.log('删除的合计行:', result.stats.deletedSubtotalRows);
```

### removeSubtotalRows(data)

删除"合计"行。

**参数**:
- `data` (Array): 数据数组

**返回值**:
- `Object`: `{ data: Array, count: number }`

### splitWorkshop(data)

车间列分列。

**参数**:
- `data` (Array): 数据数组

**返回值**:
- `Array`: 处理后的数据数组

### classifyRepairPerson(data)

维修人分类。

**参数**:
- `data` (Array): 数据数组

**返回值**:
- `Array`: 处理后的数据数组

### calculateTimes(data)

计算时间字段。

**参数**:
- `data` (Array): 数据数组

**返回值**:
- `Array`: 处理后的数据数组

### removeIncompleteRows(data)

删除时间不完整的行。

**参数**:
- `data` (Array): 数据数组

**返回值**:
- `Object`: `{ data: Array, count: number }`

## DataExporter 模块

### exportToExcel(data, filename)

导出为Excel文件。

**参数**:
- `data` (Array): 数据数组
- `filename` (string): 文件名（可选）

**返回值**:
- `void`

**示例**:
```javascript
import DataExporter from './modules/dataExporter.js';

DataExporter.exportToExcel(processedData, '整理后数据.xlsx');
```

### exportToCSV(data, filename)

导出为CSV文件。

**参数**:
- `data` (Array): 数据数组
- `filename` (string): 文件名（可选）

**返回值**:
- `void`

**示例**:
```javascript
DataExporter.exportToCSV(processedData, '整理后数据.csv');
```

### exportToJSON(data, filename)

导出为JSON文件。

**参数**:
- `data` (Array): 数据数组
- `filename` (string): 文件名（可选）

**返回值**:
- `void`

**示例**:
```javascript
DataExporter.exportToJSON(processedData, '整理后数据.json');
```

## ChartGenerator 模块

### generateTrendChart(data, container)

生成故障时间趋势图。

**参数**:
- `data` (Array): 处理后的数据数组
- `container` (HTMLElement): 图表容器元素

**返回值**:
- `Object`: ECharts实例

**示例**:
```javascript
import ChartGenerator from './modules/chartGenerator.js';

const chartContainer = document.getElementById('trendChart');
const chart = ChartGenerator.generateTrendChart(data, chartContainer);
```

### generateWorkshopChart(data, container)

生成车间故障统计图。

**参数**:
- `data` (Array): 处理后的数据数组
- `container` (HTMLElement): 图表容器元素

**返回值**:
- `Object`: ECharts实例

### generatePersonChart(data, container)

生成维修人员工作量统计图。

**参数**:
- `data` (Array): 处理后的数据数组
- `container` (HTMLElement): 图表容器元素

**返回值**:
- `Object`: ECharts实例

## dateUtils 工具

### isValidDate(date)

验证日期是否有效。

**参数**:
- `date` (any): 待验证的日期

**返回值**:
- `boolean`: 是否为有效日期

**示例**:
```javascript
import { isValidDate } from './utils/dateUtils.js';

console.log(isValidDate(new Date())); // true
console.log(isValidDate('invalid')); // false
```

### parseExcelDate(serial)

解析Excel日期序列号。

**参数**:
- `serial` (number): Excel日期序列号

**返回值**:
- `Date`: JavaScript Date对象

**示例**:
```javascript
import { parseExcelDate } from './utils/dateUtils.js';

const date = parseExcelDate(44927.5);
console.log(date); // 2023-01-01 12:00:00
```

### formatDate(date, format)

格式化日期。

**参数**:
- `date` (Date): 日期对象
- `format` (string): 格式字符串（可选，默认: 'YYYY-MM-DD HH:mm:ss'）

**返回值**:
- `string`: 格式化后的日期字符串

**示例**:
```javascript
import { formatDate } from './utils/dateUtils.js';

const str = formatDate(new Date(), 'YYYY-MM-DD');
console.log(str); // "2024-01-01"
```

### getHoursDifference(startDate, endDate)

计算两个日期之间的小时差。

**参数**:
- `startDate` (Date): 开始时间
- `endDate` (Date): 结束时间

**返回值**:
- `number`: 小时差（保留2位小数）

**示例**:
```javascript
import { getHoursDifference } from './utils/dateUtils.js';

const start = new Date('2024-01-01 08:00:00');
const end = new Date('2024-01-01 09:30:00');
const hours = getHoursDifference(start, end);
console.log(hours); // 1.50
```

## helpers 工具

### formatFileSize(bytes)

格式化文件大小。

**参数**:
- `bytes` (number): 字节数

**返回值**:
- `string`: 格式化后的大小（如 "1.23 MB"）

**示例**:
```javascript
import { formatFileSize } from './utils/helpers.js';

console.log(formatFileSize(1024)); // "1.00 KB"
console.log(formatFileSize(1048576)); // "1.00 MB"
```

### showMessage(message, type)

显示用户消息。

**参数**:
- `message` (string): 消息内容
- `type` (string): 消息类型（'success', 'error', 'warning', 'info'）

**返回值**:
- `void`

**示例**:
```javascript
import { showMessage } from './utils/helpers.js';

showMessage('处理成功！', 'success');
showMessage('文件格式错误', 'error');
```

### getElementById(id)

安全地获取DOM元素。

**参数**:
- `id` (string): 元素ID

**返回值**:
- `HTMLElement`: DOM元素

**异常**:
- 如果元素不存在，抛出错误

**示例**:
```javascript
import { getElementById } from './utils/helpers.js';

const element = getElementById('fileInput');
```

### debounce(func, wait)

防抖函数。

**参数**:
- `func` (Function): 要防抖的函数
- `wait` (number): 等待时间（毫秒）

**返回值**:
- `Function`: 防抖后的函数

**示例**:
```javascript
import { debounce } from './utils/helpers.js';

const handleSearch = debounce((value) => {
  console.log('搜索:', value);
}, 300);
```

### throttle(func, limit)

节流函数。

**参数**:
- `func` (Function): 要节流的函数
- `limit` (number): 时间限制（毫秒）

**返回值**:
- `Function`: 节流后的函数

**示例**:
```javascript
import { throttle } from './utils/helpers.js';

const handleScroll = throttle(() => {
  console.log('滚动事件');
}, 100);

window.addEventListener('scroll', handleScroll);
```

### downloadFile(blob, filename)

下载文件。

**参数**:
- `blob` (Blob): 文件内容
- `filename` (string): 文件名

**返回值**:
- `void`

**示例**:
```javascript
import { downloadFile } from './utils/helpers.js';

const blob = new Blob(['Hello, World!'], { type: 'text/plain' });
downloadFile(blob, 'hello.txt');
```

### escapeHtml(text)

转义HTML特殊字符（防XSS）。

**参数**:
- `text` (string): 原始文本

**返回值**:
- `string`: 转义后的文本

**示例**:
```javascript
import { escapeHtml } from './utils/helpers.js';

const safe = escapeHtml('<script>alert("xss")</script>');
console.log(safe); // "&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;"
```

## constants 常量

### COLUMN_NAMES

列名映射常量。

```javascript
import { COLUMN_NAMES } from './config/constants.js';

console.log(COLUMN_NAMES.workOrder);
// ['工单号', 'Work Order', 'WorkOrder', 'Order No']
```

### REPAIR_WORKERS

维修工名单（16人）。

```javascript
import { REPAIR_WORKERS } from './config/constants.js';

console.log(REPAIR_WORKERS.length); // 16
console.log(REPAIR_WORKERS.includes('张三')); // true/false
```

### ELECTRICIANS

电工名单（14人）。

```javascript
import { ELECTRICIANS } from './config/constants.js';

console.log(ELECTRICIANS.length); // 14
```

### MESSAGES

消息文本常量。

```javascript
import { MESSAGES } from './config/constants.js';

console.log(MESSAGES.FILE_TYPE_ERROR);
// "不支持的文件格式，请上传 .xlsx 或 .xls 文件"
```

### CONFIG

应用配置常量。

```javascript
import { CONFIG } from './config/constants.js';

console.log(CONFIG.MAX_FILE_SIZE); // 52428800 (50MB)
console.log(CONFIG.PREVIEW_ROWS); // 50
```

## 错误处理

所有模块都使用Promise和async/await进行异步操作，错误通过异常抛出。

**标准错误处理模式**:
```javascript
try {
  const result = await someAsyncOperation();
  // 处理结果
} catch (error) {
  console.error('操作失败:', error.message);
  showMessage(error.message, 'error');
}
```

## 事件系统

系统使用浏览器原生事件系统。

**示例**:
```javascript
// 文件上传事件
document.getElementById('fileInput').addEventListener('change', handleFileChange);

// 按钮点击事件
document.getElementById('processBtn').addEventListener('click', handleProcess);
```

## 相关文档

- [架构设计](架构设计) - 系统架构和模块设计
- [数据结构](数据结构) - 数据格式定义
- [开发指南](开发指南) - 开发流程和规范

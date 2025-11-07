# 技术规格说明书 (Technical Specification)

## 1. VBA功能分析与JavaScript实现映射

### 1.1 VBA核心功能清单

基于提供的VBA代码，系统需要实现以下核心功能：

#### 功能1: 工作表管理
- **VBA行为**: 
  - 读取"原始数据"工作表
  - 创建或清空"整理后数据"工作表
  - 复制数据到新表
- **JavaScript实现**:
  - 使用SheetJS读取上传的Excel文件
  - 在内存中创建处理后的数据集
  - 生成新的Excel文件供下载

#### 功能2: 列识别与索引
- **VBA行为**: 查找并记录各列的索引位置
- **必需列**:
  - 工单号
  - 车间
  - 维修人
  - 报修时间
  - 维修开始时间
  - 维修结束时间
- **可选列**:
  - 区域（如不存在则创建）
  - 维修人分类（如不存在则创建）
  - 等待时间h
  - 维修时间h
  - 故障时间h

#### 功能3: 数据清洗
- **删除"合计"行**: 
  - 检查"车间"列值是否为"合计"
  - 从后往前遍历删除
- **删除时间不完整行**:
  - 检查报修时间、维修开始时间、维修结束时间是否都存在
  - 验证是否为有效日期格式
  - 删除任何时间字段缺失或无效的行

#### 功能4: 车间列分列
- **VBA逻辑**:
  ```vba
  If workshopValue <> "" And InStr(workshopValue, "-") > 0 Then
      splitValues = Split(workshopValue, "-")
      车间 = Trim(splitValues(0))
      区域 = Trim(splitValues(1))
  End If
  ```
- **JavaScript实现**:
  ```javascript
  if (workshopValue && workshopValue.includes('-')) {
      const parts = workshopValue.split('-');
      workshop = parts[0].trim();
      area = parts[1] ? parts[1].trim() : '';
  }
  ```

#### 功能5: 维修人分类
- **分类规则**:
  - 维修工名单: "王兴森,孙长青,徐阴海,任扶民,吴长振,张玉柱,刘志强,杨明印,张金华,刘金财,崔树立,杨致敬,马圣强,刘子凯,何洪杰,刘佳文"
  - 电工名单: "李润海,赵艳伟,吴霄,吴忠建,李之彦,宋桂良,崔金辉,李瑞召,万庆权,郭瑞臣,郭兆勤,赵同宽,肖木凯,赵燕伟"
  - 未匹配: "未知"
- **实现方式**:
  ```javascript
  const repairWorkers = ['王兴森', '孙长青', ...];
  const electricians = ['李润海', '赵艳伟', ...];
  
  function classifyRepairPerson(name) {
      if (repairWorkers.includes(name.trim())) return '维修工';
      if (electricians.includes(name.trim())) return '电工';
      return '未知';
  }
  ```

#### 功能6: 时间计算
- **等待时间** = 维修开始时间 - 报修时间（小时）
- **维修时间** = 维修结束时间 - 维修开始时间（小时）
- **故障时间** = 等待时间 + 维修时间（小时）
- **精度**: 保留2位小数
- **VBA公式**:
  ```vba
  waitTime = (startTime - reportTime) * 24
  repairTime = (endTime - startTime) * 24
  faultTime = waitTime + repairTime
  ```

### 1.2 数据验证规则

#### 必需字段验证
```javascript
const requiredColumns = [
    '工单号',
    '车间',
    '维修人',
    '报修时间',
    '维修开始时间',
    '维修结束时间'
];
```

#### 数据类型验证
```javascript
const validationRules = {
    '工单号': (value) => value && value.toString().trim() !== '',
    '报修时间': (value) => isValidDate(value),
    '维修开始时间': (value) => isValidDate(value),
    '维修结束时间': (value) => isValidDate(value)
};
```

## 2. JavaScript模块详细设计

### 2.1 常量配置模块 (constants.js)

```javascript
// 必需的列名
export const REQUIRED_COLUMNS = {
    WORK_ORDER: '工单号',
    WORKSHOP: '车间',
    REPAIR_PERSON: '维修人',
    REPORT_TIME: '报修时间',
    START_TIME: '维修开始时间',
    END_TIME: '维修结束时间'
};

// 可选的列名
export const OPTIONAL_COLUMNS = {
    AREA: '区域',
    REPAIR_PERSON_TYPE: '维修人分类',
    WAIT_TIME: '等待时间h',
    REPAIR_TIME: '维修时间h',
    FAULT_TIME: '故障时间h'
};

// 维修人员分类
export const REPAIR_WORKERS = [
    '王兴森', '孙长青', '徐阴海', '任扶民', 
    '吴长振', '张玉柱', '刘志强', '杨明印',
    '张金华', '刘金财', '崔树立', '杨致敬',
    '马圣强', '刘子凯', '何洪杰', '刘佳文'
];

export const ELECTRICIANS = [
    '李润海', '赵艳伟', '吴霄', '吴忠建',
    '李之彦', '宋桂良', '崔金辉', '李瑞召',
    '万庆权', '郭瑞臣', '郭兆勤', '赵同宽',
    '肖木凯', '赵燕伟'
];

// 特殊值
export const SPECIAL_VALUES = {
    TOTAL: '合计'
};

// 数值格式
export const NUMBER_FORMAT = {
    TIME_DECIMALS: 2  // 时间计算保留2位小数
};
```

### 2.2 数据转换模块 (dataTransformer.js)

```javascript
/**
 * 数据转换器类
 * 复刻VBA脚本的核心数据处理逻辑
 */
class DataTransformer {
    constructor(data, columnMapping) {
        this.originalData = data;
        this.columnMapping = columnMapping;
        this.processedData = [];
        this.stats = {
            totalRows: 0,
            deletedTotalRows: 0,
            deletedIncompleteTimeRows: 0,
            processedRows: 0
        };
    }

    /**
     * 执行完整的数据转换流程
     */
    transform() {
        // 1. 删除"合计"行
        this.removeTotalRows();
        
        // 2. 处理车间分列
        this.splitWorkshopColumn();
        
        // 3. 维修人分类
        this.classifyRepairPersons();
        
        // 4. 计算时间并删除时间不完整行
        this.calculateTimesAndRemoveIncomplete();
        
        return {
            data: this.processedData,
            stats: this.stats
        };
    }

    /**
     * 删除车间列值为"合计"的行
     */
    removeTotalRows() {
        // 实现逻辑...
    }

    /**
     * 车间列分列：提取区域信息
     */
    splitWorkshopColumn() {
        // 实现逻辑...
    }

    /**
     * 维修人员分类
     */
    classifyRepairPersons() {
        // 实现逻辑...
    }

    /**
     * 计算时间字段并删除不完整数据
     */
    calculateTimesAndRemoveIncomplete() {
        // 实现逻辑...
    }
}

export default DataTransformer;
```

### 2.3 日期工具模块 (dateUtils.js)

```javascript
/**
 * 检查值是否为有效日期
 */
export function isValidDate(value) {
    if (!value) return false;
    const date = new Date(value);
    return date instanceof Date && !isNaN(date);
}

/**
 * 计算两个日期之间的小时差
 */
export function getHoursDifference(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffMs = end - start;
    const diffHours = diffMs / (1000 * 60 * 60);
    return Math.round(diffHours * 100) / 100; // 保留2位小数
}

/**
 * 格式化日期为 yyyy-mm-dd hh:mm:ss
 */
export function formatDateTime(date) {
    if (!isValidDate(date)) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}
```

### 2.4 数据验证模块 (dataValidator.js)

```javascript
/**
 * 数据验证器类
 */
class DataValidator {
    constructor(data, columnMapping) {
        this.data = data;
        this.columnMapping = columnMapping;
        this.errors = [];
        this.warnings = [];
    }

    /**
     * 执行所有验证
     */
    validate() {
        this.checkRequiredColumns();
        this.checkDataTypes();
        this.checkDateRanges();
        
        return {
            isValid: this.errors.length === 0,
            errors: this.errors,
            warnings: this.warnings
        };
    }

    /**
     * 检查必需列是否存在
     */
    checkRequiredColumns() {
        // 实现逻辑...
    }

    /**
     * 检查数据类型
     */
    checkDataTypes() {
        // 实现逻辑...
    }

    /**
     * 检查日期范围合理性
     */
    checkDateRanges() {
        // 实现逻辑...
    }
}

export default DataValidator;
```

## 3. Excel文件处理

### 3.1 SheetJS使用规范

#### 读取Excel文件
```javascript
import * as XLSX from 'xlsx';

function readExcelFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                
                // 查找"原始数据"工作表
                const sheetName = workbook.SheetNames.find(
                    name => name === '原始数据'
                ) || workbook.SheetNames[0];
                
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, {
                    header: 1,  // 返回数组格式
                    raw: false, // 格式化数据
                    dateNF: 'yyyy-mm-dd hh:mm:ss'
                });
                
                resolve(jsonData);
            } catch (error) {
                reject(error);
            }
        };
        
        reader.onerror = (error) => reject(error);
        reader.readAsArrayBuffer(file);
    });
}
```

#### 导出Excel文件
```javascript
function exportToExcel(data, filename = '整理后数据.xlsx') {
    // 创建工作簿
    const workbook = XLSX.utils.book_new();
    
    // 将数据转换为工作表
    const worksheet = XLSX.utils.json_to_sheet(data);
    
    // 设置列宽
    const colWidths = calculateColumnWidths(data);
    worksheet['!cols'] = colWidths;
    
    // 添加工作表到工作簿
    XLSX.utils.book_append_sheet(workbook, worksheet, '整理后数据');
    
    // 导出文件
    XLSX.writeFile(workbook, filename);
}
```

### 3.2 数据格式转换

#### Excel数组转对象
```javascript
function arrayToObject(headers, row) {
    const obj = {};
    headers.forEach((header, index) => {
        obj[header] = row[index];
    });
    return obj;
}
```

#### 对象转Excel数组
```javascript
function objectToArray(obj, headers) {
    return headers.map(header => obj[header]);
}
```

## 4. 用户界面规范

### 4.1 界面布局

```
┌─────────────────────────────────────────────────────┐
│                    页面标题                           │
│              设备故障统计数据处理系统                  │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │  步骤1: 上传Excel文件                        │   │
│  │  [选择文件] [已选择: xxx.xlsx]              │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │  步骤2: 数据预览（原始数据）                 │   │
│  │  [表格显示前50行]                           │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │  步骤3: 处理数据                             │   │
│  │  [开始处理]                                 │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │  步骤4: 查看处理结果                         │   │
│  │  处理统计:                                   │   │
│  │  - 处理行数: 1000                           │   │
│  │  - 删除合计行: 5                            │   │
│  │  - 删除时间不完整行: 10                      │   │
│  │  [下载Excel] [下载CSV]                      │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │  步骤5: 数据可视化（预留）                   │   │
│  │  [图表展示区域]                              │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### 4.2 交互流程

1. **文件上传**
   - 用户点击"选择文件"按钮
   - 选择.xlsx或.xls文件
   - 系统自动读取并显示预览

2. **数据处理**
   - 用户点击"开始处理"
   - 显示处理进度（可选）
   - 处理完成后显示统计信息

3. **结果导出**
   - 用户选择导出格式
   - 点击下载按钮
   - 浏览器下载处理后的文件

### 4.3 错误处理

#### 错误类型
- 文件格式错误
- 缺少必需列
- 数据格式错误
- 处理异常

#### 错误提示
```javascript
const ERROR_MESSAGES = {
    INVALID_FILE: '请选择有效的Excel文件（.xlsx或.xls）',
    MISSING_SHEET: '未找到"原始数据"工作表',
    MISSING_COLUMN: '缺少必需列：{columnName}',
    INVALID_DATE: '第{row}行的{column}不是有效的日期格式',
    PROCESSING_ERROR: '数据处理出错：{error}'
};
```

## 5. 性能优化策略

### 5.1 大数据处理

#### Web Worker方案
```javascript
// 主线程
const worker = new Worker('dataProcessor.worker.js');
worker.postMessage({ data: rawData });
worker.onmessage = (e) => {
    const processedData = e.data;
    displayResults(processedData);
};

// dataProcessor.worker.js
self.onmessage = (e) => {
    const { data } = e.data;
    const processed = processData(data);
    self.postMessage(processed);
};
```

#### 分批处理
```javascript
function processBatch(data, batchSize = 1000) {
    const results = [];
    for (let i = 0; i < data.length; i += batchSize) {
        const batch = data.slice(i, i + batchSize);
        results.push(...transformBatch(batch));
    }
    return results;
}
```

### 5.2 内存优化

- 及时释放大对象
- 避免深拷贝大数据
- 使用流式处理
- 分页显示结果

## 6. 测试规范

### 6.1 单元测试用例

#### 时间计算测试
```javascript
test('计算等待时间', () => {
    const reportTime = new Date('2024-01-01 08:00:00');
    const startTime = new Date('2024-01-01 10:00:00');
    const waitTime = getHoursDifference(reportTime, startTime);
    expect(waitTime).toBe(2.00);
});
```

#### 车间分列测试
```javascript
test('车间列分列', () => {
    const workshop = '一车间-A区';
    const result = splitWorkshop(workshop);
    expect(result.workshop).toBe('一车间');
    expect(result.area).toBe('A区');
});
```

#### 维修人分类测试
```javascript
test('维修人分类', () => {
    expect(classifyRepairPerson('王兴森')).toBe('维修工');
    expect(classifyRepairPerson('李润海')).toBe('电工');
    expect(classifyRepairPerson('张三')).toBe('未知');
});
```

### 6.2 集成测试

- 完整数据流测试
- 边界条件测试
- 错误处理测试

### 6.3 对比测试

- 与VBA处理结果对比
- 确保数据一致性

## 7. 版本控制与发布

### 7.1 版本号规范

采用语义化版本号：`主版本号.次版本号.修订号`

- v0.1.0: 初始架构和文档
- v0.2.0: 基础功能实现
- v0.3.0: 数据处理完整实现
- v1.0.0: 第一个正式版本（含基础图表）

### 7.2 发布检查清单

- [ ] 所有单元测试通过
- [ ] 集成测试通过
- [ ] 与VBA结果对比一致
- [ ] 文档更新完整
- [ ] 性能测试达标
- [ ] 浏览器兼容性测试通过

## 8. 文档维护

### 8.1 代码注释规范

```javascript
/**
 * 计算两个日期之间的小时差
 * @param {Date|string} startDate - 开始日期
 * @param {Date|string} endDate - 结束日期
 * @returns {number} 小时差，保留2位小数
 * @throws {Error} 如果日期无效
 */
function getHoursDifference(startDate, endDate) {
    // 实现...
}
```

### 8.2 更新日志

维护CHANGELOG.md文件，记录每个版本的变更：

```markdown
# 更新日志

## [0.1.0] - 2024-01-XX
### 新增
- 项目架构文档
- 技术规格说明

### 变更
- 无

### 修复
- 无
```

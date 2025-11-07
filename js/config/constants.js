/**
 * 常量配置模块
 * Constants Configuration Module
 * 
 * 定义系统中使用的所有常量，包括列名、人员分类等
 */

// 必需的列名
export const REQUIRED_COLUMNS = {
    workOrder: '工单号',
    workshop: '车间',
    repairPerson: '维修人',
    reportTime: '报修时间',
    startTime: '维修开始时间',
    endTime: '维修结束时间'
};

// 可选的列名（如不存在则创建）
export const OPTIONAL_COLUMNS = {
    area: '区域',
    repairPersonType: '维修人分类',
    waitTime: '等待时间h',
    repairTime: '维修时间h',
    faultTime: '故障时间h'
};

// 维修工名单（16人）
export const REPAIR_WORKERS = [
    '王兴森', '孙长青', '徐阴海', '任扶民',
    '吴长振', '张玉柱', '刘志强', '杨明印',
    '张金华', '刘金财', '崔树立', '杨致敬',
    '马圣强', '刘子凯', '何洪杰', '刘佳文'
];

// 电工名单（14人）
export const ELECTRICIANS = [
    '李润海', '赵艳伟', '吴霄', '吴忠建',
    '李之彦', '宋桂良', '崔金辉', '李瑞召',
    '万庆权', '郭瑞臣', '郭兆勤', '赵同宽',
    '肖木凯', '赵燕伟'
];

// 特殊值
export const SPECIAL_VALUES = {
    TOTAL: '合计',           // 需要删除的合计行标识
    UNKNOWN: '未知'          // 未知的维修人分类
};

// 维修人员分类类型
export const PERSON_TYPES = {
    REPAIR_WORKER: '维修工',
    ELECTRICIAN: '电工',
    UNKNOWN: '未知'
};

// 数值格式配置
export const NUMBER_FORMAT = {
    TIME_DECIMALS: 2        // 时间计算保留2位小数
};

// 文件格式配置
export const FILE_CONFIG = {
    ALLOWED_EXTENSIONS: ['.xlsx', '.xls'],
    ALLOWED_TYPES: [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',  // .xlsx
        'application/vnd.ms-excel'  // .xls
    ],
    MAX_FILE_SIZE: 50 * 1024 * 1024,  // 50MB
    DEFAULT_SHEET_NAME: '原始数据',
    OUTPUT_SHEET_NAME: '整理后数据'
};

// 表格显示配置
export const TABLE_CONFIG = {
    PREVIEW_ROWS: 50,       // 预览显示的行数
    MAX_DISPLAY_ROWS: 100   // 最大显示行数
};

// 错误消息
export const ERROR_MESSAGES = {
    INVALID_FILE: '请选择有效的Excel文件（.xlsx或.xls）',
    FILE_TOO_LARGE: '文件大小超过限制（最大50MB）',
    MISSING_SHEET: '未找到"原始数据"工作表',
    MISSING_COLUMN: '缺少必需列：',
    INVALID_DATE: '不是有效的日期格式',
    PROCESSING_ERROR: '数据处理出错：',
    NO_DATA: '文件中没有数据',
    EMPTY_FILE: '文件为空'
};

// 成功消息
export const SUCCESS_MESSAGES = {
    FILE_LOADED: '文件加载成功',
    VALIDATION_PASSED: '数据验证通过',
    PROCESSING_COMPLETE: '数据处理完成',
    EXPORT_SUCCESS: '文件导出成功'
};

// 状态消息
export const STATUS_MESSAGES = {
    LOADING_FILE: '正在读取文件...',
    VALIDATING: '正在验证数据...',
    PROCESSING: '正在处理数据...',
    GENERATING_OUTPUT: '正在生成输出文件...',
    EXPORTING: '正在导出文件...'
};

// 应用配置
export const APP_CONFIG = {
    VERSION: '0.3.0',
    APP_NAME: '设备故障统计数据处理系统',
    APP_NAME_EN: 'Equipment Fault Statistics System',
    GITHUB_REPO: 'https://github.com/qq940500529/Equipment-Fault-Statistics'
};

// 统一消息配置（用于简化消息访问）
export const MESSAGES = {
    ERROR: {
        NO_FILE: '请选择一个文件',
        INVALID_FILE: '请选择有效的Excel文件（.xlsx或.xls）',
        INVALID_FILE_TYPE: '请选择有效的Excel文件（.xlsx或.xls）',
        FILE_TOO_LARGE: '文件大小超过限制（最大{size}MB）',
        FILE_READ_ERROR: '文件读取失败',
        INVALID_EXCEL: '无效的Excel文件',
        EMPTY_FILE: '文件为空',
        MISSING_COLUMNS: '缺少必需列',
        PARSE_ERROR: '数据解析错误',
        PROCESSING_ERROR: '数据处理出错'
    },
    SUCCESS: {
        FILE_LOADED: '文件加载成功',
        VALIDATION_PASSED: '数据验证通过',
        PROCESSING_COMPLETE: '数据处理完成',
        EXPORT_SUCCESS: '文件导出成功'
    },
    INFO: {
        LOADING_FILE: '正在读取文件...',
        VALIDATING: '正在验证数据...',
        PROCESSING: '正在处理数据...',
        GENERATING_OUTPUT: '正在生成输出文件...',
        EXPORTING: '正在导出文件...'
    }
};

// 导出所有常量
export default {
    REQUIRED_COLUMNS,
    OPTIONAL_COLUMNS,
    REPAIR_WORKERS,
    ELECTRICIANS,
    SPECIAL_VALUES,
    PERSON_TYPES,
    NUMBER_FORMAT,
    FILE_CONFIG,
    TABLE_CONFIG,
    ERROR_MESSAGES,
    SUCCESS_MESSAGES,
    STATUS_MESSAGES,
    APP_CONFIG,
    MESSAGES
};

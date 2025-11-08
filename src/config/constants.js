export const APP_CONFIG = {
  APP_NAME: '设备故障统计数据处理系统',
  VERSION: '0.5.0',
  DESCRIPTION: 'Equipment Fault Statistics System - Vue 3 + Arco Design',
}

export const TABLE_CONFIG = {
  PREVIEW_ROWS: 50,
  PAGE_SIZE: 20,
}

export const UI_CONFIG = {
  COMPLETION_DELAY_MS: 1000,
  NOTIFICATION_DURATION: 3000,
}

export const COLUMN_MAPPINGS = {
  WORKSHOP: '车间',
  AREA: '区域',
  EQUIPMENT: '设备',
  EQUIPMENT_NUMBER: '设备编号',
  FAILURE_TYPE: '失效类型',
  REPORT_TIME: '报修时间',
  START_TIME: '维修开始时间',
  END_TIME: '维修结束时间',
  REPAIR_PERSON: '维修人',
  WAIT_TIME: '等待时间h',
  REPAIR_TIME: '维修时间h',
  FAULT_TIME: '故障时间h',
  REPAIR_PERSON_TYPE: '维修人类型',
}

// 维修工名单
export const REPAIR_WORKERS = [
  '王兴森', '孙长青', '徐阴海', '任扶民', '吴长振', '张玉柱',
  '刘志强', '杨明印', '张金华', '刘金财', '崔树立', '杨致敬',
  '马圣强', '刘子凯', '何洪杰', '刘佳文'
]

// 电工名单
export const ELECTRICIANS = [
  '李润海', '赵艳伟', '吴霄', '吴忠建', '李之彦', '宋桂良',
  '崔金辉', '李瑞召', '万庆权', '郭瑞臣', '郭兆勤', '赵同宽',
  '肖木凯', '赵燕伟'
]

export const CHART_CONFIG = {
  PARETO_THRESHOLD: 0.8, // 80% threshold for Pareto principle
  DRILL_DOWN_LEVELS: ['车间', '设备', '设备编号', '失效类型'],
  METRICS: {
    WAIT_TIME: 'waitTime',
    REPAIR_TIME: 'repairTime',
    FAULT_TIME: 'faultTime',
  },
}

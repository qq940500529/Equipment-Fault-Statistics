/**
 * Data validator composable
 */
export function useDataValidator() {
  /**
   * Validate data structure
   */
  function validate(data, columnMapping) {
    const result = {
      valid: true,
      errors: [],
      warnings: [],
    }

    // Check if data exists
    if (!data || data.length === 0) {
      result.valid = false
      result.errors.push('数据为空')
      return result
    }

    // Check required columns
    const requiredColumns = [
      '车间', '设备', '设备编号', '失效类型',
      '报修时间', '维修开始时间', '维修结束时间', '维修人'
    ]

    requiredColumns.forEach(col => {
      if (!columnMapping[col]) {
        result.valid = false
        result.errors.push(`缺少必需列: ${col}`)
      }
    })

    // Check data completeness
    let emptyRowCount = 0
    data.forEach((row, index) => {
      let emptyFieldCount = 0
      requiredColumns.forEach(col => {
        const mappedCol = columnMapping[col]
        if (mappedCol && (!row[mappedCol] || row[mappedCol] === '')) {
          emptyFieldCount++
        }
      })
      
      if (emptyFieldCount > 0) {
        emptyRowCount++
      }
    })

    if (emptyRowCount > 0) {
      result.warnings.push(`发现 ${emptyRowCount} 行数据包含空值，将在处理时自动过滤`)
    }

    return result
  }

  /**
   * Reset validator state
   */
  function reset() {
    // No state to reset
  }

  return {
    validate,
    reset,
  }
}

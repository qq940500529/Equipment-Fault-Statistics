import dayjs from 'dayjs'
import { REPAIR_WORKERS, ELECTRICIANS, COLUMN_MAPPINGS } from '@/config/constants'

/**
 * Data transformer composable
 */
export function useDataTransformer() {
  let deletedRows = {
    totalRows: [],
    incompleteTimeRows: [],
  }

  /**
   * Transform data
   */
  function transform(rawData, columnMapping) {
    const result = {
      data: [],
      stats: {
        totalRowsRemoved: 0,
        incompleteTimeRowsRemoved: 0,
        workshopColumnSplit: false,
        repairPersonClassified: false,
      },
    }

    deletedRows = {
      totalRows: [],
      incompleteTimeRows: [],
    }

    // Step 1: Filter out total rows
    const filteredData = rawData.filter(row => {
      const workshopValue = row[columnMapping[COLUMN_MAPPINGS.WORKSHOP]]
      if (workshopValue && workshopValue.toString().includes('合计')) {
        deletedRows.totalRows.push(row)
        result.stats.totalRowsRemoved++
        return false
      }
      return true
    })

    // Step 2: Process each row
    const processedData = filteredData.map(row => {
      const newRow = { ...row }

      // Split workshop column
      const workshopCol = columnMapping[COLUMN_MAPPINGS.WORKSHOP]
      if (workshopCol && row[workshopCol]) {
        const workshopValue = row[workshopCol].toString()
        if (workshopValue.includes('-')) {
          const parts = workshopValue.split('-')
          newRow[COLUMN_MAPPINGS.WORKSHOP] = parts[0].trim()
          newRow[COLUMN_MAPPINGS.AREA] = parts[1] ? parts[1].trim() : ''
          result.stats.workshopColumnSplit = true
        } else {
          newRow[COLUMN_MAPPINGS.WORKSHOP] = workshopValue
          newRow[COLUMN_MAPPINGS.AREA] = ''
        }
      }

      // Classify repair person
      const repairPersonCol = columnMapping[COLUMN_MAPPINGS.REPAIR_PERSON]
      if (repairPersonCol && row[repairPersonCol]) {
        const repairPerson = row[repairPersonCol].toString().trim()
        if (REPAIR_WORKERS.includes(repairPerson)) {
          newRow[COLUMN_MAPPINGS.REPAIR_PERSON_TYPE] = '维修工'
          result.stats.repairPersonClassified = true
        } else if (ELECTRICIANS.includes(repairPerson)) {
          newRow[COLUMN_MAPPINGS.REPAIR_PERSON_TYPE] = '电工'
          result.stats.repairPersonClassified = true
        } else {
          newRow[COLUMN_MAPPINGS.REPAIR_PERSON_TYPE] = '未知'
        }
      }

      // Calculate time differences
      const reportTimeCol = columnMapping[COLUMN_MAPPINGS.REPORT_TIME]
      const startTimeCol = columnMapping[COLUMN_MAPPINGS.START_TIME]
      const endTimeCol = columnMapping[COLUMN_MAPPINGS.END_TIME]

      if (reportTimeCol && startTimeCol && endTimeCol) {
        const reportTime = parseDateTime(row[reportTimeCol])
        const startTime = parseDateTime(row[startTimeCol])
        const endTime = parseDateTime(row[endTimeCol])

        if (reportTime && startTime && endTime) {
          // Calculate wait time (hours)
          const waitTimeHours = startTime.diff(reportTime, 'hour', true)
          newRow[COLUMN_MAPPINGS.WAIT_TIME] = waitTimeHours.toFixed(2)

          // Calculate repair time (hours)
          const repairTimeHours = endTime.diff(startTime, 'hour', true)
          newRow[COLUMN_MAPPINGS.REPAIR_TIME] = repairTimeHours.toFixed(2)

          // Calculate total fault time (hours)
          const faultTimeHours = waitTimeHours + repairTimeHours
          newRow[COLUMN_MAPPINGS.FAULT_TIME] = faultTimeHours.toFixed(2)
        }
      }

      return newRow
    })

    // Step 3: Filter out rows with incomplete time data
    const finalData = processedData.filter(row => {
      const hasWaitTime = row[COLUMN_MAPPINGS.WAIT_TIME] !== undefined && row[COLUMN_MAPPINGS.WAIT_TIME] !== ''
      const hasRepairTime = row[COLUMN_MAPPINGS.REPAIR_TIME] !== undefined && row[COLUMN_MAPPINGS.REPAIR_TIME] !== ''
      const hasFaultTime = row[COLUMN_MAPPINGS.FAULT_TIME] !== undefined && row[COLUMN_MAPPINGS.FAULT_TIME] !== ''

      if (!hasWaitTime || !hasRepairTime || !hasFaultTime) {
        deletedRows.incompleteTimeRows.push(row)
        result.stats.incompleteTimeRowsRemoved++
        return false
      }
      return true
    })

    result.data = finalData
    return result
  }

  /**
   * Parse date time string
   */
  function parseDateTime(dateStr) {
    if (!dateStr) return null
    
    // Try various date formats
    const formats = [
      'YYYY-MM-DD HH:mm:ss',
      'YYYY/MM/DD HH:mm:ss',
      'YYYY-MM-DD HH:mm',
      'YYYY/MM/DD HH:mm',
      'M/D/YYYY H:mm:ss',
      'M/D/YYYY H:mm',
    ]

    for (const format of formats) {
      const parsed = dayjs(dateStr, format)
      if (parsed.isValid()) {
        return parsed
      }
    }

    // Try default parsing
    const parsed = dayjs(dateStr)
    return parsed.isValid() ? parsed : null
  }

  /**
   * Get deleted rows
   */
  function getDeletedRows() {
    return deletedRows
  }

  /**
   * Reset transformer state
   */
  function reset() {
    deletedRows = {
      totalRows: [],
      incompleteTimeRows: [],
    }
  }

  return {
    transform,
    getDeletedRows,
    reset,
  }
}

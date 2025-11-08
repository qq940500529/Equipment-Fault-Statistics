import * as XLSX from 'xlsx'
import { ref } from 'vue'

/**
 * Data parser composable
 */
export function useDataParser() {
  const headers = ref([])
  const data = ref([])
  const sheetName = ref('')
  const columnMapping = ref({})

  /**
   * Parse Excel file
   */
  function parseExcel(fileData) {
    try {
      // Read workbook
      const workbook = XLSX.read(fileData, { type: 'array', cellDates: true })
      
      // Get first sheet
      const firstSheetName = workbook.SheetNames[0]
      sheetName.value = firstSheetName
      const worksheet = workbook.Sheets[firstSheetName]
      
      // Convert to JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
        raw: false,
        dateNF: 'yyyy-mm-dd hh:mm:ss',
        defval: ''
      })
      
      if (!jsonData || jsonData.length === 0) {
        throw new Error('Excel文件为空或格式不正确')
      }
      
      // Extract headers
      headers.value = Object.keys(jsonData[0])
      data.value = jsonData
      
      // Auto-detect column mapping
      autoDetectColumns()
      
      return {
        success: true,
        data: jsonData,
        headers: headers.value,
        sheetName: firstSheetName,
        rowCount: jsonData.length,
      }
    } catch (error) {
      console.error('Excel解析错误:', error)
      return {
        success: false,
        error: error.message,
      }
    }
  }

  /**
   * Auto-detect column mapping
   */
  function autoDetectColumns() {
    const mapping = {}
    const requiredColumns = [
      '车间', '设备', '设备编号', '失效类型', 
      '报修时间', '维修开始时间', '维修结束时间', '维修人'
    ]
    
    requiredColumns.forEach(col => {
      const found = headers.value.find(h => h.includes(col) || col.includes(h))
      if (found) {
        mapping[col] = found
      }
    })
    
    columnMapping.value = mapping
  }

  /**
   * Get preview data
   */
  function getPreviewData(rows = 50) {
    return data.value.slice(0, rows)
  }

  /**
   * Get statistics
   */
  function getStatistics() {
    return {
      totalRows: data.value.length,
      columnCount: headers.value.length,
      sheetName: sheetName.value,
    }
  }

  /**
   * Reset parser state
   */
  function reset() {
    headers.value = []
    data.value = []
    sheetName.value = ''
    columnMapping.value = {}
  }

  return {
    headers,
    data,
    sheetName,
    columnMapping,
    parseExcel,
    getPreviewData,
    getStatistics,
    getColumnMapping: () => columnMapping.value,
    getHeaders: () => headers.value,
    reset,
  }
}

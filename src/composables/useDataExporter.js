import * as XLSX from 'xlsx'
import dayjs from 'dayjs'

/**
 * Data exporter composable
 */
export function useDataExporter() {
  /**
   * Export to Excel
   */
  async function exportToExcel(data) {
    if (!data || data.length === 0) {
      throw new Error('没有可导出的数据')
    }

    try {
      // Get all column names
      const allColumns = getAllColumns(data)
      
      // Prepare export data
      const exportData = data.map(row => {
        const newRow = {}
        allColumns.forEach(col => {
          newRow[col] = row[col] !== undefined ? row[col] : ''
        })
        return newRow
      })
      
      // Create workbook
      const wb = XLSX.utils.book_new()
      
      // Create worksheet
      const ws = XLSX.utils.json_to_sheet(exportData, {
        header: allColumns,
        skipHeader: false
      })
      
      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, '整理后数据')
      
      // Generate filename
      const dateStr = dayjs().format('YYYYMMDD_HHmmss')
      const fileName = `设备故障统计_整理后数据_${dateStr}.xlsx`
      
      // Export file
      XLSX.writeFile(wb, fileName)
      
    } catch (error) {
      console.error('Excel导出错误:', error)
      throw new Error('Excel导出失败: ' + error.message)
    }
  }

  /**
   * Export to CSV
   */
  async function exportToCsv(data) {
    if (!data || data.length === 0) {
      throw new Error('没有可导出的数据')
    }

    try {
      // Get all column names
      const allColumns = getAllColumns(data)
      
      // Create CSV content
      let csvContent = ''
      
      // Add BOM for UTF-8
      csvContent = '\uFEFF'
      
      // Add header
      csvContent += allColumns.map(h => escapeCsvValue(h)).join(',') + '\n'
      
      // Add data rows
      data.forEach(row => {
        const values = allColumns.map(col => {
          const value = row[col]
          return escapeCsvValue(value !== undefined ? value : '')
        })
        csvContent += values.join(',') + '\n'
      })
      
      // Generate filename
      const dateStr = dayjs().format('YYYYMMDD_HHmmss')
      const fileName = `设备故障统计_整理后数据_${dateStr}.csv`
      
      // Create and download file
      downloadFile(csvContent, fileName, 'text/csv;charset=utf-8;')
      
    } catch (error) {
      console.error('CSV导出错误:', error)
      throw new Error('CSV导出失败: ' + error.message)
    }
  }

  /**
   * Export to JSON
   */
  async function exportToJson(data) {
    if (!data || data.length === 0) {
      throw new Error('没有可导出的数据')
    }

    try {
      // Get all column names
      const allColumns = getAllColumns(data)
      
      // Prepare export data
      const exportData = data.map(row => {
        const newRow = {}
        allColumns.forEach(col => {
          newRow[col] = row[col] !== undefined ? row[col] : null
        })
        return newRow
      })
      
      // Create JSON content
      const jsonContent = JSON.stringify({
        metadata: {
          exportTime: dayjs().toISOString(),
          totalRows: exportData.length,
          columns: allColumns,
          version: '0.5.0'
        },
        data: exportData
      }, null, 2)
      
      // Generate filename
      const dateStr = dayjs().format('YYYYMMDD_HHmmss')
      const fileName = `设备故障统计_整理后数据_${dateStr}.json`
      
      // Create and download file
      downloadFile(jsonContent, fileName, 'application/json;charset=utf-8;')
      
    } catch (error) {
      console.error('JSON导出错误:', error)
      throw new Error('JSON导出失败: ' + error.message)
    }
  }

  /**
   * Get all unique column names
   */
  function getAllColumns(data) {
    const columns = new Set()
    data.forEach(row => {
      Object.keys(row).forEach(key => columns.add(key))
    })
    return Array.from(columns)
  }

  /**
   * Escape CSV value
   */
  function escapeCsvValue(value) {
    if (value === null || value === undefined) return ''
    
    const str = String(value)
    // If value contains comma, newline, or quote, wrap in quotes and escape quotes
    if (str.includes(',') || str.includes('\n') || str.includes('"')) {
      return '"' + str.replace(/"/g, '""') + '"'
    }
    return str
  }

  /**
   * Download file
   */
  function downloadFile(content, fileName, mimeType) {
    const blob = new Blob([content], { type: mimeType })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    link.setAttribute('href', url)
    link.setAttribute('download', fileName)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    // Clean up
    URL.revokeObjectURL(url)
  }

  return {
    exportToExcel,
    exportToCsv,
    exportToJson,
  }
}

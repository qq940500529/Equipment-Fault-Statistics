import * as XLSX from 'xlsx'

/**
 * File upload composable
 */
export function useFileUploader() {
  /**
   * Read file as ArrayBuffer
   */
  async function readFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = (e) => {
        resolve(e.target.result)
      }
      
      reader.onerror = () => {
        reject(new Error('文件读取失败'))
      }
      
      reader.readAsArrayBuffer(file)
    })
  }

  /**
   * Validate file
   */
  function validateFile(file) {
    const validExtensions = ['.xlsx', '.xls']
    const fileName = file.name.toLowerCase()
    const isValid = validExtensions.some(ext => fileName.endsWith(ext))
    
    if (!isValid) {
      throw new Error('文件格式不支持，请上传 .xlsx 或 .xls 文件')
    }
    
    // Check file size (max 50MB)
    const maxSize = 50 * 1024 * 1024
    if (file.size > maxSize) {
      throw new Error('文件大小超过限制（最大50MB）')
    }
    
    return true
  }

  return {
    readFile,
    validateFile,
  }
}

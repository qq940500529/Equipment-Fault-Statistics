<template>
  <a-card class="step-card" title="上传Excel文件" :bordered="false">
    <template #extra>
      <a-tag color="blue">步骤 1</a-tag>
    </template>

    <a-upload
      :custom-request="handleUpload"
      :show-file-list="false"
      accept=".xlsx,.xls"
      drag
    >
      <template #upload-button>
        <div class="upload-area">
          <div class="upload-icon">
            <icon-cloud-upload :size="64" />
          </div>
          <div class="upload-text">
            <p class="upload-title">拖拽文件到这里或点击选择文件</p>
            <p class="upload-hint">支持 .xlsx 和 .xls 格式</p>
          </div>
        </div>
      </template>
    </a-upload>

    <a-alert
      v-if="currentFile"
      type="success"
      :closable="false"
      class="file-info"
    >
      <template #icon>
        <icon-file />
      </template>
      已选择: <strong>{{ currentFile.name }}</strong> ({{ formatFileSize(currentFile.size) }})
    </a-alert>
  </a-card>
</template>

<script setup>
import { ref } from 'vue'
import { Message } from '@arco-design/web-vue'
import { IconCloudUpload, IconFile } from '@arco-design/web-vue/es/icon'
import { useDataStore } from '@/stores/dataStore'
import { useFileUploader } from '@/composables/useFileUploader'
import { useDataParser } from '@/composables/useDataParser'

const emit = defineEmits(['next'])

const dataStore = useDataStore()
const { readFile, validateFile } = useFileUploader()
const { parseExcel, getStatistics } = useDataParser()

const currentFile = ref(null)
const loading = ref(false)

async function handleUpload(options) {
  const { fileItem } = options
  const file = fileItem.file

  try {
    loading.value = true
    
    // Validate file
    validateFile(file)
    currentFile.value = file
    
    // Show loading message
    const loadingMsg = Message.loading('正在读取文件...', { duration: 0 })
    
    // Read file
    const fileData = await readFile(file)
    
    // Parse Excel
    const parseResult = parseExcel(fileData)
    
    if (!parseResult.success) {
      throw new Error(parseResult.error)
    }
    
    // Save to store
    dataStore.setRawData(parseResult.data)
    dataStore.setCurrentFile(file)
    
    // Close loading message
    loadingMsg.close()
    
    // Show success message
    Message.success(`文件读取成功！共 ${parseResult.rowCount} 行数据`)
    
    // Move to next step
    emit('next')
    
  } catch (error) {
    console.error('文件处理错误:', error)
    Message.error(error.message || '文件处理失败')
    currentFile.value = null
  } finally {
    loading.value = false
  }
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
</script>

<style scoped>
.step-card {
  animation: fadeIn 0.3s ease-in-out;
}

.upload-area {
  padding: 3rem 2rem;
  text-align: center;
  background: var(--color-fill-1);
  border-radius: 4px;
  transition: all 0.3s;
}

.upload-area:hover {
  background: var(--color-fill-2);
}

.upload-icon {
  color: rgb(var(--primary-6));
  margin-bottom: 1rem;
}

.upload-title {
  font-size: 1.1rem;
  font-weight: 500;
  margin: 0 0 0.5rem 0;
  color: var(--color-text-1);
}

.upload-hint {
  margin: 0;
  color: var(--color-text-3);
}

.file-info {
  margin-top: 1.5rem;
}
</style>

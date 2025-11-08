<template>
  <a-card class="step-card" :bordered="false">
    <template #title>
      <div class="card-title">
        <icon-sync :size="24" style="margin-right: 8px;" />
        <span>数据处理中...</span>
      </div>
    </template>
    <template #extra>
      <a-tag color="arcoblue">步骤 3/5</a-tag>
    </template>

    <div class="processing-container">
      <a-spin :size="64" :loading="processing" tip="正在处理数据..." />
      
      <a-progress
        :percent="progress"
        :status="progress === 100 ? 'success' : 'normal'"
        class="progress-bar"
        :stroke-width="12"
      />

      <div class="status-text">
        <p class="main-status">{{ statusText }}</p>
        <p class="sub-status">{{ subStatus }}</p>
      </div>
    </div>
  </a-card>
</template>

<script setup>
import { ref, watch } from 'vue'
import { Message } from '@arco-design/web-vue'
import { useDataStore } from '@/stores/dataStore'
import { useDataParser } from '@/composables/useDataParser'
import { useDataValidator } from '@/composables/useDataValidator'
import { useDataTransformer } from '@/composables/useDataTransformer'

const emit = defineEmits(['next'])

const dataStore = useDataStore()
const { getColumnMapping } = useDataParser()
const { validate } = useDataValidator()
const { transform, getDeletedRows } = useDataTransformer()

const processing = ref(false)
const progress = ref(0)
const statusText = ref('正在初始化...')
const subStatus = ref('')
const hasProcessedOnce = ref(false)

// Watch for when we reach step 3 AND have data to process
watch(() => dataStore.currentStep, (newStep) => {
  console.log('Step changed to:', newStep, 'hasRawData:', dataStore.hasRawData, 'hasProcessedOnce:', hasProcessedOnce.value)
  
  // Only auto-process when:
  // 1. We reach step 3
  // 2. We have raw data to process
  // 3. We haven't processed yet
  if (newStep === 3 && dataStore.hasRawData && !hasProcessedOnce.value) {
    console.log('Auto-starting data processing...')
    hasProcessedOnce.value = true
    processData()
  }
})

async function processData() {
  try {
    processing.value = true
    
    // Step 1: Validate data
    await updateProgress(10, '正在验证数据...', '检查数据完整性')
    
    console.log('=== Data Processing Start ===')
    console.log('Raw data rows:', dataStore.rawData?.length)
    
    const columnMapping = getColumnMapping()
    console.log('Column mapping:', columnMapping)
    
    const validationResult = validate(dataStore.rawData, columnMapping)
    console.log('Validation result:', validationResult)
    
    dataStore.setValidationResult(validationResult)
    
    if (!validationResult.valid) {
      console.error('Validation errors:', validationResult.errors)
      Message.error({
        content: '数据验证失败：' + validationResult.errors.join(', '),
        duration: 5000
      })
      processing.value = false
      return
    }
    
    await updateProgress(30, '验证通过，开始转换数据...', '数据格式正确')
    
    // Step 2: Transform data
    await updateProgress(50, '正在处理数据...', '删除无效行、分列、计算时间')
    
    console.log('Starting data transformation...')
    const transformResult = transform(dataStore.rawData, columnMapping)
    console.log('Transform result:', {
      processedRows: transformResult.data?.length,
      stats: transformResult.stats
    })
    
    dataStore.setProcessedData(transformResult.data)
    dataStore.setStats(transformResult.stats)
    dataStore.setDeletedRows(getDeletedRows())
    
    await updateProgress(70, '数据转换完成，准备预览...', `处理后共 ${transformResult.data.length} 行数据`)
    
    await updateProgress(100, '完成！', '数据处理成功')
    
    // Wait a moment to show completion
    await delay(1000)
    
    Message.success(`数据处理成功！处理后共 ${transformResult.data.length} 行数据`)
    
    console.log('=== Data Processing Complete ===')
    
    // Move to next step
    emit('next')
    
  } catch (error) {
    console.error('=== Data Processing Error ===')
    console.error('Error details:', error)
    console.error('Stack trace:', error.stack)
    Message.error({
      content: error.message || '数据处理失败',
      duration: 5000
    })
  } finally {
    processing.value = false
  }
}

async function updateProgress(percent, main, sub) {
  progress.value = percent
  statusText.value = main
  subStatus.value = sub
  await delay(300)
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
</script>

<style scoped>
.step-card {
  animation: fadeIn 0.3s ease-in-out;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
  border-radius: 12px;
}

.card-title {
  display: flex;
  align-items: center;
  font-size: 1.2rem;
  font-weight: 600;
}

.processing-container {
  padding: 4rem 2rem;
  text-align: center;
  background: linear-gradient(135deg, rgba(var(--arcoblue-1), 0.2) 0%, rgba(var(--purple-1), 0.1) 100%);
  border-radius: 12px;
}

.progress-bar {
  margin: 3rem auto 2rem;
  max-width: 600px;
}

.progress-bar :deep(.arco-progress-line-bar) {
  background: linear-gradient(90deg, rgb(var(--arcoblue-6)) 0%, rgb(var(--purple-6)) 100%);
}

.status-text {
  margin-top: 2rem;
}

.main-status {
  font-size: 1.3rem;
  font-weight: 600;
  margin: 0 0 0.75rem 0;
  color: var(--color-text-1);
}

.sub-status {
  margin: 0;
  color: var(--color-text-3);
  font-size: 1rem;
}
</style>

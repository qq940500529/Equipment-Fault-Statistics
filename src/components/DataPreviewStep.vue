<template>
  <a-card class="step-card" :bordered="false">
    <template #title>
      <div class="card-title">
        <icon-file :size="24" style="margin-right: 8px;" />
        <span>数据预览（原始数据）</span>
      </div>
    </template>
    <template #extra>
      <a-tag color="arcoblue">步骤 2/5</a-tag>
    </template>

    <!-- Statistics -->
    <a-row :gutter="16" class="stats-row">
      <a-col :span="8">
        <a-statistic title="总行数" :value="statistics.totalRows">
          <template #prefix>
            <icon-file />
          </template>
        </a-statistic>
      </a-col>
      <a-col :span="8">
        <a-statistic title="列数" :value="statistics.columnCount">
          <template #prefix>
            <icon-apps />
          </template>
        </a-statistic>
      </a-col>
      <a-col :span="8">
        <a-statistic title="工作表" :value="statistics.sheetName" value-from="center">
          <template #prefix>
            <icon-list />
          </template>
        </a-statistic>
      </a-col>
    </a-row>

    <a-divider />

    <!-- Data Preview -->
    <a-alert type="info" :closable="false" class="preview-hint">
      <template #icon>
        <icon-info-circle />
      </template>
      显示前50行数据用于预览
    </a-alert>

    <div class="table-container">
      <a-table
        :columns="columns"
        :data="previewData"
        :pagination="{ pageSize: 20 }"
        :scroll="{ x: '100%' }"
        :stripe="true"
        :bordered="{ wrapper: true, cell: true }"
        size="small"
      >
        <template #index="{ rowIndex }">
          {{ rowIndex + 1 }}
        </template>
      </a-table>
    </div>

    <a-space class="actions" :size="16">
      <a-button @click="$emit('prev')">
        <template #icon>
          <icon-left />
        </template>
        返回
      </a-button>
      <a-button type="primary" @click="$emit('next')">
        开始处理数据
        <template #icon>
          <icon-right />
        </template>
      </a-button>
    </a-space>
  </a-card>
</template>

<script setup>
import { computed } from 'vue'
import { 
  IconFile,
  IconApps,
  IconList,
  IconInfoCircle,
  IconLeft,
  IconRight 
} from '@arco-design/web-vue'
import { useDataStore } from '@/stores/dataStore'
import { useDataParser } from '@/composables/useDataParser'

const emit = defineEmits(['next', 'prev'])

const dataStore = useDataStore()
const { getPreviewData, getStatistics, getHeaders } = useDataParser()

const statistics = computed(() => getStatistics())
const previewData = computed(() => getPreviewData(50))
const headers = computed(() => getHeaders())

const columns = computed(() => {
  const cols = [
    {
      title: '#',
      slotName: 'index',
      width: 60,
      align: 'center',
      fixed: 'left',
    }
  ]
  
  headers.value.forEach(header => {
    cols.push({
      title: header,
      dataIndex: header,
      width: 150,
      ellipsis: true,
      tooltip: true,
    })
  })
  
  return cols
})
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

.stats-row {
  margin-bottom: 1.5rem;
}

.stats-row :deep(.arco-statistic) {
  background: linear-gradient(135deg, rgba(var(--arcoblue-1), 0.3) 0%, rgba(var(--purple-1), 0.2) 100%);
  padding: 1.5rem;
  border-radius: 8px;
  transition: all 0.3s;
}

.stats-row :deep(.arco-statistic:hover) {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

.preview-hint {
  margin-bottom: 1rem;
  border-radius: 8px;
}

.table-container {
  margin: 1.5rem 0;
}

.table-container :deep(.arco-table) {
  border-radius: 8px;
  overflow: hidden;
}

.actions {
  margin-top: 1.5rem;
  display: flex;
  justify-content: center;
}
</style>

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
        <a-card :bordered="false" class="stat-card">
          <div class="stat-content">
            <div class="stat-prefix"><icon-list /></div>
            <div class="stat-info">
              <div class="stat-title">工作表</div>
              <div class="stat-value">{{ statistics.sheetName || '-' }}</div>
            </div>
          </div>
        </a-card>
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
import { useDataStore } from '@/stores/dataStore'

const emit = defineEmits(['next', 'prev'])

const dataStore = useDataStore()

const statistics = computed(() => {
  if (!dataStore.rawData || !Array.isArray(dataStore.rawData) || dataStore.rawData.length === 0) {
    return {
      totalRows: 0,
      columnCount: 0,
      sheetName: '-'
    }
  }
  
  const firstRow = dataStore.rawData[0]
  const headers = Object.keys(firstRow || {})
  
  return {
    totalRows: dataStore.rawData.length,
    columnCount: headers.length,
    sheetName: dataStore.currentFile?.name || '-'
  }
})

const previewData = computed(() => {
  if (!dataStore.rawData || !Array.isArray(dataStore.rawData)) {
    return []
  }
  return dataStore.rawData.slice(0, 50)
})

const headers = computed(() => {
  if (!dataStore.rawData || !Array.isArray(dataStore.rawData) || dataStore.rawData.length === 0) {
    return []
  }
  return Object.keys(dataStore.rawData[0] || {})
})

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

.stat-card {
  background: linear-gradient(135deg, rgba(var(--arcoblue-1), 0.3) 0%, rgba(var(--purple-1), 0.2) 100%);
  border-radius: 8px;
  transition: all 0.3s;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

.stat-content {
  display: flex;
  align-items: center;
  padding: 0.5rem;
}

.stat-prefix {
  margin-right: 1rem;
  font-size: 24px;
  color: var(--color-primary);
}

.stat-info {
  flex: 1;
}

.stat-title {
  font-size: 0.875rem;
  color: var(--color-text-2);
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-text-1);
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

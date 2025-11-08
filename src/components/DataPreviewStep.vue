<template>
  <a-card class="step-card" title="数据预览（原始数据）" :bordered="false">
    <template #extra>
      <a-tag color="blue">步骤 2</a-tag>
    </template>

    <!-- Statistics -->
    <a-row :gutter="16" class="stats-row">
      <a-col :span="8">
        <a-statistic title="总行数" :value="statistics.totalRows" />
      </a-col>
      <a-col :span="8">
        <a-statistic title="列数" :value="statistics.columnCount" />
      </a-col>
      <a-col :span="8">
        <a-statistic title="工作表" :value="statistics.sheetName" value-from="center" />
      </a-col>
    </a-row>

    <a-divider />

    <!-- Data Preview -->
    <a-alert type="warning" :closable="false" class="preview-hint">
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
        :bordered="true"
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
        <template #icon>
          <icon-right />
        </template>
        开始处理数据
      </a-button>
    </a-space>
  </a-card>
</template>

<script setup>
import { computed } from 'vue'
import { 
  IconInfoCircle,
  IconLeft,
  IconRight 
} from '@arco-design/web-vue/es/icon'
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
}

.stats-row {
  margin-bottom: 1.5rem;
}

.preview-hint {
  margin-bottom: 1rem;
}

.table-container {
  margin: 1.5rem 0;
}

.actions {
  margin-top: 1.5rem;
  display: flex;
  justify-content: center;
}
</style>

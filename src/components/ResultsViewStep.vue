<template>
  <a-card class="step-card" title="查看处理结果" :bordered="false">
    <template #extra>
      <a-tag color="green">步骤 4</a-tag>
    </template>

    <!-- Processing Statistics -->
    <a-row :gutter="16" class="stats-row">
      <a-col :span="6">
        <a-card :bordered="false" class="stat-card">
          <a-statistic title="删除合计行" :value="stats?.totalRowsRemoved || 0" />
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card :bordered="false" class="stat-card">
          <a-statistic title="删除不完整行" :value="stats?.incompleteTimeRowsRemoved || 0" />
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card :bordered="false" class="stat-card">
          <a-statistic title="车间列分列" :value="stats?.workshopColumnSplit ? '✓' : '-'" />
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card :bordered="false" class="stat-card">
          <a-statistic title="维修人分类" :value="stats?.repairPersonClassified ? '✓' : '-'" />
        </a-card>
      </a-col>
    </a-row>

    <a-alert type="success" :closable="false" class="success-alert">
      <template #icon>
        <icon-check-circle />
      </template>
      ✅ 数据处理完成！您可以预览处理后的数据或直接导出。
    </a-alert>

    <!-- Data Preview -->
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

    <!-- Actions -->
    <a-space class="actions" :size="16" direction="vertical">
      <a-space :size="16">
        <a-button type="primary" size="large" @click="$emit('next')">
          <template #icon>
            <icon-bar-chart />
          </template>
          查看帕累托图
        </a-button>
      </a-space>

      <a-space :size="16">
        <a-button type="primary" size="large" status="success" @click="exportExcel">
          <template #icon>
            <icon-download />
          </template>
          下载Excel文件
        </a-button>
        <a-button size="large" status="success" @click="exportCsv">
          <template #icon>
            <icon-download />
          </template>
          下载CSV文件
        </a-button>
        <a-button size="large" @click="exportJson">
          <template #icon>
            <icon-download />
          </template>
          下载JSON文件
        </a-button>
      </a-space>

      <a-button @click="$emit('reset')">
        <template #icon>
          <icon-refresh />
        </template>
        处理新文件
      </a-button>
    </a-space>
  </a-card>
</template>

<script setup>
import { computed } from 'vue'
import { Message } from '@arco-design/web-vue'
import { IconCheckCircle, IconBarChart, IconDownload, IconRefresh } from '@arco-design/web-vue/es/icon'
import { useDataStore } from '@/stores/dataStore'
import { useDataExporter } from '@/composables/useDataExporter'
import { COLUMN_MAPPINGS } from '@/config/constants'

const emit = defineEmits(['next', 'reset'])

const dataStore = useDataStore()
const { exportToExcel, exportToCsv, exportToJson } = useDataExporter()

const stats = computed(() => dataStore.stats)
const processedData = computed(() => dataStore.processedData || [])
const previewData = computed(() => processedData.value.slice(0, 50))

const columns = computed(() => {
  if (!processedData.value || processedData.value.length === 0) return []
  
  const cols = [
    {
      title: '#',
      slotName: 'index',
      width: 60,
      align: 'center',
      fixed: 'left',
    }
  ]
  
  // Get all unique column names
  const allColumns = new Set()
  processedData.value.forEach(row => {
    Object.keys(row).forEach(key => allColumns.add(key))
  })
  
  Array.from(allColumns).forEach(col => {
    cols.push({
      title: col,
      dataIndex: col,
      width: 150,
      ellipsis: true,
      tooltip: true,
    })
  })
  
  return cols
})

async function exportExcel() {
  try {
    await exportToExcel(processedData.value)
    Message.success('Excel文件已成功导出')
  } catch (error) {
    Message.error(error.message || 'Excel导出失败')
  }
}

async function exportCsv() {
  try {
    await exportToCsv(processedData.value)
    Message.success('CSV文件已成功导出')
  } catch (error) {
    Message.error(error.message || 'CSV导出失败')
  }
}

async function exportJson() {
  try {
    await exportToJson(processedData.value)
    Message.success('JSON文件已成功导出')
  } catch (error) {
    Message.error(error.message || 'JSON导出失败')
  }
}
</script>

<style scoped>
.step-card {
  animation: fadeIn 0.3s ease-in-out;
}

.stats-row {
  margin-bottom: 1.5rem;
}

.stat-card {
  background: var(--color-fill-1);
}

.success-alert {
  margin: 1.5rem 0;
}

.table-container {
  margin: 1.5rem 0;
}

.actions {
  margin-top: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>

<template>
  <a-card class="step-card" :bordered="false">
    <template #title>
      <div class="card-title">
        <icon-check-circle :size="24" style="margin-right: 8px;" />
        <span>查看处理结果</span>
      </div>
    </template>
    <template #extra>
      <a-tag color="green">步骤 4/5</a-tag>
    </template>

    <!-- Processing Statistics -->
    <a-row :gutter="16" class="stats-row">
      <a-col :span="6">
        <a-card :bordered="false" class="stat-card">
          <a-statistic title="删除合计行" :value="stats?.totalRowsRemoved || 0">
            <template #prefix>
              <icon-delete />
            </template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card :bordered="false" class="stat-card">
          <a-statistic title="删除不完整行" :value="stats?.incompleteTimeRowsRemoved || 0">
            <template #prefix>
              <icon-close-circle />
            </template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card :bordered="false" class="stat-card">
          <a-statistic title="车间列分列" :value="stats?.workshopColumnSplit ? '✓' : '-'">
            <template #prefix>
              <icon-apps />
            </template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card :bordered="false" class="stat-card">
          <a-statistic title="维修人分类" :value="stats?.repairPersonClassified ? '✓' : '-'">
            <template #prefix>
              <icon-user-group />
            </template>
          </a-statistic>
        </a-card>
      </a-col>
    </a-row>

    <a-alert type="success" :closable="false" class="success-alert">
      <template #icon>
        <icon-check-circle-fill />
      </template>
      <strong>数据处理完成！</strong>您可以预览处理后的数据或直接导出。
    </a-alert>

    <!-- Data Preview -->
    <div class="table-container">
      <a-table
        :columns="columns"
        :data="previewData"
        :pagination="{ pageSize: 20 }"
        :scroll="{ x: '100%' }"
        :stripe="true"
        :bordered="{ wrapper: true, cell: true }"
        size="medium"
      >
        <template #index="{ rowIndex }">
          {{ rowIndex + 1 }}
        </template>
      </a-table>
    </div>

    <!-- Actions -->
    <a-space class="actions" :size="16" direction="vertical">
      <a-button type="primary" size="large" @click="$emit('next')" class="gradient-btn">
        <template #icon>
          <icon-bar-chart />
        </template>
        查看帕累托图
      </a-button>

      <a-space :size="16" class="export-buttons">
        <a-button type="primary" size="large" status="success" @click="exportExcel">
          <template #icon>
            <icon-download />
          </template>
          导出 Excel
        </a-button>
        <a-button size="large" @click="exportCsv">
          <template #icon>
            <icon-download />
          </template>
          导出 CSV
        </a-button>
        <a-button size="large" @click="exportJson">
          <template #icon>
            <icon-download />
          </template>
          导出 JSON
        </a-button>
      </a-space>

      <a-button @click="$emit('reset')" status="warning">
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

.stat-card {
  background: linear-gradient(135deg, rgba(var(--green-1), 0.3) 0%, rgba(var(--arcoblue-1), 0.2) 100%);
  border-radius: 8px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.stat-card :deep(.arco-statistic-prefix) {
  color: rgb(var(--green-6));
}

.success-alert {
  margin: 1.5rem 0;
  border-radius: 8px;
  background: linear-gradient(135deg, rgba(var(--green-1), 0.4) 0%, rgba(var(--green-2), 0.3) 100%);
}

.table-container {
  margin: 1.5rem 0;
}

.table-container :deep(.arco-table) {
  border-radius: 8px;
}

.actions {
  margin-top: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.export-buttons {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}

.gradient-btn {
  background: linear-gradient(135deg, rgb(var(--arcoblue-6)) 0%, rgb(var(--purple-6)) 100%);
  border: none;
  padding: 0 2rem;
}

.gradient-btn:hover {
  background: linear-gradient(135deg, rgb(var(--arcoblue-7)) 0%, rgb(var(--purple-7)) 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(var(--arcoblue-6), 0.3);
}
</style>

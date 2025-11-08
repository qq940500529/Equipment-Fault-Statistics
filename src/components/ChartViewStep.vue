<template>
  <a-card class="step-card" title="数据可视化 - 帕累托图" :bordered="false">
    <template #extra>
      <a-tag color="blue">步骤 5</a-tag>
    </template>

    <!-- Controls -->
    <a-space :size="16" class="controls" wrap>
      <a-space>
        <span class="control-label">选择指标：</span>
        <a-radio-group v-model="currentMetric" type="button">
          <a-radio value="waitTime">等待时间h</a-radio>
          <a-radio value="repairTime">维修时间h</a-radio>
          <a-radio value="faultTime">故障时间h</a-radio>
        </a-radio-group>
      </a-space>

      <a-button @click="toggleTop20">
        <template #icon>
          <icon-filter />
        </template>
        {{ showTop20Only ? '显示全部' : '仅显示关键项' }}
      </a-button>

      <a-button :disabled="navigationStack.length === 0" @click="goBack">
        <template #icon>
          <icon-left />
        </template>
        返回
      </a-button>

      <a-button @click="resetChart">
        <template #icon>
          <icon-refresh />
        </template>
        重置
      </a-button>
    </a-space>

    <!-- Info Alert -->
    <a-alert type="info" :closable="false" class="info-alert">
      <template #icon>
        <icon-info-circle />
      </template>
      <div class="info-content">
        <p><strong>操作说明：</strong></p>
        <ul>
          <li>点击柱状图可以钻取到下一级（车间 → 设备 → 设备编号 → 失效类型）</li>
          <li>蓝色柱状图代表贡献80%值的关键项，绿色代表其余次要项</li>
        </ul>
      </div>
    </a-alert>

    <!-- Chart Container -->
    <div ref="chartContainer" class="chart-container"></div>

    <!-- Back to Results -->
    <a-space class="actions" :size="16">
      <a-button @click="$emit('back')">
        <template #icon>
          <icon-left />
        </template>
        返回处理结果
      </a-button>
    </a-space>
  </a-card>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { 
  IconFilter,
  IconLeft,
  IconRefresh,
  IconInfoCircle 
} from '@arco-design/web-vue/es/icon'
import { useDataStore } from '@/stores/dataStore'
import { useParetoChart } from '@/composables/useParetoChart'

const emit = defineEmits(['back'])

const dataStore = useDataStore()
const chartContainer = ref(null)

const {
  currentMetric,
  showTop20Only,
  navigationStack,
  initChart,
  switchMetric,
  toggleTop20,
  goBack,
  resetChart,
  resize,
  dispose,
} = useParetoChart()

onMounted(() => {
  if (chartContainer.value && dataStore.processedData) {
    initChart(chartContainer.value, dataStore.processedData)
  }
  
  // Handle window resize
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  dispose()
})

watch(currentMetric, (newMetric) => {
  switchMetric(newMetric)
})

function handleResize() {
  resize()
}
</script>

<style scoped>
.step-card {
  animation: fadeIn 0.3s ease-in-out;
}

.controls {
  margin-bottom: 1.5rem;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
}

.control-label {
  font-weight: 500;
  color: var(--color-text-2);
}

.info-alert {
  margin-bottom: 1.5rem;
}

.info-content ul {
  margin: 0.5rem 0 0 0;
  padding-left: 1.5rem;
}

.info-content p {
  margin: 0;
}

.chart-container {
  width: 100%;
  height: 600px;
  margin: 1.5rem 0;
}

.actions {
  margin-top: 1.5rem;
  display: flex;
  justify-content: center;
}
</style>

<template>
  <a-layout class="layout-container">
    <a-layout-header class="header">
      <div class="header-content">
        <div class="header-icon">
          <icon-apps :size="48" />
        </div>
        <h1 class="header-title gradient-text">设备故障统计数据处理系统</h1>
        <p class="header-subtitle">Equipment Fault Statistics System</p>
        <p class="header-description">
          <icon-safe :size="16" style="margin-right: 4px; vertical-align: middle;" />
          纯前端Excel数据处理与可视化平台 · 本地处理 · 数据安全
        </p>
      </div>
    </a-layout-header>

    <a-layout-content class="content">
      <a-steps
        :current="currentStep - 1"
        type="navigation"
        class="steps-container"
      >
        <a-step title="上传文件" description="选择Excel文件">
          <template #icon>
            <icon-upload />
          </template>
        </a-step>
        <a-step title="数据预览" description="查看原始数据">
          <template #icon>
            <icon-eye />
          </template>
        </a-step>
        <a-step title="数据处理" description="转换和清洗">
          <template #icon>
            <icon-sync />
          </template>
        </a-step>
        <a-step title="查看结果" description="处理后数据">
          <template #icon>
            <icon-check-circle />
          </template>
        </a-step>
        <a-step title="数据可视化" description="帕累托图">
          <template #icon>
            <icon-bar-chart />
          </template>
        </a-step>
      </a-steps>

      <div class="main-content">
        <!-- Step 1: File Upload -->
        <FileUploadStep v-show="currentStep === 1" @next="handleStepChange(2)" />
        
        <!-- Step 2: Data Preview -->
        <DataPreviewStep v-show="currentStep === 2" @next="handleStepChange(3)" @prev="handleStepChange(1)" />
        
        <!-- Step 3: Data Processing -->
        <DataProcessingStep v-show="currentStep === 3" @next="handleStepChange(4)" />
        
        <!-- Step 4: Results -->
        <ResultsViewStep v-show="currentStep === 4" @next="handleStepChange(5)" @reset="handleReset" />
        
        <!-- Step 5: Chart -->
        <ChartViewStep v-show="currentStep === 5" @back="handleStepChange(4)" />
      </div>
    </a-layout-content>

    <a-layout-footer class="footer">
      <div class="footer-content">
        <p class="footer-text">
          <icon-heart-fill :size="16" style="color: #f5365c; margin-right: 4px; vertical-align: middle;" />
          设备故障统计数据处理系统 v0.5.0 | 
          <a href="https://github.com/qq940500529/Equipment-Fault-Statistics" target="_blank" rel="noopener noreferrer">
            <icon-github :size="16" style="margin: 0 4px; vertical-align: middle;" />
            GitHub仓库
          </a> | 
          <icon-safe :size="16" style="margin-right: 4px; vertical-align: middle;" />
          纯前端实现，数据本地处理
        </p>
      </div>
    </a-layout-footer>
  </a-layout>
</template>

<script setup>
import { computed } from 'vue'
import { 
  IconApps,
  IconSafe,
  IconUpload,
  IconEye,
  IconSync,
  IconCheckCircle,
  IconBarChart,
  IconHeartFill,
  IconGithub
} from '@arco-design/web-vue'
import { useDataStore } from '@/stores/dataStore'
import FileUploadStep from '@/components/FileUploadStep.vue'
import DataPreviewStep from '@/components/DataPreviewStep.vue'
import DataProcessingStep from '@/components/DataProcessingStep.vue'
import ResultsViewStep from '@/components/ResultsViewStep.vue'
import ChartViewStep from '@/components/ChartViewStep.vue'

const dataStore = useDataStore()
const currentStep = computed(() => dataStore.currentStep)

function handleStepChange(step) {
  dataStore.setCurrentStep(step)
}

function handleReset() {
  dataStore.reset()
  dataStore.setCurrentStep(1)
}
</script>

<style scoped>
.layout-container {
  min-height: 100vh;
}

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 3rem 1rem;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  animation: fadeIn 0.8s ease-out;
}

.header-icon {
  margin-bottom: 1rem;
  animation: slideInUp 0.6s ease-out;
}

.header-title {
  font-size: 2.8rem;
  margin: 0 0 0.75rem 0;
  font-weight: 700;
  color: white;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
  animation: slideInUp 0.7s ease-out;
}

.header-subtitle {
  font-size: 1.3rem;
  margin: 0 0 0.75rem 0;
  opacity: 0.95;
  font-weight: 500;
  animation: slideInUp 0.8s ease-out;
}

.header-description {
  font-size: 1.05rem;
  margin: 0;
  opacity: 0.9;
  font-weight: 400;
  animation: slideInUp 0.9s ease-out;
}

.content {
  padding: 2.5rem 1rem;
  min-height: calc(100vh - 300px);
}

.steps-container {
  max-width: 1200px;
  margin: 0 auto 2.5rem auto;
  padding: 2rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  animation: fadeIn 0.6s ease-out;
}

.steps-container :deep(.arco-steps-item-active .arco-steps-item-icon) {
  background: linear-gradient(135deg, rgb(var(--arcoblue-6)) 0%, rgb(var(--purple-6)) 100%);
  border-color: transparent;
}

.main-content {
  max-width: 1200px;
  margin: 0 auto;
  animation: slideInUp 0.7s ease-out;
}

.footer {
  background: linear-gradient(135deg, #2c3e50 0%, #3498db 100%);
  text-align: center;
  padding: 2.5rem 1rem;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
}

.footer-text {
  margin: 0;
  color: rgba(255, 255, 255, 0.9);
  font-size: 1rem;
  font-weight: 500;
}

.footer-text a {
  color: rgba(255, 255, 255, 0.95);
  text-decoration: none;
  transition: all 0.3s;
}

.footer-text a:hover {
  color: white;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
}
</style>

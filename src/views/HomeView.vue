<template>
  <a-layout class="layout-container">
    <a-layout-header class="header">
      <div class="header-content">
        <h1 class="header-title">设备故障统计数据处理系统</h1>
        <p class="header-subtitle">Equipment Fault Statistics System</p>
        <p class="header-description">纯前端Excel数据处理与可视化平台 - 本地处理，数据安全</p>
      </div>
    </a-layout-header>

    <a-layout-content class="content">
      <a-steps
        :current="currentStep - 1"
        type="navigation"
        class="steps-container"
      >
        <a-step title="上传文件" description="选择Excel文件" />
        <a-step title="数据预览" description="查看原始数据" />
        <a-step title="数据处理" description="转换和清洗" />
        <a-step title="查看结果" description="处理后数据" />
        <a-step title="数据可视化" description="帕累托图" />
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
      <p class="footer-text">
        设备故障统计数据处理系统 v0.5.0 | 
        <a href="https://github.com/qq940500529/Equipment-Fault-Statistics" target="_blank" rel="noopener noreferrer">GitHub仓库</a> | 
        纯前端实现，数据本地处理
      </p>
    </a-layout-footer>
  </a-layout>
</template>

<script setup>
import { computed } from 'vue'
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
  padding: 2rem 1rem;
  text-align: center;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
}

.header-title {
  font-size: 2.5rem;
  margin: 0 0 0.5rem 0;
  font-weight: 600;
}

.header-subtitle {
  font-size: 1.2rem;
  margin: 0 0 0.5rem 0;
  opacity: 0.9;
}

.header-description {
  font-size: 1rem;
  margin: 0;
  opacity: 0.8;
}

.content {
  padding: 2rem 1rem;
  background-color: var(--color-fill-1);
}

.steps-container {
  max-width: 1200px;
  margin: 0 auto 2rem auto;
  padding: 1.5rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.main-content {
  max-width: 1200px;
  margin: 0 auto;
}

.footer {
  background-color: var(--color-bg-2);
  text-align: center;
  padding: 2rem 1rem;
  border-top: 1px solid var(--color-border);
}

.footer-text {
  margin: 0;
  color: var(--color-text-2);
}

.footer-text a {
  color: rgb(var(--primary-6));
  text-decoration: none;
}

.footer-text a:hover {
  text-decoration: underline;
}
</style>

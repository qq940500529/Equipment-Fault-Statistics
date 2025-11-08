import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useDataStore = defineStore('data', () => {
  // State
  const rawData = ref(null)
  const processedData = ref(null)
  const currentFile = ref(null)
  const stats = ref(null)
  const deletedRows = ref(null)
  const validationResult = ref(null)
  const currentStep = ref(1)

  // Getters
  const hasRawData = computed(() => rawData.value !== null && rawData.value.length > 0)
  const hasProcessedData = computed(() => processedData.value !== null && processedData.value.length > 0)
  
  // Actions
  function setRawData(data) {
    rawData.value = data
  }

  function setProcessedData(data) {
    processedData.value = data
  }

  function setCurrentFile(file) {
    currentFile.value = file
  }

  function setStats(statsData) {
    stats.value = statsData
  }

  function setDeletedRows(data) {
    deletedRows.value = data
  }

  function setValidationResult(result) {
    validationResult.value = result
  }

  function setCurrentStep(step) {
    currentStep.value = step
  }

  function reset() {
    rawData.value = null
    processedData.value = null
    currentFile.value = null
    stats.value = null
    deletedRows.value = null
    validationResult.value = null
    currentStep.value = 1
  }

  return {
    // State
    rawData,
    processedData,
    currentFile,
    stats,
    deletedRows,
    validationResult,
    currentStep,
    // Getters
    hasRawData,
    hasProcessedData,
    // Actions
    setRawData,
    setProcessedData,
    setCurrentFile,
    setStats,
    setDeletedRows,
    setValidationResult,
    setCurrentStep,
    reset,
  }
})

import { ref } from 'vue'
import * as echarts from 'echarts'
import { COLUMN_MAPPINGS, CHART_CONFIG } from '@/config/constants'

/**
 * Pareto chart composable
 */
export function useParetoChart() {
  let chartInstance = null
  let rawData = []
  
  const currentMetric = ref('waitTime')
  const showTop20Only = ref(false)
  const navigationStack = ref([])
  const currentLevel = ref(0)
  const currentFilters = ref({})

  /**
   * Initialize chart
   */
  function initChart(container, data) {
    if (!container || !data) return

    rawData = data
    chartInstance = echarts.init(container)
    
    // Set initial chart
    updateChart()
    
    // Add click event
    chartInstance.on('click', handleBarClick)
  }

  /**
   * Update chart
   */
  function updateChart() {
    if (!chartInstance || !rawData) return

    const level = CHART_CONFIG.DRILL_DOWN_LEVELS[currentLevel.value]
    const metricCol = getMetricColumn(currentMetric.value)
    
    // Filter data based on current filters
    let filteredData = rawData
    Object.entries(currentFilters.value).forEach(([key, value]) => {
      filteredData = filteredData.filter(row => row[key] === value)
    })

    // Aggregate data by current level
    const aggregated = aggregateData(filteredData, level, metricCol)
    
    // Sort by value descending
    aggregated.sort((a, b) => b.value - a.value)
    
    // Calculate cumulative percentage
    const total = aggregated.reduce((sum, item) => sum + item.value, 0)
    let cumulative = 0
    aggregated.forEach(item => {
      cumulative += item.value
      item.cumulative = (cumulative / total) * 100
      item.isKey = item.cumulative <= CHART_CONFIG.PARETO_THRESHOLD * 100
    })

    // Filter top 20% if needed
    let displayData = aggregated
    if (showTop20Only.value) {
      displayData = aggregated.filter(item => item.isKey)
    }

    // Prepare chart data
    const categories = displayData.map(item => item.name)
    const values = displayData.map(item => item.value)
    const cumulatives = displayData.map(item => item.cumulative)
    const colors = displayData.map(item => item.isKey ? '#5470c6' : '#91cc75')

    // Chart options
    const option = {
      title: {
        text: `${level}维度 - ${getMetricName(currentMetric.value)}分析`,
        subtext: showTop20Only.value ? '仅显示关键项（累计贡献≤80%）' : '全部数据',
        left: 'center',
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
        },
        formatter: (params) => {
          let result = `${params[0].axisValue}<br/>`
          params.forEach(param => {
            if (param.seriesType === 'bar') {
              result += `${param.marker}${param.seriesName}: ${param.value.toFixed(2)}h<br/>`
            } else {
              result += `${param.marker}${param.seriesName}: ${param.value.toFixed(2)}%<br/>`
            }
          })
          return result
        },
      },
      legend: {
        data: [getMetricName(currentMetric.value), '累计百分比'],
        top: 40,
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '15%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: categories,
        axisLabel: {
          interval: 0,
          rotate: 45,
          fontSize: 10,
        },
      },
      yAxis: [
        {
          type: 'value',
          name: getMetricName(currentMetric.value) + ' (h)',
          position: 'left',
        },
        {
          type: 'value',
          name: '累计百分比 (%)',
          position: 'right',
          min: 0,
          max: 100,
        },
      ],
      series: [
        {
          name: getMetricName(currentMetric.value),
          type: 'bar',
          data: values,
          itemStyle: {
            color: (params) => colors[params.dataIndex],
          },
          label: {
            show: false,
          },
        },
        {
          name: '累计百分比',
          type: 'line',
          yAxisIndex: 1,
          data: cumulatives,
          smooth: true,
          itemStyle: {
            color: '#ee6666',
          },
          lineStyle: {
            width: 2,
          },
          symbolSize: 8,
        },
      ],
    }

    chartInstance.setOption(option, true)
  }

  /**
   * Aggregate data
   */
  function aggregateData(data, groupByColumn, valueColumn) {
    const groups = {}
    
    data.forEach(row => {
      const key = row[groupByColumn] || '未知'
      if (!groups[key]) {
        groups[key] = 0
      }
      groups[key] += parseFloat(row[valueColumn]) || 0
    })

    return Object.entries(groups).map(([name, value]) => ({
      name,
      value,
    }))
  }

  /**
   * Handle bar click for drill-down
   */
  function handleBarClick(params) {
    if (currentLevel.value >= CHART_CONFIG.DRILL_DOWN_LEVELS.length - 1) {
      return // Already at最深 level
    }

    const currentLevelName = CHART_CONFIG.DRILL_DOWN_LEVELS[currentLevel.value]
    const clickedValue = params.name

    // Save current state to navigation stack
    navigationStack.value.push({
      level: currentLevel.value,
      filters: { ...currentFilters.value },
    })

    // Update filters
    currentFilters.value[currentLevelName] = clickedValue

    // Move to next level
    currentLevel.value++

    // Update chart
    updateChart()
  }

  /**
   * Go back to previous level
   */
  function goBack() {
    if (navigationStack.value.length === 0) return

    const previousState = navigationStack.value.pop()
    currentLevel.value = previousState.level
    currentFilters.value = previousState.filters

    updateChart()
  }

  /**
   * Reset chart to initial state
   */
  function resetChart() {
    currentLevel.value = 0
    currentFilters.value = {}
    navigationStack.value = []
    showTop20Only.value = false
    currentMetric.value = 'waitTime'
    updateChart()
  }

  /**
   * Switch metric
   */
  function switchMetric(metric) {
    currentMetric.value = metric
    updateChart()
  }

  /**
   * Toggle top 20% display
   */
  function toggleTop20() {
    showTop20Only.value = !showTop20Only.value
    updateChart()
  }

  /**
   * Resize chart
   */
  function resize() {
    if (chartInstance) {
      chartInstance.resize()
    }
  }

  /**
   * Dispose chart
   */
  function dispose() {
    if (chartInstance) {
      chartInstance.dispose()
      chartInstance = null
    }
  }

  /**
   * Get metric column name
   */
  function getMetricColumn(metric) {
    const mapping = {
      waitTime: COLUMN_MAPPINGS.WAIT_TIME,
      repairTime: COLUMN_MAPPINGS.REPAIR_TIME,
      faultTime: COLUMN_MAPPINGS.FAULT_TIME,
    }
    return mapping[metric] || COLUMN_MAPPINGS.WAIT_TIME
  }

  /**
   * Get metric display name
   */
  function getMetricName(metric) {
    const mapping = {
      waitTime: '等待时间',
      repairTime: '维修时间',
      faultTime: '故障时间',
    }
    return mapping[metric] || '等待时间'
  }

  return {
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
  }
}

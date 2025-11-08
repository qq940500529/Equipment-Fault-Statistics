# 帕累托图功能实现 - 测试指南
# Pareto Chart Implementation - Testing Guide

## 快速开始 (Quick Start)

### 启动本地服务器 (Start Local Server)
```bash
npm run serve
```
然后在浏览器中打开: http://localhost:8000

Then open in browser: http://localhost:8000

### 测试流程 (Testing Flow)

1. **上传数据** (Upload Data)
   - 点击"选择Excel文件" (Click "Select Excel File")
   - 选择 `examples/10月份维修数据.xlsx` (Select the sample file)
   - 等待数据加载和验证 (Wait for data loading and validation)

2. **处理数据** (Process Data)
   - 查看数据预览 (Review data preview)
   - 点击"开始处理数据" (Click "Start Processing")
   - 等待处理完成 (Wait for processing to complete)

3. **查看帕累托图** (View Pareto Chart)
   - 点击"查看帕累托图"按钮 (Click "View Pareto Chart" button)
   - ✅ **验证点 1**: 图表宽度正确，完整显示所有内容
   - ✅ **验证点 2**: 图表正确显示车间级别数据

## 关键测试场景 (Key Test Scenarios)

### 场景 1: 图表宽度验证 (Chart Width Verification)
**目的 (Purpose)**: 验证修复问题1 - 图表宽度不足

**测试步骤 (Test Steps)**:
1. 清除浏览器缓存 (Clear browser cache)
2. 刷新页面 (Refresh page)
3. 上传数据并处理 (Upload and process data)
4. 点击"查看帕累托图" (Click "View Pareto Chart")

**预期结果 (Expected Result)**:
- ✅ 图表立即显示正确的宽度
- ✅ 所有柱状图和图例完全可见
- ✅ X轴标签不重叠
- ✅ 图表边距正确

**如果失败 (If Failed)**:
- 检查控制台是否有JavaScript错误
- 验证ECharts库是否正确加载
- 检查 `paretoChartContainer` div的宽度

### 场景 2: 数据钻取验证 (Data Drill-down Verification)
**目的 (Purpose)**: 验证修复问题2 - 数据钻取显示

**测试步骤 (Test Steps)**:
1. 在帕累托图页面 (On Pareto chart page)
2. 点击任意车间柱状图 (Click any workshop bar)
3. **验证**: 进入设备级别，面包屑显示 "全部 > [车间名]"
4. 点击任意设备柱状图 (Click any equipment bar)
5. **验证**: 进入设备编号级别，面包屑显示 "全部 > [车间名] > [设备名]"
6. 点击任意设备编号柱状图 (Click any equipment number bar)
7. **验证**: 进入失效类型级别，面包屑显示完整路径

**预期结果 (Expected Result)**:
- ✅ 每次钻取后，图表立即更新
- ✅ 显示的数据正确过滤
- ✅ 柱状图数量减少（因为过滤）
- ✅ 图表宽度保持正确
- ✅ 返回按钮在有历史时启用

### 场景 3: 返回导航测试 (Back Navigation Test)
**测试步骤 (Test Steps)**:
1. 钻取到第3或第4级 (Drill down to level 3 or 4)
2. 点击"返回"按钮 (Click "Back" button)
3. **验证**: 返回到上一级，数据正确
4. 继续点击"返回"直到顶层 (Continue clicking "Back" to top level)

**预期结果 (Expected Result)**:
- ✅ 每次返回后数据正确还原
- ✅ 图表宽度保持正常
- ✅ 到达顶层后，返回按钮禁用

### 场景 4: 指标切换测试 (Metric Switching Test)
**测试步骤 (Test Steps)**:
1. 在任意层级 (At any level)
2. 点击"维修时间h" (Click "Repair Time")
3. **验证**: 图表更新，显示维修时间数据
4. 点击"故障时间h" (Click "Fault Time")
5. **验证**: 图表更新，显示故障时间数据
6. 点击"等待时间h" (Click "Wait Time")

**预期结果 (Expected Result)**:
- ✅ 每次切换后，图表数据正确更新
- ✅ Y轴标签更新为对应指标
- ✅ 图表标题显示当前指标
- ✅ 宽度保持正常

### 场景 5: 前20%筛选测试 (Top 20% Filter Test)
**测试步骤 (Test Steps)**:
1. 在顶层（车间级别）(At top level - workshop)
2. 点击"仅显示前20%" (Click "Show Top 20% Only")
3. **验证**: 图表只显示累计到20%的项
4. 再次点击按钮 (Click button again)
5. **验证**: 显示所有数据

**预期结果 (Expected Result)**:
- ✅ 筛选后柱状图数量减少
- ✅ 只显示累计百分比≤20%的项
- ✅ 按钮文本更新（"仅显示前20%" ↔ "显示全部"）
- ✅ 图表宽度保持正常

### 场景 6: 重置功能测试 (Reset Functionality Test)
**测试步骤 (Test Steps)**:
1. 执行多次钻取和指标切换 (Perform multiple drill-downs and metric switches)
2. 启用"仅显示前20%" (Enable "Top 20% Only")
3. 点击"重置"按钮 (Click "Reset" button)

**预期结果 (Expected Result)**:
- ✅ 返回到车间级别
- ✅ 指标恢复到"等待时间h"
- ✅ 显示全部数据
- ✅ 返回按钮禁用
- ✅ 图表宽度正常

### 场景 7: 响应式测试 (Responsive Design Test)
**测试步骤 (Test Steps)**:
1. 在桌面尺寸（1920px）查看图表
2. 调整到平板尺寸（768px）
3. 调整到移动尺寸（480px）

**预期结果 (Expected Result)**:
- ✅ 桌面：图表高度600px，控制按钮横向排列
- ✅ 平板：图表可能调整，按钮可能换行
- ✅ 移动：图表高度400px，按钮垂直排列
- ✅ 所有尺寸下图表都正确显示

## 性能测试 (Performance Testing)

### 测试指标 (Metrics to Check)
1. **图表渲染时间** (Chart Rendering Time)
   - 期望: <500ms
   - 实际: _____

2. **钻取响应时间** (Drill-down Response Time)
   - 期望: <300ms
   - 实际: _____

3. **指标切换时间** (Metric Switch Time)
   - 期望: <200ms
   - 实际: _____

4. **内存使用** (Memory Usage)
   - 期望: <50MB
   - 实际: _____

## 浏览器兼容性 (Browser Compatibility)

测试以下浏览器 (Test on the following browsers):
- [ ] Chrome/Edge 90+ (Desktop)
- [ ] Firefox 88+ (Desktop)
- [ ] Safari 14+ (macOS)
- [ ] Chrome (Mobile)
- [ ] Safari (iOS)

## 常见问题排查 (Troubleshooting)

### 问题: 图表不显示 (Chart Not Displaying)
**检查 (Check)**:
1. 控制台是否有错误? (Console errors?)
2. ECharts是否加载? (ECharts loaded?)
3. `paretoChartContainer` div存在? (Container div exists?)

### 问题: 宽度仍然不正确 (Width Still Incorrect)
**检查 (Check)**:
1. `resize()` 是否被调用? (resize() called?)
2. setTimeout延迟是否足够? (setTimeout delay sufficient?)
3. CSS过渡是否完成? (CSS transitions complete?)

### 问题: 钻取不工作 (Drill-down Not Working)
**检查 (Check)**:
1. 点击事件是否绑定? (Click events bound?)
2. `handleChartClick` 是否被调用? (handleChartClick called?)
3. 数据过滤是否正确? (Data filtering correct?)

## 测试报告模板 (Test Report Template)

```markdown
## 测试报告 (Test Report)
测试日期 (Date): __________
测试人员 (Tester): __________
浏览器 (Browser): __________
操作系统 (OS): __________

### 测试结果 (Test Results)
- [ ] 场景1: 图表宽度验证 - PASS/FAIL
- [ ] 场景2: 数据钻取验证 - PASS/FAIL
- [ ] 场景3: 返回导航测试 - PASS/FAIL
- [ ] 场景4: 指标切换测试 - PASS/FAIL
- [ ] 场景5: 前20%筛选测试 - PASS/FAIL
- [ ] 场景6: 重置功能测试 - PASS/FAIL
- [ ] 场景7: 响应式测试 - PASS/FAIL

### 发现的问题 (Issues Found)
1. ___________________________
2. ___________________________

### 备注 (Notes)
___________________________
```

## 自动化测试 (Automated Testing)

虽然当前测试主要依赖手动测试，但可以考虑添加:
- Playwright/Cypress端到端测试
- 视觉回归测试
- 性能基准测试

## 联系方式 (Contact)

如有问题，请:
- 查看文档: `docs/PARETO_CHART_FIX.md`
- 提交Issue: GitHub Issues
- 检查代码: `js/modules/paretoChartGenerator.js`

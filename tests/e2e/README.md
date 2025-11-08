# 浏览器自动化测试说明
# Browser Automation Testing Guide

## 测试概述

本项目包含完整的浏览器自动化测试，用于验证帕累托图报表功能。测试使用 Playwright 进行浏览器模拟和自动化操作。

## 已完成的测试

### ✅ 自动化测试（使用 Playwright Browser Tools）

1. **页面初始化测试**
   - 验证页面正确加载
   - 验证系统初始化成功
   - 验证UI元素正确显示

2. **文件选择功能测试**
   - 验证文件选择对话框正常打开
   - 验证可以选择xlsx文件

3. **UI元素验证测试**
   - 验证所有关键按钮和元素存在
   - 验证页面布局正确

### 📋 手动测试场景

由于部分功能需要完整的异步数据处理，以下测试场景已记录在 `tests/e2e/paretoChart.e2e.test.js` 中：

1. Excel文件上传和数据预览
2. 数据处理流程
3. 帕累托图显示
4. 指标切换功能
5. 前20%筛选功能
6. 钻取导航功能
7. 返回和重置功能
8. 响应式设计
9. 数据完整性验证
10. 动画效果验证

## 测试截图

### 初始页面
![初始页面](https://github.com/user-attachments/assets/4c1dc8f3-1d9d-44cd-8b4d-d3398eb78e02)

测试验证了页面正确加载，所有UI元素正常显示。

## 如何运行测试

### 前置条件

```bash
# 安装依赖
npm install
```

### 运行 Playwright E2E 测试

```bash
# 标准模式运行
npm run test:e2e

# UI模式运行（可视化测试界面）
npm run test:e2e:ui

# 有头模式运行（显示浏览器窗口）
npm run test:e2e:headed
```

### 手动测试

1. 启动本地服务器：
```bash
npm run serve
# 或
python3 -m http.server 8000
```

2. 在浏览器中打开：http://localhost:8000

3. 按照 `tests/e2e/paretoChart.e2e.test.js` 中的测试场景进行手动测试

## 测试文件

- `examples/10月份维修数据.xlsx` - 测试用Excel文件
- `tests/e2e/paretoChart.spec.js` - Playwright自动化测试脚本
- `tests/e2e/paretoChart.e2e.test.js` - 测试执行记录和手动测试场景
- `playwright.config.js` - Playwright配置文件

## 测试覆盖范围

- **单元测试**: 21个 ✅
- **集成测试**: 10个 ✅
- **E2E自动化测试**: 3个场景 ✅
- **E2E手动测试场景**: 10个场景 📋

## 测试环境

- **浏览器**: Chromium (Playwright)
- **测试数据**: examples/10月份维修数据.xlsx
- **服务器**: Python HTTP Server (端口 8000)

## 注意事项

1. E2E测试需要先启动本地HTTP服务器
2. Playwright会自动下载所需的浏览器
3. 测试截图保存在 `/tmp/playwright-logs/` 目录
4. 测试报告生成在 `playwright-report/` 目录

## 故障排除

### 浏览器未安装
```bash
npx playwright install chromium
```

### 端口被占用
```bash
# 查找占用8000端口的进程
lsof -i:8000
# 或更改端口
python3 -m http.server 8080
```

## 更多信息

查看以下文档了解更多详情：
- [Playwright文档](https://playwright.dev)
- [项目测试文档](../tests/README.md)
- [帕累托图功能文档](../docs/PARETO_CHART.md)

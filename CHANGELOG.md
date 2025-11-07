# 变更日志 (Changelog)

本文件记录了项目的所有重要变更。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，
本项目遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [未发布]

### 计划中
- Phase 2: Excel文件处理功能
- Phase 3: 数据验证功能
- Phase 4: 数据转换功能
- Phase 5: 数据导出功能

## [0.2.0] - 2024-11-07 - Phase 1 完成

### 新增
- 完整的HTML页面框架（index.html）
  - 5步骤工作流界面
  - 拖拽上传功能区
  - 数据预览区域
  - 进度指示器
  - 导出功能按钮
- CSS样式系统
  - main.css: 全局样式和布局（5KB）
  - components.css: 可复用UI组件（7.5KB）
  - 响应式设计支持
- JavaScript模块结构
  - main.js: 应用主逻辑框架（7.6KB）
  - config/constants.js: 常量定义（2.6KB）
  - utils/dateUtils.js: 日期处理工具（4.7KB）
  - utils/helpers.js: 辅助函数库（7.9KB）
- 第三方库集成（本地存储，支持离线）
  - SheetJS 0.20.2 (862KB)
  - ECharts 5.x (1.1MB)
  - Day.js 1.x (7KB)
  - Bootstrap 5.x (306KB)
- 文档更新
  - examples/README.md: 示例文件说明
  - tests/README.md: 测试策略指南
  - PHASE1_COMPLETION.md: Phase 1完成报告

### 变更
- 项目状态从Phase 0更新到Phase 1已完成
- 更新README.md反映实际项目结构
- 更新IMPLEMENTATION.md标记Phase 1任务完成状态

### 安全
- 修复XSS漏洞（showMessage函数使用安全的DOM操作）
- 实现输入验证和转义机制
- 遵循安全最佳实践

### 质量保证
- 所有JavaScript文件通过语法检查
- HTML结构验证通过
- HTTP服务器测试通过（200 OK）
- 代码安全审查完成

## [0.1.0] - Phase 0 完成

### 新增
- 添加GitHub功能配置
  - GitHub Actions工作流（部署和代码质量检查）
  - Issue模板（bug报告、功能请求、文档改进）
  - Pull Request模板
  - 贡献指南（CONTRIBUTING.md）
  - 行为准则（CODE_OF_CONDUCT.md）
  - 安全政策（SECURITY.md）
  - Dependabot配置
  - 仓库标签配置
- 项目架构设计文档（ARCHITECTURE.md）
- 技术规格说明文档（SPECIFICATION.md）
- 实施计划文档（IMPLEMENTATION.md）
- 数据结构文档（DATA_STRUCTURE.md）
- UI/UX设计文档（UI_UX_DESIGN.md）
- 项目概览文档（OVERVIEW.md）
- 项目README

### 规划
- 定义了9个开发阶段
- 确定了技术栈（原生JS、SheetJS、ECharts、Day.js、Bootstrap 5）
- 明确了核心功能需求
- 制定了质量保证标准

---

**说明**:
- `[未发布]` - 开发中但未发布的更改
- `[版本号]` - 已发布的版本
- 每个版本按照 新增/变更/弃用/移除/修复/安全 分类

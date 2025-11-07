# 变更日志 (Changelog)

本文件记录了项目的所有重要变更。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，
本项目遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [未发布]

### 新增
- CI/CD发布流水线
  - 手动触发的release workflow
  - 版本号验证（检查与已发布版本的冲突）
  - 自动打包release包（仅包含核心程序文件）
  - 排除测试、开发文档等非生产文件

### 变更
- 清理过时文档
  - 删除Phase完成报告文件（PHASE1_COMPLETION.md, PHASE2_COMPLETION.md, PHASE3_4_COMPLETION.md）
  - 删除开发总结文件（DEVELOPMENT_SUMMARY.md）
  - 删除Wiki相关文件（WIKI_DOCUMENTATION.md, WIKI_SUMMARY.txt, publish-wiki.sh）
  - 删除测试文件（test-modal.html）
- 更新README.md，移除已删除文件的引用

### 计划中
- Phase 5: 数据导出功能

## [0.3.0] - 2024-11-07 - Phase 3-4 完成

### 新增
- **数据验证模块** (Phase 3)
  - dataValidator.js: 数据验证模块
    - 必需列验证
    - 数据类型验证
    - 日期格式验证
    - 空值检测
    - 验证结果显示（错误和警告）
    - 验证摘要生成
  - 单元测试（15个测试用例）
- **数据转换模块** (Phase 4)
  - dataTransformer.js: 核心数据转换模块，复刻VBA功能
    - 功能1: 删除"合计"行
    - 功能2: 车间列按"-"分列为车间和区域
    - 功能3: 维修人分类（维修工/电工/未知）
    - 功能4: 时间计算（等待时间、维修时间、故障时间）
    - 功能5: 删除时间不完整的行
    - 处理统计信息收集
  - 单元测试（23个测试用例）
- **主应用增强**
  - 集成数据验证和转换流程
  - 异步数据处理with进度更新
  - 验证结果显示（错误/警告分开显示）
  - 处理统计信息卡片显示
  - 处理后数据预览表格
  - 完整的错误处理机制
- **UI改进**
  - 验证结果容器（validationResult）
  - 处理统计卡片（processingStats）
  - 处理后数据表格显示（resultTable）
  - 步骤流程优化

### 变更
- main.js更新
  - 导入dataValidator和dataTransformer模块
  - 实现handleProcess()方法
  - 新增displayValidationResult()方法
  - 新增displayProcessingStats()方法
  - 新增displayProcessedDataPreview()方法
  - 更新handleReset()方法支持新模块
- 测试基础设施
  - 新增38个单元测试用例（dataValidator: 15, dataTransformer: 23）

### 技术实现
- 完整复刻VBA脚本的所有数据处理功能
- 保持与VBA相同的处理逻辑和结果
- 模块化设计，易于维护和扩展
- 完善的错误处理和用户反馈
- 高测试覆盖率

## [0.2.0] - 2024-11-07 - Phase 2 开发中

### 新增
- **Excel文件处理模块** (Phase 2)
  - fileUploader.js: 文件上传和验证模块
    - 文件类型验证（.xlsx, .xls）
    - 文件大小验证（最大50MB）
    - FileReader API集成
    - 完善的错误处理
  - dataParser.js: Excel数据解析模块
    - SheetJS集成，解析Excel工作簿
    - 表头提取和列映射
    - 必需列验证
    - 数据行提取（自动过滤空行）
    - 数据预览功能（前50行）
    - 数据统计信息
- **主应用更新**
  - 集成文件上传和数据解析模块
  - 异步文件处理流程
  - 实时进度更新
  - 数据统计信息显示
  - 数据预览表格（可滚动）
  - 改进的重置功能
- **测试基础设施**
  - 单元测试框架（Jest）
  - fileUploader模块单元测试
  - dataParser模块单元测试
  - Jest配置文件
- **常量配置增强**
  - 添加ALLOWED_TYPES文件类型验证
  - 统一MESSAGES对象结构
  - 列名映射改为camelCase格式

### 变更
- package.json更新
  - 版本号更新为0.2.0
  - 添加type: "module"支持ES6模块
  - 添加测试脚本
  - 添加Jest开发依赖
- index.html更新
  - 添加dataStats容器用于统计信息显示
- 项目状态从Phase 1更新到Phase 2开发中

### 技术改进
- 完整的ES6模块化架构
- async/await异步处理
- 完善的错误处理机制
- 用户友好的进度反馈
- 响应式数据预览界面

## [0.1.0] - 2024-11-07 - Phase 1 完成

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

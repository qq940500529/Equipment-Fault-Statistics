# 设备故障统计系统 (Equipment Fault Statistics System)

## 项目简介

这是一个纯前端的设备故障数据处理与可视化平台，用于处理设备维修记录的Excel数据，并生成统计图表。系统完全运行在浏览器端，无需后端服务器部署，支持离线使用。

## 核心功能

- ✅ **Excel文件上传与解析**: 支持.xlsx和.xls格式
- ✅ **数据清洗与转换**: 复刻VBA脚本的数据处理逻辑
- 🔄 **数据可视化**: 使用ECharts生成统计图表（开发中）
- ✅ **结果导出**: 支持Excel、CSV、JSON格式导出

## 技术特点

- **零部署**: 纯静态HTML/CSS/JavaScript，直接在浏览器中运行
- **离线运行**: 所有处理均在客户端完成，无需网络连接
- **数据安全**: 数据不上传到服务器，完全本地处理
- **跨平台**: 支持Windows、macOS、Linux等操作系统
- **无需安装**: 无需安装任何软件，打开HTML文件即可使用

## 项目状态

当前版本: **v0.3.0**

已完成阶段:
- ✅ **Phase 1** - 基础设施搭建
- ✅ **Phase 2** - Excel文件处理
- ✅ **Phase 3-4** - 数据验证与转换
- ✅ **Phase 5** - 数据导出功能

详细进度:
- [x] 架构设计文档
- [x] 技术规格说明
- [x] 实施计划
- [x] 数据结构文档
- [x] 基础设施搭建（Phase 1 已完成）
- [x] HTML页面框架
- [x] CSS样式系统
- [x] JavaScript模块结构
- [x] Excel文件处理（Phase 2 已完成）
  - [x] 文件上传和验证
  - [x] Excel数据解析
  - [x] 数据预览功能
- [x] 数据验证与转换（Phase 3-4 已完成）
  - [x] 数据验证模块
  - [x] 数据转换模块（完整复刻VBA功能）
  - [x] 单元测试与集成测试（87个测试用例）
- [x] 数据导出（Phase 5 已完成）
  - [x] Excel格式导出
  - [x] CSV格式导出
  - [x] JSON格式导出
- [ ] 数据可视化（Phase 6-7 - 规划中）
- [ ] 测试与优化（Phase 8-9 - 待进行）

## 文档导航

### 核心文档

1. **[架构设计文档](docs/ARCHITECTURE.md)** - 系统整体架构和技术选型
2. **[技术规格说明](docs/SPECIFICATION.md)** - VBA功能分析与JavaScript实现方案
3. **[实施计划](docs/IMPLEMENTATION.md)** - 详细的开发计划和任务分解
4. **[数据结构文档](docs/DATA_STRUCTURE.md)** - 数据格式和转换规则定义

### 文档说明

- **架构设计**: 了解系统的整体设计思路、技术栈选型和模块划分
- **技术规格**: 了解如何将VBA脚本的功能转换为JavaScript实现
- **实施计划**: 了解项目的开发阶段、任务清单和时间规划
- **数据结构**: 了解系统处理的数据格式和转换规则

## 快速开始

### 方式1: 直接运行（推荐）

1. 下载项目文件
2. 双击打开 `index.html`
3. 在浏览器中开始使用

### 方式2: 本地Web服务器

```bash
# 使用Python
python -m http.server 8000

# 使用Node.js
npx http-server

# 然后在浏览器中访问
# http://localhost:8000
```

### 方式3: 在线访问

```
# 部署到GitHub Pages后可直接访问
https://qq940500529.github.io/Equipment-Fault-Statistics/
```

## 功能说明

### 数据处理功能

系统复刻了VBA脚本的以下核心功能：

1. **删除"合计"行**: 自动识别并删除车间列值为"合计"的行
2. **车间列分列**: 将"车间-区域"格式的数据分割为两列
3. **维修人分类**: 根据姓名自动分类为"维修工"、"电工"或"未知"
4. **时间计算**: 
   - 等待时间 = 维修开始时间 - 报修时间
   - 维修时间 = 维修结束时间 - 维修开始时间
   - 故障时间 = 等待时间 + 维修时间
5. **数据清洗**: 删除时间数据不完整的行

### 维修人员分类

**维修工** (16人):
王兴森、孙长青、徐阴海、任扶民、吴长振、张玉柱、刘志强、杨明印、张金华、刘金财、崔树立、杨致敬、马圣强、刘子凯、何洪杰、刘佳文

**电工** (14人):
李润海、赵艳伟、吴霄、吴忠建、李之彦、宋桂良、崔金辉、李瑞召、万庆权、郭瑞臣、郭兆勤、赵同宽、肖木凯、赵燕伟

## 技术栈

### 核心技术
- **前端框架**: 原生JavaScript (ES6+)
- **Excel处理**: SheetJS (xlsx)
- **图表库**: Apache ECharts
- **日期处理**: Day.js
- **UI框架**: Bootstrap 5

### 开发工具
- Git - 版本控制
- ESLint - 代码检查
- Prettier - 代码格式化

## 浏览器兼容性

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## 项目结构

```
Equipment-Fault-Statistics/
├── index.html                 # 主页面 ✅
├── css/                       # 样式文件 ✅
│   ├── main.css              # 主样式
│   └── components.css        # 组件样式
├── js/                        # JavaScript源代码 ✅
│   ├── main.js               # 主应用逻辑
│   ├── modules/              # 业务逻辑模块 ✅
│   │   ├── fileUploader.js   # 文件上传模块 (Phase 2)
│   │   └── dataParser.js     # 数据解析模块 (Phase 2)
│   ├── config/               # 配置文件 ✅
│   │   └── constants.js      # 常量定义
│   └── utils/                # 工具函数 ✅
│       ├── dateUtils.js      # 日期处理
│       └── helpers.js        # 辅助函数
├── lib/                       # 第三方库 ✅
│   ├── xlsx.full.min.js      # SheetJS
│   ├── echarts.min.js        # ECharts
│   ├── dayjs.min.js          # Day.js
│   └── bootstrap/            # Bootstrap 5
├── docs/                      # 文档目录 ✅
│   ├── ARCHITECTURE.md       # 架构设计
│   ├── SPECIFICATION.md      # 技术规格
│   ├── IMPLEMENTATION.md     # 实施计划
│   ├── DATA_STRUCTURE.md     # 数据结构
│   └── OVERVIEW.md           # 项目概览
├── examples/                  # 示例文件 ✅
│   └── README.md             # 示例说明
├── tests/                     # 测试目录 ✅
│   ├── unit/                 # 单元测试
│   │   ├── fileUploader.test.js
│   │   └── dataParser.test.js
│   └── README.md             # 测试指南
├── CHANGELOG.md              # 变更日志 ✅
├── LICENSE                   # MIT许可证
└── README.md                 # 本文档

✅ = 已完成
🔄 = 进行中
待开发 = 后续阶段
```

## 开发路线图

### Phase 0: 规划阶段 ✅ 
- [x] 完成架构设计
- [x] 完成技术规格
- [x] 完成实施计划
- [x] 完成数据结构文档

### Phase 1: 基础设施搭建 ✅ (已完成)
- [x] 创建项目目录结构
- [x] 引入第三方库
- [x] 创建HTML页面框架
- [x] 创建基础样式
- [x] 实现核心工具函数
- [x] 完成应用初始化框架

### Phase 2: Excel文件处理 ✅ (已完成)
- [x] Excel文件上传与读取
- [x] 数据解析与验证
- [x] 数据预览功能

### Phase 3-4: 数据验证与转换 ✅ (已完成)
- [x] 数据验证模块
- [x] 数据转换模块（完整复刻VBA功能）
- [x] 单元测试（38个测试用例）

### Phase 5: 数据导出 (下一阶段)
- [ ] Excel格式导出
- [ ] CSV格式导出
- [ ] JSON格式导出

### Phase 6-7: 界面与图表 (计划中)
- [ ] 用户界面优化
- [ ] 数据可视化（ECharts）

### Phase 8-9: 测试与发布 (计划中)
- [ ] 全面测试
- [ ] 性能优化
- [ ] 正式发布

详细计划请参阅 [实施计划文档](docs/IMPLEMENTATION.md)

## GitHub功能

本项目配置了完善的GitHub功能，提供更好的协作体验：

### 🔄 自动化工作流
- **GitHub Actions**: 自动部署到GitHub Pages
- **代码质量检查**: 自动检查Markdown和JSON文件
- **Dependabot**: 自动更新依赖项

### 📝 Issue和PR模板
- **Bug报告模板**: 结构化的问题报告
- **功能请求模板**: 清晰的需求描述
- **文档改进模板**: 文档问题追踪
- **PR模板**: 标准化的代码审查流程

### 📚 项目文档
- **贡献指南**: [CONTRIBUTING.md](CONTRIBUTING.md)
- **行为准则**: [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)
- **安全政策**: [SECURITY.md](SECURITY.md)
- **变更日志**: [CHANGELOG.md](CHANGELOG.md)
- **许可证**: [LICENSE](LICENSE)

### 🏷️ 标签系统
- 类型标签: bug, enhancement, documentation
- 优先级标签: priority:high, priority:medium, priority:low
- 状态标签: status:in-progress, status:needs-review
- 组件标签: component:excel, component:ui, component:chart

## 贡献指南

欢迎贡献！我们已经配置了完善的GitHub工作流程：

- 📋 **提交问题**: 使用[Issue模板](https://github.com/qq940500529/Equipment-Fault-Statistics/issues/new/choose)报告bug或建议功能
- 🔀 **提交代码**: 查看[贡献指南](CONTRIBUTING.md)了解详细流程
- 📖 **改进文档**: 文档改进同样重要
- 🛡️ **安全问题**: 查看[安全政策](SECURITY.md)了解如何报告安全漏洞
- 📜 **行为准则**: 请遵守我们的[行为准则](CODE_OF_CONDUCT.md)

在开始之前，请：

1. 阅读[贡献指南](CONTRIBUTING.md)了解完整流程
2. 阅读架构文档了解系统设计
3. 阅读技术规格了解实现细节
4. 遵循代码规范和注释规范
5. 编写单元测试
6. 更新相关文档

## 许可证

本项目采用 MIT 许可证。详见 [LICENSE](LICENSE) 文件。

## 联系方式

- 项目仓库: https://github.com/qq940500529/Equipment-Fault-Statistics
- 问题反馈: [Issues](https://github.com/qq940500529/Equipment-Fault-Statistics/issues)
- 功能讨论: [Discussions](https://github.com/qq940500529/Equipment-Fault-Statistics/discussions)
- 安全问题: 查看[安全政策](SECURITY.md)

## 致谢

本项目基于Excel VBA脚本的功能需求开发，感谢原始需求提供者。

---

**注**: 本项目目前处于规划阶段，文档已完成，代码实现即将开始。欢迎Star和关注项目进展！
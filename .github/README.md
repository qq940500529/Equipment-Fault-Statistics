# GitHub配置文件

本目录包含GitHub仓库的配置文件，用于自动化工作流、Issue管理、PR流程等。

## 📁 目录结构

```
.github/
├── ISSUE_TEMPLATE/          # Issue模板
│   ├── bug_report.md       # Bug报告模板
│   ├── feature_request.md  # 功能请求模板
│   ├── documentation.md    # 文档改进模板
│   └── config.yml          # Issue模板配置
├── workflows/               # GitHub Actions工作流
│   ├── deploy.yml          # 部署到GitHub Pages
│   ├── quality.yml         # 代码质量检查
│   ├── sync-labels.yml     # 同步标签
│   ├── stale.yml           # 自动关闭过期Issue/PR
│   └── greetings.yml       # 欢迎首次贡献者
├── PULL_REQUEST_TEMPLATE.md # PR模板
├── CODEOWNERS              # 代码所有者配置
├── FUNDING.yml             # 赞助配置
├── dependabot.yml          # Dependabot自动更新配置
├── labels.yml              # 标签配置
├── REPOSITORY_SETUP.md     # 仓库配置指南
└── README.md               # 本文件
```

## 🔄 GitHub Actions工作流

### 1. deploy.yml - 部署工作流
- **触发条件**: 推送到`main`分支或手动触发
- **功能**: 自动部署网站到GitHub Pages
- **状态**: ✅ 已配置

### 2. quality.yml - 代码质量检查
- **触发条件**: 推送到`main`或`develop`分支，以及PR
- **功能**: 
  - Markdown文件格式检查
  - JSON文件验证
  - ESLint检查（如果配置）
- **状态**: ✅ 已配置

### 3. sync-labels.yml - 标签同步
- **触发条件**: `labels.yml`文件更改或手动触发
- **功能**: 自动同步标签配置到仓库
- **状态**: ✅ 已配置

### 4. stale.yml - 过期Issue/PR管理
- **触发条件**: 每天运行或手动触发
- **功能**: 
  - Issue 60天无活动标记为stale
  - PR 30天无活动标记为stale
  - 7天后自动关闭
- **状态**: ✅ 已配置

### 5. greetings.yml - 欢迎新贡献者
- **触发条件**: 首次创建Issue或PR
- **功能**: 自动发送欢迎消息
- **状态**: ✅ 已配置

## 📋 Issue模板

### Bug报告 (bug_report.md)
用于报告软件错误，包含：
- 问题描述
- 复现步骤
- 预期/实际行为
- 环境信息
- 测试文件信息

### 功能请求 (feature_request.md)
用于提出新功能建议，包含：
- 功能描述
- 使用场景
- 优先级
- 替代方案

### 文档改进 (documentation.md)
用于报告文档问题，包含：
- 文档位置
- 问题类型
- 改进建议

## 🔀 Pull Request模板

PR模板包含：
- 变更说明
- 变更类型（bug修复、新功能、重构等）
- 相关Issue
- 测试信息
- 检查清单

## 🏷️ 标签系统

标签定义在`labels.yml`中，包括：

### 类型标签
- `bug` - Bug报告
- `enhancement` - 功能改进
- `documentation` - 文档相关
- `question` - 疑问讨论

### 优先级标签
- `priority:high` - 高优先级
- `priority:medium` - 中优先级
- `priority:low` - 低优先级

### 状态标签
- `status:in-progress` - 进行中
- `status:blocked` - 被阻塞
- `status:needs-review` - 需要审查
- `status:ready` - 准备就绪
- `status:stale` - 长时间无活动

### 组件标签
- `component:excel` - Excel处理
- `component:ui` - 用户界面
- `component:chart` - 图表功能
- `component:data` - 数据处理
- `component:export` - 数据导出

### 特殊标签
- `good first issue` - 适合新手
- `help wanted` - 需要帮助
- `breaking change` - 破坏性变更
- `security` - 安全问题

## 👥 代码所有者 (CODEOWNERS)

定义了各个文件和目录的代码所有者，会自动：
- 为PR分配审查者
- 确保关键变更得到审查

## 🤖 Dependabot

配置在`dependabot.yml`中：
- **GitHub Actions**: 每周检查更新
- **npm**: 每周检查更新（当package.json存在时）
- 自动创建PR

## 💰 赞助 (FUNDING.yml)

支持配置多个赞助平台：
- GitHub Sponsors
- Patreon
- Open Collective
- Ko-fi
- 自定义链接

## 📖 使用指南

### 首次配置

1. 阅读 `REPOSITORY_SETUP.md` 了解详细配置步骤
2. 在GitHub设置中启用必要的功能
3. 手动运行`sync-labels.yml`同步标签
4. 测试Issue和PR模板

### 创建Issue

1. 访问 Issues → New Issue
2. 选择合适的模板
3. 填写所需信息
4. 提交Issue

### 创建Pull Request

1. Fork仓库并创建分支
2. 进行代码更改
3. 推送到你的Fork
4. 创建PR，模板会自动加载
5. 填写PR信息并提交

### 管理标签

1. 编辑 `.github/labels.yml`
2. 提交更改
3. `sync-labels.yml`会自动运行并同步标签

### 手动触发工作流

某些工作流支持手动触发：
1. 进入 Actions 标签
2. 选择工作流
3. 点击 "Run workflow"

## 🔧 维护

### 定期任务

- **每月**: 检查Dependabot PR
- **每季度**: 审查和更新标签
- **每季度**: 更新工作流配置
- **按需**: 更新Issue/PR模板

### 监控

- 检查Actions运行状态
- 监控stale bot行为
- 审查Dependabot PR

## 📚 参考文档

- [GitHub Actions文档](https://docs.github.com/en/actions)
- [Issue模板文档](https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests)
- [CODEOWNERS文档](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners)
- [Dependabot文档](https://docs.github.com/en/code-security/dependabot)

## ❓ 常见问题

### 标签没有自动创建？
运行一次`sync-labels.yml`工作流，或参考`REPOSITORY_SETUP.md`手动创建。

### Actions失败？
检查：
1. Actions权限设置
2. 工作流文件语法
3. 运行日志中的错误信息

### Dependabot不工作？
确保在仓库设置中启用了Dependabot。

---

如有问题，请查看 [REPOSITORY_SETUP.md](REPOSITORY_SETUP.md) 或提交Issue。

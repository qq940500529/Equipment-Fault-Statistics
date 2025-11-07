# GitHub仓库配置指南

本文档说明如何配置GitHub仓库以充分利用已添加的GitHub功能。

## 仓库设置 (Repository Settings)

### 1. GitHub Pages配置

1. 进入仓库 Settings → Pages
2. Source: 选择 "GitHub Actions"
3. 保存后，网站将部署到: `https://qq940500529.github.io/Equipment-Fault-Statistics/`

**⚠️ 重要安全提示**:
- 当前部署工作流会部署整个仓库（包括文档）
- 一旦创建实际网站文件（index.html等），必须更新 `.github/workflows/deploy.yml`
- 将 `path: '.'` 改为 `path: './dist'` 或 `path: './public'`
- 这样可以避免暴露敏感文件如 `.github/workflows/` 等

### 2. 标签配置 (Labels)

虽然我们提供了 `.github/labels.yml` 配置文件，但GitHub不会自动应用这些标签。需要手动创建或使用第三方工具：

**选项1: 手动创建**
1. 进入仓库 Issues → Labels
2. 根据 `.github/labels.yml` 创建标签

**选项2: 使用GitHub CLI**
```bash
# 安装 GitHub CLI
gh label create "bug" --color "d73a4a" --description "报告的问题或错误"
# 重复其他标签...
```

**选项3: 使用第三方工具**
- [github-label-sync](https://github.com/Financial-Times/github-label-sync)
- [Label Syncer Action](https://github.com/marketplace/actions/label-syncer)

### 3. 分支保护 (Branch Protection)

建议为 `main` 分支设置保护规则：

1. 进入 Settings → Branches
2. 添加规则应用到 `main` 分支
3. 建议启用：
   - ✅ Require a pull request before merging
   - ✅ Require approvals (至少1个)
   - ✅ Dismiss stale pull request approvals when new commits are pushed
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date before merging
   - ✅ Include administrators

### 4. Discussions启用

1. 进入 Settings → General
2. 在 Features 部分，勾选 "Discussions"
3. 这将启用社区讨论功能

### 5. Issue模板设置

Issue模板已经配置，会自动生效。用户创建Issue时会看到：
- 🐛 错误报告 (Bug Report)
- ✨ 功能请求 (Feature Request)
- 📝 文档改进 (Documentation)

### 6. Security设置

1. 进入 Security → Code security and analysis
2. 建议启用：
   - ✅ Dependency graph
   - ✅ Dependabot alerts
   - ✅ Dependabot security updates
   - ✅ Secret scanning (如果可用)

### 7. Actions权限

确保GitHub Actions有部署权限：

1. 进入 Settings → Actions → General
2. Workflow permissions: 选择 "Read and write permissions"
3. 勾选 "Allow GitHub Actions to create and approve pull requests"

### 8. 环境配置

为GitHub Pages部署配置环境：

1. 进入 Settings → Environments
2. 创建名为 `github-pages` 的环境
3. 不需要特殊保护规则（纯静态网站）

## Dependabot配置

Dependabot已通过 `.github/dependabot.yml` 配置，将自动：
- 每周检查GitHub Actions版本更新
- 每周检查npm依赖更新（如果存在package.json）
- 自动创建PR进行更新

## GitHub Actions工作流

### Deploy工作流 (deploy.yml)
- **触发**: 推送到 `main` 分支或手动触发
- **功能**: 自动部署到GitHub Pages
- **权限**: 需要Pages写入权限

### Quality工作流 (quality.yml)
- **触发**: 推送到 `main` 或 `develop` 分支，以及PR
- **功能**: 
  - Markdown文件格式检查
  - JSON文件验证
  - 代码质量检查（如果配置了ESLint）

## 代码所有者 (CODEOWNERS)

CODEOWNERS文件已配置，会自动：
- 为PR请求审查者
- 指定文件和目录的所有者

当前配置:
- 所有文件: @qq940500529
- 文档: @qq940500529
- GitHub配置: @qq940500529

## 赞助 (Sponsorship)

如果想启用GitHub Sponsors：

1. 编辑 `.github/FUNDING.yml`
2. 取消注释相应平台并填写用户名
3. 提交更改

## 验证配置

### 检查清单

- [ ] GitHub Pages已启用且可访问
- [ ] 标签已创建
- [ ] 分支保护规则已设置
- [ ] Discussions已启用
- [ ] Dependabot已启用
- [ ] GitHub Actions有正确权限
- [ ] Issue模板正常工作
- [ ] PR模板正常工作
- [ ] CODEOWNERS正常工作

### 测试建议

1. **测试Issue模板**
   - 创建一个测试Issue
   - 验证模板是否正确显示

2. **测试PR模板**
   - 创建一个测试PR
   - 验证模板是否正确显示

3. **测试Actions**
   - 推送一个更改到main分支
   - 检查Actions是否成功运行

4. **测试GitHub Pages**
   - 访问部署的网站
   - 确认可以正常访问

## 后续维护

### 定期检查

- 每月查看Dependabot PR并合并
- 每季度审查和更新标签
- 每季度审查分支保护规则
- 根据需要更新文档

### 更新配置

当项目演进时，记得更新：
- Issue模板（添加新类型）
- 标签（添加新分类）
- CODEOWNERS（添加新的代码所有者）
- 工作流（添加新的自动化）

## 问题排查

### GitHub Pages无法部署

1. 检查Actions权限
2. 检查工作流文件语法
3. 查看Actions运行日志

### Dependabot不工作

1. 确认已在Settings中启用
2. 检查 `.github/dependabot.yml` 语法
3. 确认有package.json文件（对于npm）

### 标签未显示

1. 确认已手动创建标签
2. GitHub不会自动从labels.yml创建标签

## 参考资源

- [GitHub Actions文档](https://docs.github.com/en/actions)
- [GitHub Pages文档](https://docs.github.com/en/pages)
- [Dependabot文档](https://docs.github.com/en/code-security/dependabot)
- [Issue模板文档](https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests)
- [CODEOWNERS文档](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners)

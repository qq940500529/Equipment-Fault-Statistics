# 贡献指南

感谢您考虑为设备故障统计系统做出贡献！

## 如何贡献

### 报告Bug

如果您发现了bug，请通过[创建Issue](https://github.com/qq940500529/Equipment-Fault-Statistics/issues/new?template=bug_report.md)来报告。请确保包含：

- 清晰的问题描述
- 复现步骤
- 预期行为和实际行为
- 环境信息（操作系统、浏览器等）
- 截图或错误信息（如果可能）

### 建议新功能

如果您有新功能的想法，请通过[创建Feature Request](https://github.com/qq940500529/Equipment-Fault-Statistics/issues/new?template=feature_request.md)。请描述：

- 功能的目的和使用场景
- 建议的实现方式
- 任何相关的替代方案

### 提交代码

#### 开发流程

1. **Fork 仓库**
   ```bash
   # 在GitHub上点击Fork按钮
   ```

2. **克隆您的Fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/Equipment-Fault-Statistics.git
   cd Equipment-Fault-Statistics
   ```

3. **创建功能分支**
   ```bash
   git checkout -b feature/your-feature-name
   # 或
   git checkout -b fix/your-bug-fix
   ```

4. **进行更改**
   - 遵循代码风格指南
   - 添加必要的注释
   - 更新相关文档

5. **测试您的更改**
   - 确保所有现有测试通过
   - 为新功能添加测试
   - 在多个浏览器中测试

6. **提交更改**
   ```bash
   git add .
   git commit -m "类型: 简短描述"
   ```
   
   提交消息格式：
   - `feat: 添加新功能`
   - `fix: 修复bug`
   - `docs: 更新文档`
   - `style: 代码格式调整`
   - `refactor: 代码重构`
   - `test: 添加测试`
   - `chore: 构建或辅助工具变更`

7. **推送到您的Fork**
   ```bash
   git push origin feature/your-feature-name
   ```

8. **创建Pull Request**
   - 访问原仓库
   - 点击"New Pull Request"
   - 选择您的分支
   - 填写PR模板
   - 提交PR

#### 代码风格

- **JavaScript**:
  - 使用ES6+语法
  - 使用2个空格缩进
  - 使用单引号
  - 文件末尾保留空行
  - 每行最多120个字符

- **注释**:
  ```javascript
  /**
   * 函数描述
   * @param {Type} paramName - 参数描述
   * @returns {Type} 返回值描述
   */
  function exampleFunction(paramName) {
    // 实现
  }
  ```

- **命名规范**:
  - 变量和函数: `camelCase`
  - 类名: `PascalCase`
  - 常量: `UPPER_SNAKE_CASE`
  - 文件名: `kebab-case.js`

#### 文档

- 更新代码时，同步更新相关文档
- 文档使用Markdown格式
- 保持中文文档的准确性和一致性
- 添加示例和代码片段

#### 测试

目前项目处于早期阶段，测试框架待建立。未来将要求：

- [ ] 单元测试覆盖率 >80%
- [ ] 集成测试覆盖关键流程
- [ ] 所有测试必须通过

### 文档改进

文档同样重要！如果您发现文档问题或有改进建议：

1. 创建[Documentation Issue](https://github.com/qq940500529/Equipment-Fault-Statistics/issues/new?template=documentation.md)
2. 或直接提交PR修复

## 开发环境设置

### 前置要求

- 现代浏览器（Chrome 90+, Firefox 88+, Safari 14+）
- 文本编辑器或IDE
- Git

### 本地运行

1. **克隆仓库**
   ```bash
   git clone https://github.com/qq940500529/Equipment-Fault-Statistics.git
   cd Equipment-Fault-Statistics
   ```

2. **直接打开**（推荐用于静态页面开发）
   ```bash
   # 直接在浏览器中打开 index.html
   open index.html  # macOS
   start index.html # Windows
   ```

3. **使用本地服务器**（可选）
   ```bash
   # 使用Python
   python -m http.server 8000
   
   # 或使用Node.js
   npx http-server
   
   # 然后访问 http://localhost:8000
   ```

## 项目结构

```
Equipment-Fault-Statistics/
├── .github/              # GitHub配置文件
│   ├── ISSUE_TEMPLATE/  # Issue模板
│   ├── workflows/       # GitHub Actions
│   └── PULL_REQUEST_TEMPLATE.md
├── docs/                # 文档目录
│   ├── ARCHITECTURE.md
│   ├── SPECIFICATION.md
│   ├── IMPLEMENTATION.md
│   ├── DATA_STRUCTURE.md
│   └── UI_UX_DESIGN.md
├── css/                 # 样式文件（待创建）
├── js/                  # JavaScript源代码（待创建）
├── lib/                 # 第三方库（待创建）
├── examples/            # 示例文件（待创建）
├── tests/               # 测试文件（待创建）
├── CONTRIBUTING.md      # 本文件
├── CODE_OF_CONDUCT.md   # 行为准则
├── LICENSE              # 许可证
└── README.md            # 项目说明
```

## 开发阶段

当前项目处于：**Phase 0 - 规划阶段** ✅

优先贡献领域：
1. Phase 1: 基础设施搭建
2. Phase 2: Excel文件处理
3. Phase 3: 数据验证
4. Phase 4: 核心数据转换

详见 [实施计划](docs/IMPLEMENTATION.md)

## 代码审查流程

1. **提交PR后**，维护者会进行审查
2. **审查内容**包括：
   - 代码质量和风格
   - 功能正确性
   - 测试覆盖率
   - 文档完整性
3. **反馈处理**：根据审查意见修改代码
4. **合并**：审查通过后合并到主分支

## 发布流程（维护者）

### 准备发布

1. **更新版本号**
   - 在 `package.json` 中更新 `version` 字段
   - 遵循[语义化版本](https://semver.org/lang/zh-CN/)规范：
     - 主版本号：不兼容的API修改
     - 次版本号：向下兼容的功能性新增
     - 修订号：向下兼容的问题修正

2. **更新变更日志**
   - 在 `CHANGELOG.md` 中记录本次发布的所有变更
   - 按照 新增/变更/修复/安全 等分类组织
   - 移动 `[未发布]` 部分到新版本号下

3. **提交更改**
   ```bash
   git add package.json CHANGELOG.md
   git commit -m "Bump version to vX.Y.Z"
   git push origin main
   ```

### 触发发布

1. **访问Actions页面**
   - 前往 [Create Release Package](https://github.com/qq940500529/Equipment-Fault-Statistics/actions/workflows/release.yml)

2. **手动触发工作流**
   - 点击 "Run workflow" 按钮
   - 在输入框中输入版本号（例如：`0.3.0`）
   - 版本号必须与 `package.json` 中的完全一致
   - 点击 "Run workflow" 确认

### 自动化验证和发布

工作流将自动执行以下步骤：

1. **版本验证**
   - ✅ 验证输入的版本号与 `package.json` 一致
   - ✅ 检查该版本的发布是否已存在
   - ✅ 对比已有版本，防止版本冲突

2. **创建发布包**
   - 📦 打包核心应用文件（`index.html`, `css/`, `js/`, `lib/`）
   - 📄 包含必要文档（`README.md`, `LICENSE`, `CHANGELOG.md`）
   - ❌ 排除测试、文档、示例等开发文件
   - 🔐 生成 SHA256 校验和

3. **发布到GitHub**
   - 🏷️ 创建Git标签（例如：`v0.3.0`）
   - 📝 生成发布说明
   - ⬆️ 上传发布包和校验和文件
   - 🎉 在GitHub Releases中发布

### 验证发布

发布成功后：

1. 访问 [Releases](https://github.com/qq940500529/Equipment-Fault-Statistics/releases) 页面
2. 验证发布包已正确上传
3. 下载并测试发布包
4. 验证SHA256校验和

## 获取帮助

- 📖 查看[文档](docs/)
- 💬 使用[GitHub Discussions](https://github.com/qq940500529/Equipment-Fault-Statistics/discussions)提问
- 🐛 报告[Issues](https://github.com/qq940500529/Equipment-Fault-Statistics/issues)

## 行为准则

请阅读并遵守我们的[行为准则](CODE_OF_CONDUCT.md)。

## 许可证

贡献代码即表示您同意您的贡献将按照项目的 [MIT 许可证](LICENSE) 进行许可。

## 致谢

感谢所有贡献者！您的贡献让这个项目变得更好。

---

再次感谢您的贡献！🎉

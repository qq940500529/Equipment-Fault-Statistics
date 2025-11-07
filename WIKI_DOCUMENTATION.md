# GitHub Wiki 文档说明

本项目已创建完整的GitHub Wiki文档，所有内容保存在 `/wiki/` 目录中。

## 📚 已创建的Wiki页面

我们为项目创建了**11个**详细的Wiki页面，总计超过**85KB**的文档内容：

### 核心页面

1. **[Home.md](wiki/Home.md)** - Wiki首页
   - 项目概览和简介
   - 核心特性介绍
   - 完整的导航链接
   - 项目状态和技术栈

2. **[快速开始.md](wiki/快速开始.md)** - 5分钟入门指南
   - 三种使用方式（直接运行、本地服务器、在线访问）
   - 完整的5步使用流程
   - 常见问题快速解答
   - 示例数据说明

3. **[使用指南.md](wiki/使用指南.md)** - 完整使用说明
   - Excel文件准备要求
   - 详细的操作步骤说明
   - 高级功能介绍
   - 常见使用场景
   - 最佳实践建议

### 技术文档

4. **[架构设计.md](wiki/架构设计.md)** - 系统架构
   - 技术栈详细说明
   - 系统架构图
   - 核心模块设计
   - 数据流设计
   - 性能和安全考虑

5. **[数据结构.md](wiki/数据结构.md)** - 数据格式规范
   - Excel输入格式要求
   - JavaScript内部数据结构
   - 列名映射规则
   - 数据转换规则详解
   - 导出格式说明

6. **[API文档.md](wiki/API文档.md)** - API参考手册
   - 所有模块的API文档
   - 函数参数和返回值说明
   - 使用示例代码
   - 错误处理说明

### 参与贡献

7. **[贡献指南.md](wiki/贡献指南.md)** - 贡献流程
   - 如何报告Bug
   - 如何建议新功能
   - 完整的开发流程
   - 代码规范和风格
   - Pull Request流程

8. **[FAQ.md](wiki/FAQ.md)** - 常见问题
   - 使用相关问题（文件上传、数据验证、数据处理等）
   - 技术相关问题（浏览器兼容性、性能、安全等）
   - 开发相关问题（二次开发、自定义等）
   - 错误排查技巧

### 参考资料

9. **[维修人员名单.md](wiki/维修人员名单.md)** - 人员名单
   - 维修工名单（16人）
   - 电工名单（14人）
   - 分类逻辑说明
   - 如何更新名单

10. **[路线图.md](wiki/路线图.md)** - 项目规划
    - 已完成阶段回顾
    - 当前开发进度
    - 未来版本规划
    - 里程碑和贡献机会

11. **[README.md](wiki/README.md)** - Wiki发布指南
    - 如何启用GitHub Wiki
    - 三种发布方法（网页界面、Git命令、批量脚本）
    - Wiki页面管理技巧
    - 验证清单

## 🚀 如何发布到GitHub Wiki

### 方法1: 使用GitHub网页界面（推荐初学者）

1. **启用Wiki功能**
   ```
   1. 访问仓库 Settings
   2. 勾选 "Wikis" 选项
   3. 保存设置
   ```

2. **创建首页**
   ```
   1. 点击 Wiki 标签
   2. 创建第一个页面
   3. 复制 wiki/Home.md 的内容
   4. 保存
   ```

3. **添加其他页面**
   ```
   对于每个 .md 文件：
   1. 点击 "New Page"
   2. 页面标题：使用文件名（去掉.md）
   3. 复制对应文件内容
   4. 保存
   ```

### 方法2: 使用Git命令行（推荐开发者）

```bash
# 1. 克隆Wiki仓库
git clone https://github.com/qq940500529/Equipment-Fault-Statistics.wiki.git

# 2. 进入Wiki目录
cd Equipment-Fault-Statistics.wiki

# 3. 复制wiki文件
cp ../Equipment-Fault-Statistics/wiki/*.md .

# 4. 提交并推送
git add .
git commit -m "创建完整的Wiki文档"
git push origin master
```

### 方法3: 使用自动化脚本

在项目根目录创建 `publish-wiki.sh`:

```bash
#!/bin/bash

# 克隆Wiki仓库
git clone https://github.com/qq940500529/Equipment-Fault-Statistics.wiki.git temp-wiki
cd temp-wiki

# 复制所有wiki文件
cp ../wiki/*.md .

# 提交更改
git add .
git commit -m "更新Wiki文档 - $(date '+%Y-%m-%d')"
git push origin master

# 清理
cd ..
rm -rf temp-wiki

echo "✅ Wiki发布完成！"
echo "🌐 访问: https://github.com/qq940500529/Equipment-Fault-Statistics/wiki"
```

运行脚本:
```bash
chmod +x publish-wiki.sh
./publish-wiki.sh
```

## 📋 Wiki页面清单

发布时请确保创建以下所有页面：

- [ ] Home (首页)
- [ ] 快速开始
- [ ] 使用指南
- [ ] 架构设计
- [ ] 数据结构
- [ ] API文档
- [ ] 贡献指南
- [ ] FAQ
- [ ] 维修人员名单
- [ ] 路线图

**注意**: `wiki/README.md` 是发布指南，不需要作为Wiki页面发布。

## 🎨 Wiki特性

我们的Wiki文档包含：

- ✅ **完整的导航**: 首页提供所有页面的链接
- ✅ **中文内容**: 所有内容使用中文编写
- ✅ **丰富的格式**: 表格、代码块、列表、引用等
- ✅ **实用示例**: 包含大量代码示例和使用场景
- ✅ **交叉引用**: 页面之间相互链接
- ✅ **Emoji图标**: 使用表情符号增强可读性
- ✅ **层次结构**: 清晰的文档组织

## 📊 文档统计

- **页面数量**: 11个主要页面
- **总字数**: 约50,000字
- **代码示例**: 100+ 个
- **覆盖范围**: 
  - 使用说明 ✅
  - 技术文档 ✅
  - API参考 ✅
  - 开发指南 ✅
  - FAQ ✅
  - 项目规划 ✅

## 🔗 访问Wiki

发布后，Wiki可以通过以下地址访问：

**主Wiki地址**: https://github.com/qq940500529/Equipment-Fault-Statistics/wiki

**各个页面**:
- https://github.com/qq940500529/Equipment-Fault-Statistics/wiki/快速开始
- https://github.com/qq940500529/Equipment-Fault-Statistics/wiki/架构设计
- https://github.com/qq940500529/Equipment-Fault-Statistics/wiki/API文档
- （其他页面类似）

## 🔄 更新Wiki

当文档需要更新时：

1. 编辑 `/wiki/` 目录中的对应文件
2. 提交到主仓库
3. 重新运行发布脚本或手动更新Wiki

建议建立定期更新机制，保持Wiki与代码同步。

## 💡 使用建议

### 对于用户
- 从 [快速开始](wiki/快速开始.md) 页面开始
- 遇到问题先查看 [FAQ](wiki/FAQ.md)
- 详细功能参考 [使用指南](wiki/使用指南.md)

### 对于开发者
- 了解架构阅读 [架构设计](wiki/架构设计.md)
- API参考查看 [API文档](wiki/API文档.md)
- 贡献代码参考 [贡献指南](wiki/贡献指南.md)

### 对于维护者
- 定期更新 [路线图](wiki/路线图.md)
- 及时更新 [FAQ](wiki/FAQ.md)
- 保持文档与代码同步

## 📝 维护计划

建议的维护周期：

- **每周**: 更新FAQ（根据新问题）
- **每月**: 审查和更新所有文档
- **每个版本发布**: 更新路线图和更新日志
- **重大更改**: 立即更新相关文档

## 🎉 完成

所有Wiki文档已准备就绪！现在您可以：

1. ✅ 查看 `/wiki/` 目录中的所有文档
2. ✅ 选择合适的方法发布到GitHub Wiki
3. ✅ 与用户和贡献者分享Wiki链接
4. ✅ 开始使用完善的文档支持项目发展

## 📞 需要帮助？

如果在发布Wiki过程中遇到问题：

- 查看 [wiki/README.md](wiki/README.md) 获取详细指南
- 参考 [GitHub Wiki官方文档](https://docs.github.com/en/communities/documenting-your-project-with-wikis)
- 在项目中提交Issue寻求帮助

---

**创建日期**: 2024-11-07  
**文档版本**: v1.0  
**维护者**: 项目团队

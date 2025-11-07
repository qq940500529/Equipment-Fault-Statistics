#!/bin/bash

# GitHub Wiki 自动发布脚本
# 用于将 /wiki/ 目录中的内容发布到GitHub Wiki

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 仓库信息
REPO_OWNER="qq940500529"
REPO_NAME="Equipment-Fault-Statistics"
WIKI_URL="https://github.com/${REPO_OWNER}/${REPO_NAME}.wiki.git"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}GitHub Wiki 自动发布脚本${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# 检查是否在正确的目录
if [ ! -d "wiki" ]; then
    echo -e "${RED}错误: 未找到 wiki 目录${NC}"
    echo "请在项目根目录运行此脚本"
    exit 1
fi

echo -e "${YELLOW}步骤 1/4:${NC} 克隆Wiki仓库..."
if [ -d "temp-wiki" ]; then
    echo "清理现有的临时目录..."
    rm -rf temp-wiki
fi

git clone "$WIKI_URL" temp-wiki
if [ $? -ne 0 ]; then
    echo -e "${RED}错误: 克隆Wiki仓库失败${NC}"
    echo "请确保："
    echo "1. 已启用Wiki功能 (在仓库Settings中勾选Wikis)"
    echo "2. 有访问权限"
    echo "3. 网络连接正常"
    exit 1
fi

echo -e "${GREEN}✓ Wiki仓库克隆成功${NC}"
echo ""

echo -e "${YELLOW}步骤 2/4:${NC} 复制Wiki文件..."
cd temp-wiki

# 复制所有.md文件（除了README.md）
cp ../wiki/*.md .
# 删除README.md（这是发布指南，不是Wiki页面）
rm -f README.md

echo -e "${GREEN}✓ 文件复制完成${NC}"
echo "已复制以下文件："
ls -1 *.md | sed 's/^/  - /'
echo ""

echo -e "${YELLOW}步骤 3/4:${NC} 提交更改..."
git add .

# 检查是否有更改
if git diff --cached --quiet; then
    echo -e "${YELLOW}没有需要提交的更改${NC}"
    cd ..
    rm -rf temp-wiki
    echo -e "${GREEN}Wiki已是最新状态！${NC}"
    exit 0
fi

# 提交更改
COMMIT_MSG="更新Wiki文档 - $(date '+%Y-%m-%d %H:%M:%S')"
git commit -m "$COMMIT_MSG"

echo -e "${GREEN}✓ 更改已提交${NC}"
echo ""

echo -e "${YELLOW}步骤 4/4:${NC} 推送到GitHub..."
git push origin master

if [ $? -ne 0 ]; then
    echo -e "${RED}错误: 推送失败${NC}"
    cd ..
    echo "临时目录保留在 temp-wiki 中，您可以手动检查"
    exit 1
fi

echo -e "${GREEN}✓ 推送成功${NC}"
echo ""

# 清理临时目录
cd ..
rm -rf temp-wiki

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✓ Wiki发布完成！${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "访问您的Wiki:"
echo "  https://github.com/${REPO_OWNER}/${REPO_NAME}/wiki"
echo ""
echo -e "${YELLOW}提示:${NC}"
echo "  - Wiki页面可能需要几秒钟才能更新"
echo "  - 刷新浏览器查看最新内容"
echo ""

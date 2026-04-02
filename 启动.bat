@echo off
chcp 65001 >nul 2>&1  :: 切换UTF-8编码，彻底解决中文乱码
cd /d "%~dp0"         :: 切换到批处理文件所在目录（核心：确保在当前文件夹运行服务）

:: 提示信息
echo ==============================================
echo 正在启动 HTTP Server 服务...
echo 服务运行目录：%cd%
echo ==============================================

:: 启动http-server（/b 表示后台运行，与当前CMD窗口绑定）
start /b npx http-server

:: 延时5秒（/nobreak 禁止按任意键跳过延时）
echo 等待5秒后自动打开浏览器...
timeout /t 5 /nobreak >nul

:: 打开默认浏览器访问服务地址（空引号避免路径含空格时出错）
echo 正在打开浏览器访问：http://localhost:8080
start "" "http://localhost:8080"

:: 保持窗口运行（关闭窗口则终止所有子进程，包括http-server）
echo.
echo  服务启动成功！
echo  访问地址：http://localhost:8080
echo  关闭此CMD窗口即可停止服务
echo ==============================================

:: 无限循环保持窗口（每秒检测一次，不占用高资源）
:keepalive
timeout /t 1 /nobreak >nul
goto keepalive
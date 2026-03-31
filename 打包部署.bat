@echo off
chcp 65001 >nul
echo ========================================
echo 游戏项目打包工具
echo ========================================
echo.

set "SOURCE_DIR=%~dp0"
set "TIMESTAMP=%date:~0,4%%date:~5,2%%date:~8,2%_%time:~0,2%%time:~3,2%%time:~6,2%"
set "TIMESTAMP=%TIMESTAMP: =0%"
set "OUTPUT_DIR=%USERPROFILE%\Desktop\游戏部署包_%TIMESTAMP%"

echo 正在创建部署包目录...
mkdir "%OUTPUT_DIR%"

echo.
echo 正在复制必要文件...
echo.

REM 复制源代码
echo [1/8] 复制 src 文件夹...
xcopy "%SOURCE_DIR%src" "%OUTPUT_DIR%\src\" /E /I /Y /Q

REM 复制公共资源
echo [2/8] 复制 public 文件夹...
xcopy "%SOURCE_DIR%public" "%OUTPUT_DIR%\public\" /E /I /Y /Q

REM 复制配置文件
echo [3/8] 复制配置文件...
copy "%SOURCE_DIR%package.json" "%OUTPUT_DIR%\" >nul
copy "%SOURCE_DIR%package-lock.json" "%OUTPUT_DIR%\" >nul
copy "%SOURCE_DIR%tsconfig.json" "%OUTPUT_DIR%\" >nul
copy "%SOURCE_DIR%vite.config.ts" "%OUTPUT_DIR%\" >nul
copy "%SOURCE_DIR%index.html" "%OUTPUT_DIR%\" >nul

REM 复制可选文件
echo [4/8] 复制文档文件...
if exist "%SOURCE_DIR%README.md" copy "%SOURCE_DIR%README.md" "%OUTPUT_DIR%\" >nul
if exist "%SOURCE_DIR%PROJECT_DESIGN.md" copy "%SOURCE_DIR%PROJECT_DESIGN.md" "%OUTPUT_DIR%\" >nul
if exist "%SOURCE_DIR%.gitignore" copy "%SOURCE_DIR%.gitignore" "%OUTPUT_DIR%\" >nul

REM 检查并复制TailwindCSS配置
echo [5/8] 复制样式配置...
if exist "%SOURCE_DIR%tailwind.config.js" copy "%SOURCE_DIR%tailwind.config.js" "%OUTPUT_DIR%\" >nul
if exist "%SOURCE_DIR%postcss.config.js" copy "%SOURCE_DIR%postcss.config.js" "%OUTPUT_DIR%\" >nul

REM 创建部署说明
echo [6/8] 创建部署说明文档...
(
echo ========================================
echo 游戏部署说明
echo ========================================
echo.
echo 【系统要求】
echo - Node.js 18.x 或更高版本
echo - npm 包管理器
echo.
echo 【部署步骤】
echo.
echo 1. 安装依赖
echo    打开终端，进入此文件夹，运行：
echo    npm install
echo.
echo 2. 启动开发服务器
echo    npm run dev
echo.
echo 3. 构建生产版本（可选）
echo    npm run build
echo    构建后的文件在 dist 文件夹中
echo.
echo 【局域网访问】
echo    npm run dev -- --host
echo    其他设备可通过显示的Network地址访问
echo.
echo 【注意事项】
echo - 首次部署需要运行 npm install 安装依赖
echo - 确保 public/images/scenes 文件夹中有所有场景图片
echo - 如遇到问题，可以删除 node_modules 重新安装
echo.
echo ========================================
echo 打包时间: %date% %time%
echo ========================================
) > "%OUTPUT_DIR%\部署说明.txt"

echo [7/8] 创建快速启动脚本...
(
echo @echo off
echo chcp 65001 ^>nul
echo echo 正在启动游戏开发服务器...
echo echo.
echo npm run dev -- --host
echo pause
) > "%OUTPUT_DIR%\启动服务器.bat"

echo [8/8] 完成！
echo.
echo ========================================
echo 打包完成！
echo ========================================
echo.
echo 部署包位置：
echo %OUTPUT_DIR%
echo.
echo 包含内容：
echo - src/          源代码
echo - public/       静态资源（图片等）
echo - *.json        配置文件
echo - *.ts          TypeScript配置
echo - 部署说明.txt  详细部署步骤
echo - 启动服务器.bat 快速启动脚本
echo.
echo 不包含（需要在新电脑上重新安装）：
echo - node_modules/ （运行 npm install 安装）
echo - dist/         （运行 npm run build 生成）
echo.

REM 询问是否打开文件夹
echo 是否打开部署包文件夹？(Y/N)
set /p OPEN_FOLDER=
if /i "%OPEN_FOLDER%"=="Y" explorer "%OUTPUT_DIR%"

echo.
echo 按任意键退出...
pause >nul

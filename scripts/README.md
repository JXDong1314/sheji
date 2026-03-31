# 图片生成脚本使用说明

## 📋 概述

本目录包含使用豆包 SeedDream 模型生成游戏场景背景图的脚本。

## 🎨 将生成的图片

1. **序章 - 断桥夜景** (`prologue_bridge.png`)
   - 水鬼传说的恐怖场景
   - 冷色调，磷火闪烁

2. **第一章 - 疯老头的破屋** (`chapter1_hut.png`)
   - 贴满符咒的破旧木屋
   - 诡异的蓝色电光

3. **第二章 - 铁匠铺** (`chapter2_forge.png`)
   - 炉火通红的铁匠铺
   - 血红色图纸

4. **第三章 - 路灯下的村长** (`chapter3_lamppost.png`)
   - 刺眼的路灯强光
   - 红外热成像效果

5. **结局 - 科学之光** (`ending_hope.png`)
   - 温馨的路灯照明
   - 从恐怖到希望的对比

## 🚀 使用步骤

### 步骤1：安装依赖

```bash
pip install openai requests
```

### 步骤2：生成图片

```bash
python scripts/generate_images.py
```

脚本会：
- 调用豆包API生成5张图片
- 输出每张图片的URL
- 显示生成进度和结果

### 步骤3：下载图片

**方法A：手动下载**
1. 复制脚本输出的URL
2. 在浏览器中打开
3. 保存到 `public/images/scenes/` 目录
4. 使用建议的文件名

**方法B：自动下载**
1. 将生成的URL复制到 `download_images.py` 的 `images` 列表中
2. 运行：
   ```bash
   python scripts/download_images.py
   ```

## 📁 文件结构

生成后的项目结构：
```
public/
└── images/
    └── scenes/
        ├── prologue_bridge.png      # 序章背景
        ├── chapter1_hut.png         # 第一章背景
        ├── chapter2_forge.png       # 第二章背景
        ├── chapter3_lamppost.png    # 第三章背景
        └── ending_hope.png          # 结局背景
```

## ⚙️ 配置说明

### API配置
- **API Key**: 已在脚本中配置
- **模型**: `doubao-seedream-4-5-251128`
- **图片尺寸**: 2K
- **水印**: 启用

### 提示词优化
如需调整图片风格，可修改 `generate_images.py` 中的 `SCENES` 列表：
- `prompt`: 图片生成提示词
- `description`: 场景描述

## 💡 提示

1. **API限流**: 脚本在每次生成后等待2秒，避免触发限流
2. **成本控制**: 每张图片约消耗一次API调用
3. **重新生成**: 如对某张图片不满意，可单独修改提示词重新生成

## 🔧 故障排除

### 问题1：API调用失败
- 检查网络连接
- 确认API Key是否有效
- 查看API配额是否充足

### 问题2：图片质量不理想
- 调整提示词，增加更多细节描述
- 尝试不同的风格关键词
- 重新生成多次选择最佳结果

### 问题3：下载失败
- 检查URL是否完整
- 确认 `public/images/scenes/` 目录存在
- 检查网络连接

## 📝 注意事项

- 生成的图片带有水印
- 图片版权归豆包所有
- 仅用于教育项目，不可商用
- 建议保存原始URL以便后续下载

## 🎯 下一步

图片生成完成后：
1. 在React组件中引入图片
2. 使用CSS设置为背景图
3. 添加适当的滤镜和叠加效果
4. 测试在不同场景下的显示效果

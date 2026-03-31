"""
图片生成脚本 - 使用豆包 SeedDream 模型生成专业科技风格的游戏场景背景图
主题：技术设计教学游戏 - 专业工程场景
"""
import os
from openai import OpenAI
import time

# API配置
API_KEY = os.getenv("DOUBAO_API_KEY", "")  # 从环境变量读取API密钥
BASE_URL = "https://ark.cn-beijing.volces.com/api/v3"
MODEL = "doubao-seedream-4-5-251128"

if not API_KEY:
    print("错误：未设置 DOUBAO_API_KEY 环境变量")
    print("请设置环境变量后再运行：")
    print("  Windows: set DOUBAO_API_KEY=your_api_key")
    print("  Linux/Mac: export DOUBAO_API_KEY=your_api_key")
    exit(1)

# 初始化客户端
client = OpenAI(
    base_url=BASE_URL,
    api_key=API_KEY,
)

# 场景定义
SCENES = [
    {
        "name": "village_background",
        "filename": "village-background.png",
        "prompt": "16-bit pixel art style, top-down aerial view of a traditional Chinese village, vibrant green grass fields with small colorful flowers, winding dirt stone paths in warm brown tones, peaceful blue river flowing through the center, rustic wooden bridge crossing the river, traditional houses with red tile roofs and gray stone walls, lush green trees scattered around, warm and peaceful atmosphere, retro RPG game background aesthetic, detailed pixel art with clear tiles, nostalgic 90s JRPG style, bright and colorful, 1024x1024 pixels, game asset quality",
        "description": "序章 - 村庄探索像素风格背景图"
    },
    {
        "name": "prologue_bridge",
        "filename": "prologue_bridge.png",
        "prompt": "现代乡村桥梁工程勘查现场，白天或黄昏时分，专业工程师正在使用测量仪器检查桥梁，地面摆放着工程图纸和笔记本电脑，桥栏杆部分用黄黑警戒线围起，远处可见村庄房屋，专业技术氛围，蓝灰色调为主，现代工程纪录片风格，清晰明亮，高细节，16:9横构图，写实摄影风格，专业光影效果，oc渲染",
        "description": "序章 - 断桥工程勘查现场"
    },
    {
        "name": "chapter1_hut",
        "filename": "chapter1_hut.png",
        "prompt": "村口路边的专业电子工程工作室内景，现代化工作台上摆放着示波器、电子元件、工具箱，墙上贴着电路图和技术规范表，正在调试的太阳能路灯原型设备，蓝色LED指示灯闪烁，专业技术实验室氛围，蓝灰色工业色调，光线充足，现代科技感，16:9横构图，写实风格，清晰的技术细节，oc渲染",
        "description": "第一章 - 电子工程调试工作室"
    },
    {
        "name": "chapter2_forge",
        "filename": "chapter2_forge.png",
        "prompt": "传统铁匠铺改造的现代工程设计室，一侧保留传统铁匠工具铁砧和锤子，另一侧是现代设计台配备CAD显示器和绘图板，墙上挂着标准化工程图纸和钢管材料样品，桌上有镀锌钢管样品，传统与现代技术融合，蓝灰色专业色调，自然光线从窗户照入，工业设计氛围，16:9横构图，写实摄影风格，细腻的质感，oc渲染",
        "description": "第二章 - 工程设计工作室"
    },
    {
        "name": "chapter3_lamppost",
        "filename": "chapter3_lamppost.png",
        "prompt": "村口广场夜景，新安装的现代太阳能路灯，简约设计带太阳能板和LED灯具，路灯发出柔和的暖白色光线，周围有安全警示标识和人机工程测试设备，地面有安全距离标线，村民在灯下活动，专业人机工程学展示，蓝灰色调配暖色灯光，现代技术氛围，16:9横构图，写实风格，温馨的技术场景，oc渲染",
        "description": "第三章 - 路灯人机工程测试现场"
    },
    {
        "name": "ending_hope",
        "filename": "ending_hope.png",
        "prompt": "整个村庄的黄昏全景，多盏现代太阳能路灯整齐排列照亮村道，村民在路灯下散步聊天，远处可见风力发电机和太阳能板，温馨现代的氛围，科技改善生活的主题，蓝灰色基调配暖色灯光，希望感和成就感，电影级画面质量，16:9横构图，写实摄影风格，鼓舞人心的技术成果展示，oc渲染",
        "description": "结局 - 科技改善生活的温馨场景"
    }
]

def generate_image(scene):
    """生成单张图片"""
    print(f"\n{'='*60}")
    print(f"正在生成: {scene['description']}")
    print(f"文件名: {scene['filename']}")
    print(f"提示词: {scene['prompt'][:100]}...")
    print(f"{'='*60}\n")
    
    try:
        response = client.images.generate(
            model=MODEL,
            prompt=scene['prompt'],
            size="2K",
            response_format="url",
            extra_body={
                "watermark": True,
            },
        )
        
        image_url = response.data[0].url
        print(f"✅ 生成成功！")
        print(f"图片URL: {image_url}")
        
        return {
            "scene": scene['name'],
            "filename": scene['filename'],
            "url": image_url,
            "description": scene['description']
        }
        
    except Exception as e:
        print(f"❌ 生成失败: {str(e)}")
        return None

def main():
    """主函数"""
    print("\n" + "="*60)
    print("《技术设计教学游戏》专业科技风格背景图生成工具")
    print("="*60)
    print(f"\n将生成 {len(SCENES)} 张专业工程场景背景图\n")
    
    results = []
    
    for i, scene in enumerate(SCENES, 1):
        print(f"\n[{i}/{len(SCENES)}] 开始生成...")
        result = generate_image(scene)
        
        if result:
            results.append(result)
        
        # 避免API限流，每次生成后等待2秒
        if i < len(SCENES):
            print("\n等待2秒后继续...")
            time.sleep(2)
    
    # 输出汇总
    print("\n" + "="*60)
    print("生成完成汇总")
    print("="*60 + "\n")
    
    if results:
        print(f"成功生成 {len(results)}/{len(SCENES)} 张图片：\n")
        for result in results:
            print(f"✅ {result['description']}")
            print(f"   文件名: {result['filename']}")
            print(f"   URL: {result['url']}\n")
        
        # 生成下载说明
        print("\n" + "="*60)
        print("下一步操作")
        print("="*60)
        print("\n1. 复制上述URL，在浏览器中打开并下载图片")
        print("2. 将图片保存到项目的 public/images/ 目录")
        print("3. 文件名使用上述建议的文件名")
        print("\n或者运行以下命令自动下载（需要安装requests）：")
        print("python scripts/download_images.py\n")
    else:
        print("❌ 没有成功生成任何图片，请检查API配置和网络连接")

if __name__ == "__main__":
    main()

"""
图片生成脚本 - 使用豆包 SeedDream 模型生成游戏场景背景图
"""
import os
from openai import OpenAI
import time

# API配置
API_KEY = "01b50cb8-cdd8-49bf-8c6c-9aa97b25976a"
BASE_URL = "https://ark.cn-beijing.volces.com/api/v3"
MODEL = "doubao-seedream-4-5-251128"

# 初始化客户端
client = OpenAI(
    base_url=BASE_URL,
    api_key=API_KEY,
)

# 场景定义
SCENES = [
    {
        "name": "prologue_bridge",
        "filename": "prologue_bridge.png",
        "prompt": "偏远山村夜景，古老破旧的石拱桥横跨溪流，月黑风高，浓雾弥漫，桥边闪烁着惨白的磷火，阴森恐怖氛围，《走近科学》纪录片风格，冷色调，深蓝黑色主导，电影级光影效果，高对比度，16:9横构图，超现实主义，景深效果，暗黑风格，光线追踪，oc渲染",
        "description": "序章 - 断桥夜景（水鬼传说场景）"
    },
    {
        "name": "chapter1_hut",
        "filename": "chapter1_hut.png",
        "prompt": "昏暗破旧的木屋内景，墙壁贴满泛黄的符咒纸张，中央悬挂着生锈的机械装置，诡异的蓝色电光闪烁，恐怖悬疑氛围，纪录片质感，暗绿色调与蓝色电光对比，景深效果，电影级光影，阴影细节丰富，超现实主义，16:9横构图，oc渲染",
        "description": "第一章 - 疯老头的破屋（镇魂法器场景）"
    },
    {
        "name": "chapter2_forge",
        "filename": "chapter2_forge.png",
        "prompt": "传统中式铁匠铺内景，炉火通红发出橙红色光芒，铁砧上摊开血红色的图纸，各种铁匠工具散落，昏暗光线从窗户透入，悬疑氛围，暖色调炉火与冷色调环境对比，电影级光影效果，景深，16:9横构图，质感真实，细腻的光影层次，oc渲染",
        "description": "第二章 - 铁匠铺（血书图纸场景）"
    },
    {
        "name": "chapter3_lamppost",
        "filename": "chapter3_lamppost.png",
        "prompt": "夜晚村口场景，新安装的现代路灯发出刺眼的白色强光，一位老年村长佝偻身体用手遮挡眼睛，红外热成像效果叠加显示人体轮廓，科技感与悬疑感结合，蓝紫色调，冷色调主导，电影级光影，16:9横构图，超现实主义，光线追踪，强烈的明暗对比",
        "description": "第三章 - 路灯下的村长（人机关系问题场景）"
    },
    {
        "name": "ending_hope",
        "filename": "ending_hope.png",
        "prompt": "同样的石拱桥场景但氛围完全不同，温暖的路灯照亮夜空，柔和的暖黄色灯光，村民安心过桥的剪影，从恐怖到温馨的强烈对比，希望感，治愈氛围，暖色调主导，电影级画面，景深效果，16:9横构图，细腻的色彩层次，光影柔和，oc渲染",
        "description": "结局 - 科学之光（真相大白后的温馨场景）"
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
    print("《走近科学：幽灵山庄的午夜怪影》图片生成工具")
    print("="*60)
    print(f"\n将生成 {len(SCENES)} 张场景背景图\n")
    
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

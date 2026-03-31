"""
自动下载生成的图片到项目目录
使用方法：
1. 运行 generate_images.py 生成图片并获取URL
2. 将URL复制到 image_urls.txt 文件中（每行一个URL）
3. 运行此脚本自动下载

或者直接从 generate_images.py 的输出中手动下载图片
"""
import requests
import os
import sys
from pathlib import Path

# 图片文件名列表
FILENAMES = [
    "prologue_bridge.png",
    "chapter1_hut.png",
    "chapter2_forge.png",
    "chapter3_lamppost.png",
    "ending_hope.png"
]

def download_image(url, filepath):
    """下载单张图片"""
    try:
        print(f"正在下载: {filepath.name}")
        response = requests.get(url, timeout=30)
        response.raise_for_status()
        
        with open(filepath, 'wb') as f:
            f.write(response.content)
        
        print(f"✅ 下载成功: {filepath.name} ({len(response.content) // 1024} KB)")
        return True
    except Exception as e:
        print(f"❌ 下载失败: {filepath.name} - {str(e)}")
        return False

def load_urls_from_file():
    """从文件加载URL列表"""
    project_root = Path(__file__).parent.parent
    url_file = project_root / "image_urls.txt"
    
    if not url_file.exists():
        print(f"❌ 未找到 image_urls.txt 文件")
        print(f"请创建文件: {url_file}")
        print("并将生成的图片URL粘贴进去（每行一个URL）")
        return []
    
    with open(url_file, 'r', encoding='utf-8') as f:
        urls = [line.strip() for line in f if line.strip() and not line.startswith('#')]
    
    return urls

def main():
    # 确定目标目录
    project_root = Path(__file__).parent.parent
    target_dir = project_root / "public" / "images" / "scenes"
    
    # 确保目录存在
    target_dir.mkdir(parents=True, exist_ok=True)
    
    print("\n" + "="*60)
    print("开始下载专业科技风格背景图")
    print("="*60)
    print(f"\n目标目录: {target_dir}\n")
    
    # 从文件加载URL
    urls = load_urls_from_file()
    
    if not urls:
        print("\n提示：图片已经在之前的运行中下载完成。")
        print("如需重新下载，请运行 generate_images.py 获取新的URL。")
        return
    
    if len(urls) != len(FILENAMES):
        print(f"⚠️ URL数量({len(urls)})与文件名数量({len(FILENAMES)})不匹配")
        print("请检查 image_urls.txt 文件")
        return
    
    success_count = 0
    
    for filename, url in zip(FILENAMES, urls):
        filepath = target_dir / filename
        if download_image(url, filepath):
            success_count += 1
        print()
    
    print("="*60)
    print(f"下载完成: {success_count}/{len(FILENAMES)} 张图片成功")
    print("="*60)
    
    if success_count == len(FILENAMES):
        print("\n✅ 所有图片下载成功！可以刷新游戏查看新的专业科技风格背景。")
    else:
        print(f"\n⚠️ 有 {len(FILENAMES) - success_count} 张图片下载失败，请检查网络连接或手动下载。")

if __name__ == "__main__":
    main()

/**
 * 图片生成Hook - 使用豆包API生成并缓存图片
 */
import { useState, useEffect } from 'react';
import { generateImage } from '../utils/imageGenerator';

interface ImageCache {
  [key: string]: string;
}

// 图片提示词配置
const IMAGE_PROMPTS = {
  // NPC角色
  'npc-chief': '16-bit pixel art character, elderly Chinese village chief with white beard, traditional robe, wise expression, front view, 64x64px, game sprite, clean background',
  
  'npc-engineer': '16-bit pixel art character, engineer with blue work clothes and safety helmet, holding wrench, friendly face, front view, 64x64px, game sprite, clean background',
  
  'npc-elder': '16-bit pixel art character, elderly Chinese grandmother with gray hair, traditional clothing, kind smile, walking stick, front view, 64x64px, game sprite, clean background',
  
  'npc-farmer': '16-bit pixel art character, Chinese farmer with straw hat, work clothes, strong build, friendly, front view, 64x64px, game sprite, clean background',
  
  'npc-child': '16-bit pixel art character, young Chinese boy, casual clothes, cheerful expression, energetic pose, front view, 64x64px, game sprite, clean background',
  
  // 玩家
  'player': '16-bit pixel art character, young adventurer in explorer outfit with backpack, determined expression, front view, 64x64px, game sprite, clean background',
  
  // 建筑
  'building-hall': '16-bit pixel art building, Chinese village hall with red roof and stone walls, ornate details, top-down view, 144x144px, game asset, transparent background',
  
  'building-house': '16-bit pixel art building, traditional Chinese house with red tile roof, cozy design, top-down view, 96x96px, game asset, transparent background',
  
  // 自然元素
  'tree': '16-bit pixel art tree, lush green leaves, brown trunk, round canopy, top-down view, 48x48px, game asset, transparent background',
  
  'water': '16-bit pixel art water tile, blue with ripples and sparkles, seamless tileable texture, top-down view, 48x48px, game asset',
  
  'bridge': '16-bit pixel art wooden bridge, planks and railings, weathered wood texture, top-down view, 96x96px, game asset, transparent background',
  
  // 背景
  'village-bg': '16-bit pixel art village background, top-down view, grass fields, dirt paths, small river, traditional Chinese village atmosphere, warm colors, 864x624px, game background'
};

export function useGeneratedImages() {
  const [images, setImages] = useState<ImageCache>({});
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const loadImages = async () => {
      const totalImages = Object.keys(IMAGE_PROMPTS).length;
      let loaded = 0;

      // 先检查localStorage缓存
      const cached = localStorage.getItem('generated-images');
      if (cached) {
        try {
          const cachedImages = JSON.parse(cached);
          setImages(cachedImages);
          setLoading(false);
          console.log('✅ 从缓存加载图片');
          return;
        } catch (e) {
          console.log('缓存无效，重新生成图片');
        }
      }

      console.log('🎨 开始生成图片...');
      const newImages: ImageCache = {};

      for (const [key, prompt] of Object.entries(IMAGE_PROMPTS)) {
        try {
          console.log(`  生成 ${key}...`);
          
          // 根据图片类型设置尺寸
          let width = 64, height = 64;
          if (key.includes('building-hall')) {
            width = height = 144;
          } else if (key.includes('building-house')) {
            width = height = 96;
          } else if (key.includes('bridge')) {
            width = height = 96;
          } else if (key.includes('tree') || key.includes('water')) {
            width = height = 48;
          } else if (key === 'village-bg') {
            width = 864;
            height = 624;
          }

          const url = await generateImage({ prompt, width, height });
          newImages[key] = url;
          
          loaded++;
          setProgress((loaded / totalImages) * 100);
          
          console.log(`  ✅ ${key} 完成 (${loaded}/${totalImages})`);
          
          // 避免API限流
          await new Promise(resolve => setTimeout(resolve, 1500));
        } catch (error) {
          console.error(`  ❌ ${key} 生成失败:`, error);
          // 使用占位符
          newImages[key] = '';
        }
      }

      setImages(newImages);
      setLoading(false);
      
      // 保存到localStorage
      try {
        localStorage.setItem('generated-images', JSON.stringify(newImages));
        console.log('✅ 图片已缓存到localStorage');
      } catch (e) {
        console.warn('无法缓存图片:', e);
      }

      console.log('🎉 所有图片生成完成！');
    };

    loadImages();
  }, []);

  return { images, loading, progress };
}

// 清除缓存的辅助函数
export function clearImageCache() {
  localStorage.removeItem('generated-images');
  console.log('🗑️ 图片缓存已清除');
}

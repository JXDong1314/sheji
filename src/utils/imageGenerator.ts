/**
 * 图片生成工具 - 使用豆包API生成像素风格图片
 */

interface ImageGenerationOptions {
  prompt: string;
  style?: string;
  width?: number;
  height?: number;
}

/**
 * 使用豆包API生成图片
 */
export async function generateImage(options: ImageGenerationOptions): Promise<string> {
  const {
    prompt,
    style = 'pixel art',
    width = 512,
    height = 512
  } = options;

  try {
    const response = await fetch('https://ark.cn-beijing.volces.com/api/v3/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer 4d09c3d3-f2e3-4c8f-b0d4-ba2e0a7c9e6f'
      },
      body: JSON.stringify({
        model: 'doubao-image-pro',
        prompt: `${style}, ${prompt}, high quality, detailed, vibrant colors`,
        n: 1,
        size: `${width}x${height}`,
        quality: 'high'
      })
    });

    if (!response.ok) {
      throw new Error(`图片生成失败: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.data && data.data.length > 0) {
      return data.data[0].url;
    }
    
    throw new Error('未返回图片URL');
  } catch (error) {
    console.error('图片生成错误:', error);
    throw error;
  }
}

/**
 * 预定义的像素风格图片提示词
 */
export const PIXEL_ART_PROMPTS = {
  // 村庄地图背景
  villageMap: 'top-down pixel art village map with grass, trees, river, bridge, houses, stone paths, medieval fantasy style, 16-bit retro game aesthetic',
  
  // 地面纹理
  grassTile: 'seamless pixel art grass tile texture, green, small flowers, top-down view, 16x16 pixels',
  stonePath: 'seamless pixel art stone path tile, gray cobblestone, top-down view, 16x16 pixels',
  waterTile: 'seamless pixel art water tile, animated ripples, blue, top-down view, 16x16 pixels',
  
  // 建筑物
  house: 'pixel art medieval house, top-down view, red roof, stone walls, wooden door, 32x32 pixels',
  station: 'pixel art guard station building, top-down view, watchtower, stone structure, 32x32 pixels',
  
  // 自然元素
  tree: 'pixel art tree, top-down view, green leaves, brown trunk, round canopy, 16x16 pixels',
  bridge: 'pixel art wooden bridge, top-down view, planks, medieval style, 32x16 pixels',
  
  // NPC角色
  villageChief: 'pixel art character sprite, village chief, old man with beard, wise elder, front view, 16x16 pixels, RPG style',
  engineer: 'pixel art character sprite, engineer, wearing work clothes, holding tools, front view, 16x16 pixels, RPG style',
  elder: 'pixel art character sprite, elderly person, walking stick, kind face, front view, 16x16 pixels, RPG style',
  resident: 'pixel art character sprite, village resident, casual clothes, friendly, front view, 16x16 pixels, RPG style',
  
  // 玩家角色
  player: 'pixel art character sprite, adventurer, explorer outfit, backpack, front view, 16x16 pixels, RPG style, 4-direction walking animation',
  
  // UI元素
  dialogBox: 'pixel art UI dialog box, medieval fantasy style, ornate border, parchment background',
  progressBar: 'pixel art UI progress bar, fantasy style, glowing gems, ornate frame',
  
  // 特效
  sparkle: 'pixel art sparkle effect, glowing particles, magical, animated, 8x8 pixels',
  footstep: 'pixel art dust cloud effect, small puff, animated, 8x8 pixels',
  exclamation: 'pixel art exclamation mark icon, glowing, attention indicator, 8x8 pixels'
};

/**
 * 批量生成图片
 */
export async function generateMultipleImages(prompts: Record<string, string>): Promise<Record<string, string>> {
  const results: Record<string, string> = {};
  
  for (const [key, prompt] of Object.entries(prompts)) {
    try {
      console.log(`正在生成图片: ${key}...`);
      const url = await generateImage({ prompt });
      results[key] = url;
      
      // 添加延迟避免API限流
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`生成 ${key} 失败:`, error);
      results[key] = '';
    }
  }
  
  return results;
}

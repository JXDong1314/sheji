/**
 * 图片生成脚本 - 为序章生成所有像素风格图片
 */
import { generateImage, PIXEL_ART_PROMPTS } from '../src/utils/imageGenerator';
import * as fs from 'fs';
import * as path from 'path';

// 确保图片目录存在
const IMAGES_DIR = path.join(__dirname, '../public/images/prologue');
if (!fs.existsSync(IMAGES_DIR)) {
  fs.mkdirSync(IMAGES_DIR, { recursive: true });
}

// 下载图片到本地
async function downloadImage(url: string, filename: string): Promise<void> {
  try {
    const response = await fetch(url);
    const buffer = await response.arrayBuffer();
    const filepath = path.join(IMAGES_DIR, filename);
    fs.writeFileSync(filepath, Buffer.from(buffer));
    console.log(`✅ 已保存: ${filename}`);
  } catch (error) {
    console.error(`❌ 下载失败 ${filename}:`, error);
  }
}

// 生成所有图片
async function generateAllImages() {
  console.log('🎨 开始生成序章图片...\n');

  // 1. 生成NPC角色
  console.log('📸 生成NPC角色图片...');
  
  const npcPrompts = {
    'village-chief': '16-bit pixel art character sprite, elderly village chief with white beard and traditional Chinese clothing, wise and kind expression, front view, 64x64 pixels, transparent background, RPG game style',
    
    'engineer': '16-bit pixel art character sprite, middle-aged engineer wearing blue work clothes and safety helmet, holding tools, friendly face, front view, 64x64 pixels, transparent background, RPG game style',
    
    'elderly-woman': '16-bit pixel art character sprite, elderly grandmother with gray hair and traditional Chinese clothing, kind smile, walking stick, front view, 64x64 pixels, transparent background, RPG game style',
    
    'farmer': '16-bit pixel art character sprite, farmer wearing straw hat and work clothes, strong build, friendly expression, front view, 64x64 pixels, transparent background, RPG game style',
    
    'child': '16-bit pixel art character sprite, young boy with short hair and casual clothes, cheerful and energetic, front view, 64x64 pixels, transparent background, RPG game style'
  };

  for (const [name, prompt] of Object.entries(npcPrompts)) {
    try {
      console.log(`  生成 ${name}...`);
      const url = await generateImage({ 
        prompt, 
        width: 64, 
        height: 64 
      });
      await downloadImage(url, `${name}.png`);
      await new Promise(resolve => setTimeout(resolve, 2000)); // 避免API限流
    } catch (error) {
      console.error(`  ❌ ${name} 生成失败:`, error);
    }
  }

  // 2. 生成玩家角色
  console.log('\n📸 生成玩家角色图片...');
  try {
    const playerUrl = await generateImage({
      prompt: '16-bit pixel art character sprite sheet, young adventurer in explorer outfit with backpack, 4 directions (up, down, left, right), each direction has 3 walking frames, front view, 192x64 pixels, transparent background, RPG game style',
      width: 192,
      height: 64
    });
    await downloadImage(playerUrl, 'player-spritesheet.png');
  } catch (error) {
    console.error('  ❌ 玩家角色生成失败:', error);
  }

  await new Promise(resolve => setTimeout(resolve, 2000));

  // 3. 生成建筑物
  console.log('\n🏠 生成建筑物图片...');
  
  const buildingPrompts = {
    'village-hall': '16-bit pixel art building, traditional Chinese village hall with red roof and stone walls, top-down view, 96x96 pixels, detailed, transparent background',
    
    'house-1': '16-bit pixel art building, small traditional Chinese house with red tile roof, top-down view, 64x64 pixels, detailed, transparent background',
    
    'house-2': '16-bit pixel art building, traditional Chinese residential house with courtyard, top-down view, 64x64 pixels, detailed, transparent background'
  };

  for (const [name, prompt] of Object.entries(buildingPrompts)) {
    try {
      console.log(`  生成 ${name}...`);
      const url = await generateImage({ 
        prompt,
        width: name === 'village-hall' ? 96 : 64,
        height: name === 'village-hall' ? 96 : 64
      });
      await downloadImage(url, `${name}.png`);
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.error(`  ❌ ${name} 生成失败:`, error);
    }
  }

  // 4. 生成自然元素
  console.log('\n🌳 生成自然元素图片...');
  
  const naturePrompts = {
    'tree': '16-bit pixel art tree with green leaves and brown trunk, round canopy, top-down view, 48x48 pixels, detailed, transparent background',
    
    'water-tile': '16-bit pixel art seamless water tile with animated ripples, blue color with highlights, top-down view, 48x48 pixels, tileable texture',
    
    'bridge': '16-bit pixel art wooden bridge with planks and railings, medieval style, top-down view, 96x96 pixels, detailed, transparent background',
    
    'grass-tile': '16-bit pixel art seamless grass tile with small flowers and details, vibrant green, top-down view, 48x48 pixels, tileable texture',
    
    'stone-path': '16-bit pixel art seamless stone path tile, gray cobblestone, medieval style, top-down view, 48x48 pixels, tileable texture'
  };

  for (const [name, prompt] of Object.entries(naturePrompts)) {
    try {
      console.log(`  生成 ${name}...`);
      const url = await generateImage({ 
        prompt,
        width: name === 'bridge' ? 96 : 48,
        height: name === 'bridge' ? 96 : 48
      });
      await downloadImage(url, `${name}.png`);
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.error(`  ❌ ${name} 生成失败:`, error);
    }
  }

  // 5. 生成背景场景
  console.log('\n🖼️ 生成背景场景图片...');
  try {
    const backgroundUrl = await generateImage({
      prompt: '16-bit pixel art top-down village map background, traditional Chinese village with grass, dirt paths, small river, medieval fantasy style, warm colors, 864x624 pixels, detailed and atmospheric',
      width: 864,
      height: 624
    });
    await downloadImage(backgroundUrl, 'village-background.png');
  } catch (error) {
    console.error('  ❌ 背景场景生成失败:', error);
  }

  await new Promise(resolve => setTimeout(resolve, 2000));

  // 6. 生成UI元素
  console.log('\n🎨 生成UI元素图片...');
  
  const uiPrompts = {
    'dialog-box': '16-bit pixel art UI dialog box with ornate border, medieval fantasy style, parchment background, decorative corners, 650x200 pixels, transparent background',
    
    'exclamation': '16-bit pixel art exclamation mark icon, glowing yellow, attention indicator, 16x16 pixels, transparent background, animated style',
    
    'checkmark': '16-bit pixel art green checkmark icon, glowing effect, success indicator, 16x16 pixels, transparent background'
  };

  for (const [name, prompt] of Object.entries(uiPrompts)) {
    try {
      console.log(`  生成 ${name}...`);
      const url = await generateImage({ 
        prompt,
        width: name === 'dialog-box' ? 650 : 16,
        height: name === 'dialog-box' ? 200 : 16
      });
      await downloadImage(url, `${name}.png`);
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.error(`  ❌ ${name} 生成失败:`, error);
    }
  }

  console.log('\n✅ 所有图片生成完成！');
  console.log(`📁 图片保存位置: ${IMAGES_DIR}`);
}

// 执行生成
generateAllImages().catch(console.error);

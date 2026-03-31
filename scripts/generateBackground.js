/**
 * 生成村庄背景图 - 使用豆包API
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generateBackground() {
  console.log('🎨 开始生成村庄背景图...\n');

  const prompt = '16-bit pixel art style, top-down view of a traditional Chinese village, grass fields with small flowers, dirt stone paths, small blue river flowing through, wooden bridge, traditional houses with red roofs, green trees, warm and peaceful atmosphere, retro RPG game background, detailed pixel art, 864x624 pixels';

  try {
    console.log('📸 调用豆包API生成图片...');
    
    const response = await fetch('https://ark.cn-beijing.volces.com/api/v3/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer 4d09c3d3-f2e3-4c8f-b0d4-ba2e0a7c9e6f'
      },
      body: JSON.stringify({
        model: 'doubao-image-pro',
        prompt: prompt,
        n: 1,
        size: '1024x1024',
        quality: 'high'
      })
    });

    if (!response.ok) {
      throw new Error(`API请求失败: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.data && data.data.length > 0) {
      const imageUrl = data.data[0].url;
      console.log('✅ 图片生成成功！');
      console.log('📥 图片URL:', imageUrl);
      
      // 下载图片
      console.log('\n📥 正在下载图片...');
      const imageResponse = await fetch(imageUrl);
      const arrayBuffer = await imageResponse.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      // 确保目录存在
      const publicDir = path.join(__dirname, '../public');
      if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
      }
      
      // 保存图片
      const imagePath = path.join(publicDir, 'village-background.png');
      fs.writeFileSync(imagePath, buffer);
      
      console.log('✅ 图片已保存到:', imagePath);
      console.log('\n🎉 背景图生成完成！');
      console.log('📁 文件位置: /public/village-background.png');
      
    } else {
      throw new Error('API未返回图片数据');
    }
    
  } catch (error) {
    console.error('❌ 生成失败:', error.message);
    process.exit(1);
  }
}

generateBackground();

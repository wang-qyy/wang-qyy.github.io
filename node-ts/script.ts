const fs = require('fs');
const path = require('path');
const probe = require('probe-image-size');

async function getImageSize(url) {
  try {
    const result = await probe(url);
    return { width: result.width, height: result.height };
  } catch (error) {
    console.error(`获取图片尺寸失败: ${url}`, error.message);
    return null;
  }
}

async function processJsonFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(content);

    for (const item of data) {
      if (item.preview) {
        const size = await getImageSize(item.preview);
        if (size) {
          item.width = size.width;
          item.height = size.height;
          console.log(`Preview 图片 ${item.preview}: ${size.width}x${size.height}`);
        }
      }

      if (item.params?.taskConfig?.images) {
        for (const image of item.params.taskConfig.images) {
          if (image.url) {
            const size = await getImageSize(image.url);
            if (size) {
              image.width = size.width;
              image.height = size.height;
              console.log(`Image ${image.url}: ${size.width}x${size.height}`);
            }
          }
        }
      }
    }

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`文件 ${filePath} 更新完成`);
  } catch (error) {
    console.error(`处理文件 ${filePath} 出错:`, error.message);
  }
}

async function main() {
  const folderPath = '/Users/craig/Desktop/wqy/pngtree/90sheji/90sheji_ai/public/templates';

  if (!folderPath) {
    console.error('请提供文件夹路径作为参数');
    process.exit(1);
  }

  const files = fs.readdirSync(folderPath).filter(file => file.endsWith('.json'));

  if (files.length === 0) {
    console.log('文件夹中没有 JSON 文件');
    return;
  }

  console.log(`找到 ${files.length} 个 JSON 文件`);

  for (const file of files) {
    const filePath = path.join(folderPath, file);
    await processJsonFile(filePath);
  }

  console.log('所有文件处理完成');
}

main().catch(console.error);
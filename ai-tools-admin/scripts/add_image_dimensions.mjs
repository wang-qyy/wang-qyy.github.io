import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const templatesDir = join(__dirname, '../packages/server/data/templates');

// Use dynamic import for sharp
const sharp = (await import('sharp')).default;

// Cache to avoid re-fetching the same URL
const dimCache = new Map();

async function getImageDimensions(url) {
  if (dimCache.has(url)) return dimCache.get(url);
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    const meta = await sharp(buf).metadata();
    const result = { width: meta.width || 0, height: meta.height || 0 };
    dimCache.set(url, result);
    return result;
  } catch (e) {
    console.error(`  ✗ ${url.split('/').pop()}: ${e.message}`);
    dimCache.set(url, null);
    return null;
  }
}

async function main() {
  const files = readdirSync(templatesDir).filter(f => f.endsWith('.json')).sort();

  let totalImages = 0;
  let successCount = 0;
  let failCount = 0;

  for (const fileName of files) {
    const filePath = join(templatesDir, fileName);
    console.log(`\n📄 ${fileName}`);
    const templates = JSON.parse(readFileSync(filePath, 'utf-8'));

    for (const tpl of templates) {
      // --- preview image ---
      if (tpl.preview) {
        totalImages++;
        const dims = await getImageDimensions(tpl.preview);
        if (dims) {
          tpl.previewWidth = dims.width;
          tpl.previewHeight = dims.height;
          successCount++;
        } else {
          failCount++;
        }
      }

      // --- taskConfig images ---
      const images = tpl.params?.taskConfig?.images;
      if (images) {
        for (const img of images) {
          if (img.url) {
            totalImages++;
            const dims = await getImageDimensions(img.url);
            if (dims) {
              img.width = dims.width;
              img.height = dims.height;
              successCount++;
            } else {
              failCount++;
            }
          }
        }
      }
    }

    writeFileSync(filePath, JSON.stringify(templates, null, 2) + '\n');
    console.log(`  ✓ saved`);
  }

  console.log(`\n✅ Done! ${successCount}/${totalImages} fetched, ${failCount} failed`);
}

main().catch(err => { console.error(err); process.exit(1); });

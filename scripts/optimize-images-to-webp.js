#!/usr/bin/env node
/**
 * Convert all raster images (jpg, png, gif, heic) in client/public to optimized webp.
 * Existing webp files are kept. Originals are removed after successful conversion.
 * Run: node scripts/optimize-images-to-webp.js
 */
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

const PROJECT_ROOT = path.join(__dirname, '..');
const IMAGES_ROOT = path.join(PROJECT_ROOT, 'client/public/images');

const MAX_WIDTH = 1920;
const WEBP_QUALITY = 82;

const RASTER_EXTS = ['.jpg', '.jpeg', '.png', '.gif', '.heic'];

function getAllRasterFiles(dir, base = '') {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    const relPath = base ? path.join(base, item.name) : item.name;
    if (item.isDirectory()) {
      results.push(...getAllRasterFiles(fullPath, relPath));
    } else if (item.isFile()) {
      const ext = path.extname(item.name).toLowerCase();
      if (RASTER_EXTS.includes(ext)) {
        results.push({ fullPath, relPath, ext });
      }
    }
  }
  return results;
}

async function convertToWebp(filePath) {
  let img = sharp(filePath);
  const meta = await img.metadata();
  const w = meta.width || 0;
  const h = meta.height || 0;

  const resize = w > MAX_WIDTH ? { width: MAX_WIDTH, withoutEnlargement: true } : undefined;

  const buffer = await img
    .resize(resize)
    .webp({ quality: WEBP_QUALITY })
    .toBuffer();

  return buffer;
}

async function run() {
  const files = getAllRasterFiles(IMAGES_ROOT);

  if (files.length === 0) {
    console.log('No raster images to convert.');
    return;
  }

  console.log(`Converting ${files.length} image(s) to webp...`);

  for (const { fullPath, relPath, ext } of files) {
    const dir = path.dirname(fullPath);
    const baseName = path.basename(fullPath, ext);
    const webpPath = path.join(dir, baseName + '.webp');

    if (fs.existsSync(webpPath)) {
      console.log(`  Skip (webp exists): ${relPath}`);
      continue;
    }

    try {
      const buffer = await convertToWebp(fullPath);
      fs.writeFileSync(webpPath, buffer);
      fs.unlinkSync(fullPath);
      console.log(`  OK: ${relPath} -> ${baseName}.webp`);
    } catch (err) {
      console.error(`  FAIL: ${relPath}`, err.message);
    }
  }

  console.log('Done.');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});

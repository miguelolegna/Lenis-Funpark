import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function optimizeImage(filePath) {
  try {
    const ext = path.extname(filePath).toLowerCase();
    if (!['.webp', '.png', '.jpg', '.jpeg'].includes(ext)) return;

    const stat = fs.statSync(filePath);
    const originalSize = stat.size;

    // Read buffer first to allow in-place overwrite
    const inputBuffer = fs.readFileSync(filePath);
    const metadata = await sharp(inputBuffer).metadata();

    let pipeline = sharp(inputBuffer);

    // If it's a team photo, max width 800
    // If it's a general photo, max width 1600
    // If it's a logo, max width 800
    const isTeam = filePath.includes('team');
    const isLogo = filePath.includes('logos');
    const maxWidth = isTeam ? 800 : isLogo ? 800 : 1600;

    if (metadata.width && metadata.width > maxWidth) {
      pipeline = pipeline.resize({ width: maxWidth, withoutEnlargement: true });
    }

    let outputBuffer;
    if (ext === '.webp') {
      outputBuffer = await pipeline.webp({ quality: 80, effort: 5 }).toBuffer();
    } else if (ext === '.png') {
      outputBuffer = await pipeline.png({ quality: 85, compressionLevel: 8 }).toBuffer();
    } else {
      outputBuffer = await pipeline.jpeg({ quality: 80 }).toBuffer();
    }

    if (outputBuffer.length < originalSize) {
      fs.writeFileSync(filePath, outputBuffer);
      const savings = (((originalSize - outputBuffer.length) / originalSize) * 100).toFixed(1);
      console.log(`Optimized ${path.basename(filePath)}: ${(originalSize / 1024).toFixed(0)}KB -> ${(outputBuffer.length / 1024).toFixed(0)}KB (-${savings}%)`);
    } else {
      console.log(`Kept original for ${path.basename(filePath)} (already optimal)`);
    }
  } catch (err) {
    console.error(`Error processing ${filePath}:`, err);
  }
}

async function processDirectory(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await processDirectory(fullPath);
    } else if (entry.isFile()) {
      await optimizeImage(fullPath);
    }
  }
}

async function run() {
  console.log('--- Optimizing Photos ---');
  await processDirectory(path.join(__dirname, 'public', 'Fotos'));
  console.log('--- Optimizing Logos ---');
  await processDirectory(path.join(__dirname, 'public', 'logos'));
  console.log('--- Done! ---');
}

run();

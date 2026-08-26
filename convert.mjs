import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function processDirectory(directory) {
  const files = fs.readdirSync(directory);
  
  for (const file of files) {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      await processDirectory(fullPath);
    } else {
      const ext = path.extname(fullPath).toLowerCase();
      if (['.jpg', '.jpeg', '.png'].includes(ext)) {
        const newPath = fullPath.substring(0, fullPath.lastIndexOf('.')) + '.webp';
        console.log(`Converting ${fullPath} to ${newPath}`);
        
        try {
          await sharp(fullPath).webp({ quality: 80 }).toFile(newPath);
          fs.unlinkSync(fullPath);
          console.log(`Successfully converted and deleted original: ${file}`);
        } catch (error) {
          console.error(`Error converting ${file}:`, error);
        }
      }
    }
  }
}

async function main() {
  const publicDir = path.join(__dirname, 'public');
  const srcAssetsDir = path.join(__dirname, 'src', 'assets');
  
  if (fs.existsSync(publicDir)) {
    console.log('Processing public directory...');
    await processDirectory(publicDir);
  }
  
  if (fs.existsSync(srcAssetsDir)) {
    console.log('Processing src/assets directory...');
    await processDirectory(srcAssetsDir);
  }
}

main().catch(console.error);

import {chromium} from '@playwright/test';
import {readFileSync, writeFileSync} from 'fs';
import {resolve, dirname} from 'path';
import {fileURLToPath} from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const svgPath = resolve(__dirname, '../frontend/public/icon.svg');
const svg = readFileSync(svgPath, 'utf-8');

const sizes = [192, 512];

const browser = await chromium.launch();
const page = await browser.newPage();

for (const size of sizes) {
  await page.setViewportSize({width: size, height: size});
  await page.setContent(`
    <!DOCTYPE html>
    <html>
    <head><style>html,body{margin:0;padding:0;width:${size}px;height:${size}px;overflow:hidden;background:transparent;}</style></head>
    <body>${svg}</body>
    </html>
  `);
  const buffer = await page.screenshot({type: 'png', omitBackground: true});
  const outPath = resolve(__dirname, `../frontend/public/icon-${size}.png`);
  writeFileSync(outPath, buffer);
  console.log(`Wrote icon-${size}.png`);
}

// OG image (1200x630)
const ogHtml = readFileSync(resolve(__dirname, '../frontend/public/og.html'), 'utf-8');
await page.setViewportSize({width: 1200, height: 630});
await page.setContent(ogHtml, {waitUntil: 'networkidle'});
const ogBuffer = await page.screenshot({type: 'png'});
writeFileSync(resolve(__dirname, '../frontend/public/og.png'), ogBuffer);
console.log('Wrote og.png (1200x630)');

await browser.close();

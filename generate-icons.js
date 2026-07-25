import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <!-- Background -->
  <rect width="512" height="512" rx="110" fill="#030712"/>
  
  <!-- Outer Gold Border -->
  <rect x="28" y="28" width="456" height="456" rx="90" fill="none" stroke="#eab308" stroke-width="22"/>
  
  <!-- Trophy Icon in Gold -->
  <g transform="translate(116, 116) scale(11.666)" stroke="#eab308" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none">
    <!-- Base -->
    <path d="M6 9H18" />
    <path d="M10 22H14" />
    <path d="M12 18V22" />
    <!-- Cup -->
    <path d="M8 21H16" />
    <path d="M7 4V9C7 11.7614 9.23858 14 12 14C14.7614 14 17 11.7614 17 9V4H7Z" />
    <!-- Handles -->
    <path d="M7 5H4C2.89543 5 2 5.89543 2 7C2 8.10457 2.89543 9 4 9H7" />
    <path d="M17 5H20C21.1046 5 22 5.89543 22 7C22 8.10457 21.1046 9 20 9H17" />
  </g>

  <!-- Green Active Dot Badge in Top Right -->
  <circle cx="410" cy="98" r="42" fill="#10b981"/>
  <circle cx="410" cy="98" r="48" fill="none" stroke="#030712" stroke-width="12"/>
</svg>`;

async function main() {
  const publicDir = path.resolve('public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  // Save SVG
  fs.writeFileSync(path.join(publicDir, 'favicon.svg'), svgIcon);

  const svgBuffer = Buffer.from(svgIcon);

  // Generate PNGs
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));

  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, 'icon-192.png'));

  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'icon-512.png'));

  await sharp(svgBuffer)
    .resize(64, 64)
    .png()
    .toFile(path.join(publicDir, 'favicon.ico'));

  console.log('Successfully generated all icons!');
}

main().catch(console.error);

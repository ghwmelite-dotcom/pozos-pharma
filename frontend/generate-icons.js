/**
 * Run this script with Node.js to generate PWA icon placeholders:
 *   node generate-icons.js
 *
 * For production, replace these with properly designed 192x192 and 512x512 PNG icons
 * generated from public/icon.svg using a tool like Inkscape, Figma, or sharp.
 */
const fs = require('fs');

// Minimal valid 1x1 PNG (indigo pixel) - placeholder until real icons are created
const png = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M/wHwAEBgIApD5fRAAAAABJRU5ErkJggg==',
  'base64'
);

fs.writeFileSync('public/icon-192.png', png);
fs.writeFileSync('public/icon-512.png', png);
console.log('Created placeholder PNG icons at public/icon-192.png and public/icon-512.png');
console.log('Replace these with proper sized icons for production.');

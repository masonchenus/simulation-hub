import fs from 'node:fs';
// or const fs = require('fs');

const imagePath = '/Users/mason/simulation-hub/debuginfo.png';
const outputPath = '/Users/mason/simulation-hub/debuginfo_base64.txt';

// Read the file as a buffer
const imageBuffer = fs.readFileSync(imagePath);

// Convert buffer to base64 string
const base64String = imageBuffer.toString('base64');

// Construct the full Data URL
const dataUrl = `data:image/png;base64,${base64String}`;

fs.writeFileSync(outputPath, dataUrl);
console.log(`Saved base64 data to ${outputPath}`);

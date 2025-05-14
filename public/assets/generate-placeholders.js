/**
 * Placeholder Image Generator Script
 * Run with Node.js to create placeholder images for development
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const imageNames = [
  // Products
  'rapid-integration.jpg',
  'data-transformer.jpg',
  'developer-boost.jpg',
  'stability-suite.jpg',
  'secure-connect.jpg',
  'integration-harmony.jpg',
  'ai-accelerator.jpg',
  'global-scale.jpg',
  'insight-engine.jpg',
  
  // Category backgrounds
  'take-off-bg.jpg',
  'touch-down-bg.jpg',
  'high-point-bg.jpg',
  
  // How it works steps
  'conversational-onboarding.jpg',
  'configure-connection.jpg',
  'test-validate.jpg',
  'deploy-monitor.jpg'
];

// Generate SVG placeholder with category specific colors
function generatePlaceholderSVG(filename) {
  // Define colors based on categories
  let bgColor = '#333';
  let textColor = '#fff';
  
  if (filename.includes('rapid') || filename.includes('data') || filename.includes('developer') || filename.includes('take-off')) {
    bgColor = '#FF5733';
  } else if (filename.includes('stability') || filename.includes('secure') || filename.includes('integration') || filename.includes('touch-down')) {
    bgColor = '#2563EB';
  } else if (filename.includes('ai') || filename.includes('global') || filename.includes('insight') || filename.includes('high-point')) {
    bgColor = '#10B981';
  } else if (filename.includes('conversational')) {
    bgColor = '#3B82F6';
  } else if (filename.includes('configure')) {
    bgColor = '#8B5CF6';
  } else if (filename.includes('test')) {
    bgColor = '#10B981';
  } else if (filename.includes('deploy')) {
    bgColor = '#F97316';
  }
  
  // Generate placeholder image label from filename
  const label = filename
    .replace('.jpg', '')
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  
  // SVG placeholder content
  return `<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="${bgColor}" />
    <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="32" fill="${textColor}" text-anchor="middle" dominant-baseline="middle">
      ${label}
    </text>
    <text x="50%" y="58%" font-family="Arial, sans-serif" font-size="18" fill="${textColor}80" text-anchor="middle" dominant-baseline="middle">
      Placeholder Image
    </text>
  </svg>`;
}

// Main function to create all placeholders
function createPlaceholders() {
  const assetsDir = path.join(__dirname);
  
  console.log('Generating placeholder images in:', assetsDir);
  
  let created = 0;
  let skipped = 0;
  
  // Process each image
  imageNames.forEach(imageName => {
    const filePath = path.join(assetsDir, imageName);
    
    // Skip existing files
    if (fs.existsSync(filePath)) {
      console.log(`⏩ Skipping existing file: ${imageName}`);
      skipped++;
      return;
    }
    
    try {
      // Generate SVG placeholder
      const svgContent = generatePlaceholderSVG(imageName);
      
      // Write SVG content to file
      fs.writeFileSync(filePath.replace('.jpg', '.svg'), svgContent);
      console.log(`✅ Created: ${imageName.replace('.jpg', '.svg')}`);
      created++;
    } catch (error) {
      console.error(`❌ Error creating ${imageName}:`, error);
    }
  });
  
  console.log(`\nDone! Created ${created} placeholder images, skipped ${skipped} existing files.`);
  console.log('Note: These are SVG placeholders - you can replace them with real images later.');
}

// Run the function
createPlaceholders();
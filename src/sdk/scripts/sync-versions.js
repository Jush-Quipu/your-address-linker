
/**
 * Script to synchronize versions across all SDK packages and files
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const BASE_DIR = path.resolve(__dirname, '..');
const FILES_TO_SYNC = [
  {
    path: path.join(BASE_DIR, 'package.json'),
    type: 'json'
  },
  {
    path: path.join(BASE_DIR, 'react-native', 'package.json'),
    type: 'json'
  },
  {
    path: path.join(BASE_DIR, '..', '..', 'public', 'sdk', 'secureaddress-bridge-sdk.js'),
    type: 'js-comment',
    pattern: /SecureAddressBridge SDK v([0-9]+\.[0-9]+\.[0-9]+)/
  }
];

// Get base version from main package.json
console.log('🔍 Reading base version...');
const mainPackageJson = JSON.parse(fs.readFileSync(FILES_TO_SYNC[0].path, 'utf8'));
const baseVersion = mainPackageJson.version;

if (!baseVersion) {
  console.error('❌ Could not find version in main package.json');
  process.exit(1);
}

console.log(`📊 Base version: ${baseVersion}`);
console.log('\n🔄 Synchronizing versions across files...');

// Update versions in all files
let updated = false;
for (const file of FILES_TO_SYNC) {
  try {
    if (!fs.existsSync(file.path)) {
      console.log(`⚠️ File does not exist, skipping: ${file.path}`);
      continue;
    }
    
    if (file.type === 'json') {
      // Update JSON files
      const packageJson = JSON.parse(fs.readFileSync(file.path, 'utf8'));
      const currentVersion = packageJson.version;
      
      if (currentVersion !== baseVersion) {
        packageJson.version = baseVersion;
        fs.writeFileSync(file.path, JSON.stringify(packageJson, null, 2) + '\n');
        console.log(`✅ Updated ${path.basename(file.path)}: ${currentVersion} → ${baseVersion}`);
        updated = true;
      } else {
        console.log(`✓ ${path.basename(file.path)} already at version ${baseVersion}`);
      }
    } else if (file.type === 'js-comment') {
      // Update version in JavaScript comment
      const content = fs.readFileSync(file.path, 'utf8');
      const match = content.match(file.pattern);
      
      if (match && match[1] !== baseVersion) {
        const newContent = content.replace(file.pattern, `SecureAddressBridge SDK v${baseVersion}`);
        fs.writeFileSync(file.path, newContent);
        console.log(`✅ Updated ${path.basename(file.path)}: ${match[1]} → ${baseVersion}`);
        updated = true;
      } else if (match) {
        console.log(`✓ ${path.basename(file.path)} already at version ${baseVersion}`);
      } else {
        console.log(`⚠️ Could not find version pattern in ${file.path}`);
      }
    }
  } catch (err) {
    console.error(`❌ Failed to update version in ${file.path}:`, err.message);
  }
}

if (updated) {
  console.log('\n🎉 Version synchronization complete!');
} else {
  console.log('\n✓ All files already synchronized to version', baseVersion);
}

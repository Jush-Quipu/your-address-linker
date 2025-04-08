
/**
 * Script to create a new release of all SecureAddress Bridge SDK packages
 * This script will:
 * 1. Increment the version in all package.json files
 * 2. Run the package preparation script
 * 3. Publish the packages to npm
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get release type from command line arguments
const args = process.argv.slice(2);
const releaseType = args[0] || 'patch'; // Default to patch release
const validReleaseTypes = ['patch', 'minor', 'major'];

if (!validReleaseTypes.includes(releaseType)) {
  console.error(`❌ Invalid release type: ${releaseType}`);
  console.error(`Valid release types are: ${validReleaseTypes.join(', ')}`);
  process.exit(1);
}

// Configuration
const PACKAGES = [
  {
    path: path.resolve(__dirname, '..', 'package.json')
  },
  {
    path: path.resolve(__dirname, '..', 'react-native', 'package.json')
  }
];

// Increment version in all package.json files
console.log(`🔄 Incrementing version (${releaseType}) in all packages...`);

for (const pkg of PACKAGES) {
  try {
    // Read the package.json file
    const packageJson = JSON.parse(fs.readFileSync(pkg.path, 'utf8'));
    const currentVersion = packageJson.version;
    
    // Parse version
    const [major, minor, patch] = currentVersion.split('.').map(Number);
    
    // Increment version based on release type
    let newVersion;
    if (releaseType === 'major') {
      newVersion = `${major + 1}.0.0`;
    } else if (releaseType === 'minor') {
      newVersion = `${major}.${minor + 1}.0`;
    } else { // patch
      newVersion = `${major}.${minor}.${patch + 1}`;
    }
    
    // Update package.json
    packageJson.version = newVersion;
    fs.writeFileSync(pkg.path, JSON.stringify(packageJson, null, 2) + '\n');
    
    console.log(`  Updated ${path.basename(path.dirname(pkg.path))}/package.json: ${currentVersion} → ${newVersion}`);
    
    // Also update the demo SDK in public folder if it exists
    const demoSdkPath = path.resolve(__dirname, '..', '..', '..', 'public', 'sdk', 'secureaddress-bridge-sdk.js');
    if (fs.existsSync(demoSdkPath)) {
      let sdkContent = fs.readFileSync(demoSdkPath, 'utf8');
      sdkContent = sdkContent.replace(/SecureAddressBridge SDK v[0-9]+\.[0-9]+\.[0-9]+/, `SecureAddressBridge SDK v${newVersion}`);
      fs.writeFileSync(demoSdkPath, sdkContent);
      console.log(`  Updated demo SDK version: v${currentVersion} → v${newVersion}`);
    }
  } catch (err) {
    console.error(`❌ Failed to update version in ${pkg.path}:`, err.message);
    process.exit(1);
  }
}

// Run the package preparation script
console.log('\n📦 Preparing packages...');
try {
  execSync('node ' + path.join(__dirname, 'package-prep.js'), { stdio: 'inherit' });
} catch (err) {
  console.error('❌ Failed to prepare packages:', err.message);
  process.exit(1);
}

// Publish packages to npm
console.log('\n🚀 Publishing packages...');
try {
  execSync('node ' + path.join(__dirname, 'publish.js'), { 
    stdio: 'inherit', 
    env: { ...process.env, NPM_TOKEN: process.env.NPM_TOKEN }
  });
} catch (err) {
  console.error('❌ Failed to publish packages:', err.message);
  process.exit(1);
}

console.log('\n🎉 Release complete!');

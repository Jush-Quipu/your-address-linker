
/**
 * Script to publish SecureAddress Bridge SDK packages to npm
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const NPM_TOKEN = process.env.NPM_TOKEN;
const PACKAGES = [
  {
    name: 'secureaddress-bridge-sdk', // Removed scope
    path: path.resolve(__dirname, '..'),
    files: ['secureaddress-bridge-sdk.js', 'secureaddress-bridge-sdk.d.ts', 'index.ts', 'package.json', 'README.md']
  },
  {
    name: 'secureaddress-bridge-sdk-react-native', // Removed scope
    path: path.resolve(__dirname, '../react-native'),
    files: ['secureaddress-bridge-react-native.js', 'package.json', 'README.md']
  }
];

// Ensure we have the npm token
if (!NPM_TOKEN) {
  console.error('❌ NPM_TOKEN environment variable is not set');
  console.error('Please set it with: export NPM_TOKEN=your_npm_token');
  process.exit(1);
}

// Set up npm authentication
console.log('🔑 Setting up npm authentication...');
try {
  // Create .npmrc file with the token
  const npmrcPath = path.resolve(process.env.HOME || process.env.USERPROFILE, '.npmrc');
  fs.writeFileSync(npmrcPath, `//registry.npmjs.org/:_authToken=${NPM_TOKEN}`);
  console.log('✅ npm authentication set up successfully');
} catch (err) {
  console.error('❌ Failed to set up npm authentication:', err.message);
  process.exit(1);
}

// Check if packages are ready for publishing
console.log('🔍 Checking packages...');
for (const pkg of PACKAGES) {
  console.log(`\nChecking ${pkg.name}...`);
  
  // Check if all required files exist
  const missingFiles = [];
  for (const file of pkg.files) {
    const filePath = path.join(pkg.path, file);
    if (!fs.existsSync(filePath)) {
      missingFiles.push(file);
    }
  }
  
  if (missingFiles.length > 0) {
    console.error(`❌ Missing files for ${pkg.name}: ${missingFiles.join(', ')}`);
    process.exit(1);
  }
  
  // Read package.json
  const packageJsonPath = path.join(pkg.path, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  console.log(`  Name: ${packageJson.name}`);
  console.log(`  Version: ${packageJson.version}`);
  console.log(`  ✅ All files present`);
}

// Update package.json to use unscoped names
console.log('\n📝 Updating package.json for publishing...');
for (const pkg of PACKAGES) {
  try {
    const packageJsonPath = path.join(pkg.path, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    // Store original name to restore later
    const originalName = packageJson.name;
    
    // Update package name (remove scope)
    packageJson.name = pkg.name;
    
    // Write updated package.json
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
    
    console.log(`  Updated ${path.basename(pkg.path)}/package.json: ${originalName} → ${packageJson.name}`);
  } catch (err) {
    console.error(`❌ Failed to update package.json in ${pkg.path}:`, err.message);
    process.exit(1);
  }
}

// Publish packages
console.log('\n📦 Publishing packages...');
for (const pkg of PACKAGES) {
  console.log(`\nPublishing ${pkg.name}...`);
  try {
    process.chdir(pkg.path);
    execSync('npm publish --access public', { stdio: 'inherit' });
    console.log(`✅ Successfully published ${pkg.name}`);
  } catch (err) {
    console.error(`❌ Failed to publish ${pkg.name}:`, err.message);
    process.exit(1);
  }
}

console.log('\n🎉 All packages published successfully!');

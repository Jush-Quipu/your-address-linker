
#!/usr/bin/env node

/**
 * Script to prepare and publish the Python SDK to PyPI
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const PYTHON_SDK_DIR = path.resolve(__dirname, '../python');

// Check if Python and required tools are installed
console.log('🔍 Checking Python environment...');
try {
  execSync('python --version', { stdio: 'pipe' });
  console.log('✅ Python is installed');
} catch (err) {
  console.error('❌ Python is not installed or not in PATH');
  process.exit(1);
}

try {
  execSync('pip --version', { stdio: 'pipe' });
  console.log('✅ pip is installed');
} catch (err) {
  console.error('❌ pip is not installed or not in PATH');
  process.exit(1);
}

// Check if PYPI_TOKEN is set
if (!process.env.PYPI_TOKEN) {
  console.error('❌ PYPI_TOKEN environment variable is not set');
  console.error('Please set it with: export PYPI_TOKEN=your-pypi-token');
  process.exit(1);
}

// Install required Python packages for publishing
console.log('\n📦 Installing required Python packages...');
try {
  execSync('pip install --upgrade setuptools wheel twine', { stdio: 'inherit' });
  console.log('✅ Required packages installed');
} catch (err) {
  console.error('❌ Failed to install required packages:', err.message);
  process.exit(1);
}

// Check if the Python SDK directory exists
if (!fs.existsSync(PYTHON_SDK_DIR)) {
  console.error(`❌ Python SDK directory not found: ${PYTHON_SDK_DIR}`);
  process.exit(1);
}

// Check for required files
const requiredFiles = ['setup.py', 'README.md', 'secureaddress_bridge.py'];
const missingFiles = [];
for (const file of requiredFiles) {
  const filePath = path.join(PYTHON_SDK_DIR, file);
  if (!fs.existsSync(filePath)) {
    missingFiles.push(file);
  }
}

if (missingFiles.length > 0) {
  console.error(`❌ Missing required files: ${missingFiles.join(', ')}`);
  process.exit(1);
}

// Build and publish the Python package
console.log('\n🚀 Building and publishing Python package...');
try {
  process.chdir(PYTHON_SDK_DIR);
  
  // Create a PyPI credentials file
  const pypiRcPath = path.join(os.homedir(), '.pypirc');
  console.log(`📝 Creating PyPI credentials file at ${pypiRcPath}`);
  
  fs.writeFileSync(pypiRcPath, `[pypi]
username = __token__
password = ${process.env.PYPI_TOKEN}
`);
  
  // Build the package
  console.log('🔨 Building the package...');
  execSync('python setup.py sdist bdist_wheel', { stdio: 'inherit' });
  
  // Upload to PyPI
  console.log('📤 Uploading to PyPI...');
  execSync('twine upload dist/*', { stdio: 'inherit' });
  
  console.log('✅ Python package published successfully!');
} catch (err) {
  console.error('❌ Failed to publish Python package:', err.message);
  process.exit(1);
}


# SecureAddress Bridge SDK Publishing Scripts

This directory contains scripts for preparing and publishing the SecureAddress Bridge SDK packages to npm and PyPI.

## Available Scripts

- `setup-permissions.sh`: Sets the correct permissions for all scripts
- `publish-with-token.sh`: Main script to publish all packages with the provided npm token
- `publish-windows.bat`: Windows version of the publish script
- `release.js`: Handles versioning and releasing all JavaScript packages
- `publish.js`: Publishes JavaScript packages to npm
- `package-prep.js`: Prepares packages for publishing (creates README files, etc.)
- `publish-python.js`: Publishes the Python SDK to PyPI
- `python/setup-pypi.sh`: Sets up PyPI credentials and publishes Python SDK

## Quick Start

### Publishing JavaScript SDKs to npm

#### On macOS/Linux:

```bash
# First, make sure scripts are executable
./setup-permissions.sh

# Publish a patch release (increments the third number: 1.2.3 -> 1.2.4)
./publish-with-token.sh patch

# Or publish a minor release (increments the second number: 1.2.3 -> 1.3.0)
./publish-with-token.sh minor

# Or publish a major release (increments the first number: 1.2.3 -> 2.0.0)
./publish-with-token.sh major
```

#### On Windows:

```cmd
# Publish a patch release (increments the third number: 1.2.3 -> 1.2.4)
publish-windows.bat patch

# Or publish a minor release (increments the second number: 1.2.3 -> 1.3.0)
publish-windows.bat minor

# Or publish a major release (increments the first number: 1.2.3 -> 2.0.0)
publish-windows.bat major
```

### Important Notes About Package Names

The packages are published without a scope (e.g., `secureaddress-bridge-sdk` instead of `@secureaddress/bridge-sdk`). This allows you to publish the packages without needing access to a specific npm scope.

### Publishing Python SDK to PyPI

To publish the Python SDK, you'll need to set your PyPI token:

```bash
# Set your PyPI token
export PYPI_TOKEN=your-pypi-token

# Run the Python publishing setup script
./python/setup-pypi.sh
```

On Windows:
```cmd
# Set your PyPI token
set PYPI_TOKEN=your-pypi-token

# Run the Python publishing script directly with Node
node publish-python.js
```

## Notes

- The npm token is built into the `publish-with-token.sh` script
- For security, do not commit or share this token with others
- Make sure you have the appropriate permissions to publish to npm
- For PyPI publishing, you must set the PYPI_TOKEN environment variable before running the scripts

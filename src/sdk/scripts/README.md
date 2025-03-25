
# SecureAddress Bridge SDK Publishing Scripts

This directory contains scripts for preparing and publishing the SecureAddress Bridge SDK packages to npm and PyPI.

## Available Scripts

- `publish-with-token.sh`: Main script to publish all packages with the provided npm token
- `release.js`: Handles versioning and releasing all JavaScript packages
- `publish.js`: Publishes JavaScript packages to npm
- `package-prep.js`: Prepares packages for publishing (creates README files, etc.)
- `publish-python.js`: Publishes the Python SDK to PyPI
- `setup-permissions.sh`: Sets the correct permissions for all scripts

## Quick Start

### Publishing JavaScript SDKs to npm

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

### Publishing Python SDK to PyPI

To publish the Python SDK, you'll need to set your PyPI token:

```bash
# Set your PyPI token
export PYPI_TOKEN=your-pypi-token

# Run the Python publishing script
node publish-python.js
```

## Notes

- The npm token is built into the `publish-with-token.sh` script
- For security, do not commit or share this token with others
- Make sure you have the appropriate permissions to publish to the @secureaddress organization on npm

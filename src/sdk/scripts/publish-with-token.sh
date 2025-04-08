
#!/bin/bash

# Set the npm token
export NPM_TOKEN=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

# Configure npm to use the token for authentication
echo "//registry.npmjs.org/:_authToken=${NPM_TOKEN}" > ~/.npmrc

# Run the release script with the specified release type
# Default to patch if no release type is specified
RELEASE_TYPE=${1:-patch}

# Make sure scripts are executable
chmod +x $(dirname "$0")/release.js
chmod +x $(dirname "$0")/publish.js
chmod +x $(dirname "$0")/package-prep.js
chmod +x $(dirname "$0")/sync-versions.js
chmod +x $(dirname "$0")/sync-versions.sh

# Run the release script with node explicitly
node $(dirname "$0")/release.js $RELEASE_TYPE

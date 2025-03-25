
#!/bin/bash

# Set the npm token
export NPM_TOKEN=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

# Run the release script with the specified release type
# Default to patch if no release type is specified
RELEASE_TYPE=${1:-patch}

# Make sure scripts are executable
chmod +x $(dirname "$0")/release.js
chmod +x $(dirname "$0")/publish.js
chmod +x $(dirname "$0")/package-prep.js

# Run the release script
node $(dirname "$0")/release.js $RELEASE_TYPE

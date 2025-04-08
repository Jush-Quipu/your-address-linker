
#!/bin/bash

# Make all scripts executable
chmod +x $(dirname "$0")/release.js
chmod +x $(dirname "$0")/publish.js
chmod +x $(dirname "$0")/package-prep.js
chmod +x $(dirname "$0")/publish-python.js
chmod +x $(dirname "$0")/publish-with-token.sh
chmod +x $(dirname "$0")/python/setup-pypi.sh
chmod +x $(dirname "$0")/sync-versions.js
chmod +x $(dirname "$0")/sync-versions.sh

echo "✅ All scripts are now executable"

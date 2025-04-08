
#!/bin/bash

# Synchronize all SDK versions
node $(dirname "$0")/sync-versions.js

echo "✅ Version synchronization process complete!"

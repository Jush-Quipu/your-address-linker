
#!/bin/bash

# Set up PyPI credentials
echo "[pypi]
username = __token__
password = ${PYPI_TOKEN}" > ~/.pypirc

# Make sure the Python SDK preparation script is executable
chmod +x $(dirname "$0")/../publish-python.js

# Run the Python SDK publishing script
node $(dirname "$0")/../publish-python.js

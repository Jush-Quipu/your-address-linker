
# SecureAddress Bridge Python SDK

This Python SDK provides a seamless way to integrate with SecureAddress Bridge, allowing your application to securely access verified physical addresses with enhanced blockchain support and blind shipping capabilities.

## Installation

```bash
pip install secureaddress-bridge
```

## Quick Start

```python
from secureaddress_bridge import SecureAddressBridge

# Initialize with your app credentials
client = SecureAddressBridge(
    app_id="YOUR_APP_ID",
    app_secret="YOUR_APP_SECRET"
)

# Authenticate your application
auth_result = client.authenticate()
print(f"Successfully authenticated. Token: {auth_result['access_token']}")

# Generate an authorization URL for users
auth_url = client.get_authorization_url({
    "redirect_uri": "https://your-app.com/callback",
    "scope": ["street", "city", "state", "postal_code", "country"],
    "expiry_days": 30,
    "state": "random-state-for-csrf-protection"
})

print(f"Send user to this URL to authorize: {auth_url}")

# In your callback handler, exchange the code for an access token
token_result = client.exchange_code({
    "code": "authorization-code-from-callback",
    "redirect_uri": "https://your-app.com/callback"
})

# Now you can access the user's address
address_data = client.get_address({
    "include_verification_info": True
})

print(f"User address: {address_data}")
```

## Features

- **Address Verification**: Access verified physical addresses with user consent
- **Web3 Integration**: Link verified addresses to blockchain wallets
- **Blind Shipping**: Create secure shipments without exposing address details
- **Webhook Support**: Receive real-time notifications about address changes
- **Permission Management**: Detailed control and statistics on address access

## Documentation

For complete documentation, visit [https://docs.secureaddress.bridge/sdk/python](https://docs.secureaddress.bridge/sdk/python)

## License

This project is licensed under the MIT License - see the LICENSE file for details.

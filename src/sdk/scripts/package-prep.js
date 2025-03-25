
#!/usr/bin/env node

/**
 * Script to prepare packages for publishing
 * This ensures README files exist and package.json files are properly configured
 */

const fs = require('fs');
const path = require('path');

// Create README for the main SDK if it doesn't exist
const mainReadmePath = path.resolve(__dirname, '../README.md');
if (!fs.existsSync(mainReadmePath)) {
  console.log('📝 Creating README for main SDK...');
  
  const readmeContent = `# SecureAddress Bridge SDK

The SecureAddress Bridge JavaScript SDK provides an easy way to integrate with SecureAddress Bridge
to securely access verified physical addresses with enhanced blockchain support and blind shipping capabilities.

## Installation

\`\`\`bash
npm install @secureaddress/bridge-sdk
\`\`\`

## Quick Start

\`\`\`javascript
import { SecureAddressBridge } from '@secureaddress/bridge-sdk';

// Initialize with your app credentials
const client = new SecureAddressBridge({
  appId: 'YOUR_APP_ID',
  redirectUri: 'https://your-app.com/callback'
});

// Authorize a user to share their address
client.authorize({
  scope: ['street', 'city', 'state', 'postal_code', 'country'],
  expiryDays: 30
});

// In your callback handler
async function handleCallback() {
  const result = await client.handleCallback();
  if (result.success) {
    // Get user's address
    const addressData = await client.getAddress({
      includeVerificationInfo: true
    });
    console.log(addressData);
  }
}
\`\`\`

## React Integration

\`\`\`jsx
import { useSecureAddress } from '@secureaddress/bridge-sdk';

function AddressComponent() {
  const {
    address,
    isLoading,
    error,
    requestAccess,
    hasValidPermission
  } = useSecureAddress({
    appId: 'YOUR_APP_ID',
    redirectUri: 'https://your-app.com/callback',
    scope: ['street', 'city', 'state']
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  if (!hasValidPermission) {
    return (
      <button onClick={requestAccess}>
        Share your address
      </button>
    );
  }
  
  return (
    <div>
      <h2>Your Address</h2>
      <p>{address?.street}</p>
      <p>{address?.city}, {address?.state} {address?.postal_code}</p>
      <p>{address?.country}</p>
    </div>
  );
}
\`\`\`

## Documentation

For complete documentation, visit [https://docs.secureaddress.bridge](https://docs.secureaddress.bridge)

## License

This project is licensed under the MIT License - see the LICENSE file for details.
`;
  
  fs.writeFileSync(mainReadmePath, readmeContent);
  console.log('✅ Main SDK README created');
}

// Create README for the React Native SDK if it doesn't exist
const reactNativeReadmePath = path.resolve(__dirname, '../react-native/README.md');
if (!fs.existsSync(reactNativeReadmePath)) {
  console.log('📝 Creating README for React Native SDK...');
  
  const readmeContent = `# SecureAddress Bridge React Native SDK

The SecureAddress Bridge React Native SDK provides a seamless way to integrate with SecureAddress Bridge in React Native applications,
allowing you to securely access verified physical addresses with enhanced blockchain support and blind shipping capabilities.

## Installation

\`\`\`bash
npm install @secureaddress/bridge-sdk-react-native @react-native-async-storage/async-storage
\`\`\`

## Usage

\`\`\`jsx
import React from 'react';
import { View, Text, Button } from 'react-native';
import { useSecureAddressNative } from '@secureaddress/bridge-sdk-react-native';

export default function AddressScreen() {
  const {
    address,
    isLoading,
    error,
    requestAccess,
    hasValidPermission
  } = useSecureAddressNative({
    appId: 'YOUR_APP_ID',
    redirectUri: 'yourapp://callback',
    scope: ['street', 'city', 'state']
  });

  if (isLoading) return <Text>Loading...</Text>;
  if (error) return <Text>Error: {error.message}</Text>;
  
  if (!hasValidPermission) {
    return (
      <Button 
        title="Share your address"
        onPress={requestAccess}
      />
    );
  }
  
  return (
    <View>
      <Text style={{fontSize: 18, fontWeight: 'bold'}}>Your Address</Text>
      <Text>{address?.street}</Text>
      <Text>{address?.city}, {address?.state} {address?.postal_code}</Text>
      <Text>{address?.country}</Text>
    </View>
  );
}
\`\`\`

## Deep Linking Setup

For the redirect URI to work properly, you need to configure deep linking in your React Native app:

### For iOS

Update your Info.plist:

\`\`\`xml
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>yourapp</string>
    </array>
  </dict>
</array>
\`\`\`

### For Android

Update your AndroidManifest.xml:

\`\`\`xml
<activity
  android:name=".MainActivity"
  android:launchMode="singleTask">
  <intent-filter>
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />
    <data android:scheme="yourapp" />
  </intent-filter>
</activity>
\`\`\`

## Documentation

For complete documentation, visit [https://docs.secureaddress.bridge/sdk/react-native](https://docs.secureaddress.bridge/sdk/react-native)

## License

This project is licensed under the MIT License - see the LICENSE file for details.
`;
  
  fs.writeFileSync(reactNativeReadmePath, readmeContent);
  console.log('✅ React Native SDK README created');
}

console.log('✅ Package preparation complete');

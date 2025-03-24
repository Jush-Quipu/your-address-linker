import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CodeBlock from '@/components/CodeBlock';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

const ApiDocumentation: React.FC = () => {
  const [activeTab, setActiveTab] = useState('api-reference');

  // Authentication code example
  const authCodeExample = `// Using our JavaScript SDK
import { SecureAddressBridge } from '@secureaddress/bridge-sdk';

// Initialize with your app credentials
const client = new SecureAddressBridge({
  appId: 'YOUR_APP_ID',
  appSecret: 'YOUR_APP_SECRET',
  // Optional wallet integration options
  walletOptions: {
    supportedChains: ['ethereum', 'polygon', 'optimism']
  },
  // Optional webhook configuration
  webhooks: {
    url: 'https://your-app.com/webhooks/secureaddress'
  }
});

// Get an access token for your app
const token = await client.authenticate();
console.log(token); // Use this token for subsequent API calls`;

  // Request address code example
  const requestAddressExample = `// Generate authorization URL with CSRF protection
const state = generateRandomString(); // Create a random string
localStorage.setItem('secureaddress_state', state); // Store for validation

const authUrl = client.getAuthorizationUrl({
  redirectUri: 'https://your-app.com/callback',
  scope: ['street', 'city', 'state', 'postal_code'],
  state: state, // CSRF protection
  preferredChain: 'ethereum' // Optional blockchain preference
});

// Redirect user to this URL to approve access
window.location.href = authUrl;`;

  // Access token code example
  const accessTokenExample = `// In your callback handler
const { code, state } = parseQueryParams(window.location.search);

// Verify state parameter to prevent CSRF attacks
const storedState = localStorage.getItem('secureaddress_state');
if (state !== storedState) {
  throw new Error('Invalid state parameter');
}

// Exchange code for access token
const result = await client.exchangeCode({
  code,
  redirectUri: 'https://your-app.com/callback',
});

const { accessToken, expiresIn, refreshToken } = result;

// Store tokens securely
localStorage.setItem('secureaddress_token', accessToken);`;

  // Get address code example
  const getAddressExample = `// Get user's address with the token
const data = await client.getAddress({
  accessToken,
  includeVerificationInfo: true // Get verification details
});

console.log(data);
// {
//   address: {
//     street: '123 Main St',  // Only included if user approved this field
//     city: 'San Francisco',  // Only included if user approved this field
//     state: 'CA',            // Only included if user approved this field
//     postal_code: '94105',   // Only included if user approved this field
//     country: 'US',          // Only included if user approved this field
//   },
//   verification: {
//     status: 'verified',
//     method: 'document_upload',
//     date: '2023-07-15T10:30:00Z'
//   },
//   permission: {
//     access_count: 3,
//     max_access_count: 10,
//     access_expiry: '2023-08-15T00:00:00Z'
//   }
// }`;

  // Webhook code example
  const webhookExample = `// Set up a webhook to receive updates with signature verification
const express = require('express');
const app = express();
app.use(express.json());

// Your webhook secret (configured when registering the webhook)
const WEBHOOK_SECRET = 'your-webhook-secret';

app.post('/secureaddress/webhook', (req, res) => {
  const { event, data } = req.body;
  const signature = req.headers['x-signature'];
  
  // Verify webhook signature
  if (!client.verifyWebhookSignature(signature, JSON.stringify(req.body), WEBHOOK_SECRET)) {
    return res.status(401).send('Invalid signature');
  }
  
  // Handle different event types
  switch (event) {
    case 'address.updated':
      // Address was updated, fetch fresh data
      break;
    case 'address.verified':
      // Address was verified
      break;
    case 'permission.granted':
      // User granted new permissions
      break;
    case 'permission.revoked':
      // User revoked access to their address
      break;
    case 'wallet.linked':
      // Wallet was linked to a verified address
      break;
    default:
      console.log(\`Unhandled event: \${event}\`);
  }
  
  res.status(200).send('Webhook received');
});

app.listen(3000, () => console.log('Webhook server running on port 3000'));`;

  // SDK usage example with React
  const sdkExample = `// Complete example of using the SDK with React hooks
import React, { useState } from 'react';
import { useSecureAddress } from '@secureaddress/bridge-sdk';

function CheckoutForm() {
  const [orderData, setOrderData] = useState({});
  
  // Initialize the SDK with your app credentials
  const { 
    address, 
    isLoading, 
    error, 
    requestAccess, 
    hasValidPermission,
    walletInfo,
    connectWallet
  } = useSecureAddress({
    appId: 'YOUR_APP_ID',
    // Advanced configuration options
    includeVerificationInfo: true,
    clearUrlAfterAuth: true,
    validateState: true
  });
  
  const handleGetAddress = () => {
    if (!hasValidPermission) {
      // Request address with enhanced options
      requestAccess({
        scope: ['street', 'city', 'state', 'postal_code', 'country'],
        expiryDays: 30,
        maxAccesses: 5,
        useWalletConnect: false
      });
    }
  };
  
  const handleConnectWallet = async () => {
    try {
      // Connect to user's blockchain wallet
      const wallet = await connectWallet({
        providerType: 'injected' // or 'walletconnect'
      });
      console.log('Connected wallet:', wallet);
    } catch (error) {
      console.error('Wallet connection error:', error);
    }
  };
  
  const handleCheckout = () => {
    if (address) {
      // Process order with the shipping address
      submitOrder({
        ...orderData,
        shippingAddress: address
      });
    }
  };
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      <h2>Checkout</h2>
      
      {!hasValidPermission ? (
        <button onClick={handleGetAddress}>
          Get Shipping Address
        </button>
      ) : (
        <div>
          <h3>Shipping Address</h3>
          <p>{address.street}</p>
          <p>{address.city}, {address.state} {address.postal_code}</p>
          <p>{address.country}</p>
          
          {!walletInfo && (
            <button onClick={handleConnectWallet}>
              Connect Wallet for Payment
            </button>
          )}
          
          {walletInfo && (
            <div>
              <p>Connected wallet: {walletInfo.address}</p>
              <button onClick={handleCheckout}>Complete Order</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}`;

  // Example for marketplace verification
  const marketplaceVerificationExample = `// Check if seller has a verified address
const sellerStatus = await client.getAddressVerification({
  userId: sellerId,
  includeVerificationInfo: true
});

if (sellerStatus.verification?.status === 'verified') {
  // Show "Verified Seller" badge
  displayVerifiedBadge({
    verificationDate: sellerStatus.verification.date,
    verificationMethod: sellerStatus.verification.method
  });
} else {
  // Prompt seller to verify their address
  promptForVerification();
}

// You can also generate a verifiable credential for on-chain verification
if (sellerWalletConnected) {
  const result = await client.linkAddressToWallet({
    walletAddress: sellerWalletAddress,
    chainId: sellerChainId,
    createVerifiableCredential: true
  });
  
  // The verifiable credential can be used for on-chain verification
  console.log(result.verifiableCredential);
}`;

  // Example for wallet linking
  const walletLinkingExample = `// Link a verified address to a blockchain wallet
import { useSecureAddress } from '@secureaddress/bridge-sdk';

function AddressWalletLinker() {
  const { 
    address, 
    walletInfo, 
    connectWallet, 
    linkAddressToWallet, 
    requestAccess,
    hasValidPermission
  } = useSecureAddress({
    appId: 'YOUR_APP_ID'
  });
  
  const handleConnectWallet = async () => {
    await connectWallet();
  };
  
  const handleLinkAddress = async () => {
    if (!address) {
      requestAccess({
        scope: ['city', 'country'],  // Minimal address info needed
        useWalletConnect: true       // Use WalletConnect for mobile users
      });
      return;
    }
    
    if (!walletInfo) {
      await connectWallet();
      return;
    }
    
    try {
      const result = await linkAddressToWallet({
        createVerifiableCredential: true  // Create a VC for on-chain verification
      });
      
      console.log('Address linked to wallet:', result);
      // Display success message to user
    } catch (error) {
      console.error('Failed to link address:', error);
    }
  };
  
  return (
    <div>
      <h2>Link Your Address to Wallet</h2>
      
      {!hasValidPermission && (
        <button onClick={() => requestAccess()}>
          Provide Address Access
        </button>
      )}
      
      {hasValidPermission && !walletInfo && (
        <button onClick={handleConnectWallet}>
          Connect Wallet
        </button>
      )}
      
      {hasValidPermission && walletInfo && (
        <button onClick={handleLinkAddress}>
          Link Address to Wallet
        </button>
      )}
    </div>
  );
}`;

  // Usage statistics example
  const usageStatsExample = `// Get usage statistics for your application
const stats = await client.getUsageStats();

console.log(stats);
// {
//   active_permissions: 157,
//   total_address_accesses: 1258,
//   unique_users: 89,
//   access_by_country: {
//     "US": 782,
//     "CA": 215,
//     // ...
//   },
//   most_accessed_fields: ["city", "country", "postal_code"],
//   average_permission_duration: 27.3  // in days
// }`;

  return (
    <div className="space-y-8">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-6 mb-8">
          <TabsTrigger value="api-reference">API Reference</TabsTrigger>
          <TabsTrigger value="sdk">SDK</TabsTrigger>
          <TabsTrigger value="oauth">OAuth Flow</TabsTrigger>
          <TabsTrigger value="web3">Web3 Features</TabsTrigger>
          <TabsTrigger value="examples">Examples</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
        </TabsList>
        
        <TabsContent value="api-reference" className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                RESTful API Endpoints
                <Badge variant="outline" className="ml-2">v1</Badge>
              </CardTitle>
              <CardDescription>
                SecureAddress Bridge provides a RESTful API for accessing user address data with consent.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <h3 className="text-lg font-medium">Base URL</h3>
                <CodeBlock
                  code="https://api.secureaddress.bridge/v1"
                  language="bash"
                  showLineNumbers={false}
                />
                
                <h3 className="text-lg font-medium mt-6">Authentication</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  All API requests must include your app's access token in the Authorization header.
                </p>
                <CodeBlock
                  code="Authorization: Bearer YOUR_ACCESS_TOKEN
X-App-ID: YOUR_APP_ID"
                  language="bash"
                  showLineNumbers={false}
                />
                
                <h3 className="text-lg font-medium mt-6">Endpoints</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Endpoint</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Description</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-mono">/token</TableCell>
                      <TableCell>POST</TableCell>
                      <TableCell>Exchange authorization code for access token</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-mono">/address</TableCell>
                      <TableCell>GET</TableCell>
                      <TableCell>Retrieve user's address data</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-mono">/token/refresh</TableCell>
                      <TableCell>POST</TableCell>
                      <TableCell>Refresh an expired access token</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-mono">/token/revoke</TableCell>
                      <TableCell>POST</TableCell>
                      <TableCell>Revoke an access token</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-mono">/validate-token</TableCell>
                      <TableCell>GET</TableCell>
                      <TableCell>Validate an access token</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-mono">/webhooks</TableCell>
                      <TableCell>POST</TableCell>
                      <TableCell>Register a webhook URL</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-mono">/link-wallet</TableCell>
                      <TableCell>POST</TableCell>
                      <TableCell>Link a verified address to a blockchain wallet</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-mono">/usage-stats</TableCell>
                      <TableCell>GET</TableCell>
                      <TableCell>Get usage statistics for your application</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
                
                <h3 className="text-lg font-medium mt-6">Rate Limits</h3>
                <p className="text-sm text-muted-foreground">
                  The API is rate-limited to 100 requests per minute per app. Enterprise customers
                  can request higher limits. If you exceed this limit, you'll receive a 429 Too Many
                  Requests response.
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>GET /address</CardTitle>
              <CardDescription>
                Retrieve a user's address data based on their permissions with enhanced options.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Request</h3>
                <CodeBlock
                  code={`GET /address?fields=street,city,state,postal_code&include_verification=true HTTP/1.1
Host: api.secureaddress.bridge
Authorization: Bearer USER_ACCESS_TOKEN
X-App-ID: YOUR_APP_ID`}
                  language="http"
                  showLineNumbers={true}
                />
                
                <h3 className="text-lg font-medium mt-4">Response</h3>
                <CodeBlock
                  code={`HTTP/1.1 200 OK
Content-Type: application/json

{
  "address": {
    "street": "123 Main St",     // Only included if user approved this field
    "city": "San Francisco",     // Only included if user approved this field
    "state": "CA",               // Only included if user approved this field
    "postal_code": "94105",      // Only included if user approved this field
    "country": "US"              // Only included if user approved this field
  },
  "verification": {
    "status": "verified",
    "method": "document_upload",
    "date": "2023-07-15T10:30:00Z"
  },
  "permission": {
    "app_id": "app_123456",
    "app_name": "Example Shop",
    "access_count": 3,
    "max_access_count: 10,
    "access_expiry": "2023-08-15T00:00:00Z"
  }
}`}
                  language="json"
                  showLineNumbers={true}
                />
                
                <h3 className="text-lg font-medium mt-4">Query Parameters</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Parameter</TableHead>
                      <TableHead>Description</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>fields</TableCell>
                      <TableCell>Comma-separated list of specific fields to request</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>include_verification</TableCell>
                      <TableCell>Set to 'true' to include verification details</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
                
                <h3 className="text-lg font-medium mt-4">Error Responses</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Status Code</TableHead>
                      <TableHead>Description</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>401 Unauthorized</TableCell>
                      <TableCell>Invalid or expired access token</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>403 Forbidden</TableCell>
                      <TableCell>Token does not have permission to access address</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>404 Not Found</TableCell>
                      <TableCell>Address not found for the user</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>429 Too Many Requests</TableCell>
                      <TableCell>Rate limit exceeded</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="sdk" className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                JavaScript SDK
                <Badge variant="outline" className="ml-2">v2.0.0</Badge>
              </CardTitle>
              <CardDescription>
                The SecureAddress Bridge JavaScript SDK simplifies integration into web applications
                with enhanced Web3 capabilities.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <h3 className="text-lg font-medium">Installation</h3>
                <CodeBlock
                  code="npm install @secureaddress/bridge-sdk"
                  language="bash"
                  showLineNumbers={false}
                />
                
                <h3 className="text-lg font-medium mt-6">Initialization</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Initialize the SDK with your app credentials and optional configurations.
                </p>
                <CodeBlock
                  code={authCodeExample}
                  language="javascript"
                  showLineNumbers={true}
                />
                
                <h3 className="text-lg font-medium mt-6">React Integration</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  The SDK includes a convenient React hook for easy integration.
                </p>
                <CodeBlock
                  code={`import { useSecureAddress } from '@secureaddress/bridge-sdk';

function AddressComponent() {
  const { 
    address, 
    isLoading, 
    error, 
    requestAccess, 
    hasValidPermission,
    permissionDetails,
    walletInfo,
    connectWallet,
    linkAddressToWallet,
    getUsageStats
  } = useSecureAddress({
    appId: 'YOUR_APP_ID',
    // Optional configuration
    includeVerificationInfo: true
  });
  
  // Now you can use these values and functions in your component
}`}
                  language="javascript"
                  showLineNumbers={true}
                />
                
                <h3 className="text-lg font-medium mt-6">Enhanced Features</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Feature</TableHead>
                      <TableHead>Description</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>Multi-chain support</TableCell>
                      <TableCell>Support for multiple blockchain networks (Ethereum, Polygon, etc.)</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Wallet integration</TableCell>
                      <TableCell>Connect to MetaMask, WalletConnect, and other Web3 wallets</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Verifiable credentials</TableCell>
                      <TableCell>Generate on-chain verifiable credentials for address verification</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Enhanced security</TableCell>
                      <TableCell>CSRF protection, signature verification, and secure storage</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Usage analytics</TableCell>
                      <TableCell>Track address usage and permission statistics</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>SDK Reference</CardTitle>
              <CardDescription>
                Complete reference for all methods available in the SecureAddress Bridge SDK.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Method</TableHead>
                      <TableHead>Description</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-mono">authenticate()</TableCell>
                      <TableCell>Get an access token for your app</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-mono">authorize(options)</TableCell>
                      <TableCell>Generate and redirect to authorization URL</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-mono">handleCallback(options)</TableCell>
                      <TableCell>Process authorization callback with CSRF validation</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-mono">getAddress(options)</TableCell>
                      <TableCell>Get user's address data with verification details</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-mono">validateToken()</TableCell>
                      <TableCell>Validate an access token with detailed information</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-mono">registerWebhook(options)</TableCell>
                      <TableCell>Register a webhook URL for notifications</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-mono">verifyWebhookSignature(signature, payload, secret)</TableCell>
                      <TableCell>Verify webhook signature</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-mono">connectWallet(options)</TableCell>
                      <TableCell>Connect to a blockchain wallet</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-mono">linkAddressToWallet(options)</TableCell>
                      <TableCell>Link verified address to blockchain wallet</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-mono">getUsageStats()</TableCell>
                      <TableCell>Get usage statistics for your application</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
                
                <h3 className="text-lg font-medium mt-6">React Hook Properties</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Property</TableHead>
                      <TableHead>Description</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-mono">address</TableCell>
                      <TableCell>The user's address data (if authorized)</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-mono">isLoading</TableCell>
                      <TableCell>Loading state for async operations</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-mono">error</TableCell>
                      <TableCell>Error information if any operation fails</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-mono">hasValidPermission</TableCell>
                      <TableCell>Whether the user has granted valid permission</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-mono">permissionDetails</TableCell>
                      <TableCell>Detailed information about the user's permission</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-mono">walletInfo</TableCell>
                      <TableCell>Connected wallet information</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-mono">requestAccess</TableCell>
                      <TableCell>Function to request address access</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-mono">connectWallet</TableCell>
                      <TableCell>Function to connect a blockchain wallet</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-mono">linkAddressToWallet</TableCell>
                      <TableCell>Function to link address to wallet</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-mono">getUsageStats</TableCell>
                      <TableCell>Function to get usage statistics</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-mono">sdk</TableCell>
                      <TableCell>Direct access to the SDK instance</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="oauth" className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>OAuth Authorization Flow</CardTitle>
              <CardDescription>
                SecureAddress Bridge uses an OAuth 2.0 flow to authorize access to user address data.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <h3 className="text-lg font-medium">Step 1: Request Authorization</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Redirect the user to the SecureAddress Bridge authorization URL.
                </p>
                <CodeBlock
                  code={requestAddressExample}
                  language="javascript"
                  showLineNumbers={true}
                />
                
                <h3 className="text-lg font-medium mt-6">Step 2: User Grants Permission</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  The user is shown a permission screen where they can approve sharing their address data.
                  They can select which specific address components (street, city, etc.) to share.
                </p>
                
                <h3 className="text-lg font-medium mt-6">Step 3: Handle Redirect</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  After approval, the user is redirected back to your application with an authorization code.
                </p>
                
                <h3 className="text-lg font-medium mt-6">Step 4: Exchange Code for Token</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Exchange the authorization code for an access token.
                </p>
                <CodeBlock
                  code={accessTokenExample}
                  language="javascript"
                  showLineNumbers={true}
                />
                
                <h3 className="text-lg font-medium mt-6">Step 5: Access Address Data</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Use the access token to retrieve the user's address data.
                </p>
                <CodeBlock
                  code={getAddressExample}
                  language="javascript"
                  showLineNumbers={true}
                />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Scopes</CardTitle>
              <CardDescription>
                Scopes define what parts of a user's address your application can access.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Scope</TableHead>
                      <TableHead>Description</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>street</TableCell>
                      <TableCell>Access to user's street address</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>city</TableCell>
                      <TableCell>Access to user's city</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>state</TableCell>
                      <TableCell>Access to user's state/province</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>postal_code</TableCell>
                      <TableCell>Access to user's postal/ZIP code</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>country</TableCell>
                      <TableCell>Access to user's country</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="web3" className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Web3 Integration</CardTitle>
              <CardDescription>
                SecureAddress Bridge provides seamless integration with blockchain wallets and Web3 features.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <h3 className="text-lg font-medium">Wallet Connections</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Connect to popular Web3 wallets like MetaMask and WalletConnect.
                </p>
                <CodeBlock
                  code={`// Connect to a wallet using the SDK
const wallet = await client.connectWallet({
  providerType: 'injected' // Use MetaMask or other injected providers
});

console.log('Connected wallet:', wallet);
// {
//   success: true,
//   address: '0x1234...5678',
//   chainId: '0x1', // Ethereum Mainnet
//   providerType: 'injected'
// }

// Or using the React hook
const { connectWallet, walletInfo } = useSecureAddress({
  appId: 'YOUR_APP_ID'
});

const handleConnect = async () => {
  await connectWallet();
  // walletInfo will be updated with the connected wallet
}`}
                  language="javascript"
                  showLineNumbers={true}
                />
                
                <h3 className="text-lg font-medium mt-6">Address-Wallet Linking</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Link verified physical addresses to blockchain wallets for enhanced trust and verification.
                </p>
                <CodeBlock
                  code={walletLinkingExample}
                  language="javascript"
                  showLineNumbers={true}
                />
                
                <h3 className="text-lg font-medium mt-6">Verifiable Credentials</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Generate verifiable credentials for on-chain address verification that can be used in dApps.
                </p>
                <CodeBlock
                  code={`// Create a verifiable credential linking an address to a wallet
const credential = await client.linkAddressToWallet({
  walletAddress: '0x1234...5678',
  chainId: '0x1',
  createVerifiableCredential: true
});

console.log(credential);
// {
//   id: 'vc_1234567890',
//   issuanceDate: '2023-07-15T10:30:00Z',
//   expirationDate: '2024-07-15T10:30:00Z',
//   credential: {
//     type: ['VerifiableCredential', 'AddressVerification'],
//     issuer: 'did:web:secureaddress.bridge',
//     subject: '0x1234...5678',
//     status: 'verified',
//     countryVerified: true,
//     cityVerified: true,
//     proof: {
//       type: 'EcdsaSecp256k1Signature2019',
//       created: '2

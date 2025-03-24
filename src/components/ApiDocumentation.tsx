
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CodeBlock from '@/components/CodeBlock';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const ApiDocumentation: React.FC = () => {
  const [activeTab, setActiveTab] = useState('api-reference');

  // Authentication code example
  const authCodeExample = `// Using our JavaScript SDK
import { SecureAddressBridge } from '@secureaddress/bridge-sdk';

// Initialize with your app credentials
const client = new SecureAddressBridge({
  appId: 'YOUR_APP_ID',
  appSecret: 'YOUR_APP_SECRET',
});

// Get an access token for your app
const token = await client.authenticate();
console.log(token); // Use this token for subsequent API calls`;

  // Request address code example
  const requestAddressExample = `// Generate authorization URL
const authUrl = client.getAuthorizationUrl({
  redirectUri: 'https://your-app.com/callback',
  scope: ['street', 'city', 'state', 'postal_code'],
  state: 'random-state-for-csrf-protection',
});

// Redirect user to this URL to approve access
window.location.href = authUrl;`;

  // Access token code example
  const accessTokenExample = `// In your callback handler
const { code } = parseQueryParams(window.location.search);

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
const address = await client.getAddress({
  accessToken,
});

console.log(address);
// {
//   street: '123 Main St',  // Only included if user approved this field
//   city: 'San Francisco',  // Only included if user approved this field
//   state: 'CA',            // Only included if user approved this field
//   postal_code: '94105',   // Only included if user approved this field
//   country: 'US',          // Only included if user approved this field
// }`;

  // Webhook code example
  const webhookExample = `// Set up a webhook to receive updates
const express = require('express');
const app = express();
app.use(express.json());

app.post('/secureaddress/webhook', (req, res) => {
  const { event, data, signature } = req.body;
  
  // Verify webhook signature
  if (!client.verifyWebhookSignature(signature, JSON.stringify(data))) {
    return res.status(401).send('Invalid signature');
  }
  
  // Handle different event types
  switch (event) {
    case 'address.updated':
      // Address was updated, fetch fresh data
      break;
    case 'permission.revoked':
      // User revoked access to their address
      break;
    default:
      console.log(\`Unhandled event: \${event}\`);
  }
  
  res.status(200).send('Webhook received');
});

app.listen(3000, () => console.log('Webhook server running on port 3000'));`;

  // SDK usage example 
  const sdkExample = `// Complete example of using the SDK for e-commerce
import { SecureAddressBridge } from '@secureaddress/bridge-sdk';

// Step 1: Initialize the client with your app credentials
const client = new SecureAddressBridge({
  appId: 'YOUR_APP_ID',
  appSecret: 'YOUR_APP_SECRET',
});

// Step 2: Set up the checkout flow
document.getElementById('checkout-button').addEventListener('click', async () => {
  try {
    // Create authorization URL with address scopes
    const authUrl = client.getAuthorizationUrl({
      redirectUri: 'https://your-shop.com/checkout/callback',
      scope: ['street', 'city', 'state', 'postal_code', 'country'],
      state: generateRandomState(), // Add CSRF protection
    });
    
    // Redirect user to authorize
    window.location.href = authUrl;
  } catch (error) {
    console.error('Authorization error:', error);
    showError('Failed to connect to SecureAddress Bridge');
  }
});

// Step 3: Handle the callback after user authorization
async function handleCallback() {
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');
  const state = urlParams.get('state');
  
  // Verify state for CSRF protection
  if (state !== localStorage.getItem('secureaddress_state')) {
    showError('Invalid state parameter');
    return;
  }
  
  try {
    // Exchange code for access token
    const tokens = await client.exchangeCode({
      code,
      redirectUri: 'https://your-shop.com/checkout/callback',
    });
    
    // Get shipping address
    const address = await client.getAddress({
      accessToken: tokens.accessToken,
    });
    
    // Populate shipping form
    populateShippingForm(address);
    
    // Continue with checkout
    showShippingReview();
  } catch (error) {
    console.error('Failed to get address:', error);
    showError('Could not retrieve your shipping address');
  }
}

// Helper to populate shipping form
function populateShippingForm(address) {
  document.getElementById('shipping-street').textContent = address.street;
  document.getElementById('shipping-city').textContent = address.city;
  document.getElementById('shipping-state').textContent = address.state;
  document.getElementById('shipping-zip').textContent = address.postal_code;
  document.getElementById('shipping-country').textContent = address.country;
}`;

  // Example for marketplace verification
  const marketplaceVerificationExample = `// Check if seller has a verified address
const sellerStatus = await client.getAddressVerification({
  userId: sellerId,
  accessToken: token,
});

if (sellerStatus.verification_status === 'verified') {
  // Show "Verified Seller" badge
  displayVerifiedBadge();
} else {
  // Prompt seller to verify their address
  promptForVerification();
}`;

  // Example for service area check
  const serviceAreaExample = `// Check if user is in service area
function checkServiceArea(address) {
  // Extract postal code or city/state
  const { postal_code, city, state } = address;
  
  // Check against your service area database
  const isInServiceArea = serviceAreaDB.includes(postal_code);
  
  if (isInServiceArea) {
    showServiceAvailable();
  } else {
    showServiceUnavailable();
  }
  
  // No need to store the full address
  return isInServiceArea;
}`;

  return (
    <div className="space-y-8">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-5 mb-8">
          <TabsTrigger value="api-reference">API Reference</TabsTrigger>
          <TabsTrigger value="sdk">SDK</TabsTrigger>
          <TabsTrigger value="oauth">OAuth Flow</TabsTrigger>
          <TabsTrigger value="examples">Examples</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
        </TabsList>
        
        <TabsContent value="api-reference" className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>RESTful API Endpoints</CardTitle>
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
                  code="Authorization: Bearer YOUR_ACCESS_TOKEN"
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
                      <TableCell className="font-mono">/webhook</TableCell>
                      <TableCell>POST</TableCell>
                      <TableCell>Register a webhook URL</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
                
                <h3 className="text-lg font-medium mt-6">Rate Limits</h3>
                <p className="text-sm text-muted-foreground">
                  The API is rate-limited to 100 requests per minute per app. If you exceed this limit,
                  you'll receive a 429 Too Many Requests response.
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>GET /address</CardTitle>
              <CardDescription>
                Retrieve a user's address data based on their permissions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Request</h3>
                <CodeBlock
                  code={`GET /address HTTP/1.1
Host: api.secureaddress.bridge
Authorization: Bearer USER_ACCESS_TOKEN`}
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
    "country": "US",             // Only included if user approved this field
    "verification_status": "verified"
  }
}`}
                  language="json"
                  showLineNumbers={true}
                />
                
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
                      <TableCell>Invalid or missing access token</TableCell>
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
              <CardTitle>JavaScript SDK</CardTitle>
              <CardDescription>
                The SecureAddress Bridge JavaScript SDK simplifies integration into web applications.
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
                
                <h3 className="text-lg font-medium mt-6">Authentication</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Initialize the SDK with your app credentials.
                </p>
                <CodeBlock
                  code={authCodeExample}
                  language="javascript"
                  showLineNumbers={true}
                />
                
                <h3 className="text-lg font-medium mt-6">Usage Example</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Complete example of integrating the SDK into an e-commerce checkout flow.
                </p>
                <CodeBlock
                  code={sdkExample}
                  language="javascript"
                  showLineNumbers={true}
                />
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
                      <TableCell className="font-mono">getAuthorizationUrl(options)</TableCell>
                      <TableCell>Generate a URL for user authorization</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-mono">exchangeCode(options)</TableCell>
                      <TableCell>Exchange authorization code for access token</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-mono">getAddress(options)</TableCell>
                      <TableCell>Get user's address data</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-mono">refreshToken(options)</TableCell>
                      <TableCell>Refresh an expired access token</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-mono">revokeToken(options)</TableCell>
                      <TableCell>Revoke an access token</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-mono">registerWebhook(options)</TableCell>
                      <TableCell>Register a webhook URL</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-mono">verifyWebhookSignature(signature, payload)</TableCell>
                      <TableCell>Verify webhook signature</TableCell>
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
        
        <TabsContent value="examples" className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Integration Examples</CardTitle>
              <CardDescription>
                Common integration scenarios for SecureAddress Bridge.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <h3 className="text-lg font-medium">E-commerce Checkout</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Streamline the checkout process by allowing users to securely share their shipping address.
                </p>
                <CodeBlock
                  code={sdkExample}
                  language="javascript"
                  showLineNumbers={true}
                />
                
                <h3 className="text-lg font-medium mt-6">Marketplace Verification</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Verify a seller's address without revealing it to buyers, using address verification status.
                </p>
                <CodeBlock
                  code={marketplaceVerificationExample}
                  language="javascript"
                  showLineNumbers={true}
                />
                
                <h3 className="text-lg font-medium mt-6">Service-Area Business</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Check if a user is within your service area without storing their exact address.
                </p>
                <CodeBlock
                  code={serviceAreaExample}
                  language="javascript"
                  showLineNumbers={true}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="webhooks" className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Webhooks</CardTitle>
              <CardDescription>
                Receive real-time notifications when users update their address or modify permissions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <h3 className="text-lg font-medium">Setting Up Webhooks</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Register a webhook URL to receive event notifications.
                </p>
                <CodeBlock
                  code={webhookExample}
                  language="javascript"
                  showLineNumbers={true}
                />
                
                <h3 className="text-lg font-medium mt-6">Event Types</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Event</TableHead>
                      <TableHead>Description</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>address.updated</TableCell>
                      <TableCell>User has updated their address</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>permission.granted</TableCell>
                      <TableCell>User has granted permission to access their address</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>permission.modified</TableCell>
                      <TableCell>User has modified the permissions for an application</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>permission.revoked</TableCell>
                      <TableCell>User has revoked permission to access their address</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>verification.completed</TableCell>
                      <TableCell>User has completed address verification</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
                
                <h3 className="text-lg font-medium mt-6">Security</h3>
                <p className="text-sm text-muted-foreground">
                  All webhook requests include a signature header that you should verify to ensure
                  the request came from SecureAddress Bridge.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ApiDocumentation;

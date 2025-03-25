
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import CodeBlock from '@/components/CodeBlock';

const ApiDocumentation: React.FC = () => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2000);
  };
  
  const baseUrl = 'https://akfieehzgpcapuhdujvf.supabase.co/functions/v1';
  
  return (
    <div className="space-y-8">
      <div className="border rounded-lg p-4 bg-muted/20">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Base URL</h3>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 gap-1" 
            onClick={() => handleCopy(baseUrl, 'base-url')}
          >
            {copiedId === 'base-url' ? (
              <><CheckCircle className="h-4 w-4" /> Copied</>
            ) : (
              <><Copy className="h-4 w-4" /> Copy</>
            )}
          </Button>
        </div>
        <p className="mt-1 font-mono text-sm">{baseUrl}</p>
      </div>
      
      <Tabs defaultValue="overview">
        <TabsList className="w-full grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 h-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="authentication">Authentication</TabsTrigger>
          <TabsTrigger value="address">Address API</TabsTrigger>
          <TabsTrigger value="wallet">Wallet API</TabsTrigger>
          <TabsTrigger value="webhook">Webhooks</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>SecureAddress Bridge API</CardTitle>
              <CardDescription>
                Connect your applications to our secure address verification and wallet-linking services
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p>
                  The SecureAddress Bridge API provides a secure way to verify and access user addresses 
                  while preserving privacy and security. Our API follows OAuth 2.0 standards for authorization, 
                  making it easy to integrate with existing applications.
                </p>
                
                <h3 className="text-lg font-medium mt-4">Getting Started</h3>
                <ol className="list-decimal list-inside space-y-2 pl-4">
                  <li>Register your application in the developer dashboard</li>
                  <li>Implement the OAuth 2.0 authorization flow</li>
                  <li>Request user permissions for address access</li>
                  <li>Use the granted tokens to access address information</li>
                </ol>
                
                <h3 className="text-lg font-medium mt-4">API Categories</h3>
                <ul className="list-disc list-inside space-y-1 pl-4">
                  <li><strong>Authentication API</strong> - OAuth 2.0 endpoints for secure access</li>
                  <li><strong>Address API</strong> - Verify and access user address information</li>
                  <li><strong>Wallet API</strong> - Link blockchain wallets to verified addresses</li>
                  <li><strong>Webhook API</strong> - Receive real-time notifications</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="authentication" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>OAuth 2.0 Authentication</CardTitle>
              <CardDescription>
                Secure access to user address information through standard OAuth flows
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Authorization Endpoint</h3>
                <p className="text-sm text-muted-foreground">
                  Initiate the authorization flow to request user consent.
                </p>
                <div className="flex items-center gap-2 text-sm text-primary">
                  <span className="px-2 py-1 rounded bg-primary-foreground">GET</span>
                  <span className="font-mono">/authorize</span>
                </div>
                
                <div className="mt-2">
                  <h4 className="text-sm font-medium">Required Parameters:</h4>
                  <ul className="list-disc list-inside space-y-1 pl-4 text-sm">
                    <li><code>app_id</code> - Your application ID</li>
                    <li><code>redirect_uri</code> - URI to redirect after authorization</li>
                    <li><code>response_type</code> - Must be "code"</li>
                    <li><code>state</code> - A random string for security</li>
                  </ul>
                </div>
                
                <div className="mt-2">
                  <h4 className="text-sm font-medium">Optional Parameters:</h4>
                  <ul className="list-disc list-inside space-y-1 pl-4 text-sm">
                    <li><code>scope</code> - Space-separated list of requested permissions (default: all)</li>
                    <li><code>expiry_days</code> - Number of days the permission lasts (default: 30)</li>
                    <li><code>max_access_count</code> - Maximum number of access attempts</li>
                    <li><code>access_notification</code> - Send notifications on access (true/false)</li>
                  </ul>
                </div>
                
                <CodeBlock 
                  language="javascript" 
                  code={`// Example authorization request
const authUrl = '${baseUrl}/authorize?app_id=app_123456&redirect_uri=https://yourapp.com/callback&response_type=code&state=random_state&scope=street city state postal_code country&expiry_days=30';
window.location.href = authUrl;`}
                  onCopy={(text) => handleCopy(text, 'auth-example')}
                  copied={copiedId === 'auth-example'}
                />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Token Endpoint</h3>
                <p className="text-sm text-muted-foreground">
                  Exchange authorization code for access token.
                </p>
                <div className="flex items-center gap-2 text-sm text-primary">
                  <span className="px-2 py-1 rounded bg-primary-foreground">POST</span>
                  <span className="font-mono">/token</span>
                </div>
                
                <div className="mt-2">
                  <h4 className="text-sm font-medium">Request Body:</h4>
                  <ul className="list-disc list-inside space-y-1 pl-4 text-sm">
                    <li><code>grant_type</code> - "authorization_code" or "refresh_token"</li>
                    <li><code>code</code> - The authorization code (for grant_type="authorization_code")</li>
                    <li><code>refresh_token</code> - The refresh token (for grant_type="refresh_token")</li>
                    <li><code>redirect_uri</code> - Must match the one used in the authorization request</li>
                    <li><code>app_id</code> - Your application ID</li>
                  </ul>
                </div>
                
                <CodeBlock 
                  language="javascript" 
                  code={`// Example token request
const response = await fetch('${baseUrl}/token', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    grant_type: 'authorization_code',
    code: 'authorization_code_from_callback',
    app_id: 'app_123456',
    redirect_uri: 'https://yourapp.com/callback'
  })
});

const { data } = await response.json();
// Store tokens
const { access_token, refresh_token, expires_in } = data;`}
                  onCopy={(text) => handleCopy(text, 'token-example')}
                  copied={copiedId === 'token-example'}
                />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-medium">User Info Endpoint</h3>
                <p className="text-sm text-muted-foreground">
                  Retrieve user information and address data.
                </p>
                <div className="flex items-center gap-2 text-sm text-primary">
                  <span className="px-2 py-1 rounded bg-primary-foreground">GET</span>
                  <span className="font-mono">/userinfo</span>
                </div>
                
                <div className="mt-2">
                  <h4 className="text-sm font-medium">Request Headers:</h4>
                  <ul className="list-disc list-inside space-y-1 pl-4 text-sm">
                    <li><code>Authorization</code> - Bearer token (access token)</li>
                  </ul>
                </div>
                
                <CodeBlock 
                  language="javascript" 
                  code={`// Example userinfo request
const response = await fetch('${baseUrl}/userinfo', {
  method: 'GET',
  headers: {
    'Authorization': \`Bearer \${accessToken}\`
  }
});

const { data } = await response.json();
// User information, including address data
console.log(data);`}
                  onCopy={(text) => handleCopy(text, 'userinfo-example')}
                  copied={copiedId === 'userinfo-example'}
                />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Token Revocation</h3>
                <p className="text-sm text-muted-foreground">
                  Revoke an access or refresh token.
                </p>
                <div className="flex items-center gap-2 text-sm text-primary">
                  <span className="px-2 py-1 rounded bg-primary-foreground">POST</span>
                  <span className="font-mono">/revoke</span>
                </div>
                
                <div className="mt-2">
                  <h4 className="text-sm font-medium">Request Body:</h4>
                  <ul className="list-disc list-inside space-y-1 pl-4 text-sm">
                    <li><code>token</code> - The token to revoke</li>
                    <li><code>token_type_hint</code> - "access_token" or "refresh_token"</li>
                    <li><code>app_id</code> - Your application ID</li>
                  </ul>
                </div>
                
                <CodeBlock 
                  language="javascript" 
                  code={`// Example token revocation
const response = await fetch('${baseUrl}/revoke', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    token: 'token_to_revoke',
    token_type_hint: 'access_token',
    app_id: 'app_123456'
  })
});

const result = await response.json();
console.log(result); // { success: true, data: { revoked: true } }`}
                  onCopy={(text) => handleCopy(text, 'revoke-example')}
                  copied={copiedId === 'revoke-example'}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="address" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Address API</CardTitle>
              <CardDescription>
                Verify and access physical address information securely
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Get Address</h3>
                <p className="text-sm text-muted-foreground">
                  Retrieve a user's address using a permission token.
                </p>
                <div className="flex items-center gap-2 text-sm text-primary">
                  <span className="px-2 py-1 rounded bg-primary-foreground">GET</span>
                  <span className="font-mono">/address</span>
                </div>
                
                <div className="mt-2">
                  <h4 className="text-sm font-medium">Request Headers:</h4>
                  <ul className="list-disc list-inside space-y-1 pl-4 text-sm">
                    <li><code>Authorization</code> - Bearer token (permission token or access token)</li>
                  </ul>
                </div>
                
                <CodeBlock 
                  language="javascript" 
                  code={`// Example get address request
const response = await fetch('${baseUrl}/address', {
  method: 'GET',
  headers: {
    'Authorization': \`Bearer \${accessToken}\`
  }
});

const { data } = await response.json();
// Address information
const { street_address, city, state, postal_code, country } = data;`}
                  onCopy={(text) => handleCopy(text, 'get-address-example')}
                  copied={copiedId === 'get-address-example'}
                />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Verify Address Status</h3>
                <p className="text-sm text-muted-foreground">
                  Check verification status of an address.
                </p>
                <div className="flex items-center gap-2 text-sm text-primary">
                  <span className="px-2 py-1 rounded bg-primary-foreground">GET</span>
                  <span className="font-mono">/get-verification-status</span>
                </div>
                
                <div className="mt-2">
                  <h4 className="text-sm font-medium">Request Headers:</h4>
                  <ul className="list-disc list-inside space-y-1 pl-4 text-sm">
                    <li><code>Authorization</code> - Bearer token (user session token)</li>
                  </ul>
                </div>
                
                <div className="mt-2">
                  <h4 className="text-sm font-medium">Optional Query Parameters:</h4>
                  <ul className="list-disc list-inside space-y-1 pl-4 text-sm">
                    <li><code>address_id</code> - Specific address ID to check (default: all user addresses)</li>
                  </ul>
                </div>
                
                <CodeBlock 
                  language="javascript" 
                  code={`// Example verification status check
const response = await fetch('${baseUrl}/get-verification-status', {
  method: 'GET',
  headers: {
    'Authorization': \`Bearer \${userSessionToken}\`
  }
});

const { data } = await response.json();
// Verification status information
console.log(data); // { verified: true, method: 'document_upload', ... }`}
                  onCopy={(text) => handleCopy(text, 'verification-status-example')}
                  copied={copiedId === 'verification-status-example'}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="wallet" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Wallet API</CardTitle>
              <CardDescription>
                Connect blockchain wallets to verified physical addresses
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Verify Wallet Ownership</h3>
                <p className="text-sm text-muted-foreground">
                  Verify ownership of a blockchain wallet through signature verification.
                </p>
                <div className="flex items-center gap-2 text-sm text-primary">
                  <span className="px-2 py-1 rounded bg-primary-foreground">POST</span>
                  <span className="font-mono">/wallet-verify</span>
                </div>
                
                <div className="mt-2">
                  <h4 className="text-sm font-medium">Request Body:</h4>
                  <ul className="list-disc list-inside space-y-1 pl-4 text-sm">
                    <li><code>wallet_address</code> - The blockchain wallet address</li>
                    <li><code>signature</code> - Signature of the message</li>
                    <li><code>message</code> - Message that was signed</li>
                    <li><code>user_id</code> - User ID that owns the wallet</li>
                    <li><code>chain_id</code> - (Optional) Blockchain chain ID (default: 1 for Ethereum mainnet)</li>
                  </ul>
                </div>
                
                <CodeBlock 
                  language="javascript" 
                  code={`// Example wallet verification
// First, create the message to sign
const message = \`Verify wallet ownership for SecureAddress Bridge\nTimestamp: \${Date.now()}\`;

// Have the user sign the message with their wallet (e.g., using ethers.js)
const signature = await signer.signMessage(message);

// Verify the signature
const response = await fetch('${baseUrl}/wallet-verify', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    wallet_address: '0x123...abc',
    signature: signature,
    message: message,
    user_id: 'user_123',
    chain_id: 1 // Ethereum mainnet
  })
});

const { data } = await response.json();
// Verification result
console.log(data); // { verified: true, wallet_id: '...', is_primary: true, ... }`}
                  onCopy={(text) => handleCopy(text, 'wallet-verify-example')}
                  copied={copiedId === 'wallet-verify-example'}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="webhook" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Webhook API</CardTitle>
              <CardDescription>
                Receive real-time notifications about address and permission changes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Webhooks allow your application to be notified in real-time when events happen in a
                user's account, such as address verification, permission changes, or address access.
              </p>
              
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Setting Up Webhooks</h3>
                <p className="text-sm text-muted-foreground">
                  Register webhook endpoints in your developer dashboard.
                </p>
                
                <div className="mt-4 mb-6">
                  <h4 className="text-sm font-medium">Available Events:</h4>
                  <ul className="list-disc list-inside space-y-1 pl-4 text-sm">
                    <li><code>address.verified</code> - An address was verified</li>
                    <li><code>address.updated</code> - An address was updated</li>
                    <li><code>permission.created</code> - A new permission was granted</li>
                    <li><code>permission.revoked</code> - A permission was revoked</li>
                    <li><code>address.accessed</code> - An address was accessed</li>
                  </ul>
                </div>
                
                <h3 className="text-lg font-medium mt-4">Webhook Payload Format</h3>
                <CodeBlock 
                  language="json" 
                  code={`{
  "event": "address.verified",
  "created_at": "2023-08-15T12:34:56Z",
  "data": {
    "user_id": "user_123",
    "address_id": "addr_456",
    "verification_method": "document_upload",
    // Additional event-specific data
  }
}`}
                  onCopy={(text) => handleCopy(text, 'webhook-payload-example')}
                  copied={copiedId === 'webhook-payload-example'}
                />
                
                <div className="mt-4">
                  <h3 className="text-lg font-medium">Security</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    All webhook requests include a signature header that you should verify to ensure the
                    request is authentic. The signature is created using HMAC SHA-256 with your webhook secret.
                  </p>
                  
                  <CodeBlock 
                    language="javascript" 
                    code={`// Example webhook signature verification
function verifyWebhookSignature(payload, signature, secret) {
  const hmac = crypto.createHmac('sha256', secret);
  const calculatedSignature = hmac.update(payload).digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(calculatedSignature)
  );
}`}
                    onCopy={(text) => handleCopy(text, 'webhook-verify-example')}
                    copied={copiedId === 'webhook-verify-example'}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ApiDocumentation;

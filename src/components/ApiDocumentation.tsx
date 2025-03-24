
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Code } from 'lucide-react';
import CodeBlock from '@/components/CodeBlock';
import { Separator } from '@/components/ui/separator';

const ApiDocumentation: React.FC = () => {
  const [activeTab, setActiveTab] = useState('getting-started');

  return (
    <div className="space-y-8">
      <Tabs defaultValue="getting-started" onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-8">
          <TabsTrigger value="getting-started">Getting Started</TabsTrigger>
          <TabsTrigger value="api-reference">API Reference</TabsTrigger>
          <TabsTrigger value="sdk">SDK</TabsTrigger>
          <TabsTrigger value="examples">Examples</TabsTrigger>
        </TabsList>
        
        <TabsContent value="getting-started" className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Introduction</CardTitle>
              <CardDescription>
                Learn how to integrate SecureAddress Bridge into your application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                SecureAddress Bridge provides a secure, privacy-preserving way to access verified physical addresses
                of your users while keeping their wallet addresses private. This guide will help you integrate
                our API into your application.
              </p>
              
              <h3 className="text-lg font-semibold mt-6">Authentication Flow</h3>
              <p>The SecureAddress Bridge API uses an OAuth-like flow for authentication:</p>
              <ol className="list-decimal list-inside space-y-2 ml-4">
                <li>User connects to your application</li>
                <li>Your app redirects to SecureAddress Bridge permission page</li>
                <li>User grants permission to share their address information</li>
                <li>User is redirected back to your app with an access token</li>
                <li>Your app uses the token to access the user's address information</li>
              </ol>
              
              <h3 className="text-lg font-semibold mt-6">Rate Limits</h3>
              <p>
                The API has the following rate limits:
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>100 requests per minute per IP address</li>
                  <li>1,000 requests per day per access token</li>
                </ul>
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Quick Start</CardTitle>
              <CardDescription>
                Get up and running in minutes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <h3 className="text-lg font-semibold">1. Register your application</h3>
              <p>
                First, register your application in the developer portal to receive your App ID.
              </p>
              
              <h3 className="text-lg font-semibold mt-4">2. Implement the authorization flow</h3>
              <p>
                Redirect users to our authorization page:
              </p>
              <CodeBlock 
                language="javascript"
                code={`const appId = 'YOUR_APP_ID';
const redirectUri = 'https://your-app.com/callback';
const scope = 'address.city address.country'; // Requested fields

// Redirect user to SecureAddress Bridge permission page
window.location.href = \`https://secureaddress.bridge/authorize?app_id=\${appId}&redirect_uri=\${redirectUri}&scope=\${scope}\`;`}
              />
              
              <h3 className="text-lg font-semibold mt-4">3. Handle the callback</h3>
              <p>
                When the user grants permission, they'll be redirected to your redirect URI with an access token:
              </p>
              <CodeBlock 
                language="javascript"
                code={`// In your callback route
const accessToken = new URLSearchParams(window.location.search).get('access_token');

// Store this token securely for future API calls`}
              />
              
              <h3 className="text-lg font-semibold mt-4">4. Access user address data</h3>
              <p>
                Use the access token to fetch the user's address:
              </p>
              <CodeBlock 
                language="javascript"
                code={`async function getUserAddress(accessToken) {
  const response = await fetch('https://api.secureaddress.bridge/v1/address', {
    headers: {
      'Authorization': \`Bearer \${accessToken}\`
    }
  });
  
  const data = await response.json();
  return data.address;
}`}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="api-reference" className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>API Endpoints</CardTitle>
              <CardDescription>
                Reference documentation for all available API endpoints
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-2">GET /v1/address</h3>
                <p className="text-muted-foreground mb-4">Retrieve the user's address information</p>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium">Headers</h4>
                    <CodeBlock 
                      language="json"
                      code={`{
  "Authorization": "Bearer YOUR_ACCESS_TOKEN"
}`}
                    />
                  </div>
                  
                  <div>
                    <h4 className="font-medium">Query Parameters</h4>
                    <table className="min-w-full divide-y divide-border">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Parameter</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Type</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Description</th>
                        </tr>
                      </thead>
                      <tbody className="bg-card divide-y divide-border">
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">fields</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">string</td>
                          <td className="px-6 py-4 text-sm">Comma-separated list of fields to return (optional)</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  
                  <div>
                    <h4 className="font-medium">Response</h4>
                    <CodeBlock 
                      language="json"
                      code={`{
  "app_id": "app_12345",
  "app_name": "Example App",
  "address": {
    "street_address": "123 Main St",
    "city": "San Francisco",
    "state": "CA",
    "postal_code": "94105",
    "country": "USA"
  },
  "access_count": 1,
  "max_access_count": 10,
  "access_expiry": "2023-12-31T23:59:59Z"
}`}
                    />
                  </div>
                  
                  <div>
                    <h4 className="font-medium">Error Responses</h4>
                    <table className="min-w-full divide-y divide-border">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status Code</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Description</th>
                        </tr>
                      </thead>
                      <tbody className="bg-card divide-y divide-border">
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">401</td>
                          <td className="px-6 py-4 text-sm">Invalid or expired access token</td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">403</td>
                          <td className="px-6 py-4 text-sm">Permission has been revoked or maximum access count reached</td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">404</td>
                          <td className="px-6 py-4 text-sm">No address found for this user</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-xl font-semibold mb-2">POST /v1/authorize</h3>
                <p className="text-muted-foreground mb-4">Server-to-server authorization for trusted applications</p>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium">Request Body</h4>
                    <CodeBlock 
                      language="json"
                      code={`{
  "app_id": "YOUR_APP_ID",
  "app_secret": "YOUR_APP_SECRET",
  "user_id": "user123",
  "scope": "address.street address.city address.state address.postal_code address.country",
  "expiry_days": 30,
  "max_access_count": 10
}`}
                    />
                  </div>
                  
                  <div>
                    <h4 className="font-medium">Response</h4>
                    <CodeBlock 
                      language="json"
                      code={`{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_at": "2023-12-31T23:59:59Z",
  "max_access_count": 10
}`}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Webhooks</CardTitle>
              <CardDescription>
                Receive notifications about permission changes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                SecureAddress Bridge can send webhook notifications when a user's permissions change.
                Configure your webhook endpoint in the developer portal.
              </p>
              
              <h3 className="text-lg font-semibold">Events</h3>
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Event Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Description</th>
                  </tr>
                </thead>
                <tbody className="bg-card divide-y divide-border">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">permission.granted</td>
                    <td className="px-6 py-4 text-sm">User granted permission to access their address</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">permission.revoked</td>
                    <td className="px-6 py-4 text-sm">User revoked permission to access their address</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">permission.expired</td>
                    <td className="px-6 py-4 text-sm">Permission expired due to time limit</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">address.updated</td>
                    <td className="px-6 py-4 text-sm">User updated their address information</td>
                  </tr>
                </tbody>
              </table>
              
              <h3 className="text-lg font-semibold mt-4">Webhook Payload Example</h3>
              <CodeBlock 
                language="json"
                code={`{
  "event": "permission.revoked",
  "timestamp": "2023-11-15T14:32:21Z",
  "data": {
    "app_id": "app_12345",
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "revocation_reason": "User manually revoked access"
  }
}`}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="sdk" className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>JavaScript SDK</CardTitle>
              <CardDescription>
                Easy integration with our official JavaScript SDK
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <h3 className="text-lg font-semibold">Installation</h3>
              <CodeBlock 
                language="bash"
                code={`npm install secureaddress-bridge-sdk
# or
yarn add secureaddress-bridge-sdk`}
              />
              
              <h3 className="text-lg font-semibold mt-6">Basic Usage</h3>
              <CodeBlock 
                language="javascript"
                code={`import { SecureAddressBridge } from 'secureaddress-bridge-sdk';

// Initialize the SDK
const bridge = new SecureAddressBridge({
  appId: 'YOUR_APP_ID',
  redirectUri: 'https://your-app.com/callback'
});

// Redirect user to authorization page
function requestAddressAccess() {
  bridge.authorize({
    scope: ['address.city', 'address.country'],
    expiryDays: 30,
    maxAccesses: 10
  });
}

// Handle the callback
async function handleCallback() {
  const result = await bridge.handleCallback();
  
  if (result.success) {
    // Store the token for future use
    localStorage.setItem('address_token', result.accessToken);
    
    // Get the user's address
    const address = await bridge.getAddress();
    console.log('User address:', address);
  }
}

// Later, use the stored token
async function loadAddress() {
  const token = localStorage.getItem('address_token');
  
  if (token) {
    bridge.setAccessToken(token);
    try {
      const address = await bridge.getAddress();
      return address;
    } catch (error) {
      // Token might be expired or revoked
      console.error('Error loading address:', error);
      return null;
    }
  }
}`}
              />
              
              <h3 className="text-lg font-semibold mt-6">React Integration</h3>
              <CodeBlock 
                language="javascript"
                code={`import { useSecureAddress } from 'secureaddress-bridge-sdk/react';

function AddressDisplay() {
  const { 
    address,
    isLoading, 
    error, 
    requestAccess, 
    hasValidPermission 
  } = useSecureAddress({
    appId: 'YOUR_APP_ID',
    scope: ['address.city', 'address.country']
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
      <h2>Your Address:</h2>
      <p>{address.city}, {address.country}</p>
    </div>
  );
}`}
              />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Other SDKs</CardTitle>
              <CardDescription>
                Integration libraries for other platforms
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-2">Python SDK</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Perfect for backend integrations and server-side applications
                  </p>
                  <CodeBlock 
                    language="python"
                    code={`pip install secureaddress-bridge-python`}
                  />
                  <a href="#" className="text-primary hover:underline text-sm block mt-4">
                    View Python SDK Documentation →
                  </a>
                </div>
                
                <div className="border rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-2">Solidity Integration</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    For blockchain projects and smart contracts
                  </p>
                  <CodeBlock 
                    language="solidity"
                    code={`npm install @secureaddress/bridge-solidity`}
                  />
                  <a href="#" className="text-primary hover:underline text-sm block mt-4">
                    View Solidity Integration Guide →
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="examples" className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Integration Examples</CardTitle>
              <CardDescription>
                Sample code for common use cases
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">E-commerce Shipping Integration</h3>
                <p className="mb-4">
                  This example shows how to integrate SecureAddress Bridge with an e-commerce checkout flow
                  to securely retrieve a customer's shipping address.
                </p>
                <CodeBlock 
                  language="javascript"
                  code={`// In your checkout component
import { SecureAddressBridge } from 'secureaddress-bridge-sdk';

function Checkout() {
  const [shippingAddress, setShippingAddress] = useState(null);
  const [isAddressLoading, setIsAddressLoading] = useState(false);
  
  const bridge = new SecureAddressBridge({
    appId: 'YOUR_APP_ID',
    redirectUri: window.location.origin + '/checkout'
  });
  
  // Check for callback when the component mounts
  useEffect(() => {
    const handleCallbackIfPresent = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const hasCallback = urlParams.has('access_token');
      
      if (hasCallback) {
        try {
          const result = await bridge.handleCallback();
          if (result.success) {
            const address = await bridge.getAddress();
            setShippingAddress(address);
            // Clear the URL parameters
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        } catch (error) {
          console.error('Error handling callback:', error);
        }
      }
    };
    
    handleCallbackIfPresent();
  }, []);
  
  // Load address if we have a stored token
  useEffect(() => {
    const loadStoredAddress = async () => {
      const token = localStorage.getItem('address_token');
      if (token) {
        setIsAddressLoading(true);
        try {
          bridge.setAccessToken(token);
          const address = await bridge.getAddress();
          setShippingAddress(address);
        } catch (error) {
          // Token might be expired or revoked
          console.error('Error loading stored address:', error);
          localStorage.removeItem('address_token');
        } finally {
          setIsAddressLoading(false);
        }
      }
    };
    
    loadStoredAddress();
  }, []);
  
  const handleAddressRequest = () => {
    // Request all address fields
    bridge.authorize({
      scope: ['address.street_address', 'address.city', 'address.state', 
              'address.postal_code', 'address.country'],
      expiryDays: 30
    });
  };
  
  return (
    <div className="checkout-form">
      <h2>Shipping Information</h2>
      
      {isAddressLoading ? (
        <div>Loading your address...</div>
      ) : shippingAddress ? (
        <div className="address-preview">
          <p>{shippingAddress.street_address}</p>
          <p>{shippingAddress.city}, {shippingAddress.state} {shippingAddress.postal_code}</p>
          <p>{shippingAddress.country}</p>
          <button onClick={handleAddressRequest}>Use a different address</button>
        </div>
      ) : (
        <button onClick={handleAddressRequest}>
          Get address from SecureAddress Bridge
        </button>
      )}
      
      {/* Rest of your checkout form */}
    </div>
  );
}`}
                />
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-lg font-semibold mb-4">NFT Project - Proof of Residence</h3>
                <p className="mb-4">
                  This example demonstrates how an NFT project can verify a user's residence
                  country for regulatory compliance without storing sensitive address data.
                </p>
                <CodeBlock 
                  language="javascript"
                  code={`// NFT Minting component that checks country eligibility
import { ethers } from 'ethers';
import { SecureAddressBridge } from 'secureaddress-bridge-sdk';

function NFTMintPage() {
  const [wallet, setWallet] = useState(null);
  const [country, setCountry] = useState(null);
  const [isEligible, setIsEligible] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  
  const eligibleCountries = ['USA', 'Canada', 'Japan', 'Germany', 'UK', 'France', 'Australia'];
  
  const bridge = new SecureAddressBridge({
    appId: 'YOUR_APP_ID',
    redirectUri: window.location.origin + '/mint'
  });
  
  // Connect wallet
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        const address = await signer.getAddress();
        setWallet(address);
      } catch (error) {
        console.error('Error connecting wallet:', error);
      }
    } else {
      alert('Please install MetaMask to mint NFTs');
    }
  };
  
  // Check for callback when the component mounts
  useEffect(() => {
    const checkCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.has('access_token')) {
        setIsVerifying(true);
        try {
          const result = await bridge.handleCallback();
          if (result.success) {
            // Only request country information
            const address = await bridge.getAddress({ fields: ['country'] });
            setCountry(address.country);
            setIsEligible(eligibleCountries.includes(address.country));
            
            // Clear URL parameters
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        } catch (error) {
          console.error('Error handling callback:', error);
        } finally {
          setIsVerifying(false);
        }
      }
    };
    
    checkCallback();
  }, []);
  
  const verifyResidence = () => {
    // Only request country field to minimize data sharing
    bridge.authorize({
      scope: ['address.country'],
      expiryDays: 1, // Short duration for verification purposes
      maxAccesses: 1  // One-time access for verification
    });
  };
  
  const mintNFT = async () => {
    // NFT minting logic here
    alert('NFT minting functionality would go here');
  };
  
  return (
    <div className="mint-container">
      <h1>Mint Your NFT</h1>
      
      {!wallet ? (
        <button onClick={connectWallet}>Connect Wallet</button>
      ) : !country ? (
        <div>
          <p>Due to regulations, we need to verify your country of residence.</p>
          <p>We use SecureAddress Bridge to verify your country without storing your full address.</p>
          <button 
            onClick={verifyResidence} 
            disabled={isVerifying}
          >
            {isVerifying ? 'Verifying...' : 'Verify Country of Residence'}
          </button>
        </div>
      ) : isEligible ? (
        <div>
          <p className="success">✓ Verified: You are eligible to mint from {country}</p>
          <button onClick={mintNFT}>Mint NFT</button>
        </div>
      ) : (
        <div>
          <p className="error">
            Sorry, users from {country} are not eligible to participate in this mint.
          </p>
          <p>Eligible countries: {eligibleCountries.join(', ')}</p>
        </div>
      )}
    </div>
  );
}`}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ApiDocumentation;

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CodeBlock from '@/components/CodeBlock';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { InfoIcon, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ApiDocumentation: React.FC = () => {
  const [activeTab, setActiveTab] = useState('api-reference');

  // Authentication code example
  const authCodeExample = `// Using our JavaScript SDK
import { SecureAddressBridge } from 'secureaddress-bridge-sdk';

// Initialize with your app credentials
const client = new SecureAddressBridge({
  appId: 'YOUR_APP_ID',
  redirectUri: 'https://your-app.com/callback',
  apiVersion: 'v1', // Optional - defaults to latest version
  debug: true, // Optional - enables detailed logging
});

// Generate authorization URL with CSRF protection
const state = generateRandomString(); // Create a random string
localStorage.setItem('secureaddress_state', state); // Store for validation

// Redirect user to the authorization page
await client.authorize({
  scope: ['street', 'city', 'state', 'postal_code', 'country'],
  expiryDays: 30,
  state: state, // CSRF protection
  maxAccessCount: 10, // Optional - limit number of accesses
  accessNotification: true // Optional - notify user on access
});`;

  // Request address code example
  const requestAddressExample = `// Handle the callback from authorization
const handleCallback = async () => {
  try {
    const result = await client.handleCallback();
    
    if (result.success) {
      // Authorization successful, now get the address
      const { address, verification, permission } = await client.getAddress({
        includeVerification: true
      });
      
      console.log('Address:', address);
      console.log('Verification:', verification);
      console.log('Permission details:', permission);
      
      // Address will look like:
      // {
      //   streetAddress: '123 Main St',
      //   city: 'San Francisco',
      //   state: 'CA',
      //   postalCode: '94105',
      //   country: 'US',
      //   verified: true,
      //   verificationLevel: 'advanced',
      //   verificationMethod: 'document',
      //   verificationDate: '2023-07-15T10:30:00Z'
      // }
    } else {
      console.error('Authorization failed:', result.errorDescription);
    }
  } catch (error) {
    console.error('Error handling callback:', error);
  }
};`;

  // Standard API response example
  const standardResponseExample = `// All API responses follow this standard structure
{
  "success": true,  // Boolean indicating success or failure
  "data": {         // Present only on success
    // Response data varies by endpoint
  },
  "error": {        // Present only on failure
    "code": "error_code",
    "message": "Human-readable error message",
    "details": {
      // Additional error details (optional)
    }
  },
  "meta": {         // Metadata for all responses
    "version": "v1",
    "timestamp": "2023-08-01T12:34:56Z",
    "requestId": "req_1234567890abcdef"  // For tracking and debugging
  }
}`;

  // Versioning example
  const versioningExample = `// Specify API version in the SDK
const client = new SecureAddressBridge({
  appId: 'YOUR_APP_ID',
  redirectUri: 'YOUR_REDIRECT_URI',
  apiVersion: 'v1'  // Explicitly request v1 API
});

// Or specify in direct API calls
fetch('https://api.secureaddress-bridge.com/v1/validate-token', {
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'Content-Type': 'application/json',
    'X-App-ID': 'YOUR_APP_ID'
  }
});`;

  // Verification status endpoint example
  const verificationStatusExample = `// Get verification status using the SDK
const status = await client.getVerificationStatus({
  userId: 'user-123'
  // OR addressId: 'address-456'
  // OR walletAddress: '0x123...', chainId: 1
});

console.log(status);
// {
//   status: 'verified',
//   method: 'document',
//   date: '2023-07-15T10:30:00Z',
//   postalVerified: true,
//   location: {
//     country: 'US',
//     state: 'CA',
//     city: 'San Francisco',
//     postalCode: '94105'
//   },
//   wallets: [
//     { address: '0x123...', chainId: 1, isPrimary: true }
//   ],
//   zkpVerifications: [...]
// }`;

  // Error codes example
  const errorCodesExample = `// Example error response for an expired token
{
  "success": false,
  "error": {
    "code": "token_expired",
    "message": "Token has expired",
    "details": {
      "expiredAt": "2023-07-01T00:00:00Z"
    }
  },
  "meta": {
    "version": "v1",
    "timestamp": "2023-08-01T12:34:56Z",
    "requestId": "req_1234567890abcdef"
  }
}

// Common error codes:
// - invalid_request: Missing or invalid parameters
// - unauthorized: Invalid or missing credentials
// - forbidden: Valid credentials but insufficient permissions
// - not_found: Requested resource not found
// - token_expired: Access token has expired
// - permission_revoked: Access has been revoked
// - max_access_exceeded: Maximum access count reached
// - rate_limit_exceeded: Too many requests
// - internal_server_error: Server-side error`;

  // Rate limiting example
  const rateLimitExample = `// Rate limit headers in API responses
X-RateLimit-Limit: 120
X-RateLimit-Remaining: 119
X-RateLimit-Reset: 58

// Rate limit exceeded response
{
  "success": false,
  "error": {
    "code": "rate_limit_exceeded",
    "message": "Rate limit exceeded. Please try again later.",
    "details": {
      "limit": 120,
      "remaining": 0,
      "resetAt": "2023-08-01T12:35:00Z"
    }
  },
  "meta": {
    "version": "v1",
    "timestamp": "2023-08-01T12:34:02Z",
    "requestId": "req_1234567890abcdef"
  }
}`;

  return (
    <div className="space-y-8">
      <Alert variant="warning" className="mb-8">
        <InfoIcon className="h-4 w-4" />
        <AlertTitle>API Implementation Updates</AlertTitle>
        <AlertDescription>
          Our API is now implemented using Supabase Edge Functions for enhanced performance and reliability.
          Updated endpoints and comprehensive testing tools are now available.
        </AlertDescription>
      </Alert>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-6 mb-8">
          <TabsTrigger value="api-reference">API Reference</TabsTrigger>
          <TabsTrigger value="responses">Responses</TabsTrigger>
          <TabsTrigger value="errors">Errors</TabsTrigger>
          <TabsTrigger value="versioning">Versioning</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="examples">Examples</TabsTrigger>
        </TabsList>
        
        <TabsContent value="api-reference" className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                RESTful API Endpoints
                <Badge variant="secondary" className="ml-2">v1</Badge>
              </CardTitle>
              <CardDescription>
                SecureAddress Bridge provides a RESTful API for accessing user address data with consent.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <h3 className="text-lg font-medium">Base URL</h3>
                <CodeBlock
                  code="https://akfieehzgpcapuhdujvf.supabase.co/functions/v1"
                  language="bash"
                  showLineNumbers={false}
                />
                
                <h3 className="text-lg font-medium mt-6">Authentication</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  All API requests must include your app's access token in the Authorization header.
                </p>
                <CodeBlock
                  code="Authorization: Bearer YOUR_ACCESS_TOKEN
X-App-ID: YOUR_APP_ID
X-SDK-Version: 2.3.0 (Optional)"
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
                      <TableCell className="font-mono">/authorize</TableCell>
                      <TableCell>GET</TableCell>
                      <TableCell>Start the authorization flow for address access</TableCell>
                    </TableRow>
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
                      <TableCell className="font-mono">/validation-status</TableCell>
                      <TableCell>GET</TableCell>
                      <TableCell>Get address verification status</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-mono">/validate-token</TableCell>
                      <TableCell>GET</TableCell>
                      <TableCell>Validate an access token</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-mono">/zkp/authorize</TableCell>
                      <TableCell>GET</TableCell>
                      <TableCell>Start the authorization flow for ZK proofs</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-mono">/zkp/token</TableCell>
                      <TableCell>POST</TableCell>
                      <TableCell>Exchange proof code for proof token</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-mono">/zkp/proof/{'{id}'}</TableCell>
                      <TableCell>GET</TableCell>
                      <TableCell>Get a specific ZK proof</TableCell>
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
                  The API is rate-limited to 120 requests per minute per app. Enterprise customers
                  can request higher limits. If you exceed this limit, you'll receive a 429 Too Many
                  Requests response and the corresponding rate limit exceeded error.
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
                  code={`GET /v1/address?fields=street,city,state,postal_code&include_verification=true HTTP/1.1
Host: api.secureaddress-bridge.com
Authorization: Bearer USER_ACCESS_TOKEN
X-App-ID: YOUR_APP_ID
X-SDK-Version: 2.3.0`}
                  language="http"
                  showLineNumbers={true}
                />
                
                <h3 className="text-lg font-medium mt-4">Response</h3>
                <CodeBlock
                  code={`HTTP/1.1 200 OK
Content-Type: application/json
X-RateLimit-Limit: 120
X-RateLimit-Remaining: 119
X-RateLimit-Reset: 59
X-Request-Id: req_1234567890abcdef

{
  "success": true,
  "data": {
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
      "max_access_count": 10,
      "access_expiry": "2023-08-15T00:00:00Z"
    }
  },
  "meta": {
    "version": "v1",
    "timestamp": "2023-08-01T12:34:56Z",
    "requestId": "req_1234567890abcdef"
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
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>GET /verification-status</CardTitle>
              <CardDescription>
                New endpoint to check address verification status for a user, address, or wallet.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Request</h3>
                <CodeBlock
                  code={`GET /v1/verification-status?user_id=user-123 HTTP/1.1
Host: api.secureaddress-bridge.com
Authorization: Bearer YOUR_ACCESS_TOKEN
X-App-ID: YOUR_APP_ID
X-SDK-Version: 2.3.0`}
                  language="http"
                  showLineNumbers={true}
                />
                
                <h3 className="text-lg font-medium mt-4">Alternative Parameters</h3>
                <CodeBlock
                  code={`// By address ID
GET /v1/verification-status?address_id=address-456

// By wallet address
GET /v1/verification-status?wallet_address=0x1234...&chain_id=1`}
                  language="http"
                  showLineNumbers={false}
                />
                
                <h3 className="text-lg font-medium mt-4">Response</h3>
                <CodeBlock
                  code={`HTTP/1.1 200 OK
Content-Type: application/json
X-Request-Id: req_1234567890abcdef

{
  "success": true,
  "data": {
    "id": "addr_12345",
    "user_id": "user-123",
    "verification": {
      "status": "verified",
      "method": "document_upload",
      "date": "2023-07-15T10:30:00Z",
      "postal_verified": true,
      "postal_verification_date": "2023-07-16T14:25:10Z"
    },
    "location": {
      "country": "US",
      "state": "CA",
      "city": "San Francisco",
      "postal_code": "94105"
    },
    "timestamps": {
      "created_at": "2023-07-10T09:15:00Z",
      "updated_at": "2023-07-15T10:30:00Z"
    },
    "linked_wallets": [
      {
        "address": "0x1234...",
        "chain_id": 1,
        "is_primary": true
      }
    ],
    "zkp_verifications": [
      {
        "id": "zkp_12345",
        "verification_type": "country_proof",
        "verifier_app_id": "app_123456",
        "verified_at": "2023-07-20T11:45:00Z",
        "is_valid": true
      }
    ]
  },
  "meta": {
    "version": "v1",
    "timestamp": "2023-08-01T12:34:56Z",
    "requestId": "req_1234567890abcdef"
  }
}`}
                  language="json"
                  showLineNumbers={true}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="responses" className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Standardized API Responses</CardTitle>
              <CardDescription>
                All API endpoints now return responses in a standardized format for consistency.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <h3 className="text-lg font-medium">Response Structure</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  All API responses follow the same structure, with clear separation between success and error cases.
                </p>
                <CodeBlock
                  code={standardResponseExample}
                  language="json"
                  showLineNumbers={true}
                />
                
                <h3 className="text-lg font-medium mt-6">Success Response</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Success responses have a `success: true` field and include the requested data in the `data` field.
                </p>
                
                <h3 className="text-lg font-medium mt-6">Error Response</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Error responses have a `success: false` field and include error details in the `error` field.
                </p>
                
                <h3 className="text-lg font-medium mt-6">Metadata</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  All responses include metadata with the API version, timestamp, and a unique request ID for tracking.
                </p>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Metadata Field</TableHead>
                      <TableHead>Description</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>version</TableCell>
                      <TableCell>API version (e.g., "v1")</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>timestamp</TableCell>
                      <TableCell>Request time in ISO 8601 format</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>requestId</TableCell>
                      <TableCell>Unique ID for tracking the request</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>HTTP Status Codes</CardTitle>
              <CardDescription>
                Our API uses standard HTTP status codes along with detailed error information.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Status Code</TableHead>
                      <TableHead>Description</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>200 OK</TableCell>
                      <TableCell>Request successful</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>400 Bad Request</TableCell>
                      <TableCell>Invalid parameters or request format</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>401 Unauthorized</TableCell>
                      <TableCell>Missing or invalid authentication credentials</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>403 Forbidden</TableCell>
                      <TableCell>Valid credentials but insufficient permissions</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>404 Not Found</TableCell>
                      <TableCell>Requested resource not found</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>429 Too Many Requests</TableCell>
                      <TableCell>Rate limit exceeded</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>500 Internal Server Error</TableCell>
                      <TableCell>Server-side error</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="errors" className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Error Handling</CardTitle>
              <CardDescription>
                Our API provides detailed error information to help with debugging and issue resolution.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <h3 className="text-lg font-medium">Error Structure</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  All errors follow a consistent structure with error codes, messages, and optional details.
                </p>
                <CodeBlock
                  code={errorCodesExample}
                  language="json"
                  showLineNumbers={true}
                />
                
                <h3 className="text-lg font-medium mt-6">Common Error Codes</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Error Code</TableHead>
                      <TableHead>Description</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>invalid_request</TableCell>
                      <TableCell>Missing or invalid parameters</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>unauthorized</TableCell>
                      <TableCell>Invalid or missing credentials</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>forbidden</TableCell>
                      <TableCell>Valid credentials but insufficient permissions</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>not_found</TableCell>
                      <TableCell>Requested resource not found</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>token_expired</TableCell>
                      <TableCell>Access token has expired</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>permission_revoked</TableCell>
                      <TableCell>Access has been revoked</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>max_access_exceeded</TableCell>
                      <TableCell>Maximum access count reached</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>rate_limit_exceeded</TableCell>
                      <TableCell>Too many requests</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>internal_server_error</TableCell>
                      <TableCell>Server-side error</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Rate Limiting</CardTitle>
              <CardDescription>
                Our API includes rate limiting to ensure stable service for all users.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Rate Limit Headers</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  All API responses include rate limit headers to help you track your usage.
                </p>
                <CodeBlock
                  code={rateLimitExample}
                  language="http"
                  showLineNumbers={true}
                />
                
                <h3 className="text-lg font-medium mt-4">Header Descriptions</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Header</TableHead>
                      <TableHead>Description</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>X-RateLimit-Limit</TableCell>
                      <TableCell>Maximum requests allowed in the current time window</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>X-RateLimit-Remaining</TableCell>
                      <TableCell>Remaining requests in the current time window</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>X-RateLimit-Reset</TableCell>
                      <TableCell>Time in seconds until the rate limit resets</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="versioning" className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>API Versioning</CardTitle>
              <CardDescription>
                Our API uses versioning to ensure compatibility as we evolve our services.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <h3 className="text-lg font-medium">Version Format</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  API versions are specified in the URL path (e.g., <code>/v1/address</code>).
                </p>
                <CodeBlock
                  code={versioningExample}
                  language="javascript"
                  showLineNumbers={true}
                />
                
                <h3 className="text-lg font-medium mt-6">Version Guarantee</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  We guarantee that each API version will be supported for at least 12 months after a new version is released.
                  When a version is deprecated, we will provide at least 6 months of notice before it is discontinued.
                </p>
                
                <h3 className="text-lg font-medium mt-6">Available Versions</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Version</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Released</TableHead>
                      <TableHead>End of Support</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>v1</TableCell>
                      <TableCell>
                        <Badge variant="secondary">Current</Badge>
                      </TableCell>
                      <TableCell>August 2023</TableCell>
                      <TableCell>TBD</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="security" className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Security Features</CardTitle>
              <CardDescription>
                Our API includes several security features to protect your data and prevent abuse.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <h3 className="text-lg font-medium">HTTPS Encryption</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  All API requests must use HTTPS to ensure data is encrypted in transit.
                </p>
                
                <h3 className="text-lg font-medium mt-6">CSRF Protection</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Our authorization flow includes state parameters to prevent cross-site request forgery attacks.
                </p>
                <CodeBlock
                  code={`// Generate a random state parameter
const state = Math.random().toString(36).substring(2, 15);
localStorage.setItem('secureaddress_state', state);

// Include in authorization request
await client.authorize({
  // Other parameters...
  state: state
});

// Validate state in callback
const urlParams = new URLSearchParams(window.location.search);
const state = urlParams.get('state');
const storedState = localStorage.getItem('secureaddress_state');

if (state !== storedState) {
  // Invalid state, potential CSRF attack
  throw new Error('Invalid state parameter');
}`}
                  language="javascript"
                  showLineNumbers={true}
                />
                
                <h3 className="text-lg font-medium mt-6">Request Tracking</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Each API request gets a unique request ID for tracking and auditing.
                </p>
                <CodeBlock
                  code={`// Request ID in response header
X-Request-Id: req_1234567890abcdef

// Request ID in response body
{
  "meta": {
    "requestId": "req_1234567890abcdef",
    // Other metadata...
  }
}`}
                  language="http"
                  showLineNumbers={true}
                />
                
                <h3 className="text-lg font-medium mt-6">Access Token Rotation</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  When you refresh an access token, both the access token and refresh token are rotated for security.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="examples" className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Example: Authorization Flow</CardTitle>
              <CardDescription>
                Example of implementing the OAuth authorization flow.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Step 1: Redirect to Authorization</h3>
                <CodeBlock
                  code={authCodeExample}
                  language="javascript"
                  showLineNumbers={true}
                />
                
                <h3 className="text-lg font-medium mt-4">Step 2: Handle Callback & Get Address</h3>
                <CodeBlock
                  code={requestAddressExample}
                  language="javascript"
                  showLineNumbers={true}
                />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Example: Verification Status</CardTitle>
              <CardDescription>
                Example of checking address verification status.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CodeBlock
                code={verificationStatusExample}
                language="javascript"
                showLineNumbers={true}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>API Testing Tools</CardTitle>
          <CardDescription>
            Use our built-in testing tools to verify your integration with the SecureAddress Bridge API.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            Our new API testing tools allow you to easily test your integration with various endpoints, 
            view responses, and troubleshoot issues.
          </p>
          <div className="flex justify-center">
            <Button
              component="a"
              href="/api-testing"
              className="flex items-center gap-2"
            >
              <Play className="h-4 w-4" />
              Go to API Testing
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApiDocumentation;

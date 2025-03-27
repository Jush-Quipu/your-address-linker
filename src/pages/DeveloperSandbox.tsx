
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { HomeIcon, Beaker, Code, Send, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { useRole } from '@/context/RoleContext';

const DeveloperSandbox: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const { isDeveloper } = useRole();
  const [activeTab, setActiveTab] = useState('api');
  const [apiEndpoint, setApiEndpoint] = useState('/api/v1/address');
  const [apiMethod, setApiMethod] = useState('GET');
  const [apiHeaders, setApiHeaders] = useState('{\n  "Authorization": "Bearer YOUR_TOKEN_HERE"\n}');
  const [apiBody, setApiBody] = useState('');
  const [apiResponse, setApiResponse] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [oauthClientId, setOauthClientId] = useState('');
  const [oauthRedirectUri, setOauthRedirectUri] = useState('');
  const [oauthScopes, setOauthScopes] = useState('read:profile read:address');
  const [oauthState, setOauthState] = useState('');

  // Redirect if not authenticated or not developer
  if (!isLoading && (!isAuthenticated || !isDeveloper)) {
    return <Navigate to="/auth" />;
  }

  // Test API endpoint
  const handleTestApi = async () => {
    setLoading(true);
    try {
      setApiResponse('Loading...');
      
      // In a real implementation, this would make an actual API request
      // For now, we'll just simulate a response after a delay
      setTimeout(() => {
        setApiResponse(JSON.stringify({
          success: true,
          data: {
            message: "This is a simulated API response",
            endpoint: apiEndpoint,
            method: apiMethod,
            timestamp: new Date().toISOString()
          }
        }, null, 2));
        setLoading(false);
      }, 1000);
      
      toast.success('API request sent successfully');
    } catch (error) {
      console.error('Error testing API:', error);
      setApiResponse(JSON.stringify({
        error: 'Failed to send API request',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, null, 2));
      toast.error('Failed to send API request');
      setLoading(false);
    }
  };

  // Generate OAuth URL
  const handleGenerateOAuthUrl = () => {
    if (!oauthClientId) {
      toast.error('Client ID is required');
      return;
    }
    
    if (!oauthRedirectUri) {
      toast.error('Redirect URI is required');
      return;
    }
    
    // Generate random state if not provided
    const state = oauthState || Math.random().toString(36).substring(2, 15);
    setOauthState(state);
    
    // Build OAuth URL
    const url = new URL('https://secureaddress-bridge.com/api/oauth/authorize');
    url.searchParams.append('client_id', oauthClientId);
    url.searchParams.append('redirect_uri', oauthRedirectUri);
    url.searchParams.append('response_type', 'code');
    url.searchParams.append('scope', oauthScopes);
    url.searchParams.append('state', state);
    
    // Display the URL
    setApiResponse(url.toString());
    toast.success('OAuth URL generated successfully');
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-32 pb-20 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <Breadcrumb className="mb-6">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">
                  <HomeIcon className="h-4 w-4 mr-1" />
                  Home
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/developer">Developer</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/developer/sandbox">
                  <Beaker className="h-4 w-4 mr-1" />
                  Sandbox
                </BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="mb-8 space-y-4">
            <h1 className="text-2xl font-bold flex items-center">
              <Beaker className="mr-2 h-6 w-6 text-primary" />
              Developer Sandbox
            </h1>
            <p className="text-muted-foreground">
              Test your integration with our API in a safe environment
            </p>
          </div>

          <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="api">API Tester</TabsTrigger>
              <TabsTrigger value="oauth">OAuth Playground</TabsTrigger>
              <TabsTrigger value="sdk">SDK Sandbox</TabsTrigger>
            </TabsList>
            
            <TabsContent value="api">
              <div className="grid gap-6 lg:grid-cols-2">
                <Card className="lg:row-span-2">
                  <CardHeader>
                    <CardTitle>API Request</CardTitle>
                    <CardDescription>
                      Configure and test API requests
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-4">
                      <div className="w-1/3">
                        <Label htmlFor="apiMethod">Method</Label>
                        <select
                          id="apiMethod"
                          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                          value={apiMethod}
                          onChange={(e) => setApiMethod(e.target.value)}
                        >
                          <option>GET</option>
                          <option>POST</option>
                          <option>PUT</option>
                          <option>DELETE</option>
                          <option>PATCH</option>
                        </select>
                      </div>
                      <div className="w-2/3">
                        <Label htmlFor="apiEndpoint">Endpoint</Label>
                        <Input
                          id="apiEndpoint"
                          placeholder="/api/v1/endpoint"
                          value={apiEndpoint}
                          onChange={(e) => setApiEndpoint(e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="apiHeaders">Headers</Label>
                      <Textarea
                        id="apiHeaders"
                        placeholder="Enter headers in JSON format"
                        value={apiHeaders}
                        onChange={(e) => setApiHeaders(e.target.value)}
                        rows={5}
                        className="font-mono text-sm"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="apiBody">Request Body</Label>
                      <Textarea
                        id="apiBody"
                        placeholder="Enter request body in JSON format"
                        value={apiBody}
                        onChange={(e) => setApiBody(e.target.value)}
                        rows={10}
                        className="font-mono text-sm"
                      />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      onClick={handleTestApi} 
                      disabled={loading}
                      className="w-full"
                    >
                      {loading ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Send Request
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>API Response</CardTitle>
                    <CardDescription>
                      Response from API request
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      readOnly
                      value={apiResponse}
                      rows={20}
                      className="font-mono text-sm"
                      placeholder="Response will appear here"
                    />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="oauth">
              <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>OAuth Authorization</CardTitle>
                    <CardDescription>
                      Generate OAuth authorization URLs
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="oauthClientId">Client ID</Label>
                      <Input
                        id="oauthClientId"
                        placeholder="Your application's client ID"
                        value={oauthClientId}
                        onChange={(e) => setOauthClientId(e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="oauthRedirectUri">Redirect URI</Label>
                      <Input
                        id="oauthRedirectUri"
                        placeholder="https://example.com/callback"
                        value={oauthRedirectUri}
                        onChange={(e) => setOauthRedirectUri(e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="oauthScopes">Scopes</Label>
                      <Input
                        id="oauthScopes"
                        placeholder="read:profile read:address"
                        value={oauthScopes}
                        onChange={(e) => setOauthScopes(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Space-separated list of scopes
                      </p>
                    </div>
                    
                    <div>
                      <Label htmlFor="oauthState">State</Label>
                      <Input
                        id="oauthState"
                        placeholder="Optional: random string for security"
                        value={oauthState}
                        onChange={(e) => setOauthState(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Optional: A random string will be generated if not provided
                      </p>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      onClick={handleGenerateOAuthUrl} 
                      className="w-full"
                    >
                      <Code className="h-4 w-4 mr-2" />
                      Generate Authorization URL
                    </Button>
                  </CardFooter>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Generated URL</CardTitle>
                    <CardDescription>
                      Use this URL to start the OAuth flow
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      readOnly
                      value={apiResponse}
                      rows={5}
                      className="font-mono text-sm"
                      placeholder="Generated URL will appear here"
                    />
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button 
                      variant="outline"
                      onClick={() => {
                        if (apiResponse) {
                          navigator.clipboard.writeText(apiResponse);
                          toast.success('URL copied to clipboard');
                        }
                      }}
                      disabled={!apiResponse}
                    >
                      Copy URL
                    </Button>
                    
                    <Button
                      variant="default"
                      onClick={() => {
                        if (apiResponse) {
                          window.open(apiResponse, '_blank');
                        }
                      }}
                      disabled={!apiResponse}
                    >
                      Test in Browser
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="sdk">
              <Card>
                <CardHeader>
                  <CardTitle>SDK Sandbox</CardTitle>
                  <CardDescription>
                    Test our SDKs with interactive examples
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="bg-muted p-4 rounded-lg">
                      <h3 className="text-lg font-medium mb-2">SDK Playground</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        The SDK playground is an interactive environment where you can test our
                        JavaScript, Python, and other language SDKs without setting up a development
                        environment.
                      </p>
                      <div className="grid gap-4 sm:grid-cols-3">
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-base">JavaScript</CardTitle>
                          </CardHeader>
                          <CardContent className="pb-2">
                            <p className="text-xs text-muted-foreground">
                              Test our JavaScript SDK with Node.js or browser environments
                            </p>
                          </CardContent>
                          <CardFooter>
                            <Button className="w-full" size="sm">
                              Launch JS Sandbox
                            </Button>
                          </CardFooter>
                        </Card>
                        
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-base">Python</CardTitle>
                          </CardHeader>
                          <CardContent className="pb-2">
                            <p className="text-xs text-muted-foreground">
                              Test our Python SDK with interactive examples
                            </p>
                          </CardContent>
                          <CardFooter>
                            <Button className="w-full" size="sm">
                              Launch Python Sandbox
                            </Button>
                          </CardFooter>
                        </Card>
                        
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-base">Mobile</CardTitle>
                          </CardHeader>
                          <CardContent className="pb-2">
                            <p className="text-xs text-muted-foreground">
                              Test our iOS and Android SDK examples
                            </p>
                          </CardContent>
                          <CardFooter>
                            <Button className="w-full" size="sm">
                              Launch Mobile Sandbox
                            </Button>
                          </CardFooter>
                        </Card>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-2">Sample Code</h3>
                      <Tabs defaultValue="js">
                        <TabsList className="mb-4">
                          <TabsTrigger value="js">JavaScript</TabsTrigger>
                          <TabsTrigger value="python">Python</TabsTrigger>
                          <TabsTrigger value="rust">Rust</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="js">
                          <div className="bg-muted rounded-md p-4 font-mono text-sm">
                            <pre>{`// Initialize the SDK
const secureAddress = new SecureAddressSDK({
  clientId: 'YOUR_CLIENT_ID',
  redirectUri: 'YOUR_REDIRECT_URI',
  sandbox: true // Enable sandbox mode
});

// Start OAuth flow
secureAddress.authorize(['read:profile', 'read:address'])
  .then(token => {
    // Get user's address
    return secureAddress.getAddress();
  })
  .then(address => {
    console.log('User address:', address);
  })
  .catch(error => {
    console.error('Error:', error);
  });`}</pre>
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="python">
                          <div className="bg-muted rounded-md p-4 font-mono text-sm">
                            <pre>{`# Initialize the SDK
from secure_address import SecureAddressSDK

client = SecureAddressSDK(
    client_id="YOUR_CLIENT_ID",
    client_secret="YOUR_CLIENT_SECRET",
    sandbox=True  # Enable sandbox mode
)

# Get access token
token = client.get_access_token()

# Get user's address
try:
    address = client.get_address(user_id="USER_ID")
    print(f"User address: {address}")
except Exception as e:
    print(f"Error: {e}")`}</pre>
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="rust">
                          <div className="bg-muted rounded-md p-4 font-mono text-sm">
                            <pre>{`use secure_address::SecureAddressClient;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Initialize the SDK
    let client = SecureAddressClient::builder()
        .client_id("YOUR_CLIENT_ID")
        .client_secret("YOUR_CLIENT_SECRET")
        .sandbox(true) // Enable sandbox mode
        .build()?;
    
    // Get user's address
    let address = client.get_address("USER_ID").await?;
    println!("User address: {:?}", address);
    
    Ok(())
}`}</pre>
                          </div>
                        </TabsContent>
                      </Tabs>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-center">
                  <Button asChild variant="outline">
                    <a href="/developer/docs/sdk" target="_blank" rel="noopener noreferrer">
                      View Full SDK Documentation
                    </a>
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DeveloperSandbox;

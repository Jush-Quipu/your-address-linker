
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowDownToLine, Copy, CheckCircle, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import CodeBlock from '@/components/CodeBlock';

const SdkLibraries: React.FC = () => {
  const [copied, setCopied] = useState<string | null>(null);

  const sdkOptions = [
    {
      id: 'javascript',
      name: 'JavaScript/TypeScript',
      version: 'v2.1.0',
      installCommand: 'npm install @secureaddress/bridge-sdk',
      size: '42KB',
      downloadUrl: 'https://github.com/secureaddress/bridge-sdk/releases/download/v2.1.0/secureaddress-bridge-sdk-v2.1.0.zip',
      docsUrl: 'https://docs.secureaddress.bridge/sdk/js'
    },
    {
      id: 'react-native',
      name: 'React Native',
      version: 'v1.2.0',
      installCommand: 'npm install @secureaddress/bridge-sdk-react-native',
      size: '39KB',
      downloadUrl: 'https://github.com/secureaddress/bridge-sdk/releases/download/v1.2.0/secureaddress-bridge-sdk-react-native-v1.2.0.zip',
      docsUrl: 'https://docs.secureaddress.bridge/sdk/react-native'
    },
    {
      id: 'python',
      name: 'Python',
      version: 'v1.0.0',
      installCommand: 'pip install secureaddress-bridge',
      size: '24KB',
      downloadUrl: 'https://github.com/secureaddress/bridge-sdk/releases/download/v1.0.0/secureaddress-bridge-python-v1.0.0.zip',
      docsUrl: 'https://docs.secureaddress.bridge/sdk/python'
    }
  ];

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(null), 2000);
  };

  const handleDownload = (sdkUrl: string, sdkName: string) => {
    toast.success(`Downloading ${sdkName} SDK`);
    window.open(sdkUrl, '_blank');
  };

  const handleOpenDocs = (docsUrl: string) => {
    window.open(docsUrl, '_blank');
  };

  return (
    <div className="space-y-8">
      <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
        {sdkOptions.map((sdk) => (
          <Card key={sdk.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {sdk.name}
                <span className="text-sm bg-primary/10 text-primary rounded-full px-2 py-1">
                  {sdk.version}
                </span>
              </CardTitle>
              <CardDescription>
                Size: {sdk.size}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted rounded-md p-2 flex items-center justify-between">
                <code className="text-xs sm:text-sm">{sdk.installCommand}</code>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => handleCopy(sdk.installCommand, `sdk-${sdk.id}`)}
                >
                  {copied === `sdk-${sdk.id}` ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button 
                variant="secondary" 
                size="sm" 
                className="flex-1"
                onClick={() => handleDownload(sdk.downloadUrl, sdk.name)}
              >
                <ArrowDownToLine className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={() => handleOpenDocs(sdk.docsUrl)}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Docs
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      <Tabs defaultValue="javascript" className="w-full">
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-8">
          <TabsTrigger value="javascript">JavaScript</TabsTrigger>
          <TabsTrigger value="react-native">React Native</TabsTrigger>
          <TabsTrigger value="python">Python</TabsTrigger>
        </TabsList>
        
        <TabsContent value="javascript" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>JavaScript SDK Quick Start</CardTitle>
              <CardDescription>
                Get started with the JavaScript/TypeScript SDK in just a few minutes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">1. Install the SDK</h3>
                <CodeBlock
                  code="npm install @secureaddress/bridge-sdk"
                  language="bash"
                  showLineNumbers={false}
                />
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">2. Initialize the SDK</h3>
                <CodeBlock
                  code={`import { SecureAddressBridge } from '@secureaddress/bridge-sdk';

// Initialize with your app credentials
const client = new SecureAddressBridge({
  appId: 'YOUR_APP_ID',
  redirectUri: 'https://your-app.com/callback'
});`}
                  language="javascript"
                  showLineNumbers={true}
                />
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">3. Request Address Access</h3>
                <CodeBlock
                  code={`// Generate a random state for CSRF protection
const state = Math.random().toString(36).substring(2, 15);
localStorage.setItem('secureaddress_state', state);

// Redirect user to authorization page
client.authorize({
  scope: ['street', 'city', 'state', 'postal_code', 'country'],
  expiryDays: 30,
  state: state
});`}
                  language="javascript"
                  showLineNumbers={true}
                />
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">4. Handle Callback & Get Address</h3>
                <CodeBlock
                  code={`// In your callback handler
async function handleCallback() {
  // Process the callback and validate state parameter
  const result = await client.handleCallback();
  
  if (result.success) {
    // Get the user's address
    const data = await client.getAddress();
    console.log('User address:', data.address);
    
    // Clear URL parameters
    window.history.replaceState({}, document.title, window.location.pathname);
  } else {
    console.error('Authorization failed:', result.errorDescription);
  }
}`}
                  language="javascript"
                  showLineNumbers={true}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="react-native" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>React Native SDK Quick Start</CardTitle>
              <CardDescription>
                Get started with the React Native SDK in just a few minutes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">1. Install the SDK</h3>
                <CodeBlock
                  code="npm install @secureaddress/bridge-sdk-react-native"
                  language="bash"
                  showLineNumbers={false}
                />
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">2. Initialize the SDK</h3>
                <CodeBlock
                  code={`import { SecureAddressBridgeNative, useSecureAddressNative } from '@secureaddress/bridge-sdk-react-native';

// Initialize with your app credentials
const client = new SecureAddressBridgeNative({
  appId: 'YOUR_APP_ID',
  redirectUri: 'your-app-scheme://callback'
});`}
                  language="javascript"
                  showLineNumbers={true}
                />
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">3. Using the React Native Hook</h3>
                <CodeBlock
                  code={`import React from 'react';
import { View, Text, Button, ActivityIndicator } from 'react-native';
import { useSecureAddressNative } from '@secureaddress/bridge-sdk-react-native';

function AddressScreen() {
  const { 
    address, 
    isLoading, 
    error, 
    requestAccess, 
    hasValidPermission 
  } = useSecureAddressNative({
    appId: 'YOUR_APP_ID',
    redirectUri: 'your-app-scheme://callback'
  });
  
  if (isLoading) return <ActivityIndicator />;
  if (error) return <Text>Error: {error.message}</Text>;
  
  return (
    <View>
      {!hasValidPermission ? (
        <Button 
          title="Get Address" 
          onPress={() => requestAccess()} 
        />
      ) : (
        <View>
          <Text>Address:</Text>
          <Text>{address.street}</Text>
          <Text>{address.city}, {address.state} {address.postal_code}</Text>
          <Text>{address.country}</Text>
        </View>
      )}
    </View>
  );
}`}
                  language="javascript"
                  showLineNumbers={true}
                />
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">4. Add URL Scheme Handler</h3>
                <CodeBlock
                  code={`// In your app's entry file (e.g., App.js)
import { Linking } from 'react-native';

// Handle deep links
Linking.addEventListener('url', ({ url }) => {
  // Your app will receive the URL when opened via the custom scheme
  console.log('Deep link received:', url);
  // Pass to your navigation or SecureAddressBridge SDK
});`}
                  language="javascript"
                  showLineNumbers={true}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="python" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Python SDK Quick Start</CardTitle>
              <CardDescription>
                Get started with the Python SDK in just a few minutes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">1. Install the SDK</h3>
                <CodeBlock
                  code="pip install secureaddress-bridge"
                  language="bash"
                  showLineNumbers={false}
                />
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">2. Authenticate Your App</h3>
                <CodeBlock
                  code={`from secureaddress_bridge import SecureAddressBridge

# Initialize with your app credentials
client = SecureAddressBridge(
    app_id="YOUR_APP_ID",
    app_secret="YOUR_APP_SECRET"
)

# Authenticate your application
auth_result = client.authenticate()
print(f"Successfully authenticated. Token: {auth_result['access_token']}")`}
                  language="python"
                  showLineNumbers={true}
                />
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">3. Generate Authorization URL</h3>
                <CodeBlock
                  code={`# Generate an authorization URL for users
import secrets
state = secrets.token_hex(16)  # Generate a secure random state

auth_url = client.get_authorization_url({
    "redirect_uri": "https://your-app.com/callback",
    "scope": ["street", "city", "state", "postal_code", "country"],
    "expiry_days": 30,
    "state": state
})

print(f"Send user to this URL to authorize: {auth_url}")`}
                  language="python"
                  showLineNumbers={true}
                />
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">4. Exchange Code for Token</h3>
                <CodeBlock
                  code={`# In your callback handler
def callback_handler(request):
    # Extract the code from the request
    code = request.GET.get('code')
    received_state = request.GET.get('state')
    
    # Verify the state parameter to prevent CSRF attacks
    if received_state != state:
        return "Invalid state parameter"
    
    # Exchange the code for an access token
    token_result = client.exchange_code({
        "code": code,
        "redirect_uri": "https://your-app.com/callback"
    })
    
    # Now you can access the user's address
    address_data = client.get_address({
        "include_verification_info": True
    })
    
    return f"User address: {address_data}"`}
                  language="python"
                  showLineNumbers={true}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SdkLibraries;

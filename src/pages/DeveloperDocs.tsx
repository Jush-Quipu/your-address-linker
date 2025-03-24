
import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ApiDocumentation from '@/components/ApiDocumentation';
import { useSearchParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowDownToLine, Copy, CheckCircle, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import CodeBlock from '@/components/CodeBlock';

const DeveloperDocs: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get('tab') || 'api-reference';
  const [copied, setCopied] = useState<string | null>(null);

  const sdkOptions = [
    {
      name: 'JavaScript/TypeScript',
      version: 'v2.0.0',
      installCommand: 'npm install @secureaddress/bridge-sdk',
      size: '42KB',
      downloadUrl: 'https://github.com/secureaddress/bridge-sdk/releases/download/v2.0.0/secureaddress-bridge-sdk-v2.0.0.zip',
      docsUrl: 'https://docs.secureaddress.bridge/sdk/js'
    },
    {
      name: 'React Native',
      version: 'v1.2.0',
      installCommand: 'npm install @secureaddress/bridge-sdk-react-native',
      size: '39KB',
      downloadUrl: 'https://github.com/secureaddress/bridge-sdk/releases/download/v1.2.0/secureaddress-bridge-sdk-react-native-v1.2.0.zip',
      docsUrl: 'https://docs.secureaddress.bridge/sdk/react-native'
    },
    {
      name: 'Python',
      version: 'v1.0.0',
      installCommand: 'pip install secureaddress-bridge',
      size: '24KB',
      downloadUrl: 'https://github.com/secureaddress/bridge-sdk/releases/download/v1.0.0/secureaddress-bridge-python-v1.0.0.zip',
      docsUrl: 'https://docs.secureaddress.bridge/sdk/python'
    }
  ];

  const tutorialOptions = [
    {
      title: 'E-commerce Integration',
      description: 'Learn how to integrate SecureAddress Bridge into your e-commerce checkout flow',
      content: 'This tutorial shows how to streamline your checkout process by securely accessing user shipping addresses without storing sensitive data in your database.',
      url: '/tutorials/ecommerce-integration'
    },
    {
      title: 'Web3 Wallet Linking',
      description: 'Connect verified addresses to blockchain wallets for enhanced trust',
      content: 'Learn how to link verified physical addresses to blockchain wallets and generate verifiable credentials for use in dApps and smart contracts.',
      url: '/tutorials/web3-wallet-linking'
    },
    {
      title: 'Webhook Integration',
      description: 'Receive real-time notifications about address changes and permission updates',
      content: 'Set up secure webhooks to be notified when users update their addresses or modify permissions, allowing your application to stay in sync with user data.',
      url: '/tutorials/webhook-integration'
    },
    {
      title: 'Zero-Knowledge Proofs',
      description: 'Implement advanced privacy features with ZK proofs',
      content: 'Learn how to use zero-knowledge proofs to verify properties about a user\'s address (like country or region) without revealing the complete address information.',
      url: '/tutorials/zk-proofs'
    }
  ];

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(null), 2000);
  };

  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
  };

  const handleDownload = (sdkUrl: string, sdkName: string) => {
    toast.success(`Downloading ${sdkName} SDK`);
    window.open(sdkUrl, '_blank');
  };

  const handleOpenDocs = (docsUrl: string) => {
    window.open(docsUrl, '_blank');
  };

  const handleViewTutorial = (tutorialUrl: string) => {
    // For demonstration purposes, we'll show a toast
    // In a real app, we would navigate to the tutorial page
    toast.info('Tutorial content coming soon!');
    
    // Uncomment this when actual tutorial pages are ready
    // window.open(tutorialUrl, '_blank');
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-32 pb-20 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Developer Documentation</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Integrate SecureAddress Bridge into your applications to securely access user address information
              with enhanced Web3 capabilities.
            </p>
          </div>
          
          <Tabs defaultValue={tab} onValueChange={handleTabChange} className="w-full mb-12">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-8">
              <TabsTrigger value="api-reference">API Reference</TabsTrigger>
              <TabsTrigger value="sdk">SDK Libraries</TabsTrigger>
              <TabsTrigger value="tutorials">Tutorials</TabsTrigger>
            </TabsList>
            
            <TabsContent value="api-reference">
              <ApiDocumentation />
            </TabsContent>
            
            <TabsContent value="sdk" className="space-y-8">
              <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
                {sdkOptions.map((sdk, index) => (
                  <Card key={index}>
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
                          onClick={() => handleCopy(sdk.installCommand, `sdk-${index}`)}
                        >
                          {copied === `sdk-${index}` ? (
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
              
              <Card className="mt-8">
                <CardHeader>
                  <CardTitle>Quick Start Guide</CardTitle>
                  <CardDescription>
                    Get started with the SecureAddress Bridge SDK in just a few minutes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
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
                    
                    <div>
                      <h3 className="text-lg font-medium mb-2">5. Using the React Hook (Optional)</h3>
                      <CodeBlock
                        code={`import { useSecureAddress } from '@secureaddress/bridge-sdk';

function AddressComponent() {
  const { 
    address, 
    isLoading, 
    error, 
    requestAccess, 
    hasValidPermission 
  } = useSecureAddress({
    appId: 'YOUR_APP_ID'
  });
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      {!hasValidPermission ? (
        <button onClick={() => requestAccess()}>
          Get Address
        </button>
      ) : (
        <div>
          <h3>Address:</h3>
          <p>{address.street}</p>
          <p>{address.city}, {address.state} {address.postal_code}</p>
          <p>{address.country}</p>
        </div>
      )}
    </div>
  );
}`}
                        language="javascript"
                        showLineNumbers={true}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="tutorials" className="space-y-8">
              <div className="grid gap-6 sm:grid-cols-2">
                {tutorialOptions.map((tutorial, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle>{tutorial.title}</CardTitle>
                      <CardDescription>
                        {tutorial.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {tutorial.content}
                      </p>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        className="w-full"
                        onClick={() => handleViewTutorial(tutorial.url)}
                      >
                        View Tutorial
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
              
              <Card className="mt-8">
                <CardHeader>
                  <CardTitle>Video Tutorials</CardTitle>
                  <CardDescription>
                    Watch step-by-step guides to integrating SecureAddress Bridge
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
                    <p className="text-muted-foreground">Video tutorials coming soon</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DeveloperDocs;

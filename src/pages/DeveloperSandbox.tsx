
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Badge } from '@/components/ui/badge';
import { HomeIcon, PlayIcon, Code, Copy, Download } from 'lucide-react';
import { toast } from 'sonner';

const DeveloperSandbox: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('javascript');
  const [results, setResults] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  // Sample code templates for different languages
  const codeTemplates = {
    javascript: `// SecureAddress Bridge SDK - JavaScript Example
import { SecureAddressClient } from '@secure-address/js-sdk';

// Initialize the client
const client = new SecureAddressClient({
  apiKey: 'YOUR_API_KEY',
  sandbox: true  // Use sandbox mode
});

// Request address permissions
async function requestAddressPermission() {
  try {
    const result = await client.requestAddressPermission({
      appName: 'My Test App',
      fields: ['city', 'state', 'country'],
      description: 'Testing the SDK in sandbox mode'
    });
    
    console.log('Permission result:', result);
    return result;
  } catch (error) {
    console.error('Error requesting permission:', error);
    throw error;
  }
}

// Execute the function
requestAddressPermission();`,
    
    python: `# SecureAddress Bridge SDK - Python Example
from secure_address import SecureAddressClient

# Initialize the client
client = SecureAddressClient(
    api_key="YOUR_API_KEY",
    sandbox=True  # Use sandbox mode
)

# Request address permissions
def request_address_permission():
    try:
        result = client.request_address_permission(
            app_name="My Test App",
            fields=["city", "state", "country"],
            description="Testing the SDK in sandbox mode"
        )
        
        print("Permission result:", result)
        return result
    except Exception as e:
        print("Error requesting permission:", e)
        raise e

# Execute the function
request_address_permission()`,
    
    curl: `# SecureAddress Bridge SDK - cURL Example

# Request address permissions
curl -X POST "https://api.secureaddress.example/v1/address/permissions" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -d '{
    "app_name": "My Test App",
    "fields": ["city", "state", "country"],
    "description": "Testing the SDK in sandbox mode",
    "sandbox": true
  }'`
  };
  
  // Sample results for demo purposes
  const sampleResults = {
    javascript: `{
  "success": true,
  "data": {
    "permission_id": "perm_sandbox_12345",
    "app_name": "My Test App",
    "fields": ["city", "state", "country"],
    "expires_at": "2024-12-31T23:59:59Z",
    "status": "granted",
    "sandbox": true,
    "address": {
      "city": "San Francisco",
      "state": "CA",
      "country": "USA"
    }
  }
}`,
    python: `{
  "success": true,
  "data": {
    "permission_id": "perm_sandbox_12345",
    "app_name": "My Test App",
    "fields": ["city", "state", "country"],
    "expires_at": "2024-12-31T23:59:59Z",
    "status": "granted",
    "sandbox": true,
    "address": {
      "city": "San Francisco",
      "state": "CA",
      "country": "USA"
    }
  }
}`,
    curl: `{
  "success": true,
  "data": {
    "permission_id": "perm_sandbox_12345",
    "app_name": "My Test App",
    "fields": ["city", "state", "country"],
    "expires_at": "2024-12-31T23:59:59Z",
    "status": "granted",
    "sandbox": true,
    "address": {
      "city": "San Francisco",
      "state": "CA",
      "country": "USA"
    }
  }
}`
  };

  // Redirect to login if not authenticated
  if (!isLoading && !isAuthenticated) {
    return <Navigate to="/auth" />;
  }

  const handleExecute = () => {
    setIsExecuting(true);
    
    // Simulate API call delay
    setTimeout(() => {
      setResults(sampleResults[activeTab as keyof typeof sampleResults]);
      setIsExecuting(false);
      toast.success('Sandbox execution completed');
    }, 1500);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(codeTemplates[activeTab as keyof typeof codeTemplates]);
    toast.success('Code copied to clipboard');
  };

  const handleCopyResults = () => {
    if (results) {
      navigator.clipboard.writeText(results);
      toast.success('Results copied to clipboard');
    }
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
                <BreadcrumbLink href="/developer-dashboard">Developer</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/developer/sandbox">Sandbox</BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold flex items-center">
                SDK Sandbox
                <Badge variant="outline" className="ml-3 bg-amber-100 text-amber-800 hover:bg-amber-100">
                  Sandbox Mode
                </Badge>
              </h1>
              <p className="text-muted-foreground">
                Test SDK functionality without making real API calls
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    <span>Code Editor</span>
                    <Button variant="outline" size="sm" onClick={handleCopyCode}>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                  </CardTitle>
                  <CardDescription>Select a language and test the SDK</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
                      <TabsTrigger
                        value="javascript"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                      >
                        JavaScript
                      </TabsTrigger>
                      <TabsTrigger
                        value="python"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                      >
                        Python
                      </TabsTrigger>
                      <TabsTrigger
                        value="curl"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                      >
                        cURL
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="javascript" className="p-0 pt-4">
                      <Textarea
                        className="font-mono h-[400px] resize-none rounded-none border-0 p-4 focus-visible:ring-0"
                        value={codeTemplates.javascript}
                        readOnly
                      />
                    </TabsContent>
                    
                    <TabsContent value="python" className="p-0 pt-4">
                      <Textarea
                        className="font-mono h-[400px] resize-none rounded-none border-0 p-4 focus-visible:ring-0"
                        value={codeTemplates.python}
                        readOnly
                      />
                    </TabsContent>
                    
                    <TabsContent value="curl" className="p-0 pt-4">
                      <Textarea
                        className="font-mono h-[400px] resize-none rounded-none border-0 p-4 focus-visible:ring-0"
                        value={codeTemplates.curl}
                        readOnly
                      />
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
            
            <div className="space-y-6">
              <Card>
                <CardHeader className="flex-row justify-between items-center pb-2">
                  <div>
                    <CardTitle>Execution Controls</CardTitle>
                    <CardDescription>Test your code in the sandbox environment</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-muted p-4 rounded-md text-sm">
                      <p className="font-medium mb-2">Sandbox Mode</p>
                      <p className="text-muted-foreground">
                        All API calls in sandbox mode use mock data and don't affect real user data or permissions.
                        Perfect for testing your integration without side effects.
                      </p>
                    </div>
                    
                    <Button 
                      className="w-full" 
                      onClick={handleExecute} 
                      disabled={isExecuting}
                    >
                      {isExecuting ? (
                        <>Running...</>
                      ) : (
                        <>
                          <PlayIcon className="h-4 w-4 mr-2" />
                          Run in Sandbox
                        </>
                      )}
                    </Button>
                    
                    <div className="flex justify-between">
                      <Button variant="outline" asChild>
                        <a href="/docs/sdk" className="flex items-center">
                          <Code className="h-4 w-4 mr-2" />
                          SDK Documentation
                        </a>
                      </Button>
                      <Button variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Download SDK
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex-row justify-between items-center pb-2">
                  <div>
                    <CardTitle>Results</CardTitle>
                    <CardDescription>Sandbox execution results</CardDescription>
                  </div>
                  {results && (
                    <Button variant="outline" size="sm" onClick={handleCopyResults}>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                  )}
                </CardHeader>
                <CardContent>
                  {results ? (
                    <Textarea
                      className="font-mono h-[250px] resize-none bg-black text-green-400 p-4"
                      value={results}
                      readOnly
                    />
                  ) : (
                    <div className="bg-black text-green-400 h-[250px] p-4 font-mono rounded-md flex items-center justify-center">
                      <p>Run your code to see results here</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DeveloperSandbox;

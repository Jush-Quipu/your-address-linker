
import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import CodeBlock from '@/components/CodeBlock';
import { Navigate } from 'react-router-dom';

// Import the sandbox controller
import * as sandboxController from '@/services/sandbox/sandboxController';

const SdkSandbox: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('configure');
  const [testId, setTestId] = useState(`sandbox-${Date.now()}`);
  const [testConfig, setTestConfig] = useState(sandboxController.getSandboxConfig());
  const [testResults, setTestResults] = useState<any[]>([]);
  const [sdkInstance, setSdkInstance] = useState<any | null>(null);
  const [token, setToken] = useState<string | null>(null);
  
  // Update the sandbox configuration when testConfig changes
  useEffect(() => {
    sandboxController.updateSandboxConfig(testConfig);
  }, [testConfig]);
  
  // Redirect to login if not authenticated
  if (!isLoading && !isAuthenticated) {
    return <Navigate to="/auth" />;
  }
  
  // Handle config changes
  const handleConfigChange = (key: string, value: any) => {
    setTestConfig((prev) => ({
      ...prev,
      [key]: value
    }));
  };
  
  // Handle nested config changes
  const handleNestedConfigChange = (parentKey: string, key: string, value: any) => {
    setTestConfig((prev) => ({
      ...prev,
      [parentKey]: {
        ...prev[parentKey],
        [key]: value
      }
    }));
  };
  
  // Reset config to defaults
  const handleResetConfig = () => {
    const defaultConfig = sandboxController.resetSandboxConfig();
    setTestConfig(defaultConfig);
    toast.success('Sandbox configuration reset to defaults');
  };
  
  // Initialize SDK instance
  const initializeSDK = () => {
    try {
      if (window.SecureAddressBridge) {
        const sdk = new window.SecureAddressBridge({
          appId: 'app_sandbox',
          redirectUri: window.location.origin + '/developer/sandbox',
          sandbox: true,
          sandboxOptions: testConfig
        });
        
        setSdkInstance(sdk);
        addTestResult('SDK Initialized', 'success', {
          appId: 'app_sandbox',
          redirectUri: window.location.origin + '/developer/sandbox',
          sandbox: true
        });
        
        toast.success('SDK initialized in sandbox mode');
      } else {
        toast.error('SecureAddressBridge SDK not loaded');
      }
    } catch (error) {
      console.error('Error initializing SDK:', error);
      addTestResult('SDK Initialization', 'error', { error: String(error) });
      toast.error('Failed to initialize SDK');
    }
  };
  
  // Log test results
  const addTestResult = (action: string, status: 'success' | 'error' | 'info', data: any) => {
    setTestResults(prev => [{
      id: Date.now(),
      timestamp: new Date().toISOString(),
      action,
      status,
      data
    }, ...prev]);
  };
  
  // Test authorization
  const testAuthorize = async () => {
    if (!sdkInstance) {
      toast.error('Initialize SDK first');
      return;
    }
    
    try {
      addTestResult('Authorization Request', 'info', {
        scope: ['street', 'city', 'state', 'postal_code', 'country'],
        expiryDays: 30,
        state: testId
      });
      
      // Instead of redirecting, simulate the flow
      const result = await sandboxController.handleAuthorize({
        appId: 'app_sandbox',
        redirectUri: window.location.origin + '/developer/sandbox',
        scope: ['street', 'city', 'state', 'postal_code', 'country'],
        expiryDays: 30,
        state: testId
      });
      
      addTestResult('Authorization Response', result.success ? 'success' : 'error', result);
      
      if (result.success) {
        // Simulate the callback
        const callbackResult = await sandboxController.handleCallback();
        addTestResult('Callback Response', callbackResult.success ? 'success' : 'error', callbackResult);
        
        if (callbackResult.success && callbackResult.accessToken) {
          setToken(callbackResult.accessToken);
          sdkInstance.setAccessToken(callbackResult.accessToken);
        }
      }
    } catch (error) {
      console.error('Error testing authorization:', error);
      addTestResult('Authorization Test', 'error', { error: String(error) });
      toast.error('Failed to test authorization');
    }
  };
  
  // Test get address
  const testGetAddress = async () => {
    if (!sdkInstance) {
      toast.error('Initialize SDK first');
      return;
    }
    
    if (!token) {
      toast.error('No access token. Run authorization test first.');
      return;
    }
    
    try {
      addTestResult('Get Address Request', 'info', {
        includeVerificationInfo: true
      });
      
      const result = await sandboxController.getAddress({
        includeVerificationInfo: true
      });
      
      addTestResult('Get Address Response', result.success ? 'success' : 'error', result);
    } catch (error) {
      console.error('Error testing get address:', error);
      addTestResult('Get Address Test', 'error', { error: String(error) });
      toast.error('Failed to test get address');
    }
  };
  
  // Test wallet connection
  const testWalletConnection = async () => {
    if (!sdkInstance) {
      toast.error('Initialize SDK first');
      return;
    }
    
    try {
      addTestResult('Wallet Connection Request', 'info', {
        providerType: 'injected'
      });
      
      const result = await sandboxController.connectWallet({
        providerType: 'injected'
      });
      
      addTestResult('Wallet Connection Response', result.success ? 'success' : 'error', result);
    } catch (error) {
      console.error('Error testing wallet connection:', error);
      addTestResult('Wallet Connection Test', 'error', { error: String(error) });
      toast.error('Failed to test wallet connection');
    }
  };
  
  // Test wallet linking
  const testLinkWallet = async () => {
    if (!sdkInstance) {
      toast.error('Initialize SDK first');
      return;
    }
    
    if (!token) {
      toast.error('No access token. Run authorization test first.');
      return;
    }
    
    try {
      const walletResult = await sandboxController.connectWallet({
        providerType: 'injected'
      });
      
      if (walletResult.success) {
        addTestResult('Link Wallet Request', 'info', {
          walletAddress: walletResult.address,
          chainId: walletResult.chainId,
          createVerifiableCredential: true
        });
        
        const result = await sandboxController.linkAddressToWallet({
          walletAddress: walletResult.address,
          chainId: walletResult.chainId,
          createVerifiableCredential: true
        });
        
        addTestResult('Link Wallet Response', result.success ? 'success' : 'error', result);
      } else {
        addTestResult('Link Wallet Test', 'error', { error: 'Wallet connection failed' });
        toast.error('Wallet connection failed, cannot link');
      }
    } catch (error) {
      console.error('Error testing wallet linking:', error);
      addTestResult('Link Wallet Test', 'error', { error: String(error) });
      toast.error('Failed to test wallet linking');
    }
  };
  
  // Test shipping token
  const testShippingToken = async () => {
    if (!sdkInstance) {
      toast.error('Initialize SDK first');
      return;
    }
    
    if (!token) {
      toast.error('No access token. Run authorization test first.');
      return;
    }
    
    try {
      const carriers = testConfig.mockShipping.carriers || ['usps', 'fedex', 'ups'];
      
      addTestResult('Shipping Token Request', 'info', {
        carriers,
        shippingMethods: ['Priority', 'Ground', 'Express'],
        requireConfirmation: false,
        expiryDays: 7,
        maxUses: 1
      });
      
      const result = await sandboxController.createBlindShippingToken({
        carriers,
        shippingMethods: ['Priority', 'Ground', 'Express'],
        requireConfirmation: false,
        expiryDays: 7,
        maxUses: 1
      });
      
      addTestResult('Shipping Token Response', result.success ? 'success' : 'error', result);
      
      if (result.success && result.shipping_token) {
        // Test request shipment
        addTestResult('Request Shipment Request', 'info', {
          shippingToken: result.shipping_token,
          carrier: carriers[0],
          service: 'Priority',
          package: {
            type: 'box',
            weight: 16,
            dimensions: {
              length: 12,
              width: 8,
              height: 6
            }
          }
        });
        
        const shipmentResult = await sandboxController.requestShipment({
          shippingToken: result.shipping_token,
          carrier: carriers[0],
          service: 'Priority',
          package: {
            type: 'box',
            weight: 16,
            dimensions: {
              length: 12,
              width: 8,
              height: 6
            }
          }
        });
        
        addTestResult('Request Shipment Response', shipmentResult.success ? 'success' : 'error', shipmentResult);
        
        // Test tracking
        if (shipmentResult.success && shipmentResult.tracking_number) {
          addTestResult('Tracking Request', 'info', {
            trackingNumber: shipmentResult.tracking_number,
            carrier: carriers[0]
          });
          
          const trackingResult = await sandboxController.getTrackingInfo(
            shipmentResult.tracking_number,
            carriers[0]
          );
          
          addTestResult('Tracking Response', trackingResult.success ? 'success' : 'error', trackingResult);
        }
      }
    } catch (error) {
      console.error('Error testing shipping:', error);
      addTestResult('Shipping Test', 'error', { error: String(error) });
      toast.error('Failed to test shipping');
    }
  };
  
  // Test all functionality
  const runAllTests = async () => {
    setTestResults([]);
    setToken(null);
    setSdkInstance(null);
    
    initializeSDK();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    await testAuthorize();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    await testGetAddress();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    await testWalletConnection();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    await testLinkWallet();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    await testShippingToken();
    
    toast.success('All tests completed');
  };
  
  // Generate example code
  const generateExampleCode = () => {
    return `// Initialize the SDK in sandbox mode
const client = new SecureAddressBridge({
  appId: 'YOUR_APP_ID',
  redirectUri: 'https://your-app.com/callback',
  sandbox: true,
  sandboxOptions: ${JSON.stringify(testConfig, null, 2)}
});

// Now you can test all SDK functionality without making real API calls
async function testSDK() {
  // Authorize
  client.authorize({
    scope: ['street', 'city', 'state', 'postal_code', 'country'],
    expiryDays: 30
  });
  
  // In your callback handler:
  const result = await client.handleCallback();
  console.log('Authorization result:', result);
  
  // Get address
  const addressData = await client.getAddress();
  console.log('Address data:', addressData);
  
  // Link to wallet
  const walletResult = await client.connectWallet();
  
  if (walletResult.success) {
    const linkResult = await client.linkAddressToWallet({
      walletAddress: walletResult.address,
      chainId: walletResult.chainId
    });
    console.log('Link result:', linkResult);
  }
  
  // Create blind shipping token
  const shippingToken = await client.createBlindShippingToken({
    carriers: ['usps', 'fedex'],
    shippingMethods: ['Priority', 'Ground']
  });
  console.log('Shipping token:', shippingToken);
}`;
  };
  
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-32 pb-20 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">SDK Sandbox</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Test the SecureAddress Bridge SDK in a sandbox environment without making real API calls
            </p>
          </div>
          
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-8">
              <TabsTrigger value="configure">Configure</TabsTrigger>
              <TabsTrigger value="test">Test SDK</TabsTrigger>
              <TabsTrigger value="code">Example Code</TabsTrigger>
            </TabsList>
            
            <TabsContent value="configure" className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Sandbox Configuration</CardTitle>
                  <CardDescription>
                    Configure how the sandbox responds to API requests
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="responseDelay">Response Delay (ms)</Label>
                      <Slider
                        id="responseDelay"
                        defaultValue={[testConfig.responseDelay]}
                        max={2000}
                        step={50}
                        onValueChange={(values) => handleConfigChange('responseDelay', values[0])}
                        className="mt-2"
                      />
                      <p className="text-xs text-muted-foreground mt-1">{testConfig.responseDelay}ms</p>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="simulateErrors">Simulate Errors</Label>
                        <Switch
                          id="simulateErrors"
                          checked={testConfig.simulateErrors}
                          onCheckedChange={(checked) => handleConfigChange('simulateErrors', checked)}
                        />
                      </div>
                      
                      {testConfig.simulateErrors && (
                        <div>
                          <Label htmlFor="errorRate">Error Rate</Label>
                          <Slider
                            id="errorRate"
                            defaultValue={[testConfig.errorRate * 100]}
                            max={100}
                            step={5}
                            onValueChange={(values) => handleConfigChange('errorRate', values[0] / 100)}
                            className="mt-2"
                          />
                          <p className="text-xs text-muted-foreground mt-1">{Math.round(testConfig.errorRate * 100)}%</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Address Verification</h3>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="verificationSuccess">Address Verification Success</Label>
                      <Switch
                        id="verificationSuccess"
                        checked={testConfig.verificationSuccess}
                        onCheckedChange={(checked) => handleConfigChange('verificationSuccess', checked)}
                      />
                    </div>
                    
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <Label htmlFor="addressStreet">Street</Label>
                        <Input
                          id="addressStreet"
                          value={testConfig.mockAddress.street}
                          onChange={(e) => handleNestedConfigChange('mockAddress', 'street', e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="addressCity">City</Label>
                        <Input
                          id="addressCity"
                          value={testConfig.mockAddress.city}
                          onChange={(e) => handleNestedConfigChange('mockAddress', 'city', e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="addressState">State</Label>
                        <Input
                          id="addressState"
                          value={testConfig.mockAddress.state}
                          onChange={(e) => handleNestedConfigChange('mockAddress', 'state', e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="addressPostalCode">Postal Code</Label>
                        <Input
                          id="addressPostalCode"
                          value={testConfig.mockAddress.postal_code}
                          onChange={(e) => handleNestedConfigChange('mockAddress', 'postal_code', e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="addressCountry">Country</Label>
                        <Input
                          id="addressCountry"
                          value={testConfig.mockAddress.country}
                          onChange={(e) => handleNestedConfigChange('mockAddress', 'country', e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="verificationMethod">Verification Method</Label>
                        <Select
                          value={testConfig.mockAddress.verification_method}
                          onValueChange={(value) => handleNestedConfigChange('mockAddress', 'verification_method', value)}
                        >
                          <SelectTrigger id="verificationMethod" className="mt-1">
                            <SelectValue placeholder="Select method" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="document_upload">Document Upload</SelectItem>
                            <SelectItem value="postal_code">Postal Code</SelectItem>
                            <SelectItem value="id_verification">ID Verification</SelectItem>
                            <SelectItem value="blockchain_attestation">Blockchain Attestation</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Wallet Integration</h3>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="walletConnectionSuccess">Wallet Connection Success</Label>
                      <Switch
                        id="walletConnectionSuccess"
                        checked={testConfig.walletConnectionSuccess}
                        onCheckedChange={(checked) => handleConfigChange('walletConnectionSuccess', checked)}
                      />
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Shipping</h3>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="shippingAvailable">Shipping Available</Label>
                      <Switch
                        id="shippingAvailable"
                        checked={testConfig.mockShipping.available}
                        onCheckedChange={(checked) => handleNestedConfigChange('mockShipping', 'available', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="trackingAvailable">Tracking Available</Label>
                      <Switch
                        id="trackingAvailable"
                        checked={testConfig.mockShipping.trackingAvailable}
                        onCheckedChange={(checked) => handleNestedConfigChange('mockShipping', 'trackingAvailable', checked)}
                      />
                    </div>
                    
                    <div>
                      <Label>Available Carriers</Label>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {['usps', 'fedex', 'ups', 'dhl'].map(carrier => {
                          const isSelected = testConfig.mockShipping.carriers.includes(carrier);
                          return (
                            <Button
                              key={carrier}
                              type="button"
                              variant={isSelected ? "default" : "outline"}
                              className="capitalize"
                              onClick={() => {
                                const updatedCarriers = isSelected
                                  ? testConfig.mockShipping.carriers.filter(c => c !== carrier)
                                  : [...testConfig.mockShipping.carriers, carrier];
                                
                                handleNestedConfigChange('mockShipping', 'carriers', updatedCarriers);
                              }}
                            >
                              {carrier}
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-4 mt-4">
                    <Button variant="outline" onClick={handleResetConfig}>Reset to Defaults</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="test" className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Test SDK</CardTitle>
                  <CardDescription>
                    Test the SecureAddress Bridge SDK with your current sandbox configuration
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      <Button onClick={initializeSDK}>
                        Initialize SDK
                      </Button>
                      
                      <Button
                        onClick={testAuthorize}
                        disabled={!sdkInstance}
                      >
                        Test Authorization
                      </Button>
                      
                      <Button
                        onClick={testGetAddress}
                        disabled={!sdkInstance || !token}
                      >
                        Test Get Address
                      </Button>
                      
                      <Button
                        onClick={testWalletConnection}
                        disabled={!sdkInstance}
                      >
                        Test Wallet Connection
                      </Button>
                      
                      <Button
                        onClick={testLinkWallet}
                        disabled={!sdkInstance || !token}
                      >
                        Test Link Wallet
                      </Button>
                      
                      <Button
                        onClick={testShippingToken}
                        disabled={!sdkInstance || !token}
                      >
                        Test Shipping
                      </Button>
                    </div>
                    
                    <div className="text-center mt-4">
                      <Button size="lg" onClick={runAllTests}>Run All Tests</Button>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="text-lg font-medium mb-4">Test Results</h3>
                      
                      <div className="border rounded-lg overflow-hidden">
                        <div className="bg-muted p-3 text-sm font-medium">
                          Test Log
                        </div>
                        
                        <div className="max-h-96 overflow-y-auto">
                          {testResults.length === 0 ? (
                            <div className="p-4 text-center text-muted-foreground">
                              No test results yet. Run a test to see results here.
                            </div>
                          ) : (
                            <div className="divide-y">
                              {testResults.map((result) => (
                                <div key={result.id} className="p-3">
                                  <div className="flex items-start justify-between">
                                    <div>
                                      <span className={`inline-block rounded-full w-2 h-2 mr-2 ${
                                        result.status === 'success' ? 'bg-green-500' : 
                                        result.status === 'error' ? 'bg-red-500' : 'bg-blue-500'
                                      }`}></span>
                                      <span className="font-medium">{result.action}</span>
                                    </div>
                                    <span className="text-xs text-muted-foreground">
                                      {new Date(result.timestamp).toLocaleTimeString()}
                                    </span>
                                  </div>
                                  
                                  <div className="mt-2 text-sm">
                                    <pre className="bg-muted p-2 rounded overflow-x-auto text-xs">
                                      {JSON.stringify(result.data, null, 2)}
                                    </pre>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="code" className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Example Code</CardTitle>
                  <CardDescription>
                    Sample code for using the SDK in sandbox mode with your current configuration
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <CodeBlock
                    code={generateExampleCode()}
                    language="javascript"
                    showLineNumbers={true}
                  />
                  
                  <div className="mt-6 space-y-4">
                    <h3 className="text-lg font-medium">How to Use Sandbox Mode</h3>
                    
                    <ol className="list-decimal pl-5 space-y-2">
                      <li>
                        Initialize the SDK with the <code className="text-xs bg-muted p-0.5 rounded">sandbox: true</code> option.
                      </li>
                      <li>
                        Configure sandbox behavior with <code className="text-xs bg-muted p-0.5 rounded">sandboxOptions</code>.
                      </li>
                      <li>
                        Use the SDK as normal - all API calls will be intercepted and handled locally.
                      </li>
                      <li>
                        Test different scenarios by adjusting the sandbox configuration.
                      </li>
                      <li>
                        When ready for production, remove the sandbox option.
                      </li>
                    </ol>
                    
                    <div className="bg-muted p-4 rounded-lg text-sm mt-4">
                      <p className="font-medium mb-2">Benefits of sandbox mode:</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Develop and test integration without real API calls</li>
                        <li>Simulate different response scenarios (success, errors)</li>
                        <li>Test address verification, wallet linking, and shipping workflows</li>
                        <li>Demonstrate functionality to stakeholders without real accounts</li>
                        <li>Speed up development with instant responses (or simulated latency)</li>
                      </ul>
                    </div>
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

export default SdkSandbox;

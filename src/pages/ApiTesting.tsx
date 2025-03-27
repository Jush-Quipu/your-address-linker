
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { SecureAddressBridge } from '@/sdk/secureaddress-bridge-sdk';
import { ApiTestCase, ApiTestResult, runApiTest } from '@/utils/apiTesting';
import { testConnection } from '@/utils/apiHelpers';
import ApiRequestBuilder from '@/components/ApiRequestBuilder';
import ApiResponseVisualizer from '@/components/ApiResponseVisualizer';
import ApiRequestHistory from '@/components/ApiRequestHistory';
import SandboxConfigurationPanel from '@/components/SandboxConfigurationPanel';
import SandboxLogs from '@/components/SandboxLogs';
import sandboxManager, { SandboxLogItem } from '@/utils/sandboxManager';

interface RequestHistoryItem {
  id: string;
  timestamp: Date;
  testCase: ApiTestCase;
  status?: number;
  duration?: number;
}

const ApiTesting: React.FC = () => {
  const [activeTab, setActiveTab] = useState('api-testing');
  const [testResult, setTestResult] = useState<ApiTestResult | null>(null);
  const [isRunningTest, setIsRunningTest] = useState(false);
  const [apiStatus, setApiStatus] = useState<{ status: 'idle' | 'ok' | 'error', message?: string, version?: string }>({ status: 'idle' });
  const [currentRequest, setCurrentRequest] = useState<ApiTestCase>({
    name: 'Health Check',
    endpoint: 'https://akfieehzgpcapuhdujvf.supabase.co/functions/v1/health-check',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-App-ID': 'test-app-id'
    },
    description: 'Basic health check to verify API is operational'
  });
  const [requestHistory, setRequestHistory] = useState<RequestHistoryItem[]>([]);
  const [savedRequests, setSavedRequests] = useState<ApiTestCase[]>([]);
  const [sandboxConfig, setSandboxConfig] = useState(sandboxManager.config);
  const [sandboxLogs, setSandboxLogs] = useState<SandboxLogItem[]>([]);
  const [sdkInitialized, setSdkInitialized] = useState(false);
  const [sdkInstance, setSdkInstance] = useState<SecureAddressBridge | null>(null);
  
  const navigate = useNavigate();

  // Initialize SDK and subscribe to sandbox logs/config
  useEffect(() => {
    // Create SDK instance for testing
    const sdk = new SecureAddressBridge({
      appId: 'test-app-id',
      redirectUri: window.location.origin + '/callback',
      sandbox: true
    });
    
    setSdkInstance(sdk);
    setSdkInitialized(true);
    
    // Subscribe to sandbox logs
    const unsubscribeLogs = sandboxManager.subscribeToLogs((logs) => {
      setSandboxLogs(logs);
    });
    
    // Subscribe to sandbox config
    const unsubscribeConfig = sandboxManager.subscribeToConfig((config) => {
      setSandboxConfig(config);
    });
    
    // Load saved requests from localStorage
    const savedRequestsJson = localStorage.getItem('api-testing-saved-requests');
    if (savedRequestsJson) {
      try {
        setSavedRequests(JSON.parse(savedRequestsJson));
      } catch (error) {
        console.error('Error loading saved requests:', error);
      }
    }
    
    // Load request history from localStorage
    const historyJson = localStorage.getItem('api-testing-history');
    if (historyJson) {
      try {
        setRequestHistory(JSON.parse(historyJson));
      } catch (error) {
        console.error('Error loading request history:', error);
      }
    }
    
    return () => {
      unsubscribeLogs();
      unsubscribeConfig();
    };
  }, []);

  // Save request history to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('api-testing-history', JSON.stringify(requestHistory));
  }, [requestHistory]);

  // Save saved requests to localStorage when they change
  useEffect(() => {
    localStorage.setItem('api-testing-saved-requests', JSON.stringify(savedRequests));
  }, [savedRequests]);

  // Test API connectivity using the SDK
  const testApiConnection = async () => {
    try {
      setApiStatus({ status: 'idle' });
      
      const result = await testConnection('https://akfieehzgpcapuhdujvf.supabase.co/functions/v1', 'test-app-id');
      
      setApiStatus({
        status: result.success ? 'ok' : 'error',
        message: result.error ? result.error.message : 'API is operational',
        version: result.meta?.version
      });
    } catch (error) {
      console.error('API connection test error:', error);
      setApiStatus({ 
        status: 'error', 
        message: error instanceof Error ? error.message : 'Unknown error testing API connection'
      });
    }
  };

  // Run a custom API test
  const runCustomTest = async (testCase: ApiTestCase) => {
    setIsRunningTest(true);
    setTestResult(null);
    
    try {
      // Run the test
      const startTime = performance.now();
      
      // Use sandbox manager for API requests in testing mode
      const response = await sandboxManager.runCustomRequest({
        endpoint: testCase.endpoint,
        method: testCase.method || 'GET',
        headers: testCase.headers,
        body: testCase.body
      });
      
      const duration = performance.now() - startTime;
      
      // Create result
      const result: ApiTestResult = {
        testCase,
        passed: response.success,
        status: response.success ? 200 : 400,
        responseData: response,
        duration
      };
      
      setTestResult(result);
      
      // Add to history
      addToHistory(testCase, result.status, result.duration);
      
      toast.success('API request completed');
    } catch (error) {
      console.error('Error running custom test:', error);
      
      const errorResult: ApiTestResult = {
        testCase,
        passed: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
      
      setTestResult(errorResult);
      
      // Add failed request to history
      addToHistory(testCase);
      
      toast.error('API request failed');
    } finally {
      setIsRunningTest(false);
    }
  };

  // Add a request to history
  const addToHistory = (testCase: ApiTestCase, status?: number, duration?: number) => {
    const historyItem: RequestHistoryItem = {
      id: uuidv4(),
      timestamp: new Date(),
      testCase: { ...testCase },
      status,
      duration
    };
    
    setRequestHistory(prev => [historyItem, ...prev.slice(0, 9)]);
  };

  // Clear request history
  const clearHistory = () => {
    setRequestHistory([]);
    toast.success('Request history cleared');
  };

  // Save a request to the collection
  const saveRequest = (testCase: ApiTestCase) => {
    // Check if a request with the same name already exists
    const existingIndex = savedRequests.findIndex(req => req.name === testCase.name);
    
    if (existingIndex !== -1) {
      // Update existing
      setSavedRequests(prev => {
        const updated = [...prev];
        updated[existingIndex] = testCase;
        return updated;
      });
    } else {
      // Add new
      setSavedRequests(prev => [...prev, testCase]);
    }
  };

  // Handle request selection from history
  const handleSelectFromHistory = (testCase: ApiTestCase) => {
    setCurrentRequest(testCase);
  };

  // Update sandbox configuration
  const handleUpdateSandboxConfig = (config: any) => {
    sandboxManager.updateConfig(config);
  };

  // Reset sandbox configuration
  const handleResetSandboxConfig = () => {
    sandboxManager.resetConfig();
  };

  // Clear sandbox logs
  const handleClearSandboxLogs = () => {
    sandboxManager.clearLogs();
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-32 pb-20 px-6 md:px-12">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">API Testing Tools</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Test and verify your SecureAddress Bridge API integration with these tools.
            </p>
          </div>
          
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>API Connection Status</CardTitle>
                  <CardDescription>
                    Verify the connection to the SecureAddress Bridge API
                  </CardDescription>
                </div>
                <Button 
                  onClick={testApiConnection} 
                  disabled={isRunningTest}
                >
                  Test Connection
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                {apiStatus.status === 'idle' ? (
                  <div className="text-muted-foreground">Click to check API connection status</div>
                ) : apiStatus.status === 'ok' ? (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-md text-green-800">
                    <div className="font-medium">Connected Successfully</div>
                    <div className="text-sm">{apiStatus.message} (Version: {apiStatus.version})</div>
                  </div>
                ) : (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-800">
                    <div className="font-medium">Connection Failed</div>
                    <div className="text-sm">{apiStatus.message}</div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-8">
              <TabsTrigger value="api-testing">API Testing</TabsTrigger>
              <TabsTrigger value="sandbox-config">Sandbox Config</TabsTrigger>
              <TabsTrigger value="logs">Logs</TabsTrigger>
            </TabsList>
            
            <TabsContent value="api-testing" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3 space-y-6">
                  <ApiRequestBuilder 
                    initialRequest={currentRequest}
                    onSubmit={runCustomTest}
                    onSave={saveRequest}
                    loading={isRunningTest}
                  />
                  
                  <ApiResponseVisualizer 
                    response={testResult}
                    loading={isRunningTest}
                  />
                </div>
                
                <div className="space-y-6">
                  <ApiRequestHistory 
                    history={requestHistory}
                    onSelectRequest={handleSelectFromHistory}
                    onClearHistory={clearHistory}
                  />
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Saved Requests</CardTitle>
                      <CardDescription>Your request collection</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {savedRequests.length === 0 ? (
                        <div className="text-center py-6 text-muted-foreground">
                          <p>No saved requests</p>
                          <p className="text-sm">Save API requests to reuse them later</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {savedRequests.map((request, index) => (
                            <Button
                              key={index}
                              variant="outline"
                              className="w-full justify-start text-left h-auto py-2"
                              onClick={() => setCurrentRequest(request)}
                            >
                              <div>
                                <div className="font-medium">{request.name}</div>
                                <div className="text-xs text-muted-foreground flex items-center">
                                  <span className="font-mono bg-muted rounded px-1 mr-2">
                                    {request.method}
                                  </span>
                                  <span className="truncate max-w-[150px]">
                                    {request.endpoint.split('/').pop()}
                                  </span>
                                </div>
                              </div>
                            </Button>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="sandbox-config">
              <SandboxConfigurationPanel 
                config={sandboxConfig}
                onUpdateConfig={handleUpdateSandboxConfig}
                onResetConfig={handleResetSandboxConfig}
              />
            </TabsContent>
            
            <TabsContent value="logs">
              <SandboxLogs 
                logs={sandboxLogs}
                onClearLogs={handleClearSandboxLogs}
              />
            </TabsContent>
          </Tabs>
          
          <div className="flex justify-center mt-8">
            <Button variant="outline" onClick={() => navigate('/docs')}>
              Return to API Documentation
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ApiTesting;

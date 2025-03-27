import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, XCircle, AlertTriangle, Play, CheckSquare } from 'lucide-react';
import { toast } from 'sonner';
import { SecureAddressBridge } from '@/sdk/secureaddress-bridge-sdk';
import { ApiTestCase, ApiTestResult, runApiTest, runApiTests, standardApiTests, formatTestReport } from '@/utils/apiTesting';
import CodeBlock from '@/components/CodeBlock';
import { testConnection } from '@/utils/apiHelpers';

const ApiTesting: React.FC = () => {
  const [activeTab, setActiveTab] = useState('basic-tests');
  const [testResults, setTestResults] = useState<ApiTestResult[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [apiStatus, setApiStatus] = useState<{ status: 'idle' | 'ok' | 'error', message?: string, version?: string }>({ status: 'idle' });
  const [customEndpoint, setCustomEndpoint] = useState('https://akfieehzgpcapuhdujvf.supabase.co/functions/v1/health-check');
  const [customMethod, setCustomMethod] = useState<'GET' | 'POST' | 'PUT' | 'DELETE'>('GET');
  const [customHeaders, setCustomHeaders] = useState('{\n  "X-App-ID": "test-app-id"\n}');
  const [customBody, setCustomBody] = useState('');
  const [testReport, setTestReport] = useState('');
  const [sdkInitialized, setSdkInitialized] = useState(false);
  const [sdkInstance, setSdkInstance] = useState<SecureAddressBridge | null>(null);
  
  const navigate = useNavigate();

  // Initialize SDK on component mount
  useEffect(() => {
    // Create SDK instance for testing
    const sdk = new SecureAddressBridge({
      apiKey: 'test-app-id',
      sandboxMode: true
    });
    
    setSdkInstance(sdk);
    setSdkInitialized(true);
  }, []);

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

  // Run predefined standard API tests
  const runStandardTests = async () => {
    setIsRunningTests(true);
    setTestResults([]);
    
    try {
      const results = await runApiTests(standardApiTests);
      setTestResults(results);
      setTestReport(formatTestReport(results));
    } catch (error) {
      console.error('Error running standard tests:', error);
    } finally {
      setIsRunningTests(false);
    }
  };

  // Run a custom API test
  const runCustomTest = async () => {
    setIsRunningTests(true);
    setTestResults([]);
    
    try {
      let parsedHeaders = {};
      try {
        parsedHeaders = JSON.parse(customHeaders);
      } catch {
        parsedHeaders = {};
      }
      
      let parsedBody = undefined;
      if (customBody.trim() && (customMethod === 'POST' || customMethod === 'PUT')) {
        try {
          parsedBody = JSON.parse(customBody);
        } catch {
          parsedBody = customBody;
        }
      }
      
      const testCase: ApiTestCase = {
        name: 'Custom Test',
        endpoint: customEndpoint,
        method: customMethod,
        headers: parsedHeaders,
        body: parsedBody,
        description: 'Custom test case'
      };
      
      const result = await runApiTest(testCase);
      setTestResults([result]);
      setTestReport(formatTestReport([result]));
    } catch (error) {
      console.error('Error running custom test:', error);
    } finally {
      setIsRunningTests(false);
    }
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
              <CardTitle>API Connection Status</CardTitle>
              <CardDescription>
                Verify the connection to the SecureAddress Bridge API
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                {apiStatus.status === 'idle' ? (
                  <div className="text-muted-foreground">Click to check API connection status</div>
                ) : apiStatus.status === 'ok' ? (
                  <Alert variant="success" className="border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertTitle className="text-green-800">Connected</AlertTitle>
                    <AlertDescription className="text-green-700">
                      {apiStatus.message} (Version: {apiStatus.version})
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert variant="destructive">
                    <XCircle className="h-4 w-4" />
                    <AlertTitle>Connection Failed</AlertTitle>
                    <AlertDescription>
                      {apiStatus.message}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={testApiConnection} 
                disabled={isRunningTests}
                className="flex items-center gap-2"
              >
                <Play className="h-4 w-4" />
                Test API Connection
              </Button>
            </CardFooter>
          </Card>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
              <TabsTrigger value="basic-tests">Standard Tests</TabsTrigger>
              <TabsTrigger value="custom-test">Custom Test</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic-tests" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Standard API Tests</CardTitle>
                  <CardDescription>
                    Run a suite of standard tests to verify API functionality
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {standardApiTests.map((test, index) => (
                        <Card key={index} className="h-full">
                          <CardHeader>
                            <CardTitle className="text-lg">{test.name}</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-muted-foreground mb-2">{test.description}</p>
                            <p className="text-sm font-mono bg-muted p-2 rounded">
                              {test.method} {test.endpoint}
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={runStandardTests} 
                    disabled={isRunningTests}
                    className="flex items-center gap-2"
                  >
                    <Play className="h-4 w-4" />
                    Run Standard Tests
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="custom-test" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Custom API Test</CardTitle>
                  <CardDescription>
                    Create and run a custom API test
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="endpoint">Endpoint URL</Label>
                      <Input 
                        id="endpoint" 
                        value={customEndpoint} 
                        onChange={(e) => setCustomEndpoint(e.target.value)} 
                        placeholder="https://akfieehzgpcapuhdujvf.supabase.co/functions/v1/endpoint" 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="method">HTTP Method</Label>
                      <select
                        id="method"
                        value={customMethod}
                        onChange={(e) => setCustomMethod(e.target.value as any)}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="GET">GET</option>
                        <option value="POST">POST</option>
                        <option value="PUT">PUT</option>
                        <option value="DELETE">DELETE</option>
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="headers">Headers (JSON)</Label>
                      <Textarea 
                        id="headers" 
                        value={customHeaders} 
                        onChange={(e) => setCustomHeaders(e.target.value)} 
                        placeholder='{"Content-Type": "application/json", "X-App-ID": "your-app-id"}'
                        rows={4}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="body">Body (JSON - for POST/PUT)</Label>
                      <Textarea 
                        id="body" 
                        value={customBody} 
                        onChange={(e) => setCustomBody(e.target.value)} 
                        placeholder='{"key": "value"}'
                        rows={4}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={runCustomTest} 
                    disabled={isRunningTests}
                    className="flex items-center gap-2"
                  >
                    <Play className="h-4 w-4" />
                    Run Custom Test
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
          
          {testResults.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Test Results</CardTitle>
                <CardDescription>
                  Results from the most recent test run
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-4">
                    {testResults.map((result, index) => (
                      <Card key={index} className={`border-l-4 ${result.passed ? 'border-l-green-500' : 'border-l-red-500'}`}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <div>
                            <CardTitle className="text-lg flex items-center gap-2">
                              {result.passed ? (
                                <CheckCircle className="h-5 w-5 text-green-500" />
                              ) : (
                                <XCircle className="h-5 w-5 text-red-500" />
                              )}
                              {result.testCase.name}
                            </CardTitle>
                            <CardDescription>
                              {result.testCase.method} {result.testCase.endpoint}
                            </CardDescription>
                          </div>
                          {result.duration && (
                            <div className="bg-muted px-2 py-1 rounded text-xs">
                              {result.duration.toFixed(2)}ms
                            </div>
                          )}
                        </CardHeader>
                        <CardContent>
                          {result.status && (
                            <div className="mb-2">
                              <span className="font-medium">Status:</span> {result.status}
                            </div>
                          )}
                          
                          {result.error && (
                            <div className="mb-2 text-red-500">
                              <span className="font-medium">Error:</span> {result.error}
                            </div>
                          )}
                          
                          {result.responseData && (
                            <div className="mt-4">
                              <span className="font-medium mb-1 block">Response:</span>
                              <pre className="bg-muted p-3 rounded text-xs overflow-auto max-h-40">
                                {JSON.stringify(result.responseData, null, 2)}
                              </pre>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  
                  {testReport && (
                    <div className="mt-6">
                      <h3 className="text-lg font-medium mb-2">Test Report</h3>
                      <CodeBlock code={testReport} language="text" showLineNumbers={false} />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
          
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

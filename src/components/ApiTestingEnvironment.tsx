
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Code, Play, Save, Trash2, Plus, Check, AlertCircle, Clock } from 'lucide-react';
import { ApiTestCase, ApiTestResult, runApiTest } from '@/utils/apiTesting';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { trackApiRequest } from '@/services/analyticsService';
import { withApiTracking } from '@/utils/analyticsMiddleware';
import { toast } from 'sonner';

const ApiTestingEnvironment: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('new-request');
  const [method, setMethod] = useState<'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'>('GET');
  const [endpoint, setEndpoint] = useState<string>('');
  const [headers, setHeaders] = useState<string>('{\n  "Content-Type": "application/json"\n}');
  const [body, setBody] = useState<string>('');
  const [results, setResults] = useState<ApiTestResult[]>([]);
  const [savedTests, setSavedTests] = useState<ApiTestCase[]>([]);
  const [testName, setTestName] = useState<string>('');
  const [testDescription, setTestDescription] = useState<string>('');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const resultPanelRef = useRef<HTMLDivElement>(null);

  // Load saved tests from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('saved_api_tests');
    if (saved) {
      try {
        setSavedTests(JSON.parse(saved));
      } catch (e) {
        console.error('Error loading saved tests:', e);
      }
    }
  }, []);

  const handleRunTest = async () => {
    // Create test case from form inputs
    let parsedHeaders = {};
    let parsedBody = undefined;
    
    try {
      parsedHeaders = headers ? JSON.parse(headers) : {};
    } catch (e) {
      toast.error('Invalid headers JSON format');
      return;
    }
    
    try {
      parsedBody = body ? JSON.parse(body) : undefined;
    } catch (e) {
      // If not JSON, use as-is (could be form data, text, etc.)
      parsedBody = body || undefined;
    }
    
    const testCase: ApiTestCase = {
      name: testName || `${method} ${endpoint}`,
      method,
      endpoint,
      headers: parsedHeaders,
      body: parsedBody,
      description: testDescription
    };
    
    setIsRunning(true);
    
    try {
      // Use the tracking middleware to run the test
      const result = await withApiTracking(
        endpoint, 
        method, 
        () => runApiTest(testCase)
      );
      
      setResults(prev => [result, ...prev]);
      
      if (resultPanelRef.current) {
        resultPanelRef.current.scrollTop = 0;
      }
    } catch (error) {
      console.error('Error running test:', error);
      toast.error('Error running API test');
    } finally {
      setIsRunning(false);
    }
  };

  const handleSaveTest = () => {
    if (!endpoint) {
      toast.error('Please enter an endpoint URL');
      return;
    }
    
    if (!testName) {
      toast.error('Please enter a test name');
      return;
    }
    
    // Parse headers and body for validation
    try {
      const parsedHeaders = headers ? JSON.parse(headers) : {};
      let parsedBody = undefined;
      
      try {
        parsedBody = body ? JSON.parse(body) : undefined;
      } catch (e) {
        // If not JSON, use as-is
        parsedBody = body || undefined;
      }
      
      const newTest: ApiTestCase = {
        name: testName,
        method,
        endpoint,
        headers: parsedHeaders,
        body: parsedBody,
        description: testDescription
      };
      
      const updatedTests = [...savedTests, newTest];
      setSavedTests(updatedTests);
      localStorage.setItem('saved_api_tests', JSON.stringify(updatedTests));
      
      toast.success('Test saved successfully');
      setTestName('');
      setTestDescription('');
    } catch (e) {
      toast.error('Invalid JSON format in headers or body');
    }
  };

  const handleDeleteTest = (index: number) => {
    const updatedTests = savedTests.filter((_, i) => i !== index);
    setSavedTests(updatedTests);
    localStorage.setItem('saved_api_tests', JSON.stringify(updatedTests));
    toast.success('Test deleted');
  };

  const handleLoadTest = (test: ApiTestCase) => {
    setMethod(test.method);
    setEndpoint(test.endpoint);
    setHeaders(test.headers ? JSON.stringify(test.headers, null, 2) : '');
    setBody(test.body ? JSON.stringify(test.body, null, 2) : '');
    setTestName(test.name);
    setTestDescription(test.description || '');
    setActiveTab('new-request');
  };

  const handleClearResults = () => {
    setResults([]);
  };

  const getStatusColor = (status?: number) => {
    if (!status) return 'bg-gray-200';
    if (status >= 200 && status < 300) return 'bg-green-100 text-green-800';
    if (status >= 400 && status < 500) return 'bg-amber-100 text-amber-800';
    if (status >= 500) return 'bg-red-100 text-red-800';
    return 'bg-blue-100 text-blue-800';
  };

  const formatJson = (json: any) => {
    try {
      return JSON.stringify(json, null, 2);
    } catch (e) {
      return String(json);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>API Testing Environment</CardTitle>
          <CardDescription>
            Test API endpoints and view responses in real-time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="new-request">New Request</TabsTrigger>
              <TabsTrigger value="saved-tests">Saved Tests</TabsTrigger>
            </TabsList>
            
            <TabsContent value="new-request" className="space-y-4 pt-4">
              <div className="grid grid-cols-4 gap-4">
                <div className="col-span-1">
                  <Label htmlFor="method">Method</Label>
                  <Select value={method} onValueChange={(value) => setMethod(value as any)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GET">GET</SelectItem>
                      <SelectItem value="POST">POST</SelectItem>
                      <SelectItem value="PUT">PUT</SelectItem>
                      <SelectItem value="DELETE">DELETE</SelectItem>
                      <SelectItem value="PATCH">PATCH</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-3">
                  <Label htmlFor="endpoint">Endpoint URL</Label>
                  <Input
                    id="endpoint"
                    placeholder="https://api.example.com/v1/resource"
                    value={endpoint}
                    onChange={(e) => setEndpoint(e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="test-name">Test Name</Label>
                <Input
                  id="test-name"
                  placeholder="Give this test a name"
                  value={testName}
                  onChange={(e) => setTestName(e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="test-description">Description (Optional)</Label>
                <Input
                  id="test-description"
                  placeholder="Describe the purpose of this test"
                  value={testDescription}
                  onChange={(e) => setTestDescription(e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="headers">Headers (JSON)</Label>
                <Textarea
                  id="headers"
                  placeholder={'{\n  "Content-Type": "application/json"\n}'}
                  value={headers}
                  onChange={(e) => setHeaders(e.target.value)}
                  className="font-mono text-sm"
                  rows={5}
                />
              </div>
              
              {(method === 'POST' || method === 'PUT' || method === 'PATCH') && (
                <div>
                  <Label htmlFor="body">Request Body (JSON)</Label>
                  <Textarea
                    id="body"
                    placeholder={'{\n  "key": "value"\n}'}
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    className="font-mono text-sm"
                    rows={8}
                  />
                </div>
              )}
              
              <div className="flex justify-between">
                <Button variant="outline" onClick={handleSaveTest}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Test
                </Button>
                <Button onClick={handleRunTest} disabled={isRunning}>
                  {isRunning ? (
                    <>
                      <Clock className="mr-2 h-4 w-4 animate-spin" />
                      Running...
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Run Test
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="saved-tests" className="space-y-4 pt-4">
              {savedTests.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No saved tests yet. Create and save a test to see it here.
                </div>
              ) : (
                <div className="space-y-4">
                  {savedTests.map((test, index) => (
                    <Card key={index}>
                      <CardHeader className="py-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-base">{test.name}</CardTitle>
                            {test.description && (
                              <CardDescription>{test.description}</CardDescription>
                            )}
                          </div>
                          <Badge variant="outline">{test.method}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="py-2">
                        <p className="text-sm font-mono truncate">{test.endpoint}</p>
                      </CardContent>
                      <CardFooter className="pt-0 flex justify-between">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDeleteTest(index)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                        <Button 
                          variant="default" 
                          size="sm" 
                          onClick={() => handleLoadTest(test)}
                        >
                          Load
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Response</CardTitle>
            <CardDescription>
              Results from your API tests
            </CardDescription>
          </div>
          {results.length > 0 && (
            <Button variant="ghost" size="sm" onClick={handleClearResults}>
              <Trash2 className="h-4 w-4 mr-2" />
              Clear Results
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px] pr-4" ref={resultPanelRef}>
            {results.length === 0 ? (
              <div className="text-center py-12">
                <Code className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Run a test to see results here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {results.map((result, index) => (
                  <Card key={index}>
                    <CardHeader className="py-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={getStatusColor(result.status)}>
                            {result.status || 'Error'}
                          </Badge>
                          <span className="font-medium">{result.testCase.method}</span>
                          <span className="text-sm text-muted-foreground truncate max-w-[300px]">
                            {result.testCase.endpoint}
                          </span>
                        </div>
                        <Badge variant="outline">
                          <Clock className="h-3 w-3 mr-1" />
                          {result.duration.toFixed(0)} ms
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="py-2">
                      <Accordion type="single" collapsible className="w-full">
                        {result.error ? (
                          <AccordionItem value="error">
                            <AccordionTrigger className="text-red-500 flex items-center">
                              <AlertCircle className="h-4 w-4 mr-2" />
                              Error
                            </AccordionTrigger>
                            <AccordionContent>
                              <pre className="bg-red-50 p-4 rounded-md text-red-800 text-sm font-mono overflow-auto">
                                {result.error}
                              </pre>
                            </AccordionContent>
                          </AccordionItem>
                        ) : (
                          <>
                            <AccordionItem value="response">
                              <AccordionTrigger>Response</AccordionTrigger>
                              <AccordionContent>
                                <pre className="bg-muted p-4 rounded-md text-sm font-mono overflow-auto">
                                  {formatJson(result.responseData)}
                                </pre>
                              </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="request">
                              <AccordionTrigger>Request</AccordionTrigger>
                              <AccordionContent>
                                <div className="space-y-4">
                                  <div>
                                    <h4 className="text-sm font-medium mb-2">Headers</h4>
                                    <pre className="bg-muted p-4 rounded-md text-sm font-mono overflow-auto">
                                      {formatJson(result.testCase.headers)}
                                    </pre>
                                  </div>
                                  {result.testCase.body && (
                                    <div>
                                      <h4 className="text-sm font-medium mb-2">Body</h4>
                                      <pre className="bg-muted p-4 rounded-md text-sm font-mono overflow-auto">
                                        {formatJson(result.testCase.body)}
                                      </pre>
                                    </div>
                                  )}
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          </>
                        )}
                      </Accordion>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApiTestingEnvironment;

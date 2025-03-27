
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Beaker, Play, Save, Clock, FileCode, ExternalLink } from 'lucide-react';
import ApiRequestBuilder from '@/components/ApiRequestBuilder';
import ApiResponseVisualizer from '@/components/ApiResponseVisualizer';
import ApiRequestHistory from '@/components/ApiRequestHistory';
import { LovableTodoManager } from '@/utils/lovableTodoManager';
import { ApiTestCase, ApiTestResult, runApiTest } from '@/utils/apiTesting';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

// Example test cases
const defaultTestCases: ApiTestCase[] = [
  {
    name: 'Health Check',
    method: 'GET',
    endpoint: 'https://akfieehzgpcapuhdujvf.supabase.co/functions/v1/health-check',
    headers: {
      'Content-Type': 'application/json'
    },
    description: 'Check if the API is accessible and operational'
  },
  {
    name: 'Verify Address',
    method: 'POST',
    endpoint: 'https://akfieehzgpcapuhdujvf.supabase.co/functions/v1/verify-address',
    headers: {
      'Content-Type': 'application/json',
      'X-App-ID': 'your-app-id'
    },
    body: {
      street: '123 Main St',
      city: 'San Francisco',
      state: 'CA',
      postalCode: '94105',
      country: 'US'
    },
    description: 'Test address verification endpoint'
  },
  {
    name: 'Wallet Verification',
    method: 'POST',
    endpoint: 'https://akfieehzgpcapuhdujvf.supabase.co/functions/v1/wallet-verify',
    headers: {
      'Content-Type': 'application/json'
    },
    body: {
      wallet_address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
      message: 'Verify wallet ownership',
      signature: '0x...'
    },
    description: 'Verify wallet address and signature'
  }
];

interface RequestHistoryItem {
  id: string;
  timestamp: Date;
  testCase: ApiTestCase;
  status?: number;
  duration?: number;
}

const ApiTestingEnvironment: React.FC = () => {
  const [activeTab, setActiveTab] = useState('request-builder');
  const [currentTest, setCurrentTest] = useState<ApiTestCase>(defaultTestCases[0]);
  const [testResult, setTestResult] = useState<ApiTestResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [requestHistory, setRequestHistory] = useState<RequestHistoryItem[]>([]);
  const [taskCompleted, setTaskCompleted] = useState(false);

  const runTest = async (testCase: ApiTestCase) => {
    setIsRunning(true);
    try {
      const result = await runApiTest(testCase);
      setTestResult(result);
      
      // Add to history
      const historyItem: RequestHistoryItem = {
        id: uuidv4(),
        timestamp: new Date(),
        testCase: {...testCase},
        status: result.status,
        duration: result.duration
      };
      
      setRequestHistory(prev => [historyItem, ...prev].slice(0, 10));
    } catch (error) {
      console.error('Error running API test:', error);
      toast.error('Failed to run API test');
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmitRequest = (testCase: ApiTestCase) => {
    setCurrentTest(testCase);
    runTest(testCase);
  };

  const handleSelectFromHistory = (testCase: ApiTestCase) => {
    setCurrentTest(testCase);
    setActiveTab('request-builder');
  };

  const handleClearHistory = () => {
    setRequestHistory([]);
    toast.success('Request history cleared');
  };

  const handleMarkComplete = async () => {
    try {
      const success = await LovableTodoManager.markTodoCompleted("API Testing Environment");
      if (success) {
        toast.success("API Testing Environment todo marked as completed!");
        setTaskCompleted(true);
      } else {
        toast.error("Failed to mark todo as completed");
      }
    } catch (error) {
      console.error("Error marking todo as complete:", error);
      toast.error("An error occurred while marking the todo as complete");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div>
          <h2 className="text-2xl font-bold">API Testing Sandbox</h2>
          <p className="text-muted-foreground">
            Test and debug your API requests in a live environment
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <a href="https://docs.secureaddress.bridge/api" target="_blank" rel="noopener noreferrer" className="flex items-center">
              <FileCode className="h-4 w-4 mr-2" />
              API Docs
              <ExternalLink className="h-3 w-3 ml-1" />
            </a>
          </Button>
          
          <Badge variant="outline" className="bg-amber-100 text-amber-800">
            Sandbox Mode
          </Badge>
        </div>
      </div>
      
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <Tabs defaultValue="request-builder" value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="request-builder" className="flex items-center">
                <Beaker className="h-4 w-4 mr-2" />
                Request Builder
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                History
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="request-builder">
              <ApiRequestBuilder 
                initialRequest={currentTest}
                onSubmit={handleSubmitRequest}
                loading={isRunning}
              />
            </TabsContent>
            
            <TabsContent value="history">
              <ApiRequestHistory 
                history={requestHistory}
                onSelectRequest={handleSelectFromHistory}
                onClearHistory={handleClearHistory}
              />
            </TabsContent>
          </Tabs>
          
          {!taskCompleted && (
            <Card className="border-dashed">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <Beaker className="mr-2 h-5 w-5 text-primary" />
                  API Testing Environment
                </CardTitle>
                <CardDescription>
                  Mark this todo as complete once the API testing environment is fully functional
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-3">
                <p className="text-sm">
                  The API testing environment has been implemented with:
                </p>
                <ul className="list-disc pl-5 text-sm mt-2 space-y-1">
                  <li>Request builder with method and endpoint selection</li>
                  <li>Headers and body editors</li>
                  <li>Response visualization</li>
                  <li>Request history</li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button onClick={handleMarkComplete} className="w-full">
                  Mark API Testing Task Complete
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>
        
        <div className="xl:col-span-3">
          <ApiResponseVisualizer response={testResult} loading={isRunning} />
        </div>
      </div>
    </div>
  );
};

export default ApiTestingEnvironment;

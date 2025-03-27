
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight, Copy, CheckCircle, XCircle, Clock } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ApiTestResult } from '@/utils/apiTesting';
import { toast } from 'sonner';
import CodeBlock from '@/components/CodeBlock';

interface ApiResponseVisualizerProps {
  response: ApiTestResult | null;
  loading: boolean;
}

const ApiResponseVisualizer: React.FC<ApiResponseVisualizerProps> = ({ response, loading }) => {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  if (loading) {
    return (
      <Card className="h-full">
        <CardContent className="pt-6 flex items-center justify-center h-full">
          <div className="flex flex-col items-center gap-4">
            <Clock className="h-12 w-12 text-muted-foreground animate-pulse" />
            <p className="text-muted-foreground text-center">Processing request...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!response) {
    return (
      <Card className="h-full">
        <CardContent className="pt-6 flex items-center justify-center h-full">
          <p className="text-muted-foreground text-center">
            Send a request to see the response here
          </p>
        </CardContent>
      </Card>
    );
  }

  const { testCase, status, responseData, passed, duration, error } = response;

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              Response
              {passed !== undefined && (
                passed ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )
              )}
            </CardTitle>
            <CardDescription>
              {testCase.method} {testCase.endpoint}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {status && (
              <Badge variant={status >= 200 && status < 300 ? "success" : "destructive"}>
                Status: {status}
              </Badge>
            )}
            {duration && (
              <Badge variant="outline" className="whitespace-nowrap">
                {duration.toFixed(2)}ms
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="response" className="w-full">
          <TabsList className="mb-2">
            <TabsTrigger value="response">Response</TabsTrigger>
            <TabsTrigger value="request">Request</TabsTrigger>
            {error && <TabsTrigger value="error">Error</TabsTrigger>}
          </TabsList>
          
          <TabsContent value="response">
            <ScrollArea className="h-[400px] rounded-md border p-2">
              {responseData ? (
                <div className="relative">
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="absolute top-2 right-2 h-8 w-8 p-0" 
                    onClick={() => copyToClipboard(JSON.stringify(responseData, null, 2))}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <CodeBlock 
                    code={JSON.stringify(responseData, null, 2)} 
                    language="json" 
                    showLineNumbers={true} 
                  />
                </div>
              ) : (
                <p className="text-muted-foreground p-4">No response data available</p>
              )}
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="request">
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-1">Headers</h4>
                <ScrollArea className="h-[150px] rounded-md border p-2">
                  <CodeBlock 
                    code={JSON.stringify(testCase.headers || {}, null, 2)} 
                    language="json" 
                    showLineNumbers={true} 
                  />
                </ScrollArea>
              </div>
              
              {testCase.body && (
                <div>
                  <h4 className="text-sm font-medium mb-1">Body</h4>
                  <ScrollArea className="h-[200px] rounded-md border p-2">
                    <CodeBlock 
                      code={typeof testCase.body === 'string' 
                        ? testCase.body 
                        : JSON.stringify(testCase.body, null, 2)} 
                      language="json" 
                      showLineNumbers={true} 
                    />
                  </ScrollArea>
                </div>
              )}
            </div>
          </TabsContent>
          
          {error && (
            <TabsContent value="error">
              <div className="rounded-md bg-red-50 p-4 border border-red-200">
                <h4 className="text-sm font-medium text-red-800 mb-1">Error</h4>
                <p className="text-red-700">{error}</p>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ApiResponseVisualizer;

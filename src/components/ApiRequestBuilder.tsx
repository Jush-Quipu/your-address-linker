
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RefreshCw, Play, HelpCircle, PlusCircle, Save } from 'lucide-react';
import { toast } from 'sonner';
import { ApiTestCase } from '@/utils/apiTesting';

interface ApiRequestBuilderProps {
  initialRequest?: ApiTestCase;
  onSubmit: (request: ApiTestCase) => void;
  onSave?: (request: ApiTestCase) => void;
  loading?: boolean;
}

const ApiRequestBuilder: React.FC<ApiRequestBuilderProps> = ({
  initialRequest,
  onSubmit,
  onSave,
  loading = false
}) => {
  // Define the acceptable HTTP methods type
  type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  
  const [method, setMethod] = useState<HttpMethod>(initialRequest?.method as HttpMethod || 'GET');
  const [endpoint, setEndpoint] = useState(initialRequest?.endpoint || 'https://api.secureaddress.bridge/v1/');
  const [name, setName] = useState(initialRequest?.name || 'Custom Request');
  const [description, setDescription] = useState(initialRequest?.description || '');
  const [headersText, setHeadersText] = useState('');
  const [bodyText, setBodyText] = useState('');
  const [activeTab, setActiveTab] = useState('headers');
  const [endpointTemplates, setEndpointTemplates] = useState<{ name: string, endpoint: string }[]>([
    { name: 'Health Check', endpoint: 'https://akfieehzgpcapuhdujvf.supabase.co/functions/v1/health-check' },
    { name: 'Verify Address', endpoint: 'https://akfieehzgpcapuhdujvf.supabase.co/functions/v1/verify-address' },
    { name: 'Wallet Verify', endpoint: 'https://akfieehzgpcapuhdujvf.supabase.co/functions/v1/wallet-verify' },
  ]);

  // Initialize headers and body from the initialRequest
  useEffect(() => {
    if (initialRequest) {
      setMethod(initialRequest.method as HttpMethod || 'GET');
      setEndpoint(initialRequest.endpoint || '');
      setName(initialRequest.name || 'Custom Request');
      setDescription(initialRequest.description || '');
      
      if (initialRequest.headers) {
        setHeadersText(JSON.stringify(initialRequest.headers, null, 2));
      } else {
        setHeadersText('{\n  "Content-Type": "application/json",\n  "X-App-ID": "your-app-id"\n}');
      }
      
      if (initialRequest.body) {
        if (typeof initialRequest.body === 'string') {
          setBodyText(initialRequest.body);
        } else {
          setBodyText(JSON.stringify(initialRequest.body, null, 2));
        }
      } else {
        setBodyText('');
      }
    } else {
      // Default headers
      setHeadersText('{\n  "Content-Type": "application/json",\n  "X-App-ID": "your-app-id"\n}');
    }
  }, [initialRequest]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let parsedHeaders = {};
    let parsedBody = undefined;
    
    try {
      parsedHeaders = headersText ? JSON.parse(headersText) : {};
    } catch (error) {
      toast.error('Invalid JSON in headers');
      return;
    }
    
    if (bodyText && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      try {
        parsedBody = JSON.parse(bodyText);
      } catch {
        // If it's not valid JSON, use it as raw text
        parsedBody = bodyText;
      }
    }
    
    const request: ApiTestCase = {
      name,
      method: method,
      endpoint,
      headers: parsedHeaders,
      body: parsedBody,
      description
    };
    
    onSubmit(request);
  };

  const handleSave = () => {
    if (!onSave) return;
    
    let parsedHeaders = {};
    let parsedBody = undefined;
    
    try {
      parsedHeaders = headersText ? JSON.parse(headersText) : {};
    } catch (error) {
      toast.error('Invalid JSON in headers');
      return;
    }
    
    if (bodyText && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      try {
        parsedBody = JSON.parse(bodyText);
      } catch {
        parsedBody = bodyText;
      }
    }
    
    const request: ApiTestCase = {
      name,
      method: method,
      endpoint,
      headers: parsedHeaders,
      body: parsedBody,
      description
    };
    
    onSave(request);
    toast.success('Request saved to collection');
  };

  const formatHeadersJson = () => {
    try {
      const parsed = JSON.parse(headersText);
      setHeadersText(JSON.stringify(parsed, null, 2));
      toast.success('JSON formatted');
    } catch (error) {
      toast.error('Invalid JSON');
    }
  };

  const formatBodyJson = () => {
    try {
      const parsed = JSON.parse(bodyText);
      setBodyText(JSON.stringify(parsed, null, 2));
      toast.success('JSON formatted');
    } catch (error) {
      toast.error('Invalid JSON');
    }
  };

  const handleSelectEndpointTemplate = (endpoint: string) => {
    setEndpoint(endpoint);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Request Builder</CardTitle>
        <CardDescription>
          Configure your API request parameters
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="request-name">Request Name</Label>
              {onSave && (
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={handleSave}
                  className="h-7 px-2 text-xs flex items-center gap-1"
                >
                  <Save className="h-3 w-3" />
                  Save
                </Button>
              )}
            </div>
            <Input
              id="request-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name your request"
            />
          </div>
          
          <div className="grid grid-cols-5 gap-4">
            <div className="col-span-1">
              <Label htmlFor="method">Method</Label>
              <Select 
                value={method} 
                onValueChange={(value: HttpMethod) => setMethod(value)}
              >
                <SelectTrigger id="method">
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
            
            <div className="col-span-4">
              <div className="flex justify-between">
                <Label htmlFor="endpoint">Endpoint URL</Label>
                <Select onValueChange={handleSelectEndpointTemplate}>
                  <SelectTrigger className="w-[180px] h-7">
                    <SelectValue placeholder="Template endpoints" />
                  </SelectTrigger>
                  <SelectContent>
                    {endpointTemplates.map((template, index) => (
                      <SelectItem key={index} value={template.endpoint}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Input
                id="endpoint"
                value={endpoint}
                onChange={(e) => setEndpoint(e.target.value)}
                placeholder="https://api.example.com/endpoint"
              />
            </div>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="headers">Headers</TabsTrigger>
              <TabsTrigger value="body" disabled={method === 'GET' || method === 'DELETE'}>Body</TabsTrigger>
              <TabsTrigger value="description">Description</TabsTrigger>
            </TabsList>
            
            <TabsContent value="headers" className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="headers">Headers (JSON)</Label>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={formatHeadersJson}
                  className="h-7 px-2 text-xs"
                >
                  Format JSON
                </Button>
              </div>
              <Textarea
                id="headers"
                value={headersText}
                onChange={(e) => setHeadersText(e.target.value)}
                className="font-mono min-h-[200px]"
              />
            </TabsContent>
            
            <TabsContent value="body" className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="body">Request Body</Label>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={formatBodyJson}
                  className="h-7 px-2 text-xs"
                >
                  Format JSON
                </Button>
              </div>
              <Textarea
                id="body"
                value={bodyText}
                onChange={(e) => setBodyText(e.target.value)}
                className="font-mono min-h-[200px]"
                disabled={method === 'GET' || method === 'DELETE'}
              />
            </TabsContent>
            
            <TabsContent value="description">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what this request does..."
                className="min-h-[200px]"
              />
            </TabsContent>
          </Tabs>
        </form>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button 
          onClick={handleSubmit} 
          disabled={loading || !endpoint.trim()}
          className="flex items-center gap-2"
        >
          {loading ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              Running...
            </>
          ) : (
            <>
              <Play className="h-4 w-4" />
              Send Request
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ApiRequestBuilder;

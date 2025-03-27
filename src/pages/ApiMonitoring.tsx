
import React, { useState } from 'react';
import { 
  Tabs, TabsContent, TabsList, TabsTrigger 
} from '@/components/ui/tabs';
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle 
} from '@/components/ui/card';
import { 
  AlertCircle, AlertTriangle, Activity, BarChart, Bell, Settings, RefreshCw, ArrowRight 
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import DeveloperSidebar from '@/components/DeveloperSidebar';
import { toast } from 'sonner';

const ApiMonitoring: React.FC = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedEndpoint, setSelectedEndpoint] = useState('all');
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [slackNotifications, setSlackNotifications] = useState(false);

  // Mock data for the monitoring dashboard
  const apiMetrics = {
    requestsToday: 1247,
    errorRate: 1.8,
    avgResponseTime: 128,
    quota: {
      used: 42500,
      total: 100000
    }
  };

  const recentErrors = [
    { id: 1, endpoint: '/api/address/verify', status: 500, message: 'Internal Server Error', time: '2 minutes ago' },
    { id: 2, endpoint: '/api/blind-shipping/create', status: 400, message: 'Invalid address format', time: '15 minutes ago' },
    { id: 3, endpoint: '/api/address/lookup', status: 429, message: 'Rate limit exceeded', time: '1 hour ago' },
    { id: 4, endpoint: '/api/webhooks/deliver', status: 503, message: 'Service temporarily unavailable', time: '3 hours ago' }
  ];

  const endpointPerformance = [
    { endpoint: '/api/address/verify', requests: 523, avgTime: 145, errorRate: 2.1 },
    { endpoint: '/api/blind-shipping/create', requests: 217, avgTime: 198, errorRate: 1.5 },
    { endpoint: '/api/address/lookup', requests: 845, avgTime: 87, errorRate: 0.8 },
    { endpoint: '/api/webhooks/deliver', requests: 312, avgTime: 110, errorRate: 3.2 }
  ];

  const handleRefresh = () => {
    setIsRefreshing(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success('Monitoring data refreshed');
    }, 1500);
  };

  const handleAlertToggle = () => {
    setAlertsEnabled(!alertsEnabled);
    
    if (!alertsEnabled) {
      toast.success('Alerts enabled');
    } else {
      toast.info('Alerts disabled');
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <div className="hidden md:block w-64 p-4">
        <DeveloperSidebar />
      </div>
      
      <div className="flex-1 p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">API Monitoring</h1>
            <p className="text-muted-foreground">
              Monitor API performance, errors, and usage in real-time
            </p>
          </div>
          
          <Button onClick={handleRefresh} variant="outline" disabled={isRefreshing}>
            {isRefreshing ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
            Refresh
          </Button>
        </div>
        
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Requests Today</p>
                  <p className="text-2xl font-bold">{apiMetrics.requestsToday.toLocaleString()}</p>
                </div>
                <div className="rounded-full p-2 bg-primary/10">
                  <Activity className="h-4 w-4 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Error Rate</p>
                  <p className="text-2xl font-bold">{apiMetrics.errorRate}%</p>
                </div>
                <div className="rounded-full p-2 bg-destructive/10">
                  <AlertCircle className="h-4 w-4 text-destructive" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Avg Response Time</p>
                  <p className="text-2xl font-bold">{apiMetrics.avgResponseTime} ms</p>
                </div>
                <div className="rounded-full p-2 bg-primary/10">
                  <BarChart className="h-4 w-4 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Quota Usage</p>
                    <p className="text-2xl font-bold">{Math.round((apiMetrics.quota.used / apiMetrics.quota.total) * 100)}%</p>
                  </div>
                </div>
                <Progress value={(apiMetrics.quota.used / apiMetrics.quota.total) * 100} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {apiMetrics.quota.used.toLocaleString()} of {apiMetrics.quota.total.toLocaleString()} requests
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Main Tabs */}
        <Tabs defaultValue="errors">
          <TabsList className="mb-4">
            <TabsTrigger value="errors">Errors & Alerts</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="logs">API Logs</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          {/* Errors Tab */}
          <TabsContent value="errors">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Errors</CardTitle>
                    <CardDescription>
                      The latest API errors across all endpoints
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[400px]">
                      {recentErrors.map(error => (
                        <div key={error.id} className="mb-4 p-4 border rounded-lg">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="font-medium">{error.endpoint}</div>
                              <div className="text-sm text-muted-foreground">{error.time}</div>
                            </div>
                            <Badge variant={error.status >= 500 ? "destructive" : "outline"}>
                              {error.status}
                            </Badge>
                          </div>
                          <p className="mt-2 text-sm">{error.message}</p>
                        </div>
                      ))}
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
              
              <div>
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>Alert Settings</CardTitle>
                    <CardDescription>
                      Configure how you want to be notified
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="alerts-enabled">Enable Alerts</Label>
                      <Switch 
                        id="alerts-enabled"
                        checked={alertsEnabled}
                        onCheckedChange={handleAlertToggle}
                      />
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <Label>Notification Channels</Label>
                      <div className="flex items-center justify-between">
                        <div className="text-sm">Email Notifications</div>
                        <Switch 
                          checked={emailNotifications}
                          onCheckedChange={setEmailNotifications}
                          disabled={!alertsEnabled}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-sm">Slack Notifications</div>
                        <Switch 
                          checked={slackNotifications}
                          onCheckedChange={setSlackNotifications}
                          disabled={!alertsEnabled}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Active Alerts</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Alert variant="destructive" className="mb-3">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Error Rate Spike</AlertTitle>
                      <AlertDescription>
                        Error rate for '/api/webhooks/deliver' is above 3%
                      </AlertDescription>
                      <Button variant="link" size="sm" className="mt-2 h-auto p-0">
                        View Details <ArrowRight className="h-3 w-3 ml-1" />
                      </Button>
                    </Alert>
                    
                    <Alert variant="warning">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Slow Response Time</AlertTitle>
                      <AlertDescription>
                        Average response time for '/api/blind-shipping/create' is above 150ms
                      </AlertDescription>
                      <Button variant="link" size="sm" className="mt-2 h-auto p-0">
                        View Details <ArrowRight className="h-3 w-3 ml-1" />
                      </Button>
                    </Alert>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          {/* Performance Tab */}
          <TabsContent value="performance">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Endpoint Performance</CardTitle>
                  <CardDescription>
                    Response times and error rates by endpoint
                  </CardDescription>
                </div>
                <Select value={selectedEndpoint} onValueChange={setSelectedEndpoint}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select endpoint" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Endpoints</SelectItem>
                    <SelectItem value="/api/address/verify">/api/address/verify</SelectItem>
                    <SelectItem value="/api/blind-shipping/create">/api/blind-shipping/create</SelectItem>
                    <SelectItem value="/api/address/lookup">/api/address/lookup</SelectItem>
                    <SelectItem value="/api/webhooks/deliver">/api/webhooks/deliver</SelectItem>
                  </SelectContent>
                </Select>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {endpointPerformance
                    .filter(ep => selectedEndpoint === 'all' || ep.endpoint === selectedEndpoint)
                    .map(ep => (
                      <div key={ep.endpoint} className="space-y-2">
                        <div className="flex justify-between">
                          <div>
                            <div className="font-medium">{ep.endpoint}</div>
                            <div className="text-sm text-muted-foreground">{ep.requests.toLocaleString()} requests</div>
                          </div>
                          <div className="text-right">
                            <Badge variant={ep.errorRate > 2 ? "destructive" : ep.errorRate > 1 ? "warning" : "outline"}>
                              {ep.errorRate}% errors
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>Response Time</span>
                            <span className="font-medium">{ep.avgTime} ms</span>
                          </div>
                          <Progress 
                            value={(ep.avgTime / 200) * 100} 
                            className={`h-2 ${ep.avgTime > 150 ? 'bg-amber-500' : 'bg-green-500'}`}
                          />
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Logs Tab */}
          <TabsContent value="logs">
            <Card>
              <CardHeader>
                <CardTitle>API Request Logs</CardTitle>
                <CardDescription>
                  Recent API requests across all endpoints
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px] w-full">
                  <div className="space-y-4">
                    {Array.from({ length: 20 }).map((_, i) => (
                      <div key={i} className="text-sm border-b pb-2">
                        <div className="flex justify-between mb-1">
                          <span className="font-medium">
                            {[
                              '/api/address/verify', 
                              '/api/blind-shipping/create',
                              '/api/address/lookup',
                              '/api/webhooks/deliver'
                            ][Math.floor(Math.random() * 4)]}
                          </span>
                          <Badge variant="outline">
                            {['GET', 'POST', 'PUT', 'DELETE'][Math.floor(Math.random() * 4)]}
                          </Badge>
                        </div>
                        <div className="flex justify-between text-muted-foreground">
                          <span>client_id: {Math.random().toString(36).substring(2, 10)}</span>
                          <span>{Math.floor(Math.random() * 200) + 50} ms</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            {new Date(Date.now() - Math.floor(Math.random() * 3600000)).toLocaleTimeString()}
                          </span>
                          <Badge variant={Math.random() > 0.1 ? 'success' : 'destructive'}>
                            {Math.random() > 0.1 ? 200 : [400, 403, 404, 500, 503][Math.floor(Math.random() * 5)]}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Settings Tab */}
          <TabsContent value="settings">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Monitoring Settings</CardTitle>
                  <CardDescription>
                    Configure your API monitoring preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="refresh-interval">Auto-refresh Interval</Label>
                    <Select defaultValue="5">
                      <SelectTrigger id="refresh-interval">
                        <SelectValue placeholder="Select interval" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 minute</SelectItem>
                        <SelectItem value="5">5 minutes</SelectItem>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="data-retention">Data Retention Period</Label>
                    <Select defaultValue="30">
                      <SelectTrigger id="data-retention">
                        <SelectValue placeholder="Select period" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7">7 days</SelectItem>
                        <SelectItem value="14">14 days</SelectItem>
                        <SelectItem value="30">30 days</SelectItem>
                        <SelectItem value="90">90 days</SelectItem>
                        <SelectItem value="180">180 days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center justify-between pt-2">
                    <Label htmlFor="detailed-logs">Enable Detailed Logs</Label>
                    <Switch id="detailed-logs" defaultChecked={true} />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="sample-rate">Enable Request Sampling</Label>
                    <Switch id="sample-rate" defaultChecked={false} />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Alert Thresholds</CardTitle>
                  <CardDescription>
                    Set thresholds for when alerts should be triggered
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="error-rate">Error Rate Threshold (%)</Label>
                    <Select defaultValue="2">
                      <SelectTrigger id="error-rate">
                        <SelectValue placeholder="Select threshold" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1%</SelectItem>
                        <SelectItem value="2">2%</SelectItem>
                        <SelectItem value="5">5%</SelectItem>
                        <SelectItem value="10">10%</SelectItem>
                        <SelectItem value="20">20%</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="response-time">Slow Response Time (ms)</Label>
                    <Select defaultValue="200">
                      <SelectTrigger id="response-time">
                        <SelectValue placeholder="Select threshold" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="100">100 ms</SelectItem>
                        <SelectItem value="200">200 ms</SelectItem>
                        <SelectItem value="500">500 ms</SelectItem>
                        <SelectItem value="1000">1000 ms</SelectItem>
                        <SelectItem value="2000">2000 ms</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="quota-alert">Quota Usage Alert (%)</Label>
                    <Select defaultValue="80">
                      <SelectTrigger id="quota-alert">
                        <SelectValue placeholder="Select threshold" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="50">50%</SelectItem>
                        <SelectItem value="70">70%</SelectItem>
                        <SelectItem value="80">80%</SelectItem>
                        <SelectItem value="90">90%</SelectItem>
                        <SelectItem value="95">95%</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Button className="w-full mt-4">
                    <Settings className="h-4 w-4 mr-2" />
                    Save Settings
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ApiMonitoring;

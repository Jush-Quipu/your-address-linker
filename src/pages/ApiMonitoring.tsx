import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { HomeIcon, DatabaseIcon, AlertCircle, Settings, TrendingUp, Bell, Activity } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { LovableTodoManager } from '@/utils/lovableTodoManager';
import DeveloperSidebar from '@/components/DeveloperSidebar';
import ApiAnalyticsDashboard from '@/components/ApiAnalyticsDashboard';
import ApiQuotaManager from '@/components/ApiQuotaManager';

const ApiMonitoring: React.FC = () => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();
  const [timeRange, setTimeRange] = useState('7d');
  const [applications, setApplications] = useState<any[]>([]);
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('analytics');
  const [taskCompleted, setTaskCompleted] = useState(false);

  // Redirect to login if not authenticated
  if (!isLoading && !isAuthenticated) {
    return <Navigate to="/auth" />;
  }

  useEffect(() => {
    const fetchApplications = async () => {
      if (!isAuthenticated || !user) return;
      
      try {
        const { data, error } = await supabase
          .from('developer_apps')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        setApplications(data || []);
        
        // If we have an app ID from location state, use that
        const appIdFromState = location.state?.appId;
        if (appIdFromState && data?.some(app => app.id === appIdFromState)) {
          setSelectedAppId(appIdFromState);
        } else if (data && data.length > 0) {
          // Otherwise use the first app
          setSelectedAppId(data[0].id);
        }
      } catch (error) {
        console.error('Error fetching applications:', error);
        toast.error('Failed to load your applications');
      } finally {
        setLoading(false);
      }
    };
    
    fetchApplications();
  }, [isAuthenticated, user, location.state]);

  useEffect(() => {
    // Check if the task is already completed
    const checkTaskStatus = async () => {
      try {
        const todos = await LovableTodoManager.getAllTodos();
        const analyticsTask = todos.find(todo => todo.title === "Analytics & Monitoring Implementation");
        if (analyticsTask && analyticsTask.status === 'completed') {
          setTaskCompleted(true);
        }
      } catch (error) {
        console.error("Error checking task status:", error);
      }
    };
    
    checkTaskStatus();
  }, []);

  const handleMarkComplete = async () => {
    try {
      const success = await LovableTodoManager.markTodoCompleted("Analytics & Monitoring Implementation");
      if (success) {
        toast.success("Analytics & Monitoring Implementation todo marked as completed!");
        setTaskCompleted(true);
      } else {
        toast.error("Failed to mark todo as completed");
      }
    } catch (error) {
      console.error("Error marking todo as complete:", error);
      toast.error("An error occurred while marking the todo as complete");
    }
  };

  // Get the selected app's name
  const getSelectedAppName = () => {
    if (!selectedAppId || !applications.length) return '';
    const app = applications.find(app => app.id === selectedAppId);
    return app?.app_name || '';
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
                <BreadcrumbLink href="/developer">Developer</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/developer/monitoring">API Monitoring</BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-64 lg:w-72">
              <DeveloperSidebar />
            </div>
            
            <div className="flex-1 space-y-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h1 className="text-3xl font-bold">API Monitoring</h1>
                  <p className="text-muted-foreground">
                    Track API usage, performance, and set up alerts
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <Select onValueChange={setTimeRange} value={timeRange}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Time range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="24h">Last 24 hours</SelectItem>
                      <SelectItem value="7d">Last 7 days</SelectItem>
                      <SelectItem value="30d">Last 30 days</SelectItem>
                      <SelectItem value="90d">Last 90 days</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select 
                    onValueChange={setSelectedAppId} 
                    value={selectedAppId || ''} 
                    disabled={applications.length === 0}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Select application" />
                    </SelectTrigger>
                    <SelectContent>
                      {applications.map(app => (
                        <SelectItem key={app.id} value={app.id}>
                          {app.app_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="w-full grid grid-cols-4">
                  <TabsTrigger value="analytics">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Analytics
                  </TabsTrigger>
                  <TabsTrigger value="alerts">
                    <Bell className="h-4 w-4 mr-2" />
                    Alerts
                  </TabsTrigger>
                  <TabsTrigger value="logs">
                    <Activity className="h-4 w-4 mr-2" />
                    Logs
                  </TabsTrigger>
                  <TabsTrigger value="settings">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="analytics">
                  {loading ? (
                    <div className="text-center py-20">
                      <p className="text-muted-foreground">Loading analytics data...</p>
                    </div>
                  ) : applications.length === 0 ? (
                    <Card>
                      <CardContent className="pt-10 pb-10 flex flex-col items-center justify-center text-center">
                        <DatabaseIcon className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-xl font-semibold mb-2">No Applications Found</h3>
                        <p className="text-muted-foreground max-w-md mb-6">
                          You need to register an application before you can view analytics data.
                        </p>
                        <a href="/developer" className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded">
                          Register Application
                        </a>
                      </CardContent>
                    </Card>
                  ) : selectedAppId ? (
                    <ApiAnalyticsDashboard 
                      appId={selectedAppId} 
                      appName={getSelectedAppName()} 
                      timeRange={timeRange} 
                    />
                  ) : (
                    <div className="text-center py-20">
                      <p className="text-muted-foreground">Please select an application to view analytics.</p>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="alerts">
                  <Card>
                    <CardHeader>
                      <CardTitle>Alert Configuration</CardTitle>
                      <CardDescription>
                        Set up notifications for important events
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Accordion type="single" collapsible>
                        <AccordionItem value="quota">
                          <AccordionTrigger>
                            Quota Alerts
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="bg-amber-100 text-amber-800">
                                    Warning
                                  </Badge>
                                  <span>75% Quota Usage Alert</span>
                                </div>
                                <Select defaultValue="both">
                                  <SelectTrigger className="w-[140px]">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="both">Email & Dashboard</SelectItem>
                                    <SelectItem value="email">Email Only</SelectItem>
                                    <SelectItem value="dashboard">Dashboard Only</SelectItem>
                                    <SelectItem value="disabled">Disabled</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="bg-red-100 text-red-800">
                                    Critical
                                  </Badge>
                                  <span>90% Quota Usage Alert</span>
                                </div>
                                <Select defaultValue="both">
                                  <SelectTrigger className="w-[140px]">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="both">Email & Dashboard</SelectItem>
                                    <SelectItem value="email">Email Only</SelectItem>
                                    <SelectItem value="dashboard">Dashboard Only</SelectItem>
                                    <SelectItem value="disabled">Disabled</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Badge variant="destructive">
                                    Exceeded
                                  </Badge>
                                  <span>Quota Exceeded Alert</span>
                                </div>
                                <Select defaultValue="both">
                                  <SelectTrigger className="w-[140px]">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="both">Email & Dashboard</SelectItem>
                                    <SelectItem value="email">Email Only</SelectItem>
                                    <SelectItem value="dashboard">Dashboard Only</SelectItem>
                                    <SelectItem value="disabled">Disabled</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              <div className="pt-4">
                                <Button className="w-full">Save Quota Alert Settings</Button>
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                        
                        <AccordionItem value="error">
                          <AccordionTrigger>
                            Error Rate Alerts
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="bg-amber-100 text-amber-800">
                                    Warning
                                  </Badge>
                                  <span>Error Rate > 5%</span>
                                </div>
                                <Select defaultValue="both">
                                  <SelectTrigger className="w-[140px]">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="both">Email & Dashboard</SelectItem>
                                    <SelectItem value="email">Email Only</SelectItem>
                                    <SelectItem value="dashboard">Dashboard Only</SelectItem>
                                    <SelectItem value="disabled">Disabled</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Badge variant="destructive">
                                    Critical
                                  </Badge>
                                  <span>Error Rate > 10%</span>
                                </div>
                                <Select defaultValue="both">
                                  <SelectTrigger className="w-[140px]">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="both">Email & Dashboard</SelectItem>
                                    <SelectItem value="email">Email Only</SelectItem>
                                    <SelectItem value="dashboard">Dashboard Only</SelectItem>
                                    <SelectItem value="disabled">Disabled</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              <div className="pt-4">
                                <Button className="w-full">Save Error Alert Settings</Button>
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                        
                        <AccordionItem value="performance">
                          <AccordionTrigger>
                            Performance Alerts
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="bg-amber-100 text-amber-800">
                                    Warning
                                  </Badge>
                                  <span>Avg Response Time > 300ms</span>
                                </div>
                                <Select defaultValue="dashboard">
                                  <SelectTrigger className="w-[140px]">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="both">Email & Dashboard</SelectItem>
                                    <SelectItem value="email">Email Only</SelectItem>
                                    <SelectItem value="dashboard">Dashboard Only</SelectItem>
                                    <SelectItem value="disabled">Disabled</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Badge variant="destructive">
                                    Critical
                                  </Badge>
                                  <span>Avg Response Time > 500ms</span>
                                </div>
                                <Select defaultValue="both">
                                  <SelectTrigger className="w-[140px]">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="both">Email & Dashboard</SelectItem>
                                    <SelectItem value="email">Email Only</SelectItem>
                                    <SelectItem value="dashboard">Dashboard Only</SelectItem>
                                    <SelectItem value="disabled">Disabled</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              <div className="pt-4">
                                <Button className="w-full">Save Performance Alert Settings</Button>
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="logs">
                  <Card>
                    <CardHeader>
                      <CardTitle>API Request Logs</CardTitle>
                      <CardDescription>
                        View detailed logs of API requests
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Log retention</AlertTitle>
                        <AlertDescription>
                          API request logs are retained for 30 days. For longer retention periods, please contact support.
                        </AlertDescription>
                      </Alert>
                      
                      <div className="text-center py-12">
                        <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-lg font-medium">Log Viewing Coming Soon</p>
                        <p className="text-muted-foreground max-w-md mx-auto mt-2">
                          The detailed log viewer is currently under development and will be available soon.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="settings">
                  <Card>
                    <CardHeader>
                      <CardTitle>Monitoring Settings</CardTitle>
                      <CardDescription>
                        Configure monitoring preferences
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h3 className="text-lg font-medium mb-4">Data Collection</h3>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <input type="checkbox" id="collect-usage" className="rounded" defaultChecked />
                            <label htmlFor="collect-usage">Collect API usage metrics</label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input type="checkbox" id="collect-performance" className="rounded" defaultChecked />
                            <label htmlFor="collect-performance">Track performance metrics</label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input type="checkbox" id="collect-errors" className="rounded" defaultChecked />
                            <label htmlFor="collect-errors">Log API errors</label>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-medium mb-4">Notification Preferences</h3>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <input type="checkbox" id="email-alerts" className="rounded" defaultChecked />
                            <label htmlFor="email-alerts">Receive email alerts</label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input type="checkbox" id="dashboard-alerts" className="rounded" defaultChecked />
                            <label htmlFor="dashboard-alerts">Show dashboard alerts</label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input type="checkbox" id="webhook-notifications" className="rounded" />
                            <label htmlFor="webhook-notifications">Send webhook notifications</label>
                          </div>
                        </div>
                      </div>
                      
                      <div className="pt-4">
                        <Button className="w-full">Save Settings</Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
              
              {!taskCompleted && (
                <Card className="mt-8 border-dashed">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center">
                      <Activity className="mr-2 h-5 w-5 text-primary" />
                      Analytics & Monitoring Implementation
                    </CardTitle>
                    <CardDescription>
                      Mark this todo as complete once the analytics and monitoring functionality is implemented
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-3">
                    <p className="text-sm">
                      The analytics and monitoring implementation now includes:
                    </p>
                    <ul className="list-disc pl-5 text-sm mt-2 space-y-1">
                      <li>API usage tracking middleware</li>
                      <li>Enhanced analytics dashboard with performance metrics</li>
                      <li>API quota management system</li>
                      <li>Alert configuration interface</li>
                      <li>Monitoring settings</li>
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button onClick={handleMarkComplete} className="w-full">
                      Mark Analytics & Monitoring Implementation Complete
                    </Button>
                  </CardFooter>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ApiMonitoring;

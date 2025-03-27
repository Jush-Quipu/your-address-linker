import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { HomeIcon, Code, Settings, Compass, ServerIcon, Bell, Database, Book, Beaker, History, BarChart } from 'lucide-react';
import { toast } from 'sonner';
import WebhookManager from '@/components/WebhookManager';
import WebhookManagerTabs from '@/components/WebhookManagerTabs';
import { getDeveloperApps, checkDeveloperAccess } from '@/services/developerService';

const DeveloperDashboard = () => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasDeveloperAccess, setHasDeveloperAccess] = useState(false);

  useEffect(() => {
    const checkAccess = async () => {
      if (!isAuthenticated || !user) return;
      
      try {
        const hasAccess = await checkDeveloperAccess(user.id);
        setHasDeveloperAccess(hasAccess);
        
        if (hasAccess) {
          const apps = await getDeveloperApps();
          setApplications(apps);
        }
      } catch (error) {
        console.error('Error fetching developer data:', error);
        toast.error('Failed to load developer data');
      } finally {
        setLoading(false);
      }
    };
    
    checkAccess();
  }, [isAuthenticated, user]);

  if (!isLoading && !isAuthenticated) {
    return <Navigate to="/auth" />;
  }

  if (!isLoading && !hasDeveloperAccess && isAuthenticated) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="pt-32 pb-20 px-6 md:px-12">
          <div className="max-w-7xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4">Developer Access Required</h2>
            <p className="mb-6 text-muted-foreground">
              You need developer access to view this page.
            </p>
            <Button onClick={() => navigate('/dashboard')}>
              Return to Dashboard
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const handleNavigateToRegister = () => {
    navigate('/developer/portal');
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
                <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/developer">Developer</BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold flex items-center">
                <Code className="mr-2 h-5 w-5 text-primary" />
                Developer Dashboard
              </h2>
              <p className="text-muted-foreground">
                Manage your applications, API keys, and developer resources
              </p>
            </div>
            <div className="flex space-x-2">
              <Badge variant="outline" className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                Developer
              </Badge>
              <Button onClick={handleNavigateToRegister}>
                Register Application
              </Button>
            </div>
          </div>
          
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-3 mb-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="apps">Applications</TabsTrigger>
              <TabsTrigger value="resources">Resources</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center">
                      <ServerIcon className="h-5 w-5 mr-2 text-primary" />
                      Applications
                    </CardTitle>
                    <CardDescription>Create and manage OAuth applications</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p className="text-sm text-muted-foreground">
                      {applications.length > 0 
                        ? `You have ${applications.length} registered application(s)` 
                        : "Register your first application"
                      }
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full" onClick={() => navigate('/developer/portal')}>
                      {applications.length > 0 ? "Manage Applications" : "Register Application"}
                    </Button>
                  </CardFooter>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center">
                      <Bell className="h-5 w-5 mr-2 text-primary" />
                      Webhooks
                    </CardTitle>
                    <CardDescription>Receive real-time event notifications</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p className="text-sm text-muted-foreground">
                      Configure webhooks to be notified when events happen
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => setActiveTab('apps')}
                      disabled={applications.length === 0}
                    >
                      {applications.length === 0 ? "Register App First" : "Manage Webhooks"}
                    </Button>
                  </CardFooter>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center">
                      <Database className="h-5 w-5 mr-2 text-primary" />
                      API Keys
                    </CardTitle>
                    <CardDescription>Manage API authentication</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p className="text-sm text-muted-foreground">
                      Create and manage API keys for your applications
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full" onClick={() => navigate('/dashboard/api-keys')}>
                      Manage API Keys
                    </Button>
                  </CardFooter>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center">
                      <Book className="h-5 w-5 mr-2 text-primary" />
                      Documentation
                    </CardTitle>
                    <CardDescription>API reference and guides</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p className="text-sm text-muted-foreground">
                      Explore our REST API documentation, SDKs, and guides
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full" onClick={() => navigate('/developer/docs')}>
                      View Documentation
                    </Button>
                  </CardFooter>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center">
                      <Beaker className="h-5 w-5 mr-2 text-primary" />
                      API Testing
                    </CardTitle>
                    <CardDescription>Test API endpoints</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p className="text-sm text-muted-foreground">
                      Interactive environment to test API calls
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full" onClick={() => navigate('/api-testing')}>
                      Open API Tester
                    </Button>
                  </CardFooter>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center">
                      <BarChart className="h-5 w-5 mr-2 text-primary" />
                      Usage Analytics
                    </CardTitle>
                    <CardDescription>API usage and performance</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p className="text-sm text-muted-foreground">
                      Monitor API usage, quotas, and performance metrics
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full" onClick={() => navigate('/developer/analytics')}>
                      View Analytics
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="apps">
              <Card>
                <CardHeader>
                  <CardTitle>Your Applications</CardTitle>
                  <CardDescription>
                    Manage your registered OAuth applications and webhooks
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center py-8">Loading your applications...</div>
                  ) : applications.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground mb-4">You haven't registered any applications yet.</p>
                      <Button onClick={handleNavigateToRegister}>Register Your First App</Button>
                    </div>
                  ) : (
                    <Tabs defaultValue={applications[0]?.id} className="w-full">
                      <TabsList className="mb-4 flex flex-wrap">
                        {applications.map(app => (
                          <TabsTrigger key={app.id} value={app.id}>
                            {app.app_name}
                          </TabsTrigger>
                        ))}
                      </TabsList>
                      
                      {applications.map(app => (
                        <TabsContent key={app.id} value={app.id}>
                          <div className="mb-8">
                            <Card>
                              <CardHeader>
                                <CardTitle>App Details</CardTitle>
                                <CardDescription>
                                  {app.description || 'No description provided'}
                                </CardDescription>
                              </CardHeader>
                              <CardContent>
                                <div className="grid gap-4">
                                  <div>
                                    <h3 className="font-medium text-sm mb-1">App ID</h3>
                                    <p className="font-mono text-sm bg-muted p-2 rounded">{app.id}</p>
                                  </div>
                                  {app.website_url && (
                                    <div>
                                      <h3 className="font-medium text-sm mb-1">Website URL</h3>
                                      <p className="text-sm">{app.website_url}</p>
                                    </div>
                                  )}
                                  <div>
                                    <h3 className="font-medium text-sm mb-1">Callback URLs</h3>
                                    <ul className="list-disc pl-5 text-sm space-y-1">
                                      {app.callback_urls?.map((url, i) => (
                                        <li key={i}>{url}</li>
                                      ))}
                                    </ul>
                                  </div>
                                </div>
                              </CardContent>
                              <CardFooter className="flex justify-between">
                                <Button 
                                  variant="outline"
                                  onClick={() => navigate('/developer/portal', { state: { appId: app.id }})}
                                >
                                  Edit App
                                </Button>
                                <Button 
                                  variant="outline"
                                  onClick={() => navigate('/developer/analytics', { state: { appId: app.id }})}
                                >
                                  View Analytics
                                </Button>
                              </CardFooter>
                            </Card>
                          </div>
                          
                          <div>
                            <h3 className="text-xl font-semibold mb-4">Webhooks</h3>
                            <WebhookManagerTabs appId={app.id} appName={app.app_name} />
                          </div>
                        </TabsContent>
                      ))}
                    </Tabs>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="resources">
              <Card>
                <CardHeader>
                  <CardTitle>Developer Resources</CardTitle>
                  <CardDescription>
                    Documentation, tools, and resources for developers
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">API Documentation</CardTitle>
                        <CardDescription>REST API reference</CardDescription>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <p className="text-sm text-muted-foreground">
                          Detailed documentation for our API endpoints, request formats, and error handling
                        </p>
                      </CardContent>
                      <CardFooter>
                        <Button className="w-full" onClick={() => navigate('/developer/docs?tab=api')}>
                          View API Docs
                        </Button>
                      </CardFooter>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">SDK Libraries</CardTitle>
                        <CardDescription>Client libraries</CardDescription>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <p className="text-sm text-muted-foreground">
                          Client libraries for JavaScript, Python, and other languages
                        </p>
                      </CardContent>
                      <CardFooter>
                        <Button className="w-full" onClick={() => navigate('/developer/docs?tab=sdk')}>
                          View SDKs
                        </Button>
                      </CardFooter>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Tutorials</CardTitle>
                        <CardDescription>Learn by example</CardDescription>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <p className="text-sm text-muted-foreground">
                          Step-by-step guides and code examples for common integration scenarios
                        </p>
                      </CardContent>
                      <CardFooter>
                        <Button className="w-full" onClick={() => navigate('/tutorials')}>
                          View Tutorials
                        </Button>
                      </CardFooter>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">API Testing</CardTitle>
                        <CardDescription>Test endpoints</CardDescription>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <p className="text-sm text-muted-foreground">
                          Interactive environment to test API calls
                        </p>
                      </CardContent>
                      <CardFooter>
                        <Button className="w-full" onClick={() => navigate('/api-testing')}>
                          Open API Tester
                        </Button>
                      </CardFooter>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Sandbox</CardTitle>
                        <CardDescription>Test integration</CardDescription>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <p className="text-sm text-muted-foreground">
                          Test your integration in a sandbox environment
                        </p>
                      </CardContent>
                      <CardFooter>
                        <Button className="w-full" onClick={() => navigate('/developer/sandbox')}>
                          Open Sandbox
                        </Button>
                      </CardFooter>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Community</CardTitle>
                        <CardDescription>Get help</CardDescription>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <p className="text-sm text-muted-foreground">
                          Join our developer community for support and collaboration
                        </p>
                      </CardContent>
                      <CardFooter>
                        <Button className="w-full" asChild>
                          <a href="https://github.com/SecureAddressBridge/community" target="_blank" rel="noopener noreferrer">
                            Visit Community
                          </a>
                        </Button>
                      </CardFooter>
                    </Card>
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

export default DeveloperDashboard;

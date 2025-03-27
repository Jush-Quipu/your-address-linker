
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import WebhookManager from '@/components/WebhookManager';
import { Code, Settings, Compass, ServerIcon, Bell, Database, Book, Beaker, History } from 'lucide-react';

interface DeveloperApplication {
  id: string;
  app_name: string;
  description: string | null;
  website_url: string | null;
  callback_urls: string[];
  created_at: string;
}

const DeveloperDashboard: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [applications, setApplications] = useState<DeveloperApplication[]>([]);
  const [loading, setLoading] = useState(true);

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
        
        setApplications(data as DeveloperApplication[] || []);
      } catch (error) {
        console.error('Error fetching applications:', error);
        toast.error('Failed to load your applications');
      } finally {
        setLoading(false);
      }
    };
    
    fetchApplications();
  }, [isAuthenticated, user]);

  const handleNavigateToPortal = () => {
    navigate('/developer');
  };

  const handleNavigateToRegister = () => {
    navigate('/developer');
    // We'll add a small delay to allow navigation to complete, then set the active tab
    setTimeout(() => {
      const tabsElement = document.querySelector('[data-state="apps"]');
      if (tabsElement) {
        (tabsElement as HTMLElement).click();
      }
    }, 100);
  };

  const handleNavigateToApiDocs = () => {
    navigate('/docs');
  };

  const handleNavigateToApiTesting = () => {
    navigate('/api-testing');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center">
            <Code className="mr-2 h-5 w-5 text-primary" />
            Developer Dashboard
          </h2>
          <p className="text-muted-foreground">
            Manage your applications, API keys, and developer resources
          </p>
        </div>
        <Button onClick={handleNavigateToPortal}>
          Open Developer Portal
        </Button>
      </div>
      
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="apps">Applications</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
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
                <Button variant="outline" className="w-full" onClick={handleNavigateToRegister}>
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
                  onClick={() => setActiveTab('webhooks')}
                >
                  Manage Webhooks
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
                <Button variant="outline" className="w-full" onClick={handleNavigateToApiDocs}>
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
                <Button variant="outline" className="w-full" onClick={handleNavigateToApiTesting}>
                  Open API Tester
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <History className="h-5 w-5 mr-2 text-primary" />
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
                Manage your registered OAuth applications
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
                <div className="space-y-4">
                  {applications.map(app => (
                    <div key={app.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{app.app_name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {app.description || 'No description provided'}
                          </p>
                        </div>
                        <Badge>Active</Badge>
                      </div>
                      <div className="mt-4 flex">
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                          className="mr-2"
                        >
                          <Link to={`/developer?app=${app.id}`}>Manage</Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                        >
                          View Keys
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button onClick={handleNavigateToPortal}>Go to Developer Portal</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="webhooks">
          <Card>
            <CardHeader>
              <CardTitle>Webhook Management</CardTitle>
              <CardDescription>
                Configure webhooks to receive real-time notifications about events
              </CardDescription>
            </CardHeader>
            <CardContent>
              {applications.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    You need to register an application before you can configure webhooks.
                  </p>
                  <Button onClick={handleNavigateToRegister}>Register Application</Button>
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
                      <WebhookManager appId={app.id} appName={app.app_name} />
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
                    <Button className="w-full" onClick={() => navigate('/docs?tab=api')}>
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
                    <Button className="w-full" onClick={() => navigate('/docs?tab=sdk')}>
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
                    <Button className="w-full" onClick={handleNavigateToApiTesting}>
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
  );
};

export default DeveloperDashboard;


import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/context/AuthContext';
import { useRole } from '@/context/RoleContext';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import DeveloperAppDetails from '@/components/DeveloperAppDetails';
import { 
  Code, Beaker, HomeIcon, Plus, Settings, BarChart, List, Search, 
  AlertTriangle, Check, ShieldCheck, Info, RefreshCw, Key, Lock
} from 'lucide-react';
import { AppStatus, AppVerificationStatus, DeveloperApp, createDeveloperApp, parseOAuthSettings } from '@/services/developerService';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue
} from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const DeveloperPortalManager = () => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { isDeveloper, isAdmin } = useRole();
  const navigate = useNavigate();
  const { appId } = useParams();
  const [activeTab, setActiveTab] = useState('apps');
  const [applications, setApplications] = useState<DeveloperApp[]>([]);
  const [selectedApp, setSelectedApp] = useState<DeveloperApp | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showRegisterDialog, setShowRegisterDialog] = useState(false);
  const [registrationFilter, setRegistrationFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const [formData, setFormData] = useState({
    appName: '',
    description: '',
    websiteUrl: '',
    callbackUrls: ''
  });
  const [submitting, setSubmitting] = useState(false);

  if (!isLoading && !isAuthenticated) {
    return <Navigate to="/auth" />;
  }

  if (!isLoading && isAuthenticated && !isDeveloper) {
    return <Navigate to="/dashboard" />;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      appName: '',
      description: '',
      websiteUrl: '',
      callbackUrls: ''
    });
  };

  useEffect(() => {
    const fetchApplications = async () => {
      if (!isAuthenticated || !user) return;
      
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('developer_apps')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        const typedApps: DeveloperApp[] = data.map(app => ({
          ...app,
          status: app.status as AppStatus || AppStatus.DEVELOPMENT,
          verification_status: app.verification_status as AppVerificationStatus || AppVerificationStatus.PENDING,
          oauth_settings: parseOAuthSettings(app.oauth_settings)
        }));
        
        setApplications(typedApps);
        
        if (appId) {
          const app = typedApps.find(a => a.id === appId);
          if (app) {
            setSelectedApp(app);
            setActiveTab('app-details');
          }
        }
      } catch (error) {
        console.error('Error fetching applications:', error);
        toast.error('Failed to load your applications');
      } finally {
        setLoading(false);
      }
    };
    
    fetchApplications();
  }, [isAuthenticated, user, appId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated || !user) {
      toast.error('Please sign in first');
      return;
    }
    
    if (!formData.appName) {
      toast.error('App name is required');
      return;
    }
    
    if (!formData.callbackUrls) {
      toast.error('At least one callback URL is required');
      return;
    }
    
    const callbackUrls = formData.callbackUrls
      .split('\n')
      .map(url => url.trim())
      .filter(url => url);
    
    if (callbackUrls.length === 0) {
      toast.error('At least one valid callback URL is required');
      return;
    }
    
    const urlRegex = /^https?:\/\//i;
    const invalidUrls = callbackUrls.filter(url => !urlRegex.test(url));
    
    if (invalidUrls.length > 0) {
      toast.error(`Invalid URL format: ${invalidUrls[0]}`, {
        description: 'URLs must start with http:// or https://'
      });
      return;
    }
    
    setSubmitting(true);
    
    try {
      const newApp = await createDeveloperApp({
        appName: formData.appName,
        description: formData.description,
        websiteUrl: formData.websiteUrl,
        callbackUrls,
        status: AppStatus.DEVELOPMENT
      });
      
      setApplications(prev => [newApp as DeveloperApp, ...prev]);
      
      setSelectedApp(newApp as DeveloperApp);
      setActiveTab('app-details');
      
      setShowRegisterDialog(false);
      resetForm();
      
      toast.success('Application registered successfully', {
        description: 'Your app credentials have been generated'
      });
    } catch (error) {
      console.error('Error registering application:', error);
      toast.error('Failed to register application', {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredApps = applications.filter(app => {
    const matchesSearch = 
      app.app_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (app.description && app.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesVerification = 
      registrationFilter === 'all' || 
      (registrationFilter === 'verified' && app.verification_status === AppVerificationStatus.VERIFIED) ||
      (registrationFilter === 'pending' && app.verification_status === AppVerificationStatus.PENDING) ||
      (registrationFilter === 'rejected' && app.verification_status === AppVerificationStatus.REJECTED);
    
    const matchesStatus = 
      statusFilter === 'all' || 
      (statusFilter === 'active' && app.status === AppStatus.ACTIVE) ||
      (statusFilter === 'development' && app.status === AppStatus.DEVELOPMENT) ||
      (statusFilter === 'suspended' && app.status === AppStatus.SUSPENDED);
    
    return matchesSearch && matchesVerification && matchesStatus;
  });

  const getStatusBadge = (status?: AppStatus) => {
    switch (status) {
      case AppStatus.ACTIVE:
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case AppStatus.SUSPENDED:
        return <Badge className="bg-red-100 text-red-800">Suspended</Badge>;
      case AppStatus.DEVELOPMENT:
      default:
        return <Badge className="bg-yellow-100 text-yellow-800">Development</Badge>;
    }
  };

  const getVerificationBadge = (status?: AppVerificationStatus) => {
    switch (status) {
      case AppVerificationStatus.VERIFIED:
        return <Badge className="bg-green-100 text-green-800 flex items-center">
          <Check className="h-3 w-3 mr-1" />Verified
        </Badge>;
      case AppVerificationStatus.REJECTED:
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      case AppVerificationStatus.PENDING:
      default:
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
    }
  };

  const handleSelectApp = (app: DeveloperApp) => {
    setSelectedApp(app);
    setActiveTab('app-details');
    navigate(`/developer/apps/${app.id}`);
  };

  const handleAppUpdated = (updatedApp: DeveloperApp) => {
    setSelectedApp(updatedApp);
    setApplications(prev => 
      prev.map(app => app.id === updatedApp.id ? updatedApp : app)
    );
  };

  const handleBackToApps = () => {
    setSelectedApp(null);
    setActiveTab('apps');
    navigate('/developer/apps');
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
                <BreadcrumbLink href="/developer/apps">
                  <Code className="h-4 w-4 mr-1" />
                  Apps
                </BreadcrumbLink>
              </BreadcrumbItem>
              {selectedApp && (
                <>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink href={`/developer/apps/${selectedApp.id}`}>
                      {selectedApp.app_name}
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                </>
              )}
            </BreadcrumbList>
          </Breadcrumb>

          <div className="mb-8 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <h1 className="text-2xl font-bold flex items-center">
                <Code className="mr-2 h-6 w-6 text-primary" />
                Developer Portal
              </h1>
              <div className="flex gap-2 mt-2 sm:mt-0">
                <Dialog open={showRegisterDialog} onOpenChange={setShowRegisterDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Register New App
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle>Register a New Application</DialogTitle>
                      <DialogDescription>
                        Create a new application to integrate with SecureAddress Bridge
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <Label htmlFor="appName">Application Name</Label>
                        <Input
                          id="appName"
                          name="appName"
                          value={formData.appName}
                          onChange={handleChange}
                          placeholder="My Awesome App"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          name="description"
                          value={formData.description}
                          onChange={handleChange}
                          placeholder="Describe what your application does and how it uses address data"
                          rows={3}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="websiteUrl">Website URL</Label>
                        <Input
                          id="websiteUrl"
                          name="websiteUrl"
                          value={formData.websiteUrl}
                          onChange={handleChange}
                          placeholder="https://example.com"
                          type="url"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="callbackUrls">
                          Callback URLs <span className="text-destructive">*</span>
                        </Label>
                        <Textarea
                          id="callbackUrls"
                          name="callbackUrls"
                          value={formData.callbackUrls}
                          onChange={handleChange}
                          placeholder="https://example.com/callback&#10;https://example.com/auth/callback"
                          rows={3}
                          required
                        />
                        <p className="text-xs text-muted-foreground">
                          Enter one URL per line. These are the URLs that users will be redirected to
                          after authorizing your application.
                        </p>
                      </div>
                      
                      <DialogFooter>
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setShowRegisterDialog(false)}
                        >
                          Cancel
                        </Button>
                        <Button type="submit" disabled={submitting}>
                          {submitting ? 'Registering...' : 'Register Application'}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>

                <Button variant="outline" asChild>
                  <a href="/developer/docs" target="_blank" rel="noopener noreferrer">
                    API Documentation
                  </a>
                </Button>
              </div>
            </div>
            <p className="text-muted-foreground">
              Manage your registered applications and API integrations with SecureAddress Bridge.
            </p>
          </div>

          {selectedApp ? (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold flex items-center">
                    {selectedApp.app_name}
                    <div className="ml-3 space-x-2">
                      {getStatusBadge(selectedApp.status as AppStatus)}
                      {getVerificationBadge(selectedApp.verification_status as AppVerificationStatus)}
                    </div>
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedApp.description || 'No description provided'}
                  </p>
                </div>
                <Button variant="outline" onClick={handleBackToApps}>
                  Back to Apps
                </Button>
              </div>
              
              <Separator />
              
              <DeveloperAppDetails 
                app={selectedApp} 
                onAppUpdated={handleAppUpdated} 
              />
            </div>
          ) : (
            <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="mb-6">
                <TabsTrigger value="apps">Your Applications</TabsTrigger>
                <TabsTrigger value="docs">Documentation</TabsTrigger>
                <TabsTrigger value="sandbox">Testing Sandbox</TabsTrigger>
                {isAdmin && <TabsTrigger value="admin">Admin Controls</TabsTrigger>}
              </TabsList>
              
              <TabsContent value="apps">
                <div className="mb-6 flex flex-col sm:flex-row justify-between gap-4">
                  <div className="flex-1">
                    <div className="relative max-w-md">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search applications..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="max-w-md pl-10"
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Select 
                      value={statusFilter} 
                      onValueChange={setStatusFilter}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="development">Development</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Select 
                      value={registrationFilter} 
                      onValueChange={setRegistrationFilter}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by verification" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Verifications</SelectItem>
                        <SelectItem value="verified">Verified</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {loading ? (
                  <div className="text-center py-8">Loading your applications...</div>
                ) : applications.length === 0 ? (
                  <Card>
                    <CardContent className="py-10 flex flex-col items-center justify-center text-center">
                      <div className="bg-muted w-12 h-12 rounded-full flex items-center justify-center mb-4">
                        <Code className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">No Applications Found</h3>
                      <p className="text-muted-foreground max-w-md mb-6">
                        You haven't registered any applications yet. Register your first application to get started.
                      </p>
                      <Button onClick={() => setShowRegisterDialog(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Register Your First App
                      </Button>
                    </CardContent>
                  </Card>
                ) : filteredApps.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No applications match your search criteria</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {filteredApps.map((app) => (
                      <Card key={app.id} className="overflow-hidden">
                        <CardContent className="p-0">
                          <div className="p-6">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-medium text-lg">{app.app_name}</h3>
                                <p className="text-sm text-muted-foreground">
                                  {app.description || 'No description provided'}
                                </p>
                              </div>
                              <div className="flex gap-2">
                                {getStatusBadge(app.status as AppStatus)}
                                {getVerificationBadge(app.verification_status as AppVerificationStatus)}
                              </div>
                            </div>
                            
                            <div className="mt-4 grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-xs text-muted-foreground">Application ID</p>
                                <code className="text-xs bg-muted px-1 py-0.5 rounded">
                                  {app.id}
                                </code>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Created</p>
                                <p className="text-sm">
                                  {new Date(app.created_at).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            
                            <div className="mt-4 flex">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="mr-2"
                                onClick={() => handleSelectApp(app)}
                              >
                                <Settings className="h-3 w-3 mr-1" />
                                Manage
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="mr-2"
                                asChild
                              >
                                <a href={`/developer/analytics?appId=${app.id}`}>
                                  <BarChart className="h-3 w-3 mr-1" />
                                  Analytics
                                </a>
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                asChild
                              >
                                <a href="/developer/docs" target="_blank" rel="noopener noreferrer">
                                  Documentation
                                </a>
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
                
                {applications.length > 0 && (
                  <div className="mt-6">
                    <Button onClick={() => setShowRegisterDialog(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Register New Application
                    </Button>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="docs">
                <Card>
                  <CardHeader>
                    <CardTitle>API Documentation</CardTitle>
                    <CardDescription>
                      Comprehensive guides and reference for integrating with our platform
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="grid gap-6 md:grid-cols-2">
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-lg">Getting Started</CardTitle>
                            <CardDescription>First steps for developers</CardDescription>
                          </CardHeader>
                          <CardContent className="pb-2">
                            <p className="text-sm text-muted-foreground">
                              Learn the basics of our API and explore key concepts to get started with integration.
                            </p>
                          </CardContent>
                          <CardFooter>
                            <Button asChild className="w-full">
                              <a href="/developer/docs/getting-started" target="_blank" rel="noopener noreferrer">
                                View Guide
                              </a>
                            </Button>
                          </CardFooter>
                        </Card>
                        
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-lg">OAuth Integration</CardTitle>
                            <CardDescription>Authentication flow</CardDescription>
                          </CardHeader>
                          <CardContent className="pb-2">
                            <p className="text-sm text-muted-foreground">
                              Learn how to implement the OAuth 2.0 flow to securely access user data.
                            </p>
                          </CardContent>
                          <CardFooter>
                            <Button asChild className="w-full">
                              <a href="/developer/docs/oauth" target="_blank" rel="noopener noreferrer">
                                View Guide
                              </a>
                            </Button>
                          </CardFooter>
                        </Card>
                        
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-lg">API Reference</CardTitle>
                            <CardDescription>Complete API documentation</CardDescription>
                          </CardHeader>
                          <CardContent className="pb-2">
                            <p className="text-sm text-muted-foreground">
                              Detailed documentation for all API endpoints, including request formats and responses.
                            </p>
                          </CardContent>
                          <CardFooter>
                            <Button asChild className="w-full">
                              <a href="/developer/docs/api" target="_blank" rel="noopener noreferrer">
                                View Reference
                              </a>
                            </Button>
                          </CardFooter>
                        </Card>
                        
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-lg">Code Examples</CardTitle>
                            <CardDescription>Sample implementations</CardDescription>
                          </CardHeader>
                          <CardContent className="pb-2">
                            <p className="text-sm text-muted-foreground">
                              Explore code examples in various languages to speed up your integration.
                            </p>
                          </CardContent>
                          <CardFooter>
                            <Button asChild className="w-full">
                              <a href="/developer/docs/examples" target="_blank" rel="noopener noreferrer">
                                View Examples
                              </a>
                            </Button>
                          </CardFooter>
                        </Card>
                      </div>
                      
                      <Alert>
                        <Info className="h-4 w-4" />
                        <AlertTitle>SDK Libraries</AlertTitle>
                        <AlertDescription>
                          We provide official SDK libraries for JavaScript, Python, and other languages to simplify integration.
                          <div className="mt-4">
                            <Button variant="outline" asChild>
                              <a href="/developer/docs/sdks" target="_blank" rel="noopener noreferrer">
                                View SDK Documentation
                              </a>
                            </Button>
                          </div>
                        </AlertDescription>
                      </Alert>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="sandbox">
                <Card>
                  <CardHeader>
                    <CardTitle>Testing Sandbox</CardTitle>
                    <CardDescription>
                      Test your integration in a safe environment
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="grid gap-6 lg:grid-cols-2">
                        <div>
                          <h3 className="text-lg font-medium mb-2">API Sandbox</h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            Test our API endpoints directly in the browser with our interactive API explorer.
                            No coding required to get familiar with the response formats.
                          </p>
                          <Button asChild>
                            <a href="/developer/sandbox/api">
                              Open API Explorer
                            </a>
                          </Button>
                        </div>
                        
                        <div>
                          <h3 className="text-lg font-medium mb-2">OAuth Playground</h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            Step through the OAuth flow and see exactly how authorization works with
                            our platform. Great for debugging OAuth issues.
                          </p>
                          <Button asChild>
                            <a href="/developer/sandbox/oauth">
                              Open OAuth Playground
                            </a>
                          </Button>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h3 className="text-lg font-medium mb-2">Test Data</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Use these test accounts and data in the sandbox environment:
                        </p>
                        
                        <div className="bg-muted rounded-md p-4 space-y-4">
                          <div>
                            <h4 className="font-medium">Test User</h4>
                            <code className="block text-xs bg-background p-2 rounded mt-1">
                              Email: test@example.com<br />
                              Password: securepassword123
                            </code>
                          </div>
                          
                          <div>
                            <h4 className="font-medium">Test Address</h4>
                            <code className="block text-xs bg-background p-2 rounded mt-1">
{`{
  "street": "123 Test Street",
  "city": "Testville",
  "state": "TS",
  "postal_code": "12345",
  "country": "Testland"
}`}
                            </code>
                          </div>
                          
                          <div>
                            <h4 className="font-medium">Test Wallet</h4>
                            <code className="block text-xs bg-background p-2 rounded mt-1">
                              0x71C7656EC7ab88b098defB751B7401B5f6d8976F
                            </code>
                          </div>
                        </div>
                      </div>
                      
                      <Alert>
                        <Beaker className="h-4 w-4" />
                        <AlertTitle>Developer Resources</AlertTitle>
                        <AlertDescription>
                          We provide a comprehensive set of tools to help you test and debug your integration.
                          <div className="grid gap-2 mt-4 md:grid-cols-2">
                            <Button variant="outline" asChild>
                              <a href="/developer/docs/debugging" target="_blank" rel="noopener noreferrer">
                                Debugging Guide
                              </a>
                            </Button>
                            <Button variant="outline" asChild>
                              <a href="/developer/docs/testing" target="_blank" rel="noopener noreferrer">
                                Testing Best Practices
                              </a>
                            </Button>
                          </div>
                        </AlertDescription>
                      </Alert>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {isAdmin && (
                <TabsContent value="admin">
                  <Card>
                    <CardHeader>
                      <CardTitle>Admin Controls</CardTitle>
                      <CardDescription>
                        Manage developer applications and platform security
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <Alert variant="default" className="border-primary">
                          <ShieldCheck className="h-4 w-4" />
                          <AlertTitle>Admin Access</AlertTitle>
                          <AlertDescription>
                            You have administrator privileges to manage all developer applications.
                          </AlertDescription>
                        </Alert>
                        
                        <div className="grid gap-4 sm:grid-cols-2">
                          <Card>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-lg flex items-center">
                                <List className="h-4 w-4 mr-2 text-primary" />
                                Application Verification
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="pb-2">
                              <p className="text-sm text-muted-foreground">
                                Review and approve pending developer applications
                              </p>
                            </CardContent>
                            <CardFooter>
                              <Button asChild className="w-full">
                                <a href="/developer/admin/verifications">
                                  Manage Verifications
                                </a>
                              </Button>
                            </CardFooter>
                          </Card>
                          
                          <Card>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-lg flex items-center">
                                <RefreshCw className="h-4 w-4 mr-2 text-primary" />
                                API Rate Limits
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="pb-2">
                              <p className="text-sm text-muted-foreground">
                                Configure API rate limits and quotas for developers
                              </p>
                            </CardContent>
                            <CardFooter>
                              <Button asChild className="w-full">
                                <a href="/developer/admin/rate-limits">
                                  Manage Rate Limits
                                </a>
                              </Button>
                            </CardFooter>
                          </Card>
                          
                          <Card>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-lg flex items-center">
                                <Key className="h-4 w-4 mr-2 text-primary" />
                                OAuth Settings
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="pb-2">
                              <p className="text-sm text-muted-foreground">
                                Configure global OAuth settings and scopes
                              </p>
                            </CardContent>
                            <CardFooter>
                              <Button asChild className="w-full">
                                <a href="/developer/admin/oauth-settings">
                                  Manage OAuth
                                </a>
                              </Button>
                            </CardFooter>
                          </Card>
                          
                          <Card>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-lg flex items-center">
                                <Lock className="h-4 w-4 mr-2 text-primary" />
                                Security Audit
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="pb-2">
                              <p className="text-sm text-muted-foreground">
                                Review security logs and access patterns
                              </p>
                            </CardContent>
                            <CardFooter>
                              <Button asChild className="w-full">
                                <a href="/developer/admin/security">
                                  View Audit Logs
                                </a>
                              </Button>
                            </CardFooter>
                          </Card>
                        </div>
                        
                        <Alert variant="destructive">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertTitle>Platform Security</AlertTitle>
                          <AlertDescription>
                            You can suspend all developer access in case of security incidents.
                            <div className="mt-4">
                              <Button variant="destructive">
                                Emergency Platform Lockdown
                              </Button>
                            </div>
                          </AlertDescription>
                        </Alert>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              )}
            </Tabs>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DeveloperPortalManager;

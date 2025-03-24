
import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/context/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { CopyIcon, CheckIcon, ExternalLinkIcon, Beaker } from 'lucide-react';

interface DeveloperApplication {
  id: string;
  app_name: string;
  description: string | null;
  website_url: string | null;
  callback_urls: string[];
  app_secret?: string;
  created_at: string;
}

const DeveloperPortal: React.FC = () => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [activeTab, setActiveTab] = useState('apps');
  const [applications, setApplications] = useState<DeveloperApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    appName: '',
    description: '',
    websiteUrl: '',
    callbackUrls: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [copiedAppId, setCopiedAppId] = useState<string | null>(null);
  const [copiedSecret, setCopiedSecret] = useState<string | null>(null);

  // Redirect to login if not authenticated
  if (!isLoading && !isAuthenticated) {
    return <Navigate to="/auth" />;
  }

  // Fetch developer applications
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

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated || !user) {
      toast.error('Please sign in first');
      return;
    }
    
    // Validate form
    if (!formData.appName) {
      toast.error('App name is required');
      return;
    }
    
    if (!formData.callbackUrls) {
      toast.error('At least one callback URL is required');
      return;
    }
    
    // Parse callback URLs
    const callbackUrls = formData.callbackUrls
      .split('\n')
      .map(url => url.trim())
      .filter(url => url);
    
    if (callbackUrls.length === 0) {
      toast.error('At least one valid callback URL is required');
      return;
    }
    
    // Check URL format
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
      // Generate app ID and secret
      const appId = `app_${Date.now()}`;
      const appSecret = Array.from(crypto.getRandomValues(new Uint8Array(32)))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
      
      // Save the application
      const { data, error } = await supabase
        .from('developer_apps')
        .insert({
          id: appId,
          user_id: user.id,
          app_name: formData.appName,
          description: formData.description,
          website_url: formData.websiteUrl,
          callback_urls: callbackUrls,
          app_secret: appSecret
        })
        .select()
        .single();
        
      if (error) throw error;
      
      // Add to the applications list
      setApplications(prev => [data as DeveloperApplication, ...prev]);
      
      // Show success message
      toast.success('Application registered successfully', {
        description: 'Your app credentials have been generated'
      });
      
      // Reset form
      setFormData({
        appName: '',
        description: '',
        websiteUrl: '',
        callbackUrls: ''
      });
      
      // Switch to the credentials tab to show the new app
      setActiveTab('credentials');
    } catch (error) {
      console.error('Error registering application:', error);
      toast.error('Failed to register application', {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Copy to clipboard
  const copyToClipboard = (text: string, type: 'appId' | 'secret', id: string) => {
    navigator.clipboard.writeText(text);
    
    if (type === 'appId') {
      setCopiedAppId(id);
      setTimeout(() => setCopiedAppId(null), 2000);
    } else {
      setCopiedSecret(id);
      setTimeout(() => setCopiedSecret(null), 2000);
    }
  };

  // ... keep existing code (render UI layout, form components, applications list, etc.)

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-32 pb-20 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Developer Portal</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Register and manage your applications that integrate with SecureAddress Bridge.
            </p>
            
            {/* Add Sandbox Link */}
            <Button 
              variant="outline" 
              className="mt-4"
              asChild
            >
              <Link to="/developer/sandbox">
                <Beaker className="mr-2 h-4 w-4" />
                SDK Sandbox Testing Environment
              </Link>
            </Button>
          </div>
          
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-4 mb-8">
              <TabsTrigger value="apps">Register App</TabsTrigger>
              <TabsTrigger value="credentials">Credentials</TabsTrigger>
              <TabsTrigger value="docs">Documentation</TabsTrigger>
              <TabsTrigger value="sandbox">Sandbox</TabsTrigger>
            </TabsList>
            
            <TabsContent value="apps" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Register a New Application</CardTitle>
                  <CardDescription>
                    Create a new application to integrate with SecureAddress Bridge
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
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
                    
                    <Button type="submit" className="w-full" disabled={submitting}>
                      {submitting ? 'Registering...' : 'Register Application'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="credentials">
              <div className="space-y-6">
                <h2 className="text-2xl font-bold">Your Applications</h2>
                
                {loading ? (
                  <div className="text-center py-8">Loading your applications...</div>
                ) : applications.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">You haven't registered any applications yet.</p>
                    <Button onClick={() => setActiveTab('apps')}>Register Your First App</Button>
                  </div>
                ) : (
                  <div className="grid gap-6">
                    {applications.map(app => (
                      <Card key={app.id}>
                        <CardHeader>
                          <CardTitle>{app.app_name}</CardTitle>
                          <CardDescription>{app.description || 'No description provided'}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid gap-4">
                            <div>
                              <Label className="text-sm">App ID</Label>
                              <div className="flex mt-1">
                                <Input
                                  readOnly
                                  value={app.id}
                                  className="font-mono text-sm"
                                />
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="ml-2"
                                  onClick={() => copyToClipboard(app.id, 'appId', app.id)}
                                >
                                  {copiedAppId === app.id ? <CheckIcon className="h-4 w-4" /> : <CopyIcon className="h-4 w-4" />}
                                </Button>
                              </div>
                            </div>
                            
                            <div>
                              <Label className="text-sm">App Secret</Label>
                              <div className="flex mt-1">
                                <Input
                                  readOnly
                                  value={app.app_secret || '••••••••••••••••••••••••••••••'}
                                  type={app.app_secret ? "text" : "password"}
                                  className="font-mono text-sm"
                                />
                                {app.app_secret && (
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="ml-2"
                                    onClick={() => copyToClipboard(app.app_secret!, 'secret', app.id)}
                                  >
                                    {copiedSecret === app.id ? <CheckIcon className="h-4 w-4" /> : <CopyIcon className="h-4 w-4" />}
                                  </Button>
                                )}
                              </div>
                              <p className="text-xs text-destructive mt-1">
                                Keep this secret secure. It will only be shown once.
                              </p>
                            </div>
                          </div>
                          
                          <div>
                            <Label className="text-sm">Callback URLs</Label>
                            <ul className="mt-1 space-y-1">
                              {app.callback_urls.map((url, index) => (
                                <li key={index} className="text-sm font-mono truncate">
                                  {url}
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          {app.website_url && (
                            <div>
                              <Label className="text-sm">Website</Label>
                              <div className="mt-1">
                                <a 
                                  href={app.website_url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-primary hover:underline flex items-center text-sm"
                                >
                                  {app.website_url}
                                  <ExternalLinkIcon className="h-3 w-3 ml-1" />
                                </a>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="docs">
              <Card>
                <CardHeader>
                  <CardTitle>Developer Documentation</CardTitle>
                  <CardDescription>
                    Resources to help you integrate with SecureAddress Bridge
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <p>
                      Our comprehensive API documentation and SDK guides will help you
                      integrate SecureAddress Bridge into your applications.
                    </p>
                    
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">API Documentation</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">
                            Detailed documentation for our RESTful API endpoints, including request 
                            formats, response schemas, and error handling.
                          </p>
                        </CardContent>
                        <CardFooter>
                          <Button asChild>
                            <a href="/developer-docs">View API Docs</a>
                          </Button>
                        </CardFooter>
                      </Card>
                      
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">SDK Libraries</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">
                            Client libraries that make it easy to integrate with SecureAddress Bridge
                            from your JavaScript, Python, or other applications.
                          </p>
                        </CardContent>
                        <CardFooter>
                          <Button asChild>
                            <a href="/developer-docs?tab=sdk">View SDK Docs</a>
                          </Button>
                        </CardFooter>
                      </Card>
                    </div>
                    
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Example Code</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">
                            Ready-to-use sample code and integration examples for common use cases
                            like e-commerce shipping, identity verification, and more.
                          </p>
                        </CardContent>
                        <CardFooter>
                          <Button asChild>
                            <a href="/developer-docs?tab=examples">View Examples</a>
                          </Button>
                        </CardFooter>
                      </Card>
                      
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Webhooks</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">
                            Learn how to receive notifications when users modify their address
                            permissions or update their address information.
                          </p>
                        </CardContent>
                        <CardFooter>
                          <Button asChild>
                            <a href="/developer-docs?tab=api-reference">Webhook Docs</a>
                          </Button>
                        </CardFooter>
                      </Card>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="sandbox">
              <Card>
                <CardHeader>
                  <CardTitle>SDK Sandbox Environment</CardTitle>
                  <CardDescription>
                    Test your integration without making real API calls
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <p>
                      Our SDK Sandbox Environment allows you to test your integration with 
                      SecureAddress Bridge without making real API calls or requiring real user data.
                    </p>
                    
                    <div className="grid gap-6 sm:grid-cols-2">
                      <div>
                        <h3 className="text-lg font-medium mb-2">Key Features</h3>
                        <ul className="space-y-2">
                          <li className="flex items-start">
                            <span className="bg-primary/10 text-primary rounded-full p-1 mr-2 mt-0.5">
                              <CheckIcon className="h-3 w-3" />
                            </span>
                            <span>Test all SDK functionality without real API calls</span>
                          </li>
                          <li className="flex items-start">
                            <span className="bg-primary/10 text-primary rounded-full p-1 mr-2 mt-0.5">
                              <CheckIcon className="h-3 w-3" />
                            </span>
                            <span>Simulate success and error scenarios</span>
                          </li>
                          <li className="flex items-start">
                            <span className="bg-primary/10 text-primary rounded-full p-1 mr-2 mt-0.5">
                              <CheckIcon className="h-3 w-3" />
                            </span>
                            <span>Customize mock address data and responses</span>
                          </li>
                          <li className="flex items-start">
                            <span className="bg-primary/10 text-primary rounded-full p-1 mr-2 mt-0.5">
                              <CheckIcon className="h-3 w-3" />
                            </span>
                            <span>Test wallet connections and shipping flows</span>
                          </li>
                          <li className="flex items-start">
                            <span className="bg-primary/10 text-primary rounded-full p-1 mr-2 mt-0.5">
                              <CheckIcon className="h-3 w-3" />
                            </span>
                            <span>Generate sample code for your integration</span>
                          </li>
                        </ul>
                      </div>
                      
                      <div className="flex flex-col justify-between">
                        <div>
                          <h3 className="text-lg font-medium mb-2">Getting Started</h3>
                          <p className="text-muted-foreground mb-4">
                            The sandbox allows you to quickly test and prototype your integration 
                            before connecting to the live API. It's the perfect way to get familiar 
                            with the SDK without handling real user data.
                          </p>
                        </div>
                        
                        <Button size="lg" className="mt-4" asChild>
                          <Link to="/developer/sandbox">
                            <Beaker className="mr-2 h-4 w-4" />
                            Open SDK Sandbox
                          </Link>
                        </Button>
                      </div>
                    </div>
                    
                    <div className="bg-muted p-4 rounded-lg text-sm">
                      <p className="font-medium mb-2">Pro tip:</p>
                      <p>
                        Use the sandbox mode in your development environment by initializing the SDK 
                        with <code className="bg-background px-1 rounded text-xs">sandbox: true</code> 
                        and switch to production mode for your staging and production environments.
                      </p>
                    </div>
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

export default DeveloperPortal;

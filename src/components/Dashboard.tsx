
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Shield, Truck, Key, Wallet, Home, Settings, History, Code } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

interface DashboardProps {
  physicalAddresses: any[];
  walletAddresses: any[];
  permissions: any[];
}

const Dashboard: React.FC<DashboardProps> = ({ 
  physicalAddresses = [], 
  walletAddresses = [], 
  permissions = [] 
}) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleManageAddresses = () => {
    toast.info('Navigating to address management');
    navigate('/dashboard/addresses');
  };

  const handleConnectWallet = () => {
    navigate('/connect');
  };

  const handleCreateShippingToken = () => {
    navigate('/blind-shipping');
  };

  const handleManageApiKeys = () => {
    navigate('/dashboard/api-keys');
  };

  const handleDeveloperPortal = () => {
    navigate('/developer');
  };

  const handleAccountSettings = () => {
    toast.info('Navigating to account settings');
    navigate('/dashboard/settings');
  };

  const handleDeveloperDashboard = () => {
    navigate('/developer-dashboard');
  };

  return (
    <div className="space-y-8">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full md:w-auto grid-cols-3 md:grid-cols-7">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="addresses">Addresses</TabsTrigger>
          <TabsTrigger value="wallets">Wallets</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
          <TabsTrigger value="developer">Developer</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <Home className="h-5 w-5 text-primary" />
                  Address Management
                </CardTitle>
                <CardDescription>Verify and manage your physical addresses</CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <p className="text-sm text-muted-foreground">
                  {physicalAddresses.length > 0 
                    ? `You have ${physicalAddresses.length} verified address(es)` 
                    : "No verified addresses yet"}
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" onClick={handleManageAddresses}>Manage Addresses</Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-primary" />
                  Wallet Connections
                </CardTitle>
                <CardDescription>Link your blockchain wallets</CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <p className="text-sm text-muted-foreground">
                  {walletAddresses.length > 0 
                    ? `You have ${walletAddresses.length} connected wallet(s)` 
                    : "No wallets connected yet"}
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" onClick={handleConnectWallet}>Connect Wallet</Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Address Permissions
                </CardTitle>
                <CardDescription>Control who can access your address</CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <p className="text-sm text-muted-foreground">
                  {permissions.length > 0 
                    ? `${permissions.length} app(s) have permission` 
                    : "No permissions granted yet"}
                </p>
              </CardContent>
              <CardFooter>
                <Link to="/permissions" className="w-full">
                  <Button variant="outline" className="w-full">Manage Permissions</Button>
                </Link>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5 text-primary" />
                  Blind Shipping
                </CardTitle>
                <CardDescription>Create tokens for private shipping</CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <p className="text-sm text-muted-foreground">
                  Generate secure shipping tokens that hide your address
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" onClick={handleCreateShippingToken}>Create Shipping Token</Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5 text-primary" />
                  Developer Portal
                </CardTitle>
                <CardDescription>Build applications with our API</CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <p className="text-sm text-muted-foreground">
                  Register apps, manage API keys, and access developer tools
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" onClick={handleDeveloperDashboard}>Open Developer Dashboard</Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5 text-primary" />
                  API Keys
                </CardTitle>
                <CardDescription>Manage your API credentials</CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <p className="text-sm text-muted-foreground">
                  Create and manage API keys for your applications
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" onClick={handleManageApiKeys}>Manage API Keys</Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-primary" />
                  Settings
                </CardTitle>
                <CardDescription>Configure your account</CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <p className="text-sm text-muted-foreground">
                  Notifications, privacy, and security settings
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" onClick={handleAccountSettings}>Account Settings</Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="addresses">
          <Card>
            <CardHeader>
              <CardTitle>Physical Addresses</CardTitle>
              <CardDescription>Manage and verify your physical addresses</CardDescription>
            </CardHeader>
            <CardContent>
              {physicalAddresses.length > 0 ? (
                <div className="space-y-4">
                  <p>Your addresses will be displayed here</p>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground mb-4">You haven't added any addresses yet</p>
                  <Button>Add Address</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="wallets">
          <Card>
            <CardHeader>
              <CardTitle>Wallet Connections</CardTitle>
              <CardDescription>Link your blockchain wallets to your verified address</CardDescription>
            </CardHeader>
            <CardContent>
              {walletAddresses.length > 0 ? (
                <div className="space-y-4">
                  <p>Your connected wallets will be displayed here</p>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground mb-4">You haven't connected any wallets yet</p>
                  <Button>Connect Wallet</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="permissions">
          <Card>
            <CardHeader>
              <CardTitle>Permission Management</CardTitle>
              <CardDescription>Control which applications can access your address data</CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              {permissions.length > 0 ? (
                <div className="space-y-4">
                  <p>Your granted permissions will be displayed here</p>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground mb-4">You haven't granted any permissions yet</p>
                  <Link to="/permissions">
                    <Button>Manage Permissions</Button>
                  </Link>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <div className="flex justify-between w-full">
                <Link to="/permissions" className="w-full mr-2">
                  <Button variant="outline" className="w-full">Address Permissions</Button>
                </Link>
                <Link to="/blind-shipping" className="w-full ml-2">
                  <Button variant="outline" className="w-full">Blind Shipping</Button>
                </Link>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="developer">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Developer Resources
              </CardTitle>
              <CardDescription>Build applications with the SecureAddress Bridge API</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Developer Dashboard</CardTitle>
                    <CardDescription>Centralized developer hub</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p className="text-sm text-muted-foreground">
                      Access all developer resources in one place
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full" onClick={handleDeveloperDashboard}>
                      Open Developer Dashboard
                    </Button>
                  </CardFooter>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Register Applications</CardTitle>
                    <CardDescription>Create OAuth applications</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p className="text-sm text-muted-foreground">
                      Register your application to get a client ID and secret
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full" onClick={handleDeveloperPortal}>
                      Developer Portal
                    </Button>
                  </CardFooter>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">API Keys</CardTitle>
                    <CardDescription>Manage authentication credentials</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p className="text-sm text-muted-foreground">
                      Create and manage API keys for your applications
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full" onClick={handleManageApiKeys}>
                      Manage API Keys
                    </Button>
                  </CardFooter>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Webhooks</CardTitle>
                    <CardDescription>Receive event notifications</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p className="text-sm text-muted-foreground">
                      Configure webhooks to be notified of events
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Link to="/developer-dashboard?tab=webhooks" className="w-full">
                      <Button className="w-full">
                        Manage Webhooks
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">API Documentation</CardTitle>
                    <CardDescription>Reference guides and examples</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p className="text-sm text-muted-foreground">
                      Detailed documentation for our REST API endpoints
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Link to="/docs" className="w-full">
                      <Button className="w-full">
                        View Documentation
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">SDK Libraries</CardTitle>
                    <CardDescription>Client libraries for integration</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p className="text-sm text-muted-foreground">
                      Libraries for JavaScript, Python, and other languages
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Link to="/docs?tab=sdk" className="w-full">
                      <Button className="w-full">
                        View SDKs
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">API Testing</CardTitle>
                    <CardDescription>Test API endpoints</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p className="text-sm text-muted-foreground">
                      Interactive environment to test API calls
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Link to="/api-testing" className="w-full">
                      <Button className="w-full">
                        Open API Tester
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Usage Analytics</CardTitle>
                    <CardDescription>Monitor API usage</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p className="text-sm text-muted-foreground">
                      View API usage metrics and performance
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Link to="/developer/analytics" className="w-full">
                      <Button className="w-full">
                        View Analytics
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">SDK Sandbox</CardTitle>
                    <CardDescription>Test environment</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p className="text-sm text-muted-foreground">
                      Test SDK functionality without affecting real data
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Link to="/developer/sandbox" className="w-full">
                      <Button className="w-full">
                        Open Sandbox
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Access History
              </CardTitle>
              <CardDescription>See when and how your address was accessed</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-6">
                <p className="text-muted-foreground">Access history will be displayed here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>Configure your account preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-6">
                <p className="text-muted-foreground">Settings options will be displayed here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;

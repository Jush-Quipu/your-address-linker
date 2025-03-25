
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Shield, Truck, Key, Wallet, Home, Settings, History } from 'lucide-react';

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
  return (
    <div className="space-y-8">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full md:w-auto grid-cols-3 md:grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="addresses">Addresses</TabsTrigger>
          <TabsTrigger value="wallets">Wallets</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Address Management Card */}
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
                <Button variant="outline" className="w-full">Manage Addresses</Button>
              </CardFooter>
            </Card>
            
            {/* Wallet Connection Card */}
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
                <Button variant="outline" className="w-full">Connect Wallet</Button>
              </CardFooter>
            </Card>
            
            {/* Permission Management Card */}
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
            
            {/* Blind Shipping Card */}
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
                <Link to="/blind-shipping" className="w-full">
                  <Button variant="outline" className="w-full">Create Shipping Token</Button>
                </Link>
              </CardFooter>
            </Card>
            
            {/* API Keys Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5 text-primary" />
                  Developer API
                </CardTitle>
                <CardDescription>Integrate with your applications</CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <p className="text-sm text-muted-foreground">
                  API keys and SDKs to integrate with your applications
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">Manage API Keys</Button>
              </CardFooter>
            </Card>
            
            {/* Settings Card */}
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
                <Button variant="outline" className="w-full">Account Settings</Button>
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
                  {/* Address list would go here */}
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
                  {/* Wallet list would go here */}
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
                  {/* Permissions list would go here */}
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

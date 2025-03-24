
import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Separator } from './ui/separator';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { shortenAddress } from '@/utils/web3';

// Simulate database data
const mockData = {
  wallet: {
    address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
    chainId: 1,
  },
  physicalAddress: {
    streetAddress: '123 Blockchain Ave',
    city: 'Crypto City',
    state: 'CA',
    postalCode: '94103',
    country: 'United States',
    verificationStatus: 'Verified',
    verificationDate: '2023-04-15T14:30:00Z',
  },
  connectedApps: [
    {
      id: 1,
      name: 'NFT Marketplace',
      icon: '🖼️',
      accessLevel: 'Full address',
      lastAccess: '2023-04-20T10:15:00Z',
      status: 'Active',
    },
    {
      id: 2,
      name: 'DeFi App',
      icon: '💰',
      accessLevel: 'City & Country only',
      lastAccess: '2023-04-18T09:30:00Z',
      status: 'Active',
    },
    {
      id: 3,
      name: 'DAO Governance',
      icon: '🏛️',
      accessLevel: 'Country only',
      lastAccess: '2023-04-10T16:45:00Z',
      status: 'Expired',
    },
  ],
  activityLog: [
    {
      id: 1,
      type: 'Address verification',
      description: 'Address successfully verified',
      date: '2023-04-15T14:30:00Z',
    },
    {
      id: 2,
      type: 'App access',
      description: 'NFT Marketplace accessed your address',
      date: '2023-04-20T10:15:00Z',
    },
    {
      id: 3,
      type: 'Permission change',
      description: 'Updated DeFi App permissions to City & Country only',
      date: '2023-04-18T09:30:00Z',
    },
    {
      id: 4,
      type: 'Wallet connection',
      description: 'Connected wallet to SecureAddress Bridge',
      date: '2023-04-15T14:25:00Z',
    },
  ],
  privacySettings: {
    shareCity: true,
    shareState: true,
    shareCountry: true,
    sharePostalCode: false,
    defaultAccessExpiry: '7d',
    notifyOnAccess: true,
  },
};

// Helper function to format dates
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

const Dashboard: React.FC = () => {
  const [privacySettings, setPrivacySettings] = useState(mockData.privacySettings);
  
  const handlePrivacyToggle = (setting: keyof typeof privacySettings) => {
    setPrivacySettings((prev) => ({
      ...prev,
      [setting]: !prev[setting],
    }));
  };
  
  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Wallet Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>Wallet Information</CardTitle>
              <CardDescription>Your connected blockchain wallet details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Address:</span>
                  <span className="text-sm font-mono">{shortenAddress(mockData.wallet.address)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Network:</span>
                  <span className="text-sm">Ethereum Mainnet</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Status:</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Connected
                  </span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm" className="w-full">Disconnect Wallet</Button>
            </CardFooter>
          </Card>
          
          {/* Physical Address Card */}
          <Card>
            <CardHeader>
              <CardTitle>Verified Address</CardTitle>
              <CardDescription>Your securely stored physical address</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-secondary p-4 rounded-lg">
                  <p className="text-sm mb-1">{mockData.physicalAddress.streetAddress}</p>
                  <p className="text-sm mb-1">
                    {mockData.physicalAddress.city}, {mockData.physicalAddress.state} {mockData.physicalAddress.postalCode}
                  </p>
                  <p className="text-sm">{mockData.physicalAddress.country}</p>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Verification Status:</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {mockData.physicalAddress.verificationStatus}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Verified on:</span>
                  <span className="text-sm">{formatDate(mockData.physicalAddress.verificationDate)}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm" className="w-full">Update Address</Button>
            </CardFooter>
          </Card>
        </div>
        
        {/* Main Dashboard Tabs */}
        <Tabs defaultValue="connected-apps" className="w-full">
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="connected-apps">Connected Apps</TabsTrigger>
            <TabsTrigger value="activity">Activity Log</TabsTrigger>
            <TabsTrigger value="privacy">Privacy Settings</TabsTrigger>
          </TabsList>
          
          {/* Connected Apps Tab */}
          <TabsContent value="connected-apps">
            <Card>
              <CardHeader>
                <CardTitle>Connected Applications</CardTitle>
                <CardDescription>
                  Manage applications that have access to your verified address
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockData.connectedApps.map((app) => (
                    <div key={app.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="text-2xl">{app.icon}</div>
                        <div>
                          <h4 className="text-sm font-medium">{app.name}</h4>
                          <div className="flex space-x-4 text-xs text-muted-foreground mt-1">
                            <span>Access: {app.accessLevel}</span>
                            <span>Last used: {new Date(app.lastAccess).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className={app.status === 'Expired' ? 'text-muted-foreground' : ''}
                        >
                          {app.status === 'Active' ? 'Revoke' : 'Expired'}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Activity Log Tab */}
          <TabsContent value="activity">
            <Card>
              <CardHeader>
                <CardTitle>Activity Log</CardTitle>
                <CardDescription>
                  Recent activity and events related to your address
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockData.activityLog.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-4 p-4 border rounded-lg">
                      <div>
                        <div className="w-2 h-2 mt-1.5 rounded-full bg-primary"></div>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <h4 className="text-sm font-medium">{activity.type}</h4>
                          <span className="text-xs text-muted-foreground">{formatDate(activity.date)}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{activity.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex justify-center">
                <Button variant="outline" size="sm">
                  View All Activity
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Privacy Settings Tab */}
          <TabsContent value="privacy">
            <Card>
              <CardHeader>
                <CardTitle>Privacy Settings</CardTitle>
                <CardDescription>
                  Control how your address information is shared
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium mb-4">Address Component Sharing</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="shareCity">City</Label>
                          <p className="text-xs text-muted-foreground">Allow apps to access your city</p>
                        </div>
                        <Switch 
                          id="shareCity" 
                          checked={privacySettings.shareCity}
                          onCheckedChange={() => handlePrivacyToggle('shareCity')}
                        />
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="shareState">State/Province</Label>
                          <p className="text-xs text-muted-foreground">Allow apps to access your state/province</p>
                        </div>
                        <Switch 
                          id="shareState" 
                          checked={privacySettings.shareState}
                          onCheckedChange={() => handlePrivacyToggle('shareState')}
                        />
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="sharePostalCode">Postal Code</Label>
                          <p className="text-xs text-muted-foreground">Allow apps to access your postal code</p>
                        </div>
                        <Switch 
                          id="sharePostalCode" 
                          checked={privacySettings.sharePostalCode}
                          onCheckedChange={() => handlePrivacyToggle('sharePostalCode')}
                        />
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="shareCountry">Country</Label>
                          <p className="text-xs text-muted-foreground">Allow apps to access your country</p>
                        </div>
                        <Switch 
                          id="shareCountry" 
                          checked={privacySettings.shareCountry}
                          onCheckedChange={() => handlePrivacyToggle('shareCountry')}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-4">Notification Preferences</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="notifyOnAccess">Access Notifications</Label>
                          <p className="text-xs text-muted-foreground">Get notified when an app accesses your address</p>
                        </div>
                        <Switch 
                          id="notifyOnAccess" 
                          checked={privacySettings.notifyOnAccess}
                          onCheckedChange={() => handlePrivacyToggle('notifyOnAccess')}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full">Save Settings</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;

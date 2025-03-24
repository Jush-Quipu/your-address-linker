
import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Separator } from './ui/separator';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { shortenAddress } from '@/utils/web3';
import { 
  PhysicalAddress, 
  WalletAddress, 
  AddressPermission,
  updateAddressPermission,
  deleteAddressPermission
} from '@/services/addressService';
import { toast } from 'sonner';
import { Badge } from './ui/badge';
import { useAuth } from '@/context/AuthContext';

interface DashboardProps {
  physicalAddresses: PhysicalAddress[];
  walletAddresses: WalletAddress[];
  permissions: AddressPermission[];
}

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

const Dashboard: React.FC<DashboardProps> = ({ 
  physicalAddresses = [], 
  walletAddresses = [], 
  permissions = [] 
}) => {
  const { user } = useAuth();
  const [privacySettings, setPrivacySettings] = useState({
    shareCity: true,
    shareState: true,
    shareCountry: true,
    sharePostalCode: false,
    defaultAccessExpiry: '7d',
    notifyOnAccess: true,
  });
  
  const handlePrivacyToggle = (setting: keyof typeof privacySettings) => {
    setPrivacySettings((prev) => ({
      ...prev,
      [setting]: !prev[setting],
    }));
  };

  const handleRevokePermission = async (permissionId: string) => {
    try {
      await deleteAddressPermission(permissionId);
      toast.success('Permission revoked successfully');
      // The UI should update when the parent component refetches data
    } catch (error) {
      console.error('Error revoking permission:', error);
      toast.error('Failed to revoke permission');
    }
  };
  
  // Get the most recent physical address
  const physicalAddress = physicalAddresses.length > 0 ? physicalAddresses[0] : null;
  
  // Get the primary wallet address
  const walletAddress = walletAddresses.find(w => w.is_primary) || (walletAddresses.length > 0 ? walletAddresses[0] : null);

  // Mock activity log data - in a real app, this would come from a database
  const activityLog = [
    {
      id: 1,
      type: 'Address verification',
      description: 'Address submitted for verification',
      date: new Date().toISOString(),
    },
    {
      id: 2,
      type: 'Wallet connection',
      description: 'Connected wallet to SecureAddress Bridge',
      date: new Date().toISOString(),
    },
  ];
  
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
              {walletAddress ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Address:</span>
                    <span className="text-sm font-mono">{shortenAddress(walletAddress.address)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Network:</span>
                    <span className="text-sm">Chain ID: {walletAddress.chain_id}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Status:</span>
                    <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                      Connected
                    </Badge>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground mb-4">No wallet connected yet</p>
                  <Button variant="outline" size="sm" onClick={() => window.location.href = '/connect'}>
                    Connect Wallet
                  </Button>
                </div>
              )}
            </CardContent>
            {walletAddress && (
              <CardFooter>
                <Button variant="outline" size="sm" className="w-full" onClick={() => window.location.href = '/connect'}>
                  Manage Wallets
                </Button>
              </CardFooter>
            )}
          </Card>
          
          {/* Physical Address Card */}
          <Card>
            <CardHeader>
              <CardTitle>Verified Address</CardTitle>
              <CardDescription>Your securely stored physical address</CardDescription>
            </CardHeader>
            <CardContent>
              {physicalAddress ? (
                <div className="space-y-4">
                  <div className="bg-secondary p-4 rounded-lg">
                    <p className="text-sm mb-1">{physicalAddress.street_address}</p>
                    <p className="text-sm mb-1">
                      {physicalAddress.city}, {physicalAddress.state} {physicalAddress.postal_code}
                    </p>
                    <p className="text-sm">{physicalAddress.country}</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Verification Status:</span>
                    <Badge variant="outline" className={
                      physicalAddress.verification_status === 'verified' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                        : physicalAddress.verification_status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                    }>
                      {physicalAddress.verification_status.charAt(0).toUpperCase() + physicalAddress.verification_status.slice(1)}
                    </Badge>
                  </div>
                  {physicalAddress.verification_date && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Verified on:</span>
                      <span className="text-sm">{formatDate(physicalAddress.verification_date)}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground mb-4">No address verified yet</p>
                  <Button variant="outline" size="sm" onClick={() => window.location.href = '/verify'}>
                    Verify Address
                  </Button>
                </div>
              )}
            </CardContent>
            {physicalAddress && (
              <CardFooter>
                <Button variant="outline" size="sm" className="w-full" onClick={() => window.location.href = '/verify'}>
                  Update Address
                </Button>
              </CardFooter>
            )}
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
                  {permissions.length > 0 ? (
                    permissions.map((permission) => (
                      <div key={permission.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="text-2xl">🔐</div>
                          <div>
                            <h4 className="text-sm font-medium">{permission.app_name}</h4>
                            <div className="flex space-x-4 text-xs text-muted-foreground mt-1">
                              <span>Access: {
                                [
                                  permission.share_city ? 'City' : '',
                                  permission.share_state ? 'State' : '',
                                  permission.share_postal_code ? 'Postal Code' : '',
                                  permission.share_country ? 'Country' : ''
                                ].filter(Boolean).join(', ') || 'No access'
                              }</span>
                              {permission.last_accessed && (
                                <span>Last used: {formatDate(permission.last_accessed)}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleRevokePermission(permission.id)}
                          >
                            Revoke
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-10">
                      <p className="text-muted-foreground">No applications are currently connected to your address.</p>
                    </div>
                  )}
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
                  {activityLog.map((activity) => (
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

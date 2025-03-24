
import React, { useState, useEffect } from 'react';
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
  revokePermission,
  getAccessLogs
} from '@/services/addressService';
import { toast } from 'sonner';
import { Badge } from './ui/badge';
import { useAuth } from '@/context/AuthContext';
import { Shield, Key, Lock, Clock, RefreshCw, Bell, AlertTriangle } from 'lucide-react';
import { Progress } from './ui/progress';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

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
  const [accessLogs, setAccessLogs] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [privacySettings, setPrivacySettings] = useState({
    shareCity: true,
    shareState: true,
    shareCountry: true,
    sharePostalCode: false,
    defaultAccessExpiry: '7d',
    notifyOnAccess: true,
  });
  
  useEffect(() => {
    const fetchAccessLogs = async () => {
      if (!user) return;
      
      setLoadingLogs(true);
      try {
        const logs = await getAccessLogs(user.id);
        setAccessLogs(logs);
      } catch (error) {
        console.error('Error fetching access logs:', error);
      } finally {
        setLoadingLogs(false);
      }
    };
    
    fetchAccessLogs();
  }, [user]);
  
  const handlePrivacyToggle = (setting: keyof typeof privacySettings) => {
    setPrivacySettings((prev) => ({
      ...prev,
      [setting]: !prev[setting],
    }));
  };

  const handleRevokePermission = async (permissionId: string, reason: string = 'Revoked by user') => {
    try {
      await revokePermission(permissionId, reason);
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

  // Calculate expiry for permissions
  const calculateExpiryProgress = (expiryDate: string | null): number => {
    if (!expiryDate) return 100;
    
    const now = new Date();
    const expiry = new Date(expiryDate);
    const created = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // Assume 30 days ago
    
    // If already expired
    if (now > expiry) return 100;
    
    const totalDuration = expiry.getTime() - created.getTime();
    const elapsed = now.getTime() - created.getTime();
    
    return Math.min(100, Math.round((elapsed / totalDuration) * 100));
  };
  
  // Format expiry date
  const formatExpiry = (expiryDate: string | null): string => {
    if (!expiryDate) return 'No expiry';
    
    const now = new Date();
    const expiry = new Date(expiryDate);
    
    if (now > expiry) return 'Expired';
    
    const diffDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Expires today';
    if (diffDays === 1) return 'Expires tomorrow';
    return `Expires in ${diffDays} days`;
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
                  
                  {/* Encryption Status */}
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Encryption:</span>
                    <Badge variant="outline" className={
                      physicalAddress.encryption_version 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                    }>
                      {physicalAddress.encryption_version ? (
                        <div className="flex items-center">
                          <Lock className="h-3 w-3 mr-1" />
                          <span>Encrypted (v{physicalAddress.encryption_version})</span>
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          <span>Unencrypted</span>
                        </div>
                      )}
                    </Badge>
                  </div>
                  
                  {/* ZKP Status */}
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Zero-Knowledge Proof:</span>
                    <Badge variant="outline" className={
                      physicalAddress.zkp_proof 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                    }>
                      {physicalAddress.zkp_proof ? (
                        <div className="flex items-center">
                          <Shield className="h-3 w-3 mr-1" />
                          <span>Proof Generated</span>
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          <span>No Proof</span>
                        </div>
                      )}
                    </Badge>
                  </div>
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
                      <div key={permission.id} className="p-4 border rounded-lg space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="text-2xl">🔐</div>
                            <div>
                              <h4 className="text-sm font-medium">{permission.app_name}</h4>
                              <div className="flex space-x-4 text-xs text-muted-foreground mt-1">
                                <span>Access: {
                                  [
                                    permission.share_street ? 'Street' : '',
                                    permission.share_city ? 'City' : '',
                                    permission.share_state ? 'State' : '',
                                    permission.share_postal_code ? 'Postal Code' : '',
                                    permission.share_country ? 'Country' : ''
                                  ].filter(Boolean).join(', ') || 'No access'
                                }</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center">
                            <Badge 
                              variant="outline" 
                              className={
                                permission.revoked
                                  ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                                  : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                              }
                            >
                              {permission.revoked ? 'Revoked' : 'Active'}
                            </Badge>
                          </div>
                        </div>
                        
                        {/* Status information with icons */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                          {/* Expiry information */}
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {formatExpiry(permission.access_expiry)}
                            </span>
                          </div>
                          
                          {/* Usage information */}
                          <div className="flex items-center">
                            <RefreshCw className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {permission.access_count} {permission.access_count === 1 ? 'use' : 'uses'}
                              {permission.max_access_count !== null ? ` / ${permission.max_access_count} max` : ''}
                            </span>
                          </div>
                          
                          {/* Last accessed */}
                          {permission.last_accessed && (
                            <div className="flex items-center">
                              <Key className="h-4 w-4 mr-2 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">
                                Last used: {formatDate(permission.last_accessed)}
                              </span>
                            </div>
                          )}
                          
                          {/* Notification status */}
                          <div className="flex items-center">
                            <Bell className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              Notifications: {permission.access_notification ? 'Enabled' : 'Disabled'}
                            </span>
                          </div>
                        </div>
                        
                        {/* Progress bar for expiry */}
                        {permission.access_expiry && !permission.revoked && (
                          <div className="space-y-1">
                            <div className="text-xs text-muted-foreground">Token expiry progress:</div>
                            <Progress value={calculateExpiryProgress(permission.access_expiry)} />
                          </div>
                        )}
                        
                        {/* Action buttons */}
                        <div className="flex justify-end space-x-2 mt-2">
                          {!permission.revoked && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm">
                                  Revoke Access
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Revoke Access?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will permanently revoke {permission.app_name}'s access to your address information.
                                    The application will no longer be able to use the access token.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleRevokePermission(permission.id)}>
                                    Revoke Access
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
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
              <CardFooter className="flex justify-center">
                <Button variant="outline" onClick={() => window.location.href = '/permissions'}>
                  Grant New Access
                </Button>
              </CardFooter>
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
                  {loadingLogs ? (
                    <div className="text-center py-10">
                      <p className="text-muted-foreground">Loading activity logs...</p>
                    </div>
                  ) : accessLogs.length > 0 ? (
                    accessLogs.map((appLog) => (
                      <div key={appLog.id} className="space-y-2">
                        <h3 className="text-sm font-medium">{appLog.app_name}</h3>
                        {appLog.access_logs && appLog.access_logs.length > 0 ? (
                          appLog.access_logs.map((log: any) => (
                            <div key={log.id} className="flex items-start space-x-4 p-4 border rounded-lg">
                              <div>
                                <div className="w-2 h-2 mt-1.5 rounded-full bg-primary"></div>
                              </div>
                              <div className="flex-1">
                                <div className="flex justify-between">
                                  <h4 className="text-sm font-medium">Address Access</h4>
                                  <span className="text-xs text-muted-foreground">{formatDate(log.accessed_at)}</span>
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">
                                  Fields accessed: {log.accessed_fields ? log.accessed_fields.join(', ') : 'All permitted fields'}
                                </p>
                                <div className="flex mt-1">
                                  <span className="text-xs text-muted-foreground">
                                    {log.ip_address && `IP: ${log.ip_address}`}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-muted-foreground">No access logs for this application</p>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-10">
                      <p className="text-muted-foreground">No activity logs found</p>
                    </div>
                  )}
                </div>
              </CardContent>
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
                  
                  <div>
                    <h3 className="text-sm font-medium mb-4">Security</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>End-to-End Encryption</Label>
                          <p className="text-xs text-muted-foreground">Your address data is encrypted end-to-end</p>
                        </div>
                        <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                          <Lock className="h-3 w-3 mr-1" />
                          Enabled
                        </Badge>
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Zero-Knowledge Proofs</Label>
                          <p className="text-xs text-muted-foreground">Verify address ownership without revealing details</p>
                        </div>
                        <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                          <Shield className="h-3 w-3 mr-1" />
                          Enabled
                        </Badge>
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

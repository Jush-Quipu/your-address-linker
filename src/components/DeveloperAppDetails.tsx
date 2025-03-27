
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { 
  Clipboard, ClipboardCheck, RefreshCw, 
  ExternalLink, ShieldAlert, Info, Key, 
  Server, Lock, AlertTriangle, Check, X, FileCode 
} from 'lucide-react';
import { 
  Select, SelectContent, SelectItem, 
  SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useRole } from '@/context/RoleContext';
import { 
  DeveloperApp, AppStatus, AppVerificationStatus,
  updateDeveloperApp, rotateAppSecret, setAppVerificationStatus
} from '@/services/developerService';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface DeveloperAppDetailsProps {
  app: DeveloperApp;
  onAppUpdated: (app: DeveloperApp) => void;
}

const DeveloperAppDetails: React.FC<DeveloperAppDetailsProps> = ({ app, onAppUpdated }) => {
  const { isAdmin } = useRole();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [rotating, setRotating] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [confirmRotate, setConfirmRotate] = useState(false);
  const [copiedAppId, setCopiedAppId] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [verificationNotes, setVerificationNotes] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    appName: app.app_name,
    description: app.description || '',
    websiteUrl: app.website_url || '',
    callbackUrls: (app.callback_urls || []).join('\n'),
    status: app.status || AppStatus.DEVELOPMENT,
    requestLimit: app.monthly_request_limit || 1000,
    oauthScopes: (app.oauth_settings?.scopes || ['read:profile', 'read:address']).join(', '),
    tokenLifetime: app.oauth_settings?.token_lifetime || 3600,
    refreshTokenRotation: app.oauth_settings?.refresh_token_rotation !== false,
  });

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle switch input changes
  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  // Copy to clipboard
  const copyToClipboard = (text: string, field: 'appId' | 'secret') => {
    navigator.clipboard.writeText(text);
    
    if (field === 'appId') {
      setCopiedAppId(true);
      setTimeout(() => setCopiedAppId(false), 2000);
    } else {
      setCopiedSecret(true);
      setTimeout(() => setCopiedSecret(false), 2000);
    }
  };

  // Save app changes
  const saveChanges = async () => {
    try {
      setSaving(true);
      
      // Parse callback URLs
      const callbackUrls = formData.callbackUrls
        .split('\n')
        .map(url => url.trim())
        .filter(url => url);
      
      // Validate callback URLs
      if (callbackUrls.length === 0) {
        toast.error('At least one callback URL is required');
        return;
      }
      
      // Parse OAuth scopes
      const oauthScopes = formData.oauthScopes
        .split(',')
        .map(scope => scope.trim())
        .filter(scope => scope);
      
      // Update the app
      const updatedApp = await updateDeveloperApp(app.id, {
        appName: formData.appName,
        description: formData.description,
        websiteUrl: formData.websiteUrl,
        callbackUrls,
        status: formData.status as AppStatus,
        requestLimit: formData.requestLimit,
        oauthSettings: {
          scopes: oauthScopes,
          tokenLifetime: formData.tokenLifetime,
          refreshTokenRotation: formData.refreshTokenRotation
        }
      });
      
      onAppUpdated(updatedApp);
      setEditing(false);
      toast.success('Application updated successfully');
    } catch (error) {
      console.error('Error updating app:', error);
      toast.error('Failed to update application');
    } finally {
      setSaving(false);
    }
  };

  // Rotate app secret
  const handleRotateSecret = async () => {
    try {
      setRotating(true);
      const updatedApp = await rotateAppSecret(app.id);
      onAppUpdated(updatedApp);
      setConfirmRotate(false);
      toast.success('Application secret rotated successfully', {
        description: 'Make sure to update your integration with the new secret'
      });
    } catch (error) {
      console.error('Error rotating app secret:', error);
      toast.error('Failed to rotate application secret');
    } finally {
      setRotating(false);
    }
  };

  // Handle app verification
  const handleVerify = async (status: AppVerificationStatus) => {
    try {
      setVerifying(true);
      const updatedApp = await setAppVerificationStatus(app.id, status, verificationNotes);
      onAppUpdated(updatedApp);
      toast.success(`Application ${status === AppVerificationStatus.VERIFIED ? 'verified' : 'rejected'} successfully`);
    } catch (error) {
      console.error('Error verifying app:', error);
      toast.error('Failed to update verification status');
    } finally {
      setVerifying(false);
    }
  };

  // Get status badge color
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

  // Get verification status badge
  const getVerificationBadge = (status?: AppVerificationStatus) => {
    switch (status) {
      case AppVerificationStatus.VERIFIED:
        return <Badge className="bg-green-100 text-green-800">Verified</Badge>;
      case AppVerificationStatus.REJECTED:
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      case AppVerificationStatus.PENDING:
      default:
        return <Badge className="bg-yellow-100 text-yellow-800">Pending Verification</Badge>;
    }
  };

  return (
    <Tabs defaultValue="details" className="w-full">
      <TabsList className="mb-4">
        <TabsTrigger value="details">App Details</TabsTrigger>
        <TabsTrigger value="credentials">Credentials</TabsTrigger>
        <TabsTrigger value="oauth">OAuth Settings</TabsTrigger>
        {isAdmin && <TabsTrigger value="admin">Admin Controls</TabsTrigger>}
      </TabsList>
      
      <TabsContent value="details">
        <Card>
          <CardHeader className="flex flex-row items-start justify-between space-y-0">
            <div>
              <CardTitle>Application Details</CardTitle>
              <CardDescription>Basic information about your application</CardDescription>
            </div>
            <div className="flex gap-2">
              {getStatusBadge(app.status as AppStatus)}
              {getVerificationBadge(app.verification_status as AppVerificationStatus)}
            </div>
          </CardHeader>
          <CardContent>
            {editing ? (
              <div className="space-y-4">
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
                    placeholder="Describe what your application does"
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
                
                <div className="space-y-2">
                  <Label htmlFor="status">Application Status</Label>
                  <Select 
                    name="status" 
                    value={formData.status}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as AppStatus }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={AppStatus.DEVELOPMENT}>Development</SelectItem>
                      <SelectItem value={AppStatus.ACTIVE}>Active</SelectItem>
                      {isAdmin && <SelectItem value={AppStatus.SUSPENDED}>Suspended</SelectItem>}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="requestLimit">Monthly Request Limit</Label>
                  <Input
                    id="requestLimit"
                    name="requestLimit"
                    type="number"
                    value={formData.requestLimit}
                    onChange={handleChange}
                    min={100}
                    max={100000}
                  />
                  <p className="text-xs text-muted-foreground">
                    Maximum number of API requests allowed per month
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">Application Name</h3>
                  <p>{app.app_name}</p>
                </div>
                
                <div>
                  <h3 className="font-medium">Description</h3>
                  <p>{app.description || 'No description provided'}</p>
                </div>
                
                {app.website_url && (
                  <div>
                    <h3 className="font-medium">Website</h3>
                    <a 
                      href={app.website_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center"
                    >
                      {app.website_url}
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </div>
                )}
                
                <div>
                  <h3 className="font-medium">Callback URLs</h3>
                  <ul className="space-y-1">
                    {app.callback_urls.map((url, index) => (
                      <li key={index} className="font-mono text-sm truncate">
                        {url}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium">Status</h3>
                    <div className="mt-1">{getStatusBadge(app.status as AppStatus)}</div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium">Monthly Request Limit</h3>
                    <p>{app.monthly_request_limit || 1000} requests</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium">Verification Status</h3>
                  <div className="mt-1 flex items-center">
                    {getVerificationBadge(app.verification_status as AppVerificationStatus)}
                    {app.verification_status === AppVerificationStatus.PENDING && (
                      <span className="ml-2 text-sm text-muted-foreground">
                        Pending review by our team
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            {editing ? (
              <>
                <Button variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
                <Button onClick={saveChanges} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" asChild>
                  <a href={`/developer/analytics?appId=${app.id}`}>
                    View Analytics
                  </a>
                </Button>
                <Button onClick={() => setEditing(true)}>
                  Edit Details
                </Button>
              </>
            )}
          </CardFooter>
        </Card>
      </TabsContent>
      
      <TabsContent value="credentials">
        <Card>
          <CardHeader>
            <CardTitle>Application Credentials</CardTitle>
            <CardDescription>
              Secure credentials used to authenticate your application
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="mb-4">
              <Info className="h-4 w-4" />
              <AlertTitle>Keep credentials secure</AlertTitle>
              <AlertDescription>
                Never share your application secret with others or include it in client-side code.
              </AlertDescription>
            </Alert>
            
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
                  onClick={() => copyToClipboard(app.id, 'appId')}
                >
                  {copiedAppId ? <ClipboardCheck className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
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
                    onClick={() => copyToClipboard(app.app_secret!, 'secret')}
                  >
                    {copiedSecret ? <ClipboardCheck className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
                  </Button>
                )}
              </div>
              <p className="text-xs text-destructive mt-1">
                {app.app_secret ? 'Save this secret securely. It will not be shown again.' : 'Secret is hidden for security.'}
              </p>
            </div>
            
            <div className="pt-4">
              <Dialog open={confirmRotate} onOpenChange={setConfirmRotate}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Rotate App Secret
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Rotate Application Secret</DialogTitle>
                    <DialogDescription>
                      This action will invalidate your current application secret and generate a new one.
                      Any integrations using the current secret will stop working until updated.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="mt-4">
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Warning</AlertTitle>
                      <AlertDescription>
                        This action cannot be undone. Make sure you're ready to update your integrations.
                      </AlertDescription>
                    </Alert>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setConfirmRotate(false)}>Cancel</Button>
                    <Button 
                      variant="destructive" 
                      onClick={handleRotateSecret}
                      disabled={rotating}
                    >
                      {rotating ? 'Rotating...' : 'Rotate Secret'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="oauth">
        <Card>
          <CardHeader>
            <CardTitle>OAuth Configuration</CardTitle>
            <CardDescription>
              Configure OAuth settings for your application
            </CardDescription>
          </CardHeader>
          <CardContent>
            {editing ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="oauthScopes">OAuth Scopes</Label>
                  <Input
                    id="oauthScopes"
                    name="oauthScopes"
                    value={formData.oauthScopes}
                    onChange={handleChange}
                    placeholder="read:profile, read:address"
                  />
                  <p className="text-xs text-muted-foreground">
                    Comma-separated list of OAuth scopes your application requires
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="tokenLifetime">Access Token Lifetime (seconds)</Label>
                  <Input
                    id="tokenLifetime"
                    name="tokenLifetime"
                    type="number"
                    value={formData.tokenLifetime}
                    onChange={handleChange}
                    min={300}
                    max={86400}
                  />
                  <p className="text-xs text-muted-foreground">
                    How long access tokens are valid (300-86400 seconds)
                  </p>
                </div>
                
                <div className="flex items-center space-x-2 pt-2">
                  <Switch
                    id="refreshTokenRotation"
                    checked={formData.refreshTokenRotation}
                    onCheckedChange={(checked) => handleSwitchChange('refreshTokenRotation', checked)}
                  />
                  <Label htmlFor="refreshTokenRotation">Enable refresh token rotation</Label>
                </div>
                <p className="text-xs text-muted-foreground -mt-2">
                  When enabled, refresh tokens are automatically rotated when used
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">OAuth Scopes</h3>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {(app.oauth_settings?.scopes || ['read:profile', 'read:address']).map((scope, index) => (
                      <Badge key={index} variant="secondary">
                        {scope}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium">Access Token Lifetime</h3>
                  <p>{app.oauth_settings?.token_lifetime || 3600} seconds</p>
                </div>
                
                <div>
                  <h3 className="font-medium">Refresh Token Rotation</h3>
                  <div className="flex items-center mt-1">
                    {app.oauth_settings?.refresh_token_rotation !== false ? (
                      <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                    ) : (
                      <Badge variant="outline">Disabled</Badge>
                    )}
                  </div>
                </div>
                
                <div className="pt-4">
                  <Alert>
                    <Server className="h-4 w-4" />
                    <AlertTitle>OAuth Endpoints</AlertTitle>
                    <AlertDescription>
                      <div className="space-y-2 mt-2">
                        <div>
                          <Label className="text-xs">Authorization URL</Label>
                          <code className="block bg-muted p-2 rounded text-xs mt-1">
                            https://secureaddress-bridge.com/api/oauth/authorize
                          </code>
                        </div>
                        <div>
                          <Label className="text-xs">Token URL</Label>
                          <code className="block bg-muted p-2 rounded text-xs mt-1">
                            https://secureaddress-bridge.com/api/oauth/token
                          </code>
                        </div>
                        <div>
                          <Label className="text-xs">User Info URL</Label>
                          <code className="block bg-muted p-2 rounded text-xs mt-1">
                            https://secureaddress-bridge.com/api/oauth/userinfo
                          </code>
                        </div>
                      </div>
                    </AlertDescription>
                  </Alert>
                </div>
              </div>
            )}
          </CardContent>
          {!editing && (
            <CardFooter>
              <Button 
                variant="outline" 
                className="w-full" 
                asChild
              >
                <a href="/developer/docs/oauth" target="_blank" rel="noopener noreferrer">
                  <FileCode className="h-4 w-4 mr-2" />
                  View OAuth Documentation
                </a>
              </Button>
            </CardFooter>
          )}
        </Card>
      </TabsContent>
      
      {isAdmin && (
        <TabsContent value="admin">
          <Card>
            <CardHeader>
              <CardTitle>Admin Controls</CardTitle>
              <CardDescription>
                Review and manage application verification
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert className="mb-4">
                  <ShieldAlert className="h-4 w-4" />
                  <AlertTitle>Admin Actions</AlertTitle>
                  <AlertDescription>
                    These actions affect the application's verification status and visibility.
                  </AlertDescription>
                </Alert>
                
                <div className="space-y-2">
                  <Label htmlFor="verificationNotes">Verification Notes</Label>
                  <Textarea
                    id="verificationNotes"
                    value={verificationNotes}
                    onChange={(e) => setVerificationNotes(e.target.value)}
                    placeholder="Enter notes about the verification decision"
                    rows={3}
                  />
                </div>
                
                <div className="pt-4 flex gap-4">
                  <Button 
                    onClick={() => handleVerify(AppVerificationStatus.VERIFIED)}
                    disabled={verifying}
                    className="flex-1"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Verify Application
                  </Button>
                  
                  <Button 
                    variant="destructive" 
                    onClick={() => handleVerify(AppVerificationStatus.REJECTED)}
                    disabled={verifying}
                    className="flex-1"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Reject Application
                  </Button>
                </div>
                
                <div className="pt-4">
                  <Alert variant="destructive">
                    <Lock className="h-4 w-4" />
                    <AlertTitle>Suspend Application</AlertTitle>
                    <AlertDescription className="flex justify-between items-center">
                      <span>Temporarily disable this application's API access</span>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => {
                          updateDeveloperApp(app.id, { status: AppStatus.SUSPENDED })
                            .then(updatedApp => {
                              onAppUpdated(updatedApp);
                              toast.success('Application suspended');
                            })
                            .catch(error => {
                              console.error('Error suspending app:', error);
                              toast.error('Failed to suspend application');
                            });
                        }}
                      >
                        Suspend
                      </Button>
                    </AlertDescription>
                  </Alert>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      )}
    </Tabs>
  );
};

export default DeveloperAppDetails;

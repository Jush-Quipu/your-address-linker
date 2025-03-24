
import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { toast } from 'sonner';
import { createAppPermission } from '@/services/permissionService';
import { useAuth } from '@/context/AuthContext';
import { Separator } from './ui/separator';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Copy, Check, Info } from 'lucide-react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const PermissionManager: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showTokenDialog, setShowTokenDialog] = useState(false);
  const [accessToken, setAccessToken] = useState('');
  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState({
    appName: '',
    shareStreet: false,
    shareCity: true,
    shareState: true,
    sharePostalCode: false,
    shareCountry: true,
    expiryDays: 30,
    maxAccesses: '',
    enableNotifications: false
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (field: string) => {
    setFormData(prev => ({ ...prev, [field]: !prev[field as keyof typeof prev] }));
  };

  const handleSelectChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated || !user) {
      toast.error('Please sign in first', {
        description: 'You need to be signed in to grant permissions',
      });
      return;
    }
    
    if (!formData.appName) {
      toast.error('App name is required', {
        description: 'Please enter a name for the app',
      });
      return;
    }
    
    setLoading(true);
    try {
      // Parse numeric values
      const expiryDays = parseInt(formData.expiryDays.toString());
      const maxAccesses = formData.maxAccesses ? parseInt(formData.maxAccesses) : null;
      
      const token = await createAppPermission(
        user.id,
        formData.appName,
        {
          shareStreet: formData.shareStreet,
          shareCity: formData.shareCity,
          shareState: formData.shareState,
          sharePostalCode: formData.sharePostalCode,
          shareCountry: formData.shareCountry
        },
        expiryDays,
        maxAccesses,
        formData.enableNotifications
      );
      
      // Show the token to the user
      setAccessToken(token);
      setShowTokenDialog(true);
      
      // Reset form
      setFormData({
        appName: '',
        shareStreet: false,
        shareCity: true,
        shareState: true,
        sharePostalCode: false,
        shareCountry: true,
        expiryDays: 30,
        maxAccesses: '',
        enableNotifications: false
      });
    } catch (error) {
      console.error('Error granting permission:', error);
      toast.error('Failed to grant permission', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(accessToken);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <Card className="max-w-lg mx-auto">
        <CardHeader>
          <CardTitle>Grant Address Access</CardTitle>
          <CardDescription>
            Allow an application to access your verified address information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <Label htmlFor="appName">Application Name</Label>
              <Input
                id="appName"
                name="appName"
                placeholder="e.g., NFT Marketplace"
                value={formData.appName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-4">
              <Label>Address Components to Share</Label>
              
              <div className="space-y-4 p-4 border rounded-md">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="shareStreet">Street Address</Label>
                    <p className="text-xs text-muted-foreground">Share your street address and building number</p>
                  </div>
                  <Switch 
                    id="shareStreet" 
                    checked={formData.shareStreet}
                    onCheckedChange={() => handleSwitchChange('shareStreet')}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="shareCity">City</Label>
                    <p className="text-xs text-muted-foreground">Share your city</p>
                  </div>
                  <Switch 
                    id="shareCity" 
                    checked={formData.shareCity}
                    onCheckedChange={() => handleSwitchChange('shareCity')}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="shareState">State/Province</Label>
                    <p className="text-xs text-muted-foreground">Share your state or province</p>
                  </div>
                  <Switch 
                    id="shareState" 
                    checked={formData.shareState}
                    onCheckedChange={() => handleSwitchChange('shareState')}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="sharePostalCode">Postal Code</Label>
                    <p className="text-xs text-muted-foreground">Share your ZIP or postal code</p>
                  </div>
                  <Switch 
                    id="sharePostalCode" 
                    checked={formData.sharePostalCode}
                    onCheckedChange={() => handleSwitchChange('sharePostalCode')}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="shareCountry">Country</Label>
                    <p className="text-xs text-muted-foreground">Share your country</p>
                  </div>
                  <Switch 
                    id="shareCountry" 
                    checked={formData.shareCountry}
                    onCheckedChange={() => handleSwitchChange('shareCountry')}
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="expiryDays">Access Duration</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="cursor-help">
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="w-80">How long the application will have access to your address information</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Select
                value={formData.expiryDays.toString()}
                onValueChange={(value) => handleSelectChange('expiryDays', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 day</SelectItem>
                  <SelectItem value="7">7 days</SelectItem>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="90">90 days</SelectItem>
                  <SelectItem value="365">1 year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="maxAccesses">Maximum Access Count</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="cursor-help">
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="w-80">Maximum number of times the application can access your address information. Leave empty for unlimited.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Input
                id="maxAccesses"
                name="maxAccesses"
                type="number"
                min="1"
                placeholder="Unlimited"
                value={formData.maxAccesses}
                onChange={handleChange}
              />
            </div>
            
            <div className="flex items-center justify-between space-x-2">
              <div className="space-y-0.5">
                <Label htmlFor="enableNotifications">Access Notifications</Label>
                <p className="text-xs text-muted-foreground">
                  Get notified when your address is accessed
                </p>
              </div>
              <Switch 
                id="enableNotifications" 
                checked={formData.enableNotifications}
                onCheckedChange={() => handleSwitchChange('enableNotifications')}
              />
            </div>
          </form>
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full" 
            type="submit" 
            onClick={handleSubmit}
            disabled={loading || !isAuthenticated}
          >
            {loading ? 'Generating Access Token...' : 'Grant Access'}
          </Button>
        </CardFooter>
      </Card>
      
      <Dialog open={showTokenDialog} onOpenChange={setShowTokenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Access Token Generated</DialogTitle>
            <DialogDescription>
              This token gives the application access to your address information. Share it with the application developer.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center space-x-2 mt-4">
            <Input 
              value={accessToken} 
              readOnly 
              className="font-mono text-xs"
            />
            <Button size="icon" variant="outline" onClick={copyToClipboard}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Keep this token secure. Anyone with this token can access your shared address information.
          </p>
          <DialogFooter className="mt-4">
            <Button onClick={() => setShowTokenDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PermissionManager;

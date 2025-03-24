
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, AlertTriangle, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { createAppPermission } from '@/services/permissionService';

const AuthorizePage: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [processing, setProcessing] = useState(false);
  
  // Parse query parameters
  const queryParams = new URLSearchParams(location.search);
  const appId = queryParams.get('app_id');
  const redirectUri = queryParams.get('redirect_uri');
  const scope = queryParams.get('scope') || '';
  const expiryDays = parseInt(queryParams.get('expiry_days') || '30');
  const maxAccesses = queryParams.get('max_accesses') 
    ? parseInt(queryParams.get('max_accesses')) 
    : null;
  
  // Generate app display name from app_id if not provided
  const appName = queryParams.get('app_name') || appId?.replace(/^app_/, '') || 'Unknown App';
  
  // Parse requested scope
  const requestedFields = scope.split(' ').map(field => field.replace('address.', ''));
  
  // Default all switches to true if the field is in the requested scope
  const [permissions, setPermissions] = useState({
    shareStreet: requestedFields.includes('street_address'),
    shareCity: requestedFields.includes('city'),
    shareState: requestedFields.includes('state'),
    sharePostalCode: requestedFields.includes('postal_code'),
    shareCountry: requestedFields.includes('country'),
    enableNotifications: false
  });
  
  // Check for required parameters
  const isMissingParams = !appId || !redirectUri;
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Store the current URL to redirect back after login
      const currentUrl = window.location.pathname + window.location.search;
      sessionStorage.setItem('redirectAfterAuth', currentUrl);
      
      navigate('/auth');
    }
  }, [isAuthenticated, isLoading, navigate]);
  
  // Handle permission toggle
  const handlePermissionToggle = (field: keyof typeof permissions) => {
    setPermissions(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };
  
  // Handle authorization
  const handleAuthorize = async () => {
    if (!isAuthenticated || !user) {
      toast.error('Please sign in first');
      return;
    }
    
    if (!appId || !redirectUri) {
      toast.error('Missing required parameters');
      return;
    }
    
    setProcessing(true);
    
    try {
      // Create the permission and get an access token
      const accessToken = await createAppPermission(
        user.id,
        appName,
        {
          shareStreet: permissions.shareStreet,
          shareCity: permissions.shareCity,
          shareState: permissions.shareState,
          sharePostalCode: permissions.sharePostalCode,
          shareCountry: permissions.shareCountry
        },
        expiryDays,
        maxAccesses,
        permissions.enableNotifications
      );
      
      // Add the access token to the redirect URI
      const redirectWithToken = new URL(redirectUri);
      redirectWithToken.searchParams.append('access_token', accessToken);
      
      // Redirect back to the application
      window.location.href = redirectWithToken.toString();
    } catch (error) {
      console.error('Error creating permission:', error);
      toast.error('Failed to authorize application', {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
      setProcessing(false);
    }
  };
  
  // Handle denial
  const handleDeny = () => {
    if (!redirectUri) return;
    
    // Add error parameters to the redirect URI
    const redirectWithError = new URL(redirectUri);
    redirectWithError.searchParams.append('error', 'access_denied');
    redirectWithError.searchParams.append('error_description', 'The user denied the request');
    
    // Redirect back to the application
    window.location.href = redirectWithError.toString();
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="pt-32 pb-20 px-6 md:px-12">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader className="text-center">
                <CardTitle>Loading...</CardTitle>
              </CardHeader>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-32 pb-20 px-6 md:px-12">
        <div className="max-w-2xl mx-auto">
          {isMissingParams ? (
            <Card>
              <CardHeader>
                <AlertTriangle className="w-10 h-10 text-yellow-500 mx-auto mb-2" />
                <CardTitle className="text-center">Invalid Authorization Request</CardTitle>
                <CardDescription className="text-center">
                  The authorization request is missing required parameters.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert variant="destructive">
                  <AlertDescription>
                    Required parameters: app_id, redirect_uri
                  </AlertDescription>
                </Alert>
              </CardContent>
              <CardFooter className="flex justify-center">
                <Button onClick={() => navigate('/')}>Return to Home</Button>
              </CardFooter>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <Shield className="w-10 h-10 text-primary mx-auto mb-2" />
                <CardTitle className="text-center">Address Access Request</CardTitle>
                <CardDescription className="text-center">
                  {appName} is requesting access to your verified address information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {!isAuthenticated ? (
                  <Alert>
                    <AlertDescription>
                      Please sign in to continue with the authorization process.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <>
                    <div className="flex items-center gap-4">
                      <div className="bg-primary/10 p-3 rounded-full">
                        <Info className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium">Request Details</h3>
                        <p className="text-sm text-muted-foreground">
                          This app will have access to your address for {expiryDays} days
                          {maxAccesses ? ` with a maximum of ${maxAccesses} access attempts` : ''}.
                        </p>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Requested Information</h3>
                      <p className="text-sm text-muted-foreground">
                        Choose which address components to share with {appName}:
                      </p>
                      
                      <div className="space-y-4">
                        {requestedFields.includes('street_address') && (
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label htmlFor="shareStreet">Street Address</Label>
                              <p className="text-xs text-muted-foreground">
                                Your street address and building number
                              </p>
                            </div>
                            <Switch
                              id="shareStreet"
                              checked={permissions.shareStreet}
                              onCheckedChange={() => handlePermissionToggle('shareStreet')}
                            />
                          </div>
                        )}
                        
                        {requestedFields.includes('city') && (
                          <>
                            <Separator />
                            <div className="flex items-center justify-between">
                              <div className="space-y-0.5">
                                <Label htmlFor="shareCity">City</Label>
                                <p className="text-xs text-muted-foreground">
                                  Your city or locality
                                </p>
                              </div>
                              <Switch
                                id="shareCity"
                                checked={permissions.shareCity}
                                onCheckedChange={() => handlePermissionToggle('shareCity')}
                              />
                            </div>
                          </>
                        )}
                        
                        {requestedFields.includes('state') && (
                          <>
                            <Separator />
                            <div className="flex items-center justify-between">
                              <div className="space-y-0.5">
                                <Label htmlFor="shareState">State/Province</Label>
                                <p className="text-xs text-muted-foreground">
                                  Your state, province, or region
                                </p>
                              </div>
                              <Switch
                                id="shareState"
                                checked={permissions.shareState}
                                onCheckedChange={() => handlePermissionToggle('shareState')}
                              />
                            </div>
                          </>
                        )}
                        
                        {requestedFields.includes('postal_code') && (
                          <>
                            <Separator />
                            <div className="flex items-center justify-between">
                              <div className="space-y-0.5">
                                <Label htmlFor="sharePostalCode">Postal Code</Label>
                                <p className="text-xs text-muted-foreground">
                                  Your ZIP or postal code
                                </p>
                              </div>
                              <Switch
                                id="sharePostalCode"
                                checked={permissions.sharePostalCode}
                                onCheckedChange={() => handlePermissionToggle('sharePostalCode')}
                              />
                            </div>
                          </>
                        )}
                        
                        {requestedFields.includes('country') && (
                          <>
                            <Separator />
                            <div className="flex items-center justify-between">
                              <div className="space-y-0.5">
                                <Label htmlFor="shareCountry">Country</Label>
                                <p className="text-xs text-muted-foreground">
                                  Your country of residence
                                </p>
                              </div>
                              <Switch
                                id="shareCountry"
                                checked={permissions.shareCountry}
                                onCheckedChange={() => handlePermissionToggle('shareCountry')}
                              />
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="enableNotifications">Notifications</Label>
                        <p className="text-xs text-muted-foreground">
                          Get notified when this app accesses your address
                        </p>
                      </div>
                      <Switch
                        id="enableNotifications"
                        checked={permissions.enableNotifications}
                        onCheckedChange={() => handlePermissionToggle('enableNotifications')}
                      />
                    </div>
                  </>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={handleDeny}
                  disabled={processing || !isAuthenticated}
                >
                  Deny
                </Button>
                <Button 
                  onClick={handleAuthorize}
                  disabled={processing || !isAuthenticated}
                >
                  {processing ? 'Authorizing...' : 'Authorize'}
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AuthorizePage;

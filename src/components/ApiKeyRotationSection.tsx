
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { rotateAppSecret, DeveloperApp } from "@/services/developerService";
import { toast } from 'sonner';
import { Key, AlertTriangle } from 'lucide-react';

interface ApiKeyRotationSectionProps {
  app: DeveloperApp;
  onAppUpdated: (app: DeveloperApp) => void;
}

const ApiKeyRotationSection: React.FC<ApiKeyRotationSectionProps> = ({ app, onAppUpdated }) => {
  const [showRotateDialog, setShowRotateDialog] = useState(false);
  const [newSecret, setNewSecret] = useState<string | null>(null);
  const [isRotating, setIsRotating] = useState(false);

  const handleRotateSecret = async () => {
    try {
      setIsRotating(true);
      const updatedApp = await rotateAppSecret(app.id);
      
      // Show the new secret
      setNewSecret(updatedApp.app_secret);
      
      // Update the app in the parent component without the secret
      const appWithoutSecret: DeveloperApp = { 
        ...updatedApp,
        app_secret: undefined
      };
      onAppUpdated(appWithoutSecret);
      
      toast.success("API secret rotated successfully");
    } catch (error) {
      console.error('Error rotating app secret:', error);
      toast.error("Failed to rotate API secret");
    } finally {
      setIsRotating(false);
    }
  };

  const closeDialog = () => {
    setShowRotateDialog(false);
    setNewSecret(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Key className="h-5 w-5 mr-2" />
          API Credentials
        </CardTitle>
        <CardDescription>
          Manage your application's API credentials securely
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Client ID</h3>
          </div>
          <div className="flex">
            <code className="bg-muted px-2 py-1 rounded text-sm overflow-x-auto flex-1">
              {app.id}
            </code>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(app.id);
                toast.success("Client ID copied to clipboard");
              }}
              className="ml-2"
            >
              Copy
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            This is your application's public identifier. It can be safely shared.
          </p>
        </div>

        <Separator />

        <div className="space-y-2">
          <h3 className="text-sm font-medium">Client Secret</h3>
          <div className="flex">
            <code className="bg-muted px-2 py-1 rounded text-sm flex-1">
              ••••••••••••••••••••••••••••••••
            </code>
          </div>
          <p className="text-xs text-muted-foreground">
            Your application's secret key is hidden for security reasons. You can rotate this key if needed.
          </p>
        </div>

        <Dialog open={showRotateDialog} onOpenChange={setShowRotateDialog}>
          <DialogTrigger asChild>
            <Button variant="outline" className="mt-2">
              Rotate Client Secret
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {newSecret ? "Save Your New Client Secret" : "Rotate Client Secret"}
              </DialogTitle>
              <DialogDescription>
                {newSecret 
                  ? "Save this secret immediately. For security reasons, we won't display it again."
                  : "This action will generate a new client secret and invalidate the old one. All applications using the old secret will need to be updated."}
              </DialogDescription>
            </DialogHeader>

            {newSecret ? (
              <div className="space-y-4">
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Important!</AlertTitle>
                  <AlertDescription>
                    This is the only time your client secret will be visible. Please copy it now and store it securely.
                  </AlertDescription>
                </Alert>

                <div className="bg-muted p-4 rounded-md">
                  <h4 className="text-sm font-medium mb-2">Your New Client Secret</h4>
                  <code className="block bg-background p-3 rounded text-sm break-all border">
                    {newSecret}
                  </code>
                </div>

                <Button 
                  onClick={() => {
                    navigator.clipboard.writeText(newSecret);
                    toast.success("Client secret copied to clipboard");
                  }}
                  className="w-full"
                >
                  Copy Client Secret
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Warning</AlertTitle>
                  <AlertDescription>
                    Rotating your client secret will immediately invalidate the current secret.
                    All services using the current secret will stop working until updated with the new secret.
                  </AlertDescription>
                </Alert>
              </div>
            )}

            <DialogFooter>
              {newSecret ? (
                <Button onClick={closeDialog}>
                  I've Saved My Secret
                </Button>
              ) : (
                <>
                  <Button variant="outline" onClick={closeDialog}>
                    Cancel
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={handleRotateSecret}
                    disabled={isRotating}
                  >
                    {isRotating ? "Rotating..." : "Rotate Secret"}
                  </Button>
                </>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default ApiKeyRotationSection;

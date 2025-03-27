
import React from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { updateDeveloperApp, DeveloperApp } from "@/services/developerService";

// OAuth configuration schema
const oauthConfigSchema = z.object({
  tokenLifetime: z.coerce.number()
    .min(300, { message: "Token lifetime must be at least 300 seconds (5 minutes)" })
    .max(86400, { message: "Token lifetime cannot exceed 86400 seconds (24 hours)" }),
  refreshTokenRotation: z.boolean().default(true),
  scopes: z.array(z.string()).default(['read:profile', 'read:address']),
});

type OAuthConfigFormValues = z.infer<typeof oauthConfigSchema>;

interface OAuthConfigFormProps {
  app: DeveloperApp;
  onAppUpdated: (app: DeveloperApp) => void;
}

const OAuthConfigForm: React.FC<OAuthConfigFormProps> = ({
  app,
  onAppUpdated
}) => {
  // Available scope options
  const availableScopes = [
    { value: 'read:profile', label: 'Read Profile', description: 'Access to basic profile information' },
    { value: 'write:profile', label: 'Write Profile', description: 'Modify profile information' },
    { value: 'read:address', label: 'Read Address', description: 'Access to address information' },
    { value: 'write:address', label: 'Write Address', description: 'Create or modify addresses' },
    { value: 'read:wallet', label: 'Read Wallet', description: 'Access to wallet information' },
    { value: 'read:verification', label: 'Read Verification', description: 'Access to verification status' },
  ];

  // Initialize form with existing values
  const form = useForm<OAuthConfigFormValues>({
    resolver: zodResolver(oauthConfigSchema),
    defaultValues: {
      tokenLifetime: app.oauth_settings?.token_lifetime || 3600,
      refreshTokenRotation: app.oauth_settings?.refresh_token_rotation ?? true,
      scopes: app.oauth_settings?.scopes || ['read:profile', 'read:address'],
    },
  });

  // Handle form submission
  const onSubmit = async (values: OAuthConfigFormValues) => {
    try {
      const updatedApp = await updateDeveloperApp(app.id, {
        oauthSettings: {
          scopes: values.scopes,
          tokenLifetime: values.tokenLifetime,
          refreshTokenRotation: values.refreshTokenRotation,
        }
      });
      
      toast.success("OAuth configuration updated successfully");
      onAppUpdated(updatedApp);
    } catch (error) {
      console.error('Error updating OAuth settings:', error);
      toast.error("Failed to update OAuth configuration");
    }
  };

  // Toggle a scope selection
  const toggleScope = (scope: string) => {
    const currentScopes = form.getValues().scopes;
    const newScopes = currentScopes.includes(scope)
      ? currentScopes.filter(s => s !== scope)
      : [...currentScopes, scope];
    
    form.setValue('scopes', newScopes, { shouldValidate: true });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>OAuth Configuration</CardTitle>
        <CardDescription>
          Configure how your application authenticates with the SecureAddress Bridge API
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium">Available Scopes</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Select the permission scopes your application requires
                </p>
                <div className="grid gap-4 md:grid-cols-2">
                  {availableScopes.map((scope) => (
                    <div 
                      key={scope.value} 
                      className={`flex items-start space-x-3 border rounded-lg p-3 cursor-pointer ${
                        form.getValues().scopes.includes(scope.value) 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => toggleScope(scope.value)}
                    >
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{scope.label}</h4>
                          {form.getValues().scopes.includes(scope.value) && (
                            <Badge variant="outline" className="ml-2 bg-primary/10">Selected</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {scope.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <FormMessage />
              </div>

              <Separator />

              <FormField
                control={form.control}
                name="tokenLifetime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Access Token Lifetime (seconds)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field} 
                        min={300}
                        max={86400}
                      />
                    </FormControl>
                    <FormDescription>
                      How long access tokens will be valid (5 minutes - 24 hours)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="refreshTokenRotation"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Refresh Token Rotation</FormLabel>
                      <FormDescription>
                        Issue a new refresh token when an access token is refreshed
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="ml-auto">
              Save OAuth Configuration
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};

export default OAuthConfigForm;


import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { DeveloperApp, updateDeveloperApp } from "@/services/developerService";
import OAuthConfigForm from './OAuthConfigForm';
import ApiKeyRotationSection from './ApiKeyRotationSection';
import UsageLimitsSection from './UsageLimitsSection';
import VerificationSection from './VerificationSection';
import { Settings, Key, BarChart, Lock } from 'lucide-react';

interface DeveloperAppDetailsProps {
  app: DeveloperApp;
  onAppUpdated: (app: DeveloperApp) => void;
}

const DeveloperAppDetails: React.FC<DeveloperAppDetailsProps> = ({ app, onAppUpdated }) => {
  const [activeTab, setActiveTab] = useState('general');
  const [formData, setFormData] = useState({
    appName: app.app_name,
    description: app.description || '',
    websiteUrl: app.website_url || '',
    callbackUrls: (app.callback_urls || []).join('\n')
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.appName) {
      toast.error('App name is required');
      return;
    }
    
    if (!formData.callbackUrls) {
      toast.error('At least one callback URL is required');
      return;
    }
    
    // Parse callback URLs
    const callbackUrls = formData.callbackUrls
      .split('\n')
      .map(url => url.trim())
      .filter(url => url);
    
    if (callbackUrls.length === 0) {
      toast.error('At least one valid callback URL is required');
      return;
    }
    
    // Check URL format
    const urlRegex = /^https?:\/\//i;
    const invalidUrls = callbackUrls.filter(url => !urlRegex.test(url));
    
    if (invalidUrls.length > 0) {
      toast.error(`Invalid URL format: ${invalidUrls[0]}`, {
        description: 'URLs must start with http:// or https://'
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const updatedApp = await updateDeveloperApp(app.id, {
        appName: formData.appName,
        description: formData.description,
        websiteUrl: formData.websiteUrl,
        callbackUrls
      });
      
      onAppUpdated(updatedApp);
      toast.success('Application updated successfully');
    } catch (error) {
      console.error('Error updating application:', error);
      toast.error('Failed to update application');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid grid-cols-4 mb-6">
        <TabsTrigger value="general" className="flex items-center">
          <Settings className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">General</span>
          <span className="sm:hidden">General</span>
        </TabsTrigger>
        <TabsTrigger value="security" className="flex items-center">
          <Key className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">API Keys</span>
          <span className="sm:hidden">Keys</span>
        </TabsTrigger>
        <TabsTrigger value="oauth" className="flex items-center">
          <Lock className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">OAuth</span>
          <span className="sm:hidden">OAuth</span>
        </TabsTrigger>
        <TabsTrigger value="usage" className="flex items-center">
          <BarChart className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Usage & Limits</span>
          <span className="sm:hidden">Usage</span>
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="general" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
            <CardDescription>
              Update your application details and configuration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="appName">
                  Application Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="appName"
                  name="appName"
                  value={formData.appName}
                  onChange={handleChange}
                  placeholder="My Application"
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
                  placeholder="Describe what your application does and how it will use address data"
                  rows={3}
                />
                <p className="text-sm text-muted-foreground">
                  A detailed description helps users understand how their data will be used
                  and improves your chances of verification.
                </p>
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
                <p className="text-sm text-muted-foreground">
                  A public website for your application is required for verification.
                </p>
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
                <p className="text-sm text-muted-foreground">
                  Enter one URL per line. These are the URLs that users will be redirected to
                  after authorizing your application.
                </p>
              </div>
              
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving Changes...' : 'Save Changes'}
              </Button>
            </form>
          </CardContent>
        </Card>
        
        <VerificationSection app={app} />
      </TabsContent>
      
      <TabsContent value="security" className="space-y-6">
        <ApiKeyRotationSection app={app} onAppUpdated={onAppUpdated} />
      </TabsContent>
      
      <TabsContent value="oauth" className="space-y-6">
        <OAuthConfigForm app={app} onAppUpdated={onAppUpdated} />
      </TabsContent>
      
      <TabsContent value="usage" className="space-y-6">
        <UsageLimitsSection app={app} onAppUpdated={onAppUpdated} />
      </TabsContent>
    </Tabs>
  );
};

export default DeveloperAppDetails;

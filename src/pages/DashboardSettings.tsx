import React, { useState, useEffect } from 'react';
import DashboardNavbar from '@/components/DashboardNavbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const DashboardSettings: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    notifyOnAccess: true,
    notifyOnNewDevice: true,
    twoFactorEnabled: false
  });

  useEffect(() => {
    if (!isAuthenticated && !loading) {
      toast.error('Authentication required', {
        description: 'Please sign in to access this page',
      });
      navigate('/auth');
    }
  }, [isAuthenticated, navigate, loading]);

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setFormData({
          email: user?.email || '',
          fullName: '',
          notifyOnAccess: true,
          notifyOnNewDevice: true,
          twoFactorEnabled: false
        });
      } catch (error) {
        console.error('Error fetching settings:', error);
        toast.error('Failed to load settings', {
          description: 'Please try again later',
        });
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchSettings();
    }
  }, [isAuthenticated, user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Settings saved successfully');
  };

  return (
    <div className="min-h-screen">
      <DashboardNavbar />
      <main className="pt-32 pb-20 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-8">Account Settings</h1>
          
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Loading settings...</span>
            </div>
          ) : (
            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="grid w-full md:w-auto grid-cols-1 sm:grid-cols-3">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
              </TabsList>
              
              <TabsContent value="profile">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Settings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSaveSettings} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          readOnly
                          disabled
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input
                          id="fullName"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleInputChange}
                          placeholder="Enter your full name"
                        />
                      </div>
                      
                      <Button type="submit">Save Changes</Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="notifications">
                <Card>
                  <CardHeader>
                    <CardTitle>Notification Settings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSaveSettings} className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="notifyOnAccess">Address Access Notifications</Label>
                          <p className="text-sm text-muted-foreground">
                            Receive notifications when your address is accessed
                          </p>
                        </div>
                        <Switch
                          id="notifyOnAccess"
                          checked={formData.notifyOnAccess}
                          onCheckedChange={(checked) => handleSwitchChange('notifyOnAccess', checked)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="notifyOnNewDevice">New Device Login</Label>
                          <p className="text-sm text-muted-foreground">
                            Notify when a new device logs into your account
                          </p>
                        </div>
                        <Switch
                          id="notifyOnNewDevice"
                          checked={formData.notifyOnNewDevice}
                          onCheckedChange={(checked) => handleSwitchChange('notifyOnNewDevice', checked)}
                        />
                      </div>
                      
                      <Button type="submit">Save Changes</Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="security">
                <Card>
                  <CardHeader>
                    <CardTitle>Security Settings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSaveSettings} className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="twoFactorEnabled">Two-Factor Authentication</Label>
                          <p className="text-sm text-muted-foreground">
                            Add an extra layer of security to your account
                          </p>
                        </div>
                        <Switch
                          id="twoFactorEnabled"
                          checked={formData.twoFactorEnabled}
                          onCheckedChange={(checked) => handleSwitchChange('twoFactorEnabled', checked)}
                        />
                      </div>
                      
                      <Button type="submit">Save Changes</Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DashboardSettings;
